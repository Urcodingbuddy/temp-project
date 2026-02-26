import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { requestParams } from '../../../utils/apiConstants'
import { sortEnum } from '../../../utils/utils'

export const teachersColumn = [
	{
		id: localizationConstants.id,
		name: 'teacher_id',
		label: localizationConstants.id,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 80,
	},
	{
		id: localizationConstants.teacherName,
		name: 'teacherName',
		label: localizationConstants.teacherName,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 140,
	},
	{
		id: localizationConstants.gender,
		name: 'gender',
		label: localizationConstants.gender,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 70,
	},
	{
		id: localizationConstants.scCode,
		name: 'scCode',
		label: localizationConstants.scCode,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 90,
	},
	{
		id: localizationConstants.school,
		name: 'schoolName',
		label: localizationConstants.school,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 180,
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
		width: 160,
	},
	{
		id: localizationConstants.mobileNum,
		name: 'mobileNumber',
		label: localizationConstants.mobileNum,
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
		[requestParams.key]: 'teacher_id',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'teacherName',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'gender',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'scCode',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'schoolName',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'email',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'mobileNumber',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'status',
		[requestParams.value]: sortEnum.asc,
	},
]

export const demoData = () => {
	let demoTeachersData = []

	for (let i = 1; i <= 550; i++) {
		demoTeachersData.push({
			user_id: i,
			teacherFirstName: `FirstName ${i}`,
			teacherLastName: `LastName ${i}`,
			teacherName: `Teacher ${i}`,
			gender: i % 2 === 0 ? 'Female' : 'Male',
			scCode: `SC${i}`,
			school: `National Public School Bangalore ${i}`,
			email: `teacher${i}@gmail.com`,
			phone: `86880331${i.toString().padStart(2, '0')}`,
		})
	}
	return demoTeachersData
}

export const TeachersUploadDefaultExcelColumns = [
	{
		'Teachers ID': '',
		'Teachers Name': '',
		Gender: '',
		Email: '',
		'Phone Number': '',
	},
]

export const initModal = {
	edit: false,
	upload: false,
	filter: false,
	delete: false,
}

export const initialState = {
	teacherName: '',
	gender: '',
	scCode: '',
	schoolId: '',
	email: '',
	mobileNumber: '',
	className: [],
	section: [],
	classRoomIds: [],
}

export const teacherInitialErrorState = {
	teacherName: false,
	gender: false,
	scCode: false,
	schoolId: false,
	email: false,
}
export const validateTeacherKeys = [
	'teacherName',
	'gender',
	'scCode',
	'schoolId',
	'email',
]
