import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
	checkSchoolTemplateThunk,
	getStudentsWithStatusThunk,
	getStudentHistoryThunk,
	getAssessmentQuestionsThunk,
	saveAssessmentThunk,
	getAssessmentByIdThunk,
	deleteAssessmentThunk,
} from './gandtCounselorThunk'

const initialState = {
	// School template check
	hasTemplate: false,
	templateInfo: null,
	assignmentId: null,

	// Students list
	students: [],
	totalStudents: 0,

	// Selected student
	selectedStudent: null,
	studentHistory: [],

	// Assessment questions
	assessmentTemplate: null,
	ageGroup: null,
	questionsBySkill: [],
	totalQuestions: 0,

	// Current assessment
	currentAssessment: null,
	assessmentAnswers: [],

	// Loading states
	loading: false,
	studentsLoading: false,
	historyLoading: false,
	questionsLoading: false,
	assessmentLoading: false,

	// Error handling
	error: null,
	templateCheckMessage: '',
}

// Async thunks
export const checkSchoolTemplate = createAsyncThunk(
	'gandtCounselor/checkSchoolTemplate',
	checkSchoolTemplateThunk,
)

export const getStudentsWithStatus = createAsyncThunk(
	'gandtCounselor/getStudentsWithStatus',
	getStudentsWithStatusThunk,
)

export const getStudentHistory = createAsyncThunk(
	'gandtCounselor/getStudentHistory',
	getStudentHistoryThunk,
)

export const getAssessmentQuestions = createAsyncThunk(
	'gandtCounselor/getAssessmentQuestions',
	getAssessmentQuestionsThunk,
)

export const saveAssessment = createAsyncThunk(
	'gandtCounselor/saveAssessment',
	saveAssessmentThunk,
)

export const getAssessmentById = createAsyncThunk(
	'gandtCounselor/getAssessmentById',
	getAssessmentByIdThunk,
)

export const deleteAssessment = createAsyncThunk(
	'gandtCounselor/deleteAssessment',
	deleteAssessmentThunk,
)

// Slice
const gandtCounselorSlice = createSlice({
	name: 'gandtCounselor',
	initialState,
	reducers: {
		resetState: (state) => {
			Object.assign(state, initialState)
		},
		resetTemplateCheck: (state) => {
			state.hasTemplate = false
			state.templateInfo = null
			state.assignmentId = null
			state.templateCheckMessage = ''
		},
		resetStudentsList: (state) => {
			state.students = []
			state.totalStudents = 0
		},
		setSelectedStudent: (state, action) => {
			state.selectedStudent = action.payload
		},
		resetSelectedStudent: (state) => {
			state.selectedStudent = null
			state.studentHistory = []
		},
		setAssessmentAnswer: (state, action) => {
			const { questionId, answer } = action.payload
			const existingIndex = state.assessmentAnswers.findIndex(
				(a) => a.questionId === questionId,
			)

			if (existingIndex >= 0) {
				state.assessmentAnswers[existingIndex] = answer
			} else {
				state.assessmentAnswers.push(answer)
			}
		},
		resetAssessmentAnswers: (state) => {
			state.assessmentAnswers = []
		},
		resetCurrentAssessment: (state) => {
			state.currentAssessment = null
			state.assessmentAnswers = []
			state.questionsBySkill = []
			state.totalQuestions = 0
		},
		setError: (state, action) => {
			state.error = action.payload
		},
		clearError: (state) => {
			state.error = null
		},
	},
	extraReducers: (builder) => {
		builder
			// Check school template
			.addCase(checkSchoolTemplate.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(checkSchoolTemplate.fulfilled, (state, action) => {
				state.loading = false
				const { hasTemplate, template, assignmentId, message } = action.payload

				state.hasTemplate = hasTemplate
				state.templateInfo = template || null
				state.assignmentId = assignmentId || null
				state.templateCheckMessage = message || ''
			})
			.addCase(checkSchoolTemplate.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload
			})

			// Get students with status
			.addCase(getStudentsWithStatus.pending, (state) => {
				state.studentsLoading = true
				state.error = null
			})
			.addCase(getStudentsWithStatus.fulfilled, (state, action) => {
				state.studentsLoading = false
				const { students, totalCount } = action.payload

				state.students = students || []
				state.totalStudents = totalCount || 0
			})
			.addCase(getStudentsWithStatus.rejected, (state, action) => {
				state.studentsLoading = false
				state.error = action.payload
			})

			// Get student history
			.addCase(getStudentHistory.pending, (state) => {
				state.historyLoading = true
				state.error = null
			})
			.addCase(getStudentHistory.fulfilled, (state, action) => {
				state.historyLoading = false
				const { assessments } = action.payload

				state.studentHistory = assessments || []
			})
			.addCase(getStudentHistory.rejected, (state, action) => {
				state.historyLoading = false
				state.error = action.payload
			})

			// Get assessment questions
			.addCase(getAssessmentQuestions.pending, (state) => {
				state.questionsLoading = true
				state.error = null
			})
			.addCase(getAssessmentQuestions.fulfilled, (state, action) => {
				state.questionsLoading = false
				const { template, ageGroup, questionsBySkill, totalQuestions } = action.payload

				state.assessmentTemplate = template
				state.ageGroup = ageGroup
				state.questionsBySkill = questionsBySkill || []
				state.totalQuestions = totalQuestions || 0
			})
			.addCase(getAssessmentQuestions.rejected, (state, action) => {
				state.questionsLoading = false
				state.error = action.payload
			})

			// Save assessment
			.addCase(saveAssessment.pending, (state) => {
				state.assessmentLoading = true
				state.error = null
			})
			.addCase(saveAssessment.fulfilled, (state, action) => {
				state.assessmentLoading = false
				state.currentAssessment = action.payload
			})
			.addCase(saveAssessment.rejected, (state, action) => {
				state.assessmentLoading = false
				state.error = action.payload
			})

			// Get assessment by ID
			.addCase(getAssessmentById.pending, (state) => {
				state.assessmentLoading = true
				state.error = null
			})
			.addCase(getAssessmentById.fulfilled, (state, action) => {
				state.assessmentLoading = false
				state.currentAssessment = action.payload
				state.assessmentAnswers = action.payload.answers || []
			})
			.addCase(getAssessmentById.rejected, (state, action) => {
				state.assessmentLoading = false
				state.error = action.payload
			})

			// Delete assessment
			.addCase(deleteAssessment.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(deleteAssessment.fulfilled, (state) => {
				state.loading = false
			})
			.addCase(deleteAssessment.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload
			})
	},
})

export const {
	resetState,
	resetTemplateCheck,
	resetStudentsList,
	setSelectedStudent,
	resetSelectedStudent,
	setAssessmentAnswer,
	resetAssessmentAnswers,
	resetCurrentAssessment,
	setError,
	clearError,
} = gandtCounselorSlice.actions

export default gandtCounselorSlice.reducer
