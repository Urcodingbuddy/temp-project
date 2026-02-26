import { apiEndPoints, apiMethods } from '../../../utils/apiConstants'
import myPeeguAxios from '../../../utils/myPeeguAxios'
import { downloadExcel } from '../../../utils/utils'
import {
	setChildrensHopeQuestionsRagings,
	setPsychologicalQuestionsRagings,
	setSpecificStudentWBData,
	setStudentWBAnalyticsData,
	setStudentWellBeingData,
	setschoolOptions,
} from './StudentWellBeingSlice'

export const bulkUploadStudentWellBeingThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.bulkUploadStudentWellBeing,
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

export const getStudentWellBeingThunk = async (
	{ body, download },
	thunkAPI,
) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			`${apiEndPoints.getStudentWellBeingData}${download ? '?downloadAndFilter=true' : ''}`,
			body,
		)
		thunkAPI.dispatch(setStudentWellBeingData(response.data))
		return response.data
	} catch (error) {
		throw error
	}
}

export const getSingleStudentWellBeingThunk = async ({ body }, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.get](
			`${apiEndPoints.getSingleStudentWellBeing}/${body.id}`,
			body,
		)
		thunkAPI.dispatch(setSpecificStudentWBData(response?.data))
		thunkAPI.dispatch(
			setPsychologicalQuestionsRagings(
				response?.data?.psychologicalWellBeingScaleScore,
			),
		)
		thunkAPI.dispatch(
			setChildrensHopeQuestionsRagings(
				response?.data?.childrensHopeScaleScore,
			),
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const downloadStudentWellBeingReport = async ({ body, download }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			`${apiEndPoints.getStudentWellBeingData}${download ? '?downloadAndFilter=true' : ''}`,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const handleDownloadExcelForStudentWellBeing = async (
	body,
	download,
) => {
	const teacherData = await downloadStudentWellBeingReport({
		body,
		download,
	})
	downloadExcel(teacherData, 'Student Well-Being Details.xlsx')
}

export const updateStudentWellBeingThunk = async (body) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.updateStudentWellBeing,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const deleteStudentWellBeingThunk = async (body) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.deleteStudentWellBeing,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const getStudentWBAnalyticsForSchoolsThunk = async (body, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.studentWellBeingAnalyticsSchools,
			body,
		)

		thunkAPI.dispatch(setStudentWBAnalyticsData(response?.data))
		return response.data
	} catch (error) {
		throw error
	}
}

export const getStudentWBAnalyticsForClassroomsThunk = async (
	{ body },
	thunkAPI,
) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.studentWBAnalyticsForClassrooms,
			body,
		)
		thunkAPI.dispatch(setStudentWBAnalyticsData(response?.data))
		return response.data
	} catch (error) {
		throw error
	}
}
