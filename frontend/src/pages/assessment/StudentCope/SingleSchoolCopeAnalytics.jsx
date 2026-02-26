import { Box } from '@mui/system'
import CustomButton from '../../../components/CustomButton'
import { useDispatch, useSelector } from 'react-redux'
import useCommonStyles from '../../../components/styles'
import Chart from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { useEffect, useRef, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { BaselineAnalyticsStyles } from '../../initiations/baseline/baselineAnalyticsStyles'
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
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import {
	DomainWiseStudentCOPEForClassesLT,
	DomainWiseStudentCOPEForClassesST,
	StudentCOPEScoreDataForClasses,
} from './StudentCopeConstants'
import { teacherStyles } from '../teacherIRI/teacherIRIStyles'
import { ChartOptionsForStudentCOPE } from './StudentCopeFunction'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { getStudentCopeAnalyticsReportForClasses } from './StudentCopeSlice'
import { SchoolsStyles } from '../../academic/school/SchoolsStyles'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'
import { generatePDF } from '../../../utils/utils'

Chart.register(ChartDataLabels)
const SingleSchoolCopeAnalytics = ({ filterData, setFilterData }) => {
	const dispatch = useDispatch()
	const { drawerWidth } = useSelector((store) => store.dashboardSliceSetup)
	const { schoolsList } = useSelector((store) => store.commonData)
	const { studentCopeAnalyticsReportForClasses } = useSelector(
		(store) => store.studentCope,
	)
	const flexStyles = useCommonStyles()

	const captureUIRef = useRef(null)

	const captureUIAndDownloadPDF = async () => {
		await generatePDF(captureUIRef.current, {
			filename: 'SchoolWise Students COPE Analytics Report.pdf',
			orientation: 'l',
			pageSize: 'a4',
			margin: 1,
		})
		setFilterData((state) => ({
			...state,
			downloadReportDialog: false,
		}))
	}

	useEffect(() => {
		if (filterData.school?.length > 0 && filterData.school !== 'all') {
			const body = {
				school: filterData.school,
				academicYears: filterData.academicYears,
			}
			dispatch(getStudentCopeAnalyticsReportForClasses({ body }))
		}
	}, [filterData.school])

	const rowsForSecondTable = [
		{
			school: studentCopeAnalyticsReportForClasses?.data?.schoolData
				?.school,
			shortTermRegulation:
				studentCopeAnalyticsReportForClasses.data?.schoolData?.schoolMeanForSTReg.toFixed(
					2,
				),
			LongTermRegulation:
				studentCopeAnalyticsReportForClasses?.data?.schoolData?.schoolMeanForLTReg.toFixed(
					2,
				),
		},
	]
	const dataForCOPEScoresAllClasses = StudentCOPEScoreDataForClasses(
		studentCopeAnalyticsReportForClasses?.data?.COPEScoreForAllClasses,
	)
	const dataForShortTermDomainAnalysis = DomainWiseStudentCOPEForClassesST(
		studentCopeAnalyticsReportForClasses?.data
			?.ShortTermDomainWisePerformanceOfSchools,
	)
	const dataForLongTermDomainAnalysis = DomainWiseStudentCOPEForClassesLT(
		studentCopeAnalyticsReportForClasses?.data
			?.LongTermDomainWisePerformanceOfSchools,
	)

	return (
		<>
			<Box>
				<Box ref={captureUIRef}>
					<Box
						sx={{
							...teacherStyles?.questionBoxSx,
							height: '150px',
							width: drawerWidth === 300 ? '100%' : '100%',
							display: 'flex',
							flexDirection: 'column',
							mt: '20px',
						}}
					>
						<Box
							sx={{
								pl: drawerWidth === 300 ? '-10px' : '10px',
							}}
						>
							<Typography sx={{ fontWeight: 600 }}>
								{localizationConstants.schoolRank}
							</Typography>
						</Box>

						<Box
							sx={{
								pt: '10px',
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<Box
								sx={{
									pl: drawerWidth === 300 ? '-20px' : '-10px',
									width:
										drawerWidth === 300 ? '115%' : '100%',
								}}
							>
								<TableContainer
									sx={{
										borderRadius: '10px',
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
														display: 'flex',
														alignItems: 'center',
														justifyContent:
															'center',
													}}
												>
													<Typography
														sx={{ fontWeight: 600 }}
													>
														{
															localizationConstants.school
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
														sx={{ fontWeight: 600 }}
													>
														{
															localizationConstants.shortTerm
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
														sx={{ fontWeight: 600 }}
													>
														{
															localizationConstants.longTerm
														}
													</Typography>
												</TableCell>
											</TableRow>
										</TableHead>

										<TableBody>
											{rowsForSecondTable.map(
												(row, index) => (
													<TableRow key={index}>
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
																}}
															>
																{row.school}
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
																}}
															>
																{
																	row.shortTermRegulation
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
																}}
															>
																{
																	row.LongTermRegulation
																}
															</Typography>
														</TableCell>
													</TableRow>
												),
											)}
										</TableBody>
									</Table>
								</TableContainer>
							</Box>
						</Box>
					</Box>

					{/* COPE Score ( All Classes ) */}
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
									{localizationConstants.copeScoreAllClasses}
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
										{localizationConstants.shortTerm}
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
										{localizationConstants.longTerm}
									</Typography>
								</Box>
							</Box>

							<Box
								sx={{
									overflowX: 'auto',
									mt: '10px',
								}}
							>
								{studentCopeAnalyticsReportForClasses?.data
									?.COPEScoreForAllClasses?.length > 0 ? (
									<Box
										sx={{
											width: `${
												dataForCOPEScoresAllClasses
													?.labels?.length > 1
													? dataForCOPEScoresAllClasses
															?.labels?.length *
														200
													: dataForCOPEScoresAllClasses
															?.labels?.length *
														280
											}px`,
											height: '290px',
											display: 'flex',
											flexDirection: 'row',
											gap: '10px',
											mb: '10px',
										}}
									>
										<Bar
											data={dataForCOPEScoresAllClasses}
											options={ChartOptionsForStudentCOPE()}
										/>
									</Box>
								) : (
									<Box
										sx={{ pt: '120px' }}
										className={
											flexStyles.flexColumnCenterCenter
										}
									>
										<Typography
											variant={typographyConstants.h3}
											sx={SchoolsStyles.noSchoolsSx}
										>
											{
												localizationConstants.noCopeScoreDataAvailabe
											}
										</Typography>
									</Box>
								)}
							</Box>
						</Box>
					</Box>

					{/*Short Term Domain Wise Performance (Schools) */}
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
								{studentCopeAnalyticsReportForClasses?.data
									?.ShortTermDomainWisePerformanceOfSchools
									?.length > 0 ? (
									<Box
										sx={{
											width: `${
												dataForShortTermDomainAnalysis
													?.labels?.length > 1
													? dataForShortTermDomainAnalysis
															?.labels?.length *
														300
													: dataForShortTermDomainAnalysis
															?.labels?.length *
														280
											}px`,
											height: '290px',
											display: 'flex',
											flexDirection: 'row',
											gap: '10px',
											mb: '10px',
										}}
									>
										<Bar
											data={
												dataForShortTermDomainAnalysis
											}
											options={ChartOptionsForStudentCOPE(
												false,
											)}
										/>
									</Box>
								) : (
									<Box
										sx={{ pt: '120px' }}
										className={
											flexStyles.flexColumnCenterCenter
										}
									>
										<Typography
											variant={typographyConstants.h3}
											sx={SchoolsStyles.noSchoolsSx}
										>
											{
												localizationConstants.noDomainWisePerDataAvailabe
											}
										</Typography>
									</Box>
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
									( {localizationConstants.school} ) {' - '}
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
								{studentCopeAnalyticsReportForClasses?.data
									?.LongTermDomainWisePerformanceOfSchools
									?.length > 0 ? (
									<Box
										sx={{
											width: `${
												dataForLongTermDomainAnalysis
													?.labels?.length > 1
													? dataForLongTermDomainAnalysis
															?.labels?.length *
														300
													: dataForLongTermDomainAnalysis
															?.labels?.length *
														280
											}px`,
											height: '290px',
											display: 'flex',
											flexDirection: 'row',
											gap: '10px',
											mb: '10px',
										}}
									>
										<Bar
											data={dataForLongTermDomainAnalysis}
											options={ChartOptionsForStudentCOPE(
												false,
											)}
										/>
									</Box>
								) : (
									<Box
										sx={{ pt: '120px' }}
										className={
											flexStyles.flexColumnCenterCenter
										}
									>
										<Typography
											variant={typographyConstants.h3}
											sx={SchoolsStyles.noSchoolsSx}
										>
											{
												localizationConstants.noDomainWisePerDataAvailabe
											}
										</Typography>
									</Box>
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
							<CustomAutocompleteNew
								sx={{ flexGrow: 1, minWidth: '440px' }}
								fieldSx={{ borderRadius: '4px', mb: '3px' }}
								value={filterData.school}
								placeholder={`${localizationConstants.select} ${localizationConstants.school}`}
								onChange={(e) => {
									setFilterData((state) => ({
										...state,
										school: e,
									}))
								}}
								options={
									schoolsList?.map((sc) => ({
										id: sc?._id,
										label: sc?.school,
									})) ?? []
								}
							/>

							<CustomButton
								sx={{
									...BaselineAnalyticsStyles.changeButtonSx,
								}}
								disabled={filterData.school?.length === 0}
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

export default SingleSchoolCopeAnalytics
