const mongoose = require('mongoose')
const { Classrooms } = require('../../models/database/myPeegu-classroom')
const { AcademicYears } = require('../../models/database/academic-years')
const { SchoolAcademicYears } = require('../../models/database/school-academic-years')
const { MONGODB_URI } = require('./migrations-utils')

// 1. Find all classrooms
// 2. Loop classrooms and find school academic years of school of classroom, if found more than one then get SAYs except current academic year (2025-2026)
// 3. After filtering Loop through SAYs and create new classroom with same classrooms details
// 4. In new classroom update the SAY. Id teacherJourney length > 0, update its start and end date of new SAY
// 5. Also Update classroom createdAt and UpdatedAt as startDate of academicYear.

async function runMigration() {
	console.log('Migration started...')
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to MongoDB')

	const academicYears = await AcademicYears.find({}).lean()

	const classrooms = await Classrooms.find({ status: 'Active' }).lean()
	const bulkOperations = []

	const SAYs = await SchoolAcademicYears.find({})
	console.log('-----------Classrooms Length---------', classrooms.length)
	let notFound = 0
	let totalClassrooms = 0
	let newClassrooms = 0

	let i = 0
	for (const classroom of classrooms) {
		let prevSAYs = null
		if (classroom.school) {
			prevSAYs = SAYs.filter(
				(obj) => obj.school && obj.school.toString() === classroom.school.toString(),
			)
		}

		if (prevSAYs && prevSAYs.length > 0) {
			totalClassrooms += prevSAYs.length
			// console.log('---------> LENGTH <-------', prevSAYs.length)
			// if (i === 0 || i === 100) {
			// 	console.log('---------> 00000 <-------', prevSAYs)
			// }
			prevSAYs = prevSAYs.filter((obj) => obj._id.toString() !== classroom.SAY?.toString())
			newClassrooms += prevSAYs.length
			// console.log('---------> LENGTH AFTER <-------', prevSAYs.length)
			// if (i === 0 || i === 100) {
			// 	console.log('---------> 11111 <-------', prevSAYs)
			// }

			for (const SAY of prevSAYs) {
				let teacherJourney = []
				if (classroom.teacherJourney && classroom.teacherJourney.length > 0) {
					teacherJourney = [
						{
							teacherId: classroom.teacher,
							startDate: SAY.startDate,
							endDate: SAY.endDate,
						},
					]
				}

				const academicYear = academicYears.find(
					(obj) => obj._id.toString() === SAY.academicYear.toString(),
				)

				const newClassroom = {
					...classroom,
					teacherJourney,
					SAY: new mongoose.Types.ObjectId(SAY._id),
					academicYear: new mongoose.Types.ObjectId(academicYear._id),
					createdAt: SAY.startDate,
					updatedAt: SAY.startDate,
				}
				delete newClassroom._id
				delete newClassroom.__v

				bulkOperations.push({
					insertOne: {
						document: {
							_id: new mongoose.Types.ObjectId(),
							...newClassroom,
						},
					},
				})
			}
		} else {
			notFound += 1
			// console.log('---------> SAY not found <---------', classroom)
		}

		i += 1
	}

	console.log('-------> ', bulkOperations.length)
	console.log('-------> SAY NOT FOUND <--------', notFound)
	console.log('-------> Total <--------', totalClassrooms)
	console.log('-------> New <--------', newClassrooms)

	console.log(bulkOperations[754])

	if (bulkOperations.length > 0) {
		await Classrooms.bulkWrite(bulkOperations)
	}

	await mongoose.disconnect()
	console.log('Migration completed')
}

runMigration().catch((err) => {
	console.error('Migration failed:', err)
	process.exit(1)
})
