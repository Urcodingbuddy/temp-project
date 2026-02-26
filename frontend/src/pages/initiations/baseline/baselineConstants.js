import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { requestParams } from '../../../utils/apiConstants'
import { sortEnum } from '../../../utils/utils'
const { physical, social, emotional, cognitive, language } =
	localizationConstants

export const categories = [physical, social, emotional, cognitive, language]

export const initialDropdownStates = {
	schools: [],
	classrooms: [],
	sections: [],
	baselineFrom: [],
	students: [],
	baselineCategory: [],
}

export const baselineColumn = [
	{
		id: localizationConstants.id,
		name: 'user_id',
		label: localizationConstants.id,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.asc,
		align: localizationConstants.left,
		width: 70,
	},
	{
		id: localizationConstants.academicYear,
		name: 'academicYear',
		label: localizationConstants.academicYear,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.asc,
		align: localizationConstants.left,
		width: 90,
	},
	{
		id: localizationConstants.studentsName,
		name: 'studentName',
		label: localizationConstants.studentsName,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.asc,
		align: localizationConstants.left,
		width: 150,
	},
	{
		id: 'createdAt',
		name: 'createdAt',
		label: 'Created Date',
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 100,
	},
	{
		id: localizationConstants?.baselineCategory,
		name: 'baselineCategory',
		label: localizationConstants?.baselineCategory,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.asc,
		align: localizationConstants.left,
		width: 110,
	},
	{
		id: physical,
		name: 'Physical',
		label: physical,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.asc,
		align: localizationConstants.left,
		width: 90,
	},
	{
		id: social,
		name: 'Social',
		label: social,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.asc,
		align: localizationConstants.left,
		width: 90,
	},
	{
		id: emotional,
		name: 'Emotional',
		label: emotional,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.asc,
		align: localizationConstants.left,
		width: 90,
	},
	{
		id: cognitive,
		name: 'Cognitive',
		label: cognitive,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.asc,
		align: localizationConstants.left,
		width: 90,
	},
	{
		id: language,
		name: 'Language',
		label: language,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.asc,
		align: localizationConstants.left,
		width: 90,
	},
	{
		id: localizationConstants.showCategoryActions,
		name: 'actions',
		label: '',
		width: 50,
	},
]

export const baselineSortKeys = [
	{
		[requestParams.key]: 'user_id',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'academicYear',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'studentName',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'baselineCategory',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'Physical',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'Social',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'Emotional',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'Cognitive',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'Language',
		[requestParams.value]: sortEnum.asc,
	},
]

export const classGroups = {
	preschoolLowerKg: 'Preschool & Lower Kg',
	upperKgGrade1: 'Upper kg & Grade 1',
	grade2n3: 'Grade 2 & 3',
	grade4n5: 'Grade 4 & 5',
	grade6n7: 'Grade 6 & 7',
	grade8n9: 'Grade 8 & 9',
	grade10to12: 'Grade 10-12',
}

export const generateBaselineFormData = (classGroup, setBaselineFormData) => {
	console.log(classGroup)
	if (classGroup) {
		const formData = {}

		for (const category of categories) {
			const data = []
			for (let i = 1; i <= 7; i++) {
				data.push({
					question: `${classGroup}${category}Qn${i}`,
					status: false,
				})
			}
			formData[category] = { data, total: 0 }
		}
		setBaselineFormData(formData)
	}
}

export const baselineAnalyticsColumns = [
	{
		id: localizationConstants.domain,
		label: localizationConstants.domain,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		align: localizationConstants.left,
		width: 150,
		backgroundColor: 'globalElementColors.lightBlue2',
	},
	{
		id: localizationConstants.percentage,
		label: localizationConstants.percentage,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		align: localizationConstants.center,
		width: 150,
		backgroundColor: 'globalElementColors.lightBlue2',
	},
	{
		id: localizationConstants.zeroToThree,
		label: localizationConstants.needsIntensiveSupport,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		align: localizationConstants.center,
		width: 150,
		backgroundColor: 'textColors.red',
	},
	{
		id: localizationConstants.fourToFive,
		label: localizationConstants.developingModerateSupport,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		align: localizationConstants.center,
		width: 150,
		backgroundColor: 'globalElementColors.yellow',
	},
	{
		id: localizationConstants.sixToSeven,
		label: localizationConstants.meetingExpectations,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		align: localizationConstants.center,
		width: 150,
		backgroundColor: 'globalElementColors.green2',
	},
]

export const studentBaselineReportColumns = [
	{
		id: localizationConstants.domain,
		label: localizationConstants.domain,
		backgroundColor: 'globalElementColors.lightBlue2',
		padding: '10px 16px 10px 16px',
		width: '70px',
	},
	{
		id: localizationConstants.percentage,
		label: localizationConstants.percentage,
		backgroundColor: 'globalElementColors.lightBlue2',
		padding: '10px 16px 10px 16px',
		width: '70px',
	},
	{
		id: localizationConstants.studentScoreMaximumMark,
		label: localizationConstants.studentScoreMaximumMark,
		backgroundColor: 'globalElementColors.lightBlue2',
		padding: '3px',
		width: '110px',
	},
	{
		id: localizationConstants.mileStoneAchieved,
		label: localizationConstants.mileStoneAchieved,
		backgroundColor: 'globalElementColors.lightBlue2',
		padding: '3px',
		width: '110px',
	},
]

export const initModal = {
	edit: false,
	upload: false,
	filter: false,
	delete: false,
}

export const BaselineDataUploadDefaultExcelColumns = [
	{
		'Student Id': '',
		// 'School Code': '',
		'Class Group': '',
		'Baseline Category': '',
		PhysicalQn1: '',
		PhysicalQn2: '',
		PhysicalQn3: '',
		PhysicalQn4: '',
		PhysicalQn5: '',
		PhysicalQn6: '',
		PhysicalQn7: '',
		SocialQn1: '',
		SocialQn2: '',
		SocialQn3: '',
		SocialQn4: '',
		SocialQn5: '',
		SocialQn6: '',
		SocialQn7: '',
		EmotionalQn1: '',
		EmotionalQn2: '',
		EmotionalQn3: '',
		EmotionalQn4: '',
		EmotionalQn5: '',
		EmotionalQn6: '',
		EmotionalQn7: '',
		CognitiveQn1: '',
		CognitiveQn2: '',
		CognitiveQn3: '',
		CognitiveQn4: '',
		CognitiveQn5: '',
		CognitiveQn6: '',
		CognitiveQn7: '',
		LanguageQn1: '',
		LanguageQn2: '',
		LanguageQn3: '',
		LanguageQn4: '',
		LanguageQn5: '',
		LanguageQn6: '',
		LanguageQn7: '',
	},
]

export const classGroup = {
	0: 'preschoolLowerKg',
	1: 'upperKgGrade1',
	2: 'grade2n3',
	4: 'grade4n5',
	6: 'grade6n7',
	8: 'grade8n9',
	10: 'grade10to12',
}

export const dropDownOptions = [
	{
		id: 'addStudent',
		label: localizationConstants?.addStudent,
	},
	{
		id: 'bulkUpload',
		label: localizationConstants?.bulkUpload,
	},
]

export const classGroupExcel = [
	'Preschool & Lower Kg',
	'Upper kg & Grade 1',
	'Grade 2 & 3',
	'Grade 4 & 5',
	'Grade 6 & 7',
	'Grade 8 & 9',
	'Grade 10-12',
]

export const baselineCategory = ['Baseline 1', 'Baseline 2', 'Baseline 3']

// Support Level Definitions for Principal-Friendly Display
export const supportLevels = {
	green: {
		range: '6-7',
		label: localizationConstants.meetingExpectations,
		shortLabel: 'Meeting Expectations',
		color: '#43A047',
		description: 'Students performing at expected developmental level',
	},
	orange: {
		range: '4-5',
		label: localizationConstants.developingModerateSupport,
		shortLabel: 'Developing',
		color: '#FB8C00',
		description: 'Students who need moderate support to reach expectations',
	},
	red: {
		range: '0-3',
		label: localizationConstants.needsIntensiveSupport,
		shortLabel: 'Needs Support',
		color: '#E53935',
		description: 'Students requiring intensive support and intervention',
	},
}

// Domain Colors for consistent visualization
export const domainColors = {
	Physical: '#4CB8C4',
	Social: '#7ED9C4',
	Emotional: '#A8E6CF',
	Cognitive: '#88D4AB',
	Language: '#6BC5A0',
}

// Heatmap Color Thresholds
export const heatmapThresholds = {
	high: { min: 70, color: '#43A047', label: 'Good' },
	medium: { min: 50, max: 69, color: '#FB8C00', label: 'Moderate' },
	low: { max: 49, color: '#E53935', label: 'Needs Attention' },
}

// KPI Card Configurations
export const kpiCardConfig = {
	screeningRate: {
		title: localizationConstants.screeningCompletionRate,
		icon: 'assessment',
		format: 'percentage',
	},
	atRisk: {
		title: localizationConstants.studentsAtRisk,
		icon: 'warning',
		format: 'count',
	},
	strongestDomain: {
		title: localizationConstants.strongestDomain,
		icon: 'trending_up',
		format: 'text',
	},
	focusArea: {
		title: localizationConstants.focusArea,
		icon: 'priority_high',
		format: 'text',
	},
	rank: {
		title: localizationConstants.rank,
		icon: 'emoji_events',
		format: 'rank',
	},
}

// Get support level from score
export const getSupportLevelFromScore = (score) => {
	if (score >= 6) return supportLevels.green
	if (score >= 4) return supportLevels.orange
	return supportLevels.red
}

// Get heatmap color from percentage
export const getHeatmapColor = (percentage) => {
	if (percentage >= heatmapThresholds.high.min) return heatmapThresholds.high.color
	if (percentage >= heatmapThresholds.medium.min) return heatmapThresholds.medium.color
	return heatmapThresholds.low.color
}

// Age Groups for filtering
export const ageGroups = [
	{ id: '3-5', label: '3-5 years', minAge: 3, maxAge: 5 },
	{ id: '6-8', label: '6-8 years', minAge: 6, maxAge: 8 },
	{ id: '9-12', label: '9-12 years', minAge: 9, maxAge: 12 },
	{ id: '13+', label: '13+ years', minAge: 13, maxAge: 99 },
]

// Gender options for filtering
export const genderOptions = [
	{ id: 'Male', label: 'Male', color: '#2196F3' },
	{ id: 'Female', label: 'Female', color: '#E91E63' },
]

// Risk level colors
export const riskLevelColors = {
	5: '#B71C1C', // Very high risk - dark red
	4: '#C62828', // High risk - red
	3: '#E53935', // Moderate-high risk - light red
	2: '#FB8C00', // Moderate risk - orange
	1: '#FFC107', // Low risk - amber
}
