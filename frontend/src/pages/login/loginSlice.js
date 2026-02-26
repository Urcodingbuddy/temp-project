import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
	activateAccountThunk,
	forgotPasswordThunk,
	loginUserThunk,
	logoutUserThunk,
	resetPasswordThunk,
	validateTokenThunk,
} from './loginThunk'
import { routePaths } from '../../routes/routeConstants'
import {
	addUserToLocalStorage,
	changeRoute,
	removeUserFromLocalStorage,
} from '../../utils/utils'

const initialState = {
	email: '',
	password: '',
	loginErrorMsg: '',
	eyeIconClicked: false,

	accountRecoveryEmail: '',
	accountRecoveryMsg: '',

	newPassConfirmEyeIconClicked: false,
	newPassword: '',
	confirmNewPassword: '',

	activationPassword: '',
	confirmActivationPassword: '',
	confirmActivationPasswordEyeIconClicked: false,
	newPasswordEyeIconClicked: false,

	activateAccountExpired: false,
	createNewPasswordExpired: false,
}

export const loginUser = createAsyncThunk('login/loginUser', loginUserThunk)

export const forgotPassword = createAsyncThunk(
	'login/forgotPassword',
	forgotPasswordThunk,
)

export const resetPassword = createAsyncThunk(
	'login/resetPassword',
	resetPasswordThunk,
)

export const activateAccount = createAsyncThunk(
	'login/activateAccount',
	activateAccountThunk,
)

export const validateTokenCreateNewPassword = createAsyncThunk(
	'login/validateTokenCreateNewPassword',
	validateTokenThunk,
)

export const validateTokenActivateAccount = createAsyncThunk(
	'login/validateTokenActivateAccount',
	validateTokenThunk,
)

export const logoutUser = createAsyncThunk('login/logoutUser', logoutUserThunk)

export const loginSlice = createSlice({
	name: 'login',
	initialState,
	reducers: {
		updateEmail: (state, action) => {
			state.email = action.payload
		},
		updatePassword: (state, action) => {
			state.password = action.payload
		},
		updateLoginErrorMsg: (state, action) => {
			state.loginErrorMsg = action.payload
		},
		updateAccountRecoveryEmail: (state, action) => {
			state.accountRecoveryEmail = action.payload
		},
		updateAccountRecoveryMsg: (state, action) => {
			state.accountRecoveryMsg = action.payload
		},
		toggleEyeIconClicked: (state, action) => {
			state.eyeIconClicked = action.payload
		},
		toggleNewPassConfirmEyeIconClicked: (state, action) => {
			state.newPassConfirmEyeIconClicked = action.payload
		},
		updateNewPassword: (state, action) => {
			state.newPassword = action.payload
		},
		updateConfirmNewPassword: (state, action) => {
			state.confirmNewPassword = action.payload
		},
		updateActivationPassword: (state, action) => {
			state.activationPassword = action.payload
		},
		updateConfirmActivationPassword: (state, action) => {
			state.confirmActivationPassword = action.payload
		},
		toggleConfirmActivationPasswordEyeIconClicked: (state, action) => {
			state.confirmActivationPasswordEyeIconClicked = action.payload
		},
		toggleNewPasswordEyeIconClicked: (state, action) => {
			state.newPasswordEyeIconClicked = action.payload
		},
		updateActivateAccountExpired: (state, action) => {
			state.activateAccountExpired = action.payload
		},
		updateCreateNewPasswordExpired: (state, action) => {
			state.createNewPasswordExpired = action.payload
		},
		resetLoginSlice: (state) => {
			state = initialState
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(loginUser.fulfilled, (state, { payload }) => {
				state.loginErrorMsg = ''
				state.email = ''
				state.password = ''
				addUserToLocalStorage(payload?.data)
				changeRoute(routePaths.home)
			})
			.addCase(loginUser.rejected, (state, action) => {})
			.addCase(forgotPassword.fulfilled, (state, { payload }) => {
				state.accountRecoveryEmail = ''
				changeRoute(routePaths.login)
			})
			.addCase(resetPassword.fulfilled, (state, action) => {
				state.newPassword = ''
				state.confirmNewPassword = ''
				changeRoute(routePaths.login)
			})

			.addCase(
				validateTokenCreateNewPassword.rejected,
				(state, action) => {
					state.createNewPasswordExpired = true
				},
			)

			.addCase(validateTokenActivateAccount.rejected, (state, action) => {
				state.activateAccountExpired = true
			})
			.addCase(activateAccount.fulfilled, (state, { payload }) => {
				console.info(state)
				changeRoute(routePaths.login)
			})
			.addCase(logoutUser.fulfilled, (state, action) => {
				removeUserFromLocalStorage()
				changeRoute(routePaths.login)
			})
			.addCase(logoutUser.rejected, (state, action) => {
				removeUserFromLocalStorage()
				changeRoute(routePaths.login)
			})
	},
})

export const {
	updateEmail,
	toggleNewPasswordEyeIconClicked,
	updatePassword,
	updateLoginErrorMsg,
	updateAccountRecoveryEmail,
	updateAccountRecoveryMsg,
	toggleEyeIconClicked,
	toggleNewPassConfirmEyeIconClicked,
	updateNewPassword,
	updateConfirmNewPassword,
	updateActivationPassword,
	updateConfirmActivationPassword,
	toggleConfirmActivationPasswordEyeIconClicked,
	updateActivateAccountExpired,
	updateCreateNewPasswordExpired,
	resetLoginSlice,
} = loginSlice.actions

export default loginSlice.reducer
