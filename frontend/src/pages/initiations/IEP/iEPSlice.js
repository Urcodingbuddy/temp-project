import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
	UpdateIEPThunk,
	addIEPThunk,
	deleteIEPThunk,
	getStdentIEPDataThunk,
	gets3UrlThunk,
	studentBRForIEPThunk,
	studentIEPverificationThunk,
	viewByIDIEPThunk,
} from './iEPThunk'

const initialState = {
	IEPviewAllData: {},
	reCallIEPAPI: false,
	studentBaselineReport: {},
	viewByIDData: null,
}

export const getStudentIEPData = createAsyncThunk(
	'studentIEP/getStdentIEPData',
	getStdentIEPDataThunk,
)
export const studentIEPverification = createAsyncThunk(
	'studentIEP/studentIEPverification',
	studentIEPverificationThunk,
)
export const studentBRForIEP = createAsyncThunk(
	'studentIEP/studentBRForIEP',
	studentBRForIEPThunk,
)
export const deleteIEP = createAsyncThunk(
	'studentIEP/deleteIEP',
	deleteIEPThunk,
)
export const gets3Url = createAsyncThunk('studentIEP/gets3Url', gets3UrlThunk)
export const viewByIDIEP = createAsyncThunk(
	'studentIEP/viewByIDIEP',
	viewByIDIEPThunk,
)
export const UpdateIEP = createAsyncThunk(
	'studentIEP/UpdateIEP',
	UpdateIEPThunk,
)
export const addIEP = createAsyncThunk('studentIEP/addIEP', addIEPThunk)

export const IEPSlice = createSlice({
	name: 'StudentIEP',
	initialState,
	reducers: {
		setRecallIEPAPI: (state, { payload }) => {
			state.reCallIEPAPI = payload
		},
		clearStudentIEPSlice: () => initialState,
		clearStudentBaselineReport: (state) => {
			state.studentBaselineReport = {}
		},
	},
	extraReducers: (builders) => {
		builders.addCase(getStudentIEPData.fulfilled, (state, { payload }) => {
			state.IEPviewAllData = payload
		})
		builders.addCase(studentBRForIEP.fulfilled, (state, { payload }) => {
			state.studentBaselineReport = payload
		})
		builders.addCase(viewByIDIEP.fulfilled, (state, { payload }) => {
			state.viewByIDData = payload?.data
		})
	},
})

export const {
	setRecallIEPAPI,
	clearStudentIEPSlice,
	clearStudentBaselineReport,
} = IEPSlice.actions

export default IEPSlice.reducer
