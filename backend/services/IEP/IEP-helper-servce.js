const { BaselineRecord } = require('../../models/database/myPeegu-baseline')
const { Students } = require('../../models/database/myPeegu-student')
const { FailureResponse } = require('../../models/response/globalResponse')
const { CommonHelperServices } = require('../common-services/common-helper-service')
const utils = require('../../utility/utils')
const {
	humanReadableIntAccFields,
	expectedFirstCategoriesOfCheckList,
	expectedSecondCategoriesOfCheckList,
	baseLine1,
	studentCheckListKeys,
	checkListCategories,
	baseLineCategories,
	internalAccSubfields,
	transitionPlanningFields,
} = require('../../utility/constants')
const { StudentCheckList } = require('../../models/database/myPeegu-sendCheckList')
const { ALL_FIELDS } = require('../../utility/localConstants')
const { default: mongoose } = require('mongoose')

class IEPHelperService extends CommonHelperServices {
	async isBaselineRecordExist(student, classRoomId) {
		const isBaseLineDataExist = await BaselineRecord.findOne({
			studentId: student._id,
			classRoomId: classRoomId,
			baselineCategory: baseLine1,
			exited: { $ne: true },
			graduated: { $ne: true },
		})

		return !!isBaseLineDataExist
	}

	async validateIepRequest(body, studentCheckListCategory, student, academicYear) {
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

		if (
			!user_id ||
			!checkList ||
			!Evolution ||
			!AccommodationFromBoard ||
			!AccommodationInternal ||
			!transitionPlanning ||
			!PlacementWithSEND
		) {
			return new FailureResponse(globalConstants.messages.missingParameters)
		}
		if (!utils.isAValidString(user_id)) {
			return new FailureResponse(globalConstants.messages.invalidField(ALL_FIELDS.USER_ID))
		}
		if (studentCheckListCategory === checkListCategories.upperKgToGrade4) {
			const actualCategories = checkList.map((item) => item.category)
			if (
				!expectedFirstCategoriesOfCheckList.every((category) =>
					actualCategories.includes(category),
				)
			) {
				return new FailureResponse(globalConstants.messages.invalidCatForFirstCLCategory)
			}
		} else if (studentCheckListCategory === checkListCategories.grade5ToGrade12) {
			const actualCategories = checkList.map((item) => item.category)
			if (
				!expectedSecondCategoriesOfCheckList.every((category) =>
					actualCategories.includes(category),
				)
			) {
				return new FailureResponse(globalConstants.messages.invalidCatForSecondCLCategory)
			}
		}

		const latestJourneyOfAY = this.validateStudentAndAcademicYearInJourney(
			student,
			academicYear._id,
		)

		const additionalNeeds = await this.calculateAdditionalNeedsCheckListData(
			student,
			latestJourneyOfAY.classRoomId,
		)

		// Validate checkList based on Criticality
		const criticalCategories = additionalNeeds
			.filter((need) => need.Criticality === 'Moderate' || need.Criticality === 'High')
			.map((need) => need.categoryName)
		for (const item of checkList) {
			if (criticalCategories.includes(item.category)) {
				if (!Array.isArray(item.shortTermGoal) || item.shortTermGoal.length === 0) {
					return new FailureResponse(
						`${globalConstants.messages.shortTermGoalMissing} : ${item.category}`,
					)
				}
				if (!Array.isArray(item.longTermGoal) || item.longTermGoal.length === 0) {
					return new FailureResponse(
						`${globalConstants.messages.longTermGoalMissing} : ${item.category}`,
					)
				}
			}
		}

		const isBaseLineRecordExist = await this.isBaselineRecordExist(student, latestJourneyOfAY.classRoomId)

		// Check if one comment is mandatory in all categories of baseline if isBaseLineRecordExist is true
		if (isBaseLineRecordExist) {
			for (const category of baseLineCategories) {
				if (!Array.isArray(baseLine[category]) || baseLine[category].length === 0) {
					return new FailureResponse(
						`${globalConstants.messages.missingCommentsInBC} : ${category}`,
					)
				}
			}
		}

		if (Evolution.requirement === 'Yes' && Evolution.diagnosis.length === 0) {
			return new FailureResponse(globalConstants.messages.EvolutionParametersMissing)
		}

		if (AccommodationInternal.requirement === 'Yes') {
			for (const field of internalAccSubfields) {
				if (
					!AccommodationInternal[field] ||
					!['Yes', 'No'].includes(AccommodationInternal[field].value)
				) {
					return new FailureResponse(
						`${globalConstants.messages.InternalAccparametersMissing}: ${field}`,
					)
				}
				if (
					AccommodationInternal[field].value === 'Yes' &&
					(!Array.isArray(AccommodationInternal[field].comments) ||
						AccommodationInternal[field].comments.length === 0)
				) {
					const readableField = humanReadableIntAccFieldsAccFields[field] || field

					return new FailureResponse(
						`${globalConstants.messages.InternalAccparametersMissing}: ${readableField} is missing comments`,
					)
				}
			}
		}

		if (transitionPlanning) {
			for (const field of transitionPlanningFields) {
				if (
					!transitionPlanning[field] ||
					!['Yes', 'No'].includes(transitionPlanning[field].value)
				) {
					const readableField = humanReadableTransitionFields[field] || field
					return new FailureResponse(
						`${globalConstants.messages.transitionPlanningParametersMissing}: ${readableField}`,
					)
				}
				if (
					transitionPlanning[field].value === 'Yes' &&
					(!Array.isArray(transitionPlanning[field].comments) ||
						transitionPlanning[field].comments.length === 0)
				) {
					const readableField = humanReadableTransitionFields[field] || field
					return new FailureResponse(
						`${globalConstants.messages.transitionPlanningParametersMissing}: ${readableField} is missing comments`,
					)
				}
			}
		}

		if (PlacementWithSEND) {
			const placementFields = ['individual', 'group']

			for (const field of placementFields) {
				if (
					!PlacementWithSEND[field] ||
					!['Yes', 'No'].includes(PlacementWithSEND[field].value)
				) {
					return new FailureResponse(
						`${globalConstants.messages.placementWithSENDParametersMissing}: ${field}`,
					)
				}
				if (
					PlacementWithSEND[field].value === 'Yes' &&
					(!Array.isArray(PlacementWithSEND[field].frequency) ||
						PlacementWithSEND[field].frequency.length === 0)
				) {
					return new FailureResponse(
						`${globalConstants.messages.placementWithSENDParametersMissing}: ${field} frequency is missing `,
					)
				}
			}
		}

		return null // No validation errors
	}

	formatStudentEducationalPlannerData(item) {
		const formattedData = {
			'Student Id': item.user_id,
			'Academic Year': item.academicYear,
			'Student Name': item.studentName,
			'School Name': item.schoolName,
			Evolution: item.Evolution,
			'Accommodation From Board': item.AccommodationFromBoard,
			'Accommodation Internal': item.AccommodationInternal,
			'Transition Planning': item.transitionPlanning,
			'Individual Session': item.IndividualSession,
			'Group Session': item.GroupSession,
		}

		return formattedData
	}

	async calculateBaselinePerformance(student, classRoomId) {
		const classroomId = new mongoose.Types.ObjectId(classRoomId.toString())
		const stduentId = new mongoose.Types.ObjectId(student._id.toString())
		// console.log(stduentId, classroomId)
		const baseLinePerformance = await BaselineRecord.aggregate([
			{
				$match: {
					studentId: stduentId,
					classRoomId: classroomId,
					baselineCategory: 'Baseline 1',
					exited: { $ne: true },
					graduated: { $ne: true },
				},
			},
			{
				$project: {
					PhysicalAvg: { $avg: { $divide: [{ $toInt: '$Physical.total' }, 7] } },
					SocialAvg: { $avg: { $divide: [{ $toInt: '$Social.total' }, 7] } },
					EmotionalAvg: { $avg: { $divide: [{ $toInt: '$Emotional.total' }, 7] } },
					CognitiveAvg: { $avg: { $divide: [{ $toInt: '$Cognitive.total' }, 7] } },
					LanguageAvg: { $avg: { $divide: [{ $toInt: '$Language.total' }, 7] } },
				},
			},
			{
				$project: {
					Physical: { $round: [{ $multiply: ['$PhysicalAvg', 100] }, 2] },
					Social: { $round: [{ $multiply: ['$SocialAvg', 100] }, 2] },
					Emotional: { $round: [{ $multiply: ['$EmotionalAvg', 100] }, 2] },
					Cognitive: { $round: [{ $multiply: ['$CognitiveAvg', 100] }, 2] },
					Language: { $round: [{ $multiply: ['$LanguageAvg', 100] }, 2] },
				},
			},
		])

		return baseLinePerformance
	}

	async calculateAdditionalNeedsCheckListData(student, classRoomId) {
		const classroomId = new mongoose.Types.ObjectId(classRoomId.toString())
		const studentId = new mongoose.Types.ObjectId(student._id.toString())
		const additionalNeeds = await StudentCheckList.aggregate([
			{
				$match: {
					studentId: studentId,
					classRoomId: classroomId,
					exited: { $ne: true },
					graduated: { $ne: true },
				},
			},
			{
				$unwind: '$categories',
			},
			{
				$addFields: {
					'categories.divisor': {
						$cond: {
							if: { $eq: ['$checklistForm', 'Upper KG - Grade 4'] },
							then: {
								$cond: {
									if: {
										$eq: [
											'$categories.category',
											studentCheckListKeys.fineMotorAndGrossMotorSkill,
										],
									},
									then: 4,
									else: {
										$cond: {
											if: {
												$eq: [
													'$categories.category',
													studentCheckListKeys.Attention,
												],
											},
											then: 4,
											else: {
												$cond: {
													if: {
														$eq: [
															'$categories.category',
															studentCheckListKeys.Behavior,
														],
													},
													then: 9,
													else: {
														$cond: {
															if: {
																$eq: [
																	'$categories.category',
																	studentCheckListKeys.Cognitive,
																],
															},
															then: 11,
															else: null,
														},
													},
												},
											},
										},
									},
								},
							},
							else: {
								$switch: {
									branches: [
										{
											case: {
												$eq: [
													'$categories.category',
													studentCheckListKeys.attentionAndHyperactivity,
												],
											},
											then: 11,
										},
										{
											case: {
												$eq: [
													'$categories.category',
													studentCheckListKeys.Memory,
												],
											},
											then: 4,
										},
										{
											case: {
												$eq: [
													'$categories.category',
													studentCheckListKeys.fineMotorAndGrossMotorSkill,
												],
											},
											then: 6,
										},
										{
											case: {
												$eq: [
													'$categories.category',
													studentCheckListKeys.Cognitive,
												],
											},
											then: 46,
										},
										{
											case: {
												$eq: [
													'$categories.category',
													studentCheckListKeys.SocialSkill,
												],
											},
											then: 17,
										},
									],
									default: null,
								},
							},
						},
					},
				},
			},
			{
				$group: {
					_id: '$categories.category',
					totalScore: { $sum: '$categories.score' },
					divisor: { $first: '$categories.divisor' },
					checklistForm: { $first: '$checklistForm' },
				},
			},
			{
				$addFields: {
					percentageScore: {
						$cond: {
							if: { $ne: ['$divisor', null] },
							then: {
								$multiply: [{ $divide: ['$totalScore', '$divisor'] }, 100],
							},
							else: null,
						},
					},
				},
			},
			{
				$project: {
					categoryName: '$_id',
					percentageScore: 1,
					checklistForm: 1,
					Criticality: {
						$switch: {
							branches: [
								{ case: { $gte: ['$percentageScore', 75] }, then: 'Low' },
								{ case: { $gte: ['$percentageScore', 50] }, then: 'Moderate' },
							],
							default: 'High',
						},
					},
					_id: 0,
				},
			},
		])
		return additionalNeeds
	}
}

module.exports = { IEPHelperService }
