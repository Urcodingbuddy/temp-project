const mongoose = require('mongoose')
const { collections } = require('../../utility/databaseConstants')
const { buildComboKey } = require('../../utility/common-utility-functions')

// Answer schema for storing student responses
const answerSchema = new mongoose.Schema(
	{
		questionId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		skillId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		selectedOption: {
			type: String,
			required: true,
			trim: true,
		},
		score: {
			type: Number,
			required: true,
			default: 0,
		},
		category: {
			type: String,
			enum: ['gifted', 'talented'],
			required: true,
		},
	},
	{ _id: true },
)

// Skill score summary
const skillScoreSchema = new mongoose.Schema(
	{
		skillId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		skillName: {
			type: String,
			required: true,
		},
		giftedScore: {
			type: Number,
			default: 0,
		},
		talentedScore: {
			type: Number,
			default: 0,
		},
		giftedMaxScore: {
			type: Number,
			default: 0,
		},
		talentedMaxScore: {
			type: Number,
			default: 0,
		},
		giftedQuestionsCount: {
			type: Number,
			default: 0,
		},
		talentedQuestionsCount: {
			type: Number,
			default: 0,
		},
		giftedIndicator: {
			type: Number,
			default: 0,
		},
		talentedIndicator: {
			type: Number,
			default: 0,
		},
	},
	{ _id: false },
)

// Main G&T Assessment schema
const gandtAssessmentSchema = new mongoose.Schema(
	{
		studentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: collections.students,
			required: true,
		},
		studentName: {
			type: String,
			required: true,
			trim: true,
		},
		user_id: {
			type: String,
			required: true,
		},
		school: {
			type: mongoose.Schema.Types.ObjectId,
			ref: collections.schools,
			required: true,
		},
		schoolName: {
			type: String,
			required: true,
		},
		classRoomId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: collections.classrooms,
			required: true,
		},
		SAY: {
			type: mongoose.Schema.Types.ObjectId,
			ref: collections.schoolAcademicYears,
			required: true,
		},
		academicYear: {
			type: mongoose.Schema.Types.ObjectId,
			ref: collections.academicYears,
			required: true,
		},
		template: {
			type: mongoose.Schema.Types.ObjectId,
			ref: collections.gandtTemplates,
			required: true,
		},
		templateName: {
			type: String,
			required: true,
		},
		ageGroupId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		ageGroupTitle: {
			type: String,
			required: true,
		},
		studentAge: {
			type: Number,
			required: true,
		},
		counsellorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: collections.users,
			required: true,
		},
		counsellorName: {
			type: String,
			required: true,
		},
		answers: [answerSchema],
		skillScores: [skillScoreSchema],
		totalGiftedScore: {
			type: Number,
			default: 0,
		},
		totalTalentedScore: {
			type: Number,
			default: 0,
		},
		totalGiftedMaxScore: {
			type: Number,
			default: 0,
		},
		totalTalentedMaxScore: {
			type: Number,
			default: 0,
		},
		giftedPercentage: {
			type: Number,
			default: 0,
		},
		talentedPercentage: {
			type: Number,
			default: 0,
		},
		classification: {
			type: String,
			enum: ['Gifted & Talented', 'Gifted', 'Talented', 'Emerging Potential', 'Standard Range'],
			default: null,
		},
		tier: {
			type: String,
			enum: ['Tier 1 - Immediate Placement', 'Tier 2 - Enrichment', 'Tier 3 - Standard Monitoring'],
			default: null,
		},
		status: {
			type: String,
			enum: ['in-progress', 'completed'],
			default: 'in-progress',
		},
		submittedDate: {
			type: Date,
		},
		graduated: {
			type: Boolean,
			default: false,
		},
		exited: {
			type: Boolean,
			default: false,
		},
		comboKey: {
			type: String,
			default: null,
		},
		remarks: {
			type: String,
			trim: true,
		},
	},
	{
		timestamps: true,
		collection: collections.gandtAssessments,
	},
)

// Automatically build comboKey
gandtAssessmentSchema.pre('save', function (next) {
	this.comboKey = buildComboKey([this.studentId, this.SAY, this.createdAt])
	next()
})

// Index for efficient querying
gandtAssessmentSchema.index({ studentId: 1, academicYear: 1 })
gandtAssessmentSchema.index({ school: 1, academicYear: 1 })
gandtAssessmentSchema.index({ SAY: 1 })
gandtAssessmentSchema.index({ comboKey: 1 })

const GandTAssessment = mongoose.model(
	collections.gandtAssessments,
	gandtAssessmentSchema,
)

module.exports = GandTAssessment
