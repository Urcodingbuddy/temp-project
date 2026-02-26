const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const asyncMiddleware = require('../../middleware/async')
const utils = require('../../utility/utils')
const { FailureResponse, SuccessResponse } = require('../../models/response/globalResponse')
const { authMyPeeguUser } = require('../../middleware/auth')
const { viewSchool, viewClassroom, viewStudents } = require('../../middleware/validate.management')
const { Schools } = require('../../models/database/myPeegu-school')
const { Students } = require('../../models/database/myPeegu-student')
const { COPEAssessment } = require('../../models/database/myPeegu-studentCOPEAssessment')
const { Teacher } = require('../../models/database/myPeegu-teacher')
const { WellBeingAssessment } = require('../../models/database/myPeegu-StudentWellBeing')
const { schoolAcYrService } = require('../../services/schools/schoolAcademicYears.service')
const { commonServices } = require('../../services/common-services/common-services')
const {
	studentCopeService,
} = require('../../services/\assessments/student-cope/student-cope-service')
const {
	studentWellBeingService,
} = require('../../services/assessments/student-wellbeing/student-wellbeing-service')
const { schoolsService } = require('../../services/schools/schools.service')
const { studentService } = require('../../services/students/students-service')
const { teacherService } = require('../../services/teachers/teacher.service')
const { classroomService } = require('../../services/classrooms/classrooms.service')
const { IRIForSchools } = require('../../models/database/IRI-for-schools')
const { globalServices } = require('../../services/global-service')
const { collections } = require('../../utility/databaseConstants')
const { studentReportService } = require('../../services/students/students-report.service')

router.get(
	'/school-academic-year/:school_id',
	authMyPeeguUser,
	viewSchool,
	asyncMiddleware(schoolAcYrService.viewSchoolAcademicYear),
)

router.get(
	'/states/:country_id',
	authMyPeeguUser,
	viewSchool,
	asyncMiddleware(commonServices.fetchStates),
)

router.post(
	'/listschool',
	authMyPeeguUser,
	viewSchool,
	asyncMiddleware(commonServices.fetchSchoolsList),
)

router.post(
	'/download-students-report',
	authMyPeeguUser,
	viewSchool,
	asyncMiddleware(studentReportService.fetchStudentsReport.bind(studentReportService)),
)

router.post(
	'/listclass',
	authMyPeeguUser,
	viewClassroom,
	asyncMiddleware(commonServices.fetchClassroomsList.bind(commonServices)),
)

router.post(
	'/listclassForStudents',
	authMyPeeguUser,
	viewClassroom,
	asyncMiddleware(commonServices.fetchClassForStudents.bind(commonServices)),
)

router.post(
	'/listsections',
	authMyPeeguUser,
	viewClassroom,
	asyncMiddleware(commonServices.fetchSectionsList.bind(commonServices)),
)

router.post(
	'/liststudents',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(commonServices.fetchStudentsList.bind(commonServices)),
)

// PAGINATION ADDED in viewallclassrooms, excel download functionality merged
router.post(
	'/viewallclassrooms',
	authMyPeeguUser,
	viewClassroom,
	asyncMiddleware(classroomService.fetchAllClassrooms.bind(classroomService)),
)

router.get(
	'/viewschool/:id',
	authMyPeeguUser,
	viewSchool,
	asyncMiddleware(async (req, res) => {
		if (!utils.isMongooseObjectId(req.params?.id))
			return res.status(400).json(new FailureResponse(globalConstants.messages.invalidId))
		let school
		if (
			req.user.isAdmin ||
			req.user.assignedSchools.map((id) => id.toString()).includes(req.params.id)
		) {
			school = await Schools.findOne({
				_id: req.params.id,
				status: globalConstants.schoolStatus.Active,
			})
			return res.json(school)
		} else {
			return res.status(400).json(new FailureResponse(globalConstants.messages.notFound))
		}
	}),
)

router.post(
	'/viewallstudents',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(studentService.fetchAllStudents.bind(studentService)),
)

router.post(
	'/viewallstudentsForSchoolActions',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(commonServices.fetchAllStudentsForSchoolActions.bind(commonServices)),
)

router.post(
	'/viewallTeachers',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(teacherService.viewAllTeachers.bind(teacherService)),
)

router.get(
	'/teacher-classrooms/:id',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(teacherService.fetchTeacherClassrooms.bind(teacherService)),
)

// PAGINATION ADDED in viewallschool , excel download functionality merged
router.post(
	'/viewallschool',
	authMyPeeguUser,
	viewSchool,
	asyncMiddleware(schoolsService.viewAllSchools.bind(schoolsService)),
)

router.get(
	'/getSingleStudentCopeAssessmentRecord/:_id',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(async (req, res) => {
		try {
			const _id = req.params._id

			if (!utils.isMongooseObjectId(_id)) {
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.provideValidId))
			}

			const studentCopeAssessment = await COPEAssessment.findOne({
				_id: new mongoose.Types.ObjectId(_id),
			}).populate({
				path: 'classRoomId',
				select: 'className section',
			})

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
				emotionRegulationST: parseFloat(
					studentCopeAssessment?.emotionRegulationST?.toFixed(2),
				),
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
				emotionRegulationLT: parseFloat(
					studentCopeAssessment?.emotionRegulationLT?.toFixed(2),
				),
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

				shortTermRegulation: parseFloat(
					studentCopeAssessment?.shortTermRegulation?.toFixed(2),
				),
				longTermRegulation: parseFloat(
					studentCopeAssessment?.longTermRegulation?.toFixed(2),
				),

				emotionRegulationST: parseFloat(
					studentCopeAssessment?.emotionRegulationST?.toFixed(2),
				),
				impulseControlST: parseFloat(studentCopeAssessment?.impulseControlST?.toFixed(2)),
				resilienceST: parseFloat(studentCopeAssessment?.resilienceST?.toFixed(2)),
				attentionST: parseFloat(studentCopeAssessment?.attentionST?.toFixed(2)),
				organisationST: parseFloat(studentCopeAssessment?.organisationST?.toFixed(2)),

				emotionRegulationLT: parseFloat(
					studentCopeAssessment?.emotionRegulationLT?.toFixed(2),
				),
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
		} catch (error) {
			console.error(error)
			return res.status(500).json(new FailureResponse(globalConstants.messages.serverError))
		}
	}),
)

router.patch(
	'/updateStudentCopeAssessmentRecord/:_id',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(async (req, res) => {
		try {
			const _id = req.params._id
			const { studentName, counsellorName, school, ratings, user_id, studentId } = req.body

			if (!utils.isMongooseObjectId(_id)) {
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.provideValidId))
			}

			let existingRecord = await COPEAssessment.findOne({
				_id: new mongoose.Types.ObjectId(_id),
			})

			if (!existingRecord) {
				const newCOPEAssessment = new COPEAssessment({
					studentName,
					studentId,
					counsellorName,
					school,
					ratings,
					isRatingReset: false,
					user_id,
				})

				await newCOPEAssessment.save()
				return res
					.status(201)
					.json(new SuccessResponse(globalConstants.messages.studentCopeRecordCreated))
			} else {
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
					const shortTermRegulationQuestions = [
						2, 6, 8, 9, 11, 13, 14, 16, 17, 18, 19, 21, 22,
					]
					const longTermRegulationQuestions = [
						3, 4, 12, 15, 20, 23, 25, 26, 27, 28, 29, 30, 31, 36,
					]

					const longTermRegulationMarks = ratings
						.filter((rating) =>
							longTermRegulationQuestions.includes(rating.questionNumber),
						)
						.map((rating) => rating.marks)

					const shortTermRegulationMarks = ratings
						.filter((rating) =>
							shortTermRegulationQuestions.includes(rating.questionNumber),
						)
						.map((rating) => rating.marks)
					existingRecord.shortTermRegulation =
						utils.calculateAverage(shortTermRegulationMarks)

					existingRecord.longTermRegulation =
						utils.calculateAverage(longTermRegulationMarks)

					existingRecord.emotionRegulationST =
						utils.calculateAverageForStudentCOPESubCategories([2, 8], ratings)
					existingRecord.impulseControlST =
						utils.calculateAverageForStudentCOPESubCategories([6], ratings)
					existingRecord.resilienceST = utils.calculateAverageForStudentCOPESubCategories(
						[9, 34, 11],
						ratings,
					)
					existingRecord.attentionST = utils.calculateAverageForStudentCOPESubCategories(
						[35, 13, 16, 18],
						ratings,
					)
					existingRecord.organisationST =
						utils.calculateAverageForStudentCOPESubCategories([14, 19, 21], ratings)

					existingRecord.emotionRegulationLT =
						utils.calculateAverageForStudentCOPESubCategories([12, 20, 27], ratings)
					existingRecord.impulseControlLT =
						utils.calculateAverageForStudentCOPESubCategories([15], ratings)
					existingRecord.resilienceLT = utils.calculateAverageForStudentCOPESubCategories(
						[3, 23, 29, 30, 31],
						ratings,
					)
					existingRecord.attentionLT = utils.calculateAverageForStudentCOPESubCategories(
						[26],
						ratings,
					)
					existingRecord.organisationLT =
						utils.calculateAverageForStudentCOPESubCategories([7], ratings)
				}

				await existingRecord.save()
				res.status(200).json(
					new SuccessResponse(globalConstants.messages.studentCopeRecordUpdated),
				)
			}
		} catch (error) {
			console.error(error)
			return res.status(500).json(new FailureResponse(globalConstants.messages.serverError))
		}
	}),
)

router.delete(
	'/deleteStudentCopeAssessmentRatings/:_id',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(async (req, res) => {
		try {
			const _id = req.params._id

			if (!utils.isMongooseObjectId(_id)) {
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.provideValidId))
			}

			const existingRecord = await COPEAssessment.findOne({
				_id: new mongoose.Types.ObjectId(_id),
			})

			if (!existingRecord) {
				return res
					.status(404)
					.json(new FailureResponse(globalConstants.messages.studentAssRecordNotFound))
			}

			existingRecord.ratings = []

			existingRecord.total = 0
			existingRecord.isRatingReset = true

			existingRecord.shortTermRegulation = 0
			existingRecord.longTermRegulation = 0

			existingRecord.emotionRegulationST = 0
			existingRecord.impulseControlST = 0
			existingRecord.resilienceST = 0
			existingRecord.attentionST = 0
			existingRecord.organisationST = 0

			existingRecord.emotionRegulationLT = 0
			existingRecord.impulseControlLT = 0
			existingRecord.resilienceLT = 0
			existingRecord.attentionLT = 0
			existingRecord.organisationLT = 0

			await existingRecord.save()

			res.status(200).json(
				new SuccessResponse(globalConstants.messages.studentCopeRecordDeleted),
			)
		} catch (error) {
			console.error(error)
			return res.status(500).json(new FailureResponse(globalConstants.messages.serverError))
		}
	}),
)

router.post('/bulkUploadStudentsWellBeingData', authMyPeeguUser, viewStudents, async (req, res) => {
	const payload = req.body
	const missingFields = []
	const encounteredStudentIds = new Set()
	const studentForValidation = payload.students
	const fieldDisplayNames = globalConstants.fieldDisplayNamesForStudentWellBeing
	const requiredFields = Object.keys(globalConstants.fieldDisplayNamesForStudentWellBeing)
	try {
		const studentUserIds = studentForValidation.map((student) => student.user_id)
		const StudentForUserId = await Students.find({
			status: globalConstants.schoolStatus.Active,
			user_id: { $in: studentUserIds },
		})
			.select('studentName user_id dob graduated exited classRoomId school')
			.populate({
				path: 'school',
				select: 'scCode',
			})
			.lean()
		const existingStudentWellBeingData = await WellBeingAssessment.find({
			user_id: { $in: studentUserIds },
		})

		const StudentMap = new Map(StudentForUserId.map((student) => [student.user_id, student]))

		const scCodes = studentForValidation.map((student) => student.scCode)
		const schools = await Schools.find({ scCode: { $in: scCodes } })
			.select('_id school scCode')
			.lean()
		const schoolMap = new Map(schools.map((school) => [school.scCode, school]))

		for (let i = 0; i < studentForValidation.length; i++) {
			const errors = []
			const student = studentForValidation[i]

			const missing = requiredFields.filter((field) => !student[field])

			if (missing.length > 0) {
				const missingError = `Row number ${i + 2} has invalid ${missing.map((field) => fieldDisplayNames[field]).join(', ')} field`
				errors.push(missingError)
			}

			const isStudentGraduated = StudentMap.get(student.user_id)?.graduated === true
			if (isStudentGraduated) {
				errors.push(
					`Student with user_id: ${student.user_id} is already Graduated at row number ${i + 2}`,
				)
			}
			const isStudentExited = StudentMap.get(student.user_id)?.exited === true
			if (isStudentExited) {
				errors.push(
					`Student with user_id: ${student.user_id} is already Exited at row number ${i + 2}`,
				)
			}

			if (student?.childrensHopeScale?.length !== 6) {
				const lengthError = `Children's Hope Scale report should consist of 6 questions for Row number ${i + 2} `
				errors.push(lengthError)
			}
			if (student?.psychologicalWellBeingScale?.length !== 18) {
				const lengthError = `Psychological Well-Being scale report should consist of 18 questions for Row number ${i + 2} `
				errors.push(lengthError)
			}
			if (encounteredStudentIds.has(student['user_id'])) {
				const duplicateError = `Row number ${i + 2} has duplicate Student Id field`
				errors.push(duplicateError)
			} else {
				encounteredStudentIds.add(student['user_id'])
			}
			if (
				student?.childrensHopeScale?.some((ass) => ass.marks < 1) ||
				student?.childrensHopeScale?.some((ass) => ass.marks > 6)
			) {
				const marksError = `Children's Hope Scale should be between 1 to 6 for Row number ${i + 2} `
				errors.push(marksError)
			}

			if (
				student?.psychologicalWellBeingScale?.some((ass) => ass.marks < 1) ||
				student?.psychologicalWellBeingScale?.some((ass) => ass.marks > 7)
			) {
				const marksError = `Psychological Well-Being scale should be between 1 to 7 for Row number ${i + 2} `
				errors.push(marksError)
			}

			const school = schoolMap.get(student.scCode)
			if (!school) {
				errors.push(`School not found for scCode: ${student.scCode} at row number ${i + 2}`)
			}
			const studentToFind = StudentMap.get(student.user_id)
			if (!studentToFind) {
				errors.push(
					`Student not found for user_id: ${student.user_id} at row number ${i + 2}`,
				)
			}
			if (studentToFind?.school?.scCode !== student.scCode) {
				errors.push(
					`Student with user_id: ${student.user_id} does not belong to school with scCode: ${student.scCode} at row number ${i + 2}`,
				)
			}
			const isStudentsWellBeingDataExist = existingStudentWellBeingData.filter(
				(t) => t.user_id === student.user_id,
			)

			// Check if any of the existing records have the same classRoomId as the student
			const hasSameClassRoomIdRecord = isStudentsWellBeingDataExist.some(
				(record) =>
					record.classRoomId.toString() ===
					StudentMap.get(student.user_id).classRoomId.toString(),
			)

			if (hasSameClassRoomIdRecord) {
				const teacherError = `Student Well-Being Assessment already exists for Student ID ${student.user_id} at row number ${i + 2}`
				errors.push(teacherError)
			}

			if (errors.length > 0) {
				missingFields.push(...errors)
			}
		}
		if (missingFields.length > 0) {
			return res.status(400).json({
				message: globalConstants.messages.invalidFileCheckError,
				validationErrors: missingFields,
				fileContainsError: true,
			})
		}

		const recordsToInsert = payload.students
			.map((studentData) => {
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

				const CH_AgencyMarks = calculateSumForCH(
					CH_AgencyQuestions,
					studentData.childrensHopeScale,
				)

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

				const schoolId = schoolMap.get(studentData.scCode)?._id
				const schoolName = schoolMap.get(studentData.scCode)?.school
				const student = StudentMap.get(studentData.user_id)
				const { _id: studentId, studentName, classRoomId } = student

				return {
					studentName,
					studentId,
					classRoomId: classRoomId,
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
			})
			.filter(Boolean)

		if (recordsToInsert.length > 0) {
			try {
				const result = await WellBeingAssessment.insertMany(recordsToInsert, {
					ordered: true,
					rawResult: false,
				})
				if (result) {
					res.json(
						new SuccessResponse(globalConstants.messages.studentWellBeingRecordCreated),
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
})

//Listing api for Students Well Being Data
router.post(
	'/getStudentWellBeingDataForSpecificSchool',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(
		studentWellBeingService.fetchStudentWellBeingRecords.bind(studentWellBeingService),
	),
)

//Update api for Students Well Being Data
router.patch(
	'/updateStudentWellBeingAssessmentRecord/:studentId',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(async (req, res) => {
		try {
			const studentId = req.params.studentId
			const { childrensHopeScale, psychologicalWellBeingScale } = req.body

			if (!utils.isMongooseObjectId(studentId)) {
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.provideValidId))
			}
			const student = await Students.findOne({ _id: { $in: studentId } }).select(
				'classRoomId',
			)
			let existingRecord = await WellBeingAssessment.findOne({
				studentId,
				classRoomId: student.classRoomId,
			})

			if (!existingRecord) {
				return res.status(404).json(new FailureResponse(globalConstants.messages.notFound))
			} else {
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
				await WellBeingAssessment.updateOne(
					{ studentId, classRoomId: student.classRoomId },
					{ $set: updateFields },
				)

				res.status(200).json(
					new SuccessResponse(globalConstants.messages.studentWellBeingRecordUpdated),
				)
			}
		} catch (error) {
			console.error(error)
			return res.status(500).json(new FailureResponse(globalConstants.messages.serverError))
		}
	}),
)

//Delete api for Students Well Being Data
router.delete(
	'/deleteStudentWellBeingAssessmentRatings/:_id',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(async (req, res) => {
		try {
			const _id = req.params._id
			if (!utils.isMongooseObjectId(_id)) {
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.provideValidId))
			}
			const existingRecord = await WellBeingAssessment.findOne({
				_id: new mongoose.Types.ObjectId(_id),
			})

			if (!existingRecord) {
				return res
					.status(404)
					.json(new FailureResponse(globalConstants.messages.studentAssRecordNotFound))
			} else {
				existingRecord.childrensHopeScaleScore = []
				existingRecord.psychologicalWellBeingScaleScore = []
				existingRecord.isRatingReset = true

				existingRecord.CH_PathwayMarks = 0
				existingRecord.CH_AgencyMarks = 0
				existingRecord.PWB_AutonomyMarks = 0
				existingRecord.PWB_EnvironmentalMarks = 0
				existingRecord.PWB_PersonalGrowthMarks = 0
				existingRecord.PWB_PositiveRelationsMarks = 0
				existingRecord.PWB_PurposeInLifeMarks = 0
				existingRecord.PWB_SelfAcceptanceMarks = 0
				existingRecord.overallHopeScore = 0
				existingRecord.overallWellBeingScaleScore = 0

				await existingRecord.save()

				res.status(200).json(
					new SuccessResponse(globalConstants.messages.studentWellBeingRecordDeleted),
				)
			}
		} catch (error) {
			console.error(error)
			return res.status(500).json(new FailureResponse(globalConstants.messages.serverError))
		}
	}),
)

//api for specific students well being data
router.post(
	'/getSingleStudentsWellBeingRecord',
	authMyPeeguUser,
	viewStudents,
	async (req, res) => {
		try {
			const { studentId, _id } = req.body
			if (!utils.isMongooseObjectId(studentId)) {
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.provideValidId))
			}
			if (!utils.isMongooseObjectId(_id)) {
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.provideValidId))
			}
			const student = await Students.findOne({ _id: studentId }).select('dob')
			const studentWBAssessment = await WellBeingAssessment.findOne({
				_id: new mongoose.Types.ObjectId(_id),
			})
			if (!studentWBAssessment) {
				return res.status(404).json(new FailureResponse(globalConstants.messages.notFound))
			} else {
				async function calculateWellBeingAverages(specificSchoolId, includeMatchStage) {
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
						averageScores.averageWellBeingScoreForSchool =
							result[0].averageWellBeingScore
					}

					if (!includeMatchStage) {
						const allSchoolsAverages = await calculateWellBeingAverages(null, true)
						averageScores.averageHopeScoreForAll = allSchoolsAverages.averageHopeScore
						averageScores.averageWellBeingScoreForAll =
							allSchoolsAverages.averageWellBeingScore
					}

					return averageScores
				}

				const inSchoolAverages = await calculateWellBeingAverages(
					studentWBAssessment.school,
					true,
				)

				const acrossSchoolAverages = await calculateWellBeingAverages(null, false)

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
				async function generatePWBPipeline(schoolId) {
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
				const urgent = {}
				const moderate = {}
				const high = {}

				const average_PWB_marks = await generatePWBPipeline(studentWBAssessment.school)

				const isAutonomyInadequate =
					studentWBAssessment.PWB_AutonomyMarks < average_PWB_marks.averageAutonomyMarks
				const isEnvironmentaInadequate =
					studentWBAssessment.PWB_EnvironmentalMarks <
					average_PWB_marks.averageEnvironmentalMarks
				const isPersonalGrowthInadequate =
					studentWBAssessment.PWB_PersonalGrowthMarks <
					average_PWB_marks.averagePersonalGrowthMarks
				const isPositiveRelationsInadequate =
					studentWBAssessment.PWB_PositiveRelationsMarks <
					average_PWB_marks.averagePositiveRelationsMarks
				const isPurposeInLifeInadequate =
					studentWBAssessment.PWB_PurposeInLifeMarks <
					average_PWB_marks.averagePurposeInLifeMarks
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
						PWB_PersonalGrowthMarks:
							studentWBAssessment?.PWB_PersonalGrowthMarks ?? null,
						PWB_PositiveRelationsMarks:
							studentWBAssessment?.PWB_PositiveRelationsMarks ?? null,
						PWB_PurposeInLifeMarks: studentWBAssessment?.PWB_PurposeInLifeMarks ?? null,
						PWB_SelfAcceptanceMarks:
							studentWBAssessment?.PWB_SelfAcceptanceMarks ?? null,
					},

					wellBeingAssessmentSubmissionDate:
						studentWBAssessment?.wellBeingAssessmentSubmissionDate,
					childrensHopeScaleScore: studentWBAssessment?.childrensHopeScaleScore,
					psychologicalWellBeingScaleScore:
						studentWBAssessment?.psychologicalWellBeingScaleScore,
				}
				return res.status(200).json(formattedResponse)
			}
		} catch (error) {
			console.error(error)
			return res.status(500).json(new FailureResponse(globalConstants.messages.serverError))
		}
	},
)

router.post('/bulkStudentDataInsertion', authMyPeeguUser, viewStudents, async (req, res) => {
	try {
		const payload = req.body
		const studentsCOPEMissingFields = []
		const encounteredStudentIds = new Set()
		const studentForValidation = payload.students
		const fieldDisplayNames = globalConstants.fieldDisplayNames
		const requiredFields = Object.keys(globalConstants.fieldDisplayNames)

		let newErrors = []
		for (let i = 0; i < studentForValidation.length; i++) {
			const errors = []
			const student = studentForValidation[i]
			const missing = requiredFields.filter((field) => !student[field])

			if (missing.length > 0) {
				const missingError = `Row number ${i + 2} has invalid ${missing.map((field) => fieldDisplayNames[field]).join(', ')} field`
				errors.push(missingError)
			}
			if (errors.length > 0) {
				newErrors.push(...errors)
			}
		}
		if (newErrors.length > 0) {
			return res.status(400).json({
				message: globalConstants.messages.invalidFileCheckError,
				validationErrors: newErrors,
				fileContainsError: true,
			})
		}

		const studentUserIds = studentForValidation.map((student) => student.user_id)
		const StudentForUserId = await Students.find({
			status: globalConstants.schoolStatus.Active,
			user_id: { $in: studentUserIds },
		})
			.select('studentName user_id graduated exited classRoomId school')
			.populate({
				path: 'school',
				select: 'scCode',
			})
			.lean()
		const existingStudentCOPE = await COPEAssessment.find({
			user_id: { $in: studentUserIds },
		})

		const StudentMap = new Map(StudentForUserId.map((student) => [student.user_id, student]))

		const scCodes = studentForValidation.map((student) => student.scCode)
		const schools = await Schools.find({ scCode: { $in: scCodes } })
			.select('school scCode')
			.lean()
		const schoolMap = new Map(schools.map((school) => [school.scCode, school]))

		for (let i = 0; i < studentForValidation.length; i++) {
			const errors = []
			const student = studentForValidation[i]
			if (student?.ratings?.length !== 36) {
				const lengthError = `Student COPE report should consist of 36 questions for Row number ${i + 2} `
				errors.push(lengthError)
			}

			const isStudentGraduated = StudentMap.get(student.user_id)?.graduated === true
			if (isStudentGraduated) {
				errors.push(
					`Student with user_id: ${student.user_id} is already Graduated at row number ${i + 2}`,
				)
			}
			const isStudentExited = StudentMap.get(student.user_id)?.exited === true
			if (isStudentExited) {
				errors.push(
					`Student with user_id: ${student.user_id} is already Exited at row number ${i + 2}`,
				)
			}

			if (encounteredStudentIds.has(student['user_id'])) {
				const duplicateError = `Row number ${i + 2} has duplicate Student Id field`
				errors.push(duplicateError)
			} else {
				encounteredStudentIds.add(student['user_id'])
			}
			if (
				student?.ratings?.some((ass) => ass.marks < 1) ||
				student?.ratings?.some((ass) => ass.marks > 5)
			) {
				const marksError = `COPE Assessment Marks should be between 1 to 5 for Row number ${i + 2} `
				errors.push(marksError)
			}

			const school = schoolMap.get(student.scCode)
			if (!school) {
				errors.push(`School not found for scCode: ${student.scCode} at row number ${i + 2}`)
			}
			const studentToFind = StudentMap.get(student.user_id)
			if (!studentToFind) {
				errors.push(
					`Student not found for user_id: ${student.user_id} at row number ${i + 2}`,
				)
			}
			if (studentToFind?.school?.scCode !== student.scCode) {
				errors.push(
					`Student with user_id: ${student.user_id} does not belong to school with scCode: ${student.scCode} at row number ${i + 2}`,
				)
			}
			const existingStudentCopeRecords = existingStudentCOPE.filter(
				(t) => t.user_id === student.user_id,
			)

			// Check if any of the existing records have the same classRoomId as the student
			const hasSameClassRoomIdRecord = existingStudentCopeRecords.some(
				(record) =>
					record.classRoomId.toString() ===
					StudentMap.get(student.user_id).classRoomId.toString(),
			)

			if (hasSameClassRoomIdRecord) {
				const teacherError = `Student COPE Assessment already exists for Student ID ${student.user_id} at row number ${i + 2}`
				errors.push(teacherError)
			}

			if (errors.length > 0) {
				studentsCOPEMissingFields.push(...errors)
			}
		}
		if (studentsCOPEMissingFields.length > 0) {
			return res.status(400).json({
				message: globalConstants.messages.invalidFileCheckError,
				validationErrors: studentsCOPEMissingFields,
				fileContainsError: true,
			})
		}

		const schoolsMap = new Map(
			(
				await Schools.find({ scCode: { $in: scCodes } })
					.select('_id scCode school')
					.lean()
			).map((school) => [school.scCode, school]),
		)

		const studentsMap = new Map(
			(await Students.find({ user_id: { $in: studentUserIds } }).lean()).map((student) => [
				student.user_id,
				student,
			]),
		)

		const recordsToInsert = payload.students
			.map((studentData) => {
				if (studentData?.ratings?.some((ass) => ass.marks > 5)) {
					return res
						.status(404)
						.json(new FailureResponse(globalConstants.messages.studentCOPEMarksError))
				}
				const COPEMarks = studentData?.ratings?.map((ass) => ass.marks)

				const studentsCOPEMarksAvg = utils.calculateAverage(COPEMarks)
				const shortTermRegulationQuestions = [
					2, 6, 8, 9, 11, 13, 14, 16, 17, 18, 19, 21, 22,
				]
				const longTermRegulationQuestions = [
					3, 4, 12, 15, 20, 23, 25, 26, 27, 28, 29, 30, 31, 36,
				]

				const shortTermRegulationMarks = studentData.ratings
					.filter((rating) =>
						shortTermRegulationQuestions.includes(rating.questionNumber),
					)
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

				const schoolId = schoolsMap.get(studentData.scCode)?._id
				const schoolName = schoolsMap.get(studentData.scCode)?.school
				const student = studentsMap.get(studentData.user_id)
				const { _id: studentId, studentName, classRoomId } = student

				return {
					studentName,
					studentId,
					classRoomId: classRoomId,
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

					createdAt: studentData.dateOfAssessment
						? studentData.dateOfAssessment
						: new Date(),
				}
			})
			.filter(Boolean)
		if (recordsToInsert.length > 0) {
			try {
				const result = await COPEAssessment.insertMany(recordsToInsert, {
					ordered: true,
					rawResult: false,
				})

				if (result) {
					res.json(new SuccessResponse(globalConstants.messages.studentCopeRecordCreated))
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
})

// Teacher Bulk Data Insertion
router.post(
	'/bulkTeacherDataInsertion',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(teacherService.uploadTeachers.bind(teacherService)),
)

router.post('/getTeachersForSpecificSchool', authMyPeeguUser, viewStudents, async (req, res) => {
	const searchFields = ['teacherName', 'teacher_id']
	let sortFields = globalConstants.teacherSortFields
	const downloadAndFilter = req.query.downloadAndFilter === 'true' || false
	let totalCount = 0
	try {
		let sortCriteria
		const { SchoolId, searchText, filter, sortKeys, pageSize, page } = req.body
		if (!SchoolId) {
			res.status(400).json(new FailureResponse(globalConstants.messages.noSchoolIdProvided))
		}
		const PAGE_SIZE = pageSize || 10
		const currentPage = page || 1

		const skip = (currentPage - 1) * PAGE_SIZE
		const query = {
			SchoolId,
			isDeleted: { $ne: true },
		}
		if (searchText) {
			const searchQuery = utils.buildSearchQuery(searchText, searchFields)
			query.$or = searchQuery.$or
		}
		if (sortKeys) {
			sortCriteria = utils.buildSortOptions(req.body, sortFields)
		}
		if (filter) {
			if (filter.gender) {
				query.gender = filter.gender
			}
			if (filter.formStatusOnIRISubDate) {
				query.formStatusOnIRISubDate = filter.formStatusOnIRISubDate
			}
			if (filter.IRISubDate) {
				const startDate = new Date(filter.IRISubDate)
				startDate.setUTCHours(0, 0, 0, 0)
				const endDate = new Date(filter.IRISubDate)
				endDate.setUTCHours(23, 59, 59, 999)

				if (!isNaN(endDate.getTime())) {
					query.IRISubDate = {
						$gte: startDate,
						$lte: endDate,
					}
				}
			}
			if (filter?.formStatusOnProfilingSubDate) {
				query.formStatusOnProfilingSubDate = filter.formStatusOnProfilingSubDate
			}

			if (filter?.days || filter?.days === 1) {
				const today = new Date()
				today.setUTCHours(0, 0, 0, 0)
				const endOfDay = new Date()
				endOfDay.setUTCHours(23, 59, 59, 999)

				query.ProfilingSubDate = {
					$gte: today,
					$lte: endOfDay,
				}
			} else if (filter?.days || filter?.days === 2) {
				const today = new Date()
				today.setUTCHours(0, 0, 0, 0)
				const sevenDaysAgo = new Date(today)
				sevenDaysAgo.setDate(today.getDate() - 7)

				query.ProfilingSubDate = {
					$gte: sevenDaysAgo,
					$lte: today,
				}
			} else if (filter?.days || filter?.days === 3) {
				const today = new Date()
				today.setUTCHours(0, 0, 0, 0)
				const thirtyDaysAgo = new Date(today)
				thirtyDaysAgo.setDate(today.getDate() - 30)

				query.ProfilingSubDate = {
					$gte: thirtyDaysAgo,
					$lte: today,
				}
			} else if (filter?.days || filter?.days === 4) {
				const currentYear = new Date().getFullYear()
				query.ProfilingSubDate = {
					$gte: new Date(`${currentYear}-01-01`),
					$lte: new Date(`${currentYear}-12-31T23:59:59`),
				}
			} else {
				if (filter.startDate && filter.endDate) {
					if (
						!(utils.isValidDate(filter.startDate) && utils.isValidDate(filter.endDate))
					) {
						return res
							.status(400)
							.json(new FailureResponse(globalConstants.messages.invalidDate))
					} else {
						let currentDate = new Date(req.body.filter.endDate) ?? new Date()
						let pastDate = new Date(req.body.filter.startDate)
						days = { $gte: pastDate, $lte: currentDate }
						query.ProfilingSubDate = days
					}
				}
			}
		}
		if (downloadAndFilter) {
			const teachers = await Teacher.find(query)
				.select(
					'teacher_id teacherName schoolName IRISubDate formStatusOnIRISubDate gender ProfilingSubDate formStatusOnProfilingSubDate status',
				)
				.collation({ locale: 'en' })
				.sort(sortCriteria)

			const formattedData = teachers.map((item) => utils.formatTeacherData(item, true, true))
			return res.json(formattedData)
		} else {
			const teachers = await Teacher.find(query)
				.select(
					'teacher_id teacherName schoolName IRISubDate formStatusOnIRISubDate gender ProfilingSubDate formStatusOnProfilingSubDate status',
				)
				.sort(sortCriteria)
				.skip(skip)
				.limit(PAGE_SIZE)
			totalCount = await Teacher.countDocuments(query)
			res.json({ data: teachers, page: currentPage, pageSize: PAGE_SIZE, totalCount })
		}
	} catch (error) {
		console.error(error)
		return res.status(500).json(new FailureResponse(globalConstants.messages.serverError))
	}
})

router.post(
	'/schoolRankingsBasedOnTeachersIRI',
	authMyPeeguUser,
	viewStudents,
	async (req, res) => {
		try {
			// ------------------------------------------------------------
			// A) Inputs & user scoping
			// ------------------------------------------------------------

			// A.1) Academic Year (default to current AY) — handle empty string safely
			const curAY = await globalServices.getCurrentAcademicYear()
			let academicYearId
			if (req.body.academicYear && req.body.academicYear.trim() !== '') {
				academicYearId = new mongoose.Types.ObjectId(req.body.academicYear)
			} else if (curAY?._id) {
				academicYearId = new mongoose.Types.ObjectId(curAY._id.toString())
			} else {
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.serverError))
			}

			// A.2) Schools assigned to logged-in user (we filter final output by this)
			const userSchools = await globalServices.getUserSchools(req)
			const userSchoolSet = new Set((userSchools || []).map((s) => s.toString()))

			// A.3) Platform-wide active schools (we rank against ALL fully-submitted active schools)
			const activeSchoolIds = await Schools.find({ status: 'Active' })
				.select('_id')
				.lean()
				.then((rows) => rows.map((r) => r._id))

			// B) Base query for fully-submitted IRIForSchools in the requested AY
			const baseQuery = {
				school: { $in: activeSchoolIds },
				academicYear: academicYearId,
				totalTeacherCount: { $gt: 0 }, // must be > 0
				//  $expr: { $eq: ['$totalTeacherCount', '$submittedTeacherCount'] }, // fully submitted for now removing this condition of fully submitted only to consider.
			}

			// Optionally: resolve actual collection names from Mongoose (recommended)
			const IRI_FOR_TEACHERS_COLL = collections.iriForTeachers
			const TEACHERS_COLL = collections.teacher
			const SCHOOLS_COLL = collections.schools

			// ------------------------------------------------------------
			// C) Aggregate per IRIForSchool (one row per fully-submitted school)
			// ------------------------------------------------------------
			const rankedSchools = await IRIForSchools.aggregate([
				// C.1) Filter to fully submitted IRI rows within active schools & AY
				{ $match: baseQuery },

				// C.2) Bring school name
				{
					$lookup: {
						from: SCHOOLS_COLL,
						localField: 'school',
						foreignField: '_id',
						pipeline: [{ $project: { school: 1 } }], // 'school' assumed to be the name field
						as: 'schoolDoc',
					},
				},
				{
					$addFields: {
						schoolName: { $ifNull: [{ $arrayElemAt: ['$schoolDoc.school', 0] }, ''] },
					},
				},

				// C.3) Lookup teacher IRI forms for this IRI record (latest per teacher),
				//      then lookup teachers to fetch gender; keep minimal fields
				{
					$lookup: {
						from: IRI_FOR_TEACHERS_COLL,
						let: { sid: '$_id' }, // IRIForSchools._id
						pipeline: [
							{ $match: { $expr: { $eq: ['$schoolIRIId', '$$sid'] } } },
							{ $sort: { createdAt: -1 } },
							{ $group: { _id: '$teacher', doc: { $first: '$$ROOT' } } },
							{ $replaceRoot: { newRoot: '$doc' } },
							{
								$lookup: {
									from: TEACHERS_COLL,
									localField: 'teacher',
									foreignField: '_id',
									pipeline: [{ $project: { gender: 1 } }],
									as: 'tDoc',
								},
							},
							{
								$addFields: {
									gender: {
										$ifNull: [{ $arrayElemAt: ['$tDoc.gender', 0] }, null],
									},
									isSubmitted: { $eq: ['$formStatus', 'Submitted'] },
								},
							},
							{
								$project: {
									_id: 0,
									gender: 1,
									isSubmitted: 1,
									perspectiveNP: 1,
									fantasyNP: 1,
									empathicNP: 1,
									personalDistressNP: 1,
								},
							},
						],
						as: 'teacherData',
					},
				},

				// C.4) Collapse by school (keep first if duplicates)
				{
					$group: {
						_id: '$school', // expose as schoolId
						schoolName: { $first: '$schoolName' },
						schoolId: { $first: '$school' },
						totalTeacherCount: { $first: '$totalTeacherCount' },
						submittedTeacherCount: { $first: '$submittedTeacherCount' },
						teacherData: { $first: '$teacherData' },
					},
				},

				// ---- IMPORTANT: split into multiple $addFields stages ----
				// Stage D1: build slices only
				{
					$addFields: {
						submittedTeachers: {
							$filter: {
								input: '$teacherData',
								as: 't',
								cond: { $eq: ['$$t.isSubmitted', true] },
							},
						},
						maleTeachers: {
							$filter: {
								input: '$teacherData',
								as: 't',
								cond: { $regexMatch: { input: '$$t.gender', regex: /^male$/i } },
							},
						},
						femaleTeachers: {
							$filter: {
								input: '$teacherData',
								as: 't',
								cond: { $regexMatch: { input: '$$t.gender', regex: /^female$/i } },
							},
						},
					},
				},

				// Stage D2: counts/totals derived from slices
				{
					$addFields: {
						// counts
						totalSubmittedTeacherCount: {
							$size: { $ifNull: ['$submittedTeachers', []] },
						},
						totalPendingTeacherCount: {
							$max: [
								0,
								{
									$subtract: [
										'$totalTeacherCount',
										{ $size: { $ifNull: ['$submittedTeachers', []] } },
									],
								},
							],
						},
						maleSubmittedCount: {
							$size: {
								$ifNull: [
									{
										$filter: {
											input: '$maleTeachers',
											as: 't',
											cond: { $eq: ['$$t.isSubmitted', true] },
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
											as: 't',
											cond: { $eq: ['$$t.isSubmitted', true] },
										},
									},
									[],
								],
							},
						},

						// totals over submitted teachers
						totalPerspective: {
							$sum: { $ifNull: ['$submittedTeachers.perspectiveNP', []] },
						},
						totalFantasy: { $sum: { $ifNull: ['$submittedTeachers.fantasyNP', []] } },
						totalEmpathic: { $sum: { $ifNull: ['$submittedTeachers.empathicNP', []] } },
						totalPersonalDistress: {
							$sum: { $ifNull: ['$submittedTeachers.personalDistressNP', []] },
						},
					},
				},

				// Stage D3: compute school-level scales, gender averages, averageScore, topScores
				{
					$addFields: {
						// school-level scales
						perspectiveTakingNPScaleForSchool: {
							$cond: [
								{ $eq: ['$totalSubmittedTeacherCount', 0] },
								0,
								{ $divide: ['$totalPerspective', '$totalSubmittedTeacherCount'] },
							],
						},
						fantasyNPScaleForSchool: {
							$cond: [
								{ $eq: ['$totalSubmittedTeacherCount', 0] },
								0,
								{ $divide: ['$totalFantasy', '$totalSubmittedTeacherCount'] },
							],
						},
						empathicConcernNPScaleForSchool: {
							$cond: [
								{ $eq: ['$totalSubmittedTeacherCount', 0] },
								0,
								{ $divide: ['$totalEmpathic', '$totalSubmittedTeacherCount'] },
							],
						},
						personalDistressNPScaleForSchool: {
							$cond: [
								{ $eq: ['$totalSubmittedTeacherCount', 0] },
								0,
								{
									$divide: [
										'$totalPersonalDistress',
										'$totalSubmittedTeacherCount',
									],
								},
							],
						},

						// gender avgs (submitted only)
						maleAvg: {
							empathicConcern: {
								$cond: [
									{ $eq: ['$maleSubmittedCount', 0] },
									0,
									{
										$divide: [
											{
												$sum: {
													$map: {
														input: {
															$filter: {
																input: '$maleTeachers',
																as: 't',
																cond: {
																	$eq: ['$$t.isSubmitted', true],
																},
															},
														},
														as: 'm',
														in: '$$m.empathicNP',
													},
												},
											},
											'$maleSubmittedCount',
										],
									},
								],
							},
							fantasyScale: {
								$cond: [
									{ $eq: ['$maleSubmittedCount', 0] },
									0,
									{
										$divide: [
											{
												$sum: {
													$map: {
														input: {
															$filter: {
																input: '$maleTeachers',
																as: 't',
																cond: {
																	$eq: ['$$t.isSubmitted', true],
																},
															},
														},
														as: 'm',
														in: '$$m.fantasyNP',
													},
												},
											},
											'$maleSubmittedCount',
										],
									},
								],
							},
							personalDistressScale: {
								$cond: [
									{ $eq: ['$maleSubmittedCount', 0] },
									0,
									{
										$divide: [
											{
												$sum: {
													$map: {
														input: {
															$filter: {
																input: '$maleTeachers',
																as: 't',
																cond: {
																	$eq: ['$$t.isSubmitted', true],
																},
															},
														},
														as: 'm',
														in: '$$m.personalDistressNP',
													},
												},
											},
											'$maleSubmittedCount',
										],
									},
								],
							},
							perspectiveTakingScale: {
								$cond: [
									{ $eq: ['$maleSubmittedCount', 0] },
									0,
									{
										$divide: [
											{
												$sum: {
													$map: {
														input: {
															$filter: {
																input: '$maleTeachers',
																as: 't',
																cond: {
																	$eq: ['$$t.isSubmitted', true],
																},
															},
														},
														as: 'm',
														in: '$$m.perspectiveNP',
													},
												},
											},
											'$maleSubmittedCount',
										],
									},
								],
							},
						},

						femaleAvg: {
							empathicConcern: {
								$cond: [
									{ $eq: ['$femaleSubmittedCount', 0] },
									0,
									{
										$divide: [
											{
												$sum: {
													$map: {
														input: {
															$filter: {
																input: '$femaleTeachers',
																as: 't',
																cond: {
																	$eq: ['$$t.isSubmitted', true],
																},
															},
														},
														as: 'f',
														in: '$$f.empathicNP',
													},
												},
											},
											'$femaleSubmittedCount',
										],
									},
								],
							},
							fantasyScale: {
								$cond: [
									{ $eq: ['$femaleSubmittedCount', 0] },
									0,
									{
										$divide: [
											{
												$sum: {
													$map: {
														input: {
															$filter: {
																input: '$femaleTeachers',
																as: 't',
																cond: {
																	$eq: ['$$t.isSubmitted', true],
																},
															},
														},
														as: 'f',
														in: '$$f.fantasyNP',
													},
												},
											},
											'$femaleSubmittedCount',
										],
									},
								],
							},
							personalDistressScale: {
								$cond: [
									{ $eq: ['$femaleSubmittedCount', 0] },
									0,
									{
										$divide: [
											{
												$sum: {
													$map: {
														input: {
															$filter: {
																input: '$femaleTeachers',
																as: 't',
																cond: {
																	$eq: ['$$t.isSubmitted', true],
																},
															},
														},
														as: 'f',
														in: '$$f.personalDistressNP',
													},
												},
											},
											'$femaleSubmittedCount',
										],
									},
								],
							},
							perspectiveTakingScale: {
								$cond: [
									{ $eq: ['$femaleSubmittedCount', 0] },
									0,
									{
										$divide: [
											{
												$sum: {
													$map: {
														input: {
															$filter: {
																input: '$femaleTeachers',
																as: 't',
																cond: {
																	$eq: ['$$t.isSubmitted', true],
																},
															},
														},
														as: 'f',
														in: '$$f.perspectiveNP',
													},
												},
											},
											'$femaleSubmittedCount',
										],
									},
								],
							},
						},

						// top scores among submitted teachers
						topScores: {
							perspectiveTakingScale: { $max: '$submittedTeachers.perspectiveNP' },
							fantasyScale: { $max: '$submittedTeachers.fantasyNP' },
							empathicConcernScale: { $max: '$submittedTeachers.empathicNP' },
							personalDistressScale: {
								$max: '$submittedTeachers.personalDistressNP',
							},
						},
					},
				},

				// Stage D3.6: Robust averageScore from coerced scales
				{
					$addFields: {
						averageScore: {
							$divide: [
								{
									$add: [
										'$perspectiveTakingNPScaleForSchool',
										'$fantasyNPScaleForSchool',
										'$empathicConcernNPScaleForSchool',
										'$personalDistressNPScaleForSchool',
									],
								},
								4,
							],
						},
					},
				},

				// C.5) Final projection (response shape stays the same)
				{
					$project: {
						_id: 0,
						schoolId: 1, // equals IRIForSchools.school
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

			console.log(`Total ranked schools: ${JSON.stringify(rankedSchools)}`)

			// ------------------------------------------------------------
			// D) Rankings & percentiles (computed over full platform set)
			// ------------------------------------------------------------
			rankedSchools.sort((a, b) => b.averageScore - a.averageScore)

			const scales = [
				'perspectiveTakingNPScaleForSchool',
				'fantasyNPScaleForSchool',
				'empathicConcernNPScaleForSchool',
				'personalDistressNPScaleForSchool',
			]

			// Percentile per scale
			scales.forEach((scale) => {
				const sorted = rankedSchools.slice().sort((a, b) => a[scale] - b[scale])
				const totalCount = sorted.length
				const uniqueScores = {}

				sorted.forEach((school, index) => {
					const score = school[scale]
					if (!(score in uniqueScores)) uniqueScores[score] = { count: 0, sumRanks: 0 }
					uniqueScores[score].count++
					uniqueScores[score].sumRanks += index + 1
				})

				for (const score in uniqueScores) {
					const obj = uniqueScores[score]
					const percentile = (obj.sumRanks / obj.count / totalCount) * 100
					sorted.forEach((school) => {
						if (school[scale] === Number(score)) {
							school[`${scale}Percentile`] = percentile
						}
					})
				}
			})

			// Percentile for overall averageScore
			const forAvg = rankedSchools.slice().sort((a, b) => a.averageScore - b.averageScore)
			{
				const totalCount = forAvg.length
				let previousScore = null
				let rankSum = 0
				let count = 0

				forAvg.forEach((school, index) => {
					if (school.averageScore !== previousScore) {
						if (previousScore !== null) {
							const averageRank = rankSum / count
							const percentile = (averageRank / totalCount) * 100
							for (let i = index - count; i < index; i++) {
								forAvg[i].percentile = percentile
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

				if (previousScore !== null) {
					const averageRank = rankSum / count
					const percentile = (averageRank / totalCount) * 100
					for (let i = forAvg.length - count; i < forAvg.length; i++) {
						forAvg[i].percentile = percentile
					}
				}
			}

			// ------------------------------------------------------------
			// E) Build response, then FILTER to user's assigned schools
			// ------------------------------------------------------------
			const allComputed = rankedSchools.map((school) => ({
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

				perspectiveTakingPercentile: school?.perspectiveTakingNPScaleForSchoolPercentile,
				fantasyScalePercentile: school?.fantasyNPScaleForSchoolPercentile,
				empathicConcernPercentile: school?.empathicConcernNPScaleForSchoolPercentile,
				personalDistressPercentile: school?.personalDistressNPScaleForSchoolPercentile,
			}))

			const subScaleWisePerformanceOfSchools = allComputed.filter((row) =>
				userSchoolSet.has(row._id),
			)

			return res.json({ subScaleWisePerformanceOfSchools })
		} catch (error) {
			console.error({ error })
			return res.status(500).json(new FailureResponse(globalConstants.messages.serverError))
		}
	},
)

module.exports = router
