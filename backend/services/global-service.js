const { default: mongoose } = require('mongoose')
const { AcademicYears } = require('../models/database/academic-years')
const { Schools } = require('../models/database/myPeegu-school')
const { Teacher } = require('../models/database/myPeegu-teacher')
const { SchoolAcademicYears } = require('../models/database/school-academic-years')
const { ACTIONS, ALL_FIELDS, STATUSES } = require('../utility/localConstants')
const utils = require('../utility/utils')
const { cacheService } = require('../cache/cashe.service')
const { studentStatus } = require('../utility/constants')
const { buildComboKey } = require('../utility/common-utility-functions')

class GlobalServices {
	/**
	 * This function will fetch school academic years of give academic year id
	 *
	 * @param {string} academicYearId
	 * @returns {SchoolAcademicYears[]}
	 */
	async fetchSAYsByAcademicYear(academicYearId) {
		let inputAcademicYears = []
		if (Array.isArray(academicYearId)) {
			inputAcademicYears = academicYearId
		} else {
			inputAcademicYears = [academicYearId]
		}

		const allAcademicYears = await cacheService.academicYears

		const academicYears = allAcademicYears.filter((ay) => inputAcademicYears.includes(ay._id))
		if (!academicYears || academicYears.length === 0) {
			return []
		}

		const allSchoolAcademicYears = await cacheService.schoolAcademicYears

		const SAYs = allSchoolAcademicYears.filter((schoolAy) =>
			inputAcademicYears.includes(schoolAy.academicYear),
		)

		return SAYs
	}

	async fetchCurSAYbySchool(school) {
		const allSchoolAcademicYears = await cacheService.schoolAcademicYears

		const SAY = allSchoolAcademicYears.find(
			(schoolAy) => schoolAy.school === school && schoolAy.currentAcYear === true,
		)

		return SAY
	}

	async fetchSAYsOfCurAY(user, objId = false) {
		const query = {}
		if (!user.isAdmin) {
			query['school'] = { $in: user.assignedSchools ?? [] }
		} else if (user?.permissions[0] === globalConstants.teacher) {
			const teacher = await Teacher.findOne({
				email: req?.user?.email,
				isDeleted: { $ne: true },
			})
			if (teacher) {
				query['school'] = { $in: [teacher.SchoolId] }
			}
		}
		const SAYs = await SchoolAcademicYears.find({ ...query, currentAcYear: true })

		return objId ? SAYs.map((obj) => obj._id) : SAYs
	}

	async getCurrentAcademicYear() {
		const date = new Date()
		const yearStart = date.getMonth() + 1 >= 5 ? date.getFullYear() : date.getFullYear() - 1
		const acYrString = `${yearStart}-${yearStart + 1}`
		const academicYear = (await cacheService.academicYears).find(
			(ay) => ay.academicYear === acYrString,
		)
		return academicYear
	}

	/**
	 * This function will take the request object and find the schools that are assigned to the user and return.
	 *
	 * @param {request object} req object
	 * @returns {schoolIds[]} array school ids
	 */
	async getUserSchools(req) {
		let schools = []
		const user = req.user
		if (!user) {
			return schools
		}
		if (user.permissions && user.permissions.length > 0) {
			if (
				user.permissions.includes(globalConstants.Admin) ||
				user.permissions.includes(globalConstants.SuperAdmin)
			) {
				const allschools = await Schools.find({
					status: globalConstants.schoolStatus.Active,
				}).select('_id')

				schools = allschools.map((obj) => obj._id)
			} else if (user.permissions[0] === globalConstants.teacher) {
				const teacher = await Teacher.findOne({
					email: user.email,
					isDeleted: { $ne: true },
				})
				if (!teacher) {
					return schools
				}
				const teacherSchool = await Schools.find({
					_id: teacher.SchoolId,
					status: globalConstants.schoolStatus.Active,
				}).select('_id')

				schools = teacherSchool.map((obj) => obj._id)
			} else if (
				user.permissions[0] === globalConstants.PeeguCounselor ||
				user.permissions[0] === globalConstants.ScCounselor
			) {
				schools = user.assignedSchools
			}
		}
		return schools
	}

	/**
	 * This function will validate if the school and academic year provided in the req body. First it will check if the given school is valid or not.
	 * then it will get all assigned schools of user and then it will check if the given school belongs to user and 
	 * finally it will find academicYear of given academicYearId followed by SAY using given school and academic year id.
	 * While checking/validating if any of the validations fails it will throw error else it will return SAY and academicYear.
	 * 
	 * @param {*} req 
	 * @returns {
			error: false,
			message: '',
			SAY: SAY,
			academicYear: academicYear,
		}
	 */
	async validateUserSchoolAndAY(req) {
		const body = req.body

		let data = {}
		let school = null
		if (body.school) {
			school = await Schools.findOne({ _id: body.school }).lean()
		}
		if (!school) {
			data = {
				error: true,
				message: globalConstants.messages.invalidField.replaceField(ALL_FIELDS.SCHOOL),
				school,
				SAY: null,
				academicYear: null,
			}
			return data
		}

		const userSchools = await this.getUserSchools(req)
		if (userSchools && userSchools.length === 0) {
			data = {
				error: true,
				message: globalConstants.messages.schoolNotAssignedError,
				school,
				SAY: null,
				academicYear: null,
			}
			return data
		}
		if (!userSchools.map((id) => id.toString()).includes(body.school)) {
			data = {
				error: true,
				message: globalConstants.messages.schoolNotAssignedError,
				school,
				SAY: null,
				academicYear: null,
			}
			return data
		}

		const academicYear = await AcademicYears.findOne({ _id: body.academicYear }).lean()
		if (!academicYear) {
			data = {
				error: true,
				message: globalConstants.messages.invalidField.replaceField(
					ALL_FIELDS.ACADEMIC_YEAR,
				),
				school,
				SAY: null,
				academicYear: null,
			}
			return data
		}

		const SAY = await SchoolAcademicYears.findOne({
			academicYear: academicYear._id,
			school: body.school,
		}).lean()
		if (!SAY) {
			data = {
				error: true,
				message: globalConstants.messages.invalidField.replaceField(
					ALL_FIELDS.SCHOOL_ACADEMIC_YEAR,
				),
				school,
				SAY: null,
				academicYear: null,
			}
			return data
		}

		return {
			error: false,
			message: '',
			school,
			SAY: SAY,
			academicYear: academicYear,
		}
	}

	/**
	 * This function will get active teachers of given classrooms and from each teacher it will remove these classrooms
	 * @param {*} classrooms
	 * @returns
	 */
	async removeClassroomsFromTeachers(classrooms) {
		const now = new Date()
		const teacherClassroomMap = new Map()

		// Build map: teacherId -> Set of classroomIds to unassign
		for (const classroom of classrooms) {
			if (classroom.teacher) {
				const teacherId = classroom.teacher.toString()
				const classroomId = classroom._id.toString()

				if (!teacherClassroomMap.has(teacherId)) {
					teacherClassroomMap.set(teacherId, new Set())
				}
				teacherClassroomMap.get(teacherId).add(classroomId)
			}
		}

		const teacherIds = Array.from(teacherClassroomMap.keys())
		if (teacherIds.length === 0) return

		const teachers = await Teacher.find({ _id: { $in: teacherIds }, isDeleted: { $ne: true } })

		const bulkOps = []

		for (const teacher of teachers) {
			let updated = false

			for (let journey of teacher.classroomsJourney) {
				const teacherIdStr = teacher._id.toString()
				const classRoomIdStr = journey.classRoomId?.toString()

				if (
					journey.isAssigned &&
					classRoomIdStr &&
					teacherClassroomMap.get(teacherIdStr)?.has(classRoomIdStr)
				) {
					journey.isAssigned = false
					journey.unassignedDate = now
					updated = true
				}
			}

			if (updated) {
				bulkOps.push({
					updateOne: {
						filter: { _id: teacher._id },
						update: { $set: { classroomsJourney: teacher.classroomsJourney } },
					},
				})
			}
		}

		if (bulkOps.length > 0) {
			await Teacher.bulkWrite(bulkOps)
		}

		return 'Done'
	}

	async validateAndGetAYsAndPaginationData(req) {
		const PAGE_SIZE = req.body.pageSize || 10
		const page = req.body.page || 1
		const downloadAndFilter = req.query.downloadAndFilter === 'true' || false
		const skip = (page - 1) * PAGE_SIZE

		let SAYs = []
		let data = {
			error: false,
			emptyData: {
				data: [],
				page,
				pageSize: PAGE_SIZE,
				totalCount: 0,
			},
			page,
			PAGE_SIZE,
			downloadAndFilter,
			skip,
		}

		if (req.body.filter && utils.isAValidArray(req.body.filter?.academicYear)) {
			SAYs = await this.fetchSAYsByAcademicYear(req.body.filter.academicYear)
			data['academicYears'] = req.body.filter.academicYear.map(
				(id) => new mongoose.Types.ObjectId(id),
			)
		} else {
			SAYs = await this.fetchSAYsOfCurAY(req.user)
			const curAY = await this.getCurrentAcademicYear()
			data['academicYears'] = [curAY._id]
		}
		if (SAYs.length === 0) {
			data['error'] = true
		}

		return data
	}

	fetchQueryCombinations(filteredStudents) {
		if (!utils.isAValidArray(filteredStudents) || filteredStudents.length === 0) {
			return null // Return an empty query if no valid students are provided
		}

		// Generate comboKeys
		const comboKeys = new Set()

		filteredStudents.forEach((student) => {
			const comboKey = buildComboKey(student._id, student.classRoomId, student.academicYearId)
			if (comboKey !== null) {
				comboKeys.add(comboKey)
			}
		})

		if (comboKeys.size === 0) return null

		// Return a query using $in on comboKey
		return {
			comboKey: { $in: Array.from(comboKeys) },
		}
	}

	async transformDataRecordsWithAcademicFeilds(records) {
		if (!utils.isAValidArray(records)) return records
		//Load all reference data from cache
		const [allSchools, allClassrooms, allAcademicYears] = await Promise.all([
			cacheService.schools,
			cacheService.classrooms,
			cacheService.academicYears,
		])
		const transformedRecords = records.map((rec) => {
			const academicYearId = rec.academicYear?.toString()
			const schoolId = rec.school?.toString()
			const classRoomId = rec.classRoomId?.toString()

			const academicYearObj = allAcademicYears.find((ay) => ay._id === academicYearId)
			const schoolObj = allSchools.find((s) => s._id === schoolId)
			const classRoomObj = allClassrooms.find((c) => c._id === classRoomId)

			return {
				...rec.toObject(),
				academicYearId, // renamed key
				academicYear: academicYearObj?.academicYear ?? '', // readable year
				schoolName: schoolObj?.school ?? '',
				className: classRoomObj?.className ?? '',
				section: classRoomObj?.section ?? '',
			}
		})
		return transformedRecords
	}

	// ----------- Start of fetch students functions ------------ //

	/**
	 * Returns latest journeys per academic year.
	 * - If considerAllClasses = false: one latest journey per academicYear.
	 * - If considerAllClasses = true: one latest journey per classRoomId within each academicYear.
	 *
	 * @param {Array} journeys - List of journey objects
	 * @param {Boolean} considerAllClasses - Whether to treat each classroom as separate entry
	 * @returns {Array<{ academicYear: string, journey: object }>}
	 */
	getLatestJourneysPerAcademicYear(journeys = [], considerAllClasses = false) {
		const resultMap = new Map()

		for (const j of journeys) {
			if (!j.academicYear || !j.classRoomId) continue

			const academicYearId = j.academicYear.toString()
			const classRoomId = j.classRoomId.toString()

			if (!resultMap.has(academicYearId)) {
				resultMap.set(academicYearId, new Map())
			}

			const innerMap = resultMap.get(academicYearId)

			const key = considerAllClasses ? classRoomId : 'ALL'

			const existing = innerMap.get(key)
			if (!existing || new Date(j.dateTime) > new Date(existing.dateTime)) {
				innerMap.set(key, j)
			}
		}

		// Flatten to array of { academicYear, journey }
		const result = []
		for (const [academicYear, innerMap] of resultMap.entries()) {
			for (const journey of innerMap.values()) {
				result.push({ academicYear, journey })
			}
		}

		return result
	}

	/**
	 * Determine student status for this specific academic year.
	 * A student may be:
	 * - graduated (if graduated === true and academicYearId === graduatedAcademicYear)
	 * - exited (if exited === true and academicYearId === exitedAcademicYear)
	 * - otherwise active (still in system)
	 *
	 * Example:
	 * - Student has 3 journeys for AYs: 2022, 2023, 2024.
	 * - graduatedAcademicYear = 2024 ➝ status is 'graduated' for 2024, 'active' for 2022/2023.
	 */
	resolveStudentStatus(s, academicYearId) {
		if (s.graduated && s.graduatedAcademicYear === academicYearId)
			return studentStatus.graduated
		if (s.exited && s.exitedAcademicYear === academicYearId) return studentStatus.exited
		return studentStatus.active
	}

	/**
	 * Filters valid journeys from the latest journeys array based on academic year and classroom filters.
	 *
	 * @param {Object} s - The student object
	 * @param {Array<{ academicYear: string, journey: object }>} latestJourneys - Output from getLatestJourneysPerAcademicYear
	 * @param {Set<string>} academicYearSet - Set of allowed academicYear IDs (as strings)
	 * @param {Set<string>|null} classroomSet - Optional set of allowed classroom IDs (as strings)
	 * @param {Array} allAcademicYears - Full academic year metadata array
	 * @returns {Array<object>} - Filtered and enriched journeys
	 */
	getValidJourneys(s, latestJourneys, academicYearSet, classroomSet, allAcademicYears) {
		const result = []

		for (const { academicYear, journey } of latestJourneys) {
			if (!academicYearSet.has(academicYear)) continue
			if (classroomSet && !classroomSet.has(journey.classRoomId.toString())) continue

			const ayMeta = allAcademicYears.find((a) => a._id.toString() === academicYear)
			if (!ayMeta) continue

			const status = this.resolveStudentStatus(s, academicYear)

			result.push({
				...journey,
				academicYear: ayMeta,
				status,
			})
		}

		return result
	}

	/**
	 * From valid journeys, pick:
	 * - the latest matching journey with the requested status
	 * - or, if status === 'all', the latest journey overall
	 *
	 * Example:
	 * - Filters: academicYearIds = [2023, 2024], status = 'exited'
	 * - Student exited in 2023 and active in 2024 ➝ include 2023 record only
	 * - If status = 'all' ➝ include 2024 record (latest by order)
	 */
	getStatusFilteredSingleJourney(validJourneys, status) {
		if (status && status !== studentStatus.all) {
			const matching = validJourneys.filter((j) => j.status === status)
			if (matching.length === 0) return []
			return [
				matching.reduce((a, b) => (b.academicYear.order > a.academicYear.order ? b : a)),
			]
		}
		return [
			validJourneys.reduce((a, b) => (b.academicYear.order > a.academicYear.order ? b : a)),
		]
	}

	/**
	 * From valid journeys, pick:
	 * - the matching journey with the requested status
	 * - or, if status === 'all', all valid journey's
	 *
	 * Example:
	 * - Filters: academicYearIds = [2023, 2024], status = 'exited'
	 * - Student exited in 2023 and active in 2024 ➝ include 2023 record only
	 * - If status = 'all' ➝ include 2024 record (latest by order)
	 */
	getStatusFilteredMultipleJournies(validJourneys, status) {
		if (status && status !== studentStatus.all) {
			const matching = validJourneys.filter((j) => j.status === status)
			return matching
		}
		return validJourneys
	}

	/**
	 * Core reusable student filter logic used by both root modes.
	 */
	async getFilteredStudents(filterData, multiJourneyMode = false) {
		console.log(`getFilteredStudents started`)
		const {
			schoolIds,
			classroomIds,
			theStudentStatus,
			academicYears,
			userAssignedSchools,
			isAdmin,
			searchText,
		} = filterData

		const allStudents = await cacheService.students
		const allSchools = await cacheService.schools
		const allClassrooms = await cacheService.classrooms
		const allAcademicYears = await cacheService.academicYears

		console.log('All students from cache service', allStudents.length)

		const schoolSet = utils.isAValidArray(schoolIds) ? new Set(schoolIds.map(String)) : null
		const classroomSet = utils.isAValidArray(classroomIds)
			? new Set(classroomIds.map(String))
			: null
		const academicYearSet = new Set(academicYears.map(String))
		const assignedSchools = userAssignedSchools.map((id) => id.toString().trim())

		const result = []

		for (const s of allStudents) {
			const schoolId = String(s.school).trim()
			if (!isAdmin && !assignedSchools.includes(schoolId)) continue
			if (schoolSet && !schoolSet.has(schoolId)) continue

			const search = searchText ? searchText.toLowerCase() : ''
			const school = allSchools.find((sc) => sc._id === schoolId)
			if (!school) continue

			const matchesSearch =
				search.length <= 2 ||
				s.studentName.toLowerCase().includes(search) ||
				s.user_id.toLowerCase().includes(search) ||
				school.school.toLowerCase().includes(search)
			if (!matchesSearch) continue

			const latestJourneys = this.getLatestJourneysPerAcademicYear(
				s.studentsJourney,
				multiJourneyMode ? true : false,
			)
			const validJourneys = this.getValidJourneys(
				s,
				latestJourneys,
				academicYearSet,
				classroomSet,
				allAcademicYears,
			)
			if (validJourneys.length === 0) continue

			const journeysToPush = multiJourneyMode
				? this.getStatusFilteredMultipleJournies(validJourneys, theStudentStatus)
				: this.getStatusFilteredSingleJourney(validJourneys, theStudentStatus)

			for (const journey of journeysToPush) {
				const classroom = allClassrooms.find((cl) => cl._id === journey.classRoomId)
				if (!classroom) continue

				result.push({
					_id: s._id,
					school: {
						_id: school._id,
						school: school.school,
						logoUrl: school._id,
					},
					user_id: s.user_id,
					studentName: s.studentName,
					newStudent: s.newStudent,
					regNo: s.regNo,
					regDate: s.regDate,
					nationality: s.nationality,
					dob: s.dob,
					gender: s.gender,
					phone: s.phone,
					bloodGrp: s.bloodGrp,
					fatherName: s.fatherName,
					motherName: s.motherName,
					email: s.email,
					status: journey.status,
					classRoomId: journey.classRoomId,
					studentsJourney: s.studentsJourney,
					exited: journey.status !== studentStatus.active ? s.exited : false,
					graduated: journey.status !== studentStatus.active ? s.graduated : false,
					academicYearId: journey.academicYear._id,
					academicYear: journey.academicYear.academicYear,
					className: classroom.className,
					section: classroom.section,
					graduatedAcademicYear: s.graduatedAcademicYear,
					exitedAcademicYear: s.exitedAcademicYear,
				})
			}
		}
		console.log('Filtered Results:', result.length)
		console.log(`getFilteredStudents completed`)
		return result
	}

	/**
	 * Public root function: Returns single journey per student.
	 */
	async getFilteredStudentsSingleJourney(filterData) {
		return this.getFilteredStudents(filterData, false)
	}

	/**
	 * Public root function: Returns all matching journeys per student.
	 */
	async getFilteredStudentsMultiJourney(filterData) {
		return this.getFilteredStudents(filterData, true)
	}

	// ----------- End of fetch students functions ------------ //
}

const globalServices = new GlobalServices()
module.exports.globalServices = globalServices
module.exports.GlobalServices = GlobalServices
