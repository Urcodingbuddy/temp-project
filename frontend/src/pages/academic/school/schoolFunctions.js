import {
	updateSchoolStatus,
	addSchoolData,
	updateSchoolData,
	getAllSchools,
	viewSchoolAcademicYear,
	viewAllSchoolAcademicYears,
} from './schoolSlice'
import { requestParams } from '../../../utils/apiConstants'
import { isDataObjectsEqual, validateEmail } from '../../../utils/utils'
import { uploadImageToS3Bucket } from '../../../utils/uploadToS3Bucket'
import * as XLSX from 'xlsx'
import {
	initialSchoolErrorStates,
	initialState,
	studentsReportSubHeadersMap,
} from './schoolConstants'

export const fetchAllSchools = (
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
			lastPromotionAcademicYear: filterData.selectdAYs,
			status: filterData.status,
			byDate: filterData.byDate,
			startDate: filterData.startDate,
			endDate: filterData.endDate,
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
	dispatch(getAllSchools({ body }))
}

const invalidTest = [null, undefined, 'string']
export const addSchool = async (
	body,
	dispatch,
	handleErrors,
	refreshSchoolList,
) => {
	const isValidMail =
		body?.principalEmail !== '' ? validateEmail(body?.principalEmail) : true
	if (isValidMail) {
		if (invalidTest.includes(typeof body?.scLogo)) {
			const res = await dispatch(
				addSchoolData({ body, saveSchool: true }),
			)
			if (!res?.error) {
				refreshSchoolList('addSchool')
			}
		} else {
			const filename = Date.now() + body?.scLogo?.name
			let s3Link = await dispatch(
				addSchoolData({
					body: { ...body, scLogo: filename },
					saveSchool: false,
				}),
			)
			s3Link = s3Link?.payload?.s3link
			await uploadImageToS3Bucket(
				s3Link,
				body?.scLogo,
				body?.scLogo?.type,
			)
			await dispatch(
				addSchoolData({
					body: { ...body, scLogo: filename },
					saveSchool: true,
				}),
			)
			refreshSchoolList('addSchool')
		}
	} else {
		handleErrors('email', true)
	}
}

export const checkNoChanges = (rowData, schoolFormData) => {
	const keys = Object.keys(initialState)
	const rowObj = {}
	keys.forEach((key) => {
		rowObj[key] = rowData[key]
	})

	return isDataObjectsEqual(rowObj, schoolFormData)
}

export const validateFormData = (data, setErrors) => {
	const errorKeys = Object.keys(initialSchoolErrorStates)
	const errors = {}

	errorKeys.forEach((key) => {
		if (!data[key]) {
			errors[key] = true
		}
	})

	if (!validateEmail(data['principalEmail'])) {
		errors['principalEmail'] = true
	}

	if (Object.keys(errors).length > 0) {
		setErrors((state) => ({ ...state, ...errors }))
		return false
	}

	return true
}

export const updateSchool = async (
	body,
	dispatch,
	id,
	handleActionTypes,
	handleErrors,
	refreshSchoolList,
) => {
	const isValidMail =
		body?.principalEmail !== '' ? validateEmail(body?.principalEmail) : true
	if (isValidMail) {
		handleErrors('email', false)

		if (invalidTest.includes(typeof body?.scLogo)) {
			const res = await dispatch(
				updateSchoolData({ body: { id, ...body }, saveSchool: true }),
			)
			if (!res?.error) {
				handleActionTypes('def')
				refreshSchoolList('editSchool')
			}
		} else {
			const filename = Date.now() + body?.scLogo?.name
			let s3Link = await dispatch(
				updateSchoolData({
					body: { ...body, scLogo: filename, id },
					saveSchool: false,
				}),
			)
			s3Link = s3Link?.payload?.s3link
			await uploadImageToS3Bucket(
				s3Link,
				body?.scLogo,
				body?.scLogo?.type,
			)
			await dispatch(
				updateSchoolData({
					body: { ...body, scLogo: filename, id },
					saveSchool: true,
				}),
			)

			handleActionTypes('def')
			refreshSchoolList('editSchool')
		}
	} else {
		handleErrors('email', true)
	}
}

export const updateStatus = async (
	status,
	schoolsIds,
	dispatch,
	closePopover,
	refreshSchoolList,
) => {
	const body = {
		[requestParams.status]: status,
		[requestParams.schoolIds]: [schoolsIds],
	}
	const res = await dispatch(updateSchoolStatus({ body }))
	if (!res?.error) {
		closePopover()
		refreshSchoolList('inActivate')
	}
}

export const handleSchoolFilter = async (
	status,
	cities,
	days,
	custom,
	handleModals,
	dispatch,
) => {
	const body = {
		filter: {},
	}

	if (status && status.length > 0) {
		body.filter.status = status
	}

	if (cities && cities.length > 0) {
		body.filter.city = cities
	}

	if (days !== '') {
		body.filter.days = days
	} else {
		body.filter.startDate = custom.start
		body.filter.endDate = custom.end
	}
	if (Object.keys(body.filter)?.length === 0) {
		delete body.filter
	}
	await dispatch(getAllSchools({ body }))
	handleModals('filterSchool', false)
}

export const handleSearchList = (e, cities = [], setCityList) => {
	if (e.target.value === '') {
		setCityList(cities)
	} else {
		const searchKey = e?.target?.value?.toLowerCase()
		const updatedList = cities.filter(function (item) {
			item = item.toLowerCase()
			return item.includes(searchKey)
		})
		setCityList(updatedList)
	}
}

export const getSchoolAcademicYearBySchoolId = async (
	schoolId,
	dispatch,
	setInputs,
) => {
	const res = await dispatch(viewSchoolAcademicYear(schoolId))
	if (!res?.error) {
		const { payload } = res
		const obj = {
			academicYear: payload.academicYear._id,
			scStartDate: payload.startDate,
			scEndDate: payload.endDate,
		}
		setInputs((state) => ({ ...state, ...obj }))
	}
}

export const statesByCountryId = async (
	countryId,
	statesList,
	setStatesOptions,
) => {
	const id = Array.isArray(countryId) ? countryId[0] : countryId
	const list = []
	for (const state of statesList) {
		if (state.country === id) {
			list.push({ label: state.name, id: state._id })
		}
	}
	setStatesOptions(list)
}

export const statesOptionsList = async (statesList, setStates) => {
	const list = statesList.map((state) => ({
		label: state.name,
		id: state._id,
	}))
	setStates(list)
}

export const getAllSchoolAcademicYearBySchoolId = async (
	schoolId,
	dispatch,
	setScAcYears,
) => {
	const res = await dispatch(viewAllSchoolAcademicYears(schoolId))
	if (!res?.error) {
		const { payload } = res
		setScAcYears(payload)
	}
}
