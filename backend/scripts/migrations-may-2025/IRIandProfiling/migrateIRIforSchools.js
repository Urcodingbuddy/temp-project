const mongoose = require('mongoose')
const { MONGODB_URI } = require('../migrations-utils')
const { IRIForSchools } = require('../../../models/database/IRI-for-schools')
const SchoolTeacher = require('../../../models/database/School-Teacher')
const { SchoolAcademicYears } = require('../../../models/database/school-academic-years')
const { AcademicYears } = require('../../../models/database/academic-years')

async function migrateIriForSchools() {
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to DB')

	const schoolteachers = await SchoolTeacher.find()
	const SAYs = await SchoolAcademicYears.find({})
	const allAcademicYears = await AcademicYears.find({})
	console.log(`Found ${schoolteachers.length} school teacher entries`)

	const stIds = []
	for (const st of schoolteachers) {
		const IRIStartDateForSchool = st.IRIStartDateForSchool
		if (!IRIStartDateForSchool) {
			stIds.push(`ObjectId('${st._id}')`)
			continue
		}
		const year =
			IRIStartDateForSchool.getMonth() + 1 >= 5
				? IRIStartDateForSchool.getFullYear()
				: IRIStartDateForSchool.getFullYear() - 1

		const academicYearString = `${year}-${year + 1}`
		const academicYear = allAcademicYears.find((obj) => obj.academicYear === academicYearString)

		console.log('Academic Year: ', academicYear)
		const SAY = SAYs.find(
			(obj) =>
				obj.school.toString() === st.schoolId.toString() &&
				obj.academicYear.toString() === academicYear._id.toString(),
		)

		const iriSchool = new IRIForSchools({
			school: st.schoolId,
			academicYear: academicYear._id,
			SAY: SAY._id,

			totalTeacherCount: st.totalTeacherCount,
			submittedTeacherCount: st.totalSubmittedTeacherCount,
			pendingTeacherCount: st.totalPendingTeacherCount,

			isScheduled: st.isIRIDatesScheduled,
			startDate: st.IRIStartDateForSchool,
			endDate: st.IRIEndDateForSchool,
			IRIStatus: st.timeSpanStatusForSchool,
		})
		iriSchool.createdAt = IRIStartDateForSchool
		iriSchool.updatedAt = IRIStartDateForSchool
		await iriSchool.save()
	}
	console.log(stIds)

	console.log('✅ IRI for schools migrated')
	await mongoose.disconnect()
}

migrateIriForSchools().catch(console.error)
