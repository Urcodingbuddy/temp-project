import { getAllClassroomsForStudents } from '../../../redux/commonSlice'
import { bulkUploadTeachers, getAllTeachers, setGender } from './teachersSlice'

export const fetchAllTeachers = (
	dispatch,
	filterData,
	searchText = '',
	page,
	pageSize,
	sortKeys,
	download,
) => {
	const genderFilter = filterData.gender === 'All' ? '' : filterData.gender
	const body = {
		filter: {
			academicYear: filterData.selectdAYs,
			schoolIds: filterData.selectdSchools,
			gender: genderFilter,
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
	dispatch(getAllTeachers({ body }))
}

export const handleInputs = (
	e,
	setInputs,
	inputs,
	setStudentFormData,
	classlist,
	setSectionOptions,
) => {
	const { name, value } = e?.target
	let processedValue = value

	const obj = {}

	if (name === 'mobileNumber') {
		if (value.trim() === '') {
			processedValue = value
			obj[name] = processedValue
		} else {
			processedValue = Math.max(0, parseInt(value))
				.toString()
				.slice(0, 10)
			obj[name] = processedValue
		}
	} else if (name === 'gender') {
		const genderValue = value
		obj[name] = genderValue
	} else if (name === 'className') {
		// Update className for display
		obj.className = processedValue
		// Filter sections based on selected classNames and remove duplicates
		const filteredClassrooms = classlist.filter((classroom) =>
			processedValue.includes(classroom.className),
		)
		const uniqueSections = [
			...new Set(
				filteredClassrooms.map((classroom) => classroom.section),
			),
		]
		setSectionOptions(uniqueSections)
		// Reset section and classRoomIds
		obj.section = []
		obj.classRoomIds = []
	} else if (name === 'section') {
		// Update section for display
		obj.section = processedValue
		// Map selected sections to classRoomIds, ensuring unique class-section pairs
		const selectedClassRoomIds = []
		// For each selected class
		inputs.className.forEach((className) => {
			// For each selected section
			processedValue.forEach((section) => {
				// Find the classroom that matches both className and section
				const matchingClassroom = classlist.find(
					(classroom) =>
						classroom.className === className &&
						classroom.section === section,
				)
				if (matchingClassroom) {
					selectedClassRoomIds.push(matchingClassroom._id)
				}
			})
		})
		obj.classRoomIds = [...new Set(selectedClassRoomIds)] // Ensure no duplicate _ids
	} else {
		obj[name] = processedValue
	}

	const inputstate = { ...inputs, ...obj }
	setInputs(inputstate)
	setStudentFormData(inputstate)
}

export const handleGenderFilterCheckboxChange = (option, dispatch) => {
	switch (option) {
		case 'one': {
			dispatch(setGender('Male'))
			break
		}
		case 'two': {
			dispatch(setGender('Female'))
			break
		}
		case 'three': {
			dispatch(setGender('all'))
			break
		}
	}
}

export const handleSearchList = (e, allList = [], setSearchList) => {
	if (!Array.isArray(allList)) {
		setSearchList([])
	} else if (e.target.value === '') {
		setSearchList(allList)
	} else {
		const searchKey = e?.target?.value?.toLowerCase()
		const updatedList = allList.filter(function (item) {
			item = item?.school?.toLowerCase()
			return item?.includes(searchKey)
		})
		setSearchList(updatedList)
	}
}

export const UploadMultipleTeachersData = async (
	dispatch,
	excelTableData,
	handleModal,
	setInputFileObject,
	counsellorName,
	setDeleteBulkDialog,
	setResponse,
	schoolId,
	academicYear,
	refreshList,
) => {
	const teachersData = excelTableData?.map((teacher) => {
		return {
			teacher_id: teacher['Teachers ID'],
			teacherName: teacher['Teachers Name'],
			gender: teacher['Gender'],
			scCode: teacher['School Code'],
			email: teacher['Email'],
			mobileNumber: teacher['Phone Number'],
			createdByName: counsellorName,
		}
	})
	const body = {
		teachers: teachersData,
		school: schoolId,
		academicYear: academicYear,
	}
	dispatch(bulkUploadTeachers({ body })).then((res) => {
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

export const isDataObjectsEqual = (obj1, obj2) => {
	const keys1 = Object.keys(obj1)
	const keys2 = Object.keys(obj2)

	// Check if the number of keys is the same
	if (keys1.length !== keys2.length) {
		return false
	}
	// Check if all keys and their values are equal
	for (const key of keys1) {
		if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
			return false
		}
	}

	return true
}

export const getClasslistForTeachers = async (
	dispatch,
	formData,
	setClasslist,
	setSectionOptions,
) => {
	const res = await dispatch(
		getAllClassroomsForStudents({
			body: {
				filter: {
					schoolIds:
						typeof formData?.SchoolId === 'string'
							? [formData?.SchoolId]
							: formData?.SchoolId,
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
