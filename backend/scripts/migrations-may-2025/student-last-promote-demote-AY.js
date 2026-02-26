const mongoose = require('mongoose')
const { Students } = require('../../models/database/myPeegu-student')
const { AcademicYears } = require('../../models/database/academic-years')
const {MONGODB_URI } = require('./migrations-utils')

// This migration will add lastPromotionAcademicYear for students which have lastPromotionDate.
// And will add lastDemotionAcademicYear for students which have lastPromotionDate.
async function runMigration() {
	console.log('Migration started...')
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to MongoDB')

	const allStudents = await Students.find({status: 'Active'}).lean()
	const allAcademicYear = await AcademicYears.find({}).lean()
	console.log(allStudents.length)

	let promotion = 0
	let demotion = 0
	const bulkOperations = []
	for (const student of allStudents) {
		if (student.lastPromotionDate) {
			promotion += 1
			const promoteDate = new Date(student.lastPromotionDate)
			const yearStart =
				promoteDate.getMonth() + 1 >= 5
					? promoteDate.getFullYear()
					: promoteDate.getFullYear() - 1
			const acYrString = `${yearStart}-${yearStart + 1}`
			const academicYear = allAcademicYear.find((obj) => obj.academicYear === acYrString)
			if (academicYear) {
				bulkOperations.push({
					updateOne: {
						filter: { _id: student._id },
						update: {
							$set: { lastPromotionAcademicYear: academicYear },
						},
					},
				})
			}
		}

		if (student.lastDemotionDate) {
			demotion += 1
			const promoteDate = new Date(student.lastDemotionDate)
			const yearStart =
				promoteDate.getMonth() + 1 >= 5
					? promoteDate.getFullYear()
					: promoteDate.getFullYear() - 1
			const acYrString = `${yearStart}-${yearStart + 1}`
			const academicYear = allAcademicYear.find((obj) => obj.academicYear === acYrString)
			if (academicYear) {
				bulkOperations.push({
					updateOne: {
						filter: { _id: student._id },
						update: {
							$set: { lastDemotionAcademicYear: academicYear },
						},
					},
				})
			}
		}
	}

	console.log('----PROMO----', promotion)
	console.log('----DEMO----', demotion)
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
