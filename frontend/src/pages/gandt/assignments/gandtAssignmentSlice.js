import { createSlice } from '@reduxjs/toolkit'
import {
	fetchGandTAssignments,
	createGandTAssignment,
	deleteGandTAssignment,
} from './gandtAssignmentThunk'

const initialState = {
	allAssignments: [],
	totalCount: 0,
	currentPage: 1,
	pageSize: 10,
	loading: false,
	error: null,
}

const gandtAssignmentSlice = createSlice({
	name: 'gandtAssignment',
	initialState,
	reducers: {
		setCurrentPage: (state, action) => {
			state.currentPage = action.payload
		},
		setPageSize: (state, action) => {
			state.pageSize = action.payload
		},
		resetAssignmentSlice: (state) => {
			return initialState
		},
	},
	extraReducers: (builder) => {
		builder
			// Fetch assignments
			.addCase(fetchGandTAssignments.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(fetchGandTAssignments.fulfilled, (state, action) => {
				state.loading = false
				state.allAssignments = action.payload?.assignments || []
				state.totalCount = action.payload?.totalCount || 0
			})
			.addCase(fetchGandTAssignments.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message
			})
			// Create assignment
			.addCase(createGandTAssignment.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(createGandTAssignment.fulfilled, (state) => {
				state.loading = false
			})
			.addCase(createGandTAssignment.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message
			})
			// Delete assignment
			.addCase(deleteGandTAssignment.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(deleteGandTAssignment.fulfilled, (state) => {
				state.loading = false
			})
			.addCase(deleteGandTAssignment.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message
			})
	},
})

export const { setCurrentPage, setPageSize, resetAssignmentSlice } =
	gandtAssignmentSlice.actions

export default gandtAssignmentSlice.reducer
