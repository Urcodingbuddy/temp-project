import { Box } from '@mui/system'
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
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
import { studentCopeStyles } from './StudentCopeStyles'

import { questionOptions, questions } from './StudentCopeConstants'
import { useDispatch, useSelector } from 'react-redux'
import {
	delay,
	formatDate,
	generatePDF,
	getUserFromLocalStorage,
} from '../../../utils/utils'
import StudentsCOPEReport from './StudentsCOPEReport'
import { handleDeleteStudentCope } from './StudentCopeFunction'
import {
	deleteStudentCopeAssessment,
	getStudentCopeData,
	setAllQuestionRating,
	setIsStudentDataExists,
	updateStudentCopeAssessment,
} from './StudentCopeSlice'
import { BaselineAnalyticsStyles } from '../../initiations/baseline/baselineAnalyticsStyles'
import { userRoles } from '../../../utils/globalConstants'

const EditStudentsCope = forwardRef(
	({ rowDataSelected, refreshList, setEditDialogData }, ref) => {
		const flexStyles = useCommonStyles()
		const counsellor = getUserFromLocalStorage()
		const captureUIRef = useRef(null)
		const dispatch = useDispatch()
		const user = getUserFromLocalStorage()
		const counselor =
			user?.permissions[0] === userRoles.peeguCounselor ||
			user?.permissions[0] === userRoles.scCounselor
		const specificStudentCopeData = useSelector(
			(store) => store.studentCope.specificStudentCOPEData,
		)
		const { specificStudentCOPEData, isStudentDataExists } = useSelector(
			(store) => store.studentCope,
		)
		const [selectedTab, setSelectedTab] = useState('assessmentResult')
		const [disableSave, setDisableSave] = useState(true)
		const [deleteDialog, setDeleteDialog] = useState(false)
		const [downloadReportDialogOpen, setDownloadReportDialogOpen] =
			useState(false)
		const [anchorElPopover, setAnchorElPopover] = useState(null)
		const [showError, setShowError] = useState(false)
		const [scores, setScores] = useState([])

		const captureUIAndDownloadPDF = async () => {
			await generatePDF(captureUIRef.current, {
				filename: 'Individual Student COPE Report.pdf',
				orientation: 'p',
				pageSize: 'a3',
				margin: 1,
			})
			setDownloadReportDialogOpen(false)
		}

		const handleTabChange = (tabName) => {
			setSelectedTab(tabName)
			setEditDialogData((state) => ({ ...state, selectedTab: tabName }))
		}
		const handleUpdateClick = async () => {
			const body = {
				studentName: specificStudentCopeData?.studentName,
				studentId: specificStudentCopeData?.studentId,
				id: specificStudentCopeData?._id,
				counsellorName: counsellor?.profile?.fullName,
				school: specificStudentCopeData?.school,
				ratings: scores,
				user_id: specificStudentCopeData?.user_id,
				section: specificStudentCopeData?.section,
				className: specificStudentCopeData?.className,
			}
			const response = await dispatch(
				updateStudentCopeAssessment({ body }),
			)

			if (!response.error) {
				refreshList()
				dispatch(
					setIsStudentDataExists(specificStudentCopeData?.studentId),
				)
				const res = await dispatch(
					getStudentCopeData({
						body: { _id: specificStudentCopeData?._id },
					}),
				)
				if (res.payload?.ratings) {
					await delay(2000)
					handleDisableSave(res.payload.ratings)
				}
			}
		}

		useImperativeHandle(ref, () => ({
			handleUpdateClick,
		}))

		const handleOnChangeRating = (index, option) => {
			const newScores = JSON.parse(JSON.stringify(scores))
			if (newScores[index] === option) {
				newScores[index] = 0
			} else {
				newScores[index] = {
					questionNumber: index + 1,
					marks: option,
				}
			}
			setScores(newScores)
			handleDisableSave(newScores)
		}
		// console.log(scores)
		// console.log(specificStudentCOPEData)

		const renderContent = () => {
			if (selectedTab === 'assessmentResult') {
				return (
					<Box>
						{!specificStudentCopeData?.isRatingReset ? (
							<>
								<Box
									sx={{
										...studentCopeStyles?.questionBoxSx,
									}}
								>
									{questions?.map((q, index) => (
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
													{questions[index]?.qns_no}.
													{'   '}{' '}
													{questions[index]?.question}
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
															localizationConstants.notAtAllTrueForMe
														}
													</Typography>
												</Box>
												<Box>
													{questionOptions.map(
														(option, index1) => (
															<FormControlLabel
																key={index1}
																checked={
																	scores?.[
																		index
																	]?.marks ===
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
																// disabled={false}
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
															localizationConstants.reallyTrueForMe
														}
													</Typography>
												</Box>
											</Box>
										</Box>
									))}
								</Box>
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
									{
										localizationConstants?.noStudentCOPERecordsAvailable
									}
								</Typography>
							</Box>
						)}

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
								handleDeleteStudentCope(
									dispatch,
									specificStudentCopeData?._id,
									deleteStudentCopeAssessment,
									setAnchorElPopover,
									setDeleteDialog,
									refreshList,
								)
							}}
						/>
					</Box>
				)
			} else if (selectedTab === 'COPEReport') {
				return (
					<StudentsCOPEReport
						specificStudentCopeData={specificStudentCopeData}
					/>
				)
			}
			return null
		}

		const handleDisableSave = (newScores) => {
			if (
				specificStudentCopeData &&
				specificStudentCopeData.ratings &&
				specificStudentCopeData.ratings.length
			) {
				const ratingsMap = new Map()
				specificStudentCopeData.ratings.forEach((obj) => {
					ratingsMap.set(obj.questionNumber, obj.marks)
				})

				for (const score of newScores) {
					const oldScore = ratingsMap.get(score.questionNumber)
					if (score.marks !== oldScore) {
						setDisableSave(false)
						setEditDialogData((state) => ({
							...state,
							disableSave: false,
						}))
						return
					}
				}
				setDisableSave(true)
				setEditDialogData((state) => ({ ...state, disableSave: true }))
			}
		}

		useEffect(() => {
			if (rowDataSelected?._id) {
				const body = { _id: rowDataSelected?._id }
				dispatch(getStudentCopeData({ body }))
			}
		}, [rowDataSelected?.studentId])

		useEffect(() => {
			if (specificStudentCOPEData && specificStudentCOPEData.ratings) {
				setScores(specificStudentCOPEData.ratings)
			}
		}, [specificStudentCOPEData])

		return (
			<Box ref={captureUIRef}>
				<Box>
					<Box
						sx={{
							...studentCopeStyles?.topBoxSx,
						}}
					>
						{/* ------------St Name --------- */}
						<Box
							className={flexStyles.flexColumn}
							sx={{ mt: '2px', width: 'calc(100% - 10px)' }}
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
										fontSize: '20px',
									}}
								>
									{specificStudentCopeData?.studentName}
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
									{specificStudentCopeData?.counsellorName}
								</Typography>
							</Box>

							{/* ------------cls Name && Section Name --------- */}
							<Box
								sx={{
									mt: '6px',
									display: 'flex',
									ml: '-15px',
								}}
							>
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
									{specificStudentCopeData?.user_id}
								</Typography>
							</Box>
							<Box sx={{ mt: '6px' }}>
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
											{specificStudentCopeData?.className}
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
											{specificStudentCopeData?.section}
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
											specificStudentCopeData?.COPEReportSubmissionDate
												? specificStudentCopeData?.COPEReportSubmissionDate
												: specificStudentCopeData?.createdAt
													? specificStudentCopeData?.createdAt
													: '',
										)}
									</Typography>
								</Box>
							</Box>
							{/* ------------Sch Name --------- */}

							<Box
								sx={{
									mt: '6px',
									display: 'flex',
									justifyContent: 'space-between',
									flexDirection: 'row',
								}}
							>
								<Typography
									variant={typographyConstants.h4}
									sx={{
										fontWeight: '500',
										fontSize: '16px',
										color: 'globalElementColors.grey1',
									}}
								>
									{localizationConstants?.school} :{' '}
									{specificStudentCopeData?.schoolName}
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
									{specificStudentCopeData?.academicYear}
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
					<Box
						sx={{
							width: '100%',
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						{/* Left Section: Tabs */}
						<Box
							sx={{
								display: 'flex',
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
										height: 3,
									},
								}}
							>
								<Tab
									value='assessmentResult'
									label={
										localizationConstants?.assessmentForm
									}
									variant={typographyConstants.h4}
									sx={{
										fontWeight: '600',
										fontSize: '16px',
										color: 'globalElementColors.grey1',
										ml: '5px',
									}}
								/>
								<Tab
									value='COPEReport'
									label={localizationConstants?.copeReport}
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

						{/* Right Section: Button */}
						{selectedTab === 'COPEReport' && (
							<CustomButton
								sx={{
									minWidth: '172px',
									height: '44px',
									backgroundColor: '#0267D9',
									ml: '10px',
									display: 'flex',
									justifyContent: 'center',
								}}
								text={localizationConstants.generateReport}
								onClick={() => {
									setDownloadReportDialogOpen(true)
								}}
							/>
						)}
					</Box>

					{selectedTab === 'assessmentResult' && counselor && (
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
								if (isStudentDataExists) {
									setDeleteDialog(true)
								} else {
									setShowError(true)
								}
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
					)}
				</Box>

				{renderContent()}
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

				{/*----------------- PDF Dialog  ------------------*/}
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
								sx={{
									marginTop: '20px',
									textAlign: 'center',
								}}
							>
								<Typography color={'globalElementColors.gray1'}>
									{
										localizationConstants.individualStudentCOPEReportPDFReportMsg
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

export default EditStudentsCope
