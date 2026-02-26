import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { sortEnum } from '../../../utils/utils'
import { requestParams } from '../../../utils/apiConstants'

export const selColumn = [
	{
		id: localizationConstants.className,
		name: 'className',
		label: localizationConstants.className,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.asc,
		align: localizationConstants.left,
		width: 90,
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
		id: localizationConstants.coreCompetency,
		name: 'coreCompetency',
		label: localizationConstants.coreCompetency,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.asc,
		align: localizationConstants.left,
		width: 140,
	},
	{
		id: localizationConstants.topic,
		name: 'topic',
		label: localizationConstants.topic,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.asc,
		align: localizationConstants.left,
		width: 150,
	},
	{
		id: localizationConstants.date,
		name: 'interactionDate',
		label: localizationConstants.date,
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
		id: localizationConstants.commentsOrObservation,
		name: 'commentsOrObservations',
		label: localizationConstants.commentsOrObservation,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		align: localizationConstants.left,
		width: 180,
	},
	{
		id: localizationConstants.activity,
		name: 'activity',
		label: localizationConstants.activity,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		align: localizationConstants.left,
		width: 180,
	},
	{
		id: localizationConstants.taskAssignedOrReflection,
		name: 'taskAssignedOrReflection',
		label: localizationConstants.taskAssignedOrReflection,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		align: localizationConstants.left,
		width: 180,
	},
	{
		id: localizationConstants.interventionsForEducators,
		name: 'interventionForEducators',
		label: localizationConstants.interventionsForEducators,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		align: localizationConstants.left,
		width: 180,
	},
	{
		id: localizationConstants.outcome,
		name: 'outcome',
		label: localizationConstants.outcome,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		align: localizationConstants.left,
		width: 120,
	},
	{
		id: localizationConstants.followUpActivity,
		name: 'followUpActivity',
		label: localizationConstants.followUpActivity,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		align: localizationConstants.left,
		width: 180,
	},
	{
		id: localizationConstants.showCategoryActions,
		name: 'actions',
		label: '',
		width: 50,
	},
]

export const initialStateIC = {
	interactionDate: new Date(),
	activity: '',
	commentsOrObservations: '',
	taskAssignedOrReflection: '',
	outcome: '',
	coreCompetency: '',
	topic: '',
	interventionForEducators: '',
	followUpActivity: '',
	// section: '',
}

export const outcomeConstants = [
	'Achieved',
	'Not-Achieved',
	'Achieved with Assistance',
]

export const coreCompetencyConstants = [
	'Self-Management ',
	'Self Awareness',
	'Social Awareness',
	'Relationship Skills',
	'Responsible Decision Making',
]

export const invalidTest = ['', null, undefined, NaN]

export const sortkeys = [
	{
		[requestParams.key]: 'className',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'academicYear',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'coreCompetency',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'topic',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'interactionDate',
		[requestParams.value]: sortEnum.asc,
	},
]
export const monthsOptions = [
	{
		_id: '1',
		month: 'January',
		order: 1,
	},
	{
		_id: '2',
		month: 'February',
		order: 2,
	},
	{
		_id: '3',
		month: 'March',
		order: 3,
	},
	{
		_id: '4',
		month: 'April',
		order: 4,
	},
	{
		_id: '5',
		month: 'May',
		order: 5,
	},
	{
		_id: '6',
		month: 'June',
		order: 6,
	},
	{
		_id: '7',
		month: 'July',
		order: 7,
	},
	{
		_id: '8',
		month: 'August',
		order: 8,
	},
	{
		_id: '9',
		month: 'September',
		order: 9,
	},
	{
		_id: '10',
		month: 'October',
		order: 10,
	},
	{
		_id: '11',
		month: 'November',
		order: 11,
	},
	{
		_id: '12',
		month: 'December',
		order: 12,
	},
]
// const selTrackerPdfData = [
// 	{
// 		academicYear:'',
// 		month:'January',
// 		categories:[{
// 			categoryName:'',
// 			order:1,
// 			lists:[{
// 				name:'',
// 				url
// 			}]
// 		}]
// 	}
// ]
