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
import { supportLevels } from './baselineConstants'
import CustomButton from '../../../components/CustomButton'
import myPeeguAxios from '../../../utils/myPeeguAxios'
import { apiEndPoints } from '../../../utils/apiConstants'
import { downloadExcel } from '../../../utils/utils'

// Score range mapping for support levels
const scoreRanges = {
	red: { min: 0, max: 3 },
	orange: { min: 4, max: 5 },
	green: { min: 6, max: 7 },
}

const StudentsListByDomainDialog = ({
	open,
	onClose,
	domain,
	supportLevel,
	filter,
}) => {
	const [loading, setLoading] = useState(false)
	const [students, setStudents] = useState([])
	const [error, setError] = useState(null)

	const supportConfig = supportLevels[supportLevel] || supportLevels.red
	const scoreRange = scoreRanges[supportLevel] || scoreRanges.red

	// Fetch students when dialog opens
	useEffect(() => {
		if (open && domain && supportLevel) {
			fetchStudents()
		} else if (!open) {
			// Reset state when dialog closes
			setStudents([])
			setError(null)
		}
	}, [open, domain, supportLevel])

	const fetchStudents = async () => {
		setLoading(true)
		setError(null)

		try {
			// Build filter object to match the format used by analytics
			const baselineFilter = {}

			// Academic year - should be an array
			if (filter?.academicYear && filter.academicYear.length > 0) {
				baselineFilter.academicYear = filter.academicYear
			}

			// School IDs - wrap in array for backend consistency
			if (filter?.schoolIds && filter.schoolIds !== 'all') {
				baselineFilter.schoolIds = Array.isArray(filter.schoolIds)
					? filter.schoolIds
					: [filter.schoolIds]
			}

			// Classroom IDs - array of classroom IDs
			if (filter?.classroomIds && Array.isArray(filter.classroomIds) && filter.classroomIds.length > 0) {
				baselineFilter.classroomIds = filter.classroomIds
			}

			// Fetch baseline records
			const baselineBody = {
				filter: baselineFilter,
				page: 1,
				pageSize: 1000,
			}

			// Fetch baseline records only
			const baselineResponse = await myPeeguAxios.post(apiEndPoints.getBaselineRecords, baselineBody)
			const baselineRecords = baselineResponse?.data?.data || []

			// Process students - only those matching the score range
			const transformedStudents = []

			baselineRecords.forEach((record) => {
				const domainField = record[domain]

				// Check if domain data exists - skip if undefined/null
				if (domainField === undefined || domainField === null) {
					return // Skip this record - no data for this domain
				}

				const domainScore = typeof domainField === 'object'
					? parseInt(domainField?.total ?? -1)
					: parseInt(domainField ?? -1)

				// Skip if score is invalid (-1 means no valid data)
				if (domainScore < 0) {
					return
				}

				if (domainScore >= scoreRange.min && domainScore <= scoreRange.max) {
					transformedStudents.push({
						userId: record.user_id,
						studentName: record.studentName,
						className: record.className || record.classRoom?.className || '-',
						section: record.section || record.classRoom?.section || '-',
						domainScore: domainScore,
						supportLevel: supportConfig.shortLabel,
						supportColor: supportConfig.color,
					})
				}
			})

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
			[`${domain} Score`]: student.domainScore,
			'Support Level': student.supportLevel,
		}))

		const fileName = `${domain}_${supportLevel}_students_${new Date().toISOString().split('T')[0]}.xlsx`
		downloadExcel(excelData, fileName)
	}

	const getDialogTitle = () => {
		return `${supportConfig.shortLabel} - ${domain} Domain`
	}

	// Count students
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
						sx={{ fontWeight: 600, color: supportConfig.color }}
					>
						{getDialogTitle()}
					</Typography>
					<Typography
						variant={typographyConstants.caption}
						sx={{ color: 'textColors.gray1', mt: '4px', fontSize: '12px' }}
					>
						Students with {domain} score {scoreRange.min}-{scoreRange.max}
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
							No students found in this category
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
											textAlign: 'center',
											color: '#64748B',
										}}
									>
										{domain} Score
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
										{localizationConstants.supportLevel || 'Support Level'}
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{students.map((student, index) => (
									<TableRow
										key={student.userId || index}
										sx={{
											'&:hover': {
												backgroundColor: 'rgba(0,0,0,0.02)',
											},
										}}
									>
										<TableCell sx={{ fontSize: '13px', fontWeight: 400, color: '#334155' }}>{student.userId}</TableCell>
										<TableCell sx={{ fontSize: '13px', fontWeight: 400, color: '#334155' }}>{student.studentName}</TableCell>
										<TableCell sx={{ fontSize: '13px', fontWeight: 400, color: '#334155' }}>{student.className}</TableCell>
										<TableCell sx={{ fontSize: '13px', fontWeight: 400, color: '#334155' }}>{student.section}</TableCell>
										<TableCell
											sx={{
												textAlign: 'center',
												fontWeight: 500,
												color: student.supportColor,
												fontSize: '13px',
											}}
										>
											{student.domainScore}
										</TableCell>
										<TableCell>
											<Box
												sx={{
													display: 'inline-block',
													padding: '3px 10px',
													borderRadius: '10px',
													backgroundColor: `${student.supportColor}15`,
													color: student.supportColor,
													fontSize: '11px',
													fontWeight: 500,
												}}
											>
												{student.supportLevel}
											</Box>
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

export default StudentsListByDomainDialog
