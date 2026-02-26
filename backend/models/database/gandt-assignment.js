const mongoose = require('mongoose')
const { collections } = require('../../utility/databaseConstants')

const gandtAssignmentSchema = new mongoose.Schema(
	{
		school: {
			type: mongoose.Schema.Types.ObjectId,
			ref: collections.schools,
			required: true,
		},
		template: {
			type: mongoose.Schema.Types.ObjectId,
			ref: collections.gandtTemplates,
			required: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: collections.users,
			required: true,
		},
		updatedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: collections.users,
		},
	},
	{
		timestamps: true,
		collection: collections.gandtAssignments,
	},
)

// Ensure unique assignment per school-template combination
gandtAssignmentSchema.index({ school: 1, template: 1 }, { unique: true })

const GandTAssignment = mongoose.model(
	collections.gandtAssignments,
	gandtAssignmentSchema,
)

module.exports = GandTAssignment
