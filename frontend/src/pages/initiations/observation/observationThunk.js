import { apiEndPoints, apiMethods } from '../../../utils/apiConstants'
import myPeeguAxios from '../../../utils/myPeeguAxios'
import { downloadExcelForObservation } from '../../../utils/utils'
import { setAllObservations } from './observationSlice'

export const getObservationsThunk = async ({ body }, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.getObservations,
			body,
		)
		thunkAPI.dispatch(setAllObservations(response.data))
		return response.data
	} catch (error) {
		throw error
	}
}

export const deleteObservationThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.deleteObservation,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const getSingleObservationRecordThunk = async ({ row_id }) => {
	try {
		const response = await myPeeguAxios[apiMethods.get](
			`${apiEndPoints.fetchObservationRecord}/${row_id}`,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const addObservationThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.addObservation,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const updateObservationThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.put](
			apiEndPoints.updateObservation,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

const fetchObservationsListForExcelDownload = async (body, download) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			`${apiEndPoints.getObservations}${download ? '?downloadAndFilter=true' : ''}`,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const handleDownloadExcel = (body, download) => {
	return async () => {
		const classData = await fetchObservationsListForExcelDownload(
			body,
			download,
		)
		downloadExcelForObservation(classData, 'observationList.xlsx')
	}
}

export const bulkDeleteObservationThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.bulkDeleteObservation,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}
