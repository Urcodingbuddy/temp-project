import { Box } from '@mui/system'
import useCommonStyles from '../../../components/styles'
import { useDispatch, useSelector } from 'react-redux'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { useEffect, useRef, useState } from 'react'
import CustomButton from '../../../components/CustomButton'
import { Bar, Doughnut } from 'react-chartjs-2'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import {
	Dialog,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material'
import { teacherStyles } from './teacherProfilingStyles'
import { BaselineAnalyticsStyles } from '../../initiations/baseline/baselineAnalyticsStyles'
import {
	DISCWisePerformanceData,
	categoriesForTeacherCount,
	getBackgroundColorForCWR,
} from './teacherProfilingConstants'

import { Chart } from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import { generateChartOptions } from './teacherProfilingFunctions'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { getSchoolRankingsBasedOnTeachersProfilings } from './teacherProfilingSlice'
import NoIRIDataAvailableScreen from '../../../components/NoIRIDataAvailableScreen'
import { generatePDF } from '../../../utils/utils'

Chart.register(annotationPlugin)

const SpecificSchoolProfilingDetails = ({
	schoolData,
	viewSchoolReport = false,
	academicYear,
	schoolId,
	selectedSchoolFromAnalytics = null,
}) => {
	const dispatch = useDispatch()
	const { schoolRankingsBasedOnTeachersProfiling } = useSelector(
		(store) => store.teacherProfiling,
	)
	const [school, setSchool] = useState(schoolData || {})
	const [selectedSchoolId, setSelectedSchoolId] = useState(
		school?._id || schoolId || selectedSchoolFromAnalytics || '',
	)

	const isDISCSelected = school?.isDISCSelected
	const isTeachingAttitudeSelected = school?.isTeachingAttitudeSelected
	const isJobLifeSatisfactionSelected = school?.isJobLifeSatisfactionSelected
	const isTeachingPracticesSelected = school?.isTeachingPracticesSelected

	const captureUIRef = useRef(null)

	const flexStyles = useCommonStyles()

	const [downloadReportDialogOpen, setDownloadReportDialogOpen] =
		useState(false)

	const percentages = [
		school?.totalSubmittedTeacherCountForProfiling,
		school?.totalPendingTeacherCountForProfiling,
	]

	const [chartKey, setChartKey] = useState(0)

	// Update the key value whenever the totalTeacherCount changes
	useEffect(() => {
		setChartKey((prevKey) => prevKey + 1)
	}, [school.totalTeacherCount])

	const data = {
		labels: categoriesForTeacherCount,
		datasets: [
			{
				data: percentages,
				backgroundColor: ['#F8A70D', '#ECECEC'],
				hoverOffset: 2,
				borderRadius: 6,
				spacing: 7,
				weight: 10,
			},
		],
	}
	const options = {
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
			datalabels: {
				color: 'white',
				formatter: (value, context) => {
					if (value > 0) {
						const parsedValue = parseFloat(value)
						return parsedValue.toFixed(2).replace(/\.0+$/, '') + ''
					} else {
						return ''
					}
				},
				align: 'center',
				font: {
					size: 14,
					weight: 500,
				},
			},
			tooltip: {
				enabled: true,
				bodyFont: {
					size: 13,
				},
				bodySpacing: 5,
				padding: 15,
			},
		},
	}

	const captureUIAndDownloadPDF = async () => {
		await generatePDF(captureUIRef.current, {
			filename: 'schoolWiseProfilingReport.pdf',
			orientation: 'l',
			pageSize: 'a4',
			margin: 1,
		})
		setDownloadReportDialogOpen(false)
	}

	useEffect(() => {
		if (
			selectedSchoolFromAnalytics &&
			selectedSchoolFromAnalytics !== 'all'
		) {
			const foundSchool = schoolRankingsBasedOnTeachersProfiling?.find(
				(s) => s?._id === selectedSchoolFromAnalytics,
			)
			// Always set the school state, whether found or not
			setSchool(foundSchool || {})
			setSelectedSchoolId(selectedSchoolFromAnalytics)
		} else if (selectedSchoolFromAnalytics === 'all') {
			// Reset to empty state when "All" is selected
			setSchool({})
			setSelectedSchoolId('all')
		}
	}, [selectedSchoolFromAnalytics, schoolRankingsBasedOnTeachersProfiling])

	useEffect(() => {
		if (selectedSchoolId && selectedSchoolId !== 'all') {
			const foundSchool = schoolRankingsBasedOnTeachersProfiling?.find(
				(s) => s?._id === selectedSchoolId,
			)
			// Always set the school state, whether found or not
			setSchool(foundSchool || {})
		}
	}, [selectedSchoolId, schoolRankingsBasedOnTeachersProfiling])

	useEffect(() => {
		if (viewSchoolReport && selectedSchoolId) {
			const body = {
				academicYear: academicYear,
				school: selectedSchoolId,
			}
			dispatch(getSchoolRankingsBasedOnTeachersProfilings({ body }))
		}
	}, [viewSchoolReport, academicYear])

	return (
		<Box
			sx={{
				minWidth: '1000px',
			}}
			ref={captureUIRef}
		>
			{viewSchoolReport && Object.keys(school).length > 0 && (
				<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
					<CustomButton
						sx={{
							minWidth: '200px',
							height: '44px',
							marginTop: '19px',
						}}
						text={localizationConstants.generateReport}
						onClick={() => {
							setDownloadReportDialogOpen(true)
						}}
					/>
				</Box>
			)}

			<Box sx={{ width: '100%' }}>
				{Object.keys(school).length > 0 ? (
					<>
						<Box
							sx={{
								mt: '15px',
								mb: '15px',
								ml: '5px',
							}}
						>
							<Typography sx={{ fontWeight: 600 }}>
								{school.schoolName}
							</Typography>
						</Box>
						{/* First Dougnut Chart */}
						<Box
							sx={{
								gap: '20px',
							}}
						>
							<Box
								sx={{
									...teacherStyles?.questionBoxSx,
									height: '350px',
									width: '100%',
									gap: '80px',
								}}
							>
								<Box
									sx={{
										mt: '10px',
									}}
								>
									<Typography
										variant={typographyConstants.h4}
										sx={{ fontWeight: 600 }}
									>
										{
											localizationConstants.teacherProfilingSubmission
										}
									</Typography>
								</Box>
								<Box
									sx={{
										ml: '-100px',
										pt: '30px',
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										gap: '80px',
									}}
								>
									<Box>
										<Box
											sx={{
												display: 'flex',
												alignItems: 'center',
											}}
										>
											<Box
												sx={{
													width: '20px',
													height: '20px',
													backgroundColor: '#F8A70D',
													borderRadius: '4px',
													mr: 1,
												}}
											/>
											<Typography
												variant={
													typographyConstants.body2
												}
												component='div'
												sx={{ fontWeight: 400 }}
											>
												{
													localizationConstants.AssessmentSubmission
												}
											</Typography>
										</Box>
										<Typography
											variant={typographyConstants.body2}
											component='div'
											sx={{
												fontWeight: 400,
												ml: '30px',
											}}
										>
											{localizationConstants.byTeacher}
										</Typography>
									</Box>
									<Box
										sx={{
											display: 'flex',
											justifyContent: 'center',
											alignItems: 'center',
											gap: '40px',
										}}
									>
										<Box
											sx={{
												width: '230px',
												height: '230px',
												mt: '-20px',
											}}
										>
											<Doughnut
												key={chartKey}
												data={data}
												options={{ ...options }}
												plugins={[
													{
														id: 'textCenter',
														beforeDatasetsDraw(
															chart,
														) {
															const { ctx } =
																chart
															ctx.save()
															ctx.font =
																'14px Arial'
															ctx.textAlign =
																'center'
															ctx.textBaseline =
																'middle'
															ctx.fillStyle =
																'black'
															const y =
																chart.getDatasetMeta(
																	0,
																).data[0].y - 10
															ctx.fillText(
																localizationConstants?.totalTeachers,
																chart.getDatasetMeta(
																	0,
																).data[0].x,
																y,
															)

															ctx.font =
																'bold 17px Arial'
															ctx.fillStyle =
																'blue'

															ctx.fillText(
																school?.totalTeacherCount,
																chart.getDatasetMeta(
																	0,
																).data[0].x,
																y + 20,
															)
														},
													},
												]}
											/>
										</Box>
									</Box>
								</Box>
							</Box>

							{(isTeachingAttitudeSelected ||
								isTeachingPracticesSelected ||
								isJobLifeSatisfactionSelected ||
								isDISCSelected) && (
								/* Second Table */
								<Box
									sx={{
										...teacherStyles?.questionBoxSx,
										height: '170px',
										width: '100%',
										display: 'flex',
										flexDirection: 'column',
									}}
								>
									<Box>
										<Typography sx={{ fontWeight: 600 }}>
											{
												localizationConstants.attributeWiseScore
											}
										</Typography>
									</Box>
									<Box
										sx={{
											pt: '30px',

											width: '100%',
										}}
									>
										<TableContainer
											sx={{
												borderBottomRightRadius: '10px',
												borderBottomLeftRadius: '10px',
												borderTopLeftRadius: '10px',
												borderTopRightRadius: '10px',
												border: '1px solid #E2E2E2',
												width: '100%',
											}}
										>
											<Table
												aria-labelledby='tableTitle'
												size='small'
												stickyHeader
											>
												<TableHead>
													<TableRow>
														{isTeachingAttitudeSelected && (
															<TableCell
																sx={{
																	borderBottom:
																		'1px solid #E2E2E2',
																	backgroundColor:
																		'globalElementColors.lightBlue2',
																	fontWeight:
																		'bold',
																}}
															>
																<Typography
																	sx={{
																		fontWeight: 600,
																		display:
																			'inline-block',
																	}}
																>
																	{
																		localizationConstants.teachingAttitudes
																	}
																</Typography>
															</TableCell>
														)}
														{isTeachingPracticesSelected && (
															<TableCell
																sx={{
																	borderBottom:
																		'1px solid #E2E2E2',
																	backgroundColor:
																		'globalElementColors.lightBlue2',
																	fontWeight:
																		'bold',
																}}
																align='center'
															>
																<Typography
																	sx={{
																		fontWeight: 600,
																	}}
																>
																	{
																		localizationConstants.teachingPractices
																	}
																</Typography>
															</TableCell>
														)}
														{isJobLifeSatisfactionSelected && (
															<TableCell
																sx={{
																	borderBottom:
																		'1px solid #E2E2E2',
																	backgroundColor:
																		'globalElementColors.lightBlue2',
																	fontWeight:
																		'bold',
																}}
																align='center'
															>
																<Typography
																	sx={{
																		fontWeight: 600,
																	}}
																>
																	{
																		localizationConstants.jobLifeSatisfaction
																	}
																</Typography>
															</TableCell>
														)}
														{isDISCSelected && (
															<>
																<TableCell
																	sx={{
																		borderBottom:
																			'1px solid #E2E2E2',
																		backgroundColor:
																			'globalElementColors.lightBlue2',
																		fontWeight:
																			'bold',
																	}}
																	align='center'
																>
																	<Typography
																		sx={{
																			fontWeight: 600,
																		}}
																	>
																		{
																			localizationConstants.dominance
																		}
																	</Typography>
																</TableCell>
																<TableCell
																	sx={{
																		borderBottom:
																			'1px solid #E2E2E2',
																		backgroundColor:
																			'globalElementColors.lightBlue2',
																		fontWeight:
																			'bold',
																	}}
																	align='center'
																>
																	<Typography
																		sx={{
																			fontWeight: 600,
																		}}
																	>
																		{
																			localizationConstants.influence
																		}
																	</Typography>
																</TableCell>
																<TableCell
																	sx={{
																		borderBottom:
																			'1px solid #E2E2E2',
																		backgroundColor:
																			'globalElementColors.lightBlue2',
																		fontWeight:
																			'bold',
																	}}
																	align='center'
																>
																	<Typography
																		sx={{
																			fontWeight: 600,
																		}}
																	>
																		{
																			localizationConstants.steadiness
																		}
																	</Typography>
																</TableCell>
																<TableCell
																	sx={{
																		borderBottom:
																			'1px solid #E2E2E2',
																		backgroundColor:
																			'globalElementColors.lightBlue2',
																		fontWeight:
																			'bold',
																	}}
																	align='center'
																>
																	<Typography
																		sx={{
																			fontWeight: 600,
																		}}
																	>
																		{
																			localizationConstants.compliance
																		}
																	</Typography>
																</TableCell>
															</>
														)}
													</TableRow>
												</TableHead>
												<TableBody>
													<TableRow>
														{isTeachingAttitudeSelected && (
															<TableCell
																sx={{
																	borderBottom:
																		'1px solid #E2E2E2',
																	fontWeight: 200,
																	backgroundColor:
																		getBackgroundColorForCWR(
																			school.teacherAttitudeAvgForSchool?.toFixed(
																				2,
																			),
																		),
																}}
															>
																<Typography
																	variant='body2'
																	sx={{
																		fontWeight:
																			'light',
																	}}
																>
																	{school.teacherAttitudeAvgForSchool?.toFixed(
																		2,
																	)}
																</Typography>
															</TableCell>
														)}
														{isTeachingPracticesSelected && (
															<TableCell
																sx={{
																	borderBottom:
																		'1px solid #E2E2E2',
																	fontWeight: 300,
																	lineHeight: 1.43,
																	backgroundColor:
																		getBackgroundColorForCWR(
																			school.teacherPracticesAvgForSchool?.toFixed(
																				2,
																			),
																		),
																}}
																align='center'
															>
																<Typography
																	variant='body2'
																	sx={{
																		fontWeight:
																			'light',
																	}}
																>
																	{school.teacherPracticesAvgForSchool?.toFixed(
																		2,
																	)}
																</Typography>
															</TableCell>
														)}
														{isJobLifeSatisfactionSelected && (
															<TableCell
																sx={{
																	borderBottom:
																		'1px solid #E2E2E2',
																	fontWeight: 300,
																	lineHeight: 1.43,
																	backgroundColor:
																		getBackgroundColorForCWR(
																			school.teacherJobLifeSatisfactionAvgForSchool.toFixed(
																				2,
																			),
																		),
																}}
																align='center'
															>
																<Typography
																	variant='body2'
																	sx={{
																		fontWeight:
																			'light',
																	}}
																>
																	{school.teacherJobLifeSatisfactionAvgForSchool.toFixed(
																		2,
																	)}
																</Typography>
															</TableCell>
														)}
														{isDISCSelected && (
															<>
																<TableCell
																	sx={{
																		borderBottom:
																			'1px solid #E2E2E2',
																		fontWeight: 300,
																		lineHeight: 1.43,
																		backgroundColor:
																			getBackgroundColorForCWR(
																				school.teacherDominanceAvgForSchool.toFixed(
																					2,
																				),
																			),
																	}}
																	align='center'
																>
																	<Typography
																		variant='body2'
																		sx={{
																			fontWeight:
																				'light',
																		}}
																	>
																		{school.teacherDominanceAvgForSchool.toFixed(
																			2,
																		)}
																	</Typography>
																</TableCell>
																<TableCell
																	sx={{
																		borderBottom:
																			'1px solid #E2E2E2',
																		fontWeight: 300,
																		lineHeight: 1.43,
																		backgroundColor:
																			getBackgroundColorForCWR(
																				school.teacherInfluenceAvgForSchool.toFixed(
																					2,
																				),
																			),
																	}}
																	align='center'
																>
																	<Typography
																		variant='body2'
																		sx={{
																			fontWeight:
																				'light',
																		}}
																	>
																		{school.teacherInfluenceAvgForSchool.toFixed(
																			2,
																		)}
																	</Typography>
																</TableCell>
																<TableCell
																	sx={{
																		borderBottom:
																			'1px solid #E2E2E2',
																		fontWeight: 300,
																		lineHeight: 1.43,
																		backgroundColor:
																			getBackgroundColorForCWR(
																				school.teacherSteadinessAvgForSchool.toFixed(
																					2,
																				),
																			),
																	}}
																	align='center'
																>
																	<Typography
																		variant='body2'
																		sx={{
																			fontWeight:
																				'light',
																		}}
																	>
																		{school.teacherSteadinessAvgForSchool.toFixed(
																			2,
																		)}
																	</Typography>
																</TableCell>
																<TableCell
																	sx={{
																		borderBottom:
																			'1px solid #E2E2E2',
																		fontWeight: 300,
																		lineHeight: 1.43,
																		backgroundColor:
																			getBackgroundColorForCWR(
																				school.teacherComplianceAvgForSchool.toFixed(
																					2,
																				),
																			),
																	}}
																	align='center'
																>
																	<Typography
																		variant='body2'
																		sx={{
																			fontWeight:
																				'light',
																		}}
																	>
																		{school.teacherComplianceAvgForSchool.toFixed(
																			2,
																		)}
																	</Typography>
																</TableCell>
															</>
														)}
													</TableRow>
												</TableBody>
											</Table>
										</TableContainer>
									</Box>
								</Box>
							)}
						</Box>

						{isDISCSelected && (
							/* DISC Wise Performance */
							<Box
								sx={{
									...teacherStyles?.boxGraphSx,
									mt: '16px',
									height: '280px',
									width: '100%',
									p: '20px',
								}}
							>
								<Box
									sx={{
										display: 'flex',
										justifyContent: 'space-between',
									}}
								>
									<Typography
										variant={typographyConstants.h5}
										sx={{ fontWeight: 600, pb: '10px' }}
									>
										{
											localizationConstants.DISCWisePerformance
										}
									</Typography>

									<Box
										sx={{
											display: 'flex',
											justifyContent: 'space-between',
											gap: '20px',
										}}
									>
										<Box
											sx={{
												display: 'flex',
												justifyContent: 'space-between',
												alignItems: 'center',
											}}
										>
											<Box
												sx={{
													width: '25px',
													height: '20px',
													backgroundColor: '#25C548',
													borderRadius: '4px',
												}}
											/>
											<Typography sx={{ ml: 1 }}>
												5 &lt; = 3
											</Typography>
										</Box>

										<Box
											sx={{
												display: 'flex',
												justifyContent: 'space-between',
												alignItems: 'center',
											}}
										>
											<Box
												sx={{
													width: '25px',
													height: '20px',
													backgroundColor: '#DD2A2B',
													borderRadius: '4px',
												}}
											/>
											<Typography sx={{ ml: 1 }}>
												0 &lt; = 2
											</Typography>
										</Box>
									</Box>
								</Box>
								<Box
									sx={{
										height: '173px',
										mt: '20px',
										display: 'flex',
									}}
								>
									<Box
										sx={{
											display: 'flex',
											alignItems: 'center',
										}}
									>
										<Typography
											sx={{
												writingMode: 'vertical-lr',
												textOrientation: 'sideways',
												transform: 'scale(-1)',
												whiteSpace: 'nowrap',
												marginRight: '5px',
												fontWeight: 400,
											}}
											variant={typographyConstants.body2}
										>
											Score
										</Typography>
									</Box>
									<Box
										sx={{
											flexGrow: 1,
											width: '98%',
										}}
									>
										<Bar
											data={DISCWisePerformanceData([
												school.teacherDominanceAvgForSchool.toFixed(
													2,
												),
												school.teacherInfluenceAvgForSchool.toFixed(
													2,
												),
												school.teacherSteadinessAvgForSchool.toFixed(
													2,
												),
												school.teacherComplianceAvgForSchool.toFixed(
													2,
												),
											])}
											options={generateChartOptions()}
										/>
										<Box
											sx={{
												display: 'flex',
												ml: '45%',
											}}
										>
											<Typography
												variant={
													typographyConstants.body2
												}
												sx={{ fontWeight: 400 }}
											>
												{localizationConstants.DISC}
											</Typography>
										</Box>
									</Box>
								</Box>
							</Box>
						)}
					</>
				) : (
					<NoIRIDataAvailableScreen
						message={
							localizationConstants?.NoSchoolProfilingAnalyticDataAvailable
						}
					/>
				)}
			</Box>

			<Dialog open={downloadReportDialogOpen}>
				<Box
					sx={{
						borderRadius: '10px',
						width: '500px',
					}}
				>
					<Box sx={{ padding: '20px 30px 38px 30px' }}>
						<Box className={flexStyles.flexRowCenterSpaceBetween}>
							<Typography
								variant={typographyConstants.h4}
								sx={{
									fontWeight: 500,
									color: 'textColors.blue',
								}}
							>
								{localizationConstants.generateReport}
							</Typography>
							<CustomIcon
								name={iconConstants.cancelRounded}
								style={{
									cursor: 'pointer',
									width: '26px',
									height: '26px',
								}}
								svgStyle={'width: 26px; height: 26px'}
								onClick={() => {
									setDownloadReportDialogOpen(false)
								}}
							/>
						</Box>
						<Box sx={{ marginTop: '20px', textAlign: 'center' }}>
							<Typography color={'globalElementColors.gray1'}>
								{
									localizationConstants.downloadTeacherProfilingAnalyticsForSpecificSchoolPDFReportMsg
								}
							</Typography>
						</Box>
						<Box
							sx={{ mt: '20px' }}
							className={flexStyles.flexColumnCenter}
						>
							<CustomButton
								sx={{
									...BaselineAnalyticsStyles.changeButtonSx,
								}}
								disabled={!(selectedSchoolId?.length > 0)}
								text={localizationConstants.download}
								onClick={captureUIAndDownloadPDF}
								endIcon={
									<Box sx={{ marginLeft: '1rem' }}>
										{' '}
										<CustomIcon
											name={iconConstants.downloadWhite}
											style={{
												width: '20px',
												height: '30px',
												marginRight: '10px',
											}}
											svgStyle={
												'width: 20px; height: 30px '
											}
										/>
									</Box>
								}
							/>
						</Box>
					</Box>
				</Box>
			</Dialog>
		</Box>
	)
}

export default SpecificSchoolProfilingDetails
