const { globalServices } = require('../global-service')
const { mongoose } = require('mongoose')
const utils = require('../../utility/utils')
const { CommonHelperServices } = require('../common-services/common-helper-service')
const { studentStatus } = require('../../utility/constants')
const { Teacher } = require('../../models/database/myPeegu-teacher')
const { BaselineRecord } = require('../../models/database/myPeegu-baseline')
const { FailureResponse, SuccessResponse } = require('../../models/response/globalResponse')
const { Students } = require('../../models/database/myPeegu-student')
const { Classrooms } = require('../../models/database/myPeegu-classroom')
const { ALL_FIELDS, BASELINE_CATEGORIES, STATUSES } = require('../../utility/localConstants')
const mongooseErrorHandler = require('../../utility/mongooseErrorHandler')

class BaselineService extends CommonHelperServices {
	/**
	 * Fetches Baseline records for students based on filters like school, classroom, student status, and academic year.
	 * Supports pagination, sorting, and optional export formatting.
	 */
	async fetchBaselineRecordsList(req, res) {
		try {
			// Step 1: Validate academic year(s) and pagination, return early if invalid
			const { error, page, PAGE_SIZE, downloadAndFilter, skip, emptyData, academicYears } =
				await this.validateAndGetAYsAndPaginationData(req)
			if (error) {
				return res.status(200).json(emptyData)
			}

			// Step 2: Extract filter body from request
			const filterBody = req.body.filter || {}

			// Step 2.1: If user is teacher and classroomIds are [] the filter for teacher assigned classrooms
			if (
				!utils.isAValidArray(filterBody.classroomIds) &&
				req.user.permissions[0] === globalConstants.teacher
			) {
				const teacher = await Teacher.findOne({ email: req.user.email, isDeleted: {$ne: true} })
				filterBody.classroomIds = teacher.classroomsJourney
					.filter((obj) => obj.isAssigned)
					.map((obj) => obj.classRoomId.toString())
			}

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
			let sortFields = [
				...globalConstants.baselineRecordSortFields,
				...globalConstants.baselineRecordBasicSortFields,
			]
			const sortOptions = utils.buildSortOptions(req.body, sortFields)

			// Step 6: Fetch records and total count in parallel
			const filter = queryCombinations
			const [records, totalCount] = await Promise.all([
				BaselineRecord.find(filter).sort(sortOptions).skip(skip).limit(PAGE_SIZE),
				BaselineRecord.countDocuments(filter),
			])

			// Step 7: Enrich records with extra fields
			let transformedRecords = await this.transformDataRecordsWithAcademicFeilds(records)

			// Step 8: If downloadAndFilter is true, map keys to export-friendly format
			if (downloadAndFilter) {
				try {
					transformedRecords = transformedRecords.map((item) =>
						utils.baselineDataFormation(item, true),
					)
				} catch (error) {
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

	async createBaselineRecord(req, res) {
		const body = req.body

		const { error, message, school, SAY, academicYear } =
			await this.validateUserSchoolAndAY(req)
		if (error) {
			return res.status(400).json(new FailureResponse(message))
		}

		const studentData = body.studentData
		const baselineCategory = studentData.baselineCategory

		if (!studentData['user_id'] || !studentData['studentName']) {
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.missingParameters))
		}

		const student = await Students.findOne({
			status: globalConstants.schoolStatus.Active,
			user_id: studentData.user_id,
			school,
		}).lean()

		let studentErrMsg = null
		if (!student) {
			studentErrMsg = globalConstants.messages.fieldNotFound.replaceField(ALL_FIELDS.STUDENT)
		} else if (student.graduated) {
			studentErrMsg = globalConstants.messages.alreadyGraduated
		} else if (student.exited) {
			studentErrMsg = globalConstants.messages.alreadyExited
		}

		if (studentErrMsg) {
			return res.status(404).json(new FailureResponse(studentErrMsg))
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

		const baselineData = await BaselineRecord.findOne({
			studentId: student._id,
			classRoomId: validateStudentInAY.classRoomId,
			baselineCategory,
			SAY: SAY._id,
		})

		// Ensure the record exists for the same classroom and baseline category
		if (baselineData) {
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.baseLineRecordAlreadyExist))
		}

		studentData.school = school
		studentData.studentId = student._id
		studentData.classRoomId = validateStudentInAY.classRoomId
		studentData.academicYear = academicYear._id
		studentData.SAY = SAY._id

		// validating whether all categories have proper studentData as schema format
		for (const key of globalConstants.baselineRecordSortFields.filter(
			(key) => key !== 'academicYear',
		)) {
			if (!Array.isArray(studentData[key]?.data)) {
				return res
					.status(400)
					.json(
						new FailureResponse(
							globalConstants.messages.invalidField.replaceField(key),
						),
					)
			}
			if ([undefined, null, ''].includes(studentData[key]?.total)) {
				return res
					.status(400)
					.json(
						new FailureResponse(
							globalConstants.messages.invalidField.replaceField(key),
						),
					)
			}
		}

		// All records passed validation, insert them into the IndividualRecord using insertMany
		BaselineRecord.create(studentData)
			.then(() => {
				return res
					.status(201)
					.json(new SuccessResponse(globalConstants.messages.baselineCreated))
			})
			.catch((error) => {
				const failureResponse = mongooseErrorHandler.handleError(error)
				return res.status(400).json(failureResponse)
			})
	}

	async uploadBaselineRecords(req, res) {
		const body = req.body.students || [{}]

		const { error, message, school, SAY, academicYear } =
			await this.validateUserSchoolAndAY(req)
		if (error) {
			return res.status(400).json(new FailureResponse(message))
		}

		const allStudents = await Students.find(
			{
				status: STATUSES.ACTIVE,
				school: school._id,
			},
			{
				user_id: 1,
				school: 1,
				studentName: 1,
				exited: 1,
				graduated: 1,
				classRoomId: 1,
				studentsJourney: 1,
			},
		).lean()

		let teacher = null
		const isTeacher = req.user.permissions[0] === globalConstants.teacher
		if (isTeacher) {
			teacher = await Teacher.findOne({ email: req.user.email, isDeleted: {$ne: true} })
		}

		const user_ids = body.map((b) => b.user_id)
		const baselineRecordsInDB = await BaselineRecord.find({
			user_id: { $in: user_ids },
			academicYear: academicYear._id,
		}).select('user_id studentName school studentId baselineCategory classRoomId')

		const validationErrors = []
		const recordsToInsert = []
		const uniqUsers = new Set()
		for (let i = 0; i < body.length; i++) {
			let errors = false
			const studentData = body[i]
			const studentId = studentData['user_id']

			const studentInDB = allStudents.find((obj) => obj.user_id === studentId)
			if (!studentInDB) {
				errors = true
				validationErrors.push(`Invalid student id at row number ${i + 2}`)
				continue
			} else if (studentInDB.graduated) {
				errors = true
				validationErrors.push(`Student at row number ${i + 2} graduated.`)
				continue
			} else if (studentInDB.exited) {
				errors = true
				validationErrors.push(`Student at row number ${i + 2} exited.`)
				continue
			}

			const validateStudentInAY = this.validateStudentAndAcademicYearInJourney(
				studentInDB,
				academicYear._id,
			)
			if (!validateStudentInAY) {
				errors = true
				validationErrors.push(
					`Student with ID: ${studentId} not found in academic year ${academicYear.academicYear} at row number ${i + 2}.`,
				)
				continue
			}

			if (
				!studentData?.baselineCategory ||
				!BASELINE_CATEGORIES.includes(studentData.baselineCategory)
			) {
				errors = true
				validationErrors.push(
					`Baseline Category not Provided or invalid at row number ${i + 2}`,
				)
				continue
			}

			const studentid_category = `${studentId}-${studentData?.baselineCategory}`
			if (uniqUsers.has(studentid_category)) {
				errors = true
				validationErrors.push(
					`Row number ${i + 2} has duplicate Student Id field for baseline category - ${studentData?.baselineCategory}`,
				)
				continue
			} else {
				uniqUsers.add(studentid_category)
			}

		

			if (isTeacher && teacher) {
				const teacherClassroomIds = utils.isAValidArray(teacher?.classroomsJourney)
				? teacher.classroomsJourney
						.filter(
							(obj) =>
								obj.isAssigned &&
								obj.academicYear.toString() === academicYear._id.toString(),
						)
						.map((obj) => obj.classRoomId.toString())
				: []
				if(!teacherClassroomIds.includes(validateStudentInAY.classRoomId.toString())) {
					errors = true
					validationErrors.push(
						`You are not assigned to the classroom of Student for user_id: ${studentData.user_id} at row number ${i + 2}.`,
					)
				}
			
			}

			if (!utils.isAValidString(studentData['baselineForm'])) {
				errors = true
				validationErrors.push(`Row number ${i + 2} has invalid Class Group field`)
			}

			const baselineRecotdExist = baselineRecordsInDB.find(
				(obj) =>
					obj.studentId.toString() === studentInDB._id.toString() &&
					obj.baselineCategory === studentData.baselineCategory &&
					obj.classRoomId.toString() === validateStudentInAY.classRoomId.toString(),
			)

			if (baselineRecotdExist) {
				errors = true
				validationErrors.push(
					`Baseline Record exists for Student ID ${studentData.user_id} for ${studentData?.baselineCategory} at row number ${i + 2}`,
				)
			}

			if (!errors) {
				studentData.school = school._id
				studentData.classRoomId = validateStudentInAY.classRoomId
				studentData.studentId = studentInDB._id
				studentData.studentName = studentInDB.studentName
				studentData.SAY = SAY._id
				studentData.academicYear = academicYear._id

				recordsToInsert.push(studentData)
			}
		}

		if (validationErrors.length > 0) {
			return res.status(400).json({
				message: globalConstants.messages.invalidFileCheckError,
				validationErrors: validationErrors,
				fileContainsError: true,
			})
		}

		BaselineRecord.insertMany(recordsToInsert)
			.then(() => {
				return res
					.status(201)
					.json(new SuccessResponse(globalConstants.messages.baselineCreated))
			})
			.catch((error) => {
				const failureResponse = mongooseErrorHandler.handleError(error)
				return res.status(400).json(failureResponse)
			})
	}

	async updateBaselineRecord(req, res) {
		const body = req.body || {}

		const {
			error,
			message,
			statusCode,
			record: baselineRecord,
		} = await this.validateStudentDataAndUser(req, BaselineRecord, ALL_FIELDS.BASELINE)
		if (error) {
			return res.status(statusCode).json(message)
		}

		// validating whether all categories have proper data as schema format
		const testData = (data, total, category) => {
			if (!Array.isArray(data)) {
				return res
					.status(400)
					.json(
						new FailureResponse(
							`${globalConstants.messages.invalidData} data in ${category} category`,
						),
					)
			}
			if (!total) {
				return res
					.status(400)
					.json(
						new FailureResponse(
							`${globalConstants.messages.unexpectedData} total in ${category} category`,
						),
					)
			}
			return true
		}

		globalConstants.baselineRecordSortFields.forEach((key) => {
			if (body[key]) {
				baselineRecord[key] = testData(body[key]?.data, body[key]?.total, key)
					? body[key]
					: baselineRecord[key]
			}
		})

		await baselineRecord.save()
		return res.json(new SuccessResponse(globalConstants.messages.baselineUpdated))
	}

	async deleteBaselineRecord(req, res) {
		return this.deleteSingleRecord(req, res, BaselineRecord, ALL_FIELDS.BASELINE)
	}

	async deleteMultipleBaselineRecords(req, res) {
		return this.deleteMultipleRecords(req, res, BaselineRecord, ALL_FIELDS.BASELINE)
	}
}

const baselineService = new BaselineService()
module.exports.baselineService = baselineService
