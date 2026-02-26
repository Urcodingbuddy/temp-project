import {
	Box,
	Divider,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material'
import React, { useMemo } from 'react'
import useCommonStyles from '../../../components/styles'
import { BaselineAnalyticsStyles } from '../baseline/baselineAnalyticsStyles'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { counsellorStyles } from '../../counsellors/counsellorsStyles'
import {
	Grade_4_AData,
	Grade_9_AData,
	TableColumnsAnalytics,
	analyticsBarChartData,
	analyticsbarData,
	checklistOptions,
} from './sendCheckListConstants'
import { teacherStyles } from '../../assessment/teacherIRI/teacherIRIStyles'
import { Bar } from 'react-chartjs-2'
import { ChartOptions } from './sendChecklistFunction'
import { useSelector } from 'react-redux'

const SpecificSchoolAnalytics = () => {
	const flexStyles = useCommonStyles()
	const { singleSchoolSChecklistAnalyticsData } = useSelector(
		(store) => store.sendChecklist,
	)
	const rowCells = (column, row, index) => {
		// eslint-disable-next-line default-case
		switch (column.id) {
			case localizationConstants.domain:
				return (
					<Typography variant={typographyConstants.body}>
						{row?.domain}
					</Typography>
				)
			case localizationConstants.percentage:
				return (
					<Typography
						variant={typographyConstants.body}
					>{`${row?.per === 0 ? 0 : row?.per + '%'}`}</Typography>
				)
			case localizationConstants.red:
				return (
					<Typography variant={typographyConstants.body}>
						{row?.red}
					</Typography>
				)
			case localizationConstants.green:
				return (
					<Typography variant={typographyConstants.body}>
						{row?.green}
					</Typography>
				)
			case localizationConstants.orange:
				return (
					<Typography variant={typographyConstants.body}>
						{row?.orange}
					</Typography>
				)
		}
	}

	const Grade_4_Data = useMemo(
		() =>
			Grade_4_AData(
				singleSchoolSChecklistAnalyticsData?.upper_KG_Grade4?.[0]
					?.data || {},
			),
		[singleSchoolSChecklistAnalyticsData],
	)
	const Grade_9_Data = useMemo(
		() =>
			Grade_9_AData(
				singleSchoolSChecklistAnalyticsData?.grade5ToGrade9?.[0]
					?.data || {},
			),
		[singleSchoolSChecklistAnalyticsData],
	)
	return (
		<Box className={flexStyles.flexColumn} gap={'24px'}>
			<Box
				sx={{
					...BaselineAnalyticsStyles.tableBoxSx,
					minHeight: '110px',
					mt: '0px',
					p: '16px 20px',
				}}
			>
				<Typography
					variant={typographyConstants.title}
					sx={{
						color: 'textColors.black',
						fontSize: '18px',
						fontWeight: 500,
					}}
				>{`${localizationConstants.school} :  ${singleSchoolSChecklistAnalyticsData?.schoolName || ''}`}</Typography>
				<Box
					sx={{
						minHeight: '44px',
						p: '8px 10px',
						backgroundColor: 'globalElementColors.greenLight',
						borderRadius: '4px',
						mt: '6px',
					}}
				>
					<Typography
						variant={typographyConstants.body}
						sx={{
							color: 'textColors.black',
							fontSize: '16px',
							fontWeight: 500,
						}}
					>{`${localizationConstants.totalStrength} :  ${singleSchoolSChecklistAnalyticsData?.totalStrength || '0'}`}</Typography>
				</Box>
			</Box>
			<Box
				sx={{
					...BaselineAnalyticsStyles.tableBoxSx,
					minHeight: '280px',
					mt: '0px',
					p: '20px 16px',
				}}
			>
				<Box>
					<Typography
						variant={typographyConstants.h5}
						sx={{ marginLeft: '3px', fontWeight: '600' }}
					>
						{`${checklistOptions?.[0]} (Overview)`}
					</Typography>
				</Box>
				<TableContainer
					sx={{
						...counsellorStyles.tableContainerSx,
						borderRadius: '10px',
						mt: '14px',
						border: '1px solid',
						borderColor: 'globalElementColors.grey5',
					}}
				>
					<Table
						aria-labelledby='tableTitle'
						size={'small'}
						stickyHeader
					>
						<TableHead>
							<TableRow>
								{TableColumnsAnalytics?.map((data, ii) => {
									return (
										<TableCell
											sx={{
												borderBottom: '1px solid',
												borderRight:
													TableColumnsAnalytics?.length -
														1 ===
													ii
														? 'none'
														: '1px solid',
												borderColor:
													'globalElementColors.grey5',
												backgroundColor: data?.bgColor
													? data?.bgColor
													: 'globalElementColors.lightBlue2',
												fontWeight: 500,
												p: '12px 16px',
											}}
											align={data?.align}
										>
											<Typography
												variant={
													typographyConstants.body
												}
												sx={{
													fontWeight: 500,
													color: data?.bgColor
														? 'globalElementColors.white'
														: '#08091D',
													fontSize: '16px',
												}}
											>
												{data.label}
											</Typography>
										</TableCell>
									)
								})}
							</TableRow>
						</TableHead>
						<TableBody>
							{Grade_4_Data?.length > 0 &&
								Grade_4_Data?.map((row, index) => {
									return (
										<TableRow tabIndex={-1} key={index}>
											{TableColumnsAnalytics.map(
												(column, i) => {
													return (
														<TableCell
															key={column.id}
															align={column.align}
															sx={{
																height: '41px',
																padding:
																	'12px 16px',
																minWidth:
																	column.width,
																maxWidth:
																	column.width,
																position:
																	column.position,
																left: column.left,
																zIndex: 1,
																backgroundColor:
																	column.position ===
																		'sticky' &&
																	'white',
																borderBottom:
																	Grade_4_Data?.length -
																		1 ===
																	index
																		? 'none'
																		: '1px solid',
																borderRight:
																	TableColumnsAnalytics?.length -
																		1 ===
																	i
																		? 'none'
																		: '1px solid',
																borderColor:
																	'globalElementColors.grey5',
															}}
														>
															{rowCells(
																column,
																row,
																index,
															)}
														</TableCell>
													)
												},
											)}
										</TableRow>
									)
								})}
						</TableBody>
					</Table>
				</TableContainer>
			</Box>
			<Box
				sx={{
					...BaselineAnalyticsStyles.tableBoxSx,
					minHeight: '280px',
					mt: '0px',
					p: '20px 16px',
				}}
			>
				<Box>
					<Typography
						variant={typographyConstants.h5}
						sx={{ marginLeft: '3px', fontWeight: '600' }}
					>
						{`${checklistOptions?.[1]} (Overview)`}
					</Typography>
				</Box>
				<TableContainer
					sx={{
						...counsellorStyles.tableContainerSx,
						borderRadius: '10px',
						mt: '14px',
						border: '1px solid',
						borderColor: 'globalElementColors.grey5',
					}}
				>
					<Table
						aria-labelledby='tableTitle'
						size={'small'}
						stickyHeader
					>
						<TableHead>
							<TableRow>
								{TableColumnsAnalytics?.map((data, ii) => {
									return (
										<TableCell
											sx={{
												borderBottom: '1px solid',
												borderRight:
													TableColumnsAnalytics?.length -
														1 ===
													ii
														? 'none'
														: '1px solid',
												borderColor:
													'globalElementColors.grey5',
												backgroundColor: data?.bgColor
													? data?.bgColor
													: 'globalElementColors.lightBlue2',
												fontWeight: 500,
												p: '12px 16px',
											}}
											align={data?.align}
										>
											<Typography
												variant={
													typographyConstants.body
												}
												sx={{
													fontWeight: 500,
													color: data?.bgColor
														? 'globalElementColors.white'
														: '#08091D',
													fontSize: '16px',
												}}
											>
												{data.label}
											</Typography>
										</TableCell>
									)
								})}
							</TableRow>
						</TableHead>
						<TableBody>
							{Grade_9_Data?.length > 0 &&
								Grade_9_Data?.map((row, index) => {
									return (
										<TableRow tabIndex={-1} key={index}>
											{TableColumnsAnalytics.map(
												(column, i) => {
													return (
														<TableCell
															key={column.id}
															align={column.align}
															sx={{
																height: '41px',
																padding:
																	'12px 16px',
																minWidth:
																	column.width,
																maxWidth:
																	column.width,
																position:
																	column.position,
																left: column.left,
																zIndex: 1,
																backgroundColor:
																	column.position ===
																		'sticky' &&
																	'white',
																borderBottom:
																	Grade_9_Data?.length -
																		1 ===
																	index
																		? 'none'
																		: '1px solid',
																borderRight:
																	TableColumnsAnalytics?.length -
																		1 ===
																	i
																		? 'none'
																		: '1px solid',
																borderColor:
																	'globalElementColors.grey5',
															}}
														>
															{rowCells(
																column,
																row,
																index,
															)}
														</TableCell>
													)
												},
											)}
										</TableRow>
									)
								})}
						</TableBody>
					</Table>
				</TableContainer>
			</Box>

			<Box
				sx={{
					...BaselineAnalyticsStyles.tableBoxSx,
					minHeight: '563px',
					mt: '0px',
					p: '20px 16px',
				}}
			>
				<Box sx={{ pb: '10px' }}>
					<Typography
						variant={typographyConstants.h5}
						sx={{ fontWeight: 600, fontSize: '18px' }}
					>
						{`${checklistOptions?.[0]}`}
					</Typography>
				</Box>
				<Divider sx={{ height: '3px' }} />
				<Box
					sx={{
						mt: '15px',
						display: 'flex',
						justifyContent: 'space-between',
					}}
				>
					<Box
						sx={{
							display: 'flex',
							flexWrap: 'wrap',
							width: '100%',
						}}
						gap={'24px'}
					>
						{analyticsbarData(Grade_4_Data)?.map((data) => {
							return (
								<Box
									sx={{
										...teacherStyles?.boxGraphSx,
										p: '10px',
										maxWidth: '49%',
										flex: '1 1 calc(50% - 50px)',
										overflow: 'auto',
										height: '240px',
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
											{data?.title}
										</Typography>
									</Box>
									{data?.data?.every((d) => d === 0) ? (
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
												minWidth: '480px',
												mt: '5px',
											}}
										>
											<Bar
												data={analyticsBarChartData(
													data?.data,
													true,
													data?.color,
												)}
												options={ChartOptions(
													analyticsBarChartData(
														data?.data,
														true,
														data?.color,
													),
													true,
												)}
											/>
										</Box>
									)}
								</Box>
							)
						})}
					</Box>
				</Box>
			</Box>
			<Box
				sx={{
					...BaselineAnalyticsStyles.tableBoxSx,
					minHeight: '563px',
					mt: '0px',
					p: '20px 16px',
				}}
			>
				<Box sx={{ pb: '10px' }}>
					<Typography
						variant={typographyConstants.h5}
						sx={{ fontWeight: 600, fontSize: '18px' }}
					>
						{`${checklistOptions?.[1]}`}
					</Typography>
				</Box>
				<Divider sx={{ height: '3px' }} />
				<Box
					sx={{
						mt: '15px',
						display: 'flex',
						width: '100%',
					}}
				>
					<Box
						sx={{
							display: 'flex',
							flexWrap: 'wrap',
							width: '100%',
						}}
						gap={'24px'}
					>
						{analyticsbarData(Grade_9_Data)?.map((data) => {
							return (
								<Box
									sx={{
										...teacherStyles?.boxGraphSx,
										flex: '1 1 calc(50% - 50px)',
										p: '10px',
										maxWidth: '49%',
										overflow: 'auto',
										height: '240px',
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
											{data?.title}
										</Typography>
									</Box>
									{data?.data?.every((d) => d === 0) ? (
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
												minWidth: '600px',
												mt: '5px',
											}}
										>
											<Bar
												data={analyticsBarChartData(
													data?.data,
													false,
													data?.color,
												)}
												options={ChartOptions(
													analyticsBarChartData(
														data?.data,
														false,
														data?.color,
													),
													true,
												)}
											/>
										</Box>
									)}
								</Box>
							)
						})}
					</Box>
				</Box>
			</Box>
		</Box>
	)
}

export default SpecificSchoolAnalytics
