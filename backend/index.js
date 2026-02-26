const express = require('express')
const app = express()
const logger = require('./utility/logger')
const { myPeeguConfig, validateConfig } = require('./startup/config')
const { fetchTheLatestConfigFromDatabase } = require('./routes/common/globalFunctions')
const mongoose = require('mongoose')
const { loadInitialData, setupOtherSchemeConfig } = require('./cache/dataLoader')
const { startScheduler } = require('./schedulers')

// DO NOT REMOVE THIS SEMICOLAN
const { initWatchers } = require('./cache/watcher.service')

;(async function run() {
	require('./utility/global-extensions')
	validateConfig()
	//Set up default mongoose connection
	require('./startup/database')

	const mongoDB = myPeeguConfig.db.path
	await mongoose
		.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
		.catch((error) => {
			logger.info(
				'Unable to initiate Mongoose default connection, because of the error: %s',
				error.message,
			)
			process.exit(0)
		})
	console.log('🔄 Fetching config from database...')
	await fetchTheLatestConfigFromDatabase()
	console.log('✅ Config fetched')

	console.log('🔄 Setting up schema indexes...')
	await setupOtherSchemeConfig()
	console.log('✅ Schema indexes synced')

	console.log('🔄 Loading initial data into cache...')
	await loadInitialData()
	console.log('✅ Initial data loaded')

	console.log('🔄 Initializing watchers...')
	initWatchers()
	console.log('✅ Watchers initialized')

	console.log('🔄 Starting scheduler...')
	startScheduler()
	console.log('✅ Scheduler started')

	app.get('/', (req, res) => {
		res.send('Welcome to MyPeegu App!')
	})
	// process.env.TZ = 'UTC'
})().then(() => {
	;(require('./startup/routes')(app),
		require('./startup/logging')(),
		require('./startup/prod')(app))
	const port = myPeeguConfig.app.port || process.env.myPeegu_PORT || 3004
	console.log({ port })
	const server = app.listen(port, () => logger.info(`listening on port ${port}...`))
	module.exports = server
})
