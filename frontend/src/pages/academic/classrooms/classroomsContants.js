import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { sortEnum } from '../../../utils/utils'
import { requestParams } from '../../../utils/apiConstants'

const {
	schoolName,
	academicYear,
	className,
	section,
	teacherName,
	email,
	contact,
	classHierarchy,
	sectionHierarchy,
} = localizationConstants.classRoomTableConstants

export const classroomColumns = [
	{
		id: schoolName.key,
		name: 'school.school',
		label: schoolName.label,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 150,
	},
	{
		id: academicYear.key,
		name: 'academicYear',
		label: academicYear.label,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 90,
	},
	{
		id: className.key,
		name: 'className',
		label: className.label,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 80,
	},
	{
		id: classHierarchy.key,
		name: 'classHierarchy',
		label: classHierarchy.label,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 90,
	},
	{
		id: section.key,
		name: 'section',
		label: section.label,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 75,
	},
	{
		id: sectionHierarchy.key,
		name: 'sectionHierarchy',
		label: sectionHierarchy.label,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 90,
	},
	{
		id: localizationConstants?.students,
		name: 'studentCount',
		label: localizationConstants?.students,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 75,
	},
	{
		id: teacherName.key,
		name: 'teacher.teacherName',
		label: teacherName.label,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 120,
	},
	{
		id: email.key,
		name: 'teacher.email',
		label: email.label,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 180,
	},
	{
		id: contact.key,
		name: 'teacher.phone',
		label: contact.label,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 100,
	},
]

export const sortkeys = [
	{
		[requestParams.key]: 'school.school',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'academicYear',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'className',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'teacher.teacherName',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'section',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'classHierarchy',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'sectionHierarchy',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'teacher.phone',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'teacher.email',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'studentCount',
		[requestParams.value]: sortEnum.asc,
	},
]

export const initModal = {
	edit: false,
	upload: false,
	filter: false,
	delete: false,
}

export const initialStateClassrooms = {
	school: '',
	className: '',
	section: '',
	teacher: null,
	studentCount: '',
	classHierarchy: '',
	sectionHierarchy: '',
}

export const initialEditClassroomsErrors = {
	email: false,
	phone: false,
	school: false,
	className: false,
	section: false,
	classHierarchy: false,
	sectionHierarchy: false,
}

export const validateStatesClass = [
	'school',
	'className',
	'section',
	'classHierarchy',
	'sectionHierarchy',
]

export const classroomUploadDefaultExcelColumns = [
	{
		'Class Name': '',
		'Class Hierarchy': '',
		Section: '',
		'Section Hierarchy': '',
		'Teacher Id': '',
	},
]
