import {
	deleteClassroom,
	setClassroomFilterClasses,
	setClassroomFilterSchools,
	setClassroomFilterSections,
	viewAllClassrooms,
	editClassroom,
	uploadClassroom,
} from './classroomsSlice'
import { getAllClassrooms, getAllSections } from '../../../redux/commonSlice'
import { validateEmail } from '../../../utils/utils'

export const flatAllClassRooms = (classRooms) => {
	return classRooms?.map((clas) => ({
		...clas,
		school: clas?.school?.school,
		teacherName: clas?.teacher?.teacherName,
		email: clas?.teacher?.email,
		phone: clas?.teacher?.phone,
	}))
}

export const fetchAllClassrooms = (
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
			academicYear: filterData?.selectdAYs ?? [],
			schoolIds: filterData?.selectdSchools,
			classroomIds: filterData?.selectdClassrooms,
			section: filterData?.selectdSections,
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
	dispatch(viewAllClassrooms({ body }))
}

export const updateSchools = async (dispatch, schoolIds, filter) => {
	dispatch(setClassroomFilterSchools(schoolIds))
	await dispatch(
		getAllClassrooms({
			body: {
				filter: {
					schoolIds,
				},
			},
		}),
	)
}

export const updateClassrooms = async (
	dispatch,
	schoolIds,
	classes,
	filter,
) => {
	dispatch(setClassroomFilterClasses(classes))
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

export const updateSections = (dispatch, sections) => {
	dispatch(setClassroomFilterSections(sections))
}

export const filterClassRooms = async (dispatch, filterData, handleModal) => {
	await fetchAllClassrooms(dispatch, filterData)
	handleModal('filter', false)
}

export const deleteClassroomData = async (
	dispatch,
	id,
	handleModal,
	refreshList,
) => {
	const body = { id }
	const res = await dispatch(deleteClassroom({ body }))
	if (!res?.error) {
		handleModal('edit', false)
		refreshList()
	}
	handleModal('delete', false)
}

export const editClassroomData = async (
	dispatch,
	id,
	inputs,
	handleModal,
	handleActionTypes,
	handleErrors,
	refreshList,
) => {
	const body = {
		...inputs,
		school: Array.isArray(inputs?.school)
			? inputs?.school[0]
			: inputs?.school,
		id,
		teacher:
			inputs.teacher && Object.keys(inputs.teacher).length > 0
				? inputs.teacher
				: null,
	}

	const res = await dispatch(editClassroom({ body }))
	if (!res?.error) {
		handleModal('edit', false)
		handleActionTypes('def')
		handleErrors('email', false)
		refreshList()
	}
}

export const uploadClassroomData = async (
	dispatch,
	classrooms,
	handleModal,
	schoolsList,
	setInputFileObject,
	setDeleteBulkDialog,
	setResponse,
	selectedAy,
	school,
	refreshList,
) => {
	const keys = Object.keys(classrooms[0])
	classrooms = classrooms.map((val, index) => {
		const obj = {}
		keys.forEach((key) => {
			if (key.trim() === 'School') {
				const schoolObject = schoolsList?.find((sc) => {
					return sc.scCode === val[key]
				})

				if (schoolObject) {
					obj[key] = schoolObject.scCode
				} else {
					obj[key] = val[key]
				}
			} else {
				obj[key] = val[key]?.toString()
			}
		})
		obj['id'] = (index + 1).toString()
		obj['Class Hierarchy'] = obj['Class Hierarchy']
		obj['Section Hierarchy'] = obj['Section Hierarchy']
		return obj
	})
	const body = {
		classrooms,
		academicYear: selectedAy,
		school: school,
	}
	dispatch(uploadClassroom({ body })).then((res) => {
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
			handleModal('upload', false)
			refreshList()
		}
	})
}
