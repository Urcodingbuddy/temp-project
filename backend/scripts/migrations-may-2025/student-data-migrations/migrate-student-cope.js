const mongoose = require('mongoose')
const { Students } = require('../../../models/database/myPeegu-student')
const { COPEAssessment } = require('../../../models/database/myPeegu-studentCOPEAssessment')

const { MONGODB_URI } = require('../migrations-utils') 

// 1. Find all observations
// 2. Loop through observation
// 3. In each loop find student by using studentId from observation record
// 4. in studentsJourney of student find records with classroomId of observation record and oldClassroomId
// 5. If found multiple records then take the latest/last record of filtered journey else
// 6. get the only record which is found
// 7. from the record get the classroomId, SAY and academicYear and save it to observation

async function runMigration() {
	console.log('Migration started...')
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to MongoDB')

	const allRecords = await COPEAssessment.find({}).lean()
	// console.log(allRecords.map((rec) => rec.studentId))
	const allStudents = await Students.find({
		_id: { $in: allRecords.map((rec) => rec.studentId) },
	}).lean()

	// console.log('----All Students----', allStudents.length)
	// console.log('----Observation Records----', allRecords.length)

	const bulkOperations = []
	const deletebulkOperations = []
	const classNotFoundBullk = []

	let journeyNotFound = 0
	let studentFound = 0
	let oldClassNotFound = 0

	console.log('--------Looping started----------')
	for (const record of allRecords) {
		const student = allStudents.find((st) => st._id.toString() === record.studentId.toString())
		// console.log('student record --->', student)
		if (!student) {
			studentFound += 1
			deletebulkOperations.push({
				deleteOne: {
					filter: { _id: record._id },
				},
			})
			classNotFoundBullk.push(record)
			continue
		}
		// console.log('------Journey------', student.studentsJourney)
		if (student.studentsJourney && student.studentsJourney.length > 0) {
			let journey = student.studentsJourney
				.filter(
					(obj) =>
						obj.OldClassRoomId &&
						record.classRoomId &&
						obj.OldClassRoomId.toString() === record.classRoomId.toString(),
				)
				?.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))

			if (!journey || journey.length === 0) {
				oldClassNotFound += 1
				deletebulkOperations.push({
				deleteOne: {
					filter: { _id: record._id },
				},
			})
			classNotFoundBullk.push(record)
				continue
			}

			journey = journey.length > 1 ? journey[journey.length - 1] : journey[0]

			bulkOperations.push({
				updateOne: {
					filter: { _id: record._id },
					update: {
						$set: {
							classRoomId: journey.classRoomId,
							SAY: journey.SAY,
							academicYear: journey.academicYear,
						},
					},
				},
			})
		} else {
			journeyNotFound += 1
		}
	}

	console.log('-------> bulkOperations <--------', bulkOperations.length)
	console.log('-------> Student not found <--------', studentFound)
	console.log('-------> Old classrooms not found <--------', oldClassNotFound)
	console.log('-------> Journey not found <--------', journeyNotFound)

	console.log(JSON.stringify(bulkOperations[0]?.updateOne))

	if (bulkOperations.length > 0) {
		await COPEAssessment.bulkWrite(bulkOperations)
	}

	console.log('delete bulk ------->', deletebulkOperations.length)
	if (deletebulkOperations.length > 0) {
		await COPEAssessment.bulkWrite(deletebulkOperations)
	}

	console.log('Inserted count   --- ', classNotFoundBullk.length)
	if (classNotFoundBullk.length > 0) {
		await mongoose.connection
			.collection('removed_student_cope_records')
			.insertMany(classNotFoundBullk)
	}

	await mongoose.disconnect()
	console.log('Migration completed')
}

runMigration().catch((err) => {
	console.error('Migration failed:', err)
	process.exit(1)
})
