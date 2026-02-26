import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { Box } from '@mui/system'
import { Bar, Doughnut } from 'react-chartjs-2'
import { BaselineAnalyticsStyles } from '../../initiations/baseline/baselineAnalyticsStyles'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import Chart from 'chart.js/auto'

import { teacherStyles } from './teacherIRIStyles'
import ChartDataLabels from 'chartjs-plugin-datalabels'

import { categories } from './teacherIRIConstants'
import { hexaCodes } from '../../../utils/hexaColorCodes'
import { useSelector } from 'react-redux'
import {
	DataforResultAndDiscussion,
	generateChartOptions,
} from './teacherFunctions'
Chart.register(ChartDataLabels)

const TeacherIRIReport = ({ specificTeacherIRIDetails }) => {
	const { drawerWidth } = useSelector((store) => store.dashboardSliceSetup)
	const rows = [
		{
			dimension: 'Perspective Taking',
			rankingInSchool:
				specificTeacherIRIDetails?.rankingInSchool?.perspectiveNPPercentile?.toFixed(
					2,
				),
			rankingAcrossSchool:
				specificTeacherIRIDetails?.rankingAcrossSchool?.perspectiveNPPercentile?.toFixed(
					2,
				),
		},
		{
			dimension: 'Vicarious Empathy / Imagination',
			rankingInSchool:
				specificTeacherIRIDetails?.rankingInSchool?.fantasyNPPercentile?.toFixed(
					2,
				),
			rankingAcrossSchool:
				specificTeacherIRIDetails?.rankingAcrossSchool?.fantasyNPPercentile?.toFixed(
					2,
				),
		},
		{
			dimension: 'Empathic Concern',
			rankingInSchool:
				specificTeacherIRIDetails?.rankingInSchool?.empathicNPPercentile?.toFixed(
					2,
				),
			rankingAcrossSchool:
				specificTeacherIRIDetails?.rankingAcrossSchool?.empathicNPPercentile?.toFixed(
					2,
				),
		},
		{
			dimension: 'Altruistic Reactivity',
			rankingInSchool:
				specificTeacherIRIDetails?.rankingInSchool?.personalDistressNPPercentile?.toFixed(
					2,
				),
			rankingAcrossSchool:
				specificTeacherIRIDetails?.rankingAcrossSchool?.personalDistressNPPercentile?.toFixed(
					2,
				),
		},
	]
	const percentages = [
		specificTeacherIRIDetails?.teacherIRIScore?.perspectiveTakingScale,
		specificTeacherIRIDetails?.teacherIRIScore?.fantasyScale,
		specificTeacherIRIDetails?.teacherIRIScore?.empathicConcernScale,
		specificTeacherIRIDetails?.teacherIRIScore?.personalDistressScale,
	]

	const data = {
		labels: categories,
		datasets: [
			{
				data: percentages,
				backgroundColor: [
					hexaCodes?.blue,
					hexaCodes?.yellow,
					hexaCodes?.orange,
					hexaCodes?.green,
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
	const dataForResultAndDiscussion = DataforResultAndDiscussion(
		specificTeacherIRIDetails?.teachersScores,
		specificTeacherIRIDetails?.teacherName,
	)
	const teacherIndex = specificTeacherIRIDetails?.teachersScores?.findIndex(
		(teacher) => teacher?._id === specificTeacherIRIDetails?._id,
	)

	const messsage = `Your result is higher than ${specificTeacherIRIDetails?.percentileOfSpecificTeacher}% of Others in ${specificTeacherIRIDetails?.schoolName}`

	return (
		<Box>
			<Box
				sx={{
					...teacherStyles?.questionBoxSx,
					height: '320px',
				}}
			>
				<Box>
					<Typography sx={{ fontWeight: 600 }}>
						{localizationConstants.IRIScore}
					</Typography>
				</Box>
				<Box
					sx={{
						pl: drawerWidth === 300 ? '20%' : '25%',
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
									{localizationConstants.perspectiveTaking}
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
									{localizationConstants.vicariousEmpathy}
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
									{localizationConstants.empathicConcern}
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
										backgroundColor: 'textColors.green2',
									}}
								/>
								<Typography
									variant={typographyConstants.h5}
									sx={{ pl: '10px', fontSize: '16px' }}
								>
									{localizationConstants.altruisticReactivity}
								</Typography>
							</Box>
						</Box>

						<Box
							sx={{
								width: '230px',
								height: '230px',
							}}
						>
							<Doughnut data={data} options={{ ...options }} />
						</Box>
					</Box>
				</Box>
			</Box>

			<Box
				sx={{
					...teacherStyles?.questionBoxSx,
					height: '265px',
					position: 'relative',
				}}
			>
				<Box>
					<Typography sx={{ fontWeight: 600 }}>
						{localizationConstants.DimensionWiseScore}
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
							width: `calc(100vw - ${drawerWidth + 90}px)`,
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
													localizationConstants.percentileInSchool
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
													localizationConstants.percentileAcrossSchool
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
													sx={{ fontWeight: 'dark' }}
												>
													{row.dimension}
												</Typography>
											</TableCell>
											<TableCell
												sx={{
													borderBottom:
														'1px solid #E2E2E2',
													fontWeight: 300,
												}}
												align='center'
											>
												<Typography
													sx={{ fontWeight: 'dark' }}
												>
													{row.rankingInSchool}
												</Typography>
											</TableCell>
											<TableCell
												sx={{
													borderBottom:
														'1px solid #E2E2E2',
													fontWeight: 300,
												}}
												align='center'
											>
												<Typography
													sx={{ fontWeight: 'dark' }}
												>
													{row.rankingAcrossSchool}
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
					height: '460px',
				}}
			>
				<Box sx={{ width: '100%' }}>
					<Typography
						variant={typographyConstants.h5}
						sx={{ marginLeft: '1rem', fontWeight: '600' }}
					>
						{localizationConstants.resultAndDiscussion}
					</Typography>

					{specificTeacherIRIDetails?.formStatus === 'Submitted' ? (
						<Box
							sx={{
								overflowX: 'auto',
								overflowY: 'hidden',
								mt: '20px  ',
								height: '400px',
							}}
						>
							<Box
								sx={{
									height: '200px',
									mt: '20px',
									display: 'flex',
								}}
							>
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										mt: '50px',
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
										variant={typographyConstants.h5}
									>
										{
											localizationConstants?.densityProportionMsg
										}
									</Typography>
								</Box>

								<Box
									sx={{
										width: `${dataForResultAndDiscussion?.labels?.length * 200}px`,
										ml: '1rem',
										height: '260px',
									}}
								>
									{specificTeacherIRIDetails?.formStatus ==
										'Submitted' && (
										<Typography
											variant={typographyConstants.body2}
											sx={{
												ml: '15%',
												fontWeight: 400,
											}}
										>
											{messsage}
										</Typography>
									)}
									<Bar
										data={dataForResultAndDiscussion}
										options={generateChartOptions(
											teacherIndex,
										)}
									/>
									<Box
										sx={{
											display: 'flex',
											ml: '30%',
										}}
									>
										<Typography
											sx={{ whiteSpace: 'nowrap' }}
										>
											{
												localizationConstants.AverageRratingAcrossQuestions
											}
										</Typography>
									</Box>
								</Box>
							</Box>
						</Box>
					) : (
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								height: '45vh',
							}}
						>
							<Typography variant={typographyConstants?.h2}>
								{localizationConstants?.noActiveFormsFound}
							</Typography>
						</Box>
					)}
				</Box>
			</Box>
		</Box>
	)
}

export default TeacherIRIReport
