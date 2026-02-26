const mongoose = require('mongoose')
const { Countries } = require('../../models/database/countries')
const { countries } = require('../../resources/regions/countries')
const { MONGODB_URI } = require('./migrations-utils')

async function runMigration() {
	console.log(countries)

	console.log('Migration started...')
	await mongoose.connect(MONGODB_URI)
	console.log('Connected to MongoDB')

	console.log('Insert countries started.........')
	console.log('---------->', typeof countries, Array.isArray(countries))
	const countriesPromises = countries.map((country) => Countries.create(country))
	await Promise.all(countriesPromises)
	console.log('Insert countries completed.........')

	await mongoose.disconnect()
	console.log('Countries inserted')
}

runMigration().catch((err) => {
	console.error('Migration failed:', err)
	process.exit(1)
})
