const mongoose = require('mongoose')
const { collections } = require('../../utility/databaseConstants')

const ProfilingForSchoolsSchema = new mongoose.Schema(
	{
		school: { type: mongoose.Schema.Types.ObjectId, ref: collections.schools, required: true },
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

		totalTeacherCount: { type: Number, default: 0 },
		submittedTeacherCount: { type: Number, default: 0 },
		pendingTeacherCount: { type: Number, default: 0 },
		
		startDate: { type: Date, default: null },
		endDate: { type: Date, default: null },
		profilingStatus: {
			type: String,
			enum: ['Active', 'In-Active'],
			default: 'Active',
		},

		isDISCSelected: Boolean,
		isTeachingPracticesSelected: Boolean,
		isJobLifeSatisfactionSelected: Boolean,
		isTeachingAttitudeSelected: Boolean,
	},
	{ timestamps: true },
)

const ProfilingForSchools = mongoose.model(
	collections.profilingForSchools,
	ProfilingForSchoolsSchema,
)
module.exports.ProfilingForSchools = ProfilingForSchools
