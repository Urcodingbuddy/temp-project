const express = require('express');
const router = express.Router();

const myPeeguUserRoutes = require('./myPeeguUser');
const schoolRoutes = require('./school.route');
const gandtTemplateRoutes = require('./gandt-template.route');
const gandtAssignmentRoutes = require('./gandt-assignment.route');

router.use(myPeeguUserRoutes);
router.use(schoolRoutes);
router.use(gandtTemplateRoutes);
router.use(gandtAssignmentRoutes);

module.exports = router;
