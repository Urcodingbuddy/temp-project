const mongoose = require('mongoose')
const { collections } = require('../../utility/databaseConstants')

const ReportEntrySchema = new mongoose.Schema(
	{
		questionNumber: { type: Number, required: true },
		marks: { type: Number, required: true },
	},
	{ _id: false },
)

const IRIForTeachersSchema = new mongoose.Schema(
	{
		teacher: { type: mongoose.Schema.Types.ObjectId, ref: collections.teacher, required: true },
		school: {
			type: mongoose.Schema.Types.ObjectId,
			ref: collections.schools,
			required: true,
		},
		academicYear: {
			type: mongoose.Schema.Types.ObjectId,
			ref: collections.academicYears,
			required: true,
		},
		SAY: {
			type: mongoose.Schema.Types.ObjectId,
			ref: collections.schoolAcademicYears,
			required: true,
		},
		schoolIRIId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: collections.iriForSchools,
			required: true,
		},

		formStatus: { type: String, enum: ['Pending', 'Submitted'], default: 'Pending' },
		submissionDate: { type: Date, default: null },
		
		finalScore: Number,
		perspectiveNP: Number,
		fantasyNP: Number,
		empathicNP: Number,
		personalDistressNP: Number,
		
		teacherIRIReport: [ReportEntrySchema],
		submittedByName: { type: String }
	},
	{ timestamps: true },
)

const IRIForTeachers = mongoose.model(collections.iriForTeachers, IRIForTeachersSchema)
module.exports.IRIForTeachers = IRIForTeachers
