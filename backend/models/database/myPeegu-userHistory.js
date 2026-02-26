const mongoose = require('mongoose')
const { collections } = require('../../utility/databaseConstants')

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			minlength: 1,
			maxlength: 60,
			trim: true,
		},
		userId: {
			type: String,
			minlength: 4,
			maxlength: 60,
			trim: true,
		},
		lastName: {
			type: String,
			maxlength: 60,
			trim: true,
		},
		middleName: {
			type: String,
			maxlength: 60,
			trim: true,
		},
		fullName: {
			type: String,
			maxlength: 120,
			trim: true,
		},
		uniqueKey: {
			type: String,
			trim: true,
		},
		profilePicture: {
			type: String,
			maxlength: 200,
			trim: true,
		},
		email: {
			type: String,
			minlength: 5,
			maxlength: 255,
			trim: true,
		},
		password: {
			type: String,
		},
		permissions: {
			type: [String],
		},
		status: {
			type: String,
			trim: true,
		},
		createdById: {
			type: String,
			trim: true,
		},
		createdByName: {
			type: String,
			trim: true,
		},
		updatedById: {
			type: String,
			trim: true,
		},
		updatedByName: {
			type: String,
			trim: true,
		},
		authToken: String,
		action: {
			type: Number,
		},
		privateUrl: {
			type: String,
			trim: true,
		},
		reason: {
			type: String,
			trim: true,
			maxlength: 255,
		},
	},
	{ timestamps: true },
)

const MyPeeguUserHistory = mongoose.model(collections.mypeeguUsersHistory, userSchema)
// module.exports.MyPeeguUserHistory = MyPeeguUserHistory
