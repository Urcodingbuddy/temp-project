import { apiEndPoints, apiMethods } from '../../../utils/apiConstants'
import myPeeguAxios from '../../../utils/myPeeguAxios'
import { downloadExcel } from '../../../utils/utils'
import {
	setAllTeachersForspecificSchool,
	setAllProfilingForSchoolsRecords,
	setDiscProfilesContentScore,
	setJobLifeSatisfactionScore,
	setSchoolRankingsBasedOnTeachersProfiling,
	setSingleTeacherDetails,
	setTeachingAttitudeScore,
	setTeachingPracticesScore,
} from './teacherProfilingSlice'

export const getAllProfilingForSchoolsThunk = async ({ body }, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.getProfilingForSchools,
			body,
		)
		thunkAPI.dispatch(setAllProfilingForSchoolsRecords(response.data))
		return response.data
	} catch (error) {
		throw error
	}
}

export const getAllProfilingForTeacherThunk = async ({ body }, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.getProfilingsForTeachers,
			body,
		)
		thunkAPI.dispatch(setAllTeachersForspecificSchool(response.data))
		return response.data
	} catch (error) {
		throw error
	}
}

export const addSchoolProfilingThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.addSchoolProfiling,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const updateSchoolProfilingThunk = async ({ body, id }) => {
	try {
		const response = await myPeeguAxios[apiMethods.put](
			`${apiEndPoints.updateSchoolProfiling}/${id}`,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const submitTeacherProfilingThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.submitTeacherProfiling,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const updateSchoolProfilingStatusThunk = async ({ body, schoolId }) => {
	try {
		const response = await myPeeguAxios[apiMethods.patch](
			`${apiEndPoints.updateSchoolProfilingDateStatus}/${schoolId}`,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const fetchTeacherProfilingThunk = async ({ body }, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.fetchTeacherProfiling,
			body,
		)
		thunkAPI.dispatch(setSingleTeacherDetails(response.data))
		thunkAPI.dispatch(
			setTeachingAttitudeScore(response?.data?.teacherAttitudeReport),
		)
		thunkAPI.dispatch(
			setTeachingPracticesScore(response?.data?.teacherPracticeReport),
		)
		thunkAPI.dispatch(
			setJobLifeSatisfactionScore(
				response?.data?.teacherJobLifeSatisfactionReport,
			),
		)
		thunkAPI.dispatch(
			setDiscProfilesContentScore(response?.data?.teacherDISCReport),
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const deleteTeacherProfilingThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.delete](
			apiEndPoints.deleteTeacherProfiling,
			{ data: body },
		)

		return response.data
	} catch (error) {
		throw error
	}
}

const fetchTeachersIRIForSchoolExcelDownload = async (body, download) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			`${apiEndPoints.getProfilingForSchools}${download ? '?downloadAndFilter=true' : ''}`,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const handleDownloadExcel = (body, download) => {
	return async () => {
		const data = await fetchTeachersIRIForSchoolExcelDownload(
			body,
			download,
		)
		downloadExcel(data, 'Profiling Details Of Schools.xlsx')
	}
}

const fetchTeachersIRIForExcelDownloadWithSchool = async (body, download) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			`${apiEndPoints.getProfilingsForTeachers}${download ? '?downloadAndFilter=true' : ''}`,
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
		downloadExcel(teacherData, 'Profiling Teacher Details.xlsx')
	}
}

export const fetchSchoolRankingsBasedOnTeachersProfilingsThunk = async (
	{ body },
	thunkAPI,
) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.schoolRankingsBasedOnTeachersProfilings,
			body,
		)
		thunkAPI.dispatch(
			setSchoolRankingsBasedOnTeachersProfiling(response.data),
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const bulkUploadTeacherProfilingAssessmentThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.bulkUploadTeacherProfilingAssessment,
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
