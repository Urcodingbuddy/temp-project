import { requestParams } from '../../../utils/apiConstants'
import { getAllClassroomsForStudents } from '../../../redux/commonSlice'
import {
	deleteObservation,
	getObservations,
	setObservationFilterClasses,
	setObservationFilterSchools,
	addObservation,
	updateObservation,
} from './observationSlice'

export const fetchAllObservations = (
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
	dispatch(getObservations({ body }))
}

const testInValid = [undefined, null, '']

export const isButtonEnabled = (observationData) => {
	let needImprovementOrNotPresentCount = 0 // Counter for "NeedImprovement" or "NotPresent" statuses with empty comments
	let validFieldCount = 0 // Counter for fields with valid status and comments
	for (const key in observationData) {
		const field = observationData[key]

		if (
			field &&
			field.status !== undefined &&
			field.comments !== undefined
		) {
			validFieldCount++ // Increment the valid field count

			const status = field.status
			const comments = field.comments

			if (status === 'NeedImprovement' || status === 'NotPresent') {
				if (comments === '') {
					needImprovementOrNotPresentCount++ // Increment the counter if comments are empty for "NeedImprovement" or "NotPresent" status
				}
			}
		}
	}

	// Enable the button if all fields have valid status and comments, and there are no "NeedImprovement" or "NotPresent" statuses with empty comments
	return validFieldCount > 0 && needImprovementOrNotPresentCount === 0
}

export const isDisabled = (observationData) => {
	return (
		testInValid.includes(observationData?.studentName) ||
		testInValid.includes(observationData?.user_id) ||
		testInValid.includes(observationData?.duration)
	)
}

export const handleSchoolsObservation = (dispatch, schoolIds, filter) => {
	dispatch(setObservationFilterSchools(schoolIds))
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

export const handleClassesObservation = (
	dispatch,
	classes,
	setSectionOptions,
	classroomsListForStudents,
) => {
	dispatch(setObservationFilterClasses(classes))
	const filteredSections = classroomsListForStudents
		.filter((classroom) => classes?.includes(classroom.className))
		.map((classroom) => classroom.section)

	setSectionOptions([...new Set(filteredSections)])
}

export const handleSectionsObservation = (
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

export const handleAppplyFilterObservation = async (
	dispatch,
	setFilterObservationSectionDrawer,
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
	const response = await dispatch(getObservations({ body }))
	if (!response?.error) {
		setFilterObservationSectionDrawer(false)
	}
}

export const handleDeleteObservation = async (
	observationId,
	dispatch,
	setDeleteObservationDialog,
	refreshListAndCloseDialog,
) => {
	const body = {
		[requestParams.id]: observationId,
	}
	const response = await dispatch(deleteObservation({ body }))

	if (!response?.error) {
		setDeleteObservationDialog(false)
		refreshListAndCloseDialog()
	}
}

export const addObservationRecord = async (
	dispatch,
	observationData,
	school,
	academicYear,
	refreshList,
	clearAllListOptionsRef,
) => {
	const body = {
		studentData: observationData,
		school,
		academicYear,
	}
	const response = await dispatch(addObservation({ body }))

	if (!response.error) {
		refreshList()
		clearAllListOptionsRef.current?.clearAllListOptions()
	}
}

export const handleSaveObservation = async (
	observationData,
	dispatch,
	id,
	refreshList,
) => {
	const body = { ...observationData, id }

	const response = await dispatch(updateObservation({ body }))

	if (!response?.error) {
		refreshList()
	}
}
