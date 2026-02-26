const mongoose = require('mongoose')
const { collections } = require('../../../utility/databaseConstants')

const studentCopeAssessmentSchema = new mongoose.Schema(
	{
		studentName: { type: String, required: true },
		studentId: { type: mongoose.Schema.Types.ObjectId, ref: collections.students },
		counsellorName: { type: String, required: true },
		school: { type: mongoose.Schema.Types.ObjectId, ref: collections.schools },
		schoolName: { type: String, required: true },
		classRoomId: { type: mongoose.Schema.Types.ObjectId, ref: collections.classrooms },
		ratings: {
			type: [
				{
					questionNumber: {
						type: Number,
						required: true,
						min: 0,
						max: 36,
					},
					marks: {
						type: Number,
						required: true,
						min: 1,
						max: 5,
					},
				},
			],
			_id: false,
		},
		avgOfCOPEMarks: {
			type: Number,
			default: 0,
		},

		shortTermRegulation: {
			type: Number,
			default: 0,
		},
		longTermRegulation: {
			type: Number,
			default: 0,
		},
		COPEReportSubmissionDate: {
			type: Date,
		},
		// Short term Regulation
		emotionRegulationST: { type: Number, default: 0 },
		impulseControlST: { type: Number, default: 0 },
		resilienceST: { type: Number, default: 0 },
		attentionST: { type: Number, default: 0 },
		organisationST: { type: Number, default: 0 },

		// Long term Regulation
		emotionRegulationLT: { type: Number, default: 0 },
		impulseControlLT: { type: Number, default: 0 },
		resilienceLT: { type: Number, default: 0 },
		attentionLT: { type: Number, default: 0 },
		organisationLT: { type: Number, default: 0 },

		user_id: { type: String, required: true },
		isRatingReset: { type: Boolean },
	},
	{ timestamps: true },
)

const COPEAssessment = mongoose.model(
	`${collections.studentCopeAssessment}Old`,
	studentCopeAssessmentSchema,
)
module.exports.COPEAssessment = COPEAssessment
