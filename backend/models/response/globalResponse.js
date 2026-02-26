module.exports.SuccessResponse = class SuccessResponse {
	message
	constructor(value) {
		this.message = value
	}
}

module.exports.FailureResponse = class FailureResponse {
	error
	constructor(value) {
		this.error = value
	}
}

module.exports.AlreadyExists = class AlreadyExists {
	error
	constructor(value) {
		this.error = value
	}
}
