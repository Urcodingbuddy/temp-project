import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	isLoading: false,
	showToast: false,
	title: '',
	subTitle: '',
	isSuccess: true,
	anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
	multipleError: [],
	direction: 'right',
}

const toastSlice = createSlice({
	name: 'toastSlice',
	initialState,
	reducers: {
		updateIsLoading: (state, { payload }) => {
			state.isLoading = payload
		},

		updateShowToast: (state, { payload }) => {
			state.showToast = payload
		},
		updateToastData: (state, { payload }) => {
			state.title = payload.title
			state.subTitle = payload.subTitle
			state.isSuccess = payload.isSuccess
			state.anchorOrigin = payload.anchorOrigin
			state.showToast = payload.showToast
			state.multipleError = payload.multipleError
			state.direction = payload.direction
		},
	},
})

export const { updateIsLoading, updateShowToast, updateToastData } =
	toastSlice.actions

export default toastSlice.reducer
