import React, { useState, useEffect } from 'react'
import {
	Dialog,
	DialogTitle,
	DialogContent,
	IconButton,
	Box,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	CircularProgress,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import DownloadIcon from '@mui/icons-material/Download'
import { riskLevelColors, supportLevels } from './baselineConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { apiEndPoints } from '../../../utils/apiConstants'
import myPeeguAxios from '../../../utils/myPeeguAxios'
import CustomButton from '../../../components/CustomButton'
import * as XLSX from 'xlsx'

const RiskDashboardDialog = ({ open, onClose, filter, academicYears }) => {
	const [loading, setLoading] = useState(false)
	const [data, setData] = useState({ students: [], summary: {}, totalCount: 0 })

	useEffect(() => {
		if (open && filter?.schoolIds) {
			fetchRiskData()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, filter?.schoolIds, JSON.stringify(filter?.classroomIds)])

	const fetchRiskData = async () => {
		setLoading(true)
		try {
			const response = await myPeeguAxios.post(apiEndPoints.baselineRiskDashboard, {
				filter: {
					schoolIds: filter.schoolIds,
					classroomIds: filter.classroomIds,
					academicYear: academicYears,
				},
			})
			setData(response.data)
		} catch (error) {
			console.error('Error fetching risk dashboard data:', error)
		} finally {
			setLoading(false)
		}
	}

	const getScoreColor = (score) => {
		const numScore = parseInt(score) || 0
		if (numScore <= 3) return supportLevels.red.color
		if (numScore <= 5) return supportLevels.orange.color
		return supportLevels.green.color
	}

	const handleExcelDownload = () => {
		if (!data.students || data.students.length === 0) return

		const exportData = data.students.map((student) => ({
			'Student ID': student.user_id,
			'Student Name': student.studentName,
			'Gender': student.gender || '-',
			'Class': student.className,
			'Section': student.section,
			'Red Domains': student.redDomainCount,
			'Affected Domains': student.redDomains?.join(', ') || '-',
			'Physical': student.Physical,
			'Social': student.Social,
			'Emotional': student.Emotional,
			'Cognitive': student.Cognitive,
			'Language': student.Language,
		}))

		const worksheet = XLSX.utils.json_to_sheet(exportData)
		const workbook = XLSX.utils.book_new()
		XLSX.utils.book_append_sheet(workbook, worksheet, 'At-Risk Students')
		XLSX.writeFile(workbook, 'Baseline_Risk_Dashboard.xlsx')
	}

	const { summary } = data

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="lg"
			fullWidth
			PaperProps={{
				sx: { borderRadius: '12px' },
			}}
		>
			<DialogTitle
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					borderBottom: '1px solid #E0E0E0',
					padding: '16px 24px',
				}}
			>
				<Typography variant="h6" sx={{ fontWeight: 600 }}>
					{localizationConstants.riskDashboard || 'Risk Dashboard'}
				</Typography>
				<Box sx={{ display: 'flex', gap: 1 }}>
					<CustomButton
						text="Download Excel"
						variant="outlined"
						onClick={handleExcelDownload}
						disabled={!data.students?.length}
						startIcon={<DownloadIcon />}
					/>
					<IconButton onClick={onClose} size="small">
						<CloseIcon />
					</IconButton>
				</Box>
			</DialogTitle>

			<DialogContent sx={{ padding: '24px' }}>
				{loading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
						<CircularProgress />
					</Box>
				) : (
					<>
						{/* Summary Cards */}
						<Box
							sx={{
								display: 'flex',
								gap: 2,
								marginBottom: '24px',
								flexWrap: 'wrap',
							}}
						>
							<Box
								sx={{
									flex: '1 1 150px',
									backgroundColor: '#FFEBEE',
									borderRadius: '8px',
									padding: '16px',
									textAlign: 'center',
								}}
							>
								<Typography variant="h4" sx={{ fontWeight: 700, color: '#C62828' }}>
									{summary?.total || 0}
								</Typography>
								<Typography variant="body2" color="textSecondary">
									Total At-Risk
								</Typography>
							</Box>
							{[5, 4, 3, 2, 1].map((count) => (
								<Box
									key={count}
									sx={{
										flex: '1 1 100px',
										backgroundColor: '#FFF',
										border: `2px solid ${riskLevelColors[count]}`,
										borderRadius: '8px',
										padding: '12px',
										textAlign: 'center',
									}}
								>
									<Typography
										variant="h5"
										sx={{ fontWeight: 600, color: riskLevelColors[count] }}
									>
										{summary?.[`${['one', 'two', 'three', 'four', 'five'][count - 1]}Red`] || 0}
									</Typography>
									<Typography variant="caption" color="textSecondary">
										{count} Red Domain{count > 1 ? 's' : ''}
									</Typography>
								</Box>
							))}
						</Box>

						{/* Students Table */}
						<TableContainer
							sx={{
								maxHeight: 400,
								border: '1px solid #E0E0E0',
								borderRadius: '8px',
							}}
						>
							<Table stickyHeader size="small">
								<TableHead>
									<TableRow>
										<TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F5F5' }}>
											Student ID
										</TableCell>
										<TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F5F5' }}>
											Name
										</TableCell>
										<TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F5F5' }}>
											Class
										</TableCell>
										<TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F5F5' }}>
											Risk Level
										</TableCell>
										<TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F5F5' }}>
											Affected Domains
										</TableCell>
										<TableCell align="center" sx={{ fontWeight: 600, backgroundColor: '#F5F5F5' }}>
											Physical
										</TableCell>
										<TableCell align="center" sx={{ fontWeight: 600, backgroundColor: '#F5F5F5' }}>
											Social
										</TableCell>
										<TableCell align="center" sx={{ fontWeight: 600, backgroundColor: '#F5F5F5' }}>
											Emotional
										</TableCell>
										<TableCell align="center" sx={{ fontWeight: 600, backgroundColor: '#F5F5F5' }}>
											Cognitive
										</TableCell>
										<TableCell align="center" sx={{ fontWeight: 600, backgroundColor: '#F5F5F5' }}>
											Language
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{data.students?.length === 0 ? (
										<TableRow>
											<TableCell colSpan={10} align="center" sx={{ padding: '40px' }}>
												<Typography color="textSecondary">
													No at-risk students found
												</Typography>
											</TableCell>
										</TableRow>
									) : (
										data.students?.map((student) => (
											<TableRow
												key={student._id}
												sx={{
													'&:hover': { backgroundColor: '#FAFAFA' },
												}}
											>
												<TableCell>{student.user_id}</TableCell>
												<TableCell>{student.studentName}</TableCell>
												<TableCell>
													{student.className}
													{student.section ? ` - ${student.section}` : ''}
												</TableCell>
												<TableCell>
													<Chip
														label={`${student.redDomainCount} Red`}
														size="small"
														sx={{
															backgroundColor: riskLevelColors[student.redDomainCount] || riskLevelColors[1],
															color: '#FFF',
															fontWeight: 600,
														}}
													/>
												</TableCell>
												<TableCell>
													{student.redDomains?.map((domain) => (
														<Chip
															key={domain}
															label={domain}
															size="small"
															sx={{
																marginRight: '4px',
																marginBottom: '2px',
																backgroundColor: supportLevels.red.color,
																color: '#FFF',
																fontSize: '10px',
															}}
														/>
													))}
												</TableCell>
												<TableCell align="center">
													<Typography
														sx={{
															fontWeight: 600,
															color: getScoreColor(student.Physical),
														}}
													>
														{student.Physical}
													</Typography>
												</TableCell>
												<TableCell align="center">
													<Typography
														sx={{
															fontWeight: 600,
															color: getScoreColor(student.Social),
														}}
													>
														{student.Social}
													</Typography>
												</TableCell>
												<TableCell align="center">
													<Typography
														sx={{
															fontWeight: 600,
															color: getScoreColor(student.Emotional),
														}}
													>
														{student.Emotional}
													</Typography>
												</TableCell>
												<TableCell align="center">
													<Typography
														sx={{
															fontWeight: 600,
															color: getScoreColor(student.Cognitive),
														}}
													>
														{student.Cognitive}
													</Typography>
												</TableCell>
												<TableCell align="center">
													<Typography
														sx={{
															fontWeight: 600,
															color: getScoreColor(student.Language),
														}}
													>
														{student.Language}
													</Typography>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</TableContainer>

						<Typography
							variant="caption"
							color="textSecondary"
							sx={{ display: 'block', marginTop: '12px', textAlign: 'right' }}
						>
							Showing {data.students?.length || 0} at-risk students (sorted by severity)
						</Typography>
					</>
				)}
			</DialogContent>
		</Dialog>
	)
}

export default RiskDashboardDialog
