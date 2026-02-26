const mongoose = require('mongoose')
const { collections } = require('../../utility/databaseConstants')

// Question schema for multiple choice questions
const questionSchema = new mongoose.Schema(
	{
		questionText: {
			type: String,
			required: true,
			trim: true,
		},
		exampleText: {
			type: String,
			trim: true,
			default: '',
		},
		options: [
			{
				optionText: {
					type: String,
					required: true,
					trim: true,
				},
				score: {
					type: Number,
					required: true,
					default: 0,
				},
				_id: false,
			},
		],
		category: {
			type: String,
			enum: ['gifted', 'talented'],
			required: true,
		},
		order: {
			type: Number,
			default: 0,
		},
	},
	{ _id: true },
)

// Age Group Questions schema - questions for each skill under an age group
const ageGroupQuestionsSchema = new mongoose.Schema(
	{
		ageGroupId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		skillId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		questions: [questionSchema],
	},
	{ _id: true },
)

// Skill schema
const skillSchema = new mongoose.Schema(
	{
		skillName: {
			type: String,
			required: true,
			trim: true,
		},
		weightage: {
			type: Number,
			required: true,
			min: 0,
		},
		order: {
			type: Number,
			default: 0,
		},
	},
	{ _id: true },
)

// Age group schema
const ageGroupSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		startAge: {
			type: Number,
			required: true,
			min: 0,
		},
		endAge: {
			type: Number,
			required: true,
			min: 0,
		},
		order: {
			type: Number,
			default: 0,
		},
	},
	{ _id: true },
)

// Main G&T Template schema
const gandtTemplateSchema = new mongoose.Schema(
	{
		templateName: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},
		description: {
			type: String,
			trim: true,
		},
		ageGroups: [ageGroupSchema],
		skills: [skillSchema],
		ageGroupQuestions: [ageGroupQuestionsSchema],
		isActive: {
			type: Boolean,
			default: true,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: collections.users,
		},
		updatedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: collections.users,
		},
	},
	{
		timestamps: true,
		collection: collections.gandtTemplates,
	},
)

// Validation: Ensure endAge is greater than startAge
ageGroupSchema.pre('validate', function (next) {
	if (this.endAge <= this.startAge) {
		next(new Error('End age must be greater than start age'))
	} else {
		next()
	}
})

// Validation: Ensure age ranges don't overlap within the same template
gandtTemplateSchema.pre('save', function (next) {
	const ageGroups = this.ageGroups
	for (let i = 0; i < ageGroups.length; i++) {
		for (let j = i + 1; j < ageGroups.length; j++) {
			const group1 = ageGroups[i]
			const group2 = ageGroups[j]

			// Check for overlap
			if (
				(group1.startAge <= group2.endAge &&
					group1.startAge >= group2.startAge) ||
				(group1.endAge <= group2.endAge && group1.endAge >= group2.startAge) ||
				(group2.startAge <= group1.endAge &&
					group2.startAge >= group1.startAge) ||
				(group2.endAge <= group1.endAge && group2.endAge >= group1.startAge)
			) {
				return next(
					new Error(
						`Age ranges overlap: ${group1.title} (${group1.startAge}-${group1.endAge}) and ${group2.title} (${group2.startAge}-${group2.endAge})`,
					),
				)
			}
		}
	}
	next()
})

// No weightage validation - treated as points

const GandTTemplate = mongoose.model(
	collections.gandtTemplates,
	gandtTemplateSchema,
)

module.exports = GandTTemplate
