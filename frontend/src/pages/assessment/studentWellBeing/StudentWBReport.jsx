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
	CHSandPWBData,
	CategorizationData,
	CategorizationDataPWB,
	doughtOptions,
	getBackgroundColor,
} from './studentWellBeingConstants'
import { generateChartOptions } from './studentWellBeingFunctions'
import { useEffect, useState } from 'react'
Chart.register(ChartDataLabels)

const StudentWBReport = ({ specificStudentWBData }) => {
	const { drawerWidth } = useSelector((store) => store.dashboardSliceSetup)
	const [doughtCHSData, setDoughtCHSData] = useState({
		labels: [localizationConstants.pathway, localizationConstants.agency],
		datasets: [
			{
				data: [0, 0],
				backgroundColor: [hexaCodes?.blue, hexaCodes?.yellow],
				hoverOffset: 2,
				borderRadius: 6,
				spacing: 3,
				weight: 10,
				hoverBorderColor: [hexaCodes?.blue, hexaCodes?.yellow],
				hoverBackgroundColor: [hexaCodes?.blue, hexaCodes?.yellow],
				borderColor: [hexaCodes?.blue, hexaCodes?.yellow],
			},
		],
	})
	const [doughtPWBData, setDoughtPWBData] = useState({
		labels: [
			localizationConstants.autonomy,
			localizationConstants.environmental,
			localizationConstants.personalGrowth,
			localizationConstants.positiveRelationswithOthers,
			localizationConstants.purposeinlife,
			localizationConstants.SelfAcceptance,
		],
		datasets: [
			{
				data: [0, 0, 0, 0, 0, 0],
				backgroundColor: [
					hexaCodes?.blue,
					hexaCodes?.yellow,
					hexaCodes?.orange,
					hexaCodes?.green,
					hexaCodes?.crimson,
					hexaCodes?.dodgerBlue,
				],
				hoverOffset: 2,
				hoverBorderColor: [
					hexaCodes?.blue,
					hexaCodes?.yellow,
					hexaCodes?.orange,
					hexaCodes?.green,
					hexaCodes?.crimson,
					hexaCodes?.dodgerBlue,
				],
				hoverBackgroundColor: [
					hexaCodes?.blue,
					hexaCodes?.yellow,
					hexaCodes?.orange,
					hexaCodes?.green,
					hexaCodes?.crimson,
					hexaCodes?.dodgerBlue,
				],
				borderColor: [
					hexaCodes?.blue,
					hexaCodes?.yellow,
					hexaCodes?.orange,
					hexaCodes?.green,
					hexaCodes?.crimson,
					hexaCodes?.dodgerBlue,
				],
				borderRadius: 6,
				spacing: 7,
				weight: 10,
			},
		],
	})

	const doughnutGraphDataNotPresent = {
		labels: [' '],
		datasets: [
			{
				data: [100],
				backgroundColor: hexaCodes.grey5,
				hoverOffset: 0,
				weight: 10,
				borderColor: hexaCodes.grey5,
				hoverBackgroundColor: hexaCodes.grey5,
				hoverBorderColor: hexaCodes.grey5,
			},
		],
	}
	const doughnutGraphOptionsNotPresent = {
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
			datalabels: {
				display: false,
			},
			tooltip: {
				enabled: false,
			},
		},
	}
	useEffect(() => {
		setDoughtCHSData({
			...doughtCHSData,
			datasets: [
				{
					...doughtCHSData?.datasets?.[0],
					data: [
						specificStudentWBData?.childsHopeScale
							?.CH_PathwayMarks ?? 0,
						specificStudentWBData?.childsHopeScale
							?.CH_AgencyMarks ?? 0,
					],
				},
			],
		})
		setDoughtPWBData({
			...doughtPWBData,
			datasets: [
				{
					...doughtPWBData?.datasets?.[0],
					data: [
						specificStudentWBData?.PsychologicalWellBeingScale
							?.PWB_AutonomyMarks ?? 0,
						specificStudentWBData?.PsychologicalWellBeingScale
							?.PWB_EnvironmentalMarks ?? 0,
						specificStudentWBData?.PsychologicalWellBeingScale
							?.PWB_PersonalGrowthMarks ?? 0,
						specificStudentWBData?.PsychologicalWellBeingScale
							?.PWB_PositiveRelationsMarks ?? 0,
						specificStudentWBData?.PsychologicalWellBeingScale
							?.PWB_PurposeInLifeMarks ?? 0,
						specificStudentWBData?.PsychologicalWellBeingScale
							?.PWB_SelfAcceptanceMarks ?? 0,
					],
				},
			],
		})
	}, [specificStudentWBData])

	return (
		<Box
			sx={{
				mt: '10px',
			}}
		>
			<Box
				sx={{
					height: '155px',
					display: 'flex',
					flexDirection: 'column',
					p: '20px 16px',
					border: '1px solid',
					borderColor: 'globalElementColors.grey4',
					borderRadius: '10px',
				}}
			>
				<Box
					sx={{
						pl: drawerWidth === 300 ? '-10px' : '10px',
					}}
				>
					<Typography sx={{ fontWeight: 600 }}>
						{localizationConstants.overAllScore}
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
							width: '100%',
						}}
					>
						<TableContainer
							sx={{
								border: '1px solid #E2E2E2',
								borderBottom: 'none',
							}}
						>
							<Table
								aria-labelledby='tableTitle'
								size='small'
								stickyHeader
							>
								<TableHead>
									<TableRow sx={{ width: '100%' }}>
										<TableCell
											sx={{
												borderBottom:
													'1px solid #E2E2E2',
												borderRight:
													'1px solid #E2E2E2',
												backgroundColor:
													'globalElementColors.lightBlue2',
												fontWeight: 'bold',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
											}}
										>
											<Typography
												sx={{ fontWeight: 600 }}
											>
												{
													localizationConstants.childrenHopeScale
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
													localizationConstants.psychologicalWBScale
												}
											</Typography>
										</TableCell>
									</TableRow>
								</TableHead>

								<TableBody>
									<TableRow>
										<TableCell
											sx={{
												fontWeight: 300,
												lineHeight: 1.43,
												backgroundColor:
													getBackgroundColor(
														specificStudentWBData
															?.childsHopeScale
															?.overallHopeScore ??
															0,
													),
												borderRight:
													'1px solid #E2E2E2',
											}}
											align='center'
										>
											<Typography
												variant='body2'
												sx={{ fontWeight: 'light' }}
											>
												{specificStudentWBData
													?.childsHopeScale
													?.overallHopeScore ?? 0}
											</Typography>
										</TableCell>
										<TableCell
											sx={{
												fontWeight: 300,
												lineHeight: 1.43,
												backgroundColor:
													getBackgroundColor(
														specificStudentWBData
															?.PsychologicalWellBeingScale
															?.overallWellBeingScaleScore ??
															0,
													),
											}}
											align='center'
										>
											<Typography
												variant='body2'
												sx={{ fontWeight: 'light' }}
											>
												{specificStudentWBData
													?.PsychologicalWellBeingScale
													?.overallWellBeingScaleScore ??
													0}
											</Typography>
										</TableCell>
									</TableRow>
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
					{localizationConstants.scoreAmongstDomains}
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
						height: '302px',
						mt: '20px',
						width: '50%',
						display: 'flex',
						flexDirection: 'column',
						p: '20px 16px',
						border: '1px solid',
						borderColor: 'globalElementColors.grey4',
						borderRadius: '10px',
					}}
				>
					<Box>
						<Typography
							sx={{ fontWeight: 600, flexWrap: 'nowrap' }}
						>
							{localizationConstants.childrenHopeScale}
						</Typography>
					</Box>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
						}}
					>
						<Box>
							<Box
								sx={{
									...BaselineAnalyticsStyles?.categoryColorSx,
									alignItems: 'center',
									mt: '30px',
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
									{localizationConstants.pathway}
								</Typography>
							</Box>
							<Box
								sx={{
									...BaselineAnalyticsStyles?.categoryColorSx,
									alignItems: 'center',
								}}
							>
								<Box
									sx={{
										...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
										backgroundColor:
											'globalElementColors.yellow',
									}}
								/>
								<Typography
									variant={typographyConstants.h5}
									sx={{ pl: '10px', fontSize: '16px' }}
								>
									{localizationConstants.agency}
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
								data={
									doughtCHSData?.datasets?.[0]?.data?.some(
										(d) => d > 0,
									)
										? doughtCHSData
										: doughnutGraphDataNotPresent
								}
								options={
									doughtCHSData?.datasets?.[0]?.data?.some(
										(d) => d > 0,
									)
										? doughtOptions
										: doughnutGraphOptionsNotPresent
								}
							/>
						</Box>
					</Box>
				</Box>

				<Box
					sx={{
						height: '302px',
						mt: '20px',
						width: '50%',
						display: 'flex',
						flexDirection: 'column',
						p: '20px 16px',
						border: '1px solid',
						borderColor: 'globalElementColors.grey4',
						borderRadius: '10px',
					}}
				>
					<Box>
						<Typography
							sx={{ fontWeight: 600, flexWrap: 'nowrap' }}
						>
							{localizationConstants.psychologicalWBScale}
						</Typography>
					</Box>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
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
									{localizationConstants.autonomy}
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
									{localizationConstants.environmental}
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
									{localizationConstants.personalGrowth}
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
									{
										localizationConstants.positiveRelationswithOthers
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
										backgroundColor: hexaCodes?.crimson,
									}}
								/>
								<Typography
									variant={typographyConstants.h5}
									sx={{ pl: '10px', fontSize: '16px' }}
								>
									{localizationConstants.purposeinlife}
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
										backgroundColor: hexaCodes?.dodgerBlue,
									}}
								/>
								<Typography
									variant={typographyConstants.h5}
									sx={{ pl: '10px', fontSize: '16px' }}
								>
									{localizationConstants.SelfAcceptance}
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
								data={
									doughtPWBData?.datasets?.[0]?.data?.some(
										(d) => d > 0,
									)
										? doughtPWBData
										: doughnutGraphDataNotPresent
								}
								options={
									doughtPWBData?.datasets?.[0]?.data?.some(
										(d) => d > 0,
									)
										? doughtOptions
										: doughnutGraphOptionsNotPresent
								}
							/>
						</Box>
					</Box>
				</Box>
			</Box>
			{/* Student Score Comparison with Mean in School */}
			<Box
				sx={{
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
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'space-between',
					width: '100%',
				}}
			>
				<Box
					sx={{
						...teacherStyles?.boxGraphSx,
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
							{localizationConstants.childrenHopeScale} (Average)
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
							width: '100%',
						}}
					>
						<Bar
							key={specificStudentWBData}
							data={CHSandPWBData(
								[
									specificStudentWBData?.childsHopeScale
										?.overallHopeScore ?? 0,
								],
								true,
								(specificStudentWBData?.childsHopeScale
									?.overallHopeScore ?? 0) >
									(specificStudentWBData?.CHS_inSchoolAvg ??
										0),
							)}
							options={generateChartOptions(
								[specificStudentWBData?.CHS_inSchoolAvg ?? 0],
								CHSandPWBData(
									[
										specificStudentWBData?.childsHopeScale
											?.overallHopeScore ?? 0,
									],
									true,
								),
							)}
						/>
					</Box>
				</Box>

				<Box
					sx={{
						...teacherStyles?.boxGraphSx,
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
							{localizationConstants.psychologicalWBScale}{' '}
							(Average)
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
							width: '100%',
						}}
					>
						<Bar
							key={specificStudentWBData}
							data={CHSandPWBData(
								[
									specificStudentWBData
										?.PsychologicalWellBeingScale
										?.overallWellBeingScaleScore ?? 0,
								],
								false,
								(specificStudentWBData
									?.PsychologicalWellBeingScale
									?.overallWellBeingScaleScore ?? 0) >
									(specificStudentWBData?.PWB_inSchoolAvg ??
										0),
							)}
							options={generateChartOptions(
								[specificStudentWBData?.PWB_inSchoolAvg ?? 0],
								CHSandPWBData(
									[
										specificStudentWBData
											?.PsychologicalWellBeingScale
											?.overallWellBeingScaleScore ?? 0,
									],
									false,
								),
							)}
						/>
					</Box>
				</Box>
			</Box>
			{/* Student Score Comparison with Mean Across all Schools */}
			<Box
				sx={{
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
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'space-between',
					width: '100%',
				}}
			>
				<Box
					sx={{
						...teacherStyles?.boxGraphSx,
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
							{localizationConstants.childrenHopeScale} (Average)
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
							width: '100%',
						}}
					>
						<Bar
							key={specificStudentWBData}
							data={CHSandPWBData(
								[
									specificStudentWBData?.childsHopeScale
										?.overallHopeScore ?? 0,
								],
								true,
								(specificStudentWBData?.childsHopeScale
									?.overallHopeScore ?? 0) >
									(specificStudentWBData?.CHS_acrossSchoolAvg ??
										0),
							)}
							options={generateChartOptions(
								[
									specificStudentWBData?.CHS_acrossSchoolAvg ??
										0,
								],
								CHSandPWBData(
									[
										specificStudentWBData?.childsHopeScale
											?.overallHopeScore ?? 0,
									],
									true,
								),
							)}
						/>
					</Box>
				</Box>

				<Box
					sx={{
						...teacherStyles?.boxGraphSx,
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
							{localizationConstants.psychologicalWBScale}{' '}
							(Average)
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
							width: '100%',
						}}
					>
						<Bar
							key={specificStudentWBData}
							data={CHSandPWBData(
								[
									specificStudentWBData
										?.PsychologicalWellBeingScale
										?.overallWellBeingScaleScore ?? 0,
								],
								false,
								(specificStudentWBData
									?.PsychologicalWellBeingScale
									?.overallWellBeingScaleScore ?? 0) >
									(specificStudentWBData?.PWB_acrossSchoolAvg ??
										0),
							)}
							options={generateChartOptions(
								[
									specificStudentWBData?.PWB_acrossSchoolAvg ??
										0,
								],
								CHSandPWBData(
									[
										specificStudentWBData
											?.PsychologicalWellBeingScale
											?.overallWellBeingScaleScore ?? 0,
									],
									false,
								),
							)}
						/>
					</Box>
				</Box>
			</Box>
			{/* CHS */}
			<Box
				sx={{
					mt: '30px',
				}}
			>
				<Typography
					sx={{ fontWeight: 600 }}
					variant={typographyConstants.h4}
				>
					{localizationConstants.categorizationOverallHopeCHS}
				</Typography>
			</Box>
			<Box
				sx={{
					pt: '20px',
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'space-between',
					width: '100%',
				}}
			>
				<Box
					sx={{
						...teacherStyles?.boxGraphSx,
						p: '10px',
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
							{localizationConstants.notoVeryLowHope}
						</Typography>
					</Box>
					{!specificStudentWBData?.NotoVeryLowHope?.Agency &&
					!specificStudentWBData?.NotoVeryLowHope?.Pathway ? (
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
								sx={{
									pb: '10px',
									color: 'globalElementColors.grey1',
								}}
							>
								{localizationConstants.noData}
							</Typography>
						</Box>
					) : (
						<Box
							sx={{
								height: '173px',
								width: '100%',
							}}
						>
							<Bar
								data={CategorizationData([
									specificStudentWBData?.NotoVeryLowHope
										?.Pathway ?? 0,
									specificStudentWBData?.NotoVeryLowHope
										?.Agency ?? 0,
								])}
								options={generateChartOptions(
									undefined,
									CategorizationData([
										specificStudentWBData?.NotoVeryLowHope
											?.Pathway ?? 0,
										specificStudentWBData?.NotoVeryLowHope
											?.Agency ?? 0,
									]),
								)}
							/>
						</Box>
					)}
				</Box>

				<Box
					sx={{
						...teacherStyles?.boxGraphSx,
						p: '10px',
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
							{localizationConstants.slightlyHopeful}
						</Typography>
					</Box>
					{!specificStudentWBData?.SlightlyHopeful?.Agency &&
					!specificStudentWBData?.SlightlyHopeful?.Pathway ? (
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
								sx={{
									pb: '10px',
									color: 'globalElementColors.grey1',
								}}
							>
								{localizationConstants.noData}
							</Typography>
						</Box>
					) : (
						<Box
							sx={{
								height: '173px',
								width: '100%',
							}}
						>
							<Bar
								data={CategorizationData([
									specificStudentWBData?.SlightlyHopeful
										?.Pathway ?? 0,
									specificStudentWBData?.SlightlyHopeful
										?.Agency ?? 0,
								])}
								options={generateChartOptions(
									undefined,
									CategorizationData([
										specificStudentWBData?.SlightlyHopeful
											?.Pathway ?? 0,
										specificStudentWBData?.SlightlyHopeful
											?.Agency ?? 0,
									]),
								)}
							/>
						</Box>
					)}
				</Box>
			</Box>
			<Box
				sx={{
					pt: '20px',
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'space-between',
					width: '100%',
				}}
			>
				<Box
					sx={{
						...teacherStyles?.boxGraphSx,
						p: '10px',
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
							{localizationConstants.moderatelyHopeful}
						</Typography>
					</Box>

					{!specificStudentWBData?.ModeratelyHopeful?.Agency &&
					!specificStudentWBData?.ModeratelyHopeful?.Pathway ? (
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
								sx={{
									pb: '10px',
									color: 'globalElementColors.grey1',
								}}
							>
								{localizationConstants.noData}
							</Typography>
						</Box>
					) : (
						<Box
							sx={{
								height: '173px',
								width: '100%',
							}}
						>
							<Bar
								data={CategorizationData([
									specificStudentWBData?.ModeratelyHopeful
										?.Pathway ?? 0,
									specificStudentWBData?.ModeratelyHopeful
										?.Agency ?? 0,
								])}
								options={generateChartOptions(
									undefined,
									CategorizationData([
										specificStudentWBData?.ModeratelyHopeful
											?.Pathway ?? 0,
										specificStudentWBData?.ModeratelyHopeful
											?.Agency ?? 0,
									]),
								)}
							/>
						</Box>
					)}
				</Box>

				<Box
					sx={{
						...teacherStyles?.boxGraphSx,
						p: '10px',
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
							{localizationConstants.highlyHopeful}
						</Typography>
					</Box>
					{!specificStudentWBData?.HighlyHopeful?.Agency &&
					!specificStudentWBData?.HighlyHopeful?.Pathway ? (
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
								sx={{
									pb: '10px',
									color: 'globalElementColors.grey1',
								}}
							>
								{localizationConstants.noData}
							</Typography>
						</Box>
					) : (
						<Box
							sx={{
								height: '173px',
								width: '100%',
							}}
						>
							<Bar
								data={CategorizationData([
									specificStudentWBData?.HighlyHopeful
										?.Pathway ?? 0,
									specificStudentWBData?.HighlyHopeful
										?.Agency ?? 0,
								])}
								options={generateChartOptions(
									undefined,
									CategorizationData([
										specificStudentWBData?.HighlyHopeful
											?.Pathway ?? 0,
										specificStudentWBData?.HighlyHopeful
											?.Agency ?? 0,
									]),
								)}
							/>
						</Box>
					)}
				</Box>
			</Box>

			{/* PWB */}
			<Box
				sx={{
					mt: '30px',
				}}
			>
				<Typography
					sx={{ fontWeight: 600 }}
					variant={typographyConstants.h4}
				>
					{localizationConstants.categorization} (PWB)
				</Typography>
			</Box>
			<Box
				sx={{
					pt: '20px',
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'space-between',
					width: `calc(100vw - ${drawerWidth + 56}px)`,
					minWidth: '1000px',
				}}
			>
				<Box
					sx={{
						...teacherStyles?.boxGraphSx,
						p: '10px',
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
							{localizationConstants.urgent}
						</Typography>
					</Box>
					{!specificStudentWBData?.urgent?.['Autonomy'] &&
					!specificStudentWBData?.urgent?.['Environment'] &&
					!specificStudentWBData?.urgent?.['Personal growth'] &&
					!specificStudentWBData?.urgent?.[
						'Positive Relations with Others'
					] &&
					!specificStudentWBData?.urgent?.['Purpose in life'] &&
					!specificStudentWBData?.urgent?.['Self-acceptance'] ? (
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
								sx={{
									pb: '10px',
									color: 'globalElementColors.grey1',
								}}
							>
								{localizationConstants.noData}
							</Typography>
						</Box>
					) : (
						<Box
							sx={{
								height: '173px',
								minWidth: '665px',
							}}
						>
							<Bar
								data={CategorizationDataPWB([
									specificStudentWBData?.urgent?.[
										'Autonomy'
									] ?? 0,
									specificStudentWBData?.urgent?.[
										'Environment'
									] ?? 0,
									specificStudentWBData?.urgent?.[
										'Personal growth'
									] ?? 0,
									specificStudentWBData?.urgent?.[
										'Positive Relations with Others'
									] ?? 0,
									specificStudentWBData?.urgent?.[
										'Purpose in life'
									] ?? 0,
									specificStudentWBData?.urgent?.[
										'Self-acceptance'
									] ?? 0,
								])}
								options={generateChartOptions(
									undefined,
									CategorizationDataPWB([
										specificStudentWBData?.urgent?.[
											'Autonomy'
										] ?? 0,
										specificStudentWBData?.urgent?.[
											'Environment'
										] ?? 0,
										specificStudentWBData?.urgent?.[
											'Personal growth'
										] ?? 0,
										specificStudentWBData?.urgent?.[
											'Positive Relations with Others'
										] ?? 0,
										specificStudentWBData?.urgent?.[
											'Purpose in life'
										] ?? 0,
										specificStudentWBData?.urgent?.[
											'Self-acceptance'
										] ?? 0,
									]),
								)}
							/>
						</Box>
					)}
				</Box>

				<Box
					sx={{
						...teacherStyles?.boxGraphSx,
						p: '10px',
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
							{localizationConstants.moderate}
						</Typography>
					</Box>
					{!specificStudentWBData?.moderate?.['Autonomy'] &&
					!specificStudentWBData?.moderate?.['Environment'] &&
					!specificStudentWBData?.moderate?.['Personal growth'] &&
					!specificStudentWBData?.moderate?.[
						'Positive Relations with Others'
					] &&
					!specificStudentWBData?.moderate?.['Purpose in life'] &&
					!specificStudentWBData?.moderate?.['Self-acceptance'] ? (
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
								sx={{
									pb: '10px',
									color: 'globalElementColors.grey1',
								}}
							>
								{localizationConstants.noData}
							</Typography>
						</Box>
					) : (
						<Box
							sx={{
								minWidth: '665px',
								height: '173px',
							}}
						>
							<Bar
								data={CategorizationDataPWB([
									specificStudentWBData?.moderate?.[
										'Autonomy'
									] ?? 0,
									specificStudentWBData?.moderate?.[
										'Environment'
									] ?? 0,
									specificStudentWBData?.moderate?.[
										'Personal growth'
									] ?? 0,
									specificStudentWBData?.moderate?.[
										'Positive Relations with Others'
									] ?? 0,
									specificStudentWBData?.moderate?.[
										'Purpose in life'
									] ?? 0,
									specificStudentWBData?.moderate?.[
										'Self-acceptance'
									] ?? 0,
								])}
								options={generateChartOptions(
									undefined,
									CategorizationDataPWB([
										specificStudentWBData?.moderate?.[
											'Autonomy'
										] ?? 0,
										specificStudentWBData?.moderate?.[
											'Environment'
										] ?? 0,
										specificStudentWBData?.moderate?.[
											'Personal growth'
										] ?? 0,
										specificStudentWBData?.moderate?.[
											'Positive Relations with Others'
										] ?? 0,
										specificStudentWBData?.moderate?.[
											'Purpose in life'
										] ?? 0,
										specificStudentWBData?.moderate?.[
											'Self-acceptance'
										] ?? 0,
									]),
								)}
							/>
						</Box>
					)}
				</Box>
			</Box>
			<Box
				sx={{
					pt: '20px',
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'space-between',
					width: '100%',
				}}
			>
				<Box
					sx={{
						...teacherStyles?.boxGraphSx,
						p: '10px',
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
							{localizationConstants.high}
						</Typography>
					</Box>

					{!specificStudentWBData?.high?.['Autonomy'] &&
					!specificStudentWBData?.high?.['Environment'] &&
					!specificStudentWBData?.high?.['Personal growth'] &&
					!specificStudentWBData?.high?.[
						'Positive Relations with Others'
					] &&
					!specificStudentWBData?.high?.['Purpose in life'] &&
					!specificStudentWBData?.high?.['Self-acceptance'] ? (
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
								sx={{
									pb: '10px',
									color: 'globalElementColors.grey1',
								}}
							>
								{localizationConstants.noData}
							</Typography>
						</Box>
					) : (
						<Box
							sx={{
								height: '173px',
								minWidth: '665px',
							}}
						>
							<Bar
								data={CategorizationDataPWB([
									specificStudentWBData?.high?.['Autonomy'] ??
										0,
									specificStudentWBData?.high?.[
										'Environment'
									] ?? 0,
									specificStudentWBData?.high?.[
										'Personal growth'
									] ?? 0,
									specificStudentWBData?.high?.[
										'Positive Relations with Others'
									] ?? 0,
									specificStudentWBData?.high?.[
										'Purpose in life'
									] ?? 0,
									specificStudentWBData?.high?.[
										'Self-acceptance'
									] ?? 0,
								])}
								options={generateChartOptions(
									undefined,
									CategorizationDataPWB([
										specificStudentWBData?.high?.[
											'Autonomy'
										] ?? 0,
										specificStudentWBData?.high?.[
											'Environment'
										] ?? 0,
										specificStudentWBData?.high?.[
											'Personal growth'
										] ?? 0,
										specificStudentWBData?.high?.[
											'Positive Relations with Others'
										] ?? 0,
										specificStudentWBData?.high?.[
											'Purpose in life'
										] ?? 0,
										specificStudentWBData?.high?.[
											'Self-acceptance'
										] ?? 0,
									]),
								)}
							/>
						</Box>
					)}
				</Box>
			</Box>
		</Box>
	)
}

export default StudentWBReport
