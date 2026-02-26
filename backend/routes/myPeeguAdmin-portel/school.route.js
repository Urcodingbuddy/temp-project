const express = require('express')
const router = express.Router()
const { schoolAcYrService } = require('../../services/schools/schoolAcademicYears.service')
const { authMyPeeguUser } = require('../../middleware/auth')
const asyncMiddleware = require('../../middleware/async')
const { schoolsService } = require('../../services/schools/schools.service')
const { editSchool } = require('../../middleware/validate.myPeeguManagement')

router.get(
	'/school-academic-years/:school_id',
	authMyPeeguUser,
	asyncMiddleware(schoolAcYrService.fetchSchoolAcademicYears),
)

router.put(
	'/school-academic-year/:id',
	authMyPeeguUser,
	asyncMiddleware(schoolAcYrService.updateSchoolAcademicYears),
)

router.post(
	'/addschool',
	authMyPeeguUser,
	editSchool,
	asyncMiddleware(schoolsService.addSchool.bind(schoolsService)),
)

router.put(
	'/updateschool',
	authMyPeeguUser,
	editSchool,
	asyncMiddleware(schoolsService.updateSchool),
)

module.exports = router
