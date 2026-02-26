const express = require('express')
const router = express.Router()
const logger = require('../../utility/logger')
const asyncMiddleware = require('../../middleware/async')
const bcrypt = require('bcrypt')
const { myPeeguConfig } = require('../../startup/config')
const utils = require('../../utility/utils')
const mongooseErrorHandler = require('../../utility/mongooseErrorHandler')
const {
	SuccessResponse,
	FailureResponse,
	AlreadyExists,
} = require('../../models/response/globalResponse')
const { v4: uuidv4 } = require('uuid')
const { authMyPeeguUser } = require('../../middleware/auth')
const { MyPeeguUser } = require('../../models/database/myPeegu-user')
const { MyPeeguUserTokens } = require('../../models/database/myPeegu-userTokens')
const {
	createMyPeeguUserTokenAndSendActivationEmail,
	fetchRequiredMyPeeguUsersPermissions,
	createMyPeeguUserTokenAndSendResetPasswordEmail,
	validateTheToken,
	createLoginResponse,
} = require('./myPeeguFunctions')
const {
	viewCounselor,
	editCounselor,
	deleteSchool,
	editSchool,
	validateUserManagement,
} = require('../../middleware/validate.myPeeguManagement')
const {
	listOfFiles,
	deleteImageFromS3,
	uploadImage,
	generatePreSignedUrl,
	isFileExistInS3,
} = require('../AWSS3Manager')
const { set, toDate } = require('date-fns')
const { Schools } = require('../../models/database/myPeegu-school')
const { Classrooms } = require('../../models/database/myPeegu-classroom')
const { Students } = require('../../models/database/myPeegu-student')
const { Teacher } = require('../../models/database/myPeegu-teacher')
const { Countries } = require('../../models/database/countries')
const { States } = require('../../models/database/states')
const { AcademicYears } = require('../../models/database/academic-years')
const { years } = require('../../utility/databaseConstants')
const { months, STATUSES } = require('../../utility/localConstants')
const { globalServices } = require('../../services/global-service')

//onboarding
router.post(
	'/createsuperadmin',
	asyncMiddleware(async (req, res) => {
		//create a new superadmin
		if (req.body.superAdminKey != myPeeguConfig.secrets.superAdminKey)
			return res.status(401).json(new FailureResponse(globalConstants.messages.notAuthorised))
		const result = await MyPeeguUser.findOne({
			permissions: globalConstants.SuperAdmin,
		})
		if (result) {
			const alreadyExists = new AlreadyExists(globalConstants.messages.userExists)
			return res.status(400).json(alreadyExists)
		} else {
			if (!utils.isValidMyPeeguUserEmail(req.body.email))
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.invalidEmailDomain))
			const superAdmin = new MyPeeguUser(req.body)
			superAdmin.password = '' //empty password untill activation is success
			superAdmin.uniqueKey = uuidv4() //adding uuid
			superAdmin.permissions = globalConstants.SuperAdmin
			superAdmin.status = miscellaneous.myPeeguUserStatus.Invited
			superAdmin.fullName = utils.fullName(superAdmin.firstName, superAdmin.lastName)
			superAdmin
				.save()
				.then((result) => {
					createMyPeeguUserTokenAndSendActivationEmail(result, res)
				})
				.catch((error) => {
					const failureResponse = mongooseErrorHandler.handleError(error)
					return res.status(400).json(failureResponse)
				})
		}
	}),
)

// Throughout this application where ever you see peeguCounselor, scCounselor and Principal all are Users of the system
router.post('/createuser', authMyPeeguUser, validateUserManagement, async (req, res) => {
	const { email, permissions, phone, firstName } = req.body || {}
	if (!email || !utils.isAValidString(firstName)) {
		return res.status(400).json(new FailureResponse(globalConstants.messages.missingParameters))
	}
	if (!utils.isValidMyPeeguUserEmail(email)) {
		return res
			.status(400)
			.json(new FailureResponse(globalConstants.messages.invalidEmailDomain))
	}
	const emailRegex = new RegExp(`^${email.trim()}$`, 'i')
	const existingUser = await MyPeeguUser.findOne({
		email: { $regex: emailRegex },
		status: {
			$in: [miscellaneous.myPeeguUserStatus.Active, miscellaneous.myPeeguUserStatus.Invited],
		},
	})
	if (existingUser) {
		return res.status(400).json(new FailureResponse(globalConstants.messages.emailExists))
	}
	if (
		permissions &&
		!permissions.every((permission) => req.allowedPermissions.includes(permission))
	) {
		return res.status(400).json(new FailureResponse(globalConstants.messages.notAuthorised))
	}
	if (!utils.phoneValidation(phone))
		return res.status(400).json(new FailureResponse(globalConstants.messages.invalidPhone))

	if (
		(permissions && permissions[0] === globalConstants.ScCounselor) ||
		permissions[0] === globalConstants.ScPrincipal
	) {
		if (req.body.schoolIds.length > 1) {
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.multiScNotAllowed))
		}
	}

	const myPeeguUser = new MyPeeguUser(req.body)
	myPeeguUser.fullName = utils.fullName(myPeeguUser.firstName, myPeeguUser.lastName)
	myPeeguUser.createdByName = utils.getFullName(req.user)
	myPeeguUser.createdById = req.user._id
	myPeeguUser.status = miscellaneous.myPeeguUserStatus.Invited
	myPeeguUser.schoolIds = req.body.schoolIds
	let genId = utils.generateRandomNumber(4)
	myPeeguUser.user_id =
		permissions[0] === globalConstants.ScPrincipal
			? `P-0${genId}`
			: myPeeguUser.permissions.some((item) => globalConstants.adminList.includes(item))
				? `A-0${genId}`
				: `C-0${genId}`

	if (
		utils.isAValidArray(myPeeguUser.schoolIds) &&
		myPeeguUser.permissions.some((item) => globalConstants.counselorList.includes(item))
	) {
		if (myPeeguUser.schoolIds.every((id) => utils.isMongooseObjectId(id))) {
			const schoolCount = await Schools.countDocuments({
				_id: { $in: myPeeguUser.schoolIds },
				status: globalConstants.myPeeguUserStatus.Active,
			})
			if (schoolCount !== myPeeguUser.schoolIds.length) {
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.invalidSchoolIds))
			}
			myPeeguUser.assignedSchools = myPeeguUser.schoolIds
		} else
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.invalidSchoolIds))
	} else {
		myPeeguUser.assignedSchools = []
	}
	try {
		const result = await myPeeguUser.save()
		createMyPeeguUserTokenAndSendActivationEmail(result, res)
		// return res.json(new SuccessResponse(globalConstants.messages.userCreated))
	} catch (err) {
		const failureResponse = mongooseErrorHandler.handleError(err)
		logger.info(err) // Logging the actual error for troubleshooting
		return res.status(400).json(failureResponse)
	}
})

router.put(
	'/activate',
	asyncMiddleware(async (req, res) => {
		if (!req.body.token)
			return res.status(410).json(new FailureResponse(globalConstants.messages.invalidToken))
		const isValid = await validateTheToken(req.body.token)
		if (isValid && req.body.password) {
			if (
				!req.body.password ||
				(req.body.password && !utils.validatePasswordStrength(req.body.password))
			)
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.invalidPassword))
			const tokenResult = await MyPeeguUserTokens.findOne({
				token: req.body.token,
			})
			if (tokenResult) {
				const hashedPassword = await utils.hashPassword(req.body.password) //password is hashed before storing in DB

				const teacher = await MyPeeguUser.findOne({ _id: tokenResult.userId })
				if (teacher && Object.keys(teacher).length > 0) {
					const hasTeacherPermission = teacher.permissions.includes('Teacher')
					if (hasTeacherPermission) {
						await Teacher.updateOne(
							{ email: teacher.email, isDeleted: { $ne: true } },
							{ $set: { status: 'Active' } },
						) //////
					}
				}

				MyPeeguUser.updateOne(
					{ _id: tokenResult.userId },
					{
						password: hashedPassword,
						status: miscellaneous.myPeeguUserStatus.Active,
					},
					{ runValidators: true },
				)
					.then(async (result) => {
						tokenResult.status = globalConstants.tokens.used
						await tokenResult.save()
						const successResponse = new SuccessResponse(
							globalConstants.messages.accountActivated,
						)
						return res.json(successResponse)
					})
					.catch((error) => {
						logger.error(error)
						const failureResponse = mongooseErrorHandler.handleError(error)
						return res.status(400).json(failureResponse)
					})
			} else {
				const failureResponse = new FailureResponse(globalConstants.messages.invalidToken)
				res.status(410).json(failureResponse)
			}
		} else {
			const failureResponse = new FailureResponse(globalConstants.messages.invalidToken)
			res.status(410).json(failureResponse)
		}
	}),
)

//authentication
router.put(
	'/login',
	asyncMiddleware(async (req, res) => {
		if (!req.body.email || !req.body.password)
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.missingParameters))
		const emailRegex = new RegExp(`^${req.body.email.trim()}$`, 'i')
		const user = await MyPeeguUser.findOne({
			email: { $regex: emailRegex },
			status: miscellaneous.myPeeguUserStatus.Active,
		})
		if (user) {
			const isValid = await bcrypt.compare(req.body.password, user.password)
			if (isValid) {
				const fullName = user.fullName
				user.authToken = utils.generateUserAuthToken(
					fullName,
					user.email,
					myPeeguConfig.secrets.jwtPrivateKey,
				)
				user.save()
					.then(async (result) => {
						const userData = result.toObject()
						let response
						if (user.permissions.includes(globalConstants.SuperAdmin)) {
							response = createLoginResponse(
								userData,
								true,
								true,
								miscellaneous.cbseCircularPdfAddress,
								miscellaneous.icseCircularPdfAddress,
							)
						} else if (user.permissions.includes(globalConstants.teacher)) {
							// Fetch the assigned school of the teacher
							const teacher = await Teacher.findOne({
								email: user.email,
								isDeleted: { $ne: true },
							}).select('schoolName schoolId classroomsJourney')

							// If the teacher has assigned classrooms, fetch those classrooms
							let assignedClassrooms = []
							if (teacher && teacher.classroomsJourney.length > 0) {
								const teacherClassroomIds = teacher.classroomsJourney
									.filter((obj) => obj.isAssigned)
									.map((obj) => obj.classRoomId)
								const query = {
									_id: { $in: teacherClassroomIds },
								}
								assignedClassrooms = await Classrooms.find(query, {
									_id: 1,
									className: 1,
									school: 1,
								})
							}
							// Prepare the updated user data, including the assigned school name
							const updatedUserData = {
								...userData,
								schoolOfTeacher: teacher ? teacher.schoolName : null,
							}

							// Create the response, including the assigned classrooms
							response = createLoginResponse(
								updatedUserData,
								false,
								true,
								miscellaneous.cbseCircularPdfAddress,
								miscellaneous.icseCircularPdfAddress,
								assignedClassrooms, // Pass the assigned classrooms to the response
							)
						} else {
							response = createLoginResponse(
								userData,
								false,
								true,
								miscellaneous.cbseCircularPdfAddress,
								miscellaneous.icseCircularPdfAddress,
							)
						}
						return res.json(response)
					})
					.catch((error) => {
						logger.error(error)
						const failureResponse = mongooseErrorHandler.handleError(error)
						return res.status(400).json(failureResponse)
					})
			} else {
				const failureResponse = new FailureResponse(globalConstants.messages.invalidCreds)
				return res.status(400).json(failureResponse)
			}
		} else {
			const failureResponse = new FailureResponse(globalConstants.messages.invalidCreds)
			return res.status(400).json(failureResponse)
		}
	}),
)

router.put(
	'/resendactivation',
	authMyPeeguUser,
	validateUserManagement,
	asyncMiddleware(async (req, res) => {
		const { email } = req.body || {}
		if (!email) {
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.missingParameters))
		}
		const emailRegex = new RegExp(`^${email.trim()}$`, 'i')
		const existingUser = await MyPeeguUser.findOne({
			email: { $regex: emailRegex },
			status: globalConstants.myPeeguUserStatus.Invited,
		})
		if (!existingUser) {
			return res.status(400).json(new FailureResponse(globalConstants.messages.invalidUser))
		}
		await MyPeeguUserTokens.updateMany(
			{
				userId: existingUser._id,
				status: {
					$in: [globalConstants.tokens.sent, globalConstants.tokens.expired],
				},
				type: 'activation',
			},
			{ status: globalConstants.tokens.expired },
		)
		createMyPeeguUserTokenAndSendActivationEmail(existingUser, res, true)
	}),
)

router.post(
	'/forgotpassword',
	asyncMiddleware(async (req, res) => {
		const { email } = req.body || {}
		if (!email) {
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.missingParameters))
		}
		const query = { email, status: miscellaneous.myPeeguUserStatus.Active }
		const myPeeguUser = await MyPeeguUser.findOne(query)
		if (!myPeeguUser) {
			const failureResponse = new FailureResponse(globalConstants.messages.invalidUser)
			return res.status(400).json(failureResponse)
		}
		await MyPeeguUserTokens.findOneAndUpdate(
			{
				userId: myPeeguUser._id,
				status: globalConstants.tokens.sent,
				type: globalConstants.tokens.resetPassword,
			},
			{ status: globalConstants.tokens.expired },
		)
		createMyPeeguUserTokenAndSendResetPasswordEmail(myPeeguUser, res)
	}),
)

router.put(
	'/resetpassword',
	asyncMiddleware(async (req, res) => {
		const { token, password } = req.body || {}
		if (!token) {
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.missingParameters))
		}
		const isValid = await validateTheToken(token)
		if (isValid && password) {
			if (!utils.validatePasswordStrength(password)) {
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.weakPassword))
			}
			const tokenResult = await MyPeeguUserTokens.findOne({
				token: token,
				type: globalConstants.tokens.resetPassword,
			})
			if (tokenResult) {
				const hashedPassword = await utils.hashPassword(password)

				try {
					await MyPeeguUser.updateOne(
						{ _id: tokenResult.userId },
						{
							password: hashedPassword,
							status: miscellaneous.myPeeguUserStatus.Active,
						},
						{ runValidators: true },
					)
					tokenResult.status = globalConstants.tokens.used
					await tokenResult.save()
					const successResponse = new SuccessResponse(
						globalConstants.messages.passwordReset,
					)
					return res.json(successResponse)
				} catch (error) {
					const failureResponse = mongooseErrorHandler.handleError(error)
					return res.status(400).json(failureResponse)
				}
			} else {
				const failureResponse = new FailureResponse(globalConstants.messages.invalidToken)
				return res.status(410).json(failureResponse)
			}
		} else {
			const failureResponse = new FailureResponse(globalConstants.messages.invalidToken)
			return res.status(410).json(failureResponse)
		}
	}),
)

router.put(
	'/logout',
	authMyPeeguUser,
	asyncMiddleware(async (req, res) => {
		MyPeeguUser.findByIdAndUpdate(req.user._id, { $unset: { authToken: '' } })
			.then(() => {
				return res.json(new SuccessResponse(globalConstants.messages.loggedOut))
			})
			.catch((error) => {
				logger.error(error)
				const failureResponse = mongooseErrorHandler.handleError(error)
				return res.status(400).json(failureResponse)
			})
	}),
)

router.put(
	'/updateschoolstatus',
	authMyPeeguUser,
	editSchool,
	asyncMiddleware(async (req, res) => {
		if (!Object.values(globalConstants.schoolStatus).includes(req.body?.status))
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.missingParameters))

		if (!utils.isAValidArray(req.body.schoolIds))
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.invalidSchoolIds))
		const schoolRecords = await Schools.updateMany(
			{
				_id: {
					$in: req.body.schoolIds.filter((id) => utils.isMongooseObjectId(id)),
				},
			},
			{ status: req.body.status },
		)
		if (schoolRecords.modifiedCount > 0)
			return res.json(new SuccessResponse(globalConstants.messages.infoUpdated))
		else
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.invalidSchoolIds))
	}),
)

router.put(
	'/updateprofile',
	authMyPeeguUser,
	asyncMiddleware(async (req, res) => {
		const myPeeguUser = MyPeeguUser.hydrate(req.user)
		const body = req.body || {}
		let profilePicture = null
		if (
			!req.query.saveUser ||
			(req.query.saveUser && req.query.saveUser === globalConstants.booleanString.false)
		) {
			if (body.profilePicture) {
				const s3link = await generatePreSignedUrl(
					globalConstants.userPicPath,
					body.profilePicture,
					globalConstants.PngImageType,
				)
				return res.json({ s3link: s3link })
			} else {
				res.status(200)
				return res.end() //send empty response with status 200
			}
		} else if (
			req.query.saveUser &&
			req.query.saveUser === globalConstants.booleanString.true
		) {
			if (
				utils.isAValidString(body.profilePicture) &&
				myPeeguUser.profilePicture !== body.profilePicture
			) {
				profilePicture = utils.fetchUrlSafeString(body.profilePicture)
			}
			if (profilePicture) {
				let files = await listOfFiles(globalConstants.userPicPath)
				files =
					files?.Contents?.map((item) => {
						//transform into array of strings to make it easier to use
						return item.Key
					}) ?? []
				if (myPeeguUser.profilePicture) {
					deleteImageFromS3(globalConstants.userPicPath, myPeeguUser.profilePicture)
				}
				if (!profilePicture.startsWith('http')) {
					const fileUrl = `${globalConstants.userPicPath}${profilePicture}`
					const existFile = await isFileExistInS3(fileUrl)
					if (!existFile) {
						return res
							.status(400)
							.json(new FailureResponse(globalConstants.messages.invalidImage))
					} else {
						myPeeguUser.profilePictureUrl = `${miscellaneous.resourceBaseurl}${globalConstants.userPicPath}${profilePicture}`
					}
				}
			}
			myPeeguUser.firstName = body.firstName ?? myPeeguUser.firstName
			myPeeguUser.lastName = body.lastName ?? myPeeguUser.lastName
			// myPeeguUser.profilePicture = body.profilePicture ?? myPeeguUser.profilePicture
			myPeeguUser.fullName = utils.fullName(myPeeguUser.firstName, myPeeguUser.lastName)
			myPeeguUser
				.save()
				.then((result) => {
					return res.json(createLoginResponse(result))
				})
				.catch((error) => {
					const failureResponse = mongooseErrorHandler.handleError(error)
					return res.status(400).json(failureResponse)
				})
		}
	}),
)

router.put(
	'/updateuserbyid',
	authMyPeeguUser,
	validateUserManagement,
	editCounselor,
	asyncMiddleware(async (req, res) => {
		const body = req.body || {}
		const id = body.id ?? null
		if (!utils.isMongooseObjectId(id))
			return res.status(400).json(new FailureResponse(globalConstants.messages.invalidUser))

		if (
			utils.isAValidArray(body.permissions) &&
			!body.permissions.every((permission) => req.allowedPermissions.includes(permission))
		) {
			return res.status(400).json(new FailureResponse(globalConstants.messages.notAuthorised))
		}

		const counselor = await MyPeeguUser.findOne({
			_id: id,
			$or: [
				{ permissions: { $in: req.allowedPermissions } },
				{ permissions: { $exists: false } },
				{ permissions: { $size: 0 } },
			],
		})
		if (!counselor) {
			return res.status(400).json(new FailureResponse(globalConstants.messages.invalidUser))
		}

		if (
			body.permissions &&
			(body.permissions[0] === globalConstants.ScCounselor ||
				body.permissions[0] === globalConstants.ScPrincipal)
		) {
			if (req.body.schoolIds.length > 1) {
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.multiScNotAllowed))
			}
		}

		counselor.firstName = body.firstName ?? counselor.firstName
		counselor.lastName = body.lastName ?? counselor.lastName
		counselor.phone = utils.isAValidString(body.phone)
			? body.phone
			: (counselor.phone ?? undefined)
		counselor.fullName = utils.fullName(counselor.firstName, counselor.lastName)
		counselor.updatedById = req.user._id
		counselor.updatedByName = req.user?.fullName
		counselor.permissions = body.permissions ?? counselor.permissions
		if (utils.isValidEmail(body.email) && body.email !== counselor.email) {
			const emailAlreadyExists = await MyPeeguUser.findOne({
				email: body.email,
			})
			if (emailAlreadyExists)
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.userExists))
			counselor.email = body.email
		}
		if (utils.isAValidArray(body.schoolIds)) {
			if (body.schoolIds.every((id) => utils.isMongooseObjectId(id))) {
				const schoolCount = await Schools.countDocuments({
					_id: { $in: body.schoolIds },
					status: globalConstants.myPeeguUserStatus.Active,
				})
				if (schoolCount !== body.schoolIds.length)
					return res
						.status(400)
						.json(new FailureResponse(globalConstants.messages.invalidSchoolIds))
				counselor.assignedSchools = body.schoolIds
			} else
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.invalidSchoolIds))
		} else {
			counselor.assignedSchools = []
		}
		counselor
			.save()
			.then((result) => {
				return res.json(new SuccessResponse(globalConstants.messages.userUpdated))
			})
			.catch((error) => {
				const failureResponse = mongooseErrorHandler.handleError(error)
				return res.status(400).json(failureResponse)
			})
	}),
)

// PAGINATION ADDED in viewallcounselor
router.post(
	'/viewallcounselor',
	authMyPeeguUser,
	viewCounselor,
	asyncMiddleware(async (req, res) => {
		const PAGE_SIZE = req.body.pageSize || 10
		const page = req.body.page || 1
		const downloadAndFilter = req.query.downloadAndFilter === 'true' || false

		const skip = (page - 1) * PAGE_SIZE
		let query = {
			_id: { $ne: req.user._id },
			status: {
				$in: [
					miscellaneous.myPeeguUserStatus.Active,
					miscellaneous.myPeeguUserStatus.Invited,
				],
			},
			$or: [
				{ permissions: { $in: req.allowedPermissions } },
				{ permissions: { $exists: false } },
				{ permissions: { $size: 0 } },
			],
		}
		let externalQuery = {},
			sortOptions = {},
			myPeeguUser = {},
			totalCount = 0
		if (!(Object.keys(req.body).length === 0)) {
			let sortFields = globalConstants.userSortFields
			if (req.body.sortKeys) {
				const assignedSchoolsIndex = req.body.sortKeys.findIndex(
					(option) => option.key === globalConstants.userSortFieldsObject.assignedSchools,
				)
				const permissionsIndex = req.body.sortKeys.findIndex(
					(option) => option.key === globalConstants.userSortFieldsObject.permissions,
				)

				if (
					assignedSchoolsIndex > -1 &&
					permissionsIndex > -1 &&
					assignedSchoolsIndex !== permissionsIndex
				) {
					const indexToRemove = Math.max(assignedSchoolsIndex, permissionsIndex)
					req.body.sortKeys.splice(indexToRemove, 1)
				}
				req.body.sortKeys.forEach((option) => {
					if (
						sortFields.includes(option.key) &&
						(option.value === 1 || option.value === -1)
					) {
						sortOptions[option.key] = option.value
					}
				})
			}
			if (req.body.filter) {
				// if (req.body.filter.status) {
				// 	const filters = req.body.filter?.status ?? miscellaneous.myPeeguUserStatus.Active
				// 	const filteredArray = Object.keys(miscellaneous.myPeeguUserStatus).filter((element) => filters.includes(element))
				// 	query.status = { $in: filteredArray }
				// }
				if (utils.isAValidArray(req.body.filter.roles)) {
					const filteredArray = req.allowedPermissions.filter((element) =>
						req.body.filter.roles.includes(element),
					)
					query.permissions = { $in: filteredArray }
				}
				if (
					utils.isAValidArray(req.body.filter.schoolIds) &&
					req.body.filter.schoolIds.every((id) => utils.isMongooseObjectId(id))
				) {
					query.assignedSchools = { $in: req.body.filter.schoolIds }
				}
			}
			if (req.body.searchText) {
				const criteria = String(req.body.searchText ?? '')
				query.$or = [
					{
						fullName: {
							$regex: criteria,
							$options: 'i',
						},
					},
					{
						email: {
							$regex: criteria,
							$options: 'i',
						},
					},
				]
			}
			externalQuery = { ...externalQuery, ...query }
			myPeeguUser = await MyPeeguUser.find(externalQuery, {
				authToken: 0,
				password: 0,
				__v: 0,
			})
				.populate({
					path: 'assignedSchools',
					match: { status: globalConstants.schoolStatus.Active },
					select: 'school',
				})
				.collation({ locale: 'en' })
				.sort(sortOptions)
				.skip(skip)
				.limit(PAGE_SIZE)
			totalCount = await MyPeeguUser.countDocuments(externalQuery)

			if (downloadAndFilter) {
				const myPeeguUser1 = await MyPeeguUser.find(externalQuery, {
					authToken: 0,
					password: 0,
					__v: 0,
				})
					.populate({
						path: 'assignedSchools',
						match: { status: globalConstants.schoolStatus.Active },
						select: 'school',
					})
					.collation({ locale: 'en' })
					.sort(sortOptions)
				const formattedData = myPeeguUser1.map((item) =>
					utils.formatCounselorData(item, true),
				)
				return res.json(formattedData)
			} else {
				return res.json({
					data: myPeeguUser,
					page,
					pageSize: PAGE_SIZE,
					totalCount,
				})
			}
		} else {
			myPeeguUser = await MyPeeguUser.find(query, {
				authToken: 0,
				password: 0,
				__v: 0,
			})
				.populate({
					path: 'assignedSchools',
					match: { status: globalConstants.schoolStatus.Active },
					select: 'school',
				})
				.collation({ locale: 'en' })
				.skip(skip)
				.limit(PAGE_SIZE)
			totalCount = await MyPeeguUser.countDocuments(query)

			if (downloadAndFilter && !req.body.filter && !req.body.searchText) {
				const allPeeguUser = await MyPeeguUser.find()
				const formattedData = await MyPeeguUser.aggregate([
					{
						$match: {
							_id: { $in: allPeeguUser.map((user) => user._id) },
						},
					},
					{
						$lookup: {
							from: 'schools',
							localField: 'assignedSchools',
							foreignField: '_id',
							as: 'assignedSchools',
						},
					},
					{
						$project: {
							_id: 0,
							// user_id: 1,
							user_id: '$user_id',
							email: 1,
							phone: 1,
							permissions: {
								$cond: {
									if: { $isArray: '$permissions' },
									then: { $arrayElemAt: ['$permissions', 0] },
									else: '$permissions',
								},
							},
							assignedSchools: {
								$reduce: {
									input: '$assignedSchools',
									initialValue: '',
									in: { $concat: ['$$value', '$$this.school', ', '] },
								},
							},
							createdByName: 1,
							status: 1,
							updatedByName: 1,
							firstName: 1,
							fullName: 1,
							lastName: 1,
						},
					},
				])

				formattedData.forEach((item) => {
					item.assignedSchools = item.assignedSchools.slice(0, -2)
				})

				const Data = formattedData.map((item) =>
					utils.formatCounselorData(item, true, true),
				)
				return res.json(Data)
			} else if (downloadAndFilter) {
				const formattedData = myPeeguUser.map((item) =>
					utils.formatCounselorData(item, true),
				)
				return res.json(formattedData)
			} else {
				return res.json({
					data: myPeeguUser,
					page,
					pageSize: PAGE_SIZE,
					totalCount,
				})
			}
		}
	}),
)

router.put(
	'/deleteuser',
	authMyPeeguUser,
	validateUserManagement,
	asyncMiddleware(async (req, res) => {
		const body = req.body || {}
		const id = body.id ?? null
		if (!utils.isMongooseObjectId(id))
			return res.status(400).json(new FailureResponse(globalConstants.messages.invalidUser))
		const myPeeguUser = await MyPeeguUser.findOneAndUpdate(
			{
				_id: id,
				status: {
					$in: [
						globalConstants.myPeeguUserStatus.Invited,
						globalConstants.myPeeguUserStatus.Active,
					],
				},
				$or: [
					{ permissions: { $in: req.allowedPermissions } },
					{ permissions: { $exists: false } },
					{ permissions: { $size: 0 } },
				],
			},
			{
				status: globalConstants.myPeeguUserStatus.Inactive,
				assignedSchools: [],
				$unset: { authToken: '' },
			},
			{ new: true },
		)
		if (!myPeeguUser)
			return res.status(400).json(new FailureResponse(globalConstants.messages.invalidUser))
		return res.json(new SuccessResponse(globalConstants.messages.userDeleted))
	}),
)

router.get(
	'/miscellaneous',
	authMyPeeguUser,
	asyncMiddleware(async (req, res) => {
		const roles = fetchRequiredMyPeeguUsersPermissions(req.user)
		const statusList = Object.values(miscellaneous.myPeeguUserStatus)
		const schoolStatus = Object.values(miscellaneous.schoolStatus)
		const studentStatus = Object.values(miscellaneous.studentStatus)
		const schools = await Schools.find({}, { school: 1, _id: 1 })
		const distinctCities = await Schools.distinct('city').exec() //case sensitive
		const distinctClass = await Classrooms.distinct('className').exec() //case sensitive
		const distinctSection = await Classrooms.distinct('section').exec() //case sensitive

		return res.json({
			userFilters: {
				roles: roles,
				status: statusList,
				days: globalConstants.daysFilter,
			},
			schoolFilter: {
				status: schoolStatus,
				cities: distinctCities,
				days: globalConstants.daysFilter,
				schools: schools,
			},
			studentFilter: {
				schools: schools,
				class: distinctClass,
				sections: distinctSection,
				studentStatus: studentStatus,
			},
		})
	}),
)

router.get(
	'/common-miscellaneous',
	authMyPeeguUser,
	asyncMiddleware(async (req, res) => {
		const countries = await Countries.find(
			{
				isDeleted: false,
				_id: {
					$in: [
						'683535fbcba5a9e492315c3f',
						'683535fbcba5a9e492315bfc',
						'683535fbcba5a9e492315caa',
						'683535fbcba5a9e492315c5c',
					],
				},
			},
			{ _id: 1, name: 1 },
		)
		const academicYears = await AcademicYears.find(
			{ isDeleted: false },
			{ _id: 1, academicYear: 1, order: 1 },
		).sort({ academicYear: -1 })
		const states = await States.find(
			{ isDeleted: false },
			{ _id: 1, name: 1, country: 1 },
		).sort({ name: 1 })

		return res.json({
			countries,
			states,
			academicYears,
			months,
			years,
		})
	}),
)

router.post(
	'/validatetoken',
	asyncMiddleware(async (req, res) => {
		const isValid = await validateTheToken(req.body.token)
		if (isValid) {
			return res.json(new SuccessResponse(globalConstants.messages.validToken))
		} else {
			const failureResponse = new FailureResponse(globalConstants.messages.invalidToken)
			return res.status(400).json(failureResponse)
		}
	}),
)

router.post(
	'/deleteschool',
	authMyPeeguUser,
	deleteSchool,
	asyncMiddleware(async (req, res) => {
		const { id } = req.body || {}

		if (!utils.isMongooseObjectId(id)) {
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.invalidSchoolIds))
		}

		const schoolRecord = await Schools.findById(id)
		if (!schoolRecord) {
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.invalidSchoolIds))
		}

		try {
			const deleteSchoolPromise = Schools.findByIdAndUpdate(id, {
				status: globalConstants.studentStatus.Inactive,
			})
			const updateUsersPromise = MyPeeguUser.updateMany(
				{},
				{ $pull: { assignedSchools: id } },
			)
			const updateStudentsPromise = Students.updateMany(
				{ school: id },
				{ $set: { status: globalConstants.studentStatus.Inactive } },
			)
			const updateClassroomsPromise = Classrooms.updateMany(
				{ school: id },
				{ $set: { status: globalConstants.schoolStatus.Inactive } },
			)

			await Promise.all([
				deleteSchoolPromise,
				updateUsersPromise,
				updateStudentsPromise,
				updateClassroomsPromise,
			])

			return res.json(new SuccessResponse(globalConstants.messages.recordDeleted))
		} catch (error) {
			const failureResponse = mongooseErrorHandler.handleError(error)
			return res.status(400).json(failureResponse)
		}
	}),
)

router.get(
	'/dashboard',
	authMyPeeguUser,
	asyncMiddleware(async (req, res) => {
		//totalCounselors
		//activeSchools
		//totalClasses
		//totalStudents
		if (!req.user.permissions.some((item) => globalConstants.adminList.includes(item))) {
			return res.status(400).json(new FailureResponse(globalConstants.messages.notAuthorised))
		}
		try {
			const currentAcademicYear = await globalServices.getCurrentAcademicYear()
			const promises = [
				MyPeeguUser.countDocuments({
					permissions: { $in: globalConstants.counselorList },
					status: {
						$in: [
							globalConstants.myPeeguUserStatus.Active,
							globalConstants.myPeeguUserStatus.Invited,
						],
					},
				}),
				Schools.countDocuments({ status: globalConstants.schoolStatus.Active }),
				Students.countDocuments({
					status: globalConstants.studentStatus.Active,
					graduated: { $ne: true },
					exited: { $ne: true },
				}),
				Classrooms.countDocuments({
					status: globalConstants.schoolStatus.Active,
					academicYear: currentAcademicYear._id,
				}),
			]

			const [totalCounselors, activeSchools, totalStudents, totalClasses] =
				await Promise.all(promises)

			return res.json({
				activeSchools,
				totalCounselors,
				totalStudents,
				totalClasses,
			})
		} catch (error) {
			const failureResponse = mongooseErrorHandler.handleError(error)
			return res.status(400).json(failureResponse)
		}
	}),
)

router.post('/sendActivationEmails', async (req, res) => {
	try {
		const { emailList } = req.body
		if (!Array.isArray(emailList) || emailList.length === 0) {
			return res
				.status(400)
				.json(new FailureResponse(globalConstants.messages.invalidOrEmptyListProvided))
		}
		const teachers = await Teacher.find({
			email: { $in: emailList },
			isDeleted: { $ne: true },
		}).select('email teacher_id teacherName status SchoolId')
		const emailPromises = emailList.map(async (email) => {
			const teacher = teachers.find((t) => t.email === email)

			if (teacher.status === 'Active') {
				return res
					.status(400)
					.json(
						new FailureResponse(
							`${teacher?.teacherName},${globalConstants.messages.teacherActiveError}`,
						),
					)
			}

			if (teacher) {
				const recordExist = await MyPeeguUser.findOne({
					email: teacher.email,
					permissions: 'Teacher',
				})
				if (recordExist) {
					return res
						.status(400)
						.json(
							new FailureResponse(
								`${teacher?.teacherName}, ${globalConstants.messages.teacherAlreadyActivatedOrExists}`,
							),
						)
				} else if (!recordExist) {
					let genId = utils.generateRandomNumber(4)
					const myPeeguUser = new MyPeeguUser({
						email: teacher.email,
						fullName: teacher.teacherName,
						user_id: `C-0${genId}`,
						permissions: ['Teacher'],
						assignedSchools: [teacher.SchoolId],
						status: miscellaneous.myPeeguUserStatus.Invited,
					})
					const teacherUser = await myPeeguUser.save()
					await createMyPeeguUserTokenAndSendActivationEmail(teacherUser, res)
					try {
						teacher._id = myPeeguUser._id
						await Teacher.updateOne(
							{ email: teacher.email, isDeleted: { $ne: true } },
							{ $set: { status: 'Invited' } },
						) //////
						return { email, status: 'Sent' }
					} catch (error) {
						res.status(500).json(
							new FailureResponse(
								globalConstants.messages.activationMailFailedToSent,
							),
						)
					}
				}
			} else {
				return res
					.status(400)
					.json(new FailureResponse(globalConstants.messages.teacherNotFound))
			}
		})

		const results = await Promise.all(emailPromises)

		const countSentEmails = results.filter((result) => result.status === 'Sent').length

		const responseMessage = `${countSentEmails} Activation mail sent`

		return res.json(new SuccessResponse(responseMessage))
	} catch (error) {
		console.error(error)
		return res.status(500).json({ error: 'Internal server error' })
	}
})

module.exports = router
