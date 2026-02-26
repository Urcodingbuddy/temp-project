import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
	createUserThunk,
	deleteCounsellorThunk,
	resendActivationThunk,
	updateUserThunk,
	viewAllCounsellorsThunk,
	viewAllSchoolsThunk,
} from './counsellorThunk'

const initialState = {
	firstName: '',
	lastName: '',
	emailId: '',
	mobileNumber: '',

	allCounsellors: [],

	editCounsellorFirstName: '',
	editCounsellorLastName: '',
	editCounsellorEmailId: '',
	editCounsellorMobileNumber: '',

	deleteCounsellorDrawer: false,

	allSchools: [],
	selectedSchoolIds: [],

	searchSchoolValue: '',

	filterSearchSchoolValue: '',
	filterPermission: 'all',
	filterSelectedSchoolIds: [],

	addCounsellorAssignSchoolSearchValue: '',
	selectedSchoolIdsAddCounsellorAssignSchool: [],

	editCounsellorAssignSchoolSearchValue: '',
	selectedSchoolIdsEditCounsellorAssignSchool: [],
}

export const createUser = createAsyncThunk(
	'counsellor/createUser',
	createUserThunk,
)

export const viewAllCounsellors = createAsyncThunk(
	'counsellor/viewAllCounsellors',
	viewAllCounsellorsThunk,
)

export const deleteCounsellor = createAsyncThunk(
	'counsellor/deleteCounsellor',
	deleteCounsellorThunk,
)

export const viewAllSchools = createAsyncThunk(
	'counsellor/viewAllSchools',
	viewAllSchoolsThunk,
)

export const updateUser = createAsyncThunk(
	'counsellor/updateUser',
	updateUserThunk,
)

export const resendActivation = createAsyncThunk(
	'counsellor/resendActivation',
	resendActivationThunk,
)

export const counsellorSlice = createSlice({
	name: 'counsellor',
	initialState,
	reducers: {
		updateFirstName: (state, action) => {
			state.firstName = action.payload
		},
		updateLastName: (state, action) => {
			state.lastName = action.payload
		},
		updateMobileNumber: (state, action) => {
			state.mobileNumber = action.payload
		},
		updateEmailId: (state, action) => {
			state.emailId = action.payload
		},
		updateAllCounsellors: (state, action) => {
			state.allCounsellors = action.payload
		},
		updateEditCounsellorFirstName: (state, action) => {
			state.editCounsellorFirstName = action.payload
		},
		updateEditCounsellorLastName: (state, action) => {
			state.editCounsellorLastName = action.payload
		},
		updateEditCounsellorEmailId: (state, action) => {
			state.editCounsellorEmailId = action.payload
		},
		updateEditCounsellorMobileNumber: (state, action) => {
			state.editCounsellorMobileNumber = action.payload
		},
		updateDeleteCounsellorDrawer: (state, action) => {
			state.deleteCounsellorDrawer = action.payload
		},
		updateAllSchools: (state, action) => {
			state.allSchools = action.payload
		},
		updateSelectedSchoolIds: (state, action) => {
			state.selectedSchoolIds = action.payload
		},
		updateSearchSchoolValue: (state, action) => {
			state.searchSchoolValue = action.payload
		},
		updateFilterSearchSchoolValue: (state, action) => {
			state.filterSearchSchoolValue = action.payload
		},
		updateFilterPermission: (state, { payload }) => {
			state.filterPermission = payload
		},
		clearFilterPermission: (state) => {
			state.filterPermission = []
		},
		updateFilterSelectedSchoolIds: (state, action) => {
			state.filterSelectedSchoolIds = action.payload
		},
		updateDeleteSchoolDrawer: (state, action) => {
			state.deleteSchoolDrawer = action.payload
		},
		updateAddCounsellorAssignSchoolSearchValue: (state, action) => {
			state.addCounsellorAssignSchoolSearchValue = action.payload
		},
		updateSelectedSchoolIdsAddCounsellorAssignSchool: (state, action) => {
			state.selectedSchoolIdsAddCounsellorAssignSchool = action.payload
		},
		updateEditCounsellorAssignSchoolSearchValue: (state, action) => {
			state.editCounsellorAssignSchoolSearchValue = action.payload
		},
		updateSelectedSchoolIdsEditCounsellorAssignSchool: (state, action) => {
			state.selectedSchoolIdsEditCounsellorAssignSchool = action.payload
		},
		clearCounsellorSlice: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(createUser.fulfilled, (state, { payload }) => {
				Object.assign(state, initialState)
			})
			.addCase(deleteCounsellor.fulfilled, (state, { payload }) => {
				state.deleteCounsellorDrawer = false
			})
			.addCase(updateUser.fulfilled, (state, { payload }) => {
				state.selectedSchoolIds = []
				state.searchSchoolValue = ''
				state.deleteSchoolDrawer = false
			})
	},
})

export const {
	updateFirstName,
	updateLastName,
	updateMobileNumber,
	updateEmailId,
	clearCounsellorSlice,
	updateAllCounsellors,
	updateEditCounsellorFirstName,
	updateEditCounsellorLastName,
	updateEditCounsellorEmailId,
	updateEditCounsellorMobileNumber,
	updateDeleteCounsellorDrawer,
	updateAllSchools,
	updateSelectedSchoolIds,
	updateSearchSchoolValue,
	updateFilterSearchSchoolValue,
	updateFilterPermission,
	updateFilterSelectedSchoolIds,
	updateDeleteSchoolDrawer,
	updateAddCounsellorAssignSchoolSearchValue,
	updateSelectedSchoolIdsAddCounsellorAssignSchool,
	updateEditCounsellorAssignSchoolSearchValue,
	updateSelectedSchoolIdsEditCounsellorAssignSchool,
	clearFilterPermission,
} = counsellorSlice.actions

export default counsellorSlice.reducer
