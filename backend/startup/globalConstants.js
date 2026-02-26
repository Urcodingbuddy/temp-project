const {
	GlobalMessage,
	Miscellaneous,
	MyPeeguPermissionOps,
	MyPeeguAppFeatures,
} = require('../models/database/myPeegu-staticConfigs')

const loadGlobalStaticConfig = async function () {
	const globalConstants = {}
	const language = { en: 'en', ar: 'ar' }
	const globalMessages = await GlobalMessage.findById('6404a5e83f8dd6649366954e').lean()
	globalConstants.messages = {
		...globalMessages.success,
		...globalMessages.error,
	}

	const miscellaneous = await Miscellaneous.findOne({ _id: '647eca4ec017218bb2b9c5ce' }).lean()
	globalConstants.tokens = {
		typeList: ['activation', 'resetPassword', 'loginOtp', 'verification'],
		statusList: ['sent', 'expired', 'used'],
		activation: 'activation',
		loginOtp: 'loginOtp',
		verification: 'verification',
		resetPassword: 'resetPassword',
		used: 'used',
		sent: 'sent',
		expired: 'expired',
		invalidToken: 'invalidToken',
	}

	// key and values same so that we can use it in errorhandling, language translation etc where we need to pass key as value
	globalConstants.keys = {
		userUpdated: 'userUpdated',
		loggedOut: 'loggedOut',
		accountActivated: 'accountActivated',
		resetMailSent: 'resetMailSent',
		passwordReset: 'passwordReset',
		userDeleted: 'userDeleted',
		userCreated: 'userCreated',
		emailUpdated: 'emailUpdated',
		passwordChanged: 'passwordChanged',
		invalidPassword: 'invalidPassword',
		validToken: 'validToken',
		resentActivationMail: 'resentActivationMail',
		userReactivated: 'userReactivated',
		missingParameters: 'missingParameters',
		projectName: 'projectName',
		invalidEmail: 'invalidEmail',
		userExists: 'userExists',
		unknownError: 'unknownError',
		notAuthorised: 'notAuthorised',
		userDoesNotExists: 'userDoesNotExists',
		invalidUser: 'invalidUser',
		noToken: 'noToken',
		invalidToken: 'invalidToken',
		notActivated: 'notActivated',
		incorrectPassword: 'incorrectPassword',
		signedLinkError: 'signedLinkError',
		sendAllData: 'sendAllData',
		searchKeyInvalid: 'searchKeyInvalid',
		invalidStatus: 'invalidStatus',
		accountDoesNotExists: 'accountDoesNotExists',
		notFound: 'notFound',
		alreadyExists: 'alreadyExists',
		tokenExpired: 'tokenExpired',
		enterReason: 'enterReason',
		emailNotValid: 'emailNotValid',
		dateNotValid: 'dateNotValid',
		invalidDate: 'invalidDate',
		notEditable: 'notEditable',
		serverError: 'serverError',
		invalidCreds: 'invalidCreds',
		duplicateDataFound: 'duplicateDataFound',
		badRequest: 'badRequest',
		minLength: 'minLength',
		maxLength: 'maxLength',
		minlength: 'minlength',
		maxlength: 'maxlength',
		required: 'required',
		type: 'type',
		enum: 'enum',
		match: 'match',
		max: 'max',
		min: 'min',
		unique: 'unique',
		ValidationError: 'ValidationError',
		CastError: 'CastError',
		maxSessionsAllowed: 'maxSessionsAllowed',
		deviceTypeMissing: 'deviceTypeMissing',
		invalidNumber: 'invalidNumber',
		imageDeleted: 'imageDeleted',
		minLengthName: 'minLengthName',
		invalidParentName: 'invalidParentName',
		invalidParentId: 'invalidParentId',
		recordDeleted: 'recordDeleted',
		recordExists: 'recordExists',
		promotionsAdded: 'promotionsAdded',
		invalidPromotion: 'invalidPromotion',
		invalidId: 'invalidId',
		promotionsUpdated: 'promotionsUpdated',
		invalidBillId: 'invalidBillId',
		voucherUpdated: 'voucherUpdated',
		welcome: 'welcome',
		receipt: 'receipt',
		deviceUDIDMissing: 'deviceUDIDMissing',
		billEmailSent: 'billEmailSent',
		validate: 'validate',
		accountDeleted: 'accountDeleted',
		licenseExpired: 'licenseExpired',
		categoryNameUpdate: 'categoryNameUpdate',
	}

	const permissions = await MyPeeguPermissionOps.find().populate([
		{ path: 'permission', select: { name: 1 } },
		{ path: 'appFeatures.id', select: { name: 1 } },
		{ path: 'userOperationPermissions', select: { name: 1 } },
	])
	const transformedPermission = {}
	const transformedManagementPermissions = {}
	const managementPermissions = await MyPeeguAppFeatures.find().populate({
		path: 'validationPermissions',
		select: { name: 1 },
	})
	permissions.forEach((doc) => {
		transformedPermission[doc.permission.name] = {
			userOperationPermissions: (doc.userOperationPermissions ?? []).map(
				(operationPermission) => operationPermission.name,
			),
			appFeatures: (doc.appFeatures ?? []).flatMap((feature) => {
				const appfeatureData = {}
				appfeatureData[feature?.id?.name] = feature.actions
				return appfeatureData
			}),
		}
	})
	managementPermissions.forEach((doc) => {
		transformedManagementPermissions[doc.name] = (doc.validationPermissions ?? []).map(
			(permission) => permission.name,
		)
	})
	globalConstants.managementPermissions = transformedManagementPermissions
	globalConstants.permissions = transformedPermission
	globalConstants.schoolStatus = miscellaneous.schoolStatus
	globalConstants.studentStatus = miscellaneous.studentStatus
	globalConstants.myPeeguUserStatus = miscellaneous.myPeeguUserStatus
	globalConstants.userPicPath = miscellaneous.userPic
	globalConstants.selModulePath = 'sel-modules'

	globalConstants.action = {
		updation: 1,
		deactivation: 2,
		reactivation: 3,
		Paused: 4,
		Resume: 5,
		scheduler: 6,
	}
	globalConstants.search = {
		Active: 1,
		Inactive: 2,
		All: 3,
	}
	globalConstants.days = {
		0: 3650,
		1: 1,
		2: 7,
		3: 30,
		4: 4,
	}

	globalConstants.daysFilter = {
		allDays: 0,
		today: 1,
		lastSeven: 2,
		lastThirty: 3,
		currentYear: 4,
	}

	globalConstants.defaultMaxDays = 3650
	globalConstants.userSortFieldsObject = {
		fullName: 'fullName',
		email: 'email',
		status: 'status',
		permissions: 'permissions',
		user_id: 'user_id',
		phone: 'phone',
		assignedSchools: 'assignedSchools',
	}
	globalConstants.userSortFields = Object.values(globalConstants.userSortFieldsObject)
	globalConstants.SuperAdmin = 'SuperAdmin'
	globalConstants.Admin = 'Admin'
	globalConstants.PeeguCounselor = 'PeeguCounselor'
	globalConstants.ScPrincipal = 'ScPrincipal'
	globalConstants.ScCounselor = 'ScCounselor'
	globalConstants.teacher = 'Teacher'

	globalConstants.booleanString = {
		true: 'true',
		false: 'false',
	}

	globalConstants.language = language
	globalConstants.studentsSortFields = [
		'user_id',
		'academicYear',
		'studentName',
		'school',
		'className',
		'section',
		'regNo',
		'phone',
		'Nationality',
		'regDate',
		'gender',
		'dob',
		'bloodGrp',
		'fatherName',
		'motherName',
		'status',
	]
	globalConstants.teacherSortFields = [
		'teacher_id',
		'teacherName',
		'gender',
		'scCode',
		'schoolName',
		'email',
		'mobileNumber',
		'status',
		'IRISubDate',
		'formStatusOnIRISubDate',
		'formStatusOnProfilingSubDate',
		'ProfilingSubDate',
	]
	globalConstants.studentCOPESortFields = [
		'user_id',
		'studentName',
		'schoolName',
		'className',
		'section',
		'COPEReportSubmissionDate',
		'academicYear',
	]
	globalConstants.studentWellBeingSortFields = [
		'user_id',
		'studentName',
		'schoolName',
		'className',
		'section',
		'wellBeingAssessmentSubmissionDate',
		'academicYear',
	]
	globalConstants.studentSendCheckListSortFields = [
		'user_id',
		'studentName',
		'categories.Attention.score',
		'categories.Cognitive.score',
		'categories.Behavior.score',
		'categories.Fine Motor and Gross Motor Skill.score',
		'createdAt',
	]

	globalConstants.schoolProfilingSortFields = [
		'schoolName',
		'academicYear',
		'totalTeacherCount',
		'pendingTeacherCount',
		'submittedTeacherCount',
		'startDate',
		'endDate',
		'profilingStatus',
	]

	globalConstants.schoolIRISortFields = [
		'schoolName',
		'academicYear',
		'totalTeacherCount',
		'pendingTeacherCount',
		'submittedTeacherCount',
		'startDate',
		'endDate',
		'iriStatus',
	]

	globalConstants.schoolsforteachersSortFields = [
		'schoolName',
		'academicYear',
		'totalTeacherCount',
		'pendingTeacherCount',
		'submittedTeacherCount',
		'startDate',
		'endDate',
		'profilingStatus',
	]

	globalConstants.schoolSortFields = [
		'school',
		'onboardDate',
		'scCode',
		'status',
		'city',
		'lastPromotionAcademicYear',
	]
	globalConstants.classroomSortFields = [
		'school.school',
		'className',
		'section',
		'classHierarchy',
		'sectionHierarchy',
		'teacher.teacherName',
		'teacher.email',
		'teacher.phone',
		'studentCount',
		'sectionHierarchy',
		'classHierarchy',
		'academicYear',
	]
	globalConstants.individualRecordSortFields = ['user_id', 'studentName', 'date', 'academicYear', 'createdAt']
	globalConstants.classRoomsRequiredFields = [
		'Class Name',
		'Section',
		'Class Hierarchy',
		'Section Hierarchy',
	]
	globalConstants.observationRecordSortFields = [
		'user_id',
		'studentName',
		'doo',
		'duration',
		'academicYear',
		'createdAt',
	]
	globalConstants.observationRecordValidateKeys = [
		'punctuality',
		'abilityToFollowGuidelines',
		'abilityToFollowInstructions',
		'participation',
		'completionOfTasks',
		'abilityToWorkIndependently',
		'incedentalOrAdditionalNote',
		'appearance',
		'attitude',
		'behaviour',
		'speech',
		'affetcOrMood',
		'thoughtProcessOrForm',
		'additionalCommentOrNote',
	]
	globalConstants.baselineRecordSortFields = [
		'Physical',
		'Social',
		'Emotional',
		'Cognitive',
		'Language',
		'academicYear',
	]
	globalConstants.groups = ['0-3', '4-5', '6-7']
	globalConstants.missingFields = [
		'Student ID',
		'Classroom',
		'Section',
		'Reg_no',
		'DOB',
		'Reg_date',
	]
	globalConstants.baselineRecordBasicSortFields = ['user_id', 'studentName', 'baselineCategory', 'createdAt']
	globalConstants.SELCurriculumTrackerSortFields = [
		'className',
		'coreCompetency',
		'topic',
		'interactionDate',
		'academicYear',
		'createdAt',
	]
	globalConstants.teacherProfilingSortFields = [
		'teacher_id',
		'teacherName',
		'gender',
		'formStatus',
		'submissionDate',
	]
	globalConstants.headers = { language: 'language', authToken: 'auth-token' }
	globalConstants.appName = miscellaneous.projectName
	globalConstants.fieldDisplayNames = {
		user_id: 'Student ID',
		scCode: 'scCode',
	}
	globalConstants.fieldDisplayNamesForStudentWellBeing = {
		user_id: 'Student ID',
		scCode: 'scCode',
		childrensHopeScale: 'Childrens Hope Scale',
		psychologicalWellBeingScale: 'Psychological Well-Being scale',
	}
	globalConstants.sendCheckList = {
		user_id: 'Student ID',
		checklistForm: 'Check List Form',
		categories: 'Categories',
		// 'categories':'Childrens Hope Scale',
	}
	globalConstants.teacherIRIRequiredFields = {
		teacher_id: 'Teacher ID',
		scCode: 'School Code',
	}
	globalConstants.fieldDisplayNamesForTeachers = {
		teacher_id: 'Teacher ID',
		teacherName: 'Teachers Name',
		gender: 'Gender',
		email: 'Email',
	}
	globalConstants.validBloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
	globalConstants.scLogoPath = miscellaneous.scLogoPath

	globalConstants.studentIEP_path = miscellaneous.studentIEP_path
	globalConstants.PngImageType = 'image/png'
	globalConstants.PdfType = 'application/pdf'
	globalConstants.JpegType = 'image/jpeg'

	globalConstants.studentProfilePic = miscellaneous.studentProfilePic
	globalConstants.notificationType = {
		welcome: 0,
		receipt: 1,
	}
	globalConstants.managementType = {}
	globalConstants.adminList = miscellaneous.adminList
	globalConstants.counselorList = miscellaneous.counselorList
	globalConstants.otherUsers = miscellaneous.otherUsers
	globalConstants.classroomStatus = miscellaneous.classroomStatus
	globalConstants.individualMisc = miscellaneous.individualMisc
	globalConstants.observationMisc = miscellaneous.observationMisc
	globalConstants.daysFilterFunction = {
		0: () => 3650, //10years
		1: () => 1,
		2: () => 7,
		3: () => 30,
		4: () => {
			const now = new Date()
			const startOfYear = new Date(now.getFullYear(), 0)
			const diff = now - startOfYear
			const oneDay = 1000 * 60 * 60 * 24
			return Math.floor(diff / oneDay) + 1
		},
	}
	globalConstants.actions = {
		view: 'view',
		edit: 'edit',
		delete: 'delete',
	}

	globalConstants.otherCategoryName = 'Others'

	globalConstants.website = 'http://www.mypeegu.com'
	globalConstants.companyName = 'My Peegu Pvt Ltd.'
	globalConstants.companyLogo = 'https://mypeegu-dev.s3.ap-south-1.amazonaws.com/mypeegu-logo.png'
	globalConstants.companyAddress = ''

	return { globalConstants, miscellaneous }
}

module.exports = loadGlobalStaticConfig
