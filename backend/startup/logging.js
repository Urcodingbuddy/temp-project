const { exceptions, transports, format, add, createLogger } = require('winston')
const logger = require('../utility/logger')
const { combine, timestamp, colorize, align, splat, prettyPrint } = format
require('express-async-errors')

module.exports = function () {
	console.log('Winston error handling set up')

	const custom_format = combine(
		colorize({ all: true, colors: { info: 'blue', error: 'red' } }),
		timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
		align(),
		splat(),
		prettyPrint((info) => `[${info.timestamp}] ${info.level}: ${info.message}`),
	)
	exceptions.handle(
		new transports.Console({ format: custom_format }), // This will help developer to understand the unhandled exceptions instead of going tot he log file.
		new transports.File({ format: custom_format, filename: 'uncaughtExceptions.log', dirname: 'logs' }),
	)

	// This is the another aprroach for the above code. This is the best way to handle the exception to wintson even if it wont detect automatically these rejection excveptions.
	process.on('unhandledRejection', (exception) => {
		try {
			throw exception // As we are using winston handleExceptions, which is basically detect the uncaught exceptions automatically, but not the unhandled promise rejections. This is the trick that if you throw this exception and winston method will catch it.
		} catch (unhandledException) {
			// Log the error using Winston
			// ...
			logger.error(unhandledException.stack ?? unhandledException.message ?? 'Unhandled Error')
		}
	})
}
