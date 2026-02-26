const express = require('express')
const router = express.Router()
const { authMyPeeguUser } = require('../../middleware/auth')
const { GandTCounselorService } = require('../../services/gandt/gandt-counselor.service')

const gandtCounselorService = new GandTCounselorService()

/**
 * @route   GET /counselor/v1/gandt/school/:schoolId/template-check
 * @desc    Check if school has G&T template assigned
 * @access  Private (Counselor)
 */
router.get(
	'/gandt/school/:schoolId/template-check',
	authMyPeeguUser,
	gandtCounselorService.checkSchoolTemplateAssignment.bind(gandtCounselorService),
)

/**
 * @route   GET /counselor/v1/gandt/school/:schoolId/classroom/:classroomId/students
 * @desc    Get students list with G&T assessment status for a class
 * @access  Private (Counselor)
 */
router.get(
	'/gandt/school/:schoolId/classroom/:classroomId/students',
	authMyPeeguUser,
	gandtCounselorService.getStudentsWithAssessmentStatus.bind(gandtCounselorService),
)

/**
 * @route   GET /counselor/v1/gandt/student/:studentId/history
 * @desc    Get student's G&T assessment history
 * @access  Private (Counselor)
 */
router.get(
	'/gandt/student/:studentId/history',
	authMyPeeguUser,
	gandtCounselorService.getStudentAssessmentHistory.bind(gandtCounselorService),
)

/**
 * @route   GET /counselor/v1/gandt/assessment-questions
 * @desc    Get assessment questions based on student's age and template
 * @access  Private (Counselor)
 */
router.get(
	'/gandt/assessment-questions',
	authMyPeeguUser,
	gandtCounselorService.getAssessmentQuestions.bind(gandtCounselorService),
)

/**
 * @route   POST /counselor/v1/gandt/assessment
 * @desc    Create or update G&T assessment
 * @access  Private (Counselor)
 */
router.post(
	'/gandt/assessment',
	authMyPeeguUser,
	gandtCounselorService.saveAssessment.bind(gandtCounselorService),
)

/**
 * @route   GET /counselor/v1/gandt/assessment/:assessmentId
 * @desc    Get assessment by ID
 * @access  Private (Counselor)
 */
router.get(
	'/gandt/assessment/:assessmentId',
	authMyPeeguUser,
	gandtCounselorService.getAssessmentById.bind(gandtCounselorService),
)

/**
 * @route   DELETE /counselor/v1/gandt/assessment/:assessmentId
 * @desc    Delete assessment
 * @access  Private (Counselor)
 */
router.delete(
	'/gandt/assessment/:assessmentId',
	authMyPeeguUser,
	gandtCounselorService.deleteAssessment.bind(gandtCounselorService),
)

module.exports = router
