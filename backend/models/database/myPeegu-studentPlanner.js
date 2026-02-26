const mongoose = require('mongoose')
const { collections } = require('../../utility/databaseConstants')
const { buildComboKey } = require('../../utility/common-utility-functions')

const EvolutionSchema = new mongoose.Schema({
	_id: false,
	requirement: {
		type: String,
		enum: ['Yes', 'No'],
	},
	availability: {
		type: String,
		enum: ['Yes', 'No'],
	},
	diagnosis: {
		type: [String],
		default: [],
	},
	reportLink: {
		type: String,
		default: '',
	},
})

const AccommodationFromBoardSchema = new mongoose.Schema({
	_id: false,
	requirement: {
		type: String,
		enum: ['Yes', 'No'],
	},
	certificate: {
		type: String,
		enum: ['Yes', 'No'],
	},
	approvalfromRegionalOffice: {
		type: String,
		enum: ['Yes', 'No'],
	},
	accommodationApplicable: {
		type: String,
	},
})

const ValueWithCommentsSchema = {
	_id: false,

	value: {
		type: String,
		enum: ['Yes', 'No'],
	},
	comments: {
		type: [String],
		default: [],
	},
}

const AccommodationInternalSchema = new mongoose.Schema({
	_id: false,

	requirement: {
		type: String,
		enum: ['Yes', 'No'],
	},
	specialEducationClasses: {
		type: String,
		enum: ['Yes', 'No'],
	},
	behavioralInterventions: {
		type: ValueWithCommentsSchema,
	},
	oneToOneWithHRT_CT: {
		type: ValueWithCommentsSchema,
	},
	focusClasses: {
		type: ValueWithCommentsSchema,
	},
	accomondationsInSchool: {
		type: ValueWithCommentsSchema,
	},
	assistiveTechnology: {
		type: ValueWithCommentsSchema,
	},
})

const transitionPlanningSchema = new mongoose.Schema({
	_id: false,

	communityExperience: {
		type: ValueWithCommentsSchema,
	},
	activitiesOfDailyLiving: {
		type: ValueWithCommentsSchema,
	},
	functional_VocationalAssistance: {
		type: ValueWithCommentsSchema,
	},
})

const PlacementWithSENDSchema = new mongoose.Schema({
	_id: false,

	individual: {
		_id: false,

		type: {
			value: {
				type: String,
				enum: ['Yes', 'No'],
			},
			frequency: {
				type: [Number],
				default: [],
			},
		},
	},
	group: {
		_id: false,

		type: {
			value: {
				type: String,
				enum: ['Yes', 'No'],
			},
			frequency: {
				type: [Number],
				default: [],
			},
		},
	},
})

const baseLineSchema = new mongoose.Schema({
	_id: false,
	Physical: {
		type: [String],
		default: [],
	},
	Social: {
		type: [String],
		default: [],
	},
	Emotional: {
		type: [String],
		default: [],
	},
	Cognitive: {
		type: [String],
		default: [],
	},
	Linguistic: {
		type: [String],
		default: [],
	},
})

const checkListSchema = new mongoose.Schema({
	_id: false,
	category: {
		type: String,
	},
	shortTermGoal: {
		type: [String],
		default: [],
	},
	longTermGoal: {
		type: [String],
		default: [],
	},
})

const StudentEducationalPlanSchema = new mongoose.Schema(
	{
		studentId: { type: mongoose.Schema.Types.ObjectId, ref: collections.students },
		classRoomId: { type: mongoose.Schema.Types.ObjectId, ref: collections.classrooms },
		school: { type: mongoose.Schema.Types.ObjectId, ref: collections.schools },
		studentName: {
			type: String,
			trim: true,
		},
		user_id: {
			type: String,
		},
		checkList: {
			type: [checkListSchema],
			default: [],
		},
		baseLine: {
			type: baseLineSchema,
		},
		Evolution: {
			type: EvolutionSchema,
		},
		AccommodationFromBoard: {
			type: AccommodationFromBoardSchema,
		},
		AccommodationInternal: {
			type: AccommodationInternalSchema,
		},
		transitionPlanning: {
			type: transitionPlanningSchema,
		},
		PlacementWithSEND: {
			type: PlacementWithSENDSchema,
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
		comboKey: { type: String, default: null },
	},
	{ timestamps: true },
)

// Automatically build comboKey
StudentEducationalPlanSchema.pre('save', function (next) {
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

StudentEducationalPlanSchema.pre('insertMany', function (next, docs) {
	for (const doc of docs) {
		doc.comboKey = buildComboKey(doc.studentId, doc.classRoomId, doc.academicYear)
	}
	next()
})

StudentEducationalPlanSchema.index({ comboKey: 1 })

StudentEducationalPlanSchema.index({ studentId: 1, classRoomId: 1, academicYear: 1 })

const EducationPlanner = mongoose.model(collections.educationPlanner, StudentEducationalPlanSchema)
module.exports.EducationPlanner = EducationPlanner
