import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { requestParams } from '../../../utils/apiConstants'
import { sortEnum } from '../../../utils/utils'

const { present, notPresent, needsImpovement } = localizationConstants

export const invalidTest = ['', null, undefined]

export const observationColumn = [
	{
		id: localizationConstants.id,
		name: 'user_id',
		label: localizationConstants.id,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.asc,
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
		sort: sortEnum.asc,
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
		sort: sortEnum.asc,
		align: localizationConstants.left,
		width: 130,
	},
	{
		id: localizationConstants.doo,
		name: 'doo',
		label: localizationConstants.doo,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 100,
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
		id: localizationConstants.duration,
		name: 'duration',
		label: `${localizationConstants.durationPascalCase} (Min)`,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.asc,
		align: localizationConstants.left,
		width: 80,
	},
	{
		id: localizationConstants.punctuality,
		name: 'punctuality',
		label: localizationConstants.punctuality,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		align: localizationConstants.left,
		width: 160,
	},
	{
		id: localizationConstants.abilityToFollowGuidelines,
		name: 'abilityToFollowGuidelines',
		label: localizationConstants.abilityToFollowGuidelines,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		align: localizationConstants.left,
		width: 160,
	},
	{
		id: localizationConstants.abilityToFollowInstructions,
		name: 'abilityToFollowInstructions',
		label: localizationConstants.abilityToFollowInstructions,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		align: localizationConstants.left,
		width: 160,
	},
	{
		id: localizationConstants.participation,
		name: 'participation',
		label: localizationConstants.participation,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		align: localizationConstants.left,
		width: 160,
	},
	{
		id: localizationConstants.completionOfTasks,
		name: 'completionOfTasks',
		label: localizationConstants.completionOfTasks,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		align: localizationConstants.left,
		width: 160,
	},
	{
		id: localizationConstants.abilityToWorkIndependently,
		name: 'abilityToWorkIndependently',
		label: localizationConstants.abilityToWorkIndependently,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		align: localizationConstants.left,
		width: 160,
	},
	{
		id: localizationConstants.incidentalNote,
		name: 'incedentalOrAdditionalNote',
		label: localizationConstants.incidentalNote,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		align: localizationConstants.left,
		width: 160,
	},
	{
		id: localizationConstants.appearance,
		name: 'appearance',
		label: localizationConstants.appearance,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		align: localizationConstants.left,
		width: 160,
	},
	{
		id: localizationConstants.attitude,
		name: 'attitude',
		label: localizationConstants.attitude,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		align: localizationConstants.left,
		width: 160,
	},
	{
		id: localizationConstants.behaviour,
		name: 'behaviour',
		label: localizationConstants.behaviour,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		align: localizationConstants.left,
		width: 160,
	},
	{
		id: localizationConstants.speech,
		name: 'speech',
		label: localizationConstants.speech,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		align: localizationConstants.left,
		width: 160,
	},
	{
		id: localizationConstants.affect,
		name: 'affetcOrMood',
		label: `${localizationConstants.affect}/Mood`,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		align: localizationConstants.left,
		width: 160,
	},
	{
		id: localizationConstants.thought,
		name: 'thoughtProcessOrForm',
		label: `${localizationConstants.thought} (Process, Form)`,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		align: localizationConstants.left,
		width: 160,
	},
	{
		id: localizationConstants.additionalCommentOrNote,
		name: 'additionalCommentOrNote',
		label: localizationConstants.additionalCommentOrNote,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		align: localizationConstants.left,
		width: 160,
	},
	{
		id: localizationConstants.showCategoryActions,
		name: 'actions',
		label: '',
		width: 50,
	},
]

export const topHeader = [
	{
		id: localizationConstants.basicDetails,
		label: localizationConstants.basicDetails,
		colSpan: 6,
	},
	{
		id: localizationConstants.classroomPresence,
		label: localizationConstants.classroomPresence,
		colSpan: 7,
	},
	{
		id: localizationConstants.microMentalStatusExamination,
		label: localizationConstants.microMentalStatusExamination,
		colSpan: 8,
	},
]

export const observationSortKeys = [
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
		[requestParams.key]: 'doo',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'duration',
		[requestParams.value]: sortEnum.asc,
	},
]

export const initialBasicStates = {
	user_id: '',
	studentName: '',
	doo: new Date(),
	duration: '',
}

export const initialClassAndMicroMStates = {
	punctuality: {
		status: '',
		comments: '',
	},
	abilityToFollowGuidelines: {
		status: '',
		comments: '',
	},
	abilityToFollowInstructions: {
		status: '',
		comments: '',
	},
	participation: {
		status: '',
		comments: '',
	},
	completionOfTasks: {
		status: '',
		comments: '',
	},
	abilityToWorkIndependently: {
		status: '',
		comments: '',
	},
	incedentalOrAdditionalNote: {
		status: '',
		comments: '',
	},
	appearance: {
		status: '',
		comments: '',
	},
	attitude: {
		status: '',
		comments: '',
	},
	behaviour: {
		status: '',
		comments: '',
	},
	speech: {
		status: '',
		comments: '',
	},
	affetcOrMood: {
		status: '',
		comments: '',
	},
	thoughtProcessOrForm: {
		status: '',
		comments: '',
	},
	additionalCommentOrNote: {
		status: '',
		comments: '',
	},
}

export const statusConstants = [
	{ label: present, status: 'Present', color: 'globalElementColors.green2' },
	{
		label: notPresent,
		status: 'NotPresent',
		color: 'globalElementColors.red',
	},
	{
		label: needsImpovement,
		status: 'NeedImprovement',
		color: 'globalElementColors.yellow',
	},
]
