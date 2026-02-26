const mongoose = require('mongoose')
const { Students } = require('../models/database/myPeegu-student')
const { BaselineRecord } = require('../models/database/myPeegu-baseline')

async function addClassRoomIdToBaseLineRecords() {
	try {
		const mongoDB = 'mongodb+srv://mypeeguserver:fzhZb0U9zNjwJswY@mypeegu-dev.zle6nri.mongodb.net/mypeegu'
		await mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true }).catch((error) => {
			logger.info('Unable to initiate Mongoose default connection, because of the error: %s', error.message)
			process.exit(0)
		})

		const baseLineRecords = await BaselineRecord.find()
		const studentIds = baseLineRecords.map((record) => record.studentId)
		const students = await Students.find({ _id: { $in: studentIds } })

		console.log('baseLineRecords', baseLineRecords.length)
		let baselineUpdates = []
		let studentDetails = ['']
		baseLineRecords.map((record) => {
			const student = students.find((student) => student?._id.toString() === record.studentId.toString())
			if (student) {
				if (!studentDetails.includes(record.studentId.toString())) {
					baselineUpdates.push({
						updateMany: {
							filter: { studentId: record.studentId }, // Filter by document ID
							update: {
								$set: { classRoomId: student.classRoomId },
							},
						},
					})
					studentDetails.push(record.studentId.toString())
				}
			} else {
				console.log('ClassRooms for student not found ')
			}
		})
		console.log('baselineUpdates', baselineUpdates.length)
		const result = await BaselineRecord.bulkWrite(baselineUpdates)
		console.log('Bulk BaselineRecord update operation completed:', result)
	} catch (error) {
		console.error('Error updating Students Journey', error)
		throw new Error('Error updating Students Journey', error)
	}
}

;(async () => {
	try {
		await addClassRoomIdToBaseLineRecords()
		process.exit(0) // Exit with success
	} catch (error) {
		console.error(error)
		process.exit(1) // Exit with failure
	}
})()
