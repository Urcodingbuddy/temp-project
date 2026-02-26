import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
	bulkUploadTeacherProfilingAssessmentThunk,
	updateSchoolProfilingStatusThunk,
	fetchSchoolRankingsBasedOnTeachersProfilingsThunk,
	getAllProfilingForSchoolsThunk,
	addSchoolProfilingThunk,
	updateSchoolProfilingThunk,
	getAllProfilingForTeacherThunk,
	fetchTeacherProfilingThunk,
	submitTeacherProfilingThunk,
	deleteTeacherProfilingThunk,
} from './teachersProfilingThunk'

const initialState = {
	scheduleIRIData: {
		school: '',
		startDate: '',
		endDate: '',
		profilingSections: [],
	},
	allProfilingForSchoolsRecords: [],
	allTeachersForspecificSchool: [],
	singleTeacherDetails: [],
	schoolRankingsBasedOnTeachersProfiling: [],
	teachingAttitudeScore: [],
	teachingPracticesScore: [],
	jobLifeSatisfactionScore: [],
	discProfilesContentScore: [],
}

export const getAllProfilingForSchools = createAsyncThunk(
	'teachersProfiling/getAllProfilingForSchools',
	getAllProfilingForSchoolsThunk,
)

export const getAllProfilingForTeacher = createAsyncThunk(
	'teachersProfiling/getAllProfilingForTeacher',
	getAllProfilingForTeacherThunk,
)

export const addSchoolProfiling = createAsyncThunk(
	'teachersProfiling/addSchoolProfiling',
	addSchoolProfilingThunk,
)
export const updateSchoolProfiling = createAsyncThunk(
	'teachersProfiling/updateSchoolProfiling',
	updateSchoolProfilingThunk,
)

export const submitTeacherProfiling = createAsyncThunk(
	'teachersProfiling/updateProfilingScoresForIndividualTeacher',
	submitTeacherProfilingThunk,
)

export const fetchTeacherProfiling = createAsyncThunk(
	'teachersProfiling/fetchTeacherProfiling',
	fetchTeacherProfilingThunk,
)

export const getSchoolRankingsBasedOnTeachersProfilings = createAsyncThunk(
	'teachersProfiling/getSchoolRankingsBasedOnTeachersProfilings',
	fetchSchoolRankingsBasedOnTeachersProfilingsThunk,
)

export const updateSchoolProfilingStatus = createAsyncThunk(
	'teachersProfiling/updateSchoolIRIStatus',
	updateSchoolProfilingStatusThunk,
)

export const deleteTeacherProfiling = createAsyncThunk(
	'teachersProfiling/deleteTeacherProfiling',
	deleteTeacherProfilingThunk,
)

export const bulkUploadTeacherProfilingAssessment = createAsyncThunk(
	'teachersProfiling/bulkUploadTeacherProfilingAssessment',
	bulkUploadTeacherProfilingAssessmentThunk,
)

export const teacherProfilingSlice = createSlice({
	name: 'teacherIRI',
	initialState,

	reducers: {
		setTeachingAttitudeScore: (state, action) => {
			state.teachingAttitudeScore = action.payload
		},
		setTeachingPracticesScore: (state, action) => {
			state.teachingPracticesScore = action.payload
		},
		setJobLifeSatisfactionScore: (state, action) => {
			state.jobLifeSatisfactionScore = action.payload
		},
		setDiscProfilesContentScore: (state, action) => {
			state.discProfilesContentScore = action.payload
		},
		setAllProfilingForSchoolsRecords: (state, action) => {
			state.allProfilingForSchoolsRecords = action.payload
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
		setSchoolRankingsBasedOnTeachersProfiling: (state, action) => {
			state.schoolRankingsBasedOnTeachersProfiling = action.payload
		},
	},
})

export const {
	setAllProfilingForSchoolsRecords,
	setAllTeachersForspecificSchool,
	clearAllTeachersForspecificSchool,
	setSingleTeacherDetails,
	setSchoolRankingsBasedOnTeachersProfiling,
	setTeachingAttitudeScore,
	setTeachingPracticesScore,
	setJobLifeSatisfactionScore,
	setDiscProfilesContentScore,
} = teacherProfilingSlice.actions

export default teacherProfilingSlice.reducer
