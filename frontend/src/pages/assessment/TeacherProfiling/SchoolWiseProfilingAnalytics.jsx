import { Box } from '@mui/system'
import { useDispatch, useSelector } from 'react-redux'
import useCommonStyles from '../../../components/styles'

import { useEffect, useRef, useState } from 'react'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomButton from '../../../components/CustomButton'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { Dialog, Typography } from '@mui/material'
import { BaselineAnalyticsStyles } from '../../initiations/baseline/baselineAnalyticsStyles'
import { Bar } from 'react-chartjs-2'
import Chart from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { getSchoolRankingsBasedOnTeachersProfilings } from './teacherProfilingSlice'
import {
	BarDataForDomainWisePerformance,
	ChartOptionsForTeacherProfiling,
	DISCWiseReportData,
	optionsForDISCWisePerformanceSchool,
	optionsForDomainWisePerformanceReport,
	teacherProfilingData,
} from './teacherProfilingFunctions'
import { iconConstants } from '../../../resources/theme/iconConstants'
import CustomIcon from '../../../components/CustomIcon'
import { teacherStyles } from './teacherProfilingStyles'
import {
	generatePDF,
	getAcademicYearsList,
	getCurrentAcademicYearId,
} from '../../../utils/utils'
import SpecificSchoolProfilingDetails from './SpecificSchoolProfilingDetails'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'
import NoIRIDataAvailableScreen from '../../../components/NoIRIDataAvailableScreen'

Chart.register(ChartDataLabels)

const SchoolWiseProfilingAnalytics = () => {
	const dispatch = useDispatch()
	const [school, setSchool] = useState(null)
	const flexStyles = useCommonStyles()
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const { schoolsList } = useSelector((store) => store.commonData)
	const { schoolRankingsBasedOnTeachersProfiling } = useSelector(
		(store) => store.teacherProfiling,
	)

	const [selectedDropdownData, setSelectedDropdownData] = useState({
		selectedAys: '',
		schools: 'all',
	})

	const [showSpecificSchool, setShowSpecificSchool] = useState(false)

	const [downloadReportDialogOpen, setDownloadReportDialogOpen] =
		useState(false)
	const captureUIRef = useRef(null)

	const captureUIAndDownloadPDF = async () => {
		await generatePDF(captureUIRef.current, {
			filename: 'Specific School Profiling Report.pdf',
			orientation: 'l',
			pageSize: 'a4',
			margin: 5,
		})
		setTimeout(() => {
			setDownloadReportDialogOpen(false)
		}, 100)
	}

	const dataForTeacherProfiling = teacherProfilingData(
		schoolRankingsBasedOnTeachersProfiling,
	)

	const dataForDomainWisePerformanceReport = BarDataForDomainWisePerformance(
		schoolRankingsBasedOnTeachersProfiling?.filter(
			(school) =>
				school.isTeachingAttitudeSelected ||
				school.isTeachingPracticesSelected ||
				school.isJobLifeSatisfactionSelected,
		),
	)

	const dataForDISCWiseReport = DISCWiseReportData(
		schoolRankingsBasedOnTeachersProfiling?.filter(
			(school) => school.isDISCSelected,
		),
	)

	useEffect(() => {
		if (selectedDropdownData?.selectedAys?.length > 0) {
			const body = {
				academicYear: selectedDropdownData.selectedAys,
			}
			dispatch(getSchoolRankingsBasedOnTeachersProfilings({ body }))
		}
	}, [selectedDropdownData.selectedAys])

	useEffect(() => {
		const foundSchool = schoolRankingsBasedOnTeachersProfiling?.find(
			(s) => s?._id === selectedDropdownData.schools,
		)
		// Explicitly handle both cases: found and not found
		if (foundSchool) {
			setSchool(foundSchool)
		} else {
			setSchool(null) // Clear previous school data when no data exists
		}
	}, [selectedDropdownData.schools, schoolRankingsBasedOnTeachersProfiling])

	useEffect(() => {
		// Show specific school only when a specific school is selected (not 'all')
		if (
			selectedDropdownData.schools &&
			selectedDropdownData.schools !== 'all'
		) {
			setShowSpecificSchool(true)
		} else {
			setShowSpecificSchool(false)
		}
	}, [selectedDropdownData.schools])

	const isInitialLoad = useRef(true)

	useEffect(() => {
		if (academicYears.length > 0 && isInitialLoad.current) {
			const currentAYId = getCurrentAcademicYearId(academicYears)
			if (currentAYId) {
				setSelectedDropdownData((state) => ({
					...state,
					selectedAys: currentAYId,
				}))
			}
			isInitialLoad.current = false
		}
	}, [academicYears])

	useEffect(() => {
		if (
			selectedDropdownData?.selectedAys?.length === 0 &&
			academicYears.length > 0
		) {
			const currentAYId = getCurrentAcademicYearId(academicYears)
			if (currentAYId) {
				setSelectedDropdownData((state) => ({
					...state,
					selectedAys: currentAYId,
				}))
			}
		}
	}, [selectedDropdownData.selectedAys, academicYears])

	return (
		<>
			<Box
				ref={captureUIRef}
				sx={{
					minWidth: '1000px',
				}}
			>
				<Box
					className={flexStyles.flexRowCenterSpaceBetween}
					sx={{ width: '100%' }}
					gap={'16px'}
				>
					<Box sx={{ width: '27%' }}>
						<Typography variant={typographyConstants.body}>
							{localizationConstants.academicYear}
						</Typography>
						<CustomAutocompleteNew
							fieldSx={{ minHeight: '44px' }}
							value={selectedDropdownData?.selectedAys}
							onChange={(e) => {
								setSelectedDropdownData((state) => ({
									...state,
									selectedAys: e,
									schools: 'all',
								}))
							}}
							options={getAcademicYearsList(academicYears) || []}
						/>
					</Box>
					<Box sx={{ flexGrow: 1 }}>
						<Typography variant={typographyConstants.body}>
							{localizationConstants.school}
						</Typography>
						<CustomAutocompleteNew
							sx={{ flexGrow: 1, width: '100%' }}
							fieldSx={{
								borderRadius: '4px',
								mb: '3px',
								height: '44px',
							}}
							value={selectedDropdownData?.schools}
							placeholder={`${localizationConstants.select} ${localizationConstants.school}`}
							onChange={(e) => {
								const selectedValue = e || 'all'
								setSelectedDropdownData((state) => ({
									...state,
									schools: selectedValue,
								}))
							}}
							options={
								schoolsList
									? [
											{ id: 'all', label: 'All' },
											...schoolsList.map((sc) => ({
												id: sc._id,
												label: sc.school,
											})),
										]
									: []
							}
						/>
					</Box>
					<CustomButton
						sx={{
							minWidth: '200px',
							height: '44px',
							marginTop: '19px',
						}}
						text={localizationConstants.generateReport}
						onClick={() => setDownloadReportDialogOpen(true)}
						disabled={
							schoolRankingsBasedOnTeachersProfiling?.length === 0
						}
					/>
				</Box>
				{schoolRankingsBasedOnTeachersProfiling?.length > 0 ? (
					<>
						{showSpecificSchool ? (
							<SpecificSchoolProfilingDetails
								schoolData={school}
								selectedSchoolFromAnalytics={
									selectedDropdownData.schools
								}
							/>
						) : (
							<>
								{/* Teacher Profiling */}
								<Box>
									<Box
										sx={{
											...BaselineAnalyticsStyles.tableBoxSx,
											height: '346px',
											alignItems: 'left',
										}}
									>
										<Box
											className={
												flexStyles.flexRowCenterSpaceBetween
											}
										>
											<Typography
												variant={typographyConstants.h5}
												sx={{
													marginLeft: '1rem',
													mt: '1rem',
													fontWeight: '600',
												}}
											>
												{
													localizationConstants.teacherProfiling
												}
											</Typography>
											<Box
												className={
													flexStyles.flexRowCenter
												}
												sx={{ mt: '1rem', mr: '1rem' }}
											>
												<Box
													sx={{
														...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
														backgroundColor:
															'#0267D9',
													}}
												/>
												<Typography
													variant={
														typographyConstants.h5
													}
													sx={{
														pl: '7px',
														pr: '7px',
													}}
												>
													{
														localizationConstants.totalTeachers
													}
												</Typography>
												<Box
													sx={{
														...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
														backgroundColor:
															'#F5890D',
													}}
												/>
												<Typography
													variant={
														typographyConstants.h5
													}
													sx={{
														pl: '7px',
														pr: '7px',
													}}
												>
													{
														localizationConstants.totalSubmissionOfAssessment
													}
												</Typography>
											</Box>
										</Box>

										<Box
											sx={{
												overflowX: 'auto',
												ml: '20px',
											}}
										>
											<Box
												sx={{
													width: `${
														dataForTeacherProfiling
															?.labels?.length > 1
															? dataForTeacherProfiling
																	?.labels
																	?.length *
																200
															: dataForTeacherProfiling
																	?.labels
																	?.length *
																250
													}px`,
													height: '290px',
												}}
											>
												<Bar
													data={
														dataForTeacherProfiling
													}
													options={ChartOptionsForTeacherProfiling(
														false,
														true,
													)}
												/>
											</Box>
										</Box>
									</Box>
								</Box>
								{/* Domain Wise Performance (All Schools) */}
								{dataForDomainWisePerformanceReport.datasets.some(
									(dataset) => dataset?.data?.length > 0,
								) && (
									<Box>
										<Box
											sx={{
												...BaselineAnalyticsStyles.tableBoxSx,
												height: '346px',
												alignItems: 'left',
											}}
										>
											<Box
												className={
													flexStyles.flexRowCenterSpaceBetween
												}
											>
												<Typography
													variant={
														typographyConstants.h5
													}
													sx={{
														marginLeft: '1rem',
														mt: '1rem',
														fontWeight: '600',
													}}
												>
													{
														localizationConstants.DomainWisePerformanceAllSchools
													}
												</Typography>
												<Box
													className={
														flexStyles.flexRowCenter
													}
													sx={{
														mt: '1rem',
														mr: '1rem',
													}}
												>
													{dataForDomainWisePerformanceReport
														.datasets[0].data
														?.length > 0 && (
														<>
															<Box
																sx={{
																	...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
																	backgroundColor:
																		'#97576E',
																}}
															/>
															<Typography
																variant={
																	typographyConstants.h5
																}
																sx={{
																	pl: '7px',
																	pr: '7px',
																}}
															>
																{
																	localizationConstants.teachingAttitude
																}
															</Typography>
														</>
													)}
													{dataForDomainWisePerformanceReport
														.datasets[1].data
														?.length > 0 && (
														<>
															<Box
																sx={{
																	...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
																	backgroundColor:
																		'#DD952A',
																}}
															/>
															<Typography
																variant={
																	typographyConstants.h5
																}
																sx={{
																	pl: '7px',
																	pr: '7px',
																}}
															>
																{
																	localizationConstants.teachingPractices
																}
															</Typography>
														</>
													)}
													{dataForDomainWisePerformanceReport
														.datasets[2]?.data
														?.length > 0 && (
														<>
															<Box
																sx={{
																	...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
																	backgroundColor:
																		'#0D7F8E',
																}}
															/>
															<Typography
																variant={
																	typographyConstants.h5
																}
																sx={{
																	pl: '7px',
																	pr: '7px',
																}}
															>
																{
																	localizationConstants.jobLifeSatisfaction
																}
															</Typography>
														</>
													)}
												</Box>
											</Box>

											<Box
												sx={{
													overflowX: 'auto',
												}}
											>
												<Box
													sx={{
														width: `${
															dataForDomainWisePerformanceReport
																?.labels
																?.length > 1
																? dataForDomainWisePerformanceReport
																		?.labels
																		?.length *
																	230
																: dataForDomainWisePerformanceReport
																		?.labels
																		?.length *
																	240
														}px`,
														height: '290px',
													}}
												>
													<Bar
														data={
															dataForDomainWisePerformanceReport
														}
														options={optionsForDomainWisePerformanceReport(
															schoolRankingsBasedOnTeachersProfiling,
														)}
													/>
												</Box>
											</Box>
										</Box>
									</Box>
								)}
								{/* DISC Wise Performance ( All Schools) */}
								{dataForDISCWiseReport.datasets.some(
									(dataset) => dataset?.data?.length > 0,
								) && (
									<Box
										sx={{
											mt: '30px',
											display: 'flex',
											gap: '20px',
											width: '100% ',
										}}
									>
										<Box
											sx={{
												...teacherStyles?.boxGraphSx,
												pt: '20px',
												height: '400px',
												width: '100% ',
											}}
										>
											<Box
												sx={{
													display: 'flex',
													justifyContent:
														'space-between',
												}}
											>
												<Typography
													variant={
														typographyConstants.h5
													}
													sx={{
														fontWeight: 600,
														pb: '10px',
													}}
												>
													{
														localizationConstants.DISCWisePerformanceAllSchools
													}
												</Typography>

												<Box
													sx={{
														display: 'flex',
														justifyContent:
															'space-between',
														gap: '20px',
													}}
												>
													<Box
														sx={{
															display: 'flex',
															justifyContent:
																'space-between',
															alignItems:
																'center',
														}}
													>
														<Box
															sx={{
																width: '25px',
																height: '20px',
																backgroundColor:
																	'#25C548',
																borderRadius:
																	'4px',
															}}
														/>
														<Typography
															sx={{ ml: 1 }}
														>
															5 &lt; = 3
														</Typography>
													</Box>

													<Box
														sx={{
															display: 'flex',
															justifyContent:
																'space-between',
															alignItems:
																'center',
														}}
													>
														<Box
															sx={{
																width: '25px',
																height: '20px',
																backgroundColor:
																	'#DD2A2B',
																borderRadius:
																	'4px',
															}}
														/>
														<Typography
															sx={{ ml: 1 }}
														>
															0 &lt; = 2
														</Typography>
													</Box>
												</Box>
											</Box>
											<Box
												sx={{
													display: 'flex',
													justifyContent: 'end',
												}}
											>
												<Typography sx={{ ml: 1 }}>
													{
														localizationConstants?.dominance
													}
												</Typography>
												<Typography sx={{ ml: 1 }}>
													{
														localizationConstants?.influence
													}
												</Typography>
												<Typography sx={{ ml: 1 }}>
													{
														localizationConstants?.steadiness
													}
												</Typography>
												<Typography sx={{ ml: 1 }}>
													{
														localizationConstants?.compliance
													}
												</Typography>
											</Box>
											<Box
												sx={{
													minHeight: '173px',
													mt: '20px',
													display: 'flex',
													width: '100%',
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
															writingMode:
																'vertical-lr',
															textOrientation:
																'sideways',
															transform:
																'scale(-1)',
															whiteSpace:
																'nowrap',
															marginRight: '5px',
															fontWeight: 400,
														}}
														variant={
															typographyConstants.body2
														}
													>
														Score
													</Typography>
												</Box>
												<Box sx={{ overflow: 'auto' }}>
													<Box
														sx={{
															width: `${
																dataForDISCWiseReport
																	?.labels
																	?.length > 1
																	? dataForDISCWiseReport
																			?.labels
																			?.length *
																		230
																	: dataForDISCWiseReport
																			?.labels
																			?.length *
																		280
															}px`,
															height: '290px',
														}}
													>
														<Bar
															data={
																dataForDISCWiseReport
															}
															options={optionsForDISCWisePerformanceSchool()}
														/>
													</Box>
												</Box>
											</Box>
										</Box>
									</Box>
								)}
							</>
						)}
					</>
				) : (
					<NoIRIDataAvailableScreen
						message={
							localizationConstants?.NoProfilingAnalyticDataAvailableForAY
						}
					/>
				)}
			</Box>

			{/*----------------- PDF Dialog  ------------------*/}
			<Dialog open={downloadReportDialogOpen}>
				<Box
					sx={{
						borderRadius: '10px',
						width: '500px',
						height: '250px',
						overflow: 'hidden',
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
									localizationConstants.downloadTeacherProfilingAnalyticalPDFReportMsg
								}
							</Typography>
						</Box>
						<Box
							sx={{ height: '150px', mt: '20px' }}
							className={flexStyles.flexColumnCenter}
						>
							<CustomButton
								sx={{
									...BaselineAnalyticsStyles.changeButtonSx,
								}}
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
		</>
	)
}

export default SchoolWiseProfilingAnalytics
