const { SchoolAcademicYears } = require('../models/database/school-academic-years')
const { AcademicYears } = require('../models/database/academic-years')
const { Schools } = require('../models/database/myPeegu-school')
const { Classrooms } = require('../models/database/myPeegu-classroom')
const { Students } = require('../models/database/myPeegu-student')
const { cacheService } = require('./cashe.service')
const { convertObjectIdsToStrings } = require('../utility/utils')
const { ObservationRecord } = require('../models/database/myPeegu-observation')
const { IndividualRecord } = require('../models/database/myPeegu-individual')
const { BaselineRecord } = require('../models/database/myPeegu-baseline')
const { StudentCheckList } = require('../models/database/myPeegu-sendCheckList')
const { EducationPlanner } = require('../models/database/myPeegu-studentPlanner')
const { COPEAssessment } = require('../models/database/myPeegu-studentCOPEAssessment')
const { WellBeingAssessment } = require('../models/database/myPeegu-StudentWellBeing')

async function loadInitialData() {
	console.log('  📥 Loading schools...')
	const schools = await Schools.find({}).lean()
	console.log(`  ✅ Schools loaded: ${schools.length}`)

	console.log('  📥 Loading students...')
	const studentCount = await Students.countDocuments({})
	console.log(`  📊 Student count in DB: ${studentCount}`)
	const students = await Students.find({}).lean().maxTimeMS(60000)
	console.log(`  ✅ Students loaded: ${students.length}`)

	console.log('  📥 Loading classrooms...')
	const classrooms = await Classrooms.find({}).lean()
	console.log(`  ✅ Classrooms loaded: ${classrooms.length}`)

	console.log('  📥 Loading academic years...')
	const academicYears = await AcademicYears.find({}).lean()
	console.log(`  ✅ Academic years loaded: ${academicYears.length}`)

	console.log('  📥 Loading school academic years...')
	const SAYs = await SchoolAcademicYears.find({}).lean()
	console.log(`  ✅ School academic years loaded: ${SAYs.length}`)

	console.log('  📥 Setting cache data...')
	await cacheService.setAcademicYears(academicYears)
	await cacheService.setSchools(schools)
	await cacheService.setClassrooms(classrooms)
	await cacheService.setSchoolAcademicYears(SAYs)
	await cacheService.setStudents(students)

	console.log('✅ Schools and Academic Years loaded into memory')
}

async function setupOtherSchemeConfig() {
	await ObservationRecord.syncIndexes()
	await IndividualRecord.syncIndexes()
	await BaselineRecord.syncIndexes()
	await StudentCheckList.syncIndexes()
	await EducationPlanner.syncIndexes()
	await COPEAssessment.syncIndexes()
	await WellBeingAssessment.syncIndexes()
}

module.exports = { loadInitialData, setupOtherSchemeConfig }
