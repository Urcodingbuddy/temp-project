const { SchoolsCommonService } = require('./schools.common.service')
const { SchoolAcademicYears } = require('../../models/database/school-academic-years')
const { Schools } = require('../../models/database/myPeegu-school')
const { generatePreSignedUrl, isFileExistInS3 } = require('../../routes/AWSS3Manager')
const { FailureResponse, SuccessResponse } = require('../../models/response/globalResponse')
const { AcademicYears } = require('../../models/database/academic-years')
const { ALL_FIELDS } = require('../../utility/localConstants')
const utils = require('../../utility/utils')
const { set, toDate } = require('date-fns')
const moment = require('moment')
const mongooseErrorHandler = require('../../utility/mongooseErrorHandler')
const { mongoose } = require('mongoose')
const { changeSchoolName } = require('../../reusableFunctions/validationFunction')

class SchoolsService extends SchoolsCommonService {
	async addSchool(req, res) {
		const school = req.body
		//add additional parameters in this condition if required
		if (!school.scCode)
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.missingParameters))
		const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/

		if (specialCharsRegex.test(school.scCode)) {
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.scCodeSpecialCharError))
		}

		const academicYear = await AcademicYears.findOne({ _id: school.academicYear })
		if (!academicYear) {
			return res
				.status(400)
				.json(
					new FailureResponse(
						globalConstants.messages.invalidField.replaceField(
							ALL_FIELDS.ACADEMIC_YEAR,
						),
					),
				)
		}
		const startYear = Number(academicYear.academicYear.slice(0, 4))
		const endYear = Number(academicYear.academicYear.slice(5))

		const scStartDate = moment(school.scStartDate)
		const scEndDate = moment(school.scEndDate)

		if (scStartDate.year() !== startYear) {
			return res
				.status(400)
				.json(
					new FailureResponse(
						globalConstants.messages.selectStartYearWithinAcYear.replaceField1And2(
							`${startYear}`,
							academicYear.academicYear,
						),
					),
				)
		}

		if (scEndDate.year() !== endYear) {
			return res
				.status(400)
				.json(
					new FailureResponse(
						globalConstants.messages.selectEndYearWithinAcYear.replaceField1And2(
							`${endYear}`,
							academicYear.academicYear,
						),
					),
				)
		}

		const schoolExists = await Schools.findOne({ scCode: school.scCode })
		if (schoolExists)
			return res.status(400).json(new FailureResponse(globalConstants.messages.invalidScCode))
		if (school.establishedYear && school.establishedYear.length === 4) {
			const year = parseInt(school.establishedYear)
			// Check if the year is a valid number
			if (!isNaN(year) && year >= 1800 && year <= new Date().getFullYear()) {
				const result = set(new Date(), { month: 3, date: 30, year })
				school.establishedYear = toDate(result)
			}
		} // No error will be thrown, and the establishedYear will be ignored if it doesn't exist or is invalid
		if (school.onboardDate) {
			if (
				!utils.isValidDate(school.onboardDate) ||
				(utils.isValidDate(school.onboardDate) &&
					new Date(school.onboardDate) > new Date(Date.now()))
			)
				// TODO : international support?
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.invalidDate))
		}
		if (!utils.isValidDate(school?.scStartDate)) {
			return res.status(400).json(new FailureResponse(globalConstants.messages.invalidDate))
		}

		if (!utils.isValidDate(school?.scEndDate)) {
			return res.status(400).json(new FailureResponse(globalConstants.messages.invalidDate))
		}

		//image uploads codeblock begin
		let scLogo = null
		if (utils.isAValidString(school.scLogo)) {
			//&& myPeeguUser.scLogo !== school.scLogo) {
			scLogo = utils.fetchUrlSafeString(school.scLogo)
		}
		if (req.query.saveSchool && req.query.saveSchool === globalConstants.booleanString.true) {
			if (scLogo) {
				const fileUrl = `${globalConstants.scLogoPath}${scLogo}`
				const existFile = await isFileExistInS3(fileUrl)
				if (!existFile) {
					return res
						.status(400)
						.json(new FailureResponse(globalConstants.messages.invalidImage))
				} else {
					school.logoUrl = `${miscellaneous.resourceBaseurl}${globalConstants.scLogoPath}${scLogo}`
				}
			}
		} else if (
			!req.query.saveSchool ||
			(req.query.saveSchool && req.query.saveSchool === globalConstants.booleanString.false)
		) {
			if (scLogo) {
				const s3link = await generatePreSignedUrl(
					globalConstants.scLogoPath,
					scLogo,
					globalConstants.PngImageType,
				)
				return res.json({ s3link: s3link })
			} else {
				res.status(200)
				return res.end() //send empty response with status 200
			}
		}

		const curAY = await this.getCurrentAcademicYear()

		//image uploads codeblock end
		school.createdById = req.user._id
		school.createdByName = req.user.fullName
		school.lastPromotionAcademicYear = curAY._id
		school.lastPromotionDate = new Date()
		Schools.create(school) //create school record and return the created document
			.then(async (createdSchool) => {
				await this.createSchoolAcademicYears(school, createdSchool._id, academicYear)
				return res
					.status(201)
					.json(new SuccessResponse(globalConstants.messages.schoolAdded))
			})
			.catch((error) => {
				const failureResponse = mongooseErrorHandler.handleError(error)
				return res.status(400).json(failureResponse)
			})
	}

	/**
	 * This function will check if the selected academic year is current academic year if not it will create school academic years
	 * from selected to till date academic years and if selected & current academic years are same then will create one.
	 *
	 * @param {Body} school request.body of create school
	 * @param {string} createdSchoolId new created school id
	 * @param {string} academicYearId selected academic year id
	 */
	async createSchoolAcademicYears(school, createdSchoolId, academicYear) {
		const curYear = new Date().getFullYear()
		const curAcademicYear = `${curYear}-${curYear + 1}`
		if (academicYear.academicYear !== curAcademicYear) {
			const acYearsTillDataFromSelected = utils.generateAcademicYearsTillCurrent(
				academicYear.academicYear,
			)
			const academicYearsFromDB =
				(await AcademicYears.find({
					academicYear: { $in: acYearsTillDataFromSelected },
				})) ?? []
			const bulkOperations = []
			for (const acYear of academicYearsFromDB) {
				bulkOperations.push({
					insertOne: {
						document: {
							academicYear: acYear._id,
							school: createdSchoolId,
							startDate: new Date(school.scStartDate),
							endDate: new Date(school.scEndDate),
							currentAcYear: acYear.academicYear === curAcademicYear,
						},
					},
				})
			}
			await SchoolAcademicYears.bulkWrite(bulkOperations)
		} else {
			const scAcYearData = {
				academicYear: academicYear._id,
				school: createdSchoolId,
				startDate: new Date(school.scStartDate),
				endDate: new Date(school.scEndDate),
				currentAcYear: true,
			}
			await SchoolAcademicYears.create(scAcYearData)
		}
	}

	async updateSchool(req, res) {
		const school = req.body || {}
		if (!utils.isMongooseObjectId(school.id))
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.missingParameters))
		const schoolRecord = await Schools.findOne({
			_id: school.id,
			// status: globalConstants.schoolStatus.Active,
		})
		if (!schoolRecord)
			return res.status(400).json(new FailureResponse(globalConstants.messages.notFound))
		if (utils.isAValidString(school.scCode)) {
			//if schoolcode is valid and unique update it, otherwise reject it.
			const existingSchoolCode = await Schools.countDocuments({
				_id: { $ne: schoolRecord._id },
				scCode: school.scCode,
				status: globalConstants.schoolStatus.Active,
			})
			if (existingSchoolCode)
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.invalidScCode))
			else schoolRecord.scCode = school.scCode
		}
		if (school.establishedYear && school.establishedYear.length === 4) {
			const year = parseInt(school.establishedYear)
			// Check if the year is a valid number
			if (!isNaN(year) && year >= 1800 && year <= new Date().getFullYear()) {
				const result = set(new Date(), { month: 3, date: 30, year })
				schoolRecord.establishedYear = toDate(result)
			}
		} // No error will be thrown, and the establishedYear will be ignored if it doesn't exist or is invalid
		if (school.onboardDate) {
			if (
				!utils.isValidDate(school.onboardDate) ||
				(utils.isValidDate(school.onboardDate) &&
					new Date(school.onboardDate) > new Date(Date.now()))
			)
				// TODO : international support?
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.invalidDate))
		}
		schoolRecord.onboardDate = school.onboardDate
		//image validations
		let scLogo = school.scLogo
		if (req.query.saveSchool && req.query.saveSchool === globalConstants.booleanString.true) {
			if (scLogo) {
				if (!school.scLogo.startsWith('http')) {
					const fileUrl = `${globalConstants.scLogoPath}${scLogo}`
					const existFile = await isFileExistInS3(fileUrl)
					if (!existFile) {
						return res
							.status(400)
							.json(new FailureResponse(globalConstants.messages.invalidImage))
					} else {
						schoolRecord.logoUrl = `${miscellaneous.resourceBaseurl}${globalConstants.scLogoPath}${scLogo}`
					}
				}
			}
		} else if (
			!req.query.saveSchool ||
			(req.query.saveSchool && req.query.saveSchool === globalConstants.booleanString.false)
		) {
			if (scLogo) {
				const s3link = await generatePreSignedUrl(
					globalConstants.scLogoPath,
					scLogo,
					globalConstants.PngImageType,
				)
				return res.json({ s3link: s3link })
			} else {
				res.status(200)
				return res.end() //send empty response with status 200
			}
		}
		//send all data or do not send at all. to delete value send empty string
		schoolRecord.updatedById = req.user._id
		schoolRecord.updatedByName = req.user.fullName
		schoolRecord.principalName = school.principalName ?? schoolRecord.principalName
		schoolRecord.principalEmail =
			school.principalEmail && utils.isValidEmailFormat(school.principalEmail)
				? school.principalEmail
				: schoolRecord.principalEmail
		schoolRecord.principalPhone = utils.isAValidString(school.principalPhone)
			? school.principalPhone
			: schoolRecord.principalPhone
		schoolRecord.city = school.city ?? schoolRecord.city
		schoolRecord.state = school.state ?? schoolRecord.state
		schoolRecord.country = school.country ?? schoolRecord.country
		schoolRecord.pinCode = school.pinCode ?? schoolRecord.pinCode
		schoolRecord.webSite = school.webSite ?? schoolRecord.webSite
		const previousSchoolName = schoolRecord.school
		schoolRecord.school = school.school ?? schoolRecord.school
		schoolRecord.about = school.about ?? schoolRecord.about
		schoolRecord
			.save()
			.then(async () => {
				if (previousSchoolName.trim() !== school.school?.trim()) {
					changeSchoolName(schoolRecord._id)
				}
				return res
					.status(200)
					.json(new SuccessResponse(globalConstants.messages.schoolUpdated))
			})
			.catch((error) => {
				const failureResponse = mongooseErrorHandler.handleError(error)

				return res.status(400).json(failureResponse)
			})
	}

	async viewAllSchools(req, res) {
		const PAGE_SIZE = req.body.pageSize || 10
		const page = req.body.page || 1
		const downloadAndFilter = req.query.downloadAndFilter === 'true' || false
		let sortOptions
		const skip = (page - 1) * PAGE_SIZE
		let query = {},
			externalQuery = {},
			schools = {},
			totalCount = 0
		if (!req.user.isAdmin) {
			query._id = {
				$in: req?.user?.assignedSchools?.map((id) => new mongoose.Types.ObjectId(id)),
			}
			query.status = miscellaneous.schoolStatus.Active
		}
		if (!(Object.keys(req.body).length === 0)) {
			let sortFields = globalConstants.schoolSortFields
			sortOptions = utils.buildSortOptions(req.body, sortFields)

			const filter = req.body.filter
			if (filter) {
				if (filter?.status) {
					let filters = filter.status ?? [miscellaneous.schoolStatus.Active]

					// If "All" is included, replace filters with both "Active" and "Inactive"
					if (filters.includes('All')) {
						filters = Object.keys(miscellaneous.schoolStatus) // ['Active', 'Inactive']
					}

					const filteredArray = Object.keys(miscellaneous.schoolStatus).filter(
						(element) => filters.includes(element),
					)

					query.status = { $in: filteredArray }
				}

				if (utils.isAValidArray(filter?.city)) {
					//each city should be string and less than 100 in length
					const filters = filter.city.filter(
						(city) => utils.isAValidString(city) && city.length < 100,
					)
					query.city = { $in: filters.map((city) => new RegExp(`^${city}$`, 'i')) } //regex to ignore case
				}

				if (utils.isAValidArray(filter.lastPromotionAcademicYear)) {
					const ids = filter.lastPromotionAcademicYear.map(
						(id) => new mongoose.Types.ObjectId(id),
					)
					query.lastPromotionAcademicYear = {
						$in: ids,
					}
				}

				if (filter?.byDate === 1) {
					const todayStart = new Date()
					todayStart.setHours(0, 0, 0, 0)

					const todayEnd = new Date()
					todayEnd.setHours(23, 59, 59, 999)

					externalQuery.onboardDate = {
						$gte: todayStart,
						$lte: todayEnd,
					}
				} else if (filter?.byDate === 2) {
					const currentDate = new Date()
					const pastDate = new Date(currentDate)
					pastDate.setDate(currentDate.getDate() - 7) // Calculate the date 7 days ago

					externalQuery.onboardDate = {
						$gte: pastDate,
						$lte: currentDate,
					}
				} else if (filter?.byDate === 3) {
					const currentDate = new Date()
					const pastDate = new Date(currentDate)
					pastDate.setDate(currentDate.getDate() - 30) // Calculate the date 30 days ago

					externalQuery.onboardDate = {
						$gte: pastDate, // Records should have an onboardDate greater than or equal to the past date
						$lte: currentDate, // Records should have an onboardDate less than or equal to the current date
					}
				} else if (filter?.byDate === 4) {
					const currentYear = new Date().getFullYear()
					externalQuery.onboardDate = {
						$gte: new Date(`${currentYear}-01-01`),
						$lte: new Date(`${currentYear}-12-31T23:59:59`),
					}
				} else if (filter?.byDate === 5) {
					const { startDate, endDate } = filter

					// Validate both dates are present
					if (!startDate || !endDate) {
						return res
							.status(400)
							.json(new FailureResponse(globalConstants.messages.invalidDate))
					}

					// Validate both dates are in correct format
					if (!utils.isValidDate(startDate) || !utils.isValidDate(endDate)) {
						return res
							.status(400)
							.json(new FailureResponse(globalConstants.messages.invalidDate))
					}

					// Set start and end of day for both dates
					const pastDate = new Date(startDate)
					pastDate.setHours(0, 0, 0, 0)

					const currentDate = new Date(endDate)
					currentDate.setHours(23, 59, 59, 999)

					externalQuery.onboardDate = { $gte: pastDate, $lte: currentDate }
				}
			}

			const searchFields = ['school', 'scCode', 'city']

			// Only apply search filter if searchText is provided
			if (req.body.searchText && req.body.searchText.trim()) {
				const searchQuery = utils.buildSearchQuery(req.body.searchText, searchFields)
				query.$or = searchQuery.$or
			}

			externalQuery = { ...externalQuery, ...query }
			schools = await Schools.find(externalQuery, { __v: 0 })
				.collation({ locale: 'en' })
				.sort(sortOptions)
				.skip(skip)
				.limit(PAGE_SIZE)
			totalCount = await Schools.countDocuments(externalQuery)

			if (downloadAndFilter) {
				const schools = await Schools.find(externalQuery, { __v: 0 })
					.populate({ path: 'state', select: 'name' })
					.collation({ locale: 'en' })
					.sort(sortOptions)
				const formattedData = schools.map((item) => utils.formatSchoolsData(item, true))
				return res.json(formattedData)
			} else {
				return res.json({
					data: schools,
					page,
					pageSize: PAGE_SIZE,
					totalCount,
				})
			}
		} else {
			schools = await Schools.find(query, { __v: 0 })
				.collation({ locale: 'en' })
				.skip(skip)
				.limit(PAGE_SIZE)
			totalCount = await Schools.countDocuments(query)

			if (downloadAndFilter) {
				const formattedData = schools.map((item) => utils.formatSchoolsData(item, true))
				return res.json(formattedData)
			} else {
				return res.json({
					data: schools,
					page,
					pageSize: PAGE_SIZE,
					totalCount,
				})
			}
		}
	}
}

const schoolsService = new SchoolsService()
module.exports.schoolsService = schoolsService
