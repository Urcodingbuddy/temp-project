const mongoose = require('mongoose')
const { collections } = require('../../../utility/databaseConstants')

const baselineCategorySchema = new mongoose.Schema({
	status: { type: Boolean, trim: true },
	question: { type: String, trim: true },
	_id: false,
})

const baselineSchema = new mongoose.Schema(
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
		baselineForm: {
			type: String,
			trim: true,
		},
		baselineCategory: {
			type: String,
			enum: ['Baseline 1', 'Baseline 2', 'Baseline 3'],
		},
		Physical: {
			data: [baselineCategorySchema],
			total: { type: String, trim: true },
		},
		Social: {
			data: [baselineCategorySchema],
			total: { type: String, trim: true },
		},
		Emotional: {
			data: [baselineCategorySchema],
			total: { type: String, trim: true },
		},
		Cognitive: {
			data: [baselineCategorySchema],
			total: { type: String, trim: true },
		},
		Language: {
			data: [baselineCategorySchema],
			total: { type: String, trim: true },
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

const BaselineRecord = mongoose.model(`${collections.baselineRecords}Old`, baselineSchema)
module.exports.BaselineRecord = BaselineRecord
