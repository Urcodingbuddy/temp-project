import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
	deleteTeacherIRIReportThunk,
	fetchSchoolRankingsBasedOnTeachersIRIThunk,
	bulkUploadTeacherIRIAssessmentThunk,
	getAllIRIForSchoolThunk,
	addSchoolIRIThunk,
	updateSchoolIRIThunk,
	getAllIRIForTeacherThunk,
	fetchTeacherIRIThunk,
	submitTeacherIRIThunk,
} from './teachersIRIThunk'

const initialState = {
	assessmentscores: [],
	allIRISchoolRecords: [],
	allTeachersForspecificSchool: [],
	singleTeacherDetails: [],
	schoolRankingsBasedOnTeachersIRI: [],
}

export const getAllIRIForSchool = createAsyncThunk(
	'teachersIRI/getAllIRIForSchool',
	getAllIRIForSchoolThunk,
)

export const addSchoolIRI = createAsyncThunk(
	'teachersIRI/addSchoolIRI',
	addSchoolIRIThunk,
)
export const updateSchoolIRI = createAsyncThunk(
	'teachersIRI/addSchoolIRI',
	updateSchoolIRIThunk,
)

export const getAllIRIForTeacher = createAsyncThunk(
	'teachersIRI/getAllIRIForTeacher',
	getAllIRIForTeacherThunk,
)
export const fetchTeacherIRI = createAsyncThunk(
	'teachersIRI/fetchTeacherIRI',
	fetchTeacherIRIThunk,
)

export const submitTeacherIRI = createAsyncThunk(
	'teachersIRI/getAllTeachersIRI',
	submitTeacherIRIThunk,
)

export const getSchoolRankingsBasedOnTeachersIRI = createAsyncThunk(
	'teachersIRI/schoolRankingsBasedOnTeachersIRI',
	fetchSchoolRankingsBasedOnTeachersIRIThunk,
)

export const deleteTeacherIRIReport = createAsyncThunk(
	'teachersIRI/deleteTeacherIRIReport',
	deleteTeacherIRIReportThunk,
)

export const bulkUploadTeacherIRIAssessment = createAsyncThunk(
	'teachersIRI/bulkUploadTeacherIRIAssessment',
	bulkUploadTeacherIRIAssessmentThunk,
)

export const teacherIRISlice = createSlice({
	name: 'teacherIRI',
	initialState,

	reducers: {
		setAssessmentscores: (state, action) => {
			state.assessmentscores = action.payload
		},
		setAllIRIForSchoolRecords: (state, action) => {
			state.allIRISchoolRecords = action.payload
		},
		setAllTeachersForspecificSchool: (state, action) => {
			state.allTeachersForspecificSchool = action.payload
		},
		clearAllTeachersForspecificSchool: (state, action) => {
			state.allTeachersForspecificSchool = []
		},

		setSingleTeacherDetails: (state, { payload }) => {
			state.singleTeacherDetails = payload
		},
		setSchoolRankingsBasedOnTeachersIRI: (state, action) => {
			state.schoolRankingsBasedOnTeachersIRI = action.payload
		},
	},
})

export const {
	setAssessmentscores,
	setAllIRIForSchoolRecords,
	setAllTeachersForspecificSchool,
	clearFilterTeacherIRI,
	setSingleTeacherDetails,
	setSchoolRankingsBasedOnTeachersIRI,
} = teacherIRISlice.actions

export default teacherIRISlice.reducer
