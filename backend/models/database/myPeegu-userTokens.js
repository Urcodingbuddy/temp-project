const mongoose = require('mongoose')
const { collections } = require('../../utility/databaseConstants')

const userTokenSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		token: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			required: true,
			enum: globalConstants.tokens.typeList,
		},
		status: {
			type: String,
			enum: globalConstants.tokens.statusList,
			default: globalConstants.tokens.sent,
		},
	},
	{ timestamps: true },
)

const MyPeeguUserTokens = mongoose.model(collections.mypeeguUserTokens, userTokenSchema)

module.exports.MyPeeguUserTokens = MyPeeguUserTokens
