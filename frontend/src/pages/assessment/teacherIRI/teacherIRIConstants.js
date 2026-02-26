import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { requestParams } from '../../../utils/apiConstants'
import { sortEnum } from '../../../utils/utils'
const {
	perspectiveTaking,
	vicariousEmpathy,
	empathicConcern,
	altruisticReactivity,
	PerspectiveTakingScale,
	FantasyScale,
	EmpathicConcernScale,
	AltruisticReactivity,
	submittedTeacher,
	pendingTeacher,
} = localizationConstants

export const categories = [
	perspectiveTaking,
	vicariousEmpathy,
	empathicConcern,
	altruisticReactivity,
]
export const categoriesForCharts = [
	PerspectiveTakingScale,
	FantasyScale,
	EmpathicConcernScale,
	AltruisticReactivity,
]
export const categoriesForTeacherCount = [submittedTeacher, pendingTeacher]

export const TeacherIRIUploadDefaultExcelColumns = [
	{
		'Teacher ID': '',
		'Date of Assessment': '',
	},
]
for (let i = 0; i < 28; i++) {
	TeacherIRIUploadDefaultExcelColumns[0][`${'Q'}.${i + 1}`] = ''
}

export const domainWiseMailData = (data) => {
	return {
		labels: categoriesForCharts,
		datasets: [
			{
				data: data,
				backgroundColor: '#25C548',
				borderWidth: 0,
				barThickness: 40,
				borderRadius: 5,
			},
		],
	}
}

export const domainWiseFemaleData = (data) => {
	return {
		labels: categoriesForCharts,
		datasets: [
			{
				data: data,
				backgroundColor: '#A62020',
				borderWidth: 0,
				barThickness: 40,
				borderRadius: 5,
			},
		],
	}
}

export const teacherIRIColumns = [
	{
		id: localizationConstants.schoolName,
		name: 'schoolName',
		label: localizationConstants.schoolName,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 200,
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
		width: 100,
	},
	{
		id: localizationConstants.totalTeachers,
		name: 'totalTeacherCount',
		label: localizationConstants.totalTeachers,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 100,
	},
	{
		id: localizationConstants.pending,
		name: 'pendingTeacherCount',
		label: localizationConstants.pending,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 90,
	},
	{
		id: localizationConstants.submitted,
		name: 'submittedTeacherCount',
		label: localizationConstants.submitted,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 90,
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
		width: 100,
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
		width: 100,
	},
	{
		id: localizationConstants.status,
		name: 'IRIStatus',
		label: localizationConstants.status,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 90,
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
		[requestParams.key]: 'schoolName',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'IRIStatus',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'endDate',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'startDate',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'submittedTeacherCount',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'pendingTeacherCount',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'totalTeacherCount',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'academicYear',
		[requestParams.value]: sortEnum.asc,
	},
]

export const teacherIRITeachersListColumns = [
	{
		id: localizationConstants.id,
		name: 'teacher_id',
		label: localizationConstants.id,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 80,
	},
	{
		id: localizationConstants.teacherName,
		name: 'teacherName',
		label: localizationConstants.teacherName,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 180,
	},
	{
		id: localizationConstants.gender,
		name: 'gender',
		label: localizationConstants.gender,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 90,
	},
	{
		id: localizationConstants.iRISubmissiondate,
		name: 'submissionDate',
		label: localizationConstants.iRISubmissiondate,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 140,
	},
	{
		id: localizationConstants.status,
		name: 'formStatus',
		label: localizationConstants.status,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 100,
	},
]

export const sortkeysTeachersList = [
	{
		[requestParams.key]: 'teacher_id',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'gender',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'formStatus',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'teacherName',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'submissionDate',
		[requestParams.value]: sortEnum.asc,
	},
]

export const initialScheduleIRIDataStates = {
	school: '',
	startDate: '',
	endDate: '',
}

export const AssessmentQuestions = [
	{
		qns_no: 1,
		question:
			'I daydream and fantasize, with some regularity, about things that might happen to me.',
	},
	{
		qns_no: 2,
		question:
			'I often have tender, concerned feelings for people less fortunate than me.',
	},
	{
		qns_no: 3,
		question:
			'I sometimes find it difficult to see things from another person’s point of view.',
	},
	{
		qns_no: 4,
		question:
			"Sometimes I don't feel very sorry for other people when they are having problems.",
	},
	{
		qns_no: 5,
		question:
			'I really get involved with the feelings of the characters in a novel.',
	},
	{
		qns_no: 6,
		question: 'In emergency situations, I feel apprehensive and uneasy.',
	},
	{
		qns_no: 7,
		question:
			"I am usually objective when I watch a movie or play, and I don't often get completely caught up in it.",
	},
	{
		qns_no: 8,
		question:
			"I try to look at everybody's side of a disagreement before I make a decision.",
	},
	{
		qns_no: 9,
		question:
			'When I see someone being taken advantage of, I feel kind of protective towards them.',
	},
	{
		qns_no: 10,
		question:
			'I sometimes feel helpless when I am in the middle of a very emotional situation.',
	},
	{
		qns_no: 11,
		question:
			'I sometimes try to understand my friends better by imagining how things look from their perspective.',
	},
	{
		qns_no: 12,
		question:
			'Becoming extremely involved in a good book or movie is somewhat rare for me.',
	},
	{
		qns_no: 13,
		question: 'When I see someone get hurt, I tend to remain calm.',
	},
	{
		qns_no: 14,
		question:
			"Other people's misfortunes do not usually disturb me a great deal.",
	},
	{
		qns_no: 15,
		question:
			"If I'm sure I'm right about something, I don't waste much time listening to other people's arguments.",
	},
	{
		qns_no: 16,
		question:
			'After seeing a play or movie, I have felt as though I were one of the characters.',
	},
	{ qns_no: 17, question: 'Being in a tense emotional situation scares me.' },
	{
		qns_no: 18,
		question:
			'When I see someone being treated unfairly, I sometimes feel unaffected by their plight.',
	},
	{
		qns_no: 19,
		question: 'I am usually pretty effective in dealing with emergencies.',
	},
	{
		qns_no: 20,
		question:
			'I am frequently moved by the things I witness and it evokes strong emotions in me.',
	},
	{
		qns_no: 21,
		question:
			'I believe that there are two sides to every question and try to look at them both.',
	},
	{
		qns_no: 22,
		question: 'I would describe myself as a pretty soft-hearted person.',
	},
	{
		qns_no: 23,
		question:
			'When I watch a good movie, I can very easily put myself in the place of a leading character.',
	},
	{
		qns_no: 24,
		question:
			'My response during emergencies often involves losing my composure.',
	},
	{
		qns_no: 25,
		question:
			'When I\'m upset at someone, I usually try to "put myself in their shoes" for a while.',
	},
	{
		qns_no: 26,
		question:
			'When I am reading an interesting story or novel, I imagine how I would feel if the events in the story were happening to me.',
	},
	{
		qns_no: 27,
		question:
			'I have a difficult time staying composed when I witness someone who urgently requires help during an emergency.',
	},
	{
		qns_no: 28,
		question:
			'Before criticizing somebody, I try to understand their perspective by imagining myself in their position.',
	},
]

export const questionsRating = [0, 1, 2, 3, 4]
