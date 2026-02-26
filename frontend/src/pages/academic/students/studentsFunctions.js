import { requestParams } from '../../../utils/apiConstants'
import { invalidTest } from '../../initiations/individualCase/individualCaseConstants'
import {
	getAllClassroomsForStudents,
	getAllSections,
	viewAllStudentsForSchoolActions,
} from '../../../redux/commonSlice'
import {
	setStudentsFilterClasses,
	setStudentsFilterSchools,
	updateStudent,
	uploadStudent,
	viewAllStudents,
	deleteStudent,
	clearStudentsFilter,
	setStudentsFilterSections,
	clearStudentStatus,
	setRecallStudentApi,
} from './studentsSlice'
import * as XLSX from 'xlsx'

export const getDate = (date) => {
	const inputDate = new Date(date)
	const options = { year: 'numeric', month: 'short', day: 'numeric' }
	const formattedDate = inputDate
		.toLocaleDateString('en-US', options)
		.replace(/, /g, '-')
		.replace(/ /g, '-')
	return formattedDate
}

export const handleSectionChange = (
	event,
	section,
	selectedSections,
	setSelectedSections,
) => {
	const {
		target: { checked },
	} = event

	if (checked) {
		setSelectedSections([...selectedSections, section])
	} else {
		setSelectedSections(selectedSections.filter((item) => item !== section))
	}
}

export const handleApplySectionFilter = (
	dispatch,
	setFilterClassroomSectionDrawer,
	filterFields,
	selectedSections,
	studentStatus,
	filteredIds,
	classroomsListForStudents,
) => {
	const filteredSections = classroomsListForStudents.filter((classroom) =>
		filteredIds.includes(classroom._id),
	)
	const classRoomIds = filteredSections
		.filter((section) => selectedSections.includes(section.section))
		.map((section) => section._id)

	const body = {
		[requestParams.filter]: {
			[requestParams.classRoomId]: classRoomIds,
			// [requestParams.section]: selectedSections,
			[requestParams.schoolIds]: filterFields.schools,
			[requestParams.studentStatus]: studentStatus,
		},
	}
	dispatch(viewAllStudents({ body })).then((res) => {
		if (res?.meta?.requestStatus === 'fulfilled') {
			setFilterClassroomSectionDrawer(false)
		}
	})
}

export const fetchAllStudents = (
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
			schoolIds: filterData.selectdSchools,
			classroomIds: filterData.selectdClassrooms,
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
	dispatch(viewAllStudents({ body }))
}

export const handleClearSectionFilter = (
	dispatch,
	setFilterStudentsSectionDrawer,
	setSelectedSections,
) => {
	dispatch(clearStudentsFilter())
	setFilterStudentsSectionDrawer(false)
	dispatch(viewAllStudents({}))
	dispatch(clearStudentStatus())
	setSelectedSections([])
}

export const handleInputs = (
	e,
	setInputs,
	inputs,
	setStudentFormData,
	classList,
	setSectionOptions,
) => {
	const { name, value } = e.target
	let processedValue =
		Array.isArray(value) && value.length > 0 ? value[0] : value

	if (name === 'phone') {
		processedValue = Math.max(0, parseInt(value)).toString().slice(0, 10)
	}

	const obj = {}
	obj[name] = processedValue

	if (name === 'school') {
		obj['className'] = []
		obj['section'] = []
	}
	if (name === 'className') {
		const filteredSections = classList
			.filter((classroom) => value === classroom.className)
			.map((classroom) => classroom.section)
		setSectionOptions([...new Set(filteredSections)])
		obj['section'] = []
	}

	const inputstate = { ...inputs, ...obj }
	setInputs(inputstate)
	setStudentFormData(inputstate)
}

export const handleEditStudent = async (
	studentFormData,
	studentRowData,
	dispatch,
	setEditStudentDrawer,
	classroomsListForStudents,
	classNames,
	sections,
	refreshList,
) => {
	const filteredIds = classroomsListForStudents
		.filter((classroom) => classNames.includes(classroom.className))
		.map((classroom) => classroom._id)
	const filteredSections = classroomsListForStudents.filter((classroom) =>
		filteredIds.includes(classroom._id),
	)
	const classRoomIds = filteredSections
		.filter((s) => sections?.includes(s.section))
		.map((ss) => ss._id)
	const { className, section, ...rest } = studentFormData

	const body = {
		...rest,
		classRoomId: classRoomIds,
		gender: studentFormData?.gender[0],
		school: studentRowData?.school?._id,
		bloodGrp: studentFormData?.bloodGrp,
		id: studentRowData?._id,
	}

	const res = await dispatch(updateStudent({ body, setEditStudentDrawer }))
	if (!res?.error) {
		dispatch(setRecallStudentApi(true))
		refreshList()
	}
}

export const uploadStudentData = async (
	dispatch,
	students,
	handleModal,
	schoolsList,
	setInputFileObject,
	setDeleteBulkDialog,
	setResponse,
	schoolId,
	academicYear,
	refreshList,
) => {
	const keys = Object.keys(students[0])
	students = students.map((val) => {
		const obj = {}
		keys.forEach((key) => {
			if (key.trim() === 'School') {
				const school_id = schoolsList?.find((sc) => {
					return sc.scCode?.toString() === val[key]?.toString()
				})?._id
				obj[key] = school_id ? school_id : val[key] // Preserve the original value if no match is found
			} else if (['Reg_date', 'DOB'].includes(key)) {
				if (!invalidTest.includes(val[key])) {
					const splittedDate = val[key].includes('-')
						? val[key].split('-')
						: val[key].split('/')

					const day = splittedDate.length > 0 ? splittedDate[0] : '',
						month = splittedDate.length > 1 ? splittedDate[1] : ''
					let year =
						splittedDate.length > 1 ? `${splittedDate[2]}` : ''
					year = year.length > 2 ? +year : +`20${year}`
					const date = new Date()
					if (![day, month, year].includes('')) {
						date.setDate(day)
						date.setMonth(month - 1)
						date.setYear(year)
						obj[key] = date
					}
				} else {
					obj[key] = val[key]?.toString()
				}
			} else {
				obj[key] = val[key]?.toString()
			}
		})
		return obj
	})

	const body = {
		students,
		school: schoolId,
		academicYear: academicYear,
	}
	dispatch(uploadStudent({ body })).then((res) => {
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
			// handleModal('upload', false)
			refreshList()
		}
	})
}

export const updateSchoolsStudents = (dispatch, schoolIds, filter) => {
	dispatch(setStudentsFilterSchools(schoolIds))
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

export const updateClassroomsStudents = (
	dispatch,
	classes,
	setSectionOptions,
	classroomsListForStudents,
) => {
	dispatch(setStudentsFilterClasses(classes))
	const filteredSections = classroomsListForStudents
		.filter((classroom) => classes?.includes(classroom.className))
		.map((classroom) => classroom.section)

	setSectionOptions([...new Set(filteredSections)])
	dispatch(setStudentsFilterSections([]))
}

export const handleDeleteStudent = async (
	dispatch,
	id,
	setDeleteStudentDialog,
	setEditStudentDrawer,
	refreshList,
) => {
	const body = { [requestParams.id]: id }
	const res = await dispatch(
		deleteStudent({ body, setDeleteStudentDialog, setEditStudentDrawer }),
	)

	if (!res?.error) {
		dispatch(setRecallStudentApi(true))
		refreshList()
	}
}

export const getClasslist = async (
	dispatch,
	formData,
	setClasslist,
	setSectionOptions,
	lastPromotionAcademicYear,
) => {
	const res = await dispatch(
		getAllClassroomsForStudents({
			body: {
				filter: {
					academicYear: [lastPromotionAcademicYear],
					schoolIds:
						typeof formData?.school?._id === 'string'
							? [formData?.school?._id]
							: formData?.school?._id,
				},
			},
		}),
	)

	if (!res?.error) {
		setClasslist(res?.payload)
		const filteredSections = res?.payload
			.filter((classroom) =>
				typeof formData?.className === 'string'
					? formData?.className === classroom.className
					: formData?.className?.includes(classroom.className),
			)
			.map((classroom) => classroom.section)

		setSectionOptions([...new Set(filteredSections)])
		return res?.payload
	}
}

export const getSectionslist = async (
	dispatch,
	schoolIds,
	classes,
	setSectionslist,
) => {
	const res = await dispatch(
		getAllSections({
			body: {
				filter: {
					schoolIds:
						typeof schoolIds === 'string' ? [schoolIds] : schoolIds,
					classes: typeof classes === 'string' ? [classes] : classes,
				},
			},
		}),
	)
	if (!res?.error) {
		setSectionslist(res?.payload)
		return res?.payload
	}
}

export const ErrorMsgDownload = (response, setDeleteBulkDialog, fileName) => {
	const existingStudentIds = response?.payload?.error || []
	const validationErrors = response?.payload?.validationErrors || []
	if (validationErrors.length > 0 || existingStudentIds.length > 0) {
		let data
		if (validationErrors.length > 0) {
			data = [
				['Validation Errors'],
				...validationErrors.map((id) => [id]),
			]
		} else if (existingStudentIds.length > 0) {
			data = [
				['Student ID ', 'Student ID Error', 'Classroom Error'],
				...existingStudentIds?.map((error) => [
					error.id,
					error.errors['Student ID'],
					error.errors['Classroom'],
				]),
			]
		}

		const worksheet = XLSX.utils.aoa_to_sheet(data)
		const wscols = [{ wch: 50 }, { wch: 50 }, { wch: 50 }]
		worksheet['!cols'] = wscols

		const workbook = XLSX.utils.book_new()
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
		XLSX.writeFile(workbook, fileName)
	}

	setDeleteBulkDialog(false)
}
