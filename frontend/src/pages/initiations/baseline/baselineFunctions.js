import { requestParams } from '../../../utils/apiConstants'
import { getAllClassroomsForStudents } from '../../../redux/commonSlice'
import {
	addBaselineRecord,
	getBaselineRecords,
	setBaselineFilterClasses,
	setBaselineFilterSchools,
	updateBaselineRecords,
	setBaselineAnalyticsDownloadFilterClasses,
	clearBaselineFilter,
	createMultipleBaselineRecord,
	clearBaselineAnalyticalFilter,
	setBaselineAnalyticalFilterSchools,
	setBaselineAnalyticalFilterClasses,
	setBaselineAnalyticalFilterSections,
	deleteBaselineRecord,
} from './baselineSlice'
import * as XLSX from 'xlsx'
import { classGroup } from './baselineConstants'

export const fetchAllBaselineRecords = (
	dispatch,
	filterData,
	searchText = '',
	page,
	pageSize,
	sortKeys,
	download,
) => {
	const body = {
		filter: {
			academicYear: filterData.selectdAYs ?? [],
			schoolIds: filterData.selectdSchools,
			classroomIds: filterData.selectdClassrooms,
			studentStatus: filterData.studentStatus,
		},
		searchText,
	}
	if (page) {
		body['page'] = page
	}
	if (pageSize) {
		body['pageSize'] = pageSize
	}
	if (sortKeys) {
		body['sortKeys'] = sortKeys
	}
	if (download) {
		return body
	}
	dispatch(getBaselineRecords({ body }))
}

export const updateSchoolsBaseline = (dispatch, schoolIds, filter) => {
	if (schoolIds === 'all') {
		dispatch(clearBaselineFilter())
	} else {
		dispatch(setBaselineFilterSchools(schoolIds))
		dispatch(
			getAllClassroomsForStudents({
				body: {
					filter: {
						schoolIds,
					},
				},
			}),
		)
	}
}

export const updateClassroomsBaseline = (
	dispatch,
	classes,
	setSectionOptions,
	classroomsListForStudents,
) => {
	dispatch(setBaselineFilterClasses(classes))
	const filteredSections = classroomsListForStudents
		.filter((classroom) => classes?.includes(classroom.className))
		.map((classroom) => classroom.section)

	setSectionOptions([...new Set(filteredSections)])
}

export const handleSectionChangeBaseline = (
	event,
	section,
	selectedSections,
	setSelectedSections,
) => {
	const {
		target: { checked },
	} = event

	if (checked) {
		setSelectedSections([...selectedSections, section])
	} else {
		setSelectedSections(selectedSections.filter((item) => item !== section))
	}
}

export const updateSchoolsBaselineAnalytical = (
	dispatch,
	schoolIds,
	academicYear,
) => {
	if (schoolIds === 'all') {
		dispatch(clearBaselineAnalyticalFilter())
	} else {
		dispatch(setBaselineAnalyticalFilterSchools(schoolIds))
		if (schoolIds?.length > 0) {
			dispatch(
				getAllClassroomsForStudents({
					body: {
						filter: {
							schoolIds,
							academicYear,
						},
					},
				}),
			)
		}
	}
}

export const updateClassroomsBaselineAnalytical = (
	dispatch,
	schoolIds,
	classes,
	filter,
) => {
	dispatch(setBaselineAnalyticalFilterClasses(classes))
}

export const handleApplySectionFilterBaseline = async (
	dispatch,
	setFilterBaselineSectionDrawer,
	filterFields,
	studentStatus,
) => {
	const body = {
		[requestParams.filter]: {
			[requestParams.className]: filterFields.classes,
			[requestParams.section]: filterFields.sections,
			[requestParams.schoolIds]: filterFields.schools,
			[requestParams.studentStatus]: studentStatus,
		},
		[requestParams.sortKeys]: [
			{
				[requestParams.key]: 'studentName',

				[requestParams.value]: 1,
			},
		],
	}

	const response = dispatch(getBaselineRecords({ body }))
	if (!response?.error) {
		setFilterBaselineSectionDrawer(false)
	}
}

export const getBackgroundColor = (total, light) => {
	let color
	if (total > 5) {
		color = light
			? 'globalElementColors.lightGreen'
			: 'globalElementColors.green2'
	} else if (total > 3 && total <= 5) {
		color = light
			? 'globalElementColors.lightYellow'
			: 'globalElementColors.yellow'
	} else {
		color = light
			? 'globalElementColors.lightRed'
			: 'globalElementColors.red'
	}
	return color
}

export const handleEditBaseline = async (
	selectedData,
	dispatch,
	category,
	rowId,
	count,
	setBaselineDrawerOpen,
	pageSize,
	refreshList,
) => {
	const body = {
		[requestParams.id]: rowId,
		[category]: {
			data: selectedData,
			total: count.toString(),
		},
	}
	const res = await dispatch(updateBaselineRecords({ body }))

	if (!res?.error) {
		setBaselineDrawerOpen(false)
		refreshList()
	}
}

export const handleDeleteBaselineRecord = async (
	dispatch,
	deleteId,
	setDeleteStudentDialog,
) => {
	const body = {
		id: deleteId,
	}
	const res = await dispatch(deleteBaselineRecord({ body }))

	if (!res.error) {
		setDeleteStudentDialog(false)
		return true
	}
	return false
}

export const handleAddBaselineRecord = async (
	dispatch,
	baselineFormData,
	student,
	selectedDropdownData,
	fetchList,
	barFilterData,
	handleClose,
) => {
	const body = {
		studentData: {
			user_id: student.user_id,
			studentName: student.studentName,
			baselineForm: selectedDropdownData?.baselineFrom,
			baselineCategory: selectedDropdownData?.baselineCategory,
			...baselineFormData,
		},
		academicYear: barFilterData.selectdAYs,
		school: student.school,
	}
	const res = await dispatch(addBaselineRecord({ body }))

	if (!res?.error) {
		fetchList()
		handleClose()

		return true
	}
	return false
}

export const handleFilterOptions = (
	classrooms,
	sections,
	students,
	setSelectedDropdownData,
) => {
	const obj = {}
	if (classrooms) obj['classrooms'] = []
	if (sections) obj['sections'] = []
	if (students) obj['students'] = []
	setSelectedDropdownData((state) => ({ ...state, ...obj }))
}

export const handleSectionChangeBaselineAnalytics = (
	dispatch,
	setBaselineFilterSections,
	sections,
) => {
	dispatch(setBaselineAnalyticalFilterSections(sections))
}

// export const combineAndMapData = (searchData, selectData) => {
// 	let combinedData = []
// 	if (searchData) {
// 		combinedData = combinedData.concat(searchData)
// 	}
// 	if (selectData) {
// 		combinedData = combinedData.concat(selectData)
// 	}
// 	return combinedData.map((dt) => ({
// 		val: dt?._id,
// 		label: dt?.studentName,
// 	}))
// }

export const updateClassesBaselineAnalyticsDownload = (dispatch, classes) => {
	dispatch(setBaselineAnalyticsDownloadFilterClasses(classes))
}

export const options = (maxVal) => ({
	maintainAspectRatio: false,
	plugins: {
		legend: {
			display: false,
		},
		datalabels: {
			display: false,
		},
		tooltip: {
			bodyFont: {
				size: 13,
			},
			titleFont: {
				size: 15,
				weight: 600,
			},
			bodySpacing: 5,
			titleMarginBottom: 5,
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
			},
			suggestedMin: 0,
			suggestedMax: maxVal < 10 ? 10 : maxVal,
		},
	},
})

export const DomainWisePSchool = (allBaselineAnalyticsRecords) => {
	const isArray = Array.isArray(
		allBaselineAnalyticsRecords.domainWisePercentagesOfEachSchool,
	)
	return {
		labels:
			(isArray &&
				allBaselineAnalyticsRecords.domainWisePercentagesOfEachSchool?.map(
					(record) => record.schoolName,
				)) ||
			[],
		datasets: [
			{
				label: 'Physical',
				data:
					(isArray &&
						allBaselineAnalyticsRecords.domainWisePercentagesOfEachSchool?.map(
							(record) => record.percentages.Physical.percentage,
						)) ||
					[],
				rank:
					isArray &&
					allBaselineAnalyticsRecords.domainWisePercentagesOfEachSchool?.map(
						(record) => record.percentages.Physical.rank,
					),
				backgroundColor: '#025ABD',
				borderWidth: 0,
				borderRadius: 2,
				barPercentage: 0.5,
				categoryPercentage:
					isArray &&
					allBaselineAnalyticsRecords
						.domainWisePercentagesOfEachSchool?.length > 7
						? 0.9
						: 0.7,
			},
			{
				label: 'Social',
				data:
					(isArray &&
						allBaselineAnalyticsRecords.domainWisePercentagesOfEachSchool?.map(
							(record) => record.percentages.Social.percentage,
						)) ||
					[],
				rank:
					isArray &&
					allBaselineAnalyticsRecords.domainWisePercentagesOfEachSchool?.map(
						(record) => record.percentages.Social.rank,
					),
				backgroundColor: '#DD2A2B',
				borderWidth: 0,
				borderRadius: 2,
				barPercentage: 0.5,
				categoryPercentage:
					isArray &&
					allBaselineAnalyticsRecords
						.domainWisePercentagesOfEachSchool?.length > 7
						? 0.9
						: 0.7,
			},
			{
				label: 'Emotional',
				data:
					(isArray &&
						allBaselineAnalyticsRecords.domainWisePercentagesOfEachSchool?.map(
							(record) => record.percentages.Emotional.percentage,
						)) ||
					[],
				rank:
					isArray &&
					allBaselineAnalyticsRecords.domainWisePercentagesOfEachSchool?.map(
						(record) => record.percentages.Emotional.rank,
					),
				backgroundColor: '#F8A70D',
				borderWidth: 0,
				borderRadius: 2,
				barPercentage: 0.5,
				categoryPercentage:
					isArray &&
					allBaselineAnalyticsRecords
						.domainWisePercentagesOfEachSchool?.length > 7
						? 0.9
						: 0.7,
			},
			{
				label: 'Cognitive',
				data:
					(isArray &&
						allBaselineAnalyticsRecords.domainWisePercentagesOfEachSchool?.map(
							(record) => record.percentages.Cognitive.percentage,
						)) ||
					[],
				rank:
					isArray &&
					allBaselineAnalyticsRecords.domainWisePercentagesOfEachSchool?.map(
						(record) => record.percentages.Cognitive.rank,
					),
				backgroundColor: '#25C548',
				borderWidth: 0,
				borderRadius: 2,
				barPercentage: 0.5,
				categoryPercentage:
					isArray &&
					allBaselineAnalyticsRecords
						.domainWisePercentagesOfEachSchool?.length > 7
						? 0.9
						: 0.7,
			},
			{
				label: 'Language',
				data:
					(isArray &&
						allBaselineAnalyticsRecords.domainWisePercentagesOfEachSchool?.map(
							(record) => record.percentages.Language.percentage,
						)) ||
					[],
				rank:
					isArray &&
					allBaselineAnalyticsRecords.domainWisePercentagesOfEachSchool?.map(
						(record) => record.percentages.Language.rank,
					),
				backgroundColor: '#F5890D',
				borderWidth: 0,
				borderRadius: 2,
				barPercentage: 0.5,
				categoryPercentage:
					isArray &&
					allBaselineAnalyticsRecords
						.domainWisePercentagesOfEachSchool?.length > 7
						? 0.9
						: 0.7,
			},
		],
	}
}

export const overAllBaselineSchool = (allBaselineAnalyticsRecords) => ({
	labels:
		(Array.isArray(
			allBaselineAnalyticsRecords.domainWisePercentagesOfEachSchool,
		) &&
			allBaselineAnalyticsRecords.domainWisePercentagesOfEachSchool?.map(
				(record) => record.schoolName,
			)) ||
		[],
	datasets: [
		{
			data:
				(Array.isArray(
					allBaselineAnalyticsRecords.domainWisePercentagesOfEachSchool,
				) &&
					allBaselineAnalyticsRecords.domainWisePercentagesOfEachSchool?.map(
						(record) => record.overallPercentageofSchools,
					)) ||
				[],
			rank:
				Array.isArray(
					allBaselineAnalyticsRecords.domainWisePercentagesOfEachSchool,
				) &&
				allBaselineAnalyticsRecords.domainWisePercentagesOfEachSchool?.map(
					(record) => record.rank,
				),
			backgroundColor: '#025ABD',
			borderWidth: 0,
			barThickness:
				Array.isArray(
					allBaselineAnalyticsRecords.domainWisePercentagesOfEachSchool,
				) &&
				allBaselineAnalyticsRecords.domainWisePercentagesOfEachSchool
					?.length <= 6
					? 40
					: null,
			borderRadius: 7,
			barPercentage: 0.5,
			categoryPercentage: 0.9,
		},
	],
})

export const DomainWisePClass = (allBaselineAnalyticsRecord, selectedSec) => {
	var combinedData =
		selectedSec?.length > 0
			? selectedSec.map((recordName) => {
					const record = allBaselineAnalyticsRecord?.find(
						(record) => record?.className === recordName,
					)
					if (record) {
						return {
							clsName: recordName,
							Pdata:
								record?.percentages['Physical']?.percentage ||
								0,
							Prank: record?.percentages['Physical']?.rank || 0,
							Sdata:
								record?.percentages['Social']?.percentage || 0,
							Srank: record?.percentages['Social']?.rank || 0,
							Cdata:
								record?.percentages['Cognitive']?.percentage ||
								0,
							Crank: record?.percentages['Cognitive']?.rank || 0,
							Edata:
								record?.percentages['Emotional']?.percentage ||
								0,
							Erank: record?.percentages['Emotional']?.rank || 0,
							Ldata:
								record?.percentages['Language']?.percentage ||
								0,
							Lrank: record?.percentages['Language']?.rank || 0,
						}
					} else {
						return {
							clsName: recordName,
							Pdata: 0,
							Prank: 0,
							Sdata: 0,
							Srank: 0,
							Cdata: 0,
							Crank: 0,
							Edata: 0,
							Erank: 0,
							Ldata: 0,
							Lrank: 0,
						}
					}
				})
			: []

	combinedData.sort((a, b) => parseFloat(a.clsName) - parseFloat(b.clsName))
	return {
		labels: combinedData.map((record) => record.clsName),
		datasets: [
			{
				label: 'Physical',
				data: combinedData.map((record) => record.Pdata),
				rank: combinedData.map((record) => record.Prank),
				backgroundColor: '#025ABD',
				borderWidth: 0,
				borderRadius: 2,
				barPercentage: 0.5,
			},
			{
				label: 'Social',
				data: combinedData.map((record) => record.Sdata),
				rank: combinedData.map((record) => record.Srank),
				backgroundColor: '#DD2A2B',
				borderWidth: 0,
				borderRadius: 2,
				barPercentage: 0.5,
			},
			{
				label: 'Emotional',
				data: combinedData.map((record) => record.Edata),
				rank: combinedData.map((record) => record.Erank),
				backgroundColor: '#F8A70D',
				borderWidth: 0,
				borderRadius: 2,
				barPercentage: 0.5,
			},
			{
				label: 'Cognitive',
				data: combinedData.map((record) => record.Cdata),
				rank: combinedData.map((record) => record.Crank),
				backgroundColor: '#25C548',
				borderWidth: 0,
				borderRadius: 2,
				barPercentage: 0.5,
			},
			{
				label: 'Language',
				data: combinedData.map((record) => record.Ldata),
				rank: combinedData.map((record) => record.Lrank),
				backgroundColor: '#F5890D',
				borderWidth: 0,
				borderRadius: 2,
				barPercentage: 0.5,
			},
		],
	}
}

export const DomainWisePSection = (allBaselineAnalyticsRecord, selectedSec) => {
	var combinedData =
		selectedSec?.length > 0
			? selectedSec.map((recordName) => {
					const record = allBaselineAnalyticsRecord.find(
						(record) => record?.section === recordName,
					)
					if (record) {
						return {
							clsName: recordName,
							Pdata:
								record?.percentages['Physical']?.percentage ||
								0,
							Prank: record?.percentages['Physical']?.rank || 0,
							Sdata:
								record?.percentages['Social']?.percentage || 0,
							Srank: record?.percentages['Social']?.rank || 0,
							Cdata:
								record?.percentages['Cognitive']?.percentage ||
								0,
							Crank: record?.percentages['Cognitive']?.rank || 0,
							Edata:
								record?.percentages['Emotional']?.percentage ||
								0,
							Erank: record?.percentages['Emotional']?.rank || 0,
							Ldata:
								record?.percentages['Language']?.percentage ||
								0,
							Lrank: record?.percentages['Language']?.rank || 0,
						}
					} else {
						return {
							clsName: recordName,
							Pdata: 0,
							Prank: 0,
							Sdata: 0,
							Srank: 0,
							Cdata: 0,
							Crank: 0,
							Edata: 0,
							Erank: 0,
							Ldata: 0,
							Lrank: 0,
						}
					}
				})
			: []

	combinedData.sort((a, b) => a?.clsName?.localeCompare(b.clsName))
	return {
		labels: combinedData.map((record) => record.clsName),
		datasets: [
			{
				label: 'Physical',
				data: combinedData.map((record) => record.Pdata),
				rank: combinedData.map((record) => record.Prank),
				backgroundColor: '#025ABD',
				borderWidth: 0,
				borderRadius: 2,
				barPercentage: 0.5,
			},
			{
				label: 'Social',
				data: combinedData.map((record) => record.Sdata),
				rank: combinedData.map((record) => record.Srank),
				backgroundColor: '#DD2A2B',
				borderWidth: 0,
				borderRadius: 2,
				barPercentage: 0.5,
			},
			{
				label: 'Emotional',
				data: combinedData.map((record) => record.Edata),
				rank: combinedData.map((record) => record.Erank),
				backgroundColor: '#F8A70D',
				borderWidth: 0,
				borderRadius: 2,
				barPercentage: 0.5,
			},
			{
				label: 'Cognitive',
				data: combinedData.map((record) => record.Cdata),
				rank: combinedData.map((record) => record.Crank),
				backgroundColor: '#25C548',
				borderWidth: 0,
				borderRadius: 2,
				barPercentage: 0.5,
			},
			{
				label: 'Language',
				data: combinedData.map((record) => record.Ldata),
				rank: combinedData.map((record) => record.Lrank),
				backgroundColor: '#F5890D',
				borderWidth: 0,
				borderRadius: 2,
				barPercentage: 0.5,
			},
		],
	}
}

export const handleSelectDropDown = (
	option,
	handleModal,
	setSelectedDropDown,
) => {
	if (option == 'addStudent') {
		handleModal('add', true)
		setSelectedDropDown(option)
	} else if (option == 'bulkUpload') {
		handleModal('upload', true)
		setSelectedDropDown(option)
	}
}

export const UploadMultipleBaselineData = async (
	dispatch,
	TableData,
	handleModal,
	setInputFileObject,
	setSelectedDropDown,
	setDeleteBulkDialog,
	setResponse,
	selectedAy,
	schoolId,
	listFilterData,
) => {
	const questions = ['1', '2', '3', '4', '5', '6', '7']
	const students = []

	for (const data of TableData) {
		const Physical = {
			data: [],
			total: 0,
		}
		const Social = {
			data: [],
			total: 0,
		}
		const Emotional = {
			data: [],
			total: 0,
		}
		const Cognitive = {
			data: [],
			total: 0,
		}
		const Language = {
			data: [],
			total: 0,
		}

		let clGrp = ''
		if (data['Class Group']) {
			const groupMap = {
				'preschool & lower kg': classGroup['0'],
				'upper kg & grade 1': classGroup['1'],
				'grade 2 & 3': classGroup['2'],
				'grade 4 & 5': classGroup['4'],
				'grade 6 & 7': classGroup['6'],
				'grade 8 & 9': classGroup['8'],
				'grade 10-12': classGroup['10'],
			}

			const key = data['Class Group'].toLowerCase().trim()
			clGrp = groupMap[key] || null // default to null (or whatever fallback you want)
		}

		for (let key in data) {
			if (key.toLowerCase().includes('physical')) {
				if (key.toLowerCase() === 'physical total') {
					// Physical.total = data[key];
				} else {
					questions.forEach((qn) => {
						if (key.includes(qn)) {
							Physical.data.push({
								status: data[key] === '1',
								question: `${clGrp}PhysicalQn${qn}`,
							})

							if (data[key] === '1') {
								Physical.total += 1
							}
						}
					})
				}
			} else if (key.toLowerCase().includes('social')) {
				if (key.toLowerCase() === 'social total') {
					// Social.total = data[key];
				} else {
					questions.forEach((qn) => {
						if (key.includes(qn)) {
							Social.data.push({
								status: data[key] === '1',
								question: `${clGrp}SocialQn${qn}`,
							})
							if (data[key] === '1') {
								Social.total += 1
							}
						}
					})
				}
			} else if (key.toLowerCase().includes('emotional')) {
				if (key.toLowerCase() === 'emotional total') {
					// Emotional.total = data[key];
				} else {
					questions.forEach((qn) => {
						if (key.includes(qn)) {
							Emotional.data.push({
								status: data[key] === '1',
								question: `${clGrp}EmotionalQn${qn}`,
							})
							if (data[key] === '1') {
								Emotional.total += 1
							}
						}
					})
				}
			} else if (key.toLowerCase().includes('cognitive')) {
				if (key.toLowerCase() === 'cognitive total') {
					// Cognitive.total = data[key];
				} else {
					questions.forEach((qn) => {
						if (key.includes(qn)) {
							Cognitive.data.push({
								status: data[key] === '1',
								question: `${clGrp}CognitiveQn${qn}`,
							})
							if (data[key] === '1') {
								Cognitive.total += 1
							}
						}
					})
				}
			} else if (key.toLowerCase().includes('language')) {
				if (key.toLowerCase() === 'language total') {
					Language.total = data[key]
				} else {
					questions.forEach((qn) => {
						if (key.includes(qn)) {
							Language.data.push({
								status: data[key] === '1',
								question: `${clGrp}LanguageQn${qn}`,
							})
							if (data[key] === '1') {
								Language.total += 1
							}
						}
					})
				}
			}
		}

		const data2 = {
			Physical,
			Social,
			Emotional,
			Cognitive,
			Language,
			user_id: data['Student Id'],
			School: data['School Code'],
			studentName: data['Student Name'],
			baselineForm: clGrp,
			baselineCategory: data['Baseline Category'],
		}

		students.push(data2)
	}

	const body = {
		students: students,
		academicYear: selectedAy,
		school: schoolId,
	}
	const res = await dispatch(createMultipleBaselineRecord({ body }))
	setResponse(res)
	if (res?.payload?.fileContainsError) {
		setDeleteBulkDialog(true)
	}

	if (!res.error) {
		setInputFileObject({
			fileName: '',
			file: '',
			fileUrl: '',
			extensionError: false,
		})
		handleModal('upload', false)
		setSelectedDropDown('')
	}

	if (!res?.payload?.fileContainsError && !res.error) {
		const { filterData, searchText, currentPage, rowsPerPage, sortKeys } =
			listFilterData
		fetchAllBaselineRecords(
			dispatch,
			filterData,
			searchText,
			currentPage,
			rowsPerPage,
			sortKeys,
		)
	}
}

export const ErrorMsgsExcelDownload = (
	response,
	setDeleteBulkDialog,
	fileName,
) => {
	const validationErrors = response?.payload?.validationErrors || []
	const existingStudentIds = response?.payload?.existingStudentIds || []

	if (validationErrors.length > 0 || existingStudentIds.length > 0) {
		let data

		if (validationErrors.length > 0) {
			data = [
				['Validation Errors'],
				...validationErrors.map((id) => [id]),
			]
		} else if (existingStudentIds.length > 0) {
			data = [
				['Existing Student IDs'],
				...existingStudentIds.map((id) => [id]),
			]
		}

		const worksheet = XLSX.utils.aoa_to_sheet(data)
		const wscols = [{ wch: 50 }, { wch: 50 }, { wch: 50 }]
		worksheet['!cols'] = wscols

		const workbook = XLSX.utils.book_new()
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
		XLSX.writeFile(workbook, fileName)
		setDeleteBulkDialog(false)
	}
}
