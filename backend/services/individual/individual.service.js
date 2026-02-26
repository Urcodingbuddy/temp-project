const { mongoose } = require('mongoose')
const utils = require('../../utility/utils')
const { CommonHelperServices } = require('../common-services/common-helper-service')
const { IndividualRecord } = require('../../models/database/myPeegu-individual')
const { Students } = require('../../models/database/myPeegu-student')
const { FailureResponse, SuccessResponse } = require('../../models/response/globalResponse')
const { ALL_FIELDS } = require('../../utility/localConstants')
const { commonServices } = require('../common-services/common-services')
const { SchoolAcademicYears } = require('../../models/database/school-academic-years')

class IndividualService extends CommonHelperServices {
	/**
	 * Fetches Individualcase records for students based on filters like school, classroom, student status, and academic year.
	 * Supports pagination, sorting, and optional export formatting.
	 */
	async fetchIndividualCaseList(req, res) {
		try {
			// Step 1: Validate academic year(s) and pagination, return early if invalid
			const { error, page, PAGE_SIZE, downloadAndFilter, skip, emptyData, academicYears } =
				await this.validateAndGetAYsAndPaginationData(req)

			if (error) {
				return res.status(200).json(emptyData)
			}

			// Step 2: Extract filter body from request
			const filterBody = req.body.filter || {}

			// Step 3: Get all eligible students matching given filters
			const filteredStudents = await this.getFilteredStudentsMultiJourney({
				schoolIds: filterBody.schoolIds,
				classroomIds: filterBody.classroomIds,
				theStudentStatus: filterBody.studentStatus,
				academicYears,
				userAssignedSchools: req.user.assignedSchools,
				isAdmin: req.user.isAdmin,
				searchText: req.body.searchText,
			})

			// Step 4: Build $or query combinations for each student+class+year combination
			const queryCombinations = this.fetchQueryCombinations(filteredStudents)

			// Early return if no students found
			if (queryCombinations === null) {
				return res.json(
					downloadAndFilter
						? {}
						: {
								data: [],
								page,
								pageSize: PAGE_SIZE,
								totalCount: 0,
							},
				)
			}

			// Step 5: Sort options derived from request input and global constants
			let sortFields = globalConstants.individualRecordSortFields
			const sortOptions = utils.buildSortOptions(req.body, sortFields)

			// Step 6: Fetch records and total count in parallel
			const filter = queryCombinations
			const [records, totalCount] = await Promise.all([
				IndividualRecord.find(filter).sort(sortOptions).skip(skip).limit(PAGE_SIZE),
				IndividualRecord.countDocuments(filter),
			])

			// Step 7: Enrich records with extra fields
			let transformedRecords = await this.transformDataRecordsWithAcademicFeilds(records)

			// Step 8: If downloadAndFilter is true, map keys to export-friendly format
			if (downloadAndFilter) {
				try {
					transformedRecords = transformedRecords.map((item) =>
						utils.individualCaseDataFormation(item, true),
					)
				} catch (err) {
					console.error('Download filter transformation error:', err)
					return res.status(500).json({ error: 'Internal Server Error' })
				}
			}
			// Step 9: Return response
			return res.json(
				downloadAndFilter
					? transformedRecords
					: {
							data: transformedRecords,
							page,
							pageSize: PAGE_SIZE,
							totalCount,
						},
			)
		} catch (err) {
			console.error('Fetch Observations Error:', err)
			return res.status(500).json({ error: 'Internal Server Error' })
		}
	}

	async fetchIndividualCaseDetails(req, res) {
		const { id } = req.params
		req.body['id'] = id
		const { error, message, statusCode } = await this.validateStudentDataAndUser(
			req,
			IndividualRecord,
			ALL_FIELDS.INDIVIDUAL_CASE,
		)
		if (error) {
			return res.status(statusCode).json(message)
		}
		return commonServices.fetchStudentInitData(req, res, IndividualRecord)
	}

	async createIndividualCase(req, res) {
		const { error, message, school, SAY, academicYear } =
			await this.validateUserSchoolAndAY(req)
		if (error) {
			return res.status(400).json(new FailureResponse(message))
		}

		const { isIndividualCase, selectedStudents, individualCaseData } = req.body
		const validateDate = utils.isDateWithinRange(
			individualCaseData.date,
			SAY.startDate,
			SAY.endDate,
		)
		if (!validateDate) {
			return res
				.status(400)
				.json(
					new FailureResponse(
						globalConstants.messages.dateShouldBeBetweenStartEndDateOfAY.replaceField(
							`${ALL_FIELDS.INDIVIDUAL_CASE} ${ALL_FIELDS.DATE}`,
						),
					),
				)
		}

		if (isIndividualCase) {
			if (
				!utils.isAValidString(individualCaseData['user_id']) ||
				!utils.isAValidString(individualCaseData['studentName'])
			) {
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.missingParameters))
			}

			const student = await Students.findOne({
				user_id: individualCaseData['user_id'],
				school: school._id,
				status: globalConstants.studentStatus.Active,
				graduated: false,
				exited: false,
			})

			if (!student) {
				return res
					.status(404)
					.json(
						new FailureResponse(
							globalConstants.messages.fieldNotFound.replaceField(ALL_FIELDS.STUDENT),
						),
					)
			}

			const validateStudentInAY = this.validateStudentAndAcademicYearInJourney(
				student,
				academicYear._id,
			)
			if (!validateStudentInAY) {
				return res
					.status(404)
					.json(
						new FailureResponse(
							globalConstants.messages.fieldNotFoundInSelectedAY.replaceField(
								ALL_FIELDS.STUDENT,
							),
						),
					)
			}

			// const individualRecord = await IndividualRecord.findOne({
			// 	studentId: student._id,
			// 	classRoomId: student.classRoomId,
			// 	graduated: { $ne: true },
			// 	exited: { $ne: true },
			// })

			// if (individualRecord) {
			// 	return res
			// 		.status(400)
			// 		.json(new FailureResponse(globalConstants.messages.alreadyExists))
			// }

			const dataToInsert = {
				...individualCaseData,
				studentId: student._id,
				school: school._id,
				classRoomId: validateStudentInAY.classRoomId,
				SAY: SAY._id,
				academicYear: academicYear._id,
			}
			await IndividualRecord.create(dataToInsert)
			return res.json(new SuccessResponse(globalConstants.messages.individualCaseCreated))
		}

		if (!selectedStudents.length > 0) {
			return res.status(400).json(new FailureResponse('No students Selected'))
		}

		const students = await Students.find({
			_id: { $in: selectedStudents },
			status: globalConstants.studentStatus.Active,
			graduated: false,
			exited: false,
		})

		if (!students || students.length !== [...new Set(selectedStudents)].length) {
			return res
				.status(404)
				.json(
					new FailureResponse(
						globalConstants.messages.fieldNotFoundInSelectedAY.replaceField(
							ALL_FIELDS.STUDENT,
						),
					),
				)
		}

		const isAllStudentsValidInSelectedAY = students.every((stObj) => {
			const validateStudentInAY = this.validateStudentAndAcademicYearInJourney(
				stObj,
				academicYear._id,
			)

			return !validateStudentInAY ? false : true
		})
		if (!isAllStudentsValidInSelectedAY) {
			return res
				.status(404)
				.json(
					new FailureResponse(
						globalConstants.messages.fieldNotFoundInSelectedAY.replaceField(
							ALL_FIELDS.STUDENT,
						),
					),
				)
		}

		// const individualRecord = await IndividualRecord.findOne({
		// 	studentId: { $in: selectedStudents },
		// 	classRoomId: { $in: studentClassroomsIds },
		// 	graduated: { $ne: true },
		// 	exited: { $ne: true },
		// })

		// if (individualRecord) {
		// 	return res.status(400).json(new FailureResponse(globalConstants.messages.alreadyExists))
		// }

		const recordsToInsert = students.map((stdnt) => {
			const data = {
				...individualCaseData,
				studentName: stdnt.studentName,
				user_id: stdnt.user_id,
				studentId: stdnt._id,
				classRoomId: stdnt.classRoomId,
				school: school._id,
				SAY: SAY._id,
				academicYear: academicYear._id,
			}
			return data
		})

		await IndividualRecord.insertMany(recordsToInsert)
		return res.json(new SuccessResponse(globalConstants.messages.individualCaseCreated))
	}

	async updateIndividualCase(req, res) {
		const body = req.body || {}

		const {
			error,
			message,
			statusCode,
			record: individualRecord,
		} = await this.validateStudentDataAndUser(req, IndividualRecord, ALL_FIELDS.INDIVIDUAL_CASE)
		if (error) {
			return res.status(statusCode).json(message)
		}

		const SAY = await SchoolAcademicYears.findOne({
			academicYear: individualRecord.academicYear,
			school: individualRecord.school,
		})

		const validateDate = utils.isDateWithinRange(body.date, SAY.startDate, SAY.endDate)
		if (!validateDate) {
			return res
				.status(400)
				.json(
					new FailureResponse(
						globalConstants.messages.dateShouldBeBetweenStartEndDateOfAY.replaceField(
							`${ALL_FIELDS.INDIVIDUAL_CASE} ${ALL_FIELDS.DATE}`,
						),
					),
				)
		}

		const { outcome, basedOn, stype, dimension } = globalConstants.individualMisc
		//enum validations
		individualRecord.outcome = outcome.includes(body.outcome)
			? body.outcome
			: individualRecord.outcome
		individualRecord.basedOn = basedOn.includes(body.basedOn)
			? body.basedOn
			: individualRecord.basedOn
		individualRecord.stype = stype.includes(body.stype) ? body.stype : individualRecord.stype
		individualRecord.dimension = dimension.includes(body.dimension)
			? body.dimension
			: individualRecord.dimension
		individualRecord.date = utils.isValidDate(body.date) ? body.date : individualRecord.date
		individualRecord.issues = body.issues ?? individualRecord.issues
		individualRecord.startTime = body.startTime ?? individualRecord.startTime
		individualRecord.endTime = body.endTime ?? individualRecord.endTime
		individualRecord.goals = body.goals ?? individualRecord.goals
		individualRecord.activity = body.activity ?? individualRecord.activity
		individualRecord.description = body.description ?? individualRecord.description
		individualRecord.purpose = body.purpose ?? individualRecord.purpose
		individualRecord.improvements = body.improvements ?? individualRecord.improvements
		individualRecord.comments = body.comments ?? individualRecord.comments
		individualRecord.tasksAssigned = body.tasksAssigned ?? individualRecord.tasksAssigned
		individualRecord.poa = body.poa ?? individualRecord.poa

		await individualRecord.save()
		return res.json(new SuccessResponse(globalConstants.messages.individualCaseUpdated))
	}

	async deleteIndividualCaseRecord(req, res) {
		return this.deleteSingleRecord(req, res, IndividualRecord, ALL_FIELDS.INDIVIDUAL_CASE)
	}

	async deleteMultipleIndividualCases(req, res) {
		return this.deleteMultipleRecords(req, res, IndividualRecord, ALL_FIELDS.INDIVIDUAL_CASE)
	}
}

const individualService = new IndividualService()
module.exports.individualService = individualService
