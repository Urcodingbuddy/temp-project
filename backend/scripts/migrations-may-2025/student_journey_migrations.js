const mongoose = require('mongoose')
const { Classrooms } = require('../../models/database/myPeegu-classroom')
const { ClassroomsOld } = require('../../models/database/old-classrooms')
const { AcademicYears } = require('../../models/database/academic-years')
const { SchoolAcademicYears } = require('../../models/database/school-academic-years')
const { Students } = require('../../models/database/myPeegu-student')
const { NotFound } = require('@aws-sdk/client-s3')

const { MONGODB_URI } = require('./migrations-utils')

// * Fetch all classrooms and old_classrooms
// 1. Find all students
// 2. Loop through the students if the students journey is there then sort by old date each student's journey
// 3. After sorting loop through students journey
//    a. get the academicYearId using the dateTime from journey. then get school academicYearId using school id and academic year.
//    b. with it get the className and section from old classroom using this classroom id
//    c. Now get the classroom id from migrated classrooms collection using school academic year, section and className
//    d. you need save new classroomId, SAY and AY.

async function runMigration() {
	console.log('Migration started...')
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to MongoDB')

	const academicYears = await AcademicYears.find({}).lean()
	const allOldClassrooms = await ClassroomsOld.find({}).lean()
	const SAYs = await SchoolAcademicYears.find({})
	const classrooms = await Classrooms.find({ status: 'Active' }).lean()
	const allStudents = await Students.find({ status: 'Active' })

	// console.log('all old classrooms', allOldClassrooms.length)

	const bulkOperations = []

	let oldClassroomsNotFound = 0
	let newClassroomsNotFound = 0
	let sayNotFound = 0
	let AYFound = 0
	let NotFound = 0
	let updatedJourneyMapCount = 0

	let count = 0
	console.log('--------Looping started----------')
	let notUpdatedSchoolStudents = []

	const students = []
	for (const student of allStudents) {
		// console.log(student)
		// students.push(student)
		if (count < 10 || count > 6200) {
			// console.log('--------loop No----------', count + 1)
		}
		count += 1

		if (student.studentsJourney && student.studentsJourney.length > 0) {
			// console.log(11111)
			const journeys = student.studentsJourney.sort(
				(a, b) => new Date(a.date) - new Date(b.date),
			)
			// console.log(22222)
			const newJourney = []
			let studentCurClassId = null
			for (const journey of journeys) {
				// console.log(33333)
				const date = new Date(journey.dateTime)
				const year = date.getMonth() + 1 >= 5 ? date.getFullYear() : date.getFullYear() - 1
				const AYString = `${year}-${year + 1}`

				const academicYear = academicYears.find((obj) => obj.academicYear === AYString)
				if (!academicYear) {
					// notUpdatedSchoolStudents.push(student.school.toString())
					AYFound += 1
					continue
				}
				// console.log(44444)
				const SAY = SAYs.find(
					(obj) =>
						obj.school &&
						obj.academicYear &&
						obj.school.toString() === student.school.toString() &&
						obj.academicYear.toString() === academicYear._id.toString(),
				)
				if (!SAY) {
					// const schoolId = student.school.toString()

					// const existingEntry = notUpdatedSchoolStudents.find(
					// 	(entry) => entry.school === schoolId,
					// )

					// if (
					// 	existingEntry &&
					// 	existingEntry.academicYears != null &&
					// 	existingEntry.academicYears?.length > 0
					// ) {
					// 	// Add academicYear only if not already present
					// 	if (!existingEntry.academicYears?.includes(AYString)) {
					// 		existingEntry.academicYears.push(AYString)
					// 	}
					// } else {
					// 	// If school doesn't exist, push a new entry
					// 	notUpdatedSchoolStudents.push({
					// 		school: schoolId,
					// 		academicYears: [AYString],
					// 	})
					// }
					sayNotFound += 1
					continue
				}
				// console.log(55555)
				// console.log(allOldClassrooms.length)
				const OldClassRm = allOldClassrooms.find(
					(obj) => obj._id.toString() === journey.classRoomId.toString(),
				)
				if (!OldClassRm) {
					oldClassroomsNotFound += 1
					continue
				}
				// console.log(66666)

				const classroomOfJourney = classrooms.find(
					(obj) =>
						obj.className === OldClassRm.className &&
						obj.section === OldClassRm.section &&
						obj.school.toString() === OldClassRm.school.toString() &&
						obj.academicYear.toString() === academicYear._id.toString(),
				)
				if (!classroomOfJourney) {
					newClassroomsNotFound += 1
					continue
				}
				// console.log(77777)
				if (journey.classRoomId.toString() === student.classRoomId.toString()) {
					studentCurClassId = classroomOfJourney._id
				}
				newJourney.push({
					OldClassRoomId: journey.classRoomId || classroomOfJourney._id,
					classRoomId: classroomOfJourney._id,
					SAY: SAY._id,
					academicYear: academicYear._id,
					dateTime: journey.dateTime,
				})
			}

			updatedJourneyMapCount =
				student.studentsJourney.length == journeys.length
					? updatedJourneyMapCount + 1
					: updatedJourneyMapCount
			// console.log(88888)
			if (newJourney.length > 0) {
				bulkOperations.push({
					updateOne: {
						filter: { _id: student._id },
						update: {
							$set: {
								studentsJourney: newJourney,
								classRoomId: studentCurClassId,
							},
						},
					},
				})
			} else {
				students.push(student._id.toString())
			}
			// console.log(99999)
		} else {
			NotFound += 1
		}
	}

	console.log('-------> Bulk lngth <-------', bulkOperations.length)
	// console.log('-------> updatedJourneyMapCount lngth <-------', updatedJourneyMapCount)

	console.log('-------> New classrooms not found <--------', newClassroomsNotFound)
	console.log('-------> Old classrooms not found <--------', oldClassroomsNotFound)
	console.log('-------> SAYs not found <--------', sayNotFound)
	console.log('-------> AYs not found <--------', AYFound)
	console.log('-------> Not found <--------', NotFound)

	// console.log(JSON.stringify(bulkOperations[0]?.updateOne))
	// console.log(
	// 	'-------------> Not Update Students Schools <-------------',
	// 	notUpdatedSchoolStudents,
	// )
	// console.log(students[0])
	// console.log('---------> Students', [...new Set(students)].length)

	if (bulkOperations.length > 0) {
		const result = await Students.bulkWrite(bulkOperations)
		console.log(result)
	}

	await mongoose.disconnect()
	console.log('Migration completed')
}

runMigration().catch((err) => {
	console.error('Migration failed:', err)
	process.exit(1)
})