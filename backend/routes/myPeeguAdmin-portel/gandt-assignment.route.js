const express = require('express')
const router = express.Router()
const {
	GandTAssignmentService,
} = require('../../services/gandt/gandt-assignment.service')
const { authMyPeeguUser } = require('../../middleware/auth')
const asyncMiddleware = require('../../middleware/async')

// Fetch all assignments with pagination
router.post(
	'/gandt/assignments/list',
	authMyPeeguUser,
	asyncMiddleware(
		GandTAssignmentService.fetchAssignments.bind(GandTAssignmentService),
	),
)

// Get single assignment by ID
router.get(
	'/gandt/assignment/:assignmentId',
	authMyPeeguUser,
	asyncMiddleware(
		GandTAssignmentService.getAssignmentById.bind(GandTAssignmentService),
	),
)

// Create new assignment
router.post(
	'/gandt/assignments/create',
	authMyPeeguUser,
	asyncMiddleware(
		GandTAssignmentService.createAssignment.bind(GandTAssignmentService),
	),
)

// Update assignment
router.put(
	'/gandt/assignment/:assignmentId',
	authMyPeeguUser,
	asyncMiddleware(
		GandTAssignmentService.updateAssignment.bind(GandTAssignmentService),
	),
)

// Delete assignment
router.delete(
	'/gandt/assignment/:assignmentId',
	authMyPeeguUser,
	asyncMiddleware(
		GandTAssignmentService.deleteAssignment.bind(GandTAssignmentService),
	),
)

// Get assignments by school
router.get(
	'/gandt/assignments/school/:schoolId',
	authMyPeeguUser,
	asyncMiddleware(
		GandTAssignmentService.getAssignmentsBySchool.bind(GandTAssignmentService),
	),
)

module.exports = router
