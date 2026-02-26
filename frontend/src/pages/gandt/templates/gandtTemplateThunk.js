import { apiEndPoints, apiMethods } from '../../../utils/apiConstants'
import myPeeguAxios from '../../../utils/myPeeguAxios'

// Fetch all templates with pagination and filters
export const fetchGandTTemplatesThunk = async (body) => {
	try {
		const response = await myPeeguAxios({
			url: apiEndPoints.gandtTemplates,
			method: apiMethods.post,
			data: body,
		})
		return response.data.message
	} catch (error) {
		throw error
	}
}

// Get single template by ID
export const getGandTTemplateByIdThunk = async (templateId) => {
	try {
		const response = await myPeeguAxios({
			url: `${apiEndPoints.gandtTemplateById}/${templateId}`,
			method: apiMethods.get,
		})
		return response.data.message
	} catch (error) {
		throw error
	}
}

// Create new template
export const createGandTTemplateThunk = async (body) => {
	try {
		const response = await myPeeguAxios({
			url: apiEndPoints.gandtTemplate,
			method: apiMethods.post,
			data: body,
		})
		return response.data.message
	} catch (error) {
		throw error
	}
}

// Update existing template
export const updateGandTTemplateThunk = async ({ templateId, body }) => {
	try {
		const response = await myPeeguAxios({
			url: `${apiEndPoints.gandtTemplateById}/${templateId}`,
			method: apiMethods.put,
			data: body,
		})
		return response.data.message
	} catch (error) {
		throw error
	}
}

// Delete template
export const deleteGandTTemplateThunk = async (templateId) => {
	try {
		const response = await myPeeguAxios({
			url: `${apiEndPoints.gandtTemplateById}/${templateId}`,
			method: apiMethods.delete,
		})
		return response.data.message
	} catch (error) {
		throw error
	}
}

// Toggle template status
export const toggleGandTTemplateStatusThunk = async (templateId) => {
	try {
		const response = await myPeeguAxios({
			url: `${apiEndPoints.gandtTemplateToggleStatus}/${templateId}/toggle-status`,
			method: apiMethods.patch,
		})
		return response.data.message
	} catch (error) {
		throw error
	}
}

// Get all active templates
export const getActiveGandTTemplatesThunk = async () => {
	try {
		const response = await myPeeguAxios({
			url: apiEndPoints.gandtTemplatesActive,
			method: apiMethods.get,
		})
		return response.data.message
	} catch (error) {
		throw error
	}
}
