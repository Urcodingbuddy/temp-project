const mongoose = require('mongoose')
const { collections } = require('../../utility/databaseConstants')

const statesSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			unique: true,
			trim: true,
		},
		country: { type: mongoose.Schema.Types.ObjectId, ref: collections.countries },
		isDeleted: { type: Boolean, default: false },
	},
	{ timestamps: true },
)

const States = mongoose.model(collections.states, statesSchema)
module.exports.States = States
