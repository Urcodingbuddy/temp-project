const mongoose = require('mongoose')
const { Teacher } = require('../../models/database/myPeegu-teacher')
const { Classrooms } = require('../../models/database/myPeegu-classroom')
const { MONGODB_URI } = require('./migrations-utils')

async function runMigration() {
	try {
		console.log('🚀 Connecting to MongoDB...')
		await mongoose.connect(MONGODB_URI)
		console.log('✅ Connected')

		const teachers = await Teacher.find({ isDeleted: {$ne: true} }).lean()
		const allClassrooms = await Classrooms.find({ status: 'Active' }).lean()
		const bulkOps = []

		console.log('teachers :', teachers.length)
		console.log('allClassrooms :', allClassrooms.length)

		for (let i = 0; i < teachers.length; i++) {
			const teacher = teachers[i]
			if (teacher.classRoomIds && teacher.classRoomIds.length > 0) {
				const journey = teacher.classRoomIds
					.map((classroomId) =>
						allClassrooms.find((obj) => obj._id.toString() === classroomId.toString()),
					)
					.filter(Boolean) // remove undefined if no match found
					.map((classroom) => ({
						classRoomId: classroom._id,
						SAY: classroom.SAY,
						academicYear: classroom.academicYear,
						assignedDate: classroom.createdAt,
					}))

				bulkOps.push({
					updateOne: {
						filter: { _id: teacher._id },
						update: {
							$set: {
								classroomsJourney: journey,
							},
						},
					},
				})
			} else {
				bulkOps.push({
					updateOne: {
						filter: { _id: teacher._id },
						update: {
							$set: {
								classroomsJourney: [],
							},
						},
					},
				})
			}
		}

		// console.log(JSON.stringify(bulkOps))

		console.log(bulkOps.length)
		if (bulkOps.length) {
			const result = await Teacher.bulkWrite(bulkOps)
			console.log(result)
		}

		await mongoose.disconnect()
		console.log('🏁 Migration completed')
	} catch (err) {
		console.error('❌ Migration failed:', err)
		process.exit(1)
	}
}

runMigration()
