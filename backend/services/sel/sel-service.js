const { mongoose } = require('mongoose')
const utils = require('../../utility/utils')
const { CommonHelperServices } = require('../common-services/common-helper-service')
const { FailureResponse, SuccessResponse } = require('../../models/response/globalResponse')
const { SELCurriculumTracker } = require('../../models/database/myPeegu-SEL')
const { ALL_FIELDS, months } = require('../../utility/localConstants')
const { Classrooms } = require('../../models/database/myPeegu-classroom')
const { commonServices } = require('../common-services/common-services')
const { SchoolAcademicYears } = require('../../models/database/school-academic-years')
const { SELModule } = require('../../models/database/SEL-module')
const { generatePreSignedUrl } = require('../../routes/AWSS3Manager')

class SELServices extends CommonHelperServices {
	async fetchSELList(req, res) {
		const { error, page, PAGE_SIZE, downloadAndFilter, skip, emptyData, academicYears } =
			await this.validateAndGetAYsAndPaginationData(req)
		if (error) {
			return res.status(200).json(emptyData)
		}

		let sortFields = globalConstants.SELCurriculumTrackerSortFields
		const sortOptions = utils.buildSortOptions(req.body, sortFields) ?? null

		let query = {
			status: globalConstants.studentStatus.Active,
			academicYear: { $in: academicYears },
		}

		if (!req.user.isAdmin) {
			query.school = { $in: req.user.assignedSchools }
		}

		const filterBody = req.body.filter
		if (filterBody) {
			if (utils.isAValidArray(filterBody.schoolIds)) {
				query.school = {
					$in: filterBody.schoolIds.map((id) => new mongoose.Types.ObjectId(id)),
				}
			}
			if (utils.isAValidArray(filterBody.classroomIds)) {
				query.classRoomId = {
					$in: filterBody.classroomIds.map((id) => new mongoose.Types.ObjectId(id)),
				}
			}
		}

		const bQuery = [
			{
				$match: query,
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
					from: 'classrooms', // The name of the Classrooms collection
					localField: 'classRoomId',
					foreignField: '_id',
					as: 'classRoom',
				},
			},
			{
				$unwind: '$classRoom', // Unwind the array created by $lookup
			},
			{
				$addFields: {
					schoolName: '$schoolData.school',
					className: '$classRoom.className',
					section: '$classRoom.section',
				},
			},
			{
				$match: {
					'schoolData.status': globalConstants.schoolStatus.Active,
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
					academicYear: '$academicYearData.academicYear',
					academicYearId: '$academicYearData._id',
				},
			},
		]

		if (sortOptions) {
			bQuery.push({ $sort: sortOptions })
		}

		bQuery.push({
			$project: {
				__v: 0,
				studentData: 0,
				schoolData: 0,
				academicYearData: 0,
				createdAt: 0,
				updatedAt: 0,
				classRoom: 0,
			},
		})

		const pipeline = utils.buildPipeline(bQuery, downloadAndFilter, skip, PAGE_SIZE)
		const records = await SELCurriculumTracker.aggregate(pipeline)

		if (downloadAndFilter) {
			if (records[0]?.data) {
				const modifiedData = utils.formatDataForDownload(records[0].data)
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

	async fetchSELCurriculumTrackerDetails(req, res) {
		const { id } = req.params
		req.body['id'] = id
		const { error, message, statusCode } = await this.validateStudentDataAndUser(
			req,
			SELCurriculumTracker,
			ALL_FIELDS.SEL_CURRICULUM_DETAILS,
		)
		if (error) {
			return res.status(statusCode).json(message)
		}
		return commonServices.fetchStudentInitData(req, res, SELCurriculumTracker, false)
	}

	async createSEL(req, res) {
		const body = req.body
		const { error, message, school, SAY, academicYear } =
			await this.validateUserSchoolAndAY(req)
		if (error) {
			return res.status(400).json(new FailureResponse(message))
		}

		const validateDate = utils.isDateWithinRange(
			body.SELData.interactionDate,
			SAY.startDate,
			SAY.endDate,
		)
		if (!validateDate) {
			return res
				.status(400)
				.json(
					new FailureResponse(
						globalConstants.messages.dateShouldBeBetweenStartEndDateOfAY.replaceField(
							`${ALL_FIELDS.SEL} ${ALL_FIELDS.DATE}`,
						),
					),
				)
		}

		const selData = body.SELData
		const classroom = await Classrooms.findOne({
			_id: body.classroomId,
			status: globalConstants.schoolStatus.Active,
		})

		if (!classroom) {
			return res
				.status(400)
				.json(
					new FailureResponse(
						globalConstants.messages.invaliField.replaceField(ALL_FIELDS.CLASSROOM),
					),
				)
		}

		if (classroom.academicYear.toString() !== academicYear._id.toString()) {
			return res
				.status(400)
				.json(
					new FailureResponse(
						globalConstants.messages.invaliField.replaceField(ALL_FIELDS.CLASSROOM),
					),
				)
		}

		const dataToCreate = {
			...selData,
			section: classroom.section,
			className: classroom.className,
			school: school._id,
			classRoomId: classroom._id,
			SAY: SAY._id,
			academicYear: academicYear._id,
		}

		await SELCurriculumTracker.create(dataToCreate)
		return res.status(201).json(new SuccessResponse(globalConstants.messages.SELcreated))
	}

	async updateSEL(req, res) {
		const body = req.body || {}

		const {
			error,
			message,
			statusCode,
			record: selRecord,
		} = await this.validateStudentDataAndUser(
			req,
			SELCurriculumTracker,
			ALL_FIELDS.SEL_CURRICULUM_DETAILS,
		)
		if (error) {
			return res.status(statusCode).json(message)
		}

		const SAY = await SchoolAcademicYears.findOne({
			academicYear: selRecord.academicYear,
			school: selRecord.school,
		})

		const validateDate = utils.isDateWithinRange(
			body.SELData.interactionDate,
			SAY.startDate,
			SAY.endDate,
		)
		if (!validateDate) {
			return res
				.status(400)
				.json(
					new FailureResponse(
						globalConstants.messages.dateShouldBeBetweenStartEndDateOfAY.replaceField(
							`${ALL_FIELDS.SEL} ${ALL_FIELDS.DATE}`,
						),
					),
				)
		}

		const selDataInReqBody = body.SELData
		selRecord.coreCompetency = selDataInReqBody.coreCompetency ?? selRecord.coreCompetency
		selRecord.className = selDataInReqBody.className ?? selRecord.className
		selRecord.section = selDataInReqBody.section ?? selRecord.section
		selRecord.topic = selDataInReqBody.topic ?? selRecord.topic
		selRecord.commentsOrObservations =
			selDataInReqBody.commentsOrObservations ?? selRecord.commentsOrObservations
		selRecord.activity = selDataInReqBody.activity ?? selRecord.activity
		selRecord.taskAssignedOrReflection =
			selDataInReqBody.taskAssignedOrReflection ?? selRecord.taskAssignedOrReflection
		selRecord.interventionForEducators =
			selDataInReqBody.interventionForEducators ?? selRecord.interventionForEducators
		selRecord.outcome = selDataInReqBody.outcome ?? selRecord.outcome
		selRecord.followUpActivity = selDataInReqBody.followUpActivity ?? selRecord.followUpActivity
		selRecord.interactionDate = selDataInReqBody.interactionDate ?? selRecord.interactionDate

		await selRecord.save()
		return res
			.status(200)
			.json(
				new SuccessResponse(
					globalConstants.messages.updated.replaceField(
						ALL_FIELDS.SEL_CURRICULUM_DETAILS,
					),
				),
			)
	}

	async deleteSELRecord(req, res) {
		return this.deleteSingleRecord(
			req,
			res,
			SELCurriculumTracker,
			ALL_FIELDS.SEL_CURRICULUM_DETAILS,
		)
	}

	async viewSELModule(req, res) {
		const { month, year } = req.body

		// Make an array of month names no matter how your `months` constant is shaped
		const MONTHS = months.map((m) => (typeof m === 'string' ? m : m.name))
		const idx = MONTHS.indexOf(month)
		if (idx === -1) {
			return res
				.status(400)
				.json(
					new FailureResponse(
						globalConstants.messages.invalidField.replaceField(ALL_FIELDS.MONTH),
					),
				)
		}

		// Ensure consistent type with DB (number vs string). Adjust as needed.
		const yr = Number(year)
		if (!Number.isFinite(yr)) {
			return res
				.status(400)
				.json(
					new FailureResponse(
						globalConstants.messages.invalidField.replaceField(ALL_FIELDS.YEAR),
					),
				)
		}

		// Build exact (month, year) pairs for prev/current/next month
		const prevIdx = (idx + 11) % 12
		const nextIdx = (idx + 1) % 12

		const pairs = [
			{ month: MONTHS[prevIdx], year: prevIdx === 11 ? yr - 1 : yr }, // prev month (Dec → previous year)
			{ month: MONTHS[idx], year: yr }, // current month
			{ month: MONTHS[nextIdx], year: nextIdx === 0 ? yr + 1 : yr }, // next month (Jan → next year)
		]

		// If your DB stores year as a string, convert here:
		// pairs.forEach(p => p.year = String(p.year));

		const selModules = await SELModule.find({ $or: pairs }).sort({ year: 1 }).lean()
		return res.status(200).json(selModules)
	}

	async generateAndSendPresignedUrls(req, res) {
		if (!req.user.isAdmin) {
			return res
				.status(403)
				.json(new FailureResponse(globalConstants.messages.doNotHavePermission))
		}

		const { filePaths, year, month } = req.body

		// Create promises for each file
		const presignedPromises = filePaths.map(async (url) => {
			const [folderName, fileName] = url.split('/')
			const path = `${globalConstants.selModulePath}/${year}/${month.toLowerCase()}/${folderName}/`

			// Await the generatePreSignedUrl function
			const presignedUrl = await generatePreSignedUrl(path, fileName, globalConstants.PdfType)

			// Return the filename as key and URL as value
			return {
				[fileName]: presignedUrl,
			}
		})

		const presignedUrlsArray = await Promise.all(presignedPromises)

		// Convert array of objects to single object
		const presignedUrls = Object.assign({}, ...presignedUrlsArray)

		return res.status(200).json(presignedUrls)
	}

	async addUpdateSelModule(req, res) {
		if (!req.user.isAdmin) {
			return res
				.status(403)
				.json(new FailureResponse(globalConstants.messages.doNotHavePermission))
		}

		const { filePaths, year, month } = req.body
		const categoriesMap = {}
		for (const filePath of filePaths) {
			const [category, fileName] = filePath.split('/')
			if (!categoriesMap[category]) {
				categoriesMap[category] = []
			}
			const file = {
				fileName,
				path: `/${globalConstants.selModulePath}/${year}/${month.toLowerCase()}/${filePath}`,
				order: categoriesMap[category].length + 1,
			}

			categoriesMap[category].push(file)
		}

		const categories = Object.keys(categoriesMap).map((key, i) => ({
			categoryName: key,
			files: categoriesMap[key],
			order: i + 1,
		}))

		const selModule = await SELModule.findOne({ year, month })

		if (selModule) {
			selModule.categories = categories
			await selModule.save()

			return res
				.status(200)
				.json(
					new SuccessResponse(
						globalConstants.messages.updated.replaceField(ALL_FIELDS.SEL_MODULE),
					),
				)
		}

		await SELModule.create({
			month,
			year,
			categories,
		})

		return res
			.status(201)
			.json(
				new SuccessResponse(
					globalConstants.messages.created.replaceField(ALL_FIELDS.SEL_MODULE),
				),
			)
	}

	async verifySelModule(req, res) {
		if (!req.user.isAdmin) {
			return res
				.status(403)
				.json(new FailureResponse(globalConstants.messages.doNotHavePermission))
		}

		const { year, month } = req.body

		const selModule = await SELModule.findOne({ year, month })
		return res.status(200).json({ exist: selModule ? true : false })
	}
}

const selServices = new SELServices()
module.exports.selServices = selServices
