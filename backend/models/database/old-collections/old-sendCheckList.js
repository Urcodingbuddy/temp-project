const mongoose = require('mongoose')
const { collections } = require('../../utility/databaseConstants')

const StudentCheckListSchema = new mongoose.Schema(
	{
		studentName: { type: String, required: true },
		studentId: { type: mongoose.Schema.Types.ObjectId, ref: collections.students },
		classRoomId: { type: mongoose.Schema.Types.ObjectId, ref: collections.classrooms },
		school: { type: mongoose.Schema.Types.ObjectId, ref: collections.schools },
		schoolName: { type: String, required: true },
		user_id: { type: String, required: true },
		sendCheckListDate: {
			type: Date,
		},
		checklistForm: { type: String, trim: true, enum: ['Upper KG - Grade 4', 'Grade 5 - Grade 12'] },
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
	},
	{ timestamps: true },
)

const StudentCheckList = mongoose.model(`${collections.studentCheckList}Old`, StudentCheckListSchema)
module.exports.StudentCheckList = StudentCheckList
