import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { requestParams } from '../../../utils/apiConstants'
import { hexaCodes } from '../../../utils/hexaColorCodes'
import { sortEnum } from '../../../utils/utils'

export const initModal = {
	edit: false,
	upload: false,
	filter: false,
	delete: false,
	analytics: false,
}
export const AISWellBeingStudentsListColumns = [
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
		id: localizationConstants.submissionDate,
		name: 'wellBeingAssessmentSubmissionDate',
		label: localizationConstants.submissionDate,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 140,
	},
]

export const AISWellBeingSortkeys = [
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
		[requestParams.key]: 'wellBeingAssessmentSubmissionDate',
		[requestParams.value]: sortEnum.asc,
	},
]

// Sample data for a single record
const sampleRecord = {
	_id: '65e6ee53c9699e1ae335ccad',
	studentName: 'abc',
	studentId: '65646ae540a9ce76c391a2cc',
	counsellorName: 'Winter Solder',
	school: '64a6ad367e693d0d7dad115e',
	schoolName: 'Kurokami Academy',
	SubmissionDate: '2023-11-09T08:31:19.299Z',
	user_id: 'HD4783',
	isRatingReset: false,
	className: '7',
	section: 'G',
	createdAt: '2023-11-09T08:31:19.299Z',
}

// Function to generate multiple records
const generateRecords = (count) => {
	const records = []

	for (let i = 0; i < count; i++) {
		// Clone the sample record and modify some values (e.g., _id, SubmissionDate)
		const newRecord = { ...sampleRecord }

		// Modify _id to make it unique for each record (you can use a unique ID generator)
		newRecord._id = generateUniqueId() // You'll need to implement this function

		// Modify SubmissionDate to be different for each record (e.g., incrementing by seconds)
		newRecord.SubmissionDate = '2023-11-09T08:31:19.299Z' // You'll need to implement this function

		// Push the modified record to the records array
		records.push(newRecord)
	}

	return records
}

// Example function to generate a unique ID (you can use a library or custom function)
const generateUniqueId = () => {
	return Math.random().toString(36).substr(2, 9) // Example simple ID generator
}

// Generate 20 records
export const generatedRecords = () => {
	return { data: generateRecords(20), totalCount: '20' }
}

export const psychologicalQuestions = [
	{
		qns_no: 1,
		question: 'I like most parts of my personality.',
	},
	{
		qns_no: 2,
		question:
			'When I look at the story of my life, I am pleased with how things have turned out so far.',
	},
	{
		qns_no: 3,
		question:
			'Some people get through day to day aimlessly, but I am not one of them.',
	},
	{
		qns_no: 4,
		question:
			'The demands of everyday life makes me feel tired/exhausted, I feel low.',
	},
	{
		qns_no: 5,
		question:
			'In many ways I feel disappointed about how much I have achieved so far.',
	},
	{
		qns_no: 6,
		question:
			'Maintaining close relationships (family or friends) has been difficult and frustrating for me.',
	},
	{
		qns_no: 7,
		question:
			"I live life one day at a time and don't really think about the future.",
	},
	{
		qns_no: 8,
		question:
			'In general, I feel I am in charge of the situation in which I live.',
	},
	{
		qns_no: 9,
		question: 'I am good at managing my daily responsibilities.',
	},
	{
		qns_no: 10,
		question:
			'I am sometimes demotivated and have little to look forward to.',
	},
	{
		qns_no: 11,
		question: 'For me, life is about constant learning.',
	},
	{
		qns_no: 12,
		question:
			'I think it is important to have new experiences that challenge how I think about myself and the world.',
	},
	{
		qns_no: 13,
		question:
			'People would describe me as a giving person, willing to share my time with others.',
	},
	{
		qns_no: 14,
		question:
			'I gave up trying to make big improvements or changes in my life a long time ago.',
	},
	{
		qns_no: 15,
		question: 'I tend to be influenced by people with strong opinions.',
	},
	{
		qns_no: 16,
		question:
			'I have not experienced many warm and trusting relationships with others.',
	},
	{
		qns_no: 17,
		question:
			'I have confidence in my own opinions, even if they are different from the way most other people think.',
	},
	{
		qns_no: 18,
		question:
			'I judge myself by what I think is important, not by the values of what others think is important.',
	},
]

export const childrensHopeQuestions = [
	{
		qns_no: 1,
		question: 'I think I am doing pretty well.',
	},
	{
		qns_no: 2,
		question:
			'I can think of many ways to get the things in life that are most important to me.',
	},
	{
		qns_no: 3,
		question: 'I am doing just as well as other kids my age.',
	},
	{
		qns_no: 4,
		question:
			'When I have a problem, I can come up with many ways to solve it.',
	},
	{
		qns_no: 5,
		question:
			'I think the things I have done in the past will help me in the future.  ',
	},
	{
		qns_no: 6,
		question:
			'Even when others want to quit, I know I can find ways to solve the problem.',
	},
]

export const psychologicalQuestionsOptions = [1, 2, 3, 4, 5, 6, 7]
export const childrensHopeQuestionsOptions = [1, 2, 3, 4, 5, 6]

export const getBackgroundColor = (value) => {
	if (value >= 5) {
		return '#DEF6E4'
	} else if (value > 0) {
		return '#FEEDDB'
	} else {
		return undefined
	}
}

export const CHSandPWBData = (data, isCHS, color) => {
	return {
		labels: isCHS ? ['CHS'] : ['PWB'],
		datasets: [
			{
				data: data,
				backgroundColor: color ? hexaCodes?.crimson : hexaCodes?.green,
				borderWidth: 0,
				barThickness: 40,
				borderRadius: 5,
			},
		],
	}
}

export const CategorizationData = (data) => {
	return {
		labels: [localizationConstants.pathway, localizationConstants.agency],
		datasets: [
			{
				data: data,
				backgroundColor: [hexaCodes?.blue1, hexaCodes?.yellow1],
				borderWidth: 0,
				barThickness: 40,
				borderRadius: 5,
			},
		],
	}
}

export const StudentAnalyticsAllSchools = (
	labels,
	totalStudents,
	totalSubmission,
) => {
	const labelsWithRank = labels
	const datasets = [
		{
			label: [localizationConstants.totalStudents],
			data: totalStudents || [],
			backgroundColor: [hexaCodes?.blue1],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
		{
			label: [localizationConstants.totalSubmission],
			data: totalSubmission || [],
			backgroundColor: [hexaCodes?.orange],
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

export const generatePWBData = (
	labels,
	autonomy,
	environmental,
	personalGrowth,
	positiveRelationswithOthers,
	purposeinlife,
	SelfAcceptance,
) => {
	const labelsWithRank = labels
	const datasets = [
		{
			label: [localizationConstants.autonomy],
			data: autonomy || [],
			backgroundColor: [hexaCodes?.blue1],
			borderRadius: 3,
			barPercentage: 0.5,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
		{
			label: [localizationConstants.environmental],
			data: environmental || [],
			backgroundColor: [hexaCodes?.yellow1],
			borderRadius: 3,
			barPercentage: 0.5,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
		{
			label: [localizationConstants.personalGrowth],
			data: personalGrowth || [],
			backgroundColor: [hexaCodes?.orange],
			borderRadius: 3,
			barPercentage: 0.5,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
		{
			label: [localizationConstants.positiveRelationswithOthers],
			data: positiveRelationswithOthers || [],
			backgroundColor: [hexaCodes?.green],
			borderRadius: 3,
			barPercentage: 0.5,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
		{
			label: [localizationConstants.purposeinlife],
			data: purposeinlife || [],
			backgroundColor: [hexaCodes?.crimson],
			borderRadius: 3,
			barPercentage: 0.5,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
		{
			label: [localizationConstants.SelfAcceptance],
			data: SelfAcceptance || [],
			backgroundColor: [hexaCodes?.dodgerBlue],
			borderRadius: 3,
			barPercentage: 0.5,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
	]

	return {
		labels: labelsWithRank,
		datasets: datasets,
	}
}

export const generateCHSData = (labels, pathway, agency) => {
	const labelsWithRank = labels
	const datasets = [
		{
			label: [localizationConstants.pathway],
			data: pathway || [],
			backgroundColor: [hexaCodes?.blue1],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
		{
			label: [localizationConstants.agency],
			data: agency || [],
			backgroundColor: [hexaCodes?.orange],
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

export const generateScoreData = (labels, chs, pwb) => {
	const labelsWithRank = labels
	const datasets = [
		{
			label: [localizationConstants.childrenHopeScale],
			data: chs || [],
			backgroundColor: [hexaCodes?.black2],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
		{
			label: [localizationConstants.psychologicalWBScale],
			data: pwb || [],
			backgroundColor: [hexaCodes?.yellow1],
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

export const generateWellBeingData = (labels, chs, pwb) => {
	const labelsWithRank = labels
	const datasets = [
		{
			label: [localizationConstants.childrenHopeScale],
			data: chs || [],
			backgroundColor: [hexaCodes?.black2],
			borderRadius: 3,
			barPercentage: 0.4,
			categoryPercentage: 0.8,
			borderWidth: 0,
		},
		{
			label: [localizationConstants.psychologicalWBScale],
			data: pwb || [],
			backgroundColor: [hexaCodes?.yellow1],
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

export const CategorizationDataPWB = (data) => {
	return {
		labels: [
			localizationConstants.autonomy,
			localizationConstants.environmental,
			localizationConstants.personalGrowth,
			localizationConstants.positiveRelationswithOthers,
			localizationConstants.purposeinlife,
			localizationConstants.SelfAcceptance,
		],
		datasets: [
			{
				data: data,
				backgroundColor: [
					hexaCodes?.blue,
					hexaCodes?.yellow,
					hexaCodes?.orange,
					hexaCodes?.green,
					hexaCodes?.crimson,
					hexaCodes?.dodgerBlue,
				],
				borderWidth: 0,
				barThickness: 40,
				borderRadius: 5,
			},
		],
	}
}

export const StudentWellBeingUploadDefaultExcelColumns = () => {
	const defaultColums = [
		{
			'Student ID': '',
			'Date of Assessment': '',
		},
	]
	for (let i = 0; i < 6; i++) {
		defaultColums[0][`${'CHS Q'}.${i + 1}`] = ''
	}
	for (let i = 0; i < 18; i++) {
		defaultColums[0][`${'PWB Q'}.${i + 1}`] = ''
	}
	return defaultColums
}

export const doughtOptions = {
	maintainAspectRatio: false,
	plugins: {
		legend: {
			display: false,
		},
		datalabels: {
			color: 'white',
			formatter: (value, context) => {
				if (value > 0) {
					const parsedValue = parseFloat(value)
					return parsedValue.toFixed(2).replace(/\.0+$/, '') + ''
				} else {
					return ''
				}
			},
			align: 'center',
			font: {
				size: 14,
				weight: 500,
			},
		},
		tooltip: {
			enabled: true,
			bodyFont: {
				size: 13,
			},
			bodySpacing: 5,
			padding: 15,
		},
	},
}
