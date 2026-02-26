const mongoose = require('mongoose')
const { collections } = require('../../utility/databaseConstants')
const { buildComboKey } = require('../../utility/common-utility-functions')

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
		comboKey: { type: String, default: null },
	},
	{ timestamps: true },
)

// Automatically build comboKey
individualRecordSchema.pre('save', function (next) {
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

individualRecordSchema.pre('insertMany', function (next, docs) {
	for (const doc of docs) {
		doc.comboKey = buildComboKey(doc.studentId, doc.classRoomId, doc.academicYear)
	}
	next()
})

individualRecordSchema.index({ comboKey: 1 })
individualRecordSchema.index({ studentId: 1, classRoomId: 1, academicYear: 1 })
const IndividualRecord = mongoose.model(collections.individualRecords, individualRecordSchema)
module.exports.IndividualRecord = IndividualRecord
