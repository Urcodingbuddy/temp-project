import { Box } from '@mui/system'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BaselineAnalyticsStyles } from './baselineAnalyticsStyles'
import useCommonStyles from '../../../components/styles'
import {
	Dialog,
	FormControl,
	FormControlLabel,
	Radio,
	RadioGroup,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import {
	studentBaselineReportColumns,
	categories,
	baselineCategory,
} from './baselineConstants'
import { getSingleStudentBaselineAnalyticalReport } from './baselineSlice'
import { Doughnut } from 'react-chartjs-2'
import Chart from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { invalidTest } from '../individualCase/individualCaseConstants'
import { hexaCodes } from '../../../utils/hexaColorCodes'
import CustomButton from '../../../components/CustomButton'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'
import { generatePDF } from '../../../utils/utils'
Chart.register(ChartDataLabels)

const StudentBaselineReport = ({ singleStdRowdata, setSingleStdRowData }) => {
	const flexStyles = useCommonStyles()
	const dispatch = useDispatch()
	const { drawerWidth } = useSelector((store) => store.dashboardSliceSetup)
	const { singleStudentBaselineAnalyticalReport, allBaselineRecords } =
		useSelector((store) => store.baseline)
	const [downloadReportDialogOpen, setDownloadReportDialogOpen] =
		useState(false)
	const captureUIRef = useRef(null)
	const [category, setcategory] = useState([])
	const [selectedCategoryData, setSelectedCategoryData] = useState([])
	const BaseLineAnalyticsData =
		singleStudentBaselineAnalyticalReport?.baselineAnalyticsData
	const rowCells = (column, tableRow) => {
		switch (column.id) {
			case localizationConstants.domain:
				return (
					<Typography variant={typographyConstants.body}>
						{tableRow?.domain}
					</Typography>
				)
			case localizationConstants.percentage:
				return (
					<Typography variant={typographyConstants.body}>
						{tableRow?.percentage.replace(/\.0+$/, '')} %
					</Typography>
				)
			case localizationConstants.studentScoreMaximumMark:
				return (
					<Typography
						variant={typographyConstants.body}
						sx={{ color: 'globalElementColors.white' }}
					>
						{tableRow?.score}
					</Typography>
				)
			case localizationConstants.mileStoneAchieved:
				return (
					<Typography
						variant={typographyConstants.body}
						sx={{ color: 'globalElementColors.black' }}
					>
						{tableRow?.score >= 6 ? 'Yes' : 'No'}
					</Typography>
				)
			default:
				return null
		}
	}
	// const percentages = []
	const percentages = categories.map((category) => {
		if (BaseLineAnalyticsData?.[category]) {
			const percentage = BaseLineAnalyticsData[category].percentage
			return typeof percentage === 'number'
				? percentage
				: parseFloat(percentage) || 0
		}
		return 0
	})

	const data = {
		labels: categories,
		datasets: [
			{
				data: percentages,
				backgroundColor: [
					hexaCodes?.blue,
					hexaCodes?.red,
					hexaCodes?.yellow,
					hexaCodes?.green,
					hexaCodes?.orange,
				],
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
						return (
							parseFloat(value).toFixed(2).replace(/\.0+$/, '') +
							'%'
						)
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
				callbacks: {
					label: function (context) {
						return (
							data.labels[context.dataIndex] +
							' : ' +
							parseFloat(data.datasets[0].data[context.dataIndex])
								.toFixed(2)
								.replace(/\.0+$/, '') +
							'%'
						)
					},
				},
				bodyFont: {
					size: 13,
				},
				bodySpacing: 5,
				padding: 10,
			},
		},
	}
	const captureUIAndDownloadPDF = async () => {
		await generatePDF(captureUIRef.current, {
			filename: 'Individual Student Baseline Report.pdf',
			orientation: 'l',
			pageSize: 'a4',
			margin: 1,
		})
		setDownloadReportDialogOpen(false)
	}
	const [selectedPortion, setSelectedPortion] = useState(null)
	const [isDrawerOpen, setDrawerOpen] = useState(false)

	const handlePortionClick = (event, elements) => {
		if (elements.length > 0) {
			const index = elements[0].index
			const selectedCategory = categories[index]
			const categoryData =
				BaseLineAnalyticsData?.[selectedCategory]?.data || []
			setSelectedPortion(index)
			setSelectedCategoryData(categoryData)
			setDrawerOpen(true)
		}
	}
	useEffect(() => {
		const body = {
			studentId: singleStdRowdata?.studentId,
			baselineCategory:
				category?.length !== 0
					? category
					: singleStdRowdata?.baselineCategory,
			academicYear: singleStdRowdata?.academicYearId,
		}
		if (category?.length === 0) {
			setcategory(singleStdRowdata?.baselineCategory)
		}
		dispatch(getSingleStudentBaselineAnalyticalReport({ body }))
		const row1 = allBaselineRecords?.data?.filter(
			(rs) =>
				rs?.studentId === singleStdRowdata?.studentId &&
				category === rs?.baselineCategory,
		)
		if (!invalidTest?.includes(row1) && row1?.length !== 0) {
			setSingleStdRowData(row1?.[0])
		}
	}, [category])

	let overallScore = 0
	let validCategories = 0

	const legendColors = [
		'globalElementColors.blue2', // Physical
		'globalElementColors.red', // Social
		'globalElementColors.yellow3', // Emotional
		'textColors.green2', // Cognitive
		'globalElementColors.yellow2', // Language
	]

	return (
		<div>
			<Box ref={captureUIRef}>
				<Box
					sx={{
						...BaselineAnalyticsStyles?.tableBoxSx,

						...BaselineAnalyticsStyles?.studentReportTopBoXSx,
					}}
				>
					{/* ------------St Name --------- */}
					<Box className={flexStyles?.flexRowCenterSpaceBetween}>
						<Box
							className={flexStyles.flexColumn}
							sx={{ mb: '10px' }}
						>
							<Box>
								<Typography
									variant={typographyConstants.h4}
									sx={{ fontWeight: '500', fontSize: '20px' }}
								>
									{!invalidTest?.includes(singleStdRowdata) &&
										singleStdRowdata?.studentName}
								</Typography>
							</Box>
							{singleStudentBaselineAnalyticalReport?.baselineAnalyticsData && (
								<>
									<Box sx={{ mt: '10.5px' }}>
										<Typography
											variant={typographyConstants.h4}
											sx={{
												fontWeight: '500',
												fontSize: '18px',
												color: 'globalElementColors.disabledGrey',
											}}
										>
											{localizationConstants?.school} :{' '}
											{
												singleStudentBaselineAnalyticalReport
													?.baselineAnalyticsData
													?.school
											}
										</Typography>
									</Box>
									{/* ------------cls Name && Section Name --------- */}
									<Box sx={{ mt: '10.5px' }}>
										<Box
											sx={{
												display: 'flex',
												flexDirection: 'row',
											}}
										>
											<Typography
												variant={typographyConstants.h4}
												sx={{
													fontWeight: '500',
													fontSize: '16px',
													color: 'globalElementColors.disabledGrey',
												}}
											>
												{localizationConstants?.Class} :
											</Typography>
											<Typography
												variant={typographyConstants.h4}
												sx={{
													fontWeight: '500',
													fontSize: '16px',
													ml: '10px',
													mt: '1px',
												}}
											>
												{
													singleStudentBaselineAnalyticalReport
														?.baselineAnalyticsData
														?.className
												}
											</Typography>
											<Typography
												variant={typographyConstants.h4}
												sx={{
													fontWeight: '500',
													fontSize: '16px',
													ml: '20px',
													color: 'globalElementColors.disabledGrey',
												}}
											>
												{localizationConstants?.section}{' '}
												:
											</Typography>
											<Typography
												variant={typographyConstants.h4}
												sx={{
													fontWeight: '500',
													fontSize: '16px',
													ml: '10px',
													mt: '1px',
												}}
											>
												{
													singleStudentBaselineAnalyticalReport
														?.baselineAnalyticsData
														?.section
												}
											</Typography>
											<Typography
												variant={typographyConstants.h4}
												sx={{
													fontWeight: '500',
													fontSize: '16px',
													ml: '20px',
													color: 'globalElementColors.disabledGrey',
												}}
											>
												{
													localizationConstants?.academicYear
												}{' '}
												:
											</Typography>
											<Typography
												variant={typographyConstants.h4}
												sx={{
													fontWeight: '500',
													fontSize: '16px',
													ml: '10px',
													mt: '1px',
												}}
											>
												{singleStdRowdata.academicYear}
											</Typography>
										</Box>
									</Box>
								</>
							)}
						</Box>
						<Box
							sx={{
								mt: singleStudentBaselineAnalyticalReport?.baselineAnalyticsData
									? '-30px'
									: undefined,
								display: 'flex',
								alignItems: 'center',
							}}
						>
							<Box>
								<Typography
									variant={typographyConstants.title}
									sx={{
										color: 'textColors.grey',
										fontSize: '14px',
										mb: '4px',
									}}
								>
									{` ${localizationConstants.baselineCategory}`}
								</Typography>
								<CustomAutocompleteNew
									options={baselineCategory}
									sx={{
										minWidth:
											drawerWidth === 300
												? '185px'
												: '220px',
										mr: '10px',
									}}
									fieldSx={{ height: '44px', width: '250px' }}
									placeholder={`${localizationConstants.select} ${localizationConstants.baselineCategory}`}
									multiple={false}
									value={category}
									onChange={(e) => {
										setcategory(e)
									}}
								/>
							</Box>

							<CustomButton
								sx={{
									minWidth: '172px',
									height: '44px',
									marginTop: '22px',
									backgroundColor: '#0267D9',
									ml: '10px',
								}}
								text={localizationConstants.generateReport}
								onClick={() => {
									setDownloadReportDialogOpen(true)
								}}
							/>
						</Box>
					</Box>
					<hr
						style={{
							border: '1px solid',
							borderColor: 'globalElementColors.grey5',
							width: '100%',
						}}
					/>
				</Box>
				{/* ------- three Boxes----- */}
				<Box
					className={flexStyles.flexRowCenterSpaceBetween}
					sx={{ mt: '10px' }}
					ref={captureUIRef}
				>
					<Box
						sx={{
							...BaselineAnalyticsStyles.tableBoxSx,
							...BaselineAnalyticsStyles.threeStarsBoxSx,
						}}
					>
						<Box className={flexStyles.flexRowCenterSpaceBetween}>
							<Box>
								<Typography
									variant={typographyConstants.h4}
									sx={{ fontWeight: 500, fontSize: '20px' }}
								>
									{localizationConstants.rankInSection}
								</Typography>
								<Typography
									variant={typographyConstants.h5}
									sx={{
										...BaselineAnalyticsStyles?.studentReportCardsData,
										color: !singleStudentBaselineAnalyticalReport.baselineAnalyticsData
											? 'globalElementColors.disabledGrey'
											: 'globalElementColors.blue',
										fontWeight:
											!singleStudentBaselineAnalyticalReport.baselineAnalyticsData
												? '400'
												: '600',
									}}
								>
									{singleStudentBaselineAnalyticalReport?.baselineAnalyticsData
										? singleStudentBaselineAnalyticalReport
												?.baselineAnalyticsData
												?.rankInSection
										: localizationConstants.noDataAvailable}
								</Typography>
							</Box>
							<Box>
								<CustomIcon
									name={iconConstants.topThreeStars}
									style={{
										width: '55px',
										height: '56px',
									}}
									svgStyle={'width: 55px; height: 56px'}
								/>
							</Box>
						</Box>
					</Box>
					<Box
						sx={{
							...BaselineAnalyticsStyles.tableBoxSx,
							...BaselineAnalyticsStyles.threeStarsBoxSx,
						}}
					>
						{' '}
						<Box className={flexStyles.flexRowCenterSpaceBetween}>
							<Box>
								<Typography
									variant={typographyConstants.h4}
									sx={{ fontWeight: 500, fontSize: '20px' }}
								>
									{localizationConstants.rankInClass}
								</Typography>
								<Typography
									variant={typographyConstants.h5}
									sx={{
										...BaselineAnalyticsStyles?.studentReportCardsData,
										color: !singleStudentBaselineAnalyticalReport.baselineAnalyticsData
											? 'globalElementColors.disabledGrey'
											: 'globalElementColors.blue',
										fontWeight:
											!singleStudentBaselineAnalyticalReport.baselineAnalyticsData
												? '400'
												: '600',
									}}
								>
									{singleStudentBaselineAnalyticalReport?.baselineAnalyticsData
										? singleStudentBaselineAnalyticalReport
												?.baselineAnalyticsData
												?.rankInClass
										: localizationConstants.noDataAvailable}
								</Typography>
							</Box>
							<Box>
								<CustomIcon
									name={iconConstants.topThreeStars}
									style={{
										width: '55px',
										height: '56px',
									}}
									svgStyle={'width: 55px; height: 56px'}
								/>
							</Box>
						</Box>
					</Box>
				</Box>

				{/* ------ Second Box------ */}
				<Box
					className={flexStyles.flexRowCenterSpaceBetween}
					sx={{ width: `calc(100vw - ${drawerWidth + 56}px)` }}
				>
					<Box
						sx={{
							...BaselineAnalyticsStyles.tableBoxSx,
							width: '49%',
							height: '392px',
							p: '10px 16px',
							alignItems: 'left',
						}}
					>
						<Box>
							<Typography
								variant={typographyConstants.h5}
								sx={{ fontSize: '19px', fontWeight: 500 }}
							>
								{localizationConstants.domainWiseScore}
							</Typography>
						</Box>
						{singleStudentBaselineAnalyticalReport?.baselineAnalyticsData ? (
							<Box
								sx={{
									...BaselineAnalyticsStyles.tableBoxSx,
									mt: '10px',
									overflow: 'auto',
								}}
							>
								<TableContainer
									sx={{
										...BaselineAnalyticsStyles.tableContainerSx,
										border: '0px',
									}}
								>
									<Table
										aria-labelledby='tableTitle'
										size={'small'}
										stickyHeader
									>
										<TableHead>
											<TableRow>
												{studentBaselineReportColumns?.map(
													(col, index) => (
														<TableCell
															sx={{
																backgroundColor:
																	col.backgroundColor,
																...BaselineAnalyticsStyles?.tableHeadCell,
																fontSize:
																	'15px',
																width: col.width,
																padding:
																	col.padding,
																textAlign:
																	'center',
															}}
														>
															{col?.id}
														</TableCell>
													),
												)}
											</TableRow>
										</TableHead>
										<TableBody>
											{BaseLineAnalyticsData &&
												categories.map(
													(category, index) => {
														if (
															!invalidTest?.includes(
																category,
															) &&
															BaseLineAnalyticsData[
																category
															]
														) {
															const categoryData =
																BaseLineAnalyticsData[
																	category
																]
															const score =
																parseFloat(
																	categoryData.score,
																) || 0
															const percentage =
																parseFloat(
																	categoryData.percentage,
																) || 0

															overallScore +=
																score
															validCategories += 1

															const tableRow = {
																domain: category,
																score,
																percentage:
																	percentage.toFixed(
																		2,
																	),
															}

															return (
																<TableRow
																	key={index}
																>
																	{studentBaselineReportColumns.map(
																		(
																			col,
																			colIndex,
																		) => (
																			<TableCell
																				key={
																					col.id
																				}
																				sx={{
																					...BaselineAnalyticsStyles.tableBodyCell,
																					fontSize:
																						'15px',
																					textAlign:
																						'center',
																					width: col.width,
																					padding:
																						studentBaselineReportColumns[0]
																							?.padding,
																					borderRight:
																						colIndex ===
																						studentBaselineReportColumns.length -
																							1
																							? '0'
																							: '1px solid',
																					backgroundColor:
																						colIndex ===
																						2
																							? score <=
																								3
																								? 'textColors.red'
																								: score <=
																									  5
																									? 'globalElementColors.yellow'
																									: 'globalElementColors.green2'
																							: '',
																				}}
																			>
																				{rowCells(
																					col,
																					tableRow,
																				)}
																			</TableCell>
																		),
																	)}
																</TableRow>
															)
														}
														return null
													},
												)}
											<TableRow>
												<TableCell
													sx={{
														backgroundColor:
															'globalElementColors.grey4',
														...BaselineAnalyticsStyles.tableBodyCell,
														fontSize: '15px',
														padding:
															'11px 16px 11px 16px',
													}}
												>
													<Typography
														variant={
															typographyConstants.body
														}
														sx={{
															fontWeight: 600,
															fontSize: '16px',
														}}
													>
														{
															localizationConstants.overall
														}
													</Typography>
												</TableCell>
												<TableCell
													sx={{
														backgroundColor:
															'globalElementColors.grey4',
														...BaselineAnalyticsStyles.tableBodyCell,
														fontSize: '15px',
														padding:
															'11px 16px 11px 16px',
													}}
													align='center'
												>
													<Typography
														variant={
															typographyConstants.body
														}
														sx={{
															fontWeight: 600,
															fontSize: '16px',
														}}
													>
														{validCategories > 0
															? (
																	(overallScore /
																		35) *
																	100
																)
																	.toFixed(2)
																	.replace(
																		/\.0+$/,
																		'',
																	) + ' %'
															: '0 %'}
													</Typography>
												</TableCell>
												<TableCell
													sx={{
														backgroundColor:
															'globalElementColors.grey4',
														...BaselineAnalyticsStyles.tableBodyCell,
														fontSize: '15px',
														padding:
															'11px 16px 11px 16px',
													}}
													align='center'
												>
													<Typography
														variant={
															typographyConstants.body
														}
														sx={{
															fontWeight: 600,
															fontSize: '16px',
														}}
													>
														{overallScore / 5}
													</Typography>
												</TableCell>
											</TableRow>
										</TableBody>
									</Table>
								</TableContainer>
							</Box>
						) : (
							<Typography
								variant={typographyConstants.hs}
								sx={{
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									height: '100%',
								}}
							>
								{localizationConstants.noDataAvailable}
							</Typography>
						)}
					</Box>

					<Box
						sx={{
							...BaselineAnalyticsStyles.tableBoxSx,
							width: '49%',
							height: '392px',
							p: '10px 16px 20px 16px',
						}}
					>
						<Box>
							<Typography
								variant={typographyConstants.h5}
								sx={{ fontSize: '19px', fontWeight: 500 }}
							>
								{category} {localizationConstants.score}
							</Typography>
						</Box>
						{singleStudentBaselineAnalyticalReport?.baselineAnalyticsData ? (
							<Box
								className={flexStyles.flexRowCenterSpaceBetween}
								sx={{
									width: '100%',
								}}
							>
								<Box
									className={
										flexStyles.flexColumnCenterCenter
									}
									sx={{ width: '25%', height: '250px' }}
								>
									<Box>
										{categories.map((category, index) => (
											<Box
												key={category}
												sx={{
													...BaselineAnalyticsStyles?.categoryColorSx,
													pt:
														index === 0
															? '25px'
															: '0',
												}}
											>
												<Box
													sx={{
														...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
														backgroundColor:
															legendColors[index],
													}}
												/>
												<Typography
													variant={
														typographyConstants.h5
													}
													sx={{
														pl: '10px',
														fontSize: '16px',
													}}
												>
													{localizationConstants[
														category.toLowerCase()
													] || category}
												</Typography>
											</Box>
										))}
									</Box>
								</Box>
								<Box
									sx={{
										width: '60%',
										height: '320px',
									}}
								>
									<Doughnut
										data={data}
										options={{
											...options,
											onClick: handlePortionClick,
										}}
									/>
								</Box>
							</Box>
						) : (
							<Typography
								variant={typographyConstants.hs}
								sx={{
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									height: '100%',
								}}
							>
								{localizationConstants.noDataAvailable}
							</Typography>
						)}
					</Box>
				</Box>
			</Box>

			<Dialog
				PaperProps={{
					style: {
						borderRadius: '10px',
						width: '500px',
						minHeight: '600px',
					},
				}}
				open={isDrawerOpen}
				onClose={() => setDrawerOpen(false)}
			>
				<Box
					sx={{
						height: '11px',
						backgroundColor: 'globalElementColors.blue',
					}}
				/>
				<Box sx={{ p: '19px 30px 30px 30px', height: '600px' }}>
					<Box
						className={flexStyles?.flexColumnSpaceBetween}
						sx={{ height: '100%' }}
					>
						<Box className={flexStyles?.flexRowCenterSpaceBetween}>
							<Typography
								sx={{ fontSize: '20px', fontWeight: 550 }}
							>
								{data.labels[selectedPortion]}
							</Typography>
							<CustomIcon
								name={iconConstants.cancelRounded}
								style={{
									cursor: 'pointer',
									width: '26px',
									height: '26px',
								}}
								onClick={() => setDrawerOpen(false)}
							/>
						</Box>
						<Box
							sx={{
								mt: '20px',
								height: `calc(100vh - 200px)`,
								overflow: 'auto',
							}}
						>
							{selectedCategoryData?.map((question, index) => (
								<Box sx={{ mb: '0px' }} key={index}>
									<Box
										sx={{
											display: 'flex',
											justifyContent: 'flex-start',
										}}
									>
										<Typography
											variant={typographyConstants.h5}
											sx={{ minWidth: '20px' }}
										>
											{`${index + 1}.`}
										</Typography>
										<Typography
											variant={typographyConstants.h5}
										>
											{localizationConstants.baselineQns[
												question?.question
											] || question?.question}
										</Typography>
									</Box>
									<FormControl sx={{ mt: '5px', pl: '20px' }}>
										<RadioGroup
											row
											aria-labelledby='demo-row-radio-buttons-group-label'
											name='row-radio-buttons-group'
										>
											<FormControlLabel
												value='Yes'
												control={
													<Radio
														checked={
															question?.status ===
															true
														}
													/>
												}
												label='Yes'
											/>
											<FormControlLabel
												value='No'
												control={
													<Radio
														checked={
															question?.status ===
															false
														}
													/>
												}
												label='No'
											/>
										</RadioGroup>
									</FormControl>
								</Box>
							))}
						</Box>
						<Box sx={{ pt: '20px' }}>
							<Box
								className={
									flexStyles?.flexRowCenterSpaceBetween
								}
								sx={{
									minHeight: '40px',
									backgroundColor:
										'globalElementColors.blue5',
									borderRadius: '4px',
									padding: '0px 16px 0px 16px',
								}}
							>
								<Typography
									sx={{
										color: 'globalElementColors.white',
										fontSize: '16px',
										fontWeight: 600,
									}}
								>
									{localizationConstants?.total}
								</Typography>
								<Typography
									sx={{
										color: 'globalElementColors.white',
										fontSize: '16px',
										fontWeight: 600,
									}}
								>
									{data?.datasets[0]?.data[selectedPortion]
										?.toFixed(2)
										.replace(/\.0+$/, '')}{' '}
									%
								</Typography>
							</Box>
						</Box>
					</Box>
				</Box>
			</Dialog>
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
									localizationConstants.individualStudentBaselineReportPDFReportMsg
								}
							</Typography>
						</Box>
						<Box
							sx={{ height: '150px', mt: '10px' }}
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
		</div>
	)
}

export default StudentBaselineReport
