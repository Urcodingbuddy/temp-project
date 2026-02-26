import {
	getAllClassrooms,
	getAllClassroomsForStudents,
	getAllSections,
} from '../../../redux/commonSlice'

import {
	setSELTrackerListFilterClasses,
	setSELTrackerListFilterSchools,
	getSELTrackerLIst,
	addSELCurriculumTracker,
	updateSELCurriculumTracker,
	deleteSELCurriculumTracker,
	getSelTrackerModules,
} from './SELSlice'

export const fetchAllSELTrackerList = (
	dispatch,
	filterData,
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
			section: filterData.selectdSections,
		},
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
	dispatch(getSELTrackerLIst({ body }))
}

export const updateSchoolsSELTrackerListCase = (dispatch, schoolIds) => {
	dispatch(setSELTrackerListFilterSchools(schoolIds))
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

export const updateClassroomsSELTrackerListCase = (
	dispatch,
	classes,
	setSectionOptions,
	classroomsListForStudents,
) => {
	dispatch(setSELTrackerListFilterClasses(classes))

	const filteredSections = classroomsListForStudents
		.filter((classroom) => classes?.includes(classroom.className))
		.map((classroom) => classroom.section)

	setSectionOptions([...new Set(filteredSections)])
}

export const getClassrooms = (dispatch, schoolIds) => {
	dispatch(
		getAllClassrooms({
			body: {
				filter: {
					schoolIds,
				},
			},
		}),
	)
}

export const getSections = (dispatch, schoolIds, classes) => {
	dispatch(
		getAllSections({
			body: {
				filter: {
					schoolIds,
					classes,
				},
			},
		}),
	)
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

const formData = (data) => {
	data.coreCompetency = data.coreCompetency.toString()
	data.outcome = data.outcome.toString()
	return data
}

export const addSelTracker = async (
	dispatch,
	data,
	refreshList,
	clearAllListOptionsRef,
) => {
	const body = {
		SELData: { ...data.inputVals },
		academicYear: data.barFilterData.selectdAYs,
		school: data.barFilterData.selectdSchools,
		classroomId: data.barFilterData.selectdClassrooms[0],
	}
	const response = await dispatch(addSELCurriculumTracker({ body }))
	if (!response?.error) {
		refreshList()
		clearAllListOptionsRef.current?.clearAllListOptions()
	}
}

export const updateSelTracker = async (dispatch, id, data, refreshList) => {
	const body = {
		id,
		SELData: { ...data.inputVals },
		academicYear: data.barFilterData.selectdAYs,
		school: data.barFilterData.selectdSchools,
		classroomId: data.barFilterData.selectdClassrooms[0],
	}
	const response = await dispatch(updateSELCurriculumTracker({ body }))
	if (!response?.error) {
		refreshList()
	}
}

export const handleDeleteSelTracker = async (
	id,
	dispatch,
	setDeleteSelTrackerDialog,
	refreshListAndCloseDialog,
) => {
	const body = { id }
	const response = await dispatch(deleteSELCurriculumTracker({ body }))

	if (!response?.error) {
		refreshListAndCloseDialog()
		setDeleteSelTrackerDialog(false)
	}
}

export const handleSectionChangeSELTrackerList = (
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

export const fetchAllSELTrackerModules = (dispatch, year, month) => {
	dispatch(
		getSelTrackerModules({
			body: {
				year: year,
				month: month,
			},
		}),
	)
}
