import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
	addBaselineRecordThunk,
	deleteBaselineRecordThunk,
	getBaselineRecordsThunk,
	updateBaselineRecordsThunk,
	getBaselineAnalyticsRecordsThunk,
	getSingleStudentBaselineAnalyticalReportThunk,
	createMultipleBaselineRecordThunk,
	bulkDeleteBaselineThunk,
	getSingleBLRecordsThunk,
} from './baselineThunk'

const initialState = {
	allBaselineRecords: [],
	studentStatus: 'Active',

	filterFieldsBaseline: {
		schools: [],
		classes: [],
		sections: [],
	},
	filterFieldsBaselineAnalytical: {
		schools: [],
		classes: [],
		sections: [],
	},
	filterFieldsBaselineAnalyticsDownload: {
		schools: [],
		classes: [],
	},
	allBaselineAnalyticsRecords: [],
	singleStudentBaselineAnalyticalReport: [],
	baselineIdsForDelete: [],
	reCallBaselineApi: false,
}

export const getBaselineRecords = createAsyncThunk(
	'baseline/getBaselineRecords',
	getBaselineRecordsThunk,
)

export const updateBaselineRecords = createAsyncThunk(
	'baseline/updateBaselineRecords',
	updateBaselineRecordsThunk,
)

export const deleteBaselineRecord = createAsyncThunk(
	'baseline/deleteBaselineRecord',
	deleteBaselineRecordThunk,
)

export const addBaselineRecord = createAsyncThunk(
	'baseline/addBaselineRecord',
	addBaselineRecordThunk,
)

export const getBaselineAnalyticsRecords = createAsyncThunk(
	'baseline/getBaselineAnalyticsRecords',
	getBaselineAnalyticsRecordsThunk,
)
export const getSingleStudentBaselineAnalyticalReport = createAsyncThunk(
	'baseline/getSingleStudentBaselineAnalyticalReport',
	getSingleStudentBaselineAnalyticalReportThunk,
)
export const getSingleBLRecordsAnalyticsReport = createAsyncThunk(
	'baseline/getSingleBLRecords',
	getSingleBLRecordsThunk,
)
export const createMultipleBaselineRecord = createAsyncThunk(
	'baseline/createMultipleBaselineRecord',
	createMultipleBaselineRecordThunk,
)

export const bulkDeleteBaseline = createAsyncThunk(
	'baseline/deleteBaselineRecord',
	bulkDeleteBaselineThunk,
)

export const baselineSlice = createSlice({
	name: 'baseline',
	initialState,
	reducers: {
		setStudentStatus: (state, action) => {
			state.studentStatus = action.payload
		},
		clearStudentStatus: (state, action) => {
			state.studentStatus = 'Active'
		},
		setAllBaselineRecords: (state, action) => {
			state.allBaselineRecords = action.payload
		},
		setBaselineFilterSchools: (state, action) => {
			state.filterFieldsBaseline.schools = action.payload
		},
		setBaselineFilterClasses: (state, action) => {
			state.filterFieldsBaseline.classes = action.payload
		},
		setBaselineFilterSections: (state, action) => {
			state.filterFieldsBaseline.sections = action.payload
		},
		clearBaselineFilter: (state, action) => {
			state.filterFieldsBaseline = {
				schools: [],
				classes: [],
				sections: [],
			}
		},
		setBaselineAnalyticalFilterSchools: (state, action) => {
			state.filterFieldsBaselineAnalytical.schools = action.payload
		},
		setBaselineAnalyticalFilterClasses: (state, action) => {
			state.filterFieldsBaselineAnalytical.classes = action.payload
		},
		setBaselineAnalyticalFilterSections: (state, action) => {
			state.filterFieldsBaselineAnalytical.sections = action.payload
		},
		clearBaselineAnalyticalFilter: (state, action) => {
			state.filterFieldsBaselineAnalytical = {
				schools: [],
				classes: [],
				sections: [],
			}
		},
		resetBaselineSlice: (state) => {
			return initialState
		},
		setBaselineAnalyticsDownloadFilterSchools: (state, action) => {
			state.filterFieldsBaselineAnalyticsDownload.schools = action.payload
		},
		setBaselineAnalyticsDownloadFilterClasses: (state, action) => {
			state.filterFieldsBaselineAnalyticsDownload.classes = action.payload
		},
		clearBaselineAnalyticsDownloadFilter: (state, action) => {
			state.filterFieldsBaselineAnalyticsDownload = {
				schools: [],
				classes: [],
			}
		},
		setAllBaselineAnalyticsRecords: (state, action) => {
			state.allBaselineAnalyticsRecords = action.payload
		},
		setSingleStudentBaselineAnalyticalReport: (state, action) => {
			state.singleStudentBaselineAnalyticalReport = action.payload
		},
		setBaselineIdsForDelete: (state, action) => {
			if (state.baselineIdsForDelete.includes(action?.payload)) {
				state.baselineIdsForDelete =
					state?.baselineIdsForDelete?.filter(
						(cls) => cls !== action?.payload,
					)
			} else {
				state.baselineIdsForDelete = [
					...state?.baselineIdsForDelete,
					action?.payload,
				]
			}
		},
		clearBaselineIdsForDelete: (state, action) => {
			state.baselineIdsForDelete = []
		},
		setBaselineIdsForDeleteBulk: (state, action) => {
			state.baselineIdsForDelete = action?.payload
		},
		setRecallBaselineAPI: (state, { payload }) => {
			state.reCallBaselineApi = payload
		},
	},
})

export const {
	clearStudentStatus,
	setStudentStatus,
	setBaselineFilterClasses,
	setBaselineFilterSchools,
	setBaselineFilterSections,
	clearBaselineFilter,
	setAllBaselineRecords,
	resetBaselineSlice,
	setBaselineAnalyticsDownloadFilterClasses,
	setBaselineAnalyticsDownloadFilterSchools,
	clearBaselineAnalyticsDownloadFilter,
	setAllBaselineAnalyticsRecords,
	setSingleStudentBaselineAnalyticalReport,
	setBaselineAnalyticalFilterClasses,
	setBaselineAnalyticalFilterSchools,
	setBaselineAnalyticalFilterSections,
	clearBaselineAnalyticalFilter,
	setBaselineIdsForDelete,
	clearBaselineIdsForDelete,
	setBaselineIdsForDeleteBulk,
	setRecallBaselineAPI,
} = baselineSlice.actions

export default baselineSlice.reducer
