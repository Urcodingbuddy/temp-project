import { getAllClassroomsForStudents } from '../../../redux/commonSlice'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { routePaths } from '../../../routes/routeConstants'
import { requestParams } from '../../../utils/apiConstants'
import { viewAllStudents } from '../../academic/students/studentsSlice'
import { categoriesNames, checklistOptions } from './sendCheckListConstants'
import {
	addSendChecklist,
	clearGrade_4_Marks,
	clearGrade_9_Marks,
	getSendChecklistData,
	sendChecklistBUlkUpload,
	setGrade_4_Marks,
	setGrade_9_Marks,
	setRecallSendChecklistAPI,
	updateSendChecklist,
} from './sendChecklistslice'
import * as XLSX from 'xlsx'

export const fetchAllSendChecklist = (
	dispatch,
	filterData,
	searchText = '',
	page,
	pageSize,
	checklistForm,
	sortKeys,
	download,
) => {
	const body = {
		filter: {
			academicYear: filterData.selectdAYs ?? [],
			schoolIds: filterData.selectdSchools,
			classroomIds: filterData.selectdClassrooms,
			studentStatus: filterData.studentStatus,
			checklistForm,
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
	dispatch(getSendChecklistData({ body }))
}

export const getBackgroundColor = (score, total, light) => {
	const percentage = (score / total) * 100
	let color
	if (percentage > 75) {
		color = light
			? 'globalElementColors.lightRed'
			: 'globalElementColors.red'
	} else if (percentage > 50) {
		color = light
			? 'globalElementColors.lightYellow'
			: 'globalElementColors.yellow'
	} else {
		color = light
			? 'globalElementColors.lightGreen'
			: 'globalElementColors.green2'
	}
	return color
}

export const handleFilterOptions = (
	classrooms,
	sections,
	checklist,
	setSelectedDropdownData,
) => {
	const obj = {}
	if (classrooms) obj['classrooms'] = []
	if (sections) obj['sections'] = []
	if (checklist) obj['checklist'] = ['Upper KG - Grade 4']
	setSelectedDropdownData((state) => ({ ...state, ...obj }))
}

export const handleInputsInitiations = (
	e,
	setInputs,
	inputs,
	dispatch,
	classroomsListForStudents,
	setSectionOptions,
) => {
	const { name, value } = e.target
	const obj = {}
	obj[name] = value
	const inputstate = { ...inputs, ...obj }
	setInputs(inputstate)
	if (name === 'schools') {
		if (value.length !== 0) {
			dispatch(
				getAllClassroomsForStudents({
					body: {
						filter: {
							schoolIds: value,
						},
					},
				}),
			)
		}
	} else if (name === 'classrooms') {
		const filteredSections = classroomsListForStudents
			.filter((classroom) => value?.includes(classroom.className))
			.map((classroom) => classroom.section)

		setSectionOptions([...new Set(filteredSections)])
	}
}

// Function to generate random integer within a specified range
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

// Array to hold generated records
export const records = []

// Define the structure of each record
const baseRecord = {
	_id: '',
	studentName: '',
	attention: 0,
	cognitive: 0,
	memory: 0,
	motor: 0,
	social: 0,
}

// Generate 20 records
for (let i = 0; i < 20; i++) {
	// Clone the base record to start with a clean slate
	const newRecord = { ...baseRecord }

	// Assign values to the fields
	newRecord._id = `HD${getRandomInt(1000, 9999)}` // Example ID generation
	newRecord.studentName = `Student${i + 1}` // Example student name
	newRecord.attention = getRandomInt(1, 10)
	newRecord.cognitive = getRandomInt(1, 10)
	newRecord.memory = getRandomInt(1, 10)
	newRecord.motor = getRandomInt(1, 10)
	newRecord.social = getRandomInt(1, 10)
	newRecord.behavior = getRandomInt(1, 10)

	// Push the newly created record into the array
	records.push(newRecord)
}

export const handleFilter = (
	classrooms,
	sections,
	students,
	checklist,
	setSelectedDropdownData,
) => {
	const obj = {}
	if (classrooms) obj['classrooms'] = []
	if (sections) obj['sections'] = []
	if (students) obj['students'] = []
	if (checklist) obj['checklist'] = []
	setSelectedDropdownData((state) => ({ ...state, ...obj }))
}

export const getSelectStudent = async (
	dispatch,
	filter,
	searchText,
	setStSelectData,
	select,
) => {
	let body
	if (select) {
		const { schoolIds, className, section } = filter
		body = {
			[requestParams.filter]: {
				schoolIds,
				className,
				section,
			},
		}
	} else {
		body = {
			[requestParams.searchText]: searchText,
		}
	}

	const response = await dispatch(viewAllStudents({ body }))
	if (!response?.error) {
		setStSelectData(response?.payload?.data)
	}
}

export const handleOptionChange = (
	index,
	option,
	mainTitle,
	subQuestions,
	subTitle,
	isGrade_9,
	Grade_4_Marks,
	dispatch,
	Grade_9_Marks,
) => {
	if (!isGrade_9) {
		const data = Grade_4_Marks[mainTitle]
		const newScores = [...data]

		newScores[index] = {
			question: index + 1,
			answer: option,
		}

		dispatch(setGrade_4_Marks({ ...Grade_4_Marks, [mainTitle]: newScores }))
	} else {
		if (!subQuestions) {
			const data = Grade_9_Marks[mainTitle] ?? []
			const newScores = [...data]

			newScores[index] = {
				question: index + 1,
				answer: option,
			}

			dispatch(
				setGrade_9_Marks({ ...Grade_9_Marks, [mainTitle]: newScores }),
			)
		} else {
			let data = Grade_9_Marks[mainTitle] ?? {}
			const subScore = data[subTitle] ?? []
			const newScores = [...subScore]

			newScores[index] = {
				question: index + 1,
				answer: option,
			}

			data = { ...data, [subTitle]: newScores }
			dispatch(setGrade_9_Marks({ ...Grade_9_Marks, [mainTitle]: data }))
		}
	}
}

export const handleRowDataOnSelect = (
	value,
	listData,
	selectedDropdownData,
	setSelectedDropdownData,
	dispatch,
	search,
	setStudentOptions,
) => {
	const data = listData?.find((stSel) => stSel?._id === value[0])

	if (data) {
		if (search) {
			handleInputsInitiations(
				{ target: { value: [data?.school?._id], name: 'schools' } },
				setSelectedDropdownData,
				selectedDropdownData,
				dispatch,
				[data?.school?._id],
			)

			handleInputsInitiations(
				{ target: { value: [data?.className], name: 'classrooms' } },
				setSelectedDropdownData,
				selectedDropdownData,
				dispatch,
				[data?.school?._id],
				[data?.className],
			)

			handleInputsInitiations(
				{ target: { value: [data?.section], name: 'sections' } },
				setSelectedDropdownData,
				selectedDropdownData,
			)

			// handleInputsInitiations(
			// 	{ target: { value: [data?._id], name: 'students' } },
			// 	setSelectedDropdownData,
			// 	selectedDropdownData
			// )

			getSelectStudent(
				dispatch,
				{
					schoolIds: [data?.school?._id],
					className: [data?.className],
					section: [data?.section],
				},
				'',
				setStudentOptions,
			)

			setSelectedDropdownData((state) => ({
				...state,
				schools: [data?.school?._id],
				classrooms: [data?.className],
				sections: [data?.section],
				students: [data?._id],
			}))
		}
	}
}

export const ChartOptions = (data, isper) => {
	return {
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
						lineHeight: 1.3,
						size: '12px',
					},
					color: '#313131',
					callback: function (value, index) {
						const label = data?.labels[index]
						if (label?.length > 20) {
							const lines = isper
								? label ===
									localizationConstants.attentionHyperactivity
									? [label.slice(0, 14), label.slice(14)]
									: [label.slice(0, 15), label.slice(15)]
								: [
										label.slice(0, 10),
										label.slice(10, 20) + '...',
									]
							return lines
						} else if (label?.length > 10) {
							const lines =
								label === localizationConstants.socialSkills
									? label
									: [label.slice(0, 10), label.slice(10)]
							return lines
						} else {
							return label
						}
					},
				},
			},
			y: {
				grid: {
					display: true,
				},

				ticks: {
					callback: function (value, index, values) {
						return !isper ? value + ' %' : value
					},
					font: {
						weight: 400,
						size: '14px',
					},
					color: !isper ? 'black' : '#1C1C1C66',
				},
				stepSize: 100,
				suggestedMin: 0,
				beginAtZero: true,
			},
		},
	}
}

export const updateChecklist = async (
	questionListData,
	user_id,
	dispatch,
	setOpen,
	setIsEditBtnClicked,
	sendCheckListCategory,
	refreshList,
) => {
	let body = {
		id: user_id,
	}
	if (questionListData?.subQuestions?.length > 0) {
		const subData = questionListData?.subQuestions?.map((data) => ({
			subCategory: categoriesNames[data?.localKey ?? ''],
			Questions: data?.selection ?? [],
			score: parseInt(data?.total) ?? 0,
		}))
		body = {
			...body,
			category: categoriesNames[questionListData?.localKey ?? ''],
			score: parseInt(questionListData?.total) ?? 0,
			subCategories: subData ?? [],
			sendCheckListCategory: sendCheckListCategory,
		}
	} else {
		body = {
			...body,
			Questions: questionListData?.selection ?? [],
			category: categoriesNames[questionListData?.localKey ?? ''],
			score: parseInt(questionListData?.total) ?? 0,
			sendCheckListCategory: sendCheckListCategory,
		}
	}
	const res = await dispatch(updateSendChecklist({ body }))
	if (!res.error) {
		dispatch(setRecallSendChecklistAPI(true))
		setOpen(false)
		setIsEditBtnClicked(false)
		dispatch(clearGrade_4_Marks())
		dispatch(clearGrade_9_Marks())
		refreshList()
	}
}

export const handleAddChecklist = async (
	userId,
	checklist,
	data,
	dispatch,
	barFilterData,
	refreshList,
	handleClose,
) => {
	const categories = Object.keys(data).map((dataKey) => {
		const categoryData = data[dataKey]
		let localCat = {
			categoryName: categoriesNames?.[categoryData.localKey || ''],
			score: parseInt(categoryData?.total) || 0,
		}

		if (categoryData.subQuestions?.length > 0) {
			const subData = categoryData?.subQuestions?.map((sub) => ({
				subCategoryName: categoriesNames[sub.localKey || ''],
				questions: sub?.selection || [],
				score: parseInt(sub?.total) || 0,
			}))
			localCat.subCategories = subData
		} else {
			localCat.questions = categoryData?.selection || []
		}

		return localCat
	})
	const body = {
		studentData: {
			user_id: userId,
			checklistForm: Array.isArray(checklist) ? checklist[0] : checklist,
			categories,
		},
		academicYear: barFilterData.selectdAYs,
		school: barFilterData.selectdSchools,
	}

	const res = await dispatch(addSendChecklist({ body }))

	if (!res.error) {
		refreshList()
		handleClose()
	}
}

export const uploadSendChecklistData = async (
	dispatch,
	excelTableData,
	handleModal,
	setInputFileObject,
	setDeleteBulkDialog,
	setResponse,
	HeadersData,
	subHeadersData,
	selectedAy,
	schoolIds,
	refreshList,
) => {
	const studentsData = excelTableData?.map((data) => {
		const categories = []
		let questions = []
		let subquestions = []
		let categoryName = ''
		let subCategoryName = ''
		let questionCount = 0
		Object.keys(data)?.forEach((key) => {
			if (key !== 'Student ID' && key !== 'checklistForm') {
				if (
					subHeadersData?.includes(key) &&
					data['checklistForm']?.trim() ===
						checklistOptions?.[1]?.trim()
				) {
					if (subCategoryName?.length > 0 && questions?.length > 0) {
						subquestions?.push({
							subCategoryName: subCategoryName,
							questions: questions,
						})
						subCategoryName = ''
						questionCount = 0
					}
					questions = []
					questionCount = 0
					subCategoryName = key
				} else if (HeadersData?.includes(key)) {
					if (subCategoryName?.length > 0 && questions?.length > 0) {
						subquestions?.push({
							subCategoryName: subCategoryName,
							questions: questions,
						})
						questions = []
					}
					if (categoryName?.length > 0 && questions?.length > 0) {
						categories?.push({
							categoryName: categoryName,
							questions: questions,
						})
					} else if (
						categoryName?.length > 0 &&
						subquestions?.length > 0
					) {
						categories?.push({
							categoryName: categoryName,
							subCategories: subquestions,
						})
						subquestions = []
					}
					categoryName = ''
					questions = []
					questionCount = 0
					categoryName = key
					subCategoryName = ''
				} else {
					questions.push({
						question: questionCount + 1,
						answer: data[key]?.toLowerCase()?.trim(),
					})
					++questionCount
				}
			}
		})

		if (subCategoryName?.length > 0 && questions?.length > 0) {
			subquestions?.push({
				subCategoryName: subCategoryName,
				questions: questions,
			})
			questions = []
		}
		if (categoryName?.length > 0 && questions?.length > 0) {
			categories?.push({
				categoryName: categoryName,
				questions: questions,
			})
			questions = []
		} else if (categoryName?.length > 0 && subquestions?.length > 0) {
			categories?.push({
				categoryName: categoryName,
				subCategories: subquestions,
			})
			subquestions = []
		}
		categoryName = ''
		questionCount = 0
		subCategoryName = ''
		return {
			user_id: data['Student ID']?.trim(),
			checklistForm: data['checklistForm']?.trim(),
			categories: categories,
		}
	})
	const body = {
		academicYear: selectedAy,
		school: schoolIds,
		students: studentsData,
	}
	dispatch(sendChecklistBUlkUpload({ body })).then((res) => {
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
			refreshList()
		}
	})
}

export const downloadExcelForChecklist = (
	response,
	fileName,
	setDeleteBulkDialog,
) => {
	// Function to create a styled worksheet from data
	const createWorksheet = (data) => {
		const worksheetData = []

		worksheetData.push(['Validation Errors'])
		if (data?.length > 0) {
			data.forEach((question) => {
				worksheetData.push([question])
			})
		} else {
			worksheetData.push(['No Errors'])
		}
		const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

		// Set column widths
		const wscols = [{ wch: 50 }]
		worksheet['!cols'] = wscols

		return worksheet
	}

	const grade5Worksheet = createWorksheet(
		response?.payload?.validationErrors?.upperKGToGrade4Error || [],
	)
	const grade9Worksheet = createWorksheet(
		response?.payload?.validationErrors?.grade5ToGrade9Error || [],
	)
	const workbook = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(workbook, grade5Worksheet, 'KG II - GRADE IV')
	XLSX.utils.book_append_sheet(
		workbook,
		grade9Worksheet,
		'GRADE V - GRADE XII',
	)

	XLSX.writeFile(workbook, fileName)
	setDeleteBulkDialog(false)
}
