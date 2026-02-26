const { FailureResponse } = require('../models/response/globalResponse')
const logger = require('../utility/logger')
const mongoose = require('mongoose')

const handleValidationError = (err) => {
	if (err instanceof mongoose.Error.ValidationError && err.errors) {
		const key = Object.keys(err.errors)[0]
		return err.errors[key]
	}
	return null
}

const handleError = (error) => {
	let message = error && error.message ? error.message : 'Something went wrong'

	const validationError = handleValidationError(error)
	if (validationError) {
		message = `Invalid ${validationError.path || ''}: ${validationError.value || ''}.`
		if (validationError.properties && validationError.properties.message) {
			message = validationError.properties.message
		}
	}

	if (error) {
		logger.error(error.stack || error)
	}

	return new FailureResponse(message)
}

module.exports.handleError = handleError
