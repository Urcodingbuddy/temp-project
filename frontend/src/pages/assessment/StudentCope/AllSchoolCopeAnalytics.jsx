import { Box } from '@mui/system'
import Chart from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { useDispatch, useSelector } from 'react-redux'
import useCommonStyles from '../../../components/styles'
import { useEffect, useRef } from 'react'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomButton from '../../../components/CustomButton'
import { BaselineAnalyticsStyles } from '../../initiations/baseline/baselineAnalyticsStyles'
import { Dialog, Typography } from '@mui/material'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { Bar } from 'react-chartjs-2'
import {
	DomainWiseStudentCOPEScoreDataLT,
	DomainWiseStudentCOPEScoreDataST,
	StudentAnalysisScoreData,
	StudentCOPEScoreData,
} from './StudentCopeConstants'
import { ChartOptionsForStudentCOPE } from './StudentCopeFunction'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { getStudentCopeAnalyticsReportForSchools } from './StudentCopeSlice'
import { generatePDF, getCurrentAcademicYearId } from '../../../utils/utils'

Chart.register(ChartDataLabels)

const SchoolWiseCOPEAnalytics = ({ filterData, setFilterData }) => {
	const dispatch = useDispatch()

	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const { studentCopeAnalyticsReportForSchools } = useSelector(
		(store) => store.studentCope,
	)
	const flexStyles = useCommonStyles()
	const captureUIRef = useRef(null)
	const captureUIAndDownloadPDF = async () => {
		await generatePDF(captureUIRef.current, {
			filename: 'SchoolWise Students COPE Analytics Report.pdf',
			orientation: 'l',
			pageSize: 'a4',
			margin: 15,
		})
		setFilterData((state) => ({
			...state,
			downloadReportDialog: false,
		}))
	}

	let isFirstLoadAndCalled = useRef(true)
	useEffect(() => {
		if (
			filterData.academicYears.length > 0 &&
			isFirstLoadAndCalled.current
		) {
			const body = {
				academicYears: filterData.academicYears,
			}
			dispatch(
				getStudentCopeAnalyticsReportForSchools({
					body,
				}),
			)
			isFirstLoadAndCalled.current = false
		}
	}, [filterData.academicYears])

	useEffect(() => {
		if (filterData.academicYears.length === 0 && academicYears.length > 0) {
			const currentAYId = getCurrentAcademicYearId(academicYears)
			if (currentAYId) {
				setFilterData((state) => ({
					...state,
					academicYears: [currentAYId],
				}))
			}
		}
	}, [filterData.academicYears, academicYears])

	const dataForCOPEScores = StudentCOPEScoreData(
		studentCopeAnalyticsReportForSchools?.data?.COPEScore,
	)
	const dataForStudentAnalysis = StudentAnalysisScoreData(
		studentCopeAnalyticsReportForSchools?.data?.studentAnalysis,
	)
	const dataForShortTermDomainWiseAnalysis = DomainWiseStudentCOPEScoreDataST(
		studentCopeAnalyticsReportForSchools?.data
			?.ShortTermDomainWisePerformanceOfSchools,
	)
	const dataForLongTermDomainAnalytics = DomainWiseStudentCOPEScoreDataLT(
		studentCopeAnalyticsReportForSchools?.data
			?.LongTermDomainWisePerformanceOfSchools,
	)

	return (
		<>
			<Box>
				<Box ref={captureUIRef}>
					{/* Student Analysis ( All Schools ) */}
					<Box>
						<Box
							sx={{
								...BaselineAnalyticsStyles.tableBoxSx,
								minHeight: '360px',
								alignItems: 'left',
								pl: '10px',
							}}
						>
							<Box
								className={flexStyles.flexRowCenterSpaceBetween}
							>
								<Typography
									variant={typographyConstants.h5}
									sx={{
										marginLeft: '3px',
										mt: '1rem',
										fontWeight: '600',
									}}
								>
									{
										localizationConstants.studentAnalysisAllSchools
									}
								</Typography>
								<Box
									className={flexStyles.flexRowCenter}
									sx={{ mt: '1rem', mr: '1rem' }}
								>
									<Box
										sx={{
											...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
											backgroundColor: '#025ABD',
										}}
									/>
									<Typography
										variant={typographyConstants.body2}
										sx={{ pl: '7px', pr: '7px' }}
									>
										{localizationConstants.totalStudents}
									</Typography>

									<Box
										sx={{
											...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
											backgroundColor: '#F8A70D',
										}}
									/>
									<Typography
										variant={typographyConstants.body2}
										sx={{ pl: '7px', pr: '7px' }}
									>
										{
											localizationConstants.totalSubmissionOfCOPE
										}
									</Typography>
								</Box>
							</Box>

							<Box
								sx={{
									overflowX: 'auto',
									mt: '10px',
								}}
							>
								{studentCopeAnalyticsReportForSchools?.data
									?.studentAnalysis?.length > 0 ? (
									<Box
										sx={{
											width: `${
												dataForStudentAnalysis?.labels
													?.length > 1
													? dataForStudentAnalysis
															?.labels?.length *
														180
													: dataForStudentAnalysis
															?.labels?.length *
														280
											}px`,
											height: '290px',
											display: 'flex',
											mb: '10px',
											flexDirection: 'row',
											gap: '20px',
										}}
									>
										<Bar
											data={dataForStudentAnalysis}
											options={ChartOptionsForStudentCOPE(
												false,
												true,
											)}
											sx={{
												flex: '5',
											}}
										/>
									</Box>
								) : (
									<>
										<Box></Box>
									</>
								)}
							</Box>
						</Box>
					</Box>

					{/* COPE Score ( All Schools ) */}
					<Box>
						<Box
							sx={{
								...BaselineAnalyticsStyles.tableBoxSx,
								minHeight: '360px',
								alignItems: 'left',
								pl: '10px',
							}}
						>
							<Box
								className={flexStyles.flexRowCenterSpaceBetween}
							>
								<Typography
									variant={typographyConstants.h5}
									sx={{
										marginLeft: '3px',
										mt: '1rem',
										fontWeight: '600',
									}}
								>
									{localizationConstants.COPEScoreAllSchools}
								</Typography>
								<Box
									className={flexStyles.flexRowCenter}
									sx={{ mt: '1rem', mr: '1rem' }}
								>
									<Box
										sx={{
											...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
											backgroundColor: '#01234A',
										}}
									/>
									<Typography
										variant={typographyConstants.body2}
										sx={{ pl: '7px', pr: '7px' }}
									>
										{
											localizationConstants.shortTermRegulationAvg
										}
									</Typography>

									<Box
										sx={{
											...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
											backgroundColor: '#F8A70D',
										}}
									/>
									<Typography
										variant={typographyConstants.body2}
										sx={{ pl: '7px', pr: '7px' }}
									>
										{
											localizationConstants.longTermRegulationAvg
										}
									</Typography>
								</Box>
							</Box>

							<Box
								sx={{
									overflowX: 'auto',
									mt: '10px',
								}}
							>
								{studentCopeAnalyticsReportForSchools?.data
									?.COPEScore?.length > 0 ? (
									<Box
										sx={{
											width: `${
												dataForCOPEScores?.labels
													?.length > 1
													? dataForCOPEScores?.labels
															?.length * 180
													: dataForCOPEScores?.labels
															?.length * 280
											}px`,
											height: '290px',
											mb: '10px',
										}}
									>
										<Bar
											data={dataForCOPEScores}
											options={ChartOptionsForStudentCOPE(
												false,
												true,
											)}
										/>
									</Box>
								) : (
									<>
										<Box></Box>
									</>
								)}
							</Box>
						</Box>
					</Box>
					{/* Domain Wise Performance (Schools) Short Term */}
					<Box>
						<Box
							sx={{
								...BaselineAnalyticsStyles.tableBoxSx,
								minHeight: '360px',
								alignItems: 'left',
								pl: '10px',
							}}
						>
							<Box
								className={flexStyles.flexRowCenterSpaceBetween}
							>
								<Typography
									variant={typographyConstants.h5}
									sx={{
										marginLeft: '3px',
										mt: '1rem',
										fontWeight: '600',
									}}
								>
									{
										localizationConstants.domainWisePerformance
									}{' '}
									( {localizationConstants.school} ) {' - '}
									{localizationConstants.shortTerm}
								</Typography>
								<Box
									className={flexStyles.flexRowCenter}
									sx={{ mt: '1rem', mr: '1rem' }}
								>
									<Box
										sx={{
											...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
											backgroundColor: '#0267D9',
										}}
									/>
									<Typography
										variant={typographyConstants.body2}
										sx={{ pl: '7px', pr: '7px' }}
									>
										{
											localizationConstants.emotionRegulation
										}
									</Typography>

									<Box
										sx={{
											...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
											backgroundColor: '#DD2A2B',
										}}
									/>
									<Typography
										variant={typographyConstants.body2}
										sx={{ pl: '7px', pr: '7px' }}
									>
										{localizationConstants.impulseControl}
									</Typography>

									<Box
										sx={{
											...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
											backgroundColor: '#F8A70D',
										}}
									/>
									<Typography
										variant={typographyConstants.body2}
										sx={{ pl: '7px', pr: '7px' }}
									>
										{localizationConstants.resilience}
									</Typography>
									<Box
										sx={{
											...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
											backgroundColor: '#25C548',
										}}
									/>
									<Typography
										variant={typographyConstants.body2}
										sx={{ pl: '7px', pr: '7px' }}
									>
										{localizationConstants.attention}
									</Typography>
									<Box
										sx={{
											...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
											backgroundColor: '#F5890D',
										}}
									/>
									<Typography
										variant={typographyConstants.body2}
										sx={{ pl: '7px', pr: '7px' }}
									>
										{localizationConstants.organisation}
									</Typography>
								</Box>
							</Box>

							<Box
								sx={{
									overflowX: 'auto',
									mt: '10px',
								}}
							>
								{studentCopeAnalyticsReportForSchools?.data
									?.ShortTermDomainWisePerformanceOfSchools
									?.length > 0 ? (
									<Box
										sx={{
											width: `${
												dataForShortTermDomainWiseAnalysis
													?.labels?.length > 1
													? dataForShortTermDomainWiseAnalysis
															?.labels?.length *
														300
													: dataForShortTermDomainWiseAnalysis
															?.labels?.length *
														280
											}px`,
											height: '290px',
											display: 'flex',
											flexDirection: 'row',
											mb: '10px',
										}}
									>
										<Bar
											data={
												dataForShortTermDomainWiseAnalysis
											}
											options={ChartOptionsForStudentCOPE(
												false,
												true,
											)}
										/>
									</Box>
								) : (
									<>
										<Box></Box>
									</>
								)}
							</Box>
						</Box>
					</Box>

					{/*Long Term Domain Wise Performance (Schools) */}
					<Box>
						<Box
							sx={{
								...BaselineAnalyticsStyles.tableBoxSx,
								minHeight: '360px',
								alignItems: 'left',
								pl: '10px',
							}}
						>
							<Box
								className={flexStyles.flexRowCenterSpaceBetween}
							>
								<Typography
									variant={typographyConstants.h5}
									sx={{
										marginLeft: '3px',
										mt: '1rem',
										fontWeight: '600',
									}}
								>
									{
										localizationConstants.domainWisePerformance
									}{' '}
									( {localizationConstants.school} ){' - '}
									{localizationConstants.longTerm}
								</Typography>
								<Box
									className={flexStyles.flexRowCenter}
									sx={{ mt: '1rem', mr: '1rem' }}
								>
									<Box
										sx={{
											...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
											backgroundColor: '#0267D9',
										}}
									/>
									<Typography
										variant={typographyConstants.body2}
										sx={{ pl: '7px', pr: '7px' }}
									>
										{
											localizationConstants.emotionRegulation
										}
									</Typography>

									<Box
										sx={{
											...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
											backgroundColor: '#DD2A2B',
										}}
									/>
									<Typography
										variant={typographyConstants.body2}
										sx={{ pl: '7px', pr: '7px' }}
									>
										{localizationConstants.impulseControl}
									</Typography>

									<Box
										sx={{
											...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
											backgroundColor: '#F8A70D',
										}}
									/>
									<Typography
										variant={typographyConstants.body2}
										sx={{ pl: '7px', pr: '7px' }}
									>
										{localizationConstants.resilience}
									</Typography>
									<Box
										sx={{
											...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
											backgroundColor: '#25C548',
										}}
									/>
									<Typography
										variant={typographyConstants.body2}
										sx={{ pl: '7px', pr: '7px' }}
									>
										{localizationConstants.attention}
									</Typography>
									<Box
										sx={{
											...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
											backgroundColor: '#F5890D',
										}}
									/>
									<Typography
										variant={typographyConstants.body2}
										sx={{ pl: '7px', pr: '7px' }}
									>
										{localizationConstants.organisation}
									</Typography>
								</Box>
							</Box>

							<Box
								sx={{
									overflowX: 'auto',
									mt: '10px',
								}}
							>
								{studentCopeAnalyticsReportForSchools?.data
									?.LongTermDomainWisePerformanceOfSchools
									?.length > 0 ? (
									<Box
										sx={{
											width: `${
												dataForLongTermDomainAnalytics
													?.labels?.length > 1
													? dataForLongTermDomainAnalytics
															?.labels?.length *
														300
													: dataForLongTermDomainAnalytics
															?.labels?.length *
														280
											}px`,
											height: '290px',
											display: 'flex',
											flexDirection: 'row',
											mb: '10px',
										}}
									>
										<Bar
											data={
												dataForLongTermDomainAnalytics
											}
											options={ChartOptionsForStudentCOPE(
												false,
												true,
											)}
										/>
									</Box>
								) : (
									<>
										<Box></Box>
									</>
								)}
							</Box>
						</Box>
					</Box>
				</Box>
			</Box>

			{/*----------------- PDF Dialog  ------------------*/}
			<Dialog open={filterData.downloadReportDialog}>
				<Box
					sx={{
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
									setFilterData((state) => ({
										...state,
										downloadReportDialog: false,
									}))
								}}
							/>
						</Box>
						<Box sx={{ marginTop: '20px', textAlign: 'start' }}>
							<Typography color={'globalElementColors.gray1'}>
								{
									localizationConstants.downloadStudentCOPEAnalyticalPDFReportMsg
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

export default SchoolWiseCOPEAnalytics
