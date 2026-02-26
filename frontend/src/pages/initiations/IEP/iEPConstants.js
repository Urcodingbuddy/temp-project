import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { sortEnum } from '../../../utils/utils'
import { requestParams } from '../../../utils/apiConstants'
import { checklistOptions } from '../sendCheckList/sendCheckListConstants'

export const StudentIEPColumns = [
	{
		id: localizationConstants.id,
		name: 'user_id',
		label: localizationConstants.id,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 70,
	},
	{
		id: localizationConstants.academicYear,
		name: 'academicYear',
		label: localizationConstants.academicYear,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 90,
	},
	{
		id: localizationConstants.studentsName,
		name: 'studentName',
		label: localizationConstants.studentsName,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 140,
	},
	{
		id: 'createdAt',
		name: 'createdAt',
		label: 'Created Date',
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.asc,
		align: localizationConstants.left,
		width: 100,
	},
	{
		id: localizationConstants.shortTermGoal,
		name: 'ShortTermGoal',
		label: localizationConstants.shortTermGoal,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 120,
	},
	{
		id: localizationConstants.longTermGoal,
		name: 'LongTermGoal',
		label: localizationConstants.longTermGoal,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 120,
	},
	{
		id: localizationConstants.evolution,
		name: 'Evolution',
		label: localizationConstants.evolution,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 100,
	},
	{
		id: localizationConstants.accommodationfromBanch,
		name: 'AccommodationFromBoard',
		label: localizationConstants.accommodationfromBanch,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 160,
	},
	{
		id: localizationConstants.accommodationInternal,
		name: 'AccommodationInternal',
		label: localizationConstants.accommodationInternal,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 150,
	},
	{
		id: localizationConstants.transitionPlanning,
		name: 'transitionPlanning',
		label: localizationConstants.transitionPlanning,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 130,
	},
	{
		id: localizationConstants.individualSession,
		name: 'IndividualSession',
		label: localizationConstants.individualSession,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 120,
	},
	{
		id: localizationConstants.groupSession,
		name: 'GroupSession',
		label: localizationConstants.groupSession,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 110,
	},
	{
		id: localizationConstants.showCategoryActions,
		name: 'actions',
		label: '',
		width: 50,
	},
]

export const sortkeys = [
	{
		[requestParams.key]: 'user_id',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'academicYear',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'studentName',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'ShortTermGoal',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'LongTermGoal',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'Evolution',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'AccommodationFromBoard',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'AccommodationInternal',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'transitionPlanning',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'IndividualSession',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'GroupSession',
		[requestParams.value]: sortEnum.asc,
	},
]

export const IEPContentsList = [
	localizationConstants.presentLevelofPerformanceAbilities,
	localizationConstants.additionalNeedsFromSendChecklist,
	localizationConstants.evolution,
	localizationConstants.accommodationfromBanch,
	localizationConstants.accommodationInternal,
	localizationConstants.transitionPlanning,
	localizationConstants.placementWithSEND,
]

export const baselineReport = (data, comments, modal) => [
	{
		category: localizationConstants.category,
		percentage: localizationConstants.percentage,
		comments: localizationConstants.comments,
		color: 'globalElementColors.grey',
	},
	{
		category: localizationConstants.physical,
		percentage: data?.Physical ?? 0,
		comments: comments?.[localizationConstants.physical] ?? [],
		color: 'globalElementColors.richBlack',
		showMore: modal?.[localizationConstants.physical],
	},
	{
		category: localizationConstants.social,
		percentage: data?.Social ?? 0,
		comments: comments?.[localizationConstants.social] ?? [],
		color: 'globalElementColors.richBlack',
		showMore: modal?.[localizationConstants.social],
	},
	{
		category: localizationConstants.emotional,
		percentage: data?.Emotional ?? 0,
		comments: comments?.[localizationConstants.emotional] ?? [],
		color: 'globalElementColors.richBlack',
		showMore: modal?.[localizationConstants.emotional],
	},
	{
		category: localizationConstants.cognitive,
		percentage: data?.Cognitive ?? 0,
		comments: comments?.[localizationConstants.cognitive] ?? [],
		color: 'globalElementColors.richBlack',
		showMore: modal?.[localizationConstants.cognitive],
	},
	{
		category: localizationConstants.linguistic,
		percentage: data?.Language ?? 0,
		comments: comments?.[localizationConstants.linguistic] ?? [],
		color: 'globalElementColors.richBlack',
		showMore: modal?.[localizationConstants.linguistic],
	},
]

export const placementWithSend = (data) => [
	{
		session: localizationConstants.session,
		eligibility: localizationConstants.eligibility,
		frequency: localizationConstants.frequencyPerWeek,
		color: 'globalElementColors.grey',
	},
	{
		session: localizationConstants.individual,
		eligibility: [data?.Individual?.value],
		frequency: data?.Individual?.frequency ?? [],
		color: 'globalElementColors.richBlack',
	},
	{
		session: localizationConstants.group,
		eligibility: [data?.Group?.value],
		frequency: data?.Group?.frequency ?? [],
		color: 'globalElementColors.richBlack',
	},
]

export const transitionPlanning = (data, modal) => [
	{
		details: localizationConstants.details,
		availability: localizationConstants.availability,
		comments: localizationConstants.comments,
		color: 'globalElementColors.grey',
	},
	{
		details: localizationConstants.communityExperience,
		availability: [
			data?.[localizationConstants.communityExperience]?.value,
		],
		comments:
			data?.[localizationConstants.communityExperience]?.comments ?? [],
		color: 'globalElementColors.richBlack',
		showMore: modal?.[localizationConstants.communityExperience],
	},
	{
		details: localizationConstants.activitiesofDailyLiving,
		availability: [
			data?.[localizationConstants.activitiesofDailyLiving]?.value,
		],
		comments:
			data?.[localizationConstants.activitiesofDailyLiving]?.comments ??
			[],
		color: 'globalElementColors.richBlack',
		showMore: modal?.[localizationConstants.activitiesofDailyLiving],
	},
	{
		details: localizationConstants.functionalVocationalAssistance,
		availability: [
			data?.[localizationConstants.functionalVocationalAssistance]?.value,
		],
		comments:
			data?.[localizationConstants.functionalVocationalAssistance]
				?.comments ?? [],
		color: 'globalElementColors.richBlack',
		showMore: modal?.[localizationConstants.functionalVocationalAssistance],
	},
]

export const evolution = (data, modal) => [
	{
		requirement: localizationConstants.requirement,
		availability: localizationConstants.availability,
		diagnosis: localizationConstants.diagnosis,
		reportLink: localizationConstants.reportLink,
		color: 'globalElementColors.grey',
	},
	{
		requirement: [data?.[localizationConstants.requirement]],
		availability: [data?.[localizationConstants.availability]],
		diagnosis: data?.[localizationConstants.comments] ?? [],
		color: 'globalElementColors.richBlack',
		showMore: modal,
		reportLink: data?.[localizationConstants.reportLink],
	},
]

export const internalAccomodation = (data, modal) => [
	{
		details: localizationConstants.details,
		confirmation: localizationConstants.confirmation,
		comments: localizationConstants.comments,
		color: 'globalElementColors.grey',
	},
	{
		details: localizationConstants.requirement,
		confirmation: [data?.[localizationConstants.requirement]?.value],
		color: 'globalElementColors.richBlack',
	},
	{
		details: localizationConstants.specialEducationClasses,
		confirmation: [
			data?.[localizationConstants.specialEducationClasses]?.value,
		],
		color: 'globalElementColors.richBlack',
	},
	{
		details: localizationConstants.behavioralInterventions,
		confirmation: [
			data?.[localizationConstants.behavioralInterventions]?.value,
		],
		comments:
			data?.[localizationConstants.behavioralInterventions]?.comments ??
			[],
		color: 'globalElementColors.richBlack',
		showMore: modal?.[localizationConstants.behavioralInterventions],
	},
	{
		details: localizationConstants.oneToOneWithHRT_CT,
		confirmation: [data?.[localizationConstants.oneToOneWithHRT_CT]?.value],
		comments:
			data?.[localizationConstants.oneToOneWithHRT_CT]?.comments ?? [],
		color: 'globalElementColors.richBlack',
		showMore: modal?.[localizationConstants.oneToOneWithHRT_CT],
	},
	{
		details: localizationConstants.focusClasses,
		confirmation: [data?.[localizationConstants.focusClasses]?.value],
		comments: data?.[localizationConstants.focusClasses]?.comments ?? [],
		color: 'globalElementColors.richBlack',
		showMore: modal?.[localizationConstants.focusClasses],
	},
	{
		details: localizationConstants.accomondationsInSchool,
		confirmation: [
			data?.[localizationConstants.accomondationsInSchool]?.value,
		],
		comments:
			data?.[localizationConstants.accomondationsInSchool]?.comments ??
			[],
		color: 'globalElementColors.richBlack',
		showMore: modal?.[localizationConstants.accomondationsInSchool],
	},
	{
		details: localizationConstants.assistiveTechnology,
		confirmation: [
			data?.[localizationConstants.assistiveTechnology]?.value,
		],
		comments:
			data?.[localizationConstants.assistiveTechnology]?.comments ?? [],
		color: 'globalElementColors.richBlack',
		showMore: modal?.[localizationConstants.assistiveTechnology],
	},
]

export const AccFromBoardData = (data) => [
	{
		details: localizationConstants.details,
		confirmation: localizationConstants.confirmation,
		color: 'globalElementColors.grey',
	},
	{
		details: localizationConstants.requirement,
		confirmation: data?.[localizationConstants.requirement],
		color: 'globalElementColors.richBlack',
	},
	{
		details: localizationConstants.certificate,
		confirmation: data?.[localizationConstants.certificate],
		color: 'globalElementColors.richBlack',
	},
	{
		details: localizationConstants.regionalOffice,
		confirmation: data?.[localizationConstants.regionalOffice],
		color: 'globalElementColors.richBlack',
	},
	{
		details: localizationConstants.selectAccomodationApplicable,
		confirmation:
			data?.[localizationConstants.selectAccomodationApplicable],
		color: 'globalElementColors.richBlack',
	},
]

export const checklistHeaders = (type) => {
	if (type?.trim() === checklistOptions?.[0]?.trim()) {
		return [
			localizationConstants.attention,
			localizationConstants.fineMotorGrossMotorSkill,
			localizationConstants.cognitive,
			localizationConstants.behavior,
		]
	} else {
		return [
			localizationConstants.attentionHyperactivity,
			localizationConstants.memory,
			localizationConstants.fineMotorGrossMotorSkill,
			localizationConstants.cognitive,
			'Social Skill',
		]
	}
}

export const InitialinternalAccommodation = {
	[localizationConstants.requirement]: {
		value: 'No',
	},
	[localizationConstants.specialEducationClasses]: {
		value: 'No',
	},
	[localizationConstants.behavioralInterventions]: {
		value: 'No',
		comments: [],
	},
	[localizationConstants.oneToOneWithHRT_CT]: {
		value: 'No',
		comments: [],
	},
	[localizationConstants.focusClasses]: {
		value: 'No',
		comments: [],
	},
	[localizationConstants.accomondationsInSchool]: {
		value: 'No',
		comments: [],
	},
	[localizationConstants.assistiveTechnology]: {
		value: 'No',
		comments: [],
	},
}

export const initialAddform = (user) => ({
	baselineComments: {
		[localizationConstants.physical]: [],
		[localizationConstants.social]: [],
		[localizationConstants.emotional]: [],
		[localizationConstants.cognitive]: [],
		[localizationConstants.linguistic]: [],
	},
	checkList: [],
	AccommodationFromBoard: {
		[localizationConstants.requirement]: ['No'],
		[localizationConstants.certificate]: ['No'],
		[localizationConstants.regionalOffice]: ['No'],
		[localizationConstants.selectAccomodationApplicable]: [''],
		[localizationConstants.viewCircular]: {
			cbseCircularPdfAddress: user?.profile?.cbseCircularPdfAddress ?? '',
			icseCircularPdfAddress: user?.profile?.icseCircularPdfAddress ?? '',
		},
	},
	TransitionPlanning: {
		[localizationConstants.communityExperience]: {
			value: 'No',
			comments: [],
		},
		[localizationConstants.activitiesofDailyLiving]: {
			value: 'No',
			comments: [],
		},
		[localizationConstants.functionalVocationalAssistance]: {
			value: 'No',
			comments: [],
		},
	},
	Evolution: {
		[localizationConstants.requirement]: 'No',
		[localizationConstants.availability]: 'No',
		[localizationConstants.comments]: [],
		[localizationConstants.reportLink]: {
			file: '',
			fileName: '',
			fileUrl: '',
			fileType: '',
		},
	},
	internalAccommodation: {
		[localizationConstants.requirement]: {
			value: 'No',
		},
		[localizationConstants.specialEducationClasses]: {
			value: 'No',
		},
		[localizationConstants.behavioralInterventions]: {
			value: 'No',
			comments: [],
		},
		[localizationConstants.oneToOneWithHRT_CT]: {
			value: 'No',
			comments: [],
		},
		[localizationConstants.focusClasses]: {
			value: 'No',
			comments: [],
		},
		[localizationConstants.accomondationsInSchool]: {
			value: 'No',
			comments: [],
		},
		[localizationConstants.assistiveTechnology]: {
			value: 'No',
			comments: [],
		},
	},
	PlacementWithSEND: {
		[localizationConstants.individual]: {
			value: 'No',
			frequency: [],
		},
		[localizationConstants.group]: {
			value: 'No',
			frequency: [],
		},
	},
})

export const accommodationsApplicable = [
	'Adult prompters',
	'Alternate/ separate question paper',
	'Compensatory time',
	'Examination in hospitals (under supervision)',
	'Examination on ground floor',
	'Examination through computer',
	'Exception from third subject',
	'Flexibility in choosing subjects',
	'Large Font in question paper',
	'Option of skill based subject',
	'Read of question paper',
	'Relaxation of attendance',
	'Scribe',
	'Typing for Candidate',
	'Typing on typewriter',
	'Waving off Registration Fees',
]
