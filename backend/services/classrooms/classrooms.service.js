const { SchoolAcademicYears } = require('../../models/database/school-academic-years')
const { AcademicYears } = require('../../models/database/academic-years')
const { ALL_FIELDS, STATUSES } = require('../../utility/localConstants')
const { CommonClassroomServices } = require('./common-classroom.service')
const { Classrooms } = require('../../models/database/myPeegu-classroom')
const { Schools } = require('../../models/database/myPeegu-school')
const { Teacher } = require('../../models/database/myPeegu-teacher')
const { FailureResponse, SuccessResponse } = require('../../models/response/globalResponse')
const utils = require('../../utility/utils')
const mongooseErrorHandler = require('../../utility/mongooseErrorHandler')
const { mongoose } = require('mongoose')
const { Students } = require('../../models/database/myPeegu-student')

class ClassroomService extends CommonClassroomServices {
	async fetchAllClassrooms(req, res) {
		let SAYs = []
		let academicYear = []
		if (req.body.filter && req.body.filter.academicYear) {
			academicYear = req.body.filter.academicYear
			SAYs = await this.fetchSAYsByAcademicYear(req.body.filter.academicYear)
		} else {
			SAYs = await this.fetchSAYsOfCurAY(req.user)
			academicYear = [await this.getCurrentAcademicYear()]
		}
		if (SAYs.length === 0) {
			return res.json({
				data: [],
				page: req.body.page || 1,
				pageSize: req.body.pageSize || 10,
				totalCount: 0,
			})
		}

		const downloadAndFilter = req.query.downloadAndFilter === 'true' || false
		const PAGE_SIZE = req.body.pageSize || 10
		const page = req.body.page || 1
		const skip = (page - 1) * PAGE_SIZE
		const query = {
			status: globalConstants.schoolStatus.Active,
			academicYear: {
				$in: academicYear.map((id) => new mongoose.Types.ObjectId(id)),
			},
		}
		let records
		let sortOptions
		if (!req.user.isAdmin) query.school = { $in: req.user.assignedSchools }

		let searchQuery = {}
		if (req.body.searchText && req.body.searchText.length > 0) {
			const searchFields = [
				'className',
				'section',
				'school.school',
				'teacher.teacherName',
				'teacher.email',
				'teacher.phone',
			]
			searchQuery = utils.buildSearchQuery(req.body.searchText, searchFields)
		}

		function buildQuery(query, sortOptions, downloadAndFilter) {
			let bQuery = [
				{
					$match: { ...query },
				},
				{
					$lookup: {
						from: 'schools',
						localField: 'school',
						foreignField: '_id',
						as: 'schoolData',
					},
				},
				{
					$unwind: '$schoolData',
				},
				{
					$lookup: {
						from: 'teachers',
						localField: 'teacher',
						foreignField: '_id',
						as: 'teacherData',
					},
				},
				{
					$unwind: {
						path: '$teacherData',
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$match: {
						'teacherData.isDeleted': { $ne: true },
					},
				},
				{
					$lookup: {
						from: 'academic-years',
						localField: 'academicYear',
						foreignField: '_id',
						as: 'academicYearData',
					},
				},
				{
					$unwind: {
						path: '$academicYearData',
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$addFields: {
						school: {
							$cond: {
								if: downloadAndFilter,
								then: '$schoolData.school',
								else: {
									school: '$schoolData.school',
									logoUrl: '$schoolData.logoUrl',
									status: '$schoolData.status',
									_id: '$schoolData._id',
								},
							},
						},
					},
				},
				{
					$addFields: {
						academicYear: '$academicYearData.academicYear',
						academicYearId: '$academicYearData._id',
					},
				},
			]

			// If request for download then add 3 different fields otherwise add 1 object with 3 key-value pairs.
			// For download field need 3 different keys because while downloding nested values are not supprted.
			if (downloadAndFilter) {
				bQuery = [
					...bQuery,
					{
						$addFields: {
							teacherName: '$teacherData.teacherName',
						},
					},
					{
						$addFields: {
							email: '$teacherData.email',
						},
					},
					{
						$addFields: {
							phone: '$teacherData.mobileNumber',
						},
					},
				]
			} else {
				bQuery = [
					...bQuery,
					{
						$addFields: {
							teacher: {
								teacherName: '$teacherData.teacherName',
								email: '$teacherData.email',
								phone: '$teacherData.mobileNumber',
								_id: '$teacherData._id',
							},
						},
					},
				]
			}

			bQuery = [
				...bQuery,
				{
					$match: {
						'schoolData.status': globalConstants.schoolStatus.Active,
					},
				},
			]

			if (Object.keys(searchQuery).length > 0 && !downloadAndFilter) {
				bQuery.push({
					$match: searchQuery,
				})
			}

			if (sortOptions && Object.keys(sortOptions)?.length > 0) {
				bQuery.push({ $sort: sortOptions })
			}

			bQuery.push({
				$project: {
					__v: 0,
					SAY: 0,
					schoolData: 0,
					academicYearData: 0,
					teacherData: 0,
					teacherJourney: 0,
					schoolData: 0,
					schoolData: 0,
					createdAt: 0,
					updatedAt: 0,
					updatedById: 0,
				},
			})
			return bQuery
		}

		let sortFields = globalConstants.classroomSortFields
		if (req.body.sortKeys) {
			sortOptions = utils.buildSortOptions(req.body, sortFields)
		}

		if (req.body.filter) {
			if (req.body?.filter?.status) {
				const filters = req.body.filter?.status ?? miscellaneous.classroomStatus.Active
				const filteredArray = Object.keys(miscellaneous.classroomStatus).filter((element) =>
					filters.includes(element),
				)
				query.status = utils.isAValidArray(filteredArray)
					? { $in: filteredArray }
					: globalConstants.classroomStatus.Active
			}
			if (utils.isAValidArray(req.body.filter.classroomIds)) {
				query._id = {
					$in: req.body.filter.classroomIds.map((id) => new mongoose.Types.ObjectId(id)),
				}
			} else if (utils.isAValidArray(req.body.filter.schoolIds)) {
				query.school = utils.isAValidArray(req.body.filter.schoolIds)
					? {
							$in: req.body.filter.schoolIds.map(
								(id) => new mongoose.Types.ObjectId(id),
							),
						}
					: { $in: req.user.assignedSchools }
			} else {
				if (!req.user.isAdmin) query.school = { $in: req.user.assignedSchools }
			}
		}

		const pipeline = [
			{
				$facet: {
					totalCount: [
						...buildQuery(query, sortOptions, downloadAndFilter),
						{ $count: 'Count' },
					],
					data: [
						...buildQuery(query, sortOptions, downloadAndFilter),
						{ $skip: skip },
						{ $limit: PAGE_SIZE },
					],
				},
			},
		]

		records = await Classrooms.aggregate(pipeline)

		if (downloadAndFilter) {
			if (records[0]?.data) {
				const modifiedData = records[0].data.map((item) => {
					const school = item.school
					delete item.schoolName

					delete item._id
					delete item.school
					delete item.teacher

					function toNormalCase(str) {
						return str.replace(/([a-z])([A-Z])/g, '$1 $2')
					}
					function capitalizeFirstLetter(str) {
						return str.replace(/\b\w/g, (match) => match.toUpperCase())
					}
					const normalCaseData = {}
					for (const key in item) {
						normalCaseData[capitalizeFirstLetter(toNormalCase(key))] = item[key]
					}

					return { 'School Name': school, ...normalCaseData }
				})

				return res.json(modifiedData)
			} else {
				return res.json([])
			}
		} else {
			return res.json({
				data: records[0]?.data,
				page,
				pageSize: PAGE_SIZE,
				totalCount: records[0]?.totalCount[0]?.Count,
			})
		}
	}

	async uploadClassrooms(req, res) {
		const body = req.body
		const allTeachers = await Teacher.find({
			SchoolId: body.school,
			isDeleted: { $ne: true },
		}).lean()

		const { error, message, school, SAY, academicYear } =
			await this.validateUserSchoolAndAY(req)
		if (error) {
			return res.status(400).json(new FailureResponse(message))
		}

		const existingClassroomsInDB = await Classrooms.find({
			school: body.school,
			academicYear: body.academicYear,
			status: STATUSES.ACTIVE,
		})

		const classroomData = body.classrooms || []
		let recordsToInsert = []
		let newErrors = []
		const teacherClassroomMap = new Map()

		for (let i = 0; i < classroomData.length; i++) {
			const errors = []

			const currentData = classroomData[i]
			const missingKeys = globalConstants.classRoomsRequiredFields.filter(
				(key) => !currentData[key],
			)
			if (missingKeys.length > 0) {
				errors.push(`Row number ${i + 2} has invalid ${missingKeys.join(', ')} field`)
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

		// Grouping classes by "Class Name" and "School" outside the loop
		const groupedClasses = classroomData.reduce((acc, classroom) => {
			const key = `${school.scCode}-${classroom['Class Name']}`
			if (!acc[key]) {
				acc[key] = []
			}
			acc[key].push(classroom)
			return acc
		}, {})

		const allErrors = []
		const missingErrors = []
		let sectionHierarchiesByClass = {}
		const uniqueClassrooms = new Set()
		for (let i = 0; i < classroomData.length; i++) {
			const _id = new mongoose.Types.ObjectId()
			const currentData = classroomData[i]

			let mappedData = this.mapClassroomDataToSchema(currentData)
			if (
				existingClassroomsInDB.find((obj) => {
					return (
						obj.className === mappedData.className &&
						obj.section === mappedData.section &&
						obj.academicYear &&
						obj.academicYear.toString() === academicYear._id.toString()
					)
				})
			) {
				missingErrors.push(globalConstants.messages.invalidClassroomData)
			}

			// Validate sectionHierarchy
			const sectionHierarchy = parseInt(mappedData.sectionHierarchy)
			if (
				!Number.isInteger(sectionHierarchy) ||
				sectionHierarchy <= 0 ||
				mappedData.sectionHierarchy !== sectionHierarchy.toString()
			) {
				const invalidSectionHierarchyError = `Invalid Section Hierarchy for row number ${i + 2} for school ${school.school}`
				missingErrors.push(invalidSectionHierarchyError)
			}

			const isClassHeirarchyExist = existingClassroomsInDB.find((c) => {
				return (
					c.classHierarchy === parseInt(mappedData.classHierarchy) &&
					c.section === mappedData.section &&
					c.academicYear &&
					c.academicYear.toString() === academicYear._id.toString()
				)
			})
			// validation for checking incoming "Class Hierarchy" exist for some classroom in DB
			if (isClassHeirarchyExist) {
				missingErrors.push(
					`Class Hierarchy '${
						mappedData.classHierarchy
					}' already exists at row number ${i + 2} for school ${school.school}`,
				)
			}

			const isClassSectionHeirarchyExist = existingClassroomsInDB.find((c) => {
				return (
					c.className === mappedData.className &&
					c.sectionHierarchy === parseInt(mappedData.sectionHierarchy) &&
					c.academicYear &&
					c.academicYear.toString() === academicYear._id.toString()
				)
			})
			// validation for checking incoming "Class Section Hierarchy" exist for some classroom in DB
			if (isClassSectionHeirarchyExist) {
				const duplicateClassSectionHierarchyError = `Section Hierarchy '${
					mappedData.sectionHierarchy
				}' already exists at row number ${i + 2} for other class at school ${school.school}`
				missingErrors.push(duplicateClassSectionHierarchyError)
			}

			//validation for Checking for duplicate class and section combinations in the request body itself
			const classSectionKey = `${mappedData.className}-${mappedData.section}`
			if (uniqueClassrooms.has(classSectionKey)) {
				const duplicateError = `Duplicate entry for class '${mappedData.className}' and section '${
					mappedData.section
				}' at row number ${i + 2} for school ${school.school}`
				missingErrors.push(duplicateError)
			} else {
				// Add the combination to the Set if it doesn't exist
				uniqueClassrooms.add(classSectionKey)
			}

			//validation for checking if classHierarchy field is there in the body itself or not
			const classHierarchy = parseInt(mappedData.classHierarchy)
			if (!mappedData.hasOwnProperty('classHierarchy')) {
				const classHierarchyError = `Class Hierarchy is missing for row number ${i + 2} for school ${school.school}`
				missingErrors.push(classHierarchyError)
			} else if (
				!Number.isInteger(classHierarchy) ||
				classHierarchy <= 0 ||
				mappedData.classHierarchy !== classHierarchy.toString()
			) {
				const invalidClassHierarchyError = `Invalid Class Hierarchy for row number ${i + 2} for school ${school.school}`
				missingErrors.push(invalidClassHierarchyError)
			} else {
				// validation for checking if classes with same className have same classHerarchy or not

				// Get the grouped classes using the current school and className as the key
				const groupKey = `${school.scCode}-${mappedData.className}`
				const classroomsWithSameName = groupedClasses[groupKey] || []
				// Extract the unique classHierarchies associated with the className
				const uniqueClassHierarchies = new Set(
					classroomsWithSameName.map((c) => parseInt(c['Class Hierarchy'])),
				)
				// Check if a class already exists with sections
				const currentClass = existingClassroomsInDB.find(
					(c) => c.className === mappedData?.className,
				)
				if (currentClass) {
					// Ensure that the classHierarchy for the new section matches the existing classHierarchy
					if (parseInt(mappedData?.classHierarchy) !== currentClass?.classHierarchy) {
						const mismatchClassHierarchyError = `Mismatch in Class Hierarchy. The existing class '${
							mappedData.className
						}' in school ${school.school} has Class Hierarchy '${
							currentClass?.classHierarchy
						}', but a new section with Class Hierarchy '${mappedData?.classHierarchy}' was provided at row number ${i + 2}.`
						missingErrors.push(mismatchClassHierarchyError)
					}
				}

				// If there's more than one unique classHierarchy in the group, it's an error
				if (
					uniqueClassHierarchies.size > 1 ||
					(uniqueClassHierarchies.size === 1 &&
						!uniqueClassHierarchies.has(parseInt(mappedData.classHierarchy)))
				) {
					const duplicateClassHierarchyError = `Different Class Hierarchy '${
						mappedData.classHierarchy
					}' found for Class Name '${mappedData.className}' at row number ${i + 2} for school ${school.school}`
					missingErrors.push(duplicateClassHierarchyError)
				}
			}

			if (!sectionHierarchiesByClass.hasOwnProperty(mappedData.className)) {
				sectionHierarchiesByClass[mappedData.className] = new Set()
			}

			// Check for duplicate sectionHierarchy within the same className
			if (sectionHierarchiesByClass[mappedData.className].has(mappedData.sectionHierarchy)) {
				// If sectionHierarchy is not unique, throw an error
				const duplicateSectionHierarchyError = `Duplicate Section Hierarchy '${
					mappedData.sectionHierarchy
				}' found for Class Name '${mappedData.className}' at row number ${i + 2} for school ${school.school}`
				missingErrors.push(duplicateSectionHierarchyError)
			} else {
				// Add the sectionHierarchy to the set
				sectionHierarchiesByClass[mappedData.className].add(mappedData.sectionHierarchy)
			}

			mappedData['SAY'] = SAY._id
			mappedData['academicYear'] = academicYear._id
			if (mappedData['teacherId']) {
				const teacher = allTeachers.find(
					(obj) => obj.teacher_id === mappedData['teacherId'],
				)
				if (!teacher) {
					missingErrors.push(
						`${globalConstants.messages.invalidField.replaceField(ALL_FIELDS.TEACHER)} at row no ${i + 2}`,
					)
				} else if (
					!teacher.SchoolId ||
					(teacher.SchoolId && teacher.SchoolId.toString() !== body.school)
				) {
					missingErrors.push(
						`Teacher with id ${mappedData['teacherId']} does not belongs to selected school at row no ${i + 2}`,
					)
				} else {
					mappedData['teacher'] = teacher._id
					mappedData['teacherJourney'] = {
						teacherId: teacher._id,
						startDate: Date.now(),
						endDate: null,
					}

					if (!teacherClassroomMap.has(teacher._id.toString())) {
						const teacherClassrooms = teacher.classroomsJourney.map((obj) =>
							obj.classRoomId.toString(),
						)
						teacherClassroomMap.set(
							teacher._id.toString(),
							new Set(teacherClassrooms || []),
						)
					}
					teacherClassroomMap.get(teacher._id.toString()).add(_id)
				}
			}

			if (missingErrors.length > 0) {
				allErrors.push(missingErrors)
			} else {
				const data = {
					...mappedData,
					_id,
					school: body.school,
					SAY: SAY._id,
					academicYear: academicYear._id,
					classHierarchy: parseInt(mappedData.classHierarchy),
					sectionHierarchy: parseInt(mappedData.sectionHierarchy),
				}
				delete data.id
				recordsToInsert.push(data)
			}
		}
		sectionHierarchiesByClass = {}
		uniqueClassrooms.clear()

		if (allErrors.length > 0) {
			return res.status(400).json({
				message: globalConstants.messages.invalidFileCheckError,
				validationErrors: missingErrors,
				fileContainsError: true,
			})
		}

		const teacherBulkOps = []
		for (const [teacherId, classroomIdSet] of teacherClassroomMap.entries()) {
			const teacher = allTeachers.find((t) => t._id.toString() === teacherId)
			if (!teacher) continue

			const newJourneys = []
			for (const classRoomId of classroomIdSet) {
				// Avoid duplicate journeys
				const alreadyAssigned = teacher.classroomsJourney?.some(
					(j) =>
						j.classRoomId?.toString() === classRoomId.toString() &&
						j.academicYear?.toString() === academicYear._id.toString() &&
						j.isAssigned === true,
				)
				if (!alreadyAssigned) {
					newJourneys.push({
						classRoomId: new mongoose.Types.ObjectId(classRoomId),
						academicYear: academicYear._id,
						assignedDate: new Date(),
						isAssigned: true,
					})
				}
			}

			if (newJourneys.length) {
				teacherBulkOps.push({
					updateOne: {
						filter: { _id: new mongoose.Types.ObjectId(teacherId) },
						update: {
							$push: {
								classroomsJourney: { $each: newJourneys },
							},
						},
					},
				})
			}
		}

		// All records passed validation, insert them into the database using insertMany
		Classrooms.insertMany(recordsToInsert)
			.then(async () => {
				await Teacher.bulkWrite(teacherBulkOps)
				return res.json(new SuccessResponse(globalConstants.messages.classRoomsCreated))
			})
			.catch((error) => {
				const failureResponse = mongooseErrorHandler.handleError(error)
				return res.status(400).json(failureResponse)
			})
	}

	async updateClassroom(req, res) {
		const {
			id,
			school,
			className,
			section,
			classHierarchy,
			sectionHierarchy,
			teacher: teacherId,
		} = req.body || {}

		if (teacherId) {
			const teacher = await Teacher.findOne({ _id: teacherId, isDeleted: { $ne: true } })
			if (!teacher) {
				return res
					.status(400)
					.json(
						new FailureResponse(
							globalConstants.messages.invalidField.replaceField(ALL_FIELDS.TEACHER),
						),
					)
			}
		}

		if (!utils.isMongooseObjectId(id) || !utils.isMongooseObjectId(school)) {
			return res.status(400).json(new FailureResponse(globalConstants.messages.invalidId))
		}

		const classroom = await Classrooms.findOne({ _id: id })
		if (
			!classroom ||
			!req.user.assignedSchools
				.map((id) => id.toString())
				.includes(classroom.school.toString())
		) {
			return res.status(400).json(new FailureResponse(globalConstants.messages.notFound))
		}
		const AY = classroom.academicYear
		const oldClassName = classroom?.className
		const existingTeacherId = classroom.teacher?.toString()
		const newTeacherId = teacherId
		const teacherChanged = existingTeacherId !== newTeacherId

		if (teacherChanged) {
			classroom.teacherJourney = this.updateTeacherJourney(
				classroom.teacherJourney || [],
				newTeacherId,
			)

			// Update the classroom here if teacher only changed and rest of everything are same.
			if (
				classroom.className === className &&
				classroom.section === section &&
				classroom.classHierarchy === classHierarchy &&
				classroom.sectionHierarchy === sectionHierarchy
			) {
				await this.removeClassroomsFromTeachers([
					{ _id: classroom._id, teacher: existingTeacherId },
				])
				if (newTeacherId) {
					await this.addClassroomsToTeacher(classroom, newTeacherId)
				}
				classroom.teacher = teacherId
				await classroom.save()
				await Classrooms.updateMany(
					{ school: school, className: oldClassName },
					{ $set: { className: className, classHierarchy: classHierarchy } },
				)
				return res.json(new SuccessResponse(globalConstants.messages.classRoomUpdated))
			}
		}

		const existingClassHierarchy = await Classrooms.find({
			school: school,
			academicYear: AY,
			classHierarchy: classHierarchy,
			className: { $ne: oldClassName },
			status: globalConstants.schoolStatus.Active,
		}).select('_id className classHierarchy')

		if (existingClassHierarchy?.length > 0) {
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.classHierarchyAlreadyExists))
		}

		const isSectionHierarchyExist = await Classrooms.findOne({
			school: school,
			academicYear: AY,
			className,
			sectionHierarchy,
			status: globalConstants.schoolStatus.Active,
		}).select('className section classHierarchy sectionHierarchy')

		classroom.className = className ?? classroom.className
		classroom.section = section ?? classroom.section

		if (classroom.teacher && teacherId && classroom.teacher.toString() !== teacherId) {
			classroom.teacher = teacherId
			const updatedTeacherJourney = this.updateTeacherJourney(classroom.teacherJourney)
			classroom.teacherJourney = updatedTeacherJourney
		}

		// This should be after swapping the hierarchy in the above code.
		classroom.classHierarchy = classHierarchy

		if (isSectionHierarchyExist) {
			isSectionHierarchyExist.sectionHierarchy = classroom.sectionHierarchy
			isSectionHierarchyExist.save()
		}
		// else {
		classroom.sectionHierarchy = sectionHierarchy ?? classroom.sectionHierarchy
		classroom.updatedById = req.user._id
		classroom.updatedByName = req.user.fullName

		const recordExists = await Classrooms.find({
			_id: { $ne: classroom._id },
			school: school,
			academicYear: AY,
			className: classroom.className,
			section: classroom.section,
			status: globalConstants.schoolStatus.Active,
		})
		if (utils.isAValidArray(recordExists)) {
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.invalidClassroomData))
		}

		if (teacherChanged) {
			await this.removeClassroomsFromTeachers([classroom])
			if (newTeacherId) {
				await this.addClassroomsToTeacher(classroom, newTeacherId)
			}
		}
		classroom.teacher = teacherId
		await classroom.save()
		await Classrooms.updateMany(
			{ school: school, className: oldClassName },
			{ $set: { className: className, classHierarchy: classHierarchy } },
		)
		return res.json(new SuccessResponse(globalConstants.messages.classRoomUpdated))
	}

	async deleteSingleClassroom(req, res) {
		const { id } = req.body || {}

		if (!utils.isMongooseObjectId(id)) {
			return res.status(400).json(new FailureResponse(globalConstants.messages.notFound))
		}
		const classroom = await Classrooms.findOne({
			_id: id,
			status: globalConstants.schoolStatus.Active,
			school: { $in: req.user.assignedSchools },
		})
		if (!classroom) {
			return res.status(400).json(new FailureResponse(globalConstants.messages.notFound))
		}
		const studentsCount = await Students.countDocuments({
			'studentsJourney.classRoomId': { $in: [id] },
			graduated: false,
			exited: false,
		})
		if (studentsCount > 0) {
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.cannotDeleteClassroom))
		}

		classroom.status = globalConstants.schoolStatus.Inactive

		await classroom.save()
		await this.removeClassroomsFromTeachers([classroom])
		return res.json(new SuccessResponse(globalConstants.messages.recordDeleted))
	}

	async deleteMultipleClassrooms(req, res) {
		const { classroomIds } = req.body

		if (!utils.isAValidArray(classroomIds)) {
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.invalidClassIdsProvided))
		}

		const classrooms = await Classrooms.find({
			_id: { $in: classroomIds },
			status: STATUSES.ACTIVE,
		})

		if (classrooms.length === 0) {
			return res
				.status(404)
				.json(new FailureResponse(globalConstants.messages.noClassFoundWithProvidedIds))
		}

		const studentsCount = await Students.countDocuments({
			'studentsJourney.classRoomId': { $in: classroomIds },
			graduated: false,
			exited: false,
		})

		if (studentsCount > 0) {
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.cannotDeleteClassroom))
		}

		const result = await Classrooms.updateMany(
			{ _id: { $in: classroomIds } },
			{ $set: { status: globalConstants.schoolStatus.Inactive } },
		)

		if (result.modifiedCount === 0) {
			return res
				.status(404)
				.json(new FailureResponse(globalConstants.messages.noClassFoundWithProvidedIds))
		}

		await this.removeClassroomsFromTeachers(classrooms)

		return res.json(
			new SuccessResponse(
				globalConstants.messages.deleted.replaceField(`${ALL_FIELDS.CLASSROOM}s`),
			),
		)
	}

	/**
	 * This function will get active teachers of given classrooms and from each teacher it will remove these classrooms
	 * @param {*} classrooms
	 * @returns
	 */
	async addClassroomsToTeacher(classroom, teacherId) {
		const teacher = await Teacher.findOne({ _id: teacherId, isDeleted: { $ne: true } })
		let classroomsJourney = teacher.classroomsJourney ?? []
		const journey = {
			classRoomId: classroom._id,
			academicYear: classroom.academicYear,
			assignedDate: new Date(),
			isAssigned: true,
		}
		classroomsJourney = [...classroomsJourney, journey]
		await Teacher.updateOne(
			{ _id: teacherId, isDeleted: { $ne: true } },
			{ $set: { classroomsJourney } },
		)
	}

	updateTeacherJourney(teacherJourney, teacherId) {
		let journey = teacherJourney ? teacherJourney.toObject() : []
		const today = new Date()
		if (teacherId) {
			if (journey.length > 0) {
				// If there are teacher journey available and last journeys end date is null
				// then update last journeys end date as current date and
				// add new journey with teacher id & start date as current date
				if (!journey[journey.length - 1].endDate) {
					journey[journey.length - 1].endDate = today
				}
				journey.push({
					teacherId: new mongoose.Types.ObjectId(teacherId),
					startDate: today,
					endDate: null,
				})
			} else {
				// If teacher journey is empty or no teacher journey is available then add new journey with teacher id & start date as current date
				journey = [
					{
						teacherId: new mongoose.Types.ObjectId(teacherId),
						startDate: today,
						endDate: null,
					},
				]
			}
		} else {
			if (journey.length > 0) {
				if (!journey[journey.length - 1].endDate) {
					journey[journey.length - 1].endDate = today
				}
			}
		}

		return journey
	}
}

const classroomService = new ClassroomService()
module.exports.classroomService = classroomService
