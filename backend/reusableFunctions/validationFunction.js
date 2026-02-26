const { Classrooms } = require('../models/database/myPeegu-classroom')
const { Schools } = require('../models/database/myPeegu-school')
const { StudentCheckList } = require('../models/database/myPeegu-sendCheckList')
const { COPEAssessment } = require('../models/database/myPeegu-studentCOPEAssessment')
const { WellBeingAssessment } = require('../models/database/myPeegu-StudentWellBeing')
const { Teacher } = require('../models/database/myPeegu-teacher')

async function validateInputs(schoolId, selectedClass, studentIds, academicYear) {
	const errors = []
	if (!schoolId || !selectedClass || !Array.isArray(studentIds)) {
		errors.push(globalConstants.messages.missingOrInvalidParameter)
	} else {
		const currentSchool = await Schools.findOne({
			_id: schoolId,
		}).select('school')
		if (!currentSchool) {
			errors.push(globalConstants.messages.invalidSchool)
		} else {
			const isCurrentClassExist = await Classrooms.findOne({
				school: schoolId,
				academicYear: academicYear,
				className: selectedClass,
			}).select('school className')

			if (!isCurrentClassExist) {
				errors.push(globalConstants.messages.currentClassDoesNotExist)
			}
		}
	}

	return errors
}

module.exports.validateInputs = validateInputs

async function changeSchoolName(schoolId) {
	try {
		// New school name to update
		const school = await Schools.findById(schoolId) // Assuming you have a School model
		const newSchoolName = school?.school // Assuming the school name is stored in the `school` field

		if (!newSchoolName) {
			throw new Error(globalConstants.messages.schoolNameNotFound)
		}

		// 1. Update `StudentCheckList` collection
		await StudentCheckList.updateMany(
			{ school: schoolId },
			{ $set: { schoolName: newSchoolName } },
		)

		// 2. Update `COPEAssessment` collection
		await COPEAssessment.updateMany(
			{ school: schoolId },
			{ $set: { schoolName: newSchoolName } },
		)

		// 3. Update `WellBeingAssessment` collection
		await WellBeingAssessment.updateMany(
			{ school: schoolId },
			{ $set: { schoolName: newSchoolName } },
		)

		// 3. Update `Teacher` collection
		await Teacher.updateMany(
			{ SchoolId: schoolId },
			{ $set: { schoolName: newSchoolName } },
		)

		// 4. Update `Teacher` collection
		await Teacher.updateMany({ SchoolId: schoolId }, { $set: { schoolName: newSchoolName } })

	} catch (error) {
		throw new Error(globalConstants.messages.failedToUpdateSchoolName)
	}
}

module.exports.changeSchoolName = changeSchoolName
