import React, { useEffect, useState } from 'react'
import {
	Box,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	CircularProgress,
	Dialog,
	DialogTitle,
	DialogContent,
	IconButton,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import DownloadIcon from '@mui/icons-material/Download'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import CustomButton from '../../../components/CustomButton'
import myPeeguAxios from '../../../utils/myPeeguAxios'
import { apiEndPoints } from '../../../utils/apiConstants'
import { downloadExcel } from '../../../utils/utils'

const StudentsScreeningStatusDialog = ({
	open,
	onClose,
	screeningStatus, // 'screened' | 'notScreened'
	filter,
}) => {
	const [loading, setLoading] = useState(false)
	const [students, setStudents] = useState([])
	const [error, setError] = useState(null)

	const isScreened = screeningStatus === 'screened'
	const dialogTitle = isScreened ? 'Screened Students' : 'Not Screened Students'
	const statusColor = isScreened ? '#43A047' : '#9E9E9E'

	// Fetch students when dialog opens
	useEffect(() => {
		if (open && screeningStatus) {
			fetchStudents()
		} else if (!open) {
			// Reset state when dialog closes
			setStudents([])
			setError(null)
		}
	}, [open, screeningStatus])

	const fetchStudents = async () => {
		setLoading(true)
		setError(null)

		try {
			// Build filter for the backend API
			const requestFilter = {}

			if (filter?.academicYear && filter.academicYear.length > 0) {
				requestFilter.academicYear = filter.academicYear
			}

			if (filter?.schoolIds && filter.schoolIds !== 'all') {
				requestFilter.schoolIds = Array.isArray(filter.schoolIds)
					? filter.schoolIds
					: [filter.schoolIds]
			}

			if (filter?.classroomIds && Array.isArray(filter.classroomIds) && filter.classroomIds.length > 0) {
				requestFilter.classroomIds = filter.classroomIds
			}

			// Use the new backend API that ensures count consistency
			const response = await myPeeguAxios.post(apiEndPoints.baselineStudentsByScreeningStatus, {
				filter: requestFilter,
				screeningStatus: screeningStatus, // 'screened' or 'notScreened'
			})

			const studentList = response?.data?.students || []

			// Transform to expected format
			const transformedStudents = studentList.map((student) => ({
				_id: student._id,
				userId: student.user_id,
				studentName: student.studentName,
				className: student.className || '-',
				section: student.section || '-',
			}))

			setStudents(transformedStudents)
		} catch (err) {
			console.error('Error fetching students:', err)
			setError('Failed to load students. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	const handleDownloadExcel = () => {
		if (students.length === 0) return

		const excelData = students.map((student) => ({
			'Student ID': student.userId,
			'Name': student.studentName,
			'Class': student.className,
			'Section': student.section,
		}))

		const statusLabel = isScreened ? 'screened' : 'not_screened'
		const fileName = `baseline_${statusLabel}_students_${new Date().toISOString().split('T')[0]}.xlsx`
		downloadExcel(excelData, fileName)
	}

	const studentCount = students.length

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: '12px',
					maxHeight: '80vh',
				},
			}}
		>
			<DialogTitle
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					borderBottom: '1px solid #E2E2E2',
					padding: '16px 24px',
				}}
			>
				<Box>
					<Typography
						variant={typographyConstants.h5}
						sx={{ fontWeight: 600, color: statusColor }}
					>
						{dialogTitle}
					</Typography>
					<Typography
						variant={typographyConstants.caption}
						sx={{ color: 'textColors.gray1', mt: '4px', fontSize: '12px' }}
					>
						{isScreened
							? 'Students who have completed baseline assessment'
							: 'Students who have not completed baseline assessment'}
					</Typography>
				</Box>
				<IconButton onClick={onClose} size="small">
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent sx={{ padding: '20px 24px', paddingTop: '20px !important' }}>
				{/* Header with count and download button */}
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: '16px',
						gap: '16px',
					}}
				>
					<Typography variant={typographyConstants.body} sx={{ flexShrink: 0, fontSize: '13px' }}>
						{loading ? 'Loading...' : `${studentCount} students`}
					</Typography>
					<CustomButton
						text="Download Excel"
						onClick={handleDownloadExcel}
						disabled={loading || students.length === 0}
						typoVariant="body2"
						sx={{
							backgroundColor: 'globalElementColors.green2',
							'&:hover': { backgroundColor: 'globalElementColors.green' },
							flexShrink: 0,
							minWidth: 'fit-content',
							p: '8px 16px',
						}}
						startIcon={<DownloadIcon sx={{ fontSize: 16, mr: 0.5 }} />}
					/>
				</Box>

				{/* Loading state */}
				{loading && (
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							height: '200px',
						}}
					>
						<CircularProgress />
					</Box>
				)}

				{/* Error state */}
				{error && !loading && (
					<Box
						sx={{
							textAlign: 'center',
							padding: '40px',
							color: 'textColors.red',
						}}
					>
						<Typography>{error}</Typography>
					</Box>
				)}

				{/* Empty state */}
				{!loading && !error && students.length === 0 && (
					<Box
						sx={{
							textAlign: 'center',
							padding: '40px',
							backgroundColor: '#F8FCFF',
							borderRadius: '8px',
						}}
					>
						<Typography color="textColors.gray1">
							No students found
						</Typography>
					</Box>
				)}

				{/* Students table */}
				{!loading && !error && students.length > 0 && (
					<TableContainer
						sx={{
							border: '1px solid #E2E2E2',
							borderRadius: '8px',
							maxHeight: '400px',
						}}
					>
						<Table stickyHeader size="small">
							<TableHead>
								<TableRow>
									<TableCell
										sx={{
											fontWeight: 600,
											fontSize: '12px',
											backgroundColor: '#F0F7FF',
											borderBottom: '1px solid #E2E2E2',
											color: '#64748B',
										}}
									>
										{localizationConstants.studentID}
									</TableCell>
									<TableCell
										sx={{
											fontWeight: 600,
											fontSize: '12px',
											backgroundColor: '#F0F7FF',
											borderBottom: '1px solid #E2E2E2',
											color: '#64748B',
										}}
									>
										{localizationConstants.name}
									</TableCell>
									<TableCell
										sx={{
											fontWeight: 600,
											fontSize: '12px',
											backgroundColor: '#F0F7FF',
											borderBottom: '1px solid #E2E2E2',
											color: '#64748B',
										}}
									>
										{localizationConstants.ClassCamel}
									</TableCell>
									<TableCell
										sx={{
											fontWeight: 600,
											fontSize: '12px',
											backgroundColor: '#F0F7FF',
											borderBottom: '1px solid #E2E2E2',
											color: '#64748B',
										}}
									>
										{localizationConstants.section}
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{students.map((student, index) => (
									<TableRow
										key={student._id || index}
										sx={{
											'&:hover': {
												backgroundColor: 'rgba(0,0,0,0.02)',
											},
										}}
									>
										<TableCell sx={{ fontSize: '13px', fontWeight: 400, color: '#334155' }}>
											{student.userId}
										</TableCell>
										<TableCell sx={{ fontSize: '13px', fontWeight: 400, color: '#334155' }}>
											{student.studentName}
										</TableCell>
										<TableCell sx={{ fontSize: '13px', fontWeight: 400, color: '#334155' }}>
											{student.className}
										</TableCell>
										<TableCell sx={{ fontSize: '13px', fontWeight: 400, color: '#334155' }}>
											{student.section}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				)}
			</DialogContent>
		</Dialog>
	)
}

export default StudentsScreeningStatusDialog
