import {
	apiEndPoints,
	apiMethods,
	requestParams,
} from '../../../utils/apiConstants'
import myPeeguAxios from '../../../utils/myPeeguAxios'
import { getAllSchools, updateAllSchools } from './schoolSlice'
import { downloadExcel } from '../../../utils/utils'

export const addSchoolThunk = async ({ body, saveSchool }, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			`${apiEndPoints.addSchool}?saveSchool=${saveSchool}`,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const updateSchoolThunk = async ({ body, saveSchool }, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.put](
			`${apiEndPoints.updateSchool}?saveSchool=${saveSchool}`,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const getAllSchoolThunk = async ({ body }, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.getAllSchools,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const updateSchoolStatusThunk = async ({ body }, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.put](
			apiEndPoints.updateSchoolStatus,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

// export const getSchoolListThunk = async ({ body }) => {
//   try {
//     const response = await myPeeguAxios[apiMethods.post](
//       apiEndPoints.getSchoolsList,
//       body
//     );
//     return response.data
//   } catch (error) {
//     throw error;
//   }
// };

const fetchSchoolsForExcelDownload = async (body, download) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			// apiEndPoints.downloadSchools,
			`${apiEndPoints.viewAllSchools}${download ? '?downloadAndFilter=true' : ''}`,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const handleDownloadExcel = (body, download) => {
	return async () => {
		const schoolsData = await fetchSchoolsForExcelDownload(body, download)
		downloadExcel(schoolsData, 'schoolList.xlsx')
	}
}

export const viewAcademicSchoolYearThunk = async (schoolId) => {
	try {
		const response = await myPeeguAxios[apiMethods.get](
			`${apiEndPoints.academicYear}/${schoolId}`,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const viewAllSchoolAcademicYearsThunk = async (schoolId) => {
	try {
		const response = await myPeeguAxios[apiMethods.get](
			`${apiEndPoints.schoolAcademicYears}/${schoolId}`,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const editSchoolAcademicYearThunk = async ({ body, scAcYrId }) => {
	try {
		const response = await myPeeguAxios[apiMethods.put](
			`${apiEndPoints.updateAcademicYear}/${scAcYrId}`,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const downloadStudentsReportThunk = async ({ body }, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.downloadStudentsReport,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}
