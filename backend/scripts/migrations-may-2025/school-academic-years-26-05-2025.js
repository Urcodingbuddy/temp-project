const mongoose = require('mongoose')
const { Schools } = require('../../models/database/myPeegu-school')
const { AcademicYears } = require('../../models/database/academic-years')
const { SchoolAcademicYears } = require('../../models/database/school-academic-years')
const { MONGODB_URI } = require('./migrations-utils')

async function runMigration() {
	console.log('Migration started...')
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to MongoDB')

	const schools = await Schools.find()
	console.log('----> 1111', schools.length)
	const today = new Date()
	const currentAcademicYearStart =
		today.getMonth() + 1 >= 5 ? today.getFullYear() : today.getFullYear() - 1

	const SAYs = await SchoolAcademicYears.find({})
	let allAcademicYears = await AcademicYears.find({})

	const bulkOperations = []

	// Uncomment 1st onboard date and commonnt second onboard date
	for (const school of schools) {
		const onboardDate = new Date(school.onboardDate ?? school.createdAt)
		const onboard_date =
			onboardDate.getMonth() + 1 >= 5
				? onboardDate.getFullYear()
				: onboardDate.getFullYear() - 1 // For Prod
		// const onboardDate = school.createdAt.getFullYear() // For dev

		for (let year = onboard_date; year <= currentAcademicYearStart; year++) {
			const academicYearString = `${year}-${year + 1}`
			// console.log('----->2222', academicYearString)
			// 1. Ensure AcademicYear exists or create
			let academicYear = allAcademicYears.find(
				(obj) => obj.academicYear === academicYearString,
			)
			if (!academicYear) {
				academicYear = await AcademicYears.create({ academicYear: academicYearString })
				console.log(`Created academic year: ${academicYearString}`)
			}
			// console.log('----->3333', academicYear)

			// 2. Check if mapping already exists
			const exists = SAYs.find(
				(obj) =>
					obj.school?.toString() === school._id?.toString() &&
					obj.academicYear?.toString() === academicYear._id?.toString(),
			)
			// console.log('----->4444', exists)

			if (!exists) {
				const startDate = new Date(`${year}-05-01`)
				const endDate = new Date(`${year + 1}-04-30`)

				const now = new Date()
				const currentAcYear = academicYearString === '2025-2026'

				const object = {
					insertOne: {
						document: {
							school: school._id,
							academicYear: academicYear._id,
							startDate,
							endDate,
							currentAcYear,
						},
					},
				}
				bulkOperations.push(object)

				// console.log(`Mapped ${school.school} with academic year ${academicYearString}`)
			} else {
				console.log(`Mapping already exists for ${school.school} -> ${academicYearString}`)
			}
		}
	}

	console.log('-------------> Length :', bulkOperations.length)
	await SchoolAcademicYears.bulkWrite(bulkOperations)

	await mongoose.disconnect()
	console.log('Migration completed')
}

runMigration().catch((err) => {
	console.error('Migration failed:', err)
	process.exit(1)
})
