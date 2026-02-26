const mongoose = require('mongoose')
const { Students } = require('../models/database/myPeegu-student')
const { Classrooms } = require('../models/database/myPeegu-classroom')
const { MONGODB_URI } = require('./migrations-may-2025/migrations-utils')

// 1. Find all active students and classrooms

async function runMigration() {
	console.log('Migration started...')
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to MongoDB')

	const students = await Students.find({ status: 'Active' }).lean()
	const classrooms = await Classrooms.find({ status: 'Active' }).lean()
	const bulkOperations = []

	console.log('-----------Students Length---------', students.length)
	console.log('-----------Classrooms Length---------', classrooms.length)

	for (const student of students) {
		const journeys = []
		for (const jrny of student.studentsJourney) {
			const classroom = classrooms.find(
				(obj) => obj._id?.toString() === jrny.classRoomId?.toString(),
			)
			journeys.push({
				...jrny,
				SAY: classroom.SAY,
			})
		}
		bulkOperations.push({
			updateOne: {
				filter: { _id: student._id },
				update: {
					$set: { studentsJourney: journeys },
				},
			},
		})
	}

	console.log('-------> bulk length: ', bulkOperations.length)

	if (bulkOperations.length > 0) {
		await Students.bulkWrite(bulkOperations)
	}

	await mongoose.disconnect()
	console.log('Migration completed')
}

runMigration().catch((err) => {
	console.error('Migration failed:', err)
	process.exit(1)
})
