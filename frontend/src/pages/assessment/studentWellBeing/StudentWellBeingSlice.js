import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
	bulkUploadStudentWellBeingThunk,
	deleteStudentWellBeingThunk,
	getSingleStudentWellBeingThunk,
	getStudentWBAnalyticsForClassroomsThunk,
	getStudentWBAnalyticsForSchoolsThunk,
	getStudentWellBeingThunk,
	updateStudentWellBeingThunk,
} from './studentWellBeingThunk'

const initialState = {
	studentWellBeingData: [],
	childrensHopeQuestionsRagings: Array.from({ length: 6 }, (_, index) => ({
		questionNumber: index + 1,
		marks: 0,
	})),

	psychologicalQuestionsRagings: Array.from({ length: 18 }, (_, index) => ({
		questionNumber: index + 1,
		marks: 0,
	})),
	specificStudentWBData: {},
	studentStatus: 'Active',
}
export const bulkUploadStudentWellBeing = createAsyncThunk(
	'studentWellBeing/bulkUploadStudentWellBeing',
	bulkUploadStudentWellBeingThunk,
)
export const getStudentWellBeing = createAsyncThunk(
	'studentWellBeing/getStudentWellBeing',
	getStudentWellBeingThunk,
)
export const getSingleStudentWellBeing = createAsyncThunk(
	'studentWellBeing/getSingleStudentWellBeing',
	getSingleStudentWellBeingThunk,
)
export const updateStudentWellBeing = createAsyncThunk(
	'studentWellBeing/updateStudentWellBeing',
	updateStudentWellBeingThunk,
)
export const deleteStudentWellBeing = createAsyncThunk(
	'studentWellBeing/deleteStudentWellBeing',
	deleteStudentWellBeingThunk,
)
export const getStudentWBAnalyticsForSchools = createAsyncThunk(
	'studentWellBeing/getStudentWBAnalyticsForSchools',
	getStudentWBAnalyticsForSchoolsThunk,
)
export const getStudentWBAnalyticsForClassrooms = createAsyncThunk(
	'studentWellBeing/getStudentWBAnalyticsForClassrooms',
	getStudentWBAnalyticsForClassroomsThunk,
)

export const StudentWellBeingSlice = createSlice({
	name: 'studentWellBeing',
	initialState,
	reducers: {
		setStudentStatus: (state, action) => {
			state.studentStatus = action.payload
		},
		clearStudentStatus: (state, action) => {
			state.studentStatus = 'Active'
		},
		setStudentWellBeingData: (state, action) => {
			state.studentWellBeingData = action.payload
		},
		setChildrensHopeQuestionsRagings: (state, { payload }) => {
			state.childrensHopeQuestionsRagings = payload
		},
		setPsychologicalQuestionsRagings: (state, { payload }) => {
			state.psychologicalQuestionsRagings = payload
		},
		setSpecificStudentWBData: (state, { payload }) => {
			state.specificStudentWBData = payload
		},
		setStudentWBAnalyticsData: (state, { payload }) => {
			state.studentWBAnalyticsData = payload
		},

		clearStudentWellBeingSlice: () => initialState,
	},
})

export const {
	setStudentStatus,
	clearStudentStatus,
	setStudentWellBeingData,
	setChildrensHopeQuestionsRagings,
	setPsychologicalQuestionsRagings,
	clearStudentWellBeingSlice,
	setSpecificStudentWBData,
	setStudentWBAnalyticsData,
} = StudentWellBeingSlice.actions
export default StudentWellBeingSlice.reducer
