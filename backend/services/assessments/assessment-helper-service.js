const { default: mongoose } = require('mongoose')
const { IRIForSchools } = require('../../models/database/IRI-for-schools')
const { IRIForTeachers } = require('../../models/database/IRI-for-teachers')
const { ProfilingForSchools } = require('../../models/database/profiling-for-shools')
const { ProfilingForTeachers } = require('../../models/database/profiling-for-teachers')
const { STATUSES } = require('../../utility/localConstants')
const { GlobalServices } = require('../global-service')

class AssessmentHelperService extends GlobalServices {
	/**
	 * This function will update the count of total, pending and submitted count in ProfilingForSchools or IRIForSchools
	 * By getting and looping through ProfilingForTeachers or IRIForTeachers of given active ProfilingForSchools or IRIForSchools
	 *
	 * @param {*} ModelForSchool - ProfilingForSchools or IRIForSchools
	 * @param {*} ModelForTeacher - ProfilingForTeachers or IRIForTeachers
	 * @param {*} foreignKey - Ids keys
	 * @param {*} schools - active ProfilingForSchools or IRIForSchools records
	 */
	async updateCountsForSchools({ ModelForSchool, ModelForTeacher, foreignKey, schools }) {
		const bulkOps = []

		for (const school of schools) {
			const schoolId = school._id

			// Use counts instead of fetching all docs
			const total = await ModelForTeacher.countDocuments({ [foreignKey]: schoolId })
			const pending = await ModelForTeacher.countDocuments({
				[foreignKey]: schoolId,
				formStatus: STATUSES.PENDING,
			})
			const submitted = await ModelForTeacher.countDocuments({
				[foreignKey]: schoolId,
				formStatus: STATUSES.SUBMITTED,
			})

			bulkOps.push({
				updateOne: {
					filter: { _id: schoolId },
					update: {
						$set: {
							totalTeacherCount: total,
							pendingTeacherCount: pending,
							submittedTeacherCount: submitted,
						},
					},
				},
			})
		}

		if (bulkOps.length > 0) {
			await ModelForSchool.bulkWrite(bulkOps)
		}
	}

	async updateProfilingForSchools(schoolProfilings) {
		return this.updateCountsForSchools({
			ModelForSchool: ProfilingForSchools,
			ModelForTeacher: ProfilingForTeachers,
			foreignKey: 'schoolProfilingId',
			schools: schoolProfilings,
		})
	}

	async updateIRIForSchools(schoolIRIs) {
		return this.updateCountsForSchools({
			ModelForSchool: IRIForSchools,
			ModelForTeacher: IRIForTeachers,
			foreignKey: 'schoolIRIId',
			schools: schoolIRIs,
		})
	}

	async getActiveProfilingsForSchools(schoolIds) {
		const curAcademicYear = await this.getCurrentAcademicYear()

		const schoolProfilings = await ProfilingForSchools.find({
			school: { $in: schoolIds },
			profilingStatus: STATUSES.ACTIVE,
			academicYear: curAcademicYear._id,
		}).sort({ startDate: -1 })

		return schoolProfilings
	}

	async getActiveIRIsForSchools(schoolIds) {
		const curAcademicYear = await this.getCurrentAcademicYear()

		const schoolIRIs = await IRIForSchools.find({
			IRIStatus: STATUSES.ACTIVE,
			academicYear: new mongoose.Types.ObjectId(curAcademicYear._id),
			school: { $in: schoolIds },
		}).sort({ startDate: -1 })

		return schoolIRIs
	}

	async updateCountsInProfilingsAndIRIs(schoolIds) {
		if (!schoolIds.length) return

		const schoolObjectIds = schoolIds.map((id) => new mongoose.Types.ObjectId(id))

		// Get active IRI schedules of given schoolIds
		const activeIRIsForSchools = await this.getActiveIRIsForSchools(schoolObjectIds)
		// Get active Profiling schedules of given schoolIds
		const activeProfilingsForSchools = await this.getActiveProfilingsForSchools(schoolObjectIds)

		if (activeIRIsForSchools.length) {
			// update IRI for school teacher total, pending and submitted counts
			await this.updateIRIForSchools(activeIRIsForSchools)
		}

		if (activeProfilingsForSchools.length) {
			// update Profilings for school teacher total, pending and submitted counts
			await this.updateProfilingForSchools(activeProfilingsForSchools)
		}
	}

	/**
	 * This function will delete profiling and iri records of teachers of given teacher ids
	 *
	 * @param {*} teacherId teacher records _id
	 * @param {*} schoolId teachers school id (_id)
	 * @param {*} hardDelete boolean value to confirm whether teacher deleted as hard or soft.
	 */
	async deleteProfilingAndIriRecords(teacherId, schoolId, hardDelete = false) {
		// If teacher hard deleted then delete all profiling and iri records of that teacher from system.
		if (hardDelete) {
			await ProfilingForTeachers.deleteMany({ teacher: teacherId })
			await IRIForTeachers.deleteMany({ teacher: teacherId })
		} else {
			// If teacher is soft deleted then delete pending iris and profilings of teacher
			// of active iris and profilings of school of current academic year
			const profilingForSchool = await this.getActiveProfilingsForSchools([schoolId]) // active profiling of current AY
			const IriForSchool = await this.getActiveIRIsForSchools([schoolId]) // active iri of current AY

			if (profilingForSchool.length > 0) {
				await ProfilingForTeachers.deleteMany({
					schoolProfilingId: { $in: profilingForSchool.map((obj) => obj._id) },
					teacher: teacherId,
					formStatus: STATUSES.PENDING,
				})
			}

			if (IriForSchool.length > 0) {
				await IRIForTeachers.deleteMany({
					schoolIRIId: { $in: IriForSchool.map((obj) => obj._id) },
					teacher: teacherId,
					formStatus: STATUSES.PENDING,
				})
			}
		}
	}

	/**
	 * This finction will check if the teacher iri or profiling of given id exists or not
	 * And check if school iri or profiling record of exist and is Active or not
	 * If any condition fails it will throw error else will return teacher and school record of iri and profiling
	 *
	 * @param {*} id {profiling or iri for teacher record id}
	 * @param {*} action
	 * @param {IRIForTeachers or ProfilingForTeachers} ModelForTeacher
	 * @param {IRIForSchools or ProfilingForSchools} ModelForSchool
	 * @param {*} teacherKey {Teacher IRI or Teacher Profiling}
	 * @param {*} schoolKey {School IRI or School Profiling}
	 * @returns {Error data or TeacherRecord & SchoolRecord}
	 */
	async validateProfilingAndIRI(
		id,
		action,
		ModelForTeacher,
		ModelForSchool,
		teacherKey,
		schoolKey,
	) {
		let data = {
			error: false,
			statusCode: null,
			message: '',
		}
		const teacherRecord = await ModelForTeacher.findById(id).lean()
		if (!teacherRecord) {
			data = {
				error: true,
				statusCode: 404,
				message: globalConstants.messages.fieldNotFound.replaceField(teacherKey),
			}
			return data
		}

		const schoolRecordId = teacherKey.toLowerCase().includes('profiling')
			? teacherRecord.schoolProfilingId
			: teacherRecord.schoolIRIId
		const schoolRecord = await ModelForSchool.findById(schoolRecordId)
		if (!schoolRecord) {
			data = {
				error: true,
				statusCode: 404,
				message: globalConstants.messages.fieldNotFound.replaceField(schoolKey),
			}
			return data
		}

		const schoolRecordStatus = teacherKey.toLowerCase().includes('profiling')
			? teacherRecord.profilingStatus
			: teacherRecord.IRIStatus
		if (schoolRecordStatus !== STATUSES.ACTIVE) {
			data = {
				error: true,
				statusCode: 400,
				message:
					globalConstants.messages.cantTakeActionOnInactiveIRIOrProfiling.replaceField(
						action,
					),
			}
			return data
		}

		return { ...data, teacherRecord, schoolRecord }
	}
}

const assessmentHelperService = new AssessmentHelperService()
module.exports = { assessmentHelperService }
