import { Box } from '@mui/system'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material'
import { useSelector } from 'react-redux'
import { teacherStyles } from '../teacherIRI/teacherIRIStyles'
import { BaselineAnalyticsStyles } from '../../initiations/baseline/baselineAnalyticsStyles'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { Bar, Doughnut } from 'react-chartjs-2'
import Chart from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { hexaCodes } from '../../../utils/hexaColorCodes'
import {
	IdentiFiedStrengthScoreDataForLT,
	IdentiFiedStrengthScoreDataForST,
	NeedImprovementScoreDataForLT,
	NeedImprovementScoreDataForST,
	NeedSpecificSupportScoreDataForLT,
	NeedSpecificSupportScoreDataForST,
	ShortTermScoreData,
	categoriesForStudentCOPE,
	getBackgroundColor,
} from './StudentCopeConstants'
import { generateChartOptions } from './StudentCopeFunction'
Chart.register(ChartDataLabels)
const StudentsCOPEReport = ({ specificStudentCopeData }) => {
	const { drawerWidth } = useSelector((store) => store.dashboardSliceSetup)

	const rows = [
		{
			dimension: localizationConstants.emotionRegulation,
			shortTermRegulation: specificStudentCopeData?.emotionRegulationST,
			LongTermRegulation: specificStudentCopeData?.emotionRegulationLT,
		},
		{
			dimension: localizationConstants.impulseControl,
			shortTermRegulation: specificStudentCopeData?.impulseControlST,
			LongTermRegulation: specificStudentCopeData?.impulseControlLT,
		},
		{
			dimension: localizationConstants.resilience,
			shortTermRegulation: specificStudentCopeData?.resilienceST,
			LongTermRegulation: specificStudentCopeData?.resilienceLT,
		},
		{
			dimension: localizationConstants.attention,
			shortTermRegulation: specificStudentCopeData?.attentionST,
			LongTermRegulation: specificStudentCopeData?.attentionLT,
		},
		{
			dimension: localizationConstants.organization,
			shortTermRegulation: specificStudentCopeData?.organisationST,
			LongTermRegulation: specificStudentCopeData?.organisationLT,
		},
	]
	const rowsForSecondTable = [
		{
			shortTermRegulation: specificStudentCopeData?.shortTermRegulation,
			LongTermRegulation: specificStudentCopeData?.longTermRegulation,
		},
	]
	const percentages = [
		specificStudentCopeData?.emotionRegulationST,
		specificStudentCopeData?.resilienceST,
		specificStudentCopeData?.organisationST,
		specificStudentCopeData?.attentionST,
		specificStudentCopeData?.impulseControlST,
	]
	const data = {
		labels: categoriesForStudentCOPE,
		datasets: [
			{
				data: percentages,
				backgroundColor: [
					hexaCodes?.blue,
					hexaCodes?.yellow,
					hexaCodes?.orange,
					hexaCodes?.green,
					'#DD2A2B',
				],
				hoverOffset: 2,
				borderRadius: 6,
				spacing: 7,
				weight: 10,
			},
		],
	}
	const percentagesForLT = [
		specificStudentCopeData?.emotionRegulationLT,
		specificStudentCopeData?.resilienceLT,
		specificStudentCopeData?.organisationLT,
		specificStudentCopeData?.attentionLT,
		specificStudentCopeData?.impulseControlLT,
	]
	const dataForLT = {
		labels: categoriesForStudentCOPE,
		datasets: [
			{
				data: percentagesForLT,
				backgroundColor: [
					hexaCodes?.blue,
					hexaCodes?.yellow,
					hexaCodes?.orange,
					hexaCodes?.green,
					'#DD2A2B',
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
	return (
		<Box>
			{' '}
			<Box
				sx={{
					...teacherStyles?.questionBoxSx,
					height: '315px',
					width: drawerWidth === 300 ? '100%' : '100%',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<Box
					sx={{
						pl: drawerWidth === 300 ? '-10px' : '10px',
					}}
				>
					<Typography sx={{ fontWeight: 600 }}>
						{localizationConstants.componentWiseReport}
					</Typography>
				</Box>
				<Box
					sx={{
						pt: '30px',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<Box
						sx={{
							pl: drawerWidth === 300 ? '-20px' : '-10px',
							width: drawerWidth === 300 ? '115%' : '100%',
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
												sx={{ fontWeight: 600 }}
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
												sx={{ fontWeight: 600 }}
											>
												{
													localizationConstants.shortTermRegulation
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
													localizationConstants.LongTermRegulation
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
													sx={{ fontWeight: 'light' }}
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
													backgroundColor:
														getBackgroundColor(
															row.shortTermRegulation,
														),
												}}
												align='center'
											>
												<Typography
													variant='body2'
													sx={{ fontWeight: 'light' }}
												>
													{row.shortTermRegulation}
												</Typography>
											</TableCell>
											<TableCell
												sx={{
													borderBottom:
														'1px solid #E2E2E2',
													fontWeight: 300,
													lineHeight: 1.43,
													backgroundColor:
														getBackgroundColor(
															row.LongTermRegulation,
														),
												}}
												align='center'
											>
												<Typography
													variant='body2'
													sx={{ fontWeight: 'light' }}
												>
													{row.LongTermRegulation}
												</Typography>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					</Box>
				</Box>
			</Box>
			<Box
				sx={{
					...teacherStyles?.questionBoxSx,
					height: '150px',
					width: drawerWidth === 300 ? '100%' : '100%',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<Box
					sx={{
						pl: drawerWidth === 300 ? '-10px' : '10px',
					}}
				>
					<Typography sx={{ fontWeight: 600 }}>
						{localizationConstants.overallSelfRegulation}
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
							width: drawerWidth === 300 ? '115%' : '100%',
						}}
					>
						<TableContainer
							sx={{
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
												sx={{ fontWeight: 600 }}
											>
												{
													localizationConstants.shortTermRegulation
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
													localizationConstants.LongTermRegulation
												}
											</Typography>
										</TableCell>
									</TableRow>
								</TableHead>

								<TableBody>
									{rowsForSecondTable.map((row, index) => (
										<TableRow key={index}>
											<TableCell
												sx={{
													borderBottom:
														'1px solid #E2E2E2',
													fontWeight: 300,
													lineHeight: 1.43,
													backgroundColor:
														getBackgroundColor(
															row.shortTermRegulation,
														),
												}}
												align='center'
											>
												<Typography
													variant='body2'
													sx={{ fontWeight: 'light' }}
												>
													{row.shortTermRegulation}
												</Typography>
											</TableCell>
											<TableCell
												sx={{
													borderBottom:
														'1px solid #E2E2E2',
													fontWeight: 300,
													lineHeight: 1.43,
													backgroundColor:
														getBackgroundColor(
															row.LongTermRegulation,
														),
												}}
												align='center'
											>
												<Typography
													variant='body2'
													sx={{ fontWeight: 'light' }}
												>
													{row.LongTermRegulation}
												</Typography>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					</Box>
				</Box>
			</Box>
			{/* Score amongst Five Domains */}
			<Box
				sx={{
					pl: drawerWidth === 300 ? '-10px' : '10px',
					mt: '30px',
				}}
			>
				<Typography
					sx={{ fontWeight: 600 }}
					variant={typographyConstants.h4}
				>
					{localizationConstants.scoreAmongstFiveDomains}
				</Typography>
			</Box>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'row',
					gap: '20px',
				}}
			>
				<Box
					sx={{
						...teacherStyles?.questionBoxSx,
						height: '320px',
						mt: '20px',
						width: '50%',
					}}
				>
					<Box>
						<Typography
							sx={{ fontWeight: 600, flexWrap: 'nowrap' }}
						>
							{localizationConstants.shortTermRegulation}
						</Typography>
					</Box>
					<Box
						sx={{
							// pl: drawerWidth === 300 ? '20%' : '25%',
							ml: '-160px',

							pt: '30px',
						}}
					>
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								gap: '40px',
							}}
						>
							<Box>
								<Box
									sx={{
										...BaselineAnalyticsStyles?.categoryColorSx,
										pt: '25px',
									}}
								>
									<Box
										sx={{
											...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
											backgroundColor:
												'globalElementColors.blue2',
										}}
									/>
									<Typography
										variant={typographyConstants.h5}
										sx={{ pl: '10px', fontSize: '16px' }}
									>
										{
											localizationConstants.emotionRegulation
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
											backgroundColor:
												'globalElementColors.yellow3',
										}}
									/>
									<Typography
										variant={typographyConstants.h5}
										sx={{ pl: '10px', fontSize: '16px' }}
									>
										{localizationConstants.resilience}
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
											backgroundColor:
												'globalElementColors.yellow2',
										}}
									/>
									<Typography
										variant={typographyConstants.h5}
										sx={{ pl: '10px', fontSize: '16px' }}
									>
										{localizationConstants.organisation}
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
											backgroundColor:
												'textColors.green2',
										}}
									/>
									<Typography
										variant={typographyConstants.h5}
										sx={{ pl: '10px', fontSize: '16px' }}
									>
										{
											localizationConstants.altruisticReactivity
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
										sx={{ pl: '10px', fontSize: '16px' }}
									>
										{localizationConstants.impulseControl}
									</Typography>
								</Box>
							</Box>

							<Box
								sx={{
									width: '230px',
									height: '230px',
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

				<Box
					sx={{
						...teacherStyles?.questionBoxSx,
						height: '320px',
						mt: '20px',
						width: '50%',
					}}
				>
					<Box>
						<Typography
							sx={{ fontWeight: 600, flexWrap: 'nowrap' }}
						>
							{localizationConstants.LongTermRegulation}
						</Typography>
					</Box>
					<Box
						sx={{
							// pl: drawerWidth === 300 ? '20%' : '25%',
							ml: '-160px',

							pt: '30px',
						}}
					>
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								gap: '40px',
							}}
						>
							<Box>
								<Box
									sx={{
										...BaselineAnalyticsStyles?.categoryColorSx,
										pt: '25px',
									}}
								>
									<Box
										sx={{
											...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
											backgroundColor:
												'globalElementColors.blue2',
										}}
									/>
									<Typography
										variant={typographyConstants.h5}
										sx={{ pl: '10px', fontSize: '16px' }}
									>
										{
											localizationConstants.emotionRegulation
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
											backgroundColor:
												'globalElementColors.yellow3',
										}}
									/>
									<Typography
										variant={typographyConstants.h5}
										sx={{ pl: '10px', fontSize: '16px' }}
									>
										{localizationConstants.resilience}
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
											backgroundColor:
												'globalElementColors.yellow2',
										}}
									/>
									<Typography
										variant={typographyConstants.h5}
										sx={{ pl: '10px', fontSize: '16px' }}
									>
										{localizationConstants.organisation}
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
											backgroundColor:
												'textColors.green2',
										}}
									/>
									<Typography
										variant={typographyConstants.h5}
										sx={{ pl: '10px', fontSize: '16px' }}
									>
										{
											localizationConstants.altruisticReactivity
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
										sx={{ pl: '10px', fontSize: '16px' }}
									>
										{localizationConstants.impulseControl}
									</Typography>
								</Box>
							</Box>

							<Box
								sx={{
									width: '230px',
									height: '230px',
								}}
							>
								<Doughnut
									data={dataForLT}
									options={{ ...options }}
								/>
							</Box>
						</Box>
					</Box>
				</Box>
			</Box>
			{/* Student Score Comparison with Mean in School */}
			<Box
				sx={{
					pl: drawerWidth === 300 ? '-10px' : '10px',
					mt: '30px',
				}}
			>
				<Typography
					sx={{ fontWeight: 600 }}
					variant={typographyConstants.h4}
				>
					{localizationConstants.studentScoreComarisonTitle}
				</Typography>
			</Box>
			<Box
				sx={{
					pt: '20px',
					width: `calc(100vw - ${drawerWidth + 56}px)`,
					display: 'flex',
					gap: '20px',
				}}
			>
				<Box
					sx={{
						...teacherStyles?.boxGraphSx,
						overflowX: 'auto',
						overflowY: 'hidden',
					}}
				>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
						}}
					>
						<Typography
							variant={typographyConstants.h5}
							sx={{ fontWeight: 600, pb: '10px' }}
						>
							{localizationConstants.shortTermScoreAverage}
						</Typography>
						<Box
							sx={{
								display: 'flex',
							}}
						>
							<Typography
								sx={{
									color: 'red',
									fontWeight: 800,
									width: '9px',
									height: '3px',
									borderRadius: '25px',
								}}
							>
								-
							</Typography>{' '}
							<Typography
								variant='body2'
								sx={{ pb: '10px' }}
								ml='7px'
							>
								{localizationConstants.meanValue}
							</Typography>
						</Box>
					</Box>
					<Box
						sx={{
							height: '173px',
							width: '650px',
						}}
					>
						<Bar
							data={ShortTermScoreData([
								specificStudentCopeData?.shortTermRegulation,
							])}
							options={generateChartOptions([
								specificStudentCopeData?.schoolMeanForSTReg,
							])}
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
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
						}}
					>
						<Typography
							variant={typographyConstants.h5}
							sx={{ fontWeight: 600, pb: '10px' }}
						>
							{localizationConstants.longTermScoreAvg}
						</Typography>
						<Box
							sx={{
								display: 'flex',
							}}
						>
							<Typography
								sx={{
									color: 'red',
									fontWeight: 800,
									width: '9px',
									height: '3px',
									borderRadius: '25px',
								}}
							>
								-
							</Typography>{' '}
							<Typography
								variant='body2'
								sx={{ pb: '10px' }}
								ml='7px'
							>
								{localizationConstants.meanValue}
							</Typography>
						</Box>
					</Box>
					<Box
						sx={{
							height: '173px',
							width: '650px',
						}}
					>
						<Bar
							data={ShortTermScoreData(
								[specificStudentCopeData?.longTermRegulation],
								true,
							)}
							options={generateChartOptions([
								specificStudentCopeData?.schoolMeanForLTReg,
							])}
						/>
					</Box>
				</Box>
			</Box>
			{/* Student Score Comparison with Mean Across all Schools */}
			<Box
				sx={{
					pl: drawerWidth === 300 ? '-10px' : '10px',
					mt: '30px',
				}}
			>
				<Typography
					sx={{ fontWeight: 600 }}
					variant={typographyConstants.h4}
				>
					{
						localizationConstants.studentScoreAcrossSchollsComarisonTitle
					}
				</Typography>
			</Box>
			<Box
				sx={{
					pt: '20px',
					width: `calc(100vw - ${drawerWidth + 56}px)`,
					display: 'flex',
					gap: '20px',
				}}
			>
				<Box
					sx={{
						...teacherStyles?.boxGraphSx,
						overflowX: 'auto',
						overflowY: 'hidden',
					}}
				>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
						}}
					>
						<Typography
							variant={typographyConstants.h5}
							sx={{ fontWeight: 600, pb: '10px' }}
						>
							{localizationConstants.shortTermScoreAverage}
						</Typography>
						<Box
							sx={{
								display: 'flex',
							}}
						>
							<Typography
								sx={{
									color: 'red',
									fontWeight: 800,
									width: '9px',
									height: '3px',
									borderRadius: '25px',
								}}
							>
								-
							</Typography>{' '}
							<Typography
								variant='body2'
								sx={{ pb: '10px' }}
								ml='7px'
							>
								{localizationConstants.meanValue}
							</Typography>
						</Box>
					</Box>
					<Box
						sx={{
							height: '173px',
							width: '650px',
						}}
					>
						<Bar
							data={ShortTermScoreData([
								specificStudentCopeData?.shortTermRegulation,
							])}
							options={generateChartOptions([
								specificStudentCopeData?.MeanAcrossSchoolForSTReg,
							])}
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
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
						}}
					>
						<Typography
							variant={typographyConstants.h5}
							sx={{ fontWeight: 600, pb: '10px' }}
						>
							{localizationConstants.longTermScoreAvg}
						</Typography>
						<Box
							sx={{
								display: 'flex',
							}}
						>
							<Typography
								sx={{
									color: 'red',
									fontWeight: 800,
									width: '9px',
									height: '3px',
									borderRadius: '25px',
								}}
							>
								-
							</Typography>{' '}
							<Typography
								variant='body2'
								sx={{ pb: '10px' }}
								ml='7px'
							>
								{localizationConstants.meanValue}
							</Typography>
						</Box>
					</Box>
					<Box
						sx={{
							height: '173px',
							width: '650px',
						}}
					>
						<Bar
							data={ShortTermScoreData(
								[specificStudentCopeData?.longTermRegulation],
								true,
							)}
							options={generateChartOptions([
								specificStudentCopeData?.MeanAcrossSchoolForLTReg,
							])}
						/>
					</Box>
				</Box>
			</Box>
			{/* Identified Strength Graphs */}
			<Box
				sx={{
					pl: drawerWidth === 300 ? '-10px' : '10px',
					mt: '30px',
				}}
			>
				<Typography
					sx={{ fontWeight: 600 }}
					variant={typographyConstants.h4}
				>
					{localizationConstants.identifiedStrength}
				</Typography>
			</Box>
			<Box
				sx={{
					pt: '20px',
					width: `calc(100vw - ${drawerWidth + 56}px)`,
					display: 'flex',
					gap: '20px',
				}}
			>
				<Box
					sx={{
						...teacherStyles?.boxGraphSx,
						overflowX: 'auto',
						overflowY: 'hidden',
					}}
				>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
						}}
					>
						<Typography
							variant={typographyConstants.h5}
							sx={{ fontWeight: 600, pb: '10px' }}
						>
							{localizationConstants.shortTerm}
						</Typography>
					</Box>
					{!specificStudentCopeData?.STDomainForIdentifiedStrength
						.length > 0 ? (
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								mt: '70px',
							}}
						>
							<Typography
								variant={typographyConstants.h2}
								sx={{ pb: '10px', color: '#6A6A6A' }}
							>
								{localizationConstants.noData}
							</Typography>
						</Box>
					) : (
						<Box
							sx={{
								height: '173px',
								width: '650px',
							}}
						>
							<Bar
								data={IdentiFiedStrengthScoreDataForST(
									specificStudentCopeData?.STDomainForIdentifiedStrength,
								)}
								options={generateChartOptions()}
							/>
						</Box>
					)}
				</Box>

				<Box
					sx={{
						...teacherStyles?.boxGraphSx,
						overflowX: 'auto',
						overflowY: 'hidden',
					}}
				>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
						}}
					>
						<Typography
							variant={typographyConstants.h5}
							sx={{ fontWeight: 600, pb: '10px' }}
						>
							{localizationConstants.longTerm}
						</Typography>
					</Box>
					{!specificStudentCopeData?.LTDomainForIdentifiedStrength
						.length > 0 ? (
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								mt: '70px',
							}}
						>
							<Typography
								variant={typographyConstants.h2}
								sx={{ pb: '10px', color: '#6A6A6A' }}
							>
								{localizationConstants.noData}
							</Typography>
						</Box>
					) : (
						<Box
							sx={{
								height: '173px',
								width: '650px',
							}}
						>
							<Bar
								data={IdentiFiedStrengthScoreDataForLT(
									specificStudentCopeData?.LTDomainForIdentifiedStrength,
								)}
								options={generateChartOptions()}
							/>
						</Box>
					)}
				</Box>
			</Box>
			{/* Need Improvement Graphs*/}
			<Box
				sx={{
					pl: drawerWidth === 300 ? '-10px' : '10px',
					mt: '30px',
				}}
			>
				<Typography
					sx={{ fontWeight: 600 }}
					variant={typographyConstants.h4}
				>
					{localizationConstants.needImprovement}
				</Typography>
			</Box>
			<Box
				sx={{
					pt: '20px',
					width: `calc(100vw - ${drawerWidth + 56}px)`,
					display: 'flex',
					gap: '20px',
				}}
			>
				<Box
					sx={{
						...teacherStyles?.boxGraphSx,
						overflowX: 'auto',
						overflowY: 'hidden',
					}}
				>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
						}}
					>
						<Typography
							variant={typographyConstants.h5}
							sx={{ fontWeight: 600, pb: '10px' }}
						>
							{localizationConstants.shortTerm}
						</Typography>
					</Box>

					{!specificStudentCopeData?.STDomainsNeedingImprovement
						.length > 0 ? (
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								mt: '70px',
							}}
						>
							<Typography
								variant={typographyConstants.h2}
								sx={{ pb: '10px', color: '#6A6A6A' }}
							>
								{localizationConstants.noData}
							</Typography>
						</Box>
					) : (
						<Box
							sx={{
								height: '173px',
								width: '650px',
							}}
						>
							<Bar
								data={NeedImprovementScoreDataForST(
									specificStudentCopeData?.STDomainsNeedingImprovement,
								)}
								options={generateChartOptions()}
							/>
						</Box>
					)}
				</Box>

				<Box
					sx={{
						...teacherStyles?.boxGraphSx,
						overflowX: 'auto',
						overflowY: 'hidden',
					}}
				>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
						}}
					>
						<Typography
							variant={typographyConstants.h5}
							sx={{ fontWeight: 600, pb: '10px' }}
						>
							{localizationConstants.longTerm}
						</Typography>
					</Box>
					{false ? (
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								mt: '70px',
							}}
						>
							<Typography
								variant={typographyConstants.h2}
								sx={{ pb: '10px', color: '#6A6A6A' }}
							>
								{localizationConstants.noData}
							</Typography>
						</Box>
					) : (
						<Box
							sx={{
								height: '173px',
								width: '650px',
							}}
						>
							<Bar
								data={NeedImprovementScoreDataForLT(
									specificStudentCopeData?.LTDomainsNeedingImprovement,
								)}
								options={generateChartOptions()}
							/>
						</Box>
					)}
				</Box>
			</Box>
			{/* Need Specific Support Graphs */}
			<Box
				sx={{
					pl: drawerWidth === 300 ? '-10px' : '10px',
					mt: '30px',
				}}
			>
				<Typography
					sx={{ fontWeight: 600 }}
					variant={typographyConstants.h4}
				>
					{localizationConstants.needSpecificSupport}
				</Typography>
			</Box>
			<Box
				sx={{
					pt: '20px',
					width: `calc(100vw - ${drawerWidth + 56}px)`,
					display: 'flex',
					gap: '20px',
				}}
			>
				<Box
					sx={{
						...teacherStyles?.boxGraphSx,
						overflowX: 'auto',
						overflowY: 'hidden',
					}}
				>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
						}}
					>
						<Typography
							variant={typographyConstants.h5}
							sx={{ fontWeight: 600, pb: '10px' }}
						>
							{localizationConstants.shortTerm}
						</Typography>
					</Box>

					{!specificStudentCopeData?.STDomainNeedingSpecificSupport
						.length > 0 ? (
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								mt: '70px',
							}}
						>
							<Typography
								variant={typographyConstants.h2}
								sx={{ pb: '10px', color: '#6A6A6A' }}
							>
								{localizationConstants.noData}
							</Typography>
						</Box>
					) : (
						<Box
							sx={{
								height: '173px',
								width: '650px',
							}}
						>
							<Bar
								data={NeedSpecificSupportScoreDataForST(
									specificStudentCopeData?.STDomainNeedingSpecificSupport,
								)}
								options={generateChartOptions()}
							/>
						</Box>
					)}
				</Box>

				<Box
					sx={{
						...teacherStyles?.boxGraphSx,
						overflowX: 'auto',
						overflowY: 'hidden',
					}}
				>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
						}}
					>
						<Typography
							variant={typographyConstants.h5}
							sx={{ fontWeight: 600, pb: '10px' }}
						>
							{localizationConstants.longTerm}
						</Typography>
					</Box>
					{!specificStudentCopeData?.LTDomainNeedingSpecificSupport
						.length > 0 ? (
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								mt: '70px',
							}}
						>
							<Typography
								variant={typographyConstants.h2}
								sx={{ pb: '10px', color: '#6A6A6A' }}
							>
								{localizationConstants.noData}
							</Typography>
						</Box>
					) : (
						<Box
							sx={{
								height: '173px',
								width: '650px',
							}}
						>
							<Bar
								data={NeedSpecificSupportScoreDataForLT(
									specificStudentCopeData?.LTDomainNeedingSpecificSupport,
								)}
								options={generateChartOptions()}
							/>
						</Box>
					)}
				</Box>
			</Box>
		</Box>
	)
}

export default StudentsCOPEReport
