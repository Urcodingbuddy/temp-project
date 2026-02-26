import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Box,
	Typography,
	Chip,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	CircularProgress,
	Alert,
	IconButton,
} from '@mui/material'
import {
	Close as CloseIcon,
	Add as AddIcon,
} from '@mui/icons-material'
import { getStudentHistory } from './gandtCounselorSlice'
import { tableStyles } from '../../../components/styles/tableStyles'

const StudentDetailDialog = ({ open, onClose, student, onStartNewAssessment }) => {
	const dispatch = useDispatch()
	const { studentHistory, historyLoading, error } = useSelector(
		(state) => state.gandtCounselor,
	)

	useEffect(() => {
		if (open && student) {
			dispatch(getStudentHistory({ studentId: student._id }))
		}
	}, [open, student, dispatch])

	if (!student) return null

	// Get classification chip color
	const getClassificationColor = (classification) => {
		switch (classification) {
			case 'Gifted & Talented':
				return 'success'
			case 'Gifted':
				return 'primary'
			case 'Talented':
				return 'secondary'
			case 'Emerging Potential':
				return 'warning'
			case 'Standard Range':
			default:
				return 'default'
		}
	}

	return (
		<Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
			<DialogTitle sx={{ py: 1.5, px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box>
						<Typography variant="subtitle1" fontWeight={600}>
							{student.studentName}
						</Typography>
						<Typography variant="caption" color="text.secondary">
							{student.user_id} {student.age ? `• ${student.age} years` : ''}
						</Typography>
					</Box>
					<IconButton onClick={onClose} size="small">
						<CloseIcon fontSize="small" />
					</IconButton>
				</Box>
			</DialogTitle>

			<DialogContent sx={{ p: 0 }}>
				{/* Assessment History Header */}
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
					<Typography variant="body2" fontWeight={600} color="text.secondary">
						Assessment History ({studentHistory.length})
					</Typography>
					<Button
						variant="contained"
						size="small"
						startIcon={<AddIcon />}
						onClick={onStartNewAssessment}
						disabled={!student.age}
						sx={{ textTransform: 'none', fontSize: '12px' }}
					>
						New Assessment
					</Button>
				</Box>

				{historyLoading && (
					<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
						<CircularProgress size={24} />
					</Box>
				)}

				{error && (
					<Alert severity="error" sx={{ m: 2 }}>
						{error}
					</Alert>
				)}

				{!historyLoading && studentHistory.length === 0 && (
					<Box sx={{ p: 4, textAlign: 'center' }}>
						<Typography variant="body2" color="text.secondary">
							No assessments found. Click "New Assessment" to begin.
						</Typography>
					</Box>
				)}

				{!historyLoading && studentHistory.length > 0 && (
					<TableContainer sx={{ maxHeight: 400 }}>
						<Table stickyHeader size="small" sx={{ minWidth: 900 }}>
							<TableHead>
								<TableRow>
									<TableCell sx={{ ...tableStyles.headerCell, width: 90 }}>Date</TableCell>
									<TableCell sx={{ ...tableStyles.headerCell, width: 80 }}>Status</TableCell>
									<TableCell sx={{ ...tableStyles.headerCell, width: 140 }}>Classification</TableCell>
									<TableCell sx={{ ...tableStyles.headerCell, width: 180 }}>Tier</TableCell>
									<TableCell sx={{ ...tableStyles.headerCell, width: 80 }}>Gifted %</TableCell>
									<TableCell sx={{ ...tableStyles.headerCell, width: 80 }}>Talented %</TableCell>
									<TableCell sx={{ ...tableStyles.headerCell, width: 100 }}>Age Group</TableCell>
									<TableCell sx={{ ...tableStyles.headerCell, width: 120 }}>Counselor</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{studentHistory.map((assessment) => (
									<TableRow key={assessment._id} sx={tableStyles.bodyRow}>
										<TableCell sx={tableStyles.bodyCell}>
											<Typography variant="caption">
												{new Date(assessment.createdAt).toLocaleDateString()}
											</Typography>
										</TableCell>
										<TableCell sx={tableStyles.bodyCell}>
											<Chip
												label={assessment.status === 'completed' ? 'Done' : 'In Progress'}
												size="small"
												sx={{
													fontSize: '10px',
													height: '20px',
													...(assessment.status === 'completed'
														? { bgcolor: '#DCFCE7', color: '#166534' }
														: { bgcolor: '#FEF3C7', color: '#92400E' }),
												}}
											/>
										</TableCell>
										<TableCell sx={tableStyles.bodyCell}>
											{assessment.classification ? (
												<Chip
													label={assessment.classification}
													size="small"
													color={getClassificationColor(assessment.classification)}
													sx={{ fontSize: '10px', height: '20px' }}
												/>
											) : (
												<Typography variant="caption" color="text.secondary">-</Typography>
											)}
										</TableCell>
										<TableCell sx={tableStyles.bodyCell}>
											{assessment.tier ? (
												<Typography variant="caption" fontWeight={500}>
													{assessment.tier}
												</Typography>
											) : (
												<Typography variant="caption" color="text.secondary">-</Typography>
											)}
										</TableCell>
										<TableCell sx={tableStyles.bodyCell}>
											<Typography variant="body2" fontWeight={500}>
												{assessment.giftedPercentage ? `${assessment.giftedPercentage.toFixed(0)}%` : '-'}
											</Typography>
										</TableCell>
										<TableCell sx={tableStyles.bodyCell}>
											<Typography variant="body2" fontWeight={500}>
												{assessment.talentedPercentage ? `${assessment.talentedPercentage.toFixed(0)}%` : '-'}
											</Typography>
										</TableCell>
										<TableCell sx={tableStyles.bodyCell}>
											<Typography variant="caption">
												{assessment.ageGroupTitle}
											</Typography>
										</TableCell>
										<TableCell sx={tableStyles.bodyCell}>
											<Typography variant="caption" color="text.secondary">
												{assessment.counsellorName}
											</Typography>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				)}
			</DialogContent>

			<DialogActions sx={{ px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
				<Button onClick={onClose} size="small" sx={{ textTransform: 'none' }}>
					Close
				</Button>
			</DialogActions>
		</Dialog>
	)
}

export default StudentDetailDialog
