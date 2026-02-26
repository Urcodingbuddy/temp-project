const { STATUSES } = require('../../utility/localConstants')
const { Classrooms } = require('../../models/database/myPeegu-classroom')
const { Schools } = require('../../models/database/myPeegu-school')
const { Teacher } = require('../../models/database/myPeegu-teacher')
const { FailureResponse, SuccessResponse } = require('../../models/response/globalResponse')
const { TeacherHelperService } = require('./teacher-helper-service')
const utils = require('../../utility/utils')
const {
	sanitizeAndValidatePhoneNumber,
} = require('../../routes/myPeeguAdmin-portel/myPeeguFunctions')
const { default: mongoose } = require('mongoose')
const { MyPeeguUser } = require('../../models/database/myPeegu-user')
const { assessmentHelperService } = require('../assessments/assessment-helper-service')
const { IRIForTeachers } = require('../../models/database/IRI-for-teachers')
const { ProfilingForTeachers } = require('../../models/database/profiling-for-teachers')

class TeacherService extends TeacherHelperService {
	async fetchTeachersListBySchoolId(req, res) {
		const { schoolId } = req.params || {}

		const teachers =
			(await Teacher.find({ SchoolId: schoolId, isDeleted: { $ne: true } }).select(
				'_id teacher_id teacherName',
			)) ?? []
		return res.json(teachers)
	}

	async viewAllTeachers(req, res) {
		const PAGE_SIZE = req.body.pageSize || 10
		const page = req.body.page || 1
		const downloadAndFilter = req.query.downloadAndFilter === 'true' || false
		const skip = (page - 1) * PAGE_SIZE
		let query = { isDeleted: { $ne: true } }
		if (!req.user.isAdmin) {
			query.SchoolId = { $in: req.user.assignedSchools }
		}

		let totalCount = 0
		let sortFields = globalConstants.teacherSortFields

		if (req.body.filter) {
			if (req.body.filter.gender) {
				query.gender = req.body.filter.gender
			}
			if (req.body.filter.schoolIds && req.body.filter.schoolIds.length > 0) {
				query.SchoolId = {
					$in: req.body.filter.schoolIds.map((id) => new mongoose.Types.ObjectId(id)),
				}
			}
		}

		// const teachersCount = await Teacher.countDocuments({
		// 	teacher_id: { $regex: req.body.searchText, $options: 'i' },
		// 	isDeleted: { $ne: true },
		// })
		// console.log(teachersCount)

		// console.log(query)

		if (req.body.searchText && req.body.searchText.length > 2) {
			const searchFields = [
				'teacherName',
				'teacher_id',
				'schoolName',
				'mobileNumber',
				'email',
			]
			const searchQuery = utils.buildSearchQuery(req.body.searchText, searchFields)
			query.$or = searchQuery.$or
		}

		const sortOptions = utils.buildSortOptions(req.body, sortFields)

		const academicYear = await this.getCurrentAcademicYear()
		const pipeline = [
			{ $match: query },
			{
				$addFields: {
					classroomsJourney: {
						$filter: {
							input: '$classroomsJourney',
							as: 'item',
							cond: {
								$and: [
									{ $eq: ['$$item.isAssigned', true] },
									{
										$eq: [
											'$$item.academicYear',
											new mongoose.Types.ObjectId(academicYear._id),
										],
									},
								],
							},
						},
					},
				},
			},
			{ $unwind: { path: '$classroomsJourney', preserveNullAndEmptyArrays: true } },
			{
				$lookup: {
					from: 'classrooms',
					localField: 'classroomsJourney.classRoomId',
					foreignField: '_id',
					as: 'classroomDetail',
				},
			},
			{ $unwind: { path: '$classroomDetail', preserveNullAndEmptyArrays: true } },
			{
				$group: {
					_id: '$_id',
					teacherName: { $first: '$teacherName' },
					teacher_id: { $first: '$teacher_id' },
					scCode: { $first: '$scCode' },
					gender: { $first: '$gender' },
					email: { $first: '$email' },
					schoolName: { $first: '$schoolName' },
					status: { $first: '$status' },
					mobileNumber: { $first: '$mobileNumber' },
					schoolId: { $first: '$SchoolId' },
					classRoomIds: {
						$push: {
							$cond: [
								{ $gt: ['$classroomDetail._id', null] },
								{
									_id: '$classroomDetail._id',
									className: '$classroomDetail.className',
									section: '$classroomDetail.section',
									academicYear: '$classroomsJourney.academicYear',
									dateTime: '$classroomsJourney.assignedDate',
								},
								'$$REMOVE',
							],
						},
					},
				},
			},
			{ $sort: sortOptions },
			{ $skip: skip },
			{ $limit: PAGE_SIZE },
		]

		const teachers = await Teacher.aggregate(pipeline)
		if (downloadAndFilter) {
			const formattedData = teachers.map((item) => utils.formatTeacherData(item, true, false))
			return res.json(formattedData)
		}

		totalCount = await Teacher.countDocuments(query)
		return res.json({ data: teachers, page, pageSize: PAGE_SIZE, totalCount })
	}

	async updateTeacher(req, res) {
		const teacherId = req.params.id
		const body = req.body

		const { teacher_id, teacherName, gender, email, mobileNumber, schoolId } = body

		let acknowledgement = body.acknowledgement
		if (!acknowledgement) {
			acknowledgement = false
		}

		const existingTeacher = await Teacher.findById(teacherId)
		if (!existingTeacher) {
			return res
				.status(404)
				.json(new FailureResponse(globalConstants.messages.teacherNotFound))
		}

		// Here throw error if school updating for teacher and teacher already assigned to some classrooms
		if (existingTeacher.SchoolId?.toString() !== schoolId) {
			const classrooms = await Classrooms.find({
				teacher: existingTeacher._id,
				status: STATUSES.ACTIVE,
			})
			if (classrooms.length > 0) {
				return res
					.status(404)
					.json(
						new FailureResponse(
							globalConstants.messages.teacherAlreadyAssignedToClasses,
						),
					)
			}
		}

		const school = await Schools.findOne({ _id: schoolId }).select('_id school scCode')
		if (!school) {
			return res
				.status(404)
				.json(new FailureResponse(globalConstants.messages.schoolCodeNotFound))
		}

		existingTeacher.teacher_id = teacher_id ?? existingTeacher.teacher_id
		existingTeacher.teacherName = teacherName ?? existingTeacher.teacherName
		existingTeacher.gender = gender ?? existingTeacher.gender
		existingTeacher.scCode = school.scCode ?? existingTeacher.scCode
		existingTeacher.schoolName = school.school ?? existingTeacher.schoolName
		existingTeacher.SchoolId = school._id ?? existingTeacher.SchoolId
		existingTeacher.email = email ?? existingTeacher.email
		existingTeacher.mobileNumber = mobileNumber ?? existingTeacher.mobileNumber

		await existingTeacher.save()

		return res
			.status(200)
			.json(new SuccessResponse(globalConstants.messages.teacherUpdatedSuccessfully))
	}

	async updateTeacherClassroom(req, res) {
		const { classroomIds, academicYear, teacherId } = req.body

		let acknowledgement = req.body.acknowledgement || false
		const now = new Date()

		const teacher = await Teacher.findById(teacherId)
		if (!teacher) {
			return res
				.status(404)
				.json(new FailureResponse(globalConstants.messages.teacherNotFound))
		}

		const newClassroomIds = classroomIds.map((id) => id.toString())

		// Filter current assigned classrooms for the academic year
		const currentJourneys = teacher.classroomsJourney.filter(
			(j) => j.isAssigned && j.academicYear && j.academicYear.toString() === academicYear,
		)

		const currentClassroomIds = currentJourneys.map((j) => j.classRoomId.toString())

		const toRemove = currentJourneys
			.filter((j) => !newClassroomIds.includes(j.classRoomId.toString()))
			.map((j) => j.classRoomId.toString())

		const toAdd = newClassroomIds.filter((id) => !currentClassroomIds.includes(id))

		// ❌ No change check
		if (toAdd.length === 0 && toRemove.length === 0) {
			return res.status(400).json(new FailureResponse('Nothing to update.'))
		}

		// Step 3: Mark removed as unassigned
		for (let j of teacher.classroomsJourney) {
			if (
				j.academicYear &&
				j.academicYear.toString() === academicYear &&
				j.isAssigned &&
				toRemove.includes(j.classRoomId.toString())
			) {
				j.isAssigned = false
				j.unassignedDate = now
			}
		}

		// Step 4: Add new journeys
		for (let id of toAdd) {
			teacher.classroomsJourney.push({
				classRoomId: new mongoose.Types.ObjectId(id),
				academicYear: new mongoose.Types.ObjectId(academicYear),
				assignedDate: now,
				isAssigned: true,
			})
		}

		// Optional: Classroom side logic
		let ids = [...toRemove, ...toAdd]

		const classroomsWithTeacher = await Classrooms.find({
			_id: { $in: toAdd },
			teacher: { $exists: true },
		})

		if (!acknowledgement && classroomsWithTeacher.length > 0) {
			return res.json({ acknowledgement: 1 })
		}

		if (ids.length) {
			if (classroomIds.length === 0) {
				const classrooms = await Classrooms.find({
					teacher: teacherId,
					academicYear,
					status: STATUSES.ACTIVE,
				}).lean()

				if (classrooms.length > 0) {
					ids = classrooms.map((obj) => obj._id.toString())
				}
			}

			// remove teacher from all classroom of removed classroom ids
			await this.removeTeachersfromClassroom(ids)
		}

		if (toAdd.length) {
			// Remove classroom if the classroom which are adding present in any other teachers
			await this.removeClassroomFromOtherTeacher(toAdd, teacherId)

			// Add classrooms to teacher
			await this.addTeacherToClassroom(toAdd, teacherId)
		}

		await teacher.save()

		return res
			.status(200)
			.json(new SuccessResponse(globalConstants.messages.teacherUpdatedSuccessfully))
	}

	async uploadTeachers(req, res) {
		try {
			const { error, message, school } = await this.validateUserSchoolAndAY(req)
			if (error) {
				return res.status(400).json(new FailureResponse(message))
			}

			const body = req.body
			const encounteredTeacherIds = new Set()
			const encounteredTeacherEmails = new Set()
			const teachersForValidation = body.teachers
			const fieldDisplayNames = globalConstants.fieldDisplayNamesForTeachers
			const requiredFields = Object.keys(globalConstants.fieldDisplayNamesForTeachers)
			const existingTeachers = await Teacher.find({
				SchoolId: body.school,
				isDeleted: { $ne: true },
			})
				.select('teacher_id email')
				.lean()
			const newErrors = []

			if (body.teachers && Array.isArray(body.teachers)) {
				const isValidFormat = body.teachers.every((teacher) => {
					return (
						teacher.scCode && teacher.createdByName && Object.keys(teacher).length === 2
					)
				})

				if (isValidFormat) {
					return res
						.status(500)
						.json(new FailureResponse(globalConstants.messages.inValidFileUploaded))
				}
			}

			for (let i = 0; i < teachersForValidation.length; i++) {
				const errors = []
				const teacher = teachersForValidation[i]
				const missing = requiredFields.filter((field) => !teacher[field])

				if (missing.length > 0) {
					const missingError = `Row number ${i + 2} has invalid ${missing.map((field) => fieldDisplayNames[field]).join(', ')} field`
					errors.push(missingError)
				}

				if (!utils.isValidEmailFormat(teacher.email)) {
					const emailError = `Row number ${i + 2} has an invalid email format`
					errors.push(emailError)
				}

				if (
					teacher.mobileNumber &&
					(teacher.mobileNumber.length < 10 || teacher.mobileNumber.length > 15)
				) {
					const mobileError = `Row number ${i + 2} has an invalid mobile number length`
					errors.push(mobileError)
				}
				if (teacher.mobileNumber && !sanitizeAndValidatePhoneNumber(teacher.mobileNumber)) {
					const invalidPhoneError = `Row number ${i + 2} has invalid Phone Number field`
					errors.push(invalidPhoneError)
				}

				if (encounteredTeacherIds.has(teacher['teacher_id'])) {
					const duplicateError = `Row number ${i + 2} has duplicate Teacher Id field`
					errors.push(duplicateError)
				} else {
					encounteredTeacherIds.add(teacher['teacher_id'])
				}
				if (encounteredTeacherEmails.has(teacher['email'])) {
					const duplicateError = `Row number ${i + 2} has duplicate Teacher Email field`
					errors.push(duplicateError)
				} else {
					encounteredTeacherEmails.add(teacher['email'])
				}

				const existingTeacherMail = existingTeachers.find((t) => t.email === teacher.email)
				if (existingTeacherMail) {
					const teacherError = `Teacher already exists with email ${teacher.email} at row number ${i + 2}`
					errors.push(teacherError)
				}
				const existingTeacher_id = existingTeachers.find(
					(t) => t.teacher_id === teacher.teacher_id,
				)
				if (existingTeacher_id) {
					const teacherError = `Teacher already exists with teacher_id ${teacher.teacher_id} at row number ${i + 2}`
					errors.push(teacherError)
				}
				if (teacher?.teacher_id?.length > 15) {
					const teacherIdError = `${globalConstants.messages.teacherIdCantExc15Char} for Row number ${i + 2}`
					errors.push(teacherIdError)
				}

				if (errors.length > 0) {
					newErrors.push(...errors)
				}
			}

			if (newErrors.length > 0) {
				return res.status(400).json({
					message: globalConstants.messages.invalidFileCheckError,
					validationErrors: newErrors,
					fileContainsError: true,
				})
			}

			const teacherDataPromises = body.teachers.map(async (teacherData) => {
				const { teacher_id, teacherName, gender, email, mobileNumber, createdByName } =
					teacherData
				let teacherGender = ''
				if (gender) {
					teacherGender = gender.toLowerCase()
					if (teacherGender === 'm' || teacherGender === 'male') {
						teacherGender = 'Male'
					} else if (teacherGender === 'f' || teacherGender === 'female') {
						teacherGender = 'Female'
					} else {
						teacherGender = ''
					}
				}

				return {
					teacher_id,
					teacherName,
					gender: teacherGender,
					status: 'Created',
					scCode: school.scCode,
					schoolName: school.school,
					SchoolId: school._id,
					email,
					mobileNumber,
					createdByName,
				}
			})

			const recordsToInsert = await Promise.all(teacherDataPromises)

			if (recordsToInsert.length > 0) {
				try {
					// Generate ObjectIds manually before insertion
					const recordsWithIds = recordsToInsert.map((teacherData) => ({
						...teacherData,
						_id: new mongoose.Types.ObjectId(),
					}))

					const bulkOperations = recordsWithIds.map((teacherData) => ({
						insertOne: {
							document: teacherData,
						},
					}))

					const result = await Teacher.bulkWrite(bulkOperations)

					if (result && result.insertedCount === recordsToInsert.length) {
						// Extract the pre-generated IDs
						const insertedIds = recordsWithIds.map((record) => record._id)

						// Here creating profiling and iri for teachers if there is any active profiling for school and iri for school
						if (insertedIds.length) {
							const activeProfilingForSchool =
								await assessmentHelperService.getActiveProfilingsForSchools([
									body.school,
								])

							if (activeProfilingForSchool.length) {
								const teachersProfilingData = insertedIds.map((id) => ({
									teacher: id,
									schoolProfilingId: activeProfilingForSchool[0]._id,
									academicYear: activeProfilingForSchool[0].academicYear,
									SAY: activeProfilingForSchool[0].SAY,
									school: body.school,
								}))
								await ProfilingForTeachers.insertMany(teachersProfilingData)
							}

							const activeIRIForSchool =
								await assessmentHelperService.getActiveIRIsForSchools([body.school])
							if (activeIRIForSchool.length) {
								const teachersIRIData = insertedIds.map((id) => ({
									teacher: id,
									schoolIRIId: activeIRIForSchool[0]._id,
									academicYear: activeIRIForSchool[0].academicYear,
									SAY: activeIRIForSchool[0].SAY,
									school: body.school,
								}))
								await IRIForTeachers.insertMany(teachersIRIData)
							}
							assessmentHelperService.updateCountsInProfilingsAndIRIs([body.school])
						}

						res.json(
							new SuccessResponse(
								globalConstants.messages.teachersCreatedSuccessfully,
								{
									insertedCount: result.insertedCount,
									insertedIds: insertedIds,
								},
							),
						)
					}
				} catch (error) {
					console.error(error)
					return res
						.status(500)
						.json(new FailureResponse(globalConstants.messages.serverError))
				}
			}
		} catch (error) {
			console.error(error)
			return res.status(500).json(new FailureResponse(globalConstants.messages.serverError))
		}
	}

	async deleteTeacher(req, res) {
		const teacherId = req.params.id

		const existingTeacher = await Teacher.findById(teacherId)
		if (!existingTeacher) {
			return res
				.status(404)
				.json(new FailureResponse(globalConstants.messages.TeacherNotFound))
		}

		const teacherAssignedClassroom = await Classrooms.find({
			teacher: { $in: [teacherId] },
		})
		if (teacherAssignedClassroom.length > 0) {
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.teacherCannotBeDeleted))
		}

		const classroomsWithTeacherJourney = await Classrooms.find({
			'teacherJourney.teacherId': { $in: [teacherId] },
		}).select('_id teacherJourney')

		await MyPeeguUser.deleteOne({ email: existingTeacher.email })
		if (classroomsWithTeacherJourney.length > 0) {
			const classroomBulk = []
			for (const classroom of classroomsWithTeacherJourney) {
				const update = { teacher: null }
				const journey = classroom.teacherJourney
				if (journey && journey.length > 0) {
					journey[journey.length - 1] = {
						...journey[journey.length - 1],
						endDate: Date.now(),
					}
					update['teacherJourney'] = journey
				}
				classroomBulk.push({
					updateOne: {
						filter: { _id: classroom._id },
						update: { $set: update },
					},
				})
			}
			await Teacher.updateOne({ _id: teacherId }, { isDeleted: true })
			await Classrooms.bulkWrite(classroomBulk)
			await assessmentHelperService.deleteProfilingAndIriRecords(
				teacherId,
				existingTeacher.SchoolId,
			)
		} else {
			await Teacher.deleteOne({ _id: teacherId })
			await assessmentHelperService.deleteProfilingAndIriRecords(
				teacherId,
				existingTeacher.SchoolId,
				true,
			)
		}

		await assessmentHelperService.updateCountsInProfilingsAndIRIs([existingTeacher.SchoolId])

		return res.status(200).json(new SuccessResponse(globalConstants.messages.teacherDeleted))
	}

	async fetchTeacherClassrooms(req, res) {
		const { id } = req.params
		const teacher = await Teacher.findOne({ _id: id, isDeleted: { $ne: true } }).populate(
			'classroomsJourney.classRoomId',
		)
		if (!teacher) {
			return res
				.status(404)
				.json(new FailureResponse(globalConstants.messages.teacherNotFound))
		}

		const teacherClassrooms = utils.isAValidArray(teacher.classroomsJourney)
			? teacher.classroomsJourney
					.filter((obj) => obj.isAssigned == true)
					.map((obj) => ({
						_id: obj.classRoomId._id,
						className: obj.classRoomId.className,
						section: obj.classRoomId.section,
						academicYear: obj.academicYear,
					}))
			: []

		return res.status(200).json(teacherClassrooms)
	}
}

const teacherService = new TeacherService()
module.exports.teacherService = teacherService
