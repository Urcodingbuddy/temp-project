import { width } from '@mui/system'
import { truncateString } from '../StudentCope/StudentCopeConstants'
import {
	bulkUploadTeacherIRIAssessment,
	getAllIRIForSchool,
	getAllIRIForTeacher,
} from './teacherIRISlice'
import { wrapBarGraphLabel } from '../../../utils/utils'

export const fetchAllIRIForSchoolRecords = (
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
			byDate: filterData?.byDate,
			startDate: filterData?.startDate,
			endDate: filterData?.endDate,
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
	dispatch(getAllIRIForSchool({ body }))
}

export const fetchAllIRIForTeacherRecords = (
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
		schoolIRIId: schoolId,
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
	dispatch(getAllIRIForTeacher({ body }))
}

export const overAllIRISchoolData = (data) => {
	const scaleLabels = [
		'perspectiveTakingScale',
		'fantasyScale',
		'empathicConcernScale',
		'personalDistressScale',
	]

	const datasets = scaleLabels.map((scaleLabel) => ({
		label: scaleLabel,
		data:
			data.subScaleWisePerformanceOfSchools?.map(
				(record) => record.scaleScore[0][scaleLabel],
			) || [],
		rank:
			data.subScaleWisePerformanceOfSchools?.map(
				(record) => record.rank,
			) || [],
		backgroundColor: getBackgroundColor(scaleLabel),
		borderWidth: 0,
		barThickness:
			data.domainWisePercentagesOfEachSchool?.length <= 6 ? 40 : null,
		borderRadius: 4,
		barPercentage: 0.5,
		categoryPercentage: 0.9,
	}))

	const labels =
		data.subScaleWisePerformanceOfSchools?.map((record) => {
			const nameLines = wrapBarGraphLabel(record.schoolName || '', 35)
			const p = Number(record?.percentile)
			const percentileLine = `(Percentile: ${Number.isFinite(p) ? p.toFixed(2) : '-'})`
			// Return an array so Chart.js renders multi-line
			return [...nameLines, percentileLine]
		}) || []

	return { labels, datasets }
}

const getBackgroundColor = (scaleLabel) => {
	switch (scaleLabel) {
		case 'perspectiveTakingScale':
			return '#025ABD'
		case 'fantasyScale':
			return '#DD2A2B'
		case 'empathicConcernScale':
			return '#F8A70D'
		case 'personalDistressScale':
			return '#25C548'
		default:
			return 'gray'
	}
}

export const BarDataForGenderWiseReport = (data) => {
	const labelsWithRank =
		data.subScaleWisePerformanceOfSchools?.map(
			(record) => wrapBarGraphLabel(record.schoolName || '', 28), // ✅ wrap here
		) || []

	return {
		labels: labelsWithRank,
		datasets: [
			{
				label: 'Male Score',
				data: labelsWithRank.map(
					(school) =>
						data.subScaleWisePerformanceOfSchools.find(
							(record) => record.schoolName === school,
						)?.maleAvg?.average || 0,
				),
				backgroundColor: '#01234A',
				borderWidth: 0,
				barThickness:
					data.domainWisePercentagesOfEachSchool?.length <= 6
						? 20
						: null, // Adjust thickness
				borderRadius: 4,
				barPercentage: 0.4,
				categoryPercentage: 0.8,
			},
			{
				label: 'Female Score',
				data: labelsWithRank.map(
					(school) =>
						data.subScaleWisePerformanceOfSchools.find(
							(record) => record.schoolName === school,
						)?.feMaleAvg?.average || 0,
				),
				backgroundColor: '#F8A70D',
				borderWidth: 0,
				barThickness:
					data.domainWisePercentagesOfEachSchool?.length <= 6
						? 20
						: null, // Adjust thickness
				borderRadius: 4,
				barPercentage: 0.4,
				categoryPercentage: 0.8,
			},
		],
	}
}

export const DataforResultAndDiscussion = (data, teacherName) => {
	const labels =
		data?.map((record) => `${record?.teacherScore?.toFixed(2)}`) || []
	return {
		labels: labels,
		datasets: [
			{
				// label: ,
				data: data?.map((d) => d?.teacherScore),
				backgroundColor: '#B1CFF1',
				borderWidth: 0,
				barThickness: 30, // Adjust thickness
				borderRadius: 4,
				barPercentage: 0.4,
				categoryPercentage: 0.8,
			},
		],
	}
}

export const generateChartOptionsForDomainWiseMale = (annotationValue) => {
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
						mode: 'vertical',
						scaleID: 'x',
						value:
							annotationValue !== undefined
								? annotationValue
								: undefined,
						borderColor: 'black',
						borderWidth: 2,
						borderDash: [0],
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

export const optionsForGenderWiseReport = (
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
				callbacks: {
					label: function (tooltipItem) {
						const school =
							schoolRankingsBasedOnTeachersIRI
								?.subScaleWisePerformanceOfSchools[
								tooltipItem.dataIndex
							]
						return `Teacher: ${school.totalTeacherCount}`
					},
					footer: function (tooltipItem) {
						const dataIndex = tooltipItem[0]?.dataIndex
						const school =
							schoolRankingsBasedOnTeachersIRI
								?.subScaleWisePerformanceOfSchools[dataIndex]
						const maleAverage = school?.maleAvg?.average || 0
						const feMaleAverage = school?.feMaleAvg?.average || 0
						const label =
							tooltipItem[0]?.datasetIndex === 0
								? 'Male Average'
								: 'Female Average'
						const gender =
							label === 'Female Average' ? 'Female' : 'Male'

						return `Average (${gender}): ${label === 'Male Average' ? maleAverage.toFixed(2) : feMaleAverage.toFixed(2)}`
					},
				},
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

export const optionsForDomainWisePerformanceSchool = (
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
				callbacks: {
					label: function (tooltipItem) {
						const school =
							schoolRankingsBasedOnTeachersIRI
								?.subScaleWisePerformanceOfSchools[
								tooltipItem.dataIndex
							]
						const scaleLabel = tooltipItem.dataset.label
						const scaleScore =
							school.scaleScore[0][scaleLabel].toFixed(2)
						let labelName = scaleLabel
						switch (scaleLabel) {
							case 'perspectiveTakingScale':
								labelName = 'Perspective Taking'
								break
							case 'fantasyScale':
								labelName = 'Vicarious Empathy / Imagination'
								break
							case 'empathicConcernScale':
								labelName = 'Empathic Concern'
								break
							case 'personalDistressScale':
								labelName = 'Altruistic Reactivity'
								break
							default:
								break
						}
						return `${labelName}: Score: ${scaleScore}`
					},

					header: function (tooltipItems) {
						const school =
							schoolRankingsBasedOnTeachersIRI
								?.subScaleWisePerformanceOfSchools[
								tooltipItems[0].dataIndex
							]
						return school.schoolName
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

export const uploadTeacherIRIData = async (
	dispatch,
	excelTableData,
	setInputFileObject,
	counsellorName,
	setDeleteBulkDialog,
	setResponse,
	recordId,
	refreshList,
) => {
	const teacherIRI = excelTableData?.map((data) => {
		const score = []

		for (let i = 1; i <= 28; i++) {
			score.push({
				questionNumber: i,
				marks: parseInt(data[`Q.${i}`]),
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
			scores: score,
			dateOfAssessment: dateOfAssessment,
			teacher_id: data['Teacher ID'],
		}
	})
	const body = {
		data: teacherIRI,
		schoolIRIId: recordId,
		counsellorName: counsellorName.trim(),
	}
	dispatch(bulkUploadTeacherIRIAssessment({ body })).then((res) => {
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
