const mongoose = require('mongoose')
const { collections } = require('../../utility/databaseConstants')

const SELModulesSchema = new mongoose.Schema(
	{
		year: { type: String },
		month: { type: String, trim: true },
		order: { type: Number },
		categories: [
			{
				_id: false,
				categoryName: { type: String, trim: true },
				order: { type: Number },
				files: [
					{
						_id: false,
						fileName: { type: String, trim: true },
						path: { type: String, trim: true },
						order: { type: Number },
					},
				],
			},
		],
		isDeleted: { type: Boolean, default: false },
	},
	{ timestamps: true },
)

const SELModule = mongoose.model(collections.selModules, SELModulesSchema)
module.exports.SELModule = SELModule
