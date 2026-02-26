const { FailureResponse } = require('../models/response/globalResponse')
const {
	fetchRequiredMyPeeguUsersPermissions,
	fetchAppFeatureList,
} = require('../routes/myPeeguAdmin-portel/myPeeguFunctions')
const logger = require('../utility/logger')

// module.exports.validateUserManagement = function (req, res, next) {
//     try {
//         let result = globalConstants.managementPermissions.UserManagement.some(permission => req.user.permissions.includes(permission))
//         if (result === true) {
//             const allowedPermissions = fetchRequiredMyPeeguUsersPermissions(req.user)
//             req.allowedPermissions = allowedPermissions
//             next()
//         } else {
//             res.status(400).json(new FailureResponse(globalConstants.messages.notAuthorised))
//         }
//     } catch (exception) {
//         logger.error(exception)
//         next(exception)
//     }
// }

module.exports.viewSchool = function (req, res, next) {
	try {
		let result = req.user.appFeatures.SchoolManagement.includes(globalConstants.actions.view)
		if (
			result === true &&
			req.user.permissions.some((item) => globalConstants.counselorList.includes(item))
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

module.exports.editClassroom = function (req, res, next) {
	try {
		let result = req.user.appFeatures.ClassroomManagement.includes(globalConstants.actions.edit)
		if (
			result === true &&
			req.user.permissions.some((item) => globalConstants.counselorList.includes(item))
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
			req.user.permissions.some((item) => globalConstants.counselorList.includes(item))
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

module.exports.deleteClassroom = function (req, res, next) {
	try {
		let result = req.user.appFeatures.ClassroomManagement.includes(
			globalConstants.actions.delete,
		)
		if (
			result === true &&
			req.user.permissions.some((item) => globalConstants.counselorList.includes(item))
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

module.exports.editStudents = function (req, res, next) {
	try {
		let result = req.user.appFeatures.StudentManagement.includes(globalConstants.actions.edit)
		if (
			result === true &&
			(req.user.permissions.some((item) => globalConstants.counselorList.includes(item)) ||
				req.user.permissions.some((item) => ['Teacher'].includes(item)))
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
			(req.user.permissions.some((item) => globalConstants.counselorList.includes(item)) ||
				req.user.permissions.some((item) => globalConstants.adminList.includes(item)))
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

module.exports.canViewedByTeacherOrHigherUser = function (req, res, next) {
	try {
		// ✅ Stop execution immediately after next()
		if (req.user.permissions[0] === globalConstants.teacher) {
			return next()
		}

		const result = req.user.appFeatures.StudentManagement.includes(globalConstants.actions.view)
		if (
			result === true &&
			(req.user.permissions.some((item) => globalConstants.counselorList.includes(item)) ||
				req.user.permissions.some((item) => globalConstants.adminList.includes(item)))
		) {
			return next() // ✅ also return here
		}

		return res.status(400).json(new FailureResponse(globalConstants.messages.notAuthorised))
	} catch (exception) {
		logger.error(exception)
		return next(exception)
	}
}

module.exports.canEditByTeacherOrHigherUser = function (req, res, next) {
	try {
		// ✅ Stop execution immediately after next()
		if (req.user.permissions[0] === globalConstants.teacher) {
			return next()
		}

		const result = req.user.appFeatures.StudentManagement.includes(globalConstants.actions.view)
		if (
			result === true &&
			(req.user.permissions.some((item) => globalConstants.counselorList.includes(item)) ||
				req.user.permissions.some((item) => globalConstants.adminList.includes(item)))
		) {
			return next() // ✅ also return here
		}

		return res.status(400).json(new FailureResponse(globalConstants.messages.notAuthorised))
	} catch (exception) {
		logger.error(exception)
		return next(exception)
	}
}

module.exports.deleteStudents = function (req, res, next) {
	try {
		let result = req.user.appFeatures.StudentManagement.includes(globalConstants.actions.delete)
		if (
			result === true &&
			req.user.permissions.some((item) => globalConstants.counselorList.includes(item))
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

module.exports.viewBaseline = function (req, res, next) {
	try {
		let result = req.user.appFeatures.StudentManagement.includes(globalConstants.actions.view)
		if (
			(result === true &&
				(req.user.permissions.some((item) =>
					globalConstants.counselorList.includes(item),
				) ||
					req.user.permissions.some((item) =>
						globalConstants.adminList.includes(item),
					))) ||
			req.user.permissions.some((item) => item === globalConstants.otherUsers.teacher)
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

module.exports.editBaseline = function (req, res, next) {
	try {
		let result = req.user.appFeatures.StudentManagement.includes(globalConstants.actions.edit)
		if (
			(result === true &&
				(req.user.permissions.some((item) =>
					globalConstants.counselorList.includes(item),
				) ||
					req.user.permissions.some((item) =>
						globalConstants.adminList.includes(item),
					))) ||
			req.user.permissions.some((item) => item === globalConstants.otherUsers.teacher)
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

module.exports.deleteBaseline = function (req, res, next) {
	try {
		let result = req.user.appFeatures.StudentManagement.includes(globalConstants.actions.delete)
		if (
			(result === true &&
				(req.user.permissions.some((item) =>
					globalConstants.counselorList.includes(item),
				) ||
					req.user.permissions.some((item) =>
						globalConstants.adminList.includes(item),
					))) ||
			req.user.permissions.some((item) => item === globalConstants.otherUsers.teacher)
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
