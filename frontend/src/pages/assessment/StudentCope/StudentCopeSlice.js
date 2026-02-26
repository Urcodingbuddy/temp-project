import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { questions } from './StudentCopeConstants'
import {
	bulkUploadStudentCopeAssessmentThunk,
	deleteStudentCopeAssessmentThunk,
	getAllStudentsCOPEDataThunk,
	getStudentCopeAssessmentThunk,
	studentCOPEAnalyticsReportForClassesThunk,
	studentCOPEAnalyticsReportForSchoolsThunk,
	updateStudentCopeAssessmentThunk,
} from './StudentCopeAssessmentThunk'

const initialState = {
	allQuestionsRating: new Array(questions.length),
	studentCopeAssessment: {},
	isStudentDataExists: false,
	isStudentRecordsDeleted: false,
	specificStudentCOPEData: {},
	studentCopeAnalyticsReportForSchools: {},
	studentCopeAnalyticsReportForClasses: {},
	studentStatus: 'Active',
}

export const getStudentCopeAnalyticsReportForSchools = createAsyncThunk(
	'studentCope/getStudentCopeAnalyticsReportForSchools',
	studentCOPEAnalyticsReportForSchoolsThunk,
)

export const getStudentCopeAnalyticsReportForClasses = createAsyncThunk(
	'studentCope/getStudentCopeAnalyticsReportForClasses',
	studentCOPEAnalyticsReportForClassesThunk,
)

export const getStudentCopeAssessment = createAsyncThunk(
	'studentCope/getStudentCopeAssessment',
	getAllStudentsCOPEDataThunk,
)
export const getStudentCopeData = createAsyncThunk(
	'studentCope/getStudentCopeData',
	getStudentCopeAssessmentThunk,
)

export const updateStudentCopeAssessment = createAsyncThunk(
	'studentCope/updateStudentCopeAssessment',
	updateStudentCopeAssessmentThunk,
)

export const deleteStudentCopeAssessment = createAsyncThunk(
	'studentCope/deleteStudentCopeAssessment',
	deleteStudentCopeAssessmentThunk,
)

export const bulkUploadStudentCopeAssessment = createAsyncThunk(
	'studentCope/bulkUploadStudentCopeAssessment',
	bulkUploadStudentCopeAssessmentThunk,
)

export const StudentCopeSlice = createSlice({
	name: 'studentCope',
	initialState,
	reducers: {
		setStudentStatus: (state, action) => {
			state.studentStatus = action.payload
		},
		clearStudentStatus: (state, action) => {
			state.studentStatus = 'Active'
		},
		setAllQuestionRating: (state, action) => {
			state.allQuestionsRating = action.payload
		},
		setStudentCopeAssessment: (state, action) => {
			state.studentCopeAssessment = action.payload
		},
		setSpecificStudentCOPEData: (state, action) => {
			state.specificStudentCOPEData = action.payload
		},
		setStudentCopeAnalyticsReportForSchools: (state, action) => {
			state.studentCopeAnalyticsReportForSchools = action.payload
		},
		setStudentCopeAnalyticsReportForClasses: (state, action) => {
			state.studentCopeAnalyticsReportForClasses = action.payload
		},

		setIsStudentDataExists: (state, action) => {
			if (action.payload == 'noStudentId') {
				state.isStudentDataExists = false
			} else {
				state.isStudentDataExists = true
			}
		},
		setIsStudentRecordsDeleted: (state, action) => {
			state.isStudentRecordsDeleted = action.payload
		},
	},
})

export const {
	setStudentStatus,
	clearStudentStatus,
	setAllQuestionRating,
	setStudentCopeAssessment,
	setIsStudentDataExists,
	setIsStudentRecordsDeleted,
	setSpecificStudentCOPEData,
	setStudentCopeAnalyticsReportForSchools,
	setStudentCopeAnalyticsReportForClasses,
} = StudentCopeSlice.actions
export default StudentCopeSlice.reducer
