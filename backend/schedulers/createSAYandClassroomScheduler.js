const cron = require('node-cron')
const { AcademicYears } = require('../models/database/academic-years')
const { SchoolAcademicYears } = require('../models/database/school-academic-years')
const {
	processClassroomCreation,
	processTeacherUpdates,
} = require('./classroomAndTeacherFunctions')
const { mongoose } = require('mongoose')

/**
 * Scheduler to do below tasks automatically
 * 1. Create SAY for yesterday expired SAYs
 * 2. Create Classrooms for newly created SAYs schools
 * 3. Update Teacher of new created classrooms
 *
 * Runs everyday at 12:15 AM
 *
 * Cron pattern: '15 0 * * *'
 * - 15: minute (15th minute)
 * - 0: hour (12 AM / midnight)
 * - *: Everyday
 * - *: month (any)
 * - *: day of week (any)
 */

// Main Scheduler - Orchestrates all three phases - create SAYs, Classrooms and update Teachers
const createSAYAndClassroomsScheduler = cron.schedule('15 0 * * *', async () => {
	const session = await mongoose.startSession()

	try {
		console.log(
			'🚀 Starting combined SAY, Classrooms, and Teachers Scheduler with transaction...',
		)

		// Start transaction
		await session.withTransaction(
			async () => {
				try {
					// Phase 1: Process School Academic Years
					const sayResults = await processSAYUpdates(session)

					// Phase 2: Process Classroom Creation
					const classroomResults = await processClassroomCreation(
						session,
						sayResults.schoolIds,
					)

					// Phase 3: Process Teacher Updates (only if classrooms were processed)
					let teacherResults = { teacherUpdateCount: 0, teacherAssignmentsCount: 0 }
					if (classroomResults.message !== 'Skipped - classrooms already exist') {
						teacherResults = await processTeacherUpdates(
							session,
							classroomResults.currentAY,
						)
					}

					// Final summary
					console.log('🎯 TRANSACTION SUMMARY:')
					console.log(`📈 SAYs Created: ${sayResults.createdSAYsCount}`)
					console.log(`📚 Classrooms Processed: ${classroomResults.processedCount}`)
					console.log(`📚 Classrooms Skipped: ${classroomResults.skippedCount}`)
					console.log(`🧑‍🏫 Teachers Updated: ${teacherResults.teacherUpdateCount}`)
					console.log(`🔗 Teacher Assignments: ${teacherResults.teacherAssignmentsCount}`)

					console.log(
						`✅ Successfully completed all operations for academic year: ${sayResults.currentAcademicYear.academicYear}`,
					)
				} catch (error) {
					throw error
				}
			},
			{
				// Transaction options
				readPreference: 'primary',
				readConcern: { level: 'local' },
				writeConcern: { w: 'majority' },
				maxTimeMS: 300000, // 5 minutes timeout
			},
		)

		console.log('✅ Transaction completed successfully!')
	} catch (error) {
		console.error(
			'❌ Error in combined SAY, Classrooms, and Teachers scheduler transaction:',
			error,
		)
		console.error('🔄 Transaction will be automatically rolled back')

		// Optional: Send notification about failure
		// await sendErrorNotification('Combined Scheduler Transaction Failed', error.message)

		throw error // Re-throw to ensure cron job logs the error
	} finally {
		// Always end the session
		await session.endSession()
		console.log('📝 Database session ended')
	}
})

// Phase 1: Handle School Academic Years
async function processSAYUpdates(session) {
	console.log('📋 Phase 1: Processing School Academic Years...')

	const curAcademicYear = await AcademicYears.findOne({}).sort({ order: -1 }).session(session)

	if (!curAcademicYear) {
		throw new Error('No current academic year found')
	}

	const today = new Date()
	// Get yesterday's start and end
	const yesterdayStart = new Date(today)
	yesterdayStart.setDate(today.getDate() - 1)
	yesterdayStart.setHours(0, 0, 0, 0)
	const yesterdayEnd = new Date(today)
	yesterdayEnd.setDate(today.getDate() - 1)
	yesterdayEnd.setHours(23, 59, 59, 999)

	// Query SchoolAcademicYears expired yesterday
	const expiredSAYs = await SchoolAcademicYears.find({
		endDate: {
			$gte: yesterdayStart,
			$lte: yesterdayEnd,
		},
	}).session(session)

	console.log(`📅 Found ${expiredSAYs.length} expired SAYs from yesterday`)

	let sayBulkOps = []
	let createdSAYsCount = 0
	const schoolIds = []

	if (expiredSAYs.length > 0) {
		// Mark expired SAYs as not current
		await SchoolAcademicYears.updateMany(
			{ _id: { $in: expiredSAYs.map((obj) => obj._id) } },
			{ $set: { currentAcYear: false } },
			{ session },
		)

		console.log(`🔄 Marked ${expiredSAYs.length} SAYs as not current`)

		// Prepare new SAYs for current academic year
		const [startYear, endYear] = curAcademicYear.academicYear.split('-')

		for (const SAY of expiredSAYs) {
			schoolIds.push(SAY.school)

			let startDate = new Date(SAY.startDate)
			let endDate = new Date(SAY.endDate)
			// Set the years
			startDate.setFullYear(+startYear)
			endDate.setFullYear(+endYear)

			sayBulkOps.push({
				insertOne: {
					document: {
						academicYear: curAcademicYear._id,
						school: SAY.school,
						startDate,
						endDate,
						currentAcYear: true,
						studentCount: 0,
					},
				},
			})
		}

		// Execute SAY bulk operations
		if (sayBulkOps.length > 0) {
			console.log(`🔄 Creating ${sayBulkOps.length} new SAYs...`)
			const sayResult = await SchoolAcademicYears.bulkWrite(sayBulkOps, {
				ordered: false,
				session,
			})
			createdSAYsCount = sayResult.insertedCount
			console.log('📊 SAY creation results:', {
				insertedCount: sayResult.insertedCount,
			})
		}
	}

	console.log(`✅ Phase 1 Complete: ${createdSAYsCount} new SAYs created`)
	return { createdSAYsCount, schoolIds, currentAcademicYear: curAcademicYear }
}

module.exports = {
	createSAYAndClassroomsScheduler,
}
