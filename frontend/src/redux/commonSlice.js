import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
	getSchoolListThunk,
	getAllSectionsThunk,
	getAllClassroomsThunk,
	shiftSectionThunk,
	promoteStudentsToNextClassThunk,
	markStudentAsGraduatedThunk,
	markStudentAsExitedThunk,
	viewAllStudentsForSchoolActionsThunk,
	markSingleStudentAsExitedThunk,
	markSingleStudentAsGraduatedThunk,
	getAllClassroomsForStudentsThunk,
	listStudentsThunk,
	getAllClassroomsForValidationThunk,
	getSchoolListForValidationThunk,
} from './commonThunk'

const initialState = {
	allStudentsForSchoolActions: [],
	schoolsList: [],
	schoolsListForValidation: [],
	classroomsList: [],
	classroomsListForValidation: [],
	sectionsList: [],

	classroomsListForStudents: [],
	listStudentsData: [],
}

export const getSchoolsList = createAsyncThunk(
	'Common/get School List',
	getSchoolListThunk,
)

export const getAllClassrooms = createAsyncThunk(
	'Common/getAllClassrooms',
	getAllClassroomsThunk,
)

export const getSchoolsListForValidation = createAsyncThunk(
	'Common/get School List for validation',
	getSchoolListForValidationThunk,
)

export const getAllClassroomsForValidation = createAsyncThunk(
	'Common/getAllClassrooms  for validation',
	getAllClassroomsForValidationThunk,
)

export const getAllClassroomsForStudents = createAsyncThunk(
	'Common/getAllClassroomsForStudents',
	getAllClassroomsForStudentsThunk,
)

export const getAllSections = createAsyncThunk(
	'Common/getAllSections',
	getAllSectionsThunk,
)

//view all students for school actions
export const viewAllStudentsForSchoolActions = createAsyncThunk(
	'Common/viewAllStudentsForSchoolActions',
	viewAllStudentsForSchoolActionsThunk,
)

// 4 Actions

export const promoteStudentsToNextClass = createAsyncThunk(
	'Common/promoteStudentsToNextClass',
	promoteStudentsToNextClassThunk,
)
export const StudentsSectionShift = createAsyncThunk(
	'Common/getAllSections',
	shiftSectionThunk,
)

export const markStudentAsGraduated = createAsyncThunk(
	'Common/markStudentAsGraduated',
	markStudentAsGraduatedThunk,
)

export const markStudentAsExited = createAsyncThunk(
	'Common/markStudentAsExited',
	markStudentAsExitedThunk,
)

// 2 single student actions
export const markSingleStudentAsExited = createAsyncThunk(
	'Common/markSingleStudentAsExited',
	markSingleStudentAsExitedThunk,
)

export const markSingleStudentAsGraduated = createAsyncThunk(
	'Common/markSingleStudentAsGraduated',
	markSingleStudentAsGraduatedThunk,
)
export const listStudents = createAsyncThunk(
	'Common/listStudents',
	listStudentsThunk,
)

export const commonSlice = createSlice({
	name: 'Common',
	initialState: { ...initialState },
	reducers: {
		resetCommonSlice: (state) => {
			return initialState
		},
		updateAllStudentsForSchoolAction: (state, action) => {
			state.allStudentsForSchoolActions = action.payload
		},
		clearAllStudentsForSchoolAction: (state, action) => {
			state.allStudentsForSchoolActions = []
		},
		clearListStudents: (state, action) => {
			state.listStudentsData = []
		},
		clearClassroomListStudents: (state, action) => {
			state.classroomsListForStudents = []
		},

		setSchoolsList: (state, action) => {
			state.schoolsList = []
		},
		setClassroomsList: (state, action) => {
			state.classroomsList = []
		},
		setSectionsList: (state, action) => {
			state.sectionsList = []
		},
		resetScClSections: (state) => {
			const obj = {
				schoolsList: [],
				classroomsList: [],
				sectionsList: [],
			}
			state = { ...state, ...obj }
		},
	},
	extraReducers: (builder) => {
		builder.addCase(getSchoolsList.fulfilled, (state, { payload }) => {
			state.schoolsList = payload
		})
		builder.addCase(getAllSections.fulfilled, (state, { payload }) => {
			if (!Array.isArray(payload)) {
				state.sectionsList = []
			} else {
				state.sectionsList = payload
			}
		})
		builder.addCase(getAllClassrooms.fulfilled, (state, { payload }) => {
			state.classroomsList = payload
		})
		builder.addCase(
			getSchoolsListForValidation.fulfilled,
			(state, { payload }) => {
				state.schoolsListForValidation = payload
			},
		)
		builder.addCase(
			getAllClassroomsForValidation.fulfilled,
			(state, { payload }) => {
				state.classroomsListForValidation = payload
			},
		)
		builder.addCase(
			getAllClassroomsForStudents.fulfilled,
			(state, { payload }) => {
				state.classroomsListForStudents = payload?.sort(
					(a, b) => a?.classHierarchy - b?.classHierarchy,
				)
			},
		)
		builder.addCase(
			viewAllStudentsForSchoolActions.fulfilled,
			(state, { payload }) => {
				state.allStudentsForSchoolActions = payload
			},
		)
		builder.addCase(listStudents.fulfilled, (state, { payload }) => {
			state.listStudentsData = payload
		})
	},
})

export const {
	resetCommonSlice,
	updateAllStudentsForSchoolAction,
	clearAllStudentsForSchoolAction,
	setSectionsList,
	setSchoolsList,
	setClassroomsList,
	resetScClSections,
	clearListStudents,
	clearClassroomListStudents,
} = commonSlice.actions

export default commonSlice.reducer
