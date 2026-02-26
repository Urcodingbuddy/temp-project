const logger = require('../utility/logger')
const { myPeeguConfig } = require('../startup/config')

//Import the mongoose module
const mongoose = require('mongoose')
const mongoDB = myPeeguConfig.db.path

//Get the default connection
const db = mongoose.connection

// CONNECTION EVENTS
//Bind connection to error event (to get notification of connection errors)
db.on('error', function (error) {
	logger.error('Mongoose default connection error: %s', error)
})

// When successfully connected
db.on('connected', function () {
	logger.info('Mongoose default connection open to ' + mongoDB)
})

// When the connection is disconnected
db.on('disconnected', function () {
	logger.info('Mongoose default connection disconnected')
})

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function () {
	db.close()
	process.exit(0)
})

module.exports = db
