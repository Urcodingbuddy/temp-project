const { mongoose } = require('mongoose')
const utils = require('../../../utility/utils')
const { CommonHelperServices } = require('../../common-services/common-helper-service')
const { ALL_FIELDS, STATUSES } = require('../../../utility/localConstants')
const { SuccessResponse, FailureResponse } = require('../../../models/response/globalResponse')
const { ProfilingForSchools } = require('../../../models/database/profiling-for-shools')
const moment = require('moment')
const { SchoolAcademicYears } = require('../../../models/database/school-academic-years')
const { Teacher } = require('../../../models/database/myPeegu-teacher')
const { ProfilingForTeachers } = require('../../../models/database/profiling-for-teachers')
const { assessmentHelperService } = require('../assessment-helper-service')

class SchoolProfilingService extends CommonHelperServices {
	async fetchAllProfilingsForSchools(req, res) {
		const { error, page, PAGE_SIZE, downloadAndFilter, skip, emptyData, academicYears } =
			await this.validateAndGetAYsAndPaginationData(req)
		if (error) {
			return res.status(200).json(emptyData)
		}

		let matchQuery = {
			academicYear: { $in: academicYears },
		}

		if (!req.user.isAdmin) {
			matchQuery.school = { $in: req.user.assignedSchools }
		}

		const sortFields = globalConstants.schoolProfilingSortFields
		const sortOptions = utils.buildSortOptions(req.body, sortFields)

		const searchFields = ['schoolDetails.school']
		const searchQueryNew = utils.buildSearchQuery(req.body.searchText, searchFields)

		const filterBody = req.body.filter
		if (filterBody) {
			if (utils.isAValidArray(filterBody.schoolIds)) {
				matchQuery.school = {
					$in: filterBody.schoolIds.map((id) => new mongoose.Types.ObjectId(id)),
				}
			}

			const status = filterBody.status
			if (status) {
				if (status === STATUSES.ACTIVE) {
					matchQuery.profilingStatus = STATUSES.ACTIVE
				} else if (status === STATUSES.INACTIVE) {
					matchQuery.profilingStatus = STATUSES.IN_ACTIVE
				}
			}

			const { startDate, endDate } = filterBody

			if (startDate) {
				if (!utils.isValidDate(startDate)) {
					return res
						.status(400)
						.json(new FailureResponse(globalConstants.messages.invalidDate))
				}
				const start_date = new Date(startDate)
				start_date.setHours(0, 0, 0, 0)
				matchQuery.startDate = { $gte: start_date }
			}

			if (endDate) {
				if (!utils.isValidDate(endDate)) {
					return res
						.status(400)
						.json(new FailureResponse(globalConstants.messages.invalidDate))
				}
				const end_date = new Date(endDate)
				end_date.setHours(23, 59, 59, 999)
				matchQuery.endDate = { $lte: end_date }
			}
		}

		const pipeline = [
			{
				$match: matchQuery,
			},
			{
				$lookup: {
					from: 'schools',
					localField: 'school',
					foreignField: '_id',
					as: 'schoolDetails',
					pipeline: [
						{
							$project: {
								school: 1,
								scCode: 1,
							},
						},
					],
				},
			},
			{
				$lookup: {
					from: 'academic-years',
					localField: 'academicYear',
					foreignField: '_id',
					as: 'academicYearDetails',
					pipeline: [
						{
							$project: {
								_id: 1,
								academicYear: 1,
							},
						},
					],
				},
			},
			{
				$unwind: {
					path: '$schoolDetails',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$unwind: {
					path: '$academicYearDetails',
					preserveNullAndEmptyArrays: true,
				},
			},
			...(req.body.searchText && req.body.searchText.trim()
				? [
						{
							$match: {
								$or: searchQueryNew.$or,
							},
						},
					]
				: []),
			{
				$project: {
					isScheduled: 1,
					profilingStatus: 1,
					startDate: 1,
					endDate: 1,
					totalTeacherCount: 1,
					submittedTeacherCount: 1,
					pendingTeacherCount: 1,
					schoolId: '$schoolDetails._id',
					schoolName: '$schoolDetails.school',
					academicYearId: '$academicYearDetails._id',
					academicYear: '$academicYearDetails.academicYear',
					isDISCSelected: 1,
					isTeachingPracticesSelected: 1,
					isJobLifeSatisfactionSelected: 1,
					isTeachingAttitudeSelected: 1,
				},
			},
		]

		// Add facet for pagination and total count
		const facetPipeline = [
			...pipeline,
			{
				$facet: {
					data: [{ $sort: sortOptions }, { $skip: skip }, { $limit: PAGE_SIZE }],
					totalCount: [{ $count: 'count' }],
				},
			},
		]

		const result = await ProfilingForSchools.aggregate(facetPipeline)

		const records = result[0]?.data || []
		const totalCount = result[0]?.totalCount[0]?.count || 0

		if (downloadAndFilter) {
			const formattedData = records.map((item) => utils.formatProfilingForSchoolsData(item))
			return res.json(formattedData)
		}

		return res.json({
			data: records,
			page,
			pageSize: PAGE_SIZE,
			totalCount,
		})
	}

	async addSchoolProfiling(req, res) {
		try {
			const { SchoolId, startDate, endDate, profilingSections = [] } = req.body

			const isValidDate = (date) => !isNaN(Date.parse(date))

			if (!isValidDate(startDate) || !isValidDate(endDate)) {
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.invalidDate))
			}

			// Check if ProfilingEndDateForSchool is less than ProfilingStartDateForSchool
			const start_date = moment(startDate)
			const end_date = moment(endDate)
			const curDate = moment(new Date())

			if (start_date.isBefore(curDate, 'day')) {
				return res
					.status(400)
					.json(
						new FailureResponse(
							globalConstants.messages.startDateMustCantBeforeCurDate,
						),
					)
			}

			const curAcademicYear = await this.getCurrentAcademicYear()
			const SAY = await SchoolAcademicYears.findOne({
				school: SchoolId,
				academicYear: curAcademicYear._id,
			}).lean()
			const AYStart = moment(SAY.startDate)
			const AYEnd = moment(SAY.endDate)

			if (end_date.isSameOrBefore(start_date, 'day')) {
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.profilingDatesError))
			}

			// Here checks if the selected start date lies between start and end date of current academic year
			if (start_date.isBefore(AYStart, 'day')) {
				return res
					.status(400)
					.json(
						new FailureResponse(
							globalConstants.messages.dateShouldBeWithinCurAY.replaceField(
								ALL_FIELDS.START_DATE,
							),
						),
					)
			}

			// Here checks if the selected end date lies between start and end date of current academic year
			if (end_date.isAfter(AYEnd, 'day')) {
				return res
					.status(400)
					.json(
						new FailureResponse(
							globalConstants.messages.dateShouldBeWithinCurAY.replaceField(
								ALL_FIELDS.END_DATE,
							),
						),
					)
			}

			const profilingsOfSchoolForCurAY = await ProfilingForSchools.findOne({
				school: SchoolId,
				academicYear: curAcademicYear._id,
			}).sort({ startDate: -1, endDate: -1 })

			if (profilingsOfSchoolForCurAY) {
				const existingProfilingEndDate = moment(profilingsOfSchoolForCurAY.endDate)

				const curDate = moment(new Date())
				if (existingProfilingEndDate.isSameOrAfter(curDate)) {
					return res
						.status(400)
						.json(new FailureResponse(globalConstants.messages.youCannotAddProfiling))
				}

				if (start_date.isSameOrBefore(existingProfilingEndDate)) {
					return res
						.status(400)
						.json(new FailureResponse(globalConstants.messages.youCannotAddProfiling))
				}
			}

			const profilingId = new mongoose.Types.ObjectId()
			const schoolProfiling = new ProfilingForSchools({
				_id: profilingId,
				school: SchoolId,
				SAY: SAY._id,
				academicYear: curAcademicYear._id,
				startDate: start_date,
				endDate: end_date,
				isDISCSelected: profilingSections.includes('discProfiles'),
				isTeachingPracticesSelected: profilingSections.includes('teachingPractices'),
				isJobLifeSatisfactionSelected: profilingSections.includes('jobLifeSatisfaction'),
				isTeachingAttitudeSelected: profilingSections.includes('teachingAttitude'),
			})
			await schoolProfiling.save()

			const teachers = await Teacher.find({ SchoolId, isDeleted: { $ne: true } })
			if (teachers.length) {
				const teachersProfilingData = teachers.map((obj) => ({
					teacher: obj._id,
					schoolProfilingId: schoolProfiling._id,
					academicYear: curAcademicYear._id,
					SAY: SAY._id,
					school: SchoolId,
				}))
				await ProfilingForTeachers.insertMany(teachersProfilingData)
				assessmentHelperService.updateCountsInProfilingsAndIRIs([SchoolId])
			}

			return res
				.status(201)
				.json(
					new SuccessResponse(
						globalConstants.messages.created.replaceField(ALL_FIELDS.SCHOOL_PROFILING),
					),
				)
		} catch (error) {
			console.error(error)
			return res.status(500).json(new FailureResponse(globalConstants.messages.serverError))
		}
	}

	async updateSchoolProfiling(req, res) {
		try {
			const { id } = req.params
			const { startDate, endDate } = req.body

			// Check if profiling exists
			const existingProfiling = await ProfilingForSchools.findById(id)
			if (!existingProfiling) {
				return res.status(404).json(new FailureResponse(globalConstants.messages.notFound))
			}

			const curAcademicYear = await this.getCurrentAcademicYear()

			// Check if this is the latest record for the school in current academic year
			const latestProfilingForSchool = await ProfilingForSchools.findOne({
				school: existingProfiling.school,
				academicYear: curAcademicYear._id,
			}).sort({ endDate: -1, startDate: -1 })

			if (!latestProfilingForSchool) {
				return res.status(400).json(new FailureResponse(globalConstants.messages.notFound))
			}

			// Only allow updating the latest record of current academic year
			if (latestProfilingForSchool._id.toString() !== id) {
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.profilingCantBeUpdated))
			}

			const SAY = await SchoolAcademicYears.findOne({
				school: existingProfiling.school,
				academicYear: curAcademicYear._id,
			}).lean()
			const AYStart = moment(SAY.startDate)
			const AYEnd = moment(SAY.endDate)

			const start_date = moment(startDate)
			const end_date = moment(endDate)

			const curDate = moment(new Date())
			const existingProfilingStartDate = moment(latestProfilingForSchool.startDate)
			const existingProfilingEndDate = moment(latestProfilingForSchool.endDate)

			// Check if latest profiling is already started then do not allow to update start date
			if (
				start_date &&
				existingProfilingStartDate.isSameOrBefore(curDate, 'day') &&
				!existingProfilingStartDate.isSame(start_date, 'day')
			) {
				return res
					.status(400)
					.json(
						new FailureResponse(
							globalConstants.messages.profilingStartDateCantBeUpdated,
						),
					)
			}

			// Basic date validations
			if (end_date.isSameOrBefore(start_date, 'day')) {
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.profilingDatesError))
			}

			// Check if dates are within current academic year
			if (start_date && start_date.isBefore(AYStart, 'day')) {
				return res
					.status(400)
					.json(
						new FailureResponse(
							globalConstants.messages.dateShouldBeWithinCurAY.replaceField(
								ALL_FIELDS.START_DATE,
							),
						),
					)
			}

			if (end_date && end_date.isAfter(AYEnd, 'day')) {
				return res
					.status(400)
					.json(
						new FailureResponse(
							globalConstants.messages.dateShouldBeWithinCurAY.replaceField(
								ALL_FIELDS.END_DATE,
							),
						),
					)
			}

			// Check for date conflicts with other profiling records (excluding current one)
			const otherProfilingsOfSchoolForCurAY = await ProfilingForSchools.find({
				_id: { $ne: id },
				school: existingProfiling.school,
				academicYear: curAcademicYear._id,
			})

			// Check if new dates conflict with existing profiling periods
			for (const profiling of otherProfilingsOfSchoolForCurAY) {
				const existingStart = moment(profiling.startDate)
				const existingEnd = moment(profiling.endDate)

				// Check for overlapping date ranges
				if (
					start_date.isBetween(existingStart, existingEnd, 'day', '[]') ||
					end_date.isBetween(existingStart, existingEnd, 'day', '[]') ||
					existingStart.isBetween(start_date, end_date, 'day', '[]') ||
					existingEnd.isBetween(start_date, end_date, 'day', '[]')
				) {
					return res
						.status(400)
						.json(
							new FailureResponse(
								globalConstants.messages.dateConflictWithExistingProfiling,
							),
						)
				}
			}

			let status = existingProfiling.profilingStatus
			if (!existingProfilingEndDate.isSame(start_date, 'day')) {
				if (end_date.isSameOrAfter(curDate, 'day')) {
					status = STATUSES.ACTIVE
					this.addProfilingForTeachersOfNewTeachers(existingProfiling)
				} else if (end_date.isBefore(curDate, 'day')) {
					status = STATUSES.IN_ACTIVE
					this.addProfilingForTeachersOfNewTeachers(existingProfiling)
				}
			}

			// Update only start and end dates
			const updateData = {
				startDate: start_date,
				endDate: end_date,
				profilingStatus: status,
			}

			await ProfilingForSchools.findByIdAndUpdate(id, updateData, { new: true })

			return res
				.status(200)
				.json(
					new SuccessResponse(
						globalConstants.messages.updated.replaceField(ALL_FIELDS.SCHOOL_PROFILING),
					),
				)
		} catch (error) {
			console.error(error)
			return res.status(500).json(new FailureResponse(globalConstants.messages.serverError))
		}
	}

	/**
	 * This function will create new iri for teachers for those teachers who are not part of given profilingForSchool
	 *
	 * @param {*} profilingForSchool
	 */
	async addProfilingForTeachersOfNewTeachers(profilingForSchool) {
		const teachers = await Teacher.find({
			SchoolId: profilingForSchool.school,
			isDeleted: { $ne: true },
		})
		const profilingsForTeacher = await ProfilingForTeachers.find({
			schoolProfilingId: profilingForSchool._id,
		}).lean()

		const teacherProfilingsToInsert = []

		for (const teacher of teachers) {
			const teacherProfiling = profilingsForTeacher.find(
				(obj) => obj.teacher.toString() === teacher._id.toString(),
			)
			if (!teacherProfiling) {
				teacherProfilingsToInsert.push({
					teacher: teacher._id,
					schoolProfilingId: profilingForSchool._id,
					academicYear: profilingForSchool.academicYear,
					SAY: profilingForSchool.SAY,
					school: profilingForSchool.school,
				})
			}
		}

		if (teacherProfilingsToInsert.length) {
			// Adding new teacher profiling records
			await ProfilingForTeachers.insertMany(teacherProfilingsToInsert)

			// Updating counts in profilingForSchool after adding new teachers
			assessmentHelperService.updateCountsInProfilingsAndIRIs([profilingForSchool.school])
		}
	}
}

const schoolProfilingService = new SchoolProfilingService()
module.exports.schoolProfilingService = schoolProfilingService
