module.exports.ActivationResponse = class ActivationResponse {
	message
	uniqueKey
	constructor(message, uniqueKey) {
		this.message = message
		this.uniqueKey = uniqueKey
	}
}
