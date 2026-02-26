const mongoose = require('mongoose')
const { Teacher } = require('../../models/database/myPeegu-teacher')
const { MONGODB_URI } = require('./migrations-utils')

async function runMigration() {
	try {
		console.log('🚀 Connecting to MongoDB...')
		await mongoose.connect(MONGODB_URI)
		console.log('✅ Connected')

		const result = await Teacher.updateMany({},{
						$unset: {
							classRoomIds: '',
						},
					})
		console.log(result)

		await mongoose.disconnect()
		console.log('🏁 Migration completed')
	} catch (err) {
		console.error('❌ Migration failed:', err)
		process.exit(1)
	}
}

runMigration()
