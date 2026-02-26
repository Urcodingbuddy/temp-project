const { IRIForTeachers } = require('../../models/database/IRI-for-teachers')
const { CommonHelperServices } = require('../common-services/common-helper-service')
const utils = require('../../utility/utils')
const { STATUSES } = require('../../utility/localConstants')

class IRIProfilingHelperService extends CommonHelperServices {
	/**
	 * Compute percentile ranks for a specific teacher across selected numeric properties.
	 *
	 * percentile definition (kept identical to your original logic):
	 *   1. Sort values ASC for each property.
	 *   2. If multiple teachers have the same value (tie), use the average of their ranks.
	 *      Example: scores at sorted positions 3 and 4 (1-based) -> avgRank = (3 + 4) / 2 = 3.5
	 *   3. Percentile = (avgRank / totalCount) * 100
	 *
	 * Notes:
	 * - Ranks are 1-based (lowest value rank = 1).
	 * - If a property is missing or not a finite number for the specific teacher,
	 *   that property is skipped.
	 * - Sorting is O(n log n) per property; all other steps are O(n).
	 *
	 * @typedef {Object} Teacher
	 * @property {string|number} _id - Unique identifier (stringifiable with toString()).
	 * @property {number} [perspectiveNP]
	 * @property {number} [fantasyNP]
	 * @property {number} [empathicNP]
	 * @property {number} [personalDistressNP]
	 *
	 * @param {Teacher} specificTeacher - The teacher to rank.
	 * @param {Teacher[]} teacherData   - Population to compute ranks against (includes the specific teacher).
	 * @param {string[]} [properties=['perspectiveNP', 'fantasyNP', 'empathicNP', 'personalDistressNP']]
	 *        List of numeric properties to compute percentiles for.
	 *
	 * @returns {Record<string, number>} An object like:
	 *  {
	 *    perspectiveNPPercentile: 42.8571428571,
	 *    fantasyNPPercentile: 73.3333333333,
	 *    empathicNPPercentile: 50,
	 *    personalDistressNPPercentile: 12.5
	 *  }
	 */
	getSpecificTeacherRanks(
		specificTeacher,
		teacherData,
		properties = ['perspectiveNP', 'fantasyNP', 'empathicNP', 'personalDistressNP'],
	) {
		const result = {}
		const totalCount = teacherData.length
		if (!specificTeacher || !totalCount) return result

		// Helper: safely stringify ids for comparison
		const idOf = (t) => (t && t.teacher != null ? t.teacher.toString() : '')

		// Validate that specificTeacher exists in data (optional, but safer)
		// If not found, we still compute using their values against the population.
		const specificId = idOf(specificTeacher)

		for (const property of properties) {
			const value = Number(specificTeacher?.[property])
			if (!Number.isFinite(value)) {
				// Skip invalid/missing numeric values
				continue
			}

			// 1) Sort teachers ASC by the property, treating missing/non-finite as +Infinity (bottom skip):
			//    We’ll filter invalids out entirely so they don’t affect ranks.
			const sorted = teacherData
				.filter((t) => Number.isFinite(Number(t?.[property])))
				.slice()
				.sort((a, b) => Number(a[property]) - Number(b[property]))

			const n = sorted.length
			if (n === 0) {
				continue // nothing to rank against
			}

			// 2) Build a map: score -> avgRank (using a single pass over the sorted array).
			//    avgRank for a score that spans indices [start..end] (0-based) is:
			//      ((start+1) + (end+1)) / 2
			const scoreToAvgRank = new Map()
			let i = 0
			while (i < n) {
				const currentScore = Number(sorted[i][property])
				let j = i + 1
				while (j < n && Number(sorted[j][property]) === currentScore) j++

				// Now [i..j-1] (inclusive) is the block with the same score.
				const startRank = i + 1 // 1-based
				const endRank = j // 1-based (since j is exclusive in 0-based)
				const avgRank = (startRank + endRank) / 2

				scoreToAvgRank.set(currentScore, avgRank)
				i = j
			}

			// 3) Look up the specific teacher's avgRank for this property's score
			const avgRankForValue = scoreToAvgRank.get(value)
			if (!Number.isFinite(avgRankForValue)) {
				// The specific teacher’s value wasn’t in the population map (shouldn’t happen if included),
				// but if it does, skip gracefully.
				continue
			}

			// 4) Convert to percentile using your exact formula:
			const percentile = (avgRankForValue / n) * 100

			result[`${property}Percentile`] = percentile
		}

		return result
	}

	async fetchIRIRecords(teacher, teacherIRIRecord, allSchools = false) {
		const matchQuery = {
			academicYear: teacherIRIRecord.academicYear,
			teacher: { $ne: teacher._id },
		}

		// If single school the fetch recrds for the given schools else it will fetch for all schools
		if (!allSchools) {
			matchQuery.school = teacherIRIRecord.school
		}

		const teacherIRIRecords = await IRIForTeachers.aggregate([
			{ $match: matchQuery },
			{ $sort: { endDate: -1 } }, // newest records first
			{
				$group: {
					_id: '$teacher',
					latestRecord: { $first: '$$ROOT' }, // pick latest per teacher
				},
			},
			{ $replaceRoot: { newRoot: '$latestRecord' } }, // unwrap
		])

		return [...teacherIRIRecords, teacherIRIRecord]
	}

	async fetchTeacherIRIReportGenerationData(teacherIRIRecord, teachersIRIData) {
		const allTeachersCategorySumScores = {
			perspectiveTakingScores: [],
			fantasyScores: [],
			empathicConcernScores: [],
			personalDistressScores: [],
		}
		const currentTeacherCategoryScores = {
			perspectiveTakingScore: 0,
			fantasyScore: 0,
			empathicConcernScore: 0,
			personalDistressScore: 0,
		}

		teachersIRIData.forEach((teacherData) => {
			if (teacherData.formStatus === STATUSES.SUBMITTED) {
				let perspectiveTaking = []
				let fantasy = []
				let empathicConcern = []
				let personalDistress = []
				// Here it updates the questions scrore with reverse marks based on section and question number else original marks considered.
				const updattedIRIAssesment = utils.updateQuestionScores(
					utils.SectionEnum.TEACHER_IRI,
					teacherData.teacherIRIReport,
				)

				for (const assessment of updattedIRIAssesment) {
					const { questionNumber, marks } = assessment

					if ([3, 8, 11, 15, 21, 25, 28].includes(questionNumber)) {
						perspectiveTaking.push(marks)
					} else if ([1, 5, 7, 12, 16, 23, 26].includes(questionNumber)) {
						fantasy.push(marks)
					} else if ([2, 4, 9, 14, 18, 20, 22].includes(questionNumber)) {
						empathicConcern.push(marks)
					} else if ([6, 10, 13, 17, 19, 24, 27].includes(questionNumber)) {
						personalDistress.push(marks)
					}
				}
				const perspectiveTakingSum = perspectiveTaking.reduce((a, b) => a + b, 0)
				allTeachersCategorySumScores.perspectiveTakingScores.push(perspectiveTakingSum)

				const personalDistressSum = personalDistress.reduce((a, b) => a + b, 0)
				allTeachersCategorySumScores.personalDistressScores.push(personalDistressSum)

				const empathicConcernSum = empathicConcern.reduce((a, b) => a + b, 0)
				allTeachersCategorySumScores.empathicConcernScores.push(empathicConcernSum)

				const fantasySum = fantasy.reduce((a, b) => a + b, 0)
				allTeachersCategorySumScores.fantasyScores.push(fantasySum)

				if (teacherIRIRecord._id.toString() === teacherData._id.toString()) {
					currentTeacherCategoryScores.perspectiveTakingScore = perspectiveTakingSum
					currentTeacherCategoryScores.fantasyScore = fantasySum
					currentTeacherCategoryScores.empathicConcernScore = empathicConcernSum
					currentTeacherCategoryScores.personalDistressScore = personalDistressSum
				}
			}
		})

		const quartile = (arr, q) => {
			arr = arr.slice().sort((a, b) => a - b) // sort ascending
			const pos = (arr.length - 1) * q
			const base = Math.floor(pos)
			const rest = pos - base
			if (arr[base + 1] !== undefined) {
				return arr[base] + rest * (arr[base + 1] - arr[base])
			} else {
				return arr[base]
			}
		}

		const categoryQuartiles = {
			perspectiveTaking: quartile(allTeachersCategorySumScores.perspectiveTakingScores, 0.25),
			fantasy: quartile(allTeachersCategorySumScores.fantasyScores, 0.25),
			empathicConcern: quartile(allTeachersCategorySumScores.empathicConcernScores, 0.25),
			personalDistress: quartile(allTeachersCategorySumScores.personalDistressScores, 0.25),
		}

		return { currentTeacherCategoryScores, categoryQuartiles }
	}

	async specificTeacherPercentileScoreOfIRI(teacherIRIRecords, teacher) {
		const teachersArray = teacherIRIRecords
			.map((t) => {
				const teacherScore =
					((t.perspectiveNP || 0) +
						(t.fantasyNP || 0) +
						(t.empathicNP || 0) +
						(t.personalDistressNP || 0)) /
						4 ?? 0

				return {
					...t,
					teacherScore,
				}
			})
			.sort((a, b) => a.teacherScore - b.teacherScore) // ascending order

		const totalCount = teachersArray.length
		const uniqueScores = {}
		let rankSum = 0

		const percentiles = {}
		teachersArray.forEach((teacher, index) => {
			const score = teacher.teacherScore
			if (!(score in uniqueScores)) {
				uniqueScores[score] = { count: 0, sumRanks: 0 }
			}

			uniqueScores[score].count++
			uniqueScores[score].sumRanks += index + 1
			rankSum += index + 1
		})
		for (const score in uniqueScores) {
			const count = uniqueScores[score].count
			const sumRanks = uniqueScores[score].sumRanks
			const avgRank = sumRanks / count
			const percentile = (avgRank / totalCount) * 100

			teachersArray.forEach((teacherData) => {
				if (
					teacherData?.teacher?.toString() === teacher._id.toString() &&
					teacherData.teacherScore === Number(score)
				) {
					percentiles[`PercentileOfTeacher`] = percentile
				}
			})
		}

		return { percentiles, teachersArray }
	}
}

module.exports.IRIProfilingHelperService = IRIProfilingHelperService
