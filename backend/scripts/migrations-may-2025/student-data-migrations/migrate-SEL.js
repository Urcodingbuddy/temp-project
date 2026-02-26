const mongoose = require('mongoose')
const { SELCurriculumTracker } = require('../../../models/database/myPeegu-SEL')
const { AcademicYears } = require('../../../models/database/academic-years')
const { ClassroomsOld } = require('../../../models/database/old-classrooms')
const { Classrooms } = require('../../../models/database/myPeegu-classroom')

const { MONGODB_URI } = require('../migrations-utils')

// 1. Find all SELs
// 2. Loop through SELs
// 3. In each loop find academic year using Interaction Date and get Id
// 4. Once you get AY id find classroom in old_classrooms and get className and section
// 5. Use className, section, school and academic year and find classroom in migrated classrooms collection
// 6. Now save the classroom, SAY and AY in SEL

async function runMigration() {
	console.log('Migration started...')
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to MongoDB')

	const allRecords = await SELCurriculumTracker.find({}).lean()
	const academicYears = await AcademicYears.find({}).lean()
	const allOldClassrooms = await ClassroomsOld.find({}).lean()
	const allClassrooms = await Classrooms.find({}).lean()

	// console.log('----All Students----', allStudents.length)
	// console.log('----Observation Records----', allRecords.length)

	const bulkOperations = []
	const deletebulkOperations = []
	const classNotFoundBullk = []

	let AYNotFound = 0
	let oldClassroomNotFound = 0
	let classroomNotFound = 0

	console.log('--------Looping started----------')
	for (const record of allRecords) {
		const date = new Date(record.interactionDate)
		const year = date.getMonth() + 1 >= 5 ? date.getFullYear() : date.getFullYear() - 1
		const AYString = `${year}-${year + 1}`

		const academicYear = academicYears.find((obj) => obj.academicYear === AYString)
		if (!academicYear) {
			AYNotFound += 1
			continue
		}

		const oldClassroom = allOldClassrooms.find(
			(obj) => record.classRoomId && obj._id.toString() === record.classRoomId.toString(),
		)
		if (!oldClassroom) {
			oldClassroomNotFound += 1
			continue
		}

		const classroom = allClassrooms.find(
			(obj) =>
				obj.school.toString() === record.school.toString() &&
				obj.className === oldClassroom.className &&
				obj.section === oldClassroom.section &&
				obj.academicYear.toString() === academicYear._id.toString(),
		)
		if (!classroom) {
			classroomNotFound += 1
			deletebulkOperations.push({
				deleteOne: {
					filter: { _id: record._id },
				},
			})
			classNotFoundBullk.push(record)
			continue
		}

		bulkOperations.push({
			updateOne: {
				filter: { _id: record._id },
				update: {
					$set: {
						classRoomId: classroom._id,
						SAY: classroom.SAY,
						academicYear: classroom.academicYear,
					},
				},
			},
		})
	}

	console.log('-------> bulkOperations <--------', bulkOperations.length)
	console.log('-------> AY not found <--------', AYNotFound)
	console.log('-------> Old classrooms not found <--------', oldClassroomNotFound)
	console.log('-------> classroom not found <--------', classroomNotFound)
	// console.log('classrooms ids -----', JSON.stringify(classNotFound))

	// console.log(JSON.stringify(bulkOperations[0]?.updateOne))

	if (bulkOperations.length > 0) {
		const result = await SELCurriculumTracker.bulkWrite(bulkOperations)
		console.log(result)
	}

	console.log('delete bulk ------->', deletebulkOperations.length)
	if (deletebulkOperations.length > 0) {
		const result = await SELCurriculumTracker.bulkWrite(deletebulkOperations)
		console.log(result)
	}

	console.log('Inserted count   --- ', classNotFoundBullk.length)
	if (classNotFoundBullk.length > 0) {
		const result = await mongoose.connection
			.collection('removed_sels')
			.insertMany(classNotFoundBullk)
		console.log(result)
	}

	await mongoose.disconnect()
	console.log('Migration completed')
}

runMigration().catch((err) => {
	console.error('Migration failed:', err)
	process.exit(1)
})
