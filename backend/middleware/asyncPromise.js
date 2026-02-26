const logger = require('../utility/logger')
module.exports = function (handler) {
	return async (resolve, reject) => {
		try {
			await handler(resolve, reject)
		} catch (exception) {
			reject(exception)
		}
	}
}
