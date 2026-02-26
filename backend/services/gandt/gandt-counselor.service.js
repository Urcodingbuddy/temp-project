const { mongoose } = require('mongoose')
const utils = require('../../utility/utils')
const { CommonHelperServices } = require('../common-services/common-helper-service')
const { SuccessResponse, FailureResponse } = require('../../models/response/globalResponse')
const GandTAssessment = require('../../models/database/gandt-assessment')
const GandTTemplate = require('../../models/database/gandt-template')
const GandTAssignment = require('../../models/database/gandt-assignment')
const { Students } = require('../../models/database/myPeegu-student')
const { Classrooms } = require('../../models/database/myPeegu-classroom')
const { Schools } = require('../../models/database/myPeegu-school')

class GandTCounselorService extends CommonHelperServices {
	/**
	 * Check if a school has G&T template assigned
	 */
	async checkSchoolTemplateAssignment(req, res) {
		try {
			const { schoolId } = req.params

			if (!schoolId) {
				return res.status(400).json(new FailureResponse('School ID is required'))
			}

			// Check if school exists
			const school = await Schools.findById(schoolId)
			if (!school) {
				return res.status(404).json(new FailureResponse('School not found'))
			}

			// Check if template is assigned to this school
			const assignment = await GandTAssignment.findOne({
				school: schoolId,
				isActive: true,
			}).populate('template', 'templateName description ageGroups skills')

			if (!assignment) {
				return res.status(200).json(
					new SuccessResponse({
						hasTemplate: false,
						message: 'Please contact super admin to associate a G&T template for the school',
					}),
				)
			}

			return res.status(200).json(
				new SuccessResponse({
					hasTemplate: true,
					template: assignment.template,
					assignmentId: assignment._id,
				}),
			)
		} catch (err) {
			console.error('Check School Template Assignment Error:', err)
			return res.status(500).json(new FailureResponse('Internal Server Error'))
		}
	}

	/**
	 * Get students list with G&T assessment status for a class
	 */
	async getStudentsWithAssessmentStatus(req, res) {
		try {
			const { schoolId, classroomId } = req.params
			const { academicYearId } = req.query

			if (!schoolId || !classroomId) {
				return res.status(400).json(new FailureResponse('School ID and Classroom ID are required'))
			}

			// Get current academic year if not provided
			let academicYear = academicYearId
			if (!academicYear) {
				const currentAY = await this.getCurrentAcademicYear()
				if (!currentAY) {
					return res.status(400).json(new FailureResponse('No active academic year found'))
				}
				academicYear = currentAY._id
			}

			// Get all students in the classroom for the current academic year
			const students = await Students.find({
				school: schoolId,
				classRoomId: classroomId,
				graduated: false,
				exited: false,
			})
				.select('_id studentName user_id dob regNo')
				.lean()

			if (!students || students.length === 0) {
				return res.status(200).json(
					new SuccessResponse({
						students: [],
						totalCount: 0,
					}),
				)
			}

			// Get student IDs
			const studentIds = students.map((s) => s._id)

			// Get all G&T assessments for these students in current academic year
			const assessments = await GandTAssessment.find({
				studentId: { $in: studentIds },
				academicYear: academicYear,
			})
				.select('studentId status submittedDate createdAt overallPercentage totalTalentedScore maxPossibleScore classification tier')
				.lean()

			// Create a map of studentId to assessments
			const assessmentMap = {}
			assessments.forEach((assessment) => {
				const studentIdStr = assessment.studentId.toString()
				if (!assessmentMap[studentIdStr]) {
					assessmentMap[studentIdStr] = []
				}
				assessmentMap[studentIdStr].push(assessment)
			})

			// Calculate age from DOB
			const calculateAge = (dob) => {
				if (!dob) return null
				const today = new Date()
				const birthDate = new Date(dob)
				let age = today.getFullYear() - birthDate.getFullYear()
				const monthDiff = today.getMonth() - birthDate.getMonth()
				if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
					age--
				}
				return age
			}

			// Enrich students with assessment status
			const enrichedStudents = students.map((student) => {
				const studentIdStr = student._id.toString()
				const studentAssessments = assessmentMap[studentIdStr] || []
				const completedAssessments = studentAssessments.filter((a) => a.status === 'completed')
				const inProgressAssessments = studentAssessments.filter(
					(a) => a.status === 'in-progress',
				)

				// Get latest completed assessment for classification
				const latestCompleted =
					completedAssessments.length > 0
						? completedAssessments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
						: null

				return {
					...student,
					age: calculateAge(student.dob),
					assessmentStatus: studentAssessments.length > 0 ? 'done' : 'not-done',
					totalAssessments: studentAssessments.length,
					completedAssessments: completedAssessments.length,
					inProgressAssessments: inProgressAssessments.length,
					lastAssessmentDate:
						studentAssessments.length > 0
							? studentAssessments.sort(
									(a, b) => new Date(b.createdAt) - new Date(a.createdAt),
								)[0].createdAt
							: null,
					latestClassification: latestCompleted?.classification || null,
					latestTier: latestCompleted?.tier || null,
				}
			})

			return res.status(200).json(
				new SuccessResponse({
					students: enrichedStudents,
					totalCount: enrichedStudents.length,
				}),
			)
		} catch (err) {
			console.error('Get Students With Assessment Status Error:', err)
			return res.status(500).json(new FailureResponse('Internal Server Error'))
		}
	}

	/**
	 * Get student's G&T assessment history
	 */
	async getStudentAssessmentHistory(req, res) {
		try {
			const { studentId } = req.params
			const { academicYearId } = req.query

			if (!studentId) {
				return res.status(400).json(new FailureResponse('Student ID is required'))
			}

			// Build query
			const query = { studentId }
			if (academicYearId) {
				query.academicYear = academicYearId
			}

			// Get all assessments for the student
			const assessments = await GandTAssessment.find(query)
				.select('createdAt status classification tier giftedPercentage talentedPercentage ageGroupTitle counsellorName templateName')
				.populate('template', 'templateName')
				.populate('academicYear', 'year')
				.sort({ createdAt: -1 })
				.lean()

			return res.status(200).json(
				new SuccessResponse({
					assessments,
					totalCount: assessments.length,
				}),
			)
		} catch (err) {
			console.error('Get Student Assessment History Error:', err)
			return res.status(500).json(new FailureResponse('Internal Server Error'))
		}
	}

	/**
	 * Get assessment questions based on student's age and template
	 */
	async getAssessmentQuestions(req, res) {
		try {
			const { templateId, studentAge } = req.query

			if (!templateId || studentAge === undefined) {
				return res
					.status(400)
					.json(new FailureResponse('Template ID and Student Age are required'))
			}

			const age = parseInt(studentAge)

			// Get template with all details
			const template = await GandTTemplate.findById(templateId).lean()

			if (!template) {
				return res.status(404).json(new FailureResponse('Template not found'))
			}

			if (!template.isActive) {
				return res.status(400).json(new FailureResponse('Template is not active'))
			}

			// Find the appropriate age group for the student
			const ageGroup = template.ageGroups.find(
				(ag) => age >= ag.startAge && age <= ag.endAge,
			)

			if (!ageGroup) {
				return res
					.status(400)
					.json(
						new FailureResponse(
							`No age group found for age ${age} in this template. Available age groups: ${template.ageGroups.map((ag) => `${ag.title} (${ag.startAge}-${ag.endAge})`).join(', ')}`,
						),
					)
			}

			// Get questions for this age group
			const ageGroupQuestions = template.ageGroupQuestions.filter(
				(agq) => agq.ageGroupId.toString() === ageGroup._id.toString(),
			)

			// Organize questions by skill
			const questionsBySkill = []
			template.skills.forEach((skill) => {
				const skillQuestions = ageGroupQuestions.find(
					(agq) => agq.skillId.toString() === skill._id.toString(),
				)

				if (skillQuestions && skillQuestions.questions.length > 0) {
					questionsBySkill.push({
						skill: {
							_id: skill._id,
							skillName: skill.skillName,
							weightage: skill.weightage,
							order: skill.order,
						},
						questions: skillQuestions.questions.sort((a, b) => a.order - b.order),
					})
				}
			})

			// Sort by skill order
			questionsBySkill.sort((a, b) => a.skill.order - b.skill.order)

			return res.status(200).json(
				new SuccessResponse({
					template: {
						_id: template._id,
						templateName: template.templateName,
						description: template.description,
					},
					ageGroup: {
						_id: ageGroup._id,
						title: ageGroup.title,
						startAge: ageGroup.startAge,
						endAge: ageGroup.endAge,
					},
					studentAge: age,
					questionsBySkill,
					totalQuestions: questionsBySkill.reduce(
						(sum, qs) => sum + qs.questions.length,
						0,
					),
				}),
			)
		} catch (err) {
			console.error('Get Assessment Questions Error:', err)
			return res.status(500).json(new FailureResponse('Internal Server Error'))
		}
	}

	/**
	 * Create or update G&T assessment
	 */
	async saveAssessment(req, res) {
		try {
			const assessmentData = req.body
			const userId = req.user._id

			// Validate required fields
			const requiredFields = [
				'studentId',
				'school',
				'classRoomId',
				'template',
				'ageGroupId',
				'studentAge',
			]
			for (const field of requiredFields) {
				if (!assessmentData[field]) {
					return res.status(400).json(new FailureResponse(`${field} is required`))
				}
			}

			// Get student details
			const student = await Students.findById(assessmentData.studentId)
			if (!student) {
				return res.status(404).json(new FailureResponse('Student not found'))
			}

			// Get current academic year and SAY
			const currentAY = await this.getCurrentAcademicYear()
			if (!currentAY) {
				return res.status(400).json(new FailureResponse('No active academic year found'))
			}

			const say = await this.fetchCurSAYbySchool(assessmentData.school)
			if (!say) {
				return res
					.status(400)
					.json(new FailureResponse('School Academic Year not found for this school'))
			}

			// Get template details
			const template = await GandTTemplate.findById(assessmentData.template)
			if (!template) {
				return res.status(404).json(new FailureResponse('Template not found'))
			}

			// Get school details
			const school = await Schools.findById(assessmentData.school)
			if (!school) {
				return res.status(404).json(new FailureResponse('School not found'))
			}

			// Find age group
			const ageGroup = template.ageGroups.id(assessmentData.ageGroupId)
			if (!ageGroup) {
				return res.status(404).json(new FailureResponse('Age group not found in template'))
			}

			// Calculate scores if answers are provided
			let skillScores = []
			let totalGiftedScore = 0
			let totalTalentedScore = 0

			if (assessmentData.answers && assessmentData.answers.length > 0) {
				// Group answers by skill
				const answersBySkill = {}
				assessmentData.answers.forEach((answer) => {
					const skillIdStr = answer.skillId.toString()
					if (!answersBySkill[skillIdStr]) {
						answersBySkill[skillIdStr] = []
					}
					answersBySkill[skillIdStr].push(answer)
				})

				console.log('Total answers received:', assessmentData.answers.length)
				console.log('Sample answer:', assessmentData.answers[0])

				// Calculate scores for each skill
				template.skills.forEach((skill) => {
					const skillIdStr = skill._id.toString()
					const skillAnswers = answersBySkill[skillIdStr] || []

					console.log(`Processing skill: ${skill.skillName}, answers count: ${skillAnswers.length}`)

					let skillGiftedScore = 0
					let skillTalentedScore = 0
					let skillGiftedMaxScore = 0
					let skillTalentedMaxScore = 0
					let giftedQuestionsCount = 0
					let talentedQuestionsCount = 0

					skillAnswers.forEach((answer) => {
						console.log(`Answer category: ${answer.category}, score: ${answer.score}`)
						if (answer.category === 'gifted') {
							skillGiftedScore += answer.score || 0
							giftedQuestionsCount++
						} else if (answer.category === 'talented') {
							skillTalentedScore += answer.score || 0
							talentedQuestionsCount++
						}
					})

					console.log(`Skill ${skill.skillName}: gifted=${giftedQuestionsCount}, talented=${talentedQuestionsCount}, giftedScore=${skillGiftedScore}, talentedScore=${skillTalentedScore}`)

					// Calculate max possible score for this skill
					const ageGroupQuestions = template.ageGroupQuestions.find(
						(agq) =>
							agq.ageGroupId.toString() === ageGroup._id.toString() &&
							agq.skillId.toString() === skillIdStr,
					)

					if (ageGroupQuestions) {
						ageGroupQuestions.questions.forEach((q) => {
							const maxOptionScore = Math.max(...q.options.map((opt) => opt.score))

							// Track max scores by category
							if (q.category === 'gifted') {
								skillGiftedMaxScore += maxOptionScore
							} else if (q.category === 'talented') {
								skillTalentedMaxScore += maxOptionScore
							}
						})
					}

					// Calculate average scores (indicators on 1-4 scale)
					const giftedIndicator = giftedQuestionsCount > 0
						? (skillGiftedScore / giftedQuestionsCount).toFixed(2)
						: 0
					const talentedIndicator = talentedQuestionsCount > 0
						? (skillTalentedScore / talentedQuestionsCount).toFixed(2)
						: 0

					skillScores.push({
						skillId: skill._id,
						skillName: skill.skillName,
						giftedScore: skillGiftedScore,
						talentedScore: skillTalentedScore,
						giftedMaxScore: skillGiftedMaxScore,
						talentedMaxScore: skillTalentedMaxScore,
						giftedQuestionsCount,
						talentedQuestionsCount,
						giftedIndicator: parseFloat(giftedIndicator),
						talentedIndicator: parseFloat(talentedIndicator),
					})

					totalGiftedScore += skillGiftedScore
					totalTalentedScore += skillTalentedScore
				})
			}

			// Calculate total max scores for gifted and talented
			let totalGiftedMaxScore = 0
			let totalTalentedMaxScore = 0
			skillScores.forEach((skill) => {
				totalGiftedMaxScore += skill.giftedMaxScore
				totalTalentedMaxScore += skill.talentedMaxScore
			})

			const giftedPercentage =
				totalGiftedMaxScore > 0
					? parseFloat(((totalGiftedScore / totalGiftedMaxScore) * 100).toFixed(2))
					: 0

			const talentedPercentage =
				totalTalentedMaxScore > 0
					? parseFloat(((totalTalentedScore / totalTalentedMaxScore) * 100).toFixed(2))
					: 0

			console.log('Final scores:', {
				totalGiftedScore,
				totalGiftedMaxScore,
				giftedPercentage,
				totalTalentedScore,
				totalTalentedMaxScore,
				talentedPercentage
			})

			// Calculate classification based on percentages
			const calculateClassification = (giftedPct, talentedPct) => {
				const gifted = giftedPct >= 70
				const talented = talentedPct >= 50

				if (gifted && talented && talentedPct >= 50) {
					return 'Gifted & Talented'
				} else if (gifted && talentedPct < 50) {
					return 'Gifted'
				} else if (talented && talentedPct >= 70 && giftedPct < 50) {
					return 'Talented'
				} else if (
					(gifted && giftedPct >= 50 && giftedPct < 70) ||
					(talented && talentedPct >= 50 && talentedPct < 70)
				) {
					return 'Emerging Potential'
				} else {
					return 'Standard Range'
				}
			}

			const classification = assessmentData.status === 'completed'
				? calculateClassification(giftedPercentage, talentedPercentage)
				: null

			// Calculate tier based on classification
			const calculateTier = (classificationResult) => {
				if (!classificationResult) return null
				if (classificationResult === 'Gifted & Talented') {
					return 'Tier 1 - Immediate Placement'
				} else if (['Gifted', 'Talented', 'Emerging Potential'].includes(classificationResult)) {
					return 'Tier 2 - Enrichment'
				} else if (classificationResult === 'Standard Range') {
					return 'Tier 3 - Standard Monitoring'
				}
				return null
			}

			const tier = calculateTier(classification)

			// Prepare assessment data
			const assessmentPayload = {
				studentId: student._id,
				studentName: student.studentName,
				user_id: student.user_id,
				school: school._id,
				schoolName: school.school,
				classRoomId: assessmentData.classRoomId,
				SAY: say._id,
				academicYear: currentAY._id,
				template: template._id,
				templateName: template.templateName,
				ageGroupId: ageGroup._id,
				ageGroupTitle: ageGroup.title,
				studentAge: assessmentData.studentAge,
				counsellorId: userId,
				counsellorName: req.user.userName || req.user.email,
				answers: assessmentData.answers || [],
				skillScores,
				totalGiftedScore,
				totalTalentedScore,
				totalGiftedMaxScore,
				totalTalentedMaxScore,
				giftedPercentage,
				talentedPercentage,
				classification,
				tier,
				status: assessmentData.status || 'in-progress',
				submittedDate: assessmentData.status === 'completed' ? new Date() : null,
				remarks: assessmentData.remarks || '',
				graduated: student.graduated || false,
				exited: student.exited || false,
			}

			// Update or create assessment
			let assessment
			if (assessmentData._id) {
				// Update existing assessment
				assessment = await GandTAssessment.findByIdAndUpdate(
					assessmentData._id,
					assessmentPayload,
					{ new: true, runValidators: true },
				)
			} else {
				// Create new assessment
				assessment = new GandTAssessment(assessmentPayload)
				await assessment.save()
			}

			return res
				.status(assessmentData._id ? 200 : 201)
				.json(
					new SuccessResponse({
						assessment,
						message: assessmentData._id ? 'Assessment updated successfully' : 'Assessment created successfully',
					}),
				)
		} catch (err) {
			console.error('Save Assessment Error:', err)
			return res.status(500).json(new FailureResponse('Internal Server Error'))
		}
	}

	/**
	 * Get assessment by ID
	 */
	async getAssessmentById(req, res) {
		try {
			const { assessmentId } = req.params

			if (!assessmentId) {
				return res.status(400).json(new FailureResponse('Assessment ID is required'))
			}

			const assessment = await GandTAssessment.findById(assessmentId)
				.populate('template', 'templateName description ageGroups skills ageGroupQuestions')
				.populate('academicYear', 'year')
				.lean()

			if (!assessment) {
				return res.status(404).json(new FailureResponse('Assessment not found'))
			}

			return res.status(200).json(new SuccessResponse(assessment))
		} catch (err) {
			console.error('Get Assessment By ID Error:', err)
			return res.status(500).json(new FailureResponse('Internal Server Error'))
		}
	}

	/**
	 * Delete assessment
	 */
	async deleteAssessment(req, res) {
		try {
			const { assessmentId } = req.params

			if (!assessmentId) {
				return res.status(400).json(new FailureResponse('Assessment ID is required'))
			}

			const assessment = await GandTAssessment.findByIdAndDelete(assessmentId)

			if (!assessment) {
				return res.status(404).json(new FailureResponse('Assessment not found'))
			}

			return res.status(200).json(new SuccessResponse(null, 'Assessment deleted successfully'))
		} catch (err) {
			console.error('Delete Assessment Error:', err)
			return res.status(500).json(new FailureResponse('Internal Server Error'))
		}
	}
}

module.exports = { GandTCounselorService }
