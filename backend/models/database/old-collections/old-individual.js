const mongoose = require('mongoose')
const { collections } = require('../../../utility/databaseConstants')

const individualRecordSchema = new mongoose.Schema(
	{
		user_id: {
			type: String,
			trim: true,
		},
		studentName: {
			type: String,
			trim: true,
		},
		school: { type: mongoose.Schema.Types.ObjectId, ref: collections.schools },
		studentId: { type: mongoose.Schema.Types.ObjectId, ref: collections.students },
		classRoomId: { type: mongoose.Schema.Types.ObjectId, ref: collections.classrooms },
		startTime: {
			type: String,
			trim: true,
		},
		endTime: {
			type: String,
			trim: true,
		},
		date: Date,
		issues: {
			type: String,
			trim: true,
		},
		goals: {
			type: String,
			trim: true,
		},
		activity: {
			type: String,
			trim: true,
		},
		dimension: {
			type: String,
			trim: true,
		},
		description: {
			type: String,
			trim: true,
		},
		stype: {
			type: String,
			trim: true,
		},
		basedOn: {
			type: String,
			trim: true,
		},
		purpose: {
			type: String,
			trim: true,
		},
		outcome: {
			type: String,
			trim: true,
		},
		improvements: {
			type: String,
			trim: true,
		},
		comments: {
			type: String,
			trim: true,
		},
		tasksAssigned: {
			type: String,
			trim: true,
		},
		poa: {
			type: String,
			trim: true,
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

const IndividualRecord = mongoose.model(`${collections.individualRecords}Old`, individualRecordSchema)
module.exports.IndividualRecord = IndividualRecord
