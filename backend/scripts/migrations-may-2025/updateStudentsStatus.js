const mongoose = require('mongoose')
const { Students } = require('../../models/database/myPeegu-student')
const { MONGODB_URI } = require('./migrations-utils')
const { STATUSES } = require('../../utility/localConstants')

async function runMigration() {
	console.log('Migration started...')
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to MongoDB')

	const result = await Students.updateMany({ graduated: true }, { $set: { status: STATUSES.GRADUATED } })
    console.log(result)
	const result2 = await Students.updateMany({ exited: true }, { $set: { status: STATUSES.EXITED } })
    console.log(result2)

	await mongoose.disconnect()
	console.log('Migration completed')
}

runMigration().catch((err) => {
	console.error('Migration failed:', err)
	process.exit(1)
})
