const { FailureResponse } = require('../models/response/globalResponse')
const { fetchRequiredMyPeeguUsersPermissions, fetchAppFeatureList } = require('../routes/myPeeguAdmin-portel/myPeeguFunctions')
const logger = require('../utility/logger')

module.exports.viewSchool = function (req, res, next) {
	try {
		let result = req.user.appFeatures.SchoolManagement.includes(globalConstants.actions.view)
		if (result === true) {
			next()
		} else {
			res.status(400).json(new FailureResponse(globalConstants.messages.notAuthorised))
		}
	} catch (exception) {
		logger.error(exception)
		next(exception)
	}
}

module.exports.viewClassroom = function (req, res, next) {
	try {
		let result = req.user.appFeatures.ClassroomManagement.includes(globalConstants.actions.view)
		if (result === true) {
			next()
		} else {
			res.status(400).json(new FailureResponse(globalConstants.messages.notAuthorised))
		}
	} catch (exception) {
		logger.error(exception)
		next(exception)
	}
}

module.exports.viewStudents = function (req, res, next) {
	try {
		let result = req?.user?.appFeatures?.StudentManagement?.includes(globalConstants.actions.view)
		if (result === true) {
			next()
		} else {
			res.status(400).json(new FailureResponse(globalConstants.messages.notAuthorised))
		}
	} catch (exception) {
		logger.error(exception)
		next(exception)
	}
}
