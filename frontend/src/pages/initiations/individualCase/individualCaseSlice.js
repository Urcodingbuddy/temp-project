import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
	addStudentndividualRecordThunk,
	deleteIndividualRecordThunk,
	getIndividualRecordsThunk,
	updateIndividualRecordThunk,
	fetchIndividualRecordThunk,
	bulkDeleteIndividualRecordThunk,
} from './individualCaseThunk'

const initialState = {
	studentStatus: 'Active',
	allIndividualRecords: [],
	filterFields: {
		schools: [],
		classes: [],
		sections: [],
	},
	studentSearchData: [],
	selectStudentData: [],

	selectedRowDataEdit: {},

	rowsData: {},
	individualCaseIdsForDelete: [],
}

export const getIndividualRecords = createAsyncThunk(
	'individualCase/getIndividualRecords',
	getIndividualRecordsThunk,
)

export const deleteIndividualRecord = createAsyncThunk(
	'individualCase/deleteIndividualRecord',
	deleteIndividualRecordThunk,
)

export const searchIndividualRecords = createAsyncThunk(
	'individualCase/searchIndividualRecords',
	getIndividualRecordsThunk,
)

export const getSelectStudentData = createAsyncThunk(
	'individualCase/selectIndividualRecords',
	getIndividualRecordsThunk,
)

export const addStudentIndividualRecord = createAsyncThunk(
	'individualCase/addStudentIndividualRecord',
	addStudentndividualRecordThunk,
)

export const updateIndividualRecord = createAsyncThunk(
	'individualCase/updateIndividualRecord',
	updateIndividualRecordThunk,
)

export const fetchIndividualRecord = createAsyncThunk(
	'individualCase/fetchIndividualRecord',
	fetchIndividualRecordThunk,
)

export const bulkDeleteIndividualRecord = createAsyncThunk(
	'individualCase/deleteIndividualRecord',
	bulkDeleteIndividualRecordThunk,
)

export const individualCaseSlice = createSlice({
	name: 'individualCase',
	initialState,
	reducers: {
		setStudentStatus: (state, action) => {
			state.studentStatus = action.payload
		},
		clearStudentStatus: (state, action) => {
			state.studentStatus = 'Active'
		},
		updateAllIndividualRecords: (state, action) => {
			state.allIndividualRecords = action.payload
		},
		setIndividualCaseFilterSchools: (state, action) => {
			state.filterFields.schools = action.payload
		},
		setIndividualCaseFilterClasses: (state, action) => {
			state.filterFields.classes = action.payload
		},
		setIndividualCaseFilterSections: (state, action) => {
			state.filterFields.sections = action.payload
		},
		clearIndividualCaseFilter: (state, action) => {
			state.filterFields = {
				schools: [],
				classes: [],
				sections: [],
			}
		},
		setSelectedRowDataEdit: (state, action) => {
			state.selectedRowDataEdit = action.payload
		},
		setRowsData: (state, action) => {
			state.rowsData = action.payload
		},
		setIndividualCaseIdsForDelete: (state, action) => {
			if (state.individualCaseIdsForDelete.includes(action?.payload)) {
				state.individualCaseIdsForDelete =
					state?.individualCaseIdsForDelete?.filter(
						(cls) => cls !== action?.payload,
					)
			} else {
				state.individualCaseIdsForDelete = [
					...state?.individualCaseIdsForDelete,
					action?.payload,
				]
			}
		},
		clearIndividualCaseIdsForDelete: (state, action) => {
			state.individualCaseIdsForDelete = []
		},
		setIndividualCaseIdsForDeleteBulk: (state, action) => {
			state.individualCaseIdsForDelete = action?.payload
		},
		resetIndividualCaseSlice: (state) => {
			return initialState
		},
	},
	extraReducers: (builder) => {},
})

export const {
	clearStudentStatus,
	setStudentStatus,
	updateAllIndividualRecords,
	setIndividualCaseFilterSchools,
	setIndividualCaseFilterClasses,
	setIndividualCaseFilterSections,
	clearIndividualCaseFilter,
	setSelectedRowDataEdit,
	setRowsData,
	resetIndividualCaseSlice,
	setIndividualCaseIdsForDelete,
	setIndividualCaseIdsForDeleteBulk,
	clearIndividualCaseIdsForDelete,
} = individualCaseSlice.actions

export default individualCaseSlice.reducer
