const mongoose = require('mongoose')
const { collections } = require('../../utility/databaseConstants')

const countriesSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			unique: true,
			trim: true,
		},
		code: {
			type: String,
			trim: true,
		},
		short_name: {
			type: String,
			trim: true,
		},
		isDeleted: { type: Boolean, default: false },
	},
	{ timestamps: true },
)

const Countries = mongoose.model(collections.countries, countriesSchema)
module.exports.Countries = Countries
