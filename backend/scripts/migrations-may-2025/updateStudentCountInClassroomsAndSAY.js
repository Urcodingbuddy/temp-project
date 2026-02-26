// 1. Get all active classrooms and then all ids
// 2. Get all SAYs and Ids
// 3. Get all students and loop through it
// 4. In each loop, loop through students journey and group them by SAY/academicYear
// 5. In students journey group by academic year if any group has one record then update count in classroom and SAY
//    else if multiple journeys then consider the latest one
// 6. Using latest one

const mongoose = require('mongoose')
const { Classrooms } = require('../../models/database/myPeegu-classroom')
// const { AcademicYears } = require('../../models/database/academic-years')
const { Students } = require('../../models/database/myPeegu-student')
const { SchoolAcademicYears } = require('../../models/database/school-academic-years')
const { MONGODB_URI } = require('./migrations-utils')

async function runMigration() {
	console.log('Migration started...')
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to MongoDB')

	const classroomsMap = new Map()
	const SAYsMap = new Map()

	// const academicYears = await AcademicYears.find({}).lean()
	const SAYs = await SchoolAcademicYears.find({}).lean()

	const classrooms = await Classrooms.find({ status: 'Active' }).lean()
	const allStudents = await Students.find({ status: 'Active' }).lean()

	const classroomsBulks = []
	const sayBulks = []

	for (const SAY of SAYs) {
		SAYsMap.set(SAY._id.toString(), 0)
	}

	for (const classroom of classrooms) {
		classroomsMap.set(classroom._id.toString(), 0)
	}

	// console.log(SAYsMap)
	// console.log(classroomsMap)

	for (const student of allStudents) {
		if (student.studentsJourney && student.studentsJourney.length > 0) {
			const latestJourneyByYear = new Map()

			for (const journey of student.studentsJourney) {
				const year = journey.academicYear.toString()
				const currentMax = latestJourneyByYear.get(year)

				if (
					!currentMax ||
					new Date(journey.dateTime).getTime() > new Date(currentMax.dateTime).getTime()
				) {
					latestJourneyByYear.set(year, journey)
				}
			}

			for (const [, journey] of latestJourneyByYear) {
				const classroomId = journey.classRoomId?.toString()
				const classRoomStudentsCount = classroomsMap.get(classroomId)
				classroomsMap.set(classroomId, (classRoomStudentsCount || 0) + 1)

				const SAYId = journey.SAY?.toString()
				const schoolsStudentsCount = SAYsMap.get(SAYId)
				SAYsMap.set(SAYId, (schoolsStudentsCount || 0) + 1)
			}
		}
	}

	for (const [id, count] of classroomsMap) {
		classroomsBulks.push({
			updateOne: {
				filter: { _id: id },
				update: {
					$set: {
						studentCount: count,
					},
				},
			},
		})
	}

	for (const [id, count] of SAYsMap) {
		sayBulks.push({
			updateOne: {
				filter: { _id: id },
				update: {
					$set: {
						studentCount: count,
					},
				},
			},
		})
	}

	console.log('classroon bulk: ', classroomsBulks.length)
	if (classroomsBulks.length > 0) {
		const result = await Classrooms.bulkWrite(classroomsBulks)
		console.log(result)
	}

	console.log('SAY bulk: ', sayBulks.length)
	if (sayBulks.length > 0) {
		const result = await SchoolAcademicYears.bulkWrite(sayBulks)
		console.log(result)
	}

	await mongoose.disconnect()
	console.log('Migration completed')
}

runMigration().catch((err) => {
	console.error('Migration failed:', err)
	process.exit(1)
})
