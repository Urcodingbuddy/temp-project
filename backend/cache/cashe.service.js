// cacheService.js
const fs = require('fs/promises')
const path = require('path')
const cacheInstance = require('./CacheManager')
const { convertObjectIdsToStrings } = require('../utility/utils')

const CacheKeys = Object.freeze({
	SCHOOLS: 'schools',
	STUDENTS: 'students',
	CLASSROOMS: 'classrooms',
	ACADEMICYEARS: 'academicYears',
	SAYS: 'SAYs',
})

class CacheService {
	constructor() {}

	get students() {
		console.log(`Get students from cashe starts here`)
		return (async () => {
			return await cacheInstance.getAsync(CacheKeys.STUDENTS)
		})()
	}

	async setStudents(data) {
		await cacheInstance.setAsync(CacheKeys.STUDENTS, convertObjectIdsToStrings(data))
	}

	get schools() {
		return (async () => {
			return await cacheInstance.getAsync(CacheKeys.SCHOOLS)
		})()
	}

	async setSchools(data) {
		await cacheInstance.setAsync(CacheKeys.SCHOOLS, convertObjectIdsToStrings(data))
	}

	get classrooms() {
		return (async () => {
			return await cacheInstance.getAsync(CacheKeys.CLASSROOMS)
		})()
	}

	async setClassrooms(data) {
		await cacheInstance.setAsync(CacheKeys.CLASSROOMS, convertObjectIdsToStrings(data))
	}

	get academicYears() {
		return (async () => {
			return await cacheInstance.getAsync(CacheKeys.ACADEMICYEARS)
		})()
	}

	async setAcademicYears(data) {
		await cacheInstance.setAsync(CacheKeys.ACADEMICYEARS, convertObjectIdsToStrings(data))
	}

	get schoolAcademicYears() {
		return (async () => {
			return await cacheInstance.getAsync(CacheKeys.SAYS)
		})()
	}

	async setSchoolAcademicYears(data) {
		await cacheInstance.setAsync(CacheKeys.SAYS, convertObjectIdsToStrings(data))
	}
}

const cacheService = new CacheService()
module.exports = { cacheService }
