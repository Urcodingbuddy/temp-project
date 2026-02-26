import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
	getSELTrackerLIstThunk,
	addSELTrackerThunk,
	getSingleSELCurriculumTrackerThunk,
	updateSELTrackerThunk,
	deleteSELTrackerThunk,
	getSELTrackerModulesThunk,
	getPresignedSelModulesUrlsThunk,
	addUpdateSelModuleThunk,
	verifySelModuleThunk,
} from './SELThunk'

const initialState = {
	filterFieldsSELTrackerList: {
		schools: [],
		classes: [],
		sections: [],
	},
	allSELTrackerList: [],
	allSELTrackerModules: [],
}

export const getSELTrackerLIst = createAsyncThunk(
	'selCurriculumTracker/allSelTrackerList',
	getSELTrackerLIstThunk,
)

export const addSELCurriculumTracker = createAsyncThunk(
	'selCurriculumTracker/addSelCurriculumTracker',
	addSELTrackerThunk,
)

export const getSingleSELCurriculumTracker = createAsyncThunk(
	'selCurriculumTracker/addSelCurriculumTracker',
	getSingleSELCurriculumTrackerThunk,
)

export const updateSELCurriculumTracker = createAsyncThunk(
	'selCurriculumTracker/updateSelCurriculumTracker',
	updateSELTrackerThunk,
)

export const deleteSELCurriculumTracker = createAsyncThunk(
	'selCurriculumTracker/deleteSelCurriculumTracker',
	deleteSELTrackerThunk,
)

export const getPresignedSelModulesUrls = createAsyncThunk(
	'selModules/getPresignedSelModulesUrls',
	getPresignedSelModulesUrlsThunk,
)

export const addUpdateSelModule = createAsyncThunk(
	'selModules/addUpdateSelModule',
	addUpdateSelModuleThunk,
)

export const verifySelModule = createAsyncThunk(
	'selModules/verifySelModule',
	verifySelModuleThunk,
)

export const getSelTrackerModules = createAsyncThunk(
	'selCurriculumTracker/sELTrackerModules',
	getSELTrackerModulesThunk,
)

export const selTrackerListSlice = createSlice({
	name: 'selTrackerList',
	initialState,
	reducers: {
		setSELTrackerListFilterSchools: (state, action) => {
			state.filterFieldsSELTrackerList.schools = action.payload
		},
		setSELTrackerListFilterClasses: (state, action) => {
			state.filterFieldsSELTrackerList.classes = action.payload
		},
		setSELTrackerListFilterSections: (state, action) => {
			state.filterFieldsSELTrackerList.sections = action.payload
		},
		clearSELTrackerListFilter: (state, action) => {
			state.filterFieldsSELTrackerList = {
				schools: [],
				classes: [],
				sections: [],
			}
		},
		setSelectedRowDataEdit: (state, action) => {
			state.selectedRowDataEdit = action.payload
		},
	},
	extraReducers: (builder) => {
		builder.addCase(getSELTrackerLIst.fulfilled, (state, { payload }) => {
			state.allSELTrackerList = payload
		})
		builder.addCase(
			getSelTrackerModules.fulfilled,
			(state, { payload }) => {
				state.allSELTrackerModules = payload
			},
		)
	},
})

export const {
	setSELTrackerListFilterClasses,
	setSELTrackerListFilterSchools,
	setSELTrackerListFilterSections,
	clearSELTrackerListFilter,
	setSelectedRowDataEdit,
} = selTrackerListSlice.actions
export default selTrackerListSlice.reducer
