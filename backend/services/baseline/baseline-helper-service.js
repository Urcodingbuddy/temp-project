const { default: mongoose } = require('mongoose')
const { BaselineRecord } = require('../../models/database/myPeegu-baseline')
const { GlobalServices } = require('../global-service')
const { Classrooms } = require('../../models/database/myPeegu-classroom')

class BaselineHelperService extends GlobalServices {
	async getBaselineRecordsRankwise(baselineCategory, school, studentId, className, section) {
		if (school) {
			const filter = {}

			if (className) {
				filter['studentData.0.classRoom.className'] = className
			}

			if (section) {
				filter['studentData.0.classRoom.section'] = section
			}
			const schoolId = new mongoose.Types.ObjectId(school)
			const pipeline1 = [
				{
					$match: {
						school: schoolId,
						baselineCategory: baselineCategory,
					},
				},
				{
					$sort: {
						createdAt: -1,
					},
				},
				{
					$lookup: {
						from: 'students',
						localField: 'studentId',
						foreignField: '_id',
						as: 'studentData',
					},
				},
				{
					$lookup: {
						from: 'classrooms',
						localField: 'classRoomId',
						foreignField: '_id',
						as: 'classRoom',
					},
				},
				{
					$unwind: '$classRoom',
				},
			]

			if (
				filter['studentData.classRoom.className'] ||
				filter['studentData.classRoom.section']
			) {
				pipeline1.push({ $match: { ...filter } })
			}

			const pipeline2 = [
				{
					$addFields: {
						PPercentage: {
							$round: [
								{
									$multiply: [
										{ $divide: [{ $toInt: '$Physical.total' }, 7] },
										100,
									],
								},
								2,
							],
						},
						SPercentage: {
							$round: [
								{ $multiply: [{ $divide: [{ $toInt: '$Social.total' }, 7] }, 100] },
								2,
							],
						},
						EPercentage: {
							$round: [
								{
									$multiply: [
										{ $divide: [{ $toInt: '$Emotional.total' }, 7] },
										100,
									],
								},
								2,
							],
						},
						CPercentage: {
							$round: [
								{
									$multiply: [
										{ $divide: [{ $toInt: '$Cognitive.total' }, 7] },
										100,
									],
								},
								2,
							],
						},
						LPercentage: {
							$round: [
								{
									$multiply: [
										{ $divide: [{ $toInt: '$Language.total' }, 7] },
										100,
									],
								},
								2,
							],
						},
						Total: {
							$round: [
								{
									$multiply: [
										{
											$divide: [
												{
													$add: [
														{ $toInt: '$Physical.total' },
														{ $toInt: '$Social.total' },
														{ $toInt: '$Emotional.total' },
														{ $toInt: '$Cognitive.total' },
														{ $toInt: '$Language.total' },
													],
												},
												35,
											],
										},
										100,
									],
								},
								2,
							],
						},
						StudentData: {
							className: {
								$arrayElemAt: ['$studentData.0.classRoom.className', 0],
							},
							section: {
								$arrayElemAt: ['$studentData.0.classRoom.section', 0],
							},
							_id: {
								$arrayElemAt: ['$studentData._id', 0],
							},
							studentName: { $arrayElemAt: ['$studentData.studentName', 0] },
						},
					},
				},
				{
					$project: {
						StudentData: 1,
						Physical: {
							data: '$Physical.data',
							score: '$Physical.total',
							percentage: '$PPercentage',
						},
						Social: {
							data: '$Social.data',
							score: '$Social.total',
							percentage: '$SPercentage',
						},
						Emotional: {
							data: '$Emotional.data',
							score: '$Emotional.total',
							percentage: '$EPercentage',
						},
						Cognitive: {
							data: '$Cognitive.data',
							score: '$Cognitive.total',
							percentage: '$CPercentage',
						},
						Language: {
							data: '$Language.data',
							score: '$Language.total',
							percentage: '$LPercentage',
						},
						Total: 1,
						_id: 0,
					},
				},

				{
					$group: {
						_id: '$StudentData._id',
						mostRecentRecord: { $first: '$$ROOT' },
					},
				},
				{
					$replaceRoot: { newRoot: '$mostRecentRecord' },
				},
				{
					$sort: {
						Total: -1,
					},
				},
			]

			const result = await BaselineRecord.aggregate([...pipeline1, ...pipeline2])
			console.log('result', result.length)
			const response = this.assignRanksSingleRecord(result)

			return {
				data:
					response.find(
						(st) => st?.StudentData?._id?.toString() === studentId?.toString(),
					) ?? [],
				totalStudents: result?.length,
			}
		} else {
			return []
		}
	}

	assignRanksSingleRecord(records) {
		const sortedArray = records.slice().sort((a, b) => b.Total - a.Total)
		let currentRank = 1
		let previousValue = sortedArray[0].Total

		const resultArray = sortedArray.map((obj, index) => {
			if (index > 0 && obj.Total < previousValue) {
				currentRank++
			}
			previousValue = obj.Total
			// Inject the 'Rank' key into the object
			obj.Rank = currentRank
			return obj
		})

		return resultArray
	}

	async AllSchoolsAggregationPipeline(query) {
		const aggregationPipeline = [
			{
				$match: {
					...query,
				},
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
				$addFields: {
					schoolName: { $arrayElemAt: ['$schoolData.school', 0] },
					school: '$school',
					PTotal: '$Physical.total',
					STotal: '$Social.total',
					ETotal: '$Emotional.total',
					CTotal: '$Cognitive.total',
					LTotal: '$Language.total',
				},
			},

			{
				$project: {
					schoolName: 1,
					school: 1,
					PTotal: 1,
					STotal: 1,
					ETotal: 1,
					CTotal: 1,
					LTotal: 1,
				},
			},

			{
				$group: {
					_id: '$school',
					school: { $first: '$school' },
					schoolName: { $first: '$schoolName' },
					Physical: { $avg: { $divide: [{ $toInt: '$PTotal' }, 7] } },
					Cognitive: { $avg: { $divide: [{ $toInt: '$CTotal' }, 7] } },
					Emotional: { $avg: { $divide: [{ $toInt: '$ETotal' }, 7] } },
					Social: { $avg: { $divide: [{ $toInt: '$STotal' }, 7] } },
					Language: { $avg: { $divide: [{ $toInt: '$LTotal' }, 7] } },
				},
			},

			{
				$project: {
					school: 1,
					schoolName: 1,
					Physical: { $round: [{ $multiply: ['$Physical', 100] }, 2] },
					Cognitive: { $round: [{ $multiply: ['$Cognitive', 100] }, 2] },
					Emotional: { $round: [{ $multiply: ['$Emotional', 100] }, 2] },
					Social: { $round: [{ $multiply: ['$Social', 100] }, 2] },
					Language: { $round: [{ $multiply: ['$Language', 100] }, 2] },
					overallPercentageofSchools: {
						$round: [
							{
								$multiply: [
									{
										$avg: [
											'$Physical',
											'$Cognitive',
											'$Emotional',
											'$Social',
											'$Language',
										],
									},
									100,
								],
							},
							2,
						],
					},

					_id: 0,
				},
			},
		]
		return BaselineRecord.aggregate(aggregationPipeline)
	}

	async SpecificSchoolsAggregationPipeline(schoolId, academicYears) {
		const aggregationPipeline = [
			{
				$match: {
					school: schoolId,
					graduated: { $ne: true },
					exited: { $ne: true },
					academicYear: { $in: academicYears },
				},
			},
			{
				$addFields: {
					school: '$school',
					classRoomId: '$classRoomId',
					PTotal: '$Physical.total',
					STotal: '$Social.total',
					ETotal: '$Emotional.total',
					CTotal: '$Cognitive.total',
					LTotal: '$Language.total',
				},
			},
			{
				$project: {
					classRoomId: 1,
					school: 1,
					PTotal: 1,
					STotal: 1,
					ETotal: 1,
					CTotal: 1,
					LTotal: 1,
					_id: 0,
				},
			},
			{
				$lookup: {
					from: 'classrooms',
					localField: 'classRoomId',
					foreignField: '_id',
					as: 'classRoom',
				},
			},
			{
				$unwind: '$classRoom',
			},
			{
				$group: {
					_id: {
						className: '$classRoom.className',
						section: '$classRoom.section',
						classRoomId: '$classRoomId',
					},
					school: { $first: '$school' },
					Physical: { $avg: { $divide: [{ $toInt: '$PTotal' }, 7] } },
					Cognitive: { $avg: { $divide: [{ $toInt: '$CTotal' }, 7] } },
					Emotional: { $avg: { $divide: [{ $toInt: '$ETotal' }, 7] } },
					Social: { $avg: { $divide: [{ $toInt: '$STotal' }, 7] } },
					Language: { $avg: { $divide: [{ $toInt: '$LTotal' }, 7] } },
				},
			},
			{
				$project: {
					school: 1,
					className: '$_id.className',
					section: '$_id.section',
					classRoomId: '$_id.classRoomId',
					Physical: { $round: [{ $multiply: ['$Physical', 100] }, 2] },
					Cognitive: { $round: [{ $multiply: ['$Cognitive', 100] }, 2] },
					Emotional: { $round: [{ $multiply: ['$Emotional', 100] }, 2] },
					Social: { $round: [{ $multiply: ['$Social', 100] }, 2] },
					Language: { $round: [{ $multiply: ['$Language', 100] }, 2] },
					overallPercentageofClasses: {
						$round: [
							{
								$multiply: [
									{
										$avg: [
											'$Physical',
											'$Cognitive',
											'$Emotional',
											'$Social',
											'$Language',
										],
									},
									100,
								],
							},
							2,
						],
					},
					_id: 0,
				},
			},
			{
				$sort: {
					className: 1,
					section: 1,
				},
			},
		]
		return BaselineRecord.aggregate(aggregationPipeline)
	}

	async SpecificClassRoomPipeline(schoolId, academicYears) {
		const aggregationPipeline = [
			// Start from classrooms collection
			{
				$match: {
					school: schoolId,
					academicYear: {
						$in: academicYears.map((id) => new mongoose.Types.ObjectId(id)),
					},
				},
			},

			// Lookup baseline records for each classroom
			{
				$lookup: {
					from: 'baselinerecords', // adjust collection name as needed
					let: { classRoomId: '$_id' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ['$classRoomId', '$$classRoomId'] },
										{ $ne: ['$graduated', true] },
										{ $ne: ['$exited', true] },
									],
								},
							},
						},
						{
							$project: {
								PTotal: '$Physical.total',
								STotal: '$Social.total',
								ETotal: '$Emotional.total',
								CTotal: '$Cognitive.total',
								LTotal: '$Language.total',
							},
						},
					],
					as: 'baselineRecords',
				},
			},

			// Filter out classrooms with no baseline records (optional)
			{
				$match: {
					'baselineRecords.0': { $exists: true },
				},
			},

			// Unwind to calculate averages
			{
				$unwind: '$baselineRecords',
			},

			// Group by classroom and section to calculate averages
			{
				$group: {
					_id: {
						classRoomId: '$_id',
						section: '$section',
					},
					school: { $first: '$school' },
					className: { $first: '$className' },
					Physical: {
						$avg: {
							$divide: [{ $toInt: '$baselineRecords.PTotal' }, 7],
						},
					},
					Cognitive: {
						$avg: {
							$divide: [{ $toInt: '$baselineRecords.CTotal' }, 7],
						},
					},
					Emotional: {
						$avg: {
							$divide: [{ $toInt: '$baselineRecords.ETotal' }, 7],
						},
					},
					Social: {
						$avg: {
							$divide: [{ $toInt: '$baselineRecords.STotal' }, 7],
						},
					},
					Language: {
						$avg: {
							$divide: [{ $toInt: '$baselineRecords.LTotal' }, 7],
						},
					},
				},
			},

			// Final projection with percentages
			{
				$project: {
					school: 1,
					className: 1,
					section: '$_id.section',
					classRoomId: '$_id.classRoomId',
					Physical: { $round: [{ $multiply: ['$Physical', 100] }, 2] },
					Cognitive: { $round: [{ $multiply: ['$Cognitive', 100] }, 2] },
					Emotional: { $round: [{ $multiply: ['$Emotional', 100] }, 2] },
					Social: { $round: [{ $multiply: ['$Social', 100] }, 2] },
					Language: { $round: [{ $multiply: ['$Language', 100] }, 2] },
					overallPercentageofSection: {
						$round: [
							{
								$multiply: [
									{
										$avg: [
											'$Physical',
											'$Cognitive',
											'$Emotional',
											'$Social',
											'$Language',
										],
									},
									100,
								],
							},
							2,
						],
					},
					_id: 0,
				},
			},

			// Optional: Sort by className and section
			{
				$sort: {
					className: 1,
					section: 1,
				},
			},
		]

		return Classrooms.aggregate(aggregationPipeline) // Note: Changed to ClassRoom model
	}

	async groupedDataPipeLine(query) {
		const groupingPipeLine = [
			{
				$match: query,
			},
			{
				$addFields: {
					// Check if any domain is red (0-3)
					hasRed: {
						$or: [
							{ $lte: [{ $toInt: '$Physical.total' }, 3] },
							{ $lte: [{ $toInt: '$Social.total' }, 3] },
							{ $lte: [{ $toInt: '$Emotional.total' }, 3] },
							{ $lte: [{ $toInt: '$Cognitive.total' }, 3] },
							{ $lte: [{ $toInt: '$Language.total' }, 3] },
						],
					},
					// Check if any domain is orange (4-5)
					hasOrange: {
						$or: [
							{
								$and: [
									{ $gte: [{ $toInt: '$Physical.total' }, 4] },
									{ $lte: [{ $toInt: '$Physical.total' }, 5] },
								],
							},
							{
								$and: [
									{ $gte: [{ $toInt: '$Social.total' }, 4] },
									{ $lte: [{ $toInt: '$Social.total' }, 5] },
								],
							},
							{
								$and: [
									{ $gte: [{ $toInt: '$Emotional.total' }, 4] },
									{ $lte: [{ $toInt: '$Emotional.total' }, 5] },
								],
							},
							{
								$and: [
									{ $gte: [{ $toInt: '$Cognitive.total' }, 4] },
									{ $lte: [{ $toInt: '$Cognitive.total' }, 5] },
								],
							},
							{
								$and: [
									{ $gte: [{ $toInt: '$Language.total' }, 4] },
									{ $lte: [{ $toInt: '$Language.total' }, 5] },
								],
							},
						],
					},
				},
			},
			{
				$addFields: {
					// ROG classification: Red if hasRed, Orange if hasOrange but not hasRed, Green otherwise
					rogCategory: {
						$cond: {
							if: '$hasRed',
							then: 'red',
							else: {
								$cond: {
									if: '$hasOrange',
									then: 'orange',
									else: 'green',
								},
							},
						},
					},
				},
			},
			// Deduplicate by studentId - keep first record per student to count unique students
			{
				$group: {
					_id: '$studentId',
					rogCategory: { $first: '$rogCategory' },
					Physical: { $first: '$Physical' },
					Social: { $first: '$Social' },
					Emotional: { $first: '$Emotional' },
					Cognitive: { $first: '$Cognitive' },
					Language: { $first: '$Language' },
				},
			},
			{
				$group: {
					_id: null,
					studentCount: { $sum: 1 },
					// ROG counts
					rogRed: { $sum: { $cond: [{ $eq: ['$rogCategory', 'red'] }, 1, 0] } },
					rogOrange: { $sum: { $cond: [{ $eq: ['$rogCategory', 'orange'] }, 1, 0] } },
					rogGreen: { $sum: { $cond: [{ $eq: ['$rogCategory', 'green'] }, 1, 0] } },
					Physical_0_3: {
						$sum: { $cond: [{ $lte: [{ $toInt: '$Physical.total' }, 3] }, 1, 0] },
					},
					Physical_4_5: {
						$sum: {
							$cond: [
								{
									$and: [
										{ $gte: [{ $toInt: '$Physical.total' }, 4] },
										{ $lte: [{ $toInt: '$Physical.total' }, 5] },
									],
								},
								1,
								0,
							],
						},
					},
					Physical_6_7: {
						$sum: { $cond: [{ $gte: [{ $toInt: '$Physical.total' }, 6] }, 1, 0] },
					},
					Social_0_3: {
						$sum: { $cond: [{ $lte: [{ $toInt: '$Social.total' }, 3] }, 1, 0] },
					},
					Social_4_5: {
						$sum: {
							$cond: [
								{
									$and: [
										{ $gte: [{ $toInt: '$Social.total' }, 4] },
										{ $lte: [{ $toInt: '$Social.total' }, 5] },
									],
								},
								1,
								0,
							],
						},
					},
					Social_6_7: {
						$sum: { $cond: [{ $gte: [{ $toInt: '$Social.total' }, 6] }, 1, 0] },
					},
					Emotional_0_3: {
						$sum: { $cond: [{ $lte: [{ $toInt: '$Emotional.total' }, 3] }, 1, 0] },
					},
					Emotional_4_5: {
						$sum: {
							$cond: [
								{
									$and: [
										{ $gte: [{ $toInt: '$Emotional.total' }, 4] },
										{ $lte: [{ $toInt: '$Emotional.total' }, 5] },
									],
								},
								1,
								0,
							],
						},
					},
					Emotional_6_7: {
						$sum: { $cond: [{ $gte: [{ $toInt: '$Emotional.total' }, 6] }, 1, 0] },
					},
					Cognitive_0_3: {
						$sum: { $cond: [{ $lte: [{ $toInt: '$Cognitive.total' }, 3] }, 1, 0] },
					},
					Cognitive_4_5: {
						$sum: {
							$cond: [
								{
									$and: [
										{ $gte: [{ $toInt: '$Cognitive.total' }, 4] },
										{ $lte: [{ $toInt: '$Cognitive.total' }, 5] },
									],
								},
								1,
								0,
							],
						},
					},
					Cognitive_6_7: {
						$sum: { $cond: [{ $gte: [{ $toInt: '$Cognitive.total' }, 6] }, 1, 0] },
					},
					Language_0_3: {
						$sum: { $cond: [{ $lte: [{ $toInt: '$Language.total' }, 3] }, 1, 0] },
					},
					Language_4_5: {
						$sum: {
							$cond: [
								{
									$and: [
										{ $gte: [{ $toInt: '$Language.total' }, 4] },
										{ $lte: [{ $toInt: '$Language.total' }, 5] },
									],
								},
								1,
								0,
							],
						},
					},
					Language_6_7: {
						$sum: { $cond: [{ $gte: [{ $toInt: '$Language.total' }, 6] }, 1, 0] },
					},

					PhysicalTotal: { $sum: { $toInt: '$Physical.total' } },
					SocialTotal: { $sum: { $toInt: '$Social.total' } },
					EmotionalTotal: { $sum: { $toInt: '$Emotional.total' } },
					CognitiveTotal: { $sum: { $toInt: '$Cognitive.total' } },
					LanguageTotal: { $sum: { $toInt: '$Language.total' } },
				},
			},
			// Project to reshape the output as desired
			{
				$project: {
					_id: 0,
					studentsScreened: '$studentCount',
					rogBreakup: {
						red: '$rogRed',
						orange: '$rogOrange',
						green: '$rogGreen',
					},
					data: {
						Physical: {
							'0-3': '$Physical_0_3',
							'4-5': '$Physical_4_5',
							'6-7': '$Physical_6_7',
							percentage: {
								$round: [
									{
										$multiply: [
											{
												$divide: [
													'$PhysicalTotal',
													{ $multiply: ['$studentCount', 7] },
												],
											},
											100,
										],
									},
									2,
								],
							},
						},
						Social: {
							'0-3': '$Social_0_3',
							'4-5': '$Social_4_5',
							'6-7': '$Social_6_7',
							percentage: {
								$round: [
									{
										$multiply: [
											{
												$divide: [
													'$SocialTotal',
													{ $multiply: ['$studentCount', 7] },
												],
											},
											100,
										],
									},
									2,
								],
							},
						},
						Emotional: {
							'0-3': '$Emotional_0_3',
							'4-5': '$Emotional_4_5',
							'6-7': '$Emotional_6_7',
							percentage: {
								$round: [
									{
										$multiply: [
											{
												$divide: [
													'$EmotionalTotal',
													{ $multiply: ['$studentCount', 7] },
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
							'0-3': '$Cognitive_0_3',
							'4-5': '$Cognitive_4_5',
							'6-7': '$Cognitive_6_7',
							percentage: {
								$round: [
									{
										$multiply: [
											{
												$divide: [
													'$CognitiveTotal',
													{ $multiply: ['$studentCount', 7] },
												],
											},
											100,
										],
									},
									2,
								],
							},
						},
						Language: {
							'0-3': '$Language_0_3',
							'4-5': '$Language_4_5',
							'6-7': '$Language_6_7',
							percentage: {
								$round: [
									{
										$multiply: [
											{
												$divide: [
													'$LanguageTotal',
													{ $multiply: ['$studentCount', 7] },
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

		const groupedData = await BaselineRecord.aggregate(groupingPipeLine)

		return groupedData[0] // Return the first element because we know there's only one group (_id: null)
	}

	assignRanks(dataArray, field) {
		const sortedArray = dataArray.slice().sort((a, b) => b[field] - a[field])

		// Reuse the addRanking function to rank each record based on the specified field
		const rankedData = this.addRanking(sortedArray, field)

		// Construct the percentages object for each record
		const transformedData = rankedData.map((record) => {
			const percentages = {}
			const percentageFields = ['Physical', 'Social', 'Emotional', 'Cognitive', 'Language']
			// Calculate rank for each percentage field
			percentageFields.forEach((percentageField) => {
				const sortedPercentageArray = sortedArray
					.slice()
					.sort((a, b) => b[percentageField] - a[percentageField])
				const percentageRank =
					sortedPercentageArray.findIndex(
						(item) => item[percentageField] === record[percentageField],
					) + 1

				percentages[percentageField] = {
					percentage: record[percentageField],
					rank: record[percentageField] !== 0 ? percentageRank : 0, // If percentage is 0, set rank to 0
				}
			})

			return {
				schoolName: record.schoolName,
				schoolId: record.school,
				rank: record.rank,
				overallPercentageofSchools: record.overallPercentageofSchools,
				overallPercentageofClasses: record.overallPercentageofClasses,
				className: record.className,
				section: record?.section,
				overallPercentageofSection: record.overallPercentageofSection,
				classRoomId: record.classRoomId,
				percentages: { ...percentages },
			}
		})

		return transformedData
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
}

module.exports.BaselineHelperService = BaselineHelperService
