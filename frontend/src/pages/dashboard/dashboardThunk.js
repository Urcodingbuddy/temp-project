import { apiEndPoints, apiMethods } from '../../utils/apiConstants'
import myPeeguAxios from '../../utils/myPeeguAxios'
import { isAdmin, isCounsellor } from '../../utils/utils'

export const getDashboardDataThunk = async () => {
	try {
		const response = await myPeeguAxios[apiMethods.get](
			isAdmin()
				? apiEndPoints.dashboard
				: isCounsellor()
					? apiEndPoints.dashboardCounselor
					: apiEndPoints.getMiscellaneous,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const updateProfileDataThunk = async ({ body, saveUser }) => {
	try {
		const response = await myPeeguAxios[apiMethods.put](
			`${apiEndPoints.updateProfile}?saveUser=${saveUser}`,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const fetchCommonMiscellaneousDataThunk = async () => {
	try {
		const response = await myPeeguAxios[apiMethods.get](
			apiEndPoints.getCommonMiscellaneous,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const fetchStatesByCountryIdThunk = async (countryId) => {
	try {
		const response = await myPeeguAxios[apiMethods.get](
			`${apiEndPoints.states}/${countryId}`,
		)
		return response.data
	} catch (error) {
		throw error
	}
}
