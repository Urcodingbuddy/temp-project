const mongoose = require('mongoose')
const { MONGODB_URI } = require('../migrations-utils')
const { ProfilingForSchools } = require('../../../models/database/profiling-for-shools')
const SchoolTeacher = require('../../../models/database/School-Teacher')
const { SchoolAcademicYears } = require('../../../models/database/school-academic-years')
const { AcademicYears } = require('../../../models/database/academic-years')

async function migrateProfilingForSchools() {
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to DB')

	const schoolteachers = await SchoolTeacher.find()
	const SAYs = await SchoolAcademicYears.find({})
	const allAcademicYears = await AcademicYears.find({})
	console.log(`Found ${schoolteachers.length} school teacher entries`)

	let count = 1
	const stIds = []
	for (const st of schoolteachers) {
		const ProfilingStartDateForSchool = st.ProfilingStartDateForSchool
		console.log(ProfilingStartDateForSchool)
		console.log(st.schoolName)
		if (!ProfilingStartDateForSchool) {
			stIds.push(`ObjectId('${st._id}')`)
			continue
		}
		const year =
			ProfilingStartDateForSchool.getMonth() + 1 >= 5
				? ProfilingStartDateForSchool.getFullYear()
				: ProfilingStartDateForSchool.getFullYear() - 1

		const academicYearString = `${year}-${year + 1}`
		const academicYear = allAcademicYears.find((obj) => obj.academicYear === academicYearString)

		// console.log('Academic Year: ', academicYear)
		const SAY = SAYs.find(
			(obj) =>
				obj.school.toString() === st.schoolId.toString() &&
				obj.academicYear.toString() === academicYear._id.toString(),
		)
		console.log(count++, SAY?._id)
		if (!SAY?._id) { // Chamrajpet school is not available
			stIds.push(`ObjectId('${st._id}')`)
			continue
		}
		const profilingSchool = new ProfilingForSchools({
			school: st.schoolId,
			academicYear: academicYear._id,
			SAY: SAY._id,

			totalTeacherCount: st.totalTeacherCount,
			submittedTeacherCount: st.totalSubmittedTeacherCountForProfiling,
			pendingTeacherCount: st.totalPendingTeacherCountForProfiling,

			isScheduled: st.isProfilingDatesScheduled,
			startDate: st.ProfilingStartDateForSchool,
			endDate: st.ProfilingEndDateForSchool,
			profilingStatus: st.timeSpanProfilingStatusForSchool,

			isDISCSelected: st.isDISCSelected,
			isTeachingPracticesSelected: st.isTeachingPracticesSelected,
			isJobLifeSatisfactionSelected: st.isJobLifeSatisfactionSelected,
			isTeachingAttitudeSelected: st.isTeachingAttitudeSelected,
		})

		profilingSchool.createdAt = ProfilingStartDateForSchool
		profilingSchool.updatedAt = ProfilingStartDateForSchool
		await profilingSchool.save()
	}

	console.log(stIds)

	console.log('✅ Profiling for schools migrated')
	await mongoose.disconnect()
}

migrateProfilingForSchools().catch(console.error)
