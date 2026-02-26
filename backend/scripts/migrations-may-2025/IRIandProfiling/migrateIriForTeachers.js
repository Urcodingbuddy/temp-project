// Run the IRI for schools migrations before this ---- "migrateIRIForSchools.js"
const mongoose = require('mongoose')

const { MONGODB_URI } = require('../migrations-utils')
const { IRIForSchools } = require('../../../models/database/IRI-for-schools')
const { Teacher } = require('../../../models/database/myPeegu-teacher')
const { IRIForTeachers } = require('../../../models/database/IRI-for-teachers')

async function migrateIriForTeachers() {
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to DB')

	const allSchoolIris = await IRIForSchools.find().lean()
	const getIriSchoolId = (schoolId) =>
		allSchoolIris.find((p) => p.school?.toString() === schoolId?.toString())

	const teacherIds = []
	let count = 0
	const teachers = await Teacher.find({})
	for (const teacher of teachers) {
		const IRIForSchool = getIriSchoolId(teacher.SchoolId)

		if (!IRIForSchool) {
			console.warn(`Skipping teacher ${teacher._id} - no matching IRIForSchool`)
			teacherIds.push(`ObjectId('${teacher._id}')`)
			continue
		}

		const IRIForTeacher = new IRIForTeachers({
			teacher: teacher._id,
			schoolIRIId: IRIForSchool._id,
			formStatus: teacher.formStatusOnIRISubDate,
			submissionDate: teacher.IRISubDate,
			teacherIRIReport: teacher.teacherIRIReport,
			SAY: IRIForSchool.SAY,
			academicYear: IRIForSchool.academicYear,
			finalScore: teacher.finalScore,
			perspectiveNP: teacher.perspectiveNP,
			fantasyNP: teacher.fantasyNP,
			empathicNP: teacher.empathicNP,
			personalDistressNP: teacher.personalDistressNP,
		})
		IRIForTeacher.createdAt = IRIForSchool.createdAt
		IRIForTeacher.updatedAt = IRIForSchool.createdAt
		await IRIForTeacher.save()
		count++
	}

	console.log(count)
	console.log(teacherIds)
	console.log('✅ IRI for teachers migrated')
	await mongoose.disconnect()
}

migrateIriForTeachers().catch(console.error)
