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
import { teacherStyles } from './teacherIRIStyles'
import { BaselineAnalyticsStyles } from '../../initiations/baseline/baselineAnalyticsStyles'
import {
	categoriesForTeacherCount,
	domainWiseFemaleData,
	domainWiseMailData,
} from './teacherIRIConstants'

import { Chart } from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import { generateChartOptionsForDomainWiseMale } from './teacherFunctions'

import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { getSchoolRankingsBasedOnTeachersIRI } from './teacherIRISlice'
import NoIRIDataAvailableScreen from '../../../components/NoIRIDataAvailableScreen'
import { generatePDF } from '../../../utils/utils'

Chart.register(annotationPlugin)

const SpecificSchoolIRIDetails = ({
	schoolData,
	viewSchoolReport = false,
	academicYear,
	schoolId,
	selectedSchoolFromAnalytics = null, //  prop to handle school selection from analytics
}) => {
	const dispatch = useDispatch()
	const { schoolRankingsBasedOnTeachersIRI } = useSelector(
		(store) => store.teacherIRI,
	)

	// Initialize school state based on the context
	const [school, setSchool] = useState(schoolData || {})
	const [selectedSchoolId, setSelectedSchoolId] = useState(
		school?._id || schoolId || selectedSchoolFromAnalytics || '',
	)

	const captureUIRef = useRef(null)

	const flexStyles = useCommonStyles()
	const { drawerWidth } = useSelector((store) => store.dashboardSliceSetup)
	const [downloadReportDialogOpen, setDownloadReportDialogOpen] =
		useState(false)

	useEffect(() => {
		if (
			selectedSchoolFromAnalytics &&
			selectedSchoolFromAnalytics !== 'all'
		) {
			const foundSchool =
				schoolRankingsBasedOnTeachersIRI?.subScaleWisePerformanceOfSchools?.find(
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
	}, [selectedSchoolFromAnalytics, schoolRankingsBasedOnTeachersIRI])

	const DomainWiseMailData = [
		school?.maleAvg?.perspectiveTakingScale,
		school?.maleAvg?.fantasyScale,
		school?.maleAvg?.empathicConcern,
		school?.maleAvg?.personalDistressScale,
	]
	const DomainWiseFemaleData = [
		school?.feMaleAvg?.perspectiveTakingScale,
		school?.feMaleAvg?.fantasyScale,
		school?.feMaleAvg?.empathicConcern,
		school?.feMaleAvg?.personalDistressScale,
	]

	const percentages = [
		school?.totalSubmittedTeacherCount,
		school?.totalPendingTeacherCount,
	]

	const rows = [
		{
			dimension: 'Perspective Taking',
			rank: school.perspectiveTakingPercentile?.toFixed(2),
			schoolScore:
				school?.scaleScore?.[0].perspectiveTakingScale?.toFixed(2),
			topScore: school?.topScores?.perspectiveTakingScale?.toFixed(2),
		},
		{
			dimension: 'Vicarious Empathy / Imagination',
			rank: school.fantasyScalePercentile?.toFixed(2),
			schoolScore: school?.scaleScore?.[0].fantasyScale?.toFixed(2),
			topScore: school?.topScores?.fantasyScale?.toFixed(2),
		},
		{
			dimension: 'Empathic Concern',
			rank: school.empathicConcernPercentile?.toFixed(2),
			schoolScore:
				school?.scaleScore?.[0].empathicConcernScale?.toFixed(2),
			topScore: school?.topScores?.empathicConcernScale?.toFixed(2),
		},
		{
			dimension: 'Altruistic Reactivity',
			rank: school.personalDistressPercentile?.toFixed(2),
			schoolScore:
				school?.scaleScore?.[0].personalDistressScale?.toFixed(2),
			topScore: school?.topScores?.personalDistressScale?.toFixed(2),
		},
	]
	const data = {
		labels: categoriesForTeacherCount,
		datasets: [
			{
				data: percentages,
				backgroundColor: ['#1E9E3A', '#DD2A2B'],
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
			filename: 'schoolWiseIRIReport.pdf',
			orientation: 'l',
			pageSize: 'a4',
			margin: 1,
		})
		setDownloadReportDialogOpen(false)
	}

	useEffect(() => {
		if (selectedSchoolId && selectedSchoolId !== 'all') {
			const foundSchool =
				schoolRankingsBasedOnTeachersIRI?.subScaleWisePerformanceOfSchools?.find(
					(s) => s?._id === selectedSchoolId,
				)
			// Always set the school state, whether found or not
			setSchool(foundSchool || {})
		}
	}, [selectedSchoolId, schoolRankingsBasedOnTeachersIRI])

	useEffect(() => {
		if (viewSchoolReport) {
			const body = {
				academicYear: academicYear,
			}
			dispatch(getSchoolRankingsBasedOnTeachersIRI({ body }))
		}
	}, [viewSchoolReport, academicYear])

	return (
		<Box ref={captureUIRef}>
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
							display: 'flex',
							gap: '20px',
						}}
					>
						<Box
							sx={{
								...teacherStyles?.questionBoxSx,
								height: '350px',
								width: '50%',
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								gap: '80px',
							}}
						>
							<Box
								sx={{
									pl: drawerWidth === 300 ? '7%' : '7%',
									pt: '30px',
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									gap: '80px',
								}}
							>
								<Box
									sx={{
										mt: '-30px',
										mb: '15px',
										ml: '-70px',
									}}
								>
									<Typography
										variant={typographyConstants.h4}
										sx={{ fontWeight: 600 }}
									>
										{localizationConstants.totalTeachers}
									</Typography>

									<Typography
										variant={typographyConstants.h4}
										sx={{
											fontWeight: 600,
											mt: '10px',
											color: '#013C7E',
										}}
									>
										{school.totalTeacherCount}
									</Typography>

									<Box
										sx={{
											mt: '50px',
										}}
									>
										<Box
											sx={{
												...BaselineAnalyticsStyles?.categoryColorSx,
												pt: '25px',
											}}
										>
											<Box
												sx={{
													...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
													backgroundColor: '#1E9E3A',
												}}
											/>
											<Typography
												variant={typographyConstants.h5}
												sx={{
													pl: '10px',
													fontSize: '16px',
												}}
											>
												{
													localizationConstants.submitted
												}
											</Typography>
										</Box>
										<Box
											sx={{
												...BaselineAnalyticsStyles?.categoryColorSx,
											}}
										>
											<Box
												sx={{
													...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
													backgroundColor: '#DD2A2B',
												}}
											/>
											<Typography
												variant={typographyConstants.h5}
												sx={{
													pl: '10px',
													fontSize: '16px',
												}}
											>
												{localizationConstants.pending}
											</Typography>
										</Box>
									</Box>
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
											data={data}
											options={{ ...options }}
										/>
									</Box>
								</Box>
							</Box>
						</Box>

						{/* Second Table */}
						<Box
							sx={{
								...teacherStyles?.questionBoxSx,
								height: '350px',
								position: 'relative',
								width: drawerWidth === 300 ? '50%' : '50%',
							}}
						>
							<Box
								sx={{
									pl: drawerWidth === 300 ? '-10ppx' : '50px',
								}}
							>
								<Typography sx={{ fontWeight: 600 }}>
									{
										localizationConstants.schoolRankInDimensions
									}
								</Typography>
							</Box>
							<Box
								sx={{
									pt: '30px',
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									mt: '-250px',
								}}
							>
								<Box
									sx={{
										pl:
											drawerWidth === 300
												? '0px'
												: '50px',
										position: 'absolute',
										top: '60px',
										left: '20px',
									}}
								>
									<TableContainer
										sx={{
											borderBottomRightRadius: '10px',
											borderBottomLeftRadius: '10px',
											borderTopLeftRadius: '10px',
											borderTopRightRadius: '10px',
											border: '1px solid #E2E2E2',
										}}
									>
										<Table
											aria-labelledby='tableTitle'
											size='small'
											stickyHeader
										>
											<TableHead>
												<TableRow>
													<TableCell
														sx={{
															borderBottom:
																'1px solid #E2E2E2',
															backgroundColor:
																'globalElementColors.lightBlue2',
															fontWeight: 'bold',
														}}
													>
														<Typography
															sx={{
																fontWeight: 600,
															}}
														>
															{
																localizationConstants.Dimensions
															}
														</Typography>
													</TableCell>
													<TableCell
														sx={{
															borderBottom:
																'1px solid #E2E2E2',
															backgroundColor:
																'globalElementColors.lightBlue2',
															fontWeight: 'bold',
														}}
														align='center'
													>
														<Typography
															sx={{
																fontWeight: 600,
																whiteSpace:
																	'nowrap',
															}}
														>
															{
																localizationConstants.percentile
															}
														</Typography>
													</TableCell>
													<TableCell
														sx={{
															borderBottom:
																'1px solid #E2E2E2',
															backgroundColor:
																'globalElementColors.lightBlue2',
															fontWeight: 'bold',
														}}
														align='center'
													>
														<Typography
															sx={{
																fontWeight: 600,
															}}
														>
															{
																localizationConstants.schoolScore
															}
														</Typography>
													</TableCell>

													<TableCell
														sx={{
															borderBottom:
																'1px solid #E2E2E2',
															backgroundColor:
																'globalElementColors.lightBlue2',
															fontWeight: 'bold',
														}}
														align='center'
													>
														<Typography
															sx={{
																fontWeight: 600,
															}}
														>
															{
																localizationConstants.topScore
															}
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
																fontWeight: 200,
															}}
														>
															<Typography
																variant='body2'
																sx={{
																	fontWeight:
																		'light',
																	whiteSpace:
																		'nowrap',
																}}
															>
																{row.dimension}
															</Typography>
														</TableCell>

														<TableCell
															sx={{
																borderBottom:
																	'1px solid #E2E2E2',
																fontWeight: 300,
																lineHeight: 1.43,
															}}
															align='center'
														>
															<Typography
																variant='body2'
																sx={{
																	fontWeight:
																		'light',
																	whiteSpace:
																		'nowrap',
																}}
															>
																{row.rank}
															</Typography>
														</TableCell>
														<TableCell
															sx={{
																borderBottom:
																	'1px solid #E2E2E2',
																fontWeight: 300,
																lineHeight: 1.43,
															}}
															align='center'
														>
															<Typography
																variant='body2'
																sx={{
																	fontWeight:
																		'light',
																	whiteSpace:
																		'nowrap',
																}}
															>
																{
																	row.schoolScore
																}
															</Typography>
														</TableCell>

														<TableCell
															sx={{
																borderBottom:
																	'1px solid #E2E2E2',
																fontWeight: 300,
																lineHeight: 1.43,
															}}
															align='center'
														>
															<Typography
																variant='body2'
																sx={{
																	fontWeight:
																		'light',
																	whiteSpace:
																		'nowrap',
																}}
															>
																{row.topScore}
															</Typography>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</TableContainer>

									<Box
										sx={{
											display: 'flex',
											height: '40px',
											mt: '40px',
										}}
									>
										<Typography
											variant='body2'
											sx={{
												ml: '15px',
											}}
										>
											{
												localizationConstants.percentileScoreOfSchool
											}
										</Typography>

										<Typography
											variant='body2'
											sx={{
												ml: '80px',
											}}
										>
											{`${school?.percentile?.toFixed(2)}
                        `}
										</Typography>
									</Box>
								</Box>
							</Box>
						</Box>
					</Box>

					<Box
						sx={{
							pt: '30px',
							display: 'flex',
							gap: '30px',
						}}
					>
						<Box
							sx={{
								...teacherStyles?.boxGraphSx,
								overflowX: 'auto',
								overflowY: 'hidden',
							}}
						>
							<Typography
								variant={typographyConstants.h5}
								sx={{ fontWeight: 600, pb: '10px' }}
							>
								{localizationConstants.domainWiseMale}
							</Typography>
							<Box
								sx={{
									height: '173px',
									width: '650px',
								}}
							>
								<Bar
									data={domainWiseMailData(
										DomainWiseMailData,
									)}
									options={generateChartOptionsForDomainWiseMale(
										school.maleAvg.average,
									)}
								/>
							</Box>
						</Box>
						<Box
							sx={{
								...teacherStyles?.boxGraphSx,
								overflowX: 'auto',
								overflowY: 'hidden',
							}}
						>
							<Typography
								variant={typographyConstants.h5}
								sx={{ fontWeight: 600, pb: '10px' }}
							>
								{localizationConstants.domainWiseFemale}
							</Typography>
							<Box
								sx={{
									height: '173px',
									width: '650px',
								}}
							>
								<Bar
									data={domainWiseFemaleData(
										DomainWiseFemaleData,
									)}
									options={generateChartOptionsForDomainWiseMale(
										school.feMaleAvg.average,
									)}
								/>
							</Box>
						</Box>
					</Box>
				</>
			) : (
				<NoIRIDataAvailableScreen
					message={
						localizationConstants?.NoSchoolIRIAnalyticDataAvailable
					}
				/>
			)}
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
						<Box sx={{ marginTop: '20px', textAlign: 'start' }}>
							<Typography color={'globalElementColors.gray1'}>
								{
									localizationConstants.downloadTeacherIRIAnalyticalPDFReportMsg
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

export default SpecificSchoolIRIDetails
