import { getAllClassroomsForStudents } from '../../../redux/commonSlice'
import { requestParams } from '../../../utils/apiConstants'
// import { viewAllStudents } from '../../academic/students/studentsSlice';
import { questions } from './StudentCopeConstants'
import {
	bulkUploadStudentCopeAssessment,
	getStudentCopeAssessment,
} from './StudentCopeSlice'

export const handleRowDataOnSelect = (
	value,
	listData,
	setRowData,
	selectedDropdownData,
	setSelectedDropdownData,
	setStSelectData,
	dispatch,
	search,
) => {
	const data = listData?.data?.find((stSel) => stSel?._id === value[0])

	if (data) {
		setRowData({
			studentName: data?.studentName,
			user_id: data?.user_id,
			school: data?.school?._id,
		})

		if (search) {
			handleInputsInitiations(
				{ target: { value: [data?.school?._id], name: 'schools' } },
				setSelectedDropdownData,
				selectedDropdownData,
				dispatch,
				[data?.school?._id],
			)

			handleInputsInitiations(
				{ target: { value: [data?.className], name: 'classrooms' } },
				setSelectedDropdownData,
				selectedDropdownData,
				dispatch,
				[data?.school?._id],
				[data?.className],
			)

			handleInputsInitiations(
				{ target: { value: [data?.section], name: 'sections' } },
				setSelectedDropdownData,
				selectedDropdownData,
			)

			handleInputsInitiations(
				{ target: { value: [data?._id], name: 'students' } },
				setSelectedDropdownData,
				selectedDropdownData,
			)

			getSelectStudent(
				dispatch,
				{
					schoolIds: [data?.school?._id],
					className: [data?.className],
					section: [data?.section],
				},
				'',
				setStSelectData,
				true,
			)

			setSelectedDropdownData((state) => ({
				...state,
				schools: [data?.school?._id],
				classrooms: [data?.className],
				sections: [data?.section],
			}))
		}
	}
}

export const fetchStudentCopeAssessment = (
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
			classroomIds: filterData.selectdClassrooms,
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
	dispatch(getStudentCopeAssessment({ body }))
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

export const getSelectStudent = async (
	dispatch,
	filter,
	searchText,
	select,
) => {
	let body
	if (select) {
		const { schoolIds, className, section } = filter
		body = {
			[requestParams.filter]: {
				schoolIds,
				className,
				section,
			},
		}
	} else {
		body = {
			[requestParams.searchText]: searchText,
		}
	}

	await dispatch(getStudentCopeAssessment({ body }))
}

export const searchStudent = async (
	dispatch,
	body,
	setSearchData,
	searchData,
) => {
	const response = await dispatch(getStudentCopeAssessment({ body }))
	if (!response?.error) {
		if (response?.payload?.data?.length > 0) {
			setSearchData([
				...response?.payload?.data?.filter(
					(d) => !searchData.some((item) => item._id == d._id),
				),
				...searchData,
			])
		}
	}
}

export const handleDeleteStudentCope = async (
	dispatch,
	id,
	deleteStudentCopeAssessment,
	setAnchorElPopover,
	setDeleteObservationDialog,
	refreshList,
) => {
	const body = { id }
	const response = await dispatch(deleteStudentCopeAssessment({ body }))

	if (!response?.error) {
		refreshList('edit')
		setAnchorElPopover(null)
		setDeleteObservationDialog(false)
	}
}

export const uploadStudentCopeData = async (
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
	const studentCopes = excelTableData?.map((data) => {
		const ratings = questions?.map((q, index) => ({
			questionNumber: index + 1,
			marks: parseInt(data[`Q.${index + 1}`]) || 0,
		}))

		const dateOfAssessmentValue = data['Date of Assessment']
		let dateOfAssessment
		if (dateOfAssessmentValue) {
			const [day, month, year] = dateOfAssessmentValue.split('/')
			dateOfAssessment = new Date(`${year}-${month}-${day}`)
		}

		return {
			counsellorName: counsellorName,
			scCode: data['scCode'],
			user_id: data['Student ID'],
			ratings: ratings,
			dateOfAssessment: dateOfAssessment,
		}
	})
	const body = {
		students: studentCopes,
		academicYear,
		school,
	}
	dispatch(bulkUploadStudentCopeAssessment({ body })).then((res) => {
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
export const optionsForStudentCOPEAnalytics = () => {
	return {
		maintainAspectRatio: true,
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
				bodyFont: {
					size: 13,
				},
				titleFont: {
					size: 15,
					weight: 600,
				},
				bodySpacing: 20,
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

export const ChartOptionsForStudentCOPE = (annotationValue, isShowYAxis) => {
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
