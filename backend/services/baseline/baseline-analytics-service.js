const { BaselineRecord } = require('../../models/database/myPeegu-baseline')
const { Schools } = require('../../models/database/myPeegu-school')
const { Classrooms } = require('../../models/database/myPeegu-classroom')
const { Students } = require('../../models/database/myPeegu-student')
const { FailureResponse } = require('../../models/response/globalResponse')
const { BaselineHelperService } = require('./baseline-helper-service')
const utils = require('../../utility/utils')
const { default: mongoose } = require('mongoose')

class BaselineAnalyticService extends BaselineHelperService {
	async singleStudentBaselineAnalytics(req, res) {
		const { academicYear, studentId, baselineCategory } = req.body
		const baselineRecord = await BaselineRecord.findOne(
			{ academicYear, studentId: studentId, baselineCategory },
			{
				_id: 0,
				studentId: 1,
				school: 1,
				baselineCategory: 1,
				classRoomId: 1,
				academicYear: 1,
				Physical: 1,
				Social: 1,
				Emotional: 1,
				Cognitive: 1,
				Language: 1,
			},
		).populate([
			{ path: 'school', select: '_id school' },
			{ path: 'classRoomId', select: 'className section' },
			{ path: 'academicYear', select: '_id academicYear' },
		])

		if (!baselineRecord) {
			return res.status(200).json({})
		}

		const { data: schoolWiseReport, totalStudents: totalStudentsInSchool } =
			await this.getBaselineRecordsRankwise(
				baselineCategory,
				baselineRecord?.school,
				baselineRecord?.studentId?._id,
			)

		const { data: classWiseReport, totalStudents: totalStudentsInClass } =
			await this.getBaselineRecordsRankwise(
				baselineCategory,
				baselineRecord?.school,
				baselineRecord?.studentId?._id,
				baselineRecord?.classRoomId?.className,
			)
		const { data: sectionWiseReport, totalStudents: totalStudentsInSection } =
			await this.getBaselineRecordsRankwise(
				baselineCategory,
				baselineRecord?.school,
				baselineRecord?.studentId?._id,
				baselineRecord?.classRoomId?.className,
				baselineRecord?.classRoomId?.section,
			)

		const schoolName = await Schools.findById(baselineRecord?.school)

		let data = {
			rankInSchool: `${schoolWiseReport.Rank} out of ${totalStudentsInSchool}`,
			rankInClass: `${classWiseReport.Rank} out of ${totalStudentsInClass}`,
			rankInSection: `${sectionWiseReport.Rank} out of ${totalStudentsInSection}`,
			school: schoolName?.school,
			className: baselineRecord?.classRoomId?.className,
			section: baselineRecord?.classRoomId?.section,
		}

		if (schoolWiseReport) {
			data = { ...data, ...schoolWiseReport }
		} else if (classWiseReport) {
			data = { ...data, ...classWiseReport }
		} else if (sectionWiseReport) {
			data = { ...data, ...sectionWiseReport }
		} else {
			return res.status(400).json(new FailureResponse(globalConstants.messages.notFound))
		}
		delete data.Rank
		delete data.StudentData
		delete data.Total

		res.status(200).json({ baselineAnalyticsData: data })
	}

	async allSchoolsBaselineAnalytics(req, res) {
		const { error, academicYears } = await this.validateAndGetAYsAndPaginationData(req)
		if (error) {
			return res.status(200).json({ domainWisePercentagesOfEachSchool: [] })
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
			query.school = { $in: await BaselineRecord.distinct('school') }
		}

		const schoolDataFromPipeLine = await this.AllSchoolsAggregationPipeline(query)

		const rankedArray = this.assignRanks(schoolDataFromPipeLine, 'overallPercentageofSchools')

		return res.json({
			domainWisePercentagesOfEachSchool: rankedArray,
		})
	}

	async singleSchoolsBaselineAnalytics(req, res) {
		const { error, academicYears } = await this.validateAndGetAYsAndPaginationData(req)
		if (error) {
			return res.status(200).json({ domainWisePercentagesOfEachSchool: [] })
		}

		const { filter } = req.body
		const { schoolIds, classroomIds, section } = filter
		const query = {
			academicYear: { $in: academicYears },
			graduated: { $ne: true },
			exited: { $ne: true },
		}
		const groupingDataQuery = {
			...query,
		}

		if (filter && !filter.schoolIds) {
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.invalidSchoolIdProvided))
		}

		if (!req.user.isAdmin) {
			query.school = { $in: req.user.assignedSchools }
		} else {
			query.school = { $in: await BaselineRecord.distinct('school') }
		}

		if (schoolIds) {
			groupingDataQuery.school = new mongoose.Types.ObjectId(schoolIds)
		}
		if (classroomIds && classroomIds.length > 0) {
			groupingDataQuery.classRoomId = {
				$in: classroomIds.map((id) => new mongoose.Types.ObjectId(id)),
			}
		}

		const isSchoolExist = await Schools.findOne({
			_id: schoolIds,
		}).select('_id school scCode studentCountInSchool')
		if (isSchoolExist.length === 0) {
			return res.status(400).json(new FailureResponse(globalConstants.messages.invalidSchool))
		}
		const schoolDataFromPipeLine = await this.AllSchoolsAggregationPipeline(query)
		const rankedArray = this.assignRanks(schoolDataFromPipeLine, 'overallPercentageofSchools')
		const specificSchool = rankedArray.find(
			(school) => school.schoolId.toString() === isSchoolExist._id.toString(),
		)

		const insideSchoolData = await this.SpecificSchoolsAggregationPipeline(
			isSchoolExist._id,
			academicYears,
		)
		let insideSchool
		insideSchool = this.assignRanks(insideSchoolData, 'overallPercentageofClasses')
		if (classroomIds && classroomIds.length > 0) {
			insideSchool = insideSchool.filter((room) =>
				classroomIds.includes(room.classRoomId.toString()),
			)
		}

		const groupedData = await this.groupedDataPipeLine(groupingDataQuery)
		let domainWisePercentagesOfEachSections
		if (classroomIds?.length > 0) {
			// const classroomObjIds = classroomIds.map((id) => new mongoose.Types.ObjectId(id))

			const specificClassRoomData = await this.SpecificClassRoomPipeline(
				isSchoolExist._id,
				academicYears,
			)
			domainWisePercentagesOfEachSections = this.assignRanks(
				specificClassRoomData,
				'overallPercentageofSection',
			)
			if (section?.length > 0) {
				domainWisePercentagesOfEachSections = domainWisePercentagesOfEachSections.find(
					(c) => c?.classRoomId?.toString() === classroomIds[0].toString(),
				)
			}
		}

		// Get gender distribution of screened students
		const genderDistribution = await this.getGenderDistribution(groupingDataQuery)

		// Get class-wise distribution of screened students
		const classDistribution = await this.getClassDistribution(schoolIds, academicYears, classroomIds)

		// Calculate totalStrength by counting actual active students (same logic as getStudentsByScreeningStatus)
		// This ensures graph and popup show consistent counts
		const studentMatchQuery = {
			school: new mongoose.Types.ObjectId(schoolIds),
			graduated: { $ne: true },
			exited: { $ne: true },
		}

		let totalStrength
		if (classroomIds?.length > 0) {
			// Count unique students in selected classrooms
			const studentCountResult = await Students.aggregate([
				{ $match: studentMatchQuery },
				{ $unwind: '$studentsJourney' },
				{
					$match: {
						'studentsJourney.classRoomId': {
							$in: classroomIds.map((id) => new mongoose.Types.ObjectId(id)),
						},
					},
				},
				{
					$group: {
						_id: '$_id',
					},
				},
				{
					$count: 'total',
				},
			])
			totalStrength = studentCountResult[0]?.total ?? 0
		} else {
			// Count all active students in school
			totalStrength = await Students.countDocuments(studentMatchQuery)
		}

		return res.json({
			data: groupedData?.data ? groupedData?.data : {},
			domainWisePercentagesOfEachSchool: specificSchool,
			domainWisePercentagesOfEachClass: groupedData?.data ? insideSchool : [],
			domainWisePercentagesOfEachSections: groupedData?.data
				? domainWisePercentagesOfEachSections
				: [],
			totalStrength: totalStrength,
			schoolTotalStrength: isSchoolExist.studentCountInSchool ?? 0,
			studentsScreened: groupedData?.studentsScreened ?? 0,
			rogBreakup: groupedData?.rogBreakup ?? { red: 0, orange: 0, green: 0 },
			outOf: rankedArray.length,
			genderDistribution: genderDistribution,
			classDistribution: classDistribution,
		})
	}

	/**
	 * Returns list of students by screening status (screened or not screened)
	 * Uses same BaselineRecord query as groupedDataPipeLine for consistency with chart counts
	 */
	async getStudentsByScreeningStatus(req, res) {
		try {
			const { error, academicYears } = await this.validateAndGetAYsAndPaginationData(req)
			if (error) {
				return res.status(200).json({ students: [] })
			}

			const { filter, screeningStatus } = req.body
			const { schoolIds, classroomIds } = filter || {}

			if (!schoolIds) {
				return res.status(400).json({ error: 'School ID is required' })
			}

			// Handle schoolIds as array or string
			const schoolId = Array.isArray(schoolIds) ? schoolIds[0] : schoolIds

			// Build same query as groupedDataPipeLine for consistency with chart
			const baselineQuery = {
				academicYear: { $in: academicYears },
				graduated: { $ne: true },
				exited: { $ne: true },
				school: new mongoose.Types.ObjectId(schoolId),
			}

			if (classroomIds && classroomIds.length > 0) {
				baselineQuery.classRoomId = {
					$in: classroomIds.map((id) => new mongoose.Types.ObjectId(id)),
				}
			}

			if (screeningStatus === 'screened') {
				// Get baseline records with student details - same query as chart uses
				console.log('Screened query:', JSON.stringify(baselineQuery))
				const records = await BaselineRecord.find(baselineQuery)
					.populate('studentId', 'user_id studentName')
					.populate('classRoomId', 'className section')
					.lean()

				console.log('Baseline records found:', records.length)
				if (records.length > 0) {
					console.log('Sample record:', JSON.stringify(records[0]))
				}

				// Deduplicate by studentId (a student may have multiple baseline records)
				const uniqueStudents = new Map()
				records.forEach((r) => {
					if (r.studentId && !uniqueStudents.has(r.studentId._id.toString())) {
						uniqueStudents.set(r.studentId._id.toString(), {
							_id: r.studentId._id,
							user_id: r.studentId.user_id,
							studentName: r.studentId.studentName,
							className: r.classRoomId?.className || '-',
							section: r.classRoomId?.section || '-',
						})
					}
				})

				const students = Array.from(uniqueStudents.values())
				console.log('Unique students:', students.length)
				return res.json({ students, totalCount: students.length })
			} else {
				// Not screened: Get all students in school/classrooms, exclude those with baseline records

				// Get screened student IDs first
				const screenedRecords = await BaselineRecord.find(baselineQuery)
					.select('studentId')
					.lean()
				const screenedIds = new Set(screenedRecords.map((r) => r.studentId.toString()))

				// Get all active students (not graduated, not exited) in school
				// Status is at document level, not in journey
				const studentMatchQuery = {
					school: new mongoose.Types.ObjectId(schoolId),
					graduated: { $ne: true },
					exited: { $ne: true },
				}

				// If classroomIds provided, filter by classroom in journey
				let studentPipeline
				if (classroomIds?.length > 0) {
					studentPipeline = [
						{ $match: studentMatchQuery },
						{ $unwind: '$studentsJourney' },
						{
							$match: {
								'studentsJourney.classRoomId': {
									$in: classroomIds.map((id) => new mongoose.Types.ObjectId(id)),
								},
							},
						},
						{
							$lookup: {
								from: 'classrooms',
								localField: 'studentsJourney.classRoomId',
								foreignField: '_id',
								as: 'classroom',
							},
						},
						{ $unwind: { path: '$classroom', preserveNullAndEmptyArrays: true } },
						{
							$group: {
								_id: '$_id',
								user_id: { $first: '$user_id' },
								studentName: { $first: '$studentName' },
								className: { $first: '$classroom.className' },
								section: { $first: '$classroom.section' },
							},
						},
						{
							$project: {
								_id: 1,
								user_id: 1,
								studentName: 1,
								className: { $ifNull: ['$className', '-'] },
								section: { $ifNull: ['$section', '-'] },
							},
						},
					]
				} else {
					// No classroom filter - get all students in school with their latest classroom
					studentPipeline = [
						{ $match: studentMatchQuery },
						{
							$addFields: {
								latestJourney: { $arrayElemAt: ['$studentsJourney', -1] },
							},
						},
						{
							$lookup: {
								from: 'classrooms',
								localField: 'latestJourney.classRoomId',
								foreignField: '_id',
								as: 'classroom',
							},
						},
						{ $unwind: { path: '$classroom', preserveNullAndEmptyArrays: true } },
						{
							$project: {
								_id: 1,
								user_id: 1,
								studentName: 1,
								className: { $ifNull: ['$classroom.className', '-'] },
								section: { $ifNull: ['$classroom.section', '-'] },
							},
						},
					]
				}

				const allStudents = await Students.aggregate(studentPipeline)

				// Filter out screened students
				const notScreenedStudents = allStudents.filter(
					(s) => !screenedIds.has(s._id.toString())
				)

				return res.json({
					students: notScreenedStudents,
					totalCount: notScreenedStudents.length,
				})
			}
		} catch (err) {
			console.error('Get Students By Screening Status Error:', err)
			return res.status(500).json({ error: 'Internal Server Error' })
		}
	}

	/**
	 * Returns list of students by support level (red, orange, green)
	 * Red: Any domain score 0-3
	 * Orange: Any domain score 4-5 (but no domain is red)
	 * Green: All domains 6+
	 */
	async getStudentsBySupportLevel(req, res) {
		try {
			const { error, academicYears } = await this.validateAndGetAYsAndPaginationData(req)
			if (error) {
				return res.status(200).json({ students: [] })
			}

			const { filter, supportLevel } = req.body
			const { schoolIds, classroomIds } = filter || {}

			if (!schoolIds) {
				return res.status(400).json({ error: 'School ID is required' })
			}

			if (!supportLevel || !['red', 'orange', 'green'].includes(supportLevel)) {
				return res.status(400).json({ error: 'Valid support level (red, orange, green) is required' })
			}

			const schoolId = Array.isArray(schoolIds) ? schoolIds[0] : schoolIds

			// Build base query
			const baselineQuery = {
				academicYear: { $in: academicYears },
				graduated: { $ne: true },
				exited: { $ne: true },
				school: new mongoose.Types.ObjectId(schoolId),
			}

			if (classroomIds && classroomIds.length > 0) {
				baselineQuery.classRoomId = {
					$in: classroomIds.map((id) => new mongoose.Types.ObjectId(id)),
				}
			}

			// Aggregation pipeline with ROG classification (same logic as groupedDataPipeLine)
			const pipeline = [
				{ $match: baselineQuery },
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
								{ $and: [{ $gte: [{ $toInt: '$Physical.total' }, 4] }, { $lte: [{ $toInt: '$Physical.total' }, 5] }] },
								{ $and: [{ $gte: [{ $toInt: '$Social.total' }, 4] }, { $lte: [{ $toInt: '$Social.total' }, 5] }] },
								{ $and: [{ $gte: [{ $toInt: '$Emotional.total' }, 4] }, { $lte: [{ $toInt: '$Emotional.total' }, 5] }] },
								{ $and: [{ $gte: [{ $toInt: '$Cognitive.total' }, 4] }, { $lte: [{ $toInt: '$Cognitive.total' }, 5] }] },
								{ $and: [{ $gte: [{ $toInt: '$Language.total' }, 4] }, { $lte: [{ $toInt: '$Language.total' }, 5] }] },
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
				// Filter by requested support level
				{ $match: { rogCategory: supportLevel } },
				// Deduplicate by studentId
				{
					$group: {
						_id: '$studentId',
						classRoomId: { $first: '$classRoomId' },
						Physical: { $first: '$Physical.total' },
						Social: { $first: '$Social.total' },
						Emotional: { $first: '$Emotional.total' },
						Cognitive: { $first: '$Cognitive.total' },
						Language: { $first: '$Language.total' },
					},
				},
				// Lookup student details
				{
					$lookup: {
						from: 'students',
						localField: '_id',
						foreignField: '_id',
						as: 'student',
					},
				},
				{ $unwind: '$student' },
				// Lookup classroom details
				{
					$lookup: {
						from: 'classrooms',
						localField: 'classRoomId',
						foreignField: '_id',
						as: 'classroom',
					},
				},
				{ $unwind: { path: '$classroom', preserveNullAndEmptyArrays: true } },
				{
					$project: {
						_id: '$student._id',
						user_id: '$student.user_id',
						studentName: '$student.studentName',
						className: { $ifNull: ['$classroom.className', '-'] },
						section: { $ifNull: ['$classroom.section', '-'] },
						Physical: 1,
						Social: 1,
						Emotional: 1,
						Cognitive: 1,
						Language: 1,
					},
				},
				{ $sort: { studentName: 1 } },
			]

			const students = await BaselineRecord.aggregate(pipeline)

			return res.json({
				students,
				totalCount: students.length,
				supportLevel,
			})
		} catch (err) {
			console.error('Get Students By Support Level Error:', err)
			return res.status(500).json({ error: 'Internal Server Error' })
		}
	}

	/**
	 * Get gender distribution of screened students
	 */
	async getGenderDistribution(query) {
		const pipeline = [
			{ $match: query },
			{ $group: { _id: '$studentId' } }, // Deduplicate students
			{
				$lookup: {
					from: 'students',
					localField: '_id',
					foreignField: '_id',
					as: 'student',
				},
			},
			{ $unwind: '$student' },
			{
				$group: {
					_id: null,
					male: { $sum: { $cond: [{ $eq: ['$student.gender', 'Male'] }, 1, 0] } },
					female: { $sum: { $cond: [{ $eq: ['$student.gender', 'Female'] }, 1, 0] } },
				},
			},
		]
		const result = await BaselineRecord.aggregate(pipeline)
		return result[0] || { male: 0, female: 0 }
	}

	/**
	 * Get class-wise distribution of screened students
	 */
	async getClassDistribution(schoolId, academicYears, classroomIds) {
		const matchQuery = {
			school: new mongoose.Types.ObjectId(schoolId),
			academicYear: { $in: academicYears },
			graduated: { $ne: true },
			exited: { $ne: true },
		}
		if (classroomIds?.length > 0) {
			matchQuery.classRoomId = {
				$in: classroomIds.map((id) => new mongoose.Types.ObjectId(id)),
			}
		}

		const pipeline = [
			{ $match: matchQuery },
			{ $group: { _id: { classRoomId: '$classRoomId', studentId: '$studentId' } } },
			{ $group: { _id: '$_id.classRoomId', studentCount: { $sum: 1 } } },
			{
				$lookup: {
					from: 'classrooms',
					localField: '_id',
					foreignField: '_id',
					as: 'classroom',
				},
			},
			{ $unwind: '$classroom' },
			{
				$project: {
					classRoomId: '$_id',
					className: '$classroom.className',
					section: '$classroom.section',
					studentCount: 1,
					_id: 0,
				},
			},
			{ $sort: { className: 1, section: 1 } },
		]
		return BaselineRecord.aggregate(pipeline)
	}

	/**
	 * Get risk dashboard data - students with at least 1 red domain, sorted by severity
	 */
	async getRiskDashboardData(req, res) {
		try {
			const { error, academicYears } = await this.validateAndGetAYsAndPaginationData(req)
			if (error) {
				return res.status(200).json({ students: [], totalCount: 0 })
			}

			const { filter } = req.body
			const { schoolIds, classroomIds } = filter || {}

			if (!schoolIds) {
				return res.status(400).json({ error: 'School ID is required' })
			}

			const schoolId = Array.isArray(schoolIds) ? schoolIds[0] : schoolIds

			const matchQuery = {
				academicYear: { $in: academicYears },
				graduated: { $ne: true },
				exited: { $ne: true },
				school: new mongoose.Types.ObjectId(schoolId),
			}

			if (classroomIds?.length > 0) {
				matchQuery.classRoomId = {
					$in: classroomIds.map((id) => new mongoose.Types.ObjectId(id)),
				}
			}

			const pipeline = [
				{ $match: matchQuery },
				// Deduplicate by studentId
				{ $group: { _id: '$studentId', record: { $first: '$$ROOT' } } },
				{ $replaceRoot: { newRoot: '$record' } },
				// Calculate red domain count
				{
					$addFields: {
						redDomainCount: {
							$sum: [
								{ $cond: [{ $lte: [{ $toInt: '$Physical.total' }, 3] }, 1, 0] },
								{ $cond: [{ $lte: [{ $toInt: '$Social.total' }, 3] }, 1, 0] },
								{ $cond: [{ $lte: [{ $toInt: '$Emotional.total' }, 3] }, 1, 0] },
								{ $cond: [{ $lte: [{ $toInt: '$Cognitive.total' }, 3] }, 1, 0] },
								{ $cond: [{ $lte: [{ $toInt: '$Language.total' }, 3] }, 1, 0] },
							],
						},
						redDomains: {
							$filter: {
								input: [
									{ $cond: [{ $lte: [{ $toInt: '$Physical.total' }, 3] }, 'Physical', null] },
									{ $cond: [{ $lte: [{ $toInt: '$Social.total' }, 3] }, 'Social', null] },
									{ $cond: [{ $lte: [{ $toInt: '$Emotional.total' }, 3] }, 'Emotional', null] },
									{ $cond: [{ $lte: [{ $toInt: '$Cognitive.total' }, 3] }, 'Cognitive', null] },
									{ $cond: [{ $lte: [{ $toInt: '$Language.total' }, 3] }, 'Language', null] },
								],
								cond: { $ne: ['$$this', null] },
							},
						},
					},
				},
				// Only include students with at least 1 red domain
				{ $match: { redDomainCount: { $gte: 1 } } },
				// Lookup student details
				{
					$lookup: {
						from: 'students',
						localField: 'studentId',
						foreignField: '_id',
						as: 'student',
					},
				},
				{ $unwind: '$student' },
				// Lookup classroom details
				{
					$lookup: {
						from: 'classrooms',
						localField: 'classRoomId',
						foreignField: '_id',
						as: 'classroom',
					},
				},
				{ $unwind: '$classroom' },
				// Project final fields
				{
					$project: {
						_id: '$studentId',
						user_id: '$student.user_id',
						studentName: '$student.studentName',
						gender: '$student.gender',
						className: '$classroom.className',
						section: '$classroom.section',
						redDomainCount: 1,
						redDomains: 1,
						Physical: '$Physical.total',
						Social: '$Social.total',
						Emotional: '$Emotional.total',
						Cognitive: '$Cognitive.total',
						Language: '$Language.total',
					},
				},
				// Sort by red domain count (highest first), then by name
				{ $sort: { redDomainCount: -1, studentName: 1 } },
			]

			const students = await BaselineRecord.aggregate(pipeline)

			// Calculate summary counts
			const summary = {
				total: students.length,
				fiveRed: students.filter((s) => s.redDomainCount === 5).length,
				fourRed: students.filter((s) => s.redDomainCount === 4).length,
				threeRed: students.filter((s) => s.redDomainCount === 3).length,
				twoRed: students.filter((s) => s.redDomainCount === 2).length,
				oneRed: students.filter((s) => s.redDomainCount === 1).length,
			}

			return res.json({ students, totalCount: students.length, summary })
		} catch (err) {
			console.error('Get Risk Dashboard Data Error:', err)
			return res.status(500).json({ error: 'Internal Server Error' })
		}
	}

	/**
	 * Get detailed export data for Excel download
	 */
	async getDetailedExportData(req, res) {
		try {
			const { error, academicYears } = await this.validateAndGetAYsAndPaginationData(req)
			if (error) {
				return res.status(200).json({ students: [], summary: {} })
			}

			const { filter } = req.body
			const { schoolIds, classroomIds, gender, ageGroup, scoreRange, dateRange } = filter || {}

			if (!schoolIds) {
				return res.status(400).json({ error: 'School ID is required' })
			}

			const schoolId = Array.isArray(schoolIds) ? schoolIds[0] : schoolIds

			const matchQuery = {
				academicYear: { $in: academicYears },
				graduated: { $ne: true },
				exited: { $ne: true },
				school: new mongoose.Types.ObjectId(schoolId),
			}

			if (classroomIds?.length > 0) {
				matchQuery.classRoomId = {
					$in: classroomIds.map((id) => new mongoose.Types.ObjectId(id)),
				}
			}

			// Date range filter
			if (dateRange?.startDate && dateRange?.endDate) {
				matchQuery.createdAt = {
					$gte: new Date(dateRange.startDate),
					$lte: new Date(dateRange.endDate),
				}
			}

			const pipeline = [
				{ $match: matchQuery },
				// Deduplicate by studentId
				{ $group: { _id: '$studentId', record: { $first: '$$ROOT' } } },
				{ $replaceRoot: { newRoot: '$record' } },
				// Calculate scores and risk
				{
					$addFields: {
						totalScore: {
							$sum: [
								{ $toInt: '$Physical.total' },
								{ $toInt: '$Social.total' },
								{ $toInt: '$Emotional.total' },
								{ $toInt: '$Cognitive.total' },
								{ $toInt: '$Language.total' },
							],
						},
						redDomainCount: {
							$sum: [
								{ $cond: [{ $lte: [{ $toInt: '$Physical.total' }, 3] }, 1, 0] },
								{ $cond: [{ $lte: [{ $toInt: '$Social.total' }, 3] }, 1, 0] },
								{ $cond: [{ $lte: [{ $toInt: '$Emotional.total' }, 3] }, 1, 0] },
								{ $cond: [{ $lte: [{ $toInt: '$Cognitive.total' }, 3] }, 1, 0] },
								{ $cond: [{ $lte: [{ $toInt: '$Language.total' }, 3] }, 1, 0] },
							],
						},
					},
				},
				// Lookup student details
				{
					$lookup: {
						from: 'students',
						localField: 'studentId',
						foreignField: '_id',
						as: 'student',
					},
				},
				{ $unwind: '$student' },
				// Lookup classroom details
				{
					$lookup: {
						from: 'classrooms',
						localField: 'classRoomId',
						foreignField: '_id',
						as: 'classroom',
					},
				},
				{ $unwind: '$classroom' },
			]

			// Add gender filter if provided
			if (gender?.length > 0) {
				pipeline.push({
					$match: { 'student.gender': { $in: gender } },
				})
			}

			// Add age group filter if provided
			if (ageGroup) {
				const today = new Date()
				let minAge, maxAge
				switch (ageGroup) {
					case '3-5':
						minAge = 3
						maxAge = 5
						break
					case '6-8':
						minAge = 6
						maxAge = 8
						break
					case '9-12':
						minAge = 9
						maxAge = 12
						break
					case '13+':
						minAge = 13
						maxAge = 100
						break
				}
				if (minAge !== undefined) {
					const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate())
					const minDate = new Date(today.getFullYear() - maxAge - 1, today.getMonth(), today.getDate())
					pipeline.push({
						$match: {
							'student.dob': { $gte: minDate, $lte: maxDate },
						},
					})
				}
			}

			// Add score range filter if provided
			if (scoreRange?.min !== undefined && scoreRange?.max !== undefined) {
				pipeline.push({
					$match: {
						totalScore: { $gte: scoreRange.min, $lte: scoreRange.max },
					},
				})
			}

			// Project final fields
			pipeline.push({
				$project: {
					_id: '$studentId',
					user_id: '$student.user_id',
					studentName: '$student.studentName',
					gender: '$student.gender',
					dob: '$student.dob',
					className: '$classroom.className',
					section: '$classroom.section',
					Physical: '$Physical.total',
					Social: '$Social.total',
					Emotional: '$Emotional.total',
					Cognitive: '$Cognitive.total',
					Language: '$Language.total',
					totalScore: 1,
					redDomainCount: 1,
					baselineCategory: 1,
					createdAt: 1,
				},
			})

			// Sort by class, section, then name
			pipeline.push({ $sort: { className: 1, section: 1, studentName: 1 } })

			const students = await BaselineRecord.aggregate(pipeline)

			// Calculate summary statistics
			const summary = {
				totalStudents: students.length,
				maleCount: students.filter((s) => s.gender === 'Male').length,
				femaleCount: students.filter((s) => s.gender === 'Female').length,
				atRiskCount: students.filter((s) => s.redDomainCount >= 1).length,
				avgTotalScore: students.length > 0
					? (students.reduce((sum, s) => sum + s.totalScore, 0) / students.length).toFixed(2)
					: 0,
				rogBreakup: {
					red: students.filter((s) => s.redDomainCount >= 1).length,
					orange: students.filter((s) => s.redDomainCount === 0 && s.totalScore < 30).length,
					green: students.filter((s) => s.redDomainCount === 0 && s.totalScore >= 30).length,
				},
			}

			// Get at-risk students for separate sheet
			const atRiskStudents = students
				.filter((s) => s.redDomainCount >= 1)
				.sort((a, b) => b.redDomainCount - a.redDomainCount)

			return res.json({ students, summary, atRiskStudents })
		} catch (err) {
			console.error('Get Detailed Export Data Error:', err)
			return res.status(500).json({ error: 'Internal Server Error' })
		}
	}
}

module.exports.baselineAnalyticService = new BaselineAnalyticService()
