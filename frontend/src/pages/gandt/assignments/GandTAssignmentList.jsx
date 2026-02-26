import React, { useEffect, useState } from 'react'
import {
	Box,
	Button,
	IconButton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TablePagination,
	TextField,
	Typography,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Autocomplete,
	Tooltip,
} from '@mui/material'
import { counsellorStyles } from '../../counsellors/counsellorsStyles'
import { tableStyles } from '../../../components/styles/tableStyles'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
	fetchGandTAssignments,
	createGandTAssignment,
	updateGandTAssignment,
	deleteGandTAssignment,
} from './gandtAssignmentThunk'
import { setCurrentPage, setPageSize } from './gandtAssignmentSlice'
import { fetchGandTTemplatesThunk } from '../templates/gandtTemplateThunk'
import { getSchoolsList } from '../../../redux/commonSlice'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SearchIcon from '@mui/icons-material/Search'

const GandTAssignmentList = () => {
	const dispatch = useDispatch()
	const navigate = useNavigate()

	const { allAssignments, totalCount, currentPage, pageSize, loading } =
		useSelector((state) => state.gandtAssignment)

	const [searchText, setSearchText] = useState('')
	const [createDialogOpen, setCreateDialogOpen] = useState(false)
	const [editDialogOpen, setEditDialogOpen] = useState(false)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [assignmentToDelete, setAssignmentToDelete] = useState(null)
	const [assignmentToEdit, setAssignmentToEdit] = useState(null)

	// Form state
	const [selectedSchool, setSelectedSchool] = useState(null)
	const [selectedTemplate, setSelectedTemplate] = useState(null)
	const [schools, setSchools] = useState([])
	const [templates, setTemplates] = useState([])
	const [schoolSearchText, setSchoolSearchText] = useState('')
	const [loadingSchools, setLoadingSchools] = useState(false)
	const [loadingTemplates, setLoadingTemplates] = useState(false)

	useEffect(() => {
		fetchAssignments()
	}, [currentPage, pageSize])

	useEffect(() => {
		// Fetch templates when dialog opens
		if (createDialogOpen || editDialogOpen) {
			fetchTemplates()
		}
	}, [createDialogOpen, editDialogOpen])

	// Fetch schools when user types
	useEffect(() => {
		if (schoolSearchText.length >= 2) {
			const delayDebounce = setTimeout(() => {
				fetchSchools(schoolSearchText)
			}, 500) // Debounce for 500ms
			return () => clearTimeout(delayDebounce)
		} else {
			setSchools([])
		}
	}, [schoolSearchText])

	const fetchAssignments = () => {
		dispatch(
			fetchGandTAssignments({
				page: currentPage,
				pageSize: pageSize,
				filter: {
					searchText: searchText,
				},
			}),
		)
	}

	const fetchSchools = async (searchText) => {
		try {
			setLoadingSchools(true)
			const schoolsResponse = await dispatch(
				getSchoolsList({
					body: {
						page: 1,
						pageSize: 50,
						searchText: searchText, // searchText at root level, not in filter
					},
				}),
			)
			// The response structure is response.payload directly
			if (schoolsResponse.payload) {
				setSchools(schoolsResponse.payload)
			}
		} catch (error) {
			console.error('Error fetching schools:', error)
		} finally {
			setLoadingSchools(false)
		}
	}

	const fetchTemplates = async () => {
		try {
			setLoadingTemplates(true)
			const templatesData = await fetchGandTTemplatesThunk({
				page: 1,
				pageSize: 100,
				filter: { isActive: true },
			})
			if (templatesData?.templates) {
				setTemplates(templatesData.templates)
			}
		} catch (error) {
			console.error('Error fetching templates:', error)
		} finally {
			setLoadingTemplates(false)
		}
	}

	const handleSearch = () => {
		dispatch(setCurrentPage(1))
		fetchAssignments()
	}

	const handlePageChange = (event, newPage) => {
		dispatch(setCurrentPage(newPage + 1))
	}

	const handlePageSizeChange = (event) => {
		dispatch(setPageSize(parseInt(event.target.value, 10)))
		dispatch(setCurrentPage(1))
	}

	const handleCreateDialogOpen = () => {
		setSelectedSchool(null)
		setSelectedTemplate(null)
		setSchoolSearchText('')
		setSchools([])
		setCreateDialogOpen(true)
	}

	const handleCreateDialogClose = () => {
		setCreateDialogOpen(false)
		setSelectedSchool(null)
		setSelectedTemplate(null)
		setSchoolSearchText('')
		setSchools([])
	}

	const handleCreateAssignment = async () => {
		if (!selectedSchool || !selectedTemplate) {
			return
		}

		const data = {
			schoolId: selectedSchool._id,
			templateId: selectedTemplate._id,
		}

		const result = await dispatch(createGandTAssignment(data))
		if (!result.error) {
			handleCreateDialogClose()
			fetchAssignments()
		}
	}

	const handleEditClick = (assignment) => {
		setAssignmentToEdit(assignment)
		setSelectedSchool(assignment.school)
		setSelectedTemplate(assignment.template)
		setEditDialogOpen(true)
	}

	const handleEditDialogClose = () => {
		setEditDialogOpen(false)
		setAssignmentToEdit(null)
		setSelectedSchool(null)
		setSelectedTemplate(null)
		setSchoolSearchText('')
		setSchools([])
	}

	const handleUpdateAssignment = async () => {
		if (!selectedSchool || !selectedTemplate || !assignmentToEdit) {
			return
		}

		const data = {
			schoolId: selectedSchool._id,
			templateId: selectedTemplate._id,
		}

		const result = await dispatch(
			updateGandTAssignment({
				assignmentId: assignmentToEdit._id,
				data,
			}),
		)
		if (!result.error) {
			handleEditDialogClose()
			fetchAssignments()
		}
	}

	const handleDeleteClick = (assignment) => {
		setAssignmentToDelete(assignment)
		setDeleteDialogOpen(true)
	}

	const handleDeleteConfirm = async () => {
		if (assignmentToDelete) {
			await dispatch(deleteGandTAssignment(assignmentToDelete._id))
			setDeleteDialogOpen(false)
			setAssignmentToDelete(null)
			fetchAssignments()
		}
	}

	return (
		<Box sx={counsellorStyles.pageContainerSx}>
			{/* Header */}
			<Box sx={counsellorStyles.toolbarSx}>
				<Typography variant="h6" sx={{ fontWeight: 600 }}>
					Template Assignments
				</Typography>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<TextField
						placeholder="Search by school or template name..."
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						onKeyPress={(e) => {
							if (e.key === 'Enter') handleSearch()
						}}
						size="small"
						sx={counsellorStyles.searchFieldSx}
						InputProps={{
							startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 18 }} />,
						}}
					/>
					<Button
						variant="contained"
						color="primary"
						startIcon={<AddIcon />}
						onClick={handleCreateDialogOpen}
						sx={counsellorStyles.addButtonSx}
					>
						Create Assignment
					</Button>
				</Box>
			</Box>

			{/* Table */}
			<Box sx={{ ...tableStyles.container, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
				<TableContainer
					sx={{
						flex: 1,
						minHeight: 0,
						overflow: 'auto',
						...tableStyles.scrollWrapper,
					}}
				>
					<Table stickyHeader sx={tableStyles.table}>
						<TableHead>
							<TableRow sx={tableStyles.headerRow}>
								<TableCell sx={{ ...tableStyles.headerCell, width: '40%' }}>School Name</TableCell>
								<TableCell sx={{ ...tableStyles.headerCell, width: '40%' }}>Template Name</TableCell>
								<TableCell sx={{ ...tableStyles.headerCell, width: '20%', textAlign: 'center' }}>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody sx={{ '& .MuiTableCell-root': { fontWeight: 'normal' } }}>
							{loading ? (
								<TableRow>
									<TableCell colSpan={3} align="center" sx={{ py: 8 }}>
										Loading...
									</TableCell>
								</TableRow>
							) : allAssignments.length === 0 ? (
								<TableRow>
									<TableCell colSpan={3} sx={{ border: 'none' }}>
										<Box sx={{ ...tableStyles.emptyState, flex: 1 }}>
											<Typography sx={tableStyles.emptyStateTitle}>
												No assignments found
											</Typography>
											<Typography sx={tableStyles.emptyStateSubtitle}>
												Create a new assignment to get started
											</Typography>
										</Box>
									</TableCell>
								</TableRow>
							) : (
								allAssignments.map((assignment) => (
									<TableRow key={assignment._id} sx={tableStyles.bodyRow}>
										<TableCell sx={tableStyles.bodyCell}>
											<Typography sx={{ fontSize: '13px', fontWeight: 400 }}>
												{assignment.school?.school || '-'}
											</Typography>
										</TableCell>
										<TableCell sx={tableStyles.bodyCell}>
											<Typography sx={{ fontSize: '13px', fontWeight: 400 }}>
												{assignment.template?.templateName || '-'}
											</Typography>
										</TableCell>
										<TableCell sx={{ ...tableStyles.bodyCell, textAlign: 'center' }}>
											<Tooltip title="Edit">
												<IconButton
													size="small"
													onClick={() => handleEditClick(assignment)}
													color="primary"
												>
													<EditIcon fontSize="small" />
												</IconButton>
											</Tooltip>
											<Tooltip title="Delete">
												<IconButton
													size="small"
													onClick={() => handleDeleteClick(assignment)}
													color="error"
												>
													<DeleteIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</TableContainer>
				<Box sx={tableStyles.footer}>
					<Box />
					<TablePagination
						component="div"
						count={totalCount}
						page={currentPage - 1}
						onPageChange={handlePageChange}
						rowsPerPage={pageSize}
						onRowsPerPageChange={handlePageSizeChange}
						rowsPerPageOptions={[5, 10, 25, 50]}
						sx={{
							'.MuiTablePagination-toolbar': { minHeight: '36px' },
							'.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontSize: '13px' },
						}}
					/>
				</Box>
			</Box>

			{/* Create Assignment Dialog */}
			<Dialog
				open={createDialogOpen}
				onClose={handleCreateDialogClose}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle
					sx={{
						fontSize: '20px',
						fontWeight: 600,
						pb: 2,
					}}
				>
					Create Template Assignment
				</DialogTitle>
				<DialogContent sx={{ pt: 2 }}>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
						<Autocomplete
							options={schools}
							getOptionLabel={(option) => option.school || ''}
							value={selectedSchool}
							onChange={(event, newValue) => {
								setSelectedSchool(newValue)
							}}
							onInputChange={(event, newInputValue) => {
								setSchoolSearchText(newInputValue)
							}}
							isOptionEqualToValue={(option, value) =>
								option._id === value._id
							}
							filterOptions={(x) => x} // Disable default filtering since we're doing server-side search
							renderInput={(params) => (
								<TextField
									{...params}
									label="Select School"
									placeholder="Type at least 2 characters to search..."
									required
									helperText={
										schoolSearchText.length > 0 &&
										schoolSearchText.length < 2
											? 'Type at least 2 characters'
											: ''
									}
								/>
							)}
							loading={loadingSchools}
							loadingText="Searching schools..."
							noOptionsText={
								schoolSearchText.length < 2
									? 'Type at least 2 characters to search'
									: 'No schools found'
							}
						/>
						<Autocomplete
							options={templates}
							getOptionLabel={(option) =>
								option.templateName || ''
							}
							value={selectedTemplate}
							onChange={(event, newValue) => {
								setSelectedTemplate(newValue)
							}}
							filterOptions={(options, { inputValue }) => {
								return options.filter((option) =>
									option.templateName
										?.toLowerCase()
										.includes(inputValue.toLowerCase()),
								)
							}}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Select Template"
									placeholder="Search and choose a G&T template"
									required
								/>
							)}
							loading={loadingTemplates}
							loadingText="Loading templates..."
							noOptionsText="No active templates found"
						/>
					</Box>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button onClick={handleCreateDialogClose} color="inherit">
						Cancel
					</Button>
					<Button
						onClick={handleCreateAssignment}
						variant="contained"
						color="primary"
						disabled={!selectedSchool || !selectedTemplate}
					>
						Create Assignment
					</Button>
				</DialogActions>
			</Dialog>

			{/* Edit Assignment Dialog */}
			<Dialog
				open={editDialogOpen}
				onClose={handleEditDialogClose}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle
					sx={{
						fontSize: '20px',
						fontWeight: 600,
						pb: 2,
					}}
				>
					Edit Template Assignment
				</DialogTitle>
				<DialogContent sx={{ pt: 2 }}>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
						<Autocomplete
							options={schools}
							getOptionLabel={(option) => option.school || ''}
							value={selectedSchool}
							onChange={(event, newValue) => {
								setSelectedSchool(newValue)
							}}
							onInputChange={(event, newInputValue) => {
								setSchoolSearchText(newInputValue)
							}}
							isOptionEqualToValue={(option, value) =>
								option._id === value._id
							}
							filterOptions={(x) => x}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Select School"
									placeholder="Type at least 2 characters to search..."
									required
									helperText={
										schoolSearchText.length > 0 &&
										schoolSearchText.length < 2
											? 'Type at least 2 characters'
											: ''
									}
								/>
							)}
							loading={loadingSchools}
							loadingText="Searching schools..."
							noOptionsText={
								schoolSearchText.length < 2
									? 'Type at least 2 characters to search'
									: 'No schools found'
							}
						/>
						<Autocomplete
							options={templates}
							getOptionLabel={(option) =>
								option.templateName || ''
							}
							value={selectedTemplate}
							onChange={(event, newValue) => {
								setSelectedTemplate(newValue)
							}}
							filterOptions={(options, { inputValue }) => {
								return options.filter((option) =>
									option.templateName
										?.toLowerCase()
										.includes(inputValue.toLowerCase()),
								)
							}}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Select Template"
									placeholder="Search and choose a G&T template"
									required
								/>
							)}
							loading={loadingTemplates}
							loadingText="Loading templates..."
							noOptionsText="No active templates found"
						/>
					</Box>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button onClick={handleEditDialogClose} color="inherit">
						Cancel
					</Button>
					<Button
						onClick={handleUpdateAssignment}
						variant="contained"
						color="primary"
						disabled={!selectedSchool || !selectedTemplate}
					>
						Update Assignment
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
			>
				<DialogTitle>Confirm Delete</DialogTitle>
				<DialogContent>
					Are you sure you want to delete the assignment for "
					{assignmentToDelete?.school?.school}" with template "
					{assignmentToDelete?.template?.templateName}"?
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)}>
						Cancel
					</Button>
					<Button
						onClick={handleDeleteConfirm}
						color="error"
						variant="contained"
					>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	)
}

export default GandTAssignmentList
