import { apiEndPoints, apiMethods } from '../../../utils/apiConstants'
import myPeeguAxios from '../../../utils/myPeeguAxios'
import { downloadExcel } from '../../../utils/utils'

export const getSendChecklistDataThunk = async ({ body }, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.viewAllsendChecklist,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const updateSendChecklistThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.put](
			apiEndPoints.updateSendChecklist,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const addSendChecklistThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.addSendChecklist,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const sCAnalyticsForAllSchoolsThunk = async (body) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.sCAnalyticsForAllSchools,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const sendChecklistBUlkUploadThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.sCBulkUpload,
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

export const checklistBulkDeleteThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.checklistBulkDelete,
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

export const checklistsingleDeleteThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.checklistDelete,
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

export const checklistAnalyticsForSingleSchoolThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.sCAnalyticsForSingleSchools,
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

const fetchChecklistForExcelDownload = async (body) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.downloadChecklistReport,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const handleDownloadExcel = (body) => {
	return async () => {
		const classData = await fetchChecklistForExcelDownload(body)
		downloadExcel(classData, 'Students Checklist.xlsx')
	}
}
