const mongoose = require('mongoose')

const classroomSchema = new mongoose.Schema(
	{
		school: { type: mongoose.Schema.Types.ObjectId, ref: 'schools' },
		className: {
			type: String,
			trim: true,
		},
		section: {
			type: String,
			maxlength: 16,
			trim: true,
		},
		teacherName: {
			type: String,
			maxlength: 60,
			trim: true,
		},
		studentCount: { type: Number, default: 0 },
		classMeanForSTReg: { type: Number, default: 0 },
		classMeanForLTReg: { type: Number, default: 0 },
		noOfstudentsFilledCOPEFormInClass: { type: Number, default: 0 },
		COPEScoreForClass: { type: Number, default: 0 },

		classHierarchy: { type: Number },
		sectionHierarchy: { type: Number },

		email: {
			type: String,
			trim: true,
		},
		phone: {
			type: String,
			trim: true,
		},
		status: {
			type: String,
			default: 'Active',
			trim: true,
		},
		createdByName: {
			type: String,
			trim: true,
		},
		updatedByName: {
			type: String,
			trim: true,
		},
		createdById: {
			type: String,
			trim: true,
		},
		updatedById: {
			type: String,
			trim: true,
		},
	},
	{ timestamps: true },
)

const ClassroomsOld = mongoose.model('classrooms-olds', classroomSchema)
module.exports.ClassroomsOld = ClassroomsOld
