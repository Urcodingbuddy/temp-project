const mongoose = require('mongoose')
const { States } = require('../../models/database/states')
const { states: IndStates } = require('../../resources/regions/states/India')
const { states: AusStates } = require('../../resources/regions/states/australia')
const { states: UaeStates } = require('../../resources/regions/states/uae')
const { states: MaldivesStates } = require('../../resources/regions/states/maldives')

const MONGODB_URI =
	'mongodb+srv://mypeeguserver:fzhZb0U9zNjwJswY@mypeegu-dev.zle6nri.mongodb.net/mypeegu' // Change this

async function runMigration() {
	console.log('Migration started...')
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to MongoDB')

	console.log('Insert India States started.........')
	const IndPromises = IndStates.map((state) => States.create({name: state.name, country: new mongoose.Types.ObjectId('683535fbcba5a9e492315c3f')}))
	await Promise.all(IndPromises)
	console.log('Insert India States completed.........')

	console.log('Insert Aus States started.........')
	const AusPromises = AusStates.map((state) => States.create({name: state.name, country: new mongoose.Types.ObjectId('683535fbcba5a9e492315bfc')}))
	await Promise.all(AusPromises)
	console.log('Insert Aus States completed.........')

	console.log('Insert USE States started.........')
	const UaePromises = UaeStates.map((state) => States.create({name: state.name, country: new mongoose.Types.ObjectId('683535fbcba5a9e492315caa')}))
	await Promise.all(UaePromises)
	console.log('Insert USE States completed.........')

	console.log('Insert Maldives States started.........')
	const MaldivesPromises = MaldivesStates.map((state) => States.create({name: state.name, country: new mongoose.Types.ObjectId('683535fbcba5a9e492315c5c')}))
	await Promise.all(MaldivesPromises)
	// console.log('Insert Maldives States completed.........')

	await mongoose.disconnect()
	console.log('States inserted')
}

runMigration().catch((err) => {
	console.error('Migration failed:', err)
	process.exit(1)
})
