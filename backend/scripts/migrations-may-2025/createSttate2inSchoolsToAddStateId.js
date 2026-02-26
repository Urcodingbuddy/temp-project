const mongoose = require('mongoose')
const { Schools } = require('../../models/database/myPeegu-school')
const { MONGODB_URI } = require('./migrations-utils')

const states = [
	{
		city: 'Ajman',
		state: 'Dubai',
		stateId: '683538a20363c288678dc5f3',
		countryId: '683535fbcba5a9e492315caa',
	},
	{
		city: 'Ajman',
		state: 'UAE',
		stateId: '683538a20363c288678dc5f3',
		countryId: '683535fbcba5a9e492315caa',
	},
	{
		city: 'bangalore',
		state: 'Karnataka',
		stateId: '683538a10363c288678dc593',
		countryId: '683535fbcba5a9e492315c3f',
	},
	{
		city: 'Bangalore',
		state: 'Karnataka',
		stateId: '683538a10363c288678dc593',
		countryId: '683535fbcba5a9e492315c3f',
	},
	{
		city: 'Bangalore',
		state: 'karnataka',
		stateId: '683538a10363c288678dc593',
		countryId: '683535fbcba5a9e492315c3f',
	},
	{
		city: 'Bengaluru',
		state: 'Karnataka',
		stateId: '683538a10363c288678dc593',
		countryId: '683535fbcba5a9e492315c3f',
	},
	{
		city: 'Dubai',
		state: 'Middle east',
		stateId: '683538a20363c288678dc5f3',
		countryId: '683535fbcba5a9e492315caa',
	},
	{
		city: 'Faridabad',
		state: 'Haryana',
		stateId: '683538a10363c288678dc590',
		countryId: '683535fbcba5a9e492315c3f',
	},
	{
		city: 'Greater noida',
		state: 'Uttar Pradesh',
		stateId: '683538a10363c288678dc5a2',
		countryId: '683535fbcba5a9e492315c3f',
	},
	{
		city: 'Gurugram',
		state: 'Haryana',
		stateId: '683538a10363c288678dc590',
		countryId: '683535fbcba5a9e492315c3f',
	},
	{
		city: 'Gurugram',
		state: 'Gurugram',
		stateId: '683538a10363c288678dc590',
		countryId: '683535fbcba5a9e492315c3f',
	},
	{
		city: 'Hosur',
		state: 'Tamil naidu',
		stateId: '683538a10363c288678dc59f',
		countryId: '683535fbcba5a9e492315c3f',
	},
	{
		city: 'Hyderabad',
		state: 'Telangana',
		stateId: '683538a10363c288678dc5a0',
		countryId: '683535fbcba5a9e492315c3f',
	},
	{
		city: 'Male',
		state: 'Maldives',
		stateId: '68370b375eff0cc2b1e2349a',
		countryId: '683535fbcba5a9e492315c5c',
	},
	{
		city: 'Nagpur',
		state: 'Maharastra',
		stateId: '683538a10363c288678dc596',
		countryId: '683535fbcba5a9e492315c3f',
	},
	{
		city: 'Nashik',
		state: 'Maharashtra',
		stateId: '683538a10363c288678dc596',
		countryId: '683535fbcba5a9e492315c3f',
	},
	{
		city: 'Nasik',
		state: 'Maharastra',
		stateId: '683538a10363c288678dc596',
		countryId: '683535fbcba5a9e492315c3f',
	},
	{
		city: 'Pune',
		state: 'Maharastra',
		stateId: '683538a10363c288678dc596',
		countryId: '683535fbcba5a9e492315c3f',
	},
	{
		city: 'Sonipat',
		state: 'Haryana',
		stateId: '683538a10363c288678dc590',
		countryId: '683535fbcba5a9e492315c3f',
	},
	{
		city: 'Varanasi',
		state: 'Varanasi',
		stateId: '683538a10363c288678dc5a2',
		countryId: '683535fbcba5a9e492315c3f',
	},
]

// Create state2 with value as stateId, also create country with value countryId
async function runMigration() {
	console.log('Migration started...')
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to MongoDB')

	// const schools = await Schools.find({}, { city: 1, state: 1 })

	// const schoolBulkOperations = []
	// console.log(schools)
	// let sc = 0
	// for (const school of schools) {
	// 	// console.log(school.state, states[0].state, school.state === states[0].state)
	// 	const region = states.find((reg) => reg.city === school.city)
	// 	console.log('----', region)
	// 	if (region) {
	// 		const data = {
	// 			updateOne: {
	// 				filter: { _id: school._id },
	// 				update: {
	// 					$set: {
	// 						state2: new mongoose.Types.ObjectId(region.stateId),
	// 						country: new mongoose.Types.ObjectId(region.countryId),
	// 					},
	// 				},
	// 			},
	// 		}
	// 		schoolBulkOperations.push(data)
	// 	}
	// }
	// console.log('---------------BULK LENGTH---------------', schoolBulkOperations.length)
	// await Schools.bulkWrite(schoolBulkOperations)

	for (const { city, state, stateId, countryId } of states) {
		const update = await Schools.updateMany(
			{
				city: new RegExp(`^${city}$`, 'i'), // case-insensitive match
				state1: new RegExp(`^${state}$`, 'i'),
			},
			{
				$set: {
					state: new mongoose.Types.ObjectId(stateId),
					country: new mongoose.Types.ObjectId(countryId),
				},
			},
		)
		console.log(update)
	}

	await mongoose.disconnect()
	console.log('Migration completed')
}

runMigration().catch((err) => {
	console.error('Migration failed:', err)
	process.exit(1)
})
