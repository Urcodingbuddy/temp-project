const mongoose = require('mongoose')
const { collections } = require('../../utility/databaseConstants')

const academicYearsSchema = new mongoose.Schema(
	{
		academicYear: {
			type: String,
			minlength: 9,
			maxlength: 9,
			unique: true,
			trim: true,
		},
		order: {
			type: Number,
		},
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

const AcademicYears = mongoose.model(collections.academicYears, academicYearsSchema)
module.exports.AcademicYears = AcademicYears
