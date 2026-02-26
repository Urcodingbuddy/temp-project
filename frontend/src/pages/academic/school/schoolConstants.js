import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { sortEnum, tableContainerWidth } from '../../../utils/utils'
import { requestParams } from '../../../utils/apiConstants'

export const getYearsList = () => {
	const yearsList = []
	for (let i = 1970; i <= new Date().getFullYear(); i++) {
		yearsList.push(i.toString())
	}
	return yearsList
}

export const getCountryListOptions = (list) => {
	if (list.length <= 0) {
		return []
	}
	const newlist = list
		.map((obj) => ({ label: obj.name, id: obj._id }))
		.sort((a, b) => a.label.localeCompare(b.label))
	return newlist
}

export const cursorPointer = { cursor: 'pointer' }

export const initialState = {
	school: '',
	scCode: '',
	address: '',
	city: '',
	state: '',
	country: '',
	pinCode: '',
	webSite: '',
	onboardDate: new Date(),
	establishedYear: '',
	scStartDate: '',
	scEndDate: '',
	academicYear: '',
	principalName: '',
	scLogo: '',
	logoUrl: '',
	principalEmail: '',
	principalPhone: '',
	about: '',
}

export const initialSchoolErrorStates = {
	school: false,
	scCode: false,
	city: false,
	state: false,
	country: false,
	pinCode: false,
	onboardDate: false,
	scStartDate: false,
	scEndDate: false,
	academicYear: false,
	principalName: false,
	principalEmail: false,
}

// export const schoolColumns = [
// 	{
// 		id: localizationConstants.schoolName,
// 		name: 'school',
// 		label: localizationConstants.schoolName,
// 		numeric: false,
// 		dataCount: false,
// 		disablePadding: false,
// 		sort: sortEnum.desc,
// 		align: localizationConstants.left,
// 		width: '30%',
// 		minWidth: 0.23,
// 		maxWidth: 0.23,
// 	},
// 	{
// 		id: localizationConstants.scCode,
// 		name: 'scCode',
// 		label: localizationConstants.scCode,
// 		numeric: false,
// 		dataCount: false,
// 		disablePadding: false,
// 		sort: sortEnum.desc,
// 		align: localizationConstants.left,
// 		width: '15%',
// 		minWidth: 0.1,
// 		maxWidth: 0.1,
// 	},
// 	{
// 		id: localizationConstants.city,
// 		name: 'city',
// 		label: localizationConstants.city,
// 		numeric: false,
// 		dataCount: false,
// 		disablePadding: false,
// 		sort: sortEnum.desc,
// 		align: localizationConstants.left,
// 		width: '20%',
// 		minWidth: 0.14,
// 		maxWidth: 0.14,
// 	},
// 	{
// 		id: localizationConstants.onboardingDate,
// 		name: 'onboardDate',
// 		label: localizationConstants.onboardingDate,
// 		numeric: false,
// 		dataCount: false,
// 		disablePadding: false,
// 		sort: sortEnum.desc,
// 		align: localizationConstants.left,
// 		width: '20%',
// 		minWidth: 0.14,
// 		maxWidth: 0.14,
// 	},
// 	{
// 		id: localizationConstants.status,
// 		name: 'status',
// 		label: localizationConstants.status,
// 		numeric: false,
// 		dataCount: false,
// 		disablePadding: false,
// 		sort: sortEnum.desc,
// 		align: localizationConstants.left,
// 		width: '15%',
// 		minWidth: 0.1,
// 		maxWidth: 0.1,
// 	},
// ]

export const schoolColumns = [
	{
		id: localizationConstants.schoolName,
		name: 'school',
		label: localizationConstants.schoolName,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 250,
	},
	{
		id: localizationConstants.scCode,
		name: 'scCode',
		label: localizationConstants.scCode,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 100,
	},
	{
		id: localizationConstants.lastPromotionAcademicYear,
		name: 'lastPromotionAcademicYear',
		label: localizationConstants.lastActiveAcademicYear,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 140,
	},
	{
		id: localizationConstants.city,
		name: 'city',
		label: localizationConstants.city,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 120,
	},
	{
		id: localizationConstants.onboardingDate,
		name: 'onboardDate',
		label: localizationConstants.onboardingDate,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 130,
	},
	{
		id: localizationConstants.status,
		name: 'status',
		label: localizationConstants.status,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 140,
	},
]

export const sortkeys = [
	{
		[requestParams.key]: 'scCode',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'school',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'lastActiveAcademicYear',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'status',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'onboardDate',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'city',
		[requestParams.value]: sortEnum.asc,
	},
]

export const scAcYearsColumns = [
	{
		id: localizationConstants.academicYear,
		name: 'academicYear',
		label: localizationConstants.academicYear,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: tableContainerWidth * 0.1,
		minWidth: 0.1,
		maxWidth: 0.1,
	},
	{
		id: localizationConstants.startDate,
		name: 'startDate',
		label: localizationConstants.startDate,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: tableContainerWidth * 0.1,
		minWidth: 0.1,
		maxWidth: 0.1,
	},
	{
		id: localizationConstants.endDate,
		name: 'endDate',
		label: localizationConstants.endDate,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: tableContainerWidth * 0.1,
		minWidth: 0.1,
		maxWidth: 0.1,
	},
	{
		id: localizationConstants.edit,
		name: localizationConstants.edit,
		label: localizationConstants.edit,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: tableContainerWidth * 0.1,
		minWidth: 0.1,
		maxWidth: 0.1,
	},
]

export const studentsReportSubHeadersMap = {
	name: 'Name',
	class: 'Class',
	section: 'Section',
	monthOfReferral: 'Month Of Referral',
	type: 'Type',
	codeColor: 'Code Color',
	numberOfSessions: 'Number Of Sessions',
	concerns: 'Concerns',
	goals: 'Goals',
	met_or_not_met: 'Met / Not Met',
	termination_tngoing_not_started: 'Termination Status',
	terminated_in: 'Terminated In',
	reasons_for_termination: 'Reasons for Termination',
	parent_consent_sign: 'Parent Consent',
	reportLink: 'Report Link',
	physicalColor: 'Physical Color',
	socialColor: 'Social Color',
	emotionalColor: 'Emotional Color',
	cognitiveColor: 'Cognitive Color',
	languageColor: 'Language Color',
	requirement1: 'Requirement 1',
	availability: 'Availability',
	diagnosis: 'Diagnosis',
	requirement2: 'Requirement 2',
	approval: 'Approval',
	requirement3: 'Requirement 3',
	specialEducation: 'Special Education',
	behavioralInterventions: 'Behavioral Interventions',
	oneOnOne: 'One On One',
	focusClasses: 'Focus Classes',
}
