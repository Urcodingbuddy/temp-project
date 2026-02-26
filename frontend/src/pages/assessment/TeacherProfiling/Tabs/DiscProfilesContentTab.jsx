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
	DISCAssessmentQuestions,
	questionsRatingForDISC,
} from '../teacherProfilingConstants'
import { teacherProfilingStyles } from '../teacherProfilingStyles'
import { setDiscProfilesContentScore } from '../teacherProfilingSlice'

const DiscProfilesContentTab = ({ isEditable }) => {
	const flexStyles = useCommonStyles()
	const dispatch = useDispatch()
	const { discProfilesContentScore } = useSelector(
		(store) => store.teacherProfiling,
	)

	const handleOnChangeRating = (index, option) => {
		const newScores = [...discProfilesContentScore]

		const updatedScore = { ...newScores[index] }

		if (updatedScore.marks === option) {
			updatedScore.marks = null
		} else {
			updatedScore.marks = option
		}

		newScores[index] = updatedScore

		dispatch(setDiscProfilesContentScore(newScores))
	}

	return (
		<Box>
			{discProfilesContentScore?.length > 0 ? (
				<>
					<Box
						sx={{
							...teacherProfilingStyles.questionBoxSx,
						}}
					>
						{DISCAssessmentQuestions?.map((questions, index) => (
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
										{questionsRatingForDISC.map(
											(option, index1) => (
												<FormControlLabel
													key={index1}
													checked={
														discProfilesContentScore?.[
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
						))}
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

export default DiscProfilesContentTab
