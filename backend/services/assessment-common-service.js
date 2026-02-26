const { COPEAssessment } = require('../models/database/myPeegu-studentCOPEAssessment')
const { GlobalServices } = require('./global-service')

class AssessmentCommonService extends GlobalServices {}

const assessmentCommonService = new AssessmentCommonService()
module.exports.AssessmentCommonService = AssessmentCommonService
