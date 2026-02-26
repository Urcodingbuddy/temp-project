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
	Chip,
	Tooltip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
	fetchGandTTemplates,
	deleteGandTTemplate,
	toggleGandTTemplateStatus,
	setCurrentPage,
	setPageSize,
} from './gandtTemplateSlice'
import { routePaths } from '../../../routes/routeConstants'
import { counsellorStyles } from '../../counsellors/counsellorsStyles'
import { tableStyles } from '../../../components/styles/tableStyles'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import ToggleOffIcon from '@mui/icons-material/ToggleOff'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'

const GandTTemplateList = () => {
	const dispatch = useDispatch()
	const navigate = useNavigate()

	const { allTemplates, totalCount, currentPage, pageSize, loading } =
		useSelector((state) => state.gandtTemplate)

	const [searchText, setSearchText] = useState('')
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [templateToDelete, setTemplateToDelete] = useState(null)

	useEffect(() => {
		fetchTemplates()
	}, [currentPage, pageSize])

	const fetchTemplates = () => {
		dispatch(
			fetchGandTTemplates({
				page: currentPage,
				pageSize: pageSize,
				filter: {
					searchText: searchText,
				},
			}),
		)
	}

	const handleSearch = () => {
		dispatch(setCurrentPage(1))
		fetchTemplates()
	}

	const handlePageChange = (event, newPage) => {
		dispatch(setCurrentPage(newPage + 1))
	}

	const handlePageSizeChange = (event) => {
		dispatch(setPageSize(parseInt(event.target.value, 10)))
		dispatch(setCurrentPage(1))
	}

	const handleEdit = (template) => {
		navigate(`${routePaths.gandtTemplateEdit}?id=${template._id}`)
	}

	const handleView = (template) => {
		navigate(`${routePaths.gandtTemplateView}?id=${template._id}`)
	}

	const handleDeleteClick = (template) => {
		setTemplateToDelete(template)
		setDeleteDialogOpen(true)
	}

	const handleDeleteConfirm = async () => {
		if (templateToDelete) {
			await dispatch(deleteGandTTemplate(templateToDelete._id))
			setDeleteDialogOpen(false)
			setTemplateToDelete(null)
			fetchTemplates()
		}
	}

	const handleToggleStatus = async (template) => {
		await dispatch(toggleGandTTemplateStatus(template._id))
		fetchTemplates()
	}

	return (
		<Box sx={counsellorStyles.pageContainerSx}>
			{/* Header */}
			<Box sx={counsellorStyles.toolbarSx}>
				<Typography variant="h6" sx={{ fontWeight: 600 }}>
					G&T Templates
				</Typography>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<TextField
						placeholder="Search by template name..."
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
						startIcon={<AddIcon />}
						onClick={() => navigate(routePaths.gandtTemplateAdd)}
						sx={counsellorStyles.addButtonSx}
					>
						Create Template
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
								<TableCell sx={{ ...tableStyles.headerCell, width: '18%' }}>Template Name</TableCell>
								<TableCell sx={{ ...tableStyles.headerCell, width: '22%' }}>Description</TableCell>
								<TableCell sx={{ ...tableStyles.headerCell, width: '10%' }}>Age Groups</TableCell>
								<TableCell sx={{ ...tableStyles.headerCell, width: '10%' }}>Skills</TableCell>
								<TableCell sx={{ ...tableStyles.headerCell, width: '10%' }}>Status</TableCell>
								<TableCell sx={{ ...tableStyles.headerCell, width: '15%' }}>Created By</TableCell>
								<TableCell sx={{ ...tableStyles.headerCell, width: '15%', textAlign: 'center' }}>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={7} align="center" sx={{ py: 8 }}>
										Loading...
									</TableCell>
								</TableRow>
							) : allTemplates.length === 0 ? (
								<TableRow>
									<TableCell colSpan={7} sx={{ border: 'none' }}>
										<Box sx={{ ...tableStyles.emptyState, flex: 1 }}>
											<Typography sx={tableStyles.emptyStateTitle}>
												No templates found
											</Typography>
											<Typography sx={tableStyles.emptyStateSubtitle}>
												Create a new template to get started
											</Typography>
										</Box>
									</TableCell>
								</TableRow>
							) : (
								allTemplates.map((template) => (
									<TableRow key={template._id} sx={tableStyles.bodyRow}>
										<TableCell sx={tableStyles.bodyCell}>
											<Typography sx={{ fontSize: '13px', fontWeight: 400 }}>
												{template.templateName}
											</Typography>
										</TableCell>
										<TableCell sx={tableStyles.bodyCell}>
											<Typography sx={{ fontSize: '13px', fontWeight: 400 }}>
												{template.description || '-'}
											</Typography>
										</TableCell>
										<TableCell sx={tableStyles.bodyCell}>
											<Typography sx={{ fontSize: '13px', fontWeight: 400 }}>
												{template.ageGroups?.length || 0}
											</Typography>
										</TableCell>
										<TableCell sx={tableStyles.bodyCell}>
											<Typography sx={{ fontSize: '13px', fontWeight: 400 }}>
												{template.skills?.length || 0}
											</Typography>
										</TableCell>
										<TableCell sx={tableStyles.bodyCell}>
											<Chip
												label={template.isActive ? 'Active' : 'Inactive'}
												size="small"
												sx={{
													...tableStyles.statusBadge,
													...(template.isActive ? tableStyles.statusActive : tableStyles.statusInactive),
												}}
											/>
										</TableCell>
										<TableCell sx={tableStyles.bodyCell}>
											<Typography sx={{ fontSize: '13px', fontWeight: 400 }}>
												{template.createdBy?.profile?.fullName || '-'}
											</Typography>
										</TableCell>
										<TableCell sx={{ ...tableStyles.bodyCell, textAlign: 'center' }}>
											<Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
												<Tooltip title="View">
													<IconButton
														size="small"
														onClick={() => handleView(template)}
													>
														<VisibilityIcon fontSize="small" />
													</IconButton>
												</Tooltip>
												<Tooltip title="Edit">
													<IconButton
														size="small"
														onClick={() => handleEdit(template)}
													>
														<EditIcon fontSize="small" />
													</IconButton>
												</Tooltip>
												<Tooltip title={template.isActive ? 'Deactivate' : 'Activate'}>
													<IconButton
														size="small"
														onClick={() => handleToggleStatus(template)}
													>
														{template.isActive ? (
															<ToggleOnIcon fontSize="small" color="success" />
														) : (
															<ToggleOffIcon fontSize="small" />
														)}
													</IconButton>
												</Tooltip>
												<Tooltip title="Delete">
													<IconButton
														size="small"
														onClick={() => handleDeleteClick(template)}
														color="error"
													>
														<DeleteIcon fontSize="small" />
													</IconButton>
												</Tooltip>
											</Box>
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

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
				<DialogTitle>Confirm Delete</DialogTitle>
				<DialogContent>
					Are you sure you want to delete the template "
					{templateToDelete?.templateName}"?
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

export default GandTTemplateList
