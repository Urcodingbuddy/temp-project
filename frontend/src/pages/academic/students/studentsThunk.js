import { apiEndPoints, apiMethods } from '../../../utils/apiConstants'
import myPeeguAxios from '../../../utils/myPeeguAxios'
import { downloadExcel } from '../../../utils/utils'
import { updateMiscellaneous } from './studentsSlice'

export const viewAllStudentsThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.viewAllStudents,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const getMiscellaneousDataThunk = async ({}, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.get](
			apiEndPoints.getMiscellaneous,
		)
		thunkAPI.dispatch(updateMiscellaneous(response.data))
		return { data: response.data }
	} catch (error) {
		throw error
	}
}

export const updateStudentThunk = async ({ body, setEditStudentDrawer }) => {
	try {
		const response = await myPeeguAxios[apiMethods.put](
			apiEndPoints.updateStudent + true,
			body,
		)
		setEditStudentDrawer(false)
		return { data: response.data }
	} catch (error) {
		throw error
	}
}

export const deleteStudentThunk = async ({
	body,
	setDeleteStudentDialog,
	setEditStudentDrawer,
}) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.deleteStudent,
			body,
		)
		setDeleteStudentDialog(false)
		setEditStudentDrawer(false)
		return { data: response.data }
	} catch (error) {
		throw error
	}
}

export const uploadStudentThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.createMultipleStudents,
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

const fetchStudentsForExcelDownload = async (body, download) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			`${apiEndPoints.viewAllStudents}${download ? '?downloadAndFilter=true' : ''}`,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const handleDownloadExcel = (body, download) => {
	return async () => {
		const studentData = await fetchStudentsForExcelDownload(body, download)
		downloadExcel(studentData, 'studentsList.xlsx')
	}
}

export const bulkDeleteStudentsThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.bulkDeleteStudents,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}
