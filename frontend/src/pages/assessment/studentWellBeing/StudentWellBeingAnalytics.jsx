import {
	Box,
	Dialog,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import useCommonStyles from '../../../components/styles'
import { useDispatch, useSelector } from 'react-redux'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomButton from '../../../components/CustomButton'
import { getSchoolsList } from '../../../redux/commonSlice'
import { BaselineAnalyticsStyles } from '../../initiations/baseline/baselineAnalyticsStyles'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { Bar } from 'react-chartjs-2'
import { ChartOptions } from './studentWellBeingFunctions'
import {
	StudentAnalyticsAllSchools,
	generateCHSData,
	generatePWBData,
	generateScoreData,
	generateWellBeingData,
} from './studentWellBeingConstants'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { hexaCodes } from '../../../utils/hexaColorCodes'
import {
	getStudentWBAnalyticsForSchools,
	getStudentWBAnalyticsForClassrooms,
} from './StudentWellBeingSlice'
import {
	generatePDF,
	getAcademicYearsList,
	getCurrentAcademicYearId,
} from '../../../utils/utils'
import CustomMultiSelectNoChip from '../../../components/commonComponents/CustomMultiSelectNoChip'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'

const StudentWellBeingAnalyticsSchools = () => {
	const flexStyles = useCommonStyles()
	const dispatch = useDispatch()

	const [selectedSchool, setSelectedSchool] = useState('')
	const { studentWBAnalyticsData } = useSelector(
		(store) => store.studentWellBeing,
	)
	const { schoolsList } = useSelector((store) => store.commonData)
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const [selectedAY, setSelectedAY] = useState([])
	const [isSingleSch, setIsSingleSch] = useState(false)
	const [options, setOptions] = useState([])
	const [downloadReportDialogOpen, setDownloadReportDialogOpen] =
		useState(false)
	const captureUIRef = useRef(null)

	const captureUIAndDownloadPDF = async () => {
		await generatePDF(captureUIRef.current, {
			filename: 'Students Well Being Analytics Report.pdf',
			orientation: 'l',
			pageSize: 'a4',
			margin: 1,
		})
		setDownloadReportDialogOpen(false)
	}

	const studentAnalyticsAllSData = useMemo(
		() =>
			StudentAnalyticsAllSchools(
				studentWBAnalyticsData?.studentAnalysis?.map(
					(data) => data?.school ?? '',
				) ?? [],
				studentWBAnalyticsData?.studentAnalysis?.map(
					(data) => data?.studentCountInSchool ?? 0,
				) ?? [],
				studentWBAnalyticsData?.studentAnalysis?.map(
					(data) => data?.numberOfStudentsSubmitted ?? 0,
				) ?? [],
			),
		[studentWBAnalyticsData],
	)

	const PWBData = useMemo(() => {
		if (!isSingleSch) {
			return generatePWBData(
				studentWBAnalyticsData?.studentsPWBData?.map(
					(data) => data?.schoolName ?? '',
				) ?? [],
				studentWBAnalyticsData?.studentsPWBData?.map(
					(data) => data?.autonomy ?? 0,
				) ?? [],
				studentWBAnalyticsData?.studentsPWBData?.map(
					(data) => data?.environment ?? 0,
				) ?? [],
				studentWBAnalyticsData?.studentsPWBData?.map(
					(data) => data?.personalGrowth ?? 0,
				) ?? [],
				studentWBAnalyticsData?.studentsPWBData?.map(
					(data) => data?.positiveRelation ?? 0,
				) ?? [],
				studentWBAnalyticsData?.studentsPWBData?.map(
					(data) => data?.purposeInLife ?? 0,
				) ?? [],
				studentWBAnalyticsData?.studentsPWBData?.map(
					(data) => data?.selfAcceptance ?? 0,
				) ?? [],
			)
		} else {
			return generatePWBData(
				studentWBAnalyticsData?.studentsPWBDataForClasses?.map(
					(data) => data?.className ?? '',
				) ?? [],
				studentWBAnalyticsData?.studentsPWBDataForClasses?.map(
					(data) => data?.autonomy ?? 0,
				) ?? [],
				studentWBAnalyticsData?.studentsPWBDataForClasses?.map(
					(data) => data?.environment ?? 0,
				) ?? [],
				studentWBAnalyticsData?.studentsPWBDataForClasses?.map(
					(data) => data?.personalGrowth ?? 0,
				) ?? [],
				studentWBAnalyticsData?.studentsPWBDataForClasses?.map(
					(data) => data?.positiveRelation ?? 0,
				) ?? [],
				studentWBAnalyticsData?.studentsPWBDataForClasses?.map(
					(data) => data?.purposeInLife ?? 0,
				) ?? [],
				studentWBAnalyticsData?.studentsPWBDataForClasses?.map(
					(data) => data?.selfAcceptance ?? 0,
				) ?? [],
			)
		}
	}, [studentWBAnalyticsData, isSingleSch])

	const CHSData = useMemo(() => {
		if (!isSingleSch) {
			return generateCHSData(
				studentWBAnalyticsData?.studentHopeScaleData?.map(
					(data) => data?.schoolName ?? '',
				) ?? [],
				studentWBAnalyticsData?.studentHopeScaleData?.map(
					(data) => data?.averagePathwayScore ?? 0,
				) ?? [],
				studentWBAnalyticsData?.studentHopeScaleData?.map(
					(data) => data?.averageWellBeingAgency ?? 0,
				) ?? [],
			)
		} else {
			return generateCHSData(
				studentWBAnalyticsData?.studentHopeScaleDataForClasses?.map(
					(data) => data?.className ?? '',
				) ?? [],
				studentWBAnalyticsData?.studentHopeScaleDataForClasses?.map(
					(data) => data?.averagePathwayScore ?? 0,
				) ?? [],
				studentWBAnalyticsData?.studentHopeScaleDataForClasses?.map(
					(data) => data?.averageWellBeingAgency ?? 0,
				) ?? [],
			)
		}
	}, [studentWBAnalyticsData, isSingleSch])

	const scoreData = useMemo(
		() =>
			generateScoreData(
				studentWBAnalyticsData?.scoreForAllClasses?.map(
					(data) => data?.className ?? '',
				) ?? [],
				studentWBAnalyticsData?.scoreForAllClasses?.map(
					(data) => data?.averageHopeScore ?? 0,
				) ?? [],
				studentWBAnalyticsData?.scoreForAllClasses?.map(
					(data) => data?.averageWellBeingScore ?? 0,
				) ?? [],
			),
		[studentWBAnalyticsData],
	)

	const wellBeingData = useMemo(
		() =>
			generateWellBeingData(
				studentWBAnalyticsData?.studentWellBeing?.map(
					(data) => data?.schoolName ?? '',
				) ?? [],
				studentWBAnalyticsData?.studentWellBeing?.map(
					(data) => data?.averageHopeScore ?? 0,
				) ?? [],
				studentWBAnalyticsData?.studentWellBeing?.map(
					(data) => data?.averageWellBeingScore ?? 0,
				) ?? [],
			),
		[studentWBAnalyticsData],
	)

	const handleAYApply = (list) => {
		dispatch(
			getStudentWBAnalyticsForSchools({
				academicYears: selectedAY,
			}),
		)
		if (list) {
			dispatch(
				getSchoolsList({
					academicYear: selectedAY,
				}),
			)
		}
	}

	useEffect(() => {
		if (schoolsList?.length > 0) {
			const option = schoolsList?.map((sc) => ({
				id: sc?._id,
				label: sc?.school,
			}))
			setOptions([{ id: 'all', label: 'All' }, ...option])
		}
	}, [schoolsList])

	useEffect(() => {
		setIsSingleSch(
			Array.isArray(selectedSchool)
				? selectedSchool?.[0]?.length > 0
				: selectedSchool?.length > 0,
		)

		if (selectedSchool?.length > 0) {
			dispatch(
				getStudentWBAnalyticsForClassrooms({
					body: { academicYears: selectedAY, school: selectedSchool },
				}),
			)
		}
	}, [selectedSchool])

	const isInitialLoad = useRef(true)
	useEffect(() => {
		if (academicYears?.length > 0 && isInitialLoad.current) {
			const currentAYId = getCurrentAcademicYearId(academicYears)
			if (currentAYId) {
				setSelectedAY([currentAYId])
				dispatch(
					getStudentWBAnalyticsForSchools({
						academicYears: [currentAYId],
					}),
				)
			}
			isInitialLoad.current = false
		}
	}, [academicYears])

	useEffect(() => {
		if (selectedAY?.length === 0 && academicYears?.length > 0) {
			const currentAYId = getCurrentAcademicYearId(academicYears)
			if (currentAYId) {
				setSelectedAY([currentAYId])
			}
		}
	}, [selectedAY, academicYears])

	return (
		<Box>
			<Box>
				<Box
					className={flexStyles.flexRowCenterSpaceBetween}
					sx={{ width: '100%' }}
					gap={'30px'}
				>
					<Box sx={{ flex: '0 0 25%' }}>
						<CustomMultiSelectNoChip
							sx={{ width: '100%' }}
							fieldSx={{ minHeight: '44px' }}
							value={selectedAY}
							onChange={(e) => {
								setSelectedAY(e)
								setSelectedSchool('')
							}}
							options={getAcademicYearsList(academicYears) || []}
							label={localizationConstants.academicYear}
							onApply={handleAYApply}
						/>
					</Box>
					<Box sx={{ flexGrow: 1 }}>
						<Typography variant={typographyConstants.body}>
							{localizationConstants.school}
						</Typography>
						<CustomAutocompleteNew
							options={options ?? []}
							sx={{ flexGrow: 1, width: '100%' }}
							fieldSx={{ height: '44px' }}
							placeholder={`${localizationConstants.select} ${localizationConstants.school}`}
							value={
								selectedSchool !== null ? selectedSchool : ''
							}
							onChange={(e) => {
								console.log(e)
								const selectedValue = e || ''

								if (
									selectedValue === 'all' ||
									selectedValue === '' ||
									selectedValue === null
								) {
									if (
										selectedSchool &&
										selectedSchool?.length > 0
									) {
										setSelectedSchool('')
										handleAYApply()
									}
								} else {
									setSelectedSchool(selectedValue)
								}
							}}
							labelName={`${localizationConstants.school} ${localizationConstants.required}`}
						/>
					</Box>

					<CustomButton
						sx={{
							minWidth: '172px',
							height: '44px',
							marginTop: '19px',
							backgroundColor: 'globalElementColors.blue',
						}}
						text={localizationConstants.generateReport}
						onClick={() => {
							setDownloadReportDialogOpen(true)
						}}
					/>
				</Box>
				<Box ref={captureUIRef}>
					{/* ------------ table ---------------- */}
					{isSingleSch ? (
						<Box
							sx={{
								height: '155px',
								display: 'flex',
								flexDirection: 'column',
								p: '20px 16px',
								border: '1px solid',
								borderColor: 'globalElementColors.grey4',
								borderRadius: '10px',
								marginTop: '1.5rem',
							}}
						>
							<Box>
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
										width: '100%',
									}}
								>
									<TableContainer
										sx={{
											border: '1px solid',
											borderColor:
												'globalElementColors.grey5',
											borderBottom: 'none',
											borderTopLeftRadius: '10px',
											borderBottomLeftRadius: '10px',
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
																'1px solid',
															borderRight:
																'1px solid',
															borderColor:
																'globalElementColors.grey5',
															backgroundColor:
																'globalElementColors.lightBlue2',
															fontWeight: 500,
															width: '45%',
														}}
														align='left'
													>
														<Typography
															variant={
																typographyConstants.body
															}
															sx={{
																fontWeight: 500,
																color: '#08091D',
																fontSize:
																	'16px',
															}}
														>
															{
																localizationConstants.school
															}
														</Typography>
													</TableCell>

													<TableCell
														sx={{
															borderBottom:
																'1px solid',
															borderColor:
																'globalElementColors.grey5',
															backgroundColor:
																'globalElementColors.lightBlue2',
															fontWeight: 500,
														}}
														align='center'
													>
														<Typography
															variant={
																typographyConstants.body
															}
															sx={{
																fontWeight: 500,
																color: '#08091D',
																fontSize:
																	'16px',
															}}
														>
															{
																localizationConstants.psychologicalWBScale
															}
														</Typography>
													</TableCell>
													<TableCell
														sx={{
															borderBottom:
																'1px solid',
															borderColor:
																'globalElementColors.grey5',
															backgroundColor:
																'globalElementColors.lightBlue2',
															fontWeight: 500,
														}}
													>
														<Typography
															variant={
																typographyConstants.body
															}
															sx={{
																fontWeight: 500,
																color: '#08091D',
																fontSize:
																	'16px',
															}}
														>
															{
																localizationConstants.childrenHopeScale
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

															borderRight:
																'1px solid',
															borderColor:
																'globalElementColors.grey5',
														}}
														align='left'
													>
														<Typography
															variant={
																typographyConstants.h5
															}
															sx={{
																fontWeight: 400,
																color: 'globalElementColors.grey',
																fontSize:
																	'16px',
															}}
														>
															{studentWBAnalyticsData
																?.schoolData
																?.schoolName ??
																'No Data'}
														</Typography>
													</TableCell>
													<TableCell
														sx={{
															fontWeight: 300,
															lineHeight: 1.43,

															borderRight:
																'1px solid',
															borderColor:
																'globalElementColors.grey5',
														}}
														align='center'
													>
														<Typography
															variant={
																typographyConstants.h5
															}
															sx={{
																fontWeight: 400,
																color: 'globalElementColors.grey',
																fontSize:
																	'16px',
															}}
														>
															{studentWBAnalyticsData
																?.schoolData
																?.wellBeingRank ??
																'0'}
														</Typography>
													</TableCell>
													<TableCell
														sx={{
															fontWeight: 300,
															lineHeight: 1.43,
														}}
														align='center'
													>
														<Typography
															variant={
																typographyConstants.h5
															}
															sx={{
																fontWeight: 400,
																color: 'globalElementColors.grey',
																fontSize:
																	'16px',
															}}
														>
															{studentWBAnalyticsData
																?.schoolData
																?.hopoRank ??
																'0'}
														</Typography>
													</TableCell>
												</TableRow>
											</TableBody>
										</Table>
									</TableContainer>
								</Box>
							</Box>
						</Box>
					) : null}

					{/* ---------  student analytics ------------- */}
					{!isSingleSch ? (
						<Box
							sx={{
								...BaselineAnalyticsStyles.tableBoxSx,
								minHeight: '350px',
							}}
						>
							<Box
								className={flexStyles.flexRowCenterSpaceBetween}
								sx={{ pl: '10px' }}
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
											backgroundColor:
												'globalElementColors.blue2',
										}}
									/>
									<Typography
										variant={typographyConstants.h5}
										sx={{
											pl: '7px',
											pr: '7px',
											fontSize: '16px',
										}}
									>
										{localizationConstants.totalStudents}
									</Typography>

									<Box
										sx={{
											...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
											backgroundColor:
												'globalElementColors.yellow',
										}}
									/>
									<Typography
										variant={typographyConstants.h5}
										sx={{
											pl: '7px',
											pr: '7px',
											fontSize: '16px',
										}}
									>
										{localizationConstants.totalSubmission}
									</Typography>
								</Box>
							</Box>

							<Box
								sx={{
									overflowX: 'auto',
									overflowY: 'hidden',
									mt: '10px',
									flexGrow: 1,
								}}
							>
								{studentAnalyticsAllSData?.labels?.length >
								0 ? (
									<Box
										sx={{
											width:
												studentAnalyticsAllSData?.labels
													?.length > 0
													? studentAnalyticsAllSData
															?.labels?.length ===
														1
														? `${studentAnalyticsAllSData?.labels?.length * 210}px`
														: `${studentAnalyticsAllSData?.labels?.length * 140}px`
													: '100%',
											display: 'flex',
											height: '300px',
											mb: '10px',
											flexDirection: 'row',
											gap: '20px',
											pl: '10px',
											mt: '10px',
										}}
									>
										<Bar
											data={studentAnalyticsAllSData}
											options={ChartOptions(
												false,
												true,
												studentAnalyticsAllSData,
											)}
											sx={{
												flex: '5',
											}}
										/>
									</Box>
								) : (
									<Box
										sx={{
											display: 'flex',
											justifyContent: 'center',
											alignItems: 'center',
											height: '300px',
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
								)}
							</Box>
						</Box>
					) : null}

					{/* -------- well being ------------ */}
					{!isSingleSch ? (
						<Box
							sx={{
								...BaselineAnalyticsStyles.tableBoxSx,
								minHeight: '350px',
							}}
						>
							<Box
								className={flexStyles.flexRowCenterSpaceBetween}
								sx={{ pl: '10px' }}
							>
								<Typography
									variant={typographyConstants.h5}
									sx={{
										marginLeft: '3px',
										mt: '1rem',
										fontWeight: '600',
									}}
								>
									{localizationConstants.studentWellBeing}{' '}
									(Schools)
								</Typography>
								<Box
									className={flexStyles.flexRowCenter}
									sx={{ mt: '1rem', mr: '1rem' }}
								>
									<Box
										sx={{
											...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
											backgroundColor:
												'globalElementColors.black2',
										}}
									/>
									<Typography
										variant={typographyConstants.h5}
										sx={{
											pl: '7px',
											pr: '7px',
											fontSize: '16px',
										}}
									>
										{
											localizationConstants.childrenHopeScale
										}
									</Typography>

									<Box
										sx={{
											...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
											backgroundColor:
												'globalElementColors.yellow',
										}}
									/>
									<Typography
										variant={typographyConstants.h5}
										sx={{
											pl: '7px',
											pr: '7px',
											fontSize: '16px',
										}}
									>
										{
											localizationConstants.psychologicalWBScale
										}
									</Typography>
								</Box>
							</Box>

							<Box
								sx={{
									overflowX: 'auto',
									overflowY: 'hidden',
									mt: '10px',
									flexGrow: 1,
								}}
							>
								{wellBeingData?.labels?.length > 0 ? (
									<Box
										sx={{
											width:
												wellBeingData?.labels?.length >
												0
													? wellBeingData?.labels
															?.length === 1
														? `${wellBeingData?.labels?.length * 260}px`
														: `${wellBeingData?.labels?.length * 140}px`
													: '100%',
											display: 'flex',
											height: '300px',
											mb: '10px',
											flexDirection: 'row',
											gap: '20px',
											pl: '10px',
											mt: '10px',
										}}
									>
										<Bar
											key={studentWBAnalyticsData}
											data={wellBeingData}
											options={ChartOptions(
												false,
												true,
												wellBeingData,
												studentWBAnalyticsData?.studentWellBeing?.map(
													(data) => data?.rank ?? '',
												) ?? [],
											)}
											sx={{
												flex: '5',
											}}
										/>
									</Box>
								) : (
									<Box
										sx={{
											display: 'flex',
											justifyContent: 'center',
											alignItems: 'center',
											height: '300px',
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
								)}
							</Box>
						</Box>
					) : null}

					{/* ----------  score--------- */}
					{isSingleSch ? (
						<Box
							sx={{
								...BaselineAnalyticsStyles.tableBoxSx,
								minHeight: '350px',
							}}
						>
							<Box
								className={flexStyles.flexRowCenterSpaceBetween}
								sx={{ pl: '10px' }}
							>
								<Typography
									variant={typographyConstants.h5}
									sx={{
										marginLeft: '3px',
										mt: '1rem',
										fontWeight: '600',
									}}
								>
									{`${localizationConstants.score} (${localizationConstants.allClasses})`}
								</Typography>
								<Box
									className={flexStyles.flexRowCenter}
									sx={{ mt: '1rem', mr: '1rem' }}
								>
									<Box
										sx={{
											...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
											backgroundColor:
												'globalElementColors.black2',
										}}
									/>
									<Typography
										variant={typographyConstants.h5}
										sx={{
											pl: '7px',
											pr: '7px',
											fontSize: '16px',
										}}
									>
										{
											localizationConstants.childrenHopeScale
										}
									</Typography>

									<Box
										sx={{
											...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
											backgroundColor:
												'globalElementColors.yellow',
										}}
									/>
									<Typography
										variant={typographyConstants.h5}
										sx={{
											pl: '7px',
											pr: '7px',
											fontSize: '16px',
										}}
									>
										{
											localizationConstants.psychologicalWBScale
										}
									</Typography>
								</Box>
							</Box>

							{scoreData?.labels?.length > 0 ? (
								<Box
									sx={{
										overflowX: 'auto',
										overflowY: 'hidden',
										mt: '10px',
										flexGrow: 1,
									}}
								>
									<Box
										sx={{
											width:
												scoreData?.labels?.length > 0
													? `${scoreData?.labels?.length * 140}px`
													: '100%',
											display: 'flex',
											height: '300px',
											mb: '10px',
											flexDirection: 'row',
											gap: '20px',
											pl: '10px',
											mt: '10px',
										}}
									>
										<Bar
											key={studentWBAnalyticsData}
											data={scoreData}
											options={ChartOptions(
												false,
												true,
												scoreData,
												studentWBAnalyticsData?.scoreForAllClasses?.map(
													(data) => data?.rank ?? '',
												) ?? [],
											)}
											sx={{
												flex: '5',
											}}
										/>
									</Box>
								</Box>
							) : (
								<Box
									sx={{
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										height: '300px',
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
							)}
						</Box>
					) : null}

					{/* -----------  CHS --------------- */}
					<Box
						sx={{
							...BaselineAnalyticsStyles.tableBoxSx,
							minHeight: '350px',
						}}
					>
						<Box
							className={flexStyles.flexRowCenterSpaceBetween}
							sx={{ pl: '10px' }}
						>
							<Typography
								variant={typographyConstants.h5}
								sx={{
									marginLeft: '3px',
									mt: '1rem',
									fontWeight: '600',
								}}
							>
								{isSingleSch
									? `${localizationConstants.childrenHopeScale} (${localizationConstants.classes})`
									: `${localizationConstants.childrenHopeScale} (${localizationConstants.schools})`}
							</Typography>
							<Box
								className={flexStyles.flexRowCenter}
								sx={{ mt: '1rem', mr: '1rem' }}
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
									sx={{
										pl: '7px',
										pr: '7px',
										fontSize: '16px',
									}}
								>
									{localizationConstants.pathway}
								</Typography>

								<Box
									sx={{
										...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
										backgroundColor:
											'globalElementColors.yellow',
									}}
								/>
								<Typography
									variant={typographyConstants.h5}
									sx={{
										pl: '7px',
										pr: '7px',
										fontSize: '16px',
									}}
								>
									{localizationConstants.agency}
								</Typography>
							</Box>
						</Box>

						{CHSData?.labels?.length > 0 ? (
							<Box
								sx={{
									overflowX: 'auto',
									overflowY: 'hidden',
									mt: '10px',
									flexGrow: 1,
								}}
							>
								<Box
									sx={{
										width:
											CHSData?.labels?.length > 0
												? CHSData?.labels?.length === 1
													? `${CHSData?.labels?.length * 250}px`
													: `${CHSData?.labels?.length * 140}px`
												: '100%',
										display: 'flex',
										height: '300px',
										mb: '10px',
										flexDirection: 'row',
										gap: '20px',
										pl: '10px',
										mt: '10px',
									}}
								>
									<Bar
										key={studentWBAnalyticsData}
										data={CHSData}
										options={ChartOptions(
											false,
											true,
											CHSData,
											isSingleSch
												? (studentWBAnalyticsData?.studentHopeScaleDataForClasses?.map(
														(data) =>
															data?.rank ?? '',
													) ?? [])
												: (studentWBAnalyticsData?.studentHopeScaleData?.map(
														(data) =>
															data?.rank ?? '',
													) ?? []),
										)}
										sx={{
											flex: '5',
										}}
									/>
								</Box>
							</Box>
						) : (
							<Box
								sx={{
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									height: '300px',
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
						)}
					</Box>

					{/* -----------  PWB --------------- */}
					<Box
						sx={{
							...BaselineAnalyticsStyles.tableBoxSx,
							minHeight: '350px',
						}}
					>
						<Box
							className={flexStyles.flexRowCenterSpaceBetween}
							sx={{
								pl: '10px',
								mt: '1rem',
								alignItems: 'center',
							}}
						>
							<Box>
								<Typography
									variant={typographyConstants.h5}
									sx={{
										marginLeft: '3px',
										fontWeight: '600',
									}}
								>
									{isSingleSch
										? `${localizationConstants.psychologicalWBScale} (${localizationConstants.classes})`
										: `${localizationConstants.psychologicalWBScale} (${localizationConstants.schools})`}
								</Typography>
							</Box>
						</Box>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'end',
								mt: '10px',
							}}
						>
							<Box
								sx={{
									display: 'flex',
									flexDirection: 'row',
									justifyContent: 'center',
									alignItems: 'center',
									mr: '10px',
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
									display: 'flex',
									flexDirection: 'row',
									justifyContent: 'center',
									alignItems: 'center',
									mr: '10px',
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
									display: 'flex',
									flexDirection: 'row',
									justifyContent: 'center',
									alignItems: 'center',
									mr: '10px',
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
									display: 'flex',
									flexDirection: 'row',
									justifyContent: 'center',
									alignItems: 'center',
									mr: '10px',
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
									display: 'flex',
									flexDirection: 'row',
									justifyContent: 'center',
									alignItems: 'center',
									mr: '10px',
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
									display: 'flex',
									flexDirection: 'row',
									justifyContent: 'center',
									alignItems: 'center',
									mr: '10px',
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
						{PWBData?.labels?.length > 0 ? (
							<Box
								sx={{
									overflowX: 'auto',
									overflowY: 'hidden',
									mt: '10px',
									flexGrow: 1,
								}}
							>
								<Box
									sx={{
										width:
											PWBData?.labels?.length > 0
												? `${PWBData?.labels?.length * 260}px`
												: '100%',
										display: 'flex',
										height: '300px',
										mb: '10px',
										flexDirection: 'row',
										gap: '20px',
										pl: '10px',
										mt: '10px',
									}}
								>
									<Bar
										key={studentWBAnalyticsData}
										data={PWBData}
										options={ChartOptions(
											false,
											true,
											PWBData,
											isSingleSch
												? (studentWBAnalyticsData?.studentsPWBDataForClasses?.map(
														(data) =>
															data?.rank ?? '',
													) ?? [])
												: (studentWBAnalyticsData?.studentsPWBData?.map(
														(data) =>
															data?.rank ?? '',
													) ?? []),
										)}
										sx={{
											flex: '5',
										}}
									/>
								</Box>
							</Box>
						) : (
							<Box
								sx={{
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									height: '300px',
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
						)}
					</Box>
				</Box>
			</Box>

			{/*----------------- PDF Dialog  ------------------*/}
			<Dialog open={downloadReportDialogOpen}>
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
									setDownloadReportDialogOpen(false)
								}}
							/>
						</Box>
						<Box sx={{ marginTop: '20px', textAlign: 'start' }}>
							<Typography color={'globalElementColors.gray1'}>
								{
									localizationConstants.downloadStudentWellBeingAnalyticalPDFReportMsg
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
		</Box>
	)
}

export default StudentWellBeingAnalyticsSchools
