import { apiEndPoints, apiMethods } from '../../../utils/apiConstants'
import myPeeguAxios from '../../../utils/myPeeguAxios'
import { downloadExcel } from '../../../utils/utils'
import { setAllTeachers, setViewAllSchools } from './teachersSlice'

export const bulkUploadTeachersThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.bulkUploadTeachers,
			body,
		)
		return response.data
	} catch (error) {
		if (error.response) {
			return error.response.data
		} else {
			throw error
		}
	}
}

export const getAllTeachersThunk = async ({ body }, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.getAllTeachers,
			body,
		)
		thunkAPI.dispatch(setAllTeachers(response?.data))
		return response.data
	} catch (error) {
		if (error.response) {
			return error.response.data
		} else {
			throw error
		}
	}
}

export const updateTeacherThunk = async ({ body, teachersRowData }) => {
	try {
		const response = await myPeeguAxios[apiMethods.patch](
			`${apiEndPoints.updateTeacher}/${teachersRowData?._id}`,
			body,
		)

		return response.data
	} catch (error) {
		if (error.response) {
			return error.response.data
		} else {
			throw error
		}
	}
}

export const deleteTeacherThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.delete](
			`${apiEndPoints.deleteTeacher}/${body?._id}`,
			body,
		)

		return response.data
	} catch (error) {
		if (error.response) {
			return error.response.data
		} else {
			throw error
		}
	}
}

const fetchTeachersForExcelDownload = async (body, download) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			`${apiEndPoints.getAllTeachers}${download ? '?downloadAndFilter=true' : ''}`,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const handleDownloadExcel = (body, download) => {
	return async () => {
		const teacherData = await fetchTeachersForExcelDownload(body, download)
		downloadExcel(teacherData, 'Teacher Data.xlsx')
	}
}

export const teacherDataTeacherThunk = async ({}, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.viewSchoolForTeacher,
		)
		thunkAPI.dispatch(setViewAllSchools(response?.data))
		return response.data
	} catch (error) {
		if (error.response) {
			return error.response.data
		} else {
			throw error
		}
	}
}

export const viewSchoolsForTeacherThunk = async ({}, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.viewSchoolForTeacher,
		)
		thunkAPI.dispatch(setViewAllSchools(response?.data))
		return response.data
	} catch (error) {
		if (error.response) {
			return error.response.data
		} else {
			throw error
		}
	}
}

export const sendActivationMailsToTeachers = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.sendActivationMailsToTeachers,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const fetchTeachersListBySchoolIdThunk = async (schoolId) => {
	try {
		const response = await myPeeguAxios[apiMethods.get](
			`${apiEndPoints.getTeachersListBySchoolId}/${schoolId}`,
			{},
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const getTeachersClassroomsThunk = async (teacherId) => {
	try {
		const response = await myPeeguAxios[apiMethods.get](
			`${apiEndPoints.getTeachersClassrooms}/${teacherId}`,
			{},
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const updateTeacherClassroomThunk = async (body) => {
	try {
		const response = await myPeeguAxios[apiMethods.put](
			apiEndPoints.updateTeacherClassroom,
			body,
		)

		return response.data
	} catch (error) {
		if (error.response) {
			return error.response.data
		} else {
			throw error
		}
	}
}
