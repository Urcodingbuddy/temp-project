import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Bar } from 'react-chartjs-2'
import Chart from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	Box,
} from '@mui/material'

import {
	DISCWisePerformanceData,
	getBackgroundColor,
	teacherAttitudesAssessmentQuestions,
	teacherPracticesAssessmentQuestions,
	jobLifeSatisfactionAssessmentQuestions,
} from './teacherProfilingConstants'
import { generateChartOptions } from './teacherProfilingFunctions'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import OnHoverTable from '../../../components/OnHoverTable'

Chart.register(ChartDataLabels)

const TeacherProfilingReport = ({
	specificTeacherProfilingDetails,
	isDISCSelected,
	isTeachingPracticesSelected,
	isJobLifeSatisfactionSelected,
	isTeachingAttitudeSelected,
}) => {
	const { drawerWidth } = useSelector((store) => store.dashboardSliceSetup)
	const [hoveredRowIndex, setHoveredRowIndex] = useState(null)
	const [isTableOpen, setIsTableOpen] = useState(false)

	const rows = [
		isTeachingAttitudeSelected && {
			dimension: localizationConstants?.teachingAttitudes,
			score: specificTeacherProfilingDetails?.teacherAttitude.toFixed(2),
		},
		isTeachingPracticesSelected && {
			dimension: localizationConstants?.teachingPractices,
			score: specificTeacherProfilingDetails?.teacherPractices.toFixed(2),
		},
		isJobLifeSatisfactionSelected && {
			dimension: localizationConstants?.jobLifeSatisfaction,
			score: specificTeacherProfilingDetails?.teacherJobLifeSatisfaction.toFixed(
				2,
			),
		},
	].filter(Boolean)

	const discWisePerformanceData = isDISCSelected
		? DISCWisePerformanceData([
				specificTeacherProfilingDetails?.teacherDominance.toFixed(2),
				specificTeacherProfilingDetails?.teacherInfluence.toFixed(2),
				specificTeacherProfilingDetails?.teacherSteadiness.toFixed(2),
				specificTeacherProfilingDetails?.teacherCompliance.toFixed(2),
			])
		: null

	const handleCloseTable = () => setIsTableOpen(false)
	const handleOpenTable = (index) => {
		setIsTableOpen(true)
		setHoveredRowIndex(index)
	}

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			{/* Component Wise Report Section */}
			{rows.length > 0 && (
				<Box
					sx={{
						backgroundColor: '#fff',
						borderRadius: '8px',
						boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
						padding: 3,
					}}
				>
					<Typography sx={{ fontWeight: 600, mb: 2 }}>
						{localizationConstants.componentWiseReport}
					</Typography>
					<TableContainer
						sx={{
							border: '1px solid #E2E2E2',
							borderRadius: '10px',
							maxWidth: `calc(100vw - ${drawerWidth + 90}px)`,
						}}
					>
						<Table size='small' stickyHeader>
							<TableHead>
								<TableRow>
									<TableCell
										sx={{
											backgroundColor:
												'globalElementColors.lightBlue2',
											fontWeight: 'bold',
											width: '50%',
											borderBottom: '1px solid #E2E2E2',
										}}
									>
										<Typography sx={{ fontWeight: 600 }}>
											{localizationConstants.Dimensions}
										</Typography>
									</TableCell>
									<TableCell
										align='center'
										sx={{
											backgroundColor:
												'globalElementColors.lightBlue2',
											fontWeight: 'bold',
											width: '50%',
											borderBottom: '1px solid #E2E2E2',
										}}
									>
										<Typography sx={{ fontWeight: 600 }}>
											{localizationConstants.score}
										</Typography>
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{rows.map((row, index) => (
									<TableRow key={index}>
										<TableCell
											sx={{
												borderBottom:
													'1px solid #E2E2E2',
											}}
										>
											<Typography>
												{row.dimension}
											</Typography>
										</TableCell>
										<TableCell
											align='center'
											onClick={() =>
												handleOpenTable(index)
											}
											sx={{
												borderBottom:
													'1px solid #E2E2E2',
												backgroundColor:
													getBackgroundColor(
														row.score,
													),
												cursor: 'pointer',
												position: 'relative',
											}}
										>
											<Typography>
												{row.score}
												{isTableOpen &&
													hoveredRowIndex ===
														index && (
														<OnHoverTable
															tableSecondColoumTitle={
																row.dimension
															}
															tableThirdColoumTitle={
																localizationConstants?.score4PtScale
															}
															tableSecondColoumQuestions={
																row.dimension ===
																localizationConstants?.teachingAttitudes
																	? teacherAttitudesAssessmentQuestions
																	: row.dimension ===
																		  localizationConstants?.teachingPractices
																		? teacherPracticesAssessmentQuestions
																		: jobLifeSatisfactionAssessmentQuestions
															}
															handleCloseTable={
																handleCloseTable
															}
															scoreForRespectiveDomain={
																specificTeacherProfilingDetails[
																	row.dimension ===
																	localizationConstants?.teachingAttitudes
																		? 'teacherAttitudeReport'
																		: row.dimension ===
																			  localizationConstants?.teachingPractices
																			? 'teacherPracticeReport'
																			: 'teacherJobLifeSatisfactionReport'
																]
															}
														/>
													)}
											</Typography>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</Box>
			)}

			{/* DISC Performance Section */}
			{isDISCSelected && (
				<Box
					sx={{
						backgroundColor: '#fff',
						borderRadius: '8px',
						boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
						padding: 3,
						height: '280px',
						width: drawerWidth === 300 ? '1180px' : '1400px',
					}}
				>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							mb: 2,
						}}
					>
						<Typography
							variant={typographyConstants.h5}
							sx={{ fontWeight: 600 }}
						>
							{localizationConstants.DISCWisePerformance}
						</Typography>

						<Box sx={{ display: 'flex', gap: 3 }}>
							<Box sx={{ display: 'flex', alignItems: 'center' }}>
								<Box
									sx={{
										width: 25,
										height: 20,
										backgroundColor: '#25C548',
										borderRadius: 1,
										mr: 1,
									}}
								/>
								<Typography>5 &lt; = 3</Typography>
							</Box>

							<Box sx={{ display: 'flex', alignItems: 'center' }}>
								<Box
									sx={{
										width: 25,
										height: 20,
										backgroundColor: '#DD2A2B',
										borderRadius: 1,
										mr: 1,
									}}
								/>
								<Typography>0 &lt; = 2</Typography>
							</Box>
						</Box>
					</Box>

					<Box sx={{ display: 'flex', height: '173px' }}>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								mr: 1,
							}}
						>
							<Typography
								variant={typographyConstants.body2}
								sx={{
									writingMode: 'vertical-lr',
									textOrientation: 'sideways',
									transform: 'scale(-1)',
									whiteSpace: 'nowrap',
									fontWeight: 400,
								}}
							>
								Score
							</Typography>
						</Box>

						<Box sx={{ flex: 1 }}>
							<Bar
								data={discWisePerformanceData}
								options={generateChartOptions()}
							/>
							<Box
								sx={{
									display: 'flex',
									justifyContent: 'center',
									mt: 1,
								}}
							>
								<Typography
									variant={typographyConstants.body2}
									sx={{ fontWeight: 400 }}
								>
									DISC
								</Typography>
							</Box>
						</Box>
					</Box>
				</Box>
			)}
		</Box>
	)
}

export default TeacherProfilingReport
