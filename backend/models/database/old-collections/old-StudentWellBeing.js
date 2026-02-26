const mongoose = require('mongoose')
const { collections } = require('../../../utility/databaseConstants')

const StudentsWellBeingAssessmentSchema = new mongoose.Schema(
	{
		studentName: { type: String, required: true },
		studentId: { type: mongoose.Schema.Types.ObjectId, ref: collections.students },
		classRoomId: { type: mongoose.Schema.Types.ObjectId, ref: collections.classrooms },
		counsellorName: { type: String, required: true },
		school: { type: mongoose.Schema.Types.ObjectId, ref: collections.schools },
		schoolName: { type: String, required: true },
		user_id: { type: String, required: true },
		isRatingReset: { type: Boolean },
		overallHopeScore: { type: Number },
		overallWellBeingScaleScore: { type: Number },
		isStudentsWellBeingFormSubmitted: { type: Boolean },

		CH_PathwayMarks: { type: Number, default: 0 },
		CH_AgencyMarks: { type: Number, default: 0 },

		PWB_AutonomyMarks: { type: Number, default: 0 },
		PWB_EnvironmentalMarks: { type: Number, default: 0 },
		PWB_PersonalGrowthMarks: { type: Number, default: 0 },

		PWB_PositiveRelationsMarks: { type: Number, default: 0 },
		PWB_PurposeInLifeMarks: { type: Number, default: 0 },
		PWB_SelfAcceptanceMarks: { type: Number, default: 0 },
		wellBeingAssessmentSubmissionDate: {
			type: Date,
		},
		childrensHopeScaleScore: {
			type: [
				{
					questionNumber: {
						type: Number,
						required: true,
						min: 0,
						max: 6,
					},
					marks: {
						type: Number,
						required: true,
						min: 1,
						max: 6,
					},
				},
			],
			_id: false,
		},
		psychologicalWellBeingScaleScore: {
			type: [
				{
					questionNumber: {
						type: Number,
						required: true,
						min: 0,
						max: 18,
					},
					marks: {
						type: Number,
						required: true,
						min: 1,
						max: 7,
					},
				},
			],
			_id: false,
		},
	},
	{ timestamps: true },
)

const WellBeingAssessment = mongoose.model(
	`${collections.studentsWellBeingAssessment}Old`,
	StudentsWellBeingAssessmentSchema,
)
module.exports.WellBeingAssessment = WellBeingAssessment
