import { localizationConstants } from '../../resources/theme/localizationConstants'
import { requestParams } from '../../utils/apiConstants'
import { userRoles } from '../../utils/globalConstants'
import { emailRegex } from '../../utils/utils'
import {
	createUser,
	deleteCounsellor,
	resendActivation,
	updateAddCounsellorAssignSchoolSearchValue,
	updateEditCounsellorAssignSchoolSearchValue,
	updateEditCounsellorEmailId,
	updateEditCounsellorFirstName,
	updateEditCounsellorLastName,
	updateEditCounsellorMobileNumber,
	updateEmailId,
	updateFilterPermission,
	updateFilterSearchSchoolValue,
	updateFirstName,
	updateLastName,
	updateMobileNumber,
	updateSearchSchoolValue,
	updateSelectedSchoolIdsAddCounsellorAssignSchool,
	updateUser,
	viewAllCounsellors,
} from './counsellorSlice'

export const handleCloseAddCounsellorDrawer = (
	setAddCounsellorDrawer,
	dispatch,
	setSchools,
) => {
	setAddCounsellorDrawer(false)
	dispatch(updateFirstName(''))
	dispatch(updateLastName(''))
	dispatch(updateMobileNumber(''))
	dispatch(updateEmailId(''))
	setSchools([])
}

export const handleOpenAddCounsellorDrawer = (setAddCounsellorDrawer) => {
	setAddCounsellorDrawer(true)
}

export const handleFirstNameChange = (e, dispatch) => {
	dispatch(updateFirstName(e.target.value))
}

export const handleLastNameChange = (e, dispatch) => {
	dispatch(updateLastName(e.target.value))
}

export const handleEmailIdChange = (e, dispatch, setIsEmailIdValid) => {
	dispatch(updateEmailId(e.target.value))
	if (emailRegex.test(e.target.value)) {
		setIsEmailIdValid(true)
	} else {
		setIsEmailIdValid(false)
	}
}

export const handleMobileNumberChange = (e, dispatch) => {
	dispatch(
		updateMobileNumber(
			Math.max(0, parseInt(e.target.value)).toString().slice(0, 10),
		),
	)
}

export const handleMyPeeguCheckboxChange = (
	isMyPeeguChecked,
	setIsMyPeeguChecked,
	setIsSchoolChecked,
) => {
	if (!isMyPeeguChecked) {
		setIsMyPeeguChecked(true)
		setIsSchoolChecked(false)
	}
}

export const handleSchoolCheckboxChange = (
	isSchoolChecked,
	setIsSchoolChecked,
	setIsMyPeeguChecked,
) => {
	if (!isSchoolChecked) {
		setIsSchoolChecked(true)
		setIsMyPeeguChecked(false)
	}
}

export const handleMyPeeguFilterCheckboxChange = (
	isMyPeeguCheckedFilter,
	setIsMyPeeguCheckedFilter,
	setIsSchoolCheckedFilter,
	dispatch,
) => {
	if (!isMyPeeguCheckedFilter) {
		setIsMyPeeguCheckedFilter(true)
		setIsSchoolCheckedFilter(false)
		dispatch(updateFilterPermission(localizationConstants.peeguCounsellor))
	}
}

export const handleCreateCounsellor = (
	emailId,
	mobileNumber,
	firstName,
	lastName,
	permissionType,
	dispatch,
	selectedSchoolIdsAddCounsellorAssignSchool,
	setAddCounsellorDrawer,
	setSchools,
	refreshList,
) => {
	const createBody = {
		email: emailId,
		phone: mobileNumber,
		firstName: firstName,
		lastName: lastName,
		permissions: [permissionType],
		schoolIds: selectedSchoolIdsAddCounsellorAssignSchool,
	}

	dispatch(createUser({ createBody, setAddCounsellorDrawer })).then((res) => {
		if (res?.meta?.requestStatus === 'fulfilled') {
			setAddCounsellorDrawer(false)
			setSchools([])
			refreshList()
		}
	})
}

export const handleSearch = (e, setSearchValue) => {
	setSearchValue(e.target.value)
}

export const handleFilterDrawerOpen = (setFilterCounsellorDrawer) => {
	setFilterCounsellorDrawer(true)
}

export const handleFilterDrawerClose = (setFilterCounsellorDrawer) => {
	setFilterCounsellorDrawer(false)
}

export const handleSchoolSearch = (e, dispatch) => {
	dispatch(updateSearchSchoolValue(e.target.value))
}

export const handleAssignSchoolDrawerOpen = (
	setAssignSchoolDrawer,
	rowId,
	setCounsellorId,
	setAssignSchools,
) => {
	setAssignSchoolDrawer(true)
	setCounsellorId(rowId)
	setAssignSchools([])
}

export const handleAssignSchoolDrawerClose = (setAssignSchoolDrawer) => {
	setAssignSchoolDrawer(false)
}

export const handleAssignSchoolSearchValue = (
	e,
	setAssignSchoolSearchValue,
) => {
	setAssignSchoolSearchValue(e.target.value)
}

export const handleEditCounsellorFirstNameChange = (e, dispatch) => {
	dispatch(updateEditCounsellorFirstName(e.target.value))
}

export const handleEditCounsellorLastNameChange = (e, dispatch) => {
	dispatch(updateEditCounsellorLastName(e.target.value))
}

export const handleEditCounsellorEmailIdChange = (e, dispatch) => {
	dispatch(updateEditCounsellorEmailId(e.target.value))
}

export const handleEditCounsellorMobileNumberChange = (e, dispatch) => {
	dispatch(updateEditCounsellorMobileNumber(e.target.value))
}

export const handleEditCounsellorDrawerClose = (setEditCounsellorDrawer) => {
	setEditCounsellorDrawer(false)
}

export const handleEditCounsellorDrawerOpen = (
	row,
	setEditCounsellorDrawer,
	setSelectedRowData,
) => {
	setEditCounsellorDrawer(true)
	setSelectedRowData(row)
}

export const getFirstFourSchools = (schools) => {
	const displaySchools = schools.slice(0, 4).map((school) => school?.school)
	let displayText = displaySchools.join(', ')

	if (schools.length > 4) {
		displayText += ', ...'
	}
	return displayText
}

export const handleFilterSchoolSearch = (e, dispatch) => {
	dispatch(updateFilterSearchSchoolValue(e.target.value))
}

export const fetchAllCounsellors = (
	dispatch,
	filterData,
	searchText = '',
	page,
	pageSize,
	sortKeys,
	download,
) => {
	const role = (filterData.role || '').toLowerCase()
	const filter = {
		schoolIds: filterData.selectdSchools,
		roles:
			role === 'all'
				? ['PeeguCounselor', 'ScCounselor', 'ScPrincipal']
				: [filterData.role],
	}

	const body = {
		filter,
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
	dispatch(viewAllCounsellors({ body }))
}

export const handleCounsellorApplyFilter = (
	filterPermission,
	filterSelectedSchoolIds,
	dispatch,
	setFilterCounsellorDrawer,
) => {
	const filter = {
		[requestParams.status]: [
			localizationConstants.active,
			localizationConstants.invited,
		],
	}
	if (filterPermission !== '') {
		if (filterPermission === 'all') {
			filter.roles = ['PeeguCounselor', 'ScCounselor']
		} else {
			filter.roles = [filterPermission]
		}
	}
	let body = {}
	body = {
		filter,
		[requestParams.schoolIds]: filterSelectedSchoolIds,
	}

	dispatch(viewAllCounsellors({ body, setFilterCounsellorDrawer }))
}

export const handleDeleteCounsellor = async (
	id,
	dispatch,
	setEditCounsellorDrawer,
	refreshList,
) => {
	const deleteBody = {
		[requestParams.id]: id,
	}

	const res = await dispatch(
		deleteCounsellor({ deleteBody, setEditCounsellorDrawer }),
	)
	if (!res.error) {
		refreshList()
	}
}

export const handleAssignSchool = (
	permissionType,
	counsellorId,
	selectedSchoolIds,
	dispatch,
	setAssignSchoolDrawer,
	refreshList,
) => {
	const updateBody = {
		[requestParams.id]: counsellorId,
		[requestParams.schoolIds]:
			permissionType === userRoles.peeguCounselor
				? selectedSchoolIds
				: [selectedSchoolIds],
	}

	dispatch(updateUser({ updateBody })).then((res) => {
		if (res?.meta?.requestStatus === 'fulfilled') {
			refreshList()
			setAssignSchoolDrawer(false)
		}
	})
}

export const handleAddCounsellorAssignSchoolClose = (
	setAddCounsellorAssignSchoolDrawer,
) => {
	setAddCounsellorAssignSchoolDrawer(false)
}

export const handleAddCounsellorAssignSchoolSearch = (e, dispatch) => {
	dispatch(updateAddCounsellorAssignSchoolSearchValue(e.target.value))
}

export const handleRemoveSchoolAddCounsellors = (
	schoolId,
	selectedSchoolIds,
	dispatch,
) => {
	const updatedSchoolIds = selectedSchoolIds.filter(
		(schIds) => schIds !== schoolId,
	)
	dispatch(updateSelectedSchoolIdsAddCounsellorAssignSchool(updatedSchoolIds))
}

export const handleEditCounsellorAssignSchoolClose = (
	setEditCounsellorAssignSchoolDrawer,
) => {
	setEditCounsellorAssignSchoolDrawer(false)
}

export const handleEditCounsellorAssignSchoolSearch = (e, dispatch) => {
	dispatch(updateEditCounsellorAssignSchoolSearchValue(e.target.value))
}

export const handleEditCounsellorSubmit = (
	counsellorId,
	editedFirstName,
	editedLastName,
	editedEmail,
	editedMobileNumber,
	selectedPermission,
	schools,
	filterKeys,
	dispatch,
	setEditCounsellorDrawer,
	setIsEditButtonClicked,
	schoolId,
	setSchoolId,
	refreshList,
) => {
	const assignedSchools =
		schoolId?.length > 0
			? schools.filter((schIds) => !schoolId.includes(schIds._id))
			: schools

	const updateBody = {
		[requestParams.id]: counsellorId,
		[requestParams.firstName]: editedFirstName,
		[requestParams.lastName]: editedLastName,
		[requestParams.email]: editedEmail,
		[requestParams.phone]: editedMobileNumber,
		[requestParams.permissions]: [selectedPermission],
		[requestParams.schoolIds]: assignedSchools?.map((sc) => sc?._id),
	}
	const body = {
		[requestParams.filter]: filterKeys,
	}
	dispatch(
		updateUser({
			updateBody,
			body,
			setEditCounsellorDrawer,
			setIsEditButtonClicked,
		}),
	).then((res) => {
		if (res?.meta?.requestStatus === 'fulfilled') {
			refreshList()
			setEditCounsellorDrawer(false)
			setIsEditButtonClicked(false)
			setSchoolId([])
		}
	})
}

export const handleMyPeeguEditCheckboxChange = (
	isEditButtonClicked,
	setSelectedPermission,
	setIsFormDirty,
) => {
	if (isEditButtonClicked) {
		setSelectedPermission((prevPermission) =>
			prevPermission === localizationConstants.peeguCounsellor
				? null
				: localizationConstants.peeguCounsellor,
		)
		setIsFormDirty(true)
	}
}

export const handleSchoolEditCheckboxChange = (
	isEditButtonClicked,
	setSelectedPermission,
	setIsFormDirty,
) => {
	if (isEditButtonClicked) {
		setSelectedPermission((prevPermission) =>
			prevPermission === localizationConstants.schoolCounsellor
				? null
				: localizationConstants.schoolCounsellor,
		)
		setIsFormDirty(true)
	}
}

export const handleResendEditCounsellor = (selectedRowData, dispatch) => {
	const body = { [requestParams.email]: selectedRowData?.email }
	dispatch(resendActivation({ body }))
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
