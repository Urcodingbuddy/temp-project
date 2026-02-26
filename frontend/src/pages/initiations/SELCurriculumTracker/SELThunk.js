import { apiEndPoints, apiMethods } from '../../../utils/apiConstants'
import myPeeguAxios from '../../../utils/myPeeguAxios'
import { downloadExcel } from '../../../utils/utils'

export const getSELTrackerLIstThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.selTrackerList,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const addSELTrackerThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.addSELCurriculumTracker,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const getSingleSELCurriculumTrackerThunk = async ({ row_id }) => {
	try {
		const response = await myPeeguAxios[apiMethods.get](
			`${apiEndPoints.fetchSingleSELCurriculumTracker}/${row_id}`,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const updateSELTrackerThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.put](
			apiEndPoints.updateSELCurriculumTracker,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const deleteSELTrackerThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.put](
			apiEndPoints.deleteSELCurriculumTracker,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const getPresignedSelModulesUrlsThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.getPresignedSelModuleUrls,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const addUpdateSelModuleThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.addUpdateSelModule,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const verifySelModuleThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.verifySelModule,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

const SELForExcelDownload = async (body, download) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			`${apiEndPoints.selTrackerList}${download ? '?downloadAndFilter=true' : ''}`,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const handleDownloadExcel = (body, download) => {
	return async () => {
		const classData = await SELForExcelDownload(body, download)
		downloadExcel(classData, 'SEL Curriculum.xlsx')
	}
}

export const getSELTrackerModulesThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.fetchSeltrackerModules,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}
