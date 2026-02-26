const mongoose = require('mongoose')
const { collections } = require('../../utility/databaseConstants')

const studentSchema = (student) =>
	new mongoose.Schema(
		{
			school: { type: mongoose.Schema.Types.ObjectId, ref: collections.schools },
			classRoomId: { type: mongoose.Schema.Types.ObjectId, ref: collections.classrooms },
			// schoolName: {type: String},
			// className: {type: String},
			// sectionName: {type: String},
			user_id: {
				type: String,
				minlength: 1,
				maxlength: 25,
				unique: student,
				trim: true,
			},
			studentName: {
				type: String,
				maxlength: 255,
				trim: true,
			},
			newStudent: {
				type: Boolean,
				default: true,
			},
			regNo: {
				type: String,
				maxlength: 100,
				trim: true,
			},
			regDate: {
				type: Date,
			},
			academicYear: {
				type: String,
				maxlength: 12,
				trim: true,
			},
			studentsJourney: {
				type: [
					{
						OldClassRoomId: {
							type: mongoose.Schema.Types.ObjectId,
							ref: collections.classrooms,
						},
						classRoomId: {
							type: mongoose.Schema.Types.ObjectId,
							ref: collections.classrooms,
						},
						SAY: {
							type: mongoose.Schema.Types.ObjectId,
							ref: collections.schoolAcademicYears,
						},
						academicYear: {
							type: mongoose.Schema.Types.ObjectId,
							ref: collections.academicYears,
						},
						dateTime: {
							type: Date,
						},
					},
				],
				_id: false,
			},
			nationality: {
				type: String,
				trim: true,
			},
			dob: Date,
			gender: {
				type: String,
				trim: true,
				enum: ['Male', 'Female'],
			},
			bloodGrp: {
				type: String,
				maxlength: 12,
				trim: true,
				default: '',
				enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', ''],
			},
			graduated: {
				type: Boolean,
				default: false,
			},
			exited: {
				type: Boolean,
				default: false,
			},
			lastPromotionDate: {
				type: Date,
				default: null,
			},
			lastPromotionAcademicYear: {
				type: mongoose.Schema.Types.ObjectId,
				ref: collections.academicYears,
				default: null,
			},
			lastDemotionDate: {
				type: Date,
				default: null,
			},
			lastDemotionAcademicYear: {
				type: mongoose.Schema.Types.ObjectId,
				ref: collections.academicYears,
				default: null,
			},
			fatherName: {
				type: String,
				maxlength: 60,
				trim: true,
			},
			motherName: {
				type: String,
				maxlength: 60,
				trim: true,
			},
			email: {
				type: String,
				trim: true,
			},
			phone: {
				type: String,
				trim: true,
			},
			profilePicture: {
				type: String,
				trim: true,
			},
			profilePicUrl: {
				type: String,
				trim: true,
			},
			status: {
				type: String,
				default: 'Active',
				trim: true,
			},
			graduatedAcademicYear: {
				type: mongoose.Schema.Types.ObjectId,
				ref: collections.academicYears,
				default: null,
			},
			exitedAcademicYear: {
				type: mongoose.Schema.Types.ObjectId,
				ref: collections.academicYears,
				default: null,
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

const Students = mongoose.model(collections.students, studentSchema(true))
const StudentsHistory = mongoose.model(collections.studentsHistory, studentSchema(false))

module.exports.StudentsHistory = StudentsHistory
module.exports.Students = Students
