import {
	Box,
	Checkbox,
	FormControlLabel,
	IconButton,
	Popover,
	Tab,
	Tabs,
	Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { studentCopeStyles } from '../StudentCope/StudentCopeStyles'
import useCommonStyles from '../../../components/styles'
import { useDispatch, useSelector } from 'react-redux'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomButton from '../../../components/CustomButton'
import { teacherStyles } from './teacherIRIStyles'
import { iconConstants } from '../../../resources/theme/iconConstants'
import CustomIcon from '../../../components/CustomIcon'
import { AssessmentQuestions, questionsRating } from './teacherIRIConstants'

import {
	deleteTeacherIRIReport,
	fetchTeacherIRI,
	setAssessmentscores,
	submitTeacherIRI,
} from './teacherIRISlice'
import {
	formatDate,
	getUserFromLocalStorage,
	isCounsellor,
} from '../../../utils/utils'
import CustomDialog from '../../../components/CustomDialog'
import TeacherIRIReport from './TeacherIRIReport'
import ModalDeckViewer from '../../../components/ModalDeckViewer'
import { reportsIncludePages } from '../../../utils/globalConstants'

const TeacherIRIAssessment = ({
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
	const scores = useSelector((store) => store.teacherIRI.assessmentscores)
	const [isAllQuestionsAnswered, setIsAllQuestionsAnswered] = useState(true)
	const [deckOpen, setDeckOpen] = useState(false)
	const [reportIncludes, setReportIncludes] = useState(
		reportsIncludePages.teacherIRI.common,
	)
	const [replacements, setReplacements] = useState({})
	const [scriptValues, setScriptValues] = useState({})

	useEffect(() => {
		let allQuestionsAnswered = true

		scores.forEach((score) => {
			if (score.marks === null || isNaN(score.marks)) {
				allQuestionsAnswered = false
				return
			}
		})

		setIsAllQuestionsAnswered(allQuestionsAnswered)
	}, [scores])
	const { singleTeacherDetails } = useSelector((store) => store.teacherIRI)
	const [isEditable, setIsEditable] = useState(false)
	const [anchorElPopover, setAnchorElPopover] = useState(null)
	const openActionPopover = Boolean(anchorElPopover)
	const [deleteDialog, setDeletedialog] = useState(false)
	const [originalScores, setOriginalScores] = useState([])
	const handleOnChangeRating = (index, option) => {
		const newScores = [...scores]

		const updatedScore = { ...newScores[index] }

		if (updatedScore.marks === option) {
			updatedScore.marks = null
		} else {
			updatedScore.marks = option
		}

		newScores[index] = updatedScore

		dispatch(setAssessmentscores(newScores))
	}
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
					{/* {isPermissionOfTeacher && ( */}
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
					{/* )} */}

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
				fetchTeacherIRI({
					body: { teacherIRIId: teacherRow?._id },
				}),
			)
		} else {
			dispatch(
				fetchTeacherIRI({
					body: { teacherMail: user?.profile?.email },
				}),
			)
		}
	}, [])
	const [selectedTab, setSelectedTab] = useState('assessmentResult')

	const handleTabChange = (tabName) => {
		setSelectedTab(tabName)
	}

	const handleGenerateReport = () => {
		const currentTeacherCategoryScores =
			singleTeacherDetails?.report?.currentTeacherCategoryScores
		const categoryQuartiles =
			singleTeacherDetails?.report?.categoryQuartiles
		const fsIncludes =
			(currentTeacherCategoryScores?.fantasyScore ?? 0) <
			(categoryQuartiles?.fantasy ?? 0)
				? reportsIncludePages.teacherIRI.fs.outlier
				: reportsIncludePages.teacherIRI.fs.standard

		const ecIncludes =
			(currentTeacherCategoryScores?.empathicConcernScore ?? 0) <
			(categoryQuartiles?.empathicConcern ?? 0)
				? reportsIncludePages.teacherIRI.ec.outlier
				: reportsIncludePages.teacherIRI.ec.standard

		const ptIncludes =
			(currentTeacherCategoryScores?.perspectiveTakingScore ?? 0) <
			(categoryQuartiles?.perspectiveTaking ?? 0)
				? reportsIncludePages.teacherIRI.pt.outlier
				: reportsIncludePages.teacherIRI.pt.standard
		console.log('PT Includes:', ptIncludes)
		const pdIncludes =
			(currentTeacherCategoryScores?.personalDistressScore ?? 0) <
			(categoryQuartiles?.personalDistress ?? 0)
				? reportsIncludePages.teacherIRI.pd.outlier
				: reportsIncludePages.teacherIRI.pd.standard

		const combinedIncludes = [
			...reportsIncludePages.teacherIRI.common,
			...fsIncludes,
			...ecIncludes,
			...ptIncludes,
			...pdIncludes,
		]

		setReportIncludes(combinedIncludes)

		const teacherName =
			teacherRow?.teacherName || singleTeacherDetails.teacherName

		const teacherNameReplacements = (teacherName) => {
			// All pages that contain the (Enter Name) placeholder
			const pages = [
				'page-002',
				'page-003',
				'page-010',
				'page-012',
				'page-022',
				'page-024',
				'page-034',
				'page-036',
				'page-046',
				'page-048',
			]

			return Object.fromEntries(
				pages.map((id) => [
					id,
					[
						{
							text: '(Enter Name)',
							value: teacherName,
						},
					],
				]),
			)
		}

		const updates = teacherNameReplacements(teacherName)
		setScriptValues({
			'page-005': [
				singleTeacherDetails?.teacherIRIScore?.perspectiveTakingScale,
				singleTeacherDetails?.teacherIRIScore?.fantasyScale,
				singleTeacherDetails?.teacherIRIScore?.empathicConcernScale,
				singleTeacherDetails?.teacherIRIScore?.personalDistressScale,
			],
		})
		setReplacements(updates)
		setDeckOpen(true)
	}
	const renderContent = () => {
		if (selectedTab === 'assessmentResult') {
			return (
				<Box>
					{singleTeacherDetails?.teacherIRIReport?.length > 0 ? (
						<>
							<Box
								sx={{
									...studentCopeStyles?.questionBoxSx,
								}}
							>
								{AssessmentQuestions?.map(
									(questions, index) => (
										<Box
											sx={{
												...studentCopeStyles?.questions,
												mt: index > 1 ? '20px' : 'opx',
											}}
										>
											<Box>
												<Typography
													variant={
														typographyConstants.h4
													}
													sx={{
														alignSelf: 'self-start',
														fontSize: '15.5px',
														fontWeight: 400,
													}}
												>
													{index + 1}.{'   '}{' '}
													{questions?.question}
												</Typography>
											</Box>
											<Box
												className={
													flexStyles.flexRowCenterSpaceBetween
												}
												sx={{ height: '20px' }}
											>
												<Box>
													<Typography
														sx={{
															fontWeight: 400,
															fontSize: '13px',
															color: 'globalElementColors.grey7',
														}}
													>
														{
															localizationConstants.notAtAllTrueForMe
														}
													</Typography>
												</Box>
												<Box>
													{questionsRating.map(
														(option, index1) => (
															<FormControlLabel
																key={index1}
																checked={
																	scores?.[
																		index
																	]?.marks ==
																	option
																}
																onChange={(e) =>
																	handleOnChangeRating(
																		index,
																		option,
																	)
																}
																sx={{
																	margin: '0',
																}}
																disabled={
																	!isEditable
																}
																control={
																	<Checkbox
																		icon={
																			<CustomIcon
																				name={
																					iconConstants.uncheckedRound
																				}
																				style={{
																					width: '15.5px',
																					height: '15.5px',
																				}}
																				svgStyle={
																					'width: 20px; height: 20px'
																				}
																			/>
																		}
																		checkedIcon={
																			<CustomIcon
																				name={
																					iconConstants.like
																				}
																				style={{
																					width: '15.5px',
																					height: '15.5px',
																				}}
																				svgStyle={
																					'width: 20px; height: 20px'
																				}
																			/>
																		}
																	/>
																}
																labelPlacement='start'
																label={
																	<span
																		style={{
																			fontSize:
																				'12px',
																			marginLeft:
																				'10px',
																			color: 'globalElementColors.grey1',
																		}}
																	>
																		{option}
																	</span>
																}
															/>
														),
													)}
												</Box>
												<Box>
													<Typography
														sx={{
															fontWeight: 400,
															fontSize: '13px',
															color: 'globalElementColors.grey7',
														}}
													>
														{
															localizationConstants.reallyTrueForMe
														}
													</Typography>
												</Box>
											</Box>
										</Box>
									),
								)}
							</Box>{' '}
						</>
					) : (
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								height: '45vh',
							}}
						>
							<Typography
								sx={{ color: '#6A6A6A' }}
								variant={typographyConstants?.h4}
							>
								{localizationConstants?.noRecordsScreenMsg}
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
						title={
							localizationConstants.deleteTeacherAssessmentReport
						}
						iconName={iconConstants.academicRed}
						message={
							localizationConstants.teacherIRIAssessmentDeleteMsg
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
						onLeftButtonClick={() => setDeletedialog(false)}
						onRightButtonClick={async () => {
							const body = {
								teacherIRIId: singleTeacherDetails?._id,
							}
							const res = await dispatch(
								deleteTeacherIRIReport({ body }),
							)
							if (!res.error) {
								setDeletedialog(false)
								handleActionClose()
								if (!isPermissionOfTeacher) {
									dispatch(
										fetchTeacherIRI({
											body: {
												teacherIRIId: teacherRow?._id,
											},
										}),
									)
									refreshTeacherList()
									refreshSchoolList()
								} else {
									dispatch(
										fetchTeacherIRI({
											body: {
												teacherMail:
													user?.profile?.email,
											},
										}),
									)
								}
							}
						}}
					/>
				</Box>
			)
		} else if (selectedTab === 'IRIReport') {
			return (
				<TeacherIRIReport
					specificTeacherIRIDetails={singleTeacherDetails}
				/>
			)
		}
		return null
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
								{localizationConstants?.iRISubmissiondate} :{' '}
								{singleTeacherDetails?.submissionDate
									? formatDate(
											singleTeacherDetails?.submissionDate,
										)
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
							value='IRIReport'
							label={localizationConstants?.IRIReport}
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

				{singleTeacherDetails?.formStatus === 'Submitted' && (
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
							text={localizationConstants.generateReport}
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
					}_${localizationConstants.iriReport}`}
					deck='teacher-iri-report' // folder under /public/decks/teacher-iri-report
					basePath='/reports/teacher-iri-report' // matches your exported folder
					includes={reportIncludes}
					replacements={replacements}
					scriptValues={scriptValues}
				/>

				{isCurrentUserTeacher &&
					singleTeacherDetails?.IRIStatus === 'Active' &&
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
							<CustomButton
								sx={{
									minWidth: '200px',
									height: '44px',
								}}
								text={localizationConstants.downloadReport}
								onClick={() => console.log('downloading')}
							/>

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
									dispatch(
										setAssessmentscores(originalScores),
									)
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
										teacherIRIId: singleTeacherDetails?._id,
										teacherIRIAssessment: scores,
									}
									const res = await dispatch(
										submitTeacherIRI({ body }),
									)
									if (!res.error) {
										setIsEditable(false)
										if (!isPermissionOfTeacher) {
											dispatch(
												fetchTeacherIRI({
													body: {
														teacherIRIId:
															teacherRow?._id,
													},
												}),
											)
											refreshSchoolList()
											refreshTeacherList()
										} else {
											dispatch(
												fetchTeacherIRI({
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

			{/* Here we are checking if loggedIn user is counsellor and IRI form submitted then we are rendering the UI. Or if the loggedIN user is Teacher and either form submitted or timespan is active we are rendering UI. Else NO Active forms label will come */}
			{(isCurrentUserCounsellor &&
				singleTeacherDetails?.formStatus === 'Submitted') ||
			(isCurrentUserTeacher &&
				(singleTeacherDetails?.formStatus === 'Submitted' ||
					singleTeacherDetails?.IRIStatus === 'Active')) ? (
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
		</Box>
	)
}

export default TeacherIRIAssessment
