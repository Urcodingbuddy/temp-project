const mongoose = require('mongoose')
const { collections } = require('../../../utility/databaseConstants')

const statusCommentSchema = new mongoose.Schema({
	status: { type: String, trim: true },
	comments: { type: String, trim: true },
	_id: false,
})

const observationSchema = new mongoose.Schema(
	{
		user_id: { type: String, trim: true },
		studentName: { type: String, trim: true },
		studentId: { type: mongoose.Schema.Types.ObjectId, ref: collections.students },
		school: { type: mongoose.Schema.Types.ObjectId, ref: collections.schools },
		classRoomId: { type: mongoose.Schema.Types.ObjectId, ref: collections.classrooms },
		doo: Date,
		duration: { type: String, trim: true },
		punctuality: statusCommentSchema,
		abilityToFollowGuidelines: statusCommentSchema,
		abilityToFollowInstructions: statusCommentSchema,
		participation: statusCommentSchema,
		completionOfTasks: statusCommentSchema,
		abilityToWorkIndependently: statusCommentSchema,
		incedentalOrAdditionalNote: statusCommentSchema,
		appearance: statusCommentSchema,
		attitude: statusCommentSchema,
		behaviour: statusCommentSchema,
		speech: statusCommentSchema,
		affetcOrMood: statusCommentSchema,
		thoughtProcessOrForm: statusCommentSchema,
		additionalCommentOrNote: statusCommentSchema,
		status: {
			type: String,
			default: 'Active',
			trim: true,
		},
		createdByName: { type: String, trim: true },
		updatedByName: { type: String, trim: true },
		createdById: { type: String, trim: true },
		updatedById: { type: String, trim: true },
	},
	{ timestamps: true },
)

const ObservationRecord = mongoose.model(`${collections.observationRecords}Old`, observationSchema)
module.exports.ObservationRecord = ObservationRecord
