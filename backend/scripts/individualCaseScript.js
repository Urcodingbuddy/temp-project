const mongoose = require('mongoose')
const { Students } = require('../models/database/myPeegu-student')
const { IndividualRecord } = require('../models/database/myPeegu-individual')

async function addClassRoomIdToIndividualRecords() {
	try {
		const mongoDB = 'mongodb+srv://mypeeguserver:fzhZb0U9zNjwJswY@mypeegu-dev.zle6nri.mongodb.net/mypeegu'
		await mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true }).catch((error) => {
			logger.info('Unable to initiate Mongoose default connection, because of the error: %s', error.message)
			process.exit(0)
		})

		const individualCaseRecords = await IndividualRecord.find()
		const studentIds = individualCaseRecords.map((record) => record.studentId)
		const students = await Students.find({ _id: { $in: studentIds } })
		console.log('individualCaseRecords', individualCaseRecords.length)

		let individualUpdates = []
		let studentDetails = ['']
		individualCaseRecords.map((record) => {
			const student = students.find((student) => student?._id.toString() === record.studentId.toString())
			if (student) {
				if (!studentDetails.includes(record.studentId.toString())) {
					individualUpdates.push({
						updateMany: {
							filter: { studentId: record.studentId }, // Filter by document ID
							update: {
								$set: { classRoomId: student.classRoomId },
							},
						},
					})
					studentDetails.push(record.studentId.toString())
				}

				// console.log('classRoomId added Successfully in IndividualRecord')
			} else {
				console.log('ClassRooms for student not found ')
			}
		})
		console.log('individualUpdates', individualUpdates.length)
		const result = await IndividualRecord.bulkWrite(individualUpdates)
		console.log('Bulk IndividualRecord update operation completed:', result)
	} catch (error) {
		console.error('Error updating Students Journey', error)
		throw new Error('Error updating Students Journey', error)
	}
}

;(async () => {
	try {
		await addClassRoomIdToIndividualRecords()
		process.exit(0) // Exit with success
	} catch (error) {
		console.error(error)
		process.exit(1) // Exit with failure
	}
})()
