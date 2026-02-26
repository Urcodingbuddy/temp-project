const mongoose = require('mongoose')
const { collections } = require('../../utility/databaseConstants')
const { buildComboKey } = require('../../utility/common-utility-functions')

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
baselineSchema.pre('save', function (next) {
	if (
		this.isNew ||
		this.isModified('studentId') ||
		this.isModified('classRoomId') ||
		this.isModified('academicYear')
	) {
		console.log(`buildComboKey - ${typeof buildComboKey}`)
		this.comboKey = buildComboKey(this.studentId, this.classRoomId, this.academicYear)
	}
	next()
}) 

baselineSchema.pre('insertMany', function (next, docs) {
	for (const doc of docs) {
		doc.comboKey = buildComboKey(doc.studentId, doc.classRoomId, doc.academicYear)
	}
	next()
}) 

baselineSchema.index({ comboKey: 1 })

baselineSchema.index({ studentId: 1, classRoomId: 1, academicYear: 1 })

const BaselineRecord = mongoose.model(collections.baselineRecords, baselineSchema)
module.exports.BaselineRecord = BaselineRecord
