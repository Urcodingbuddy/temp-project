const mongoose = require('mongoose')
const { Students } = require('../../models/database/myPeegu-student')
const { Classrooms } = require('../../models/database/myPeegu-classroom')
const { MONGODB_URI } = require('./migrations-utils')
const { SchoolAcademicYears } = require('../../models/database/school-academic-years')

//

async function runMigration() {
	console.log('Migration started...')
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to MongoDB')

	const students = await Students.find({ status: 'Active' }).lean()
	const classAddCountMap = new Map()
	const SAYAddCountMap = new Map()

	for (const student of students) {
		const ayJourneyMap = new Map()
		for (const jrny of student.studentsJourney) {
			const ayKey = jrny.academicYear?.toString()
			const ayExist = ayJourneyMap.get(ayKey)

			if (ayExist && new Date(ayExist.dateTime) < new Date(jrny.dateTime)) {
				ayJourneyMap.set(ayKey, jrny)
			} else {
				ayJourneyMap.set(ayKey, jrny)
			}
		}

		const Journeys = Array.from(ayJourneyMap.values())

		const uniqClassroomsMap = new Map()
		for (const journey of Journeys) {
			const key = journey.classRoomId?.toString()
			if (key) uniqClassroomsMap.set(key, journey) // always keep latest
		}

		for (const jrny of uniqClassroomsMap.values()) {
			const classKey = jrny.classRoomId?.toString()
			const sayKey = jrny.SAY?.toString()

			if (classKey) {
				classAddCountMap.set(classKey, (classAddCountMap.get(classKey) || 0) + 1)
			}
			if (sayKey) {
				SAYAddCountMap.set(sayKey, (SAYAddCountMap.get(sayKey) || 0) + 1)
			}
		}
	}

	const addClassOps = []
	const addSAYOps = []

	// -------------- Classroom Add Bulk operations ---------------------
	for (const [classRoomId, count] of classAddCountMap.entries()) {
		addClassOps.push({
			updateOne: {
				filter: { _id: classRoomId },
				update: { $set: { studentCount: count } },
			},
		})
	}

	// -------------- SAY Add Bulk operations ---------------------
	for (const [classRoomId, count] of SAYAddCountMap.entries()) {
		addSAYOps.push({
			updateOne: {
				filter: { _id: classRoomId },
				update: { $set: { studentCount: count } },
			},
		})
	}

	console.log('add classroom count length: ', addClassOps.length)
	if (addClassOps.length) {
		const result = await Classrooms.bulkWrite(addClassOps)
		console.log(result)
	}
	console.log('add say count length: ', addSAYOps.length)
	if (addSAYOps.length) {
		const result = await SchoolAcademicYears.bulkWrite(addSAYOps)
		console.log(result)
	}

	await mongoose.disconnect()
	console.log('Migration completed')
}

runMigration().catch((err) => {
	console.error('Migration failed:', err)
	process.exit(1)
})
