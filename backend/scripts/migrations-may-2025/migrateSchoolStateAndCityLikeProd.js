const states = [
	{ city: 'Ajman', state: 'Dubai' },
	{ city: 'bangalore', state: 'Karnataka' },
	{ city: 'Bangalore', state: 'Karnataka' },
	{ city: 'Bangalore', state: 'karnataka' },
	{ city: 'Bengaluru', state: 'Karnataka' },
	{ city: 'Dubai', state: 'Middle east' },
	{ city: 'Faridabad', state: 'Haryana' },
	{ city: 'Greater noida', state: 'Uttar Pradesh' },
	{ city: 'Gurugram', state: 'Haryana' },
	{ city: 'Gurugram', state: 'Gurugram' },
	{ city: 'Hosur', state: 'Tamil naidu' },
	{ city: 'Hyderabad', state: 'Telangana' },
	{ city: 'Male', state: 'Maldives' },
	{ city: 'Nagpur', state: 'Maharastra' },
	{ city: 'Nashik', state: 'Maharashtra' },
	{ city: 'Nasik', state: 'Maharastra' },
	{ city: 'Pune', state: 'Maharastra' },
	{ city: 'Sonipat', state: 'Haryana' },
	{ city: 'Varanasi', state: 'Varanasi' },
]

const mongoose = require('mongoose')
const { Schools } = require('../../models/database/myPeegu-school')

const MONGODB_URI = 'mongodb+srv://mypeeguserver:fzhZb0U9zNjwJswY@mypeegu-dev.zle6nri.mongodb.net/mypeegu' // Change this

async function runMigration() {
	console.log('Migration started...')
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to MongoDB')

	const schools = await Schools.find()

	const schoolBulkOperations = []

	for (const school of schools) {
		const index = Math.floor(Math.random() * 19)
		const region = states[index]
		console.log(index, '----', region)
		const data = {
			updateOne: {
				filter: { _id: school._id },
				update: { $set: region },
			},
		}
		schoolBulkOperations.push(data)
	}
	console.log('---------------BULK LENGTH---------------', schoolBulkOperations.length)
	await Schools.bulkWrite(schoolBulkOperations)

	await mongoose.disconnect()
	console.log('Migration completed')
}

runMigration().catch((err) => {
	console.error('Migration failed:', err)
	process.exit(1)
})
