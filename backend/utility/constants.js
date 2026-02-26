// Approach 1
// const status = ['active', 'inActive', 'pendingVerification']
// const permissions= ['admin', 'traineeUserManagement', 'traineeMangerUserManagement', 'traineeContentMangerUserManagement', 'trainee', 'trainingManagement', 'trainingContentManagement']
// //module.exports = {status, permissions}

// Approach 2
// module.exports = Object.freeze({
//     MY_CONSTANT: {test:'some value'},
//     ANOTHER_CONSTANT: 'another value'
// });

// Approach 3
// function define(name, value) {
//     Object.defineProperty(exports, name, {
//         value:      value,
//         enumerable: true,
//         writable:     false,
//         configurable: false
//     });
// }
// define("PI", 3.14)

// Approach 4
// global.define = function ( name, value, exportsObject )
// {
//     if ( !exportsObject )
//     {
//         if ( exports.exportsObject )
//             exportsObject = exports.exportsObject
//         else
//             exportsObject = exports
//     }

//     Object.defineProperty( exportsObject, name, {
//         'value': value,
//         'enumerable': true,
//         'writable': false,
//     })
// }
// define('PI', {test: 3.14}, this)
// exports.exportObject = null

// Approach 5
function deepFreeze(object) {
	// Retrieve the property names defined on object
	var propNames = Object.getOwnPropertyNames(object)
	// Freeze properties before freezing self

	for (let name of propNames) {
		let value = object[name]
		if (value && typeof value === 'object') {
			deepFreeze(value)
		}
	}
	return Object.freeze(object)
}

const global = {
	PROJECT_NAME: 'MBILL',
	SUCCESS: 'Success',
	GENDER_LIST: ['male', 'female', 'other'],
	EMAIL_NOT_VALID: 'Please enter a valid email address.',
	DATE_NOT_VALID: 'You must provide valid date.',
}

const response = {
	INVALID_EMAIL: 'Invalid email or password.',
	UNKNOWN_ERROR: 'Sorry something went wrong.',
	NOT_AUTHORISED_USER: 'You are not authorised to do this action.',
	NO_TOKEN: 'Access denied. No token provided.',
	INVALID_TOKEN: 'Access denied. Invalid Token.',
	USER_UPDATED: 'User info updated',
	EMAIL_DOMAIN_NOT_ALLOWED: 'This Email Domain is Not Allowed.',
}
//account activation and reset links
const emails = {
	ACTIVATE_ACCOUNT: '',
	RESET_PASSWORD: '',
}
const fieldMappingsForSchoolData = {
	school: 'School Name',
	scCode: 'School Code',
	address: 'Address',
	city: 'City',
	state: 'State',
	pinCode: 'Pin Code',
	webSite: 'Website',
	onboardDate: 'Onboard Date',
	establishedYear: 'Established Year',
	principalName: 'Principal Name',
	principalEmail: 'Principal Email',
	principalPhone: 'Principal Phone',
	about: 'About',
	status: 'Status',
}

const keyMappingForObservationRecord = {
	studentName: 'Student Name',
	doo: 'Doo',
	duration: 'Duration',
	status: 'Status',
	schoolName: 'School',
	user_id: 'Student ID',
	punctuality: 'Punctuality',
	abilityToFollowGuidelines: 'Ability To Follow Guidelines',
	abilityToFollowInstructions: 'Ability To Follow Instructions',
	participation: 'Participation',
	completionOfTasks: 'Completion Of Tasks',
	abilityToWorkIndependently: 'Ability To Work Independently',
	incedentalOrAdditionalNote: 'Incedental Or Additional Note',
	appearance: 'Appearance',
	attitude: 'Attitude',
	behaviour: 'Behaviour',
	speech: 'Speech',
	affetcOrMood: 'affetc Or Mood',
	thoughtProcessOrForm: 'Thought Process Or Form',
	additionalCommentOrNote: 'Additional Comment Or Note',
}
const keyMappingForBaseLine = {
	studentName: 'Student Name',
	school: 'School Name',
	baselineForm: 'BaseLine Form',
	status: 'Status',
	student_id: 'Student ID',
}
const keyMappingForIndividualRecords = {
	studentName: 'Student Name',
	date: 'Date',
	dimension: 'Dimension',
	stype: 'Stype',
	basedOn: 'Based On',
	outcome: 'Outcome',
	status: 'Status',
	school: 'School',
	student_id: 'Student ID',
}

const studentStatus = {
	graduated: 'Graduated',
	exited: 'Exited',
	active: 'Active',
	all: 'All',
}
//Student CheckList
const studentCheckListKeys = {
	fineMotorAndGrossMotorSkill: 'Fine Motor and Gross Motor Skill',
	Attention: 'Attention',
	Behavior: 'Behavior',
	Cognitive: 'Cognitive',

	attentionAndHyperactivity: 'Attention and Hyperactivity',
	Memory: 'Memory',
	SocialSkill: 'Social Skill',
}

const expectedFirstCategoriesOfCheckList = [
	'Attention',
	'Fine Motor and Gross Motor Skill',
	'Cognitive',
	'Behavior',
]
const expectedSecondCategoriesOfCheckList = [
	'Attention and Hyperactivity',
	'Memory',
	'Fine Motor and Gross Motor Skill',
	'Cognitive',
	'Social Skill',
]

const checkListCategories = {
	upperKgToGrade4: 'Upper KG - Grade 4',
	grade5ToGrade12: 'Grade 5 - Grade 12',
}
const humanReadableIntAccFields = {
	behavioralInterventions: 'Behavioral Interventions',
	oneToOneWithHRT_CT: '1-1 w/ HRT/CT',
	focusClasses: 'Focus Classes/Remedial/Academic',
	accomondationsInSchool: 'Accomondations in the School',
	assistiveTechnology: 'Assistive Technology',
}

const humanReadableTransitionFields = {
	communityExperience: 'Community Experience',
	activitiesOfDailyLiving: 'Activities of Daily Living',
	functional_VocationalAssistance: 'Functional/Vocational Assistance',
}
const baseLine1 = 'Baseline 1'
const baseLineCategories = ['Physical', 'Social', 'Emotional', 'Cognitive', 'Linguistic']

const internalAccSubfields = [
	'behavioralInterventions',
	'oneToOneWithHRT_CT',
	'focusClasses',
	'accomondationsInSchool',
	'assistiveTechnology',
]
const transitionPlanningFields = [
	'communityExperience',
	'activitiesOfDailyLiving',
	'functional_VocationalAssistance',
]

module.exports = {
	transitionPlanningFields,
	internalAccSubfields,
	studentCheckListKeys,
	expectedFirstCategoriesOfCheckList,
	expectedSecondCategoriesOfCheckList,
	checkListCategories,
	humanReadableIntAccFields,
	humanReadableTransitionFields,
	baseLine1,
	baseLineCategories,
}

module.exports.studentStatus = studentStatus
module.exports.fieldMappingsForSchoolData = fieldMappingsForSchoolData
module.exports.keyMappingForIndividualRecords = keyMappingForIndividualRecords
module.exports.keyMappingForBaseLine = keyMappingForBaseLine
module.exports.keyMappingForObservationRecord = keyMappingForObservationRecord
module.exports.global = deepFreeze(global)
module.exports.emails = deepFreeze(emails)
module.exports.response = deepFreeze(response)
