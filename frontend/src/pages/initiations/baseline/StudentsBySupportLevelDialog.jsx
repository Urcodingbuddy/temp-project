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
import { supportLevels } from './baselineConstants'

const StudentsBySupportLevelDialog = ({
	open,
	onClose,
	supportLevel, // 'red' | 'orange' | 'green'
	filter,
}) => {
	const [loading, setLoading] = useState(false)
	const [students, setStudents] = useState([])
	const [error, setError] = useState(null)

	const levelConfig = supportLevels[supportLevel] || supportLevels.red
	const dialogTitle = `${levelConfig.shortLabel} - Students`
	const statusColor = levelConfig.color

	// Fetch students when dialog opens
	useEffect(() => {
		if (open && supportLevel) {
			fetchStudents()
		} else if (!open) {
			setStudents([])
			setError(null)
		}
	}, [open, supportLevel])

	const fetchStudents = async () => {
		setLoading(true)
		setError(null)

		try {
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

			const response = await myPeeguAxios.post(apiEndPoints.baselineStudentsBySupportLevel, {
				filter: requestFilter,
				supportLevel: supportLevel,
			})

			const studentList = response?.data?.students || []
			setStudents(studentList)
		} catch (err) {
			console.error('Error fetching students by support level:', err)
			setError('Failed to load students. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	const handleDownloadExcel = () => {
		if (students.length === 0) return

		const excelData = students.map((student) => ({
			'Student ID': student.user_id,
			'Name': student.studentName,
			'Class': student.className,
			'Section': student.section,
			'Physical': student.Physical || '-',
			'Social': student.Social || '-',
			'Emotional': student.Emotional || '-',
			'Cognitive': student.Cognitive || '-',
			'Language': student.Language || '-',
		}))

		const fileName = `baseline_${supportLevel}_students_${new Date().toISOString().split('T')[0]}.xlsx`
		downloadExcel(excelData, fileName)
	}

	const getScoreColor = (score) => {
		const numScore = parseInt(score, 10)
		if (isNaN(numScore)) return '#666'
		if (numScore <= 3) return supportLevels.red.color
		if (numScore <= 5) return supportLevels.orange.color
		return supportLevels.green.color
	}

	const studentCount = students.length

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="lg"
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
						{levelConfig.label} - {levelConfig.description}
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
									<TableCell
										sx={{
											fontWeight: 600,
											fontSize: '12px',
											backgroundColor: '#F0F7FF',
											borderBottom: '1px solid #E2E2E2',
											color: '#64748B',
											textAlign: 'center',
										}}
									>
										Physical
									</TableCell>
									<TableCell
										sx={{
											fontWeight: 600,
											fontSize: '12px',
											backgroundColor: '#F0F7FF',
											borderBottom: '1px solid #E2E2E2',
											color: '#64748B',
											textAlign: 'center',
										}}
									>
										Social
									</TableCell>
									<TableCell
										sx={{
											fontWeight: 600,
											fontSize: '12px',
											backgroundColor: '#F0F7FF',
											borderBottom: '1px solid #E2E2E2',
											color: '#64748B',
											textAlign: 'center',
										}}
									>
										Emotional
									</TableCell>
									<TableCell
										sx={{
											fontWeight: 600,
											fontSize: '12px',
											backgroundColor: '#F0F7FF',
											borderBottom: '1px solid #E2E2E2',
											color: '#64748B',
											textAlign: 'center',
										}}
									>
										Cognitive
									</TableCell>
									<TableCell
										sx={{
											fontWeight: 600,
											fontSize: '12px',
											backgroundColor: '#F0F7FF',
											borderBottom: '1px solid #E2E2E2',
											color: '#64748B',
											textAlign: 'center',
										}}
									>
										Language
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
											{student.user_id}
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
										<TableCell sx={{ fontSize: '13px', fontWeight: 600, textAlign: 'center', color: getScoreColor(student.Physical) }}>
											{student.Physical || '-'}
										</TableCell>
										<TableCell sx={{ fontSize: '13px', fontWeight: 600, textAlign: 'center', color: getScoreColor(student.Social) }}>
											{student.Social || '-'}
										</TableCell>
										<TableCell sx={{ fontSize: '13px', fontWeight: 600, textAlign: 'center', color: getScoreColor(student.Emotional) }}>
											{student.Emotional || '-'}
										</TableCell>
										<TableCell sx={{ fontSize: '13px', fontWeight: 600, textAlign: 'center', color: getScoreColor(student.Cognitive) }}>
											{student.Cognitive || '-'}
										</TableCell>
										<TableCell sx={{ fontSize: '13px', fontWeight: 600, textAlign: 'center', color: getScoreColor(student.Language) }}>
											{student.Language || '-'}
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

export default StudentsBySupportLevelDialog
