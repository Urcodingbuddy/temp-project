const { FailureResponse } = require('../models/response/globalResponse')
const logger = require('../utility/logger')
module.exports = function (err, req, res, next) {
	// Logging to file
	logger.error(err.message, err)
	res.status(500).json({ error: 'Internal Server Error' })
}
