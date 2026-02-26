const mongoose = require('mongoose')
const { Schools } = require('../../models/database/myPeegu-school')
const { AcademicYears } = require('../../models/database/academic-years')

const { MONGODB_URI } = require('./migrations-utils')

async function runMigration() {
	console.log('Migration started...')
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to MongoDB')

	const allSchools = await Schools.find({}).lean()

	console.log(allSchools.length)

	const bulkOperations = []
	for (const school of allSchools) {
		if (school.lastPromotionDate) {
			const promoteDate = new Date(school.lastPromotionDate)
			const yearStart =
				promoteDate.getMonth() + 1 >= 5
					? promoteDate.getFullYear()
					: promoteDate.getFullYear() - 1
			const acYrString = `${yearStart}-${yearStart + 1}`
			const academicYear = await AcademicYears.findOne({ academicYear: acYrString })
			if (academicYear) {
				bulkOperations.push({
					updateOne: {
						filter: { _id: school._id },
						update: {
							$set: { lastPromotionAcademicYear: academicYear },
						},
					},
				})
			}
		} else if (school.onboardDate) {
			const onboardDate = new Date(school.onboardDate)
			const yearStart =
				onboardDate.getMonth() + 1 >= 5
					? onboardDate.getFullYear()
					: onboardDate.getFullYear() - 1
			const acYrString = `${yearStart}-${yearStart + 1}`
			const academicYear = await AcademicYears.findOne({ academicYear: acYrString })
			if (academicYear) {
				bulkOperations.push({
					updateOne: {
						filter: { _id: school._id },
						update: {
							$set: {
								lastPromotionAcademicYear: academicYear,
								lastPromotionDate: onboardDate,
							},
						},
					},
				})
			}
		} else {
			const createdDate = new Date(school.createdAt)
			const yearStart =
				createdDate.getMonth() + 1 >= 5
					? createdDate.getFullYear()
					: createdDate.getFullYear() - 1
			const acYrString = `${yearStart}-${yearStart + 1}`
			const academicYear = await AcademicYears.findOne({ academicYear: acYrString })
			if (academicYear) {
				bulkOperations.push({
					updateOne: {
						filter: { _id: school._id },
						update: {
							$set: {
								lastPromotionAcademicYear: academicYear,
								lastPromotionDate: createdDate,
							},
						},
					},
				})
			}
		}
	}

	console.log('----Length----', bulkOperations.length)
	if (bulkOperations.length > 0) {
		await Schools.bulkWrite(bulkOperations)
	}

	await mongoose.disconnect()
	console.log('Migration completed')
}

runMigration().catch((err) => {
	console.error('Migration failed:', err)
	process.exit(1)
})
