import { apiEndPoints, apiMethods } from '../../../utils/apiConstants'
import myPeeguAxios from '../../../utils/myPeeguAxios'
import { downloadExcel } from '../../../utils/utils'
import { updateAllIndividualRecords } from './individualCaseSlice'

export const getIndividualRecordsThunk = async ({ body }, ThunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.getIndividualRecords,
			body,
		)
		ThunkAPI.dispatch(updateAllIndividualRecords(response.data))
		return response.data
	} catch (error) {
		throw error
	}
}

export const deleteIndividualRecordThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.put](
			apiEndPoints.deleteIndividualRecord,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const addStudentndividualRecordThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.addStudentIndividualRecord,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const updateIndividualRecordThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.put](
			apiEndPoints.updateIndividualRecord,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const fetchIndividualRecordThunk = async ({ row_id }) => {
	try {
		const response = await myPeeguAxios[apiMethods.get](
			`${apiEndPoints.fetchIndividualRecord}/${row_id}`,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

const fetchIndividualCaseForExcelDownload = async (body, download) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			`${apiEndPoints.getIndividualRecords}${download ? '?downloadAndFilter=true' : ''}`,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const handleDownloadExcel = (body, download) => {
	return async () => {
		const classData = await fetchIndividualCaseForExcelDownload(
			body,
			download,
		)
		downloadExcel(classData, 'individualList.xlsx')
	}
}

export const bulkDeleteIndividualRecordThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.bulkDeleteIndividualCase,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}
