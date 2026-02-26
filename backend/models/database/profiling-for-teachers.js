const mongoose = require('mongoose')
const { collections } = require('../../utility/databaseConstants')

const ReportEntrySchema = new mongoose.Schema(
	{
		questionNumber: { type: Number, required: true },
		marks: { type: Number, required: true },
	},
	{ _id: false },
)

const ProfilingForTeachersSchema = new mongoose.Schema(
	{
		teacher: { type: mongoose.Schema.Types.ObjectId, ref: collections.teacher, required: true },
		school: {
			type: mongoose.Schema.Types.ObjectId,
			ref: collections.schools,
			required: true,
		},
		schoolProfilingId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: collections.profilingForSchools,
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

		formStatus: { type: String, enum: ['Pending', 'Submitted'], default: 'Pending' },
		submissionDate: { type: Date, default: null },

		teacherAttitude: Number,
		teacherPractices: Number,
		teacherJobLifeSatisfaction: Number,
		teacherDominance: Number,
		teacherInfluence: Number,
		teacherSteadiness: Number,
		teacherCompliance: Number,

		teacherAttitudeReport: [ReportEntrySchema],
		teacherPracticeReport: [ReportEntrySchema],
		teacherJobLifeSatisfactionReport: [ReportEntrySchema],
		teacherDISCReport: [ReportEntrySchema],
		submittedByName: { type: String },
	},
	{ timestamps: true },
)

const ProfilingForTeachers = mongoose.model(
	collections.profilingForTeachers,
	ProfilingForTeachersSchema,
)
module.exports.ProfilingForTeachers = ProfilingForTeachers
