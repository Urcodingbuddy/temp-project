const mongoose = require('mongoose')
const { Students } = require('../../models/database/myPeegu-student')

const { MONGODB_URI } = require('./migrations-utils')

async function runMigration() {
	console.log('Migration started...')
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to MongoDB')

	await Students.updateMany({ 'studentsJourney.OldClassRoomId': { $exists: true } }, [
		{
			$set: {
				studentsJourney: {
					$map: {
						input: '$studentsJourney',
						as: 'item',
						in: {
							$cond: [
								{ $ifNull: ['$$item.OldClassRoomId', false] },
								{ $unsetField: { input: '$$item', field: 'OldClassRoomId' } },
								'$$item',
							],
						},
					},
				},
			},
		},
	])

	await mongoose.disconnect()
	console.log('Migration completed')
}

runMigration().catch((err) => {
	console.error('Migration failed:', err)
	process.exit(1)
})
