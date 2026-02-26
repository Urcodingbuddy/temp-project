const mongoose = require('mongoose')
const { MONGODB_URI } = require('../migrations-utils')
const { Teacher } = require('../../../models/database/myPeegu-teacher')

async function migrateProfilingForTeachers() {
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to DB')

	
    const keysToRemove = [
		'isIRIRatingDeleted',
		'isProfilingRatingDeleted',
		'teacherIRIReport',
		'IRISubDate',
		'isIRIFormSubmitted',
		'formStatusOnIRISubDate',
		'IRIStartDateForSchool',
		'IRIEndDateForSchool',
		'timeSpanStatusForSchool',
		'classRoomIds',
		'finalScore',
		'perspectiveNP',
		'fantasyNP',
		'empathicNP',
		'personalDistressNP',
		'isProfilingFormSubmitted',
		'ProfilingSubDate',
		'ProfilingStartDateForSchool',
		'ProfilingEndDateForSchool',
		'formStatusOnProfilingSubDate',
		'teacherAttitude',
		'teacherPractices',
		'teacherJobLifeSatisfaction',
		'teacherDominance',
		'teacherInfluence',
		'teacherSteadiness',
		'teacherCompliance',
		'isDISCSelected',
		'isTeachingPracticesSelected',
		'isJobLifeSatisfactionSelected',
		'isTeachingAttitudeSelected',
		'teacherAttitudeReport',
		'teacherPracticeReport',
		'teacherJobLifeSatisfactionReport',
		'teacherDISCReport',
	]

	const updateObj = {}
	keysToRemove.forEach((key) => {
		updateObj[key] = ''
	})

    console.log(updateObj)

	const updated = await Teacher.updateMany({}, { $unset: updateObj })
    console.log(updated)

	console.log('✅ Teacher additional details of iri and profilings.')
	await mongoose.disconnect()
}

migrateProfilingForTeachers().catch(console.error)
