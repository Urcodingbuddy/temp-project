const { BaselineRecord } = require('../../models/database/myPeegu-baseline')
const { Classrooms } = require('../../models/database/myPeegu-classroom')
const { IndividualRecord } = require('../../models/database/myPeegu-individual')
const { ObservationRecord } = require('../../models/database/myPeegu-observation')
const { StudentCheckList } = require('../../models/database/myPeegu-sendCheckList')
const { COPEAssessment } = require('../../models/database/myPeegu-studentCOPEAssessment')
const { EducationPlanner } = require('../../models/database/myPeegu-studentPlanner')
const { WellBeingAssessment } = require('../../models/database/myPeegu-StudentWellBeing')
const { SchoolAcademicYears } = require('../../models/database/school-academic-years')
const { studentStatus } = require('../../utility/constants')
const { GlobalServices } = require('../global-service')
const utils = require('../../utility/utils')
const mongoose = require('mongoose')
const { ACTIONS } = require('../../utility/localConstants')

class StudentHelperService extends GlobalServices {
	// Helper to get latest journey per academic year
	getLatestJourneyPerAY(journeys) {
		const ayJourneyMap = new Map()
		for (const jrny of journeys) {
			const key = jrny.academicYear?.toString()
			const existing = ayJourneyMap.get(key)
			if (!existing || new Date(jrny.dateTime) > new Date(existing.dateTime)) {
				ayJourneyMap.set(key, jrny)
			}
		}
		return Array.from(ayJourneyMap.values())
	}

	// Helper to get unique latest journey per classroom
	getLatestJourneyPerClassroom(journeys) {
		const uniqMap = new Map()
		for (const jrny of journeys) {
			const key = jrny.classRoomId?.toString()
			if (key) uniqMap.set(key, jrny) // Always overwrite to get latest
		}
		return uniqMap
	}

	// Helper to increment Map values
	incrementCountMap(map, key) {
		if (key) map.set(key, (map.get(key) || 0) + 1)
	}

	// Helper to prepare bulkWrite operations
	prepareBulkOps(countMap, model, increment) {
		return Array.from(countMap.entries()).map(([id, count]) => ({
			updateOne: {
				filter: { _id: id },
				update: { $inc: { studentCount: increment * count } },
			},
		}))
	}

	/**
	 * This function will use students data, action type to add or reduce studentCount in classrooms and SAY.
	 * Incase of delete students this will loop through each student journey and reduce studentCount in classrooms and SAYs.
	 *
	 * @param {_id, studentJourney, fromClassroom, toClassroom, fromSAY, toSAY} students
	 * @param {Delete or add or update} actionType
	 * @param {mongodb transaction session} session
	 */
	async modifyStudentsCountInClassAndSAY(students, actionType) {
		const classDelMap = new Map()
		const classAddMap = new Map()
		const SAYAddMap = new Map()
		const SAYDelMap = new Map()

		for (const student of students) {
			if (actionType === ACTIONS.DELETE) {
				const latestPerAY = this.getLatestJourneyPerAY(student.studentsJourney)
				const latestPerClassroom = this.getLatestJourneyPerClassroom(latestPerAY)
				for (const jrny of latestPerClassroom.values()) {
					this.incrementCountMap(classDelMap, jrny.classRoomId?.toString())
					this.incrementCountMap(SAYDelMap, jrny.SAY?.toString())
				}
			} else if (actionType === ACTIONS.ADD) {
				this.incrementCountMap(classAddMap, student.toClassroom?._id?.toString())
				this.incrementCountMap(SAYAddMap, student.toClassroom?.SAY?.toString())
			} else if (actionType === ACTIONS.UPDATE) {
				this.incrementCountMap(classDelMap, student.fromClassroom?._id?.toString())
				this.incrementCountMap(classAddMap, student.toClassroom?._id?.toString())
				this.incrementCountMap(SAYDelMap, student.fromClassroom?.SAY?.toString())
				this.incrementCountMap(SAYAddMap, student.toClassroom?.SAY?.toString())
			}
		}

		const allOps = [
			{ ops: this.prepareBulkOps(classAddMap, Classrooms, 1), model: Classrooms },
			{ ops: this.prepareBulkOps(classDelMap, Classrooms, -1), model: Classrooms },
			{
				ops: this.prepareBulkOps(SAYAddMap, SchoolAcademicYears, 1),
				model: SchoolAcademicYears,
			},
			{
				ops: this.prepareBulkOps(SAYDelMap, SchoolAcademicYears, -1),
				model: SchoolAcademicYears,
			},
		]

		for (const { ops, model } of allOps) {
			if (ops.length) await model.bulkWrite(ops)
		}
	}

	buildStudentQuery(req) {
		const query = { status: miscellaneous.studentStatus.Active }

		if (!req.user.isAdmin) {
			query.school = { $in: req.user.assignedSchools }
		}

		const filter = req.body.filter
		if (filter) {
			switch (filter.studentStatus) {
				case studentStatus.graduated:
					query.graduated = true
					break
				case studentStatus.exited:
					query.exited = true
					break
				case studentStatus.active:
					query.exited = false
					query.graduated = false
					break
			}

			if (utils.isAValidArray(filter.schoolIds)) {
				query.school = {
					$in: filter.schoolIds.map((id) => new mongoose.Types.ObjectId(id)),
				}
			}

			if (utils.isAValidArray(filter.classroomIds)) {
				query.classRoomId = {
					$in: filter.classroomIds.map((id) => new mongoose.Types.ObjectId(id)),
				}
			}
		}

		return query
	}

	buildSearchQuery(searchText) {
		if (searchText && searchText.length > 2) {
			return utils.buildSearchQuery(searchText, [
				'studentName',
				'user_id',
				'regNo',
				'school.school',
			])
		}
		return {}
	}

	buildAggregationPipeline(query, searchQuery, sortOptions, skip, PAGE_SIZE) {
		return [
			{ $match: query },
			{
				$lookup: {
					from: 'schools',
					localField: 'school',
					foreignField: '_id',
					as: 'school',
				},
			},
			{ $unwind: '$school' },
			...(Object.keys(searchQuery).length ? [{ $match: searchQuery }] : []),
			{
				$lookup: {
					from: 'classrooms',
					localField: 'classRoomId',
					foreignField: '_id',
					as: 'classRoom',
				},
			},
			{ $unwind: '$classRoom' },
			{
				$project: {
					school: {
						_id: '$school._id',
						school: '$school.school',
						logoUrl: '$school.logoUrl',
					},
					classRoomId: 1,
					className: '$classRoom.className',
					section: '$classRoom.section',
					user_id: 1,
					studentName: 1,
					regNo: 1,
					regDate: 1,
					nationality: 1,
					dob: 1,
					gender: 1,
					bloodGrp: 1,
					graduated: 1,
					exited: 1,
					phone: 1,
					email: 1,
					fatherName: 1,
					motherName: 1,
					newStudent: 1,
					profilePicture: 1,
					profilePicUrl: 1,
					status: 1,
					academicYear: 1,
					studentsJourney: 1,
				},
			},
			{ $sort: Object.keys(sortOptions).length ? sortOptions : { _id: 1 } },
			{ $skip: skip },
			{ $limit: PAGE_SIZE },
		]
	}

	buildCountPipeline(query, searchQuery) {
		return [
			{ $match: query },
			{
				$lookup: {
					from: 'schools',
					localField: 'school',
					foreignField: '_id',
					as: 'school',
				},
			},
			{ $unwind: '$school' },
			...(Object.keys(searchQuery).length ? [{ $match: searchQuery }] : []),
			{
				$lookup: {
					from: 'classrooms',
					localField: 'classRoomId',
					foreignField: '_id',
					as: 'classRoom',
				},
			},
			{ $unwind: '$classRoom' },
			{ $count: 'count' },
		]
	}

	mapStudentDataToSchema(jsonData, returnMapping = false) {
		const mapping = {
			'Student ID': 'user_id',
			Classroom: 'className',
			Section: 'section',
			'Student Name': 'studentName',
			Reg_no: 'regNo',
			Reg_date: 'regDate',
			Nationality: 'nationality',
			DOB: 'dob',
			Gender: 'gender',
			Blood_group: 'bloodGrp',
			'Father Name': 'fatherName',
			'Mother Name': 'motherName',
			Email: 'email',
			Phone_no: 'phone',
			'Academic Year': 'academicYear',
		}

		const mappedData = {}

		for (const key in mapping) {
			const schemaField = mapping[key]
			const jsonValue = jsonData[key]

			if (jsonValue !== undefined) {
				mappedData[schemaField] = jsonValue
			}
		}
		if (returnMapping) return mapping
		return mappedData
	}

	async updateGraduateExitInStudentData(studentIds, actionType, academicYear) {
		if (!actionType || !studentIds || studentIds.length === 0 || !academicYear) {
			return
		}
		let academicYearId = academicYear

		// Convert string to ObjectId if needed
		if (typeof academicYear === 'string') {
			if (academicYear.length === 24 && mongoose.Types.ObjectId.isValid(academicYear)) {
				academicYearId = new mongoose.Types.ObjectId(academicYear)
			} else {
				console.warn('Invalid academicYear string passed. Skipping update.')
				return
			}
		} else if (!(academicYear instanceof mongoose.Types.ObjectId)) {
			console.warn('Invalid academicYear format. Must be ObjectId or valid 24-char string.')
			return
		}

		const filter = {
			studentId: { $in: studentIds },
			graduated: { $ne: true },
			exited: { $ne: true },
			academicYear: academicYearId,
		}

		const update = {}
		if (actionType === ACTIONS.GRADUATE) {
			update['graduated'] = true
		} else if (actionType === ACTIONS.EXIT) {
			update['exited'] = true
		}

		await ObservationRecord.updateMany(filter, { $set: update })
		await IndividualRecord.updateMany(filter, { $set: update })
		await BaselineRecord.updateMany(filter, { $set: update })
		await EducationPlanner.updateMany(filter, { $set: update })
		await StudentCheckList.updateMany(filter, { $set: update })
		await COPEAssessment.updateMany(filter, { $set: update })
		await WellBeingAssessment.updateMany(filter, { $set: update })
	}
}

module.exports.StudentHelperService = StudentHelperService
