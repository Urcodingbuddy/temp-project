const mongoose = require('mongoose')
const { AcademicYears } = require('../models/database/academic-years')
const { SchoolAcademicYears } = require('../models/database/school-academic-years')
const { Classrooms } = require('../models/database/myPeegu-classroom')
const { Teacher } = require('../models/database/myPeegu-teacher')
const { STATUSES } = require('../utility/localConstants')


// Phase 2: Handle Classroom Creation
const processClassroomCreation = async (session, schoolIds) => {
	console.log('📋 Phase 2: Processing Classrooms...')
	console.log(schoolIds)
	// Fetch current and previous academic years
	const academicYears = await AcademicYears.find({}).sort({ order: -1 }).session(session)

	// Check if we have at least 2 academic years
	if (academicYears.length < 2) {
		throw new Error('Not enough academic years found. Need at least current and previous.')
	}

	const [currentAY, previousAY] = academicYears.slice(0, 2)

	console.log(
		`📅 Processing: Current AY - ${currentAY.academicYear}, Previous AY - ${previousAY.academicYear}`,
	)

	// Fetch SAYs of current academic year
	const currentSAYs = await SchoolAcademicYears.find({
		currentAcYear: true,
		school: { $in: schoolIds },
	})
		.lean()
		.session(session)
	// console.log('New SAYs ---->', currentSAYs)

	if (currentSAYs.length === 0) {
		throw new Error('No current academic year SAYs found')
	}

	// Add SAYs into map for O(1) lookup
	const SAYMap = new Map()
	for (const SAY of currentSAYs) {
		SAYMap.set(SAY.school.toString(), SAY)
	}

	// Fetch all active classrooms of previous academic year
	const classrooms = await Classrooms.find({
		status: STATUSES.ACTIVE,
		school: { $in: schoolIds },
		academicYear: previousAY._id,
	})
		.lean()
		.session(session)

	console.log(`📚 Found ${classrooms.length} classrooms to process from previous academic year`)

	// Check if any classrooms already exist for current academic year
	const existingClassrooms = await Classrooms.find({
		academicYear: currentAY._id,
	})
		.lean()
		.session(session)

	if (existingClassrooms.length > 0) {
		console.warn(
			`⚠️ Found ${existingClassrooms.length} existing classrooms for current academic year. Skipping classroom creation.`,
		)
		return {
			processedCount: 0,
			skippedCount: 0,
			classroomsWithTeachers: [],
			message: 'Skipped - classrooms already exist',
		}
	}

	// Process classrooms
	const classroomBulkOps = []
	const classroomsWithTeachers = []
	let processedCount = 0
	let skippedCount = 0

	for (const classroom of classrooms) {
		// Get SAY for this classroom's school
		const SAY = SAYMap.get(classroom.school.toString())

		if (!SAY) {
			console.warn(`⚠️ No SAY found for school: ${classroom.school}`)
			skippedCount++
			continue
		}

		// Handle teacher journey logic
		let teacherJourney = []
		let updatePrevClassroom = false

		if (classroom.teacherJourney && classroom.teacherJourney.length > 0) {
			const lastJourney = classroom.teacherJourney[classroom.teacherJourney.length - 1]

			// If last teacher journey was not ended, continue with same teacher
			if (!lastJourney.endDate && classroom.teacher) {
				teacherJourney = [
					{
						teacherId: classroom.teacher,
						startDate: new Date(),
					},
				]
				updatePrevClassroom = true
			}
		}

		// If we need to update previous classroom (end the teacher journey)
		if (updatePrevClassroom) {
			const journey = [...classroom.teacherJourney] // Create a copy
			const yesterday = new Date()
			yesterday.setDate(yesterday.getDate() - 1)
			yesterday.setHours(23, 59, 59, 999) // End of yesterday

			// Set end date for the last journey
			journey[journey.length - 1].endDate = yesterday

			classroomBulkOps.push({
				updateOne: {
					filter: { _id: classroom._id },
					update: {
						$set: {
							teacherJourney: journey,
						},
					},
				},
			})
		}

		// Create new classroom data for current academic year
		const newClassroomData = {
			school: classroom.school,
			className: classroom.className,
			section: classroom.section,
			studentCount: 0,
			status: classroom.status,
			teacher: teacherJourney.length > 0 ? classroom.teacher : null,
			classHierarchy: classroom.classHierarchy,
			sectionHierarchy: classroom.sectionHierarchy,
			SAY: SAY._id,
			academicYear: currentAY._id,
			teacherJourney,
			createdAt: new Date(),
			updatedAt: new Date(),
		}

		classroomBulkOps.push({
			insertOne: {
				document: newClassroomData,
			},
		})

		// Track classrooms with teachers for Phase 3
		if (teacherJourney.length > 0) {
			classroomsWithTeachers.push({
				...newClassroomData,
				_id: null, // Will be set after insertion
			})
		}

		processedCount++
	}

	// Execute classroom bulk operations
	let classroomResult = null
	if (classroomBulkOps.length > 0) {
		console.log(`🔄 Executing ${classroomBulkOps.length} classroom bulk operations...`)
		classroomResult = await Classrooms.bulkWrite(classroomBulkOps, {
			ordered: false,
			session,
		})

		console.log('📊 Classroom bulk operation results:', {
			insertedCount: classroomResult.insertedCount,
			modifiedCount: classroomResult.modifiedCount,
		})
	}

	console.log(`✅ Phase 2 Complete: ${processedCount} processed, ${skippedCount} skipped`)

	return {
		processedCount,
		skippedCount,
		classroomsWithTeachers,
		currentAY,
		classroomResult,
	}
}

// Phase 3: Handle Teacher Updates
const processTeacherUpdates = async (session, currentAY) => {
	console.log('📋 Phase 3: Processing Teacher Updates...')

	// Step 1: Find newly created classrooms with teachers and update their journeys
	const newCreatedClassroomsWithTeacher = await Classrooms.find({
		teacher: { $exists: true, $ne: null },
		academicYear: currentAY._id,
	}).session(session)
	
	const updatedTeachers = []
	let teacherAssignmentsCount = 0

	if (newCreatedClassroomsWithTeacher.length > 0) {
		console.log(
			`👥 Found ${newCreatedClassroomsWithTeacher.length} new classrooms with teachers`,
		)

		// Get all teachers for mapping
		const allTeachers = await Teacher.find({
			isDeleted: { $ne: true },
		})
			.lean()
			.session(session)

		const teachersMap = new Map()
		for (const teacher of allTeachers) {
			teachersMap.set(teacher._id.toString(), teacher)
		}

		const teacherBulkOps = []
		for (const classroom of newCreatedClassroomsWithTeacher) {
			const teacher = teachersMap.get(classroom?.teacher?.toString())

			if (!teacher) {
				console.warn(`⚠️ Teacher not found for classroom ${classroom._id}`)
				continue
			}

			const journey = teacher.classroomsJourney ? [...teacher.classroomsJourney] : []
			journey.push({
				classRoomId: classroom._id,
				academicYear: classroom.academicYear,
				assignedDate: new Date(),
				isAssigned: true,
			})

			updatedTeachers.push(teacher._id.toString())

			teacherBulkOps.push({
				updateOne: {
					filter: { _id: teacher._id },
					update: {
						$set: {
							classroomsJourney: journey,
						},
					},
				},
			})
		}

		// Execute teacher bulk operations
		if (teacherBulkOps.length > 0) {
			console.log(`🔄 Executing ${teacherBulkOps.length} teacher bulk operations...`)
			const teacherBulkResult = await Teacher.bulkWrite(teacherBulkOps, {
				ordered: false,
				session,
			})

			teacherAssignmentsCount = teacherBulkResult.modifiedCount
			console.log('📊 Teacher bulk operation results:', {
				modifiedCount: teacherBulkResult.modifiedCount,
			})
		}
	}

	console.log(`✅ Phase 3 Complete: ${teacherAssignmentsCount} teacher assignments updated`)

	// console.log(JSON.stringify(updatedTeachers))

	return {
		teacherAssignmentsCount,
	}
}

module.exports = {
	processClassroomCreation,
	processTeacherUpdates,
}
