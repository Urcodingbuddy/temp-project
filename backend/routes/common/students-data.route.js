const express = require('express')
const router = express.Router()
const { authMyPeeguUser } = require('../../middleware/auth')
const asyncMiddleware = require('../../middleware/async')
const {
	viewStudents,
	viewBaseline,
	canViewedByTeacherOrHigherUser,
} = require('../../middleware/validate.counselorManagement')
const { baselineAnalyticService } = require('../../services/baseline/baseline-analytics-service')
const { baselineService } = require('../../services/baseline/baseline-service')
const { observationServices } = require('../../services/observation/observation.service')
const { individualService } = require('../../services/individual/individual.service')
const { selServices } = require('../../services/sel/sel-service')
const { sendChecklistService } = require('../../services/send-checklist/send-checklist-service')
const { iepService } = require('../../services/IEP/IEP-service')
const {
	studentCopeService,
} = require('../../services/assessments/student-cope/student-cope-service')
const {
	studentWellBeingService,
} = require('../../services/assessments/student-wellbeing/student-wellbeing-service')
const {
	schoolProfilingService,
} = require('../../services/assessments/teacher-profiling/profilingForSchools.service')
const {
	teacherProfilingService,
} = require('../../services/assessments/teacher-profiling/profilingForTeachers.service')
const { schoolIRIService } = require('../../services/assessments/teacher-iri/iriForSchools.service')
const {
	teacherIRIService,
} = require('../../services/assessments/teacher-iri/iriForTeachers.service')

// -------------------------------- Observation --------------------------------------
router.post(
	'/observations-list',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(observationServices.fetchObservationsList.bind(observationServices)),
)

router.get(
	'/observation-record/:id',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(observationServices.fetchObservationDetails.bind(observationServices)),
)

// -------------------------------- IndividualCase --------------------------------------
router.post(
	'/individualcase-list',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(individualService.fetchIndividualCaseList.bind(individualService)),
)

router.get(
	'/individualcase-record/:id',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(individualService.fetchIndividualCaseDetails.bind(individualService)),
)

// -------------------------------- Baseline --------------------------------------
router.post(
	'/baseline-list',
	authMyPeeguUser,
	viewBaseline,
	asyncMiddleware(baselineService.fetchBaselineRecordsList.bind(baselineService)),
)

// -------------------------------- Baseline Analytics --------------------------------------
router.post(
	'/single-record-baseline-analytics',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(
		baselineAnalyticService.singleStudentBaselineAnalytics.bind(baselineAnalyticService),
	),
)

router.post(
	'/baseline-analytics-all-schools',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(
		baselineAnalyticService.allSchoolsBaselineAnalytics.bind(baselineAnalyticService),
	),
)

router.post(
	'/baseline-analytics-one-school',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(
		baselineAnalyticService.singleSchoolsBaselineAnalytics.bind(baselineAnalyticService),
	),
)

router.post(
	'/baseline-students-by-screening-status',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(
		baselineAnalyticService.getStudentsByScreeningStatus.bind(baselineAnalyticService),
	),
)

router.post(
	'/baseline-risk-dashboard',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(
		baselineAnalyticService.getRiskDashboardData.bind(baselineAnalyticService),
	),
)

router.post(
	'/baseline-students-by-support-level',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(
		baselineAnalyticService.getStudentsBySupportLevel.bind(baselineAnalyticService),
	),
)

router.post(
	'/baseline-analytics-export',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(
		baselineAnalyticService.getDetailedExportData.bind(baselineAnalyticService),
	),
)

// -------------------------------- SEL Curriculum Trackers --------------------------------------
router.post(
	'/sel-curriculum-tracker-list',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(selServices.fetchSELList.bind(selServices)),
)

router.get(
	'/sel-curriculum-tracker/:id',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(selServices.fetchSELCurriculumTrackerDetails.bind(selServices)),
)

// -------------------------------- Send Checklist --------------------------------------
router.post(
	'/checklist-records',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(sendChecklistService.fetchSendChecklistRecords.bind(sendChecklistService)),
)

router.post(
	'/all-schools-send-checklist-analytics',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(
		sendChecklistService.getAllSchoolsSendChecklistAnalytics.bind(sendChecklistService),
	),
)

router.post(
	'/single-school-send-checklist-analytics',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(
		sendChecklistService.getOneSchoolsSendChecklistAnalytics.bind(sendChecklistService),
	),
)

// -------------------------------- IEP Education planner --------------------------------------
router.post(
	'/iep-records',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(iepService.fetchIEPRecords.bind(iepService)),
)

router.post(
	'/iep-record',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(iepService.fetchIEPRecord.bind(iepService)),
)

router.post(
	'/get-pre-signed-url',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(iepService.getPresignedUrlForIep.bind(iepService)),
)

router.post(
	'/baseline-performance',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(iepService.fetchBaselinePerformance.bind(iepService)),
)

router.post(
	'/verify-checklist-data',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(iepService.verifyChecklistData.bind(iepService)),
)

// -------------------------------- Students Cope --------------------------------------
router.post(
	'/student-cope-records',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(studentCopeService.fetchStudentCopeList.bind(studentCopeService)),
)

router.get(
	'/student-cope-record/:id',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(studentCopeService.fetchStudentCope.bind(studentCopeService)),
)

router.post(
	'/student-cope-analytics-schools',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(
		studentCopeService.fetchStudentCopeAnalyticsForSchools.bind(studentCopeService),
	),
)

router.post(
	'/student-cope-analytics-classrooms',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(
		studentCopeService.fetchStudentCopeAnalyticsForClassrooms.bind(studentCopeService),
	),
)

// -------------------------------- Students WellBeing --------------------------------------
router.post(
	'/student-wb-records',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(
		studentWellBeingService.fetchStudentWellBeingRecords.bind(studentWellBeingService),
	),
)

router.get(
	'/student-wb-record/:id',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(studentWellBeingService.fetchStudentWB.bind(studentWellBeingService)),
)

router.post(
	'/student-wb-analytics-schools',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(
		studentWellBeingService.fetchStudentWellBeingAnalyticsForSchools.bind(
			studentWellBeingService,
		),
	),
)

router.post(
	'/student-wb-analytics-classrooms',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(
		studentWellBeingService.fetchStudentWellBeingAnalyticsForClassrooms.bind(
			studentWellBeingService,
		),
	),
)

// -------------------------------- Teacher Profilings --------------------------------------
router.post(
	'/profilings-for-schools',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(
		schoolProfilingService.fetchAllProfilingsForSchools.bind(schoolProfilingService),
	),
)

router.post(
	'/fetch-teacher-profiling',
	authMyPeeguUser,
	canViewedByTeacherOrHigherUser,
	asyncMiddleware(
		teacherProfilingService.fetchSingleTeacherProfiling.bind(schoolProfilingService),
	),
)

router.post(
	'/profilings-for-teachers',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(
		teacherProfilingService.fetchAllProfilingsForTeacher.bind(teacherProfilingService),
	),
)

router.post(
	'/fetch-profiling-analytics',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(
		teacherProfilingService.fetchProfilingAnalytics.bind(teacherProfilingService),
	),
)

// -------------------------------- Teacher IRI --------------------------------------
router.post(
	'/iri-for-schools',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(schoolIRIService.fetchAllIRIsForSchools.bind(schoolIRIService)),
)

router.post(
	'/iris-for-teachers',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(teacherIRIService.fetchAllIRIsForTeacher.bind(teacherIRIService)),
)

router.post(
	'/fetch-teacher-iri',
	authMyPeeguUser,
	canViewedByTeacherOrHigherUser,
	asyncMiddleware(teacherIRIService.fetchSingleTeacherIRI.bind(teacherIRIService)),
)

module.exports = router
