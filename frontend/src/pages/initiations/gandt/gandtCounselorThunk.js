import myPeeguAxios from '../../../utils/myPeeguAxios'
import { apiEndPoints, apiMethods } from '../../../utils/apiConstants'

/**
 * Check if school has G&T template assigned
 */
export const checkSchoolTemplateThunk = async (schoolId) => {
	try {
		const response = await myPeeguAxios({
			method: apiMethods.get,
			url: `${apiEndPoints.gandtSchoolTemplateCheck}/${schoolId}/template-check`,
		})
		return response.data.message
	} catch (error) {
		throw error
	}
}

/**
 * Get students list with assessment status
 */
export const getStudentsWithStatusThunk = async ({
	schoolId,
	classroomId,
	academicYearId,
}) => {
	try {
		const url = academicYearId
			? `${apiEndPoints.gandtStudentsWithStatus}/${schoolId}/classroom/${classroomId}/students?academicYearId=${academicYearId}`
			: `${apiEndPoints.gandtStudentsWithStatus}/${schoolId}/classroom/${classroomId}/students`

		const response = await myPeeguAxios({
			method: apiMethods.get,
			url,
		})
		return response.data.message
	} catch (error) {
		throw error
	}
}

/**
 * Get student assessment history
 */
export const getStudentHistoryThunk = async ({ studentId, academicYearId }) => {
	try {
		const url = academicYearId
			? `${apiEndPoints.gandtStudentHistory}/${studentId}/history?academicYearId=${academicYearId}`
			: `${apiEndPoints.gandtStudentHistory}/${studentId}/history`

		const response = await myPeeguAxios({
			method: apiMethods.get,
			url,
		})
		return response.data.message
	} catch (error) {
		throw error
	}
}

/**
 * Get assessment questions based on template and student age
 */
export const getAssessmentQuestionsThunk = async ({ templateId, studentAge }) => {
	try {
		const response = await myPeeguAxios({
			method: apiMethods.get,
			url: `${apiEndPoints.gandtAssessmentQuestions}?templateId=${templateId}&studentAge=${studentAge}`,
		})
		return response.data.message
	} catch (error) {
		throw error
	}
}

/**
 * Save (create or update) assessment
 */
export const saveAssessmentThunk = async (assessmentData) => {
	try {
		const response = await myPeeguAxios({
			method: apiMethods.post,
			url: apiEndPoints.gandtAssessment,
			data: assessmentData,
		})
		return response.data.message
	} catch (error) {
		throw error
	}
}

/**
 * Get assessment by ID
 */
export const getAssessmentByIdThunk = async (assessmentId) => {
	try {
		const response = await myPeeguAxios({
			method: apiMethods.get,
			url: `${apiEndPoints.gandtAssessment}/${assessmentId}`,
		})
		return response.data.message
	} catch (error) {
		throw error
	}
}

/**
 * Delete assessment
 */
export const deleteAssessmentThunk = async (assessmentId) => {
	try {
		const response = await myPeeguAxios({
			method: apiMethods.delete,
			url: `${apiEndPoints.gandtAssessment}/${assessmentId}`,
		})
		return response.data.message
	} catch (error) {
		throw error
	}
}
