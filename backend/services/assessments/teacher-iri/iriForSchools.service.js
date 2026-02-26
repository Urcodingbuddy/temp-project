const { mongoose } = require('mongoose')
const utils = require('../../../utility/utils')
const { CommonHelperServices } = require('../../common-services/common-helper-service')
const { ALL_FIELDS, STATUSES } = require('../../../utility/localConstants')
const { SuccessResponse, FailureResponse } = require('../../../models/response/globalResponse')
const moment = require('moment')
const { SchoolAcademicYears } = require('../../../models/database/school-academic-years')
const { Teacher } = require('../../../models/database/myPeegu-teacher')
const { IRIForSchools } = require('../../../models/database/IRI-for-schools')
const { IRIForTeachers } = require('../../../models/database/IRI-for-teachers')
const { assessmentHelperService } = require('../assessment-helper-service')

class SchoolIRIService extends CommonHelperServices {
	async fetchAllIRIsForSchools(req, res) {
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

		const sortFields = globalConstants.schoolIRISortFields
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
					matchQuery.IRIStatus = STATUSES.ACTIVE
				} else if (status === STATUSES.INACTIVE) {
					matchQuery.IRIStatus = STATUSES.IN_ACTIVE
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
					IRIStatus: 1,
					startDate: 1,
					endDate: 1,
					totalTeacherCount: 1,
					submittedTeacherCount: 1,
					pendingTeacherCount: 1,
					schoolId: '$schoolDetails._id',
					schoolName: '$schoolDetails.school',
					academicYearId: '$academicYearDetails._id',
					academicYear: '$academicYearDetails.academicYear',
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

		const result = await IRIForSchools.aggregate(facetPipeline)

		const records = result[0]?.data || []
		const totalCount = result[0]?.totalCount[0]?.count || 0

		if (downloadAndFilter) {
			const formattedData = records.map((item) => utils.formatIRIForSchoolsData(item))
			return res.json(formattedData)
		}

		return res.json({
			data: records,
			page,
			pageSize: PAGE_SIZE,
			totalCount,
		})
	}

	async addSchoolIRI(req, res) {
		try {
			const { SchoolId, startDate, endDate = [] } = req.body

			const isValidDate = (date) => !isNaN(Date.parse(date))

			if (!isValidDate(startDate) || !isValidDate(endDate)) {
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.invalidDate))
			}

			// Check if IRIEndDateForSchool is less than IRIStartDateForSchool
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
					.json(new FailureResponse(globalConstants.messages.iriDatesError))
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

			const irisOfSchoolForCurAY = await IRIForSchools.findOne({
				school: SchoolId,
				academicYear: curAcademicYear._id,
			}).sort({ startDate: -1, endDate: -1 })

			if (irisOfSchoolForCurAY) {
				const existingIRIEndDate = moment(irisOfSchoolForCurAY.endDate)

				const curDate = moment(new Date())
				if (existingIRIEndDate.isSameOrAfter(curDate)) {
					return res
						.status(400)
						.json(new FailureResponse(globalConstants.messages.youCannotAddIRI))
				}

				if (start_date.isSameOrBefore(existingIRIEndDate)) {
					return res
						.status(400)
						.json(new FailureResponse(globalConstants.messages.youCannotAddIRI))
				}
			}

			const iriId = new mongoose.Types.ObjectId()
			const schoolIRI = new IRIForSchools({
				_id: iriId,
				school: SchoolId,
				SAY: SAY._id,
				academicYear: curAcademicYear._id,
				startDate: start_date,
				endDate: end_date,
			})
			await schoolIRI.save()

			const teachers = await Teacher.find({ SchoolId, isDeleted: { $ne: true } })
			if (teachers.length) {
				const teachersIRIData = teachers.map((obj) => ({
					teacher: obj._id,
					schoolIRIId: schoolIRI._id,
					academicYear: curAcademicYear._id,
					SAY: SAY._id,
					school: SchoolId,
				}))
				await IRIForTeachers.insertMany(teachersIRIData)
				assessmentHelperService.updateCountsInProfilingsAndIRIs([SchoolId])
			}

			return res
				.status(201)
				.json(
					new SuccessResponse(
						globalConstants.messages.created.replaceField(ALL_FIELDS.SCHOOL_IRI),
					),
				)
		} catch (error) {
			console.error(error)
			return res.status(500).json(new FailureResponse(globalConstants.messages.serverError))
		}
	}

	async updateSchoolIRI(req, res) {
		try {
			const { id } = req.params
			const { startDate, endDate } = req.body

			// Check if IRI exists
			const existingIRI = await IRIForSchools.findById(id)
			if (!existingIRI) {
				return res.status(404).json(new FailureResponse(globalConstants.messages.notFound))
			}

			const curAcademicYear = await this.getCurrentAcademicYear()

			// Check if this is the latest record for the school in current academic year
			const latestIRIForSchool = await IRIForSchools.findOne({
				school: existingIRI.school,
				academicYear: curAcademicYear._id,
			}).sort({ endDate: -1, startDate: -1 })

			if (!latestIRIForSchool) {
				return res.status(400).json(new FailureResponse(globalConstants.messages.notFound))
			}

			// Only allow updating the latest record of current academic year
			if (latestIRIForSchool._id.toString() !== id) {
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.iriCantBeUpdated))
			}

			const SAY = await SchoolAcademicYears.findOne({
				school: existingIRI.school,
				academicYear: curAcademicYear._id,
			}).lean()
			const AYStart = moment(SAY.startDate)
			const AYEnd = moment(SAY.endDate)

			const start_date = moment(startDate)
			const end_date = moment(endDate)

			const curDate = moment(new Date())
			const existingIRIStartDate = moment(latestIRIForSchool.startDate)
			const existingIRIEndDate = moment(latestIRIForSchool.endDate)

			// Check if latest iri is already started then do not allow to update start date
			if (
				start_date &&
				existingIRIStartDate.isSameOrBefore(curDate, 'day') &&
				!existingIRIStartDate.isSame(start_date, 'day')
			) {
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.iriStartDateCantBeUpdated))
			}

			// Basic date validations
			if (end_date.isSameOrBefore(start_date, 'day')) {
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.iriDatesError))
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

			// Check for date conflicts with other iri records (excluding current one)
			const otherIRIsOfSchoolForCurAY = await IRIForSchools.find({
				_id: { $ne: id },
				school: existingIRI.school,
				academicYear: curAcademicYear._id,
			})

			// Check if new dates conflict with existing iri periods
			for (const iri of otherIRIsOfSchoolForCurAY) {
				const existingStart = moment(iri.startDate)
				const existingEnd = moment(iri.endDate)

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
								globalConstants.messages.dateConflictWithExistingIRI,
							),
						)
				}
			}

			let status = existingIRI.IRIStatus
			if (!existingIRIEndDate.isSame(start_date, 'day')) {
				if (end_date.isSameOrAfter(curDate, 'day')) {
					status = STATUSES.ACTIVE
					this.addIRIForTeachersOfNewTeachers(existingIRI)
				} else if (end_date.isBefore(curDate, 'day')) {
					status = STATUSES.IN_ACTIVE
					this.addIRIForTeachersOfNewTeachers(existingIRI)
				}
			}

			// Update only start and end dates
			const updateData = {
				startDate: start_date,
				endDate: end_date,
				IRIStatus: status,
			}

			await IRIForSchools.findByIdAndUpdate(id, updateData, { new: true })

			return res
				.status(200)
				.json(
					new SuccessResponse(
						globalConstants.messages.updated.replaceField(ALL_FIELDS.SCHOOL_IRI),
					),
				)
		} catch (error) {
			console.error(error)
			return res.status(500).json(new FailureResponse(globalConstants.messages.serverError))
		}
	}

	/**
	 * This function will create new iri for teachers for those teachers who are not part of given iriForSchool
	 *
	 * @param {*} iriForSchool
	 */
	async addIRIForTeachersOfNewTeachers(iriForSchool) {
		const teachers = await Teacher.find({
			SchoolId: iriForSchool.school,
			isDeleted: { $ne: true },
		})
		const irisForTeachers = await IRIForTeachers.find({
			schoolIRIId: iriForSchool._id,
		}).lean()

		const teacherIRIsToInsert = []
		for (const teacher of teachers) {
			const teacherIRI = irisForTeachers.find(
				(obj) => obj.teacher.toString() === teacher._id.toString(),
			)
			if (!teacherIRI) {
				teacherIRIsToInsert.push({
					teacher: teacher._id,
					schoolIRIId: iriForSchool._id,
					academicYear: iriForSchool.academicYear,
					SAY: iriForSchool.SAY,
					school: iriForSchool.school,
				})
			}
		}

		if (teacherIRIsToInsert.length) {
			// Adding new teacher iri records
			await IRIForTeachers.insertMany(teacherIRIsToInsert)

			// Updating counts in iriForSchool after adding new teachers
			assessmentHelperService.updateCountsInProfilingsAndIRIs([iriForSchool.school])
		}
	}
}

const schoolIRIService = new SchoolIRIService()
module.exports.schoolIRIService = schoolIRIService
