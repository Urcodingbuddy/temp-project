const { mongoose } = require('mongoose')
const utils = require('../../../utility/utils')
const { ALL_FIELDS, STATUSES, ACTIONS } = require('../../../utility/localConstants')
const { SuccessResponse, FailureResponse } = require('../../../models/response/globalResponse')
const moment = require('moment')
const { Teacher } = require('../../../models/database/myPeegu-teacher')
const { assessmentHelperService } = require('../assessment-helper-service')
const { IRIForSchools } = require('../../../models/database/IRI-for-schools')
const { IRIForTeachers } = require('../../../models/database/IRI-for-teachers')
const { IRIProfilingHelperService } = require('../iri-profiling-helper.service')

class TeacherIRIService extends IRIProfilingHelperService {
	async fetchAllIRIsForTeacher(req, res) {
		const { error, page, PAGE_SIZE, downloadAndFilter, skip, emptyData } =
			await this.validateAndGetAYsAndPaginationData(req)
		if (error) {
			return res.status(200).json(emptyData)
		}

		const schoolIRI = await IRIForSchools.findById(req.body.schoolIRIId)
		if (!schoolIRI) {
			return res.status(400).json(new FailureResponse(globalConstants.messages.invalidId))
		}

		const userSchools = await this.getUserSchools(req)
		if (!userSchools.map((id) => id.toString()).includes(schoolIRI.school.toString())) {
			return res.status(200).json(emptyData)
		}

		let matchQuery = {
			schoolIRIId: new mongoose.Types.ObjectId(req.body.schoolIRIId),
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
			const result = await IRIForTeachers.aggregate(facetPipeline) // or whatever the correct model name is

			const records = result[0]?.data || []
			const totalCount = result[0]?.totalCount[0]?.count || 0

			if (downloadAndFilter) {
				const formattedData = records.map(
					(item) => utils.formatIRIForTeacherData(item, true, true), // Use appropriate formatter
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

	async fetchSingleTeacherIRI(req, res) {
		try {
			const { teacherIRIId, teacherMail } = req.body

			// If request made by teacher the in req body teacherMail will send else teacherIRIId if counselor/admin
			// With this fetch teacherIRI record if not found throw 404
			let teacherIRI = null
			if (teacherMail) {
				const teacher = await Teacher.findOne({ email: teacherMail })
				const schoolIRI = await IRIForSchools.findOne(
					{ school: teacher.SchoolId, IRIStatus: STATUSES.ACTIVE },
					{ endDate: -1 },
				)
				if (!schoolIRI) {
					return res
						.status(404)
						.json(
							new FailureResponse(
								globalConstants.messages.fieldNotFound.replaceField(
									ALL_FIELDS.TEACHER_IRI,
								),
							),
						)
				}
				teacherIRI = await IRIForTeachers.findOne({
					schoolIRIId: schoolIRI._id,
					teacher: teacher._id,
				}).lean()
			} else {
				teacherIRI = await IRIForTeachers.findById(teacherIRIId).lean()
			}

			if (!teacherIRI) {
				return res
					.status(404)
					.json(
						new FailureResponse(
							globalConstants.messages.fieldNotFound.replaceField(
								ALL_FIELDS.TEACHER_IRI,
							),
						),
					)
			}

			// Fetch teacher record
			const teacher = await Teacher.findOne({
				_id: teacherIRI.teacher,
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

			// Fetch School IRI record
			const schoolIRI = await IRIForSchools.findById(teacherIRI.schoolIRIId).lean()
			if (!schoolIRI) {
				return res
					.status(404)
					.json(
						new FailureResponse(
							globalConstants.messages.fieldNotFount.replaceField(
								ALL_FIELDS.SCHOOL_IRI,
							),
						),
					)
			}

			// Fetch teacher IRI records of All schools of academic year of current teacher IRI record
			const teacherIRIRecordsOfAllSchools = await this.fetchIRIRecords(
				teacher,
				teacherIRI,
				true,
			)

			// Fetch teacher IRI records of teachers school of academic year of current teacher IRI record
			const teacherIRIRecordsOfTeachersSchool = await this.fetchIRIRecords(
				teacher,
				teacherIRI,
				false,
			)

			const teacherRankInSchool = this.getSpecificTeacherRanks(
				teacherIRI,
				teacherIRIRecordsOfTeachersSchool,
			)
			const teacherRankAcrossSchools = this.getSpecificTeacherRanks(
				teacherIRI,
				teacherIRIRecordsOfAllSchools,
			)
			const getSpecificTeacherPercentileScore =
				await this.specificTeacherPercentileScoreOfIRI(
					teacherIRIRecordsOfTeachersSchool,
					teacher,
				)

			const teacherReport = await this.fetchTeacherIRIReportGenerationData(
				teacherIRI,
				teacherIRIRecordsOfTeachersSchool,
			)

			const formattedTeacherData = {
				_id: teacherIRI._id,
				teacherName: teacher.teacherName,
				teacher_id: teacher.teacher_id,
				schoolName: teacher.schoolName,
				submissionDate: teacherIRI.submissionDate,
				isRatingDeleted: teacherIRI?.isRatingDeleted,
				IRIStatus: schoolIRI.IRIStatus,
				percentileOfSpecificTeacher:
					getSpecificTeacherPercentileScore?.percentiles?.PercentileOfTeacher,
				teachersScores: getSpecificTeacherPercentileScore.teachersArray,
				teacherIRIReport:
					teacherIRI?.teacherIRIReport?.length > 0
						? teacherIRI.teacherIRIReport
						: Array.from({ length: 28 }, (_, index) => ({
								questionNumber: index + 1,
								marks: null,
							})),
				formStatus: teacherIRI.formStatus ? teacherIRI.formStatus : null,
				teacherIRIScore: {
					perspectiveTakingScale: teacherIRI?.perspectiveNP
						? teacherIRI?.perspectiveNP?.toFixed(4)
						: null,
					fantasyScale: teacherIRI?.fantasyNP ? teacherIRI?.fantasyNP?.toFixed(4) : null,
					empathicConcernScale: teacherIRI?.empathicNP
						? teacherIRI?.empathicNP?.toFixed(4)
						: null,
					personalDistressScale: teacherIRI.personalDistressNP
						? teacherIRI.personalDistressNP.toFixed(4)
						: null,
				},
				rankingInSchool: teacherRankInSchool,
				rankingAcrossSchool: teacherRankAcrossSchools,
				report: teacherReport,
			}
			return res.json(formattedTeacherData)
		} catch (error) {
			console.error(error)
			return res.status(500).json(new FailureResponse(globalConstants.messages.serverError))
		}
	}

	async uploadTeacherIRI(req, res) {
		const body = req.body
		const userSchools = await this.getUserSchools(req)
		if (!userSchools.length) {
			return res
				.status(401)
				.json(new FailureResponse(globalConstants.messages.schoolNotAssigned))
		}

		const schoolIRI = await IRIForSchools.findById(body.schoolIRIId)
		if (!schoolIRI) {
			return res
				.status(400)
				.json(
					new FailureResponse(
						globalConstants.messages.invalidField.replaceField(ALL_FIELDS.SCHOOL_IRI),
					),
				)
		}
		if (schoolIRI.IRIStatus !== STATUSES.ACTIVE) {
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

		const teacherIRIData = req.body.data
		const teachersIRIValidationErrors = []
		const teacher_Ids = teacherIRIData.map((teacherData) => teacherData.teacher_id)

		try {
			const teachers = await Teacher.find({
				teacher_id: { $in: teacher_Ids },
				isDeleted: { $ne: true },
				SchoolId: schoolIRI.school,
			})
				.select('teacherName teacher_id status scCode SchoolId')
				.lean()
			const iriForTeachers = await IRIForTeachers.find({
				teacher: { $in: teachers.map((obj) => obj._id) },
				schoolIRIId: body.schoolIRIId,
			})

			const teacherMap = new Map()
			teachers.forEach((obj, i) => {
				const iri = iriForTeachers.find(
					(pt) => pt.teacher.toString() === obj._id.toString(),
				)
				teacherMap.set(`${obj.teacher_id}_${i + 1}`, {
					teacherData: obj,
					iri: iri || null,
				})
			})

			const submittedIRIs = iriForTeachers.filter(
				(obj) => obj.formStatus === STATUSES.SUBMITTED,
			)

			const uniqTeachers = new Set()
			for (let i = 0; i < teacherIRIData.length; i++) {
				const errors = []
				const teacher = teacherIRIData[i]
				const teacherDetails = teacherMap.get(`${teacher.teacher_id}_${i + 1}`)
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
				const isSubmitted = submittedIRIs.find(
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

				if (
					teacher.scores.some((ass) => ass.marks < 0) ||
					teacher.scores.some((ass) => ass.marks > 4)
				) {
					const marksError = `IRI Assessment Marks should be between 0 to 4 for Row number ${i + 2} `
					errors.push(marksError)
				}

				const isValidScore = teacher.scores.some((rating) => rating.marks === null)

				if (isValidScore) {
					errors.push(
						`${teacher.teacher_id} has not filled all question at row number ${i + 2}`,
					)
				}

				if (errors.length > 0) {
					teachersIRIValidationErrors.push(...errors)
				}
			}
			if (teachersIRIValidationErrors.length > 0) {
				return res.status(400).json({
					message: globalConstants.messages.invalidFileCheckError,
					validationErrors: teachersIRIValidationErrors,
					fileContainsError: true,
				})
			}
			const recordsToInsert = teacherIRIData
				.map((teacherData, i) => {
					let perspectiveTaking = []
					let fantasy = []
					let empathicConcern = []
					let personalDistress = []
					// Here it updates the questions scrore with reverse marks based on section and question number else original marks considered.
					const updattedIRIAssesment = utils.updateQuestionScores(
						utils.SectionEnum.TEACHER_IRI,
						teacherData.scores,
					)
					const finalScore = updattedIRIAssesment
						.map((iri) => iri.marks)
						.reduce((acc, cur) => acc + cur, 0)

					for (const assessment of updattedIRIAssesment) {
						const { questionNumber, marks } = assessment

						if ([3, 8, 11, 15, 21, 25, 28].includes(questionNumber)) {
							perspectiveTaking.push(marks)
						} else if ([1, 5, 7, 12, 16, 23, 26].includes(questionNumber)) {
							fantasy.push(marks)
						} else if ([2, 4, 9, 14, 18, 20, 22].includes(questionNumber)) {
							empathicConcern.push(marks)
						} else if ([6, 10, 13, 17, 19, 24, 27].includes(questionNumber)) {
							personalDistress.push(marks)
						}
					}

					const perspectiveTakingAvg = utils.calculateAverage(perspectiveTaking)
					const fantasyScaleAvg = utils.calculateAverage(fantasy)
					const empathicConcernAvg = utils.calculateAverage(empathicConcern)
					const personalDistressAvg = utils.calculateAverage(personalDistress)

					const teacherDetails = teacherMap.get(`${teacherData.teacher_id}_${i + 1}`)

					return {
						record_id: teacherDetails.iri._id,
						teacherIRIReport: teacherData?.scores,
						submissionDate: teacherData?.dateOfAssessment
							? teacherData?.dateOfAssessment
							: new Date(),
						formStatus: STATUSES.SUBMITTED,
						finalScore,
						perspectiveNP: perspectiveTakingAvg,
						fantasyNP: fantasyScaleAvg,
						empathicNP: empathicConcernAvg,
						personalDistressNP: personalDistressAvg,
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
						result = await IRIForTeachers.bulkWrite(bulkOps, { ordered: true })
						console.log(`Updated ${result.modifiedCount} records`)
					}

					if (result) {
						// After bulk upload count in School IRI of teacher IRI
						assessmentHelperService.updateIRIForSchools([schoolIRI])
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

	async fetchIRIAnalytics() {
		try {
			const { academicYear, school } = req.body
			const userSchools = await this.getUserSchools(req)
			if (!userSchools.length) {
				return res
					.status(403)
					.json(new FailureResponse(globalConstants.messages.schoolNotAssigned))
			}

			let schoolIRIQuery = { academicYear }
			if (school) {
				if (!userSchools.map((id) => id.toString()).includes(school)) {
					return res
						.status(403)
						.json(
							new FailureResponse(
								globalConstants.messages.doNotHaveAccessToTheSchool,
							),
						)
				}
				schoolIRIQuery.school = school
			} else {
				if (!req.user.isAdmin) {
					matchQuery.school = { $in: req.user.assignedSchools }
				}
			}
			const schoolIRIs = await IRIForSchools.aggregate([
				{ $match: matchQuery },
				{ $sort: { endDate: -1 } }, // newest records first
				{
					$group: {
						_id: '$school',
						latestRecord: { $first: '$$ROOT' }, // pick latest per teacher
					},
				},
				{ $replaceRoot: { newRoot: '$latestRecord' } }, // unwrap
				{ $project: _id },
			])

			let query = {}
			const getAssignedSchools = await Schools.find({
				_id: { $in: req.user.assignedSchools },
			}).select('school status')
			const schoolsWithActiveStatus = getAssignedSchools.filter(
				(school) => school.status === 'Active',
			)
			const activeSchoolIds = schoolsWithActiveStatus.map((school) => school._id)
			req.user.assignedSchools = activeSchoolIds
			if (!req.user.isAdmin) query.schoolId = { $in: req.user.assignedSchools }

			const rankedSchools = await IRIForTeachers.aggregate([
				{
					$match: {
						schoolIRIId: { $in: schoolIRIs.map((obj) => obj._id) },
					},
				},
				{
					$lookup: {
						from: 'teachers',
						localField: 'schoolId',
						foreignField: 'SchoolId',
						as: 'teacherData',
					},
				},
				{
					$group: {
						_id: '$school',
						// schoolName: { $first: '$schoolName' },
						// schoolId: { $first: '$schoolId' },
						schoolIRIId: { $first: '$schoolIRIId' },
						// teacherData: { $first: '$teacherData' },

						totalNPScaleForSchool: {
							$sum: {
								$add: [
									'$empathicConcernNPScaleForSchool',
									'$fantasyNPScaleForSchool',
									'$personalDistressNPScaleForSchool',
									'$perspectiveTakingNPScaleForSchool',
								],
							},
						},
						totalPerspective: {
							$sum: {
								$reduce: {
									input: '$teacherData',
									initialValue: 0,
									in: { $add: ['$$value', '$$this.perspectiveNP'] },
								},
							},
						},
						totalFantasy: {
							$sum: {
								$reduce: {
									input: '$teacherData',
									initialValue: 0,
									in: { $add: ['$$value', '$$this.fantasyNP'] },
								},
							},
						},
						totalEmpathic: {
							$sum: {
								$reduce: {
									input: '$teacherData',
									initialValue: 0,
									in: { $add: ['$$value', '$$this.empathicNP'] },
								},
							},
						},
						totalPersonalDistress: {
							$sum: {
								$reduce: {
									input: '$teacherData',
									initialValue: 0,
									in: { $add: ['$$value', '$$this.personalDistressNP'] },
								},
							},
						},
					},
				},
				{
					$project: {
						_id: 1,
						schoolIRIId,
						totalPerspective: 1,
						totalFantasy: 1,
						totalEmpathic: 1,
						totalPersonalDistress: 1,

						averageScore: {
							$divide: ['$totalNPScaleForSchool', 4],
						},
						femaleTeachers: {
							$filter: {
								input: '$teacherData',
								as: 'teacher',
								cond: { $eq: ['$$teacher.gender', 'Female'] },
							},
						},
						maleTeachers: {
							$filter: {
								input: '$teacherData',
								as: 'teacher',
								cond: { $eq: ['$$teacher.gender', 'Male'] },
							},
						},
						topScores: {
							perspectiveTakingScale: { $max: '$teacherData.perspectiveNP' },
							fantasyScale: { $max: '$teacherData.fantasyNP' },
							empathicConcernScale: { $max: '$teacherData.empathicNP' },
							personalDistressScale: { $max: '$teacherData.personalDistressNP' },
						},
					},
				},

				{
					$addFields: {
						maleSubmittedCount: {
							$size: {
								$ifNull: [
									{
										$filter: {
											input: '$maleTeachers',
											as: 'teacher',
											cond: { $eq: ['$$teacher.isIRIFormSubmitted', true] },
										},
									},
									[],
								],
							},
						},
						femaleSubmittedCount: {
							$size: {
								$ifNull: [
									{
										$filter: {
											input: '$femaleTeachers',
											as: 'teacher',
											cond: { $eq: ['$$teacher.isIRIFormSubmitted', true] },
										},
									},
									[],
								],
							},
						},
						totalPendingTeacherCount: {
							$size: {
								$ifNull: [
									{
										$filter: {
											input: '$teacherData',
											as: 'teacher',
											cond: { $eq: ['$$teacher.isIRIFormSubmitted', false] },
										},
									},
									[],
								],
							},
						},
						totalSubmittedTeacherCount: {
							$size: {
								$ifNull: [
									{
										$filter: {
											input: '$teacherData',
											as: 'teacher',
											cond: { $eq: ['$$teacher.isIRIFormSubmitted', true] },
										},
									},
									[],
								],
							},
						},
					},
				},
				{
					$addFields: {
						maleAvg: {
							empathicConcern: {
								$cond: {
									if: { $eq: ['$maleSubmittedCount', 0] },
									then: 0,
									else: {
										$divide: [
											{ $sum: '$maleTeachers.empathicNP' },
											'$maleSubmittedCount',
										],
									},
								},
							},
							fantasyScale: {
								$cond: {
									if: { $eq: ['$maleSubmittedCount', 0] },
									then: 0,
									else: {
										$divide: [
											{ $sum: '$maleTeachers.fantasyNP' },
											'$maleSubmittedCount',
										],
									},
								},
							},
							personalDistressScale: {
								$cond: {
									if: { $eq: ['$maleSubmittedCount', 0] },
									then: 0,
									else: {
										$divide: [
											{ $sum: '$maleTeachers.personalDistressNP' },
											'$maleSubmittedCount',
										],
									},
								},
							},
							perspectiveTakingScale: {
								$cond: {
									if: { $eq: ['$maleSubmittedCount', 0] },
									then: 0,
									else: {
										$divide: [
											{ $sum: '$maleTeachers.perspectiveNP' },
											'$maleSubmittedCount',
										],
									},
								},
							},
						},
						femaleAvg: {
							empathicConcern: {
								$cond: {
									if: { $eq: ['$femaleSubmittedCount', 0] },
									then: 0,
									else: {
										$divide: [
											{ $sum: '$femaleTeachers.empathicNP' },
											'$femaleSubmittedCount',
										],
									},
								},
							},
							fantasyScale: {
								$cond: {
									if: { $eq: ['$femaleSubmittedCount', 0] },
									then: 0,
									else: {
										$divide: [
											{ $sum: '$femaleTeachers.fantasyNP' },
											'$femaleSubmittedCount',
										],
									},
								},
							},
							personalDistressScale: {
								$cond: {
									if: { $eq: ['$femaleSubmittedCount', 0] },
									then: 0,
									else: {
										$divide: [
											{ $sum: '$femaleTeachers.personalDistressNP' },
											'$femaleSubmittedCount',
										],
									},
								},
							},
							perspectiveTakingScale: {
								$cond: {
									if: { $eq: ['$femaleSubmittedCount', 0] },
									then: 0,
									else: {
										$divide: [
											{ $sum: '$femaleTeachers.perspectiveNP' },
											'$femaleSubmittedCount',
										],
									},
								},
							},
						},
						perspectiveTakingNPScaleForSchool: {
							$cond: {
								if: { $eq: ['$totalSubmittedTeacherCount', 0] },
								then: 0,
								else: {
									$divide: ['$totalPerspective', '$totalSubmittedTeacherCount'],
								},
							},
						},
						fantasyNPScaleForSchool: {
							$cond: {
								if: { $eq: ['$totalSubmittedTeacherCount', 0] },
								then: 0,
								else: { $divide: ['$totalFantasy', '$totalSubmittedTeacherCount'] },
							},
						},
						empathicConcernNPScaleForSchool: {
							$cond: {
								if: { $eq: ['$totalSubmittedTeacherCount', 0] },
								then: 0,
								else: {
									$divide: ['$totalEmpathic', '$totalSubmittedTeacherCount'],
								},
							},
						},
						personalDistressNPScaleForSchool: {
							$cond: {
								if: { $eq: ['$totalSubmittedTeacherCount', 0] },
								then: 0,
								else: {
									$divide: [
										'$totalPersonalDistress',
										'$totalSubmittedTeacherCount',
									],
								},
							},
						},
					},
				},
				{
					$project: {
						_id: 0,
						schoolId: 1,
						schoolName: 1,
						averageScore: 1,
						maleAvg: {
							empathicConcern: 1,
							fantasyScale: 1,
							personalDistressScale: 1,
							perspectiveTakingScale: 1,
							average: {
								$avg: [
									'$maleAvg.empathicConcern',
									'$maleAvg.fantasyScale',
									'$maleAvg.personalDistressScale',
									'$maleAvg.perspectiveTakingScale',
								],
							},
						},
						femaleAvg: {
							empathicConcern: 1,
							fantasyScale: 1,
							personalDistressScale: 1,
							perspectiveTakingScale: 1,
							average: {
								$avg: [
									'$femaleAvg.empathicConcern',
									'$femaleAvg.fantasyScale',
									'$femaleAvg.personalDistressScale',
									'$femaleAvg.perspectiveTakingScale',
								],
							},
						},
						totalTeacherCount: 1,
						totalPendingTeacherCount: 1,
						totalSubmittedTeacherCount: 1,
						topScores: 1,
						perspectiveTakingNPScaleForSchool: 1,
						fantasyNPScaleForSchool: 1,
						empathicConcernNPScaleForSchool: 1,
						personalDistressNPScaleForSchool: 1,
					},
				},
			])
			rankedSchools.sort((a, b) => b.averageScore - a.averageScore)

			const scales = [
				'perspectiveTakingNPScaleForSchool',
				'fantasyNPScaleForSchool',
				'empathicConcernNPScaleForSchool',
				'personalDistressNPScaleForSchool',
			]

			scales.forEach((scale) => {
				const sortedSchools = rankedSchools.slice().sort((a, b) => a[scale] - b[scale])
				const totalCount = sortedSchools.length

				const uniqueScores = {}
				let rankSum = 0

				// Calculate sum of ranks for each unique score
				sortedSchools.forEach((school, index) => {
					const score = school[scale]
					if (!(score in uniqueScores)) {
						uniqueScores[score] = { count: 0, sumRanks: 0 }
					}

					uniqueScores[score].count++
					uniqueScores[score].sumRanks += index + 1
					rankSum += index + 1
				})

				// Calculate percentile for each unique score
				for (const score in uniqueScores) {
					const count = uniqueScores[score].count
					const sumRanks = uniqueScores[score].sumRanks
					const avgRank = sumRanks / count
					const percentile = (avgRank / totalCount) * 100

					// Assign percentile to schools with the same score
					sortedSchools.forEach((school) => {
						if (school[scale] === Number(score)) {
							school[`${scale}Percentile`] = percentile
						}
					})
				}
			})

			const schoolsForCalculatingPercentileScore = rankedSchools
				.slice()
				.sort((a, b) => a.averageScore - b.averageScore)

			const totalCount = schoolsForCalculatingPercentileScore.length

			let previousScore = null
			let rankSum = 0
			let count = 0
			schoolsForCalculatingPercentileScore.forEach((school, index) => {
				if (school.averageScore !== previousScore) {
					if (previousScore !== null) {
						const averageRank = rankSum / count
						const percentile = (averageRank / totalCount) * 100
						// Assign percentile to all schools with the same score
						for (let i = index - count; i < index; i++) {
							schoolsForCalculatingPercentileScore[i].percentile = percentile
						}
					}
					previousScore = school.averageScore
					rankSum = index + 1
					count = 1
				} else {
					rankSum += index + 1
					count++
				}
			})

			// // Handle the last group of schools with the same score
			if (previousScore !== null) {
				const averageRank = rankSum / count
				const percentile = (averageRank / totalCount) * 100
				for (
					let i = schoolsForCalculatingPercentileScore.length - count;
					i < schoolsForCalculatingPercentileScore.length;
					i++
				) {
					schoolsForCalculatingPercentileScore[i].percentile = percentile
				}
			}

			const subScaleWisePerformanceOfSchools = rankedSchools.map((school, index) => {
				return {
					_id: school.schoolId.toString(),
					schoolName: school.schoolName,
					rank: school.rank,
					percentile: school.percentile,
					averageScore: school.averageScore,
					totalTeacherCount: school.totalTeacherCount,
					totalPendingTeacherCount: school.totalPendingTeacherCount,
					totalSubmittedTeacherCount: school.totalSubmittedTeacherCount,

					scaleScore: [
						{
							perspectiveTakingScale: school.perspectiveTakingNPScaleForSchool,
							fantasyScale: school.fantasyNPScaleForSchool,
							empathicConcernScale: school.empathicConcernNPScaleForSchool,
							personalDistressScale: school.personalDistressNPScaleForSchool,
						},
					],

					maleAvg: school.maleAvg,
					feMaleAvg: school.femaleAvg,
					topScores: school.topScores,

					perspectiveTakingRank: school?.perspectiveTakingNPScaleForSchoolRank,
					fantasyScaleRank: school?.fantasyNPScaleForSchoolRank,
					empathicConcernRank: school?.empathicConcernNPScaleForSchoolRank,
					personalDistressRank: school?.personalDistressNPScaleForSchoolRank,

					perspectiveTakingPercentile:
						school?.perspectiveTakingNPScaleForSchoolPercentile,
					fantasyScalePercentile: school?.fantasyNPScaleForSchoolPercentile,
					empathicConcernPercentile: school?.empathicConcernNPScaleForSchoolPercentile,
					personalDistressPercentile: school?.personalDistressNPScaleForSchoolPercentile,
				}
			})

			return res.json({ subScaleWisePerformanceOfSchools })
		} catch (error) {
			console.error({ error })
			return res.status(500).json(new FailureResponse(globalConstants.messages.serverError))
		}
	}

	async deleteTeacherIRI(req, res) {
		const { teacherIRIId } = req.body

		// Validate if school IRI record is active or not if not throw error
		const validate = await assessmentHelperService.validateProfilingAndIRI(
			teacherIRIId,
			ACTIONS.DELETE,
			IRIForTeachers,
			IRIForSchools,
			ALL_FIELDS.TEACHER_IRI,
			ALL_FIELDS.SCHOOL_IRI,
		)
		if (validate.error) {
			return res.status(validate.statusCode).json(new FailureResponse(validate.message))
		}
		const { teacherRecord: teacherIRI, schoolRecord: schoolIRI } = validate

		const fieldsToKeep = [
			'_id',
			'teacher',
			'academicYear',
			'SAY',
			'schoolIRIId',
			'formStatus',
			'school',
			'__v',
			'createdAt',
			'updatedAt',
		]
		const unsetObject = {}
		for (const key in teacherIRI) {
			if (!fieldsToKeep.includes(key)) {
				unsetObject[key] = ''
			}
		}

		await IRIForTeachers.updateOne(
			{ _id: teacherIRIId },
			{ $set: { formStatus: STATUSES.PENDING }, $unset: unsetObject },
		)

		// After delete update count in School IRI of teacher IRI
		assessmentHelperService.updateIRIForSchools([schoolIRI])

		return res
			.status(200)
			.json(
				new SuccessResponse(
					globalConstants.messages.deleted.replaceField(ALL_FIELDS.TEACHER_IRI),
				),
			)
	}

	/**
	 * This function is for teacher to submit iri form
	 *
	 * @param {*} req
	 * @param {*} res
	 */
	async submitTeacherIRIData(req, res) {
		const { teacherIRIId, teacherIRIAssessment } = req.body

		// Validate if school IRI record is active or not if not throw error
		const validate = await assessmentHelperService.validateProfilingAndIRI(
			teacherIRIId,
			ACTIONS.SUBMIT,
			IRIForTeachers,
			IRIForSchools,
			ALL_FIELDS.TEACHER_IRI,
			ALL_FIELDS.SCHOOL_IRI,
		)
		if (validate.error) {
			return res.status(validate.statusCode).json(new FailureResponse(validate.message))
		}
		const { teacherRecord: teacherIRI, schoolRecord: schoolIRI } = validate

		if (teacherIRIAssessment.some((ass) => ass.marks > 4)) {
			return res
				.status(404)
				.json(new FailureResponse(globalConstants.messages.teacherIRIMarksError))
		}

		let perspectiveTaking = []
		let fantasy = []
		let empathicConcern = []
		let personalDistress = []
		// Here it updates the questions scrore with reverse marks based on section and question number else original marks considered.
		const updattedIRIAssesment = utils.updateQuestionScores(
			utils.SectionEnum.TEACHER_IRI,
			teacherIRIAssessment,
		)
		const finalScore = updattedIRIAssesment
			.map((iri) => iri.marks)
			.reduce((acc, cur) => acc + cur, 0)

		for (const assessment of updattedIRIAssesment) {
			const { questionNumber, marks } = assessment

			if ([3, 8, 11, 15, 21, 25, 28].includes(questionNumber)) {
				perspectiveTaking.push(marks)
			} else if ([1, 5, 7, 12, 16, 23, 26].includes(questionNumber)) {
				fantasy.push(marks)
			} else if ([2, 4, 9, 14, 18, 20, 22].includes(questionNumber)) {
				empathicConcern.push(marks)
			} else if ([6, 10, 13, 17, 19, 24, 27].includes(questionNumber)) {
				personalDistress.push(marks)
			}
		}

		const perspectiveTakingAvg = utils.calculateAverage(perspectiveTaking)
		const fantasyScaleAvg = utils.calculateAverage(fantasy)
		const empathicConcernAvg = utils.calculateAverage(empathicConcern)
		const personalDistressAvg = utils.calculateAverage(personalDistress)

		await IRIForTeachers.updateOne(
			{ _id: teacherIRIId },
			{
				$set: {
					teacherIRIReport: teacherIRIAssessment,
					submissionDate: new Date(),
					formStatus: STATUSES.SUBMITTED,
					finalScore,
					perspectiveNP: perspectiveTakingAvg,
					fantasyNP: fantasyScaleAvg,
					empathicNP: empathicConcernAvg,
					personalDistressNP: personalDistressAvg,
				},
			},
		)

		assessmentHelperService.updateIRIForSchools([schoolIRI])

		return res
			.status(200)
			.json(new SuccessResponse(globalConstants.messages.teacherIRIreportUpdated))
	}
}

const teacherIRIService = new TeacherIRIService()
module.exports.teacherIRIService = teacherIRIService
