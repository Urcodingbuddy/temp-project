const { FailureResponse } = require('../models/response/globalResponse')
const { MyPeeguUser } = require('../models/database/myPeegu-user')
const { fetchAppFeatureList, fetchRequiredMyPeeguUsersPermissions } = require('../routes/myPeeguAdmin-portel/myPeeguFunctions')

module.exports.authMyPeeguUser = async function (req, res, next) {
	//validate the auth token provided in headers
	const token = req.header('auth-token')
	if (!token) {
		const failureResponse = new FailureResponse(globalConstants.messages.noToken)
		return res.status(401).json(failureResponse)
	}
	const user = await MyPeeguUser.findOne({ authToken: token })

	if (user) {
		req.user = user.toObject()
		req.authToken = token
		req.user.isAdmin = req.user.permissions.some((item) => globalConstants?.adminList?.includes(item))
		req.user.appFeatures = fetchAppFeatureList(req.user.permissions)
		const allowedPermissions = fetchRequiredMyPeeguUsersPermissions(req?.user)
		req.allowedPermissions = allowedPermissions
		next()
	} else {
		const failureResponse = new FailureResponse(globalConstants.messages.invalidToken)
		return res.status(401).json(failureResponse)
	}
}
