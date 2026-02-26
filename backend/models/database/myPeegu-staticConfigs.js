const mongoose = require('mongoose')
const { collections } = require('../../utility/databaseConstants')

const myPeeguPermissionsSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			minlength: 3,
			maxlength: 100,
			trim: true,
		},
	},
	{ timestamps: true },
)

const myPeeguPermissionOpsSchema = new mongoose.Schema(
	{
		permission: { type: mongoose.Schema.Types.ObjectId, ref: collections.mypeeguPermissions },
		userOperationPermissions: [{ type: mongoose.Schema.Types.ObjectId, ref: collections.mypeeguPermissions }],
		appFeatures: [{ id: { type: mongoose.Schema.Types.ObjectId, ref: collections.mypeeguAppfeatures }, actions: [String] }],
	},
	{ timestamps: true },
)

const myPeeguAppFeaturesSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			minlength: 3,
			maxlength: 100,
			trim: true,
		},
		validationPermissions: [{ type: mongoose.Schema.Types.ObjectId, ref: collections.mypeeguPermissions }],
	},
	{ timestamps: true },
)

const myPeeguMessagesSchema = new mongoose.Schema(
	{
		success: new mongoose.Schema({}, { strict: false }),
		error: new mongoose.Schema({}, { strict: false }),
	},
	{ strict: false },
)

const miscellaneousSchema = new mongoose.Schema({}, { strict: false })

const Miscellaneous = mongoose.model(collections.miscellaneous, miscellaneousSchema)
const MyPeeguMessage = mongoose.model(collections.mypeeguMessages, myPeeguMessagesSchema)
const MyPeeguPermissions = mongoose.model(collections.mypeeguPermissions, myPeeguPermissionsSchema)
const GlobalMessage = mongoose.model(collections.globalMessages, myPeeguMessagesSchema)
const MyPeeguAppFeatures = mongoose.model(collections.mypeeguAppfeatures, myPeeguAppFeaturesSchema)
const MyPeeguPermissionOps = mongoose.model(collections.mypeeguPermission_ops, myPeeguPermissionOpsSchema)
// const DbMapping = mongoose.model('db_mappings', myPeeguPermissionsSchema)

module.exports = { MyPeeguPermissions, MyPeeguPermissionOps, MyPeeguMessage, GlobalMessage, MyPeeguAppFeatures, Miscellaneous }
