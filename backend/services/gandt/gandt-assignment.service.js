const { mongoose } = require('mongoose')
const utils = require('../../utility/utils')
const { CommonHelperServices } = require('../common-services/common-helper-service')
const {
	FailureResponse,
	SuccessResponse,
} = require('../../models/response/globalResponse')
const GandTAssignment = require('../../models/database/gandt-assignment')

class GandTAssignmentService extends CommonHelperServices {
	/**
	 * Fetch all G&T assignments with pagination
	 */
	async fetchAssignments(req, res) {
		try {
			const page = parseInt(req.body.page) || 1
			const PAGE_SIZE = parseInt(req.body.pageSize) || 10
			const skip = (page - 1) * PAGE_SIZE

			let query = {}
			const filterBody = req.body.filter

			// Filter by active status
			if (filterBody && typeof filterBody.isActive !== 'undefined') {
				query.isActive = filterBody.isActive
			}

			// Search by school name or template name
			if (filterBody && filterBody.searchText) {
				// We'll need to do a lookup to search by school/template name
				// For now, this is a basic implementation
				query.$or = [
					// Add text search if needed
				]
			}

			const totalCount = await GandTAssignment.countDocuments(query)

			const assignments = await GandTAssignment.find(query)
				.populate('school', 'school scCode')
				.populate('template', 'templateName')
				.populate('createdBy', 'profile.fullName profile.email')
				.populate('updatedBy', 'profile.fullName profile.email')
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(PAGE_SIZE)
				.lean()

			return res.status(200).json(
				new SuccessResponse({
					assignments,
					totalCount,
					page,
					pageSize: PAGE_SIZE,
					totalPages: Math.ceil(totalCount / PAGE_SIZE),
				}),
			)
		} catch (error) {
			console.error('Error fetching G&T assignments:', error)
			return res
				.status(500)
				.json(new FailureResponse('Failed to fetch G&T assignments', error))
		}
	}

	/**
	 * Get single assignment by ID
	 */
	async getAssignmentById(req, res) {
		try {
			const { assignmentId } = req.params

			if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
				return res
					.status(400)
					.json(new FailureResponse('Invalid assignment ID'))
			}

			const assignment = await GandTAssignment.findById(assignmentId)
				.populate('school', 'school scCode')
				.populate('template', 'templateName')
				.populate('createdBy', 'profile.fullName profile.email')
				.populate('updatedBy', 'profile.fullName profile.email')
				.lean()

			if (!assignment) {
				return res.status(404).json(new FailureResponse('Assignment not found'))
			}

			return res.status(200).json(new SuccessResponse(assignment))
		} catch (error) {
			console.error('Error fetching assignment:', error)
			return res
				.status(500)
				.json(new FailureResponse('Failed to fetch assignment', error))
		}
	}

	/**
	 * Create new G&T assignment
	 */
	async createAssignment(req, res) {
		try {
			const { schoolId, templateId } = req.body

			// Validate required fields
			if (!schoolId || !templateId) {
				return res
					.status(400)
					.json(new FailureResponse('School ID and Template ID are required'))
			}

			// Validate ObjectIds
			if (
				!mongoose.Types.ObjectId.isValid(schoolId) ||
				!mongoose.Types.ObjectId.isValid(templateId)
			) {
				return res
					.status(400)
					.json(new FailureResponse('Invalid School ID or Template ID'))
			}

			// Check if assignment already exists
			const existingAssignment = await GandTAssignment.findOne({
				school: schoolId,
				template: templateId,
			})

			if (existingAssignment) {
				return res
					.status(400)
					.json(
						new FailureResponse(
							'This template is already assigned to this school',
						),
					)
			}

			// Create new assignment
			const newAssignment = new GandTAssignment({
				school: schoolId,
				template: templateId,
				createdBy: req.user._id,
				updatedBy: req.user._id,
			})

			await newAssignment.save()

			const populatedAssignment = await GandTAssignment.findById(
				newAssignment._id,
			)
				.populate('school', 'school scCode')
				.populate('template', 'templateName')
				.populate('createdBy', 'profile.fullName profile.email')
				.populate('updatedBy', 'profile.fullName profile.email')
				.lean()

			return res
				.status(201)
				.json(
					new SuccessResponse(
						populatedAssignment,
						'Assignment created successfully',
					),
				)
		} catch (error) {
			console.error('Error creating assignment:', error)
			if (error.code === 11000) {
				return res
					.status(400)
					.json(
						new FailureResponse(
							'This template is already assigned to this school',
						),
					)
			}
			return res
				.status(500)
				.json(new FailureResponse('Failed to create assignment', error))
		}
	}

	/**
	 * Update existing assignment
	 */
	async updateAssignment(req, res) {
		try {
			const { assignmentId } = req.params
			const { schoolId, templateId, isActive } = req.body

			if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
				return res
					.status(400)
					.json(new FailureResponse('Invalid assignment ID'))
			}

			const assignment = await GandTAssignment.findById(assignmentId)
			if (!assignment) {
				return res.status(404).json(new FailureResponse('Assignment not found'))
			}

			// Update fields
			if (schoolId) {
				if (!mongoose.Types.ObjectId.isValid(schoolId)) {
					return res.status(400).json(new FailureResponse('Invalid school ID'))
				}
				assignment.school = schoolId
			}
			if (templateId) {
				if (!mongoose.Types.ObjectId.isValid(templateId)) {
					return res
						.status(400)
						.json(new FailureResponse('Invalid template ID'))
				}
				assignment.template = templateId
			}
			if (typeof isActive !== 'undefined') assignment.isActive = isActive
			assignment.updatedBy = req.user._id

			await assignment.save()

			const updatedAssignment = await GandTAssignment.findById(assignmentId)
				.populate('school', 'school scCode')
				.populate('template', 'templateName')
				.populate('createdBy', 'profile.fullName profile.email')
				.populate('updatedBy', 'profile.fullName profile.email')
				.lean()

			return res
				.status(200)
				.json(
					new SuccessResponse(
						updatedAssignment,
						'Assignment updated successfully',
					),
				)
		} catch (error) {
			console.error('Error updating assignment:', error)
			if (error.code === 11000) {
				return res
					.status(400)
					.json(
						new FailureResponse(
							'This template is already assigned to this school',
						),
					)
			}
			return res
				.status(500)
				.json(new FailureResponse('Failed to update assignment', error))
		}
	}

	/**
	 * Delete assignment
	 */
	async deleteAssignment(req, res) {
		try {
			const { assignmentId } = req.params

			if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
				return res
					.status(400)
					.json(new FailureResponse('Invalid assignment ID'))
			}

			const assignment = await GandTAssignment.findByIdAndDelete(assignmentId)
			if (!assignment) {
				return res.status(404).json(new FailureResponse('Assignment not found'))
			}

			return res
				.status(200)
				.json(new SuccessResponse(null, 'Assignment deleted successfully'))
		} catch (error) {
			console.error('Error deleting assignment:', error)
			return res
				.status(500)
				.json(new FailureResponse('Failed to delete assignment', error))
		}
	}

	/**
	 * Get assignments by school
	 */
	async getAssignmentsBySchool(req, res) {
		try {
			const { schoolId } = req.params

			if (!mongoose.Types.ObjectId.isValid(schoolId)) {
				return res.status(400).json(new FailureResponse('Invalid school ID'))
			}

			const assignments = await GandTAssignment.find({
				school: schoolId,
				isActive: true,
			})
				.populate('template', 'templateName description ageGroups skills')
				.sort({ createdAt: -1 })
				.lean()

			return res.status(200).json(new SuccessResponse(assignments))
		} catch (error) {
			console.error('Error fetching school assignments:', error)
			return res
				.status(500)
				.json(new FailureResponse('Failed to fetch school assignments', error))
		}
	}
}

module.exports = { GandTAssignmentService: new GandTAssignmentService() }
