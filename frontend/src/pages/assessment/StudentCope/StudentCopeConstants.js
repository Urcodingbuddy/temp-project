import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { requestParams } from '../../../utils/apiConstants'
import { sortEnum } from '../../../utils/utils'
const {
	longTerm,
	attention,
	emotionRegulation,
	resilience,
	organisation,
	altruisticReactivity,
	impulseControl,
	shortTerm,
} = localizationConstants
export const questions = [
	{
		qns_no: 1,
		question:
			'It’s hard for me to notice when I’ve had enough (sweets, food, etc.).',
	},
	{
		qns_no: 2,
		question:
			'When I’m sad, I can usually start doing something that will make me feel better.',
	},
	{
		qns_no: 3,
		question:
			'If something isn’t going according to my plans, I change my actions to try and reach my goal.',
	},
	{
		qns_no: 4,
		question:
			'I can find ways to make myself study even when my friends want to go out.',
	},
	{
		qns_no: 5,
		question: 'I lose track of the time when I’m doing something fun.',
	},
	{ qns_no: 6, question: 'When I’m bored I fidget or can’t sit still.' },
	{
		qns_no: 7,
		question:
			'It’s hard for me to get started on big projects that require planning in advance.',
	},
	{
		qns_no: 8,
		question:
			'I can usually act normal around everybody if I’m upset with someone.',
	},
	{
		qns_no: 9,
		question:
			'I am good at keeping track of lots of things going on around me, even when I’m feeling stressed.',
	},
	{
		qns_no: 10,
		question:
			'When I’m having a tough day, I stop myself from whining about it to my family or friends.',
	},
	{
		qns_no: 11,
		question: 'I can start a new task even if I’m already tired.',
	},
	{ qns_no: 12, question: 'I lose control whenever I don’t get my way.' },
	{
		qns_no: 13,
		question: 'Little problems distract me from my long-term plans.',
	},
	{
		qns_no: 14,
		question:
			'I forget about whatever else I need to do when I’m doing something really fun.',
	},
	{
		qns_no: 15,
		question: 'If I really want something, I have to have it right away.',
	},
	{
		qns_no: 16,
		question:
			'During a dull class, I have trouble forcing myself to start paying attention.',
	},
	{
		qns_no: 17,
		question:
			'After I’m interrupted or distracted, I can easily continue working where I left off.',
	},
	{
		qns_no: 18,
		question:
			'If there are other things going on around me, I find it hard to keep my attention focused on whatever I’m doing.',
	},
	{ qns_no: 19, question: 'I never know how much more work I have to do.' },
	{
		qns_no: 20,
		question:
			'When I have a serious disagreement with someone, I can talk calmly about it without losing control.',
	},
	{
		qns_no: 21,
		question:
			'It’s hard to start making plans to deal with a big project or problem, especially when I’m feeling stressed.',
	},
	{
		qns_no: 22,
		question: 'I can calm myself down when I’m excited or all wound up.',
	},
	{
		qns_no: 23,
		question: 'I can stay focused on my work even when it’s dull.',
	},
	{ qns_no: 24, question: 'I usually know when I’m going to start crying.' },
	{
		qns_no: 25,
		question:
			'I can stop myself from doing things like throwing objects when I’m mad.',
	},
	{
		qns_no: 26,
		question: 'I work carefully when I know something will be tricky.',
	},
	{
		qns_no: 27,
		question: 'I am usually aware of my feelings before I let them out.',
	},
	{
		qns_no: 28,
		question:
			'In class, I can concentrate on my work even if my friends are talking.',
	},
	{
		qns_no: 29,
		question:
			'When I’m excited about reaching a goal (e.g.,getting my driver’s license, going to college), it’s easy to start working toward it.',
	},
	{
		qns_no: 30,
		question:
			'I can find a way to stick with my plans and goals, even when it’s tough.',
	},
	{
		qns_no: 31,
		question: 'When I have a big project, I can keep working on it.',
	},
	{
		qns_no: 32,
		question: 'I can usually tell when I’m getting tired or frustrated.',
	},
	{
		qns_no: 33,
		question:
			'I get carried away emotionally when I get excited about something.',
	},
	{
		qns_no: 34,
		question:
			'I have trouble getting excited about something that’s really special when I’m tired.',
	},
	{
		qns_no: 35,
		question:
			'It’s hard for me to keep focused on something I find unpleasant or upsetting.',
	},
	{
		qns_no: 36,
		question: 'I can resist doing something when I know I shouldn’t do it.',
	},
]

export const questionOptions = [1, 2, 3, 4, 5]
export const categoriesForStudentCOPE = [
	emotionRegulation,
	resilience,
	organisation,
	altruisticReactivity,
	impulseControl,
]
export const mapKeyToLabel = (key) => {
	switch (key) {
		case 'impulseControlLT':
			return impulseControl
		case 'emotionRegulationLT':
			return emotionRegulation
		case 'attentionLT':
			return attention
		case 'resilienceLT':
			return resilience
		case 'organisationLT':
			return organisation

		case 'impulseControlST':
			return impulseControl
		case 'emotionRegulationST':
			return emotionRegulation
		case 'attentionST':
			return attention
		case 'resilienceST':
			return resilience
		case 'organisationST':
			return organisation
		default:
			return key
	}
}
export const getBackgroundColor = (value) => {
	if (value < 3) {
		return '#F4BDBD'
	} else if (value >= 3 && value < 5) {
		return '#FEEDDB'
	} else if (value === 5) {
		return '#DEF6E4'
	} else {
		return undefined
	}
}
export const truncateString = (str, maxLength) => {
	return str?.length > maxLength ? str.slice(0, maxLength) + '...' : str
}
export const extractUniqueKeys = (dataArray) => {
	return dataArray?.reduce((allKeys, obj) => {
		Object.keys(obj)?.forEach((key) => {
			if (!allKeys?.includes(key)) {
				allKeys?.push(key)
			}
		})
		return allKeys
	}, [])
}
export const ShortTermScoreData = (data, isLongTerm) => {
	return {
		labels: isLongTerm ? [longTerm] : [shortTerm],
		datasets: [
			{
				data: data,
				backgroundColor: isLongTerm ? '#DD2A2B' : '#25C548',
				borderWidth: 0,
				barThickness: 40,
				borderRadius: 5,
			},
		],
	}
}
export const IdentiFiedStrengthScoreDataForST = (data) => {
	const keys = extractUniqueKeys(data)

	const valuesArray = keys.map((key) => data.find((obj) => obj[key])[key])
	return {
		labels: keys.map((key) => mapKeyToLabel(key)),
		datasets: [
			{
				data: valuesArray,
				backgroundColor: '#25C548',
				borderWidth: 0,
				barThickness: 40,
				borderRadius: 5,
			},
		],
	}
}

export const IdentiFiedStrengthScoreDataForLT = (data) => {
	const keys = extractUniqueKeys(data)

	const valuesArray = keys.map((key) => data.find((obj) => obj[key])[key])
	return {
		labels: keys.map((key) => mapKeyToLabel(key)),
		datasets: [
			{
				data: valuesArray,
				backgroundColor: '#25C548',
				borderWidth: 0,
				barThickness: 40,
				borderRadius: 5,
			},
		],
	}
}

export const NeedImprovementScoreDataForST = (data) => {
	const keys = extractUniqueKeys(data)

	const valuesArray = keys.map((key) => data.find((obj) => obj[key])[key])
	return {
		labels: keys.map((key) => mapKeyToLabel(key)),
		datasets: [
			{
				data: valuesArray,
				backgroundColor: '#F8A70D',
				borderWidth: 0,
				barThickness: 40,
				borderRadius: 5,
			},
		],
	}
}

export const NeedImprovementScoreDataForLT = (data) => {
	const keys = extractUniqueKeys(data)

	const valuesArray = keys.map((key) => data.find((obj) => obj[key])[key])

	return {
		labels: keys.map((key) => mapKeyToLabel(key)),
		datasets: [
			{
				data: valuesArray,
				backgroundColor: '#F8A70D',
				borderWidth: 0,
				barThickness: 40,
				borderRadius: 5,
			},
		],
	}
}

export const NeedSpecificSupportScoreDataForST = (data) => {
	const keys = extractUniqueKeys(data)
	const valuesArray = keys?.map((key) => {
		const obj = data.find((obj) => obj[key])
		return obj ? obj[key] : 0
	})
	return {
		labels: keys.map((key) => mapKeyToLabel(key)),
		datasets: [
			{
				data: valuesArray,
				backgroundColor: '	#DD2A2B',
				borderWidth: 0,
				barThickness: 40,
				borderRadius: 5,
			},
		],
	}
}
export const NeedSpecificSupportScoreDataForLT = (data) => {
	const keys = extractUniqueKeys(data)
	const valuesArray = keys?.map((key) => {
		const obj = data.find((obj) => obj[key])
		return obj ? obj[key] : 0
	})
	return {
		labels: keys.map((key) => mapKeyToLabel(key)),
		datasets: [
			{
				data: valuesArray,
				backgroundColor: '#DD2A2B',
				borderWidth: 0,
				barThickness: 40,
				borderRadius: 5,
			},
		],
	}
}

export const StudentAnalysisScoreData = (studentDataArray) => {
	const data = {
		labels: studentDataArray?.map((data) =>
			truncateString(data?.schoolName, 25),
		),
		datasets: [
			{
				label: localizationConstants.totalStudents,
				data: studentDataArray?.map(
					(data) => data?.studentCountInSchool,
				),
				backgroundColor: ['#0267D9'],
				// yAxisID: 'studentsAxis',
				borderRadius: 3,
				barPercentage: 0.4,
				categoryPercentage: 0.8,
				borderWidth: 0,
			},
			{
				label: 'Total Sub. of COPE',
				data: studentDataArray?.map(
					(data) => data?.totalStudentSubmitedCOPE,
				),
				backgroundColor: ['#F5890D'],
				// yAxisID: 'copeAxis',
				borderRadius: 3,
				barPercentage: 0.4,
				categoryPercentage: 0.8,
				borderWidth: 0,
			},
		],
	}

	return data
}

export const StudentCOPEScoreDataForClasses = (studentData) => {
	if (!studentData || !studentData.length) return {}
	const labelsWithRank = studentData.map(
		(stData) => `${truncateString(stData.className, 15)}`,
	)
	const datasets = [
		{
			label: `Regulation avg`,
			data:
				studentData?.map((stData) => stData?.shortTermRegulation) || [],
			backgroundColor: ['#01234A'],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
		{
			label: `Regulation avg`,
			data:
				studentData?.map((stData) => stData?.longTermRegulation) || [],
			backgroundColor: ['#F5890D'],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
	]
	return {
		labels: labelsWithRank,
		datasets: datasets,
	}
}

export const StudentCOPEScoreData = (studentData) => {
	if (!studentData || !studentData.length) return {}
	const labelsWithRank = studentData?.map(
		(stData) =>
			`${truncateString(stData?.schoolName, 15)} (Rank: ${stData?.rank})`,
	)
	const datasets = [
		{
			label: `Regulation avg`,
			data:
				studentData?.map((stData) => stData?.shortTermRegulation) || [],
			backgroundColor: ['#01234A'],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
		{
			label: `Regulation avg`,
			data:
				studentData?.map((stData) => stData?.longTermRegulation) || [],
			backgroundColor: ['#F5890D'],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
	]

	return {
		labels: labelsWithRank,
		datasets: datasets,
	}
}

export const DomainWiseStudentCOPEScoreDataST = (studentData) => {
	if (!studentData || !studentData.length) return {}
	const labelsWithRank = studentData.map(
		(stData) =>
			`${truncateString(stData.schoolName, 15)} (Rank: ${stData.rank})`,
	)

	const datasets = [
		{
			label: localizationConstants.emotionRegulation,
			data:
				studentData?.map((stData) => stData?.EmotionRegulationST) || [],
			backgroundColor: ['#0267D9'],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
		{
			label: localizationConstants.impulseControl,
			data: studentData?.map((stData) => stData?.ImpulseControlST) || [],
			backgroundColor: ['#DD2A2B'],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
		{
			label: localizationConstants.resilience,
			data: studentData?.map((stData) => stData?.ResilienceST) || [],
			backgroundColor: ['#F8A70D'],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
		{
			label: localizationConstants.attention,
			data: studentData?.map((stData) => stData?.AttentionST) || [],
			backgroundColor: ['#25C548'],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
		{
			label: localizationConstants.organisation,
			data: studentData?.map((stData) => stData?.OrganisationST) || [],
			backgroundColor: ['#F5890D'],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
	]

	return {
		labels: labelsWithRank,
		datasets: datasets,
	}
}

export const DomainWiseStudentCOPEScoreDataLT = (studentData) => {
	const labelsWithRank = studentData?.map(
		(stData) =>
			`${truncateString(stData?.schoolName, 15)} (Rank: ${stData?.rank})`,
	)

	const datasets = [
		{
			label: localizationConstants.emotionRegulation,
			data:
				studentData?.map((stData) => stData?.EmotionRegulationLT) || [],
			backgroundColor: ['#0267D9'],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
		{
			label: localizationConstants.impulseControl,
			data: studentData?.map((stData) => stData?.ImpulseControlLT) || [],
			backgroundColor: ['#DD2A2B'],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
		{
			label: localizationConstants.resilience,
			data: studentData?.map((stData) => stData?.ResilienceLT) || [],
			backgroundColor: ['#F8A70D'],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
		{
			label: localizationConstants.attention,
			data: studentData?.map((stData) => stData?.AttentionLT) || [],
			backgroundColor: ['#25C548'],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
		{
			label: localizationConstants.organisation,
			data: studentData?.map((stData) => stData?.OrganisationLT) || [],
			backgroundColor: ['#F5890D'],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
	]

	return {
		labels: labelsWithRank,
		datasets: datasets,
	}
}
export const DomainWiseStudentCOPEForClassesLT = (studentData) => {
	const labelsWithRank = studentData?.map(
		(stData) =>
			`${truncateString(stData?.className, 15)} (Rank: ${stData?.rank})`,
	)

	const datasets = [
		{
			label: localizationConstants.emotionRegulation,
			data:
				studentData?.map((stData) => stData?.EmotionRegulationLT) || [],
			backgroundColor: ['#0267D9'],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
		{
			label: localizationConstants.impulseControl,
			data: studentData?.map((stData) => stData?.ImpulseControlLT) || [],
			backgroundColor: ['#DD2A2B'],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
		{
			label: localizationConstants.resilience,
			data: studentData?.map((stData) => stData?.ResilienceLT) || [],
			backgroundColor: ['#F8A70D'],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
		{
			label: localizationConstants.attention,
			data: studentData?.map((stData) => stData?.AttentionLT) || [],
			backgroundColor: ['#25C548'],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
		{
			label: localizationConstants.organisation,
			data: studentData?.map((stData) => stData?.OrganisationLT) || [],
			backgroundColor: ['#F5890D'],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
	]

	return {
		labels: labelsWithRank,
		datasets: datasets,
	}
}

export const DomainWiseStudentCOPEForClassesST = (studentData) => {
	if (!studentData || !studentData.length) return {}
	const labelsWithRank = studentData?.map(
		(stData) =>
			`${truncateString(stData?.className, 15)} (Rank: ${stData?.rank})`,
	)

	const datasets = [
		{
			label: localizationConstants.emotionRegulation,
			data:
				studentData?.map((stData) => stData?.EmotionRegulationST) || [],
			backgroundColor: ['#0267D9'],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
		{
			label: localizationConstants.impulseControl,
			data: studentData?.map((stData) => stData?.ImpulseControlST) || [],
			backgroundColor: ['#DD2A2B'],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
		{
			label: localizationConstants.resilience,
			data: studentData?.map((stData) => stData?.ResilienceST) || [],
			backgroundColor: ['#F8A70D'],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
		{
			label: localizationConstants.attention,
			data: studentData?.map((stData) => stData?.AttentionST) || [],
			backgroundColor: ['#25C548'],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
		{
			label: localizationConstants.organisation,
			data: studentData?.map((stData) => stData?.OrganisationST) || [],
			backgroundColor: ['#F5890D'],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
	]

	return {
		labels: labelsWithRank,
		datasets: datasets,
	}
}
export const initModal = {
	edit: false,
	upload: false,
	filter: false,
	delete: false,
}
export const StudentCopeUploadDefaultExcelColumns = [
	{
		'Student ID': '',
		'Date of Assessment': '',
	},
]

for (let i = 0; i < 36; i++) {
	StudentCopeUploadDefaultExcelColumns[0][`${'Q'}.${i + 1}`] = ''
}
export const studentCOPEStudentsListColumns = [
	{
		id: localizationConstants.id,
		name: 'user_id',
		label: localizationConstants.id,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 80,
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
		id: localizationConstants.studentsName,
		name: 'studentName',
		label: localizationConstants.studentsName,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 160,
	},
	{
		id: localizationConstants.schoolName,
		name: 'schoolName',
		label: localizationConstants.schoolName,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 180,
	},
	{
		id: localizationConstants.className,
		name: 'className',
		label: localizationConstants.className,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 90,
	},
	{
		id: localizationConstants.section,
		name: 'section',
		label: localizationConstants.section,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 80,
	},
	{
		id: localizationConstants.copeSubmissionDate,
		name: 'COPEReportSubmissionDate',
		label: localizationConstants.copeSubmissionDate,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 140,
	},
]

export const sortkeysStudentList = [
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
		[requestParams.key]: 'schoolName',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'className',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'section',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'someDate',
		[requestParams.value]: sortEnum.asc,
	},
]
