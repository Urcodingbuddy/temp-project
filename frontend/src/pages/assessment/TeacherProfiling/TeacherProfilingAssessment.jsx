import { Box, IconButton, Popover, Tab, Tabs, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import useCommonStyles from '../../../components/styles'
import { useDispatch, useSelector } from 'react-redux'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomButton from '../../../components/CustomButton'
import { teacherStyles } from './teacherProfilingStyles'
import { iconConstants } from '../../../resources/theme/iconConstants'
import CustomIcon from '../../../components/CustomIcon'

import {
	deleteTeacherProfiling,
	fetchTeacherProfiling,
	submitTeacherProfiling,
} from './teacherProfilingSlice'
import {
	formatDate,
	getUserFromLocalStorage,
	isCounsellor,
} from '../../../utils/utils'

import AssessmentFormTab from './Tabs/AssessmentResultTab'
import TeacherProfilingReport from './TeacherProfilingReport'
import CustomDialog from '../../../components/CustomDialog'
import ModalDeckViewer from '../../../components/ModalDeckViewer'
import { reportsIncludePages } from '../../../utils/globalConstants'

const TeacherProfilingAssessment = ({
	selectedTeacherRowData,
	SchoolRow,
	refreshTeacherList,
	refreshSchoolList,
}) => {
	const flexStyles = useCommonStyles()
	const dispatch = useDispatch()
	const { appPermissions, isPermissionOfTeacher } = useSelector(
		(store) => store.dashboardSliceSetup,
	)
	const teacherRow = isPermissionOfTeacher ? {} : selectedTeacherRowData
	const { singleTeacherDetails } = useSelector((store) => store.teacherIRI)
	const isDISCSelected = singleTeacherDetails?.isDISCSelected
	const isTeachingAttitudeSelected =
		singleTeacherDetails?.isTeachingAttitudeSelected
	const isJobLifeSatisfactionSelected =
		singleTeacherDetails?.isJobLifeSatisfactionSelected
	const isTeachingPracticesSelected =
		singleTeacherDetails?.isTeachingPracticesSelected
	const [deckOpen, setDeckOpen] = useState(false)
	const [reportIncludes, setReportIncludes] = useState(
		reportsIncludePages.teacherProfiling.dominance,
	)
	const [replacements, setReplacements] = useState({})
	const [scriptValues, setScriptValues] = useState({})

	const scores = useSelector((store) => store.teacherIRI.assessmentscores)
	const {
		teachingAttitudeScore,
		teachingPracticesScore,
		jobLifeSatisfactionScore,
		discProfilesContentScore,
	} = useSelector((store) => store.teacherProfiling)

	const [isAllQuestionsAnswered, setIsAllQuestionsAnswered] = useState(true)
	useEffect(() => {
		let allQuestionsAnswered = true

		if (isTeachingAttitudeSelected) {
			teachingAttitudeScore.forEach((score) => {
				if (score.marks === null || isNaN(score.marks)) {
					allQuestionsAnswered = false
					return
				}
			})
		}

		if (isTeachingPracticesSelected) {
			teachingPracticesScore.forEach((score) => {
				if (score.marks === null || isNaN(score.marks)) {
					allQuestionsAnswered = false
					return
				}
			})
		}

		if (isJobLifeSatisfactionSelected) {
			jobLifeSatisfactionScore.forEach((score) => {
				if (score.marks === null || isNaN(score.marks)) {
					allQuestionsAnswered = false
					return
				}
			})
		}

		if (isDISCSelected) {
			discProfilesContentScore.forEach((score) => {
				if (score.marks === null || isNaN(score.marks)) {
					allQuestionsAnswered = false
					return
				}
			})
		}

		setIsAllQuestionsAnswered(allQuestionsAnswered)
	}, [
		isTeachingAttitudeSelected,
		isTeachingPracticesSelected,
		isJobLifeSatisfactionSelected,
		isDISCSelected,
		teachingAttitudeScore,
		teachingPracticesScore,
		jobLifeSatisfactionScore,
		discProfilesContentScore,
	])

	const [isEditable, setIsEditable] = useState(false)
	const [anchorElPopover, setAnchorElPopover] = useState(null)
	const openActionPopover = Boolean(anchorElPopover)
	const [deleteDialog, setDeletedialog] = useState(false)
	const [originalScores, setOriginalScores] = useState([])
	useEffect(() => {
		if (scores.length > 0 && originalScores.length === 0) {
			setOriginalScores([...scores])
		}
	}, [scores, originalScores])
	const user = getUserFromLocalStorage()
	const isCurrentUserCounsellor =
		user.permissions.includes('ScCounselor') ||
		user.permissions.includes('PeeguCounselor') ||
		user.permissions.includes('Admin') ||
		user.permissions.includes('SuperAdmin')
	const isCurrentUserTeacher = user.permissions.includes('Teacher')
	const RowActions = () => {
		return (
			<>
				<Box
					className={flexStyles.flexColumnCenterStart}
					sx={{
						p: '10px 20px 10px 20px',
						height: '96px',
						backgroundColor: 'white',
					}}
				>
					<IconButton
						sx={{
							height: '38px',
							pointer: 'cursor',
							'&:hover': {
								backgroundColor: 'transparent',
							},
						}}
						aria-label='edit'
						onClick={() => {
							setAnchorElPopover(null)
							setIsEditable(true)
						}}
					>
						<CustomIcon
							name={iconConstants.editPencilBlack}
							style={{
								width: '20px',
								height: '20px',
							}}
						/>
						<Typography
							variant={typographyConstants.body}
							sx={{ pl: '14px', pt: '5px' }}
						>
							{localizationConstants.edit}
						</Typography>
					</IconButton>

					{appPermissions?.TeacherIRI?.delete && (
						<IconButton
							sx={{
								height: '38px',
								pointer: 'cursor',
								'&:hover': {
									backgroundColor: 'transparent',
								},
							}}
							aria-label='delete'
							onClick={(e) => {
								setDeletedialog(true)
							}}
						>
							<CustomIcon
								name={iconConstants.trashBlack}
								style={{
									width: '20px',
									height: '20px',
								}}
							/>
							<Typography
								variant={typographyConstants.body}
								sx={{
									pl: '14px',
									pt: '5px',
									color: 'globalElementColors.alert1',
								}}
							>
								{localizationConstants.delete}
							</Typography>
						</IconButton>
					)}
				</Box>
			</>
		)
	}
	const handleActionClose = () => {
		setAnchorElPopover(null)
	}
	useEffect(() => {
		if (isCounsellor()) {
			dispatch(
				fetchTeacherProfiling({
					body: { teacherProfilingId: teacherRow?._id },
				}),
			)
		} else {
			dispatch(
				fetchTeacherProfiling({
					body: { teacherMail: user?.profile?.email },
				}),
			)
		}
	}, [])
	const [selectedTab, setSelectedTab] = useState('assessmentResult')

	const handleTabChange = (tabName) => {
		setSelectedTab(tabName)
	}
	const renderContent = () => {
		if (selectedTab === 'assessmentResult') {
			return (
				<AssessmentFormTab
					isEditable={isEditable}
					isDISCSelected={isDISCSelected}
					isTeachingPracticesSelected={isTeachingPracticesSelected}
					isJobLifeSatisfactionSelected={
						isJobLifeSatisfactionSelected
					}
					isTeachingAttitudeSelected={isTeachingAttitudeSelected}
				/>
			)
		} else if (selectedTab === 'profilingReport') {
			return (
				<TeacherProfilingReport
					specificTeacherProfilingDetails={singleTeacherDetails}
					isDISCSelected={isDISCSelected}
					isTeachingPracticesSelected={isTeachingPracticesSelected}
					isJobLifeSatisfactionSelected={
						isJobLifeSatisfactionSelected
					}
					isTeachingAttitudeSelected={isTeachingAttitudeSelected}
				/>
			)
		}
		return null
	}

	/**
	 * -----------------------------------------------------------------------------
	 * handleGenerateReport — Business Rules (DISC Report Generation)
	 * -----------------------------------------------------------------------------
	 *
	 * PURPOSE
	 * -------
	 * Given one participant’s DISC scores (D, I, S, C; each 0–5), this function:
	 *   1) Determines Primary Type and Subtype according to the project’s rules.
	 *   2) Chooses which report pages to include for the PDF/slide deck.
	 *   3) Prepares text/color replacements for a summary slide (page-006).
	 *   4) Sets script values for a chart slide (page-007).
	 *
	 * INPUTS (from component scope)
	 * -----------------------------
	 * - singleTeacherDetails: {
	 *     teacherDominance:  number,  // D
	 *     teacherInfluence:  number,  // I
	 *     teacherSteadiness: number,  // S
	 *     teacherCompliance: number,  // C
	 *     teacherName?:      string
	 *   }
	 * - teacherRow?.teacherName: optional override for display name
	 * - reportsIncludePages: structured list of page IDs:
	 *     {
	 *       teacherProfiling: {
	 *         common:     string[],
	 *         dominance:  {
	 *           common:   string[],
	 *           editable: { DI: string[], DC: string[] }
	 *         },
	 *         influence:  {
	 *           common:   string[],
	 *           editable: { IS: string[], ID: string[] }
	 *         },
	 *         steadiness: {
	 *           common:   string[],
	 *           editable: { SI: string[], SC: string[] }
	 *         },
	 *         complience: {
	 *           common:   string[],
	 *           editable: { CD: string[], CS: string[] }
	 *         },
	 *         invalid:    string[]
	 *       }
	 *     }
	 *
	 * OUTPUTS (side effects)
	 * ----------------------
	 * - setReportIncludes([...pageIds])                  // which pages to render/export
	 * - setReplacements({ 'page-006': [...] })           // token replacements for summary slide
	 * - setScriptValues({ 'page-007': [D, I, S, C] })    // numeric array for chart slide
	 * - setDeckOpen(true)                                // open the deck UI
	 *
	 * COLORING RULE (always)
	 * ----------------------
	 * • Exactly the top two NUMERIC scores are colored GREEN (#b3ec87).
	 * • The other two are colored AMBER (#fad7a2).
	 * • Independent of subtype logic.
	 *
	 * PRIMARY & SUBTYPE SELECTION
	 * ---------------------------
	 * We have three mutually exclusive cases:
	 *
	 * CASE A — INVALID (3+ types tie for the top score)
	 *   • If three or more types share the highest value, the report is INVALID.
	 *   • Action:
	 *       setReportIncludes(teacherProfiling.invalid)
	 *       setScriptValues({ 'page-007': [D,I,S,C] })
	 *       (No replacements.)
	 *
	 * CASE B — 2-WAY TIE for the top score
	 *   • If exactly two types share the highest score:
	 *       - PrimaryValue  = "X,Y" (comma-separated)
	 *       - SubtypeValue  = "NA"
	 *       - IdentifiedAs  = "<Profile(X)>, <Profile(Y)>"
	 *       - Includes      = teacherProfiling.common
	 *                         + both tied types’ COMMON pages (NO editable)
	 *       - Coloring      = numeric top two are green (these two), others amber
	 *
	 * CASE C — Single highest score (unique primary)
	 *   • PrimaryType is the unique highest among D/I/S/C.
	 *   • Subtype is chosen ONLY from the Primary’s COMPARISON PAIR (exempt ignored).
	 *     If the pair ties, show both subtypes.
	 *       - Primary D → compare (I, C), exempt S → subtypes "DI"/"DC"
	 *       - Primary I → compare (D, S), exempt C → subtypes "ID"/"IS"
	 *       - Primary S → compare (I, C), exempt D → subtypes "SI"/"SC"
	 *       - Primary C → compare (D, S), exempt I → subtypes "CD"/"CS"
	 *   • Includes = teacherProfiling.common
	 *                + primary.common
	 *                + primary.editable[subtype]  (one or both subtype lists)
	 *   • Coloring = numeric top two are green; others amber.
	 *
	 * EDGE CLARIFICATION
	 * ------------------
	 * • “Subtype is always from the comparison pair”: even if a non-pair type is the
	 *   numeric #2 overall, subtype must still be selected only from the pair.
	 *
	 * REPLACEMENTS (page-006) WHEN NOT INVALID
	 * ----------------------------------------
	 * - (EnterName), (Dominance), (Influence), (Steadiness), (Compliance)
	 * - (DominanceColor), (InfluenceColor), (SteadinessColor), (ComplianceColor)
	 * - (PrimaryValue)  → e.g., "D" or "D,C"
	 * - (SubtypeValue)  → e.g., "DI", "DI,DC", or "NA" in 2-way top tie
	 * - (IdentifiedAs)  → profile label(s)
	 *
	 * SCRIPT VALUES (page-007) — ALWAYS
	 * ---------------------------------
	 * - setScriptValues({ 'page-007': [D, I, S, C] })
	 *
	 * -----------------------------------------------------------------------------
	 */
	const handleGenerateReport = () => {
		// ------------------------------------------------------------
		// 1) CONSTANTS
		// ------------------------------------------------------------
		const PROFILE_BY_TYPE = {
			D: 'The Winner',
			I: 'The Enthusiast',
			S: 'The Peacekeeper',
			C: 'The Analyst',
		}

		// Map primary → its block in teacherProfiling
		const INCLUDES_BY_TYPE = (pages) => ({
			D: pages.teacherProfiling.dominance,
			I: pages.teacherProfiling.influence,
			S: pages.teacherProfiling.steadiness,
			C: pages.teacherProfiling.compliance,
		})

		const COLOR_SELECTED = '#b3ec87' // green
		const COLOR_UNSELECT = '#fad7a2' // amber

		// Primary → comparison pair (exempt ignored)
		const EXEMPT_RULES = {
			D: { compare: ['I', 'C'], exempt: 'S' },
			I: { compare: ['D', 'S'], exempt: 'C' },
			S: { compare: ['I', 'C'], exempt: 'D' },
			C: { compare: ['D', 'S'], exempt: 'I' },
		}

		// ------------------------------------------------------------
		// 2) SCORES
		// ------------------------------------------------------------
		const scoreMap = {
			D: Number(singleTeacherDetails.teacherDominance ?? 0),
			I: Number(singleTeacherDetails.teacherInfluence ?? 0),
			S: Number(singleTeacherDetails.teacherSteadiness ?? 0),
			C: Number(singleTeacherDetails.teacherCompliance ?? 0),
		}

		// Sort DESC by value
		const sorted = Object.entries(scoreMap).sort((a, b) => b[1] - a[1])

		// Group by score (to detect ties)
		const groupByScore = sorted.reduce((acc, [t, s]) => {
			;(acc[s] ||= []).push(t)
			return acc
		}, {})

		const scoresDesc = Object.keys(groupByScore)
			.map(Number)
			.sort((a, b) => b - a)

		const topScore = scoresDesc[0]
		const topTypes = groupByScore[topScore] // array of types tied for top

		// Helper: build colors based on numeric top 2
		const buildTop2ColorMap = () => {
			const topTwo = sorted.slice(0, 2).map(([t]) => t)
			return Object.fromEntries(
				Object.keys(scoreMap).map((t) => [
					t,
					{
						score: scoreMap[t],
						color: topTwo.includes(t)
							? COLOR_SELECTED
							: COLOR_UNSELECT,
					},
				]),
			)
		}

		const teacherName =
			teacherRow?.teacherName ?? singleTeacherDetails.teacherName ?? ''
		const includesByType = INCLUDES_BY_TYPE(reportsIncludePages)

		const setCommonScriptValues = () =>
			setScriptValues({
				'page-007': [scoreMap.D, scoreMap.I, scoreMap.S, scoreMap.C],
			})

		// ------------------------------------------------------------
		// 3) CASE A — INVALID (3+ types tied at top)
		// ------------------------------------------------------------
		if (topTypes.length >= 3) {
			setReportIncludes(reportsIncludePages.teacherProfiling.invalid)
			setCommonScriptValues()
			setDeckOpen(true)
			return
		}

		// ------------------------------------------------------------
		// 4) CASE B — 2-way tie for top score
		// ------------------------------------------------------------
		if (topTypes.length === 2) {
			const [t1, t2] = topTypes

			// Includes: main common + both tied types’ common (NO editable)
			const mainCommon = reportsIncludePages.teacherProfiling.common || []
			const common1 = includesByType[t1]?.common ?? []
			const common2 = includesByType[t2]?.common ?? []
			setReportIncludes([...mainCommon, ...common1, ...common2])

			const scoresColored = buildTop2ColorMap()

			const updates = {
				'page-006': [
					{ text: '(EnterName)', value: String(teacherName) },
					{ text: '(Dominance)', value: String(scoreMap.D) },
					{ text: '(Influence)', value: String(scoreMap.I) },
					{ text: '(Steadiness)', value: String(scoreMap.S) },
					{ text: '(Compliance)', value: String(scoreMap.C) },
					{ text: '(DominanceColor)', value: scoresColored.D.color },
					{ text: '(InfluenceColor)', value: scoresColored.I.color },
					{ text: '(SteadinessColor)', value: scoresColored.S.color },
					{ text: '(ComplianceColor)', value: scoresColored.C.color },
					{ text: '(PrimaryValue)', value: `${t1},${t2}` },
					{ text: '(SubtypeValue)', value: 'NA' },
					{
						text: '(IdentifiedAs)',
						value: `${PROFILE_BY_TYPE[t1]}, ${PROFILE_BY_TYPE[t2]}`,
					},
				],
			}

			setCommonScriptValues()
			setReplacements(updates)
			setDeckOpen(true)
			return
		}

		// ------------------------------------------------------------
		// 5) CASE C — Single highest (unique primary)
		// ------------------------------------------------------------
		const primaryType = topTypes[0]
		const { compare: pair } = EXEMPT_RULES[primaryType]
		const [c1, c2] = pair
		const c1Score = scoreMap[c1]
		const c2Score = scoreMap[c2]

		// Build subtype code(s): e.g., "DI" or "DI,DC"
		let subtypeCodes = []
		if (c1Score === c2Score) {
			subtypeCodes = [`${primaryType}${c1}`, `${primaryType}${c2}`]
		} else {
			const chosen = c1Score > c2Score ? c1 : c2
			subtypeCodes = [`${primaryType}${chosen}`]
		}
		const subtypeValueStr = subtypeCodes.join(',')

		const scoresColored = buildTop2ColorMap()

		// Includes = main common + primary.common + editable for the subtype(s)
		const mainCommon = reportsIncludePages.teacherProfiling.common || []
		const prim = includesByType[primaryType] || {}
		const primCommon = prim.common ?? []
		// NEW: editable is an object keyed by subtype codes
		const primEditableMap = prim.editable || {}
		const primEditableFromSubtypes = subtypeCodes.flatMap(
			(code) => primEditableMap[code] ?? [],
		)

		setReportIncludes([
			...mainCommon,
			...primCommon,
			...primEditableFromSubtypes,
		])

		const updates = {
			'page-006': [
				{ text: '(EnterName)', value: String(teacherName) },
				{ text: '(Dominance)', value: String(scoreMap.D) },
				{ text: '(Influence)', value: String(scoreMap.I) },
				{ text: '(Steadiness)', value: String(scoreMap.S) },
				{ text: '(Compliance)', value: String(scoreMap.C) },
				{ text: '(DominanceColor)', value: scoresColored.D.color },
				{ text: '(InfluenceColor)', value: scoresColored.I.color },
				{ text: '(SteadinessColor)', value: scoresColored.S.color },
				{ text: '(ComplianceColor)', value: scoresColored.C.color },
				{ text: '(PrimaryValue)', value: String(primaryType) },
				{ text: '(SubtypeValue)', value: subtypeValueStr },
				{ text: '(IdentifiedAs)', value: PROFILE_BY_TYPE[primaryType] },
			],
		}

		setCommonScriptValues()
		setReplacements(updates)
		setDeckOpen(true)
	}

	return (
		<Box>
			<Box
				sx={{
					...teacherStyles?.topBoxSx,
				}}
			>
				<Box
					className={flexStyles?.flexRowCenterSpaceBetween}
					sx={{ width: '100%' }}
				>
					<Box className={flexStyles.flexColumnSpaceBetween}>
						<Box>
							<Typography
								variant={typographyConstants.h4}
								sx={{ fontWeight: '500', fontSize: '20px' }}
							>
								{teacherRow?.teacherName ||
									singleTeacherDetails.teacherName}
							</Typography>
						</Box>

						{/* ------------ID,cls Name &&Section Name --------- */}
						<Box sx={{ mt: '10.5px' }}>
							<Box sx={{ display: 'flex', flexDirection: 'row' }}>
								<Typography
									variant={typographyConstants.h4}
									sx={{
										fontWeight: '600',
										fontSize: '16px',
									}}
								>
									{localizationConstants?.id} :
								</Typography>
								<Typography
									variant={typographyConstants.h4}
									sx={{
										fontWeight: '500',
										fontSize: '16px',
										ml: '10px',
										mt: '1px',
									}}
								>
									{teacherRow?.teacher_id ||
										singleTeacherDetails?.teacher_id}
								</Typography>
							</Box>
						</Box>

						{/* ------------Sch Name --------- */}
						<Box sx={{ mt: '10.5px' }}>
							<Typography
								variant={typographyConstants.h4}
								sx={{
									fontWeight: '500',
									fontSize: '18px',
									color: 'globalElementColors.disabledGrey',
								}}
							>
								{localizationConstants?.school} :{' '}
								{SchoolRow?.schoolName ||
									singleTeacherDetails?.schoolName}
							</Typography>
						</Box>

						<Box sx={{ mt: '10.5px' }}>
							<Typography
								variant={typographyConstants.h4}
								sx={{
									fontWeight: '600',
									fontSize: '18px',
								}}
							>
								{localizationConstants?.submissionDate} :{' '}
								{teacherRow?.submissionDate
									? formatDate(teacherRow?.submissionDate)
									: localizationConstants?.notSubmitted}
							</Typography>
						</Box>
					</Box>
				</Box>
			</Box>

			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					mt: '10px',
				}}
			>
				<Box sx={{ width: '100%' }}>
					<Tabs
						value={selectedTab}
						onChange={(_, newValue) => handleTabChange(newValue)}
						aria-label='basic tabs example'
						sx={{
							'& .MuiTabs-indicator': {
								height: 3, // Adjust the thickness of the underline here
							},
						}}
					>
						<Tab
							value='assessmentResult'
							label={localizationConstants?.assessmentForm}
							variant={typographyConstants.h4}
							sx={{
								fontWeight: '600',
								fontSize: '16px',
								color: 'globalElementColors.grey1',
								ml: '5px',
							}}
						/>
						<Tab
							value='profilingReport'
							label={localizationConstants?.profilingReport}
							variant={typographyConstants.h4}
							sx={{
								fontWeight: '600',
								fontSize: '16px',
								color: 'globalElementColors.grey1',
								ml: '15px',
							}}
						/>
					</Tabs>
				</Box>

				{singleTeacherDetails?.formStatus === 'Submitted' &&
					singleTeacherDetails?.isDISCSelected === true && (
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'center',
								gap: '20px',
							}}
						>
							<CustomButton
								sx={{
									minWidth: '200px',
									height: '44px',
								}}
								text={localizationConstants.downloadReport}
								onClick={() => {
									handleGenerateReport()
								}}
							/>
						</Box>
					)}

				<ModalDeckViewer
					open={deckOpen}
					onClose={() => setDeckOpen(false)}
					title={`${
						teacherRow?.teacherName ||
						singleTeacherDetails.teacherName
					}_${localizationConstants.discReport}`}
					deck='teacher-profiling-report' // folder under /public/reports/teacher-profiling-report
					basePath='/reports/teacher-profiling-report' // matches your exported folder
					includes={reportIncludes}
					replacements={replacements}
					scriptValues={scriptValues}
				/>

				{isCurrentUserTeacher &&
					singleTeacherDetails?.ProfilingStatus === 'Active' &&
					!singleTeacherDetails?.formStatus !== 'Submitted' &&
					selectedTab === 'assessmentResult' &&
					!isEditable && (
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'center',
								gap: '20px',
							}}
						>
							<CustomIcon
								name={iconConstants.menuDotsBlue}
								style={{
									paddingLeft: '10px',
									width: '44px',
									height: '44px',
									cursor: 'pointer',
								}}
								svgStyle={{ width: '44px', height: '44px' }}
								onClick={(e) => {
									setAnchorElPopover(e.currentTarget)
								}}
							/>
						</Box>
					)}

				<Box
					className={flexStyles.flexRowCenterSpaceBetween}
					sx={{ height: '50px', mt: '-30px' }}
				>
					{isEditable ? (
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'row',
								justifyContent: 'flex-end',
								mt: '30px',
							}}
						>
							<CustomButton
								sx={{
									height: '32px',
									minWidth: '110px',
									backgroundColor: 'transparent',
									border: '1px solid',
									borderColor: 'globalElementColors.grey1',
									mr: '10px',
								}}
								typoSx={{ color: 'globalElementColors.grey1' }}
								text={localizationConstants.cancel}
								onClick={() => {
									setIsEditable(false)
								}}
							/>
							<CustomButton
								sx={{
									minWidth: '120px',
									height: '32px',
								}}
								disabled={!isAllQuestionsAnswered}
								text={localizationConstants.update}
								onClick={async () => {
									const body = {
										teacherProfilingId:
											singleTeacherDetails?._id,
										...(isTeachingAttitudeSelected && {
											teacherAttitudeScore:
												teachingAttitudeScore,
										}),
										...(isTeachingPracticesSelected && {
											teacherPracticesScore:
												teachingPracticesScore,
										}),
										...(isJobLifeSatisfactionSelected && {
											teacherJobLifeSatisfactionScore:
												jobLifeSatisfactionScore,
										}),
										...(isDISCSelected && {
											teacherDISCProfilesScore:
												discProfilesContentScore,
										}),
									}

									const res = await dispatch(
										submitTeacherProfiling({ body }),
									)
									if (!res.error) {
										setIsEditable(false)
										if (!isPermissionOfTeacher) {
											dispatch(
												fetchTeacherProfiling({
													body: {
														teacherProfilingId:
															teacherRow?._id,
													},
												}),
											)
											refreshSchoolList()
											refreshTeacherList()
										} else {
											dispatch(
												fetchTeacherProfiling({
													body: {
														teacherMail:
															user?.profile
																?.email,
													},
												}),
											)
										}
									}
								}}
							/>
						</Box>
					) : (
						<Box></Box>
					)}
				</Box>
			</Box>

			{/* Here we are checking if loggedIn user is counsellor and profileform submitted then we are rendering the UI. Or if the loggedIN user is Teacher and either form submitted or timespan is active we are rendering UI. Else NO Active forms label will come */}
			{(isCurrentUserCounsellor &&
				singleTeacherDetails?.formStatus === 'Submitted') ||
			(isCurrentUserTeacher &&
				(singleTeacherDetails?.formStatus === 'Submitted' ||
					singleTeacherDetails?.ProfilingStatus === 'Active')) ? (
				renderContent()
			) : (
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						height: '45vh',
					}}
				>
					<Typography variant={typographyConstants?.h2}>
						{localizationConstants?.noActiveFormsFound}
					</Typography>
				</Box>
			)}

			<Popover
				open={openActionPopover}
				anchorEl={anchorElPopover}
				onClose={handleActionClose}
				onMouseLeave={handleActionClose}
				sx={{
					'& .MuiPopover-paper': {
						margin: '0px 0px 0px -10px',
						borderRadius: '10px',
						boxShadow: 'var(---shadow-5)',
					},
				}}
				anchorOrigin={{
					vertical: 'center',
					horizontal: 'left',
				}}
				transformOrigin={{
					vertical: 'center',
					horizontal: 'right',
				}}
			>
				<RowActions />
			</Popover>
			<CustomDialog
				isOpen={deleteDialog}
				title={localizationConstants.deleteTeacherAssessmentReport}
				iconName={iconConstants.academicRed}
				message={
					localizationConstants.teacherProfilingAssessmentDeleteMsg
				}
				titleSx={{
					color: 'textColors.red',
					fontWeight: 500,
					pb: '20px',
				}}
				titleTypoVariant={typographyConstants.h4}
				messageTypoVariant={typographyConstants.h5}
				leftButtonText={localizationConstants.cancel}
				rightButtonText={localizationConstants.yesDelete}
				onLeftButtonClick={() => {
					setDeletedialog(false)
					handleActionClose()
				}}
				onRightButtonClick={async () => {
					const res = await dispatch(
						deleteTeacherProfiling({
							body: {
								teacherProfilingId: singleTeacherDetails?._id,
							},
						}),
					)
					if (!res.error) {
						setDeletedialog(false)
						handleActionClose()
						if (!isPermissionOfTeacher) {
							dispatch(
								fetchTeacherProfiling({
									body: {
										teacherProfilingId: teacherRow?._id,
									},
								}),
							)
							refreshTeacherList()
							refreshSchoolList()
						} else {
							dispatch(
								fetchTeacherProfiling({
									body: { teacherMail: user?.profile?.email },
								}),
							)
						}
					}
				}}
			/>
		</Box>
	)
}

export default TeacherProfilingAssessment
