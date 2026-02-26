const mongoose = require('mongoose')
const { Students } = require('../../models/database/myPeegu-student')
const { AcademicYears } = require('../../models/database/academic-years')

const { MONGODB_URI } = require('./migrations-utils')


async function runMigration() {
	console.log('Migration started...')
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to MongoDB')

	const allStudents = await Students.find({}).lean()
	console.log(allStudents.length)

	const bulkOperations = []
	for (const student of allStudents) {
		bulkOperations.push({
			updateOne: {
				filter: { _id: student._id },
				update: {
					$unset: { lastPromotionDate: '', lastDemotionDate: '' },
				},
			},
		})
	}

	console.log('----Length----', bulkOperations.length)
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
