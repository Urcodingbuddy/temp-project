import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
	addObservationThunk,
	bulkDeleteObservationThunk,
	deleteObservationThunk,
	getObservationsThunk,
	getSingleObservationRecordThunk,
	updateObservationThunk,
} from './observationThunk'

const initialState = {
	filterFieldsObservation: {
		schools: [],
		classes: [],
		sections: [],
	},
	studentStatus: 'Active',
	allObservations: [],
	observationIdsForDelete: [],
}

export const getObservations = createAsyncThunk(
	'observation/getObservations',
	getObservationsThunk,
)

export const deleteObservation = createAsyncThunk(
	'observation/deleteObservation',
	deleteObservationThunk,
)

export const getSingleObservationRecord = createAsyncThunk(
	'observation/getSingleObservationRecord',
	getSingleObservationRecordThunk,
)

export const addObservation = createAsyncThunk(
	'observation/addObservation',
	addObservationThunk,
)

export const updateObservation = createAsyncThunk(
	'observation/updateObservation',
	updateObservationThunk,
)

export const bulkDeleteObservation = createAsyncThunk(
	'observation/deleteObservation',
	bulkDeleteObservationThunk,
)

export const observationSlice = createSlice({
	name: 'observation',
	initialState,
	reducers: {
		setStudentStatus: (state, action) => {
			state.studentStatus = action.payload
		},
		clearStudentStatus: (state, action) => {
			state.studentStatus = 'Active'
		},

		setObservationFilterSchools: (state, action) => {
			state.filterFieldsObservation.schools = action.payload
		},
		setObservationFilterClasses: (state, action) => {
			state.filterFieldsObservation.classes = action.payload
		},
		setObservationFilterSections: (state, action) => {
			state.filterFieldsObservation.sections = action.payload
		},
		setAllObservations: (state, action) => {
			state.allObservations = action.payload
		},
		clearObservationFilter: (state, action) => {
			state.filterFieldsObservation = {
				schools: [],
				classes: [],
				sections: [],
			}
		},
		setObservationIdsForDelete: (state, action) => {
			if (state.observationIdsForDelete.includes(action?.payload)) {
				state.observationIdsForDelete =
					state?.observationIdsForDelete?.filter(
						(cls) => cls !== action?.payload,
					)
			} else {
				state.observationIdsForDelete = [
					...state?.observationIdsForDelete,
					action?.payload,
				]
			}
		},
		clearObservationIdsForDelete: (state, action) => {
			state.observationIdsForDelete = []
		},
		setObservationIdsForDeleteBulk: (state, action) => {
			state.observationIdsForDelete = action?.payload
		},
		resetObservationSlice: (state) => {
			return initialState
		},
	},
})

export const {
	setStudentStatus,
	clearStudentStatus,
	setObservationFilterSchools,
	setObservationFilterClasses,
	setObservationFilterSections,
	clearObservationFilter,
	setAllObservations,
	resetObservationSlice,
	setObservationIdsForDelete,
	clearObservationIdsForDelete,
	setObservationIdsForDeleteBulk,
} = observationSlice.actions

export default observationSlice.reducer
