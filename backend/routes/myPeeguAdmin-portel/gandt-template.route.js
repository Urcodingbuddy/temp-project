const express = require('express')
const router = express.Router()
const { GandTTemplateService } = require('../../services/gandt/gandt-template.service')
const { authMyPeeguUser } = require('../../middleware/auth')
const asyncMiddleware = require('../../middleware/async')

// Fetch all templates with pagination
router.post(
	'/gandt-templates',
	authMyPeeguUser,
	asyncMiddleware(GandTTemplateService.fetchTemplates.bind(GandTTemplateService)),
)

// Get single template by ID
router.get(
	'/gandt-template/:templateId',
	authMyPeeguUser,
	asyncMiddleware(GandTTemplateService.getTemplateById.bind(GandTTemplateService)),
)

// Create new template
router.post(
	'/gandt-template',
	authMyPeeguUser,
	asyncMiddleware(GandTTemplateService.createTemplate.bind(GandTTemplateService)),
)

// Update template
router.put(
	'/gandt-template/:templateId',
	authMyPeeguUser,
	asyncMiddleware(GandTTemplateService.updateTemplate.bind(GandTTemplateService)),
)

// Delete template
router.delete(
	'/gandt-template/:templateId',
	authMyPeeguUser,
	asyncMiddleware(GandTTemplateService.deleteTemplate.bind(GandTTemplateService)),
)

// Toggle template status
router.patch(
	'/gandt-template/:templateId/toggle-status',
	authMyPeeguUser,
	asyncMiddleware(GandTTemplateService.toggleTemplateStatus.bind(GandTTemplateService)),
)

// Get all active templates
router.get(
	'/gandt-templates/active',
	authMyPeeguUser,
	asyncMiddleware(GandTTemplateService.getActiveTemplates.bind(GandTTemplateService)),
)

module.exports = router
