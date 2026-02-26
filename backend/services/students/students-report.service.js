const { mongoose } = require('mongoose')
const { CommonHelperServices } = require('../common-services/common-helper-service')
const { FailureResponse } = require('../../models/response/globalResponse')
const { cacheService } = require('../../cache/cashe.service')
const { IndividualRecord } = require('../../models/database/myPeegu-individual')
const { BaselineRecord } = require('../../models/database/myPeegu-baseline')
const { EducationPlanner } = require('../../models/database/myPeegu-studentPlanner')
const { COLORS, months } = require('../../utility/localConstants')

class StudentReportService extends CommonHelperServices {
	async fetchStudentsReport(req, res) {
		try {
			const { error, message, school, academicYear } = await this.validateUserSchoolAndAY(req)
			if (error) {
				return res.status(400).json(new FailureResponse(message))
			}

			// Fetch student and classroom list as well as map data of the list
			const studentClassroomResult = await this.fetchStudentAndClassroomsData(req.body)
			if (!studentClassroomResult.students.length) {
				return res.status(200).json([])
			}

			// Construct Query to fetch data from
			const { classroomIds } = req.body
			let query = { academicYear: academicYear._id }
			if (classroomIds.length) {
				query.classRoomId = {
					$in: classroomIds.map((id) => new mongoose.Types.ObjectId(id)),
				}
			} else {
				query.school = new mongoose.Types.ObjectId(school._id)
			}

			// Fetch Individualcase records/data of students IndividualRecord, BaselineRecord, StudentCheckList and EducationPlanner
			const individualcaseData = await this.fetchStudentInitiationsData(
				query,
				IndividualRecord,
				true,
			)
			if (!individualcaseData.listData.length) { 
				return res.status(200).json([])
			}

			// Fetch Baseline records/data of students
			const baselineData = await this.fetchStudentInitiationsData(query, BaselineRecord)

			// Fetch IEP records/data of students
			const iepData = await this.fetchStudentInitiationsData(query, EducationPlanner)

			const studentsMap = studentClassroomResult.studentsMapData
			const classroomMap = studentClassroomResult.classroomsMapData
			const baselineMap = baselineData.mapData
			const iepMap = iepData.mapData

			const finalData = []
			for (let i = 0; i < individualcaseData.listData.length; i++) {
				const individualData = individualcaseData.listData[i]
				const studentId = individualData.studentId.toString()
				const student = studentsMap.get(studentId)
				const classroom = classroomMap.get(individualData.classRoomId.toString())
				const baseline = baselineMap.get(studentId)
				const iep = iepMap.get(studentId)

				const { allCategoryColors, colorCode } =
					this.getColorForAllCategoriesOfBaseline(baseline)

				const [Physical, Social, Emotional, Cognitive, Language] = allCategoryColors

				if (!student) {
					console.log(student)
				}

				const data = {
					name: student.studentName,
					class: classroom.className,
					section: classroom.section,
					monthOfReferral: individualData.firstSesstionCreatedDate
						? months[new Date(individualData.firstSesstionCreatedDate).getMonth()]?.name
						: 'n.a.',
					type: individualData.stype,
					codeColor: colorCode,
					numberOfSessions: individualData.numberOfSessions,
					concerns: individualData.issues,
					goals: individualData.goals,
					reportLink: iep && iep.Evolution ? iep.Evolution.reportLink : 'n.a.',
					physicalColor: Physical,
					socialColor: Social,
					emotionalColor: Emotional,
					cognitiveColor: Cognitive,
					languageColor: Language,
					requirement1: iep && iep.Evolution ? iep.Evolution.requirement : 'n.a.',
					availability: iep && iep.Evolution ? iep.Evolution.availability : 'n.a.',
					diagnosis:
						iep && iep.Evolution
							? iep.Evolution.diagnosis.length
								? iep.Evolution.diagnosis[0]
								: 'n.a.'
							: 'n.a.',
					requirement2:
						iep && iep.AccommodationFromBoard
							? iep.AccommodationFromBoard.requirement
							: 'n.a.',
					certificate:
						iep && iep.AccommodationFromBoard
							? iep.AccommodationFromBoard.certificate
							: 'n.a.',
					approval:
						iep && iep.AccommodationFromBoard
							? iep.AccommodationFromBoard.approvalfromRegionalOffice
							: 'n.a.',
					requirement3:
						iep && iep.AccommodationInternal
							? iep.AccommodationInternal.requirement
							: 'n.a.',
					specialEducation:
						iep && iep.AccommodationInternal
							? iep.AccommodationInternal.specialEducationClasses
							: 'n.a.',
					behavioralInterventions:
						iep && iep.AccommodationInternal
							? iep.AccommodationInternal.behavioralInterventions.value
							: 'n.a.',
					oneOnOne:
						iep && iep.AccommodationInternal
							? iep.AccommodationInternal.oneToOneWithHRT_CT.value
							: 'n.a.',
					focusClasses:
						iep && iep.AccommodationInternal
							? iep.AccommodationInternal.focusClasses.value
							: 'n.a.',
				}
				finalData.push(data)
			}
			return res.status(200).json(finalData)
		} catch (error) {
			console.log(error)
			return res.status(error?.status ?? 500).json(new FailureResponse(error.message))
		}
	}

	async fetchStudentAndClassroomsData({ academicYear, school, classroomIds }) {
		// Fetch all students from Cache
		const allStudents = await cacheService.students
		// Fetch all classrooms from Cache
		const allClassrooms = await cacheService.classrooms

		let students = []
		let classrooms = []
		if (classroomIds && classroomIds.length) {
			const classroomIdsSet = new Set(classroomIds)
			//Filter students with given classroomIds
			students = allStudents.filter((student) =>
				student.studentsJourney.some(
					(j) =>
						j.academicYear.toString() === academicYear &&
						classroomIdsSet.has(j.classRoomId.toString()),
				),
			)

			//Filter classrooms with given classroomIds and academic year
			classrooms = allClassrooms.filter((obj) => {
				return (
					classroomIds.includes(obj._id.toString()) &&
					obj.academicYear.toString() === academicYear
				)
			})
		} else {
			//Filter students with given school id
			students = allStudents.filter((obj) => {
				return obj.school.toString() === school
			})

			//Filter classrooms with given school id and academic year
			classrooms = allClassrooms.filter((obj) => {
				return (
					obj.school.toString() === school && obj.academicYear.toString() === academicYear
				)
			})
		}

		return {
			students,
			studentsMapData: this.getMapData(students, '_id'),
			classrooms,
			classroomsMapData: this.getMapData(classrooms, '_id'),
		}
	}

	/**
	 * Get the latest record for each student with session count
	 * @returns {Promise<Array>} Array of latest student records with numberOfSessions
	 */
	async fetchStudentInitiationsData(query, Model, isSessionCount = false) {
		try {
			const pipeline = [
				{ $match: query },
				// Sort by studentId and createdAt (descending) to get latest first
				{
					$sort: {
						studentId: 1,
						createdAt: -1,
					},
				},

				// Group by studentId to get latest record and count sessions
				{
					$group: {
						_id: '$studentId',
						latestRecord: { $first: '$$ROOT' },
						...(isSessionCount ? { oldestRecord: { $last: '$$ROOT' } } : {}),
						numberOfSessions: { $sum: 1 },
					},
				},

				// Replace root with the latest record and add numberOfSessions
				{
					$replaceRoot: {
						newRoot: {
							$mergeObjects: [
								'$latestRecord',
								...(isSessionCount
									? [
											{
												numberOfSessions: `$numberOfSessions`,
												firstSesstionCreatedDate: '$oldestRecord.date',
											},
										]
									: []),
							],
						},
					},
				},

				// Optional: Sort by student name for consistent ordering
				{
					$sort: {
						studentName: 1,
					},
				},
			]

			const results = await Model.aggregate(pipeline)

			return { listData: results, mapData: this.getMapData(results, 'studentId') }
		} catch (error) {
			console.log(error)
			throw new Error(`Error fetching latest records: ${error.message}`)
		}
	}

	getMapData(list, key) {
		let mapData = new Map()
		if (list.length) {
			for (const data of list) {
				mapData.set(data[key].toString(), data)
			}
		}

		return mapData
	}

	getColorForSingleCategoryBaseline(total) {
		let color
		if (total > 5) {
			color = COLORS.GREEN
		} else if (total > 3 && total <= 5) {
			color = COLORS.ORANGE
		} else {
			color = COLORS.RED
		}
		return color
	}

	getColorForAllCategoriesOfBaseline(baseline) {
		if (!baseline) {
			return { allCategoryColors: ['NA', 'NA', 'NA', 'NA', 'NA'], colorCode: 'NA' }
		}
		let colorCode = ''
		const allCategoryColors = [
			this.getColorForSingleCategoryBaseline(baseline.Physical.total),
			this.getColorForSingleCategoryBaseline(baseline.Social.total),
			this.getColorForSingleCategoryBaseline(baseline.Emotional.total),
			this.getColorForSingleCategoryBaseline(baseline.Cognitive.total),
			this.getColorForSingleCategoryBaseline(baseline.Language.total),
		]

		if (allCategoryColors.includes(COLORS.RED)) {
			colorCode = COLORS.RED
		} else if (allCategoryColors.includes(COLORS.ORANGE)) {
			colorCode = COLORS.ORANGE
		} else {
			colorCode = COLORS.GREEN
		}

		return { allCategoryColors, colorCode }
	}
}

const studentReportService = new StudentReportService()
module.exports.studentReportService = studentReportService
