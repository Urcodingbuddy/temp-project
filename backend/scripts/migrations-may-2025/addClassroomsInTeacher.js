const mongoose = require('mongoose')
const { Teacher } = require('../../models/database/myPeegu-teacher')
const { Classrooms } = require('../../models/database/myPeegu-classroom')
const { MONGODB_URI } = require('./migrations-utils')

async function runMigration() {
	try {
		console.log('🚀 Connecting to MongoDB...')
		await mongoose.connect(MONGODB_URI)
		console.log('✅ Connected')

		const allTeachers = await Teacher.find({ isDeleted: {$ne: true} }).lean()
		const allClassrooms = await Classrooms.find({
			status: 'Active',
			teacher: { $exists: true },
		}).lean()

		const bulkOps = []

		const teacherIdsSet = new Set()

		for (const classroom of allClassrooms) {
			const index = allTeachers.findIndex(
				(obj) => classroom.teacher && obj._id.toString() === classroom.teacher.toString(),
			)
			if (index !== -1) {
				const teacher = allTeachers[index]
				let journey = teacher.classroomsJourney ?? []
				if (!journey.length) {
					journey = [
						{
							classRoomId: classroom._id,
							assignedDate: classroom.createdAt,
							academicYear: classroom.academicYear,
							SAY: classroom.SAY,
						},
					]
				} else {
					const journeyExist = journey.find(
						(obj) => obj.classRoomId.toString() === classroom._id.toString(),
					)
					if (journeyExist) {
						continue
					} else {
						journey.push({
							classRoomId: classroom._id,
							assignedDate: classroom.createdAt,
							academicYear: classroom.academicYear,
							SAY: classroom.SAY,
						})
					}
				}

				allTeachers[index]['classroomsJourney'] = journey
				teacherIdsSet.add(teacher._id.toString())
			}
		}

		const teacherIds = [...teacherIdsSet]
		for (const id of teacherIds) {
			const teacher = allTeachers.find((obj) => obj._id.toString() === id)
			bulkOps.push({
				updateOne: {
					filter: { _id: id },
					update: {
						$set: {
							classroomsJourney: teacher.classroomsJourney,
						},
					},
				},
			})
		}

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
