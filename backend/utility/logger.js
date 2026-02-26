const myPeeguConfig = require('../startup/config').myPeeguConfig
const util = require('util')
const { createLogger, format, transports } = require('winston')
const { combine, timestamp, colorize, align, splat, prettyPrint, printf } = format

const myPeegu_logLevel = myPeeguConfig.app.logLevel.length <= 0 ? 'info' : myPeeguConfig.app.logLevel
console.log(`logLevel: ${myPeegu_logLevel}`)
const custom_format = combine(timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }), align(), splat())

const myPeegu_transports = [
	new transports.Console({
		format: combine(
			colorize({ all: true }),
			custom_format,
			printf((info) => {
				const pattern = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g
				return `timestamp: ${info.timestamp}, ${info.level}: ${info.level.replace(pattern, '') === 'info' ? info.message : util.inspect(info)}`
			}),
		),
		level: 'info',
	}),
	new transports.File({
		filename: 'info.log',
		dirname: 'logs',
		format: combine(
			custom_format,
			prettyPrint((info) => `[${info.timestamp}] ${info.level}: ${info.message}`),
		),
		level: 'info',
	}),
	new transports.File({
		filename: 'error.log',
		dirname: 'logs',
		format: combine(
			custom_format,
			prettyPrint((info) => `[${info.timestamp}] ${info.level}: ${info.message} `),
		),
		level: 'error',
	}),
]

const logger = createLogger({
	level: myPeegu_logLevel,
	transports: myPeegu_transports,
})

module.exports = logger
