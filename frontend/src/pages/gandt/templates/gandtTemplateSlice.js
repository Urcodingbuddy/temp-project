import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
	fetchGandTTemplatesThunk,
	getGandTTemplateByIdThunk,
	createGandTTemplateThunk,
	updateGandTTemplateThunk,
	deleteGandTTemplateThunk,
	toggleGandTTemplateStatusThunk,
	getActiveGandTTemplatesThunk,
} from './gandtTemplateThunk'

const initialState = {
	allTemplates: [],
	totalCount: 0,
	currentPage: 1,
	pageSize: 10,
	totalPages: 0,
	selectedTemplate: null,
	activeTemplates: [],
	loading: false,
	error: null,
}

// Async thunks
export const fetchGandTTemplates = createAsyncThunk(
	'gandtTemplate/fetchTemplates',
	fetchGandTTemplatesThunk,
)

export const getGandTTemplateById = createAsyncThunk(
	'gandtTemplate/getTemplateById',
	getGandTTemplateByIdThunk,
)

export const createGandTTemplate = createAsyncThunk(
	'gandtTemplate/createTemplate',
	createGandTTemplateThunk,
)

export const updateGandTTemplate = createAsyncThunk(
	'gandtTemplate/updateTemplate',
	updateGandTTemplateThunk,
)

export const deleteGandTTemplate = createAsyncThunk(
	'gandtTemplate/deleteTemplate',
	deleteGandTTemplateThunk,
)

export const toggleGandTTemplateStatus = createAsyncThunk(
	'gandtTemplate/toggleStatus',
	toggleGandTTemplateStatusThunk,
)

export const getActiveGandTTemplates = createAsyncThunk(
	'gandtTemplate/getActiveTemplates',
	getActiveGandTTemplatesThunk,
)

// Slice
export const gandtTemplateSlice = createSlice({
	name: 'gandtTemplate',
	initialState,
	reducers: {
		setSelectedTemplate: (state, action) => {
			state.selectedTemplate = action.payload
		},
		clearSelectedTemplate: (state) => {
			state.selectedTemplate = null
		},
		setCurrentPage: (state, action) => {
			state.currentPage = action.payload
		},
		setPageSize: (state, action) => {
			state.pageSize = action.payload
		},
		clearError: (state) => {
			state.error = null
		},
	},
	extraReducers: (builder) => {
		// Fetch templates
		builder
			.addCase(fetchGandTTemplates.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(fetchGandTTemplates.fulfilled, (state, { payload }) => {
				state.loading = false
				state.allTemplates = payload?.templates || []
				state.totalCount = payload?.totalCount || 0
				state.currentPage = payload?.page || 1
				state.pageSize = payload?.pageSize || 10
				state.totalPages = payload?.totalPages || 0
			})
			.addCase(fetchGandTTemplates.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message
			})

		// Get template by ID
		builder
			.addCase(getGandTTemplateById.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(getGandTTemplateById.fulfilled, (state, { payload }) => {
				state.loading = false
				state.selectedTemplate = payload
			})
			.addCase(getGandTTemplateById.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message
			})

		// Create template
		builder
			.addCase(createGandTTemplate.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(createGandTTemplate.fulfilled, (state, { payload }) => {
				state.loading = false
				state.allTemplates.unshift(payload)
				state.totalCount += 1
			})
			.addCase(createGandTTemplate.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message
			})

		// Update template
		builder
			.addCase(updateGandTTemplate.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(updateGandTTemplate.fulfilled, (state, { payload }) => {
				state.loading = false
				const index = state.allTemplates.findIndex(
					(t) => t._id === payload._id,
				)
				if (index !== -1) {
					state.allTemplates[index] = payload
				}
				if (state.selectedTemplate?._id === payload._id) {
					state.selectedTemplate = payload
				}
			})
			.addCase(updateGandTTemplate.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message
			})

		// Delete template
		builder
			.addCase(deleteGandTTemplate.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(deleteGandTTemplate.fulfilled, (state, action) => {
				state.loading = false
				const templateId = action.meta.arg
				state.allTemplates = state.allTemplates.filter(
					(t) => t._id !== templateId,
				)
				state.totalCount -= 1
			})
			.addCase(deleteGandTTemplate.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message
			})

		// Toggle status
		builder
			.addCase(toggleGandTTemplateStatus.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(
				toggleGandTTemplateStatus.fulfilled,
				(state, { payload }) => {
					state.loading = false
					const index = state.allTemplates.findIndex(
						(t) => t._id === payload._id,
					)
					if (index !== -1) {
						state.allTemplates[index] = payload
					}
				},
			)
			.addCase(toggleGandTTemplateStatus.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message
			})

		// Get active templates
		builder
			.addCase(getActiveGandTTemplates.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(getActiveGandTTemplates.fulfilled, (state, { payload }) => {
				state.loading = false
				state.activeTemplates = payload || []
			})
			.addCase(getActiveGandTTemplates.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message
			})
	},
})

export const {
	setSelectedTemplate,
	clearSelectedTemplate,
	setCurrentPage,
	setPageSize,
	clearError,
} = gandtTemplateSlice.actions

export default gandtTemplateSlice.reducer
