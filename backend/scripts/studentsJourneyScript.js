const mongoose = require('mongoose')
const { Schools } = require('../models/database/myPeegu-school')
const { Students } = require('../models/database/myPeegu-student')
const { Classrooms } = require('../models/database/myPeegu-classroom')

async function updateStudentsJourney() {
	try {
		const mongoDB = 'mongodb+srv://mypeeguserver:fzhZb0U9zNjwJswY@mypeegu-dev.zle6nri.mongodb.net/mypeegu'
		await mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true }).catch((error) => {
			console.log('Unable to initiate Mongoose default connection, because of the error: %s', error.message)
			process.exit(0)
		})
		const distinctSchools = await Schools.distinct('_id')

		const students = await Students.find({ school: { $in: distinctSchools } })
			.select('school className section createdAt user_id')
			.lean()
		console.log('students' + students.length)

		const classRooms = await Classrooms.find({ school: { $in: distinctSchools } })
			.select('school className section')
			.lean()
		console.log('classRooms' + classRooms.length)

		let studentCount = 0
		let studentUpdates = []
		students.map((student, index) => {
			let classRoomOfStudent = classRooms.find((classRoom) => {
				const matching =
					classRoom.school?.toString() === student.school?.toString() &&
					classRoom.className === student.className &&
					classRoom.section === student.section

				return matching
			})

			if (classRoomOfStudent) {
				studentCount++
				//   console.log('Students Journey & classRoomId Updated Successfully ')
			} else {
				classRoomOfStudent = classRooms.find((classRoom) => {
					const matching = classRoom.school?.toString() === student.school?.toString()
					return matching
				})
				if (classRoomOfStudent) {
					studentCount++
				}
			}
			const journeyData = {
				classRoomId: classRoomOfStudent ? classRoomOfStudent._id : null,
				dateTime: student.createdAt,
			}

			studentUpdates.push({
				updateOne: {
					filter: { _id: student._id }, // Filter by document ID
					update: {
						$push: { studentsJourney: journeyData },
						$set: { classRoomId: classRoomOfStudent ? classRoomOfStudent._id : null },
					},
				},
			})
		}),
			console.log('studentCount' + studentCount)
		console.log('studentUpdates' + studentUpdates.length)

		const result = await Students.bulkWrite(studentUpdates)
		console.log('Bulk student update operation completed:', result)
	} catch (error) {
		console.error('Error updating Students Journey', error)
		throw new Error('Error updating Students Journey', error)
	}
}

;(async () => {
	try {
		await updateStudentsJourney()
		process.exit(0) // Exit with success
	} catch (error) {
		console.error(error)
		process.exit(1) // Exit with failure
	}
})()
