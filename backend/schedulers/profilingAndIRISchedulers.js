const cron = require('node-cron')
const moment = require('moment')
const { ProfilingForSchools } = require('../models/database/profiling-for-shools')
const { STATUSES } = require('../utility/localConstants')
const { IRIForSchools } = require('../models/database/IRI-for-schools')

const updateScProfilingStatusScheduler = cron.schedule('15 0 * * *', async () => {
	console.log('📩 1111 Sending daily report at', new Date())

	const activeSchoolProfilings = await ProfilingForSchools.find({
		profilingStatus: STATUSES.ACTIVE,
	})
	const curDate = moment(new Date())

	const bulkOps = []
	for (const profiling of activeSchoolProfilings) {
		const endDate = moment(profiling.endDate)

		if (endDate.isBefore(curDate, 'day')) {
			bulkOps.push({
				updateOne: {
					filter: { _id: profiling._id },
					update: { $set: { profilingStatus: STATUSES.IN_ACTIVE } },
				},
			})
		}
	}

	if (bulkOps.length) {
		const result = await ProfilingForSchools.bulkWrite(bulkOps)
		console.log('Updated School Profilings: ', result)
	}
})

const updateScIRIStatusScheduler = cron.schedule('15 0 * * *', async () => {
	console.log('📩 2222 Sending daily report at', new Date())

	const activeSchoolIRIs = await IRIForSchools.find({
		IRIStatus: STATUSES.ACTIVE,
	})
	const curDate = moment(new Date())

	const bulkOps = []
	for (const iri of activeSchoolIRIs) {
		const endDate = moment(iri.endDate)

		if (endDate.isBefore(curDate, 'day')) {
			bulkOps.push({
				updateOne: {
					filter: { _id: iri._id },
					update: { $set: { IRIStatus: STATUSES.IN_ACTIVE } },
				},
			})
		}
	}

	if (bulkOps.length) {
		const result = await IRIForSchools.bulkWrite(bulkOps)
		console.log('Updated School IRIs: ', result)
	}
})

module.exports = {
	updateScProfilingStatusScheduler,
	updateScIRIStatusScheduler
}
