import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
	fetchCommonMiscellaneousDataThunk,
	fetchStatesByCountryIdThunk,
	getDashboardDataThunk,
	updateProfileDataThunk,
} from './dashboardThunk'

const initialState = {
	permissions: [],
	requiredPermissions: ['Admin', 'SuperAdmin'],
	hasRequiredPermission: false,
	appPermissions: {},
	dashboardData: {},
	selectedRow: {},
	drawerWidth: 300,
	countries: [],
	states: [],
	academicYears: [],
	isPermissionOfTeacher: false,
	months: [],
	years: [],
}

export const getDashboardData = createAsyncThunk(
	'Dashboard Data/Get Dashboard Data',
	getDashboardDataThunk,
)

export const updateProfileData = createAsyncThunk(
	'Dashboard Data/Update profile picture',
	updateProfileDataThunk,
)

export const fetchCommonMiscellaneousData = createAsyncThunk(
	'Common Miscellaneous',
	fetchCommonMiscellaneousDataThunk,
)

export const fetchStatesByCountry = createAsyncThunk(
	'Fetch states by country',
	fetchStatesByCountryIdThunk,
)

export const dashboardSlice = createSlice({
	name: 'dashboardSliceSetup',
	initialState,
	reducers: {
		setHasRequiredPermission: (state, action) => {
			state.hasRequiredPermission = action.payload
		},
		setPermissions: (state, action) => {
			state.permissions = action.payload
		},
		setAppPermissions: (state, action) => {
			const profileData = action.payload
			let permissions = {}
			if (profileData !== null && profileData?.appFeatures?.length <= 0)
				return permissions
			for (var key in profileData?.appFeatures) {
				if (profileData?.appFeatures?.hasOwnProperty(key)) {
					permissions[key] = {
						view: profileData?.appFeatures[key]?.includes('view'),
						edit: profileData?.appFeatures[key]?.includes('edit'),
						delete: profileData?.appFeatures[key]?.includes(
							'delete',
						),
					}
				}
			}
			state.appPermissions = permissions
		},
		setDashboardData: (state, action) => {
			state.dashboardData = action.payload
		},
		setSelectedRow: (state, action) => {
			state.selectedRow = action.payload
		},
		setDrawerWidth: (state, action) => {
			state.drawerWidth = action.payload
		},
		setIspermissionOfTeacher: (state, { payload }) => {
			state.isPermissionOfTeacher = payload
		},
	},
	extraReducers: (builder) => {
		builder.addCase(getDashboardData.fulfilled, (state, { payload }) => {
			state.dashboardData = payload
		})
		builder.addCase(
			fetchCommonMiscellaneousData.fulfilled,
			(state, { payload }) => {
				state.countries = payload.countries
				state.states = payload.states
				state.academicYears = payload.academicYears
				state.months = payload.months
				state.years = payload.years
			},
		)
	},
})

export const {
	setHasRequiredPermission,
	setPermissions,
	setAppPermissions,
	setDashboardData,
	setSelectedRow,
	setDrawerWidth,
	setIspermissionOfTeacher,
} = dashboardSlice.actions

export default dashboardSlice.reducer
