const { mongoose } = require('mongoose')
const utils = require('../../../utility/utils')
const { studentStatus } = require('../../../utility/constants')
const { COPEAssessment } = require('../../../models/database/myPeegu-studentCOPEAssessment')
const { CommonHelperServices } = require('../../common-services/common-helper-service')
const { ALL_FIELDS, STATUSES } = require('../../../utility/localConstants')
const { SuccessResponse, FailureResponse } = require('../../../models/response/globalResponse')
const { Classrooms } = require('../../../models/database/myPeegu-classroom')
const { Students } = require('../../../models/database/myPeegu-student')

class StudentCopeService extends CommonHelperServices {
	/**
	 * Fetches student cope list records for students based on filters like school, classroom, student status, and academic year.
	 * Supports pagination, sorting, and optional export formatting.
	 */
	async fetchStudentCopeList(req, res) {
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
			const sortFields = globalConstants.studentCOPESortFields
			const sortOptions = utils.buildSortOptions(req.body, sortFields)

			// Step 6: Fetch records and total count in parallel
			const filter = queryCombinations
			const [records, totalCount] = await Promise.all([
				COPEAssessment.find(filter)
					.select(
						'_id studentId studentName school counsellorName classRoomId COPEReportSubmissionDate user_id isRatingReset createdAt academicYear',
					)
					.sort(sortOptions)
					.skip(skip)
					.limit(PAGE_SIZE),
				COPEAssessment.countDocuments(filter),
			])
			// Step 7: Enrich records with extra fields
			let transformedRecords = await this.transformDataRecordsWithAcademicFeilds(records)

			// Step 8: If downloadAndFilter is true, map keys to export-friendly format
			if (downloadAndFilter) {
				try {
					transformedRecords = transformedRecords.map((item) =>
						utils.formatStudentCopeData(item, false),
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

	async fetchStudentCope(req, res) {
		const { id } = req.params
		req.body['id'] = id
		const {
			error,
			message,
			statusCode,
			record: studentCopeAssessment,
		} = await this.validateStudentDataAndUser(req, COPEAssessment, ALL_FIELDS.STUDENT_COPE)
		if (error) {
			return res.status(statusCode).json(message)
		}

		await studentCopeAssessment.populate([
			{
				path: 'classRoomId',
				select: 'className section',
			},
			{ path: 'academicYear', select: 'academicYear' },
		])

		if (!studentCopeAssessment) {
			const emptyResponse = {
				studentName: '',
				studentId: '',
				counsellorName: '',
				school: '',
				ratings: Array.from({ length: 36 }, (_, index) => ({
					questionNumber: index + 1,
					marks: null,
				})),
				total: 0,
				isRatingReset: false,
			}

			return res.status(200).json(emptyResponse)
		}

		const studentScoresST = {
			emotionRegulationST: parseFloat(studentCopeAssessment?.emotionRegulationST?.toFixed(2)),
			impulseControlST: parseFloat(studentCopeAssessment?.impulseControlST?.toFixed(2)),
			resilienceST: parseFloat(studentCopeAssessment?.resilienceST?.toFixed(2)),
			attentionST: parseFloat(studentCopeAssessment?.attentionST?.toFixed(2)),
			organisationST: parseFloat(studentCopeAssessment?.organisationST?.toFixed(2)),
		}
		const STDomainNeedingSpecificSupport = []
		const STDomainsNeedingImprovement = []
		const STDomainForIdentifiedStrength = []

		for (const category in studentScoresST) {
			const score = studentScoresST[category]

			if (score <= 1 || (score > 1 && score <= 2) || score < 3) {
				STDomainNeedingSpecificSupport.push({ [category]: score })
			}
			if (score >= 3 && score <= 4) {
				STDomainsNeedingImprovement.push({ [category]: score })
			}
			if (score === 5) {
				STDomainForIdentifiedStrength.push({ [category]: score })
			}
		}

		const studentScoresLT = {
			emotionRegulationLT: parseFloat(studentCopeAssessment?.emotionRegulationLT?.toFixed(2)),
			impulseControlLT: parseFloat(studentCopeAssessment?.impulseControlLT?.toFixed(2)),
			resilienceLT: parseFloat(studentCopeAssessment?.resilienceLT?.toFixed(2)),
			attentionLT: parseFloat(studentCopeAssessment?.attentionLT?.toFixed(2)),
			organisationLT: parseFloat(studentCopeAssessment?.organisationLT?.toFixed(2)),
		}
		const LTDomainNeedingSpecificSupport = []
		const LTDomainsNeedingImprovement = []
		const LTDomainForIdentifiedStrength = []

		for (const category in studentScoresLT) {
			const score = studentScoresLT[category]

			if (score <= 1 || (score > 1 && score <= 2) || score < 3) {
				LTDomainNeedingSpecificSupport.push({ [category]: score })
			}
			if (score >= 3 && score <= 4) {
				LTDomainsNeedingImprovement.push({ [category]: score })
			}
			if (score === 5) {
				LTDomainForIdentifiedStrength.push({ [category]: score })
			}
		}

		const formattedResponse = {
			_id: studentCopeAssessment._id,
			studentName: studentCopeAssessment?.studentName || '',
			studentId: studentCopeAssessment?.studentId || '',
			counsellorName: studentCopeAssessment?.counsellorName || '',
			schoolName: studentCopeAssessment?.schoolName || '',
			school: studentCopeAssessment?.school || '',
			ratings: studentCopeAssessment?.ratings || [],
			user_id: studentCopeAssessment?.user_id || '',
			section: studentCopeAssessment?.classRoomId.section || '',
			className: studentCopeAssessment?.classRoomId?.className || '',
			academicYear: studentCopeAssessment?.academicYear?.academicYear || '',
			isRatingReset: studentCopeAssessment.isRatingReset || false,

			schoolMeanForSTReg: parseFloat(
				await utils.getSchoolMeanAvg(
					'shortTermRegulation',
					studentCopeAssessment.school,
					false,
				),
			),
			schoolMeanForLTReg: parseFloat(
				await utils.getSchoolMeanAvg(
					'longTermRegulation',
					studentCopeAssessment.school,
					false,
				),
			),

			MeanAcrossSchoolForSTReg: parseFloat(
				await utils.getSchoolMeanAvg(
					'shortTermRegulation',
					studentCopeAssessment.school,
					true,
				),
			),
			MeanAcrossSchoolForLTReg: parseFloat(
				await utils.getSchoolMeanAvg(
					'longTermRegulation',
					studentCopeAssessment.school,
					true,
				),
			),

			shortTermRegulation: parseFloat(studentCopeAssessment?.shortTermRegulation?.toFixed(2)),
			longTermRegulation: parseFloat(studentCopeAssessment?.longTermRegulation?.toFixed(2)),

			emotionRegulationST: parseFloat(studentCopeAssessment?.emotionRegulationST?.toFixed(2)),
			impulseControlST: parseFloat(studentCopeAssessment?.impulseControlST?.toFixed(2)),
			resilienceST: parseFloat(studentCopeAssessment?.resilienceST?.toFixed(2)),
			attentionST: parseFloat(studentCopeAssessment?.attentionST?.toFixed(2)),
			organisationST: parseFloat(studentCopeAssessment?.organisationST?.toFixed(2)),

			emotionRegulationLT: parseFloat(studentCopeAssessment?.emotionRegulationLT?.toFixed(2)),
			impulseControlLT: parseFloat(studentCopeAssessment?.impulseControlLT?.toFixed(2)),
			resilienceLT: parseFloat(studentCopeAssessment?.resilienceLT?.toFixed(2)),
			attentionLT: parseFloat(studentCopeAssessment?.attentionLT?.toFixed(2)),
			organisationLT: parseFloat(studentCopeAssessment?.organisationLT?.toFixed(2)),

			//Short Term Domains
			STDomainNeedingSpecificSupport,
			STDomainsNeedingImprovement,
			STDomainForIdentifiedStrength,

			//Long Term Domains
			LTDomainNeedingSpecificSupport,
			LTDomainsNeedingImprovement,
			LTDomainForIdentifiedStrength,
			COPEReportSubmissionDate: studentCopeAssessment?.studentCopeAssessment,
			createdAt: studentCopeAssessment?.createdAt,
		}
		return res.status(200).json(formattedResponse)
	}

	async uploadStudentCopeRecords(req, res) {
		const studentsCopeData = req.body.students || [{}]
		const { error, message, school, SAY, academicYear } =
			await this.validateUserSchoolAndAY(req)
		if (error) {
			return res.status(400).json(new FailureResponse(message))
		}

		const allClassrooms = await Classrooms.find({
			SAY: SAY._id,
			status: globalConstants.schoolStatus.Active,
		}).lean()
		const allStudents = await Students.find(
			{
				status: STATUSES.ACTIVE,
				school: school._id,
			},
			{
				user_id: 1,
				school: 1,
				studentName: 1,
				studentId: 1,
				studentsJourney: 1,
				exited: 1,
				graduated: 1,
				classRoomId: 1,
			},
		).lean()

		const user_ids = studentsCopeData.map((b) => b.user_id)
		const copeAssessmentRecordsInDB = await COPEAssessment.find({
			user_id: { $in: user_ids },
			academicYear: academicYear._id,
		}).select('user_id studentName school studentId baselineCategory classRoomId')

		const validationErrors = []
		const recordsToInsert = []
		const uniqUsers = new Set()
		for (let i = 0; i < studentsCopeData.length; i++) {
			let errors = false
			const studentData = studentsCopeData[i]
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

			if (studentData?.ratings?.length !== 36) {
				errors = true
				validationErrors.push(
					`Student COPE report should consist of 36 questions for Row number ${i + 2}`,
				)
				continue
			}

			if (uniqUsers.has(studentId)) {
				errors = true
				validationErrors.push(`Row number ${i + 2} has duplicate Student Id field`)
				continue
			} else {
				uniqUsers.add(studentId)
			}

			if (
				studentData?.ratings?.some((ass) => ass.marks < 1) ||
				studentData?.ratings?.some((ass) => ass.marks > 5)
			) {
				errors = true
				validationErrors.push(
					`COPE Assessment Marks should be between 1 to 5 for Row number ${i + 2} `,
				)
			}

			const copeExist = copeAssessmentRecordsInDB.find(
				(obj) =>
					obj.studentId.toString() === studentInDB._id.toString() &&
					obj.classRoomId.toString() === validateStudentInAY.classRoomId.toString(),
			)

			if (copeExist) {
				errors = true
				validationErrors.push(
					`Student COPE Assessment already exists for Student ID ${studentId} at row number ${i + 2}`,
				)
			}

			if (!errors) {
				const copeData = this.prepareStudentData(
					studentData,
					school,
					studentInDB,
					validateStudentInAY.classRoomId,
				)
				recordsToInsert.push({ ...copeData, SAY: SAY._id, academicYear: academicYear._id })
			}
		}

		if (validationErrors.length > 0) {
			return res.status(400).json({
				message: globalConstants.messages.invalidFileCheckError,
				validationErrors: validationErrors,
				fileContainsError: true,
			})
		}

		if (recordsToInsert.length > 0) {
			await COPEAssessment.insertMany(recordsToInsert)
			return res
				.status(201)
				.json(new SuccessResponse(globalConstants.messages.studentCopeRecordCreated))
		} else {
			return res.json(new FailureResponse(globalConstants.messages.noRecordsToInsert))
		}
	}

	async updateStudentCope(req, res) {
		const { studentName, counsellorName, school, ratings, user_id, studentId } = req.body

		const {
			error,
			message,
			statusCode,
			record: existingRecord,
		} = await this.validateStudentDataAndUser(req, COPEAssessment, ALL_FIELDS.STUDENT_COPE)
		if (error) {
			return res.status(statusCode).json(message)
		}

		if (studentName) {
			existingRecord.studentName = studentName
		}
		if (counsellorName) {
			existingRecord.counsellorName = counsellorName
		}
		if (school) {
			existingRecord.school = school
		}
		if (user_id) {
			existingRecord.user_id = user_id
		}
		if (ratings) {
			existingRecord.ratings = ratings
			existingRecord.isRatingReset = false
			const shortTermRegulationQuestions = [2, 6, 8, 9, 11, 13, 14, 16, 17, 18, 19, 21, 22]
			const longTermRegulationQuestions = [
				3, 4, 12, 15, 20, 23, 25, 26, 27, 28, 29, 30, 31, 36,
			]

			const longTermRegulationMarks = ratings
				.filter((rating) => longTermRegulationQuestions.includes(rating.questionNumber))
				.map((rating) => rating.marks)

			const shortTermRegulationMarks = ratings
				.filter((rating) => shortTermRegulationQuestions.includes(rating.questionNumber))
				.map((rating) => rating.marks)
			existingRecord.shortTermRegulation = utils.calculateAverage(shortTermRegulationMarks)

			existingRecord.longTermRegulation = utils.calculateAverage(longTermRegulationMarks)

			existingRecord.emotionRegulationST = utils.calculateAverageForStudentCOPESubCategories(
				[2, 8],
				ratings,
			)
			existingRecord.impulseControlST = utils.calculateAverageForStudentCOPESubCategories(
				[6],
				ratings,
			)
			existingRecord.resilienceST = utils.calculateAverageForStudentCOPESubCategories(
				[9, 34, 11],
				ratings,
			)
			existingRecord.attentionST = utils.calculateAverageForStudentCOPESubCategories(
				[35, 13, 16, 18],
				ratings,
			)
			existingRecord.organisationST = utils.calculateAverageForStudentCOPESubCategories(
				[14, 19, 21],
				ratings,
			)

			existingRecord.emotionRegulationLT = utils.calculateAverageForStudentCOPESubCategories(
				[12, 20, 27],
				ratings,
			)
			existingRecord.impulseControlLT = utils.calculateAverageForStudentCOPESubCategories(
				[15],
				ratings,
			)
			existingRecord.resilienceLT = utils.calculateAverageForStudentCOPESubCategories(
				[3, 23, 29, 30, 31],
				ratings,
			)
			existingRecord.attentionLT = utils.calculateAverageForStudentCOPESubCategories(
				[26],
				ratings,
			)
			existingRecord.organisationLT = utils.calculateAverageForStudentCOPESubCategories(
				[7],
				ratings,
			)
		}

		await existingRecord.save()
		return res
			.status(200)
			.json(new SuccessResponse(globalConstants.messages.studentCopeRecordUpdated))
	}

	async deleteStudentCope(req, res) {
		return this.deleteSingleRecord(req, res, COPEAssessment, ALL_FIELDS.STUDENT_COPE)
	}

	async fetchStudentCopeAnalyticsForSchools(req, res) {
		const { academicYears } = req.body
		if (!academicYears || academicYears.length === 0) {
			return res
				.status(400)
				.json(
					new FailureResponse(
						globalConstants.messages.invalidField.replaceField(
							ALL_FIELDS.ACADEMIC_YEAR,
						),
					),
				)
		}

		const userSchools = await this.getUserSchools(req)

		const studentsCOPEAnalysis = await COPEAssessment.aggregate([
			{
				$match: {
					school: { $in: userSchools },
					academicYear: {
						$in: academicYears.map((id) => new mongoose.Types.ObjectId(id)),
					},
					graduated: { $ne: true },
					exited: { $ne: true },
				},
			},
			{
				$group: {
					_id: '$school',
					COPEScore: { $avg: '$avgOfCOPEMarks' },
					schoolName: { $first: '$schoolName' },
					totalStudentSubmitedCOPE: { $sum: 1 },

					schoolMeanForSTReg: { $avg: '$shortTermRegulation' },
					schoolMeanForLTReg: { $avg: '$longTermRegulation' },

					// Short term Regulation
					EmotionRegulationST: { $avg: '$emotionRegulationST' },
					ImpulseControlST: { $avg: '$impulseControlST' },
					ResilienceST: { $avg: '$resilienceST' },
					AttentionST: { $avg: '$attentionST' },
					OrganisationST: { $avg: '$organisationST' },

					// Long term Regulation

					EmotionRegulationLT: { $avg: '$emotionRegulationLT' },
					ImpulseControlLT: { $avg: '$impulseControlLT' },
					ResilienceLT: { $avg: '$resilienceLT' },
					AttentionLT: { $avg: '$attentionLT' },
					OrganisationLT: { $avg: '$organisationLT' },
				},
			},
			{
				$lookup: {
					from: 'schools',
					localField: '_id',
					foreignField: '_id',
					as: 'schoolData',
				},
			},
			{
				$unwind: '$schoolData',
			},
			{
				$project: {
					_id: 1,
					COPEScore: 1,
					schoolName: 1,

					totalStudentSubmitedCOPE: 1,
					studentCountInSchool: '$schoolData.studentCountInSchool',

					schoolMeanForSTReg: 1,
					schoolMeanForLTReg: 1,

					// Short term Regulation
					EmotionRegulationST: 1,
					ImpulseControlST: 1,
					ResilienceST: 1,
					AttentionST: 1,
					OrganisationST: 1,

					// Long term Regulation
					EmotionRegulationLT: 1,
					ImpulseControlLT: 1,
					ResilienceLT: 1,
					AttentionLT: 1,
					OrganisationLT: 1,
				},
			},
		])

		const studentAnalysisKeyValue = studentsCOPEAnalysis.map((score) => ({
			_id: score._id,
			studentCountInSchool: score.studentCountInSchool,
			schoolName: score.schoolName,
			totalStudentSubmitedCOPE: score.totalStudentSubmitedCOPE,
		}))

		const COPEScoreKeyValue = studentsCOPEAnalysis.map((score) => ({
			_id: score._id,
			schoolName: score.schoolName,
			shortTermRegulation: score.schoolMeanForSTReg ? score.schoolMeanForSTReg : 0,
			longTermRegulation: score.schoolMeanForLTReg ? score.schoolMeanForLTReg : 0,
			COPEScore: score?.COPEScore ? score?.COPEScore : 0,
		}))

		const ShortTermDomainWisePerformanceOfSchools = studentsCOPEAnalysis.map((score) => ({
			schoolName: score?.schoolName,
			EmotionRegulationST: score?.EmotionRegulationST ? score?.EmotionRegulationST : 0,
			ImpulseControlST: score?.ImpulseControlST ? score?.ImpulseControlST : 0,
			ResilienceST: score?.ResilienceST ? score?.ResilienceST : 0,
			AttentionST: score?.AttentionST ? score?.AttentionST : 0,
			OrganisationST: score?.OrganisationST ? score?.OrganisationST : 0,
			COPEScore: score?.COPEScore ? score?.COPEScore : 0,
		}))

		const LongTermDomainWisePerformanceOfSchools = studentsCOPEAnalysis.map((score) => ({
			schoolName: score?.schoolName,
			EmotionRegulationLT: score?.EmotionRegulationST ? score?.EmotionRegulationLT : 0,
			ImpulseControlLT: score?.ImpulseControlST ? score?.ImpulseControlLT : 0,
			ResilienceLT: score?.ResilienceST ? score?.ResilienceLT : 0,
			AttentionLT: score?.AttentionST ? score?.AttentionLT : 0,
			OrganisationLT: score?.OrganisationST ? score?.OrganisationLT : 0,
			COPEScore: score?.COPEScore ? score?.COPEScore : 0,
		}))

		const rankedArray = this.rankArrayByProperty(COPEScoreKeyValue, 'COPEScore')

		const rankedShortTermDomainWisePerformanceOfSchools = this.rankArrayByProperty(
			ShortTermDomainWisePerformanceOfSchools,
			'COPEScore',
		)

		const rankedLongTermDomainWisePerformanceOfSchools = this.rankArrayByProperty(
			LongTermDomainWisePerformanceOfSchools,
			'COPEScore',
		)

		const finalResult = {
			studentAnalysis: studentAnalysisKeyValue,
			COPEScore: rankedArray,
			ShortTermDomainWisePerformanceOfSchools: rankedShortTermDomainWisePerformanceOfSchools,
			LongTermDomainWisePerformanceOfSchools: rankedLongTermDomainWisePerformanceOfSchools,
		}
		return res.status(200).json({ data: finalResult })
	}

	async fetchStudentCopeAnalyticsForClassrooms(req, res) {
		const { academicYears, school } = req.body
		if (!academicYears || academicYears.length === 0) {
			return res
				.status(400)
				.json(
					new FailureResponse(
						globalConstants.messages.invalidField.replaceField(
							ALL_FIELDS.ACADEMIC_YEAR,
						),
					),
				)
		}
		if (!school) {
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.provideValidSchoolId))
		}
		const userSchools = await this.getUserSchools(req)
		if (!userSchools || userSchools.length === 0) {
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.schoolNotAssigned))
		}

		const userSchoolIds = userSchools.map((id) => id.toString())
		const unauthorizedSchool = !userSchoolIds.includes(school)
		if (unauthorizedSchool) {
			return res.status(403).json(new FailureResponse(globalConstants.messages.notAuthorised))
		}

		const studentsCOPEForSchool = await COPEAssessment.aggregate([
			{
				$match: {
					school: new mongoose.Types.ObjectId(school),
					academicYear: {
						$in: academicYears.map((id) => new mongoose.Types.ObjectId(id)),
					},
					graduated: { $ne: true },
					exited: { $ne: true },
				},
			},
			{
				$group: {
					_id: '$school',
					schoolMeanForSTReg: { $avg: '$shortTermRegulation' },
					schoolMeanForLTReg: { $avg: '$longTermRegulation' },
				},
			},
		])

		const studentsCOPEAvgForClass = await COPEAssessment.aggregate([
			{
				$match: {
					school: new mongoose.Types.ObjectId(school),
					academicYear: {
						$in: academicYears.map((id) => new mongoose.Types.ObjectId(id)),
					},
					graduated: { $ne: true },
					exited: { $ne: true },
				},
			},
			{
				$lookup: {
					from: 'classrooms', // The name of the Classrooms collection
					localField: 'classRoomId',
					foreignField: '_id',
					as: 'classRoom',
				},
			},
			{
				$unwind: '$classRoom', // Unwind the array created by $lookup
			},
			{
				$group: {
					_id: '$classRoomId',
					school: { $first: '$school' },
					className: { $first: '$classRoom.className' },

					// classRoomIds: { $push: '$classRoomId' },
					avgOfCOPEMarks: { $avg: '$avgOfCOPEMarks' },
					classMeanForST: { $avg: '$shortTermRegulation' },
					classMeanForLT: { $avg: '$longTermRegulation' },

					// Short term Regulation
					totalEmotionRegulationST: { $avg: '$emotionRegulationST' },
					totalImpulseControlST: { $avg: '$impulseControlST' },
					totalResilienceST: { $avg: '$resilienceST' },
					totalAttentionST: { $avg: '$attentionST' },
					totalOrganisationST: { $avg: '$organisationST' },

					// Long term Regulation

					totalEmotionRegulationLT: { $avg: '$emotionRegulationLT' },
					totalImpulseControlLT: { $avg: '$impulseControlLT' },
					totalResilienceLT: { $avg: '$resilienceLT' },
					totalAttentionLT: { $avg: '$attentionLT' },
					totalOrganisationLT: { $avg: '$organisationLT' },
				},
			},
		])

		const COPEScoreForAllClasses = studentsCOPEAvgForClass
			.map((score) => ({
				_id: score._id,
				className: score.className,
				shortTermRegulation: score.classMeanForST ? score.classMeanForST : 0,
				longTermRegulation: score.classMeanForLT ? score.classMeanForLT : 0,
				COPEScoreForClass: score?.avgOfCOPEMarks ? score?.avgOfCOPEMarks : 0,
			}))
			.sort((a, b) => a.className - b.className)

		const ShortTermDomainWisePerformanceOfSchools = studentsCOPEAvgForClass.map((score) => ({
			_id: score._id,
			className: score.className,
			EmotionRegulationST: score?.totalEmotionRegulationST
				? score?.totalEmotionRegulationST
				: 0,
			ImpulseControlST: score?.totalImpulseControlST ? score?.totalImpulseControlST : 0,
			ResilienceST: score?.totalResilienceST ? score?.totalResilienceST : 0,
			AttentionST: score?.totalAttentionST ? score?.totalAttentionST : 0,
			OrganisationST: score?.totalOrganisationST ? score?.totalOrganisationST : 0,
			COPEScoreForClass: score?.avgOfCOPEMarks ? score?.avgOfCOPEMarks : 0,
		}))

		const LongTermDomainWisePerformanceOfSchools = studentsCOPEAvgForClass.map((score) => ({
			_id: score._id,
			className: score.className,
			EmotionRegulationLT: score?.totalEmotionRegulationLT
				? score?.totalEmotionRegulationLT
				: 0,
			ImpulseControlLT: score?.totalImpulseControlLT ? score?.totalImpulseControlLT : 0,
			ResilienceLT: score?.totalResilienceLT ? score?.totalResilienceLT : 0,
			AttentionLT: score?.totalAttentionLT ? score?.totalAttentionLT : 0,
			OrganisationLT: score?.totalOrganisationLT ? score?.totalOrganisationLT : 0,
			COPEScoreForClass: score?.avgOfCOPEMarks ? score?.avgOfCOPEMarks : 0,
		}))

		const rankedShortTermDomainWisePerformanceOfSchools = this.rankArrayByProperty(
			ShortTermDomainWisePerformanceOfSchools,
			'COPEScoreForClass',
		)
		const rankedLongTermDomainWisePerformanceOfSchools = this.rankArrayByProperty(
			LongTermDomainWisePerformanceOfSchools,
			'COPEScoreForClass',
		)
		const finalResult = {
			schoolData: studentsCOPEForSchool[0],
			COPEScoreForAllClasses: COPEScoreForAllClasses,
			ShortTermDomainWisePerformanceOfSchools: rankedShortTermDomainWisePerformanceOfSchools,
			LongTermDomainWisePerformanceOfSchools: rankedLongTermDomainWisePerformanceOfSchools,
		}
		res.json({ data: finalResult })
	}

	rankArrayByProperty(arr, property) {
		const sortedArray = arr.slice().sort((a, b) => b[property] - a[property])
		let prevValue = null
		let rank = 0

		sortedArray.forEach((item, index) => {
			if (item.hasOwnProperty(property) && item[property] !== 0) {
				if (item[property] !== prevValue) {
					rank = index + 1
				}
				item.rank = rank
				prevValue = item[property]
			} else {
				item.rank = 0
			}
		})

		return sortedArray
	}

	prepareStudentData(studentData, school, student, classroom) {
		const COPEMarks = studentData?.ratings?.map((ass) => ass.marks)

		const studentsCOPEMarksAvg = utils.calculateAverage(COPEMarks)
		const shortTermRegulationQuestions = [2, 6, 8, 9, 11, 13, 14, 16, 17, 18, 19, 21, 22]
		const longTermRegulationQuestions = [3, 4, 12, 15, 20, 23, 25, 26, 27, 28, 29, 30, 31, 36]

		const shortTermRegulationMarks = studentData.ratings
			.filter((rating) => shortTermRegulationQuestions.includes(rating.questionNumber))
			.map((rating) => rating.marks)
		const longTermRegulationMarks = studentData.ratings
			.filter((rating) => longTermRegulationQuestions.includes(rating.questionNumber))
			.map((rating) => rating.marks)

		const shortTermRegulationAvg = utils.calculateAverage(shortTermRegulationMarks)
		const longTermRegulationAvg = utils.calculateAverage(longTermRegulationMarks)

		const emotionRegulationST = utils.calculateAverageForStudentCOPESubCategories(
			[2, 8],
			studentData.ratings,
		)
		const impulseControlST = utils.calculateAverageForStudentCOPESubCategories(
			[6],
			studentData.ratings,
		)
		const resilienceST = utils.calculateAverageForStudentCOPESubCategories(
			[9, 34, 11],
			studentData.ratings,
		)
		const attentionST = utils.calculateAverageForStudentCOPESubCategories(
			[35, 13, 16, 18],
			studentData.ratings,
		)
		const organisationST = utils.calculateAverageForStudentCOPESubCategories(
			[14, 19, 21],
			studentData.ratings,
		)
		const emotionRegulationLT = utils.calculateAverageForStudentCOPESubCategories(
			[12, 20, 27],
			studentData.ratings,
		)
		const impulseControlLT = utils.calculateAverageForStudentCOPESubCategories(
			[15],
			studentData.ratings,
		)
		const resilienceLT = utils.calculateAverageForStudentCOPESubCategories(
			[3, 23, 29, 30, 31],
			studentData.ratings,
		)
		const attentionLT = utils.calculateAverageForStudentCOPESubCategories(
			[26],
			studentData.ratings,
		)
		const organisationLT = utils.calculateAverageForStudentCOPESubCategories(
			[7],
			studentData.ratings,
		)

		const schoolId = school._id
		const schoolName = school.school
		const { _id: studentId, studentName } = student

		return {
			studentName,
			studentId,
			classRoomId: classroom,
			counsellorName: studentData.counsellorName,
			school: schoolId,
			ratings: studentData.ratings,
			avgOfCOPEMarks: studentsCOPEMarksAvg,
			shortTermRegulation: shortTermRegulationAvg,
			schoolName,
			emotionRegulationST,
			impulseControlST,
			resilienceST,
			attentionST,
			organisationST,
			longTermRegulation: longTermRegulationAvg,
			emotionRegulationLT,
			impulseControlLT,
			resilienceLT,
			attentionLT,
			organisationLT,
			COPEReportSubmissionDate: studentData.dateOfAssessment
				? studentData.dateOfAssessment
				: new Date(),
			user_id: studentData.user_id,
			isRatingReset: false,
			createdAt: studentData.dateOfAssessment ? studentData.dateOfAssessment : new Date(),
		}
	}
}

const studentCopeService = new StudentCopeService()
module.exports.studentCopeService = studentCopeService
