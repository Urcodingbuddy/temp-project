import { requestParams } from '../../../utils/apiConstants'
import {
	getAllClassroomsForStudents,
	viewAllStudentsForSchoolActions,
} from '../../../redux/commonSlice'
import {
	deleteIndividualRecord,
	getIndividualRecords,
	setIndividualCaseFilterClasses,
	setIndividualCaseFilterSchools,
	addStudentIndividualRecord,
	updateIndividualRecord,
} from './individualCaseSlice'

export const fetchAllIndividualRecords = (
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
	dispatch(getIndividualRecords({ body }))
}

export const updateSchoolsIndividualCase = (dispatch, schoolIds, filter) => {
	dispatch(setIndividualCaseFilterSchools(schoolIds))
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

export const updateClassroomsIndividualCase = (
	dispatch,
	classes,
	setSectionOptions,
	classroomsListForStudents,
) => {
	dispatch(setIndividualCaseFilterClasses(classes))
	const filteredSections = classroomsListForStudents
		.filter((classroom) => classes?.includes(classroom.className))
		.map((classroom) => classroom.section)

	setSectionOptions([...new Set(filteredSections)])
}

export const handleSectionChangeIndividualCase = (
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

export const handleApplySectionFilterIndividiualCase = async (
	dispatch,
	setFilterIndividualCaseSectionDrawer,
	filterFields,
	studentStatus,
) => {
	const body = {
		[requestParams.filter]: {
			[requestParams.className]: filterFields.classes,
			[requestParams.section]: filterFields.sections,
			[requestParams.schoolIds]: filterFields.schools,
			[requestParams.studentStatus]: studentStatus,
		},
		[requestParams.sortKeys]: [
			{
				[requestParams.key]: 'studentName',

				[requestParams.value]: 1,
			},
		],
	}
	const response = await dispatch(getIndividualRecords({ body }))
	if (!response?.error) {
		setFilterIndividualCaseSectionDrawer(false)
	}
}

export const handleDeleteIndividualRecord = async (
	individualRecordId,
	dispatch,
	setDeleteIndividualRecordDialog,
	refreshListAndCloseDialog,
) => {
	const body = {
		[requestParams.id]: individualRecordId,
	}
	const response = await dispatch(deleteIndividualRecord({ body }))

	if (!response?.error) {
		setDeleteIndividualRecordDialog(false)
		refreshListAndCloseDialog()
		// dispatch(
		// 	getIndividualRecords({
		// 		body: { filter: { studentStatus: 'Active' } },
		// 	}),
		// )
	}
}

export const handleInputsInitiations = (
	e,
	setInputs,
	inputs,
	dispatch,
	classroomsListForStudents,
	setSectionOptions,
) => {
	const { name, value } = e.target
	const obj = {}
	obj[name] = value
	const inputstate = { ...inputs, ...obj }
	setInputs(inputstate)
	if (name === 'schools') {
		if (value.length !== 0) {
			dispatch(
				getAllClassroomsForStudents({
					body: {
						filter: {
							schoolIds: value,
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
		const filteredSections = classroomsListForStudents
			.filter((classroom) => value?.includes(classroom.className))
			.map((classroom) => classroom.section)
		setSectionOptions(filteredSections)
	}
}

export const searchStudent = async (dispatch, body, setStSearchData) => {
	const response = await dispatch(viewAllStudentsForSchoolActions({ body }))
	if (!response?.error) {
		setStSearchData(response?.payload)
	}
}

export const getSelectStudent = async (
	dispatch,
	filter,
	searchText,
	setStSelectData,
	isNotClassRoomId,
	classroomsListForStudents,
) => {
	let body
	if (isNotClassRoomId) {
		const { schoolIds, className, section } = filter
		body = {
			[requestParams.filter]: {
				schoolIds,
			},
		}
		const filteredIds = classroomsListForStudents
			.filter((classroom) => className.includes(classroom.className))
			.map((classroom) => classroom._id)

		const filteredSections = classroomsListForStudents.filter((classroom) =>
			filteredIds.includes(classroom._id),
		)
		const classRoomIds = filteredSections
			.filter((s) => section?.includes(s.section))
			.map((ss) => ss._id)
		body[requestParams.filter]['classRoomIds'] = classRoomIds
	} else {
		const { schoolIds, className } = filter
		body = {
			[requestParams.filter]: {
				schoolIds,
				classRoomId: className,
			},
		}
	}

	const response = await dispatch(viewAllStudentsForSchoolActions({ body }))
	if (!response?.error) {
		setStSelectData(response?.payload)
	}
}

export const addStudentRecord = async (
	dispatch,
	data,
	school,
	academicYear,
	refreshList,
	selectedStudents,
	isIndividualCase,
	handleClose,
) => {
	let dataToSend
	if (isIndividualCase) {
		dataToSend = {
			...data,
			date: new Date(data.date),
			basedOn: data?.basedOn ? data?.basedOn : '',
			dimension: data?.dimension ? data?.dimension : '',
			outcome: data?.outcome ? data?.outcome : '',
			stype: data?.stype ? data?.stype : '',
		}
	} else {
		dataToSend = {
			...data,
			date: new Date(data.date),
			basedOn: data?.basedOn ? data?.basedOn : '',
			dimension: data?.dimension ? data?.dimension : '',
			outcome: data?.outcome ? data?.outcome : '',
			stype: data?.stype ? data?.stype : '',
		}
	}
	const body = {
		selectedStudents: selectedStudents,
		individualCaseData: dataToSend,
		school: school,
		academicYear: academicYear,
		isIndividualCase,
	}
	const response = await dispatch(addStudentIndividualRecord({ body }))
	if (!response?.error) {
		refreshList()
		handleClose()
	}
}

export const handleUpdateSingleIR = async (
	indivCaseData,
	dispatch,
	refreshList,
) => {
	const { _id, basedOn, dimension, outcome, stype, ...rest } = indivCaseData
	const body = {
		id: _id,
		basedOn: basedOn,
		dimension: dimension,
		outcome: outcome,
		stype: stype,
		...rest,
	}
	const response = await dispatch(updateIndividualRecord({ body }))
	if (!response?.error) {
		refreshList()
	}
}

export const handleIndividualCaseFilters = (filterFields, dispatch) => {
	const body = {
		[requestParams.filter]: {
			[requestParams.className]: filterFields?.classes,
			[requestParams.schoolIds]: filterFields?.schools,
		},
	}

	dispatch(getIndividualRecords({ body }))
}

export const handleRowDataOnSelect = (
	classroomsListForStudents,
	setSectionOptions,
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
			school: data?.school,
			_id: data?._id,
		})

		if (search) {
			handleInputsInitiations(
				{ target: { value: [data?.school], name: 'schools' } },
				setSelectedDropdownData,
				selectedDropdownData,
				dispatch,
				classroomsListForStudents,
				setSectionOptions,
			)

			handleInputsInitiations(
				{
					target: { value: [data?.className], name: 'classrooms' },
				},
				setSelectedDropdownData,
				selectedDropdownData,
				dispatch,
				classroomsListForStudents,
				setSectionOptions,
			)

			handleInputsInitiations(
				{ target: { value: [data?.section], name: 'sections' } },
				setSelectedDropdownData,
				selectedDropdownData,
				dispatch,
				classroomsListForStudents,
				setSectionOptions,
			)

			getSelectStudent(
				dispatch,
				{
					schoolIds: [data?.school],
					className: [data?.classRoomId],
				},
				'',
				setStSelectData,
				false,
				classroomsListForStudents,
			)
			handleInputsInitiations(
				{ target: { value: [data?._id], name: 'students' } },
				setSelectedDropdownData,
				selectedDropdownData,
			)

			setSelectedDropdownData((state) => ({
				...state,
				schools: [data?.school],
				classrooms: [data?.className],
				sections: [data?.section],
			}))
		}
	}
}
