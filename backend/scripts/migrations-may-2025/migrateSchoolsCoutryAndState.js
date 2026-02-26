// While running 1st migration create a new field in schema "state2" so the stateId will be saved to state2 field

// While running 2nd migration remove state2 from schema and change schema type of state to ObjectId

const mongoose = require('mongoose')
const { Schools } = require('../../models/database/myPeegu-school')
const { MONGODB_URI } = require('./migrations-utils')

// Update state with value of state2 and remove state2
async function runMigration() {
	console.log('Migration started...')
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to MongoDB')

	const schools = await Schools.find({}, { city: 1, state: 1 })

	const schoolBulkOperations = []

	let sc = 0
	for (const school of schools) {
		const data = {
			updateOne: {
				filter: { _id: school._id },
				update: {
					$set: {
						state: new mongoose.Types.ObjectId(school.state),
					},
					$unset: {
						state2: '',
					},
				},
			},
		}
		schoolBulkOperations.push(data)
	}
	console.log('---------------BULK LENGTH---------------', schoolBulkOperations.length)
	console.log(JSON.stringify(schoolBulkOperations[0]))
	await Schools.bulkWrite(schoolBulkOperations)

	await mongoose.disconnect()
	console.log('Migration completed')
}

runMigration().catch((err) => {
	console.error('Migration failed:', err)
	process.exit(1)
})
