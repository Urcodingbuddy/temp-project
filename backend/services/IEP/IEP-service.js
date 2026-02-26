const { StudentCheckList } = require('../../models/database/myPeegu-sendCheckList')
const { Students } = require('../../models/database/myPeegu-student')
const { EducationPlanner } = require('../../models/database/myPeegu-studentPlanner')
const { FailureResponse, SuccessResponse } = require('../../models/response/globalResponse')
const { isFileExistInS3, generatePreSignedUrl } = require('../../routes/AWSS3Manager')
const { ALL_FIELDS } = require('../../utility/localConstants')
const { IEPHelperService } = require('./IEP-helper-servce')
const utils = require('../../utility/utils')
const { default: mongoose } = require('mongoose')

class IEPService extends IEPHelperService {
	/**
	 * Fetches IEP records for students based on filters like school, classroom, student status, and academic year.
	 * Supports pagination, sorting, and optional export formatting.
	 */
	async fetchIEPRecords(req, res) {
		try {
			// Step 1: Validate academic year(s) and pagination, return early if invalid
			const { error, page, PAGE_SIZE, downloadAndFilter, skip, emptyData, academicYears } =
				await this.validateAndGetAYsAndPaginationData(req)
			if (error) {
				return res.status(200).json(emptyData)
			}
			// Step 2: Extract filter body from request
			const filterBody = req.body.filter || {}

			// Step 3: Get all eligible students matching given filters
			const filteredStudents = await this.getFilteredStudentsMultiJourney({
				schoolIds: filterBody.schoolIds,
				classroomIds: filterBody.classroomIds,
				theStudentStatus: filterBody.studentStatus,
				academicYears,
				userAssignedSchools: req.user.assignedSchools,
				isAdmin: req.user.isAdmin,
				searchText: req.body.searchText,
			})

			// Step 4: Build $or query combinations for each student+class+year combination
			const queryCombinations = this.fetchQueryCombinations(filteredStudents)

			// Early return if no students found
			if (queryCombinations === null) {
				return res.json(
					downloadAndFilter
						? {}
						: {
								data: [],
								page,
								pageSize: PAGE_SIZE,
								totalCount: 0,
							},
				)
			}

			// Step 5: Sort options derived from request input and global constants
			let sortOptions = {}
			if (req.body.sortKeys && Array.isArray(req.body.sortKeys)) {
				req.body.sortKeys.forEach((sortKey) => {
					const key = sortKey.key
					const value = sortKey.value
					sortOptions[key] = value
				})
			}

			// Step 6: Fetch records and total count in parallel
			const filter = queryCombinations
			const [records, totalCount] = await Promise.all([
				EducationPlanner.find(filter).sort(sortOptions).skip(skip).limit(PAGE_SIZE),
				EducationPlanner.countDocuments(filter),
			])
			// Step 7: Enrich records with extra fields
			let transformedRecords = await this.transformDataRecordsWithAcademicFeilds(records)
			transformedRecords = this.transformEducationPlannerRecords(transformedRecords)

			// Step 7.5: Perform in-memory sorting for computed fields (ShortTermGoal, LongTermGoal)
			const sortKeys = req.body.sortKeys
			const computedSortFields = ['ShortTermGoal', 'LongTermGoal']
			if (!downloadAndFilter && sortKeys && Array.isArray(sortKeys) && utils.isAValidArray(transformedRecords)) {
				const activeSortKey = sortKeys[0]
				if (activeSortKey && computedSortFields.includes(activeSortKey.key)) {
					transformedRecords.sort((a, b) => {
						const field = activeSortKey.key
						const value = activeSortKey.value
						const valA = a[field] ?? 0
						const valB = b[field] ?? 0
						if (valA < valB) return value === 1 ? -1 : 1
						if (valA > valB) return value === 1 ? 1 : -1
						return 0
					})
				}
			}

			// Step 8: If downloadAndFilter is true, map keys to export-friendly format
			if (downloadAndFilter) {
				try {
					transformedRecords = transformedRecords.map((item) =>
						this.formatStudentEducationalPlannerData(item),
					)
				} catch (err) {
					console.error('Download filter transformation error:', err)
					return res.status(500).json({ error: 'Internal Server Error' })
				}
			}

			// Step 9: Return response
			return res.json(
				downloadAndFilter
					? transformedRecords
					: {
							data: transformedRecords,
							page,
							pageSize: PAGE_SIZE,
							totalCount,
						},
			)
		} catch (err) {
			console.error('Fetch Observations Error:', err)
			return res.status(500).json({ error: 'Internal Server Error' })
		}
	}

	transformEducationPlannerRecords(records) {
		return records.map((rec) => {
			const transitionPlanning = rec.transitionPlanning || {}
			const PlacementWithSEND = rec.PlacementWithSEND || {}
			const checklist = rec.checkList || []

			const shortTermGoalCount = checklist.reduce((sum, item) => {
				return sum + (Array.isArray(item.shortTermGoal) ? item.shortTermGoal.length : 0)
			}, 0)

			const longTermGoalCount = checklist.reduce((sum, item) => {
				return sum + (Array.isArray(item.longTermGoal) ? item.longTermGoal.length : 0)
			}, 0)

			const individualValue = PlacementWithSEND.individual?.value
			const individualFreq = PlacementWithSEND.individual?.frequency?.[0]

			const groupValue = PlacementWithSEND.group?.value
			const groupFreq = PlacementWithSEND.group?.frequency?.[0]

			const transitionYes =
				transitionPlanning.communityExperience?.value === 'Yes' ||
				transitionPlanning.activitiesOfDailyLiving?.value === 'Yes' ||
				transitionPlanning.functional_VocationalAssistance?.value === 'Yes'

			return {
				_id: rec._id,
				user_id: rec.user_id,
				studentName: rec.studentName,
				studentId: rec.studentId,
				academicYear: rec.academicYear,
				createdAt: rec.createdAt,
				Evolution: rec.Evolution?.requirement || 'No',
				AccommodationFromBoard: rec.AccommodationFromBoard?.requirement || 'No',
				AccommodationInternal: rec.AccommodationInternal?.requirement || 'No',
				transitionPlanning: transitionYes ? 'Yes' : 'No',
				IndividualSession:
					individualValue === 'Yes' && individualFreq
						? `Yes (${individualFreq} day/week)`
						: 'No',
				GroupSession:
					groupValue === 'Yes' && groupFreq ? `Yes (${groupFreq} day/week)` : 'No',
				ShortTermGoal: shortTermGoalCount,
				LongTermGoal: longTermGoalCount,
			}
		})
	}

	async fetchIEPRecord(req, res) {
		const {
			error,
			message,
			statusCode,
			record: iepRecord,
		} = await this.validateStudentDataAndUser(req, EducationPlanner, ALL_FIELDS.IEP)
		if (error) {
			return res.status(statusCode).json(message)
		}
		delete iepRecord.graduated
		delete iepRecord.exited
		delete iepRecord.user_id
		delete iepRecord.school
		delete iepRecord.classRoomId

		return res.status(200).json({ data: iepRecord })
	}

	async addIEPRecord(req, res) {
		const body = req.body
		const { error, message, school, SAY, academicYear } =
			await this.validateUserSchoolAndAY(req)
		if (error) {
			return res.status(400).json(new FailureResponse(message))
		}

		const {
			user_id,
			checkList,
			baseLine,
			Evolution,
			AccommodationFromBoard,
			AccommodationInternal,
			transitionPlanning,
			PlacementWithSEND,
		} = body.studentData

		if (!user_id) {
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.missingParameters))
		}

		const student = await Students.findOne({
			status: globalConstants.schoolStatus.Active,
			user_id: { $in: user_id },
			school: school._id,
			graduated: false,
			exited: false,
		}).lean()

		let studentErrMsg = null
		if (!student) {
			studentErrMsg = globalConstants.messages.fieldNotFound.replaceField(ALL_FIELDS.STUDENT)
		} else if (student.graduated) {
			studentErrMsg = globalConstants.messages.alreadyGraduated
		} else if (student.exited) {
			studentErrMsg = globalConstants.messages.alreadyExited
		}
		if (studentErrMsg) {
			return res.status(404).json(new FailureResponse(studentErrMsg))
		}

		const validateStudentInAY = this.validateStudentAndAcademicYearInJourney(
			student,
			academicYear._id,
		)
		if (!validateStudentInAY) {
			return res
				.status(404)
				.json(
					new FailureResponse(
						globalConstants.messages.fieldNotFoundInSelectedAY.replaceField(
							ALL_FIELDS.STUDENT,
						),
					),
				)
		}

		const studentCheckListCategory = await StudentCheckList.findOne({
			studentId: student._id,
			classRoomId: validateStudentInAY.classRoomId,
			academicYear: body.academicYear,
		}).select('checklistForm')
		if (!studentCheckListCategory) {
			return res.status(400).json(new FailureResponse('Check List data not found'))
		}

		const validationError = await this.validateIepRequest(
			req.body,
			studentCheckListCategory.checklistForm,
			student,
			academicYear
		)
		if (validationError) {
			return res.status(400).json(validationError)
		}

		const isEducationPlanExist = await EducationPlanner.findOne({
			studentId: student._id,
			classRoomId: student.classRoomId,
			exited: { $ne: true },
			graduated: { $ne: true },
		}).select('school classRoomId')

		if (isEducationPlanExist) {
			return res
				.status(400)
				.json(
					new FailureResponse(
						globalConstants.messages.educationPlannerRecordAlreadyExist,
					),
				)
		}

		const queryParam = req.query.addPhoto === 'true'
		if (queryParam === true) {
			const pic = utils.fetchUrlSafeString(Evolution.reportLink)
			const fileUrl = `${globalConstants.studentIEP_path}${pic}`
			const existFile = await isFileExistInS3(fileUrl)
			if (!existFile) {
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.invalidImage))
			} else {
				Evolution.reportLink = `${miscellaneous.resourceBaseurl}${globalConstants.studentIEP_path}${pic}`
			}
		}

		const newEducationPlan = await EducationPlanner.create({
			studentId: student._id,
			studentName: student.studentName,
			classRoomId: validateStudentInAY.classRoomId,
			school: school._id,
			user_id: student.user_id,
			baseLine,
			checkList,
			Evolution,
			AccommodationFromBoard,
			AccommodationInternal,
			transitionPlanning,
			PlacementWithSEND,
			SAY: SAY._id,
			academicYear: academicYear._id,
		})
		if (newEducationPlan) {
			return res.json(
				new SuccessResponse(globalConstants.messages.studentEducationPlannerRecordCreated),
			)
		}
	}

	async updateIEPRecord(req, res) {
		const body = req.body
		const {
			error,
			message,
			statusCode,
			record: iepRecord,
		} = await this.validateStudentDataAndUser(req, EducationPlanner, ALL_FIELDS.IEP)
		if (error) {
			return res.status(statusCode).json(message)
		}

		const {
			id,
			user_id,
			baseLine,
			checkList,
			Evolution,
			AccommodationFromBoard,
			AccommodationInternal,
			transitionPlanning,
			PlacementWithSEND,
		} = body.studentData

		if (!user_id) {
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.missingParameters))
		}

		const student = await Students.findOne({
			status: globalConstants.schoolStatus.Active,
			user_id: { $in: user_id },
			school: iepRecord.school,
			graduated: false,
			exited: false,
		})
			.select('studentName user_id graduated exited section classRoomId studentsJourney')
			.lean()

		let studentErrMsg = null
		if (!student) {
			studentErrMsg = globalConstants.messages.fieldNotFound.replaceField(ALL_FIELDS.STUDENT)
		} else if (student.graduated) {
			studentErrMsg = globalConstants.messages.alreadyGraduated
		} else if (student.exited) {
			studentErrMsg = globalConstants.messages.alreadyExited
		}
		if (studentErrMsg) {
			return res.status(404).json(new FailureResponse(studentErrMsg))
		}

		// const validateStudentInAY = this.validateStudentAndAcademicYearInJourney(
		// 	student,
		// 	iepRecord.academicYear,
		// )

		// const studentCheckListCategory = await StudentCheckList.findOne({
		// 	studentId: student._id,
		// 	classRoomId: validateStudentInAY.classRoomId,
		// 	academicYear: iepRecord.academicYear,
		// }).select('checklistForm')
		// if (!studentCheckListCategory) {
		// 	return res.status(400).json(new FailureResponse('Check List data not found'))
		// }

		const validationError = await this.validateIepRequest(
			req.body,
			iepRecord.checklistForm,
			student,
			iepRecord.academicYear,
		)
		if (validationError) {
			return res.status(400).json(validationError)
		}

		const queryParam = req.query.addPhoto === 'true'
		if (queryParam === true) {
			const pic = utils.fetchUrlSafeString(Evolution.reportLink)
			const fileUrl = `${globalConstants.studentIEP_path}${pic}`
			const existFile = await isFileExistInS3(fileUrl)
			if (!existFile) {
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.invalidImage))
			} else {
				Evolution.reportLink = `${miscellaneous.resourceBaseurl}${globalConstants.studentIEP_path}${pic}`
			}
		}

		iepRecord.baseLine = baseLine ?? iepRecord.baseLine
		iepRecord.checkList = checkList ?? iepRecord.checkList
		iepRecord.Evolution = Evolution ?? iepRecord.Evolution
		iepRecord.AccommodationFromBoard =
			AccommodationFromBoard ?? iepRecord.AccommodationFromBoard
		iepRecord.AccommodationInternal = AccommodationInternal ?? iepRecord.AccommodationInternal
		iepRecord.transitionPlanning = transitionPlanning ?? iepRecord.transitionPlanning
		iepRecord.PlacementWithSEND = PlacementWithSEND ?? iepRecord.PlacementWithSEND

		await iepRecord.save()
		return res.json(new SuccessResponse(globalConstants.messages.iepRecordUpdated))
	}

	async deleteIEPRecord(req, res) {
		return this.deleteSingleRecord(req, res, EducationPlanner, ALL_FIELDS.IEP)
	}

	async fetchBaselinePerformance(req, res) {
		const { id, academicYear } = req.body

		const student = await Students.findOne({
			_id: id,
			status: globalConstants.schoolStatus.Active,
			graduated: false,
			exited: false,
		})

		if (!student) {
			return res
				.status(404)
				.json(
					new FailureResponse(
						globalConstants.messages.fieldNotFound.replaceField(ALL_FIELDS.STUDENT),
					),
				)
		}

		const latestJourneyOfAY = this.validateStudentAndAcademicYearInJourney(
			student,
			academicYear,
		)

		const isBaseLineRecordExist = await this.isBaselineRecordExist(student, latestJourneyOfAY.classRoomId)
		const baseLinePerformance = await this.calculateBaselinePerformance(student, latestJourneyOfAY.classRoomId)
		const additionalNeeds = await this.calculateAdditionalNeedsCheckListData(student, latestJourneyOfAY.classRoomId)

		return res.json({
			isBaseLineRecordExist: isBaseLineRecordExist,
			checklistForm: additionalNeeds[0]?.checklistForm,
			baselinePerformance: baseLinePerformance.length > 0 ? baseLinePerformance[0] : {},
			additionalNeeds: additionalNeeds,
		})
	}

	async verifyChecklistData(req, res) {
		const { id, academicYear } = req.body

		const student = await Students.findOne({
			_id: id,
			status: globalConstants.schoolStatus.Active,
			graduated: false,
			exited: false,
		})

		if (!student) {
			return res
				.status(404)
				.json(
					new FailureResponse(
						globalConstants.messages.fieldNotFound.replaceField(ALL_FIELDS.STUDENT),
					),
				)
		}

		const latestJourneyOfAY = this.validateStudentAndAcademicYearInJourney(
			student,
			academicYear,
		)
		if (!latestJourneyOfAY) {
			return res.json({ isCheckListRecordExist: false })
		}

		const isCheckListRecordExist = await StudentCheckList.findOne({
			studentId: id,
			classRoomId: latestJourneyOfAY.classRoomId,
			academicYear: req.body.academicYear,
		})

		return res.json({ isCheckListRecordExist: !!isCheckListRecordExist })
	}

	async getPresignedUrlForIep(req, res) {
		const { fileName, urlFor } = req.body
		if (!fileName || !urlFor) {
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.missingParameters))
		}
		let filePath
		const file = utils.fetchUrlSafeString(fileName)
		const contentType = utils.getContentType(file)
		if (urlFor === 'IEP') {
			filePath = globalConstants.studentIEP_path
		}
		const s3link = await generatePreSignedUrl(filePath, file, contentType)
		return res.json({ s3link: s3link })
	}

	buildQueryForIEP(query, sort) {
		const aggregationPipeline = [
			{ $match: query },
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
				},
			},
			{
				$project: {
					user_id: 1,
					studentName: 1,
					studentId: 1,
					academicYear: 1,
					Evolution: '$Evolution.requirement',
					AccommodationFromBoard: '$AccommodationFromBoard.requirement',
					AccommodationInternal: '$AccommodationInternal.requirement',
					transitionPlanning: {
						$cond: {
							if: {
								$or: [
									{
										$eq: [
											'$transitionPlanning.communityExperience.value',
											'Yes',
										],
									},
									{
										$eq: [
											'$transitionPlanning.activitiesOfDailyLiving.value',
											'Yes',
										],
									},
									{
										$eq: [
											'$transitionPlanning.functional_VocationalAssistance.value',
											'Yes',
										],
									},
								],
							},
							then: 'Yes',
							else: 'No',
						},
					},
					IndividualSession: {
						$cond: {
							if: { $eq: ['$PlacementWithSEND.individual.value', 'Yes'] },
							then: {
								$concat: [
									'Yes (',
									{
										$toString: {
											$arrayElemAt: [
												'$PlacementWithSEND.individual.frequency',
												0,
											],
										},
									},
									'day/week)',
								],
							},
							else: 'No',
						},
					},
					GroupSession: {
						$cond: {
							if: { $eq: ['$PlacementWithSEND.group.value', 'Yes'] },
							then: {
								$concat: [
									'Yes (',
									{
										$toString: {
											$arrayElemAt: ['$PlacementWithSEND.group.frequency', 0],
										},
									},
									'day/week)',
								],
							},
							else: 'No',
						},
					},
					ShortTermGoal: {
						$sum: {
							$map: {
								input: '$checkList',
								as: 'item',
								in: { $size: '$$item.shortTermGoal' },
							},
						},
					},
					LongTermGoal: {
						$sum: {
							$map: {
								input: '$checkList',
								as: 'item',
								in: { $size: '$$item.longTermGoal' },
							},
						},
					},
				},
			},
		]
		if (sort && Object.keys(sort).length > 0) {
			aggregationPipeline.push({
				$sort: sort,
			})
		}

		return aggregationPipeline
	}
}

const iepService = new IEPService()
module.exports = { iepService }
