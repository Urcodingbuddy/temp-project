const { FailureResponse } = require('../models/response/globalResponse')
const {
	fetchRequiredMyPeeguUsersPermissions,
} = require('../routes/myPeeguAdmin-portel/myPeeguFunctions')
const logger = require('../utility/logger')

module.exports.validateUserManagement = function (req, res, next) {
	try {
		let result = globalConstants.managementPermissions.UserManagement.some((permission) =>
			req.user.permissions.includes(permission),
		)
		if (result === true) {
			const allowedPermissions = fetchRequiredMyPeeguUsersPermissions(req.user)
			req.allowedPermissions = allowedPermissions
			next()
		} else {
			res.status(400).json(new FailureResponse(globalConstants.messages.notAuthorised))
		}
	} catch (exception) {
		logger.error(exception)
		next(exception)
	}
}

module.exports.editSchool = function (req, res, next) {
	try {
		let result = req.user.appFeatures.SchoolManagement.includes(globalConstants.actions.edit)
		if (
			result === true &&
			req.user.permissions.some((item) => globalConstants.adminList.includes(item))
		) {
			next()
		} else {
			res.status(400).json(new FailureResponse(globalConstants.messages.notAuthorised))
		}
	} catch (exception) {
		logger.error(exception)
		next(exception)
	}
}

module.exports.deleteSchool = function (req, res, next) {
	try {
		let result = req.user.appFeatures.SchoolManagement.includes(globalConstants.actions.delete)
		if (
			result === true &&
			req.user.permissions.some((item) => globalConstants.adminList.includes(item))
		) {
			next()
		} else {
			res.status(400).json(new FailureResponse(globalConstants.messages.notAuthorised))
		}
	} catch (exception) {
		logger.error(exception)
		next(exception)
	}
}

module.exports.editCounselor = function (req, res, next) {
	try {
		let result = req.user.appFeatures.CounselorManagement.includes(globalConstants.actions.edit)
		if (
			result === true &&
			req.user.permissions.some((item) => globalConstants.adminList.includes(item))
		) {
			next()
		} else {
			res.status(400).json(new FailureResponse(globalConstants.messages.notAuthorised))
		}
	} catch (exception) {
		logger.error(exception)
		next(exception)
	}
}
module.exports.viewCounselor = function (req, res, next) {
	try {
		let result = req.user.appFeatures.CounselorManagement?.includes(
			globalConstants.actions.view,
		)
		if (
			result === true &&
			req.user.permissions.some((item) => globalConstants.adminList?.includes(item))
		) {
			next()
		} else {
			res.status(400).json(new FailureResponse(globalConstants.messages.notAuthorised))
		}
	} catch (exception) {
		logger.error(exception)
		next(exception)
	}
}

module.exports.viewSchool = function (req, res, next) {
	try {
		let result = req.user.appFeatures.SchoolManagement.includes(globalConstants.actions.view)
		if (
			result === true &&
			req.user.permissions.some((item) => globalConstants.adminList.includes(item))
		) {
			next()
		} else {
			res.status(400).json(new FailureResponse(globalConstants.messages.notAuthorised))
		}
	} catch (exception) {
		logger.error(exception)
		next(exception)
	}
}

module.exports.deleteCounselor = function (req, res, next) {
	try {
		let result = req.user.appFeatures.CounselorManagement.includes(
			globalConstants.actions.delete,
		)
		if (
			result === true &&
			req.user.permissions.some((item) => globalConstants.adminList.includes(item))
		) {
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
		if (
			result === true &&
			req.user.permissions.some((item) => globalConstants.adminList.includes(item))
		) {
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
		let result = req.user.appFeatures.StudentManagement.includes(globalConstants.actions.view)
		if (
			result === true &&
			req.user.permissions.some((item) => globalConstants.adminList.includes(item))
		) {
			next()
		} else {
			res.status(400).json(new FailureResponse(globalConstants.messages.notAuthorised))
		}
	} catch (exception) {
		logger.error(exception)
		next(exception)
	}
}
