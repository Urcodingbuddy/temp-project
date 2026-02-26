import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import {
	addSendChecklistThunk,
	checklistAnalyticsForSingleSchoolThunk,
	checklistBulkDeleteThunk,
	checklistsingleDeleteThunk,
	getSendChecklistDataThunk,
	sCAnalyticsForAllSchoolsThunk,
	sendChecklistBUlkUploadThunk,
	updateSendChecklistThunk,
} from './sendChecklistThunk'

const initialState = {
	checklistData: {},
	Grade_4_Marks: {
		[localizationConstants.attention]: Array.from(
			{ length: 4 },
			(_, index) => ({
				question: index + 1,
				answer: 'no',
			}),
		),
		[localizationConstants.fineMotorGrossMotorSkill]: Array.from(
			{ length: 4 },
			(_, index) => ({
				question: index + 1,
				answer: 'no',
			}),
		),
		[localizationConstants.cognitive]: Array.from(
			{ length: 11 },
			(_, index) => ({
				question: index + 1,
				answer: 'no',
			}),
		),
		[localizationConstants.behavior]: Array.from(
			{ length: 9 },
			(_, index) => ({
				question: index + 1,
				answer: 'no',
			}),
		),
	},
	Grade_9_Marks: {
		[localizationConstants.attentionHyperactivity]: Array.from(
			{ length: 12 },
			(_, index) => ({
				question: index + 1,
				answer: 'no',
			}),
		),
		[localizationConstants.fineMotorGrossMotorSkillPGC]: Array.from(
			{ length: 4 },
			(_, index) => ({
				question: index + 1,
				answer: 'no',
			}),
		),
		[localizationConstants.memory]: Array.from(
			{ length: 6 },
			(_, index) => ({
				question: index + 1,
				answer: 'no',
			}),
		),
		[localizationConstants.cognitive]: {
			[localizationConstants.readingAndSpelling]: Array.from(
				{ length: 18 },
				(_, index) => ({
					question: index + 1,
					answer: 'no',
				}),
			),
			[localizationConstants.numeracySkills]: Array.from(
				{ length: 9 },
				(_, index) => ({
					question: index + 1,
					answer: 'no',
				}),
			),
			[localizationConstants.speakingAndListening]: Array.from(
				{ length: 15 },
				(_, index) => ({
					question: index + 1,
					answer: 'no',
				}),
			),
			[localizationConstants.styleofWorking]: Array.from(
				{ length: 4 },
				(_, index) => ({
					question: index + 1,
					answer: 'no',
				}),
			),
		},

		[localizationConstants.socialSkills]: {
			[localizationConstants.behavior]: Array.from(
				{ length: 9 },
				(_, index) => ({
					question: index + 1,
					answer: 'no',
				}),
			),
			[localizationConstants.visualAndPerceptualAbility]: Array.from(
				{ length: 8 },
				(_, index) => ({
					question: index + 1,
					answer: 'no',
				}),
			),
		},
	},
	sCIdsForDelete: [],
	recallsendChecklistApi: false,
	allSchoolschecklistAnalyticsData: {},
	singleSchoolSChecklistAnalyticsData: {},
}
export const getSendChecklistData = createAsyncThunk(
	'sendChecklist/getSendChecklistData',
	getSendChecklistDataThunk,
)

export const updateSendChecklist = createAsyncThunk(
	'sendChecklist/updateSendChecklist',
	updateSendChecklistThunk,
)
export const addSendChecklist = createAsyncThunk(
	'sendChecklist/addSendChecklist',
	addSendChecklistThunk,
)
export const sCAnalyticsForAllSchools = createAsyncThunk(
	'sendChecklist/sCAnalyticsForAllSchools',
	sCAnalyticsForAllSchoolsThunk,
)
export const sendChecklistBUlkUpload = createAsyncThunk(
	'sendChecklist/sendChecklistBUlkUpload',
	sendChecklistBUlkUploadThunk,
)
export const checklistsingleDelete = createAsyncThunk(
	'sendChecklist/checklistsingleDelete',
	checklistsingleDeleteThunk,
)
export const checklistBulkDelete = createAsyncThunk(
	'sendChecklist/checklistBulkDelete',
	checklistBulkDeleteThunk,
)
export const checklistAnalyticsForSingleSchool = createAsyncThunk(
	'sendChecklist/checklistAnalyticsForSingleSchool',
	checklistAnalyticsForSingleSchoolThunk,
)
export const SendChecklistSlice = createSlice({
	name: 'sendChecklist',
	initialState,
	reducers: {
		setChecklistdata: (state, { payload }) => {
			state.checklistData = payload
		},
		setGrade_4_Marks: (state, { payload }) => {
			state.Grade_4_Marks = payload
		},
		setGrade_9_Marks: (state, { payload }) => {
			state.Grade_9_Marks = payload
		},
		clearGrade_4_Marks: (state) => {
			state.Grade_4_Marks = initialState.Grade_4_Marks
		},
		clearGrade_9_Marks: (state) => {
			state.Grade_9_Marks = initialState.Grade_9_Marks
		},
		setSCIdsForDelete: (state, { payload }) => {
			if (state.sCIdsForDelete?.includes(payload)) {
				state.sCIdsForDelete = state.sCIdsForDelete?.filter(
					(data) => data !== payload,
				)
			} else {
				state.sCIdsForDelete = [...state.sCIdsForDelete, payload]
			}
		},
		clearSCIdsForDelete: (state, { payload }) => {
			state.sCIdsForDelete = payload
		},
		setRecallSendChecklistAPI: (state, { payload }) => {
			state.recallsendChecklistApi = payload
		},
		setAllSchoolschecklistAnalyticsData: (state, { payload }) => {
			state.allSchoolschecklistAnalyticsData = payload
		},

		clearSendchecklistsliceBeingSlice: () => initialState,
	},
	extraReducers: (builder) => {
		builder.addCase(
			getSendChecklistData.fulfilled,
			(state, { payload }) => {
				state.checklistData = payload
			},
		)
		builder.addCase(
			sCAnalyticsForAllSchools.fulfilled,
			(state, { payload }) => {
				state.allSchoolschecklistAnalyticsData = payload
			},
		)
		builder.addCase(
			checklistAnalyticsForSingleSchool.fulfilled,
			(state, { payload }) => {
				state.singleSchoolSChecklistAnalyticsData = payload
			},
		)
	},
})

export const {
	clearSCIdsForDelete,
	clearSendchecklistsliceBeingSlice,
	setChecklistdata,
	clearGrade_9_Marks,
	clearGrade_4_Marks,
	setGrade_4_Marks,
	setGrade_9_Marks,
	setSCIdsForDelete,
	setRecallSendChecklistAPI,
} = SendChecklistSlice.actions

export default SendChecklistSlice.reducer
