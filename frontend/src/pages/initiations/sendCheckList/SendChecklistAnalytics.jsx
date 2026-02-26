import React, { useEffect, useMemo, useRef, useState } from 'react'
import useCommonStyles from '../../../components/styles'
import { useDispatch, useSelector } from 'react-redux'
import { Box } from '@mui/system'
import {
	clearClassroomListStudents,
	getAllClassroomsForStudents,
	getSchoolsList,
	setSectionsList,
} from '../../../redux/commonSlice'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { ChartOptions } from './sendChecklistFunction'
import CustomButton from '../../../components/CustomButton'
import CustomIcon from '../../../components/CustomIcon'
import { Dialog, Typography } from '@mui/material'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { BaselineAnalyticsStyles } from '../baseline/baselineAnalyticsStyles'
import {
	checklistOptions,
	generateGrade_4_data,
	generateGrade_9_data,
} from './sendCheckListConstants'
import { Bar } from 'react-chartjs-2'
import SpecificSchoolAnalytics from './SpecificSchoolAnalytics'
import {
	checklistAnalyticsForSingleSchool,
	sCAnalyticsForAllSchools,
} from './sendChecklistslice'
import CustomMultiSelectNoChip from '../../../components/commonComponents/CustomMultiSelectNoChip'
import {
	generatePDF,
	getAcademicYearsList,
	getCurrentAcademicYearId,
} from '../../../utils/utils'
import CustomDialogWithBreadcrumbs from '../../../components/commonComponents/CustomDialogWithBreadcrumbs'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'

const SendChecklistAnalytics = ({ open, onClose }) => {
	const flexStyles = useCommonStyles()
	const dispatch = useDispatch()
	const { schoolsList, classroomsListForStudents } = useSelector(
		(store) => store.commonData,
	)
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const { allSchoolschecklistAnalyticsData } = useSelector(
		(store) => store.sendChecklist,
	)
	const [selectedDropdownData, setSelectedDropdownData] = useState({
		schools: '',
		classrooms: [],
		sections: [],
	})

	const [downloadReportDialogOpen, setDownloadReportDialogOpen] =
		useState(false)
	const [selectedAys, setSelectedAys] = useState([])
	const [classSections, setClassSections] = useState({
		classrooms: '',
		sections: '',
	})
	const [classSectionOptions, setClassSectionOptions] = useState({
		classrooms: [],
		sections: [],
	})

	const captureUIRef = useRef(null)

	const isAllSchool = (schools) => {
		return !schools || schools.length === 0 || schools === 'all'
	}

	const handleGeneratePDF = async () => {
		await generatePDF(captureUIRef.current, {
			filename: 'Students Checklist Analytics Report.pdf',
			orientation: selectedDropdownData.schools ? 'p' : 'l',
			pageSize: 'a4',
			margin: 5,
		})
		setDownloadReportDialogOpen(false)
	}

	const Grade_4_data = useMemo(
		() =>
			generateGrade_4_data(
				allSchoolschecklistAnalyticsData?.upper_KG_Grade4?.map(
					(data) => data?.schoolName,
				) ?? [],
				allSchoolschecklistAnalyticsData?.upper_KG_Grade4?.map((data) =>
					data?.Attention?.toFixed(2),
				) ?? [],
				allSchoolschecklistAnalyticsData?.upper_KG_Grade4?.map((data) =>
					data?.fineMotorAndGrossMotorSkills?.toFixed(2),
				) ?? [],
				allSchoolschecklistAnalyticsData?.upper_KG_Grade4?.map((data) =>
					data?.Cognitive?.toFixed(2),
				) ?? [],
				allSchoolschecklistAnalyticsData?.upper_KG_Grade4?.map((data) =>
					data?.Behavior?.toFixed(2),
				) ?? [],
			),
		[allSchoolschecklistAnalyticsData],
	)
	const Grade_9_data = useMemo(
		() =>
			generateGrade_9_data(
				allSchoolschecklistAnalyticsData?.grade5ToGrade9?.map(
					(data) => data?.schoolName,
				) ?? [],
				allSchoolschecklistAnalyticsData?.grade5ToGrade9?.map((data) =>
					data?.AttentionAndHyperactivity?.toFixed(2),
				) ?? [],
				allSchoolschecklistAnalyticsData?.grade5ToGrade9?.map((data) =>
					data?.Memory?.toFixed(2),
				) ?? [],
				allSchoolschecklistAnalyticsData?.grade5ToGrade9?.map((data) =>
					data?.fineMotorAndGrossMotorSkills?.toFixed(2),
				) ?? [],
				allSchoolschecklistAnalyticsData?.grade5ToGrade9?.map((data) =>
					data?.Cognitive?.toFixed(2),
				) ?? [],
				allSchoolschecklistAnalyticsData?.grade5ToGrade9?.map((data) =>
					data?.SocialSkill?.toFixed(2),
				) ?? [],
			),
		[allSchoolschecklistAnalyticsData],
	)

	const fetchSendchecklistAnalytics = (currentAYId) => {
		const schoolIds = selectedDropdownData.schools
		const classroomIds = selectedDropdownData.classrooms
		const section = selectedDropdownData.sections

		const filter = {
			academicYear: [currentAYId],
		}

		if (classroomIds?.length > 0) {
			filter['classroomIds'] = classroomIds
			filter['className'] = [classSections.classrooms]
		}
		if (schoolIds?.length > 0) {
			filter['schoolIds'] = schoolIds
		}

		if (section?.length > 0) {
			filter['section'] = section
		}

		const body = {
			filter,
		}
		if (isAllSchool(selectedDropdownData.schools)) {
			dispatch(sCAnalyticsForAllSchools(body))
		} else {
			dispatch(checklistAnalyticsForSingleSchool(body))
		}
	}

	const handleBarFilter = (name, value, className, section) => {
		const dropDowns = { ...selectedDropdownData, [name]: value }
		const filter = {
			academicYear: selectedAys,
		}

		if (name === 'classrooms') {
			filter['schoolIds'] = selectedDropdownData.schools
			filter['classroomIds'] = value
			filter['className'] = [className]
			dropDowns['sections'] = []
		} else if (name === 'sections') {
			filter['schoolIds'] = selectedDropdownData.schools
			filter['className'] = className
			filter['section'] = section
			dropDowns[name] = [section]

			filter['classroomIds'] = selectedDropdownData.classrooms
		}

		const body = {
			filter,
		}
		dispatch(checklistAnalyticsForSingleSchool({ body }))
		setSelectedDropdownData(dropDowns)
	}

	const fetchSchoolList = () => {
		if (selectedAys?.length > 0) {
			const body = {
				filter: { academicYear: selectedAys },
			}
			dispatch(getSchoolsList({ body }))
		}
	}

	const handleAYsSelectApply = () => {
		if (selectedAys) {
			dispatch(
				sCAnalyticsForAllSchools({
					filter: { academicYear: selectedAys },
				}),
			)
			fetchSchoolList()
			dispatch(setSectionsList([]))
			setSelectedDropdownData({
				schools: [],
				classrooms: [],
				sections: [],
			})
			setClassSections({ classrooms: '', sections: '' })
			setClassSectionOptions({ classrooms: [], sections: [] })
			dispatch(clearClassroomListStudents())
		}
	}

	// function to handle class options
	const handleClassOptions = () => {
		const list = []
		for (const classroom of classroomsListForStudents) {
			if (!list.includes(classroom.className)) {
				list.push(classroom.className)
			}
		}
		console.log(list)
		setClassSectionOptions((state) => ({ ...state, classrooms: list }))
	}

	// Function to handle section options
	const handleSectionOptions = (selectedClassroomIds = null) => {
		const list = []
		const selectedClasses =
			selectedClassroomIds || selectedDropdownData.classrooms
		for (const classroom of classroomsListForStudents) {
			if (selectedClasses?.length > 0) {
				if (
					!list.includes(classroom.section) &&
					selectedClasses.includes(classroom._id)
				) {
					list.push(classroom.section)
				}
			} else {
				if (!list.includes(classroom.section)) {
					list.push(classroom.section)
				}
			}
		}
		setClassSectionOptions((state) => ({ ...state, sections: list }))
	}

	// function to handle class selection
	const handleClassrooms = (e) => {
		const className = e ? e : ''
		setClassSections((state) => ({
			...state,
			classrooms: className,
			sections: '',
		}))

		const classroomIds = classroomsListForStudents
			.filter((obj) => className === obj.className)
			.map((obj) => obj._id)
		handleSectionOptions(classroomIds)
		handleBarFilter('classrooms', classroomIds, className)
	}

	// function to handle section selection
	const handleSections = (e) => {
		const section = e ? e : ''
		setClassSections((state) => ({
			...state,
			sections: section,
		}))

		let classroomIds = []
		if (section) {
			classroomIds = classroomsListForStudents
				.filter(
					(obj) =>
						classSections.classrooms === obj.className &&
						section === obj.section,
				)
				.map((obj) => obj._id)
		} else {
			classroomIds = classroomsListForStudents
				.filter((obj) => classSections.classrooms === obj.className)
				.map((obj) => obj._id)
		}
		handleBarFilter(
			'sections',
			classroomIds,
			classSections.classrooms,
			section,
		)
	}

	const handleSelectSchool = (e) => {
		const currentData = isAllSchool(selectedDropdownData.schools)
			? 'all'
			: selectedDropdownData.schools

		const isAllSelected = e === 'all' || e === null
		setSelectedDropdownData((prev) => ({
			...prev,
			schools: e,
			classrooms: [],
			sections: [],
		}))
		if (currentData !== e) {
			const body = {
				filter: {
					academicYear: selectedAys,
					schoolIds: [],
				},
			}
			if (isAllSelected) {
				dispatch(sCAnalyticsForAllSchools(body))
			} else {
				body.filter.schoolIds = e
				dispatch(
					checklistAnalyticsForSingleSchool({
						body,
					}),
				)

				dispatch(
					getAllClassroomsForStudents({
						body: {
							filter: {
								schoolIds: [e],
								academicYear: selectedAys,
							},
						},
					}),
				)
			}

			setClassSections({
				classrooms: '',
				sections: '',
			})
			setClassSectionOptions({
				classrooms: [],
				sections: [],
			})
		}
	}

	const isInitialLoad = useRef(true)
	useEffect(() => {
		if (academicYears?.length > 0 && isInitialLoad.current) {
			const currentAYId = getCurrentAcademicYearId(academicYears)
			if (currentAYId) {
				setSelectedAys([currentAYId])
				fetchSendchecklistAnalytics(currentAYId)
			}
			isInitialLoad.current = false
		}
	}, [academicYears])

	useEffect(() => {
		if (selectedAys?.length === 0 && academicYears?.length > 0) {
			const currentAYId = getCurrentAcademicYearId(academicYears)
			if (currentAYId) {
				setSelectedAys([currentAYId])
			}
		}
	}, [selectedAys, academicYears])

	// Update class and section options when classroomsListForStudents changes
	useEffect(() => {
		handleClassOptions()
		handleSectionOptions()
	}, [classroomsListForStudents])

	const renderBody = () => {
		if (isAllSchool(selectedDropdownData.schools)) {
			return (
				<>
					{' '}
					<Box
						sx={{
							...BaselineAnalyticsStyles.tableBoxSx,
							minHeight: '350px',
							mt: '0px',
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
									{`${checklistOptions?.[0]} (schools)`}
								</Typography>
							</Box>
							<Box
								sx={{
									display: 'flex',
									flexDirection: 'row',
									alignItems: 'center',
									justifyContent: 'end',
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
												'globalElementColors.blue',
										}}
									/>
									<Typography
										variant={typographyConstants.h5}
										sx={{ pl: '10px', fontSize: '16px' }}
									>
										{localizationConstants.attention}
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
												'globalElementColors.red',
										}}
									/>
									<Typography
										variant={typographyConstants.h5}
										sx={{ pl: '10px', fontSize: '16px' }}
									>
										{
											localizationConstants.fineMotorGrossMotorSkill
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
											backgroundColor:
												'globalElementColors.yellow',
										}}
									/>
									<Typography
										variant={typographyConstants.h5}
										sx={{ pl: '10px', fontSize: '16px' }}
									>
										{localizationConstants.cognitive}
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
												'textColors.green2',
										}}
									/>
									<Typography
										variant={typographyConstants.h5}
										sx={{ pl: '10px', fontSize: '16px' }}
									>
										{localizationConstants.behavior}
									</Typography>
								</Box>
							</Box>
						</Box>

						{Grade_4_data?.labels?.length > 0 ? (
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
											Grade_4_data?.labels?.length > 0
												? `${Grade_4_data?.labels?.length * 260}px`
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
										data={Grade_4_data}
										options={ChartOptions(Grade_4_data)}
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
					<Box
						sx={{
							...BaselineAnalyticsStyles.tableBoxSx,
							minHeight: '350px',
							mt: '24px',
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
									{`${checklistOptions?.[1]} (schools)`}
								</Typography>
							</Box>
							<Box
								sx={{
									display: 'flex',
									flexDirection: 'row',
									alignItems: 'center',
									justifyContent: 'end',
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
												'globalElementColors.blue',
										}}
									/>
									<Typography
										variant={typographyConstants.h5}
										sx={{ pl: '10px', fontSize: '16px' }}
									>
										{
											localizationConstants.attentionHyperactivity
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
											backgroundColor:
												'globalElementColors.red',
										}}
									/>
									<Typography
										variant={typographyConstants.h5}
										sx={{ pl: '10px', fontSize: '16px' }}
									>
										{localizationConstants.memory}
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
												'globalElementColors.yellow',
										}}
									/>
									<Typography
										variant={typographyConstants.h5}
										sx={{ pl: '10px', fontSize: '16px' }}
									>
										{
											localizationConstants.fineMotorGrossMotorSkill
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
											backgroundColor:
												'textColors.green2',
										}}
									/>
									<Typography
										variant={typographyConstants.h5}
										sx={{ pl: '10px', fontSize: '16px' }}
									>
										{localizationConstants.cognitive}
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
												'textColors.yellow2',
										}}
									/>
									<Typography
										variant={typographyConstants.h5}
										sx={{ pl: '10px', fontSize: '16px' }}
									>
										{localizationConstants.socialSkills}
									</Typography>
								</Box>
							</Box>
						</Box>

						{Grade_9_data?.labels?.length > 0 ? (
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
											Grade_9_data?.labels?.length > 0
												? `${Grade_9_data?.labels?.length * 260}px`
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
										data={Grade_9_data}
										options={ChartOptions(Grade_9_data)}
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
				</>
			)
		} else {
			return <SpecificSchoolAnalytics />
		}
	}

	return (
		<CustomDialogWithBreadcrumbs
			onClose={onClose}
			clickableTitle={localizationConstants.sendChecklist}
			title={localizationConstants.analytics}
			onClick={onClose}
			open={open}
			saveBtnReq={false}
		>
			<Box className={flexStyles.flexColumn} gap={'24px'}>
				<Box ref={captureUIRef}>
					<Box
						className={flexStyles.flexRowCenterSpaceBetween}
						gap={'24px'}
					>
						<Box sx={{ width: '30%' }}>
							<CustomMultiSelectNoChip
								fieldSx={{ minHeight: '44px' }}
								value={selectedAys}
								onChange={(e) => {
									setSelectedAys(e)
								}}
								options={
									getAcademicYearsList(academicYears) || []
								}
								label={localizationConstants.academicYear}
								onApply={handleAYsSelectApply}
							/>
						</Box>

						{/* ------------------ Schools ------------------ */}
						<Box sx={{ width: '33%' }}>
							<Typography variant={typographyConstants.body}>
								{localizationConstants.school}
							</Typography>
							<CustomAutocompleteNew
								sx={{ flexGrow: 1, width: '100%' }}
								fieldSx={{ borderRadius: '4px', mb: '3px' }}
								value={selectedDropdownData.schools}
								placeholder={`${localizationConstants.select} ${localizationConstants.school}`}
								onChange={handleSelectSchool}
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

						{/* ------------------ Classrooms ------------------ */}
						<Box sx={{ width: '33%' }}>
							<Typography variant={typographyConstants.body}>
								{localizationConstants.ClassCamel}
							</Typography>
							<CustomAutocompleteNew
								sx={{ flexGrow: 1, width: '100%' }}
								fieldSx={{ borderRadius: '4px', mb: '3px' }}
								value={classSections.classrooms}
								placeholder={`${localizationConstants.select} ${localizationConstants.ClassCamel}`}
								onChange={handleClassrooms}
								options={classSectionOptions.classrooms || []}
								disabled={
									selectedDropdownData?.schools?.length === 0
								}
							/>
						</Box>

						{/* ------------------ Sections ------------------ */}
						<Box sx={{ width: '33%' }}>
							<Typography variant={typographyConstants.body}>
								{localizationConstants.section}
							</Typography>
							<CustomAutocompleteNew
								sx={{ flexGrow: 1, width: '100%' }}
								fieldSx={{ borderRadius: '4px', mb: '3px' }}
								value={classSections.sections}
								placeholder={`${localizationConstants.select} ${localizationConstants.section}`}
								onChange={handleSections}
								options={
									classSections.classrooms !== ''
										? classSectionOptions.sections
										: []
								}
								disabled={
									selectedDropdownData?.classrooms?.length ===
									0
								}
							/>
						</Box>

						<CustomButton
							sx={{
								minWidth: '182px',
								height: '44px',
								marginTop: '19px',
							}}
							text={localizationConstants.generateReport}
							onClick={() => {
								setDownloadReportDialogOpen(true)
							}}
						/>
					</Box>
					{renderBody()}
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
							<Box
								className={flexStyles.flexRowCenterSpaceBetween}
							>
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
									onClick={handleGeneratePDF}
									endIcon={
										<Box sx={{ marginLeft: '1rem' }}>
											{' '}
											<CustomIcon
												name={
													iconConstants.downloadWhite
												}
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
		</CustomDialogWithBreadcrumbs>
	)
}

export default SendChecklistAnalytics
