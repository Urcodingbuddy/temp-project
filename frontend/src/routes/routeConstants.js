export const routeConstants = {
	login: 'login',
	accountRecovery: 'account-recovery',
	createNewPassword: 'create-new-password',
	activateAccount: 'activate-account',
	createNewPasswordExpired: 'create-new-password-expired',
	root: '/',
	dashboard: 'dashboard',
	pageNotFound: '*',
	auth: 'auth',
	initiations: 'dashboard/initiations',
	academic: 'dashboard/academic',
	assessment: 'dashboard/assessment',
}

export const routePaths = {
	login: '/auth/login',
	accountRecovery: '/auth/account-recovery',
	createNewPassword: '/auth/create-new-password',
	createNewPasswordExpired: '/auth/create-new-password-expired',
	activateAccount: '/auth/activate-account',
	home: '/dashboard/home',
	counsellors: '/dashboard/counsellors',
	academicSchools: '/dashboard/academic/schools',
	academicClassrooms: '/dashboard/academic/classrooms',
	academicStudents: '/dashboard/academic/students',
	academicTeachers: '/dashboard/academic/teachers',
	initiationsIndividualCase: '/dashboard/initiations/individualCase',
	initiationsObservation: '/dashboard/initiations/observation',
	initiationsBaseline: '/dashboard/initiations/baseline',
	initiationsStudentBaseline: '/dashboard/initiations/baseline',
	initiationsBaselineAnalyticsReport: '/dashboard/initiations/baseline',
	initiationsSELCurriculumTracker:
		'/dashboard/initiations/SELCurriculumTracker',
	initiationsAddSELCurriculumTracker:
		'/dashboard/initiations/SELCurriculumTracker/addSELCurriculumTracker',
	initiationsEditSELCurriculumTracker:
		'/dashboard/initiations/SELCurriculumTracker/editSELCurriculumTracker',
	initiationsViewSELCurriculumTracker:
		'/dashboard/initiations/SELCurriculumTracker/ViewSELCurriculumTracker',
	initiationsStudentCope: '/dashboard/assessment/studentCopeAssessment',
	initiationsStudentCopeDetailsPage:
		'/dashboard/assessment/studentCopeAssessment/studentCOPE',
	schoolCOPEAnalyticsReport: '/dashboard/assessment/studentCopeAssessment',
	specificSchoolCOPEAnalytics:
		'/dashboard/assessment/studentCopeAssessment/School COPE Analytics',

	assessmentTeacherIRI: '/dashboard/assessment/TeacherIRI',
	assessmentTeacherIRITeachersList: '/dashboard/assessment/TeacherIRI',
	assessmentTeacherIRIAssessment:
		'/dashboard/assessment/TeacherIRI/teacherDetails',
	schoolIRIAnalyticsReport: '/dashboard/assessment/TeacherIRI',
	specificSchoolIRIDetails:
		'/dashboard/assessment/TeacherIRI/specificSchoolIRIDetails',

	TeacherProfilingAssessment: '/dashboard/assessment/TeacherProfiling',
	TeacherProfilingAssessmentDetails:
		'/dashboard/assessment/TeacherProfiling/teacherDetails',
	specificSchoolProfilingDetails:
		'/dashboard/assessment/TeacherProfiling/specificSchoolProfilingDetails',
	schoolProfilingAnalyticsReport:
		'/dashboard/assessment/TeacherProfiling/Analytics',
	assessmentIndex: 'dashboard/assessment',
	initiationsstudentWellBeing: '/dashboard/assessment/studentWellBeing',
	specificStudentWellBeing: '/dashboard/assessment/studentWellBeing',
	studentWellBeingAnalyticsSchools:
		'/dashboard/assessment/studentWellBeing/analytics',
	initiationsSendChecklist: '/dashboard/initiations/sendChecklist',
	AddStudentChecklist: '/dashboard/initiations/sendChecklist/addStudent',
	studentChecklistAnalytics: '/dashboard/initiations/sendChecklist/analytics',
	initiationsIEP: '/dashboard/initiations/IEP',
	initiationsAddIEP: '/dashboard/initiations/IEP/addStudentIEPDetails',
	initiationsGandT: '/dashboard/initiations/gandt',
	gandtTemplates: '/dashboard/initiations/gandt/templates',
	gandtTemplateAdd: '/dashboard/initiations/gandt/templates/add',
	gandtTemplateEdit: '/dashboard/initiations/gandt/templates/edit',
	gandtTemplateView: '/dashboard/initiations/gandt/templates/view',
	gandtAssignments: '/dashboard/initiations/gandt/assignments',
	gandtAssignmentAdd: '/dashboard/initiations/gandt/assignments/add',
	gandtAssignmentEdit: '/dashboard/initiations/gandt/assignments/edit',
	teacherMsgPage: '/dashboard/teacherMsgPage',
}
