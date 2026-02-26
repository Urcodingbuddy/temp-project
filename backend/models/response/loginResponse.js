const { object } = require('joi')

module.exports.LoginResponse = class LoginResponse {
	profile
	isSuperAdmin
	permissions
	authToken

	constructor(json) {
		if (json && typeof json === 'object') {
			this.profile = json.profile
			this.isSuperAdmin = json.isSuperAdmin
			this.permissions = json.permissions ?? []
			this.authToken = json.authToken
			this.pushNotificationEnabled = json.pushNotificationEnabled
		}
	}
}

module.exports.Profile = class Profile {
	email
	firstName
	middleName
	lastName
	fullName
	dob
	gender

	constructor(json) {
		if (json && typeof json === 'object') {
			this.email = json.email
			this.firstName = json.firstName
			this.middleName = json.middleName
			this.lastName = json.lastName
			this.fullName = json.fullName
			this.dob = json.dob
			this.gender = json.gender
			this.schoolOfTeacher = json.schoolOfTeacher
		}
	}
}
