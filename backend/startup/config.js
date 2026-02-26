const config = require('config')

const myPeeguConfig = {
	app: {
		name: String(config.get('name')),
		environment: String(config.get('environment')),

		port: parseInt(config.get('port')) || 3004,
		logLevel: String(config.get('logLevel')),
	},
	secrets: {
		superAdminKey: String(config.get('superAdminKey')),
		jwtPrivateKey: String(config.get('jwtPrivateKey')),
		myPeeguAccessKeyId: String(config.get('myPeeguAccessKeyId')),
		myPeeguSecretAccessKey: String(config.get('myPeeguSecretAccessKey')),
	},
	db: {
		path: String(config.get('dbPath')),
	},
}

const validateConfig = () => {
	if (!myPeeguConfig.secrets.jwtPrivateKey) throw new Error('FATAL ERROR: jwtPrivateKey is not defined')
}

module.exports.myPeeguConfig = myPeeguConfig
module.exports.validateConfig = validateConfig
