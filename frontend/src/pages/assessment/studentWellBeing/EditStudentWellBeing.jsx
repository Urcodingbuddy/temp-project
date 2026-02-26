import { Box } from '@mui/system'
import {
	forwardRef,
	useEffect,
	useRef,
	useState,
	useImperativeHandle,
} from 'react'
import CustomDialog from '../../../components/CustomDialog'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import {
	Alert,
	Checkbox,
	Dialog,
	FormControlLabel,
	IconButton,
	Snackbar,
	Tab,
	Tabs,
	Typography,
} from '@mui/material'
import useCommonStyles from '../../../components/styles'
import CustomButton from '../../../components/CustomButton'
import { studentCopeStyles } from '../StudentCope/StudentCopeStyles'
import { useDispatch, useSelector } from 'react-redux'
import {
	calculateAge,
	formatDate,
	generatePDF,
	getUserFromLocalStorage,
} from '../../../utils/utils'
import StudentWBReport from './StudentWBReport'
import {
	getSingleStudentWellBeing,
	setChildrensHopeQuestionsRagings,
	setPsychologicalQuestionsRagings,
	updateStudentWellBeing,
} from './StudentWellBeingSlice'
import {
	childrensHopeQuestions,
	childrensHopeQuestionsOptions,
	psychologicalQuestions,
	psychologicalQuestionsOptions,
} from './studentWellBeingConstants'
import { handleDeleteStudentWellBeing } from './studentWellBeingFunctions'
import { BaselineAnalyticsStyles } from '../../initiations/baseline/baselineAnalyticsStyles'
import { userRoles } from '../../../utils/globalConstants'

const EditStudentWellBeing = forwardRef(
	({ rowDataSelected, refreshList, setDisableSave }, ref) => {
		const [selectedTab, setSelectedTab] = useState('assessmentForm')
		const [questionTab, setQuestionTab] = useState(0)
		const flexStyles = useCommonStyles()
		const [deleteDialog, setDeleteDialog] = useState(false)
		const handleTabChange = (tabName) => {
			setSelectedTab(tabName)
		}
		const dispatch = useDispatch()
		const { appPermissions } = useSelector(
			(store) => store.dashboardSliceSetup,
		)
		const user = getUserFromLocalStorage()
		const counselor =
			user?.permissions[0] === userRoles.peeguCounselor ||
			user?.permissions[0] === userRoles.scCounselor
		const {
			specificStudentWBData,
			psychologicalQuestionsRagings,
			childrensHopeQuestionsRagings,
		} = useSelector((store) => store.studentWellBeing)

		const [downloadReportDialogOpen, setDownloadReportDialogOpen] =
			useState(false)
		const captureUIRef = useRef(null)

		const captureUIAndDownloadPDF = async () => {
			await generatePDF(captureUIRef.current, {
				filename: 'Individual Student Wellbeing Report.pdf',
				orientation: 'p',
				pageSize: 'a3',
				margin: 5,
			})
			setDownloadReportDialogOpen(false)
		}

		const [showError, setShowError] = useState(false)

		const handleUpdateClick = async () => {
			const body = {
				id: rowDataSelected._id,
				childrensHopeScale: childrensHopeQuestionsRagings,
				psychologicalWellBeingScale: psychologicalQuestionsRagings,
			}
			const response = await dispatch(updateStudentWellBeing(body))
			if (!response.error) {
				if (rowDataSelected._id) {
					const body = {
						id: rowDataSelected._id,
					}
					dispatch(getSingleStudentWellBeing({ body }))
					refreshList()
				}
			}
		}

		useImperativeHandle(ref, () => ({
			callChildFunction: handleUpdateClick,
		}))

		const handleOnChangeRating = (index, option, ischildrenHope) => {
			if (ischildrenHope) {
				const newScores = [...childrensHopeQuestionsRagings]
				if (newScores[index]?.marks === option) {
					newScores[index] = {
						questionNumber: index + 1,
						marks: 0,
					}
				} else {
					newScores[index] = {
						questionNumber: index + 1,
						marks: option,
					}
				}
				dispatch(setChildrensHopeQuestionsRagings(newScores))
				handleDisableSave(newScores, 'hope')
			} else {
				const newScores = [...psychologicalQuestionsRagings]
				if (newScores[index]?.marks === option) {
					newScores[index] = {
						questionNumber: index + 1,
						marks: 0,
					}
				} else {
					newScores[index] = {
						questionNumber: index + 1,
						marks: option,
					}
				}
				dispatch(setPsychologicalQuestionsRagings(newScores))
				handleDisableSave(newScores, 'psyc')
			}
		}

		const handleDisableSave = (newScore, type) => {
			let disable = true
			if (type === 'hope') {
				if (
					specificStudentWBData &&
					specificStudentWBData.childrensHopeScaleScore &&
					specificStudentWBData.childrensHopeScaleScore.length
				) {
					const hopeScaleMap = new Map()
					specificStudentWBData.childrensHopeScaleScore.forEach(
						(obj) => {
							hopeScaleMap.set(obj.questionNumber, obj.marks)
						},
					)

					for (const score of newScore) {
						const oldScore = hopeScaleMap.get(score.questionNumber)
						if (score.marks !== oldScore) {
							disable = false
							break
						}
					}
				}
			} else if (type === 'psyc') {
				if (
					specificStudentWBData &&
					specificStudentWBData.psychologicalWellBeingScaleScore &&
					specificStudentWBData.psychologicalWellBeingScaleScore
						.length
				) {
					const psycScaleMap = new Map()
					specificStudentWBData.psychologicalWellBeingScaleScore.forEach(
						(obj) => {
							psycScaleMap.set(obj.questionNumber, obj.marks)
						},
					)

					for (const score of newScore) {
						const oldScore = psycScaleMap.get(score.questionNumber)
						if (score.marks !== oldScore) {
							disable = false
							break
						}
					}
				}
			}
			setDisableSave(disable)
		}

		useEffect(() => {
			if (rowDataSelected._id) {
				const body = {
					id: rowDataSelected._id,
				}
				dispatch(getSingleStudentWellBeing({ body }))
			}
		}, [rowDataSelected])

		const renderContent = () => {
			if (selectedTab === 'assessmentForm') {
				return (
					<Box>
						<Box sx={studentCopeStyles?.questionBoxSx}>
							<Box
								sx={{
									display: 'flex',
									flexDirection: 'row',
									justifyContent: 'flex-start',
									width: '100%',
									mb: '20px',
								}}
								gap={'20px'}
							>
								<Box
									sx={{
										minWidth: '225px',
										height: '43px',
										border: '1px solid',
										borderColor:
											questionTab === 0
												? 'globalElementColors.ceruleanBlue'
												: 'globalElementColors.blue',
										backgroundColor:
											questionTab === 0
												? 'globalElementColors.ceruleanBlue'
												: 'none',
										borderRadius: '6px',
										cursor: 'pointer',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
									onClick={() => setQuestionTab(0)}
								>
									<Typography
										sx={{
											fontWeight: 500,
											fontSize: '16px',
											color:
												questionTab === 0
													? 'globalElementColors.white'
													: 'globalElementColors.blue',
										}}
									>
										{
											localizationConstants.childrenHopeScale
										}
									</Typography>
								</Box>
								<Box
									sx={{
										minWidth: '260px',
										height: '43px',
										border: '1px solid',
										borderColor:
											questionTab === 1
												? 'globalElementColors.ceruleanBlue'
												: 'globalElementColors.blue',
										backgroundColor:
											questionTab === 1
												? 'globalElementColors.ceruleanBlue'
												: 'none',
										borderRadius: '6px',
										cursor: 'pointer',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
									onClick={() => setQuestionTab(1)}
								>
									<Typography
										sx={{
											fontWeight: 500,
											fontSize: '16px',
											color:
												questionTab === 1
													? 'globalElementColors.white'
													: 'globalElementColors.blue',
										}}
									>
										{
											localizationConstants.psychologicalWBScale
										}
									</Typography>
								</Box>
							</Box>
							{questionTab === 0
								? childrensHopeQuestions?.map((q, index) => (
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
													{
														childrensHopeQuestions[
															index
														]?.qns_no
													}
													.{'   '}{' '}
													{
														childrensHopeQuestions[
															index
														]?.question
													}
												</Typography>
											</Box>
											<Box
												className={
													flexStyles.flexRowCenterSpaceBetween
												}
												sx={{ minHeight: '20px' }}
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
															localizationConstants.noneoftheTime
														}
													</Typography>
												</Box>
												<Box>
													{childrensHopeQuestionsOptions.map(
														(option, index1) => (
															<FormControlLabel
																key={index1}
																checked={
																	childrensHopeQuestionsRagings?.[
																		index
																	]?.marks ===
																	option
																}
																onChange={(e) =>
																	handleOnChangeRating(
																		index,
																		option,
																		true,
																	)
																}
																sx={{
																	margin: '0',
																}}
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
																				'13px',
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
															localizationConstants.alloftheTime
														}
													</Typography>
												</Box>
											</Box>
										</Box>
									))
								: psychologicalQuestions?.map((q, index) => (
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
													{
														psychologicalQuestions[
															index
														]?.qns_no
													}
													.{'   '}{' '}
													{
														psychologicalQuestions[
															index
														]?.question
													}
												</Typography>
											</Box>
											<Box
												className={
													flexStyles.flexRowCenterSpaceBetween
												}
												sx={{ minHeight: '20px' }}
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
															localizationConstants.stronglyAgree
														}
													</Typography>
												</Box>
												<Box>
													{psychologicalQuestionsOptions.map(
														(option, index1) => (
															<FormControlLabel
																key={index1}
																checked={
																	psychologicalQuestionsRagings?.[
																		index
																	]?.marks ===
																	option
																}
																onChange={(e) =>
																	handleOnChangeRating(
																		index,
																		option,
																		false,
																	)
																}
																sx={{
																	margin: '0',
																}}
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
																				'13px',
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
															localizationConstants.stronglyDisagree
														}
													</Typography>
												</Box>
											</Box>
										</Box>
									))}
						</Box>

						<CustomDialog
							isOpen={deleteDialog}
							title={
								localizationConstants.deleteStudentAssignmentReport
							}
							iconName={iconConstants.academicRed}
							message={
								localizationConstants.studentCopeAssessmentDeleteMsg
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
							onLeftButtonClick={() => setDeleteDialog(false)}
							onRightButtonClick={() => {
								handleDeleteStudentWellBeing(
									dispatch,
									specificStudentWBData?._id,
									setDeleteDialog,
									refreshList,
								)
							}}
						/>
					</Box>
				)
			} else if (selectedTab === 'Report') {
				return (
					<StudentWBReport
						specificStudentWBData={specificStudentWBData}
					/>
				)
			}
			return null
		}

		return (
			<Box ref={captureUIRef}>
				<Box>
					<Box
						sx={{
							...studentCopeStyles?.topBoxSx,
							height: '150px',
							p: '10px',
						}}
					>
						{/* ------------St Name --------- */}
						<Box
							className={flexStyles.flexColumnSpaceBetween}
							sx={{ width: 'calc(100% - 10px)', height: '100%' }}
						>
							<Box
								sx={{
									display: 'flex',
									justifyContent: 'space-between',
									flexDirection: 'row',
								}}
							>
								<Typography
									variant={typographyConstants.h4}
									sx={{
										fontWeight: '500',
										fontSize: '22px',
										color: 'globalElementColors.black',
									}}
								>
									{specificStudentWBData?.studentName}
								</Typography>
								<Typography
									variant={typographyConstants.h4}
									sx={{
										fontWeight: '500',
										fontSize: '16px',
										color: 'globalElementColors.grey6',
									}}
								>
									{localizationConstants?.counsellorName} :{' '}
									{specificStudentWBData?.counsellorName}
								</Typography>
							</Box>

							{/* ------------cls Name && Section Name --------- */}
							<Box
								sx={{
									display: 'flex',
									justifyContent: 'space-between',
									flexDirection: 'row',
								}}
							>
								<Box sx={{ display: 'flex', ml: '-15px' }}>
									<Typography
										variant={typographyConstants.h4}
										sx={{
											fontWeight: '600',
											fontSize: '16px',
											ml: '15px',
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
										{specificStudentWBData?.user_id}
									</Typography>
									<Typography
										variant={typographyConstants.h4}
										sx={{
											fontWeight: '600',
											fontSize: '16px',
											ml: '15px',
										}}
									>
										{localizationConstants?.age} :
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
										{calculateAge(
											specificStudentWBData?.dob,
										) + ' Years' ?? '0 Years'}
									</Typography>
								</Box>
								<Typography
									sx={{
										fontWeight: '500',
										fontSize: '16px',
										color: 'globalElementColors.grey6',
									}}
								>
									{localizationConstants?.date} :{' '}
									{formatDate(
										specificStudentWBData?.wellBeingAssessmentSubmissionDate
											? specificStudentWBData?.wellBeingAssessmentSubmissionDate
											: specificStudentWBData?.createdAt
												? specificStudentWBData?.createdAt
												: '',
									)}
								</Typography>
							</Box>
							<Box>
								<Box
									sx={{
										display: 'flex',
										flexDirection: 'row',
										justifyContent: 'space-between',
									}}
								>
									<Box
										sx={{
											display: 'flex',
											flexDirection: 'row',
										}}
									>
										<Typography
											variant={typographyConstants.h4}
											sx={{
												fontWeight: '600',
												fontSize: '16px',
											}}
										>
											{localizationConstants?.Class} :
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
											{specificStudentWBData?.className}
										</Typography>
										<Typography
											variant={typographyConstants.h4}
											sx={{
												fontWeight: '600',
												fontSize: '16px',
												ml: '15px',
											}}
										>
											{localizationConstants?.section} :
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
											{specificStudentWBData?.section}
										</Typography>
									</Box>
								</Box>
							</Box>
							{/* ------------Sch Name --------- */}

							<Box
								sx={{
									display: 'flex',
									justifyContent: 'space-between',
									flexDirection: 'row',
								}}
							>
								<Typography
									variant={typographyConstants.h4}
									sx={{
										fontWeight: '500',
										fontSize: '17px',
										color: 'globalElementColors.grey1',
									}}
								>
									{localizationConstants?.school} :{' '}
									{specificStudentWBData?.schoolName}
								</Typography>
								<Typography
									variant={typographyConstants.h4}
									sx={{
										fontWeight: '500',
										fontSize: '16px',
										color: 'globalElementColors.grey6',
									}}
								>
									{localizationConstants?.academicYear} :{' '}
									{specificStudentWBData?.academicYear}
								</Typography>
							</Box>
						</Box>
					</Box>
				</Box>

				{!specificStudentWBData?.isRatingReset ? (
					<>
						{' '}
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								mt: '10px',
							}}
						>
							<Box
								sx={{
									width: '100%',
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
								}}
							>
								<Box
									sx={{
										width: '100%',
										alignItems: 'center',
										flexGrow: 1,
									}}
								>
									<Tabs
										value={selectedTab}
										onChange={(_, newValue) =>
											handleTabChange(newValue)
										}
										aria-label='basic tabs example'
										sx={{
											'& .MuiTabs-indicator': {
												height: 4,
												borderTopLeftRadius: '5px',
												borderTopRightRadius: '5px',
											},
										}}
									>
										<Tab
											value='assessmentForm'
											label={
												localizationConstants?.assessmentForm
											}
											variant={typographyConstants.h4}
											sx={{
												fontWeight: '600',
												fontSize: '16px',
												color: 'globalElementColors.grey1',
												ml: '5px',
												textTransform: 'none',
											}}
										/>
										<Tab
											value='Report'
											label={
												localizationConstants?.report
											}
											variant={typographyConstants.h4}
											sx={{
												fontWeight: '600',
												fontSize: '16px',
												color: 'globalElementColors.grey1',
												ml: '15px',
												textTransform: 'none',
											}}
										/>
									</Tabs>
								</Box>
								{selectedTab === 'Report' ? (
									<CustomButton
										sx={{
											minWidth: '182px',
											height: '44px',
											backgroundColor: '#0267D9',
											ml: '10px',
											display: 'flex',
											justifyContent: 'center',
										}}
										text={
											localizationConstants.generateReport
										}
										onClick={() => {
											setDownloadReportDialogOpen(true)
										}}
									/>
								) : (
									counselor && (
										<IconButton
											sx={{
												height: '38px',
												pointer: 'cursor',
												'&:hover': {
													backgroundColor:
														'transparent',
												},
											}}
											aria-label='delete'
											onClick={(e) => {
												setDeleteDialog(true)
											}}
										>
											<CustomIcon
												name={iconConstants.trashRed}
												style={{
													width: '24px',
													height: '24px',
												}}
											/>
										</IconButton>
									)
								)}
							</Box>
						</Box>
						{renderContent()}
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
							sx={{ color: 'globalElementColors.grey1' }}
							variant={typographyConstants?.h4}
						>
							{
								localizationConstants?.noStudentCOPERecordsAvailable
							}
						</Typography>
					</Box>
				)}
				<Snackbar
					open={showError}
					autoHideDuration={3500}
					onClose={() => setShowError(false)}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'right',
					}}
				>
					<Alert onClose={() => setShowError(false)} severity='error'>
						{localizationConstants?.deleteAlertMsg}
					</Alert>
				</Snackbar>

				<Dialog open={downloadReportDialogOpen}>
					<Box
						sx={{
							borderRadius: '10px',
							width: '500px',
							height: '250px',
							overflow: 'hidden',
						}}
					>
						<Box sx={{ padding: '20px 30px 38px 30px' }}>
							<Box
								className={flexStyles.flexRowCenterSpaceBetween}
							>
								<Typography
									variant={typographyConstants.h4}
									sx={{
										fontWeight: 500,
										color: 'textColors.blue',
									}}
								>
									{localizationConstants.generateReport}
								</Typography>
								<CustomIcon
									name={iconConstants.cancelRounded}
									style={{
										cursor: 'pointer',
										width: '26px',
										height: '26px',
									}}
									svgStyle={'width: 26px; height: 26px'}
									onClick={() => {
										setDownloadReportDialogOpen(false)
									}}
								/>
							</Box>
							<Box
								sx={{ marginTop: '20px', textAlign: 'center' }}
							>
								<Typography color={'globalElementColors.gray1'}>
									{
										localizationConstants.individualStudentWellBeingReportPDFReportMsg
									}
								</Typography>
							</Box>
							<Box
								sx={{ height: '150px', mt: '10px' }}
								className={flexStyles.flexColumnCenter}
							>
								<CustomButton
									sx={{
										...BaselineAnalyticsStyles.changeButtonSx,
									}}
									text={localizationConstants.download}
									onClick={captureUIAndDownloadPDF}
									endIcon={
										<Box sx={{ marginLeft: '1rem' }}>
											{' '}
											<CustomIcon
												name={
													iconConstants.downloadWhite
												}
												style={{
													width: '20px',
													height: '30px',
													marginRight: '10px',
												}}
												svgStyle={
													'width: 20px; height: 30px '
												}
											/>
										</Box>
									}
								/>
							</Box>
						</Box>
					</Box>
				</Dialog>
			</Box>
		)
	},
)

export default EditStudentWellBeing
