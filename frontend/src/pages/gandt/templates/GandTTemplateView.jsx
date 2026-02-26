import React, { useEffect } from 'react'
import {
	Box,
	Button,
	Card,
	Typography,
	IconButton,
	Grid,
	Chip,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	List,
	ListItem,
	ListItemText,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getGandTTemplateById } from './gandtTemplateSlice'
import { routePaths } from '../../../routes/routeConstants'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const GandTTemplateView = () => {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const templateId = searchParams.get('id')

	const { selectedTemplate, loading } = useSelector(
		(state) => state.gandtTemplate,
	)

	useEffect(() => {
		if (templateId) {
			dispatch(getGandTTemplateById(templateId))
		}
	}, [templateId, dispatch])

	if (loading || !selectedTemplate) {
		return (
			<Box sx={{ p: 3 }}>
				<Typography>Loading...</Typography>
			</Box>
		)
	}

	// Helper function to get questions for age group + skill
	const getQuestionsForAgeGroupSkill = (ageGroupId, skillId) => {
		const entry = selectedTemplate.ageGroupQuestions?.find(
			(entry) =>
				entry.ageGroupId === ageGroupId && entry.skillId === skillId,
		)
		return entry ? entry.questions : []
	}

	return (
		<Box sx={{ p: 3 }}>
			{/* Header */}
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					mb: 3,
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<IconButton onClick={() => navigate(routePaths.gandtTemplates)}>
						<ArrowBackIcon />
					</IconButton>
					<Typography variant="h4" sx={{ fontWeight: 600 }}>
						{selectedTemplate.templateName}
					</Typography>
					<Chip
						label={selectedTemplate.isActive ? 'Active' : 'Inactive'}
						color={selectedTemplate.isActive ? 'success' : 'default'}
					/>
				</Box>
				<Button
					variant="contained"
					startIcon={<EditIcon />}
					onClick={() =>
						navigate(`${routePaths.gandtTemplateEdit}?id=${templateId}`)
					}
					sx={{
						background:
							'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
					}}
				>
					Edit Template
				</Button>
			</Box>

			{/* Basic Info */}
			<Card sx={{ p: 3, mb: 3 }}>
				<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
					Basic Information
				</Typography>
				<Grid container spacing={2}>
					<Grid item xs={12} md={6}>
						<Typography variant="caption" color="text.secondary">
							Template Name
						</Typography>
						<Typography variant="body1">
							{selectedTemplate.templateName}
						</Typography>
					</Grid>
					<Grid item xs={12} md={6}>
						<Typography variant="caption" color="text.secondary">
							Created By
						</Typography>
						<Typography variant="body1">
							{selectedTemplate.createdBy?.profile?.fullName || '-'}
						</Typography>
					</Grid>
					<Grid item xs={12}>
						<Typography variant="caption" color="text.secondary">
							Description
						</Typography>
						<Typography variant="body1">
							{selectedTemplate.description || '-'}
						</Typography>
					</Grid>
				</Grid>
			</Card>

			{/* Age Groups */}
			<Card sx={{ p: 3, mb: 3 }}>
				<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
					Age Groups ({selectedTemplate.ageGroups?.length || 0})
				</Typography>
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow sx={{ bgcolor: '#F5F7FA' }}>
								<TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>Age Range</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{selectedTemplate.ageGroups?.map((group, index) => (
								<TableRow key={index} hover>
									<TableCell>{group.title}</TableCell>
									<TableCell>
										{group.startAge} - {group.endAge} years
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</Card>

			{/* Skills */}
			<Card sx={{ p: 3, mb: 3 }}>
				<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
					Skills ({selectedTemplate.skills?.length || 0})
				</Typography>
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow sx={{ bgcolor: '#F5F7FA' }}>
								<TableCell sx={{ fontWeight: 600 }}>Skill Name</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>Points</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{selectedTemplate.skills?.map((skill) => (
								<TableRow key={skill._id} hover>
									<TableCell>{skill.skillName}</TableCell>
									<TableCell>{skill.weightage}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</Card>

			{/* Questions by Age Group */}
			<Card sx={{ p: 3, mb: 3 }}>
				<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
					Questions by Age Group
				</Typography>

				{selectedTemplate.ageGroups?.map((ageGroup) => {
					return (
						<Accordion key={ageGroup._id} sx={{ mb: 2 }}>
							<AccordionSummary expandIcon={<ExpandMoreIcon />}>
								<Typography sx={{ fontWeight: 600 }}>
									{ageGroup.title} ({ageGroup.startAge} - {ageGroup.endAge}{' '}
									years)
								</Typography>
							</AccordionSummary>
							<AccordionDetails>
								{selectedTemplate.skills?.map((skill) => {
									const questions = getQuestionsForAgeGroupSkill(
										ageGroup._id,
										skill._id,
									)
									const giftedQuestions = questions.filter(
										(q) => q.category === 'gifted',
									)
									const talentedQuestions = questions.filter(
										(q) => q.category === 'talented',
									)

									return (
										<Box key={skill._id} sx={{ mb: 3 }}>
											<Typography
												variant="subtitle1"
												sx={{ mb: 2, fontWeight: 600 }}
											>
												{skill.skillName} (Points: {skill.weightage})
											</Typography>

											{/* Gifted Questions */}
											<Box sx={{ mb: 2, pl: 2 }}>
												<Typography
													variant="subtitle2"
													sx={{ mb: 1, fontWeight: 600 }}
												>
													Gifted Questions ({giftedQuestions.length})
												</Typography>
												{giftedQuestions.length > 0 ? (
													<List>
														{giftedQuestions.map((question, qIndex) => (
															<ListItem
																key={question._id || qIndex}
																sx={{
																	bgcolor: '#F5F7FA',
																	mb: 1,
																	borderRadius: 1,
																	flexDirection: 'column',
																	alignItems: 'flex-start',
																}}
															>
																<Typography
																	variant="body2"
																	sx={{ mb: 1 }}
																>
																	{qIndex + 1}. {question.questionText}
																</Typography>
																{question.exampleText && (
																	<Typography
																		variant="body2"
																		sx={{
																			mb: 1,
																			color: '#667eea',
																			fontStyle: 'italic',
																			pl: 2,
																		}}
																	>
																		Example: {question.exampleText}
																	</Typography>
																)}
																<Box sx={{ pl: 2 }}>
																	{question.options?.map(
																		(opt, oIndex) => (
																			<Typography
																				key={oIndex}
																				variant="caption"
																				display="block"
																				color="text.secondary"
																			>
																				{String.fromCharCode(
																					97 + oIndex,
																				)}
																				) {opt.optionText} (Score:{' '}
																				{opt.score})
																			</Typography>
																		),
																	)}
																</Box>
															</ListItem>
														))}
													</List>
												) : (
													<Typography
														variant="body2"
														color="text.secondary"
														sx={{ pl: 2 }}
													>
														No gifted questions added
													</Typography>
												)}
											</Box>

											{/* Talented Questions */}
											<Box sx={{ pl: 2 }}>
												<Typography
													variant="subtitle2"
													sx={{ mb: 1, fontWeight: 600 }}
												>
													Talented Questions ({talentedQuestions.length})
												</Typography>
												{talentedQuestions.length > 0 ? (
													<List>
														{talentedQuestions.map((question, qIndex) => (
															<ListItem
																key={question._id || qIndex}
																sx={{
																	bgcolor: '#F5F7FA',
																	mb: 1,
																	borderRadius: 1,
																	flexDirection: 'column',
																	alignItems: 'flex-start',
																}}
															>
																<Typography
																	variant="body2"
																	sx={{ mb: 1 }}
																>
																	{qIndex + 1}. {question.questionText}
																</Typography>
																{question.exampleText && (
																	<Typography
																		variant="body2"
																		sx={{
																			mb: 1,
																			color: '#667eea',
																			fontStyle: 'italic',
																			pl: 2,
																		}}
																	>
																		Example: {question.exampleText}
																	</Typography>
																)}
																<Box sx={{ pl: 2 }}>
																	{question.options?.map(
																		(opt, oIndex) => (
																			<Typography
																				key={oIndex}
																				variant="caption"
																				display="block"
																				color="text.secondary"
																			>
																				{String.fromCharCode(
																					97 + oIndex,
																				)}
																				) {opt.optionText} (Score:{' '}
																				{opt.score})
																			</Typography>
																		),
																	)}
																</Box>
															</ListItem>
														))}
													</List>
												) : (
													<Typography
														variant="body2"
														color="text.secondary"
														sx={{ pl: 2 }}
													>
														No talented questions added
													</Typography>
												)}
											</Box>
										</Box>
									)
								})}
							</AccordionDetails>
						</Accordion>
					)
				})}
			</Card>
		</Box>
	)
}

export default GandTTemplateView
