// Run the IRI for schools migrations before this ---- "migrateProfilingForSchools.js"
const mongoose = require('mongoose')
const { MONGODB_URI } = require('../migrations-utils')
const { Teacher } = require('../../../models/database/myPeegu-teacher')
const { ProfilingForTeachers } = require('../../../models/database/profiling-for-teachers')
const { ProfilingForSchools } = require('../../../models/database/profiling-for-shools')

async function migrateProfilingForTeachers() {
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to DB')

	const allSchoolProfilings = await ProfilingForSchools.find({}).lean()

	const getProfilingSchoolId = (schoolId) =>
		allSchoolProfilings.find((p) => p.school?.toString() === schoolId?.toString())

	const teachers = await Teacher.find({})
	const teacherIds = []
	let count = 0
	for (const teacher of teachers) {
		const profilingForSchool = getProfilingSchoolId(teacher.SchoolId)

		if (!profilingForSchool) {
			console.warn(`Skipping teacher ${teacher._id} - no matching profilingForSchool`)
			teacherIds.push(`ObjectId('${teacher._id}')`)
			continue
		}

		const profileaForTeacher = new ProfilingForTeachers({
			teacher: teacher._id,
			schoolProfilingId: profilingForSchool._id,

			formStatus: teacher.formStatusOnProfilingSubDate,
			submissionDate: teacher.ProfilingSubDate,

			isDISCSelected: teacher.isDISCSelected,
			isTeachingPracticesSelected: teacher.isTeachingPracticesSelected,
			isJobLifeSatisfactionSelected: teacher.isJobLifeSatisfactionSelected,
			isTeachingAttitudeSelected: teacher.isTeachingAttitudeSelected,

			teacherAttitude: teacher.teacherAttitude,
			teacherPractices: teacher.teacherPractices,
			teacherJobLifeSatisfaction: teacher.teacherJobLifeSatisfaction,
			teacherDominance: teacher.teacherDominance,
			teacherInfluence: teacher.teacherInfluence,
			teacherSteadiness: teacher.teacherSteadiness,
			teacherCompliance: teacher.teacherCompliance,

			teacherAttitudeReport: teacher.teacherAttitudeReport,
			teacherPracticeReport: teacher.teacherPracticeReport,
			teacherJobLifeSatisfactionReport: teacher.teacherJobLifeSatisfactionReport,
			teacherDISCReport: teacher.teacherDISCReport,
			SAY: profilingForSchool.SAY,
			academicYear: profilingForSchool.academicYear,
		})
		profileaForTeacher.createdAt = profilingForSchool.createdAt
		profileaForTeacher.updatedAt = profilingForSchool.createdAt
		await profileaForTeacher.save()
		count++
	}

	console.log(count)
	console.log(teacherIds)
	console.log('✅ Profiling for teachers migrated')
	await mongoose.disconnect()
}

migrateProfilingForTeachers().catch(console.error)
