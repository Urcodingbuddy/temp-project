import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { wrapBarGraphLabel } from '../../../utils/utils'
import { truncateString } from '../StudentCope/StudentCopeConstants'
import {
	bulkUploadTeacherProfilingAssessment,
	getAllProfilingForSchools,
	getAllProfilingForTeacher,
} from './teacherProfilingSlice'

export const teacherProfilingData = (profilingData) => {
	const data = {
		labels: profilingData?.map((item) =>
			wrapBarGraphLabel(item?.schoolName || '', 28),
		),
		datasets: [
			{
				label: localizationConstants.totalTeachers,
				data: profilingData?.map((d) => d?.totalTeacherCount),
				backgroundColor: ['#0267D9'],
				borderRadius: 3,
				barPercentage: 0.4,
				categoryPercentage: 0.8,
				borderWidth: 0,
			},
			{
				label: localizationConstants?.submission,
				data: profilingData?.map(
					(d) => d?.totalSubmittedTeacherCountForProfiling,
				),
				backgroundColor: ['#F5890D'],
				borderRadius: 3,
				barPercentage: 0.4,
				categoryPercentage: 0.8,
				borderWidth: 0,
			},
		],
	}
	return data
}

export const fetchAllTeacherProfilingRecords = (
	dispatch,
	filterData,
	searchText = '',
	page,
	pageSize,
	sortKeys,
	download,
) => {
	const body = {
		filter: {
			academicYear: filterData.selectdAYs,
			status: filterData?.status,
			schoolIds: filterData.selectdSchools,
		},
		searchText,
	}
	if (page) {
		body['page'] = page
	}
	if (pageSize) {
		body['pageSize'] = pageSize
	}
	if (sortKeys) {
		body['sortKeys'] = sortKeys
	}
	if (download) {
		return body
	}
	dispatch(getAllProfilingForSchools({ body }))
}

export const fetchAllProfilingForTeacherRecords = (
	dispatch,
	filterData,
	searchText = '',
	page,
	pageSize,
	sortKeys,
	schoolId,
	download,
) => {
	const body = {
		schoolProfilingId: schoolId,
		filter: {
			formStatus: filterData?.teacherStatus,
			days: filterData?.byDate,
			startDate: filterData?.startDate,
			endDate: filterData?.endDate,
			gender: filterData?.gender,
		},
		searchText,
	}

	if (page) {
		body['page'] = page
	}
	if (pageSize) {
		body['pageSize'] = pageSize
	}
	if (sortKeys) {
		body['sortKeys'] = sortKeys
	}
	if (download) {
		return body
	}
	dispatch(getAllProfilingForTeacher({ body }))
}

export const DISCWiseReportData = (data) => {
	const scaleLabels = [
		'teacherDominanceAvgForSchool',
		'teacherInfluenceAvgForSchool',
		'teacherSteadinessAvgForSchool',
		'teacherComplianceAvgForSchool',
	]

	const datasets = scaleLabels.map((scaleLabel, index) => ({
		label: scaleLabel,
		data: data?.map((record) => record[scaleLabel].toFixed(2)) || [],

		backgroundColor: data?.map((record) =>
			getBackgroundColor(scaleLabel, record[scaleLabel] || 0),
		),
		borderWidth: 0,
		barThickness: null,
		borderRadius: 4,
		barPercentage: 0.4,
		categoryPercentage: 0.8,
	}))

	const labelsWithRank =
		data?.map((record) => wrapBarGraphLabel(record.schoolName || '', 28)) ||
		[]
	return {
		labels: labelsWithRank,
		datasets: datasets,
	}
}

const getBackgroundColor = (scaleLabel, value) => {
	// Check which scaleLabel it is and return color accordingly
	switch (scaleLabel) {
		case 'teacherDominanceAvgForSchool':
		case 'teacherInfluenceAvgForSchool':
		case 'teacherSteadinessAvgForSchool':
		case 'teacherComplianceAvgForSchool':
			// Check if the value is greater than or equal to 3
			if (value >= 3) {
				// Return green color
				return '#25C548' // Green for values >= 3
			} else {
				// Return red color
				return '#DD2A2B' // Red for values less than 3
			}
		default:
			return 'gray'
	}
}

export const ChartOptionsForTeacherProfiling = (
	annotationValue,
	isShowYAxis,
) => {
	return {
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
			datalabels: {
				display: false,
			},
			annotation: {
				annotations: [
					{
						type: 'line',
						mode: 'horizontal',
						scaleID: 'y',
						value: annotationValue ? annotationValue : undefined,
						borderColor: 'red',
						borderWidth: 2,
						borderDash: [5, 5],
					},
				],
			},
			tooltip: {
				bodyFont: {
					size: 13,
				},
				titleFont: {
					size: 15,
					weight: 600,
				},
				bodySpacing: 5,
				titleMarginBottom: 5,
				padding: 10,
			},
		},
		scales: {
			x: {
				grid: {
					display: false,
				},
				ticks: {
					font: {
						weight: 'bold',
					},
					color: 'rgba(0, 0, 0, 1)',
				},
			},
			y: {
				beginAtZero: true,
				grid: {
					display: true,
				},
				ticks: {
					display: isShowYAxis,
					font: {
						weight: 'normal',
					},
				},
				stepSize: 1,
				suggestedMin: 1,
			},
		},
	}
}
export const BarDataForDomainWisePerformance = (data) => {
	const labelsWithRank = data?.map((record) => `${record.schoolName}`) || []

	return {
		labels: labelsWithRank.map((label) => wrapBarGraphLabel(label, 28)),
		datasets: [
			{
				label: localizationConstants.teachingAttitude,
				data: data?.map((d) => d?.teacherAttitudeAvgForSchool),

				backgroundColor: '#97576E',
				borderWidth: 0,
				barThickness: null, // Adjust thickness
				borderRadius: 4,
				barPercentage: 0.4,
				categoryPercentage: 0.8,
			},
			{
				label: localizationConstants.teachingPractices,
				data: data?.map((d) => d?.teacherPracticesAvgForSchool),

				backgroundColor: '#DD952A',
				borderWidth: 0,
				barThickness: null, // Adjust thickness
				borderRadius: 4,
				barPercentage: 0.4,
				categoryPercentage: 0.8,
			},
			{
				label: localizationConstants.jobLifeSatisfaction,
				data: data?.map(
					(d) => d?.teacherJobLifeSatisfactionAvgForSchool,
				),

				backgroundColor: '#0D7F8E',
				borderWidth: 0,
				barThickness: null, // Adjust thickness
				borderRadius: 4,
				barPercentage: 0.4,
				categoryPercentage: 0.8,
			},
		],
	}
}

export const generateChartOptions = (annotationValue) => {
	return {
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
			datalabels: {
				display: false,
			},
			annotation: {
				annotations: [
					{
						type: 'line',
						mode: 'horizontal',
						scaleID: 'y',
						value: annotationValue ? annotationValue : undefined,
						borderColor: 'red',
						borderWidth: 2,
						borderDash: [5, 5],
					},
				],
			},
			tooltip: {
				bodyFont: {
					size: 13,
				},
				titleFont: {
					size: 15,
					weight: 600,
				},
				bodySpacing: 5,
				titleMarginBottom: 5,
				padding: 10,
			},
		},
		scales: {
			x: {
				grid: {
					display: false,
				},
				ticks: {
					font: {
						weight: 'bold',
					},
					color: 'rgba(0, 0, 0, 1)',
				},
			},
			y: {
				beginAtZero: true,
				grid: {
					display: true,
				},
				ticks: {
					font: {
						weight: 'normal',
					},
				},
				stepSize: 1,
				suggestedMin: 1,
			},
		},
	}
}

export const optionsForDomainWisePerformanceReport = (
	schoolRankingsBasedOnTeachersIRI,
) => {
	return {
		maintainAspectRatio: false,
		layout: {
			padding: {
				left: 10,
				right: 20,
				top: 20,
				bottom: 5,
			},
		},
		plugins: {
			legend: {
				display: false,
			},
			datalabels: {
				display: false,
			},
			tooltip: {
				callbacks: {},
				bodyFont: {
					size: 13,
				},
				titleFont: {
					size: 15,
					weight: 600,
				},
				bodySpacing: 5,
				titleMarginBottom: 10,
				padding: 10,
			},
		},
		scales: {
			x: {
				grid: {
					display: false,
				},
				ticks: {
					font: {
						weight: 'bold',
					},
				},
			},
			y: {
				beginAtZero: true,
				grid: {
					display: true,
				},
				ticks: {
					font: {
						weight: 'normal',
					},
					callback: function (value) {
						return `${value.toFixed(2)}`
					},
					stepSize: 1,
					max: 4.5,
					min: 0.5,
				},
			},
		},
	}
}

export const optionsForDISCWisePerformanceSchool = (
	schoolRankingsBasedOnTeachersIRI,
) => {
	const Labels = ['Dominance', 'Influence', 'Steadiness', 'Compliance']
	return {
		maintainAspectRatio: false,
		layout: {
			padding: {
				left: 10,
				right: 20,
				top: 20,
				bottom: 5,
			},
		},
		plugins: {
			legend: {
				display: false,
			},
			datalabels: {
				display: false,
			},
			tooltip: {
				callbacks: {
					label: (context) => {
						const labelIndex = context.datasetIndex
						const dataIndex = context.dataIndex
						return `${Labels[labelIndex]}: ${context.parsed.y}`
					},
				},
				bodyFont: {
					size: 13,
				},
				titleFont: {
					size: 15,
					weight: 600,
				},
				bodySpacing: 10,
				titleMarginBottom: 10,
				padding: 10,
			},
		},
		scales: {
			x: {
				grid: {
					display: false,
				},
				ticks: {
					font: {
						weight: 'bold',
					},
				},
			},
			y: {
				beginAtZero: true,
				grid: {
					display: true,
				},
				ticks: {
					font: {
						weight: 'normal',
					},
					callback: function (value) {
						return `${value.toFixed(2)}`
					},
					stepSize: 1,
					max: 4.5,
					min: 0.5,
				},
			},
		},
	}
}

export const uploadTeacherProfilingData = async (
	dispatch,
	excelTableData,
	setInputFileObject,
	counsellorName,
	setDeleteBulkDialog,
	setResponse,
	recordId,
	refreshList,
) => {
	const teacherProfiling = excelTableData?.map((data) => {
		const teacherAttitudeScore = []
		const teacherPracticesScore = []
		const teacherJobLifeSatisfactionScore = []
		const teacherDISCProfilesScore = []

		for (let i = 1; i <= 16; i++) {
			teacherDISCProfilesScore.push({
				questionNumber: i,
				marks: parseInt(data[`DISC Profiles Q.${i}`]),
			})
		}

		for (let i = 1; i <= 9; i++) {
			teacherJobLifeSatisfactionScore.push({
				questionNumber: i,
				marks: parseInt(data[`Job-Life Satisfaction Q.${i}`]),
			})
		}

		for (let i = 1; i <= 12; i++) {
			teacherAttitudeScore.push({
				questionNumber: i,
				marks: parseInt(data[`Teaching Attitude Q.${i}`]),
			})
		}

		for (let i = 1; i <= 12; i++) {
			teacherPracticesScore.push({
				questionNumber: i,
				marks: parseInt(data[`Teaching Practices Q.${i}`]),
			})
		}

		const dateOfAssessmentValue = data['Date of Assessment']

		let dateOfAssessment
		if (dateOfAssessmentValue) {
			let splittedDate = dateOfAssessmentValue.split('/')

			if (dateOfAssessmentValue.includes('-')) {
				splittedDate = dateOfAssessmentValue.split('-')
			}

			const [day, month, year] = splittedDate
			dateOfAssessment = new Date(`${year}-${month}-${day}`)
		}

		return {
			teacher_id: data['Teacher ID'].trim(),
			counsellorName: counsellorName.trim(),
			dateOfAssessment: dateOfAssessment,
			teacherAttitudeScore: teacherAttitudeScore,
			teacherPracticesScore: teacherPracticesScore,
			teacherJobLifeSatisfactionScore: teacherJobLifeSatisfactionScore,
			teacherDISCProfilesScore: teacherDISCProfilesScore,
		}
	})
	const body = {
		data: teacherProfiling,
		schoolProfilingId: recordId,
	}
	dispatch(bulkUploadTeacherProfilingAssessment({ body })).then((res) => {
		setResponse(res)
		if (res?.payload?.fileContainsError) {
			setDeleteBulkDialog(true)
		}
		if (!res.error) {
			setInputFileObject({
				fileName: '',
				file: '',
				fileUrl: '',
				extensionError: false,
			})
			refreshList()
		}
	})
}

export const getSelectedProfiles = (selectedRowData) => {
	const mapping = [
		{
			key: 'isTeachingAttitudeSelected',
			label: 'Teaching Attitude',
			id: 'teachingAttitude',
		},
		{
			key: 'isTeachingPracticesSelected',
			label: 'Teaching Practices',
			id: 'teachingPractices',
		},
		{
			key: 'isJobLifeSatisfactionSelected',
			label: 'Job Life Satisfaction',
			id: 'jobLifeSatisfaction',
		},
		{ key: 'isDISCSelected', label: 'DISC Profiles', id: 'discProfiles' },
	]

	return mapping.map((item) => ({
		id: item.id,
		label: item.label,
		selected: !!selectedRowData?.[item.key], // true/false
	}))
}

// Function to Filter mandatroy keys  based on school sections for bulk upload teacher profiling
export const getFilteredMandatoryKeys = (schoolData, allKeys) => {
	const sections = {
		isTeachingAttitudeSelected: 'Teaching Attitude',
		isTeachingPracticesSelected: 'Teaching Practices',
		isJobLifeSatisfactionSelected: 'Job-Life Satisfaction',
		isDISCSelected: 'DISC Profiles',
	}

	return allKeys.filter((key) => {
		// always keep Teacher ID and Date of Assessment
		if (key === 'Teacher ID' || key === 'Date of Assessment') return true

		// check which section the key belongs to
		for (const [flag, sectionName] of Object.entries(sections)) {
			if (key.startsWith(sectionName)) {
				return schoolData[flag] // include only if flag is true
			}
		}
		return false
	})
}

//  filter out  schools with all 0 values from dataForDomainWisePerformanceReport
export const getFilteredDomainWiseReport = (reportData) => {
	if (!reportData?.labels?.length) return reportData

	// find which school indexes have non-zero values
	const validIndexes = reportData.labels
		.map((_, i) =>
			reportData.datasets.some((ds) => ds.data?.[i] > 0) ? i : null,
		)
		.filter((i) => i !== null)

	// filter labels and datasets accordingly
	return {
		labels: validIndexes.map((i) => reportData.labels[i]),
		datasets: reportData.datasets.map((ds) => ({
			...ds,
			data: validIndexes.map((i) => ds.data[i]),
		})),
	}
}
