const utils = require('../../utility/utils')
const { FailureResponse, SuccessResponse } = require('../../models/response/globalResponse')
const { ALL_FIELDS, STATUSES } = require('../../utility/localConstants')
const { Classrooms } = require('../../models/database/myPeegu-classroom')
const { SendChecklistHelperService } = require('./send-checklist-helper-service')
const { StudentCheckList } = require('../../models/database/myPeegu-sendCheckList')
const { Students } = require('../../models/database/myPeegu-student')
const { Schools } = require('../../models/database/myPeegu-school')
const { default: mongoose } = require('mongoose')
const { Teacher } = require('../../models/database/myPeegu-teacher')
const { checkListCategories, studentStatus } = require('../../utility/constants')

class SendChecklistServices extends SendChecklistHelperService {
	/**
	 * Fetches Send Checklist records for students based on filters like school, classroom, student status, and academic year.
	 * Supports pagination, sorting, and optional export formatting.
	 */
	async fetchSendChecklistRecords(req, res) {
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

			const sortFields = ['user_id', 'studentName', 'academicYear', 'createdAt']
			const sortCriteria = utils.buildSortOptions(req.body, sortFields)

			// Step 6: Fetch records and total count in parallel
			const filter = queryCombinations
			if (filterBody.checklistForm) {
				filter.checklistForm = filterBody.checklistForm
			}
			const [records, totalCount] = await Promise.all([
				StudentCheckList.find(filter).sort(sortCriteria).skip(skip).limit(PAGE_SIZE),
				StudentCheckList.countDocuments(filter),
			])
			// Step 7: Enrich records with extra fields
			let transformedRecords = await this.transformDataRecordsWithAcademicFeilds(records)

			// Step 8: If downloadAndFilter is true, map keys to export-friendly format
			if (downloadAndFilter) {
				try {
					transformedRecords = transformedRecords.map((item) =>
						this.formatStudentCheckListData(item, true),
					)
				} catch (err) {
					console.error('Download filter transformation error:', err)
					return res.status(500).json({ error: 'Internal Server Error' })
				}
			}

			// Perform in-memory sorting
			const sortKeys = req.body.sortKeys
			if (!downloadAndFilter && sortKeys && utils.isAValidArray(transformedRecords)) {
				transformedRecords.sort((a, b) => {
					for (const key of sortKeys) {
						const field = key.key
						const value = key.value

						// Find the category objects in both documents
						const categoryA = a.categories.find(
							(category) => category.category === field,
						)
						const categoryB = b.categories.find(
							(category) => category.category === field,
						)

						// If category objects are found, compare their scores
						if (categoryA && categoryB) {
							if (categoryA.score < categoryB.score) return value === 1 ? -1 : 1
							if (categoryA.score > categoryB.score) return value === 1 ? 1 : -1
						}
					}
					return 0
				})
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

	async addSendChecklist(req, res) {
		const body = req.body
		const studentData = body.studentData
		const { user_id, checklistForm, categories } = studentData

		const { error, message, school, SAY, academicYear } =
			await this.validateUserSchoolAndAY(req)
		if (error) {
			return res.status(400).json(new FailureResponse(message))
		}

		// Check if required parameters are present
		if (!checklistForm) {
			return res
				.status(400)
				.json(
					new FailureResponse(
						globalConstants.messages.fieldReuired.replaceField(
							ALL_FIELDS.CHECKLIST_FORM,
						),
					),
				)
		}

		if (
			checklistForm !== checkListCategories.upperKgToGrade4 &&
			checklistForm !== checkListCategories.grade5ToGrade12
		) {
			return res
				.status(400)
				.json(
					new FailureResponse(
						globalConstants.messages.invalidField(ALL_FIELDS.CHECKLIST_FORM),
					),
				)
		}

		if (!studentData['user_id']) {
			return res
				.status(400)
				.json(
					new FailureResponse(
						globalConstants.messages.invalidField.replaceField(ALL_FIELDS.STUDENT),
					),
				)
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

		const checkListData = await StudentCheckList.findOne({
			user_id: user_id,
			classRoomId: validateStudentInAY.classRoomId,
			academicYear: academicYear._id,
		})

		if (checkListData) {
			return res
				.status(400)
				.json(
					new FailureResponse(globalConstants.messages.sendCheckListRecordAlreadyExists),
				)
		}

		if (checklistForm === checkListCategories.upperKgToGrade4) {
			for (const category of categories) {
				//validation for score
				const calculatedScore = utils.calculateScore(category.questions)
				if (category.score !== calculatedScore) {
					return res
						.status(400)
						.json(
							new FailureResponse(
								`Total Score mismatch for ${category.categoryName}`,
							),
						)
				}
			}
		} else if (checklistForm === checkListCategories.grade5ToGrade12) {
			for (const category of categories) {
				if (category.subCategories && category.subCategories.length > 0) {
					let totalSubCategoryScore = 0
					for (const subCategory of category.subCategories) {
						const calculatedSubCategoryScore = utils.calculateScore(
							subCategory.questions,
						)
						if (subCategory.score !== calculatedSubCategoryScore) {
							return res
								.status(400)
								.json(
									new FailureResponse(
										`Subcategory score mismatch for ${subCategory.subCategoryName}`,
									),
								)
						} else {
							totalSubCategoryScore += subCategory.score
						}
					}
					// Validate the overall score for the category
					if (category.score !== totalSubCategoryScore) {
						return res
							.status(400)
							.json(
								new FailureResponse(
									`Overall score mismatch for ${category.categoryName}`,
								),
							)
					}
				} else {
					// Validation for score if no subcategories
					const calculatedScore = utils.calculateScore(category.questions)
					if (category.score !== calculatedScore) {
						return res
							.status(400)
							.json(
								new FailureResponse(
									`Total Score mismatch for ${category.categoryName}`,
								),
							)
					}
				}
			}
		}
		const finalCategoriesData = this.processCategories({ checklistForm, categories })

		await StudentCheckList.create({
			checklistForm: checklistForm,
			studentName: student.studentName,
			studentId: student._id,
			school: school._id,
			classRoomId: validateStudentInAY.classRoomId,
			schoolName: school.school,
			user_id: student.user_id,
			sendCheckListDate: new Date(),
			categories: finalCategoriesData,
			SAY: SAY._id,
			academicYear: academicYear._id,
		})

		return res.json(new SuccessResponse(globalConstants.messages.sendCheckListRecordsCreated))
	}

	async uploadSendCheckList(req, res) {
		const studentsData = req.body.students || [{}]

		const { error, message, school, SAY, academicYear } =
			await this.validateUserSchoolAndAY(req)
		if (error) {
			return res.status(400).json(new FailureResponse(message))
		}

		const uniqueUserIds = new Set()
		const requiredFields = Object.keys(globalConstants.sendCheckList)
		const fieldDisplayNames = globalConstants.sendCheckList

		const allClassrooms = await Classrooms.find({
			SAY: SAY._id,
			status: globalConstants.schoolStatus.Active,
		}).lean()
		const allClassroomsIds = allClassrooms.map((obj) => obj._id.toString())
		const allStudents = await Students.find(
			{
				status: STATUSES.ACTIVE,
				school: school._id,
				graduated: false,
				exited: false,
			},
			{
				user_id: 1,
				school: 1,
				studentName: 1,
				exited: 1,
				graduated: 1,
				classRoomId: 1,
				studentsJourney: 1,
			},
		).lean()

		const studentUserIds = studentsData.map((obj) => obj.user_id)
		const existingCheckListData = await StudentCheckList.find({
			user_id: { $in: studentUserIds },
			academicYear: academicYear._id,
		}).select('user_id classRoomId studentId')

		const firstCategoryStudents = studentsData.filter(
			(s) => s.checklistForm === checkListCategories.upperKgToGrade4,
		)
		const secondCategoryStudents = studentsData.filter(
			(s) => s.checklistForm === checkListCategories.grade5ToGrade12,
		)

		const recordsToInsert = []
		const firstCategoryValidationErrors = this.validateStudentsCheckListData(
			firstCategoryStudents,
			allStudents,
			existingCheckListData,
			uniqueUserIds,
			requiredFields,
			fieldDisplayNames,
			allClassroomsIds,
			recordsToInsert,
			SAY._id,
			academicYear,
			school,
		)
		const secondCategoryValidationErrors = this.validateStudentsCheckListData(
			secondCategoryStudents,
			allStudents,
			existingCheckListData,
			uniqueUserIds,
			requiredFields,
			fieldDisplayNames,
			allClassroomsIds,
			recordsToInsert,
			SAY._id,
			academicYear,
			school,
		)

		if (firstCategoryValidationErrors.length > 0 || secondCategoryValidationErrors.length > 0) {
			return res.status(400).json({
				message: globalConstants.messages.invalidFileCheckError,
				validationErrors: {
					upperKGToGrade4Error: firstCategoryValidationErrors,
					grade5ToGrade9Error: secondCategoryValidationErrors,
				},
				fileContainsError: true,
			})
		}

		if (recordsToInsert.length > 0) {
			const insertedRecords = await StudentCheckList.insertMany(recordsToInsert)
			if (insertedRecords.length > 0) {
				return res.json(
					new SuccessResponse(globalConstants.messages.sendCheckListRecordsCreated),
				)
			} else {
				return res.json(new FailureResponse(globalConstants.messages.noRecordsToInsert))
			}
		}
	}

	async updateSendChecklist(req, res) {
		const {
			error,
			message,
			statusCode,
			record: checklistRecord,
		} = await this.validateStudentDataAndUser(req, StudentCheckList, ALL_FIELDS.SEND_CHECKLIST)
		if (error) {
			return res.status(statusCode).json(message)
		}

		const { category, Questions, score, subCategories } = req.body

		// Find the category to update
		const categoryToUpdate = checklistRecord.categories.find((cat) => cat.category === category)
		if (!categoryToUpdate) {
			return res
				.status(404)
				.json(new FailureResponse(globalConstants.messages.selectedCategoryNotFound))
		} else {
			// Update category details
			if (categoryToUpdate?.subCategories.length > 0) {
				// Handle updating categories with subcategories
				let totalSubCategoryScore = 0
				categoryToUpdate.subCategories.forEach((subCategoryToUpdate, index) => {
					const updatedSubCategory = subCategories[index]
					if (updatedSubCategory) {
						// Update subcategory details
						const calculatedSubCategoryScore = utils.calculateScore(
							updatedSubCategory.Questions,
						)
						if (updatedSubCategory.score !== calculatedSubCategoryScore) {
							return res
								.status(400)
								.json(
									new FailureResponse(
										`Subcategory score mismatch for ${updatedSubCategory.subCategory}`,
									),
								)
						} else {
							subCategoryToUpdate.Questions = updatedSubCategory.Questions
							subCategoryToUpdate.score = updatedSubCategory.score
							totalSubCategoryScore += updatedSubCategory.score
						}
					}
				})

				// Validate the overall score for the category
				if (score !== totalSubCategoryScore) {
					return res
						.status(400)
						.json(new FailureResponse(`Overall score mismatch for ${category}`))
				} else {
					categoryToUpdate.score = score
				}
			} else {
				const calculatedScore = utils.calculateScore(Questions)
				if (score !== calculatedScore) {
					return res
						.status(400)
						.json(new FailureResponse(globalConstants.messages.totalScoreMismatch))
				}
				categoryToUpdate.Questions = Questions
				categoryToUpdate.score = score
			}

			// Save the updated checklist
			await checklistRecord.save()

			res.status(200).json(
				new SuccessResponse(globalConstants.messages.categoryUpdatedSuccessfully),
			)
		}
	}

	async deleteSendChecklistRecord(req, res) {
		return this.deleteSingleRecord(req, res, StudentCheckList, ALL_FIELDS.SEND_CHECKLIST)
	}

	async deleteMultipleSendChecklistRecords(req, res) {
		return this.deleteMultipleRecords(req, res, StudentCheckList, ALL_FIELDS.SEND_CHECKLIST)
	}

	async getAllSchoolsSendChecklistAnalytics(req, res) {
		const { error, academicYears } = await this.validateAndGetAYsAndPaginationData(req)
		if (error) {
			return res.status(200).json({
				upper_KG_Grade4: [],
				grade5ToGrade9: [],
			})
		}

		let query = {
			academicYear: { $in: academicYears },
			graduated: { $ne: true },
			exited: { $ne: true },
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

		if (!req.user.isAdmin) {
			query.school = { $in: req.user.assignedSchools }
		} else {
			query.school = { $in: await StudentCheckList.distinct('school') }
		}

		const dataForFirstGrade = await this.UpperKGToGrade4PipeLine(
			query,
			checkListCategories.upperKgToGrade4,
		)
		const upper_KG_Grade4 = this.assignRanks(dataForFirstGrade, 'average')

		const dataForSecondGrade = await this.Grade5ToGrade9CheckListData(
			query,
			checkListCategories.grade5ToGrade12,
		)
		const grade5ToGrade9 = this.assignRanks(dataForSecondGrade, 'average')

		return res.status(200).json({
			upper_KG_Grade4: upper_KG_Grade4,
			grade5ToGrade9: grade5ToGrade9,
		})
	}

	async getOneSchoolsSendChecklistAnalytics(req, res) {
		const filter = req.body.filter
		const school = await Schools.findOne({ _id: filter.schoolIds }).select(
			'studentCountInSchool school',
		)
		const { error, academicYears } = await this.validateAndGetAYsAndPaginationData(req)
		if (error) {
			return res.status(200).json({
				schoolName: school.school ?? '',
				totalStrength: school.studentCountInSchool ?? 0,
				upper_KG_Grade4: [],
				grade5ToGrade9: [],
			})
		}

		let query = {
			academicYear: { $in: academicYears },
			graduated: { $ne: true },
			exited: { $ne: true },
		}

		const filterBody = req.body.filter
		if (filterBody) {
			if (utils.isAValidString(filterBody.schoolIds)) {
				query.school = new mongoose.Types.ObjectId(filterBody.schoolIds)
			}
			if (utils.isAValidArray(filterBody.classroomIds)) {
				query.classRoomId = {
					$in: filterBody.classroomIds.map((id) => new mongoose.Types.ObjectId(id)),
				}
			}
			if (filterBody.section) {
				const classrooms = await Classrooms.find({
					_id: { $in: filterBody.classroomIds },
					section: filterBody.section,
				})
					.select('_id')
					.lean()
				query.classRoomId = {
					$in: classrooms.map((obj) => new mongoose.Types.ObjectId(obj._id)),
				}
			}
		}

		const dataForFirstCategory = await this.UpperKGToGrade4SpecificSchoolPipeLine(
			query,
			checkListCategories.upperKgToGrade4,
		)

		const dataForSecondCategory = await this.Grade5ToGrade9SpecificSchoolPipeLine(
			query,
			checkListCategories.grade5ToGrade12,
		)

		return res.json({
			schoolName: school.school,
			totalStrength: school.studentCountInSchool,
			upper_KG_Grade4: dataForFirstCategory,
			grade5ToGrade9: dataForSecondCategory,
		})
	}

	buildSendChecklistQuery(query, sortCriteria) {
		const pipeline = [
			{
				$match: query,
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
				},
			},
			{ $sort: sortCriteria },
			{
				$project: {
					user_id: 1,
					studentName: 1,
					academicYear: 1,
					studentId: 1,
					categories: 1,
					checklistForm: 1,
					schoolName: 1,
					className: 1,
					section: 1,
				},
			},
		]
		return pipeline
	}
}

const sendChecklistService = new SendChecklistServices()
module.exports.sendChecklistService = sendChecklistService
