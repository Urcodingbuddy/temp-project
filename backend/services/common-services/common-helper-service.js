const { ObservationRecord } = require('../../models/database/myPeegu-observation')
const { IndividualRecord } = require('../../models/database/myPeegu-individual')
const { BaselineRecord } = require('../../models/database/myPeegu-baseline')
const { EducationPlanner } = require('../../models/database/myPeegu-studentPlanner')
const { StudentCheckList } = require('../../models/database/myPeegu-sendCheckList')
const { COPEAssessment } = require('../../models/database/myPeegu-studentCOPEAssessment')
const { WellBeingAssessment } = require('../../models/database/myPeegu-StudentWellBeing')
const { ACTIONS } = require('../../utility/localConstants')
const { SuccessResponse, FailureResponse } = require('../../models/response/globalResponse')
const { GlobalServices } = require('../global-service')
const { isAValidArray } = require('../../utility/utils')

class CommonHelperServices extends GlobalServices {
	builQueryForStudentData(query, sortOptions, param, skip, limit) {
		const bQuery = [
			{
				$match: query,
			},
			{ $skip: skip },
			{ $limit: limit },
			{
				$lookup: {
					from: 'academic-years',
					localField: 'academicYear',
					foreignField: '_id',
					as: 'academicYearData',
				},
			},
			{
				$unwind: {
					path: '$academicYearData',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$addFields: {
					academicYear: '$academicYearData.academicYear',
					academicYearId: '$academicYearData._id',
				},
			},
		]

		const projectFields = {
			__v: 0,
			studentData: 0,
			academicYearData: 0,
			schoolData: 0,
			classroomData: 0,
			section: 0,
			createdAt: 0,
			updatedAt: 0,
		}

		if (param) {
			bQuery.push(
				...[
					{
						$lookup: {
							from: 'schools',
							localField: 'school',
							foreignField: '_id',
							as: 'schoolData',
						},
					},
					{
						$unwind: '$schoolData',
					},
					{
						$addFields: {
							schoolName: '$schoolData.school',
						},
					},
					{
						$lookup: {
							from: 'classrooms',
							localField: 'classRoomId',
							foreignField: '_id',
							as: 'classroomData',
						},
					},
					{
						$unwind: '$classroomData',
					},
					{
						$addFields: {
							className: '$classroomData.className',
							section: '$classroomData.section',
						},
					},
				],
			)
		} else {
			projectFields.school = 0
		}

		if (sortOptions) {
			bQuery.push({ $sort: sortOptions })
		}

		bQuery.push({
			$project: projectFields,
		})
		return bQuery
	}

	async deleteMultipleRecords(req, res, Model, field) {
		const { recordIds } = req.body

		const userSchools = await this.getUserSchools(req)
		if (userSchools && userSchools.length === 0) {
			return res
				.status(404)
				.json(new FailureResponse(globalConstants.messages.schoolNotAssigned))
		}

		const records = await Model.find({ _id: recordIds }, { _id: 1, school: 1 }).lean()
		if (records.length === 0) {
			return res
				.status(404)
				.json(
					new FailureResponse(
						globalConstants.messages.fieldNotFound.replaceField(`${field} records`),
					),
				)
		}

		const userSchoolIds = userSchools.map((id) => id.toString())
		const unauthorizedSchool = records.find(
			({ school }) => !userSchoolIds.includes(school?.toString()),
		)
		if (unauthorizedSchool) {
			return res.status(403).json(new FailureResponse(globalConstants.messages.notAuthorised))
		}

		const result = await Model.deleteMany({ _id: { $in: recordIds } })
		return res.json(
			new SuccessResponse(`${result.deletedCount} ${field} records deleted successfully.`),
		)
	}

	async deleteSingleRecord(req, res, Model, field) {
		const { error, message, statusCode } = await this.validateStudentDataAndUser(
			req,
			Model,
			field,
		)
		if (error) {
			return res.status(statusCode).json(message)
		}

		await Model.findByIdAndDelete(req.body.id)
		return res.json(new SuccessResponse(`${field} record deleted successfully.`))
	}

	async validateStudentDataAndUser(req, Model, field) {
		try {
			let data = {
				error: false,
				message: '',
				statusCode: 200,
			}

			const userSchools = await this.getUserSchools(req)
			if (userSchools && userSchools.length === 0) {
				data = {
					error: true,
					message: globalConstants.messages.schoolNotAssigned,
					statusCode: 404,
				}
				return data
			}

			const record = await Model.findOne({ _id: req.body.id })
			if (!record) {
				data = {
					error: true,
					message: globalConstants.messages.fieldNotFound.replaceField(field),
					statusCode: 404,
				}
				return data
			}

			const userSchoolIds = userSchools.map((id) => id.toString())
			const unauthorizedSchool =
				!record.school || !userSchoolIds.includes(record.school?.toString())
			if (!req.user.isAdmin && unauthorizedSchool) {
				data = {
					error: true,
					message: globalConstants.messages.notAuthorised,
					statusCode: 403,
				}
			}
			return { ...data, record: record }
		} catch (error) {
			return {
				error: false,
				message: error.message,
				statusCode: error.status,
			}
		}
	}

	/**
	 * This function will check if students journey contains the academic year of selected academic year for adding student data
	 * In not found return false means validation failed. If journey is available it will return journey
	 * @param {*} student
	 * @param {*} academicYear
	 * @returns {*} false or latest journey of that academic year
	 */
	validateStudentAndAcademicYearInJourney(student, academicYear) {
		if (!isAValidArray(student.studentsJourney)) {
			return false
		}

		const journeys =
			student.studentsJourney.filter(
				(obj) => obj.academicYear.toString() === academicYear.toString(),
			) ?? []

		if (journeys.length === 0) {
			return false
		}

		const latestJourneyByYear = journeys.sort(
			(a, b) => new Date(b.dateTime) - new Date(a.dateTime),
		)

		return latestJourneyByYear[0]
	}
}

module.exports.CommonHelperServices = CommonHelperServices
