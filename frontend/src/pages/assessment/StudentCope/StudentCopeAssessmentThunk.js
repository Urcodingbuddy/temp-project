import { apiEndPoints, apiMethods } from '../../../utils/apiConstants'
import myPeeguAxios from '../../../utils/myPeeguAxios'
import { downloadExcel } from '../../../utils/utils'
import {
	setAllQuestionRating,
	setIsStudentDataExists,
	setIsStudentRecordsDeleted,
	setSpecificStudentCOPEData,
	setStudentCopeAnalyticsReportForClasses,
	setStudentCopeAnalyticsReportForSchools,
	setStudentCopeAssessment,
} from './StudentCopeSlice'

export const getStudentCopeAssessmentThunk = async ({ body }, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.get](
			`${apiEndPoints.fetchStudentCopeAssessment}/${body._id}`,
		)
		thunkAPI.dispatch(setAllQuestionRating(response?.data?.ratings))
		thunkAPI.dispatch(
			setIsStudentDataExists(response?.data?.studentId || 'noStudentId'),
		)
		thunkAPI.dispatch(
			setIsStudentRecordsDeleted(response?.data?.isRatingReset),
		)
		thunkAPI.dispatch(setSpecificStudentCOPEData(response?.data))
		return response.data
	} catch (error) {
		throw error
	}
}
export const getAllStudentsCOPEDataThunk = async ({ body }, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.getStudentCOPEDataInSchool,
			body,
		)
		thunkAPI.dispatch(setStudentCopeAssessment(response.data))
		return response.data
	} catch (error) {
		throw error
	}
}
export const studentCOPEAnalyticsReportForSchoolsThunk = async (
	{ body },
	thunkAPI,
) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.getStudentCOPEAnalyticsReportForSchools,
			body,
		)
		thunkAPI.dispatch(
			setStudentCopeAnalyticsReportForSchools(response.data),
		)
		return response.data
	} catch (error) {
		throw error
	}
}
export const studentCOPEAnalyticsReportForClassesThunk = async (
	{ body },
	thunkAPI,
) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.getStudentCOPEAnalyticsReportForClasses,
			body,
		)
		thunkAPI.dispatch(
			setStudentCopeAnalyticsReportForClasses(response.data),
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const updateStudentCopeAssessmentThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.updateStudentCopeAssessment,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const deleteStudentCopeAssessmentThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.deleteStudentCopeAssessment,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const bulkUploadStudentCopeAssessmentThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.bulkUploadStudentCopeAssessment,
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

const fetchStudentCopeDataForExcelDownload = async (body, download) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			`${apiEndPoints.getStudentCOPEDataInSchool}${download ? '?downloadAndFilter=true' : ''}`,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const handleDownloadExcelForStudentCope = async (body) => {
	const teacherData = await fetchStudentCopeDataForExcelDownload(body, true)
	downloadExcel(teacherData, 'StudentCope List.xlsx')
}
