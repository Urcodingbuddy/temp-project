import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Box,
	Typography,
	CircularProgress,
	Alert,
	Stepper,
	Step,
	StepLabel,
	Paper,
	Radio,
	RadioGroup,
	FormControlLabel,
	FormControl,
	TextField,
	Chip,
	Grid,
	Divider,
	IconButton,
	LinearProgress,
} from '@mui/material'
import {
	Close as CloseIcon,
	NavigateNext as NavigateNextIcon,
	NavigateBefore as NavigateBeforeIcon,
	Save as SaveIcon,
	Send as SendIcon,
} from '@mui/icons-material'
import {
	getAssessmentQuestions,
	saveAssessment,
	resetCurrentAssessment,
	setAssessmentAnswer,
	resetAssessmentAnswers,
} from './gandtCounselorSlice'
import AssessmentResultDialog from './AssessmentResultDialog'

const AssessmentFormDialog = ({
	open,
	onClose,
	student,
	school,
	classroom,
	template,
	onAssessmentSaved,
}) => {
	const dispatch = useDispatch()
	const {
		questionsBySkill,
		totalQuestions,
		ageGroup,
		questionsLoading,
		assessmentLoading,
		assessmentAnswers,
		error,
	} = useSelector((state) => state.gandtCounselor)

	const [activeSkillIndex, setActiveSkillIndex] = useState(0)
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
	const [localAnswers, setLocalAnswers] = useState({})
	const [remarks, setRemarks] = useState('')
	const [assessmentStatus, setAssessmentStatus] = useState('in-progress')
	const [showResults, setShowResults] = useState(false)
	const [completedAssessment, setCompletedAssessment] = useState(null)

	// Load questions when dialog opens
	useEffect(() => {
		if (open && student && template) {
			dispatch(
				getAssessmentQuestions({
					templateId: template._id,
					studentAge: student.age,
				}),
			)
		}
	}, [open, student, template, dispatch])

	// Reset on close
	useEffect(() => {
		if (!open) {
			setActiveSkillIndex(0)
			setCurrentQuestionIndex(0)
			setLocalAnswers({})
			setRemarks('')
			setAssessmentStatus('in-progress')
			setShowResults(false)
			setCompletedAssessment(null)
			dispatch(resetCurrentAssessment())
			dispatch(resetAssessmentAnswers())
		}
	}, [open, dispatch])

	if (!student || !template || !school || !classroom) return null

	const currentSkill = questionsBySkill[activeSkillIndex]
	const currentQuestion = currentSkill?.questions[currentQuestionIndex]
	const totalAnswered = Object.keys(localAnswers).length
	const progress = totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0

	// Handle answer selection
	const handleAnswerChange = (event) => {
		const selectedOptionText = event.target.value
		const selectedOption = currentQuestion.options.find(
			(opt) => opt.optionText === selectedOptionText,
		)

		if (selectedOption) {
			const answer = {
				questionId: currentQuestion._id,
				skillId: currentSkill.skill._id,
				selectedOption: selectedOption.optionText,
				score: selectedOption.score,
				category: currentQuestion.category,
			}

			setLocalAnswers({
				...localAnswers,
				[currentQuestion._id.toString()]: answer,
			})
		}
	}

	// Navigate to next question
	const handleNext = () => {
		if (currentQuestionIndex < currentSkill.questions.length - 1) {
			setCurrentQuestionIndex(currentQuestionIndex + 1)
		} else if (activeSkillIndex < questionsBySkill.length - 1) {
			setActiveSkillIndex(activeSkillIndex + 1)
			setCurrentQuestionIndex(0)
		}
	}

	// Navigate to previous question
	const handlePrevious = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex(currentQuestionIndex - 1)
		} else if (activeSkillIndex > 0) {
			setActiveSkillIndex(activeSkillIndex - 1)
			setCurrentQuestionIndex(
				questionsBySkill[activeSkillIndex - 1].questions.length - 1,
			)
		}
	}

	// Save assessment (draft or final)
	const handleSaveAssessment = async (status = 'in-progress') => {
		const answersArray = Object.values(localAnswers)

		const assessmentData = {
			studentId: student._id,
			school: school._id,
			classRoomId: classroom._id,
			template: template._id,
			ageGroupId: ageGroup._id,
			studentAge: student.age,
			answers: answersArray,
			status,
			remarks,
		}

		const result = await dispatch(saveAssessment(assessmentData))

		if (result.type === 'gandtCounselor/saveAssessment/fulfilled') {
			// If completed, show results dialog
			if (status === 'completed') {
				setCompletedAssessment(result.payload.assessment)
				setShowResults(true)
			} else {
				// For drafts, just close and refresh
				if (onAssessmentSaved) {
					onAssessmentSaved()
				}
				onClose()
			}
		}
	}

	// Handle results dialog close
	const handleResultsClose = () => {
		setShowResults(false)
		setCompletedAssessment(null)
		if (onAssessmentSaved) {
			onAssessmentSaved()
		}
		onClose()
	}

	// Check if current question is answered
	const isCurrentQuestionAnswered = currentQuestion
		? localAnswers[currentQuestion._id.toString()] !== undefined
		: false

	// Check if all questions are answered
	const allQuestionsAnswered = totalAnswered === totalQuestions

	// Check if it's the last question
	const isLastQuestion =
		activeSkillIndex === questionsBySkill.length - 1 &&
		currentQuestionIndex === (currentSkill?.questions.length || 0) - 1

	// Check if it's the first question
	const isFirstQuestion = activeSkillIndex === 0 && currentQuestionIndex === 0

	return (
		<Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
			<DialogTitle>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box>
						<Typography variant="h5" fontWeight={600}>
							G&T Assessment
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{student.studentName} - Age: {student.age} years
						</Typography>
					</Box>
					<IconButton onClick={onClose} size="small">
						<CloseIcon />
					</IconButton>
				</Box>
			</DialogTitle>

			<DialogContent dividers>
				{questionsLoading && (
					<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
						<CircularProgress />
					</Box>
				)}

				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				{!questionsLoading && questionsBySkill.length === 0 && (
					<Alert severity="warning">
						No questions available for this age group. Please contact the administrator.
					</Alert>
				)}

				{!questionsLoading && questionsBySkill.length > 0 && (
					<Box>
						{/* Skill Stepper */}
						<Stepper activeStep={activeSkillIndex} alternativeLabel sx={{ mb: 2 }}>
							{questionsBySkill.map((skillData) => (
								<Step key={skillData.skill._id}>
									<StepLabel>
										<Typography variant="caption" color="text.secondary">
											{skillData.skill.skillName}
										</Typography>
									</StepLabel>
								</Step>
							))}
						</Stepper>

						{/* Progress Bar */}
						<Box sx={{ mb: 3 }}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
								<Typography variant="caption" color="text.secondary">
									Progress: {totalAnswered} / {totalQuestions} questions
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{progress.toFixed(0)}%
								</Typography>
							</Box>
							<LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 1 }} />
						</Box>

						{/* Current Question */}
						{currentQuestion && currentSkill && (
							<Paper elevation={2} sx={{ p: 3 }}>
								{/* Question Header */}
								<Box sx={{ mb: 3 }}>
									<Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
										{currentQuestion.questionText}
									</Typography>
									{currentQuestion.exampleText && (
										<Alert severity="info" sx={{ mt: 2 }}>
											<Typography variant="body1" sx={{ fontSize: '1rem' }}>
												<strong>Example:</strong> {currentQuestion.exampleText}
											</Typography>
										</Alert>
									)}
								</Box>

								{/* Answer Options */}
								<FormControl component="fieldset" fullWidth>
									<RadioGroup
										value={
											localAnswers[currentQuestion._id.toString()]
												?.selectedOption || ''
										}
										onChange={handleAnswerChange}
									>
										<Grid container spacing={2}>
											{currentQuestion.options.map((option, index) => (
												<Grid item xs={12} sm={6} key={index}>
													<Paper
														variant="outlined"
														sx={{
															p: 2,
															cursor: 'pointer',
															height: '100%',
															'&:hover': { bgcolor: 'action.hover' },
															bgcolor:
																localAnswers[currentQuestion._id.toString()]
																	?.selectedOption === option.optionText
																	? 'action.selected'
																	: 'transparent',
														}}
														onClick={() =>
															handleAnswerChange({
																target: { value: option.optionText },
															})
														}
													>
														<FormControlLabel
															value={option.optionText}
															control={<Radio />}
															label={
																<Typography variant="body1" sx={{ fontSize: '1rem' }}>
																	{option.optionText}
																</Typography>
															}
															sx={{ width: '100%', m: 0 }}
														/>
													</Paper>
												</Grid>
											))}
										</Grid>
									</RadioGroup>
								</FormControl>

								{/* Navigation Buttons */}
								<Box
									sx={{
										display: 'flex',
										justifyContent: 'space-between',
										mt: 3,
									}}
								>
									<Button
										variant="outlined"
										startIcon={<NavigateBeforeIcon />}
										onClick={handlePrevious}
										disabled={isFirstQuestion}
									>
										Previous
									</Button>
									<Button
										variant="contained"
										endIcon={<NavigateNextIcon />}
										onClick={handleNext}
										disabled={!isCurrentQuestionAnswered || isLastQuestion}
									>
										Next
									</Button>
								</Box>
							</Paper>
						)}

						{/* Remarks Section */}
						{allQuestionsAnswered && (
							<Box sx={{ mt: 3 }}>
								<TextField
									fullWidth
									multiline
									rows={3}
									label="Remarks (Optional)"
									value={remarks}
									onChange={(e) => setRemarks(e.target.value)}
									placeholder="Add any additional observations or comments..."
								/>
							</Box>
						)}
					</Box>
				)}
			</DialogContent>

			<DialogActions sx={{ p: 2, gap: 1 }}>
				<Button onClick={onClose} disabled={assessmentLoading}>
					Cancel
				</Button>
				<Button
					variant="contained"
					startIcon={<SendIcon />}
					onClick={() => handleSaveAssessment('completed')}
					disabled={assessmentLoading || !allQuestionsAnswered}
					color="success"
				>
					{assessmentLoading ? <CircularProgress size={24} /> : 'Submit Assessment'}
				</Button>
			</DialogActions>

			{/* Results Dialog */}
			{showResults && completedAssessment && (
				<AssessmentResultDialog
					open={showResults}
					onClose={handleResultsClose}
					assessment={completedAssessment}
					student={student}
				/>
			)}
		</Dialog>
	)
}

export default AssessmentFormDialog
