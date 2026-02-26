import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
	bulkDeleteClassroomThunk,
	deleteClassroomThunk,
	editClassroomThunk,
	uploadClassroomThunk,
	viewAllClassroomsThunk,
} from './classroomsThunk'

const initialState = {
	allClassrooms: [],
	classRoomIdsForDelete: [],
}

export const viewAllClassrooms = createAsyncThunk(
	'students/viewAllClassrooms',
	viewAllClassroomsThunk,
)

export const deleteClassroom = createAsyncThunk(
	'classrooms/deleteClassroom',
	deleteClassroomThunk,
)

export const editClassroom = createAsyncThunk(
	'classrooms/editClassroom',
	editClassroomThunk,
)

export const uploadClassroom = createAsyncThunk(
	'classrooms/upload Classroom',
	uploadClassroomThunk,
)

export const bulkDeleteClassroom = createAsyncThunk(
	'classrooms/deleteClassroom',
	bulkDeleteClassroomThunk,
)

export const classroomsSlice = createSlice({
	name: 'classrooms',
	initialState,
	reducers: {
		updateAllClassrooms: (state, action) => {
			state.allClassrooms = action.payload
		},
		updateGetAllClassrooms: (state, action) => {
			state.classroomsList = action.payload
		},
		updateGetAllSections: (state, action) => {
			state.sectionsList = action.payload
		},
		setClassroomFilterSchools: (state, action) => {
			state.filterFields.schools = action.payload
		},
		setClassroomFilterClasses: (state, action) => {
			state.filterFields.classes = action.payload
		},
		setClassroomFilterSections: (state, action) => {
			if (!state?.filterFields?.section?.includes(action.payload)) {
				state.filterFields.section = [
					...state.filterFields.section,
					action.payload,
				]
			} else {
				state.filterFields.section = state.filterFields.section.filter(
					(sec) => sec !== action.payload,
				)
			}
		},
		clearSections: (state, action) => {
			state.filterFields.section = []
		},
		clearClassroomFilter: (state) => {
			state.filterFields = {
				schools: [],
				classes: [],
				sections: [],
			}
		},
		setClassRoomIdsForDelete: (state, action) => {
			if (state.classRoomIdsForDelete.includes(action?.payload)) {
				state.classRoomIdsForDelete =
					state?.classRoomIdsForDelete?.filter(
						(cls) => cls !== action?.payload,
					)
			} else {
				state.classRoomIdsForDelete = [
					...state?.classRoomIdsForDelete,
					action?.payload,
				]
			}
		},
		clearClassRoomIdsForDelete: (state, action) => {
			state.classRoomIdsForDelete = []
		},
		setClassRoomIdsForDeleteBulk: (state, action) => {
			state.classRoomIdsForDelete = action?.payload
		},
		resetClassroomsSlice: (state) => {
			return initialState
		},
	},
	extraReducers: (builder) => {
		builder.addCase(viewAllClassrooms.fulfilled, (state, { payload }) => {
			state.allClassrooms = payload
		})
		// builder.addCase(getAllSections.fulfilled, (state, { payload }) => {
		//   state.sectionsList = payload;
		// });
		// builder.addCase(getAllClassrooms.fulfilled, (state, { payload }) => {
		//   state.classroomsList = payload;
		// });
		builder.addCase(deleteClassroom.fulfilled, (state, { payload }) => {
			// state.classroomsList = payload;
		})
		builder.addCase(editClassroom.fulfilled, (state, { payload }) => {
			// viewAllClassrooms({body: {}})
		})
		builder.addCase(uploadClassroom.fulfilled, (state, { payload }) => {
			// state.classroomsList = payload;
		})
	},
})

export const {
	updateAllClassrooms,
	updateGetAllClassrooms,
	updateGetAllSections,
	setClassroomFilterSchools,
	setClassroomFilterClasses,
	setClassroomFilterSections,
	clearClassroomFilter,
	clearSections,
	resetClassroomsSlice,
	setClassRoomIdsForDelete,
	clearClassRoomIdsForDelete,
	setClassRoomIdsForDeleteBulk,
} = classroomsSlice.actions

export default classroomsSlice.reducer
