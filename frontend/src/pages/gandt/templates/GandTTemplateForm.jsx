import React, { useEffect, useState } from 'react'
import {
	Box,
	Button,
	Card,
	TextField,
	Typography,
	IconButton,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Grid,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Alert,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip,
} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
	createGandTTemplate,
	updateGandTTemplate,
	getGandTTemplateById,
} from './gandtTemplateSlice'
import { routePaths } from '../../../routes/routeConstants'
import { tableStyles } from '../../../components/styles/tableStyles'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

const GandTTemplateForm = () => {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const templateId = searchParams.get('id')
	const isEditMode = !!templateId

	const { selectedTemplate, loading } = useSelector(
		(state) => state.gandtTemplate,
	)

	// Form state
	const [templateName, setTemplateName] = useState('')
	const [description, setDescription] = useState('')
	const [ageGroups, setAgeGroups] = useState([])
	const [skills, setSkills] = useState([])
	const [ageGroupQuestions, setAgeGroupQuestions] = useState([])
	const [errors, setErrors] = useState({})
	const [showAgeGroupDialog, setShowAgeGroupDialog] = useState(false)
	const [showSkillDialog, setShowSkillDialog] = useState(false)
	const [showQuestionDialog, setShowQuestionDialog] = useState(false)
	const [currentAgeGroup, setCurrentAgeGroup] = useState(null)
	const [currentSkill, setCurrentSkill] = useState(null)
	const [currentQuestion, setCurrentQuestion] = useState(null)
	const [currentAgeGroupId, setCurrentAgeGroupId] = useState(null)
	const [currentSkillId, setCurrentSkillId] = useState(null)

	useEffect(() => {
		if (isEditMode && templateId) {
			dispatch(getGandTTemplateById(templateId))
		}
	}, [templateId, isEditMode, dispatch])

	useEffect(() => {
		if (isEditMode && selectedTemplate) {
			setTemplateName(selectedTemplate.templateName || '')
			setDescription(selectedTemplate.description || '')
			setAgeGroups(selectedTemplate.ageGroups || [])
			setSkills(selectedTemplate.skills || [])
			setAgeGroupQuestions(selectedTemplate.ageGroupQuestions || [])
		}
	}, [selectedTemplate, isEditMode])

	// Age Group handlers
	const handleAddAgeGroup = () => {
		setCurrentAgeGroup({ title: '', startAge: '', endAge: '' })
		setShowAgeGroupDialog(true)
	}

	const handleEditAgeGroup = (index) => {
		setCurrentAgeGroup({ ...ageGroups[index], index })
		setShowAgeGroupDialog(true)
	}

	const handleSaveAgeGroup = () => {
		const { title, startAge, endAge, index } = currentAgeGroup

		// Validation
		if (!title || !startAge || !endAge) {
			alert('Please fill all fields')
			return
		}

		if (parseInt(endAge) <= parseInt(startAge)) {
			alert('End age must be greater than start age')
			return
		}

		// Check for overlap
		const newGroups = [...ageGroups]
		const ageGroup = { title, startAge: parseInt(startAge), endAge: parseInt(endAge) }

		if (typeof index === 'number') {
			newGroups[index] = ageGroup
		} else {
			newGroups.push(ageGroup)
		}

		// Check overlaps
		for (let i = 0; i < newGroups.length; i++) {
			for (let j = i + 1; j < newGroups.length; j++) {
				const g1 = newGroups[i]
				const g2 = newGroups[j]
				if (
					(g1.startAge <= g2.endAge && g1.startAge >= g2.startAge) ||
					(g1.endAge <= g2.endAge && g1.endAge >= g2.startAge) ||
					(g2.startAge <= g1.endAge && g2.startAge >= g1.startAge) ||
					(g2.endAge <= g1.endAge && g2.endAge >= g1.startAge)
				) {
					alert(`Age ranges overlap: ${g1.title} and ${g2.title}`)
					return
				}
			}
		}

		setAgeGroups(newGroups)
		setShowAgeGroupDialog(false)
		setCurrentAgeGroup(null)
	}

	const handleDeleteAgeGroup = (index) => {
		setAgeGroups(ageGroups.filter((_, i) => i !== index))
	}

	// Skill handlers
	const handleAddSkill = () => {
		setCurrentSkill({ skillName: '', weightage: '' })
		setShowSkillDialog(true)
	}

	const handleEditSkill = (index) => {
		setCurrentSkill({ ...skills[index], index })
		setShowSkillDialog(true)
	}

	const handleSaveSkill = () => {
		const { skillName, weightage, index } = currentSkill

		if (!skillName || !weightage) {
			alert('Please fill all fields')
			return
		}

		const newSkills = [...skills]
		const skill = {
			skillName,
			weightage: parseFloat(weightage),
		}

		if (typeof index === 'number') {
			newSkills[index] = { ...newSkills[index], ...skill }
		} else {
			newSkills.push(skill)
		}

		setSkills(newSkills)
		setShowSkillDialog(false)
		setCurrentSkill(null)
	}

	const handleDeleteSkill = (index) => {
		setSkills(skills.filter((_, i) => i !== index))
	}

	// Question handlers
	const handleAddQuestion = (ageGroupId, skillId, category) => {
		setCurrentAgeGroupId(ageGroupId)
		setCurrentSkillId(skillId)
		setCurrentQuestion({
			questionText: '',
			exampleText: '',
			category,
			options: [
				{ optionText: '', score: 0 },
				{ optionText: '', score: 0 },
			],
		})
		setShowQuestionDialog(true)
	}

	const handleSaveQuestion = () => {
		const { questionText, exampleText, category, options, index } = currentQuestion

		if (!questionText) {
			alert('Please enter question text')
			return
		}

		if (options.some((opt) => !opt.optionText)) {
			alert('Please fill all option texts')
			return
		}

		const question = { questionText, exampleText: exampleText || '', category, options }

		// Find existing entry for this age group + skill combination
		const existingEntryIndex = ageGroupQuestions.findIndex(
			(entry) =>
				entry.ageGroupId === currentAgeGroupId &&
				entry.skillId === currentSkillId,
		)

		let newAgeGroupQuestions

		if (existingEntryIndex === -1) {
			// Create new entry
			newAgeGroupQuestions = [
				...ageGroupQuestions,
				{
					ageGroupId: currentAgeGroupId,
					skillId: currentSkillId,
					questions: [question],
				},
			]
		} else {
			// Update existing entry
			newAgeGroupQuestions = ageGroupQuestions.map((entry, idx) => {
				if (idx === existingEntryIndex) {
					const updatedQuestions = [...entry.questions]
					if (typeof index === 'number') {
						// Edit existing question
						updatedQuestions[index] = question
					} else {
						// Add new question
						updatedQuestions.push(question)
					}
					return {
						...entry,
						questions: updatedQuestions,
					}
				}
				return entry
			})
		}

		setAgeGroupQuestions(newAgeGroupQuestions)
		setShowQuestionDialog(false)
		setCurrentQuestion(null)
		setCurrentAgeGroupId(null)
		setCurrentSkillId(null)
	}

	const handleDeleteQuestion = (ageGroupId, skillId, questionIndex) => {
		const newAgeGroupQuestions = ageGroupQuestions.map((entry) => {
			if (entry.ageGroupId === ageGroupId && entry.skillId === skillId) {
				return {
					...entry,
					questions: entry.questions.filter((_, i) => i !== questionIndex),
				}
			}
			return entry
		})
		setAgeGroupQuestions(newAgeGroupQuestions)
	}

	const handleEditQuestion = (ageGroupId, skillId, questionIndex) => {
		const questions = getQuestionsForAgeGroupSkill(ageGroupId, skillId)
		const question = questions[questionIndex]

		setCurrentAgeGroupId(ageGroupId)
		setCurrentSkillId(skillId)
		setCurrentQuestion({ ...question, index: questionIndex })
		setShowQuestionDialog(true)
	}

	const getQuestionsForAgeGroupSkill = (ageGroupId, skillId) => {
		const entry = ageGroupQuestions.find(
			(entry) =>
				entry.ageGroupId === ageGroupId && entry.skillId === skillId,
		)
		return entry ? entry.questions : []
	}

	const handleAddOption = () => {
		setCurrentQuestion({
			...currentQuestion,
			options: [...currentQuestion.options, { optionText: '', score: 0 }],
		})
	}

	const handleRemoveOption = (index) => {
		if (currentQuestion.options.length > 2) {
			const newOptions = currentQuestion.options.filter((_, i) => i !== index)
			setCurrentQuestion({ ...currentQuestion, options: newOptions })
		}
	}

	const handleSubmit = async () => {
		// Validation
		if (!templateName) {
			alert('Please enter template name')
			return
		}

		if (ageGroups.length === 0) {
			alert('Please add at least one age group')
			return
		}

		if (skills.length === 0) {
			alert('Please add at least one skill')
			return
		}

		const templateData = {
			templateName,
			description,
			ageGroups,
			skills,
			ageGroupQuestions,
		}

		try {
			if (isEditMode) {
				await dispatch(
					updateGandTTemplate({
						templateId,
						body: templateData,
					}),
				).unwrap()
			} else {
				await dispatch(createGandTTemplate(templateData)).unwrap()
			}
			navigate(routePaths.gandtTemplates)
		} catch (error) {
			alert(error.message || 'Failed to save template')
		}
	}

	const getTotalWeightage = () => {
		return skills.reduce((sum, skill) => sum + skill.weightage, 0)
	}

	return (
		<Box sx={{ p: 2, height: 'calc(100vh - 112px)', overflow: 'auto' }}>
			{/* Header */}
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					backgroundColor: '#F8FAFC',
					py: '10px',
					px: '12px',
					mb: 2,
					borderRadius: '8px',
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<IconButton
						onClick={() => navigate(routePaths.gandtTemplates)}
						size="small"
						sx={{ mr: 1 }}
					>
						<ArrowBackIcon fontSize="small" />
					</IconButton>
					<Typography variant="h6" sx={{ fontWeight: 600 }}>
						{isEditMode ? 'Edit Template' : 'Create New Template'}
					</Typography>
				</Box>
				<Box sx={{ display: 'flex', gap: 1 }}>
					<Button
						variant="outlined"
						onClick={() => navigate(routePaths.gandtTemplates)}
						size="small"
						sx={{ textTransform: 'none', borderRadius: '6px' }}
					>
						Cancel
					</Button>
					<Button
						variant="contained"
						startIcon={<SaveIcon />}
						onClick={handleSubmit}
						disabled={loading}
						size="small"
						sx={{ textTransform: 'none', borderRadius: '6px' }}
					>
						{isEditMode ? 'Update Template' : 'Create Template'}
					</Button>
				</Box>
			</Box>

			{/* Basic Info */}
			<Card sx={{ p: 2, mb: 2, borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
				<Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 2, color: '#1E293B' }}>
					Basic Information
				</Typography>
				<Grid container spacing={2}>
					<Grid item xs={12} md={6}>
						<TextField
							fullWidth
							label="Template Name *"
							value={templateName}
							onChange={(e) => setTemplateName(e.target.value)}
							error={!!errors.templateName}
							helperText={errors.templateName}
							size="small"
						/>
					</Grid>
					<Grid item xs={12}>
						<TextField
							fullWidth
							label="Description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							multiline
							rows={2}
							size="small"
						/>
					</Grid>
				</Grid>
			</Card>

			{/* Age Groups */}
			<Card sx={{ p: 2, mb: 2, borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						mb: 2,
					}}
				>
					<Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>
						Age Groups ({ageGroups.length})
					</Typography>
					<Button
						variant="outlined"
						startIcon={<AddIcon />}
						onClick={handleAddAgeGroup}
						size="small"
						sx={{ textTransform: 'none', borderRadius: '6px', fontSize: '12px' }}
					>
						Add Age Group
					</Button>
				</Box>

				{ageGroups.length === 0 ? (
					<Alert severity="info" sx={{ fontSize: '13px' }}>
						No age groups added. Click "Add Age Group" to create one.
					</Alert>
				) : (
					<Box sx={tableStyles.container}>
						<TableContainer sx={tableStyles.scrollWrapper}>
							<Table size="small" sx={tableStyles.table}>
								<TableHead>
									<TableRow sx={tableStyles.headerRow}>
										<TableCell sx={{ ...tableStyles.headerCell, width: '40%' }}>Title</TableCell>
										<TableCell sx={{ ...tableStyles.headerCell, width: '35%' }}>Age Range</TableCell>
										<TableCell sx={{ ...tableStyles.headerCell, width: '25%', textAlign: 'right' }}>Actions</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{ageGroups.map((group, index) => (
										<TableRow key={index} sx={tableStyles.bodyRow}>
											<TableCell sx={tableStyles.bodyCell}>
												<Typography sx={{ fontSize: '13px', fontWeight: 400 }}>
													{group.title}
												</Typography>
											</TableCell>
											<TableCell sx={tableStyles.bodyCell}>
												<Typography sx={{ fontSize: '13px', fontWeight: 400 }}>
													{group.startAge} - {group.endAge} years
												</Typography>
											</TableCell>
											<TableCell sx={{ ...tableStyles.bodyCell, textAlign: 'right' }}>
												<Tooltip title="Edit">
													<IconButton
														size="small"
														onClick={() => handleEditAgeGroup(index)}
													>
														<EditIcon fontSize="small" />
													</IconButton>
												</Tooltip>
												<Tooltip title="Delete">
													<IconButton
														size="small"
														color="error"
														onClick={() => handleDeleteAgeGroup(index)}
													>
														<DeleteIcon fontSize="small" />
													</IconButton>
												</Tooltip>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					</Box>
				)}
			</Card>

			{/* Skills */}
			<Card sx={{ p: 2, mb: 2, borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						mb: 2,
					}}
				>
					<Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>
						Skills ({skills.length})
					</Typography>
					<Button
						variant="outlined"
						startIcon={<AddIcon />}
						onClick={handleAddSkill}
						size="small"
						sx={{ textTransform: 'none', borderRadius: '6px', fontSize: '12px' }}
					>
						Add Skill
					</Button>
				</Box>

				{skills.length === 0 ? (
					<Alert severity="info" sx={{ fontSize: '13px' }}>
						No skills added. Click "Add Skill" to create one.
					</Alert>
				) : (
					<Box sx={tableStyles.container}>
						<TableContainer sx={tableStyles.scrollWrapper}>
							<Table size="small" sx={tableStyles.table}>
								<TableHead>
									<TableRow sx={tableStyles.headerRow}>
										<TableCell sx={{ ...tableStyles.headerCell, width: '50%' }}>Skill Name</TableCell>
										<TableCell sx={{ ...tableStyles.headerCell, width: '25%' }}>Points</TableCell>
										<TableCell sx={{ ...tableStyles.headerCell, width: '25%', textAlign: 'right' }}>Actions</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{skills.map((skill, skillIndex) => (
										<TableRow key={skillIndex} sx={tableStyles.bodyRow}>
											<TableCell sx={tableStyles.bodyCell}>
												<Typography sx={{ fontSize: '13px', fontWeight: 400 }}>
													{skill.skillName}
												</Typography>
											</TableCell>
											<TableCell sx={tableStyles.bodyCell}>
												<Typography sx={{ fontSize: '13px', fontWeight: 400 }}>
													{skill.weightage}
												</Typography>
											</TableCell>
											<TableCell sx={{ ...tableStyles.bodyCell, textAlign: 'right' }}>
												<Tooltip title="Edit">
													<IconButton
														size="small"
														onClick={() => handleEditSkill(skillIndex)}
													>
														<EditIcon fontSize="small" />
													</IconButton>
												</Tooltip>
												<Tooltip title="Delete">
													<IconButton
														size="small"
														color="error"
														onClick={() => handleDeleteSkill(skillIndex)}
													>
														<DeleteIcon fontSize="small" />
													</IconButton>
												</Tooltip>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					</Box>
				)}
			</Card>

			{/* Questions by Age Group */}
			{ageGroups.length > 0 && skills.length > 0 && (
				<Card sx={{ p: 2, mb: 2, borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
					<Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 2, color: '#1E293B' }}>
						Questions by Age Group
					</Typography>

					{ageGroups.map((ageGroup) => (
						<Accordion
							key={ageGroup._id || ageGroup.title}
							sx={{
								mb: 1,
								borderRadius: '6px !important',
								'&:before': { display: 'none' },
								boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
								border: '1px solid rgba(0,0,0,0.08)',
							}}
						>
							<AccordionSummary
								expandIcon={<ExpandMoreIcon />}
								sx={{ minHeight: '44px', '& .MuiAccordionSummary-content': { my: 1 } }}
							>
								<Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
									{ageGroup.title} ({ageGroup.startAge} - {ageGroup.endAge} years)
								</Typography>
							</AccordionSummary>
							<AccordionDetails sx={{ pt: 0 }}>
								{skills.map((skill) => {
									const questions = getQuestionsForAgeGroupSkill(
										ageGroup._id || ageGroup.title,
										skill._id || skill.skillName,
									)
									return (
										<Card
											key={skill._id || skill.skillName}
											variant="outlined"
											sx={{ mb: 1.5, p: 1.5, borderRadius: '6px' }}
										>
											<Box
												sx={{
													display: 'flex',
													justifyContent: 'space-between',
													alignItems: 'center',
													mb: 1.5,
												}}
											>
												<Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
													{skill.skillName}
												</Typography>
												<Box sx={{ display: 'flex', gap: 0.5 }}>
													<Button
														size="small"
														variant="outlined"
														onClick={() =>
															handleAddQuestion(
																ageGroup._id || ageGroup.title,
																skill._id || skill.skillName,
																'gifted',
															)
														}
														sx={{ textTransform: 'none', fontSize: '11px', borderRadius: '4px', py: 0.5 }}
													>
														+ Gifted
													</Button>
													<Button
														size="small"
														variant="outlined"
														onClick={() =>
															handleAddQuestion(
																ageGroup._id || ageGroup.title,
																skill._id || skill.skillName,
																'talented',
															)
														}
														sx={{ textTransform: 'none', fontSize: '11px', borderRadius: '4px', py: 0.5 }}
													>
														+ Talented
													</Button>
												</Box>
											</Box>

											{/* Questions List */}
											{questions.length > 0 ? (
												<Box>
													{questions.map((question, qIndex) => (
														<Box
															key={qIndex}
															sx={{
																p: 1.5,
																mb: 1,
																bgcolor: '#F8FAFC',
																borderRadius: '6px',
																border: '1px solid rgba(0,0,0,0.06)',
															}}
														>
															<Box
																sx={{
																	display: 'flex',
																	justifyContent: 'space-between',
																}}
															>
																<Box sx={{ flex: 1 }}>
																	<Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
																		<Typography
																			sx={{
																				fontSize: '10px',
																				bgcolor: question.category === 'gifted' ? '#DBEAFE' : '#FEF3C7',
																				color: question.category === 'gifted' ? '#1E40AF' : '#92400E',
																				px: 1,
																				py: 0.25,
																				borderRadius: '4px',
																				fontWeight: 600,
																				textTransform: 'uppercase',
																			}}
																		>
																			{question.category}
																		</Typography>
																	</Box>
																	<Typography sx={{ fontSize: '13px', fontWeight: 400, color: '#334155' }}>
																		{question.questionText}
																	</Typography>
																	{question.exampleText && (
																		<Typography
																			sx={{
																				fontSize: '12px',
																				color: '#6366F1',
																				fontStyle: 'italic',
																				mt: 0.5,
																			}}
																		>
																			Example: {question.exampleText}
																		</Typography>
																	)}
																	<Typography sx={{ fontSize: '11px', color: '#94A3B8', mt: 0.5 }}>
																		{question.options?.length || 0} options
																	</Typography>
																</Box>
																<Box sx={{ display: 'flex', gap: 0.25 }}>
																	<Tooltip title="Edit">
																		<IconButton
																			size="small"
																			onClick={() =>
																				handleEditQuestion(
																					ageGroup._id || ageGroup.title,
																					skill._id || skill.skillName,
																					qIndex,
																				)
																			}
																		>
																			<EditIcon sx={{ fontSize: 16 }} />
																		</IconButton>
																	</Tooltip>
																	<Tooltip title="Delete">
																		<IconButton
																			size="small"
																			color="error"
																			onClick={() =>
																				handleDeleteQuestion(
																					ageGroup._id || ageGroup.title,
																					skill._id || skill.skillName,
																					qIndex,
																				)
																			}
																		>
																			<DeleteIcon sx={{ fontSize: 16 }} />
																		</IconButton>
																	</Tooltip>
																</Box>
															</Box>
														</Box>
													))}
												</Box>
											) : (
												<Alert severity="info" sx={{ fontSize: '12px', py: 0.5 }}>
													No questions added for this skill.
												</Alert>
											)}
										</Card>
									)
								})}
							</AccordionDetails>
						</Accordion>
					))}
				</Card>
			)}


			{/* Age Group Dialog */}
			<Dialog
				open={showAgeGroupDialog}
				onClose={() => setShowAgeGroupDialog(false)}
				maxWidth="sm"
				fullWidth
				PaperProps={{ sx: { borderRadius: '12px' } }}
			>
				<DialogTitle sx={{ fontSize: '16px', fontWeight: 600, pb: 1 }}>
					{currentAgeGroup?.index !== undefined ? 'Edit Age Group' : 'Add Age Group'}
				</DialogTitle>
				<DialogContent>
					<Box sx={{ pt: 1 }}>
						<TextField
							fullWidth
							label="Title *"
							value={currentAgeGroup?.title || ''}
							onChange={(e) =>
								setCurrentAgeGroup({
									...currentAgeGroup,
									title: e.target.value,
								})
							}
							size="small"
							sx={{ mb: 2 }}
						/>
						<Grid container spacing={2}>
							<Grid item xs={6}>
								<TextField
									fullWidth
									type="number"
									label="Start Age *"
									value={currentAgeGroup?.startAge || ''}
									onChange={(e) =>
										setCurrentAgeGroup({
											...currentAgeGroup,
											startAge: e.target.value,
										})
									}
									size="small"
								/>
							</Grid>
							<Grid item xs={6}>
								<TextField
									fullWidth
									type="number"
									label="End Age *"
									value={currentAgeGroup?.endAge || ''}
									onChange={(e) =>
										setCurrentAgeGroup({
											...currentAgeGroup,
											endAge: e.target.value,
										})
									}
									size="small"
								/>
							</Grid>
						</Grid>
					</Box>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button
						onClick={() => setShowAgeGroupDialog(false)}
						size="small"
						sx={{ textTransform: 'none' }}
					>
						Cancel
					</Button>
					<Button
						variant="contained"
						onClick={handleSaveAgeGroup}
						size="small"
						sx={{ textTransform: 'none' }}
					>
						Save
					</Button>
				</DialogActions>
			</Dialog>

			{/* Skill Dialog */}
			<Dialog
				open={showSkillDialog}
				onClose={() => setShowSkillDialog(false)}
				maxWidth="sm"
				fullWidth
				PaperProps={{ sx: { borderRadius: '12px' } }}
			>
				<DialogTitle sx={{ fontSize: '16px', fontWeight: 600, pb: 1 }}>
					{currentSkill?.index !== undefined ? 'Edit Skill' : 'Add Skill'}
				</DialogTitle>
				<DialogContent>
					<Box sx={{ pt: 1 }}>
						<TextField
							fullWidth
							label="Skill Name *"
							value={currentSkill?.skillName || ''}
							onChange={(e) =>
								setCurrentSkill({
									...currentSkill,
									skillName: e.target.value,
								})
							}
							size="small"
							sx={{ mb: 2 }}
						/>
						<TextField
							fullWidth
							type="number"
							label="Points *"
							value={currentSkill?.weightage || ''}
							onChange={(e) =>
								setCurrentSkill({
									...currentSkill,
									weightage: e.target.value,
								})
							}
							inputProps={{ step: '0.1', min: '0' }}
							helperText="Points assigned to this skill (can be decimal)"
							size="small"
						/>
					</Box>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button
						onClick={() => setShowSkillDialog(false)}
						size="small"
						sx={{ textTransform: 'none' }}
					>
						Cancel
					</Button>
					<Button
						variant="contained"
						onClick={handleSaveSkill}
						size="small"
						sx={{ textTransform: 'none' }}
					>
						Save
					</Button>
				</DialogActions>
			</Dialog>

			{/* Question Dialog */}
			<Dialog
				open={showQuestionDialog}
				onClose={() => setShowQuestionDialog(false)}
				maxWidth="md"
				fullWidth
				PaperProps={{ sx: { borderRadius: '12px' } }}
			>
				<DialogTitle sx={{ fontSize: '16px', fontWeight: 600, pb: 1 }}>
					{currentQuestion?.index !== undefined ? 'Edit' : 'Add'}{' '}
					<Typography
						component="span"
						sx={{
							fontSize: '12px',
							bgcolor: currentQuestion?.category === 'gifted' ? '#DBEAFE' : '#FEF3C7',
							color: currentQuestion?.category === 'gifted' ? '#1E40AF' : '#92400E',
							px: 1,
							py: 0.25,
							borderRadius: '4px',
							fontWeight: 600,
							textTransform: 'uppercase',
							ml: 1,
						}}
					>
						{currentQuestion?.category}
					</Typography>{' '}
					Question
				</DialogTitle>
				<DialogContent>
					<Box sx={{ pt: 1 }}>
						<TextField
							fullWidth
							label="Question Text *"
							value={currentQuestion?.questionText || ''}
							onChange={(e) =>
								setCurrentQuestion({
									...currentQuestion,
									questionText: e.target.value,
								})
							}
							multiline
							rows={2}
							size="small"
							sx={{ mb: 2 }}
						/>

						<TextField
							fullWidth
							label="Example Text (Optional)"
							value={currentQuestion?.exampleText || ''}
							onChange={(e) =>
								setCurrentQuestion({
									...currentQuestion,
									exampleText: e.target.value,
								})
							}
							multiline
							rows={2}
							size="small"
							sx={{ mb: 2 }}
							placeholder="Add example text to be displayed in a different color"
						/>

						<Typography sx={{ fontSize: '13px', fontWeight: 600, mb: 1.5, color: '#475569' }}>
							Options (Minimum 2)
						</Typography>

						{currentQuestion?.options?.map((option, index) => (
							<Box key={index} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'center' }}>
								<TextField
									fullWidth
									label={`Option ${index + 1} *`}
									value={option.optionText}
									onChange={(e) => {
										const newOptions = currentQuestion.options.map((opt, idx) =>
											idx === index ? { ...opt, optionText: e.target.value } : opt
										)
										setCurrentQuestion({ ...currentQuestion, options: newOptions })
									}}
									size="small"
								/>
								<TextField
									type="number"
									label="Score"
									value={option.score}
									onChange={(e) => {
										const newOptions = currentQuestion.options.map((opt, idx) =>
											idx === index ? { ...opt, score: parseInt(e.target.value) || 0 } : opt
										)
										setCurrentQuestion({ ...currentQuestion, options: newOptions })
									}}
									size="small"
									sx={{ width: 100 }}
								/>
								{currentQuestion.options.length > 2 && (
									<IconButton
										size="small"
										color="error"
										onClick={() => handleRemoveOption(index)}
									>
										<DeleteIcon fontSize="small" />
									</IconButton>
								)}
							</Box>
						))}

						<Button
							variant="outlined"
							startIcon={<AddIcon />}
							onClick={handleAddOption}
							size="small"
							sx={{ textTransform: 'none', fontSize: '12px', mt: 1 }}
						>
							Add Option
						</Button>
					</Box>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button
						onClick={() => setShowQuestionDialog(false)}
						size="small"
						sx={{ textTransform: 'none' }}
					>
						Cancel
					</Button>
					<Button
						variant="contained"
						onClick={handleSaveQuestion}
						size="small"
						sx={{ textTransform: 'none' }}
					>
						Save Question
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	)
}

export default GandTTemplateForm
