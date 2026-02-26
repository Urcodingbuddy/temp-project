const cron = require('node-cron')
const { AcademicYears } = require('../models/database/academic-years')

/**
 * Scheduler to create new academic year entries automatically
 * Runs at 12:05 AM on January 1st every year
 *
 * Cron pattern: '5 0 1 1 *'
 * - 5: minute (5th minute)
 * - 0: hour (12 AM / midnight)
 * - 1: day of month (1st)
 * - 1: month (January)
 * - *: day of week (any)
 */
const createNewAcademicYearScheduler = cron.schedule('5 0 1 1 *', async () => {
	try {
		const date = new Date()
		const year = date.getFullYear()
		const academicYear = `${year}-${year + 1}`

		console.log(`Creating academic year: ${academicYear}`)

		// Check if academic year already exists to prevent duplicates
		const existingAcademicYear = await AcademicYears.findOne({ academicYear })
		if (existingAcademicYear) {
			console.log(`Academic year ${academicYear} already exists. Skipping creation.`)
			return
		}

		// Find the academic year with the highest order
		const academicYearWithHighestOrder = await AcademicYears.findOne({}).sort({ order: -1 })

		// Handle case where no academic years exist yet
		const nextOrder = academicYearWithHighestOrder ? academicYearWithHighestOrder.order + 1 : 1

		// Create new academic year entry
		const newAcademicYear = await AcademicYears.create({
			academicYear,
			order: nextOrder,
		})

		console.log(
			`✅ Successfully created academic year: ${academicYear} with order: ${nextOrder}`,
		)
		console.log('New academic year entry:', newAcademicYear)
	} catch (error) {
		console.error('❌ Error creating new academic year:', error)
	}
})

module.exports = {
	createNewAcademicYearScheduler,
}
