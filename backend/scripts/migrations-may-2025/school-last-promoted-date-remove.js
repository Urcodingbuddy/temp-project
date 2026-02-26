const mongoose = require('mongoose')
const { Schools } = require('../../models/database/myPeegu-school')
const { AcademicYears } = require('../../models/database/academic-years')

const { MONGODB_URI } = require('./migrations-utils')


async function runMigration() {
	console.log('Migration started...')
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to MongoDB')

	const allSchools = await Schools.find({}).lean()

	const bulkOperations = []
	for (const school of allSchools) {
		if (school.lastPromotionDate) {
			bulkOperations.push({
				updateOne: {
					filter: { _id: school._id },
					update: {
						$unset: { lastPromotionDate: '' },
					},
				},
			})
		}
	}

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
