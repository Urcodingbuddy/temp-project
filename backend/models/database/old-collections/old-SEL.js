const mongoose = require('mongoose')
const { collections } = require('../../../utility/databaseConstants')

const SELSchema = new mongoose.Schema(
	{
		SNo: {
			type: Number,
			trim: true,
		},
		school: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: collections.schools,
		},
		classRoomId: { type: mongoose.Schema.Types.ObjectId, ref: collections.classrooms },

		coreCompetency: {
			type: String,
			trim: true,
		},
		topic: {
			type: String,
			trim: true,
		},
		commentsOrObservations: {
			type: String,
			trim: true,
		},
		activity: {
			type: String,
			trim: true,
		},
		taskAssignedOrReflection: {
			type: String,
			trim: true,
		},
		interventionForEducators: {
			type: String,
			trim: true,
		},
		outcome: {
			type: String,
			trim: true,
		},
		followUpActivity: {
			type: String,
			trim: true,
		},
		interactionDate: {
			type: Date,
		},
		status: {
			type: String,
			default: 'Active',
			trim: true,
		},
		createdByName: {
			type: String,
			trim: true,
		},
		updatedByName: {
			type: String,
			trim: true,
		},
		createdById: {
			type: String,
			trim: true,
		},
		updatedById: {
			type: String,
			trim: true,
		},
	},
	{ timestamps: true },
)

const SELCurriculumTracker = mongoose.model(`${collections.SELCurriculumTracker}Old`, SELSchema)
module.exports.SELCurriculumTracker = SELCurriculumTracker
