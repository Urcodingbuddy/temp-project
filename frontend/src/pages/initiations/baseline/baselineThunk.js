import { apiEndPoints, apiMethods } from '../../../utils/apiConstants'
import myPeeguAxios from '../../../utils/myPeeguAxios'
import { downloadExcelForBaseline } from '../../../utils/utils'
import {
	setAllBaselineRecords,
	setAllBaselineAnalyticsRecords,
	setSingleStudentBaselineAnalyticalReport,
} from './baselineSlice'

export const getBaselineRecordsThunk = async ({ body }, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.getBaselineRecords,
			body,
		)
		thunkAPI.dispatch(setAllBaselineRecords(response.data))
		return response.data
	} catch (error) {
		throw error
	}
}

export const updateBaselineRecordsThunk = async ({ body }, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.put](
			apiEndPoints.updateBaselineRecords,
			body,
		)

		return response.data
	} catch (error) {
		throw error
	}
}

export const deleteBaselineRecordThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.deleteBaselineRecord,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const addBaselineRecordThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.addBaselineRecord,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

const fetchBaseLineListForExcelDownload = async (body, download) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			`${apiEndPoints.getBaselineRecords}${download ? '?downloadAndFilter=true' : ''}`,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const handleDownloadExcel = (body, download) => {
	return async () => {
		const classData = await fetchBaseLineListForExcelDownload(
			body,
			download,
		)
		downloadExcelForBaseline(classData, 'baselineList.xlsx')
	}
}

export const getBaselineAnalyticsRecordsThunk = async (body, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.baselineAnalyticsReport,
			body,
		)
		thunkAPI.dispatch(setAllBaselineAnalyticsRecords(response.data))
		return response.data
	} catch (error) {
		throw error
	}
}

// export const getSingleStudentBaselineAnalyticalReportThunk = async (_id) => {
// 	try {
// 		const response = await myPeeguAxios[apiMethods.get](
// 			`${apiEndPoints.singleStudentBaselineAnalyticalReport}/${_id}`,
// 			{},
// 		)
// 		return response.data
// 	} catch (error) {
// 		throw error
// 	}
// }
export const getSingleStudentBaselineAnalyticalReportThunk = async (
	{ body },
	thunkAPI,
) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.singleStudentBaselineAnalyticalReport,
			body,
		)
		thunkAPI.dispatch(
			setSingleStudentBaselineAnalyticalReport(response.data),
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const createMultipleBaselineRecordThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.createMultipleBaselineRecords,
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

export const bulkDeleteBaselineThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.bulkDeleteBaseline,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const getSingleBLRecordsThunk = async ({ body }, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.baselineAnalyticsReportsingleSchool,
			body,
		)
		thunkAPI.dispatch(setAllBaselineAnalyticsRecords(response.data))
		return response.data
	} catch (error) {
		throw error
	}
}
