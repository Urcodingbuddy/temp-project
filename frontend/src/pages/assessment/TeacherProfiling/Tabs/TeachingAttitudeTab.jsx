import { Checkbox, FormControlLabel, Typography } from '@mui/material'
import { localizationConstants } from '../../../../resources/theme/localizationConstants'
import { typographyConstants } from '../../../../resources/theme/typographyConstants'
import { Box } from '@mui/system'
import CustomIcon from '../../../../components/CustomIcon'
import { iconConstants } from '../../../../resources/theme/iconConstants'
import useCommonStyles from '../../../../components/styles'
import { studentCopeStyles } from '../../StudentCope/StudentCopeStyles'
import { useDispatch, useSelector } from 'react-redux'
import {
	questionsRatingForTeachingAttitude,
	teacherAttitudesAssessmentQuestions,
} from '../teacherProfilingConstants'
import { teacherProfilingStyles } from '../teacherProfilingStyles'
import { setTeachingAttitudeScore } from '../teacherProfilingSlice'

const TeachingAttitudeTab = ({ isEditable }) => {
	const flexStyles = useCommonStyles()
	const dispatch = useDispatch()
	// const { isPermissionOfTeacher } = useSelector((store) => store.dashboardSliceSetup)
	const { teachingAttitudeScore } = useSelector(
		(store) => store.teacherProfiling,
	)

	const handleOnChangeRating = (index, option) => {
		const newScores = [...teachingAttitudeScore]

		const updatedScore = { ...newScores[index] }

		if (updatedScore.marks === option) {
			updatedScore.marks = null
		} else {
			updatedScore.marks = option
		}

		newScores[index] = updatedScore

		dispatch(setTeachingAttitudeScore(newScores))
	}

	return (
		<Box>
			{teachingAttitudeScore?.length > 0 ? (
				<>
					<Box
						sx={{
							...teacherProfilingStyles.questionBoxSx,
						}}
					>
						{teacherAttitudesAssessmentQuestions?.map(
							(questions, index) => (
								<Box
									sx={{
										...studentCopeStyles?.questions,
										mt: index > 1 ? '20px' : 'opx',
									}}
								>
									<Box>
										<Typography
											variant={typographyConstants.h4}
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
											{questionsRatingForTeachingAttitude.map(
												(option, index1) => (
													<FormControlLabel
														key={index1}
														checked={
															teachingAttitudeScore?.[
																index
															]?.marks == option
														}
														onChange={(e) =>
															handleOnChangeRating(
																index,
																option,
															)
														}
														sx={{ margin: '0' }}
														disabled={!isEditable}
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
		</Box>
	)
}

export default TeachingAttitudeTab
