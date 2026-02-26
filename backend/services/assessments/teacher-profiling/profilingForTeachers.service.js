const { mongoose } = require('mongoose')
const utils = require('../../../utility/utils')
const { CommonHelperServices } = require('../../common-services/common-helper-service')
const { ALL_FIELDS, STATUSES, ACTIONS } = require('../../../utility/localConstants')
const { SuccessResponse, FailureResponse } = require('../../../models/response/globalResponse')
const { ProfilingForSchools } = require('../../../models/database/profiling-for-shools')
const moment = require('moment')
const { Teacher } = require('../../../models/database/myPeegu-teacher')
const { ProfilingForTeachers } = require('../../../models/database/profiling-for-teachers')
const { assessmentHelperService } = require('../assessment-helper-service')

class TeacherProfilingService extends CommonHelperServices {
	async fetchAllProfilingsForTeacher(req, res) {
		const { error, page, PAGE_SIZE, downloadAndFilter, skip, emptyData } =
			await this.validateAndGetAYsAndPaginationData(req)
		if (error) {
			return res.status(200).json(emptyData)
		}

		const schoolProfiling = await ProfilingForSchools.findById(req.body.schoolProfilingId)
		if (!schoolProfiling) {
			return res.status(400).json(new FailureResponse(globalConstants.messages.invalidId))
		}

		const userSchools = await this.getUserSchools(req)
		if (!userSchools.map((id) => id.toString()).includes(schoolProfiling.school.toString())) {
			return res.status(200).json(emptyData)
		}

		let matchQuery = {
			schoolProfilingId: new mongoose.Types.ObjectId(req.body.schoolProfilingId),
		}

		const sortFields = globalConstants.teacherProfilingSortFields
		const sortOptions = utils.buildSortOptions(req.body, sortFields)

		const searchFields = ['teacherDetails.teacherName', 'teacherDetails.teacher_id']
		const searchQueryNew = utils.buildSearchQuery(req.body.searchText, searchFields)

		const filterBody = req.body.filter
		let isGenderFilter = false,
			genderFilterQuery = {}
		if (filterBody) {
			// Remove gender filter from matchQuery since we'll handle it after lookup
			if (
				filterBody.formStatus === STATUSES.PENDING ||
				filterBody.formStatus === STATUSES.SUBMITTED
			) {
				matchQuery.formStatus = filterBody.formStatus
			}

			if (filterBody.gender && filterBody.gender.toLowerCase() !== 'all') {
				genderFilterQuery = {
					'teacherDetails.gender': filterBody.gender,
				}
				isGenderFilter = true
			}

			const dateFilterQuery = utils.buildDateFilterQuery(filterBody)
			if (dateFilterQuery.error) {
				return res.status(400).json(new FailureResponse(dateFilterQuery.errorMsg))
			}

			if (dateFilterQuery && Object.keys(dateFilterQuery).length > 0) {
				matchQuery = { ...matchQuery, ...dateFilterQuery.query }
			}
		}

		const pipeline = [
			{
				$match: matchQuery,
			},
			{
				$lookup: {
					from: 'teachers',
					localField: 'teacher',
					foreignField: '_id',
					as: 'teacherDetails',
					pipeline: [
						{
							$project: {
								teacher_id: 1,
								teacherName: 1,
								gender: 1,
							},
						},
					],
				},
			},
			{
				$unwind: {
					path: '$teacherDetails',
					preserveNullAndEmptyArrays: true,
				},
			},
			...(req.body.searchText && req.body.searchText.trim()
				? [
						{
							$match: {
								$or: searchQueryNew.$or,
							},
						},
					]
				: []),
			...(isGenderFilter
				? [
						{
							$match: genderFilterQuery,
						},
					]
				: []),
			{
				$project: {
					teacher_id: '$teacherDetails.teacher_id',
					teacherName: '$teacherDetails.teacherName',
					gender: '$teacherDetails.gender',
					formStatus: 1,
					submissionDate: 1,
				},
			},
		]

		try {
			// Add facet for pagination and total count
			const facetPipeline = [
				...pipeline,
				{
					$facet: {
						data: [{ $sort: sortOptions }, { $skip: skip }, { $limit: PAGE_SIZE }],
						totalCount: [{ $count: 'count' }],
					},
				},
			]

			// Fix collection name - should match the model being queried
			const result = await ProfilingForTeachers.aggregate(facetPipeline) // or whatever the correct model name is

			const records = result[0]?.data || []
			const totalCount = result[0]?.totalCount[0]?.count || 0

			if (downloadAndFilter) {
				const formattedData = records.map(
					(item) => utils.formatProfilingForTeacherData(item, true, true), // Use appropriate formatter
				)
				return res.json(formattedData)
			}

			return res.json({
				data: records,
				page,
				pageSize: PAGE_SIZE,
				totalCount,
			})
		} catch (error) {
			console.error(error)
			return res.status(500).json(new FailureResponse(globalConstants.messages.serverError))
		}
	}

	async uploadTeacherProfiling(req, res) {
		const body = req.body
		const userSchools = await this.getUserSchools(req)
		if (!userSchools.length) {
			return res
				.status(401)
				.json(new FailureResponse(globalConstants.messages.schoolNotAssigned))
		}

		const schoolProfiling = await ProfilingForSchools.findById(body.schoolProfilingId)
		if (!schoolProfiling) {
			return res
				.status(400)
				.json(
					new FailureResponse(
						globalConstants.messages.invalidField.replaceField(
							ALL_FIELDS.SCHOOL_PROFILING,
						),
					),
				)
		}
		if (schoolProfiling.profilingStatus !== STATUSES.ACTIVE) {
			return res
				.status(400)
				.json(
					new FailureResponse(
						globalConstants.messages.cantTakeActionOnInactiveIRIOrProfiling.replaceField(
							ACTIONS.UPLOAD,
						),
					),
				)
		}

		const teacherProfilingData = req.body.data
		const teachersProfilingValidationErrors = []
		const teacher_Ids = teacherProfilingData.map((teacherData) => teacherData.teacher_id)

		try {
			const teachers = await Teacher.find({
				teacher_id: { $in: teacher_Ids },
				isDeleted: { $ne: true },
				SchoolId: schoolProfiling.school,
			})
				.select('teacherName teacher_id status scCode SchoolId')
				.lean()
			const profilingForTeachers = await ProfilingForTeachers.find({
				teacher: { $in: teachers.map((obj) => obj._id) },
				schoolProfilingId: body.schoolProfilingId,
			})

			const teacherMap = new Map()
			teachers.forEach((obj, i) => {
				const profiling = profilingForTeachers.find(
					(pt) => pt.teacher.toString() === obj._id.toString(),
				)
				teacherMap.set(obj.teacher_id, {
					teacherData: obj,
					profiling: profiling || null,
				})
			})

			const submittedProfilings = profilingForTeachers.filter(
				(obj) => obj.formStatus === STATUSES.SUBMITTED,
			)

			const areAllMarksNull = (scores) => scores.every((rating) => rating.marks === null)

			const uniqTeachers = new Set()
			for (let i = 0; i < teacherProfilingData.length; i++) {
				const errors = []
				const teacher = teacherProfilingData[i]
				const teacherDetails = teacherMap.get(teacher.teacher_id)
				const rowNumber = i + 2

				if (!teacherDetails) {
					errors.push(
						`Teacher not found for Teacher ID: ${teacher.teacher_id} at row number ${rowNumber}`,
					)
				}

				if (!teacher.teacher_id) {
					errors.push(`Row number ${rowNumber} has invalid teacher_id`)
				}

				if (!teacher.dateOfAssessment) {
					errors.push(`Row number ${rowNumber} has invalid date Of Assessment.`)
				}

				// Check if already submitted
				const isSubmitted = submittedProfilings.find(
					(obj) => obj.teacher.toString() === teacherDetails.teacherData._id.toString(),
				)
				if (isSubmitted) {
					errors.push(
						`Teacher Profilings Assessment already submitted for Teacher ID ${teacher.teacher_id} at row number ${rowNumber}`,
					)
				}

				if (uniqTeachers.has(teacher.teacher_id)) {
					errors.push(`Row number ${rowNumber} has duplicate Teacher Id field`)
				} else {
					uniqTeachers.add(teacher.teacher_id)
				}

				// Section-specific validations only if teacher details exist
				if (teacherDetails && teacherDetails.profiling) {
					// Teaching Attitude validation
					if (schoolProfiling.isTeachingAttitudeSelected) {
						if (
							!teacher.teacherAttitudeScore ||
							!Array.isArray(teacher.teacherAttitudeScore) ||
							teacher.teacherAttitudeScore.length === 0 ||
							areAllMarksNull(teacher.teacherAttitudeScore)
						) {
							// Throw an error if section is selected but all marks are null
							errors.push(
								`Teaching Attitude section is required for Teacher ID ${teacher.teacher_id}, at row number ${rowNumber}`,
							)
						} else {
							const rangeError = utils.validateScoreRange(
								teacher.teacherAttitudeScore,
								1,
								4,
								'Teaching Attitude',
								teacher.teacher_id,
								rowNumber,
							)
							const completenessError = utils.validateAllQuestionsAnswered(
								teacher.teacherAttitudeScore,
								'Teaching Attitudes',
								teacher.teacher_id,
								rowNumber,
							)
							if (rangeError) errors.push(rangeError)
							if (completenessError) errors.push(completenessError)
						}
					} else if (
						teacher.teacherAttitudeScore &&
						!areAllMarksNull(teacher.teacherAttitudeScore)
					) {
						errors.push(
							`Teaching Attitude section is not allowed for Teacher ID ${teacher.teacher_id} at row number ${rowNumber}`,
						)
					}

					// Teaching Practices validation
					if (schoolProfiling.isTeachingPracticesSelected) {
						if (
							!teacher.teacherPracticesScore ||
							!Array.isArray(teacher.teacherPracticesScore) ||
							teacher.teacherPracticesScore.length === 0 ||
							areAllMarksNull(teacher.teacherPracticesScore)
						) {
							// Throw an error if section is selected but all marks are null
							errors.push(
								`Teaching Practices section is required for Teacher ID ${teacher.teacher_id},at row number ${rowNumber}`,
							)
						} else {
							const rangeError = utils.validateScoreRange(
								teacher.teacherPracticesScore,
								1,
								5,
								'Teaching Practices',
								teacher.teacher_id,
								rowNumber,
							)
							const completenessError = utils.validateAllQuestionsAnswered(
								teacher.teacherPracticesScore,
								'Teaching Practices',
								teacher.teacher_id,
								rowNumber,
							)
							if (rangeError) errors.push(rangeError)
							if (completenessError) errors.push(completenessError)
						}
					} else if (
						teacher.teacherPracticesScore &&
						!areAllMarksNull(teacher.teacherPracticesScore)
					) {
						errors.push(
							`Teaching Practices section is not allowed for Teacher ID ${teacher.teacher_id} at row number ${rowNumber}`,
						)
					}

					// Job Life Satisfaction validation
					if (schoolProfiling.isJobLifeSatisfactionSelected) {
						if (
							!teacher.teacherJobLifeSatisfactionScore ||
							!Array.isArray(teacher.teacherJobLifeSatisfactionScore) ||
							teacher.teacherJobLifeSatisfactionScore.length === 0 ||
							areAllMarksNull(teacher.teacherJobLifeSatisfactionScore)
						) {
							// Throw an error if section is selected but all marks are null
							errors.push(
								`Job-Life Satisfaction section is required for Teacher ID ${teacher.teacher_id},  at row number ${rowNumber}`,
							)
						} else {
							const rangeError = utils.validateScoreRange(
								teacher.teacherJobLifeSatisfactionScore,
								1,
								4,
								'Teachers Job-Life Satisfaction',
								teacher.teacher_id,
								rowNumber,
							)
							const completenessError = utils.validateAllQuestionsAnswered(
								teacher.teacherJobLifeSatisfactionScore,
								'Teachers Job-Life Satisfaction',
								teacher.teacher_id,
								rowNumber,
							)
							if (rangeError) errors.push(rangeError)
							if (completenessError) errors.push(completenessError)
						}
					} else if (
						teacher.teacherJobLifeSatisfactionScore &&
						!areAllMarksNull(teacher.teacherJobLifeSatisfactionScore)
					) {
						errors.push(
							`Job-Life Satisfaction section is not allowed for Teacher ID ${teacher.teacher_id} at row number ${rowNumber}`,
						)
					}

					// DISC Profiles validation
					if (schoolProfiling.isDISCSelected) {
						if (
							!teacher.teacherDISCProfilesScore ||
							!Array.isArray(teacher.teacherDISCProfilesScore) ||
							teacher.teacherDISCProfilesScore.length === 0 ||
							areAllMarksNull(teacher.teacherDISCProfilesScore)
						) {
							// Throw an error if section is selected but all marks are null
							errors.push(
								`DISC Profiles section is required for Teacher ID ${teacher.teacher_id}, at row number ${rowNumber}`,
							)
						} else {
							const rangeError = utils.validateScoreRange(
								teacher.teacherDISCProfilesScore,
								1,
								5,
								'Teachers DISC Profiles',
								teacher.teacher_id,
								rowNumber,
							)
							const completenessError = utils.validateAllQuestionsAnswered(
								teacher.teacherDISCProfilesScore,
								'Teachers DISC Profiles',
								teacher.teacher_id,
								rowNumber,
							)
							if (rangeError) errors.push(rangeError)
							if (completenessError) errors.push(completenessError)
						}
					} else if (
						teacher.teacherDISCProfilesScore &&
						!areAllMarksNull(teacher.teacherDISCProfilesScore)
					) {
						errors.push(
							`DISC Profiles section is not allowed for Teacher ID ${teacher.teacher_id} at row number ${rowNumber}`,
						)
					}
				}

				if (errors.length > 0) {
					teachersProfilingValidationErrors.push(...errors)
				}
			}
			if (teachersProfilingValidationErrors.length > 0) {
				return res.status(400).json({
					message: globalConstants.messages.invalidFileCheckError,
					validationErrors: teachersProfilingValidationErrors,
					fileContainsError: true,
				})
			}
			const recordsToInsert = teacherProfilingData
				.map((teacherData, i) => {
					const DominanceQuestions = [14, 8, 7, 1]
					const InfluenceQuestions = [13, 12, 6, 2]
					const SteadinessQuestions = [11, 10, 9, 5]
					const ComplianceQuestions = [16, 15, 4, 3]

					const teacherAttitudeScore = teacherData.teacherAttitudeScore.map(
						(score) => score.marks,
					)

					const teacherPracticesScore = teacherData.teacherPracticesScore.map(
						(score) => score.marks,
					)

					const teacherJobLifeSatisfactionScore =
						teacherData.teacherJobLifeSatisfactionScore.map((score) => score.marks)

					const teacherDominanceScore = teacherData.teacherDISCProfilesScore
						.filter((score) => DominanceQuestions.includes(score.questionNumber))
						.map((score) => score.marks)

					const teacherInfluenceScore = teacherData.teacherDISCProfilesScore
						.filter((score) => InfluenceQuestions.includes(score.questionNumber))
						.map((score) => score.marks)

					const teacherSteadinessScore = teacherData.teacherDISCProfilesScore
						.filter((score) => SteadinessQuestions.includes(score.questionNumber))
						.map((score) => score.marks)

					const teacherComplianceScore = teacherData.teacherDISCProfilesScore
						.filter((score) => ComplianceQuestions.includes(score.questionNumber))
						.map((score) => score.marks)

					const teacherAttitude = utils.calculateAverage(teacherAttitudeScore)
					const teacherPractices = utils.calculateAverage(teacherPracticesScore)
					const teacherJobLifeSatisfaction = utils.calculateAverage(
						teacherJobLifeSatisfactionScore,
					)

					const teacherDominance = utils.calculateAverage(teacherDominanceScore)
					const teacherInfluence = utils.calculateAverage(teacherInfluenceScore)
					const teacherSteadiness = utils.calculateAverage(teacherSteadinessScore)
					const teacherCompliance = utils.calculateAverage(teacherComplianceScore)

					const teacherDetails = teacherMap.get(teacherData.teacher_id)

					return {
						record_id: teacherDetails.profiling._id,
						formStatus: STATUSES.SUBMITTED,
						teacherAttitudeReport: utils.sanitizeScores(
							teacherData?.teacherAttitudeScore,
						),
						teacherPracticeReport: utils.sanitizeScores(
							teacherData?.teacherPracticesScore,
						),
						teacherJobLifeSatisfactionReport: utils.sanitizeScores(
							teacherData?.teacherJobLifeSatisfactionScore,
						),
						teacherDISCReport: utils.sanitizeScores(
							teacherData?.teacherDISCProfilesScore,
						),
						submissionDate: teacherData?.dateOfAssessment
							? teacherData?.dateOfAssessment
							: new Date(),
						teacherAttitude,
						teacherPractices,
						teacherJobLifeSatisfaction,
						teacherDominance,
						teacherInfluence,
						teacherSteadiness,
						teacherCompliance,
						submittedByName: body.counsellorName,
					}
				})
				.filter(Boolean)

			if (recordsToInsert.length > 0) {
				try {
					let result
					const bulkOps = recordsToInsert.map((teacherData) => {
						const { record_id, ...updateOperation } = teacherData
						return {
							updateOne: {
								filter: { _id: record_id },
								update: { $set: updateOperation },
							},
						}
					})

					if (bulkOps.length > 0) {
						result = await ProfilingForTeachers.bulkWrite(bulkOps, { ordered: true })
						console.log(`Updated ${result.modifiedCount} records`)
					}

					if (result) {
						await assessmentHelperService.updateProfilingForSchools([schoolProfiling])
						res.json(
							new SuccessResponse(
								globalConstants.messages.teacherProfilingAssCreated,
							),
						)
					}
				} catch (error) {
					console.error(error)
					return res
						.status(500)
						.json(new FailureResponse(globalConstants.messages.serverError))
				}
			} else {
				return res.json(new FailureResponse(globalConstants.messages.noRecordsToInsert))
			}
		} catch (error) {
			console.error(error)
			return res.status(500).json(new FailureResponse(globalConstants.messages.serverError))
		}
	}

	async fetchSingleTeacherProfiling(req, res) {
		try {
			const { teacherMail, teacherProfilingId } = req.body

			// If request made by teacher the in req body teacherMail will send else teacherProfilingId if counselor/admin
			// With this fetch teacherProfiling record if not found throw 404
			let teacherProfiling = null
			if (teacherMail) {
				const teacher = await Teacher.findOne({ email: teacherMail })
				const schoolProfiling = await ProfilingForSchools.findOne(
					{ school: teacher.SchoolId, profilingStatus: STATUSES.ACTIVE },
					{ endDate: -1 },
				)
				if (!schoolProfiling) {
					return res
						.status(404)
						.json(
							new FailureResponse(
								globalConstants.messages.fieldNotFound.replaceField(
									ALL_FIELDS.SCHOOL_PROFILING,
								),
							),
						)
				}
				teacherProfiling = await ProfilingForTeachers.findOne({
					schoolProfilingId: schoolProfiling._id,
					teacher: teacher._id,
				}).lean()
			} else {
				teacherProfiling = await ProfilingForTeachers.findById(teacherProfilingId).lean()
			}

			// const teacherProfiling = await ProfilingForTeachers.findById(teacherProfilingId).lean()
			if (!teacherProfiling) {
				return res
					.status(404)
					.json(
						new FailureResponse(
							globalConstants.messages.fieldNotFound.replaceField(
								ALL_FIELDS.TEACHER_PROFILING,
							),
						),
					)
			}

			// Fetch teacher record
			const teacher = await Teacher.findOne({
				_id: teacherProfiling.teacher,
			}).lean()
			if (!teacher) {
				return res
					.status(404)
					.json(
						new FailureResponse(
							globalConstants.messages.fieldNotFound.replaceField(ALL_FIELDS.TEACHER),
						),
					)
			}

			// Fetch School Profiling record
			const schoolProfiling = await ProfilingForSchools.findById(
				teacherProfiling.schoolProfilingId,
			).lean()
			if (!schoolProfiling) {
				return res
					.status(404)
					.json(
						new FailureResponse(
							globalConstants.messages.fieldNotFount.replaceField(
								ALL_FIELDS.SCHOOL_PROFILING,
							),
						),
					)
			}

			const formattedTeacherData = {
				_id: teacherProfiling._id,
				teacherName: teacher.teacherName,
				teacher_id: teacher.teacher_id,
				schoolName: teacher.schoolName,
				submissionDate: teacherProfiling.submissionDate,
				ProfilingStatus: schoolProfiling.profilingStatus,
				formStatus: teacherProfiling.formStatus,
				//Profiling Data
				teacherAttitude: teacherProfiling?.teacherAttitude
					? teacherProfiling?.teacherAttitude
					: 0,
				teacherPractices: teacherProfiling?.teacherPractices
					? teacherProfiling?.teacherPractices
					: 0,
				teacherJobLifeSatisfaction: teacherProfiling?.teacherJobLifeSatisfaction
					? teacherProfiling?.teacherJobLifeSatisfaction
					: 0,
				teacherDominance: teacherProfiling?.teacherDominance
					? teacherProfiling?.teacherDominance
					: 0,
				teacherInfluence: teacherProfiling?.teacherInfluence
					? teacherProfiling?.teacherInfluence
					: 0,
				teacherSteadiness: teacherProfiling?.teacherSteadiness
					? teacherProfiling?.teacherSteadiness
					: 0,
				teacherCompliance: teacherProfiling?.teacherCompliance
					? teacherProfiling?.teacherCompliance
					: 0,
				teacherAttitudeReport:
					teacherProfiling?.teacherAttitudeReport?.length > 0
						? teacherProfiling?.teacherAttitudeReport
						: Array.from({ length: 12 }, (_, index) => ({
								questionNumber: index + 1,
								marks: null,
							})),
				teacherPracticeReport:
					teacherProfiling?.teacherPracticeReport?.length > 0
						? teacherProfiling?.teacherPracticeReport
						: Array.from({ length: 12 }, (_, index) => ({
								questionNumber: index + 1,
								marks: null,
							})),
				teacherJobLifeSatisfactionReport:
					teacherProfiling?.teacherJobLifeSatisfactionReport?.length > 0
						? teacherProfiling?.teacherJobLifeSatisfactionReport
						: Array.from({ length: 9 }, (_, index) => ({
								questionNumber: index + 1,
								marks: null,
							})),
				teacherDISCReport:
					teacherProfiling?.teacherDISCReport?.length > 0
						? teacherProfiling?.teacherDISCReport
						: Array.from({ length: 16 }, (_, index) => ({
								questionNumber: index + 1,
								marks: null,
							})),
				isDISCSelected: schoolProfiling.isDISCSelected,
				isTeachingAttitudeSelected: schoolProfiling.isTeachingAttitudeSelected,
				isTeachingPracticesSelected: schoolProfiling.isTeachingPracticesSelected,
				isJobLifeSatisfactionSelected: schoolProfiling.isJobLifeSatisfactionSelected,
			}
			return res.json(formattedTeacherData)
		} catch (error) {
			console.error(error)
			return res.status(500).json(new FailureResponse(globalConstants.messages.serverError))
		}
	}

	async deleteTeacherProfiling(req, res) {
		const { teacherProfilingId } = req.body

		// Validate if school PROFILING record is active or not if not throw error
		const validate = await assessmentHelperService.validateProfilingAndIRI(
			teacherProfilingId,
			ACTIONS.DELETE,
			ProfilingForTeachers,
			ProfilingForSchools,
			ALL_FIELDS.TEACHER_PROFILING,
			ALL_FIELDS.SCHOOL_PROFILING,
		)
		if (validate.error) {
			return res.status(validate.statusCode).json(new FailureResponse(validate.message))
		}
		const { teacherRecord: teacherProfiling, schoolRecord: schoolProfiling } = validate

		const fieldsToKeep = [
			'_id',
			'teacher',
			'academicYear',
			'SAY',
			'formStatus',
			'schoolProfilingId',
			'school',
			'__v',
			'createdAt',
			'updatedAt',
		]
		const unsetObject = {}
		for (const key in teacherProfiling) {
			if (!fieldsToKeep.includes(key)) {
				unsetObject[key] = ''
			}
		}

		await ProfilingForTeachers.updateOne(
			{ _id: teacherProfilingId },
			{ $set: { formStatus: STATUSES.PENDING }, $unset: unsetObject },
		)

		// After delete update count in School Profiling of teacher Profiling
		assessmentHelperService.updateProfilingForSchools([schoolProfiling])

		return res
			.status(200)
			.json(
				new SuccessResponse(
					globalConstants.messages.deleted.replaceField(ALL_FIELDS.TEACHER_PROFILING),
				),
			)
	}

	async fetchProfilingAnalytics(req, res) {
		const { academicYear, school } = req.body
		const userSchools = await this.getUserSchools(req)
		if (!userSchools.length) {
			return res
				.status(403)
				.json(new FailureResponse(globalConstants.messages.schoolNotAssigned))
		}

		let matchQuery = { academicYear: new mongoose.Types.ObjectId(academicYear) }
		if (school) {
			if (!userSchools.map((id) => id.toString()).includes(school)) {
				return res
					.status(403)
					.json(new FailureResponse(globalConstants.messages.doNotHaveAccessToTheSchool))
			}
			matchQuery.school = new mongoose.Types.ObjectId(school)
		} else {
			if (!req.user.isAdmin) {
				matchQuery.school = { $in: req.user.assignedSchools }
			}
		}
		const schoolProfilings = await ProfilingForSchools.aggregate([
			{ $match: matchQuery },
			{ $sort: { endDate: -1 } }, // newest records first
			{
				$group: {
					_id: '$school',
					latestRecord: { $first: '$$ROOT' }, // pick latest per teacher
				},
			},
			{ $replaceRoot: { newRoot: '$latestRecord' } }, // unwrap
			{ $project: { _id: 1 } },
		])

		const teacherProfilingAnalyticData = await ProfilingForTeachers.aggregate([
			{
				$match: {
					schoolProfilingId: { $in: schoolProfilings.map((obj) => obj._id) },
				},
			},
			{
				$group: {
					_id: '$school',
					schoolId: { $first: '$school' },
					schoolProfilingID: { $first: '$schoolProfilingId' },
					totalTeachers: { $sum: 1 },
					totalPendingTeachersProfilingCount: {
						$sum: {
							$cond: [
								{
									$or: [
										{ $eq: ['$formStatus', 'Pending'] },
										{ $not: '$formStatus' },
									],
								},
								1,
								0,
							],
						},
					},
					totalSubmittedTeachersProfilingCount: {
						$sum: {
							$cond: [{ $eq: ['$formStatus', 'Submitted'] }, 1, 0],
						},
					},
					totalTeacherAttitude: { $sum: '$teacherAttitude' },
					totalTeacherPractices: { $sum: '$teacherPractices' },
					totalTeacherJobLifeSatisfaction: { $sum: '$teacherJobLifeSatisfaction' },

					totalTeacherDominance: { $sum: '$teacherDominance' },
					totalTeacherInfluence: { $sum: '$teacherInfluence' },
					totalTeacherSteadiness: { $sum: '$teacherSteadiness' },
					totalTeacherCompliance: { $sum: '$teacherCompliance' },
				},
			},
			{
				$lookup: {
					from: 'schools',
					localField: 'schoolId',
					foreignField: '_id',
					as: 'schoolDetails',
					pipeline: [
						{
							$project: {
								_id: 1,
								school: 1,
							},
						},
					],
				},
			},
			{
				$unwind: {
					path: '$schoolDetails',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: 'profiling-for-schools',
					localField: 'schoolProfilingID',
					foreignField: '_id',
					as: 'schoolProfilingDetails',
					pipeline: [
						{
							$project: {
								_id: 1,
								school: 1,
								isDISCSelected: 1,
								isTeachingAttitudeSelected: 1,
								isJobLifeSatisfactionSelected: 1,
								isTeachingPracticesSelected: 1,
							},
						},
					],
				},
			},
			{
				$unwind: {
					path: '$schoolProfilingDetails',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$project: {
					schoolId: '$_id',
					schoolName: '$schoolDetails.school',
					isDISCSelected: '$schoolProfilingDetails.isDISCSelected',
					isTeachingPracticesSelected:
						'$schoolProfilingDetails.isTeachingPracticesSelected',
					isTeachingAttitudeSelected:
						'$schoolProfilingDetails.isTeachingAttitudeSelected',
					isJobLifeSatisfactionSelected:
						'$schoolProfilingDetails.isJobLifeSatisfactionSelected',
					totalTeacherCount: '$totalTeachers',
					totalPendingTeacherCountForProfiling: '$totalPendingTeachersProfilingCount',
					totalSubmittedTeacherCountForProfiling: '$totalSubmittedTeachersProfilingCount',
					teacherAttitudeAvgForSchool: {
						$cond: {
							if: { $eq: ['$totalSubmittedTeachersProfilingCount', 0] },
							then: 0,
							else: {
								$divide: [
									'$totalTeacherAttitude',
									'$totalSubmittedTeachersProfilingCount',
								],
							},
						},
					},
					teacherPracticesAvgForSchool: {
						$cond: {
							if: { $eq: ['$totalSubmittedTeachersProfilingCount', 0] },
							then: 0,
							else: {
								$divide: [
									'$totalTeacherPractices',
									'$totalSubmittedTeachersProfilingCount',
								],
							},
						},
					},
					teacherJobLifeSatisfactionAvgForSchool: {
						$cond: {
							if: { $eq: ['$totalSubmittedTeachersProfilingCount', 0] },
							then: 0,
							else: {
								$divide: [
									'$totalTeacherJobLifeSatisfaction',
									'$totalSubmittedTeachersProfilingCount',
								],
							},
						},
					},
					teacherDominanceAvgForSchool: {
						$cond: {
							if: { $eq: ['$totalSubmittedTeachersProfilingCount', 0] },
							then: 0,
							else: {
								$divide: [
									'$totalTeacherDominance',
									'$totalSubmittedTeachersProfilingCount',
								],
							},
						},
					},
					teacherInfluenceAvgForSchool: {
						$cond: {
							if: { $eq: ['$totalSubmittedTeachersProfilingCount', 0] },
							then: 0,
							else: {
								$divide: [
									'$totalTeacherInfluence',
									'$totalSubmittedTeachersProfilingCount',
								],
							},
						},
					},
					teacherSteadinessAvgForSchool: {
						$cond: {
							if: { $eq: ['$totalSubmittedTeachersProfilingCount', 0] },
							then: 0,
							else: {
								$divide: [
									'$totalTeacherSteadiness',
									'$totalSubmittedTeachersProfilingCount',
								],
							},
						},
					},
					teacherComplianceAvgForSchool: {
						$cond: {
							if: { $eq: ['$totalSubmittedTeachersProfilingCount', 0] },
							then: 0,
							else: {
								$divide: [
									'$totalTeacherCompliance',
									'$totalSubmittedTeachersProfilingCount',
								],
							},
						},
					},
				},
			},
			{
				$addFields: {
					average: {
						$avg: [
							'$teacherAttitudeAvgForSchool',
							'$teacherPracticesAvgForSchool',
							'$teacherJobLifeSatisfactionAvgForSchool',
							'$teacherDominanceAvgForSchool',
							'$teacherInfluenceAvgForSchool',
							'$teacherSteadinessAvgForSchool',
							'$teacherComplianceAvgForSchool',
						],
					},
				},
			},
			{
				$sort: {
					average: -1,
				},
			},
		])
		return res.json(teacherProfilingAnalyticData)
	}

	async submitTeacherProfiling(req, res) {
		try {
			const {
				teacherProfilingId,
				teacherAttitudeScore,
				teacherPracticesScore,
				teacherJobLifeSatisfactionScore,
				teacherDISCProfilesScore,
			} = req.body

			// Validate if school IRI record is active or not if not throw error
		const validate = await assessmentHelperService.validateProfilingAndIRI(
			teacherProfilingId,
			ACTIONS.SUBMIT,
			ProfilingForTeachers,
			ProfilingForSchools,
			ALL_FIELDS.TEACHER_PROFILING,
			ALL_FIELDS.SCHOOL_PROFILING,
		)
		if (validate.error) {
			return res.status(validate.statusCode).json(new FailureResponse(validate.message))
		}
		const { teacherRecord: teacherProfiling, schoolRecord: schoolProfiling } = validate

			const {
				isDISCSelected,
				isTeachingAttitudeSelected,
				isTeachingPracticesSelected,
				isJobLifeSatisfactionSelected,
			} = schoolProfiling

			// Helper function to validate scores and permissions
			const validateSection = (scores, isSelected, sectionName) => {
				if ((!scores || !Array.isArray(scores) || scores.length === 0) && isSelected) {
					throw new Error(
						`${sectionName} scores are required but not provided or invalid.`,
					)
				}
				if (scores && !isSelected) {
					throw new Error(`${sectionName} section is not allowed for this teacher.`)
				}
			}

			try {
				validateSection(
					teacherAttitudeScore,
					isTeachingAttitudeSelected,
					'Teaching Attitude',
				)
				validateSection(
					teacherPracticesScore,
					isTeachingPracticesSelected,
					'Teaching Practices',
				)
				validateSection(
					teacherJobLifeSatisfactionScore,
					isJobLifeSatisfactionSelected,
					'Job-Life Satisfaction',
				)
				validateSection(teacherDISCProfilesScore, isDISCSelected, 'DISC Profiles')
			} catch (err) {
				return res.status(400).json(new FailureResponse(err.message))
			}

			// Define DISC question mappings
			const DominanceQuestions = [14, 8, 7, 1]
			const InfluenceQuestions = [13, 12, 6, 2]
			const SteadinessQuestions = [11, 10, 9, 5]
			const ComplianceQuestions = [16, 15, 4, 3]

			// Calculate averages for the provided scores
			const teacherAttitude = isTeachingAttitudeSelected
				? utils.calculateAverage(teacherAttitudeScore.map((score) => score.marks))
				: null

			const teacherPractices = isTeachingPracticesSelected
				? utils.calculateAverage(teacherPracticesScore.map((score) => score.marks))
				: null

			const teacherJobLifeSatisfaction = isJobLifeSatisfactionSelected
				? utils.calculateAverage(
						teacherJobLifeSatisfactionScore.map((score) => score.marks),
					)
				: null

			const teacherDominance = isDISCSelected
				? utils.calculateAverage(
						teacherDISCProfilesScore
							.filter((score) => DominanceQuestions.includes(score.questionNumber))
							.map((score) => score.marks),
					)
				: null

			const teacherInfluence = isDISCSelected
				? utils.calculateAverage(
						teacherDISCProfilesScore
							.filter((score) => InfluenceQuestions.includes(score.questionNumber))
							.map((score) => score.marks),
					)
				: null

			const teacherSteadiness = isDISCSelected
				? utils.calculateAverage(
						teacherDISCProfilesScore
							.filter((score) => SteadinessQuestions.includes(score.questionNumber))
							.map((score) => score.marks),
					)
				: null

			const teacherCompliance = isDISCSelected
				? utils.calculateAverage(
						teacherDISCProfilesScore
							.filter((score) => ComplianceQuestions.includes(score.questionNumber))
							.map((score) => score.marks),
					)
				: null

			// Update the teacher profiling report
			await ProfilingForTeachers.findOneAndUpdate(
				{ _id: teacherProfilingId },
				{
					$set: {
						formStatus: STATUSES.SUBMITTED,
						submissionDate: new Date(),
						...(isTeachingAttitudeSelected && {
							teacherAttitudeReport: teacherAttitudeScore,
						}),
						...(isTeachingPracticesSelected && {
							teacherPracticeReport: teacherPracticesScore,
						}),
						...(isJobLifeSatisfactionSelected && {
							teacherJobLifeSatisfactionReport: teacherJobLifeSatisfactionScore,
						}),
						...(isDISCSelected && { teacherDISCReport: teacherDISCProfilesScore }),

						teacherAttitude,
						teacherPractices,
						teacherJobLifeSatisfaction,
						teacherDominance,
						teacherInfluence,
						teacherSteadiness,
						teacherCompliance,
					},
				},
				{ returnDocument: 'after' },
			)

			// Once you submit the teacher profiling data thecount in school profiling of this teacher profiling has to update.
			assessmentHelperService.updateProfilingForSchools([schoolProfiling])

			return res.json(
				new SuccessResponse(globalConstants.messages.teacherProfilingAssCreated),
			)
		} catch (error) {
			console.error(error)
			return res.status(500).json(new FailureResponse(globalConstants.messages.serverError))
		}
	}
}

const teacherProfilingService = new TeacherProfilingService()
module.exports.teacherProfilingService = teacherProfilingService
