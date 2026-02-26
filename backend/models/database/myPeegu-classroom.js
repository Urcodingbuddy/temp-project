const mongoose = require('mongoose')
const { collections } = require('../../utility/databaseConstants')

const classroomSchema = new mongoose.Schema(
	{
		school: { type: mongoose.Schema.Types.ObjectId, ref: collections.schools },
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
		teacher: { type: mongoose.Schema.Types.ObjectId, ref: collections.teacher },
		teacherJourney: [
			{
				_id: false,
				teacherId: { type: mongoose.Schema.Types.ObjectId, ref: collections.teacher },
				startDate: { type: Date },
				endDate: { type: Date },
			},
		],
		SAY: { type: mongoose.Schema.Types.ObjectId, ref: collections.schoolAcademicYears },
		academicYear: { type: mongoose.Schema.Types.ObjectId, ref: collections.academicYears },
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

const Classrooms = mongoose.model(collections.classrooms, classroomSchema)
module.exports.Classrooms = Classrooms
