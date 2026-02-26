const mongoose = require('mongoose')
const { Students } = require('../../../models/database/myPeegu-student')

const {MONGODB_URI} = require('../migrations-utils')

// 1. Find all stduents which are graduated or exited
// 2. Loop students and get studentsJourney
// 3. From students jouenry get the last record by date
// 4. If student is graduated add graduateAcademicYear as the last records academicYear
// 4. If student is exited add exitedAcademicYear as the last records academicYear

async function runMigration() {
	console.log('Migration started...')
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to MongoDB')

	const students = await Students.find({ $or: [{ exited: true }, { graduated: true }] }).lean()

	console.log('--------- Length --------', students.length)
	if (students.length === 0) {
		console.log('No students found')
		return
	}

    const bulkOperations = []
	let journeyNotFound = 0
	let academicYearNF = 0

	console.log('--------Loop started--------')
	for (const student of students) {
		// console.log('Loop start')
		if (student.studentsJourney && student.studentsJourney.length > 0) {
			const journeys = student.studentsJourney.sort(
				(a, b) => new Date(b.dateTime) - new Date(a.dateTime),
			)
			const academicYear = journeys[0]?.academicYear
			if (!academicYear) {
				academicYearNF += 1
				continue
			}
			const updateData = {}

			if (student.graduated) {
				updateData['graduatedAcademicYear'] = academicYear
			}
			if (student.exited) {
				updateData['exitedAcademicYear'] = academicYear
			}
			bulkOperations.push({
				updateOne: {
					filter: { _id: student._id },
					update: {
						$set: updateData,
					},
				},
			})
		} else {
			journeyNotFound += 1
		}
		// console.log('Loop end')
	}

	console.log('-------> ', bulkOperations.length)
	console.log('-------> ', journeyNotFound)
	console.log('-------> ', academicYearNF)

	if (bulkOperations.length > 0) {
		const result = await Students.bulkWrite(bulkOperations)
		console.log(result)
	}

	await mongoose.disconnect()
	console.log('Migration completed')
}

runMigration().catch((err) => {
	console.error('Migration failed:', err)
	process.exit(1)
})
