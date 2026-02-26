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
import { getSchoolRankingsBasedOnTeachersIRI } from './teacherIRISlice'
import {
	BarDataForGenderWiseReport,
	optionsForDomainWisePerformanceSchool,
	optionsForGenderWiseReport,
	overAllIRISchoolData,
} from './teacherFunctions'
import { iconConstants } from '../../../resources/theme/iconConstants'
import CustomIcon from '../../../components/CustomIcon'
import {
	generatePDF,
	getAcademicYearsList,
	getCurrentAcademicYearId,
} from '../../../utils/utils'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'
import SpecificSchoolIRIDetails from './SpecificSchoolIRIDetails'
import NoIRIDataAvailableScreen from '../../../components/NoIRIDataAvailableScreen'

Chart.register(ChartDataLabels)

const SchoolIRIAnalytics = () => {
	const dispatch = useDispatch()
	const [school, setSchool] = useState(null)
	const flexStyles = useCommonStyles()
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const { schoolsList } = useSelector((store) => store.commonData)
	const { schoolRankingsBasedOnTeachersIRI } = useSelector(
		(store) => store.teacherIRI,
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
			filename: 'School IRI Report.pdf',
			orientation: 'l',
			pageSize: 'a4',
			margin: 3,
		})
		setDownloadReportDialogOpen(false)
	}
	const dataForDomainWisePerformanceSchool = overAllIRISchoolData(
		schoolRankingsBasedOnTeachersIRI,
	)
	const dataForGenderWiseReport = BarDataForGenderWiseReport(
		schoolRankingsBasedOnTeachersIRI,
	)

	useEffect(() => {
		if (selectedDropdownData?.selectedAys?.length > 0) {
			const body = {
				academicYear: selectedDropdownData.selectedAys,
			}
			dispatch(getSchoolRankingsBasedOnTeachersIRI({ body }))
		}
	}, [selectedDropdownData.selectedAys])

	useEffect(() => {
		const foundSchool =
			schoolRankingsBasedOnTeachersIRI?.subScaleWisePerformanceOfSchools?.find(
				(s) => s?._id === selectedDropdownData.schools,
			)

		// Explicitly handle both cases: found and not found
		if (foundSchool) {
			setSchool(foundSchool)
		} else {
			setSchool(null) // Clear previous school data when no data exists
		}
	}, [selectedDropdownData.schools, schoolRankingsBasedOnTeachersIRI])

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
			<Box ref={captureUIRef}>
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
							schoolRankingsBasedOnTeachersIRI
								?.subScaleWisePerformanceOfSchools?.length === 0
						}
					/>
				</Box>

				{schoolRankingsBasedOnTeachersIRI
					?.subScaleWisePerformanceOfSchools?.length > 0 ? (
					<>
						{showSpecificSchool ? (
							<SpecificSchoolIRIDetails
								schoolData={school}
								selectedSchoolFromAnalytics={
									selectedDropdownData.schools
								}
							/>
						) : (
							<>
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
													localizationConstants.domainWisePerformance
												}{' '}
												({localizationConstants.schools}
												)
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
															'#025ABD',
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
														localizationConstants.perspectiveTaking
													}
												</Typography>
												<Box
													sx={{
														...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
														backgroundColor:
															'#DD2A2B',
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
														localizationConstants.vicariousEmpathy
													}
												</Typography>
												<Box
													sx={{
														...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
														backgroundColor:
															'#F8A70D',
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
														localizationConstants.empathicConcern
													}
												</Typography>
												<Box
													sx={{
														...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
														backgroundColor:
															'#25C548',
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
														localizationConstants.altruisticReactivity
													}
												</Typography>
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
														dataForDomainWisePerformanceSchool
															?.labels?.length > 1
															? dataForDomainWisePerformanceSchool
																	?.labels
																	?.length *
																290
															: dataForDomainWisePerformanceSchool
																	?.labels
																	?.length *
																350
													}px`,
													height: '280px',
												}}
											>
												<Bar
													data={
														dataForDomainWisePerformanceSchool
													}
													options={optionsForDomainWisePerformanceSchool(
														schoolRankingsBasedOnTeachersIRI,
													)}
												/>
											</Box>
										</Box>
									</Box>
								</Box>
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
													localizationConstants.genderWiseReport
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
															'#01234A',
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
													{localizationConstants.male}
												</Typography>
												<Box
													sx={{
														...BaselineAnalyticsStyles.domainGraphLegendBoxSx,
														backgroundColor:
															'#F8A70D',
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
														localizationConstants.female
													}
												</Typography>
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
														dataForGenderWiseReport
															?.labels?.length > 1
															? dataForGenderWiseReport
																	?.labels
																	?.length *
																250
															: dataForGenderWiseReport
																	?.labels
																	?.length *
																240
													}px`,
													height: '290px',
												}}
											>
												<Bar
													data={
														dataForGenderWiseReport
													}
													options={optionsForGenderWiseReport(
														schoolRankingsBasedOnTeachersIRI,
													)}
												/>
											</Box>
										</Box>
									</Box>
								</Box>
							</>
						)}
					</>
				) : (
					<NoIRIDataAvailableScreen
						message={
							localizationConstants?.NoIRIAnalyticDataAvailableForAY
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
						<Box sx={{ marginTop: '20px', textAlign: 'start' }}>
							<Typography color={'globalElementColors.gray1'}>
								{
									localizationConstants.downloadTeacherIRIAnalyticalPDFReportMsg
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

export default SchoolIRIAnalytics
