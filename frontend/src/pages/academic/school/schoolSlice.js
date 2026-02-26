import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
	addSchoolThunk,
	downloadStudentsReportThunk,
	editSchoolAcademicYearThunk,
	getAllSchoolThunk,
	getSchoolListThunk,
	updateSchoolStatusThunk,
	updateSchoolThunk,
	viewAcademicSchoolYearThunk,
	viewAllSchoolAcademicYearsThunk,
} from './schoolThunk'

const initialState = {
	allSchools: [],
	allCities: [],
	// schoolsList: [],
	filterFields: {
		status: ['All'],
		onboardingDates: {
			days: 0,
			custom: {
				start: new Date().toISOString(),
				end: null,
			},
		},
		cities: [],
	},
	studentsReportData: [],
}

export const addSchoolData = createAsyncThunk(
	'school/createSchool',
	addSchoolThunk,
)

export const updateSchoolData = createAsyncThunk(
	'school/updateschool data',
	updateSchoolThunk,
)

export const getAllSchools = createAsyncThunk(
	'school/getAllSchools',
	getAllSchoolThunk,
)

export const updateSchoolStatus = createAsyncThunk(
	'school/update status',
	updateSchoolStatusThunk,
)

export const viewSchoolAcademicYear = createAsyncThunk(
	'school academic year/view',
	viewAcademicSchoolYearThunk,
)

export const editSchoolAcademicYear = createAsyncThunk(
	'school academic year/edit',
	editSchoolAcademicYearThunk,
)

export const downloadStudentsReport = createAsyncThunk(
	'school academic year/ download students report',
	downloadStudentsReportThunk,
)

export const viewAllSchoolAcademicYears = createAsyncThunk(
	'school academic years/view all',
	viewAllSchoolAcademicYearsThunk,
)
// export const getSchoolsList = createAsyncThunk(
//   'school/get School List',
//   getSchoolListThunk
// );

export const schoolSlice = createSlice({
	name: 'School',
	initialState: { ...initialState },
	reducers: {
		updateAllSchools: (state, action) => {
			state.allSchools = action.payload
		},
		clearSchoolSlice: () => initialState,
		updateFilterStatus: (state, action) => {
			state.filterFields.status = [action.payload]
		},

		updateFilterOnboardingDates: (state, action) => {
			if (typeof action.payload === 'number') {
				state.filterFields.onboardingDates.days = action.payload
				state.filterFields.onboardingDates.custom = {
					start: new Date().toISOString(),
					end: null,
				}
			} else {
				state.filterFields.onboardingDates.custom = action.payload
				state.filterFields.onboardingDates.days = ''
			}
		},
		toggleSelectCities: (state, action) => {
			if (!state.filterFields.cities.includes(action.payload)) {
				state.filterFields.cities = [
					...state.filterFields.cities,
					action.payload,
				]
			} else {
				state.filterFields.cities = state.filterFields.cities.filter(
					(cit) => cit !== action.payload,
				)
			}
		},
		clearSchoolFilter: (state) => {
			state.filterFields = {
				status: [],
				onboardingDates: {
					days: 0,
					custom: {
						start: new Date(),
						end: null,
					},
				},
				cities: [],
			}
		},
		resetSchoolSlice: (state) => {
			return initialState
		},
	},
	extraReducers: (builder) => {
		builder.addCase(getAllSchools.fulfilled, (state, { payload }) => {
			state.allSchools = payload
		})
		builder.addCase(addSchoolData.fulfilled, (state) => {
			getAllSchools({ body: {} })
		})
		builder.addCase(updateSchoolStatus.fulfilled, (state) => {
			getAllSchools({ body: {} })
		})
		builder.addCase(updateSchoolData.fulfilled, (state) => {
			getAllSchools({ body: {} })
		})
		builder.addCase(
			downloadStudentsReport.fulfilled,
			(state, { payload }) => {
				state.studentsReportData = payload
			},
		)
	},
})

export const {
	updateAllSchools,
	clearSchoolSlice,
	updateFilterStatus,
	updateFilterOnboardingDates,
	toggleSelectCities,
	clearSchoolFilter,
	resetSchoolSlice,
} = schoolSlice.actions

export default schoolSlice.reducer
