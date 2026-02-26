import { createAsyncThunk } from '@reduxjs/toolkit'
import myPeeguAxios from '../../../utils/myPeeguAxios'
import { updateToastData } from '../../../toast/toastSlice'

export const fetchGandTAssignments = createAsyncThunk(
	'gandtAssignment/fetchAll',
	async (params, { rejectWithValue }) => {
		try {
			const response = await myPeeguAxios.post(
				'/mypeeguuser/v1/gandt/assignments/list',
				params,
			)
			return response.data.message
		} catch (error) {
			return rejectWithValue(error.response?.data || error.message)
		}
	},
)

export const createGandTAssignment = createAsyncThunk(
	'gandtAssignment/create',
	async (data, { dispatch, rejectWithValue }) => {
		try {
			const response = await myPeeguAxios.post(
				'/mypeeguuser/v1/gandt/assignments/create',
				data,
			)
			dispatch(
				updateToastData({
					title: 'Success',
					subTitle: 'Assignment created successfully',
					isSuccess: true,
					showToast: true,
				}),
			)
			return response.data.message
		} catch (error) {
			dispatch(
				updateToastData({
					title: 'Error',
					subTitle:
						error.response?.data?.message ||
						'Failed to create assignment',
					isSuccess: false,
					showToast: true,
				}),
			)
			return rejectWithValue(error.response?.data || error.message)
		}
	},
)

export const updateGandTAssignment = createAsyncThunk(
	'gandtAssignment/update',
	async ({ assignmentId, data }, { dispatch, rejectWithValue }) => {
		try {
			const response = await myPeeguAxios.put(
				`/mypeeguuser/v1/gandt/assignment/${assignmentId}`,
				data,
			)
			dispatch(
				updateToastData({
					title: 'Success',
					subTitle: 'Assignment updated successfully',
					isSuccess: true,
					showToast: true,
				}),
			)
			return response.data.message
		} catch (error) {
			dispatch(
				updateToastData({
					title: 'Error',
					subTitle:
						error.response?.data?.message ||
						'Failed to update assignment',
					isSuccess: false,
					showToast: true,
				}),
			)
			return rejectWithValue(error.response?.data || error.message)
		}
	},
)

export const deleteGandTAssignment = createAsyncThunk(
	'gandtAssignment/delete',
	async (assignmentId, { dispatch, rejectWithValue }) => {
		try {
			const response = await myPeeguAxios.delete(
				`/mypeeguuser/v1/gandt/assignment/${assignmentId}`,
			)
			dispatch(
				updateToastData({
					title: 'Success',
					subTitle: 'Assignment deleted successfully',
					isSuccess: true,
					showToast: true,
				}),
			)
			return response.data.message
		} catch (error) {
			dispatch(
				updateToastData({
					title: 'Error',
					subTitle:
						error.response?.data?.message ||
						'Failed to delete assignment',
					isSuccess: false,
					showToast: true,
				}),
			)
			return rejectWithValue(error.response?.data || error.message)
		}
	},
)
