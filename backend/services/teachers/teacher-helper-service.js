const { default: mongoose } = require('mongoose')
const { Teacher } = require('../../models/database/myPeegu-teacher')
const { GlobalServices } = require('../global-service')
const { Classrooms } = require('../../models/database/myPeegu-classroom')
const { STATUSES } = require('../../utility/localConstants')

class TeacherHelperService extends GlobalServices {
	/**
	 * @param {*} classroomIds
	 * @param {*} teacherId
	 */
	async removeTeachersfromClassroom(classroomIds) {
		const classrooms = await Classrooms.find({
			_id: { $in: classroomIds },
			status: STATUSES.ACTIVE,
		}).select('_id teacher teacherJourney')

		if (classrooms.length) {
			const currentDate = new Date()
			const bulkOps = classrooms
				.map((classroom) => {
					const journey = classroom.teacherJourney || []

					// Update last journey's endDate if exists
					if (journey.length > 0 && !journey[journey.length - 1].endDate) {
						journey[journey.length - 1].endDate = currentDate

						return {
							updateOne: {
								filter: { _id: classroom._id },
								update: {
									$set: {
										teacher: null,
										teacherJourney: journey,
									},
								},
							},
						}
					}
					return null
				})
				.filter((obj) => obj !== null)

			await Classrooms.bulkWrite(bulkOps)
			// await this.removeClassroomsFromTeachers(classrooms)
		}
	}

	async removeClassroomFromOtherTeacher(classroomIds, teacherId) {
		const teachers = await Teacher.find({
			_id: { $ne: teacherId },
			classroomsJourney: {
				$elemMatch: {
					classRoomId: { $in: classroomIds },
					isAssigned: true,
				},
			},
			isDeleted: { $ne: true },
		})

		if (!teachers.length) return

		const now = new Date()
		const bulkOps = []

		for (const teacher of teachers) {
			let modified = false
			for (const journey of teacher.classroomsJourney) {
				if (
					classroomIds.some((id) => id.toString() === journey.classRoomId.toString()) &&
					journey.isAssigned
				) {
					journey.isAssigned = false
					journey.unassignedDate = now
					modified = true
				}
			}

			if (modified) {
				bulkOps.push({
					updateOne: {
						filter: { _id: teacher._id },
						update: {
							$set: {
								classroomsJourney: teacher.classroomsJourney,
							},
						},
					},
				})
			}
		}

		if (bulkOps.length) {
			await Teacher.bulkWrite(bulkOps)
		}
	}

	/**
	 * This function will update teacher and teacher journey for the given classrooms
	 * Also it will remove the classrooms from the old teacher
	 *
	 * @param {*} classroomIds
	 * @param {*} teacherId
	 */
	async addTeacherToClassroom(classroomIds, teacherId) {
		const classrooms = await Classrooms.find({ _id: { $in: classroomIds } }).select(
			'_id teacher teacherJourney',
		)

		const teacherIdToSet = new mongoose.Types.ObjectId(teacherId)
		const currentDate = new Date()

		const bulkOps = classrooms
			.map((classroom) => {
				const journey = classroom.teacherJourney || []
				if (journey.length > 0 && !journey[journey.length - 1].endDate) {
					if (journey[journey.length - 1].teacherId.toString() === teacherId.toString()) {
						return undefined
					}

					journey[journey.length - 1].endDate = currentDate
				}

				// Push new journey entry
				journey.push({
					teacherId: teacherIdToSet,
					startDate: currentDate,
				})

				return {
					updateOne: {
						filter: { _id: classroom._id },
						update: {
							$set: {
								teacher: teacherIdToSet,
								teacherJourney: journey,
							},
						},
					},
				}
			})
			.filter((obj) => obj !== undefined)

		await Classrooms.bulkWrite(bulkOps)
	}
}

module.exports.TeacherHelperService = TeacherHelperService
