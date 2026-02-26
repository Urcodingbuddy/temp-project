import { apiEndPoints, apiMethods } from '../../../utils/apiConstants'
import myPeeguAxios from '../../../utils/myPeeguAxios'
import { downloadExcel } from '../../../utils/utils'
import {
	setAllTeachersForspecificSchool,
	setAllIRIForSchoolRecords,
	setAssessmentscores,
	setSchoolRankingsBasedOnTeachersIRI,
	setSingleTeacherDetails,
} from './teacherIRISlice'

export const getAllIRIForSchoolThunk = async ({ body }, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.getAllIRIforSchool,
			body,
		)
		thunkAPI.dispatch(setAllIRIForSchoolRecords(response.data))
		return response.data
	} catch (error) {
		throw error
	}
}

export const addSchoolIRIThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.addSchoolIRI,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const updateSchoolIRIThunk = async ({ body, id }) => {
	try {
		const response = await myPeeguAxios[apiMethods.put](
			`${apiEndPoints.updateSchoolIRI}/${id}`,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const getAllIRIForTeacherThunk = async ({ body }, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.getAllIRIforTeachers,
			body,
		)
		thunkAPI.dispatch(setAllTeachersForspecificSchool(response.data))
		return response.data
	} catch (error) {
		throw error
	}
}
const fetchTeachersIRIForExcelDownload = async (body, download) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			`${apiEndPoints.getAllIRIforSchool}${download ? '?downloadAndFilter=true' : ''}`,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const handleDownloadExcel = (body, download) => {
	return async () => {
		const teacherData = await fetchTeachersIRIForExcelDownload(
			body,
			download,
		)
		downloadExcel(teacherData, 'IRI School Details.xlsx')
	}
}

const fetchTeachersIRIForExcelDownloadWithSchool = async (body, download) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			`${apiEndPoints.getAllIRIforTeachers}${download ? '?downloadAndFilter=true' : ''}`,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}
export const handleDownloadExcelForTeacher = (body, download) => {
	return async () => {
		const teacherData = await fetchTeachersIRIForExcelDownloadWithSchool(
			body,
			download,
		)
		downloadExcel(teacherData, 'IRI Teacher Details.xlsx')
	}
}

export const fetchTeacherIRIThunk = async ({ body }, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.fetchTeacherIRI,
			body,
		)
		thunkAPI.dispatch(setSingleTeacherDetails(response.data))
		thunkAPI.dispatch(setAssessmentscores(response?.data?.teacherIRIReport))
		return response.data
	} catch (error) {
		throw error
	}
}

export const deleteTeacherIRIReportThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.delete](
			apiEndPoints.deleteTeacherIRIReport,
			{ data: body },
		)

		return response.data
	} catch (error) {
		throw error
	}
}

export const bulkUploadTeacherIRIAssessmentThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.bulkUploadTeacherIRIAssessment,
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

export const fetchSchoolRankingsBasedOnTeachersIRIThunk = async (
	{ body },
	thunkAPI,
) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.schoolRankingsBasedOnTeachersIRI,
			body,
		)
		thunkAPI.dispatch(setSchoolRankingsBasedOnTeachersIRI(response.data))
		return response.data
	} catch (error) {
		throw error
	}
}

export const submitTeacherIRIThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.submitTeacherIRI,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}
