const { Schools } = require('../models/database/myPeegu-school')
const { AcademicYears } = require('../models/database/academic-years')
const { SchoolAcademicYears } = require('../models/database/school-academic-years')
const { cacheService } = require('./cashe.service')
const { Classrooms } = require('../models/database/myPeegu-classroom')
const { Students } = require('../models/database/myPeegu-student')

function watchCollection(model, setterFn, label) {
	let debounceTimeout = null

	const changeStream = model.watch([
		{ $match: { operationType: { $in: ['insert', 'update', 'replace'] } } },
	])

	changeStream.on('change', () => {
		console.log(`🔄 ${label} collection changed, scheduling reload...`)

		if (debounceTimeout) clearTimeout(debounceTimeout)

		debounceTimeout = setTimeout(async () => {
			try {
				const newData = await model.find({}).lean()
				await setterFn(newData)
				console.log(`✅ ${label} cache updated`)
			} catch (err) {
				console.error(`❌ Error updating ${label} cache:`, err)
			}
		}, 1000) // wait 1 second after last change event before writing
	})
}

function initWatchers() {
	watchCollection(Schools, cacheService.setSchools.bind(cacheService), 'Schools')
	watchCollection(Students, cacheService.setStudents.bind(cacheService), 'Students')
	watchCollection(Classrooms, cacheService.setClassrooms.bind(cacheService), 'Classrooms')
	watchCollection(
		AcademicYears,
		cacheService.setAcademicYears.bind(cacheService),
		'Academic Years',
	)
	watchCollection(
		SchoolAcademicYears,
		cacheService.setSchoolAcademicYears.bind(cacheService),
		'School Academic Years',
	)
}

module.exports = { initWatchers }
