const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const asyncMiddleware = require('../../middleware/async')
const utils = require('../../utility/utils')
const mongooseErrorHandler = require('../../utility/mongooseErrorHandler')

const { SuccessResponse, FailureResponse } = require('../../models/response/globalResponse')
const { authMyPeeguUser } = require('../../middleware/auth')
const {
	editStudents,
	deleteStudents,
	viewStudents,
} = require('../../middleware/validate.counselorManagement')
const { Schools } = require('../../models/database/myPeegu-school')
const { Classrooms } = require('../../models/database/myPeegu-classroom')

const { Students } = require('../../models/database/myPeegu-student')
const { IndividualRecord } = require('../../models/database/myPeegu-individual')
const { globalServices } = require('../../services/global-service.js')
const { selServices } = require('../../services/sel/sel-service.js')

// ------------------------------- Couselor Dashboard Starts ------------------------------------------
router.get(
	'/dashboard',
	authMyPeeguUser,
	asyncMiddleware(async (req, res) => {
		//schoolsAssigned
		//totalStudents
		//totalClasses

		const currentAcademicYear = await globalServices.getCurrentAcademicYear()

		if (!req.user.permissions.some((item) => globalConstants.counselorList.includes(item))) {
			return res.status(400).json(new FailureResponse(globalConstants.messages.notAuthorised))
		}
		try {
			const promises = [
				Students.countDocuments({
					school: { $in: req.user.assignedSchools },
					status: globalConstants.studentStatus.Active,
					graduated: { $ne: true },
					exited: { $ne: true },
				}),
				Classrooms.countDocuments({
					school: { $in: req.user.assignedSchools },
					status: globalConstants.schoolStatus.Active,
					academicYear: currentAcademicYear._id,
				}),
			]

			const [totalStudents, totalClasses] = await Promise.all(promises)

			return res.json({
				assignedSchools: req.user.assignedSchools.length,
				totalStudents,
				totalClasses,
			})
		} catch (error) {
			const failureResponse = mongooseErrorHandler.handleError(error)
			return res.status(400).json(failureResponse)
		}
	}),
)

// ------------------------------- Individual Records Starts ------------------------------------------
router.post(
	'/individualrecords',
	authMyPeeguUser,
	editStudents,
	asyncMiddleware(async (req, res) => {
		const body = req.body?.students || [{}]
		const errorResponses = [] // Array to hold the error responses
		const recordsToInsert = []
		const school = req.body.school
		const schoolId = new mongoose.Types.ObjectId(school)
		const { isIndividualCase, selectedStudents } = req.body
		if (!utils.isMongooseObjectId(school))
			return res.status(400).json(new FailureResponse(globalConstants.messages.invalidSchool))
		let validSchool = req.user.assignedSchools.map((id) => id.toString()).includes(school)
		let isActiveSchool = await Schools.find({
			_id: school,
			status: globalConstants.schoolStatus.Active,
		})
		if (!validSchool || !isActiveSchool)
			return res.status(400).json(new FailureResponse(globalConstants.messages.invalidSchool))

		if (isIndividualCase === false) {
			const user_ids = await Students.find({
				_id: { $in: selectedStudents },
				graduated: false,
				exited: false,
				status: globalConstants.studentStatus.Active,
			}).select('user_id classRoomId')
			const doesRecordForStudentExist = await IndividualRecord.find({
				user_id: { $in: user_ids.map((d) => d?.user_id) },
				graduated: false,
				exited: false,
				status: globalConstants.studentStatus.Active,
			})
			const classRoomIds = user_ids.map((user) => user.classRoomId.toString())

			const hasSameClassRoomIdRecord = doesRecordForStudentExist.some((record) =>
				classRoomIds.includes(record.classRoomId.toString()),
			)

			if (hasSameClassRoomIdRecord) {
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.alreadyExists))
			}
		}

		if (isIndividualCase) {
			for (const data of body) {
				//classroom and section is mandatory here
				if (!data['user_id'] || (data['user_id'] && !utils.isAValidString(data['user_id'])))
					return res
						.status(400)
						.json(new FailureResponse(globalConstants.messages.missingParameters))
			}
		}

		let mappedData
		for (const data of body) {
			//classroom and section is mandatory here
			// mappedData = data
			mappedData = { ...data }
			mappedData.school = school
			const errors = {} // Object to store errors for each field in the current record
			//student validations
			const validStudentRecord = await Students.findOne({
				user_id: mappedData.user_id,
				school: schoolId,
				status: globalConstants.studentStatus.Active,
				graduated: false,
				exited: false,
			})
			if (isIndividualCase) {
				if (!validStudentRecord) errors.user_id = globalConstants.messages.notFound
				else mappedData.studentId = validStudentRecord._id
				mappedData.classRoomId = validStudentRecord.classRoomId
			} else {
				if (!selectedStudents.length > 0) {
					errors.user_id = 'No students Selected'
				}
			}

			if (Object.keys(errors).length > 0) {
				const originalErrors = {} // Object to store errors mapped back to original fields

				// Map the errors back to original fields
				for (const key in errors) {
					const schemaField = key
					const mapping = mapDataToSchema(false, true)
					const originalField = Object.keys(mapping).find(
						(k) => mapping[k] === schemaField,
					)
					originalErrors[originalField] = errors[key]
				}
				errorResponses.push({ id: data['Student ID'], errors: originalErrors })
			} else {
				delete mappedData._id
				recordsToInsert.push(mappedData)
			}
		}

		// If there are any errors, return the error responses
		if (errorResponses.length > 0) {
			return res.status(400).json(new FailureResponse(errorResponses))
		}
		if (isIndividualCase === false) {
			const studentRecords = await Students.find({
				_id: { $in: req.body.selectedStudents },
				school: schoolId,
				status: globalConstants.studentStatus.Active,
				graduated: false,
				exited: false,
			}).select('studentName user_id classRoomId')

			// Iterate over studentRecords and transform each record
			studentRecords.forEach((student) => {
				const record = {
					...body[0], // Assuming the first object in the body array is a template for records
					studentName: student.studentName,
					user_id: student.user_id,
					school: school, // Set the school for each record
					studentId: student?._id,
					classRoomId: student?.classRoomId,
					academicYear: '6833fab14703ea21d81dd7e9',
					SAY: '684c1fcf8511e89fedba7412',
				}
				delete record._id
				recordsToInsert.push(record)
			})
			recordsToInsert.shift()
		}
		// All records passed validation, insert them into the IndividualRecord using insertMany
		IndividualRecord.insertMany(recordsToInsert)
			.then(() => {
				return res.json(new SuccessResponse(globalConstants.messages.individualCaseCreated))
			})
			.catch((error) => {
				const failureResponse = mongooseErrorHandler.handleError(error)
				return res.status(400).json(failureResponse)
			})
	}),
)

router.get(
	'/fetchIndividualRecordDetails',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(async (req, res) => {
		try {
			return fetchSingleRecordForInitiations(req, res, IndividualRecord)
		} catch (error) {
			const failureResponse = mongooseErrorHandler.handleError(error)
			return res.status(400).json(failureResponse)
		}
	}),
)

router.put(
	'/deactivateindividualrecord',
	authMyPeeguUser,
	deleteStudents,
	asyncMiddleware(async (req, res) => {
		const { id } = req.body || {}
		if (!utils.isMongooseObjectId(id))
			return res.status(400).json(new FailureResponse(globalConstants.messages.notFound))

		const record = await IndividualRecord.findOne({
			_id: id,
			status: globalConstants.studentStatus.Active,
		}).populate({
			path: 'studentId',
			select: 'school',
		})

		const isAuthorisedSchool = utils.isAuthorisedSchool(
			req.user.assignedSchools,
			record.studentId.school,
		)
		if (!isAuthorisedSchool) {
			return res.status(400).json(new FailureResponse(globalConstants.messages.notAuthorised))
		}

		IndividualRecord.findByIdAndUpdate(id, { status: globalConstants.studentStatus.Inactive })
			.then((result) => {
				return res.json(new SuccessResponse(globalConstants.messages.recordDeleted))
			})
			.catch((error) => {
				const failureResponse = mongooseErrorHandler.handleError(error)
				return res.status(400).json(failureResponse)
			})
	}),
)

router.put(
	'/updateindividualrecord',
	authMyPeeguUser,
	editStudents,
	asyncMiddleware(async (req, res) => {
		const body = req.body || {}

		if (!utils.isMongooseObjectId(body.id))
			return res.status(400).json(new FailureResponse(globalConstants.messages.invalidId))
		const individualRecord = await IndividualRecord.findById(body.id).populate({
			path: 'school',
			select: 'school',
		})

		const isAuthorisedSchool = utils.isAuthorisedSchool(
			req.user.assignedSchools,
			individualRecord.school?._id,
		)
		if (!isAuthorisedSchool) {
			return res.status(400).json(new FailureResponse(globalConstants.messages.notAuthorised))
		}

		if (individualRecord) {
			//enum validations
			individualRecord.outcome =
				utils.isAValidString(body.outcome) &&
				globalConstants.individualMisc.outcome.includes(body.outcome)
					? body.outcome
					: individualRecord.outcome
			individualRecord.basedOn =
				utils.isAValidString(body.basedOn) &&
				globalConstants.individualMisc.basedOn.includes(body.basedOn)
					? body.basedOn
					: individualRecord.basedOn
			individualRecord.stype =
				utils.isAValidString(body.stype) &&
				globalConstants.individualMisc.stype.includes(body.stype)
					? body.stype
					: individualRecord.stype
			individualRecord.dimension =
				utils.isAValidString(body.dimension) &&
				globalConstants.individualMisc.dimension.includes(body.dimension)
					? body.dimension
					: individualRecord.dimension
			individualRecord.date = utils.isValidDate(body.date) ? body.date : individualRecord.date
			individualRecord.issues = body.issues ?? individualRecord.issues
			individualRecord.startTime = body.startTime ?? individualRecord.startTime
			individualRecord.endTime = body.endTime ?? individualRecord.endTime
			individualRecord.goals = body.goals ?? individualRecord.goals
			individualRecord.activity = body.activity ?? individualRecord.activity
			individualRecord.description = body.description ?? individualRecord.description
			individualRecord.purpose = body.purpose ?? individualRecord.purpose
			individualRecord.improvements = body.improvements ?? individualRecord.improvements
			individualRecord.comments = body.comments ?? individualRecord.comments
			individualRecord.tasksAssigned = body.tasksAssigned ?? individualRecord.tasksAssigned
			individualRecord.poa = body.poa ?? individualRecord.poa

			individualRecord
				.save()
				.then((result) => {
					return res.json(
						new SuccessResponse(globalConstants.messages.individualCaseUpdated),
					)
				})
				.catch((error) => {
					const failureResponse = mongooseErrorHandler.handleError(error)
					return res.status(400).json(failureResponse)
				})
		} else {
			return res.status(400).json(new FailureResponse(globalConstants.messages.notFound))
		}
	}),
)

router.post(
	'/fetch-seltracker-modules',
	authMyPeeguUser,
	viewStudents,
	asyncMiddleware(selServices.viewSELModule.bind(selServices)),
)

function mapDataToSchema(jsonData, returnMapping = false) {
	const mapping = {
		'Student ID': 'user_id',
		Date: 'date',
		'Session Start Time': 'startTime',
		'Session End Time': 'endTime',
		'Issue Reported or Identified': 'issues',
		Goals: 'goals',
		Activity: 'activity',
		Dimension: 'dimension',
		Description: 'description',
		Type: 'stype',
		'Is Based On': 'basedOn',
		Purpose: 'purpose',
		Outcome: 'outcome',
		'Improvement Areas': 'improvements',
		Comments: 'comments',
		'Task Assigned': 'tasksAssigned',
		'POA for Followup_Next Session': 'poa',
		Classroom: 'classroom',
		School: 'school',
	}

	const mappedData = {}

	for (const key in mapping) {
		const schemaField = mapping[key]
		const jsonValue = jsonData[key]

		if (jsonValue !== undefined) {
			mappedData[schemaField] = jsonValue
		}
	}
	if (returnMapping) return mapping
	return mappedData
}

async function fetchSingleRecordForInitiations(req, res, Model, student) {
	if (!utils.isMongooseObjectId(req.query?.id))
		return res.status(400).json(new FailureResponse(globalConstants.messages.invalidId))
	let Record

	if (student) {
		Record = await Model.findOne(
			{ _id: req.query?.id, status: globalConstants.schoolStatus.Active },
			{ __v: 0, createdAt: 0, updatedAt: 0 },
		).populate({
			path: 'school',
			select: 'school',
		})
	} else {
		Record = await Model.findOne(
			{ _id: req.query?.id, status: globalConstants.schoolStatus.Active },
			{ __v: 0, createdAt: 0, updatedAt: 0 },
		).populate({
			path: 'studentId',
			select: 'studentName className section -_id',
			populate: {
				path: 'school',
				select: 'school',
			},
		})
	}
	if (Record) {
		return res.json(Record)
	} else {
		return res.status(400).json(new FailureResponse(globalConstants.messages.notFound))
	}
}

module.exports = router