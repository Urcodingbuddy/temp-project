const jwt = require('jsonwebtoken')
const moment = require('moment')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const mongooseErrorHandler = require('./mongooseErrorHandler')
const asyncPromiseMiddleware = require('../middleware/asyncPromise')
const axios = require('axios').default
const logger = require('./logger')
const {} = require('date-fns')
const { fieldMappingsForSchoolData } = require('./constants')
const { Schools } = require('../models/database/myPeegu-school')
const { Students } = require('../models/database/myPeegu-student')
const { Classrooms } = require('../models/database/myPeegu-classroom')
const { COPEAssessment } = require('../models/database/myPeegu-studentCOPEAssessment')

module.exports.isValidJson = function isValidJson(jsonString) {
	try {
		var o = JSON.parse(jsonString)
		// Handle non-exception-throwing cases:
		// Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
		// but... JSON.parse(null) returns null, and typeof null === "object",
		// so we must check for that, too. Thankfully, null is falsey, so this suffices:
		if (o && typeof o === 'object') return true
	} catch (e) {}
	return false
}

module.exports.generateUserAuthToken = function (name, email, privateKey) {
	return jwt.sign({ name: name, email: email }, privateKey)
}

module.exports.isValidEmail = function isValidEmail(email) {
	const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
	return re.test(email)
}

function isValidDate(date) {
	try {
		if (validateTheStringInput(date) && Date.parse(date)) {
			return true
		} else {
			return false
		}
	} catch (error) {
		logger.error(error)
		return false
	}
}

module.exports.isValidDate = isValidDate

//hash the given password using bcrypt
module.exports.hashPassword = async function hashPassword(password) {
	const salt = await bcrypt.genSalt(10)
	const hashedPassword = await bcrypt.hash(String(password), salt)
	return hashedPassword
}

//checks if an object is a valid mongooseObject(a specific model)
module.exports.isMongooseModel = function isMongooseModel(successObject, model) {
	return (
		successObject &&
		typeof successObject === 'object' &&
		successObject.constructor.name === 'model' &&
		successObject.constructor.modelName === model
	)
}
//checks if a value is valid mongoose object id
module.exports.isMongooseObjectId = function isMongooseObjectId(id) {
	if (!id) return false
	return mongoose.isValidObjectId(id)
}

module.exports.timeStampDifference = (date) => {
	const currentDate = new Date()
	return (currentDate.getTime() - date.getTime()) / 1000
}

//generate unique id of specified length
module.exports.generateRandomNumber = function generateOtp(digit) {
	return Math.random().toFixed(digit).split('.')[1]
}

module.exports.validatePasswordStrength = function (password) {
	const pattern = /^(?=.*[0-9])(?=.*[@!*#_-])[a-zA-Z0-9@!*#_-]{8,30}$/
	if (password.match(pattern)) return true
	else return false
}
module.exports.fullName = function fullName(firstName, middleName, lastName) {
	let name = firstName ?? ''
	if (middleName && middleName.length > 0) {
		name += ' ' + middleName
	}
	if (lastName && lastName.length > 0) {
		name += ' ' + lastName
	}
	return name == '' ? undefined : name
}

module.exports.phoneValidation = function phoneValidation(number) {
	return number && /^\d+$/.test(number)
}

module.exports.isValidMyPeeguUserEmail = function isValidMyPeeguUserEmail(email) {
	const emailRegex = /^[^@]+@[^@]+\.[^.]+$/
	return emailRegex.test(email)
}

module.exports.isValidEmailFormat = function isValidEmailFormat(email) {
	const emailRegex = /^[^@]+@[^@]+\.[^.]+$/
	return emailRegex.test(email)
}

function getPreviousDate(days) {
	const currentDate = new Date()
	const previousDate = new Date(currentDate.getTime() - days * 24 * 60 * 60 * 1000)
	return previousDate
}

function getFutureDate(days) {
	const currentDate = new Date()
	const previousDate = new Date(currentDate.getTime() + days * 24 * 60 * 60 * 1000)
	return previousDate
}

module.exports.s3ExpirationPeriod = function (years) {
	return years * 365 * 24 * 60 * 60
}
module.exports.getPreviousDate = getPreviousDate
module.exports.getFutureDate = getFutureDate

module.exports.getDays = function getDays(day) {
	if (day) {
		const dayFilterFunction = globalConstants.daysFilterFunction
		const x = dayFilterFunction.hasOwnProperty(day) ? dayFilterFunction[day]() : 3650 //get directvalue instead of multiple if elses or switch
		return { $gte: getPreviousDate(x) }
	} else {
		return { $gte: getPreviousDate(globalConstants.defaultMaxDays) }
	}
}

module.exports.getFullName = function getFullName(user) {
	return user.fullName ?? user.email?.split('@')[0] ?? ''
}

module.exports.fetchIpLocation = function fetchIpLocation(sourceIp) {
	return new Promise(
		asyncPromiseMiddleware((resolve, reject) => {
			axios
				.get('http://www.geoplugin.net/json.gp?ip=' + sourceIp, { timeout: 10000 })
				.then((georesponse) => {
					return resolve({
						continent: georesponse.data.geoplugin_continentName,
						country_code: georesponse.data.geoplugin_countryCode,
						country_name: georesponse.data.geoplugin_countryName,
						region: georesponse.data.geoplugin_region,
						city: georesponse.data.geoplugin_city,
						currency: georesponse.data.geoplugin_currencyCode,
						lat: georesponse.data.geoplugin_latitude,
						lon: georesponse.data.geoplugin_longitude,
					})
				})
				.catch((error) => {
					logger.info(mongooseErrorHandler.handleError(error))
					return resolve(null)
				})
		}),
	)
}

module.exports.isBooleanValue = function validateTheBooleanInput(input) {
	return input === true || input === false
}

module.exports.isAValidArray = function validateTheArrayInput(input) {
	return input && Array.isArray(input) && input.length > 0
}

module.exports.isAValidNumber = function validateTheNumberInput(input) {
	return input && Number.isFinite(input)
}

function validateTheStringInput(input) {
	return input && typeof input === 'string' && input.trim().length > 0
}

module.exports.isAValidString = validateTheStringInput

module.exports.isEmptyErrorObject = function isEmptyErrorObject(errorObject) {
	return Object.values(errorObject).every((value) => Object.keys(value).length === 0)
}

//hash the given password using bcrypt
module.exports.hashTheJsonData = async function hashTheJsonData(json) {
	const salt = await bcrypt.genSalt(10)
	const hashedData = await bcrypt.hash(JSON.stringify(json), salt)
	return hashedData
}

module.exports.covertDateStringToPlainDate = function covertDateStringToPlainDate(dateString) {
	if (dateString && typeof dateString === 'string' && dateString.split('/').length == 3) {
		const dateParts = dateString.split('/')
		const year = parseInt(dateParts[2])
		const month = parseInt(dateParts[0]) - 1 // January is 0 in Date object
		const day = parseInt(dateParts[1])
		const newDate = new Date(year, month, day) // creates new Date object
		return newDate
	} else {
		return null
	}
}

module.exports.fetchTodayDate = function fetchTodayDate() {
	const today = new Date('10/05/2024')
	today.setHours(0, 0, 0, 0) // set hours, minutes, seconds and milliseconds to 0 to only match by date
	return today
}

module.exports.fetchUrlSafeString = function fetchUrlSafeString(string) {
	return string && string.length > 0 ? string.replace(/[^a-zA-Z0-9_\-\.]/g, '_') : null
}

module.exports.areValidObjectIds = function areValidObjectIds(ids) {
	// Check if `ids` is an array, not empty, and if every element in the array is a valid ObjectId
	return (
		Array.isArray(ids) &&
		ids.length > 0 &&
		ids.every((id) => mongoose.Types.ObjectId.isValid(id))
	)
}

// This function will normalise the list of rounded values for 100% total value to bring based on the error factor of each round off.
module.exports.normalizePercentageByDecimal = function (input) {
	const rounded = input.map((x, i) => ({ number: Math.floor(x), decimal: x % 1, index: i }))
	const decimalSorted = [...rounded].sort((a, b) => b.decimal - a.decimal)
	const sum = rounded.reduce((pre, curr) => pre + curr.number, 0)
	const error = 100 - sum
	// In case of the list contains non hundred sum values like all 0's etc.
	if (error <= input.length - 1) {
		for (let i = 0; i < error; i++) {
			const element = decimalSorted[i]
			element.number++
		}
		const result = [...decimalSorted].sort((a, b) => a.index - b.index)
		return result.map((x) => x.number)
	}
	return input.map((x) => Math.round(x))
}

module.exports.isKeysLength = (obj) => Object.keys(obj)?.length > 0
module.exports.isAuthorisedSchool = (assignedSchools, school) => {
	return assignedSchools.map((id) => id?.toString()).includes(school?.toString())
}

module.exports.validateNewStudent = (newStudent) => {
	if (!newStudent) return 'missing field'
	if (newStudent?.toUpperCase() !== 'Y' && newStudent?.toUpperCase() !== 'N') {
		return true
	}
	return false
}

function formatToIndianTimeZone(dateString) {
	const date = new Date(dateString)
	const options = {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		timeZoneName: 'short',
	}
	const formattedDate = date.toLocaleString('en-IN', options)
	return formattedDate
}

module.exports.formatStudentData = (item, isDownloadAndFilter) => {
	if (isDownloadAndFilter) {
		return {
			'School Name': item.school.school,
			'Class Name': item?.classRoomId?.className,
			Section: item?.classRoomId?.section,
			'Student ID': item.user_id,
			'Student Name': item.studentName,
			'New Student': item.newStudent,
			'Registration Number.': item.regNo,
			'Registration Date': formatToIndianTimeZone(item.regDate),
			'Academic Year': item.academicYear,
			Nationality: item.nationality,
			DOB: formatToIndianTimeZone(item.dob),
			Gender: item.gender,
			'Father Name': item.fatherName,
			'Mother Name': item.motherName,
			Email: item.email,
			Status: item.status,
		}
	}
}

function formatTeacherData(item, isDownloadAndFilter, isSecondPage) {
	if (isDownloadAndFilter) {
		const formattedData = {
			'Teacher Id': item.teacher_id,
			'Teacher Name': item.teacherName,
			Gender: item.gender,
			'School Code': item.scCode && item.scCode,
			'School Name': item.schoolName,
			Email: item.email,
			'Mobile Number': item.mobileNumber,
			Gender: item.gender,
		}

		if (isSecondPage) {
			formattedData['IRI Submission Date'] =
				isSecondPage &&
				(item.IRISubDate
					? formatToIndianTimeZone(item.IRISubDate)
					: 'Teacher IRI Report Submission Pending')
		}
		if (isSecondPage) {
			formattedData['Status'] = item.formStatusOnIRISubDate && item.formStatusOnIRISubDate
		}

		return formattedData
	}
}
function individualCaseDataFormation(item, isDownloadAndFilter) {
	if (isDownloadAndFilter) {
		const formattedData = {
			'Student Id': item.user_id,
			'Student Name': item.studentName,
			'Academic Year': item.academicYear ?? '',
			'Class Name': item.className,
			'Start Time': item.startTime,
			'End Time': item.endTime,
			Date: formatToIndianTimeZone(item.date),
			Issues: item.issues,
			Goals: item.goals,
			Activity: item.activity,
			Dimension: item.dimension,
			Description: item.description,
			Type: item.stype,
			'Based On': item.basedOn,
			Purpose: item.purpose,
			Outcome: item.outcome,
			Improvements: item.improvements,
			Comments: item.comments,
			'Tasks Assigned': item.tasksAssigned,
			POA: item.poa,
			Status: item.status,
		}
		return formattedData
	}
}

function baselineDataFormation(item, isDownloadAndFilter) {
	if (isDownloadAndFilter) {
		const formattedData = {
			'Student Id': item.user_id,
			'Student Name': item.studentName,
			'Academic Year': item.academicYear ?? '',
			'Class Name': item.className,
			'School Name': item.schoolName,
			'BaseLine Form': item.baselineForm,
			'Baseline Category': item.baselineCategory,
			Physical: item.Physical.total,
			Social: item.Social.total,
			Emotional: item.Emotional.total,
			Cognitive: item.Cognitive.total,
			Language: item.Language.total,
			Status: item.status,
		}
		return formattedData
	}
}

function formatStudentCopeData(item) {
	const formattedData = {
		'Student Id': item.user_id,
		'Student Name': item.studentName,
		'Academic Year': item.academicYear ?? '',
		'School Name': item.schoolName,
		'Class Name': item?.className,
		Section: item?.section,
		'Submission Date':
			formatToIndianTimeZone(item.COPEReportSubmissionDate) ??
			formatToIndianTimeZone(item?.createdAt) ??
			'No Submission Date Available',
	}

	return formattedData
}

function formatStudentWBData(item) {
	const formattedData = {
		'Student Id': item.user_id,
		'Student Name': item.studentName,
		'Academic Year': item.academicYear ?? '',
		'School Name': item.schoolName,
		'Class Name': item.className,
		Section: item.section,
		'Submission Date':
			formatToIndianTimeZone(item.wellBeingAssessmentSubmissionDate) ??
			formatToIndianTimeZone(item?.createdAt) ??
			'No Submission Date Available',
	}

	return formattedData
}

function formatSchoolTeacherData(item, isDownloadAndFilter) {
	if (isDownloadAndFilter) {
		return {
			'School Name': item.schoolName,
			'Start Date':
				item.IRIStartDateForSchool && formatToIndianTimeZone(item.IRIStartDateForSchool),
			'End Date':
				item.IRIEndDateForSchool && formatToIndianTimeZone(item.IRIEndDateForSchool),
			'Total Teachers': item.totalTeacherCount,
			Pending: item.totalPendingTeacherCount,
			Submitted: item.totalSubmittedTeacherCount,
			Status: item.timeSpanStatusForSchool,
		}
	} else {
		return {
			'School Name': item.schoolName,
			'Start Date': item.ProfilingStartDateForSchool
				? formatToIndianTimeZone(item.ProfilingStartDateForSchool)
				: 'No Start Date Available',
			'End Date': item.ProfilingEndDateForSchool
				? formatToIndianTimeZone(item.ProfilingEndDateForSchool)
				: 'No End Date Available',
			'Total Teachers': item.totalTeacherCount,
			Pending: item.totalPendingTeacherCountForProfiling,
			Submitted: item.totalSubmittedTeacherCountForProfiling,
			Status: item.timeSpanProfilingStatusForSchool,
		}
	}
}

module.exports.formatProfilingForSchoolsData = function (item) {
	return {
		'School Name': item.schoolName,
		'Academic Year': item.academicYear,
		'Start Date': item.startDate && formatToIndianTimeZone(item.startDate),
		'End Date': item.endDate && formatToIndianTimeZone(item.endDate),
		'Total Teachers': item.totalTeacherCount,
		Pending: item.pendingTeacherCount,
		Submitted: item.submittedTeacherCount,
		Status: item.profilingStatus,
	}
}
module.exports.formatProfilingForTeacherData = function (item, isDownloadAndFilter) {
	return {
		'Teacher id': item.teacher_id,
		'Teacher Name': item.teacherName,
		'Submission Date': item.submissionDate && formatToIndianTimeZone(item.submissionDate),
		Gender: item.gender,
		Status: item.formStatus,
	}
}
module.exports.formatIRIForTeacherData = function (item, isDownloadAndFilter) {
	return {
		'Teacher id': item.teacher_id,
		'Teacher Name': item.teacherName,
		'Submission Date': item.submissionDate && formatToIndianTimeZone(item.submissionDate),
		Gender: item.gender,
		Status: item.formStatus,
	}
}

module.exports.formatIRIForSchoolsData = function (item) {
	return {
		'School Name': item.schoolName,
		'Academi Year': item?.academicYear ?? '',
		'Start Date': item.startDate && formatToIndianTimeZone(item.startDate),
		'End Date': item.endDate && formatToIndianTimeZone(item.endDate),
		'Total Teachers': item.totalTeacherCount,
		Pending: item.pendingTeacherCount,
		Submitted: item.submittedTeacherCount,
		Status: item.IRIStatus,
	}
}
module.exports.formatSchoolsData = (item, isDownloadAndFilter) => {
	if (isDownloadAndFilter) {
		const formattedData = {}
		for (const key in fieldMappingsForSchoolData) {
			if (item[key] !== undefined) {
				if (key === 'onboardDate' || key === 'establishedYear') {
					formattedData[fieldMappingsForSchoolData[key]] = formatToIndianTimeZone(
						item[key],
					)
				} else if (key === 'state') {
					formattedData['state'] = item.state.name
				} else {
					formattedData[fieldMappingsForSchoolData[key]] = item[key]
				}
			}
		}
		return formattedData
	}
}

module.exports.mergeData = (filteredData, originalData) => {
	return originalData.map((originalItem) => {
		const matchingItem = filteredData.find(
			(filteredItem) => filteredItem.student_id === originalItem.user_id,
		)
		if (matchingItem) {
			const mergedItem = { ...originalItem, ...matchingItem }

			mergedItem.student_id = mergedItem.user_id
			delete mergedItem.user_id

			delete mergedItem.studentId
			delete mergedItem._id

			mergedItem.school = matchingItem.school

			return mergedItem
		}
		return originalItem
	})
}

module.exports.formatCounselorData = (item, isDownloadAndFilter, param) => {
	if (isDownloadAndFilter) {
		return {
			'User ID': item.user_id,
			Email: item.email,
			Phone: item.phone,
			Permissions: param
				? item.permissions
				: item.permissions
					? item.permissions.join(', ')
					: '',
			'Assigned Schools': param
				? item.assignedSchools
				: item.assignedSchools
					? item.assignedSchools.map((school) => `${school.school}`).join(', ')
					: '',
			'Created By Name': item.createdByName,
			Status: item.status,
			'Updated By Name': item.updatedByName,
			'First Name': item.firstName,
			'Full Name': item.fullName,
			'Last Name': item.lastName,
		}
	}
}

function formatDataForDownload(data) {
	const modifiedData = data.map((item) => {
		const schoolName = item.schoolName
		delete item.schoolName
		delete item._id
		delete item.school
		delete item.SAY
		delete item.academicYearId
		delete item.classRoomId

		function toNormalCase(str) {
			return str.replace(/([a-z])([A-Z])/g, '$1 $2')
		}

		function capitalizeFirstLetter(str) {
			return str.replace(/\b\w/g, (match) => match.toUpperCase())
		}

		const normalCaseData = {}
		for (const key in item) {
			if (key === 'interactionDate') {
				normalCaseData['Interaction Date'] = formatToIndianTimeZone(item[key])
			} else {
				normalCaseData[capitalizeFirstLetter(toNormalCase(key))] = item[key]
			}
		}

		return { 'School Name': schoolName, ...normalCaseData }
	})

	return modifiedData
}

function buildSortOptions(body, sortFields) {
	const sortOptions = {}

	if (body.sortKeys) {
		body.sortKeys.forEach((option) => {
			if (sortFields.includes(option.key) && (option.value === 1 || option.value === -1)) {
				sortOptions[option.key] = option.value
			}
		})
	}

	return Object.keys(sortOptions).length > 0 ? sortOptions : false
}

function buildFilterQuery(body) {
	const filterQuery = {}

	if (body.filter?.schoolIds && body.filter?.schoolIds.length > 0) {
		filterQuery.school = {
			$in: body.filter?.schoolIds.map((id) => new mongoose.Types.ObjectId(id)),
		}
	}
	if (body.filter?.classRoomId && body.filter?.classRoomId.length > 0) {
		filterQuery.classRoomId = {
			$in: body.filter?.classRoomId.map((id) => new mongoose.Types.ObjectId(id)),
		}
	}

	return filterQuery
}

function buildPipeline(Query, downloadAndFilter, skip, PAGE_SIZE) {
	const pipeline = downloadAndFilter
		? [
				{
					$facet: {
						data: [...Query, { $skip: skip }, { $limit: PAGE_SIZE }],
					},
				},
			]
		: [
				{
					$facet: {
						totalCount: [...Query, { $count: 'Count' }],
						data: [...Query, { $skip: skip }, { $limit: PAGE_SIZE }],
					},
				},
			]

	return pipeline
}

function buildSearchQuery(searchText, fields) {
	const criteria = String(searchText || '')
	const orConditions = fields?.map((field) => ({
		[field]: {
			$regex: criteria,
			$options: 'i',
		},
	}))

	return { $or: orConditions }
}

async function updateStudentCounts() {
	try {
		const pipeline = [
			{
				$match: {
					status: 'Active',
					graduated: false,
					exited: false,
					classRoomId: { $ne: null },
				},
			},
			{
				$group: {
					_id: {
						school: '$school',
						classRoomId: '$classRoomId',
					},
					count: { $sum: 1 },
				},
			},
		]

		const results = await Students.aggregate(pipeline)

		const modifiedClassRooms = []

		const bulkOperations = []
		for (const result of results) {
			const { school, classRoomId } = result._id
			modifiedClassRooms.push(classRoomId)
			const updateOps = {
				updateOne: {
					filter: { _id: classRoomId, school: school },
					update: {
						$set: {
							studentCount: result.count,
						},
					},
				},
			}

			bulkOperations.push(updateOps)
		}
		bulkOperations.length > 0 ? await Classrooms.bulkWrite(bulkOperations) : {}
		modifiedClassRooms.length > 0
			? await Classrooms.updateMany(
					{ _id: { $nin: modifiedClassRooms } },
					{ $set: { studentCount: 0 } },
				)
			: {}
	} catch (error) {
		console.error('Error updating student counts:', error)
	}
}

async function getSchoolMeanAvg(fieldName, schoolId, isMeanAcrossSchool) {
	try {
		const pipeline = [
			{
				$match: {
					...(isMeanAcrossSchool ? {} : { school: schoolId }),
				},
			},
			{
				$lookup: {
					from: 'students',
					localField: 'studentId',
					foreignField: '_id',
					as: 'studentInfo',
				},
			},
			{
				$unwind: '$studentInfo',
			},
			{
				$match: {
					$and: [
						{
							$expr: {
								$eq: ['$classRoomId', '$studentInfo.classRoomId'],
							},
						},
						{
							$expr: {
								$eq: ['$studentInfo.graduated', false],
							},
						},
						{
							$expr: {
								$eq: ['$studentInfo.exited', false],
							},
						},
					],
				},
			},
			{
				$group: {
					_id: null,
					schoolMeanAvg: { $avg: `$${fieldName}` },
				},
			},
		]
		const result = await COPEAssessment.aggregate(pipeline).exec()
		return result.length > 0 ? result[0].schoolMeanAvg : null
	} catch (error) {
		console.error('Error:', error)
		throw error
	}
}

async function calculateStudentCountsInSchool() {
	try {
		const pipeline = [
			{
				$match: {
					status: 'Active',
					graduated: false,
					exited: false,
				},
			},
			{
				$group: {
					_id: {
						school: '$school',
					},
					count: { $sum: 1 },
				},
			},
		]

		const results = await Students.aggregate(pipeline)

		for (const result of results) {
			const { school } = result._id

			await Schools.updateOne(
				{ _id: school.toString() },
				{ $set: { studentCountInSchool: result.count } },
			)
		}
	} catch (error) {
		console.error('Error updating student counts:', error)
	}
}
function insertRanks(sortedArray, property) {
	let rank = 1
	let prevScore = null
	let prevRank = 1

	return sortedArray.map((teacher, index) => {
		const currentScore = teacher[property]
		if (prevScore !== null && currentScore !== prevScore) {
			rank = prevRank + 1
		}
		if (currentScore === 0 || currentScore == undefined) {
			rank = 0
		}
		prevScore = currentScore
		prevRank = rank
		return { ...teacher._doc, rank }
	})
}
function calculateAverage(array) {
	return array.reduce((acc, curr) => acc + curr, 0) / array.length
}

const calculateAverageForStudentCOPESubCategories = (questions, ratings) => {
	const relevantRatings = ratings.filter((item) => questions.includes(item.questionNumber))
	const sum = relevantRatings.reduce((sum, item) => sum + item.marks, 0)
	return relevantRatings.length > 0 ? sum / relevantRatings.length : 0
}

function calculateSum(array, isWellBeingScale, reverseScoringQuestions) {
	if (isWellBeingScale) {
		return array.reduce((acc, item) => {
			if (reverseScoringQuestions.includes(item.questionNumber)) {
				return acc + (7 + 1) - item.marks
			} else {
				return acc + item.marks
			}
		}, 0)
	} else {
		return array.reduce((acc, curr) => acc + curr, 0)
	}
}

function rankingsForStudentWBAnalytics(studentWellBeing, field1, field2) {
	studentWellBeing.forEach((school) => {
		const average = (school[field1] + school[field2]) / 2
		school.average = average
	})

	studentWellBeing.sort((a, b) => b.average - a.average)

	let currentRank = 1
	let previousAverage = null
	studentWellBeing.forEach((school) => {
		if (previousAverage !== null && school.average !== previousAverage) {
			currentRank++
		}
		school.rank = currentRank
		previousAverage = school.average
	})

	return studentWellBeing
}

function rankPWBData(studentWellBeing, field1, field2, field3, field4, field5, field6) {
	studentWellBeing.forEach((school) => {
		const average =
			(school[field1] +
				school[field2] +
				school[field3] +
				school[field4] +
				school[field5] +
				school[field6]) /
			6
		school.average = average
	})

	studentWellBeing.sort((a, b) => b.average - a.average)

	let currentRank = 1
	let previousAverage = null
	studentWellBeing.forEach((school) => {
		if (previousAverage !== null && school.average !== previousAverage) {
			currentRank++
		}
		school.rank = currentRank
		previousAverage = school.average
	})

	return studentWellBeing
}

function calculateRanking(data, schoolId) {
	const hopeScores = data.map((entry) => ({
		_id: entry._id,
		schoolName: entry.schoolName,
		hopeScore: entry.averageHopeScore,
	}))
	const wellBeingScores = data.map((entry) => ({
		_id: entry._id,
		schoolName: entry.schoolName,
		wellBeingScore: entry.averageWellBeingScore,
	}))

	// Sort both arrays in descending order
	const sortedHopeScores = hopeScores.sort((a, b) => b.hopeScore - a.hopeScore)
	const sortedWellBeingScores = wellBeingScores.sort(
		(a, b) => b.wellBeingScore - a.wellBeingScore,
	)

	const rankedArrayHopeScore = addRanking(sortedHopeScores, 'hopeScore')
	const schoolRankInHope = rankedArrayHopeScore.find(
		(school) => school._id.toString() === schoolId,
	)
	const rankedArrayWellBeingScore = addRanking(sortedWellBeingScores, 'wellBeingScore')
	const schoolRankInWellBeing = rankedArrayWellBeingScore.find(
		(school) => school._id.toString() === schoolId,
	)

	// Return the rankings
	return {
		hopeRanking: schoolRankInHope,
		wellBeingRanking: schoolRankInWellBeing,
	}
}
function addRanking(sortedArray, field) {
	let currentRank = 1
	let previousScore = null
	sortedArray.forEach((entry) => {
		if (entry[field] !== previousScore) {
			entry.rank = currentRank
		}
		previousScore = entry[field]
		currentRank++
	})
	return sortedArray // Return the updated array
}

function getContentType(fileName) {
	const extension = fileName.split('.').pop().toLowerCase()
	switch (extension) {
		case 'png':
			return globalConstants.PngImageType
		case 'pdf':
			return globalConstants.PdfType

		case 'jpg':
		case 'jpeg':
			return globalConstants.JpegType
		default:
			throw new Error('Unsupported file type')
	}
}
function sanitizeScores(scores) {
	if (scores?.every((score) => score.marks === null)) {
		return [] // Return an empty array if all marks are null
	}
	return scores // Return the original scores if not all are null
}

function validateAllQuestionsAnswered(scores, sectionName, teacherId, rowNum) {
	if (scores?.some((rating) => rating.marks === null)) {
		return `${teacherId} has not filled all question for ${sectionName} at row number ${rowNum}`
	}
	return null
}
function validateScoreRange(scores, minScore, maxScore, sectionName, teacherId, rowNum) {
	if (scores?.some((ass) => ass.marks < minScore || ass.marks > maxScore)) {
		return `${sectionName} Marks should be between ${minScore} to ${maxScore} for Row number ${rowNum}`
	}
	return null
}

module.exports.delay = function (ms = 1000) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

const generateAcademicYearsTillCurrent = (selectedAcademicYear) => {
	const currentYear = new Date().getFullYear()
	const selectedStartYear = parseInt(selectedAcademicYear.split('-')[0])

	const academicYears = []

	for (let year = selectedStartYear; year <= currentYear; year++) {
		academicYears.push(`${year}-${year + 1}`)
	}

	return academicYears
}

function calculateScore(questions) {
	return questions?.reduce((acc, curr) => {
		if (curr?.answer?.toLowerCase() === 'yes') {
			return acc + 1
		}
		return acc
	}, 0)
}

function convertObjectIdsToStrings(obj) {
	if (Array.isArray(obj)) {
		obj.forEach((item, index) => {
			obj[index] = convertObjectIdsToStrings(item)
		})
		return obj
	} else if (obj && typeof obj === 'object') {
		for (const key in obj) {
			const val = obj[key]
			if (val instanceof mongoose.Types.ObjectId) {
				obj[key] = val.toString()
			} else if (val instanceof Date) {
				obj[key] = val.toISOString()
			} else if (Array.isArray(val) || typeof val === 'object') {
				obj[key] = convertObjectIdsToStrings(val)
			}
		}
		return obj
	}
	return obj
}

/**
 * Validates whether a given date is between the start and end date.
 * @param {string|Date} targetDate - The date to validate.
 * @param {string|Date} startDate - The start of the range.
 * @param {string|Date} endDate - The end of the range.
 * @returns {boolean} true if date is within range (inclusive), false otherwise.
 */
module.exports.isDateWithinRange = (targetDate, startDate, endDate) => {
	const input = moment(targetDate)
	const start = moment(startDate)
	const end = moment(endDate)

	return input.isSameOrAfter(start, 'day') && input.isSameOrBefore(end, 'day')
}

const SectionEnum = Object.freeze({
	WELLBEING: 'wellbeing',
	TEACHER_IRI: 'teacherIRI',
})

const sectionRules = {
	[SectionEnum.WELLBEING]: {
		specialQuestions: [1, 2, 3, 8, 9, 11, 12, 13, 17, 18],
		scoreFn: (marks) => 7 + 1 - marks,
	},
	[SectionEnum.TEACHER_IRI]: {
		specialQuestions: [3, 7, 12, 13, 14, 15, 19],
		scoreFn: (marks) => 4 + 1 - marks,
	},
}

function updateQuestionScores(sectionName, questions) {
	const rules = sectionRules[sectionName]
	if (!rules) return questions // If no rules, return as-is

	const { specialQuestions, scoreFn } = rules

	return questions.map((q) => {
		if (specialQuestions.includes(q.questionNumber)) {
			return { ...q, marks: scoreFn(q.marks) } // update marks
		}
		return q // unchanged if not special
	})
}

function getUpdatedMarks(sectionName, questionNumber, marks) {
	const rules = sectionRules[sectionName]
	if (!rules) return marks // no rules for this section

	const { specialQuestions, scoreFn } = rules

	if (specialQuestions.includes(questionNumber)) {
		return scoreFn(marks) // apply special logic
	}
	return marks // unchanged if not special
}

function buildDateFilterQuery(filter) {
	let query = {}
	let error = false
	let errorMsg = ''
	if (filter.days) {
		const today = new Date()
		today.setUTCHours(0, 0, 0, 0)

		switch (filter.days) {
			case 0: {
				// All
				break
			}
			case 1: {
				// Today
				const endOfDay = new Date(today)
				endOfDay.setUTCHours(23, 59, 59, 999)
				query.submissionDate = { $gte: today, $lte: endOfDay }
				break
			}
			case 2: {
				// Last 7 days
				const sevenDaysAgo = new Date(today)
				sevenDaysAgo.setDate(today.getDate() - 7)
				query.submissionDate = { $gte: sevenDaysAgo, $lte: today }
				break
			}
			case 3: {
				// Last 30 days
				const thirtyDaysAgo = new Date(today)
				thirtyDaysAgo.setDate(today.getDate() - 30)
				query.submissionDate = { $gte: thirtyDaysAgo, $lte: today }
				break
			}
			case 4: {
				// Current year
				const currentYear = today.getFullYear()
				query.submissionDate = {
					$gte: new Date(`${currentYear}-01-01T00:00:00Z`),
					$lte: new Date(`${currentYear}-12-31T23:59:59Z`),
				}
				break
			}
			case 5: {
				// Custom range
				if (filter.startDate && filter.endDate) {
					if (!(isValidDate(filter.startDate) && isValidDate(filter.endDate))) {
						errorMsg = globalConstants.messages.invalidDate
						error = true

						return {
							query,
							error,
							error,
						}
					}
					const pastDate = new Date(filter.startDate)
					const currentDate = new Date(filter.endDate)
					pastDate.setUTCHours(0, 0, 0, 0)
					currentDate.setUTCHours(23, 59, 59, 999)
					query.submissionDate = { $gte: pastDate, $lte: currentDate }
				}
				break
			}
			default:
				break
		}
	}
	return {
		query,
		error,
		error,
	}
}

module.exports.buildDateFilterQuery = buildDateFilterQuery
module.exports.getUpdatedMarks = getUpdatedMarks
module.exports.SectionEnum = SectionEnum
module.exports.updateQuestionScores = updateQuestionScores
module.exports.validateScoreRange = validateScoreRange
module.exports.convertObjectIdsToStrings = convertObjectIdsToStrings
module.exports.validateAllQuestionsAnswered = validateAllQuestionsAnswered
module.exports.sanitizeScores = sanitizeScores
module.exports.getContentType = getContentType
module.exports.getSchoolMeanAvg = getSchoolMeanAvg
module.exports.calculateRanking = calculateRanking
module.exports.calculateAverageForStudentCOPESubCategories =
	calculateAverageForStudentCOPESubCategories

module.exports.rankPWBData = rankPWBData
module.exports.rankingsForStudentWBAnalytics = rankingsForStudentWBAnalytics
module.exports.calculateSum = calculateSum
module.exports.calculateAverage = calculateAverage
module.exports.individualCaseDataFormation = individualCaseDataFormation
module.exports.baselineDataFormation = baselineDataFormation
module.exports.formatStudentCopeData = formatStudentCopeData
module.exports.formatStudentWBData = formatStudentWBData
module.exports.insertRanks = insertRanks
module.exports.calculateStudentCountsInSchool = calculateStudentCountsInSchool
module.exports.buildSearchQuery = buildSearchQuery
module.exports.formatSchoolTeacherData = formatSchoolTeacherData
module.exports.formatTeacherData = formatTeacherData
module.exports.updateStudentCounts = updateStudentCounts
module.exports.formatToIndianTimeZone = formatToIndianTimeZone
module.exports.formatDataForDownload = formatDataForDownload
module.exports.buildSortOptions = buildSortOptions
module.exports.buildFilterQuery = buildFilterQuery
module.exports.buildPipeline = buildPipeline
module.exports.generateAcademicYearsTillCurrent = generateAcademicYearsTillCurrent
module.exports.calculateScore = calculateScore
module.exports
