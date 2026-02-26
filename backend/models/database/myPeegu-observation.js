const mongoose = require('mongoose')
const { collections } = require('../../utility/databaseConstants')
const { buildComboKey } = require('../../utility/common-utility-functions')

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
		SAY: { type: mongoose.Schema.Types.ObjectId, ref: collections.schoolAcademicYears },
		academicYear: { type: mongoose.Schema.Types.ObjectId, ref: collections.academicYears },
		graduated: {
			type: Boolean,
			default: false,
		},
		exited: {
			type: Boolean,
			default: false,
		},
		createdByName: { type: String, trim: true },
		updatedByName: { type: String, trim: true },
		createdById: { type: String, trim: true },
		updatedById: { type: String, trim: true },
		comboKey: { type: String, default: null },
	},
	{ timestamps: true },
)

// Automatically build comboKey
observationSchema.pre('save', function (next) {
	if (
		this.isNew ||
		this.isModified('studentId') ||
		this.isModified('classRoomId') ||
		this.isModified('academicYear')
	) {
		this.comboKey = buildComboKey(this.studentId, this.classRoomId, this.academicYear)
	}
	next()
})

observationSchema.pre('insertMany', function (next, docs) {
	for (const doc of docs) {
		doc.comboKey = buildComboKey(doc.studentId, doc.classRoomId, doc.academicYear)
	}
	next()
})

observationSchema.index({ comboKey: 1 })
observationSchema.index({ studentId: 1, classRoomId: 1, academicYear: 1 })
const ObservationRecord = mongoose.model(collections.observationRecords, observationSchema)
module.exports.ObservationRecord = ObservationRecord
