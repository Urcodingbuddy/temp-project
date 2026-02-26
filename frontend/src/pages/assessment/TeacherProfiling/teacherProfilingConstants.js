import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { requestParams } from '../../../utils/apiConstants'
import { sortEnum } from '../../../utils/utils'
const {
	perspectiveTaking,
	vicariousEmpathy,
	empathicConcern,
	altruisticReactivity,
	PerspectiveTakingScale,
	FantasyScale,
	EmpathicConcernScale,
	AltruisticReactivity,
	submittedTeacher,
	pendingTeacher,
} = localizationConstants

export const categories = [
	perspectiveTaking,
	vicariousEmpathy,
	empathicConcern,
	altruisticReactivity,
]
export const categoriesForCharts = [
	PerspectiveTakingScale,
	FantasyScale,
	EmpathicConcernScale,
	AltruisticReactivity,
]
export const categoriesForTeacherCount = [submittedTeacher, pendingTeacher]

export const TeacherProfilingUploadDefaultExcelColumns = [
	{
		'Teacher ID': '',
		'Date of Assessment': '',
	},
]
const labels = [
	'Teaching Attitude',
	'Teaching Practices',
	'Job-Life Satisfaction',
	'DISC Profiles',
]

const questionCounts = [12, 12, 9, 16]

let index = 0

for (let i = 0; i < labels.length; i++) {
	for (let j = 1; j <= questionCounts[i]; j++) {
		index++
		TeacherProfilingUploadDefaultExcelColumns[0][`${labels[i]} Q.${j}`] = ''
	}
}
export const getBackgroundColorForCWR = (value) => {
	if (value < 3) {
		return '#F4BDBD'
	} else {
		return '#BBEDC6'
	}
}

export const getBackgroundColor = (value) => {
	if (value < 3) {
		return '#DD2A2B'
	} else {
		return '#25C548'
	}
}

export const DISCWisePerformanceData = (performanceValues) => {
	return {
		labels: [
			localizationConstants?.dominance,
			localizationConstants?.influence,
			localizationConstants?.steadiness,
			localizationConstants?.compliance,
		],
		datasets: [
			{
				data: performanceValues,
				backgroundColor: [
					getBackgroundColor(performanceValues[0]),
					getBackgroundColor(performanceValues[1]),
					getBackgroundColor(performanceValues[2]),
					getBackgroundColor(performanceValues[3]),
				],
				borderWidth: 0,
				barThickness: 40,
				borderRadius: 5,
			},
		],
	}
}
export const domainWiseMailData = (data) => {
	return {
		labels: categoriesForCharts,
		datasets: [
			{
				data: data,
				backgroundColor: '#25C548',
				borderWidth: 0,
				barThickness: 40,
				borderRadius: 5,
			},
		],
	}
}

export const profilingSectionOptions = [
	{
		id: 'teachingAttitude',
		label: 'Teaching Attitude',
	},
	{
		id: 'teachingPractices',
		label: 'Teaching Practices',
	},
	{
		id: 'jobLifeSatisfaction',
		label: 'Job Life Satisfaction',
	},
	{
		id: 'discProfiles',
		label: 'DISC Profiles',
	},
]

export const initialScheduleProfilingDataStates = {
	school: '',
	startDate: '',
	endDate: '',
	profilingSections: [],
}
export const domainWiseFemaleData = (data) => {
	return {
		labels: categoriesForCharts,
		datasets: [
			{
				data: data,
				backgroundColor: '#A62020',
				borderWidth: 0,
				barThickness: 40,
				borderRadius: 5,
			},
		],
	}
}

export const teacherIRIColumns = [
	{
		id: localizationConstants.schoolName,
		name: 'schoolName',
		label: localizationConstants.schoolName,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 200,
	},
	{
		id: localizationConstants.academicYear,
		name: 'academicYear',
		label: localizationConstants.academicYear,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 100,
	},
	{
		id: localizationConstants.totalTeachers,
		name: 'totalTeacherCount',
		label: localizationConstants.totalTeachers,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 100,
	},
	{
		id: localizationConstants.pending,
		name: 'pendingTeacherCount',
		label: localizationConstants.pending,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 90,
	},
	{
		id: localizationConstants.submitted,
		name: 'submittedTeacherCount',
		label: localizationConstants.submitted,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 90,
	},
	{
		id: localizationConstants.startDate,
		name: 'startDate',
		label: localizationConstants.startDate,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 100,
	},
	{
		id: localizationConstants.endDate,
		name: 'endDate',
		label: localizationConstants.endDate,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 100,
	},
	{
		id: localizationConstants.status,
		name: 'profilingStatus',
		label: localizationConstants.status,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
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

export const sortkeys = [
	{
		[requestParams.key]: 'schoolName',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'academicYear',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'totalTeacherCount',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'pendingTeacherCount',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'submittedTeacherCount',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'profilingStatus',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'endDate',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'startDate',
		[requestParams.value]: sortEnum.asc,
	},
]

export const teacherIRITeachersListColumns = [
	{
		id: localizationConstants.id,
		name: 'teacher_id',
		label: localizationConstants.id,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 100,
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
		width: 180,
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
		width: 90,
	},
	{
		id: localizationConstants.submissionDate,
		name: 'submissionDate',
		label: localizationConstants.submissionDate,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 140,
	},
	{
		id: localizationConstants.formStatus,
		name: 'formStatus',
		label: localizationConstants.status,
		numeric: false,
		dataCount: false,
		disablePadding: false,
		sort: sortEnum.desc,
		align: localizationConstants.left,
		width: 100,
	},
]

export const sortkeysTeachersList = [
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
		[requestParams.key]: 'submissionDate',
		[requestParams.value]: sortEnum.asc,
	},
	{
		[requestParams.key]: 'formStatus',
		[requestParams.value]: sortEnum.asc,
	},
]

export const teacherAttitudesAssessmentQuestions = [
	{
		qns_no: 1,
		question:
			'Effective/good teachers demonstrate the correct way to solve a problem.',
	},
	{
		qns_no: 2,
		question:
			'When referring to a “poor performance”, I mean a performance that lies below the previous achievement level of the student.',
	},
	{
		qns_no: 3,
		question:
			'It is better when the teacher – not the student –decides what activities are to be done.',
	},
	{
		qns_no: 4,
		question:
			'My role as a teacher is to facilitate students’ own inquiry.',
	},
	{
		qns_no: 5,
		question:
			'Teachers know a lot more than students; they shouldn’t let students develop answers that maybe incorrect when they can just explain the answers directly.',
	},
	{
		qns_no: 6,
		question:
			'Students learn best by finding solutions to problems on their own',
	},
	{
		qns_no: 7,
		question:
			'Instruction should be built around problems with clear, correct answers, and around ideas that most students can grasp quickly.',
	},
	{
		qns_no: 8,
		question:
			'How much students learn depends on how much background knowledge they have – that is why teaching facts is so necessary.',
	},
	{
		qns_no: 9,
		question:
			'Students should be allowed to think of solutions to practical problems themselves. Eg: Day to day problems they may come across',
	},
	{
		qns_no: 10,
		question:
			'A quiet classroom is generally needed for effective learning.',
	},
	{
		qns_no: 11,
		question:
			'Cognitive processes are more important than specific curriculum content',
	},
	{
		qns_no: 12,
		question: 'When I’m bored I fidget or can’t sit still.',
	},
]
export const teacherPracticesAssessmentQuestions = [
	{
		qns_no: 1,
		question:
			'Attend staff meetings to discuss the vision and mission of the school.',
	},
	{
		qns_no: 2,
		question: 'Develop a school curriculum or part of it.',
	},
	{
		qns_no: 3,
		question:
			'Discuss and decide on the selection of instructional media(e.g. textbooks, exercise books).',
	},
	{
		qns_no: 4,
		question: 'Exchange teaching materials with colleagues.',
	},
	{
		qns_no: 5,
		question: 'Attend team conferences for the age group I teach.',
	},
	{
		qns_no: 6,
		question:
			'Ensure common standards in evaluations for assessing student progress" Eg: Measuring developmental milestones',
	},
	{
		qns_no: 7,
		question:
			'Engage in discussion about the learning development of specific students.',
	},
	{
		qns_no: 8,
		question: 'Teach jointly as a team in the same class.',
	},
	{
		qns_no: 9,
		question:
			'Take part in professional learning activities (e.g. team supervision)',
	},
	{
		qns_no: 10,
		question: 'Observe other teachers’ classes and provide feedback.',
	},
	{
		qns_no: 11,
		question:
			'Engage in joint activities across different classes and age groups (e.g. projects)',
	},
	{
		qns_no: 12,
		question:
			'Discuss and coordinate homework or reading practice across subjects.',
	},
]

export const jobLifeSatisfactionAssessmentQuestions = [
	{
		qns_no: 1,
		question: 'All in all, I am satisfied with my job.',
	},
	{
		qns_no: 2,
		question:
			'I feel that I am making a significant educational difference in the lives of my students.',
	},
	{
		qns_no: 3,
		question:
			'If I try really hard, I can make progress with even the most difficult and unmotivated students.',
	},
	{
		qns_no: 4,
		question: 'I am successful with the students in my class.',
	},
	{
		qns_no: 5,
		question: 'I usually know how to get through to students.',
	},
	{
		qns_no: 6,
		question: 'Teachers in this local community are well respected',
	},
	{
		qns_no: 7,
		question:
			'Most teachers in this school are interested in making students independent.',
	},
	{
		qns_no: 8,
		question:
			'Most teachers in this school believe that students’ well-being is important.',
	},
	{
		qns_no: 9,
		question:
			'If a student from this school needs extra assistance, the school provides it',
	},
]
export const DISCAssessmentQuestions = [
	{
		qns_no: 1,
		question: 'I try to outdo others.',
	},
	{
		qns_no: 2,
		question: 'I joke around a lot.',
	},
	{
		qns_no: 3,
		question: 'I like order and regularity.',
	},
	{
		qns_no: 4,
		question: 'I read the fine print (in between the lines).',
	},
	{
		qns_no: 5,
		question: 'I seldom toot my own horn (boast, self-praise).',
	},
	{
		qns_no: 6,
		question: 'I make lots of noise.',
	},
	{
		qns_no: 7,
		question: 'I have a strong need for power.',
	},
	{
		qns_no: 8,
		question: 'I put people under pressure.',
	},
	{
		qns_no: 9,
		question: "I hesitate to criticize other people's ideas",
	},
	{
		qns_no: 10,
		question: 'I just want everyone to be equal',
	},
	{
		qns_no: 11,
		question: 'I value cooperation over competition',
	},
	{
		qns_no: 12,
		question: 'I enjoy being part of a loud crowd',
	},
	{
		qns_no: 13,
		question: 'I wish for strangers to like me',
	},
	{
		qns_no: 14,
		question: 'I am always on the look out for more opportunities',
	},
	{
		qns_no: 15,
		question: 'I am emotionally reserved',
	},
	{
		qns_no: 16,
		question: "My first reaction to an idea is to see it's shortcomings",
	},
]
export const TeachingAttitudeQuestions = Array.from({ length: 12 }, (_, i) => ({
	questionNumber: i + 1,
	marks: null,
}))

export const TeachingPracticesQuestions = Array.from(
	{ length: 12 },
	(_, i) => ({
		questionNumber: i + 1,
		marks: null,
	}),
)

export const JobLifeSatisfactionQuestions = Array.from(
	{ length: 9 },
	(_, i) => ({
		questionNumber: i + 1,
		marks: null,
	}),
)

export const DiscProfilesContentQuestions = Array.from(
	{ length: 16 },
	(_, i) => ({
		questionNumber: i + 1,
		marks: null,
	}),
)

export const questionsRatingForTeachingAttitude = [1, 2, 3, 4]
export const questionsRatingForTeachinPractices = [1, 2, 3, 4, 5]
export const questionsRatingForjobLifeSatisfaction = [1, 2, 3, 4]
export const questionsRatingForDISC = [1, 2, 3, 4, 5]
