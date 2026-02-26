const { Schools } = require('../models/database/myPeegu-school')
const { Classrooms } = require('../models/database/myPeegu-classroom')
// const router = express.Router()
const { ObjectId } = require('mongoose').Types
const mongoose = require('mongoose') // DO NOT REMOVE THIS SEMICOLAN

// This script is used to update the hierarchies of classes and sections done for the release of Phase4B and executed for both dev & Prod by connecting to respective DB. So don't use this class for any other API's
async function updateClassroomHierarchy() {
	try {
		const mongoDB = 'mongodb+srv://mypeeguserver:fzhZb0U9zNjwJswY@mypeegu-dev.zle6nri.mongodb.net/mypeegu'
		await mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true }).catch((error) => {
			console.log('Unable to initiate Mongoose default connection, because of the error: %s', error.message)
			process.exit(0)
		})
		const distinctSchools = await Schools.distinct('_id')
		console.log('distinctSchools' + distinctSchools.length)
		const classrooms = await Classrooms.find({ school: { $in: distinctSchools } })
		console.log('classrooms' + classrooms.length)

		let classUpdates = []
		for (const schoolId of distinctSchools) {
			console.log('schoolId', schoolId)
			const schoolClassrooms = classrooms.filter((classroom) => classroom?.school?.toString() === schoolId?.toString())

			let uniqueClassNames = Array.from(new Set(schoolClassrooms.map((classroom) => classroom.className)))
			uniqueClassNames = uniqueClassNames.sort((a, b) => a.localeCompare(b))

			uniqueClassNames.forEach((className, classIndex) => {
				const classRoomsToUpdate = schoolClassrooms.filter((classroom) => classroom.className === className)
				const sectionClassRooms = classRoomsToUpdate.sort((a, b) => a.section.localeCompare(b.section))
				sectionClassRooms.forEach((classroom, sectionIndex) => {
					classroom.classHierarchy = classIndex + 1
					classroom.sectionHierarchy = sectionIndex + 1
					classUpdates.push(classroom)
				})
			})
		}

		console.log('classUpdates', classUpdates)
		const bulkUpdates = classUpdates.map((classroom) => ({
			updateOne: {
				filter: { _id: new ObjectId(classroom._id) }, // Filter by document ID
				update: {
					$set: {
						classHierarchy: classroom.classHierarchy,
						sectionHierarchy: classroom.sectionHierarchy,
					},
				},
			},
		}))

		try {
			// Execute bulk write operation
			const result = await Classrooms.bulkWrite(bulkUpdates)
			console.log('Bulk update operation completed:', result)
			// res.status(200).json('Bulk update completed');
		} catch (error) {
			console.error('Error performing bulk update:', error)
			// res.status(500).json('Internal server error');
		}

		// res.status(200).json('sac')
	} catch (error) {
		console.error('Error updating classroom hierarchy:', error)
		// res.status(500).json('Internal server error')
	}
}

;(async () => {
	try {
		await updateClassroomHierarchy()
		process.exit(0) // Exit with success
	} catch (error) {
		console.error(error)
		process.exit(1) // Exit with failure
	}
})()
