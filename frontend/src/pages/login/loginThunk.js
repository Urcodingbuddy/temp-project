import {
	apiEndPoints,
	apiHeaders,
	apiMethods,
	requestParams,
} from '../../utils/apiConstants'
import myPeeguAxios from '../../utils/myPeeguAxios'
import { addUserToLocalStorage } from '../../utils/utils'
import { updateAccountRecoveryMsg, updateLoginErrorMsg } from './loginSlice'

export const loginUserThunk = async ({ body }, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.put](
			apiEndPoints.login,
			body,
		)
		// addUserToLocalStorage(response.data);
		return { data: response.data }
	} catch (error) {
		thunkAPI.dispatch(updateLoginErrorMsg(error.errorMessage))
		throw error
	}
}

export const forgotPasswordThunk = async ({ body }, thunkAPI) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.forgotPassword,
			body,
		)
		thunkAPI.dispatch(updateAccountRecoveryMsg(response.data.message))
		return { data: response.data }
	} catch (error) {
		thunkAPI.dispatch(updateAccountRecoveryMsg(error.errorMessage))
		throw error
	}
}

export const resetPasswordThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.put](
			apiEndPoints.resetPassword,
			body,
		)
		return { data: response.data }
	} catch (error) {
		throw error
	}
}

export const logoutUserThunk = async () => {
	try {
		const response = await myPeeguAxios[apiMethods.put](
			apiEndPoints.logout,
			{},
			{
				headers: {
					[apiHeaders.preventDefaultToast]: true,
				},
			},
		)
		return { data: response.data }
	} catch (error) {
		throw error
	}
}

export const activateAccountThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.put](
			apiEndPoints.activateAccount,
			body,
		)
		return { data: response.data }
	} catch (error) {
		throw error
	}
}

export const validateTokenThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.validateToken,
			body,
			{
				headers: {
					[apiHeaders.preventDefaultToast]: true,
				},
			},
		)
		return { data: response.data }
	} catch (error) {
		throw error
	}
}
