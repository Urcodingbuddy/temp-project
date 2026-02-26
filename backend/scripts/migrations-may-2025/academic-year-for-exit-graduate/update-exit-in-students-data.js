const mongoose = require('mongoose')
const { Students } = require('../../../models/database/myPeegu-student')
const { ObservationRecord } = require('../../../models/database/myPeegu-observation')
const { IndividualRecord } = require('../../../models/database/myPeegu-individual')
const { BaselineRecord } = require('../../../models/database/myPeegu-baseline')
const { EducationPlanner } = require('../../../models/database/myPeegu-studentPlanner')
const { StudentCheckList } = require('../../../models/database/myPeegu-sendCheckList')
const { COPEAssessment } = require('../../../models/database/myPeegu-studentCOPEAssessment')
const { WellBeingAssessment } = require('../../../models/database/myPeegu-StudentWellBeing')
const { filter } = require('lodash')

const { MONGODB_URI } = require('../migrations-utils')

async function runMigration() {
	console.log('Migration started...')
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to MongoDB')

	const students = await Students.find({ $or: [{ exited: true }] }).lean()
	const studentIds = students.map((student) => student._id)
	if (students.length === 0) {
		console.log('No students found')
		return
	}

	const observationRecords = await ObservationRecord.find({
		studentId: { $in: studentIds },
	}).lean()
	const individualRecords = await IndividualRecord.find({ studentId: { $in: studentIds } }).lean()
	const baselineRecords = await BaselineRecord.find({ studentId: { $in: studentIds } }).lean()
	const educationPlanner = await EducationPlanner.find({ studentId: { $in: studentIds } }).lean()
	const studentCheckList = await StudentCheckList.find({ studentId: { $in: studentIds } }).lean()
	const copeAssessments = await COPEAssessment.find({ studentId: { $in: studentIds } }).lean()
	const wellBeingAssessments = await WellBeingAssessment.find({
		studentId: { $in: studentIds },
	}).lean()

	const observationRecordsBulkOperations = []
	const individualRecordsBulkOperations = []
	const baselineRecordsBulkOperations = []
	const educationPlannerBulkOperations = []
	const studentCheckListBulkOperations = []
	const copeAssessmentsBulkOperations = []
	const wellBeingAssessmentsBulkOperations = []

	console.log('--------Loop started--------')
	for (const student of students) {
		if (student.exited) {
			let updateData = {}
			if (student.exited) {
				updateData['exited'] = true
			}

			// ---------- Observation ---------------
			for (const observation of observationRecords) {
				if (
					observation.studentId &&
					observation.academicYear &&
					student.exitedAcademicYear &&
					observation.studentId.toString() === student._id.toString() &&
					observation.academicYear.toString() === student.exitedAcademicYear.toString()
				) {
					observationRecordsBulkOperations.push({
						updateOne: {
							filter: { _id: observation._id },
							update: {
								$set: updateData,
							},
						},
					})
				}
			}

			// ---------- Individual Case ---------------
			for (const individualCase of individualRecords) {
				if (
					individualCase.studentId &&
					individualCase.academicYear &&
					student.exitedAcademicYear &&
					individualCase.studentId.toString() === student._id.toString() &&
					individualCase.academicYear.toString() ===
						student.exitedAcademicYear.toString()
				) {
					individualRecordsBulkOperations.push({
						updateOne: {
							filter: { _id: individualCase._id },
							update: {
								$set: updateData,
							},
						},
					})
				}
			}

			// ---------- Baseline ---------------
			for (const baseline of baselineRecords) {
				if (
					baseline.studentId &&
					baseline.academicYear &&
					student.exitedAcademicYear &&
					baseline.studentId.toString() === student._id.toString() &&
					baseline.academicYear.toString() === student.exitedAcademicYear.toString()
				) {
					baselineRecordsBulkOperations.push({
						updateOne: {
							filter: { _id: baseline._id },
							update: {
								$set: updateData,
							},
						},
					})
				}
			}

			// ---------- Education Planner ---------------
			for (const EP of educationPlanner) {
				if (
					EP.studentId &&
					EP.academicYear &&
					student.exitedAcademicYear &&
					EP.studentId.toString() === student._id.toString() &&
					EP.academicYear.toString() === student.exitedAcademicYear.toString()
				) {
					educationPlannerBulkOperations.push({
						updateOne: {
							filter: { _id: EP._id },
							update: {
								$set: updateData,
							},
						},
					})
				}
			}

			// ---------- Student CheckList ---------------
			for (const checklist of studentCheckList) {
				if (
					checklist.studentId &&
					checklist.academicYear &&
					student.exitedAcademicYear &&
					checklist.studentId.toString() === student._id.toString() &&
					checklist.academicYear.toString() === student.exitedAcademicYear.toString()
				) {
					studentCheckListBulkOperations.push({
						updateOne: {
							filter: { _id: checklist._id },
							update: {
								$set: updateData,
							},
						},
					})
				}
			}

			// ---------- Cope Assessments ---------------
			for (const cope of copeAssessments) {
				if (
					cope.studentId &&
					cope.academicYear &&
					student.exitedAcademicYear &&
					cope.studentId.toString() === student._id.toString() &&
					cope.academicYear.toString() === student.exitedAcademicYear.toString()
				) {
					copeAssessmentsBulkOperations.push({
						updateOne: {
							filter: { _id: cope._id },
							update: {
								$set: updateData,
							},
						},
					})
				}
			}

			// ---------- Well Being Assessments ---------------
			for (const SWB of wellBeingAssessments) {
				if (
					SWB.studentId &&
					SWB.academicYear &&
					student.exitedAcademicYear &&
					SWB.studentId.toString() === student._id.toString() &&
					SWB.academicYear.toString() === student.exitedAcademicYear.toString()
				) {
					wellBeingAssessmentsBulkOperations.push({
						updateOne: {
							filter: { _id: SWB._id },
							update: {
								$set: updateData,
							},
						},
					})
				}
			}
		}
	}

	console.log('observationRecords --------->', observationRecordsBulkOperations.length)
	if (observationRecordsBulkOperations.length > 0) {
		const result = await ObservationRecord.bulkWrite(observationRecordsBulkOperations)
		console.log(result)
	}

	console.log('individualRecords --------->', individualRecordsBulkOperations.length)
	if (individualRecordsBulkOperations.length > 0) {
		const result = await IndividualRecord.bulkWrite(individualRecordsBulkOperations)
		console.log(result)
	}

	console.log('baselineRecords --------->', baselineRecordsBulkOperations.length)
	if (baselineRecordsBulkOperations.length > 0) {
		const result = await BaselineRecord.bulkWrite(baselineRecordsBulkOperations)
		console.log(result)
	}

	console.log('educationPlanner --------->', educationPlannerBulkOperations.length)
	if (educationPlannerBulkOperations.length > 0) {
		const result = await EducationPlanner.bulkWrite(educationPlannerBulkOperations)
		console.log(result)
	}

	console.log('studentCheckList --------->', studentCheckListBulkOperations.length)
	if (studentCheckListBulkOperations.length > 0) {
		const result = await StudentCheckList.bulkWrite(studentCheckListBulkOperations)
		console.log(result)
	}

	console.log('copeAssessments --------->', copeAssessmentsBulkOperations.length)
	if (copeAssessmentsBulkOperations.length > 0) {
		const result = await COPEAssessment.bulkWrite(copeAssessmentsBulkOperations)
		console.log(result)
	}

	console.log('wellBeingAssessments --------->', wellBeingAssessmentsBulkOperations.length)
	if (wellBeingAssessmentsBulkOperations.length > 0) {
		const result = await WellBeingAssessment.bulkWrite(wellBeingAssessmentsBulkOperations)
		console.log(result)
	}

	await mongoose.disconnect()
	console.log('Migration completed')
}

runMigration().catch((err) => {
	console.error('Migration failed:', err)
	process.exit(1)
})
