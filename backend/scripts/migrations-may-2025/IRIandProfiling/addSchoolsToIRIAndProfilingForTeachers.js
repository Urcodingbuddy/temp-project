const mongoose = require('mongoose')
const { MONGODB_URI } = require('../migrations-utils')
const { SchoolAcademicYears } = require('../../../models/database/school-academic-years')
const { IRIForTeachers } = require('../../../models/database/IRI-for-teachers')
const { ProfilingForTeachers } = require('../../../models/database/profiling-for-teachers')

async function migrateIriForSchools() {
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to DB')

	const iriForTeachers = await IRIForTeachers.find({})
	const profilingForTeachers = await ProfilingForTeachers.find({})
	const SAYs = await SchoolAcademicYears.find({})

	const iriBulkOps = []
	const profilingBulkOps = []

	for (const profiling of profilingForTeachers) {
		const say = SAYs.find((obj) => obj._id.toString() === profiling.SAY.toString())
		if (say) {
			profilingBulkOps.push({
				updateOne: {
					filter: { _id: profiling._id },
					update: {
						$set: {
							school: say.school,
						},
					},
				},
			})
		}
	}

	for (const iri of iriForTeachers) {
		const say = SAYs.find((obj) => obj._id.toString() === iri.SAY.toString())
		if (say) {
			iriBulkOps.push({
				updateOne: {
					filter: { _id: iri._id },
					update: {
						$set: {
							school: say.school,
						},
					},
				},
			})
		}
	}

	if (iriBulkOps.length) {
		const result = await IRIForTeachers.bulkWrite(iriBulkOps)
		console.log(result)
	}

	if (profilingBulkOps.length) {
		const result = await ProfilingForTeachers.bulkWrite(profilingBulkOps)
		console.log(result)
	}

	console.log('✅ IRI & Profiling for Teachers migrated')
	await mongoose.disconnect()
}

migrateIriForSchools().catch(console.error)
