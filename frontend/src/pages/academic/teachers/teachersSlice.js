import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
	bulkUploadTeachersThunk,
	deleteTeacherThunk,
	fetchTeachersListBySchoolIdThunk,
	getAllTeachersThunk,
	getTeachersClassroomsThunk,
	sendActivationMailsToTeachers,
	updateTeacherClassroomThunk,
	updateTeacherThunk,
	viewSchoolsForTeacherThunk,
} from './teachersThunk'

const initialState = {
	filterFields: {
		gender: [],
		school: [],
	},
	teachersList: [],
	allTeachers: [],
	viewAllSchools: [],
	teachersIdsForMail: [],
	teacherClassroomsList: [],
}

export const bulkUploadTeachers = createAsyncThunk(
	'teachers/bulkUploadTeachers',
	bulkUploadTeachersThunk,
)

export const getAllTeachers = createAsyncThunk(
	'teachers/viewAllTeachers',
	getAllTeachersThunk,
)

export const updateTeacher = createAsyncThunk(
	'teachers/updateTeacher',
	updateTeacherThunk,
)

export const deleteTeacher = createAsyncThunk(
	'teacher/deleteTeacher',
	deleteTeacherThunk,
)

export const fetchTeachersListBySchoolId = createAsyncThunk(
	'teacher/teachers list',
	fetchTeachersListBySchoolIdThunk,
)

export const ViewAllSchoolsForTeacher = createAsyncThunk(
	'teachers/viewAllSchools',
	viewSchoolsForTeacherThunk,
)
export const bulkSendInviteMailToTeachers = createAsyncThunk(
	'teacher/bulkSendInviteMailToTeachers',
	sendActivationMailsToTeachers,
)
export const getTeachersClassrooms = createAsyncThunk(
	'teacher/getTeachersClassrooms',
	getTeachersClassroomsThunk,
)
export const updateTeacherClassrooms = createAsyncThunk(
	'teacher/updateTeacherClassrooms',
	updateTeacherClassroomThunk,
)

export const TeachersSlice = createSlice({
	name: 'teachers',
	initialState,
	reducers: {
		setGender: (state, action) => {
			state.filterFields.gender = action.payload
		},
		setSchool: (state, action) => {
			if (state?.filterFields?.school?.includes(action?.payload)) {
				state.filterFields.school = state?.filterFields?.school?.filter(
					(schoolId) => schoolId !== action?.payload,
				)
			} else {
				state.filterFields.school = [
					...state?.filterFields?.school,
					action.payload,
				]
			}
		},
		clearFilterFields: (state, action) => {
			state.filterFields = {
				gender: 'all',
				school: [],
			}
		},
		setAllTeachers: (state, action) => {
			state.allTeachers = action?.payload
		},
		setViewAllSchools: (state, action) => {
			state.viewAllSchools = action?.payload
		},
		setTeacherIdsForMailSend: (state, action) => {
			if (state.teachersIdsForMail.includes(action?.payload)) {
				state.teachersIdsForMail = state?.teachersIdsForMail?.filter(
					(cls) => cls !== action?.payload,
				)
			} else {
				state.teachersIdsForMail = [
					...state?.teachersIdsForMail,
					action?.payload,
				]
			}
		},
		clearTeacherIdsForMailSend: (state, action) => {
			state.teachersIdsForMail = []
		},
		setTeacherIdsForBulkMailSend: (state, action) => {
			state.teachersIdsForMail = action?.payload
		},
		clearTeachersClassroomsList: (state, action) => {
			state.teacherClassroomsList = []
		},
	},
	extraReducers: (builder) => {
		builder.addCase(
			fetchTeachersListBySchoolId.fulfilled,
			(state, { payload }) => {
				state.teachersList = payload
			},
		)
		builder.addCase(fetchTeachersListBySchoolId.rejected, (state) => {
			state.teachersList = []
		})
		builder.addCase(
			getTeachersClassrooms.fulfilled,
			(state, { payload }) => {
				state.teacherClassroomsList = payload
			},
		)
		builder.addCase(getTeachersClassrooms.rejected, (state) => {
			state.teacherClassroomsList = []
		})
	},
})

export const {
	setGender,
	setSchool,
	clearFilterFields,
	setAllTeachers,
	setViewAllSchools,
	setTeacherIdsForMailSend,
	clearTeacherIdsForMailSend,
	setTeacherIdsForBulkMailSend,
	clearTeachersClassroomsList,
} = TeachersSlice.actions

export default TeachersSlice.reducer
