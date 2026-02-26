const { AcademicYears } = require('../../models/database/academic-years')
const { Classrooms } = require('../../models/database/myPeegu-classroom')
const { States } = require('../../models/database/states')
const { globalServices } = require('../global-service')
const { Schools } = require('../../models/database/myPeegu-school')
const { mongoose } = require('mongoose')
const utils = require('../../utility/utils')
const { Students } = require('../../models/database/myPeegu-student')
const { studentStatus } = require('../../utility/constants')
const { SchoolAcademicYears } = require('../../models/database/school-academic-years')
const { Teacher } = require('../../models/database/myPeegu-teacher')
const { FailureResponse } = require('../../models/response/globalResponse')
const { request } = require('bwip-js')
const { STATUSES } = require('../../utility/localConstants')
const { cacheService } = require('../../cache/cashe.service')

class CommonServices {
	async fetchAcademicYears() {
		return await AcademicYears.find()
	}

	async fetchStates(req, res) {
		const countryId = req.params.country_id
		const states = await States.find({ country: countryId }).select('_id name')
		return res.json(states)
	}

	async fetchSchoolsList(req, res, sendResponse = true) {
		const query = {
			status: globalConstants.schoolStatus.Active,
		}
		let allSchools = []
		let academicYears = req.body.filter?.academicYear
		if (!academicYears || academicYears.length === 0) {
			const curAY = await globalServices.getCurrentAcademicYear()
			academicYears = [curAY._id]
		}

		const SAYs = await globalServices.fetchSAYsByAcademicYear(academicYears)
		if (SAYs.length === 0) {
			return res.json(allSchools)
		}

		const uniqSchoolIds = []
		for (const SAY of SAYs) {
			const school = SAY.school
			if (school && !uniqSchoolIds.includes(school.toString())) {
				uniqSchoolIds.push(school.toString())
			}
		}

		if (req?.user?.permissions[0] === globalConstants.teacher) {
			const teacher = await Teacher.findOne({ email: req?.user?.email, isDeleted: {$ne: true} })
			if (
				teacher &&
				teacher.SchoolId &&
				uniqSchoolIds.includes(teacher.SchoolId.toString())
			) {
				query._id = { $in: [teacher.SchoolId] }
			} else {
				return res.json(allSchools)
			}
		} else if (!req.user.isAdmin) {
			const schoolIds = req.user.assignedSchools.filter((scId) =>
				uniqSchoolIds.includes(scId.toString()),
			)
			if (utils.isAValidArray(schoolIds)) {
				query._id = { $in: schoolIds }
			} else {
				return res.json(allSchools)
			}
		} else {
			query._id = { $in: uniqSchoolIds }
		}

		// Apply search text filter if provided
		if (req.body.searchText && req.body.searchText.trim()) {
			const searchFields = ['school', 'scCode']
			const searchQuery = utils.buildSearchQuery(req.body.searchText, searchFields)
			query.$or = searchQuery.$or
		}

		allSchools = await Schools.find(query, {
			school: 1,
			_id: 1,
			logoUrl: 1,
			scCode: 1,
			status: 1,
			lastPromotionDate: 1,
			lastPromotionAcademicYear: 1,
		}).collation({ locale: 'en' })

		if (sendResponse && res) return res.json(allSchools)
		return allSchools
	}

	async fetchClassroomsList(req, res, sendResponse = true) {
		let schoolIds = []
		if (req.body.filter && utils.isAValidArray(req.body.filter.schoolIds)) {
			schoolIds = req.body.filter.schoolIds
		} else {
			const schools = await this.fetchSchoolsList(req, null, false)
			if (schools.length === 0) {
				return res.json([])
			}
			schoolIds = schools.map((sc) => sc._id)
		}

		let academicYears = req.body.filter?.academicYear
		if (!academicYears || academicYears.length === 0) {
			const curAY = await globalServices.getCurrentAcademicYear()
			academicYears = [curAY._id]
		}

		const query = {
			status: globalConstants.schoolStatus.Active,
			school: { $in: schoolIds },
			academicYear: { $in: academicYears },
		}

		const isTeacher = req.user.permissions[0] === globalConstants.teacher
		if (isTeacher) {
			const teacher = await Teacher.findOne({ email: req.user.email, isDeleted: {$ne: true} })
			const teacherClassroomIds = teacher.classroomsJourney
				.filter((obj) => obj.isAssigned)
				.map((obj) => obj.classRoomId.toString())
			query['_id'] = { $in: teacherClassroomIds }
		}

		const classrooms = await Classrooms.find(query)
			.select('_id className section classHierarchy sectionHierarchy school')
			.sort({ classHierarchy: 1 })
			.lean()
		if (sendResponse && res) return res.json(classrooms)
		return classrooms
	}

	async fetchClassForStudents(req, res) {
		let allClassrooms
		const query = {
			status: globalConstants.schoolStatus.Active,
		}
		let schools = []
		const isTeacher = req?.user?.permissions[0] === globalConstants.teacher
		const isAdmin = req?.user?.isAdmin
		let schoolsAssignedToTeacher
		if (isTeacher) {
			// If the user is a teacher, restrict the query to the schools assigned to that teacher
			schoolsAssignedToTeacher = await Teacher.findOne({ email: req?.user?.email, isDeleted: {$ne: true} })
		} else if (!isAdmin) {
			// If the user is not an admin, restrict the query to the schools assigned to the user
			query.school = { $in: req.user.assignedSchools }
			schools = req.user.assignedSchools
		}
		if (!(Object.keys(req.body).length === 0)) {
			if (req.body?.filter?.status) {
				const filters = req.body.filter?.status ?? miscellaneous.classroomStatus.Active
				const filteredArray = Object.keys(miscellaneous.classroomStatus).filter((element) =>
					filters.includes(element),
				)
				query.status = utils.isAValidArray(filteredArray)
					? { $in: filteredArray }
					: globalConstants.classroomStatus.Active
			}
			if (utils.isAValidArray(req.body?.filter?.schoolIds)) {
				const schoolIds = req.body.filter.schoolIds.filter((id) =>
					utils.isMongooseObjectId(id),
				)

				// If the user is a teacher, spread the existing query.school with the new schoolIds
				if (isTeacher) {
					query.school = { $in: [schoolsAssignedToTeacher?.SchoolId] }
					const teacherClassroomIds = teacher.classroomsJourney
						.filter((obj) => obj.isAssigned)
						.map((obj) => obj.classRoomId.toString())
					query['_id'] = { $in: teacherClassroomIds }
					schools = [schoolsAssignedToTeacher?.SchoolId]
				} else {
					query.school = { $in: schoolIds }
					schools = schoolIds
				}
			}

			const acYear = req.body?.filter?.academicYear ?? []
			const sayQuery = { school: { $in: schools } }
			if (acYear && acYear.length > 0) {
				sayQuery['academicYear'] = { $in: acYear }
			} else {
				sayQuery['currentAcYear'] = true
			}
			const SAYs = await SchoolAcademicYears.find(sayQuery)
			query['SAY'] = { $in: SAYs }

			const searchFields = ['className']
			const searchQuery = utils.buildSearchQuery(req.body.searchText, searchFields)
			query.$or = searchQuery.$or

			allClassrooms = await Classrooms.find(query, {
				_id: 1,
				className: 1,
				section: 1,
				classHierarchy: 1,
				sectionHierarchy: 1,
				school: 1,
			})

			// Map over the results to transform each document into the desired format
			allClassrooms = allClassrooms.map((document) => ({
				_id: document?._id?.toString(),
				className: document?.className,
				classHierarchy: document?.classHierarchy,
				sectionHierarchy: document?.sectionHierarchy,
				section: document?.section,
				school: document?.school?._id.toString(),
			}))
		}
		return res.json(allClassrooms)
	}

	async fetchStudentsList(req, res) {
		try {
			// Load cached data
			const allStudents = await cacheService.students
			const allSchools = await cacheService.schools
			const allClassrooms = await cacheService.classrooms
			const allAcademicYears = await cacheService.academicYears

			// Extract filters
			const filterBody = req.body?.filter ?? {}
			// Validate selected schools
			if (!utils.isAValidArray(filterBody.schoolIds)) {
				return res.json([]) // No schools provided
			}
			const schoolSet = new Set(filterBody.schoolIds.map(String))
			// Validate selected classrooms
			if (!utils.isAValidArray(filterBody.classroomIds)) {
				return res.json([]) // No classrooms provided
			}
			const classroomSet = new Set(filterBody.classroomIds.map(String))
			const filteredStudents = []

			// Iterate over all students
			for (const s of allStudents) {
				const schoolId = s.school?.toString()
				if (!schoolSet.has(schoolId)) continue

				// Map to keep latest journey per classroomId
				const latestJourneyByClassroom = {}
				for (const journey of s.studentsJourney || []) {
					const classroomId = journey.classRoomId?.toString()
					const dateTime = new Date(journey.dateTime || 0).getTime()
					if (!classroomId || !classroomSet.has(classroomId)) continue
					// Track only the latest journey per classroom
					if (
						!latestJourneyByClassroom[classroomId] ||
						new Date(latestJourneyByClassroom[classroomId].dateTime).getTime() <
							dateTime
					) {
						latestJourneyByClassroom[classroomId] = journey
					}
				}
				// If no relevant journeys, skip student
				const journeyEntries = Object.entries(latestJourneyByClassroom)
				if (journeyEntries.length === 0) continue
				for (const [classroomId, journey] of journeyEntries) {
					const academicYearId = journey.academicYear?.toString()
					// Skip if student was graduated or exited in that year
					const isGraduated = s.graduated && s.graduatedAcademicYear === academicYearId
					const isExited = s.exited && s.exitedAcademicYear === academicYearId
					if (isGraduated || isExited) continue
					const classroom = allClassrooms.find((cl) => cl._id.toString() === classroomId)
					if (!classroom) continue
					// Only add once per student (latest matching classroom)
					filteredStudents.push({
						_id: s._id,
						studentName: s.studentName,
						user_id: s.user_id,
						school: schoolId,
						classRoomId: {
							_id: classroom._id,
							className: classroom.className,
						},
					})
					break // Return only one match per student
				}
			}

			return res.status(200).json(filteredStudents)
		} catch (err) {
			console.error('Error in fetchStudentsList:', err)
			return res.status(500).json({ message: 'Internal server error' })
		}
	}

	async fetchSectionsList(req, res) {
		let allSections
		const query = {
			status: globalConstants.schoolStatus.Active,
		}
		if (!req.user.isAdmin) query.school = { $in: req.user.assignedSchools }
		if (!(Object.keys(req.body).length === 0)) {
			if (req.body?.filter?.status) {
				const filters = req.body.filter?.status ?? miscellaneous.classroomStatus.Active
				const filteredArray = Object.keys(miscellaneous.classroomStatus).filter((element) =>
					filters.includes(element),
				)
				query.status = utils.isAValidArray(filteredArray)
					? { $in: filteredArray }
					: globalConstants.classroomStatus.Active
			}
			if (utils.isAValidArray(req.body?.filter?.schoolIds)) {
				let schoolIds
				if (!req.user.isAdmin)
					schoolIds = req.body.filter.schoolIds.filter(
						(id) =>
							utils.isMongooseObjectId(id) &&
							req.user.assignedSchools.map((id) => id.toString()).includes(id),
					)
				else
					schoolIds = req.body.filter.schoolIds.filter((id) =>
						utils.isMongooseObjectId(id),
					)
				query.school = utils.isAValidArray(schoolIds)
					? { $in: schoolIds }
					: { $in: req.user.assignedSchools }
			}
			if (utils.isAValidArray(req.body?.filter?.classes)) {
				query.className = {
					$in: req.body.filter.classes.filter((className) =>
						utils.isAValidString(className),
					),
				}
			}
			const searchFields = ['section']
			const searchQuery = utils.buildSearchQuery(req.body.searchText, searchFields)

			query.$or = searchQuery.$or

			allSections = [
				...new Set(
					(await Classrooms.find(query, { section: 1 })).map(
						(document) => document.section,
					),
				),
			]
		} else {
			allSections = [
				...new Set(
					(await Classrooms.find(query, { section: 1 })).map(
						(document) => document.section,
					),
				),
			]
		}
		return res.json(allSections)
	}

	/**
	 * Fetches a list of active students per academic year and classroom context,
	 * primarily used for school-level administrative actions such as promotions,
	 * attendance processing, reporting, etc.
	 *
	 * The function works with cached data (students, schools, classrooms, academic years)
	 * and applies filters dynamically based on request parameters.
	 *
	 * Logic Highlights:
	 * - Filters students based on selected or inferred school IDs and academic years.
	 * - A student is considered "active" in a given academic year if they have a
	 *   journey record for that year and classroom, and are not marked as graduated or exited in that year.
	 * - Supports optional classroom filters and search text (by name or user ID).
	 * - Picks the latest matching journey (based on dateTime) per student for final output.
	 * - Results are sorted based on sortKeys provided in the request.
	 *
	 * Request Body Structure:
	 * {
	 *   filter: {
	 *     schoolIds?: string[],
	 *     classroomIds?: string[],
	 *     academicYear?: string | string[]
	 *   },
	 *   searchText?: string,
	 *   sortKeys?: { [key: string]: 1 | -1 }
	 * 	 isSchoolAction: true
	 * }
	 * OR
	 * {
	 *   searchText?: string,
	 * 	 academicYear?: string | string[]
	 *   isSchoolAction: false
	 * }
	 *
	 * Response:
	 * {
	 *   data: [
	 *     {
	 *       _id,
	 *       user_id,
	 *       studentName,
	 *       regNo,
	 *       regDate,
	 *       className,
	 *       section,
	 *       classRoomId,
	 *       school,
	 *       academicYear
	 *     }
	 *   ]
	 * }
	 */
	/**
	 * Fetches active students for a given academic year and filters.
	 * Only considers one academic year (no array input).
	 * Filters out students who have journeys/promotions in future academic years.
	 */
	async fetchAllStudentsForSchoolActions(req, res) {
		try {
			// Load cached data
			const allStudents = await cacheService.students
			let allClassrooms = await cacheService.classrooms
			const allAcademicYears = await cacheService.academicYears
			let allSchools = await cacheService.schools
			const allSchoolAcademicYears = await cacheService.schoolAcademicYears

			const filterBody = req.body?.filter ?? {}
			const searchText = req.body?.searchText?.toLowerCase() ?? ''

			// ---------- Academic Year ----------
			let academicYearId = null
			if (typeof req.body?.academicYear === 'string') {
				academicYearId = req.body.academicYear
			} else if (typeof filterBody?.academicYear === 'string') {
				academicYearId = filterBody.academicYear
			} else {
				const curAY = await globalServices.getCurrentAcademicYear()
				academicYearId = curAY._id.toString()
			}

			// ---------- Filter School and Classrooms if request use is Teacher -----------
			if (req.user.permissions[0] === globalConstants.teacher) {
				const teacher = await Teacher.findOne({ email: req.user.email, isDeleted: {$ne: true} })
				const teacherClassroomIds = teacher.classroomsJourney.filter(
					(obj) =>
						obj.isAssigned && obj.academicYear.toString() === academicYearId.toString(),
				).map(obj => obj.classRoomId.toString())
				if (!teacher || !teacher.SchoolId || !utils.isAValidArray(teacherClassroomIds)) {
					return res.json({ data: [] })
				}
				allSchools = allSchools.filter(
					(obj) => obj._id.toString() === teacher.SchoolId.toString(),
				)
				allClassrooms = allClassrooms.filter((obj) =>
					teacherClassroomIds.includes(obj._id.toString()),
				)
			}

			// ---------- School Filtering ----------
			let schoolIds = []
			let activeSchoolSet = new Set()
			if (utils.isAValidArray(filterBody.schoolIds)) {
				schoolIds = filterBody.schoolIds.map(String)
				activeSchoolSet = new Set(schoolIds)
			} else {
				activeSchoolSet = new Set(
					allSchools
						.filter((s) => s.status === globalConstants.schoolStatus.Active)
						.map((s) => s._id),
				)
			}

			const matchedSchoolIds = new Set()
			for (const say of allSchoolAcademicYears) {
				const ay = say.academicYear
				const sid = say.school
				if (ay === academicYearId && activeSchoolSet.has(sid)) {
					matchedSchoolIds.add(sid)
				}
			}

			if (matchedSchoolIds.size === 0) return res.json({ data: [] })

			schoolIds = Array.from(matchedSchoolIds)
			const schoolSet = new Set(schoolIds)

			// ---------- Classroom Filtering ----------
			let classroomSet = null
			if (utils.isAValidArray(filterBody.classroomIds)) {
				classroomSet = new Set(filterBody.classroomIds.map(String))
			}

			const validClassrooms = allClassrooms.filter(
				(cl) =>
					cl.status === globalConstants.studentStatus.Active &&
					schoolSet.has(cl.school ?? '') &&
					cl.academicYear === academicYearId,
			)

			if (validClassrooms.length === 0) return res.json({ data: [] })

			const validClassroomIds = new Set(validClassrooms.map((cl) => cl._id))

			// Build academic year order map
			const academicYearOrderMap = new Map()
			for (const ay of allAcademicYears) {
				if (ay._id && typeof ay.order === 'number') {
					academicYearOrderMap.set(ay._id, ay.order)
				}
			}
			const currentAYOrder = academicYearOrderMap.get(academicYearId)

			const result = []

			for (const s of allStudents) {
				const schoolId = s.school
				if (!schoolSet.has(schoolId)) continue

				// Matching journey for that academic year
				const matchingJourneys = (s.studentsJourney || []).filter((j) => {
					const ay = j.academicYear
					const cl = j.classRoomId

					if (ay !== academicYearId) return false
					if (!validClassroomIds.has(cl)) return false
					if (classroomSet && !classroomSet.has(cl)) return false

					const isGraduated = s.graduated && s.graduatedAcademicYear === ay
					const isExited = s.exited && s.exitedAcademicYear === ay
					return !isGraduated && !isExited
				})

				if (matchingJourneys.length === 0) continue

				// Pick latest journey by date
				const latestJourney = matchingJourneys.reduce((latest, current) =>
					new Date(current.dateTime) > new Date(latest.dateTime) ? current : latest,
				)

				const classRoomId = latestJourney.classRoomId
				const classroom = allClassrooms.find((cl) => cl._id === classRoomId)
				if (!classroom) continue

				// Extra validation: student should not have future journeys or promotions
				if (req.body?.isSchoolAction === true) {
					const hasFutureAY = (s.studentsJourney || []).some((j) => {
						const jAy = j.academicYear
						const jOrder = academicYearOrderMap.get(jAy)
						return jOrder !== undefined && jOrder > currentAYOrder
					})

					const hasFuturePromotion = (() => {
						const promoAY = s.lastPromotionAcademicYear
						const promoOrder = academicYearOrderMap.get(promoAY)
						return promoOrder !== undefined && promoOrder > currentAYOrder
					})()

					if (hasFutureAY || hasFuturePromotion) continue

					// 🚫 New Check: In current academic year, latest classroom must be in classroomSet
					const sameYearJourneys = (s.studentsJourney || []).filter((j) => {
						return j.academicYear?.toString() === academicYearId
					})

					if (sameYearJourneys.length > 0) {
						const latestSameYearJourney = sameYearJourneys.reduce((latest, current) => {
							return new Date(current.dateTime) > new Date(latest.dateTime)
								? current
								: latest
						})

						const latestClassroomId = latestSameYearJourney.classRoomId?.toString()
						if (classroomSet && !classroomSet.has(latestClassroomId)) {
							continue // ❌ Skip student — their latest journey's classroom is not allowed
						}
					}
				}

				// Search filter
				if (searchText.length > 2) {
					const match =
						s.studentName?.toLowerCase().includes(searchText) ||
						s.user_id?.toLowerCase().includes(searchText)
					if (!match) continue
				}

				result.push({
					_id: s._id,
					user_id: s.user_id,
					studentName: s.studentName,
					regNo: s.regNo,
					regDate: s.regDate,
					className: classroom.className,
					section: classroom.section,
					classRoomId: classroom._id,
					school: schoolId,
					academicYear: academicYearId,
				})
			}

			// ---------- Sorting ----------
			const sortFields = globalConstants.studentsSortFields
			const sortOptions = utils.buildSortOptions(req.body, sortFields)
			const sortedStudents = result.sort((a, b) => {
				for (const key in sortOptions) {
					const dir = sortOptions[key]
					const aVal = a[key]
					const bVal = b[key]
					if (aVal !== bVal) {
						return dir === 1 ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1
					}
				}
				return 0
			})

			return res.json({ data: sortedStudents })
		} catch (err) {
			console.error('Error in fetchAllStudentsForSchoolActions:', err)
			return res.status(500).json({ message: 'Internal server error' })
		}
	}

	async fetchStudentInitData(req, res, Model, isStudent) {
		const { id } = req.params

		if (!utils.isMongooseObjectId(id)) {
			return res.status(400).json(new FailureResponse(globalConstants.messages.invalidId))
		}

		const commonFilter = { _id: id, status: globalConstants.schoolStatus.Active }
		const projection = { __v: 0, createdAt: 0, updatedAt: 0 }

		let populateOptions = !isStudent
			? [
					{ path: 'school', select: 'school' },
					{ path: 'academicYear', select: '_id academicYear' },
				]
			: [
					{
						path: 'studentId',
						select: 'studentName className section -_id',
						populate: { path: 'school', select: 'school' },
					},
					{ path: 'academicYear', select: '_id academicYear' },
				]

		try {
			const record = await Model.findOne(commonFilter, projection).populate(populateOptions)

			if (!record) {
				return res.status(400).json(new FailureResponse(globalConstants.messages.notFound))
			}

			return res.json(record)
		} catch (err) {
			console.error('Error fetching record:', err)
			return res.status(500).json(new FailureResponse(globalConstants.messages.serverError))
		}
	}
}

const commonServices = new CommonServices()
module.exports.commonServices = commonServices
