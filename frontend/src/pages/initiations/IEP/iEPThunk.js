import { apiEndPoints, apiMethods } from '../../../utils/apiConstants'
import myPeeguAxios from '../../../utils/myPeeguAxios'
import { downloadExcel } from '../../../utils/utils'

export const getStdentIEPDataThunk = async ({ body }, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.studentIEPData,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const downloadStudentIEPReport = async (body) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.studentIEPDataForExcel,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const handleDownloadExcelForStudentIEP = (body, download) => {
	return async () => {
		const data = await downloadStudentIEPReport(body)
		downloadExcel(data, 'Student IEP Details.xlsx')
	}
}

export const studentIEPverificationThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.studentIEPverification,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const studentBRForIEPThunk = async (body) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.studentBRForIEP,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const deleteIEPThunk = async (id) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			`${apiEndPoints.deleteIEP}`,
			{ id },
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const gets3UrlThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.getPresignUrlIEP,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}
export const viewByIDIEPThunk = async (body) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.viewByIDIEP,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const UpdateIEPThunk = async ({ body, isS3Required }) => {
	try {
		const response = await myPeeguAxios[apiMethods.put](
			`${apiEndPoints.updateIEP}${isS3Required}`,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const addIEPThunk = async ({ body, isS3Required }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			`${apiEndPoints.addIEP}${isS3Required}`,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}
