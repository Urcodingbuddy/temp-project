const express = require('express')
const error = require('../middleware/error')
const myPeeguUser = require('../routes/myPeeguAdmin-portel')
const counselor = require('../routes/counselor-portel')
const resources = require('../routes/common')

const cors = require('cors')
const logger = require('../utility/logger')
// Execute schedulers

const pathsWithDifferentLimit = [
	{ path: '/counselor/v1/createmultiplestudents', limit: '20mb' },
	{ path: '/counselor/v1/createmultipleclassrooms', limit: '20mb' },
	{ path: '/counselor/v1/bulkTeacherDataInsertion', limit: '20mb' },
	{ path: '/counselor/v1/create-multiple-baseline-records', limit: '20mb' },
	{ path: '/counselor/v1/create-multiple-student-cope-records', limit: '20mb' },
	{ path: '/counselor/v1/create-multiple-student-wb-records', limit: '20mb' },
	{ path: '/counselor/v1/create-multiple-send-checklists', limit: '20mb' },
	{ path: '/counselor/v1/upload-teacher-profiling', limit: '20mb' },
	{ path: '/counselor/v1/upload-teacher-iris', limit: '20mb' },
]

module.exports = function (app) {
	app.use((req, res, next) => {
		const matchedRoute = pathsWithDifferentLimit.find((route) => req.path.startsWith(route.path))
		if (matchedRoute) {
			express.json({ limit: matchedRoute.limit })(req, res, next)
		} else {
			express.json({ limit: '200kb' })(req, res, next)
		}
	})
	const corsOptions = {
		origin: '*',
		exposedHeaders: '*',
	}
	app.use(cors(corsOptions))
	app.use(express.json())
	app.use(express.urlencoded({ extended: true }))
	app.use(express.static('public'))
	app.use('/mypeeguuser/v1', myPeeguUser)
	app.use('/counselor/v1', counselor)
	app.use('/resources/v1', resources)

	app.use(error)
}
