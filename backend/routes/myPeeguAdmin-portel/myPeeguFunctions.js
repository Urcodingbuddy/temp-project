const express = require('express')
const logger = require('../../utility/logger')
const asyncPromiseMiddleware = require('../../middleware/asyncPromise')
const { myPeeguConfig } = require('../../startup/config')
const utils = require('../../utility/utils')
const mongooseErrorHandler = require('../../utility/mongooseErrorHandler')
const { SuccessResponse, FailureResponse, AlreadyExists } = require('../../models/response/globalResponse')
// const { KlipUser } = require('../../models/database/klip-user')
const { v4: uuidv4 } = require('uuid')
const { LoginResponse, Profile } = require('../../models/response/loginResponse')
// const { KlipUserTokens } = require('../../models/database/klip-userTokens')
const axios = require('axios').default
const { forEach, _ } = require('lodash')
const mongoose = require('mongoose')
const { MyPeeguUserTokens } = require('../../models/database/myPeegu-userTokens')

function fetchRequiredMyPeeguUsersPermissions(user) {
	//this will fetch all permissions
	if (user.permissions) {
		let userOperationsPermissions = {}
		user.permissions.forEach(
			(permission) => (userOperationsPermissions[permission] = globalConstants.permissions[permission]?.userOperationPermissions),
		)
		let newPermissions = user.permissions.flatMap((s) => {
			if (userOperationsPermissions.hasOwnProperty(s)) {
				return userOperationsPermissions[s]
			}
			return []
		})
		newPermissions = [...new Set(newPermissions)]
		return newPermissions
	}
	return []
}

// function fetchAppFeatureList(permissions) {
//     let features = []
//     let appFeatures = {}
//     permissions.forEach((permission) => appFeatures[permission] = globalConstants.permissions[permission]?.appFeatures)
//     features = permissions.flatMap(s => {
//         if (appFeatures.hasOwnProperty(s)) {
//             return appFeatures[s]
//         }
//         features = []
//     })
//     features = [...new Set(features)]
//     return features
// }
function fetchAppFeatureList(permissions) {
	let features = []
	let appFeatures = {}
	permissions.forEach((permission) => {
		appFeatures[permission] = globalConstants.permissions[permission]?.appFeatures
	})
	features = permissions.flatMap((s) => {
		if (appFeatures.hasOwnProperty(s)) {
			return appFeatures[s]
		}
		features = []
	})

	const mergedData = features.reduce((merged, obj) => {
		const key = Object.keys(obj)[0]
		const value = obj[key]
		merged[key] = merged[key] ? [...merged[key], ...value] : value
		return merged
	}, {})

	const mergedObject = {}
	Object.entries(mergedData).forEach(([key, value]) => {
		mergedObject[key] = [...new Set(value)]
	})

	return mergedObject
}

function createMyPeeguUserTokenAndSendActivationEmail(user, res, isResendActivation = false) {
	const userTokens = new MyPeeguUserTokens()
	userTokens.userId = user._id
	userTokens.token = uuidv4()
	userTokens.type = globalConstants.tokens.activation
	userTokens.status = globalConstants.tokens.sent
	userTokens
		.save()
		.then(() => {
			sendMyPeeguUserActivationEmail(user, userTokens, res, isResendActivation) //uncomment this
			//remove start block:1
			// logger.info(userTokens.token)
			// if (res) return res.json(new SuccessResponse(globalConstants.messages.userCreated))//TODO:remove once mail is setup(temp until mailing is setup)
			// else return
			//end block:1
		})
		.catch((error) => {
			logger.error(error)
			if (res) {
				const failureResponse = mongooseErrorHandler.handleError(error)
				logger.error(failureResponse)
				const errorMessage = error.message ?? globalConstants.messages.unknownError
				return res.status(400).json(new FailureResponse(errorMessage))
			}
			return false
		})
}
//  miscellaneous.myPeeguActivation,  miscellaneous.myPeeguResetPassword

function createMyPeeguUserTokenAndSendResetPasswordEmail(user, res) {
	const userTokens = new MyPeeguUserTokens()
	userTokens.userId = user._id
	userTokens.token = uuidv4()
	userTokens.type = globalConstants.tokens.resetPassword
	userTokens.status = globalConstants.tokens.sent
	userTokens
		.save()
		.then(() => {
			sendMyPeeguUserResetPasswordEmail(user, userTokens, res)
			// logger.info(userTokens.token)
			// if (res) return res.json(new SuccessResponse(globalConstants.messages.resetMailSent))//TODO:remove once mail is setup(temp until mailing is setup)
			// else return
		})
		.catch((error) => {
			const failureResponse = mongooseErrorHandler.handleError(error)
			logger.error(failureResponse)
			const errorMessage = error.message ?? globalConstants.messages.unknownError
			return res.status(400).json(new FailureResponse(errorMessage)) // TODO: response
		})
}

function validateTheToken(token) {
	return new Promise(
		asyncPromiseMiddleware(async (resolve, reject) => {
			const result = await MyPeeguUserTokens.findOne({ token: token }).where('status').equals(globalConstants.tokens.sent)
			if (result) {
				if (utils.timeStampDifference(result.createdAt) > miscellaneous.myPeeguExpirationDuration) {
					result.status = globalConstants.tokens.expired
					await result.save()
					resolve(false)
				}
				resolve(true)
			} else {
				resolve(false)
			}
		}),
	)
}

function sendMyPeeguUserActivationEmail(user, userToken, res, isResendActivation) {
	const data = {
		recipientEmail: user.email,
		name: ` ${utils.getFullName(user)}`,
		projectName: ` ${globalConstants.appName}`,
		activationLink: miscellaneous.activationLinkBase + `?token=${userToken.token}`,
		website: globalConstants.website,
		companyName: globalConstants.companyName,
		companyLogo: globalConstants.companyLogo,
		companyAddress: globalConstants.companyAddress,
	}
	// const config = {
	//     maxBodyLength: Infinity,
	//     headers: {
	//         'x-api-key': miscellaneous.lambdaApiKey,
	//         'Content-Type': 'application/json'
	//     }
	// }
	axios
		.post(miscellaneous.myPeeguActivation, data)
		.then((response) => {
			if (res) {
				return res.json(
					new SuccessResponse(
						isResendActivation === false ? globalConstants.messages.userCreated : globalConstants.messages.resentActivationMail,
					),
				)
			}
			return true
		})
		.catch((error) => {
			logger.error(error)
			if (res) {
				const errorMessage = error.message ?? globalConstants.messages.unknownError
				const failureResponse = new FailureResponse(errorMessage)
				return res.status(400).json(failureResponse)
			}
			return false
		})
}

function sendMyPeeguUserResetPasswordEmail(user, userToken, res) {
	const data = {
		recipientEmail: user.email,
		name: utils.getFullName(user),
		projectName: ` ${globalConstants.appName}`,
		resetPasswordLink: miscellaneous.resetPasswordBase + `?token=${userToken.token}`,
		website: globalConstants.website,
		companyName: globalConstants.companyName,
		companyLogo: globalConstants.companyLogo,
		companyAddress: globalConstants.companyAddress,
	}
	// const config = {
	//     maxBodyLength: Infinity,
	//     headers: {
	//         'x-api-key': miscellaneous.lambdaApiKey,
	//         'Content-Type': 'application/json'
	//     }
	// }
	axios
		.post(miscellaneous.myPeeguResetPassword, data)
		.then((response) => {
			if (res) {
				return res.json(new SuccessResponse(globalConstants.messages.resetMailSent))
			}
			return true
		})
		.catch((error) => {
			logger.error(error)
			if (res) {
				const errorMessage = error.message ?? globalConstants.messages.unknownError
				const failureResponse = new FailureResponse(errorMessage)
				return res.status(400).json(failureResponse)
			}
			return false
		})
}

function createLoginResponse(userInfo, isSuperAdmin, showAuthToken = true, cbseCircularPdfAddress, icseCircularPdfAddress, assignedClassrooms = []) {
	const loginResponse = new LoginResponse()
	const profileInfo = new Profile()
	profileInfo.email = userInfo.email
	profileInfo.user_id = userInfo.user_id
	profileInfo.firstName = userInfo.firstName
	profileInfo.lastName = userInfo.lastName
	profileInfo.phone = userInfo.phone
	profileInfo.profilePictureUrl = userInfo.profilePictureUrl
	profileInfo.middleName = userInfo.middleName
	profileInfo.profilePicture = userInfo.profilePicture
	profileInfo.privateUrl = userInfo.privateUrl
	profileInfo.fullName = userInfo.fullName
	profileInfo.cbseCircularPdfAddress = cbseCircularPdfAddress
	profileInfo.icseCircularPdfAddress = icseCircularPdfAddress
	profileInfo.dob = userInfo.dob
	profileInfo.gender = userInfo.gender
	profileInfo.schoolOfTeacher = userInfo.schoolOfTeacher
	loginResponse.profile = profileInfo
	loginResponse.assignedSchools = userInfo.assignedSchools
	loginResponse.appFeatures = fetchAppFeatureList(userInfo.permissions)
	loginResponse.isSuperAdmin = isSuperAdmin ?? false
	loginResponse.permissions = userInfo.permissions
	loginResponse.managingPermissions = fetchRequiredMyPeeguUsersPermissions(userInfo)
	loginResponse.authToken = showAuthToken ? userInfo.authToken : undefined
	loginResponse.assignedClassrooms = assignedClassrooms
	return loginResponse
}

function sanitizeEmail(email) {
	if (typeof email !== 'string') {
		return ''
	}
	// Trim the email
	const trimmedEmail = email.trim()
	// Remove non-alphanumeric characters except for "-", "_", and "@"
	const sanitizedEmail = trimmedEmail.replace(/[^a-zA-Z0-9-_\+@]/g, '')
	return sanitizedEmail
}

function validateS3File(files, fileName) {
	if (files && fileName) {
		// will check if the picture link exists in record retrieved from s3
		// const result = picture.replace(miscellaneous.klipS3Link, "")
		const match = files.find((element) => element === fileName)
		if (!match) return false
		return true
	}
	return false
}

function sanitizeAndValidateAcedemicYear(input) {
	const sanitizedInput = input.replace(/[^0-9-]/g, '')
	const academicYearPattern = /^(202[0-9]|2030)-(202[0-9]|2030)$/
	return academicYearPattern.test(sanitizedInput)
}

function sanitizeAndValidatePhoneNumber(input) {
	// Validate the sanitized input
	const phoneNumberPattern = /^\d+$/
	return phoneNumberPattern.test(input)
}

module.exports = {
	sanitizeAndValidatePhoneNumber,
	sanitizeAndValidateAcedemicYear,
	createMyPeeguUserTokenAndSendActivationEmail,
	validateS3File,
	createMyPeeguUserTokenAndSendResetPasswordEmail,
	createLoginResponse,
	validateTheToken,
	fetchRequiredMyPeeguUsersPermissions,
	fetchAppFeatureList,
}
