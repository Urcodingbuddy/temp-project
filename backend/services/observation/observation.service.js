const { mongoose } = require('mongoose')
const utils = require('../../utility/utils')
const { CommonHelperServices } = require('../common-services/common-helper-service')
const { keyMappingForObservationRecord, studentStatus } = require('../../utility/constants')
const { ObservationRecord } = require('../../models/database/myPeegu-observation')
const { Students } = require('../../models/database/myPeegu-student')
const { ALL_FIELDS } = require('../../utility/localConstants')
const { Classrooms } = require('../../models/database/myPeegu-classroom')
const { FailureResponse, SuccessResponse } = require('../../models/response/globalResponse')
const { commonServices } = require('../common-services/common-services')
const { cacheService } = require('../../cache/cashe.service')
const { SchoolAcademicYears } = require('../../models/database/school-academic-years')

class ObservationServices extends CommonHelperServices {
	/**
	 * Fetches observation records for students based on filters like school, classroom, student status, and academic year.
	 * Supports pagination, sorting, and optional export formatting.
	 */
	async fetchObservationsList(req, res) {
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
			const sortFields = globalConstants.observationRecordSortFields
			const sortOptions = utils.buildSortOptions(req.body, sortFields)

			// Step 6: Fetch records and total count in parallel
			const filter = queryCombinations

			const [records, totalCount] = await Promise.all([
				ObservationRecord.find(filter).sort(sortOptions).skip(skip).limit(PAGE_SIZE),

				ObservationRecord.countDocuments(filter),
			])

			// Step 7: Enrich records with extra fields
			let transformedRecords = await this.transformDataRecordsWithAcademicFeilds(records)

			// Step 8: If downloadAndFilter is true, map keys to export-friendly format
			if (downloadAndFilter) {
				try {
					transformedRecords = transformedRecords.map((obj) => {
						const newObj = {}
						for (const key in obj) {
							if (keyMappingForObservationRecord[key]) {
								newObj[keyMappingForObservationRecord[key]] =
									key === 'doo'
										? utils.formatToIndianTimeZone(obj[key])
										: obj[key]
							} else {
								newObj[key] = obj[key]
							}
						}
						return newObj
					})
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

	async fetchObservationDetails(req, res) {
		const { id } = req.params
		req.body['id'] = id
		const { error, message, statusCode } = await this.validateStudentDataAndUser(
			req,
			ObservationRecord,
			ALL_FIELDS.OBSERVATION,
		)
		if (error) {
			return res.status(statusCode).json(message)
		}
		return commonServices.fetchStudentInitData(req, res, ObservationRecord)
	}

	async createObservationRecord(req, res) {
		const body = req.body
		const { error, message, school, SAY, academicYear } =
			await this.validateUserSchoolAndAY(req)
		if (error) {
			return res.status(400).json(new FailureResponse(message))
		}

		const data = body.studentData
		if (!utils.isAValidString(data['user_id']) || !utils.isAValidString(data['studentName'])) {
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.missingParameters))
		}

		const validateDate = utils.isDateWithinRange(data.doo, SAY.startDate, SAY.endDate)
		if (!validateDate) {
			return res
				.status(400)
				.json(
					new FailureResponse(
						globalConstants.messages.dateShouldBeBetweenStartEndDateOfAY.replaceField(
							`${ALL_FIELDS.OBSERVATION} ${ALL_FIELDS.DATE}`,
						),
					),
				)
		}

		const student = await Students.findOne({
			user_id: data['user_id'],
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

		const dataToCreate = {
			...data,
			studentId: student._id,
			school: school._id,
			classRoomId: validateStudentInAY.classRoomId,
			SAY: SAY._id,
			academicYear: academicYear._id,
		}

		await ObservationRecord.create(dataToCreate)
		return res.json(new SuccessResponse(globalConstants.messages.observationCreated))
	}

	async updateObservationRecord(req, res) {
		const body = req.body || {}

		const {
			error,
			message,
			statusCode,
			record: observationRecord,
		} = await this.validateStudentDataAndUser(req, ObservationRecord, ALL_FIELDS.OBSERVATION)
		if (error) {
			return res.status(statusCode).json(message)
		}

		const SAY = await SchoolAcademicYears.findOne({
			academicYear: observationRecord.academicYear,
			school: observationRecord.school,
		})

		const validateDate = utils.isDateWithinRange(body.doo, SAY.startDate, SAY.endDate)
		if (!validateDate) {
			return res
				.status(400)
				.json(
					new FailureResponse(
						globalConstants.messages.dateShouldBeBetweenStartEndDateOfAY.replaceField(
							`${ALL_FIELDS.OBSERVATION} ${ALL_FIELDS.DATE}`,
						),
					),
				)
		}

		observationRecord.doo = utils.isValidDate(body.doo) ? body.doo : observationRecord.doo
		observationRecord.duration = utils.isAValidString(body.duration)
			? body.duration
			: observationRecord.duration

		globalConstants.observationRecordValidateKeys.forEach((key) => {
			observationRecord[key] = globalConstants.observationMisc.status.includes(
				body[key]?.status,
			)
				? body[key]
				: observationRecord[key]
		})

		await observationRecord.save()
		return res.json(new SuccessResponse(globalConstants.messages.observationUpdated))
	}

	async deleteObservationRecord(req, res) {
		return this.deleteSingleRecord(req, res, ObservationRecord, ALL_FIELDS.OBSERVATION)
	}

	async deleteMultipleObservations(req, res) {
		return this.deleteMultipleRecords(req, res, ObservationRecord, ALL_FIELDS.OBSERVATION)
	}
}

const observationServices = new ObservationServices()
module.exports.observationServices = observationServices
