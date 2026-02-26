import { apiEndPoints, apiMethods } from '../../../utils/apiConstants'
import myPeeguAxios from '../../../utils/myPeeguAxios'
import { downloadExcel } from '../../../utils/utils'

export const viewAllClassroomsThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.viewAllClassrooms,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const deleteClassroomThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.deleteClassroom,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const editClassroomThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.put](
			apiEndPoints.editClassroom,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const uploadClassroomThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.createMultipleClassroom,
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

const fetchClassRoomsForExcelDownload = async (body, download) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			`${apiEndPoints.viewAllClassrooms}${download ? '?downloadAndFilter=true' : ''}`,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const handleDownloadExcel = (body, download) => {
	return async () => {
		const classData = await fetchClassRoomsForExcelDownload(body, download)
		downloadExcel(classData, 'classrooms.xlsx')
	}
}

export const bulkDeleteClassroomThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.bulkDeleteClassRooms,
			body,
		)
		return response.data
	} catch (error) {
		if (error.response) {
			return error.response
		} else {
			throw error
		}
	}
}
