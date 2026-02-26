import { localizationConstants } from '../../resources/theme/localizationConstants'
import { sortEnum } from '../../utils/utils'
import { requestParams } from '../../utils/apiConstants'
import { userRoles } from '../../utils/globalConstants'

export const counsellorColumns = [
	{
		id: localizationConstants.id,
		name: 'user_id',
		label: localizationConstants.id,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 80,
	},
	{
		id: localizationConstants.name,
		name: 'fullName',
		label: localizationConstants.name,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 140,
	},
	{
		id: localizationConstants.type,
		name: 'permissions',
		label: localizationConstants.type,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 90,
	},
	{
		id: localizationConstants.schoolAssigned,
		name: 'assignedSchools',
		label: localizationConstants.schoolAssigned,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 200,
	},
	{
		id: localizationConstants.email,
		name: 'email',
		label: localizationConstants.email,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 180,
	},
	{
		id: localizationConstants.number,
		name: 'phone',
		label: localizationConstants.number,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 110,
	},
	{
		id: localizationConstants.status,
		name: 'status',
		label: localizationConstants.status,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 80,
	},
]

export const sortkeys = [
	{
		[requestParams.key]: 'fullName',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'email',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'status',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'permissions',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'user_id',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'phone',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'assignedSchools',
		[requestParams.value]: sortEnum.asc,
	},
]

export const counselorTypeOptions = [
	{
		label: localizationConstants.myPeegu,
		id: userRoles.peeguCounselor,
	},
	{
		label: localizationConstants.school,
		id: userRoles.scCounselor,
	},
	{
		label: localizationConstants.pricipal,
		id: userRoles.scPrincipal,
	},
]
