const { createNewAcademicYearScheduler } = require('./createAYScheduler')
const { createSAYAndClassroomsScheduler } = require('./createSAYandClassroomScheduler')
const {
	updateScIRIStatusScheduler,
	updateScProfilingStatusScheduler,
} = require('./profilingAndIRISchedulers')

module.exports.startScheduler = function () {
	console.log('Schedulers are started...')

	updateScProfilingStatusScheduler.start()
	updateScIRIStatusScheduler.start()
	createNewAcademicYearScheduler.start()
	createSAYAndClassroomsScheduler.start()
}
