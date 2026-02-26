import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
	bulkDeleteStudentsThunk,
	deleteStudentThunk,
	getMiscellaneousDataThunk,
	updateStudentThunk,
	uploadStudentThunk,
	viewAllStudentsThunk,
} from './studentsThunk'

const initialState = {
	studentStatus: 'Active',
	allStudents: [],
	miscellaneous: [],
	selectedSections: [],
	selectedSchools: [],
	selectedClasses: [],

	validation: true,

	filterFields: {
		schools: [],
		classes: [],
		sections: [],
	},
	studentIdsForDelete: [],
	recallStudentApi: false,
}

export const viewAllStudents = createAsyncThunk(
	'students/viewAllStudents',
	viewAllStudentsThunk,
)

export const getMiscellaneousData = createAsyncThunk(
	'students/getMiscellaneousData',
	getMiscellaneousDataThunk,
)

export const updateStudent = createAsyncThunk(
	'students/updateStudent',
	updateStudentThunk,
)

export const deleteStudent = createAsyncThunk(
	'students/deleteStudent',
	deleteStudentThunk,
)

export const uploadStudent = createAsyncThunk(
	'students/deleteStudent',
	uploadStudentThunk,
)

export const bulkDeleteStudent = createAsyncThunk(
	'students/deleteStudent',
	bulkDeleteStudentsThunk,
)

export const studentsSlice = createSlice({
	name: 'students',
	initialState,
	reducers: {
		updateAllStudents: (state, action) => {
			state.allStudents = action.payload
		},
		setStudentStatus: (state, action) => {
			state.studentStatus = action.payload
		},
		clearStudentStatus: (state, action) => {
			state.studentStatus = 'Active'
		},
		updateMiscellaneous: (state, action) => {
			state.miscellaneous = action.payload
		},
		updateSelectedSections: (state, action) => {
			state.selectedSections = action.payload
		},
		updateSelectedSchools: (state, action) => {
			state.selectedSchools = action.payload
		},
		updateSelectedClasses: (state, action) => {
			state.selectedClasses = action.payload
		},
		updateValidation: (state, action) => {
			state.validation = action.payload
		},
		setStudentsFilterSchools: (state, action) => {
			state.filterFields.schools = action.payload
		},
		setStudentsFilterClasses: (state, action) => {
			state.filterFields.classes = action.payload
		},
		setStudentsFilterSections: (state, action) => {
			state.filterFields.sections = action.payload
		},
		clearStudentsClasses: (state, action) => {
			state.filterFields.classes = []
		},
		clearStudentsSections: (state, action) => {
			state.filterFields.sections = []
		},
		clearStudentsFilter: (state) => {
			state.filterFields = {
				schools: [],
				classes: [],
				sections: [],
			}
		},
		setStudentIdsForDelete: (state, action) => {
			if (state.studentIdsForDelete.includes(action?.payload)) {
				state.studentIdsForDelete = state?.studentIdsForDelete?.filter(
					(cls) => cls !== action?.payload,
				)
			} else {
				state.studentIdsForDelete = [
					...state?.studentIdsForDelete,
					action?.payload,
				]
			}
		},
		clearStudentIdsForDelete: (state, action) => {
			state.studentIdsForDelete = []
		},
		setStudentIdsForDeleteBulk: (state, action) => {
			state.studentIdsForDelete = action?.payload
		},
		resetStudentSlice: (state) => {
			return initialState
		},
		setRecallStudentApi: (state, { payload }) => {
			state.recallStudentApi = payload
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(updateStudent.fulfilled, (state, { payload }) => {
				viewAllStudents({ body: {} })
			})
			.addCase(viewAllStudents.fulfilled, (state, { payload }) => {
				state.allStudents = payload
			})
			.addCase(deleteStudent.fulfilled, (state, { payload }) => {
				viewAllStudents({ body: {} })
			})
	},
})

export const {
	setRecallStudentApi,
	clearStudentStatus,
	setStudentStatus,
	updateAllStudents,
	updateMiscellaneous,
	updateSelectedSections,
	updateSelectedSchools,
	updateSelectedClasses,
	updateValidation,
	setStudentsFilterSchools,
	setStudentsFilterClasses,
	clearStudentsFilter,
	clearStudentsClasses,
	clearStudentsSections,
	setStudentsFilterSections,
	resetStudentSlice,
	setStudentIdsForDelete,
	clearStudentIdsForDelete,
	setStudentIdsForDeleteBulk,
} = studentsSlice.actions

export default studentsSlice.reducer
