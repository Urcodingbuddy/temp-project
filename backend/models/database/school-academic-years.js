const mongoose = require('mongoose')
const { collections } = require('../../utility/databaseConstants')

const schoolAcademicYearsSchema = new mongoose.Schema(
	{
		academicYear: { type: mongoose.Schema.Types.ObjectId, ref: collections.academicYears },
		school: { type: mongoose.Schema.Types.ObjectId, ref: collections.schoolAcademicYears },
		startDate: { type: Date },
		endDate: { type: Date },
		currentAcYear: { type: Boolean, default: true },
		studentCount: { type: Number, default: 0 },
		createdById: {
			type: String,
			trim: true,
		},
		updatedById: {
			type: String,
			trim: true,
		},
		isDeleted: { type: Boolean, default: false },
	},
	{ timestamps: true },
)

const SchoolAcademicYears = mongoose.model(
	collections.schoolAcademicYears,
	schoolAcademicYearsSchema,
)
module.exports.SchoolAcademicYears = SchoolAcademicYears
