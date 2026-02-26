const { StudentCheckList } = require('../../models/database/myPeegu-sendCheckList')
const { checkListCategories, studentCheckListKeys } = require('../../utility/constants')
const { CommonHelperServices } = require('../common-services/common-helper-service')

class SendChecklistHelperService extends CommonHelperServices {
	calculateScore(questions) {
		return questions?.reduce((acc, curr) => {
			if (curr?.answer?.toLowerCase() === 'yes') {
				return acc + 1
			}
			return acc
		}, 0)
	}

	processCategory(category) {
		const categoryQuestions = category?.questions?.map((question) => ({
			question: question?.question,
			answer: question?.answer,
		}))
		const score = this.calculateScore(categoryQuestions)
		return {
			category: category.categoryName,
			Questions: categoryQuestions,
			score: score,
		}
	}

	processSubCategory(subCategory) {
		const subCategoryQuestions = subCategory.questions.map((question) => ({
			question: question.question,
			answer: question.answer,
		}))
		const score = this.calculateScore(subCategoryQuestions)
		return {
			subCategory: subCategory.subCategoryName,
			Questions: subCategoryQuestions,
			score: score,
		}
	}

	processCategories(studentData) {
		let categories
		if (studentData.checklistForm === checkListCategories.upperKgToGrade4) {
			categories = studentData.categories.map((category) => this.processCategory(category))
		} else if (studentData.checklistForm === checkListCategories.grade5ToGrade12) {
			categories = studentData.categories.map((category) => {
				const subCategories = category.subCategories?.map((subcategory) =>
					this.processSubCategory(subcategory),
				)
				const processedCategory = this.processCategory(category)

				let totalScore
				if (category.questions?.length > 0) {
					const categoryQuestions = category?.questions.map((question) => ({
						question: question?.question,
						answer: question?.answer,
					}))
					totalScore = this.calculateScore(categoryQuestions)
				} else {
					totalScore = subCategories?.reduce((acc, subCategory) => {
						return acc + subCategory?.score
					}, 0)
				}
				return {
					...processedCategory,
					subCategories: subCategories,
					score: totalScore,
				}
			})
		}
		return categories
	}

	formatStudentCheckListData(item) {
		const scores = {}

		item.categories.forEach((category) => {
			scores[category.category] = category.score
		})

		const formattedData = {
			'Student Id': item.user_id,
			'Academic Year': item.academicYear,
			'Student Name': item.studentName,
			'School Name': item.schoolName,
			'Class Name': item.className,
			'Check List Form': item.checklistForm,
			Section: item.section,
			...scores,
		}

		return formattedData
	}

	assignRanks(dataArray, field) {
		const sortedArray = dataArray.slice().sort((a, b) => b[field] - a[field])

		return this.addRanking(sortedArray, field)
	}

	addRanking(sortedArray, field) {
		let currentRank = 1
		let previousScore = null

		sortedArray.forEach((entry, index) => {
			if (entry[field] !== previousScore) {
				// currentRank = index + 1;
				currentRank = entry[field] === 0 ? 0 : index + 1
			}
			entry.rank = currentRank
			previousScore = entry[field]
		})

		return sortedArray
	}

	async UpperKGToGrade4PipeLine(query, checklistForm) {
		const Pipeline = [
			{
				$match: {
					...query,
					checklistForm,
				},
			},
			{
				$unwind: '$categories',
			},
			{
				$group: {
					_id: {
						schoolId: '$school',
						category: '$categories.category',
					},
					schoolName: { $first: '$schoolName' },

					count: { $sum: 1 },
					totalScore: { $sum: '$categories.score' },
				},
			},
			{
				$group: {
					_id: '$_id.schoolId',
					schoolName: { $first: '$schoolName' },
					categories: {
						$push: {
							category: '$_id.category',
							totalScore: '$totalScore',
							count: '$count',
							divisor: {
								$switch: {
									branches: [
										{
											case: {
												$eq: [
													'$_id.category',
													studentCheckListKeys.fineMotorAndGrossMotorSkill,
												],
											},
											then: 4,
										},
										{
											case: {
												$eq: [
													'$_id.category',
													studentCheckListKeys.Attention,
												],
											},
											then: 4,
										},
										{
											case: {
												$eq: [
													'$_id.category',
													studentCheckListKeys.Behavior,
												],
											},
											then: 9,
										},
										{
											case: {
												$eq: [
													'$_id.category',
													studentCheckListKeys.Cognitive,
												],
											},
											then: 11,
										},
									],
									default: null,
								},
							},
						},
					},
				},
			},
			//here we are calculating the percentage for each category
			{
				$addFields: {
					categories: {
						$map: {
							input: '$categories',
							as: 'cat',
							in: {
								category: '$$cat.category',
								averageScore: {
									$multiply: [
										{
											$divide: [
												{ $divide: ['$$cat.totalScore', '$$cat.divisor'] }, // Divide totalScore by divisor
												'$$cat.count', // Divide the result by count
											],
										},
										100, // Multiply by 100 to get percentage
									],
								},
							},
						},
					},
				},
			},

			{
				$project: {
					_id: '$_id',
					schoolName: '$schoolName',
					categories: {
						$arrayToObject: {
							$map: {
								input: '$categories',
								as: 'cat',
								in: {
									k: '$$cat.category',
									v: '$$cat.averageScore',
								},
							},
						},
					},
				},
			},

			{
				$project: {
					_id: 1,
					schoolId: 1,
					schoolName: 1,
					fineMotorAndGrossMotorSkills: {
						$ifNull: [
							`$categories.${studentCheckListKeys.fineMotorAndGrossMotorSkill}`,
							null,
						],
					},
					Behavior: { $ifNull: [`$categories.${studentCheckListKeys.Behavior}`, null] },
					Attention: { $ifNull: [`$categories.${studentCheckListKeys.Attention}`, null] },
					Cognitive: { $ifNull: [`$categories.${studentCheckListKeys.Cognitive}`, null] },
					average: {
						$avg: [
							`$categories.${studentCheckListKeys.fineMotorAndGrossMotorSkill}`,
							`$categories.${studentCheckListKeys.Behavior}`,
							`$categories.${studentCheckListKeys.Attention}`,
							`$categories.${studentCheckListKeys.Cognitive}`,
						],
					},
				},
			},
		]

		return StudentCheckList.aggregate(Pipeline)
	}

	async Grade5ToGrade9CheckListData(query, checklistForm) {
		const Pipeline = [
			{
				$match: {
					...query,
					checklistForm,
				},
			},
			{
				$unwind: '$categories',
			},
			{
				$group: {
					_id: {
						schoolId: '$school',
						category: '$categories.category',
					},
					schoolName: { $first: '$schoolName' },

					count: { $sum: 1 },
					totalScore: { $sum: '$categories.score' },
				},
			},

			{
				$group: {
					_id: '$_id.schoolId',
					schoolName: { $first: '$schoolName' },
					categories: {
						$push: {
							category: '$_id.category',
							totalScore: '$totalScore',
							count: '$count',
							divisor: {
								$switch: {
									branches: [
										{
											case: {
												$eq: [
													'$_id.category',
													studentCheckListKeys.attentionAndHyperactivity,
												],
											},
											then: 11,
										},
										{
											case: {
												$eq: ['$_id.category', studentCheckListKeys.Memory],
											},
											then: 4,
										},
										{
											case: {
												$eq: [
													'$_id.category',
													studentCheckListKeys.fineMotorAndGrossMotorSkill,
												],
											},
											then: 6,
										},
										{
											case: {
												$eq: [
													'$_id.category',
													studentCheckListKeys.Cognitive,
												],
											},
											then: 46,
										},
										{
											case: {
												$eq: [
													'$_id.category',
													studentCheckListKeys.SocialSkill,
												],
											},
											then: 17,
										},
									],
									default: null, // Handle unexpected categories
								},
							},
						},
					},
				},
			},

			{
				$addFields: {
					categories: {
						$map: {
							input: '$categories',
							as: 'cat',
							in: {
								category: '$$cat.category',
								averageScore: {
									$multiply: [
										{
											$divide: [
												{ $divide: ['$$cat.totalScore', '$$cat.divisor'] }, // Divide totalScore by divisor
												'$$cat.count', // Divide the result by count
											],
										},
										100, // Multiply by 100 to get percentage
									],
								},
							},
						},
					},
				},
			},

			{
				$project: {
					_id: '$_id',
					schoolName: '$schoolName',
					categories: {
						$arrayToObject: {
							$map: {
								input: '$categories',
								as: 'cat',
								in: {
									k: '$$cat.category',
									v: '$$cat.averageScore',
								},
							},
						},
					},
				},
			},

			{
				$project: {
					_id: 1,
					schoolId: 1,
					schoolName: 1,
					fineMotorAndGrossMotorSkills: {
						$ifNull: [
							`$categories.${studentCheckListKeys.fineMotorAndGrossMotorSkill}`,
							null,
						],
					},
					Memory: { $ifNull: [`$categories.${studentCheckListKeys.Memory}`, null] },
					SocialSkill: {
						$ifNull: [`$categories.${studentCheckListKeys.SocialSkill}`, null],
					},
					Cognitive: { $ifNull: [`$categories.${studentCheckListKeys.Cognitive}`, null] },
					AttentionAndHyperactivity: {
						$ifNull: [
							`$categories.${studentCheckListKeys.attentionAndHyperactivity}`,
							null,
						],
					},

					average: {
						$avg: [
							`$categories.${studentCheckListKeys.fineMotorAndGrossMotorSkill}`,
							`$categories.${studentCheckListKeys.Cognitive}`,
							`$categories.${studentCheckListKeys.Memory}`,
							`$categories.${studentCheckListKeys.SocialSkill}`,
							`$categories.${studentCheckListKeys.attentionAndHyperactivity}`,
						],
					},
				},
			},
		]
		return StudentCheckList.aggregate(Pipeline)
	}

	async UpperKGToGrade4SpecificSchoolPipeLine(query, checklistForm) {
		const Pipeline = [
			// Match the initial query and checklist form
			{
				$match: {
					...query,
					checklistForm,
				},
			},
			// Unwind the categories array
			{
				$unwind: '$categories',
			},
			// Group by student and category to calculate total scores and counts
			{
				$group: {
					_id: {
						studentId: '$studentId',
						category: '$categories.category',
					},
					schoolId: { $first: '$school' },
					totalScore: { $sum: '$categories.score' },
					count: { $sum: 1 },
					categoryTotal: {
						$sum: {
							$switch: {
								branches: [
									{
										case: {
											$eq: [
												'$categories.category',
												studentCheckListKeys.fineMotorAndGrossMotorSkill,
											],
										},
										then: '$categories.score',
									},
									{
										case: {
											$eq: [
												'$categories.category',
												studentCheckListKeys.Attention,
											],
										},
										then: '$categories.score',
									},
									{
										case: {
											$eq: [
												'$categories.category',
												studentCheckListKeys.Behavior,
											],
										},
										then: '$categories.score',
									},
									{
										case: {
											$eq: [
												'$categories.category',
												studentCheckListKeys.Cognitive,
											],
										},
										then: '$categories.score',
									},
								],
								default: 0,
							},
						},
					},
				},
			},
			// Regroup by student to collect categories and calculate individual average percentages
			{
				$group: {
					_id: '$_id.studentId',
					schoolId: { $first: '$schoolId' },
					count: { $first: '$count' },

					categories: {
						$push: {
							category: '$_id.category',
							totalScore: '$totalScore',
							count: '$count',
							divisor: {
								$switch: {
									branches: [
										{
											case: {
												$eq: [
													'$_id.category',
													studentCheckListKeys.fineMotorAndGrossMotorSkill,
												],
											},
											then: 4,
										},
										{
											case: {
												$eq: [
													'$_id.category',
													studentCheckListKeys.Attention,
												],
											},
											then: 4,
										},
										{
											case: {
												$eq: [
													'$_id.category',
													studentCheckListKeys.Behavior,
												],
											},
											then: 9,
										},
										{
											case: {
												$eq: [
													'$_id.category',
													studentCheckListKeys.Cognitive,
												],
											},
											then: 11,
										},
									],
									default: null,
								},
							},
						},
					},
					fineMotorAndGrossMotorSkillTotal: {
						$sum: {
							$cond: [
								{
									$eq: [
										'$_id.category',
										studentCheckListKeys.fineMotorAndGrossMotorSkill,
									],
								},
								'$categoryTotal',
								0,
							],
						},
					},
					attentionTotal: {
						$sum: {
							$cond: [
								{ $eq: ['$_id.category', studentCheckListKeys.Attention] },
								'$categoryTotal',
								0,
							],
						},
					},
					behaviorTotal: {
						$sum: {
							$cond: [
								{ $eq: ['$_id.category', studentCheckListKeys.Behavior] },
								'$categoryTotal',
								0,
							],
						},
					},
					cognitiveTotal: {
						$sum: {
							$cond: [
								{ $eq: ['$_id.category', studentCheckListKeys.Cognitive] },
								'$categoryTotal',
								0,
							],
						},
					},
				},
			},

			// Calculate average percentages for each category and overall average for each student
			{
				$addFields: {
					categories: {
						$map: {
							input: '$categories',
							as: 'cat',
							in: {
								category: '$$cat.category',
								averageScore: {
									$round: [
										{
											$multiply: [
												{
													$divide: [
														{
															$divide: [
																'$$cat.totalScore',
																'$$cat.divisor',
															],
														}, // Divide totalScore by divisor
														'$$cat.count', // Divide the result by count
													],
												},
												100, // Multiply by 100 to get percentage
											],
										},
										0, // Round to the nearest whole number
									],
								},
							},
						},
					},
				},
			},

			{
				$project: {
					_id: '$_id',
					count: 1,
					fineMotorAndGrossMotorSkillTotal: 1,
					attentionTotal: 1,
					behaviorTotal: 1,
					cognitiveTotal: 1,

					categories: {
						$arrayToObject: {
							$map: {
								input: '$categories',
								as: 'cat',
								in: {
									k: '$$cat.category',
									v: '$$cat.averageScore',
								},
							},
						},
					},
				},
			},

			{
				$project: {
					count: 1,
					fineMotorAndGrossMotorSkillTotal: 1,
					attentionTotal: 1,
					behaviorTotal: 1,
					cognitiveTotal: 1,

					fineMotorAndGrossMotorSkills: {
						$ifNull: [
							`$categories.${studentCheckListKeys.fineMotorAndGrossMotorSkill}`,
							null,
						],
					},
					Behavior: { $ifNull: [`$categories.${studentCheckListKeys.Behavior}`, null] },
					Attention: { $ifNull: [`$categories.${studentCheckListKeys.Attention}`, null] },
					Cognitive: { $ifNull: [`$categories.${studentCheckListKeys.Cognitive}`, null] },
				},
			},

			// Project individual category scores and categorize percentages
			{
				$project: {
					count: 1,

					fineMotorAndGrossMotorSkillTotal: 1,
					attentionTotal: 1,
					behaviorTotal: 1,
					cognitiveTotal: 1,

					fineMotorAndGrossMotorSkillsRange: {
						$switch: {
							branches: [
								{
									case: { $lte: ['$fineMotorAndGrossMotorSkills', 50] },
									then: '0-50%',
								},
								{
									case: {
										$and: [
											{ $gt: ['$fineMotorAndGrossMotorSkills', 50] },
											{ $lte: ['$fineMotorAndGrossMotorSkills', 75] },
										],
									},
									then: '50-75%',
								},
								{
									case: { $gt: ['$fineMotorAndGrossMotorSkills', 75] },
									then: '75-100%',
								},
							],
							default: 'Unknown',
						},
					},
					BehaviorRange: {
						$switch: {
							branches: [
								{ case: { $lte: ['$Behavior', 50] }, then: '0-50%' },
								{
									case: {
										$and: [
											{ $gt: ['$Behavior', 50] },
											{ $lte: ['$Behavior', 75] },
										],
									},
									then: '50-75%',
								},
								{ case: { $gt: ['$Behavior', 75] }, then: '75-100%' },
							],
							default: 'Unknown',
						},
					},
					AttentionRange: {
						$switch: {
							branches: [
								{ case: { $lte: ['$Attention', 50] }, then: '0-50%' },
								{
									case: {
										$and: [
											{ $gt: ['$Attention', 50] },
											{ $lte: ['$Attention', 75] },
										],
									},
									then: '50-75%',
								},
								{ case: { $gt: ['$Attention', 75] }, then: '75-100%' },
							],
							default: 'Unknown',
						},
					},
					CognitiveRange: {
						$switch: {
							branches: [
								{ case: { $lte: ['$Cognitive', 50] }, then: '0-50%' },
								{
									case: {
										$and: [
											{ $gt: ['$Cognitive', 50] },
											{ $lte: ['$Cognitive', 75] },
										],
									},
									then: '50-75%',
								},
								{ case: { $gt: ['$Cognitive', 75] }, then: '75-100%' },
							],
							default: 'Unknown',
						},
					},
				},
			},

			// Group by percentage range and category to count students
			{
				$group: {
					_id: null,
					fineMotorAndGrossMotorSkillTotalSum: {
						$sum: '$fineMotorAndGrossMotorSkillTotal',
					},
					attentionTotalSum: { $sum: '$attentionTotal' },
					behaviorTotalSum: { $sum: '$behaviorTotal' },
					cognitiveTotalSum: { $sum: '$cognitiveTotal' },
					studentCount: { $sum: '$count' },

					fineMotorAndGrossMotorSkills: {
						$push: '$fineMotorAndGrossMotorSkillsRange',
					},
					Behavior: {
						$push: '$BehaviorRange',
					},
					Attention: {
						$push: '$AttentionRange',
					},
					Cognitive: {
						$push: '$CognitiveRange',
					},
				},
			},

			//  // Aggregate counts for each percentage range
			{
				$project: {
					fineMotorAndGrossMotorSkillTotalSum: 1,
					attentionTotalSum: 1,
					behaviorTotalSum: 1,
					cognitiveTotalSum: 1,
					studentCount: 1,

					fineMotorAndGrossMotorSkills: {
						$arrayToObject: {
							$map: {
								input: { $setUnion: ['$fineMotorAndGrossMotorSkills'] },
								as: 'range',
								in: {
									k: '$$range',
									v: {
										$size: {
											$filter: {
												input: '$fineMotorAndGrossMotorSkills',
												cond: { $eq: ['$$this', '$$range'] },
											},
										},
									},
								},
							},
						},
					},
					Behavior: {
						$arrayToObject: {
							$map: {
								input: { $setUnion: ['$Behavior'] },
								as: 'range',
								in: {
									k: '$$range',
									v: {
										$size: {
											$filter: {
												input: '$Behavior',
												cond: { $eq: ['$$this', '$$range'] },
											},
										},
									},
								},
							},
						},
					},
					Attention: {
						$arrayToObject: {
							$map: {
								input: { $setUnion: ['$Attention'] },
								as: 'range',
								in: {
									k: '$$range',
									v: {
										$size: {
											$filter: {
												input: '$Attention',
												cond: { $eq: ['$$this', '$$range'] },
											},
										},
									},
								},
							},
						},
					},
					Cognitive: {
						$arrayToObject: {
							$map: {
								input: { $setUnion: ['$Cognitive'] },
								as: 'range',
								in: {
									k: '$$range',
									v: {
										$size: {
											$filter: {
												input: '$Cognitive',
												cond: { $eq: ['$$this', '$$range'] },
											},
										},
									},
								},
							},
						},
					},
				},
			},

			//           // Final formatting to match the required structure
			{
				$project: {
					_id: 0,
					data: {
						fineMotorAndGrossMotorSkills: {
							'0-50%': { $ifNull: ['$fineMotorAndGrossMotorSkills.0-50%', 0] },
							'50-75%': { $ifNull: ['$fineMotorAndGrossMotorSkills.50-75%', 0] },
							'75-100%': { $ifNull: ['$fineMotorAndGrossMotorSkills.75-100%', 0] },
							percentage: {
								$round: [
									{
										$multiply: [
											{
												$divide: [
													'$fineMotorAndGrossMotorSkillTotalSum',
													{ $multiply: ['$studentCount', 4] },
												],
											},
											100,
										],
									},
									2,
								],
							},
						},
						Behavior: {
							'0-50%': { $ifNull: ['$Behavior.0-50%', 0] },
							'50-75%': { $ifNull: ['$Behavior.50-75%', 0] },
							'75-100%': { $ifNull: ['$Behavior.75-100%', 0] },
							percentage: {
								$round: [
									{
										$multiply: [
											{
												$divide: [
													'$behaviorTotalSum',
													{ $multiply: ['$studentCount', 9] },
												],
											},
											100,
										],
									},
									2,
								],
							},
						},
						Attention: {
							'0-50%': { $ifNull: ['$Attention.0-50%', 0] },
							'50-75%': { $ifNull: ['$Attention.50-75%', 0] },
							'75-100%': { $ifNull: ['$Attention.75-100%', 0] },
							percentage: {
								$round: [
									{
										$multiply: [
											{
												$divide: [
													'$attentionTotalSum',
													{ $multiply: ['$studentCount', 4] },
												],
											},
											100,
										],
									},
									2,
								],
							},
						},
						Cognitive: {
							'0-50%': { $ifNull: ['$Cognitive.0-50%', 0] },
							'50-75%': { $ifNull: ['$Cognitive.50-75%', 0] },
							'75-100%': { $ifNull: ['$Cognitive.75-100%', 0] },
							percentage: {
								$round: [
									{
										$multiply: [
											{
												$divide: [
													'$cognitiveTotalSum',
													{ $multiply: ['$studentCount', 11] },
												],
											},
											100,
										],
									},
									2,
								],
							},
						},
					},
				},
			},
		]

		return StudentCheckList.aggregate(Pipeline)
	}

	async Grade5ToGrade9SpecificSchoolPipeLine(query, checklistForm) {
		const Pipeline = [
			// Match the initial query and checklist form
			{
				$match: {
					...query,
					checklistForm,
				},
			},
			// Unwind the categories array
			{
				$unwind: '$categories',
			},
			// Group by student and category to calculate total scores and counts
			{
				$group: {
					_id: {
						studentId: '$studentId',
						category: '$categories.category',
					},
					totalScore: { $sum: '$categories.score' },
					count: { $sum: 1 },
					categoryTotal: {
						$sum: {
							$switch: {
								branches: [
									{
										case: {
											$eq: [
												'$categories.category',
												studentCheckListKeys.attentionAndHyperactivity,
											],
										},
										then: '$categories.score',
									},
									{
										case: {
											$eq: [
												'$categories.category',
												studentCheckListKeys.Memory,
											],
										},
										then: '$categories.score',
									},
									{
										case: {
											$eq: [
												'$categories.category',
												studentCheckListKeys.fineMotorAndGrossMotorSkill,
											],
										},
										then: '$categories.score',
									},
									{
										case: {
											$eq: [
												'$categories.category',
												studentCheckListKeys.Cognitive,
											],
										},
										then: '$categories.score',
									},
									{
										case: {
											$eq: [
												'$categories.category',
												studentCheckListKeys.SocialSkill,
											],
										},
										then: '$categories.score',
									},
								],
								default: 0,
							},
						},
					},
				},
			},
			// Regroup by student to collect categories and calculate individual average percentages
			{
				$group: {
					_id: '$_id.studentId',

					count: { $first: '$count' },

					categories: {
						$push: {
							category: '$_id.category',
							totalScore: '$totalScore',
							count: '$count',
							divisor: {
								$switch: {
									branches: [
										{
											case: {
												$eq: [
													'$_id.category',
													studentCheckListKeys.fineMotorAndGrossMotorSkill,
												],
											},
											then: 6,
										},
										{
											case: {
												$eq: [
													'$_id.category',
													studentCheckListKeys.attentionAndHyperactivity,
												],
											},
											then: 11,
										},
										{
											case: {
												$eq: ['$_id.category', studentCheckListKeys.Memory],
											},
											then: 4,
										},
										{
											case: {
												$eq: [
													'$_id.category',
													studentCheckListKeys.Cognitive,
												],
											},
											then: 46,
										},
										{
											case: {
												$eq: [
													'$_id.category',
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
					fineMotorAndGrossMotorSkillTotal: {
						$sum: {
							$cond: [
								{
									$eq: [
										'$_id.category',
										studentCheckListKeys.fineMotorAndGrossMotorSkill,
									],
								},
								'$categoryTotal',
								0,
							],
						},
					},
					cognitiveTotal: {
						$sum: {
							$cond: [
								{ $eq: ['$_id.category', studentCheckListKeys.Cognitive] },
								'$categoryTotal',
								0,
							],
						},
					},
					attentionAndHyperactivityTotal: {
						$sum: {
							$cond: [
								{
									$eq: [
										'$_id.category',
										studentCheckListKeys.attentionAndHyperactivity,
									],
								},
								'$categoryTotal',
								0,
							],
						},
					},
					socialSkillTotal: {
						$sum: {
							$cond: [
								{ $eq: ['$_id.category', studentCheckListKeys.SocialSkill] },
								'$categoryTotal',
								0,
							],
						},
					},
					memoryTotal: {
						$sum: {
							$cond: [
								{ $eq: ['$_id.category', studentCheckListKeys.Memory] },
								'$categoryTotal',
								0,
							],
						},
					},
				},
			},

			// Calculate average percentages for each category and overall average for each student
			{
				$addFields: {
					categories: {
						$map: {
							input: '$categories',
							as: 'cat',
							in: {
								category: '$$cat.category',
								averageScore: {
									$round: [
										{
											$multiply: [
												{
													$divide: [
														{
															$divide: [
																'$$cat.totalScore',
																'$$cat.divisor',
															],
														}, // Divide totalScore by divisor
														'$$cat.count', // Divide the result by count
													],
												},
												100, // Multiply by 100 to get percentage
											],
										},
										0, // Round to the nearest whole number
									],
								},
							},
						},
					},
				},
			},

			{
				$project: {
					_id: '$_id',

					count: 1,

					fineMotorAndGrossMotorSkillTotal: 1,
					cognitiveTotal: 1,
					attentionAndHyperactivityTotal: 1,
					socialSkillTotal: 1,
					memoryTotal: 1,

					categories: {
						$arrayToObject: {
							$map: {
								input: '$categories',
								as: 'cat',
								in: {
									k: '$$cat.category',
									v: '$$cat.averageScore',
								},
							},
						},
					},
				},
			},

			{
				$project: {
					count: 1,

					fineMotorAndGrossMotorSkillTotal: 1,
					cognitiveTotal: 1,
					attentionAndHyperactivityTotal: 1,
					socialSkillTotal: 1,
					memoryTotal: 1,

					fineMotorAndGrossMotorSkills: {
						$ifNull: [
							`$categories.${studentCheckListKeys.fineMotorAndGrossMotorSkill}`,
							null,
						],
					},
					Cognitive: { $ifNull: [`$categories.${studentCheckListKeys.Cognitive}`, null] },
					SocialSkill: {
						$ifNull: [`$categories.${studentCheckListKeys.SocialSkill}`, null],
					},
					attentionAndHyperactivity: {
						$ifNull: [
							`$categories.${studentCheckListKeys.attentionAndHyperactivity}`,
							null,
						],
					},
					Memory: { $ifNull: ['$categories.Memory', null] },
				},
			},

			// Project individual category scores and categorize percentages
			{
				$project: {
					studentName: 1,
					count: 1,

					fineMotorAndGrossMotorSkillTotal: 1,
					cognitiveTotal: 1,
					attentionAndHyperactivityTotal: 1,
					socialSkillTotal: 1,
					memoryTotal: 1,

					fineMotorAndGrossMotorSkillsRange: {
						$switch: {
							branches: [
								{
									case: { $lte: ['$fineMotorAndGrossMotorSkills', 50] },
									then: '0-50%',
								},
								{
									case: {
										$and: [
											{ $gt: ['$fineMotorAndGrossMotorSkills', 50] },
											{ $lte: ['$fineMotorAndGrossMotorSkills', 75] },
										],
									},
									then: '50-75%',
								},
								{
									case: { $gt: ['$fineMotorAndGrossMotorSkills', 75] },
									then: '75-100%',
								},
							],
							default: 'Unknown',
						},
					},
					SocialSkillRange: {
						$switch: {
							branches: [
								{ case: { $lte: ['$SocialSkill', 50] }, then: '0-50%' },
								{
									case: {
										$and: [
											{ $gt: ['$SocialSkill', 50] },
											{ $lte: ['$SocialSkill', 75] },
										],
									},
									then: '50-75%',
								},
								{ case: { $gt: ['$SocialSkill', 75] }, then: '75-100%' },
							],
							default: 'Unknown',
						},
					},
					AttentionAndHyperactivityRange: {
						$switch: {
							branches: [
								{
									case: { $lte: ['$attentionAndHyperactivity', 50] },
									then: '0-50%',
								},
								{
									case: {
										$and: [
											{ $gt: ['$attentionAndHyperactivity', 50] },
											{ $lte: ['$attentionAndHyperactivity', 75] },
										],
									},
									then: '50-75%',
								},
								{
									case: { $gt: ['$attentionAndHyperactivity', 75] },
									then: '75-100%',
								},
							],
							default: 'Unknown',
						},
					},
					MemoryRange: {
						$switch: {
							branches: [
								{ case: { $lte: ['$Memory', 50] }, then: '0-50%' },
								{
									case: {
										$and: [{ $gt: ['$Memory', 50] }, { $lte: ['$Memory', 75] }],
									},
									then: '50-75%',
								},
								{ case: { $gt: ['$Memory', 75] }, then: '75-100%' },
							],
							default: 'Unknown',
						},
					},
					CognitiveRange: {
						$switch: {
							branches: [
								{ case: { $lte: ['$Cognitive', 50] }, then: '0-50%' },
								{
									case: {
										$and: [
											{ $gt: ['$Cognitive', 50] },
											{ $lte: ['$Cognitive', 75] },
										],
									},
									then: '50-75%',
								},
								{ case: { $gt: ['$Cognitive', 75] }, then: '75-100%' },
							],
							default: 'Unknown',
						},
					},
				},
			},

			// Group by percentage range and category to count students
			{
				$group: {
					_id: null,
					fineMotorAndGrossMotorSkillTotalSum: {
						$sum: '$fineMotorAndGrossMotorSkillTotal',
					},
					cognitiveTotalSum: { $sum: '$cognitiveTotal' },
					attentionAndHyperactivityTotalSum: { $sum: '$attentionAndHyperactivityTotal' },
					socialSkillTotalSum: { $sum: '$socialSkillTotal' },
					memoryTotalSum: { $sum: '$memoryTotal' },

					studentCount: { $sum: '$count' },

					fineMotorAndGrossMotorSkills: {
						$push: '$fineMotorAndGrossMotorSkillsRange',
					},
					Cognitive: {
						$push: '$CognitiveRange',
					},
					SocialSkill: {
						$push: '$SocialSkillRange',
					},
					AttentionAndHyperactivity: {
						$push: '$AttentionAndHyperactivityRange',
					},
					Memory: {
						$push: '$MemoryRange',
					},
				},
			},

			//  // Aggregate counts for each percentage range
			{
				$project: {
					fineMotorAndGrossMotorSkillTotalSum: 1,
					cognitiveTotalSum: 1,
					attentionAndHyperactivityTotalSum: 1,
					socialSkillTotalSum: 1,
					memoryTotalSum: 1,

					studentCount: 1,
					fineMotorAndGrossMotorSkills: {
						$arrayToObject: {
							$map: {
								input: { $setUnion: ['$fineMotorAndGrossMotorSkills'] },
								as: 'range',
								in: {
									k: '$$range',
									v: {
										$size: {
											$filter: {
												input: '$fineMotorAndGrossMotorSkills',
												cond: { $eq: ['$$this', '$$range'] },
											},
										},
									},
								},
							},
						},
					},
					Cognitive: {
						$arrayToObject: {
							$map: {
								input: { $setUnion: ['$Cognitive'] },
								as: 'range',
								in: {
									k: '$$range',
									v: {
										$size: {
											$filter: {
												input: '$Cognitive',
												cond: { $eq: ['$$this', '$$range'] },
											},
										},
									},
								},
							},
						},
					},
					SocialSkill: {
						$arrayToObject: {
							$map: {
								input: { $setUnion: ['$SocialSkill'] },
								as: 'range',
								in: {
									k: '$$range',
									v: {
										$size: {
											$filter: {
												input: '$SocialSkill',
												cond: { $eq: ['$$this', '$$range'] },
											},
										},
									},
								},
							},
						},
					},
					AttentionAndHyperactivity: {
						$arrayToObject: {
							$map: {
								input: { $setUnion: ['$AttentionAndHyperactivity'] },
								as: 'range',
								in: {
									k: '$$range',
									v: {
										$size: {
											$filter: {
												input: '$AttentionAndHyperactivity',
												cond: { $eq: ['$$this', '$$range'] },
											},
										},
									},
								},
							},
						},
					},
					Memory: {
						$arrayToObject: {
							$map: {
								input: { $setUnion: ['$Memory'] },
								as: 'range',
								in: {
									k: '$$range',
									v: {
										$size: {
											$filter: {
												input: '$Memory',
												cond: { $eq: ['$$this', '$$range'] },
											},
										},
									},
								},
							},
						},
					},
				},
			},

			//           // Final formatting to match the required structure
			{
				$project: {
					_id: 0,
					data: {
						fineMotorAndGrossMotorSkills: {
							'0-50%': { $ifNull: ['$fineMotorAndGrossMotorSkills.0-50%', 0] },
							'50-75%': { $ifNull: ['$fineMotorAndGrossMotorSkills.50-75%', 0] },
							'75-100%': { $ifNull: ['$fineMotorAndGrossMotorSkills.75-100%', 0] },
							percentage: {
								$round: [
									{
										$multiply: [
											{
												$divide: [
													'$fineMotorAndGrossMotorSkillTotalSum',
													{ $multiply: ['$studentCount', 6] },
												],
											},
											100,
										],
									},
									2,
								],
							},
						},
						Cognitive: {
							'0-50%': { $ifNull: ['$Cognitive.0-50%', 0] },
							'50-75%': { $ifNull: ['$Cognitive.50-75%', 0] },
							'75-100%': { $ifNull: ['$Cognitive.75-100%', 0] },
							percentage: {
								$round: [
									{
										$multiply: [
											{
												$divide: [
													'$cognitiveTotalSum',
													{ $multiply: ['$studentCount', 46] },
												],
											},
											100,
										],
									},
									2,
								],
							},
						},
						SocialSkill: {
							'0-50%': { $ifNull: ['$SocialSkill.0-50%', 0] },
							'50-75%': { $ifNull: ['$SocialSkill.50-75%', 0] },
							'75-100%': { $ifNull: ['$SocialSkill.75-100%', 0] },
							percentage: {
								$round: [
									{
										$multiply: [
											{
												$divide: [
													'$socialSkillTotalSum',
													{ $multiply: ['$studentCount', 17] },
												],
											},
											100,
										],
									},
									2,
								],
							},
						},
						AttentionAndHyperactivity: {
							'0-50%': { $ifNull: ['$AttentionAndHyperactivity.0-50%', 0] },
							'50-75%': { $ifNull: ['$AttentionAndHyperactivity.50-75%', 0] },
							'75-100%': { $ifNull: ['$AttentionAndHyperactivity.75-100%', 0] },
							percentage: {
								$round: [
									{
										$multiply: [
											{
												$divide: [
													'$attentionAndHyperactivityTotalSum',
													{ $multiply: ['$studentCount', 11] },
												],
											},
											100,
										],
									},
									2,
								],
							},
						},
						Memory: {
							'0-50%': { $ifNull: ['$Memory.0-50%', 0] },
							'50-75%': { $ifNull: ['$Memory.50-75%', 0] },
							'75-100%': { $ifNull: ['$Memory.75-100%', 0] },
							percentage: {
								$round: [
									{
										$multiply: [
											{
												$divide: [
													'$memoryTotalSum',
													{ $multiply: ['$studentCount', 4] },
												],
											},
											100,
										],
									},
									2,
								],
							},
						},
					},
				},
			},
		]

		return StudentCheckList.aggregate(Pipeline)
	}

	validateGrade5ToGrade9Categories(categories, rowIndex) {
		const errors = []

		categories.forEach((category) => {
			switch (category.categoryName) {
				case studentCheckListKeys.attentionAndHyperactivity:
					if (category.questions.length !== 11) {
						errors.push(
							`Invalid number of questions for "${category.categoryName}" at row number ${rowIndex} ,it should be 11`,
						)
					}
					break
				case studentCheckListKeys.Memory:
					if (category.questions.length !== 4) {
						errors.push(
							`Invalid number of questions for category "${category.categoryName}" at row number ${rowIndex},it should be 4`,
						)
					}
					break
				case studentCheckListKeys.fineMotorAndGrossMotorSkill:
					if (category.questions.length !== 6) {
						errors.push(
							`Invalid number of questions for category "${category.categoryName}" at row number ${rowIndex},it should be 6`,
						)
					}
					break
				case studentCheckListKeys.Cognitive:
					category.subCategories.forEach((subCategory) => {
						switch (subCategory.subCategoryName) {
							case 'Reading & Spelling':
								if (subCategory.questions.length !== 18) {
									errors.push(
										`Invalid number of questions for subcategory "${subCategory.subCategoryName}" at row number ${rowIndex},it should be 18`,
									)
								}
								break
							case 'Numeracy Skills':
								if (subCategory.questions.length !== 9) {
									errors.push(
										`Invalid number of questions for subcategory "${subCategory.subCategoryName}" at row number ${rowIndex},it should be 9`,
									)
								}
								break
							case 'Speaking And Listening':
								if (subCategory.questions.length !== 15) {
									errors.push(
										`Invalid number of questions for subcategory "${subCategory.subCategoryName}" at row number ${rowIndex},it should be 15`,
									)
								}
								break
							case 'Style of Working':
								if (subCategory.questions.length !== 4) {
									errors.push(
										`Invalid number of questions for subcategory "${subCategory.subCategoryName}" at row number ${rowIndex},it should be 4`,
									)
								}
								break
							default:
								errors.push(
									`Invalid subcategory "${subCategory.subCategoryName}" in category "${category.categoryName}" at row number ${rowIndex}`,
								)
								break
						}
					})
					break
				case studentCheckListKeys.SocialSkill:
					category.subCategories.forEach((subCategory) => {
						switch (subCategory.subCategoryName) {
							case 'Behavior':
								if (subCategory.questions.length !== 9) {
									errors.push(
										`Invalid number of questions for subcategory "${subCategory.subCategoryName}" at row number ${rowIndex},it should be 9`,
									)
								}
								break
							case 'Visual And Perceptual Ability':
								if (subCategory.questions.length !== 8) {
									errors.push(
										`Invalid number of questions for subcategory "${subCategory.subCategoryName}" at row number ${rowIndex},it should be 8`,
									)
								}
								break
							default:
								errors.push(
									`Invalid subcategory "${subCategory.subCategoryName}" in category "${category.categoryName}" at row number ${rowIndex}`,
								)
								break
						}
					})
					break
				default:
					errors.push(
						`Invalid category "${category.categoryName}" at row number ${rowIndex}`,
					)
					break
			}
		})

		return errors
	}

	validateUpperKGtoGrade4Categories(categories, rowIndex) {
		const errors = []

		categories.forEach((category) => {
			switch (category.categoryName) {
				case studentCheckListKeys.Attention:
					if (category.questions.length !== 4) {
						errors.push(
							`Invalid number of questions for "${category.categoryName}" at row number ${rowIndex},it should be 4`,
						)
					}
					break
				case studentCheckListKeys.fineMotorAndGrossMotorSkill:
					if (category.questions.length !== 4) {
						errors.push(
							`Invalid number of questions for "${category.categoryName}" at row number ${rowIndex},it should be 4`,
						)
					}
					break
				case studentCheckListKeys.Cognitive:
					if (category.questions.length !== 11) {
						errors.push(
							`Invalid number of questions for "${category.categoryName}" at row number ${rowIndex},it should be 11`,
						)
					}
					break
				case studentCheckListKeys.Behavior:
					if (category.questions.length !== 9) {
						errors.push(
							`Invalid number of questions for "${category.categoryName}" at row number ${rowIndex},it should be 9`,
						)
					}
					break
				default:
					errors.push(
						`Invalid category "${category.categoryName}" at row number ${rowIndex}`,
					)
					break
			}
		})

		return errors
	}

	validateStudentsCheckListData(
		students,
		allStudents,
		existingCheckListData,
		uniqueUserIds,
		requiredFields,
		fieldDisplayNames,
		allClassroomsIds,
		recordsToInsert,
		SAY,
		academicYear,
		school,
	) {
		const validationErrors = []

		for (let i = 0; i < students.length; i++) {
			let errors = false
			const student = students[i]

			if (student.categories.length === 0) {
				validationErrors.push(
					`Categories not provided For Student with user_id: ${student.user_id} at row number ${i + 2}`,
				)
				errors = true
				continue
			}

			const missing = requiredFields.filter((field) => !student[field])

			if (missing.length > 0) {
				const missingError = `Row number ${i + 2} has invalid ${missing.map((field) => fieldDisplayNames[field]).join(', ')} field`
				validationErrors.push(missingError)
				errors = true
				continue
			}

			const userId = student['user_id']

			const studentInDB = allStudents.find((obj) => obj.user_id === userId)
			if (!studentInDB) {
				validationErrors.push(
					`Student with user_id: ${userId} not found at row number ${i + 2}`,
				)
				errors = true
				continue
			} else if (studentInDB.graduated) {
				validationErrors.push(`Student at row number ${i + 2} graduated.`)
				errors = true
				continue
			} else if (studentInDB.exited) {
				validationErrors.push(`Student at row number ${i + 2} exited.`)
				errors = true
				continue
			}

			const validateStudentInAY = this.validateStudentAndAcademicYearInJourney(
				studentInDB,
				academicYear._id,
			)
			if (!validateStudentInAY) {
				errors = true
				validationErrors.push(
					`Student with ID: ${student.user_id} not found in academic year ${academicYear.academicYear} at row number ${i + 2}.`,
				)
				continue
			}

			const uniqueId = `${userId}-${student.checklistForm}`
			if (uniqueUserIds.has(uniqueId)) {
				errors = true
				validationErrors.push(
					`Row number ${i + 2} has duplicate Student Id for checklist form ${student.checklistForm}`,
				)
				errors = true
				continue
			} else {
				uniqueUserIds.add(uniqueId)
			}

			const sendChecklistData = existingCheckListData.find(
				(obj) =>
					obj.studentId.toString() === studentInDB._id.toString() &&
					obj.classRoomId.toString() === validateStudentInAY.classRoomId.toString(),
			)
			if (sendChecklistData) {
				validationErrors.push(
					`Send CheckList Record already exists for Student ID ${student.user_id} for academic year ${academicYear.academicYear} at row number ${i + 2}`,
				)
				errors = true
				continue
			}

			if (student.checklistForm === checkListCategories.grade5ToGrade12) {
				const categoryErrors = this.validateGrade5ToGrade9Categories(
					student.categories,
					i + 2,
				)
				if (categoryErrors.length > 0) {
					validationErrors.push(...categoryErrors)
					errors = true
					continue
				}
			}
			if (student.checklistForm === checkListCategories.upperKgToGrade4) {
				const categoryErrors = this.validateUpperKGtoGrade4Categories(
					student.categories,
					i + 2,
				)
				if (categoryErrors.length > 0) {
					validationErrors.push(...categoryErrors)
					errors = true
					continue
				}
			}

			if (!errors) {
				const studentInDB = allStudents.find((obj) => obj.user_id === userId)
				const { _id: studentId, studentName, user_id, classRoomId } = studentInDB
				const categories = this.processCategories(student)
				recordsToInsert.push({
					studentName,
					studentId,
					classRoomId: validateStudentInAY.classRoomId,
					school: school._id,
					schoolName: school.school,
					user_id: user_id,
					checklistForm: student?.checklistForm,
					sendCheckListDate: student?.dateOfAssessment
						? student?.dateOfAssessment
						: new Date(),
					categories,
					SAY,
					academicYear,
				})
			}
		}

		return validationErrors
	}
}

module.exports = { SendChecklistHelperService }
