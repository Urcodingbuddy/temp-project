import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { apiEndPoints } from './apiConstants'
const CryptoJS = require('crypto-js')

const userSecretKey = process.env.REACT_APP_USERLOCALSTORAGE

export const history = {
	navigate: null,
	location: null,
}

export const changeRoute = (path, state) => {
	history.navigate(path, { state: { ...state, isNavigated: true } })
}

export const encryptData = (data) => {
	try {
		const encryptedData = CryptoJS.AES.encrypt(
			JSON.stringify(data),
			userSecretKey,
		).toString()
		return encryptedData
	} catch (error) {
		console.error('Encryption error:', error)
		return null
	}
}

export const decryptData = (encryptedData) => {
	try {
		const decryptedData = CryptoJS.AES.decrypt(
			encryptedData,
			userSecretKey,
		).toString(CryptoJS.enc.Utf8)
		return JSON.parse(decryptedData)
	} catch (error) {
		return null
	}
}

export const getUserFromLocalStorage = () => {
	try {
		const storedData = localStorage.getItem('user')
		if (storedData) {
			const decryptedData = CryptoJS.AES.decrypt(
				storedData,
				userSecretKey,
			).toString(CryptoJS.enc.Utf8)
			return JSON.parse(decryptedData)
		}
		return null
	} catch (error) {
		console.error('Error decrypting data:', error)
		return null
	}
}

export const addUserToLocalStorage = (user) => {
	const encryptedData = CryptoJS.AES.encrypt(
		JSON.stringify(user),
		userSecretKey,
	).toString()
	localStorage.setItem('user', encryptedData)
}

export const removeUserFromLocalStorage = () => {
	const user = 'user'
	localStorage.removeItem(user)
}

export const setPageLoadingState = () => {
	sessionStorage.setItem('pageIsLoading', 'true')
}

export const removePageLoadingState = () => {
	sessionStorage.removeItem('pageIsLoading')
}

export const isPageLoading = () => {
	const result = sessionStorage.getItem('pageIsLoading')
	return result && result === 'true' ? true : false
}

export const emailRegex = /^\w[\w\.-]*@([^@\s]{3,})\.\w{2,3}$/

export const sortEnum = {
	asc: 1,
	desc: -1,
}

export const formatDate = (dateString, type) => {
	const options = { day: 'numeric', month: 'short', year: 'numeric' }
	const formattedDate = new Date(dateString).toLocaleDateString(
		'en-US',
		options,
	)
	if (type === 'date') {
		const splittedDate = formattedDate.split(' ')
		return `${splittedDate[1].slice(0, splittedDate[1].length - 1)}-${splittedDate[0]}-${splittedDate[2]}`
	}
	if (type === 'year') {
		const splittedDate = formattedDate.split(' ')
		return splittedDate[2]
	}
	return formattedDate
}

export const convertFileToBase64 = async (file) => {
	return new Promise((resolve) => {
		var reader = new FileReader()
		// Read file content on file loaded event
		reader.onload = function (event) {
			resolve(event.target.result)
		}

		// Convert data to base64
		reader.readAsDataURL(file)
	})
}

export const uuidv4 = () => {
	return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
		(
			c ^
			(crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
		).toString(16),
	)
}

export const tableContainerWidth = window.screen.availWidth - 368

export const downloadExcel = (data, fileName) => {
	const worksheet = XLSX.utils.json_to_sheet(data)
	const wscols = [
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 20 },
	]
	worksheet['!cols'] = wscols
	const workbook = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
	XLSX.writeFile(workbook, fileName)
}

export const downloadExcelForObservation = (data, fileName) => {
	const flattenedData = data.map((student) => {
		return {
			'Student ID': ` ${student['Student ID']} `,
			'Student Name': student['Student Name'],
			School: ` ${student['School']} `,
			'Academic Year': student['academicYear'] ?? '',
			ClassName: ` ${student['className']} `,
			DOO: student?.Doo,
			Duration: student.Duration,
			Punctuality: `status : ${student['Punctuality']?.status} , comments : ${student['Punctuality']?.comments}`,
			'Ability To Follow Guidelines': `status : ${student['Ability To Follow Guidelines']?.status} , comments : ${student['Ability To Follow Guidelines']?.comments}`,
			'Ability To Follow Instructions': `status : ${student['Ability To Follow Instructions']?.status} , comments : ${student['Ability To Follow Instructions']?.comments}`,
			Participation: `status : ${student['Participation']?.status} , comments : ${student['Participation']?.comments}`,
			'Completion Of Tasks': `status : ${student['Completion Of Tasks']?.status} , comments : ${student['Completion Of Tasks']?.comments}`,
			'Ability To Work Independently': `status : ${student['Ability To Work Independently']?.status} , comments : ${student['Ability To Work Independently']?.comments}`,
			'Incedental Or Additional Note': `status : ${student['Incedental Or Additional Note']?.status} , comments : ${student['Incedental Or Additional Note']?.comments}`,
			Appearance: `status : ${student['Appearance']?.status} , comments : ${student['Appearance']?.comments}`,
			Attitude: `status : ${student['Attitude']?.status} , comments : ${student['Attitude']?.comments}`,
			Behaviour: `status : ${student['Behaviour']?.status} , comments : ${student['Behaviour']?.comments}`,
			Speech: `status : ${student['Speech']?.status} , comments : ${student['Speech']?.comments}`,
			'affetc Or Mood': `status : ${student['affetc Or Mood']?.status} , comments : ${student['affetc Or Mood']?.comments}`,
			'Thought Process Or Form': `status : ${student['Thought Process Or Form']?.status} , comments : ${student['Thought Process Or Form']?.comments}`,
			'Additional Comment Or Note': `status : ${student['Additional Comment Or Note']?.status} , comments : ${student['Additional Comment Or Note']?.comments}`,
			Status: `status : ${student['Status']?.status} , comments : ${student['Status']?.comments}`,
		}
	})
	const worksheet = XLSX.utils.json_to_sheet(flattenedData)
	const wscols = [
		{ wch: 50 },
		{ wch: 50 },
		{ wch: 50 },
		{ wch: 50 },
		{ wch: 50 },
		{ wch: 50 },
		{ wch: 50 },
		{ wch: 50 },
		{ wch: 50 },
		{ wch: 50 },
		{ wch: 50 },
		{ wch: 50 },
		{ wch: 50 },
		{ wch: 50 },
		{ wch: 50 },
		{ wch: 50 },
		{ wch: 50 },
		{ wch: 50 },
		{ wch: 50 },
		{ wch: 50 },
	]
	worksheet['!cols'] = wscols
	const workbook = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
	XLSX.writeFile(workbook, fileName)
}

export const downloadExcelForBaseline = (data, fileName) => {
	const flattenedData = data.map((student) => {
		return {
			'Student ID': student['Student Id'],
			'Student Name': student['Student Name'],
			'School Name': student['School Name'],
			'Academic Year': student['Academic Year'] ?? '',
			'BaseLine Form': student['BaseLine Form'],
			Physical: student['Physical'],
			Social: student['Social'],
			Emotional: student['Emotional'],
			Cognitive: student['Cognitive'],
			Language: student['Language'],
			Status: student['Status'],
			className: student['Class Name'],
		}
	})

	const worksheet = XLSX.utils.json_to_sheet(flattenedData)
	const wscols = [
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 20 },
		{ wch: 20 },
	]
	worksheet['!cols'] = wscols
	const workbook = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
	XLSX.writeFile(workbook, fileName)
}

export const validateEmail = (email) => {
	return String(email)
		.toLowerCase()
		.match(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
		)
}

export function ISOStringToTimeString(isoString) {
	const dateObj = new Date(isoString)
	const hours = dateObj.getHours()
	const minutes = dateObj.getMinutes()

	// Convert to 12-hour format
	let formattedHours = hours % 12
	formattedHours = formattedHours === 0 ? 12 : formattedHours

	// Add leading zeros to minutes if necessary
	const formattedMinutes = String(minutes).padStart(2, '0')

	// Determine if it's AM or PM
	const amOrPm = hours < 12 ? 'AM' : 'PM'

	// Construct the formatted time string
	const formattedTime = `${formattedHours}:${formattedMinutes} ${amOrPm}`

	return formattedTime
}

export const isAdmin = () => {
	const user = getUserFromLocalStorage()
	if (!user) return false
	const { permissions } = user
	return (
		permissions?.includes(process.env.REACT_APP_ADMIN) ||
		permissions?.includes(process.env.REACT_APP_SUPERADMIN)
	)
}

export const isCounsellor = () => {
	const user = getUserFromLocalStorage()
	if (!user) return false
	const { permissions } = user
	return permissions?.[0] !== 'Teacher'
}

export const checkIfGetS3LinkApi = (url) => {
	if (
		url.includes(`${apiEndPoints.updateProfile}?saveUser=false`) ||
		url.includes(`${apiEndPoints.updateSchool}??saveSchool=false`)
	) {
		return false
	}
	return true
}

export function addSpacesToPascalCase(str) {
	const specialCases = {
		SELCurriculumTracker: 'SEL Curriculum Tracker',
		addSELCurriculumTracker: 'Add SEL Curriculum Tracker',
		editSELCurriculumTracker: 'Edit SEL Curriculum Tracker',
		studentWellBeing: 'Student Well-Being',
		schoolIRIAnalytics: 'School IRI Analytics',
		specificSchoolIRIDetails: 'Specific School IRI Details',
		addStudentIEPDetails: 'Add Student IEP Details',
		gandt: 'G&T',
	}
	if (specialCases.hasOwnProperty(str)) {
		return specialCases[str]
	}
	return str
		.replace(/([a-z](?=[A-Z]))/g, '$1 ')
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ')
}

export function calculateAge(dateOfBirth) {
	const birthDate = new Date(dateOfBirth)
	const today = new Date()

	// Calculate the difference in milliseconds between the two dates
	const diffMs = today - birthDate

	// Convert the difference in milliseconds to years
	// Assuming a year is 365.25 days on average (accounting for leap years)
	const ageDate = new Date(diffMs)
	const years = Math.abs(ageDate.getUTCFullYear() - 1970)

	return years
}

export const isValidPhone = (phone) => {
	return !isNaN(phone) && phone.length === 10
}

export function getCurrentAcademicYear() {
	const now = new Date()
	const year = now.getFullYear()
	const month = now.getMonth() // 0-indexed (0 = January)

	if (month >= 4) {
		// June (5) or later → current year to next year
		return `${year}-${year + 1}`
	} else {
		return `${year - 1}-${year}`
	}
}

export const isDataObjectsEqual = (obj1, obj2) => {
	const keys1 = Object.keys(obj1)
	const keys2 = Object.keys(obj2)

	// Check if the number of keys is the same
	if (keys1.length !== keys2.length) {
		return false
	}
	// Check if all keys and their values are equal
	for (const key of keys1) {
		if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
			return false
		}
	}

	return true
}

export const getCurACYear = () => {
	const date = new Date()
	const year = date.getFullYear()
	const month = date.getMonth()

	let academicYear = ''
	if (month > 4) {
		academicYear = `${year}-${year + 1}`
	} else {
		academicYear = `${year - 1}-${year}`
	}

	return academicYear
}

export const getPrevACYear = () => {
	const date = new Date()
	const year = date.getFullYear()
	const month = date.getMonth()

	let academicYear = ''
	if (month > 4) {
		academicYear = `${year - 1}-${year}`
	} else {
		academicYear = `${year - 2}-${year - 1}`
	}

	return academicYear
}

// If CustomSelect send as true then it will prepare data that support custom select else custom autocomplete
export const getAcademicYearsList = (list, CustomSelect = false) => {
	if (list.length <= 0) {
		return []
	}
	let newList = []
	if (!CustomSelect) {
		newList = list.map((obj) => ({
			label: obj.academicYear,
			id: obj._id,
		}))
	} else {
		newList = list.map((obj) => ({
			label: obj.academicYear,
			val: obj._id,
		}))
	}
	return newList
}

export const getMonthsList = (list, CustomSelect = false) => {
	if (list.length <= 0) {
		return []
	}
	let newList = []
	if (!CustomSelect) {
		newList = list.map((obj) => ({
			label: obj.name,
			id: obj._id,
		}))
	} else {
		newList = list.map((obj) => ({
			label: obj.name,
			val: obj._id,
		}))
	}
	return newList
}

/**
 * Performs case-insensitive partial search on an array of strings.
 *
 * @param {string[]} list - Array of strings to search within.
 * @param {string} query - The search term.
 * @returns {string[]} - Filtered array with matching values.
 */
export function searchArray(
	list,
	searchText,
	notInclude = false,
	field = null,
) {
	if (!searchText.trim()) return list
	const lowerSearchText = searchText.toLowerCase()

	if (field) {
		return list.filter((item) => {
			if (item[field]) {
				return notInclude
					? !item[field].toLowerCase().includes(lowerSearchText)
					: item[field].toLowerCase().includes(lowerSearchText)
			}
		})
	}
	return list.filter((item) =>
		notInclude
			? !item.toLowerCase().includes(lowerSearchText)
			: item.toLowerCase().includes(lowerSearchText),
	)
}

export const convertToUTCISOString = (date) => {
	if (!date) return null
	return new Date(date).toISOString()
}

export const filterClassroomsBySections = (
	classroomsList,
	selectedClassrooms,
	selectedSection,
) => {
	const list = classroomsList
		.filter((cl) => selectedSection.includes(cl.section))
		.map((obj) => obj._id)

	return selectedClassrooms.filter((scl) => list.includes(scl))
}

export const getUniqueSections = (classroomsList) => {
	const uniqSections = []
	for (const classroom of classroomsList) {
		if (!uniqSections.includes(classroom.section)) {
			uniqSections.push(classroom.section)
		}
	}
	return uniqSections
}

export const getCurrentAcademicYearId = (academicYears) => {
	const curACYear = getCurACYear()
	const academicYearObj = academicYears.find(
		(obj) => obj.academicYear === curACYear,
	)
	return academicYearObj?._id || null
}

export const getCurrentAcademicYearObj = (academicYears) => {
	const curACYear = getCurACYear()
	const academicYearObj = academicYears.find(
		(obj) => obj.academicYear === curACYear,
	)
	return academicYearObj
}

export const initialuploadSelectOptionsStates = {
	selectdAY: '',
	selectdSchool: '',
	selectedPromotedAcy: '',
}

export const getCurrentMonth = (monthsList) => {
	const date = new Date()
	const currentMonthIndex = date.getMonth() // 0 for January, 1 for February, ..., 11 for December
	// Assuming monthsList is sorted in order (order: 1-12)
	const monthData = monthsList.find(
		(month) => month.order === currentMonthIndex + 1,
	)

	return monthData ? monthData.name : ''
}

export const getCurrentYear = (years) => {
	const currentYear = new Date().getFullYear().toString()
	if (years.includes(currentYear)) {
		return currentYear
	}
	// If not present, return the closest available year (optional fallback)
	return years[years.length - 1] // Returns last year (e.g., "2030")
}

export function delay(ms = 1000) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Validates that a string is a number with up to 3 digits and less than 360
 * @param {string} value - Input string to validate
 * @returns {boolean} - true if valid, false otherwise
 */
export const isValidDuration = (value) => {
	// Only digits, max 3 characters
	const allowed = /^\d{0,3}$/
	if (!allowed.test(value)) return false

	// Must be less than 360
	const numericValue = Number(value)
	if (value !== '' && (isNaN(numericValue) || numericValue >= 360))
		return false

	return true
}

// get academic year order
export const getAcademicYearOrder = (academicYears, id) => {
	return academicYears.find((year) => year._id === id)?.order || 0
}

const showLoader = () => {
	const loader = document.createElement('div')
	loader.id = 'pdf-loader'
	loader.style.cssText = `
    position: fixed; top:0; left:0; right:0; bottom:0;
    display:flex; justify-content:center; align-items:center;
    background: rgba(0,0,0,0.3); color:white; font-size:20px; z-index:9999;
  `
	loader.innerText = 'Generating PDF...'
	document.body.appendChild(loader)
}

const hideLoader = () => {
	const loader = document.getElementById('pdf-loader')
	if (loader) loader.remove()
}
/**
 * Capture a DOM element and save as PDF
 * @param {HTMLElement} element - DOM node to capture
 * @param {Object} options - config
 * @param {String} options.filename - PDF filename
 * @param {String} options.orientation - "p" | "l"
 * @param {String|Array} options.pageSize - e.g. "a4" | [width, height] in mm
 * @param {Number} options.margin - margin in mm
 */
export const generatePDF = async (element, options = {}) => {
	const {
		filename = 'report.pdf',
		orientation = 'p',
		pageSize = 'a4',
		margin = 10,
	} = options

	if (!element) return
	showLoader()
	try {
		const pdf = new jsPDF(orientation, 'mm', pageSize)
		const canvas = await html2canvas(element, { scale: 2 })
		const imgData = canvas.toDataURL('image/png')

		const pageWidth = pdf.internal.pageSize.getWidth()
		const pageHeight = pdf.internal.pageSize.getHeight()

		const usableWidth = pageWidth - margin * 2
		const usableHeight = pageHeight - margin * 2

		const ratio = Math.min(
			usableWidth / canvas.width,
			usableHeight / canvas.height,
		)
		const finalWidth = canvas.width * ratio
		const finalHeight = canvas.height * ratio

		const x = margin + (usableWidth - finalWidth) / 2
		const y = margin + (usableHeight - finalHeight) / 2

		pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight)
		pdf.save(filename)
	} finally {
		hideLoader()
	}
}

// Safer word-wrap helper (handles non-strings + very long words)
export const wrapBarGraphLabel = (text, maxLength = 23) => {
	if (typeof text !== 'string') text = text == null ? '' : String(text)

	const words = text.trim().split(/\s+/)
	const lines = []
	let current = ''

	for (const word of words) {
		const needsSpace = current.length ? 1 : 0
		if (current.length + needsSpace + word.length <= maxLength) {
			current += (current ? ' ' : '') + word
		} else {
			if (current) lines.push(current)
			if (word.length > maxLength) {
				// hard-break very long words
				for (let i = 0; i < word.length; i += maxLength) {
					lines.push(word.slice(i, i + maxLength))
				}
				current = ''
			} else {
				current = word
			}
		}
	}
	if (current) lines.push(current)
	return lines
}

/**
 * Download baseline analytics data as Excel with multiple sheets
 * @param {Object} data - Contains students, summary, atRiskStudents
 * @param {string} fileName - Name of the Excel file
 */
export const downloadBaselineAnalyticsExcel = (data, fileName = 'Baseline_Analytics_Report.xlsx') => {
	const { students, summary, atRiskStudents } = data

	// Sheet 1: Student Data
	const studentData = (students || []).map((s) => ({
		'Student ID': s.user_id || '-',
		'Student Name': s.studentName || '-',
		'Gender': s.gender || '-',
		'Class': s.className || '-',
		'Section': s.section || '-',
		'Physical': s.Physical || 0,
		'Social': s.Social || 0,
		'Emotional': s.Emotional || 0,
		'Cognitive': s.Cognitive || 0,
		'Language': s.Language || 0,
		'Total Score': s.totalScore || 0,
		'Risk Level': s.redDomainCount > 0
			? `${s.redDomainCount} domain(s) need support`
			: 'Meeting expectations',
	}))

	// Sheet 2: Summary Statistics
	const summaryData = [
		{ 'Metric': 'Total Students Screened', 'Value': summary?.totalStudents || 0 },
		{ 'Metric': 'Male Students', 'Value': summary?.maleCount || 0 },
		{ 'Metric': 'Female Students', 'Value': summary?.femaleCount || 0 },
		{ 'Metric': 'Students At Risk', 'Value': summary?.atRiskCount || 0 },
		{ 'Metric': 'Average Total Score', 'Value': summary?.avgTotalScore || 0 },
		{ 'Metric': 'Meeting Expectations (Green)', 'Value': summary?.rogBreakup?.green || 0 },
		{ 'Metric': 'Developing (Orange)', 'Value': summary?.rogBreakup?.orange || 0 },
		{ 'Metric': 'Needs Support (Red)', 'Value': summary?.rogBreakup?.red || 0 },
	]

	// Sheet 3: At-Risk Students
	const riskData = (atRiskStudents || []).map((s) => ({
		'Student ID': s.user_id || '-',
		'Student Name': s.studentName || '-',
		'Gender': s.gender || '-',
		'Class': s.className || '-',
		'Section': s.section || '-',
		'Red Domain Count': s.redDomainCount || 0,
		'Physical': s.Physical || 0,
		'Social': s.Social || 0,
		'Emotional': s.Emotional || 0,
		'Cognitive': s.Cognitive || 0,
		'Language': s.Language || 0,
	}))

	// Create workbook with multiple sheets
	const workbook = XLSX.utils.book_new()

	if (studentData.length > 0) {
		const studentSheet = XLSX.utils.json_to_sheet(studentData)
		XLSX.utils.book_append_sheet(workbook, studentSheet, 'Student Data')
	}

	const summarySheet = XLSX.utils.json_to_sheet(summaryData)
	XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

	if (riskData.length > 0) {
		const riskSheet = XLSX.utils.json_to_sheet(riskData)
		XLSX.utils.book_append_sheet(workbook, riskSheet, 'At-Risk Students')
	}

	XLSX.writeFile(workbook, fileName)
}
