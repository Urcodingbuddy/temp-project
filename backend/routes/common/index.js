const express = require('express')
const router = express.Router()

const commonRoute = require('./commonApis')
const studentsDataRoute = require('./students-data.route')

router.use(commonRoute)
router.use(studentsDataRoute)

module.exports = router
