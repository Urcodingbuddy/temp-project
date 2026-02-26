const mongoose = require('mongoose')

const { SELCurriculumTracker } = require('../models/database/myPeegu-SEL')
const { Classrooms } = require('../models/database/myPeegu-classroom')

async function addClassRoomIdToSELTrackerRecords() {
	try {
		const mongoDB = 'mongodb+srv://mypeeguserver:fzhZb0U9zNjwJswY@mypeegu-dev.zle6nri.mongodb.net/mypeegu'
		await mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true }).catch((error) => {
			logger.info('Unable to initiate Mongoose default connection, because of the error: %s', error.message)
			process.exit(0)
		})

		const selRecords = await SELCurriculumTracker.find().lean()
		const schoolIds = selRecords.map((record) => record.school)

		const classrooms = await Classrooms.find({
			school: { $in: schoolIds },
		}).lean()
		console.log('selRecords', selRecords.length)
		console.log('classrooms', classrooms.length)

		let selUpdates = []
		let recordIds = ['']
		selRecords.map((record) => {
			const classRoomId = classrooms.find((classRoom) => {
				const macthing =
					classRoom?.school.toString() === record.school.toString() &&
					classRoom?.className === record.className &&
					classRoom?.section === record.section
				return macthing
			})
			if (classRoomId) {
				if (!recordIds.includes(record._id.toString())) {
					selUpdates.push({
						updateMany: {
							filter: { _id: record._id }, // Filter by document ID
							update: {
								$set: { classRoomId: classRoomId._id },
							},
						},
					})
					recordIds.push(record._id.toString())
				}
			} else {
				// console.log('ClassRooms for student not found ')
			}
		})

		console.log('selUpdates', selUpdates.length)
		const result = await SELCurriculumTracker.bulkWrite(selUpdates)
		console.log('Bulk SELCurriculumTracker update operation completed:', result)
	} catch (error) {
		console.error('Error updating Students Journey', error)
		throw new Error('Error updating Students Journey', error)
	}
}

;(async () => {
	try {
		await addClassRoomIdToSELTrackerRecords()
		process.exit(0) // Exit with success
	} catch (error) {
		console.error(error)
		process.exit(1) // Exit with failure
	}
})()
