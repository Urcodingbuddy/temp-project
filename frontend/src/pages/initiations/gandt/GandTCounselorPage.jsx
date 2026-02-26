import React, { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	Box,
	Typography,
	Alert,
	CircularProgress,
	Grid,
	MenuItem,
	Button,
	Chip,
	FormControl,
	InputLabel,
	Select,
	Card,
	Dialog,
	DialogTitle,
	DialogContent,
	TextField,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	IconButton,
	InputAdornment,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { counsellorStyles } from '../../counsellors/counsellorsStyles'
import { tableStyles } from '../../../components/styles/tableStyles'
import {
	checkSchoolTemplate,
	getStudentsWithStatus,
	resetTemplateCheck,
	resetStudentsList,
	resetState,
} from './gandtCounselorSlice'
import { getSchoolsList, getAllClassrooms } from '../../../redux/commonSlice'
import { fetchCommonMiscellaneousData } from '../../dashboard/dasboardSlice'
import StudentListTable from './StudentListTable'
import StudentDetailDialog from './StudentDetailDialog'
import AssessmentFormDialog from './AssessmentFormDialog'
import { getUserFromLocalStorage, getCurrentAcademicYearId } from '../../../utils/utils'

const GandTCounselorPage = () => {
	const dispatch = useDispatch()
	const user = getUserFromLocalStorage()

	// Redux state
	const {
		hasTemplate,
		templateInfo,
		templateCheckMessage,
		loading,
		studentsLoading,
		error,
	} = useSelector((state) => state.gandtCounselor)

	const { schoolsList, classroomsList } = useSelector((state) => state.commonData)
	const { academicYears } = useSelector((state) => state.dashboardSliceSetup)

	// Debug: Log schoolsList when it changes
	useEffect(() => {
		console.log('G&T - schoolsList:', schoolsList)
		console.log('G&T - schoolsList length:', schoolsList?.length)
	}, [schoolsList])

	// Local state
	const [selectedSchool, setSelectedSchool] = useState(null)
	const [selectedClassroom, setSelectedClassroom] = useState(null)
	const [selectedSection, setSelectedSection] = useState(null)
	const [filteredClassrooms, setFilteredClassrooms] = useState([])
	const [sections, setSections] = useState([])
	const [showStudentList, setShowStudentList] = useState(false)

	// Dialog states
	const [studentDetailDialogOpen, setStudentDetailDialogOpen] = useState(false)
	const [assessmentFormDialogOpen, setAssessmentFormDialogOpen] = useState(false)
	const [selectedStudent, setSelectedStudent] = useState(null)
	const [schoolDialogOpen, setSchoolDialogOpen] = useState(false)
	const [schoolSearchText, setSchoolSearchText] = useState('')

	// Load academic years if not already loaded
	useEffect(() => {
		if (!academicYears || academicYears.length === 0) {
			dispatch(fetchCommonMiscellaneousData())
		}
	}, [dispatch, academicYears])

	// Load schools and classrooms when academic years are available
	useEffect(() => {
		if (academicYears && academicYears.length > 0) {
			// Get current academic year ID from the list
			const currentAcademicYearId = getCurrentAcademicYearId(academicYears)

			if (currentAcademicYearId) {
				// Load schools list with current academic year (required by backend)
				// Must use filter object wrapper like CommonBarFilter does
				const body = {
					filter: { academicYear: [currentAcademicYearId] }
				}
				dispatch(getSchoolsList({ body }))
				// Load all classrooms with current academic year
				dispatch(getAllClassrooms({ body }))
			}
		}
	}, [dispatch, academicYears])

	// Reset state on component unmount
	useEffect(() => {
		return () => {
			dispatch(resetState())
		}
	}, [dispatch])

	// Handle school selection
	const handleSchoolChange = (schoolId) => {
		// Find the school object from the id
		const school = schoolsList.find((s) => s._id === schoolId)
		setSelectedSchool(school)
		setSelectedClassroom(null)
		setSelectedSection(null)
		setShowStudentList(false)
		dispatch(resetTemplateCheck())
		dispatch(resetStudentsList())

		if (school) {
			// Check if template is assigned to this school
			dispatch(checkSchoolTemplate(school._id))

			// Filter classrooms for this school
			const schoolClassrooms = classroomsList.filter(
				(classroom) => classroom.school === school._id,
			)
			setFilteredClassrooms(schoolClassrooms)
		} else {
			setFilteredClassrooms([])
		}
	}

	// Handle classroom (class) selection
	const handleClassroomChange = (event) => {
		const classroomId = event.target.value
		const classroom = filteredClassrooms.find((c) => c._id === classroomId)
		console.log('G&T - Selected classroom ID:', classroomId)
		console.log('G&T - Found classroom:', classroom)
		console.log('G&T - All filtered classrooms:', filteredClassrooms)

		setSelectedClassroom(classroom)
		setSelectedSection(null)
		setShowStudentList(false)
		dispatch(resetStudentsList())

		// Extract unique sections from the same class
		if (classroom) {
			const sameSections = filteredClassrooms.filter(
				(c) => c.className === classroom.className,
			)
			console.log('G&T - Sections for class', classroom.className, ':', sameSections)
			setSections(sameSections)
		} else {
			setSections([])
		}
	}

	// Handle section selection
	const handleSectionChange = (event) => {
		const sectionId = event.target.value
		const section = sections.find((s) => s._id === sectionId)
		setSelectedSection(section)
		setShowStudentList(false)
		dispatch(resetStudentsList())
	}

	// Load students when all selections are made
	const handleLoadStudents = () => {
		if (selectedSchool && selectedSection) {
			dispatch(
				getStudentsWithStatus({
					schoolId: selectedSchool._id,
					classroomId: selectedSection._id,
				}),
			)
			setShowStudentList(true)
		}
	}

	// Handle student row click
	const handleStudentClick = (student) => {
		setSelectedStudent(student)
		setStudentDetailDialogOpen(true)
	}

	// Handle start new assessment
	const handleStartNewAssessment = (student) => {
		setSelectedStudent(student)
		setAssessmentFormDialogOpen(true)
	}

	// Prepare school options for autocomplete (CustomAutocompleteNew expects 'id' not '_id')
	// Filter out any invalid schools and ensure they have both _id and school name
	// Note: API returns 'school' property for school name, not 'schoolName'
	// Use useMemo to prevent infinite loops
	const schoolOptions = useMemo(() => {
		return schoolsList
			.filter((school) => school && school._id && (school.school || school.schoolName))
			.map((school) => ({
				label: school.school || school.schoolName,
				id: school._id,
			}))
	}, [schoolsList])

	// Debug: Log school options - only when schoolsList changes
	useEffect(() => {
		console.log('G&T - schoolsList:', schoolsList)
		console.log('G&T - schoolsList length:', schoolsList?.length)
		console.log('G&T - schoolOptions:', schoolOptions)
		console.log('G&T - schoolOptions length:', schoolOptions?.length)
		// Log first school to see data structure
		if (schoolOptions.length > 0) {
			console.log('G&T - First school option:', schoolOptions[0])
		}
		if (schoolsList.length > 0) {
			console.log('G&T - First school from Redux:', schoolsList[0])
		}
	}, [schoolsList, schoolOptions])

	// Prepare classroom options (unique class names)
	const uniqueClasses = [
		...new Map(
			filteredClassrooms.map((classroom) => [classroom.className, classroom]),
		).values(),
	]

	// Filter schools based on search text in dialog
	const filteredSchoolOptions = useMemo(() => {
		if (!schoolSearchText) return schoolOptions
		return schoolOptions.filter((school) =>
			school.label.toLowerCase().includes(schoolSearchText.toLowerCase())
		)
	}, [schoolOptions, schoolSearchText])

	// Handle school selection from dialog
	const handleSchoolSelect = (schoolId) => {
		handleSchoolChange(schoolId)
		setSchoolDialogOpen(false)
		setSchoolSearchText('')
	}

	return (
		<Box sx={counsellorStyles.pageContainerSx}>
			{/* Header */}
			<Box sx={counsellorStyles.toolbarSx}>
				<Box>
					<Typography variant="h6" sx={{ fontWeight: 600 }}>
						G&T Assessment
					</Typography>
					<Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
						Assess students for Gifted and Talented programs
					</Typography>
				</Box>
			</Box>

			{/* Main Content */}
			<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'auto' }}>
				{/* Filters Card */}
				<Card sx={{ p: 2, mb: 2, borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
					<Grid container spacing={2} alignItems="center">
						<Grid item xs={12} sm={6} md={3}>
							<Box
								onClick={() => setSchoolDialogOpen(true)}
								sx={{
									height: '40px',
									border: '1px solid rgba(0, 0, 0, 0.23)',
									borderRadius: '6px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									px: 1.5,
									cursor: 'pointer',
									bgcolor: '#fff',
									'&:hover': {
										borderColor: 'rgba(0, 0, 0, 0.87)',
									},
								}}
							>
								<Typography
									sx={{
										fontSize: '13px',
										fontWeight: 400,
										color: selectedSchool ? '#1E293B' : '#9CA3AF',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
									}}
								>
									{selectedSchool?.school || selectedSchool?.schoolName || 'Select School *'}
								</Typography>
								<KeyboardArrowDownIcon sx={{ fontSize: 20, color: '#9CA3AF' }} />
							</Box>
						</Grid>

						{hasTemplate && (
							<>
								<Grid item xs={12} sm={6} md={3}>
									<FormControl fullWidth size="small">
										<InputLabel sx={{ fontSize: '13px' }}>Select Class *</InputLabel>
										<Select
											value={selectedClassroom?._id || ''}
											onChange={handleClassroomChange}
											disabled={!hasTemplate || uniqueClasses.length === 0}
											label="Select Class *"
											sx={{
												height: '40px',
												fontSize: '13px',
												fontWeight: 400,
												'& .MuiSelect-select': { fontWeight: 400 },
											}}
											MenuProps={{
												PaperProps: {
													sx: { '& .MuiMenuItem-root': { fontSize: '13px', fontWeight: 400, py: 1 } }
												}
											}}
										>
											<MenuItem value="" disabled>Select Class</MenuItem>
											{uniqueClasses.map((classroom) => (
												<MenuItem key={classroom._id} value={classroom._id}>
													{classroom.className}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Grid>

								<Grid item xs={12} sm={6} md={3}>
									<FormControl fullWidth size="small">
										<InputLabel sx={{ fontSize: '13px' }}>Select Section *</InputLabel>
										<Select
											value={selectedSection?._id || ''}
											onChange={handleSectionChange}
											disabled={!selectedClassroom || sections.length === 0}
											label="Select Section *"
											sx={{
												height: '40px',
												fontSize: '13px',
												fontWeight: 400,
												'& .MuiSelect-select': { fontWeight: 400 },
											}}
											MenuProps={{
												PaperProps: {
													sx: { '& .MuiMenuItem-root': { fontSize: '13px', fontWeight: 400, py: 1 } }
												}
											}}
										>
											<MenuItem value="" disabled>Select Section</MenuItem>
											{sections && sections.length > 0 ? (
												sections.map((section) => (
													<MenuItem key={section._id} value={section._id}>
														{section.section}
													</MenuItem>
												))
											) : null}
										</Select>
									</FormControl>
								</Grid>

								<Grid item xs={12} sm={6} md={3}>
									<Button
										variant="contained"
										color="primary"
										onClick={handleLoadStudents}
										disabled={!selectedSection}
										fullWidth
										size="small"
										sx={{ height: '40px', textTransform: 'none', borderRadius: '6px', fontSize: '13px' }}
									>
										Load Students
									</Button>
								</Grid>
							</>
						)}
					</Grid>

					{/* Template Check Status */}
					{loading && (
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
							<CircularProgress size={16} />
							<Typography sx={{ fontSize: '13px' }}>Checking template...</Typography>
						</Box>
					)}

					{selectedSchool && !loading && !hasTemplate && (
						<Alert severity="warning" sx={{ mt: 2, fontSize: '13px' }}>
							{templateCheckMessage || 'Please contact admin to assign a G&T template for this school.'}
						</Alert>
					)}

					{selectedSchool && !loading && hasTemplate && templateInfo && (
						<Box sx={{ mt: 2, p: 1.5, bgcolor: '#F0FDF4', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
								<Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#166534' }}>
									Template: {templateInfo.templateName}
								</Typography>
								{templateInfo.ageGroups && templateInfo.ageGroups.length > 0 && (
									<Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
										{templateInfo.ageGroups.map((ag) => (
											<Chip
												key={ag._id}
												label={`${ag.title} (${ag.startAge}-${ag.endAge}y)`}
												size="small"
												sx={{ fontSize: '11px', height: '22px', bgcolor: '#DCFCE7', color: '#166534' }}
											/>
										))}
									</Box>
								)}
							</Box>
						</Box>
					)}
				</Card>

				{/* Students List */}
				{studentsLoading && (
					<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
						<CircularProgress size={32} />
					</Box>
				)}

				{showStudentList && !studentsLoading && (
					<StudentListTable
						onStudentClick={handleStudentClick}
						onStartAssessment={handleStartNewAssessment}
					/>
				)}

				{!showStudentList && !studentsLoading && !loading && (
					<Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
							{!selectedSchool
								? 'Select a school to get started'
								: !hasTemplate
								? 'No template assigned to this school'
								: !selectedSection
								? 'Select class and section, then click "Load Students"'
								: ''}
						</Typography>
					</Box>
				)}

				{/* Error Display */}
				{error && (
					<Alert severity="error" sx={{ mt: 2, fontSize: '13px' }}>
						{error}
					</Alert>
				)}
			</Box>

			{/* School Selection Dialog */}
			<Dialog
				open={schoolDialogOpen}
				onClose={() => {
					setSchoolDialogOpen(false)
					setSchoolSearchText('')
				}}
				maxWidth="sm"
				fullWidth
				PaperProps={{ sx: { borderRadius: '12px', maxHeight: '70vh' } }}
			>
				<DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
					<Typography sx={{ fontSize: '16px', fontWeight: 600 }}>Select School</Typography>
					<IconButton
						size="small"
						onClick={() => {
							setSchoolDialogOpen(false)
							setSchoolSearchText('')
						}}
					>
						<CloseIcon fontSize="small" />
					</IconButton>
				</DialogTitle>
				<DialogContent sx={{ p: 0 }}>
					{/* Search Bar */}
					<Box sx={{ px: 2, pb: 1.5 }}>
						<TextField
							fullWidth
							placeholder="Search school..."
							value={schoolSearchText}
							onChange={(e) => setSchoolSearchText(e.target.value)}
							size="small"
							autoFocus
							sx={{
								'& .MuiOutlinedInput-root': {
									height: '40px',
									fontSize: '13px',
									borderRadius: '6px',
								},
							}}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon sx={{ fontSize: 18, color: '#9CA3AF' }} />
									</InputAdornment>
								),
							}}
						/>
					</Box>

					{/* Schools List */}
					<List sx={{ maxHeight: '400px', overflow: 'auto', pt: 0 }}>
						{filteredSchoolOptions.length === 0 ? (
							<ListItem>
								<ListItemText
									primary="No schools found"
									primaryTypographyProps={{ sx: { fontSize: '13px', color: '#64748B', textAlign: 'center' } }}
								/>
							</ListItem>
						) : (
							filteredSchoolOptions.map((school) => (
								<ListItem key={school.id} disablePadding>
									<ListItemButton
										onClick={() => handleSchoolSelect(school.id)}
										selected={selectedSchool?._id === school.id}
										sx={{
											py: 1.5,
											px: 2,
											'&.Mui-selected': {
												bgcolor: '#EFF6FF',
												'&:hover': { bgcolor: '#DBEAFE' },
											},
											'&:hover': { bgcolor: '#F8FAFC' },
										}}
									>
										<ListItemText
											primary={school.label}
											primaryTypographyProps={{
												sx: {
													fontSize: '13px',
													fontWeight: selectedSchool?._id === school.id ? 500 : 400,
													color: '#1E293B',
												},
											}}
										/>
									</ListItemButton>
								</ListItem>
							))
						)}
					</List>
				</DialogContent>
			</Dialog>

			{/* Student Detail Dialog */}
			{selectedStudent && (
				<StudentDetailDialog
					open={studentDetailDialogOpen}
					onClose={() => {
						setStudentDetailDialogOpen(false)
						setSelectedStudent(null)
					}}
					student={selectedStudent}
					onStartNewAssessment={() => {
						setStudentDetailDialogOpen(false)
						setAssessmentFormDialogOpen(true)
					}}
				/>
			)}

			{/* Assessment Form Dialog */}
			{selectedStudent && templateInfo && (
				<AssessmentFormDialog
					open={assessmentFormDialogOpen}
					onClose={() => {
						setAssessmentFormDialogOpen(false)
						setSelectedStudent(null)
					}}
					student={selectedStudent}
					school={selectedSchool}
					classroom={selectedSection}
					template={templateInfo}
					onAssessmentSaved={() => {
						// Reload students list to update status
						if (selectedSchool && selectedSection) {
							dispatch(
								getStudentsWithStatus({
									schoolId: selectedSchool._id,
									classroomId: selectedSection._id,
								}),
							)
						}
					}}
				/>
			)}
		</Box>
	)
}

export default GandTCounselorPage
