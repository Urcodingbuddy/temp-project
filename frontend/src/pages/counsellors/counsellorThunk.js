import { apiEndPoints, apiMethods } from '../../utils/apiConstants'
import myPeeguAxios from '../../utils/myPeeguAxios'
import { downloadExcel } from '../../utils/utils'
import {
	updateAllCounsellors,
	updateAllSchools,
	viewAllSchools,
} from './counsellorSlice'

export const createUserThunk = async ({ createBody, schoolBody }, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.createUser,
			createBody,
		)
		thunkAPI.dispatch(viewAllSchools({ schoolBody }))
		return { data: response.data }
	} catch (error) {
		throw error
	}
}

export const viewAllCounsellorsThunk = async (
	{ body, setFilterCounsellorDrawer },
	thunkAPI,
) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.viewAllCounsellors,
			body,
		)
		thunkAPI.dispatch(updateAllCounsellors(response.data))
		setFilterCounsellorDrawer(false)
		return { data: response.data }
	} catch (error) {
		throw error
	}
}

export const deleteCounsellorThunk = async ({
	deleteBody,
	setEditCounsellorDrawer,
}) => {
	try {
		const response = await myPeeguAxios[apiMethods.put](
			apiEndPoints.deleteCounsellor,
			deleteBody,
		)

		setEditCounsellorDrawer(false)
		return { data: response.data }
	} catch (error) {
		throw error
	}
}

export const viewAllSchoolsThunk = async ({ schoolBody }, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.getAllSchools,
			schoolBody,
		)
		thunkAPI.dispatch(updateAllSchools(response.data))
		return { data: response.data }
	} catch (error) {
		throw error
	}
}

export const updateUserThunk = async ({ updateBody }, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.put](
			apiEndPoints.updateUser,
			updateBody,
		)
		return { data: response.data }
	} catch (error) {
		throw error
	}
}

export const resendActivationThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.put](
			apiEndPoints.resendActivation,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

const fetchCounsellorListForExcelDownload = async (body, download) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			`${apiEndPoints.viewAllCounsellors}${download ? '?downloadAndFilter=true' : ''}`,
			body,
		)

		return response.data
	} catch (error) {
		throw error
	}
}

export const handleDownloadExcel = (body, download) => {
	return async () => {
		const counsellorData = await fetchCounsellorListForExcelDownload(
			body,
			download,
		)
		downloadExcel(counsellorData, 'counsellorList.xlsx')
	}
}
