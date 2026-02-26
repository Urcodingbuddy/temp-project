import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	IconButton,
	Tooltip,
	Box,
	Typography,
	TablePagination,
	TextField,
} from '@mui/material'
import {
	Visibility as VisibilityIcon,
	Search as SearchIcon,
} from '@mui/icons-material'
import { tableStyles } from '../../../components/styles/tableStyles'

const StudentListTable = ({ onStudentClick, onStartAssessment }) => {
	const { students, totalStudents } = useSelector((state) => state.gandtCounselor)

	const [page, setPage] = useState(0)
	const [rowsPerPage, setRowsPerPage] = useState(10)
	const [searchText, setSearchText] = useState('')

	// Filter students based on search
	const filteredStudents = students.filter(
		(student) =>
			student.studentName?.toLowerCase().includes(searchText.toLowerCase()) ||
			student.user_id?.toLowerCase().includes(searchText.toLowerCase()) ||
			student.regNo?.toLowerCase().includes(searchText.toLowerCase()),
	)

	// Pagination
	const paginatedStudents = filteredStudents.slice(
		page * rowsPerPage,
		page * rowsPerPage + rowsPerPage,
	)

	const handleChangePage = (event, newPage) => {
		setPage(newPage)
	}

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10))
		setPage(0)
	}

	// Get status chip color
	const getStatusColor = (status) => {
		return status === 'done' ? 'success' : 'warning'
	}

	// Get status label
	const getStatusLabel = (student) => {
		if (student.assessmentStatus === 'done') {
			return `Done (${student.completedAssessments}/${student.totalAssessments})`
		}
		return 'Not Done'
	}

	// Get result chip color based on classification
	const getResultColor = (result) => {
		switch (result) {
			case 'Gifted & Talented':
				return 'success'
			case 'Gifted':
				return 'primary'
			case 'Talented':
				return 'secondary'
			case 'Emerging Potential':
				return 'warning'
			case 'Standard Range':
				return 'default'
			default:
				return 'default'
		}
	}

	if (students.length === 0) {
		return (
			<Box sx={{ ...tableStyles.emptyState, flex: 1 }}>
				<Typography sx={tableStyles.emptyStateTitle}>
					No students found
				</Typography>
				<Typography sx={tableStyles.emptyStateSubtitle}>
					No students found in this class
				</Typography>
			</Box>
		)
	}

	return (
		<Box sx={{ ...tableStyles.container, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
			{/* Header with search */}
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
				<Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
					Students ({filteredStudents.length} of {totalStudents})
				</Typography>
				<TextField
					placeholder="Search by name, user ID, or reg no..."
					value={searchText}
					onChange={(e) => {
						setSearchText(e.target.value)
						setPage(0)
					}}
					size="small"
					sx={{
						width: '280px',
						'& .MuiOutlinedInput-root': {
							height: '32px',
							fontSize: '12px',
							borderRadius: '6px',
						},
					}}
					InputProps={{
						startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 16 }} />,
					}}
				/>
			</Box>

			<TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto', ...tableStyles.scrollWrapper }}>
				<Table stickyHeader size="small" sx={{ ...tableStyles.table, minWidth: 1200 }}>
					<TableHead>
						<TableRow sx={tableStyles.headerRow}>
							<TableCell sx={{ ...tableStyles.headerCell, width: 50 }}>S.No</TableCell>
							<TableCell sx={{ ...tableStyles.headerCell, width: 150 }}>Student Name</TableCell>
							<TableCell sx={{ ...tableStyles.headerCell, width: 100 }}>User ID</TableCell>
							<TableCell sx={{ ...tableStyles.headerCell, width: 100 }}>Reg No</TableCell>
							<TableCell sx={{ ...tableStyles.headerCell, width: 60 }}>Age</TableCell>
							<TableCell sx={{ ...tableStyles.headerCell, width: 100 }}>Status</TableCell>
							<TableCell sx={{ ...tableStyles.headerCell, width: 140 }}>Classification</TableCell>
							<TableCell sx={{ ...tableStyles.headerCell, width: 180 }}>Tier</TableCell>
							<TableCell sx={{ ...tableStyles.headerCell, width: 90 }}>Assessments</TableCell>
							<TableCell sx={{ ...tableStyles.headerCell, width: 100 }}>Last Date</TableCell>
							<TableCell sx={{ ...tableStyles.headerCell, width: 80, textAlign: 'center' }}>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{paginatedStudents.map((student, index) => (
							<TableRow key={student._id} sx={tableStyles.bodyRow}>
								<TableCell sx={tableStyles.bodyCell}>
									<Typography sx={{ fontSize: '12px', fontWeight: 400 }}>
										{page * rowsPerPage + index + 1}
									</Typography>
								</TableCell>
								<TableCell sx={tableStyles.bodyCell}>
									<Typography sx={{ fontSize: '12px', fontWeight: 400 }}>
										{student.studentName}
									</Typography>
								</TableCell>
								<TableCell sx={tableStyles.bodyCell}>
									<Typography sx={{ fontSize: '12px', fontWeight: 400 }}>
										{student.user_id}
									</Typography>
								</TableCell>
								<TableCell sx={tableStyles.bodyCell}>
									<Typography sx={{ fontSize: '12px', fontWeight: 400 }}>
										{student.regNo || '-'}
									</Typography>
								</TableCell>
								<TableCell sx={tableStyles.bodyCell}>
									<Chip
										label={student.age ? `${student.age}y` : 'N/A'}
										size="small"
										sx={{
											fontSize: '10px',
											height: '20px',
											bgcolor: student.age ? '#DBEAFE' : '#F1F5F9',
											color: student.age ? '#1E40AF' : '#64748B',
										}}
									/>
								</TableCell>
								<TableCell sx={tableStyles.bodyCell}>
									<Chip
										label={getStatusLabel(student)}
										size="small"
										sx={{
											fontSize: '10px',
											height: '20px',
											...(student.assessmentStatus === 'done'
												? { bgcolor: '#DCFCE7', color: '#166534' }
												: { bgcolor: '#FEF3C7', color: '#92400E' }),
										}}
									/>
								</TableCell>
								<TableCell sx={tableStyles.bodyCell}>
									{student.latestClassification ? (
										<Chip
											label={student.latestClassification}
											size="small"
											color={getResultColor(student.latestClassification)}
											sx={{
												fontSize: '10px',
												height: '20px',
											}}
										/>
									) : (
										<Typography sx={{ fontSize: '12px', color: '#94A3B8' }}>-</Typography>
									)}
								</TableCell>
								<TableCell sx={tableStyles.bodyCell}>
									{student.latestTier ? (
										<Typography sx={{ fontSize: '11px', fontWeight: 500 }}>
											{student.latestTier}
										</Typography>
									) : (
										<Typography sx={{ fontSize: '12px', color: '#94A3B8' }}>-</Typography>
									)}
								</TableCell>
								<TableCell sx={tableStyles.bodyCell}>
									<Typography sx={{ fontSize: '11px', fontWeight: 400 }}>
										{student.totalAssessments}
									</Typography>
								</TableCell>
								<TableCell sx={tableStyles.bodyCell}>
									<Typography sx={{ fontSize: '11px', fontWeight: 400 }}>
										{student.lastAssessmentDate
											? new Date(student.lastAssessmentDate).toLocaleDateString()
											: '-'}
									</Typography>
								</TableCell>
								<TableCell sx={{ ...tableStyles.bodyCell, textAlign: 'center' }}>
									<Tooltip title="View Details">
										<IconButton
											size="small"
											onClick={() => onStudentClick(student)}
										>
											<VisibilityIcon sx={{ fontSize: 16 }} />
										</IconButton>
									</Tooltip>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<Box sx={tableStyles.footer}>
				<Box />
				<TablePagination
					component="div"
					count={filteredStudents.length}
					page={page}
					onPageChange={handleChangePage}
					rowsPerPage={rowsPerPage}
					onRowsPerPageChange={handleChangeRowsPerPage}
					rowsPerPageOptions={[5, 10, 25, 50]}
					sx={{
						'.MuiTablePagination-toolbar': { minHeight: '36px' },
						'.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontSize: '12px' },
					}}
				/>
			</Box>
		</Box>
	)
}

export default StudentListTable
