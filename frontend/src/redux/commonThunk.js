import { apiEndPoints, apiMethods } from '../utils/apiConstants'
import myPeeguAxios from '../utils/myPeeguAxios'

export const getSchoolListThunk = async ({ body } = {}) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.getSchoolsList,
			body || {},
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const getAllClassroomsThunk = async ({ body } = {}) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.getAllClassrooms,
			body || {},
		)
		return response.data.sort((a, b) => a - b)
	} catch (error) {
		throw error
	}
}

export const getSchoolListForValidationThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.getSchoolsList,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const getAllClassroomsForValidationThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.getAllClassrooms,
			body,
		)
		return response.data.sort((a, b) => a - b)
	} catch (error) {
		throw error
	}
}

export const getAllClassroomsForStudentsThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.getAllClassrooms,
			body,
		)
		return response.data.sort((a, b) => a - b)
	} catch (error) {
		throw error
	}
}

export const getAllSectionsThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.getAllSections,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const promoteStudentsToNextClassThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.promoteStudentsToNextClass,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const shiftSectionThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.studentsSectionShift,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const markStudentAsGraduatedThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.markStudentAsGraduated,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const markStudentAsExitedThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.markStudentAsExited,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const viewAllStudentsForSchoolActionsThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.viewAllStudentsForSchoolActions,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

//single student actions

export const markSingleStudentAsExitedThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.markSingleStudentAsExited,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}

export const markSingleStudentAsGraduatedThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.markSingleStudentAsGraduated,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}
export const listStudentsThunk = async ({ body }) => {
	try {
		const response = await myPeeguAxios[apiMethods.post](
			apiEndPoints.listStudents,
			body,
		)
		return response.data
	} catch (error) {
		throw error
	}
}
