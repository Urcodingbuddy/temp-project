const { mongoose } = require('mongoose')
const utils = require('../../../utility/utils')
const { studentStatus } = require('../../../utility/constants')
const { FailureResponse, SuccessResponse } = require('../../../models/response/globalResponse')
const { WellBeingAssessment } = require('../../../models/database/myPeegu-StudentWellBeing')
const { CommonHelperServices } = require('../../common-services/common-helper-service')
const { ALL_FIELDS, STATUSES } = require('../../../utility/localConstants')
const { Students } = require('../../../models/database/myPeegu-student')

class StudentWellBeingService extends CommonHelperServices {
	/**
	 * Fetches Student wellbeing records for students based on filters like school, classroom, student status, and academic year.
	 * Supports pagination, sorting, and optional export formatting.
	 */
	async fetchStudentWellBeingRecords(req, res) {
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
			const sortFields = globalConstants.studentWellBeingSortFields
			const sortOptions = utils.buildSortOptions(req.body, sortFields)

			// Step 6: Fetch records and total count in parallel
			const filter = queryCombinations
			const [records, totalCount] = await Promise.all([
				WellBeingAssessment.find(filter)
					.select(
						'_id studentId studentName school counsellorName classRoomId wellBeingAssessmentSubmissionDate user_id isRatingReset createdAt academicYear',
					)
					.sort(sortOptions)
					.skip(skip)
					.limit(PAGE_SIZE),
				WellBeingAssessment.countDocuments(filter),
			])
			// Step 7: Enrich records with extra fields
			let transformedRecords = await this.transformDataRecordsWithAcademicFeilds(records)

			// Step 8: If downloadAndFilter is true, map keys to export-friendly format
			if (downloadAndFilter) {
				try {
					transformedRecords = transformedRecords.map((item) =>
						utils.formatStudentWBData(item, false),
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

	async fetchStudentWB(req, res) {
		const { id } = req.params
		req.body['id'] = id
		const {
			error,
			message,
			statusCode,
			record: studentWBAssessment,
		} = await this.validateStudentDataAndUser(
			req,
			WellBeingAssessment,
			ALL_FIELDS.STUDENT_WELLBEING,
		)
		if (error) {
			return res.status(statusCode).json(message)
		}

		await studentWBAssessment.populate([
			{
				path: 'classRoomId',
				select: 'className section',
			},
			{ path: 'academicYear', select: 'academicYear' },
		])

		if (!studentWBAssessment) {
			return res.status(404).json(new FailureResponse(globalConstants.messages.notFound))
		}

		const student = await Students.findOne({ _id: studentWBAssessment.studentId })

		const inSchoolAverages = await this.calculateWellBeingAverages(
			studentWBAssessment.school,
			true,
		)

		const acrossSchoolAverages = await this.calculateWellBeingAverages(null, false)

		const NotoVeryLowHope = {}
		const SlightlyHopeful = {}
		const ModeratelyHopeful = {}
		const HighlyHopeful = {}

		const dataForCHS = {
			CHS_agency: studentWBAssessment.CH_AgencyMarks,
			CHS_pathway: studentWBAssessment.CH_PathwayMarks,
		}

		if (dataForCHS.CHS_agency >= 6 && dataForCHS.CHS_agency <= 12) {
			NotoVeryLowHope.Agency = dataForCHS.CHS_agency
		} else if (dataForCHS.CHS_agency >= 13 && dataForCHS.CHS_agency <= 17) {
			SlightlyHopeful.Agency = dataForCHS.CHS_agency
		} else if (dataForCHS.CHS_agency >= 18 && dataForCHS.CHS_agency <= 23) {
			ModeratelyHopeful.Agency = dataForCHS.CHS_agency
		} else if (dataForCHS.CHS_agency >= 24 && dataForCHS.CHS_agency <= 36) {
			HighlyHopeful.Agency = dataForCHS.CHS_agency
		}

		if (dataForCHS.CHS_pathway >= 6 && dataForCHS.CHS_pathway <= 12) {
			NotoVeryLowHope.Pathway = dataForCHS.CHS_pathway
		} else if (dataForCHS.CHS_pathway >= 13 && dataForCHS.CHS_pathway <= 17) {
			SlightlyHopeful.Pathway = dataForCHS.CHS_pathway
		} else if (dataForCHS.CHS_pathway >= 18 && dataForCHS.CHS_pathway <= 23) {
			ModeratelyHopeful.Pathway = dataForCHS.CHS_pathway
		} else if (dataForCHS.CHS_pathway >= 24 && dataForCHS.CHS_pathway <= 36) {
			HighlyHopeful.Pathway = dataForCHS.CHS_pathway
		}

		const urgent = {}
		const moderate = {}
		const high = {}

		const average_PWB_marks = await this.generatePWBPipeline(studentWBAssessment.school)

		const isAutonomyInadequate =
			studentWBAssessment.PWB_AutonomyMarks < average_PWB_marks.averageAutonomyMarks
		const isEnvironmentaInadequate =
			studentWBAssessment.PWB_EnvironmentalMarks < average_PWB_marks.averageEnvironmentalMarks
		const isPersonalGrowthInadequate =
			studentWBAssessment.PWB_PersonalGrowthMarks <
			average_PWB_marks.averagePersonalGrowthMarks
		const isPositiveRelationsInadequate =
			studentWBAssessment.PWB_PositiveRelationsMarks <
			average_PWB_marks.averagePositiveRelationsMarks
		const isPurposeInLifeInadequate =
			studentWBAssessment.PWB_PurposeInLifeMarks < average_PWB_marks.averagePurposeInLifeMarks
		const isSelfAcceptanceInadequate =
			studentWBAssessment.PWB_SelfAcceptanceMarks <
			average_PWB_marks.averageSelfAcceptanceMarks

		const trueCounts = [
			{
				name: 'Autonomy',
				value: isAutonomyInadequate,
				marks: studentWBAssessment?.PWB_AutonomyMarks,
			},
			{
				name: 'Environment',
				value: isEnvironmentaInadequate,
				marks: studentWBAssessment?.PWB_EnvironmentalMarks,
			},
			{
				name: 'Personal growth',
				value: isPersonalGrowthInadequate,
				marks: studentWBAssessment?.PWB_PersonalGrowthMarks,
			},
			{
				name: 'Positive Relations with Others',
				value: isPositiveRelationsInadequate,
				marks: studentWBAssessment?.PWB_PositiveRelationsMarks,
			},
			{
				name: 'Purpose in life',
				value: isPurposeInLifeInadequate,
				marks: studentWBAssessment?.PWB_PurposeInLifeMarks,
			},
			{
				name: 'Self-acceptance',
				value: isSelfAcceptanceInadequate,
				marks: studentWBAssessment?.PWB_SelfAcceptanceMarks,
			},
		]
			.filter((category) => category.value)
			.map((category) => ({ name: category.name, marks: category.marks }))

		if (trueCounts.length > 3) {
			trueCounts.forEach((count) => {
				urgent[count.name] = count.marks
			})
		} else if (trueCounts.length === 3) {
			trueCounts.forEach((count) => {
				moderate[count.name] = count.marks
			})
		} else if (trueCounts.length < 3) {
			trueCounts.forEach((count) => {
				high[count.name] = count.marks
			})
		}

		const formattedResponse = {
			_id: studentWBAssessment?._id,
			studentId: studentWBAssessment?.studentId,
			studentName: studentWBAssessment?.studentName,
			counsellorName: studentWBAssessment?.counsellorName,
			schoolName: studentWBAssessment?.schoolName,
			className: studentWBAssessment?.className,
			section: studentWBAssessment?.section,
			user_id: studentWBAssessment?.user_id,
			isRatingReset: studentWBAssessment?.isRatingReset,
			dob: student?.dob,
			academicYear: studentWBAssessment?.academicYear?.academicYear || '',

			NotoVeryLowHope,
			SlightlyHopeful,
			ModeratelyHopeful,
			HighlyHopeful,
			CHS_inSchoolAvg: inSchoolAverages?.averageHopeScoreForSchool,
			CHS_acrossSchoolAvg: acrossSchoolAverages?.averageHopeScoreForSchool,

			PWB_inSchoolAvg: inSchoolAverages?.averageWellBeingScoreForSchool,
			PWB_acrossSchoolAvg: acrossSchoolAverages?.averageWellBeingScoreForSchool,

			childsHopeScale: {
				overallHopeScore: studentWBAssessment?.overallHopeScore,
				CH_PathwayMarks: studentWBAssessment?.CH_PathwayMarks ?? null,
				CH_AgencyMarks: studentWBAssessment?.CH_AgencyMarks ?? null,
			},
			urgent,
			moderate,
			high,
			PsychologicalWellBeingScale: {
				overallWellBeingScaleScore: studentWBAssessment?.overallWellBeingScaleScore,
				PWB_AutonomyMarks: studentWBAssessment?.PWB_AutonomyMarks ?? null,
				PWB_EnvironmentalMarks: studentWBAssessment?.PWB_EnvironmentalMarks ?? null,
				PWB_PersonalGrowthMarks: studentWBAssessment?.PWB_PersonalGrowthMarks ?? null,
				PWB_PositiveRelationsMarks: studentWBAssessment?.PWB_PositiveRelationsMarks ?? null,
				PWB_PurposeInLifeMarks: studentWBAssessment?.PWB_PurposeInLifeMarks ?? null,
				PWB_SelfAcceptanceMarks: studentWBAssessment?.PWB_SelfAcceptanceMarks ?? null,
			},

			wellBeingAssessmentSubmissionDate:
				studentWBAssessment?.wellBeingAssessmentSubmissionDate,
			childrensHopeScaleScore: studentWBAssessment?.childrensHopeScaleScore,
			psychologicalWellBeingScaleScore: studentWBAssessment?.psychologicalWellBeingScaleScore,
		}
		return res.status(200).json(formattedResponse)
	}

	async deleteStudentWellBeingRecord(req, res) {
		return this.deleteSingleRecord(req, res, WellBeingAssessment, ALL_FIELDS.STUDENT_WELLBEING)
	}

	async updateStudentWellBeingRecord(req, res) {
		const { error, message, statusCode } = await this.validateStudentDataAndUser(
			req,
			WellBeingAssessment,
			ALL_FIELDS.STUDENT_WELLBEING,
		)
		if (error) {
			return res.status(statusCode).json(message)
		}

		const { childrensHopeScale, psychologicalWellBeingScale, id } = req.body
		const reverseScoringQuestions = [1, 2, 3, 8, 9, 11, 12, 13, 17, 18]

		const calculateSumForPWB = (questions, ratings) => {
			const relevantRatings = ratings.filter((item) =>
				questions.includes(item.questionNumber),
			)
			return utils.calculateSum(relevantRatings, true, reverseScoringQuestions)
		}

		const calculateSumForCH = (questions, ratings) => {
			const relevantRatings = ratings.filter((item) =>
				questions.includes(item.questionNumber),
			)
			const sum = relevantRatings.reduce((sum, item) => sum + item.marks, 0)
			return sum
		}

		const CH_PathwayQuestions = [2, 4, 6]
		const CH_AgencyQuestions = [1, 3, 5]
		const PWB_AutonomyQuestions = [15, 17, 18]
		const PWB_EnvironmentalQuestions = [4, 8, 9]
		const PWB_PersonalGrowthQuestions = [11, 12, 14]
		const PWB_PositiveRelationsQuestions = [6, 13, 16]
		const PWB_PurposeInLifeQuestions = [3, 7, 10]
		const PWB_selfAcceptanceQuestions = [1, 2, 5]

		const overallHopeScore = utils.calculateSum(
			childrensHopeScale?.map((ass) => ass.marks),
			false,
		)

		const overallWellBeingScaleScore = utils.calculateSum(
			psychologicalWellBeingScale,
			true,
			reverseScoringQuestions,
		)
		const CH_PathwayMarks = calculateSumForCH(CH_PathwayQuestions, childrensHopeScale)
		const CH_AgencyMarks = calculateSumForCH(CH_AgencyQuestions, childrensHopeScale)
		const PWB_AutonomyMarks = calculateSumForPWB(
			PWB_AutonomyQuestions,
			psychologicalWellBeingScale,
		)
		const PWB_EnvironmentalMarks = calculateSumForPWB(
			PWB_EnvironmentalQuestions,
			psychologicalWellBeingScale,
		)
		const PWB_PersonalGrowthMarks = calculateSumForPWB(
			PWB_PersonalGrowthQuestions,
			psychologicalWellBeingScale,
		)
		const PWB_PositiveRelationsMarks = calculateSumForPWB(
			PWB_PositiveRelationsQuestions,
			psychologicalWellBeingScale,
		)
		const PWB_PurposeInLifeMarks = calculateSumForPWB(
			PWB_PurposeInLifeQuestions,
			psychologicalWellBeingScale,
		)
		const PWB_SelfAcceptanceMarks = calculateSumForPWB(
			PWB_selfAcceptanceQuestions,
			psychologicalWellBeingScale,
		)

		const updateFields = {
			CH_PathwayMarks,
			CH_AgencyMarks,
			PWB_AutonomyMarks,
			PWB_EnvironmentalMarks,
			PWB_PersonalGrowthMarks,
			PWB_PositiveRelationsMarks,
			PWB_PurposeInLifeMarks,
			PWB_SelfAcceptanceMarks,
			overallHopeScore,
			overallWellBeingScaleScore,
			childrensHopeScaleScore: childrensHopeScale,
			psychologicalWellBeingScaleScore: psychologicalWellBeingScale,
			isRatingReset: false,
		}
		await WellBeingAssessment.updateOne({ _id: id }, { $set: updateFields })

		return res
			.status(200)
			.json(new SuccessResponse(globalConstants.messages.studentWellBeingRecordUpdated))
	}

	async uploadStudentWellBeingrecords(req, res) {
		const studentsCopeData = req.body.students || [{}]
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
				studentsJourney: 1,
				studentName: 1,
				exited: 1,
				graduated: 1,
				classRoomId: 1,
			},
		).lean()

		const user_ids = studentsCopeData.map((b) => b.user_id)
		const wbAssessmentRecordsInDB = await WellBeingAssessment.find({
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

			if (uniqUsers.has(studentId)) {
				errors = true
				validationErrors.push(`Row number ${i + 2} has duplicate Student Id field`)
				continue
			} else {
				uniqUsers.add(studentId)
			}

			if (studentData?.childrensHopeScale?.length !== 6) {
				const lengthError = `Children's Hope Scale report should consist of 6 questions for Row number ${i + 2} `
				errors.push(lengthError)
			}
			if (studentData?.psychologicalWellBeingScale?.length !== 18) {
				const lengthError = `Psychological Well-Being scale report should consist of 18 questions for Row number ${i + 2} `
				errors.push(lengthError)
			}

			if (
				studentData?.childrensHopeScale?.some((ass) => ass.marks < 1) ||
				studentData?.childrensHopeScale?.some((ass) => ass.marks > 6)
			) {
				const marksError = `Children's Hope Scale should be between 1 to 6 for Row number ${i + 2} `
				errors.push(marksError)
			}

			if (
				studentData?.psychologicalWellBeingScale?.some((ass) => ass.marks < 1) ||
				studentData?.psychologicalWellBeingScale?.some((ass) => ass.marks > 7)
			) {
				const marksError = `Psychological Well-Being scale should be between 1 to 7 for Row number ${i + 2} `
				errors.push(marksError)
			}

			const wbExist = wbAssessmentRecordsInDB.find(
				(obj) =>
					obj.studentId.toString() === studentInDB._id.toString() &&
					obj.classRoomId.toString() === validateStudentInAY.classRoomId.toString(),
			)

			if (wbExist) {
				errors = true
				validationErrors.push(
					`Student Well-Being Assessment already exists for Student ID ${studentId} at row number ${i + 2}`,
				)
			}

			if (!errors) {
				const wbData = this.prepareStudentData(
					studentData,
					school,
					studentInDB,
					validateStudentInAY.classRoomId,
				)
				recordsToInsert.push({ ...wbData, SAY: SAY._id, academicYear: academicYear._id })
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
			await WellBeingAssessment.insertMany(recordsToInsert)
			return res
				.status(201)
				.json(new SuccessResponse(globalConstants.messages.studentCopeRecordCreated))
		} else {
			return res.json(new FailureResponse(globalConstants.messages.noRecordsToInsert))
		}
	}

	async fetchStudentWellBeingAnalyticsForSchools(req, res) {
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
		const studentsWellBeingData = await WellBeingAssessment.aggregate([
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
					schoolName: { $first: '$schoolName' },
					averageHopeScore: { $avg: '$overallHopeScore' },
					averageWellBeingScore: { $avg: '$overallWellBeingScaleScore' },
					averagePathway: { $avg: '$CH_PathwayMarks' },
					averageAgency: { $avg: '$CH_AgencyMarks' },

					averagePWB_AutonomyMarks: { $avg: '$PWB_AutonomyMarks' },
					averagePWB_EnvironmentalMarks: { $avg: '$PWB_EnvironmentalMarks' },
					averagePWB_PersonalGrowthMarks: { $avg: '$PWB_PersonalGrowthMarks' },
					averagePWB_PositiveRelationsMarks: { $avg: '$PWB_PositiveRelationsMarks' },
					averagePWB_PurposeInLifeMarks: { $avg: '$PWB_PurposeInLifeMarks' },
					averagePWB_SelfAcceptanceMarks: { $avg: '$PWB_SelfAcceptanceMarks' },
					numberOfFormsSubmitted: {
						$sum: {
							$cond: {
								if: '$isStudentsWellBeingFormSubmitted',
								then: 1,
								else: 0,
							},
						},
					},
				},
			},
		])
		const studentAnalysisData = userSchools.map((school) => {
			const studentWellBeingData = studentsWellBeingData.find((data) =>
				data._id.equals(school._id),
			)
			return {
				...school._doc,
				numberOfStudentsSubmitted: studentWellBeingData
					? studentWellBeingData.numberOfFormsSubmitted
					: 0,
			}
		})

		const studentWellBeingData = studentsWellBeingData.map((school) => ({
			_id: school._id,
			schoolName: school.schoolName,
			averageHopeScore: school.averageHopeScore,
			averageWellBeingScore: school.averageWellBeingScore,
		}))

		const studentHopeScaleData = studentsWellBeingData.map((school) => ({
			_id: school._id,
			schoolName: school.schoolName,
			averagePathwayScore: school.averagePathway,
			averageWellBeingAgency: school.averageAgency,
		}))

		const studentsPWBData = studentsWellBeingData.map((school) => ({
			_id: school._id,
			schoolName: school.schoolName,
			autonomy: school.averagePWB_AutonomyMarks,
			environment: school.averagePWB_EnvironmentalMarks,

			personalGrowth: school.averagePWB_PersonalGrowthMarks,
			positiveRelation: school.averagePWB_PositiveRelationsMarks,
			purposeInLife: school.averagePWB_PurposeInLifeMarks,
			selfAcceptance: school.averagePWB_SelfAcceptanceMarks,
		}))

		const formattedResponse = {
			studentAnalysis: studentAnalysisData,
			studentWellBeing: utils.rankingsForStudentWBAnalytics(
				studentWellBeingData,
				'averageHopeScore',
				'averageWellBeingScore',
			),
			studentHopeScaleData: utils.rankingsForStudentWBAnalytics(
				studentHopeScaleData,
				'averagePathwayScore',
				'averageWellBeingAgency',
			),
			studentsPWBData: utils.rankPWBData(
				studentsPWBData,
				'autonomy',
				'environment',
				'personalGrowth',
				'positiveRelation',
				'purposeInLife',
				'selfAcceptance',
			),
		}
		res.status(200).json(formattedResponse)
	}

	async fetchStudentWellBeingAnalyticsForClassrooms(req, res) {
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

		const studentsWellBeingDataForSchool = await WellBeingAssessment.aggregate([
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
					schoolName: { $first: '$schoolName' },
					averageHopeScore: { $avg: '$overallHopeScore' },
					averageWellBeingScore: { $avg: '$overallWellBeingScaleScore' },
				},
			},
		])

		const rankingData = utils.calculateRanking(studentsWellBeingDataForSchool, school)

		const studentsWellBeingDataForClasses = await WellBeingAssessment.aggregate([
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
					schoolName: { $first: '$schoolName' },
					className: { $first: '$classRoom.className' },
					averageHopeScore: { $avg: '$overallHopeScore' },
					averageWellBeingScore: { $avg: '$overallWellBeingScaleScore' },

					averagePathway: { $avg: '$CH_PathwayMarks' },
					averageAgency: { $avg: '$CH_AgencyMarks' },

					averagePWB_AutonomyMarks: { $avg: '$PWB_AutonomyMarks' },
					averagePWB_EnvironmentalMarks: { $avg: '$PWB_EnvironmentalMarks' },
					averagePWB_PersonalGrowthMarks: { $avg: '$PWB_PersonalGrowthMarks' },
					averagePWB_PositiveRelationsMarks: { $avg: '$PWB_PositiveRelationsMarks' },
					averagePWB_PurposeInLifeMarks: { $avg: '$PWB_PurposeInLifeMarks' },
					averagePWB_SelfAcceptanceMarks: { $avg: '$PWB_SelfAcceptanceMarks' },
				},
			},
		])

		const studentWellBeingDataForClasses = studentsWellBeingDataForClasses.map((classes) => {
			return {
				className: classes.className,
				averageHopeScore: classes.averageHopeScore ? classes.averageHopeScore : 0,
				averageWellBeingScore: classes.averageWellBeingScore
					? classes.averageWellBeingScore
					: 0,
			}
		})
		const studentHopeScaleDataForClasses = studentsWellBeingDataForClasses.map((classes) => {
			return {
				className: classes.className,
				averagePathwayScore: classes.averagePathway ? classes.averagePathway : 0,
				averageWellBeingAgency: classes.averageAgency ? classes.averageAgency : 0,
			}
		})
		const studentsPWBDataForClasses = studentsWellBeingDataForClasses.map((classes) => {
			return {
				className: classes.className,

				autonomy: classes.averagePWB_AutonomyMarks ? classes.averagePWB_AutonomyMarks : 0,
				environment: classes.averagePWB_EnvironmentalMarks
					? classes.averagePWB_EnvironmentalMarks
					: 0,

				personalGrowth: classes.averagePWB_PersonalGrowthMarks
					? classes.averagePWB_PersonalGrowthMarks
					: 0,
				positiveRelation: classes.averagePWB_PositiveRelationsMarks
					? classes.averagePWB_PositiveRelationsMarks
					: 0,
				purposeInLife: classes.averagePWB_PurposeInLifeMarks
					? classes.averagePWB_PurposeInLifeMarks
					: 0,
				selfAcceptance: classes.averagePWB_SelfAcceptanceMarks
					? classes.averagePWB_SelfAcceptanceMarks
					: 0,
			}
		})

		const formattedResponse = {
			schoolData: {
				_id: rankingData.hopeRanking?._id,
				schoolName: rankingData.hopeRanking?.schoolName,
				hopoScore: rankingData.hopeRanking?.hopeScore,
				wellBeingScore: rankingData?.wellBeingRanking?.wellBeingScore,

				hopoRank: rankingData.hopeRanking?.rank,
				wellBeingRank: rankingData.wellBeingRanking?.rank,
			},
			scoreForAllClasses: utils.rankingsForStudentWBAnalytics(
				studentWellBeingDataForClasses,
				'averageHopeScore',
				'averageWellBeingScore',
			),
			studentHopeScaleDataForClasses: utils.rankingsForStudentWBAnalytics(
				studentHopeScaleDataForClasses,
				'averagePathwayScore',
				'averageWellBeingAgency',
			),
			studentsPWBDataForClasses: utils.rankPWBData(
				studentsPWBDataForClasses,
				'autonomy',
				'environment',
				'personalGrowth',
				'positiveRelation',
				'purposeInLife',
				'selfAcceptance',
			),
		}
		return res.status(200).json(formattedResponse)
	}

	async calculateWellBeingAverages(specificSchoolId, includeMatchStage) {
		const pipeline = []

		if (includeMatchStage) {
			pipeline.push({
				$match: {
					school: specificSchoolId,
				},
			})
		}

		pipeline.push({
			$group: {
				_id: null,
				averageHopeScore: { $avg: '$overallHopeScore' },
				averageWellBeingScore: { $avg: '$overallWellBeingScaleScore' },
			},
		})

		const result = await WellBeingAssessment.aggregate(pipeline)

		const averageScores = {
			averageHopeScoreForSchool: null,
			averageWellBeingScoreForSchool: null,
			averageHopeScoreForAll: null,
			averageWellBeingScoreForAll: null,
		}

		if (result.length > 0) {
			averageScores.averageHopeScoreForSchool = result[0].averageHopeScore
			averageScores.averageWellBeingScoreForSchool = result[0].averageWellBeingScore
		}

		if (!includeMatchStage) {
			const allSchoolsAverages = await this.calculateWellBeingAverages(null, true)
			averageScores.averageHopeScoreForAll = allSchoolsAverages.averageHopeScore
			averageScores.averageWellBeingScoreForAll = allSchoolsAverages.averageWellBeingScore
		}

		return averageScores
	}

	async generatePWBPipeline(schoolId) {
		const pipeline = [
			{
				$match: {
					school: new mongoose.Types.ObjectId(schoolId),
				},
			},
			{
				$group: {
					_id: '$school',
					averageAutonomyMarks: { $avg: '$PWB_AutonomyMarks' },
					averageEnvironmentalMarks: { $avg: '$PWB_EnvironmentalMarks' },
					averagePersonalGrowthMarks: { $avg: '$PWB_PersonalGrowthMarks' },
					averagePositiveRelationsMarks: {
						$avg: '$PWB_PositiveRelationsMarks',
					},
					averagePurposeInLifeMarks: { $avg: '$PWB_PurposeInLifeMarks' },
					averageSelfAcceptanceMarks: { $avg: '$PWB_SelfAcceptanceMarks' },
				},
			},
		]

		const result = await WellBeingAssessment.aggregate(pipeline)
		return result[0]
	}

	prepareStudentData(studentData, school, student, classroom) {
		const reverseScoringQuestions = [1, 2, 3, 8, 9, 11, 12, 13, 17, 18]

		const overallHopeScore = utils.calculateSum(
			studentData?.childrensHopeScale?.map((ass) => ass.marks),
			false,
		)

		const overallWellBeingScaleScore = utils.calculateSum(
			studentData?.psychologicalWellBeingScale,
			true,
			reverseScoringQuestions,
		)

		const calculateSumForPWB = (questions, ratings) => {
			const relevantRatings = ratings.filter((item) =>
				questions.includes(item.questionNumber),
			)

			const sum = relevantRatings.reduce((sum, item) => {
				if (reverseScoringQuestions.includes(item.questionNumber)) {
					return sum + (7 + 1) - item.marks
				} else {
					return sum + item.marks
				}
			}, 0)

			return sum
		}
		const calculateSumForCH = (questions, ratings) => {
			const relevantRatings = ratings.filter((item) =>
				questions.includes(item.questionNumber),
			)
			const sum = relevantRatings.reduce((sum, item) => sum + item.marks, 0)
			return sum
		}

		const CH_PathwayQuestions = [2, 4, 6]
		const CH_AgencyQuestions = [1, 3, 5]

		const PWB_AutonomyQuestions = [15, 17, 18]
		const PWB_EnvironmentalQuestions = [4, 8, 9]
		const PWB_PersonalGrowthQuestions = [11, 12, 14]
		const PWB_PositiveRelationsQuestions = [6, 13, 16]
		const PWB_PurposeInLifeQuestions = [3, 7, 10]
		const PWB_selfAcceptanceQuestions = [1, 2, 5]

		const CH_PathwayMarks = calculateSumForCH(
			CH_PathwayQuestions,
			studentData.childrensHopeScale,
		)

		const CH_AgencyMarks = calculateSumForCH(CH_AgencyQuestions, studentData.childrensHopeScale)

		const PWB_AutonomyMarks = calculateSumForPWB(
			PWB_AutonomyQuestions,
			studentData.psychologicalWellBeingScale,
		)

		const PWB_EnvironmentalMarks = calculateSumForPWB(
			PWB_EnvironmentalQuestions,
			studentData.psychologicalWellBeingScale,
		)

		const PWB_PersonalGrowthMarks = calculateSumForPWB(
			PWB_PersonalGrowthQuestions,
			studentData.psychologicalWellBeingScale,
		)

		const PWB_PositiveRelationsMarks = calculateSumForPWB(
			PWB_PositiveRelationsQuestions,
			studentData.psychologicalWellBeingScale,
		)

		const PWB_PurposeInLifeMarks = calculateSumForPWB(
			PWB_PurposeInLifeQuestions,
			studentData.psychologicalWellBeingScale,
		)

		const PWB_SelfAcceptanceMarks = calculateSumForPWB(
			PWB_selfAcceptanceQuestions,
			studentData.psychologicalWellBeingScale,
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
			schoolName,
			user_id: studentData.user_id,
			isRatingReset: false,
			overallHopeScore: overallHopeScore,
			overallWellBeingScaleScore: overallWellBeingScaleScore,
			wellBeingAssessmentSubmissionDate: studentData.dateOfAssessment
				? studentData.dateOfAssessment
				: new Date(),

			childrensHopeScaleScore: studentData?.childrensHopeScale,
			psychologicalWellBeingScaleScore: studentData?.psychologicalWellBeingScale,
			isStudentsWellBeingFormSubmitted: true,
			CH_PathwayMarks,
			CH_AgencyMarks,

			PWB_AutonomyMarks,
			PWB_EnvironmentalMarks,
			PWB_PersonalGrowthMarks,
			PWB_PositiveRelationsMarks,
			PWB_PurposeInLifeMarks,
			PWB_SelfAcceptanceMarks,
		}
	}
}

const studentWellBeingService = new StudentWellBeingService()
module.exports.studentWellBeingService = studentWellBeingService
