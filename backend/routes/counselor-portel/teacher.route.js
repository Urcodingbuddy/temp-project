const express = require('express')
const router = express.Router()
const { authMyPeeguUser } = require('../../middleware/auth')
const asyncMiddleware = require('../../middleware/async')
const {
	viewClassroom,
	validateUserManagement,
} = require('../../middleware/validate.myPeeguManagement')
const { editClassroom, deleteClassroom } = require('../../middleware/validate.counselorManagement')
const { teacherService } = require('../../services/teachers/teacher.service.js')

router.get(
	'/teachers-list/:schoolId',
	authMyPeeguUser,
	editClassroom,
	asyncMiddleware(teacherService.fetchTeachersListBySchoolId),
)

router.patch(
	'/updateTeacher/:id',
	authMyPeeguUser,
	editClassroom,
	asyncMiddleware(teacherService.updateTeacher.bind(teacherService)),
)

router.put(
	'/update-teacher-classrooms',
	authMyPeeguUser,
	editClassroom,
	asyncMiddleware(teacherService.updateTeacherClassroom.bind(teacherService)),
)

router.delete(
	'/deleteTeacher/:id',
	authMyPeeguUser,
	deleteClassroom,
	asyncMiddleware(teacherService.deleteTeacher.bind(teacherService)),
)

module.exports = router
