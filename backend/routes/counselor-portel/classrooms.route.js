const express = require('express')
const router = express.Router()
const { authMyPeeguUser } = require('../../middleware/auth')
const asyncMiddleware = require('../../middleware/async')
const {
	viewClassroom,
	validateUserManagement,
} = require('../../middleware/validate.myPeeguManagement')
const { editClassroom, deleteClassroom } = require('../../middleware/validate.counselorManagement')

const { classroomService } = require('../../services/classrooms/classrooms.service.js')

router.post(
	'/createmultipleclassrooms',
	authMyPeeguUser,
	editClassroom,
	asyncMiddleware(classroomService.uploadClassrooms.bind(classroomService)),
)

router.put(
	'/editclassroom',
	authMyPeeguUser,
	editClassroom,
	asyncMiddleware(classroomService.updateClassroom.bind(classroomService)),
)

router.post(
	'/bulkDeleteClassrooms',
	authMyPeeguUser,
	editClassroom,
	asyncMiddleware(classroomService.deleteMultipleClassrooms.bind(classroomService)),
)

router.post(
	'/deleteclassroom',
	authMyPeeguUser,
	deleteClassroom,
	asyncMiddleware(classroomService.deleteSingleClassroom.bind(classroomService)),
)

module.exports = router
