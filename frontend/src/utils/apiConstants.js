export const apiMethods = {
	get: 'get',
	patch: 'patch',
	post: 'post',
	put: 'put',
	delete: 'delete',
}

export const apiHeaders = {
	acceptType: 'application/json',
	deviceType: 'device-type',
	web: 'Web',
	preventDefaultLoader: 'prevent-default-loader',
	preventDefaultToast: 'prevent-default-toast',
	authToken: 'auth-token',
}

export const apiEndPoints = {
	login: '/mypeeguuser/v1/login',
	forgotPassword: '/mypeeguuser/v1/forgotpassword',
	resetPassword: '/mypeeguuser/v1/resetpassword',
	activateAccount: '/mypeeguuser/v1/activate',
	validateToken: '/mypeeguuser/v1/validatetoken',
	resendActivation: '/mypeeguuser/v1/resendactivation',
	logout: '/mypeeguuser/v1/logout',
	dashboard: '/mypeeguuser/v1/dashboard',
	dashboardCounselor: '/counselor/v1/dashboard',
	createUser: '/mypeeguuser/v1/createuser',
	viewAllCounsellors: '/mypeeguuser/v1/viewallcounselor',
	getAllSchools: 'resources/v1/viewallschool',
	updateSchool: '/mypeeguuser/v1/updateschool',
	addSchool: '/mypeeguuser/v1/addschool',
	deleteSchool: '/mypeeguuser/v1/deleteschool',
	updateSchoolStatus: '/mypeeguuser/v1/updateschoolstatus',
	downloadStudentsReport: '/resources/v1/download-students-report',
	deleteCounsellor: '/mypeeguuser/v1/deleteuser',
	viewAllSchools: '/resources/v1/viewallschool',
	updateUser: '/mypeeguuser/v1/updateuserbyid',
	viewAllStudents: '/resources/v1/viewallstudents',
	viewAllClassrooms: '/resources/v1/viewallclassrooms',
	getMiscellaneous: '/mypeeguuser/v1/miscellaneous',
	getCommonMiscellaneous: '/mypeeguuser/v1/common-miscellaneous',
	getSchoolsList: '/resources/v1/listschool',
	getAllClassrooms: '/resources/v1/listclass',
	schoolsListForValidation: '/resources/v1/listschool',
	classroomsForValidation: '/resources/v1/listclass',
	getAllClassroomsForStudents: '/resources/v1/listclassForStudents',

	getAllSections: '/resources/v1/listsections',
	deleteClassroom: '/counselor/v1/deleteclassroom',
	editClassroom: '/counselor/v1/editclassroom',
	createMultipleClassroom: '/counselor/v1/createmultipleclassrooms',
	createMultipleStudents: '/counselor/v1/createmultiplestudents',
	updateStudent: '/counselor/v1/updatestudent?saveStudent=',
	deleteStudent: '/counselor/v1/deletestudent',
	getIndividualRecords: '/resources/v1/individualcase-list',
	deleteIndividualRecord: '/counselor/v1/delete-individualcase-record',
	updateProfile: '/mypeeguuser/v1/updateprofile',
	addStudentIndividualRecord: '/counselor/v1/create-individualcase',
	updateIndividualRecord: '/counselor/v1/update-individualcase',
	fetchIndividualRecord: '/resources/v1/individualcase-record',
	getObservations: '/resources/v1/observations-list',
	deleteObservation: '/counselor/v1/delete-observation-record',
	fetchObservationRecord: '/resources/v1/observation-record',
	addObservation: '/counselor/v1/create-observation',
	updateObservation: '/counselor/v1/update-observation',
	getBaselineRecords: '/resources/v1/baseline-list',
	updateBaselineRecords: '/counselor/v1/update-baseline',
	deleteBaselineRecord: '/counselor/v1/delete-baseline-record',
	addBaselineRecord: '/counselor/v1/create-baseline',
	createMultipleBaselineRecords:
		'/counselor/v1/create-multiple-baseline-records',

	selTrackerList: '/resources/v1/sel-curriculum-tracker-list',
	addSELCurriculumTracker: '/counselor/v1/create-sel-curriculum-tracker',
	fetchSingleSELCurriculumTracker: '/resources/v1/sel-curriculum-tracker',
	updateSELCurriculumTracker: '/counselor/v1/update-sel-curriculum-tracker',
	deleteSELCurriculumTracker: '/counselor/v1/delete-sel-curriculum-tracker',
	getPresignedSelModuleUrls: '/counselor/v1/get-sel-module-presigned-urls',
	addUpdateSelModule: '/counselor/v1/add-update-sel-module',
	verifySelModule: '/counselor/v1/verify-sel-module',
	fetchSeltrackerModules: '/counselor/v1/fetch-seltracker-modules',

	downloadSchools: '/resources/v1/downloadSchools',
	downloadClassrooms: '/resources/v1/downloadClassrooms',
	downloadStudents: '/resources/v1/downloadStudents',
	downloadObservationRecordsList:
		'/resources/v1/downloadObservationRecordsList',
	downloadListIndividualRecords:
		'/resources/v1/downloadListIndividualRecords',
	downloadBaseLineRecordsList: '/resources/v1/downloadBaseLineRecordsList',
	downloadAllCounselor: '/mypeeguuser/v1/downloadAllCounselor',
	baselineAnalyticsReport: '/resources/v1/baseline-analytics-all-schools',
	baselineAnalyticsReportsingleSchool:
		'/resources/v1/baseline-analytics-one-school',
	singleStudentBaselineAnalyticalReport:
		'/resources/v1/single-record-baseline-analytics',
	baselineStudentsByScreeningStatus:
		'/resources/v1/baseline-students-by-screening-status',
	baselineStudentsBySupportLevel:
		'/resources/v1/baseline-students-by-support-level',
	baselineRiskDashboard: '/resources/v1/baseline-risk-dashboard',
	baselineAnalyticsExport: '/resources/v1/baseline-analytics-export',
	fetchStudentCopeAssessment: '/resources/v1/student-cope-record',
	updateStudentCopeAssessment: '/counselor/v1/update-student-cope',
	deleteStudentCopeAssessment: '/counselor/v1/delete-student-cope',
	bulkUploadStudentCopeAssessment:
		'/counselor/v1/create-multiple-student-cope-records',

	bulkUploadTeachers: '/resources/v1/bulkTeacherDataInsertion',
	getAllTeachers: '/resources/v1/viewallTeachers',
	updateTeacher: '/counselor/v1/updateTeacher',
	deleteTeacher: '/counselor/v1/deleteTeacher',
	getTeachersListBySchoolId: '/counselor/v1/teachers-list',

	viewSchoolForTeacher: '/resources/v1/listschool?viewSchoolForTeacher=true',
	getTeachersClassrooms: '/resources/v1/teacher-classrooms',
	updateTeacherClassroom: '/counselor/v1/update-teacher-classrooms',

	bulkDeleteClassRooms: '/counselor/v1/bulkDeleteClassrooms',
	bulkDeleteStudents: '/counselor/v1/bulkDeleteStudents',
	bulkDeleteIndividualCase:
		'/counselor/v1/delete-multiple-individualcase-records',
	bulkDeleteBaseline: '/counselor/v1/delete-multiple-baseline-records',
	bulkDeleteObservation: '/counselor/v1/delete-multiple-observation-records',

	// Teacher IRI

	getAllIRIforSchool: '/resources/v1/iri-for-schools',
	getAllIRIforTeachers: '/resources/v1/iris-for-teachers',
	fetchTeacherIRI: '/resources/v1/fetch-teacher-iri',
	addSchoolIRI: '/counselor/v1/add-school-iri',
	updateSchoolIRI: '/counselor/v1/update-school-iri',
	submitTeacherIRI: '/counselor/v1/submit-teacher-iri',

	getProfilingsForTeachers: '/resources/v1/profilings-for-teachers',
	getTeachersIRIForSpecificSchool:
		'/resources/v1/getTeachersForSpecificSchool',
	updateScheduledates: '/resources/v1/updateIRIDates',
	deleteTeacherIRIReport: '/counselor/v1/delete-teacher-iri',
	schoolRankingsBasedOnTeachersIRI:
		'/resources/v1/schoolRankingsBasedOnTeachersIRI',
	getStudentCOPEDataInSchool: '/resources/v1/student-cope-records',
	getStudentCOPEAnalyticsReportForSchools:
		'/resources/v1/student-cope-analytics-schools',
	getStudentCOPEAnalyticsReportForClasses:
		'/resources/v1/student-cope-analytics-classrooms',
	sendActivationMailsToTeachers: '/mypeeguuser/v1/sendActivationEmails',
	updateSchoolIRIStatus: '/resources/v1/updateSchoolIRIDateStatus',
	bulkUploadTeacherIRIAssessment: '/counselor/v1/upload-teacher-iris',

	// Teacher Profiling

	getProfilingForSchools: '/resources/v1/profilings-for-schools',
	bulkUploadTeacherProfilingAssessment:
		'/counselor/v1/upload-teacher-profiling',
	addSchoolProfiling: '/counselor/v1/add-school-profiling',
	updateSchoolProfiling: '/counselor/v1/update-school-profiling',
	fetchTeacherProfiling: '/resources/v1/fetch-teacher-profiling',
	deleteTeacherProfiling: '/counselor/v1/delete-teacher-profiling',
	submitTeacherProfiling: '/counselor/v1/submit-teacher-profiling',
	schoolRankingsBasedOnTeachersProfilings:
		'/resources/v1/fetch-profiling-analytics',

	//student well being
	bulkUploadStudentWellBeing:
		'/counselor/v1/create-multiple-student-wb-records',
	getStudentWellBeingData: '/resources/v1/student-wb-records',
	getSingleStudentWellBeing: '/resources/v1/student-wb-record',
	updateStudentWellBeing: '/counselor/v1/update-student-wb',
	deleteStudentWellBeing: '/counselor/v1/delete-student-wb',
	studentWellBeingAnalyticsSchools:
		'/resources/v1/student-wb-analytics-schools',
	studentWBAnalyticsForClassrooms:
		'/resources/v1/student-wb-analytics-classrooms',

	promoteStudentsToNextClass: '/counselor/v1/promoteStudentsToNextClass',
	studentsSectionShift: '/counselor/v1/shiftSectionsOfStudents',

	markStudentAsGraduated: '/counselor/v1/markStudentAsGraduated',
	markStudentAsExited: '/counselor/v1/markStudentAsExited',
	viewAllStudentsForSchoolActions:
		'/resources/v1/viewallstudentsForSchoolActions',
	listStudents: '/resources/v1/liststudents',

	markSingleStudentAsExited: '/studentActions/v1/markSingleStudentAsExited',
	markSingleStudentAsGraduated:
		'/studentActions/v1/markSingleStudentAsGraduated',

	// send Checklist

	viewAllsendChecklist:
		'/resources/v1/checklist-records?downloadAndFilter=false',
	updateSendChecklist: '/counselor/v1/update-send-checklist',
	addSendChecklist: '/counselor/v1/create-send-checklist',
	sCAnalyticsForAllSchools:
		'/resources/v1/all-schools-send-checklist-analytics',
	sCBulkUpload: '/counselor/v1/create-multiple-send-checklists',
	checklistBulkDelete: '/counselor/v1/delete-multiple-send-checklist-records',
	checklistDelete: '/counselor/v1/delete-send-checklist-record',
	sCAnalyticsForSingleSchools:
		'/resources/v1/single-school-send-checklist-analytics',
	downloadChecklistReport:
		'/resources/v1/checklist-records?downloadAndFilter=true',

	// Student IEP
	studentIEPData: '/resources/v1/iep-records?downloadAndFilter=false',
	studentIEPDataForExcel: '/resources/v1/iep-records?downloadAndFilter=true',
	studentIEPverification: '/resources/v1/verify-checklist-data',
	studentBRForIEP: '/resources/v1/baseline-performance',
	getPresignUrlIEP: 'resources/v1/get-pre-signed-url',
	addIEP: '/counselor/v1/create-iep?addPhoto=',
	viewByIDIEP: '/resources/v1/iep-record',
	deleteIEP: '/counselor/v1/delete-iep',
	updateIEP: '/counselor/v1/update-iep?addPhoto=',

	academicYear: '/resources/v1/school-academic-year',
	updateAcademicYear: '/mypeeguuser/v1/school-academic-year',
	schoolAcademicYears: '/mypeeguuser/v1/school-academic-years',
	states: '/resources/v1/states',

	// G&T Templates (Admin)
	gandtTemplates: '/mypeeguuser/v1/gandt-templates',
	gandtTemplate: '/mypeeguuser/v1/gandt-template',
	gandtTemplateById: '/mypeeguuser/v1/gandt-template',
	gandtTemplateToggleStatus: '/mypeeguuser/v1/gandt-template',
	gandtTemplatesActive: '/mypeeguuser/v1/gandt-templates/active',

	// G&T Counselor
	gandtSchoolTemplateCheck: '/counselor/v1/gandt/school',
	gandtStudentsWithStatus: '/counselor/v1/gandt/school',
	gandtStudentHistory: '/counselor/v1/gandt/student',
	gandtAssessmentQuestions: '/counselor/v1/gandt/assessment-questions',
	gandtAssessment: '/counselor/v1/gandt/assessment',
}

export const requestParams = {
	authToken: 'auth-token',
	key: 'key',
	value: 'value',
	sortKeys: 'sortKeys',
	filter: 'filter',
	searchText: 'searchText',
	id: 'id',
	status: 'status',
	days: 'days',
	schoolIds: 'schoolIds',
	roles: 'roles',
	permissions: 'permissions',
	firstName: 'firstName',
	lastName: 'lastName',
	email: 'email',
	phone: 'phone',
	section: 'section',
	schoolId: 'schoolId',
	className: 'className',
	studentStatus: 'studentStatus',
	classRoomId: 'classRoomId',
}
