const { mongoose } = require('mongoose')
const utils = require('../../utility/utils')
const { CommonHelperServices } = require('../common-services/common-helper-service')
const {
	FailureResponse,
	SuccessResponse,
} = require('../../models/response/globalResponse')
const GandTTemplate = require('../../models/database/gandt-template')

class GandTTemplateService extends CommonHelperServices {
	/**
	 * Fetch all G&T templates with pagination
	 */
	async fetchTemplates(req, res) {
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

			// Search by template name
			if (filterBody && filterBody.searchText) {
				query.templateName = {
					$regex: filterBody.searchText,
					$options: 'i',
				}
			}

			const totalCount = await GandTTemplate.countDocuments(query)

			const templates = await GandTTemplate.find(query)
				.populate('createdBy', 'profile.fullName profile.email')
				.populate('updatedBy', 'profile.fullName profile.email')
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(PAGE_SIZE)
				.lean()

			return res.status(200).json(
				new SuccessResponse({
					templates,
					totalCount,
					page,
					pageSize: PAGE_SIZE,
					totalPages: Math.ceil(totalCount / PAGE_SIZE),
				}),
			)
		} catch (error) {
			console.error('Error fetching G&T templates:', error)
			return res
				.status(500)
				.json(new FailureResponse('Failed to fetch G&T templates', error))
		}
	}

	/**
	 * Get single template by ID
	 */
	async getTemplateById(req, res) {
		try {
			const { templateId } = req.params

			if (!mongoose.Types.ObjectId.isValid(templateId)) {
				return res
					.status(400)
					.json(new FailureResponse('Invalid template ID'))
			}

			const template = await GandTTemplate.findById(templateId)
				.populate('createdBy', 'profile.fullName profile.email')
				.populate('updatedBy', 'profile.fullName profile.email')
				.lean()

			if (!template) {
				return res.status(404).json(new FailureResponse('Template not found'))
			}

			return res.status(200).json(new SuccessResponse(template))
		} catch (error) {
			console.error('Error fetching template:', error)
			return res
				.status(500)
				.json(new FailureResponse('Failed to fetch template', error))
		}
	}

	/**
	 * Create new G&T template
	 */
	async createTemplate(req, res) {
		try {
			const { templateName, description, ageGroups, skills, ageGroupQuestions } = req.body

			// Validate required fields
			if (!templateName || !ageGroups || !skills) {
				return res
					.status(400)
					.json(
						new FailureResponse(
							'Template name, age groups, and skills are required',
						),
					)
			}

			// Check if template name already exists
			const existingTemplate = await GandTTemplate.findOne({ templateName })
			if (existingTemplate) {
				return res
					.status(400)
					.json(
						new FailureResponse(
							'Template with this name already exists',
						),
					)
			}

			// Create new template
			const newTemplate = new GandTTemplate({
				templateName,
				description,
				ageGroups,
				skills,
				ageGroupQuestions: ageGroupQuestions || [],
				createdBy: req.user._id,
				updatedBy: req.user._id,
			})

			await newTemplate.save()

			const populatedTemplate = await GandTTemplate.findById(
				newTemplate._id,
			)
				.populate('createdBy', 'profile.fullName profile.email')
				.populate('updatedBy', 'profile.fullName profile.email')
				.lean()

			return res
				.status(201)
				.json(
					new SuccessResponse(
						populatedTemplate,
						'Template created successfully',
					),
				)
		} catch (error) {
			console.error('Error creating template:', error)
			if (error.message.includes('overlap')) {
				return res.status(400).json(new FailureResponse(error.message))
			}
			if (error.message.includes('weightage')) {
				return res.status(400).json(new FailureResponse(error.message))
			}
			return res
				.status(500)
				.json(new FailureResponse('Failed to create template', error))
		}
	}

	/**
	 * Update existing template
	 */
	async updateTemplate(req, res) {
		try {
			const { templateId } = req.params
			const { templateName, description, ageGroups, skills, ageGroupQuestions, isActive } =
				req.body

			if (!mongoose.Types.ObjectId.isValid(templateId)) {
				return res
					.status(400)
					.json(new FailureResponse('Invalid template ID'))
			}

			const template = await GandTTemplate.findById(templateId)
			if (!template) {
				return res.status(404).json(new FailureResponse('Template not found'))
			}

			// Check if new template name conflicts with existing one
			if (templateName && templateName !== template.templateName) {
				const existingTemplate = await GandTTemplate.findOne({
					templateName,
				})
				if (existingTemplate) {
					return res
						.status(400)
						.json(
							new FailureResponse(
								'Template with this name already exists',
							),
						)
				}
			}

			// Update fields
			if (templateName) template.templateName = templateName
			if (description !== undefined) template.description = description
			if (ageGroups) template.ageGroups = ageGroups
			if (skills) template.skills = skills
			if (ageGroupQuestions !== undefined) template.ageGroupQuestions = ageGroupQuestions
			if (typeof isActive !== 'undefined') template.isActive = isActive
			template.updatedBy = req.user._id

			await template.save()

			const updatedTemplate = await GandTTemplate.findById(templateId)
				.populate('createdBy', 'profile.fullName profile.email')
				.populate('updatedBy', 'profile.fullName profile.email')
				.lean()

			return res
				.status(200)
				.json(
					new SuccessResponse(
						updatedTemplate,
						'Template updated successfully',
					),
				)
		} catch (error) {
			console.error('Error updating template:', error)
			if (error.message.includes('overlap')) {
				return res.status(400).json(new FailureResponse(error.message))
			}
			if (error.message.includes('weightage')) {
				return res.status(400).json(new FailureResponse(error.message))
			}
			return res
				.status(500)
				.json(new FailureResponse('Failed to update template', error))
		}
	}

	/**
	 * Delete template
	 */
	async deleteTemplate(req, res) {
		try {
			const { templateId } = req.params

			if (!mongoose.Types.ObjectId.isValid(templateId)) {
				return res
					.status(400)
					.json(new FailureResponse('Invalid template ID'))
			}

			const template = await GandTTemplate.findByIdAndDelete(templateId)
			if (!template) {
				return res.status(404).json(new FailureResponse('Template not found'))
			}

			return res
				.status(200)
				.json(new SuccessResponse(null, 'Template deleted successfully'))
		} catch (error) {
			console.error('Error deleting template:', error)
			return res
				.status(500)
				.json(new FailureResponse('Failed to delete template', error))
		}
	}

	/**
	 * Toggle template active status
	 */
	async toggleTemplateStatus(req, res) {
		try {
			const { templateId } = req.params

			if (!mongoose.Types.ObjectId.isValid(templateId)) {
				return res
					.status(400)
					.json(new FailureResponse('Invalid template ID'))
			}

			const template = await GandTTemplate.findById(templateId)
			if (!template) {
				return res.status(404).json(new FailureResponse('Template not found'))
			}

			template.isActive = !template.isActive
			template.updatedBy = req.user._id
			await template.save()

			return res
				.status(200)
				.json(
					new SuccessResponse(
						template,
						`Template ${template.isActive ? 'activated' : 'deactivated'} successfully`,
					),
				)
		} catch (error) {
			console.error('Error toggling template status:', error)
			return res
				.status(500)
				.json(new FailureResponse('Failed to toggle template status', error))
		}
	}

	/**
	 * Get all active templates (for dropdown/selection)
	 */
	async getActiveTemplates(req, res) {
		try {
			const templates = await GandTTemplate.find({ isActive: true })
				.select('templateName description ageGroups')
				.sort({ templateName: 1 })
				.lean()

			return res.status(200).json(new SuccessResponse(templates))
		} catch (error) {
			console.error('Error fetching active templates:', error)
			return res
				.status(500)
				.json(new FailureResponse('Failed to fetch active templates', error))
		}
	}
}

module.exports = { GandTTemplateService: new GandTTemplateService() }
