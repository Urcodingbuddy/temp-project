const { SchoolsCommonService } = require('./schools.common.service')
const { SchoolAcademicYears } = require('../../models/database/school-academic-years')
const { ALL_FIELDS } = require('../../utility/localConstants')
const { FailureResponse } = require('../../models/response/globalResponse')

class SchoolAcYrService extends SchoolsCommonService {
	async fetchSchoolAcademicYears(req, res) {
		const schoolId = req.params.school_id
		const schoolAcademicYears =
			(await SchoolAcademicYears.find({ isDeleted: false, school: schoolId })
				.select('_id academicYear startDate endDate status') // fields from main document
				.populate({
					path: 'academicYear',
					select: 'academicYear', // fields from the populated academicYear document
				})
				.sort({ academicYear: -1 })
				.lean()
				.exec()) ?? []
		const academicYears = schoolAcademicYears.map((acYr) => ({ ...acYr, academicYear: acYr.academicYear.academicYear }))
		return res.json(academicYears)
	}

	async viewSchoolAcademicYear(req, res) {
		const schoolId = req.params.school_id
		const schoolAcademicYear = await SchoolAcademicYears.findOne({ isDeleted: false, school: schoolId, currentAcYear: true })
			.select('_id academicYear startDate endDate status')
			.populate({
				path: 'academicYear',
				select: 'academicYear _id', // fields from the populated academicYear document
			})
			.lean()
			.exec()
		if (!schoolAcademicYear) {
			return res.status(400).json(new FailureResponse(globalConstants.messages.invalidField.replaceField(ALL_FIELDS.SCHOOL_ACADEMIC_YEAR)))
		}

		return res.json(schoolAcademicYear)
	}

	async updateSchoolAcademicYears(req, res) {
		const scAcYrId = req.params.id
		const body = req.body
		const schoolAcademicYear = await SchoolAcademicYears.findOne({ _id: scAcYrId })
		if (!schoolAcademicYear) {
			return res.status(400).json(new FailureResponse(globalConstants.messages.invalidField.replaceField(ALL_FIELDS.SCHOOL_ACADEMIC_YEAR)))
		}

		const updateData = {
			startDate: new Date(body.startDate),
			endDate: new Date(body.endDate),
		}

		const updated = await SchoolAcademicYears.findByIdAndUpdate(scAcYrId, updateData, { new: true })

		return res.json(updated)
	}
}

const schoolAcYrService = new SchoolAcYrService()
module.exports.schoolAcYrService = schoolAcYrService
