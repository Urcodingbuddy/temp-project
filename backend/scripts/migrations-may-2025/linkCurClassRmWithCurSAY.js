const mongoose = require('mongoose')
const { Classrooms } = require('../../models/database/myPeegu-classroom')
const { AcademicYears } = require('../../models/database/academic-years')
const { SchoolAcademicYears } = require('../../models/database/school-academic-years')
const { MONGODB_URI } = require('./migrations-utils')

// 1. Find academic year of 2025-26
// 2. Find all classrooms
// 3. Loop classrooms and find school academic year of 2025-26 of classroom
// 4. Add respective school academic year to its classroom
// 5. Update classroom createdAt and UpdatedAt as startDate of academicYear
// 6. If teacher has any Id then add teacher journey with - teacherId, startDate as SAY startDate and endDate as null.

async function runMigration() {
	console.log('Migration started...')
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to MongoDB')

	console.log('--------Fetching Teachers---------')
	const academicYear = await AcademicYears.findOne({ academicYear: '2025-2026' }).lean()
	// console.log('--------Fetchers Teachers---------', teachers.length)

	const classrooms = await Classrooms.find({ status: 'Active' }).lean()
	const bulkOperations = []

	const SAYs = await SchoolAcademicYears.find({})
	console.log('-------->', SAYs[0])

	let notFound = 0
	for (const classroom of classrooms) {
		let SAY = null
		if (classroom.school) {
			SAY = SAYs.find((obj) => {
				return (
					obj.school && obj.school.toString() === classroom.school.toString() && obj.academicYear.toString() === academicYear._id.toString()
				)
			})
		}

		if (SAY) {
			// console.log('----> teacherId', teacher._id)
			let teacherJourney = []
			if (classroom.teacher) {
				teacherJourney = [
					{
						teacherId: classroom.teacher,
						startDate: SAY.startDate,
						endDate: null,
					},
				]
			}

			bulkOperations.push({
				updateOne: {
					filter: { _id: classroom._id },
					update: {
						$set: {
                            teacherJourney,
							createdAt: SAY.startDate,
							updatedAt: SAY.startDate,
							SAY: new mongoose.Types.ObjectId(SAY._id),
							academicYear:  new mongoose.Types.ObjectId(academicYear._id),
						},
					},
				},
			})
		} else {
			notFound += 1
			console.log('---------> SAY not found <---------', classroom)
		}
	}

	console.log('-------> ', bulkOperations.length)
	console.log('-------> 404 <--------', notFound)

    // console.log(bulkOperations[0]?.updateOne)

	if (bulkOperations.length > 0) {
		const modify = await Classrooms.bulkWrite(bulkOperations)
		console.log(modify)
	}

	await mongoose.disconnect()
	console.log('Migration completed')
}

runMigration().catch((err) => {
	console.error('Migration failed:', err)
	process.exit(1)
})

// Once you are done with this do below steps
// 1. Remove Teacher name, email and phone adding/updating from classrooms
// 2. Update the classroom upload template as add teacherId as mandatory and remove teacher name, email and phone columns
// 3. Update the validation as per the school academic years. Ex: classroom with same class & section can't be duplicate in same academic year but can be duplicate for different academic years.
// 4. Based Teacher Id add teacher reference to classrooms
