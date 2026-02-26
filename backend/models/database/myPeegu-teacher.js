const mongoose = require('mongoose')
const { collections } = require('../../utility/databaseConstants')

const teacherSchema = new mongoose.Schema(
	{
		teacher_id: {
			type: String,
			minlength: 1,
			maxlength: 15,
			trim: true,
			required: true,
		},
		teacherName: {
			type: String,
			minlength: 1,
			maxlength: 120,
			trim: true,
			required: true,
		},
		gender: {
			type: String,
			trim: true,
			enum: ['Male', 'Female'],
		},
		status: {
			type: String,
			trim: true,
			enum: ['Created', 'Invited', 'Active'],
		},
		isIRIRatingDeleted: { type: Boolean, default: false },
		isProfilingRatingDeleted: { type: Boolean, default: false },
		scCode: {
			type: String,
			trim: true,
			required: true,
		},
		schoolName: {
			type: String,
			trim: true,
		},
		email: {
			type: String,
			minlength: 5,
			maxlength: 255,
			trim: true,
			required: true,
		},
		mobileNumber: {
			type: String,
			trim: true,
		},
		teacherIRIReport: {
			type: [
				{
					questionNumber: {
						type: Number,
						required: true,
						min: 0,
						max: 28,
					},
					marks: {
						type: Number,
						required: true,
						min: 0,
						max: 4,
					},
				},
			],
			_id: false,
		},
		IRISubDate: {
			type: Date,
			default: null,
		},
		isIRIFormSubmitted: {
			type: Boolean,
			default: false,
		},
		formStatusOnIRISubDate: {
			type: String,
			trim: true,
			default: 'Pending',
			enum: ['Pending', 'Submitted'],
		},
		IRIStartDateForSchool: {
			type: Date,
			default: null,
		},
		IRIEndDateForSchool: {
			type: Date,
			default: null,
		},
		timeSpanStatusForSchool: {
			type: String,
			trim: true,
			default: 'In-Active',
			enum: ['Active', 'In-Active'],
		},
		SchoolId: { type: mongoose.Schema.Types.ObjectId, ref: collections.schools },
		classRoomIds: [{ type: mongoose.Schema.Types.ObjectId, ref: collections.classrooms }],
		classroomsJourney: [
			{
				_id: false,
				classRoomId: { type: mongoose.Schema.Types.ObjectId, ref: collections.classrooms },
				SAY: { type: mongoose.Schema.Types.ObjectId, ref: collections.schoolAcademicYears },
				academicYear: {
					type: mongoose.Schema.Types.ObjectId,
					ref: collections.academicYears,
				},
				assignedDate: { type: Date, default: Date.now() },
				unassignedDate: { type: Date },
				isAssigned: { type: Boolean, default: true },
			},
		],
		createdByName: {
			type: String,
			trim: true,
		},
		finalScore: {
			type: Number,
		},
		perspectiveNP: {
			type: Number,
		},
		fantasyNP: {
			type: Number,
		},
		empathicNP: {
			type: Number,
		},
		personalDistressNP: {
			type: Number,
		},
		//Teacher Profiling Data
		isProfilingFormSubmitted: {
			type: Boolean,
			default: false,
		},
		ProfilingSubDate: {
			type: Date,
			default: null,
		},
		ProfilingStartDateForSchool: {
			type: Date,
			default: null,
		},
		ProfilingEndDateForSchool: {
			type: Date,
			default: null,
		},
		formStatusOnProfilingSubDate: {
			type: String,
			trim: true,
			default: 'Pending',
			enum: ['Pending', 'Submitted'],
		},
		teacherAttitude: {
			type: Number,
		},
		teacherPractices: {
			type: Number,
		},
		teacherJobLifeSatisfaction: {
			type: Number,
		},
		//DISC
		teacherDominance: {
			type: Number,
		},
		teacherInfluence: {
			type: Number,
		},
		teacherSteadiness: {
			type: Number,
		},
		teacherCompliance: {
			type: Number,
		},
		isDISCSelected: {
			type: Boolean,
		},
		isTeachingPracticesSelected: {
			type: Boolean,
		},
		isJobLifeSatisfactionSelected: {
			type: Boolean,
		},
		isTeachingAttitudeSelected: {
			type: Boolean,
		},
		teacherAttitudeReport: {
			type: [
				{
					questionNumber: {
						type: Number,
						required: true,
						min: 0,
						max: 12,
					},
					marks: {
						type: Number,
						required: true,
						min: 0,
						max: 4,
					},
				},
			],
			_id: false,
		},
		teacherPracticeReport: {
			type: [
				{
					questionNumber: {
						type: Number,
						required: true,
						min: 0,
						max: 12,
					},
					marks: {
						type: Number,
						required: true,
						min: 0,
						max: 5,
					},
				},
			],
			_id: false,
		},
		teacherJobLifeSatisfactionReport: {
			type: [
				{
					questionNumber: {
						type: Number,
						required: true,
						min: 0,
						max: 9,
					},
					marks: {
						type: Number,
						required: true,
						min: 0,
						max: 4,
					},
				},
			],
			_id: false,
		},
		teacherDISCReport: {
			type: [
				{
					questionNumber: {
						type: Number,
						required: true,
						min: 0,
						max: 16,
					},
					marks: {
						type: Number,
						required: true,
						min: 0,
						max: 5,
					},
				},
			],
			_id: false,
		},
		isDeleted: { type: Boolean, default: false },
	},
	{ timestamps: true },
)

const Teacher = mongoose.model(collections.teacher, teacherSchema)
module.exports.Teacher = Teacher
