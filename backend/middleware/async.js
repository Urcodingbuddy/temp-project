const logger = require('../utility/logger')
module.exports = function (handler) {
	return async (req, res, next) => {
		try {
			await handler(req, res)
		} catch (exception) {
			logger.info('async exception')
			logger.error(exception)
			next(exception)
		}
	}
}
