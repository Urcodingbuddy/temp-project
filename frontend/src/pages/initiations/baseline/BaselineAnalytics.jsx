import React, { useEffect, useState, useRef, lazy } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	Typography,
	TableHead,
	Dialog,
} from '@mui/material'
import useCommonStyles from '../../../components/styles'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomButton from '../../../components/CustomButton'
import {
	clearClassroomListStudents,
	getAllClassroomsForStudents,
	getSchoolsList,
	setSectionsList,
} from '../../../redux/commonSlice'
import {
	options,
	DomainWisePClass,
	DomainWisePSection,
	DomainWisePSchool,
	overAllBaselineSchool,
} from './baselineFunctions'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import {
	clearBaselineAnalyticsDownloadFilter,
	getBaselineAnalyticsRecords,
	getSingleBLRecordsAnalyticsReport,
	setBaselineAnalyticalFilterClasses,
	setBaselineAnalyticalFilterSchools,
	setBaselineAnalyticalFilterSections,
} from './baselineSlice'
import { baselineAnalyticsColumns, categories, supportLevels } from './baselineConstants'
import { Bar, Doughnut, Pie } from 'react-chartjs-2'
import { BaselineAnalyticsStyles } from './baselineAnalyticsStyles'
import { iconConstants } from '../../../resources/theme/iconConstants'
import CustomIcon from '../../../components/CustomIcon'
import Chart from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import {
	generatePDF,
	getAcademicYearsList,
	getCurrentAcademicYearId,
	getUserFromLocalStorage,
} from '../../../utils/utils'
import CustomMultiSelectNoChip from '../../../components/commonComponents/CustomMultiSelectNoChip'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'
import BaselineKPISummary from './BaselineKPISummary'
import ClassHeatmap from './ClassHeatmap'
import DomainStackedBarChart from './DomainStackedBarChart'
import StudentsListByDomainDialog from './StudentsListByDomainDialog'
import StudentsScreeningStatusDialog from './StudentsScreeningStatusDialog'
import StudentsBySupportLevelDialog from './StudentsBySupportLevelDialog'
import RiskDashboardBlock from './RiskDashboardBlock'
import AdvancedFiltersDialog from './AdvancedFiltersDialog'

Chart.register(ChartDataLabels)

const BaselineAnalytics = () => {
	const flexStyles = useCommonStyles()
	const dispatch = useDispatch()
	const { drawerWidth } = useSelector((store) => store.dashboardSliceSetup)
	const { schoolsList, classroomsListForStudents } = useSelector(
		(store) => store.commonData,
	)
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)

	const {
		filterFieldsBaselineAnalyticsDownload,
		allBaselineAnalyticsRecords,
		filterFieldsBaselineAnalytical,
	} = useSelector((store) => store.baseline)
	const green = []
	const orange = []
	const red = []

	const [columns, setColumns] = useState(baselineAnalyticsColumns)
	const [selectedAys, setSelectedAys] = useState([])
	const [classSections, setClassSections] = useState({
		classrooms: '',
		sections: '',
	})
	const [classSectionOptions, setClassSectionOptions] = useState({
		classrooms: [],
		sections: [],
	})
	const [selectedDropdownData, setSelectedDropdownData] = useState({
		schools: '',
		classrooms: [],
		sections: [],
	})
	const [schoolOrClassRankDisplay, setSchoolOrClassRankDisplay] = useState(0)

	const rowCells = (column, row) => {
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
					<Typography variant={typographyConstants.body}>
						{`${row?.percentage === 0 || !row?.percentage ? 0 : row?.percentage + ' %'}`}
					</Typography>
				)
			case localizationConstants.zeroToThree:
				red.push(row['0-3'])
				return (
					<Typography variant={typographyConstants.body}>
						{row['0-3'] ?? 0}
					</Typography>
				)
			case localizationConstants.fourToFive:
				orange.push(row['4-5'])
				return (
					<Typography variant={typographyConstants.body}>
						{row['4-5'] ?? 0}
					</Typography>
				)
			case localizationConstants.sixToSeven:
				green.push(row['6-7'])
				return (
					<Typography variant={typographyConstants.body}>
						{row['6-7'] ?? 0}
					</Typography>
				)
		}
	}
	const [sectionOptions, setSectionOptions] = useState([])

	const filterBaselineData = (AY) => {
		const schoolIds = selectedDropdownData.schools
		// const classRoomIds = filterFieldsBaselineAnalytical.classes // Updated to use classRoomIds

		// const section = filterFieldsBaselineAnalytical.sections

		const filter = {}
		// if (classRoomIds?.length > 0) {
		// 	filter['classRoomId'] = classRoomIds
		// 	filter['className'] = [classSections.classrooms]
		// }
		if (schoolIds?.length > 0) {
			filter['schoolIds'] = schoolIds
		}
		// if (section?.length > 0) {
		// 	filter['section'] = section
		// }
		if (selectedAys?.length > 0) {
			filter['academicYear'] = AY ?? selectedAys
		}

		const body = { filter }
		if (schoolIds?.length === 0) {
			dispatch(
				getBaselineAnalyticsRecords({
					filter: { academicYear: AY ?? selectedAys },
				}),
			)
		} else {
			dispatch(getSingleBLRecordsAnalyticsReport({ body }))
		}
	}

	const [downloadReportDialogOpen, setDownloadReportDialogOpen] =
		useState(false)
	const [buttonChange, setButtonChange] = useState(false)

	// State for students list dialog
	const [studentsListDialog, setStudentsListDialog] = useState({
		open: false,
		domain: null,
		supportLevel: null,
	})

	// State for screening status dialog
	const [screeningDialog, setScreeningDialog] = useState({
		open: false,
		status: null, // 'screened' | 'notScreened'
	})

	// State for support level dialog (from pie chart click)
	const [supportLevelDialog, setSupportLevelDialog] = useState({
		open: false,
		level: null, // 'red' | 'orange' | 'green'
	})

	// State for advanced filters dialog
	const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false)
	const [advancedFilters, setAdvancedFilters] = useState({})

	// Handle segment click from stacked bar chart
	const handleSegmentClick = (segmentData) => {
		setStudentsListDialog({
			open: true,
			domain: segmentData.domain,
			supportLevel: segmentData.supportLevel,
		})
	}

	const handleStudentsListDialogClose = () => {
		setStudentsListDialog({
			open: false,
			domain: null,
			supportLevel: null,
		})
	}

	// Handle screening chart click
	const handleScreeningChartClick = (event, elements) => {
		if (elements.length > 0) {
			const dataIndex = elements[0].index
			// dataIndex 0 = screened, 1 = not screened
			const status = dataIndex === 0 ? 'screened' : 'notScreened'
			setScreeningDialog({ open: true, status })
		}
	}

	const handleScreeningDialogClose = () => {
		setScreeningDialog({ open: false, status: null })
	}

	// Handle click on support levels pie chart
	const handleSupportLevelPieClick = (event, elements) => {
		if (elements && elements.length > 0) {
			const dataIndex = elements[0].index
			// dataIndex 0 = red, 1 = orange, 2 = green
			const levels = ['red', 'orange', 'green']
			const level = levels[dataIndex]
			setSupportLevelDialog({ open: true, level })
		}
	}

	const handleSupportLevelDialogClose = () => {
		setSupportLevelDialog({ open: false, level: null })
	}

	const captureUIRef = useRef(null)
	const captureUIAndDownloadPDF = async () => {
		await generatePDF(captureUIRef.current, {
			filename: 'Baseline Analytics.pdf',
			orientation: 'l',
			pageSize: 'a4',
			margin: 5,
		})
		setDownloadReportDialogOpen(false)
	}

	const greenData = {
		labels: categories,
		datasets: [
			{
				data: green,
				backgroundColor: '#25C548',
				borderWidth: 0,
				barThickness: 40,
				borderRadius: 5,
			},
		],
	}
	const redData = {
		labels: categories,
		datasets: [
			{
				data: red,
				backgroundColor: '#DD2A2B',
				borderWidth: 0,
				barThickness: 40,
				borderRadius: 5,
			},
		],
	}
	const orangeData = {
		labels: categories,
		datasets: [
			{
				data: orange,
				backgroundColor: '#F8A70D',
				borderWidth: 0,
				barThickness: 40,
				borderRadius: 5,
			},
		],
	}

	// Doughnut chart data for Students Screened vs Total Strength
	// Backend now returns context-specific values based on classroom/section selection
	const studentsScreened = allBaselineAnalyticsRecords?.studentsScreened ?? 0
	const totalStrengthValue = allBaselineAnalyticsRecords?.totalStrength ?? 0
	const rogBreakupData = allBaselineAnalyticsRecords?.rogBreakup ?? { red: 0, orange: 0, green: 0 }
	const studentsNotScreened = Math.max(
		0,
		totalStrengthValue - studentsScreened,
	)

	const studentsScreenedDoughnutData = {
		labels: [localizationConstants.assessedStudents, localizationConstants.notScreened],
		datasets: [
			{
				data: [studentsScreened, studentsNotScreened],
				backgroundColor: ['#43A047', '#E0E0E0'],
				borderWidth: 0,
				cutout: '65%',
			},
		],
	}

	// Custom plugin to draw text in center of doughnut
	const centerTextPlugin = {
		id: 'centerText',
		beforeDraw: (chart) => {
			const { ctx, width, height } = chart
			// Calculate total from chart data directly
			const data = chart.data.datasets[0]?.data || []
			const total = data.reduce((sum, val) => sum + val, 0)

			ctx.restore()
			const fontSize = (height / 114).toFixed(2)
			ctx.font = `bold ${Math.max(fontSize, 1) * 16}px sans-serif`
			ctx.textBaseline = 'middle'
			ctx.textAlign = 'center'
			ctx.fillStyle = '#333'
			const text = total.toString()
			const textX = width / 2
			const textY = height / 2
			ctx.fillText(text, textX, textY)
			ctx.save()
		},
	}

	const doughnutOptions = {
		maintainAspectRatio: false,
		onClick: handleScreeningChartClick,
		onHover: (event, elements) => {
			event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default'
		},
		layout: {
			padding: {
				top: 30,
				bottom: 30,
				left: 20,
				right: 20,
			},
		},
		plugins: {
			legend: {
				display: false,
			},
			datalabels: {
				display: true,
				color: 'black',
				anchor: 'end',
				align: 'end',
				offset: 8,
				font: {
					size: 13,
					weight: 'bold',
				},
				formatter: (value) => {
					return value > 0 ? value : ''
				},
			},
			tooltip: {
				callbacks: {
					label: function (context) {
						const label = context.label || ''
						const value = context.parsed || 0
						return ` ${label}: ${value}`
					},
				},
				bodyFont: {
					size: 13,
				},
				titleFont: {
					size: 15,
				},
				padding: 10,
			},
		},
	}

	// ROG (Red, Orange, Green) Pie Chart Data
	const rogRed = rogBreakupData?.red ?? 0
	const rogOrange = rogBreakupData?.orange ?? 0
	const rogGreen = rogBreakupData?.green ?? 0
	const rogTotal = rogRed + rogOrange + rogGreen

	const rogPieData = {
		labels: [
			supportLevels.red.shortLabel,
			supportLevels.orange.shortLabel,
			supportLevels.green.shortLabel,
		],
		datasets: [
			{
				data: [rogRed, rogOrange, rogGreen],
				backgroundColor: [
					supportLevels.red.color,
					supportLevels.orange.color,
					supportLevels.green.color,
				],
				borderWidth: 0,
			},
		],
	}

	const rogPieOptions = {
		maintainAspectRatio: false,
		layout: {
			padding: {
				top: 35,
				bottom: 25,
				left: 40,
				right: 40,
			},
		},
		plugins: {
			legend: {
				display: false,
			},
			datalabels: {
				display: true,
				color: 'black',
				anchor: 'end',
				align: 'end',
				offset: 8,
				font: {
					size: 11,
					weight: 'bold',
				},
				formatter: (value) => {
					if (value > 0 && rogTotal > 0) {
						const percentage = ((value / rogTotal) * 100).toFixed(1)
						return `${value} (${percentage}%)`
					}
					return ''
				},
			},
			tooltip: {
				callbacks: {
					label: function (context) {
						const label = context.label || ''
						const value = context.parsed || 0
						const percentage =
							rogTotal > 0 ? ((value / rogTotal) * 100).toFixed(1) : 0
						return ` ${label}: ${value} (${percentage}%)`
					},
				},
				bodyFont: {
					size: 13,
				},
				titleFont: {
					size: 15,
				},
				padding: 10,
			},
		},
		onClick: handleSupportLevelPieClick,
		onHover: (event, elements) => {
			event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default'
		},
	}

	const overAllBaselineSchoolsData = overAllBaselineSchool(
		allBaselineAnalyticsRecords,
	)

	const domainWisePerformanceSchoolsData = DomainWisePSchool(
		allBaselineAnalyticsRecords,
	)
	const DomainWisePerformanceClassData = DomainWisePClass(
		allBaselineAnalyticsRecords?.domainWisePercentagesOfEachClass
			? allBaselineAnalyticsRecords?.domainWisePercentagesOfEachClass
			: [],
		selectedDropdownData?.classrooms?.length > 0
			? selectedDropdownData?.classrooms
			: [
					...new Set(
						classroomsListForStudents.map(
							(classroom) => classroom.className,
						),
					),
				],
	)
	const DomainWisePerformanceSectionData = DomainWisePSection(
		Array.isArray(
			allBaselineAnalyticsRecords?.domainWisePercentagesOfEachSections,
		)
			? allBaselineAnalyticsRecords?.domainWisePercentagesOfEachSections
			: [
					allBaselineAnalyticsRecords?.domainWisePercentagesOfEachSections,
				] || [],
		selectedDropdownData?.sections?.length > 0
			? selectedDropdownData?.sections
			: sectionOptions,
	)

	const isButtonChange =
		buttonChange &&
		filterFieldsBaselineAnalyticsDownload?.schools.length > 0 &&
		filterFieldsBaselineAnalyticsDownload?.classes.length > 0

	const isSection =
		selectedDropdownData?.sections?.length > 0 ||
		selectedDropdownData?.classrooms?.length > 0 ||
		isButtonChange

	const {
		domainWisePercentagesOfEachSchool,
		domainWisePercentagesOfEachClass,
		domainWisePercentagesOfEachSections,
	} = allBaselineAnalyticsRecords || {}

	// School-level values (always show school data regardless of class/section selection)
	const schoolRank = domainWisePercentagesOfEachSchool?.rank ?? 0
	const schoolScore = domainWisePercentagesOfEachSchool?.overallPercentageofSchools ?? 0
	const schoolTotalStrength = allBaselineAnalyticsRecords?.schoolTotalStrength ?? 0

	const OverallBaselineScoreDisplay =
		selectedDropdownData?.sections?.length > 0
			? (domainWisePercentagesOfEachSections?.overallPercentageofSection ??
				0)
			: selectedDropdownData?.classrooms?.length > 0
				? (domainWisePercentagesOfEachClass?.[0]
						?.overallPercentageofClasses ?? 0)
				: (domainWisePercentagesOfEachSchool?.overallPercentageofSchools ??
					0)

	// Gauge Chart for Developmental Readiness Score (Semi-circle)
	const scoreValue = OverallBaselineScoreDisplay || 0
	const gaugeData = {
		datasets: [
			{
				data: [scoreValue, 100 - scoreValue],
				backgroundColor: [
					scoreValue >= 70 ? '#43A047' : scoreValue >= 50 ? '#FB8C00' : '#E53935',
					'#E8E8E8',
				],
				borderWidth: 0,
				cutout: '75%',
				circumference: 180,
				rotation: 270,
			},
		],
	}

	const gaugeOptions = {
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				enabled: false,
			},
			datalabels: {
				display: false,
			},
		},
	}

	useEffect(() => {
		const rank =
			selectedDropdownData.sections.length > 0
				? allBaselineAnalyticsRecords?.domainWisePercentagesOfEachSections
					? (allBaselineAnalyticsRecords
							?.domainWisePercentagesOfEachSections.rank ?? 0)
					: 0
				: allBaselineAnalyticsRecords?.domainWisePercentagesOfEachSchool
					? (allBaselineAnalyticsRecords
							?.domainWisePercentagesOfEachSchool?.rank ?? 0)
					: 0

		setSchoolOrClassRankDisplay(rank)
	}, [isSection, selectedDropdownData, allBaselineAnalyticsRecords])

	const isAllSchool = (schools) => {
		return !schools || schools.length === 0 || schools === 'all'
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

			const selectedClassroomIds = classroomsListForStudents
				.filter(
					(cls) =>
						cls.className === className &&
						cls.section === section &&
						selectedDropdownData.classrooms.includes(cls._id),
				)
				.map((cls) => cls._id)

			filter['classroomIds'] = selectedClassroomIds
		}

		const body = {
			filter,
		}
		dispatch(getSingleBLRecordsAnalyticsReport({ body }))
		setSelectedDropdownData(dropDowns)
	}

	const fetchSchoolList = () => {
		if (selectedAys.length > 0) {
			const body = {
				filter: { academicYear: selectedAys },
			}
			dispatch(getSchoolsList({ body }))
		}
	}

	const handleAYsSelectApply = () => {
		if (selectedAys) {
			dispatch(
				getBaselineAnalyticsRecords({
					filter: { academicYear: selectedAys },
				}),
			)
			fetchSchoolList()
			dispatch(setSectionsList([]))
			dispatch(setBaselineAnalyticalFilterSchools([]))
			dispatch(setBaselineAnalyticalFilterClasses([]))
			dispatch(setBaselineAnalyticalFilterSections([]))
			setClassSections({ classrooms: '', sections: '' })
			setClassSectionOptions({ classrooms: [], sections: [] })
			dispatch(clearClassroomListStudents())
			setSelectedDropdownData({})
		}
	}

	// function to fetch classrooms
	const fetchClassroomsList = () => {
		if (
			selectedDropdownData.schools.length > 0 &&
			classroomsListForStudents.length === 0
		) {
			dispatch(
				getAllClassroomsForStudents({
					body: {
						filter: {
							academicYear: selectedAys,
							schoolIds: selectedDropdownData.schools,
						},
					},
				}),
			)
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
		setClassSectionOptions((state) => ({ ...state, classrooms: list }))
	}

	// Function to handle section options
	const handleSectionOptions = (selectedClassroomIds = null) => {
		const list = []
		const selectedClasses =
			selectedClassroomIds || filterFieldsBaselineAnalytical.classRoomIds
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
				dispatch(getBaselineAnalyticsRecords(body))
			} else {
				body.filter.schoolIds = e
				dispatch(getSingleBLRecordsAnalyticsReport({ body }))

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

	useEffect(() => {
		if (selectedDropdownData?.classes?.length > 0) {
			const filteredSections = classroomsListForStudents
				.filter((classroom) =>
					selectedDropdownData?.classes?.includes(classroom._id),
				)
				.map((classroom) => classroom.section)
			const uniqueSections = Array.from(new Set(filteredSections))
			setSectionOptions(uniqueSections)
		}
	}, [selectedDropdownData?.classes, classroomsListForStudents])
	const user = getUserFromLocalStorage()

	const isTeacher = user?.permissions[0] === 'Teacher'

	//  // Automatically select the school for teachers if not already set
	useEffect(() => {
		if (isTeacher) {
			const selectedSchool = schoolsList[0]?._id

			const currentSchools = selectedDropdownData?.schools

			const currentSchoolArray = Array.isArray(currentSchools)
				? currentSchools
				: currentSchools
					? [currentSchools]
					: []

			if (!currentSchoolArray.includes(selectedSchool)) {
				dispatch(setBaselineAnalyticalFilterSchools([selectedSchool]))
			}
		}
	}, [])

	const isInitialLoad = useRef(true)
	// useEffect(() => {
	// 	if (!isInitialLoad.current) {
	// 		filterBaselineData()
	// 	}
	// }, [filterFieldsBaselineAnalytical])

	useEffect(() => {
		if (academicYears.length > 0 && isInitialLoad.current) {
			const currentAYId = getCurrentAcademicYearId(academicYears)
			if (currentAYId) {
				setSelectedAys([currentAYId])
				filterBaselineData([currentAYId])
			}
			isInitialLoad.current = false
		}
	}, [academicYears])

	useEffect(() => {
		if (selectedAys.length === 0 && academicYears.length > 0) {
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

	const sectionsToDisplay =
		selectedDropdownData.sections.length === 0
			? [...(classSectionOptions.sections || [])].sort((a, b) =>
					a.toString().localeCompare(b.toString(), undefined, {
						numeric: true,
						sensitivity: 'base',
					}),
				)
			: DomainWisePerformanceSectionData?.labels || []

	return (
		<Box ref={captureUIRef}>
			{!isButtonChange && (
				<Box
					sx={{
						...BaselineAnalyticsStyles.tableBoxSx,
						p: '12px 20px',
						mb: '12px',
					}}
				>
					<Box
						className={flexStyles.flexRowCenterSpaceBetween}
						sx={{ width: '100%', flexWrap: 'wrap', gap: '12px' }}
					>
						<Box sx={{ flex: 1, minWidth: '180px' }}>
							<CustomMultiSelectNoChip
								fieldSx={{ minHeight: '44px', borderRadius: '8px' }}
								value={selectedAys}
								onChange={(e) => {
									setSelectedAys(e)
								}}
								options={getAcademicYearsList(academicYears) || []}
								label={localizationConstants.academicYear}
								onApply={handleAYsSelectApply}
							/>
						</Box>

						<Box sx={{ flex: 1, minWidth: '180px' }}>
							<Typography
								variant={typographyConstants.body}
								sx={{ mb: '4px', fontWeight: 500, color: 'textColors.gray1' }}
							>
								{localizationConstants.school}
							</Typography>
							<CustomAutocompleteNew
								sx={{ flexGrow: 1, width: '100%' }}
								fieldSx={{ borderRadius: '8px' }}
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
						<Box sx={{ flex: 1, minWidth: '180px' }}>
							<Typography
								variant={typographyConstants.body}
								sx={{ mb: '4px', fontWeight: 500, color: 'textColors.gray1' }}
							>
								{localizationConstants.ClassCamel}
							</Typography>
							<CustomAutocompleteNew
								sx={{ flexGrow: 1, width: '100%' }}
								fieldSx={{ borderRadius: '8px' }}
								value={classSections.classrooms}
								placeholder={`${localizationConstants.select} ${localizationConstants.ClassCamel}`}
								onChange={handleClassrooms}
								onClick={fetchClassroomsList}
								options={classSectionOptions.classrooms || []}
								disabled={
									selectedDropdownData?.schools?.length === 0
								}
							/>
						</Box>

						{/* ------------------ Sections ------------------ */}
						<Box sx={{ flex: 1, minWidth: '180px' }}>
							<Typography
								variant={typographyConstants.body}
								sx={{ mb: '4px', fontWeight: 500, color: 'textColors.gray1' }}
							>
								{localizationConstants.section}
							</Typography>
							<CustomAutocompleteNew
								sx={{ flexGrow: 1, width: '100%' }}
								fieldSx={{ borderRadius: '8px' }}
								value={classSections.sections}
								placeholder={`${localizationConstants.select} ${localizationConstants.section}`}
								onChange={handleSections}
								options={
									classSections.classrooms !== ''
										? classSectionOptions.sections
										: []
								}
								disabled={
									selectedDropdownData?.classrooms?.length === 0
								}
							/>
						</Box>

						<CustomButton
							sx={{
								minWidth: '160px',
								height: '40px',
								marginTop: '20px',
								borderRadius: '8px',
								background: 'linear-gradient(135deg, #4CB8C4 0%, #3BA3AD 100%)',
								'&:hover': {
									background: 'linear-gradient(135deg, #3BA3AD 0%, #2D8A94 100%)',
								},
							}}
							typoSx={{
								fontSize: '14px',
								fontWeight: 500,
							}}
							text={localizationConstants.generateReport}
							onClick={() => {
								setDownloadReportDialogOpen(true)
								dispatch(clearBaselineAnalyticsDownloadFilter())
								setButtonChange(false)
							}}
						/>

						<CustomButton
							sx={{
								minWidth: '140px',
								height: '40px',
								marginTop: '20px',
								marginLeft: '12px',
								borderRadius: '8px',
								border: '1px solid #1976D2',
								backgroundColor: '#FFF',
								color: '#1976D2',
								'&:hover': {
									backgroundColor: '#E3F2FD',
								},
							}}
							typoSx={{
								fontSize: '14px',
								fontWeight: 500,
								color: '#1976D2',
							}}
							text={localizationConstants.advancedFilters || 'Advanced Filters'}
							onClick={() => setAdvancedFiltersOpen(true)}
						/>
					</Box>
				</Box>
			)}
			{/* ---------------------     BarGraph ---------------- */}
			{isAllSchool(selectedDropdownData.schools) ? (
				<Box>
					<Box
						sx={{
							...BaselineAnalyticsStyles.tableBoxSx,
							height: '346px',
							alignItems: 'left',
						}}
					>
						<Typography
							variant={typographyConstants.h5}
							sx={{
								marginLeft: '1rem',
								mt: '1rem',
								fontWeight: '600',
							}}
						>
							{localizationConstants.schoolReadinessComparison}
						</Typography>
						<Box
							sx={{
								maxWidth: `calc(100vw - ${drawerWidth + 56}px)`,
								overflowX: 'auto',
							}}
						>
							<Box
								sx={{
									width: `100%`,
									height: '290px',
								}}
							>
								<Bar
									data={overAllBaselineSchoolsData}
									options={{
										maintainAspectRatio: false,
										layout: {
											padding: {
												left: 10,
												right: 20,
												top: 20,
												bottom: 5,
											},
										},
										plugins: {
											legend: {
												display: false,
											},
											datalabels: {
												display: false,
											},
											tooltip: {
												callbacks: {
													label: function (context) {
														return (
															' Percentage : ' +
															context.parsed.y +
															'%'
														)
													},
													afterLabel: function (
														context,
													) {
														return (
															' Rank  : ' +
															overAllBaselineSchoolsData
																?.datasets[0]
																.rank[
																context.parsed.x
															]
														)
													},
												},

												bodyFont: {
													size: 13,
												},
												titleFont: {
													size: 15,
												},
												bodySpacing: 5,
												titleMarginBottom: 10,
												padding: 10,
											},
										},
										scales: {
											x: {
												grid: {
													display: false,
												},

												ticks: {
													font: {
														weight: 'bold',
													},
													color: 'rgba(0, 0, 0, 1)',
													callback: function (
														value,
														index,
													) {
														const label =
															overAllBaselineSchoolsData
																?.labels[index]
														if (label?.length > 7) {
															const lines = [
																label.slice(
																	0,
																	7,
																),
																label.slice(
																	7,
																	14,
																) + '...',
															]
															return lines
														} else {
															return label
														}
													},
												},
											},
											y: {
												beginAtZero: true,
												grid: {
													display: true,
												},
												ticks: {
													font: {
														weight: 'normal',
													},
													callback: function (
														value,
														index,
														values,
													) {
														return `${value}%`
													},
													stepSize: 25,
													max: 100,
													min: 0,
													values: [
														0, 25, 50, 75, 100,
													],
													suggestedMin: 0,
													suggestedMax: 100,
												},
											},
										},
									}}
								/>
							</Box>
						</Box>
					</Box>
				</Box>
			) : (
				<Box>
					{/* --------------------- KPI Summary Cards with School Name ---------------- */}
					<BaselineKPISummary
						schoolName={
							allBaselineAnalyticsRecords?.domainWisePercentagesOfEachSchool?.schoolName ??
							schoolsList?.find((data) => data?._id === selectedDropdownData?.schools)?.school ??
							''
						}
						analyticsData={{
							...allBaselineAnalyticsRecords,
							studentsScreened: studentsScreened,
							totalStrength: totalStrengthValue,
							rogBreakup: rogBreakupData,
						}}
					/>

					{/* --------------------- Primary Charts Row ---------------- */}
					<Box
						className={flexStyles.flexRowCenterSpaceBetween}
						sx={{ gap: '12px', flexWrap: 'wrap' }}
					>
						{/* --------------------- Doughnut Chart: Students Screened vs Total Strength ---------------- */}
						<Box
							sx={{
								...BaselineAnalyticsStyles.tableBoxSx,
								height: '300px',
								p: '16px',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								flex: 1,
								minWidth: '280px',
							}}
						>
							<Box
								sx={{
									width: '240px',
									height: '220px',
								}}
							>
								<Doughnut
									data={studentsScreenedDoughnutData}
									options={doughnutOptions}
									plugins={[centerTextPlugin]}
								/>
							</Box>
							<Typography
								variant={typographyConstants.body}
								sx={{
									mt: '10px',
									textAlign: 'center',
									color: 'textColors.gray1',
									fontSize: '14px',
								}}
							>
								{localizationConstants.screeningCompletionRate}
							</Typography>
							<Typography
								variant={typographyConstants.caption}
								sx={{
									fontSize: '11px',
									color: 'textColors.gray2',
									fontStyle: 'italic',
									mt: '4px',
								}}
							>
								Click on chart to view students
							</Typography>
						</Box>

						{/* --------------------- Gauge Chart: Developmental Readiness Score ---------------- */}
						<Box
							sx={{
								...BaselineAnalyticsStyles.tableBoxSx,
								height: '300px',
								p: '16px',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								flex: 1,
								minWidth: '280px',
							}}
						>
							<Box
								sx={{
									width: '220px',
									height: '140px',
									position: 'relative',
								}}
							>
								<Doughnut
									data={gaugeData}
									options={gaugeOptions}
								/>
								{/* Percentage overlay */}
								<Typography
									sx={{
										position: 'absolute',
										bottom: '10px',
										left: '50%',
										transform: 'translateX(-50%)',
										fontWeight: 700,
										fontSize: '28px',
										color: scoreValue >= 70 ? '#43A047' : scoreValue >= 50 ? '#FB8C00' : '#E53935',
									}}
								>
									{Math.round(scoreValue)}%
								</Typography>
							</Box>
							<Typography
								variant={typographyConstants.body}
								sx={{
									mt: '16px',
									textAlign: 'center',
									color: 'textColors.gray1',
									fontSize: '14px',
								}}
							>
								{localizationConstants.developmentalReadinessScore}
							</Typography>
							{/* Score indicator legend */}
							<Box sx={{ display: 'flex', gap: '16px', mt: '12px' }}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
									<Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#43A047' }} />
									<Typography sx={{ fontSize: '11px', color: 'textColors.gray2' }}>Good (≥70%)</Typography>
								</Box>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
									<Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FB8C00' }} />
									<Typography sx={{ fontSize: '11px', color: 'textColors.gray2' }}>Moderate</Typography>
								</Box>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
									<Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#E53935' }} />
									<Typography sx={{ fontSize: '11px', color: 'textColors.gray2' }}>Needs Focus</Typography>
								</Box>
							</Box>
						</Box>

						{/* --------------------- Support Levels Pie Chart ---------------- */}
						<Box
							sx={{
								...BaselineAnalyticsStyles.tableBoxSx,
								height: '300px',
								p: '16px',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								flex: 1,
								minWidth: '300px',
							}}
						>
							<Box
								sx={{
									width: '280px',
									height: '220px',
								}}
							>
								<Pie data={rogPieData} options={rogPieOptions} />
							</Box>
							<Typography
								variant={typographyConstants.body}
								sx={{
									mt: '10px',
									textAlign: 'center',
									color: 'textColors.gray1',
									fontSize: '14px',
								}}
							>
								{localizationConstants.studentSupportLevels}
							</Typography>
						</Box>

					</Box>

					{/* --------------------- Domain Rank Cards Row ---------------- */}
					<Box
						sx={{
							...BaselineAnalyticsStyles.tableBoxSx,
							mt: '16px',
							p: '16px 20px',
						}}
					>
						<Typography
							variant={typographyConstants.h5}
							sx={{
								fontSize: '15px',
								fontWeight: 600,
								color: 'textColors.primary',
								mb: '16px',
							}}
						>
							{selectedDropdownData?.sections?.length > 0
								? localizationConstants.classProfile
								: localizationConstants.schoolProfile}
						</Typography>
						<Box
							sx={{
								display: 'flex',
								gap: '12px',
								flexWrap: 'wrap',
							}}
						>
						{(() => {
						// Get percentages for all domains and calculate relative ranks
						const getPercentagesData = () => {
							if (selectedDropdownData?.sections?.length > 0) {
								return allBaselineAnalyticsRecords?.domainWisePercentagesOfEachSections?.percentages
							} else if (selectedDropdownData?.classrooms?.length > 0) {
								return allBaselineAnalyticsRecords?.domainWisePercentagesOfEachClass?.[0]?.percentages
							}
							return allBaselineAnalyticsRecords?.domainWisePercentagesOfEachSchool?.percentages
						}
						const percentagesData = getPercentagesData() || {}

						// Create array of domains with their percentages and sort by percentage descending
						const domainScores = categories.map((cat) => ({
							category: cat,
							percentage: percentagesData[cat]?.percentage ?? 0,
						}))
						const sortedDomains = [...domainScores].sort((a, b) => b.percentage - a.percentage)

						// Assign ranks 1-5 (1 = highest, 5 = lowest)
						const domainRanks = {}
						sortedDomains.forEach((item, index) => {
							domainRanks[item.category] = index + 1
						})

						// Sort categories by rank (1 to 5)
						const sortedCategories = [...categories].sort((a, b) => domainRanks[a] - domainRanks[b])

						return sortedCategories.map((category) => {
							const percentage = percentagesData[category]?.percentage ?? 0
							const rank = domainRanks[category] || 5

							// Get badge styling based on rank (1 = best/highest, 5 = worst/lowest)
							const getBadgeStyle = (r) => {
								if (r === 1) return {
									background: 'linear-gradient(135deg, #43A047 0%, #2E7D32 100%)',
									border: '3px solid #66BB6A',
									boxShadow: '0 4px 12px rgba(67, 160, 71, 0.4)',
								}
								if (r === 2) return {
									background: 'linear-gradient(135deg, #7CB342 0%, #558B2F 100%)',
									border: '3px solid #9CCC65',
									boxShadow: '0 4px 12px rgba(124, 179, 66, 0.4)',
								}
								if (r === 3) return {
									background: 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)',
									border: '3px solid #FFB74D',
									boxShadow: '0 4px 12px rgba(255, 167, 38, 0.4)',
								}
								if (r === 4) return {
									background: 'linear-gradient(135deg, #FF7043 0%, #E64A19 100%)',
									border: '3px solid #FF8A65',
									boxShadow: '0 4px 12px rgba(255, 112, 67, 0.4)',
								}
								return {
									background: 'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
									border: '3px solid #EF5350',
									boxShadow: '0 4px 12px rgba(229, 57, 53, 0.4)',
								}
							}

							const badgeStyle = getBadgeStyle(rank)

							return (
								<Box
									key={category}
									sx={{
										flex: '1 1 150px',
										minWidth: '120px',
										p: '16px',
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										gap: '10px',
										backgroundColor: '#F8FCFF',
										borderRadius: '8px',
									}}
								>
									<Typography
										variant={typographyConstants.body}
										sx={{ fontSize: '14px', color: 'textColors.gray1', fontWeight: 600 }}
									>
										{category}
									</Typography>
									<Box
										sx={{
											width: '52px',
											height: '52px',
											borderRadius: '50%',
											...badgeStyle,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
										}}
									>
										<Typography
											sx={{
												color: 'white',
												fontWeight: 700,
												fontSize: '20px',
												textShadow: '0 1px 2px rgba(0,0,0,0.2)',
											}}
										>
											{rank}
										</Typography>
									</Box>
									<Typography
										variant={typographyConstants.body}
										sx={{ fontSize: '14px', color: 'textColors.primary', fontWeight: 600 }}
									>
										{percentage}%
									</Typography>
								</Box>
							)
						})
						})()}
						</Box>
					</Box>

					{/* ---------- Domain-wise Student Distribution Stacked Bar Chart --------------- */}
					<DomainStackedBarChart
						domainData={allBaselineAnalyticsRecords?.data}
						onSegmentClick={handleSegmentClick}
					/>

					{/* --------------------- Class Heatmap ---------------- */}
					{/* Only show heatmap when school is selected but no specific class/section */}
					{classroomsListForStudents?.length > 0 &&
						selectedDropdownData?.classrooms?.length === 0 &&
						selectedDropdownData?.sections?.length === 0 && (
						<ClassHeatmap
							classData={allBaselineAnalyticsRecords?.domainWisePercentagesOfEachClass}
							allClassrooms={classroomsListForStudents}
							onClassClick={(classInfo) => {
								// Handle class click for drill-down
								if (classInfo.classRoomId) {
									handleBarFilter('classrooms', [classInfo.classRoomId], classInfo.className)
								}
							}}
						/>
					)}

					{/* --------------------- Risk Dashboard Block ---------------- */}
					<RiskDashboardBlock
						filter={{
							schoolIds: selectedDropdownData.schools,
							classroomIds: selectedDropdownData.classrooms,
						}}
						academicYears={selectedAys}
					/>

				</Box>
			)}

			{/*----------------- PDF Dialog  ------------------*/}

			<Dialog open={downloadReportDialogOpen}>
				<Box
					sx={{
						borderRadius: '10px',
						width: '500px',
						height: '200px',
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
									setButtonChange(false)
								}}
							/>
						</Box>
						<Box
							sx={{
								marginTop: '20px',
								textAlign: 'start',
							}}
						>
							<Typography color={'globalElementColors.gray1'}>
								{
									localizationConstants.downloadAnalyticalPDFReportMsg
								}
							</Typography>
						</Box>
						<Box
							sx={{ height: '230px' }}
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

			{/* Students List by Domain Dialog */}
			<StudentsListByDomainDialog
				open={studentsListDialog.open}
				onClose={handleStudentsListDialogClose}
				domain={studentsListDialog.domain}
				supportLevel={studentsListDialog.supportLevel}
				filter={{
					academicYear: selectedAys,
					schoolIds: selectedDropdownData.schools,
					classroomIds: selectedDropdownData.classrooms,
					sections: selectedDropdownData.sections,
				}}
			/>

			{/* Students Screening Status Dialog */}
			<StudentsScreeningStatusDialog
				open={screeningDialog.open}
				onClose={handleScreeningDialogClose}
				screeningStatus={screeningDialog.status}
				filter={{
					academicYear: selectedAys,
					schoolIds: selectedDropdownData.schools,
					classroomIds: selectedDropdownData.classrooms,
				}}
			/>

			{/* Students by Support Level Dialog (from pie chart click) */}
			<StudentsBySupportLevelDialog
				open={supportLevelDialog.open}
				onClose={handleSupportLevelDialogClose}
				supportLevel={supportLevelDialog.level}
				filter={{
					academicYear: selectedAys,
					schoolIds: selectedDropdownData.schools,
					classroomIds: selectedDropdownData.classrooms,
				}}
			/>

			{/* Advanced Filters Dialog */}
			<AdvancedFiltersDialog
				open={advancedFiltersOpen}
				onClose={() => setAdvancedFiltersOpen(false)}
				onApply={(filters) => {
					setAdvancedFilters(filters)
					// Trigger data refresh with new filters
					filterBaselineData(selectedAys)
				}}
				currentFilters={advancedFilters}
			/>
		</Box>
	)
}

export default BaselineAnalytics
