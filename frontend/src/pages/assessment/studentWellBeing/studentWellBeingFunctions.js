import {
	getAllClassrooms,
	getAllClassroomsForStudents,
	getAllSections,
} from '../../../redux/commonSlice'
import { requestParams } from '../../../utils/apiConstants'
import {
	bulkUploadStudentWellBeing,
	deleteStudentWellBeing,
	getSingleStudentWellBeing,
	getStudentWellBeing,
} from './StudentWellBeingSlice'

export const fetchStudentWellBeing = (
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
			academicYear: filterData.selectdAYs ?? [],
			schoolIds: filterData.selectdSchools,
			className: filterData.selectdClassrooms,
			section: filterData.selectdSections,
			studentStatus: filterData.studentStatus,
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
	dispatch(getStudentWellBeing({ body }))
}

export const handleFilterOptions = (
	classrooms,
	sections,
	students,
	setSelectedDropdownData,
) => {
	const obj = {}
	if (classrooms) obj['classrooms'] = []
	if (sections) obj['sections'] = []
	if (students) obj['students'] = []
	setSelectedDropdownData((state) => ({ ...state, ...obj }))
}

export const handleInputsInitiations = (
	e,
	setInputs,
	inputs,
	dispatch,
	schoolIds,
	classes,
) => {
	const { name, value } = e.target
	const obj = {}
	obj[name] = value
	const inputstate = { ...inputs, ...obj }
	setInputs(inputstate)
	if (name === 'schools') {
		if (schoolIds.length !== 0) {
			dispatch(
				getAllClassroomsForStudents({
					body: {
						filter: {
							schoolIds,
						},
					},
				}),
			)
		}
		obj['sections'] = []
		obj['classrooms'] = []
		const inputstate = { ...inputs, ...obj }
		setInputs(inputstate)
	} else if (name === 'classrooms') {
		obj['sections'] = []
		const inputstate = { ...inputs, ...obj }
		setInputs(inputstate)
	}
}

export const generateChartOptions = (annotationValue, data) => {
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
						weight: 500,
					},
					color: 'rgba(0, 0, 0, 1)',

					callback: function (value, index) {
						const label = data?.labels[index]
						if (label?.length > 18) {
							const lines = [label.slice(0, 18), label.slice(18)]
							return lines
						} else {
							return label
						}
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
				},
				stepSize: 1,
				suggestedMin: 1,
			},
		},
	}
}

export const ChartOptions = (annotationValue, isShowYAxis, data, ranks) => {
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
						lineHeight: 1.3,
						size: '12px',
					},
					color: '#313131',
					callback: function (value, index) {
						const label = data?.labels[index]
						if (label?.length > 20) {
							if (!ranks) {
								const lines = [
									label.slice(0, 10),
									label.slice(10, 20) + '...',
								]
								return lines
							} else {
								const lines = [
									label.slice(0, 10),
									label.slice(10, 16) +
										'...' +
										' (Rank ' +
										ranks?.[index] +
										')',
								]
								return lines
							}
						} else if (label?.length > 10) {
							if (!ranks) {
								const lines = [
									label.slice(0, 10),
									label.slice(10),
								]
								return lines
							} else {
								const lines = [
									label.slice(0, 10),
									label.slice(10, 16) +
										'... ' +
										'(Rank ' +
										ranks?.[index] +
										')',
								]
								return lines
							}
						} else {
							if (ranks) {
								return [
									label + ' (Rank ' + ranks?.[index] + ')',
								]
							}
							return label
						}
					},
				},
			},
			y: {
				grid: {
					display: true,
				},
				ticks: {
					display: isShowYAxis,
					font: {
						weight: 'normal',
					},
				},
				stepSize: 100,
				suggestedMin: 0,
				beginAtZero: true,
			},
		},
	}
}

export const uploadStudentWellBeingData = async (
	dispatch,
	excelTableData,
	setInputFileObject,
	counsellorName,
	setDeleteBulkDialog,
	setResponse,
	refreshList,
	academicYear,
	school,
) => {
	const studentWellBeing = excelTableData?.map((data) => {
		const childrensHopeScale = []
		const psychologicalWellBeingScale = []
		for (let i = 1; i <= 6; i++) {
			if (parseInt(data[`${'CHS Q'}.${i}`])) {
				childrensHopeScale.push({
					questionNumber: i,
					marks: parseInt(data[`${'CHS Q'}.${i}`]),
				})
			}
		}

		for (let i = 1; i <= 18; i++) {
			if (parseInt(data[`${'PWB Q'}.${i}`])) {
				psychologicalWellBeingScale.push({
					questionNumber: i,
					marks: parseInt(data[`${'PWB Q'}.${i}`]),
				})
			}
		}

		const dateOfAssessmentValue = data['Date of Assessment']
		let dateOfAssessment
		if (dateOfAssessmentValue) {
			const [day, month, year] = dateOfAssessmentValue.split('/')
			dateOfAssessment = new Date(`${year}-${month}-${day}`)
		}
		return {
			user_id: data['Student ID']?.trim(),
			scCode: data['scCode']?.trim(),
			counsellorName: counsellorName?.trim(),
			dateOfAssessment: dateOfAssessment,
			childrensHopeScale: childrensHopeScale,
			psychologicalWellBeingScale: psychologicalWellBeingScale,
		}
	})
	const body = {
		students: studentWellBeing,
		academicYear,
		school,
	}
	dispatch(bulkUploadStudentWellBeing({ body })).then((res) => {
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

			refreshList('upload')
		}
	})
}

export const handleDeleteStudentWellBeing = async (
	dispatch,
	id,
	setDeleteDialog,
	refreshList,
) => {
	const response = await dispatch(deleteStudentWellBeing({ id }))

	if (!response?.error) {
		setDeleteDialog(false)
		refreshList('edit')
	}
}
