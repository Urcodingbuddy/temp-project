const mongoose = require('mongoose')
const { collections } = require('../../utility/databaseConstants')
const { buildComboKey } = require('../../utility/common-utility-functions')

const studentCheckListSchema = new mongoose.Schema(
	{
		studentName: { type: String, required: true },
		studentId: { type: mongoose.Schema.Types.ObjectId, ref: collections.students },
		classRoomId: { type: mongoose.Schema.Types.ObjectId, ref: collections.classrooms },
		school: { type: mongoose.Schema.Types.ObjectId, ref: collections.schools },
		schoolName: { type: String, required: true },
		user_id: { type: String, required: true },
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
		sendCheckListDate: {
			type: Date,
		},
		checklistForm: {
			type: String,
			trim: true,
			enum: ['Upper KG - Grade 4', 'Grade 5 - Grade 12'],
		},
		categories: [
			{
				category: { type: String },
				subCategories: [
					{
						subCategory: { type: String },
						Questions: [
							// Questions under sub category
							{
								question: { type: Number },
								answer: { type: String, enum: ['yes', 'no'] },
								_id: false,
							},
						],
						score: { type: Number },
						_id: false,
					},
				],
				Questions: [
					// Questions directly under category
					{
						question: { type: Number },
						answer: { type: String, enum: ['yes', 'no'] },
						_id: false,
					},
				],
				score: { type: Number },
				_id: false,
			},
		],
		comboKey: { type: String, default: null },
	},
	{ timestamps: true },
)

// Automatically build comboKey
studentCheckListSchema.pre('save', function (next) {
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

studentCheckListSchema.pre('insertMany', function (next, docs) {
	for (const doc of docs) {
		doc.comboKey = buildComboKey(doc.studentId, doc.classRoomId, doc.academicYear?._id)
	}
	next()
})

studentCheckListSchema.index({ comboKey: 1 })

studentCheckListSchema.index({ studentId: 1, classRoomId: 1, academicYear: 1 })
const StudentCheckList = mongoose.model(collections.studentCheckList, studentCheckListSchema)
module.exports.StudentCheckList = StudentCheckList
