const mongoose = require('mongoose')
const { Classrooms } = require('../../models/database/myPeegu-classroom')
const { Teacher } = require('../../models/database/myPeegu-teacher')
const { MONGODB_URI } = require('./migrations-utils')

// Run below steps 1 by 1
// Step1: find teacher with email in classrooms if found 1 then add reference of teacher
// step2: Remove the teacher details from classrooms

async function runMigration() {
	console.log('Migration started...')
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to MongoDB')

	const classrooms = await Classrooms.find({})

	const bulkOperations = []

	const teachers = await Teacher.find({ isDeleted: {$ne: true} })

	for (const classroom of classrooms) {
		// console.log('-------> class - email', classroom.email)
		const teacher = teachers.find((obj) => obj.email === classroom.email)
		// console.log('-------> teaccher - email', teacher?.email)
		if (teacher) {
			// console.log('----> teacherId', teacher._id)
			bulkOperations.push({
				updateOne: {
					filter: { _id: classroom._id },
					update: {
						$set: {
							teacher: new mongoose.Types.ObjectId(teacher._id),
						},
					},
				},
			})
		}
	}

	console.log('------->', bulkOperations)

	if (bulkOperations.length > 0) {
		await Classrooms.bulkWrite(bulkOperations)
	}

	await mongoose.disconnect()
	console.log('Migration completed')
}

async function runMigration2() {
	console.log('Migration started...')
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to MongoDB')

	const classrooms = await Classrooms.find({})
	const bulkOperations = []

	for (const classroom of classrooms) {
		bulkOperations.push({
			updateOne: {
				filter: { _id: classroom._id },
				update: {
					$unset: {
						teacherName: '',
						email: '',
						phone: '',
					},
				},
			},
		})
	}

	console.log('----->', bulkOperations.length)
	if (bulkOperations.length > 0) {
		await Classrooms.bulkWrite(bulkOperations)
	}

	await mongoose.disconnect()
	console.log('Migration completed')
}

// runMigration().catch((err) => {
// 	console.error('Migration failed:', err)
// 	process.exit(1)
// })

runMigration2().catch((err) => {
	console.error('Migration failed:', err)
	process.exit(1)
})
