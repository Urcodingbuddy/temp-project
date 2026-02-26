const mongoose = require('mongoose')
const { MONGODB_URI } = require('./migrations-utils')
const { jsonData } = require('../../resources/sel-modules/2025-2026/june')
const { SELModule } = require('../../models/database/SEL-module')

async function insertMonths() {
	try {
		await mongoose.connect(MONGODB_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})

		const result = await SELModule.create(jsonData, { ordered: false }) // allows skipping duplicates
		console.log('Inserted SEL Module:', result)
	} catch (err) {
		console.error('Error inserting months:', err)
	} finally {
		await mongoose.disconnect()
	}
}

insertMonths()
