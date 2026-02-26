import React, { useState } from 'react'
import { Box, Typography } from '@mui/material'
import CollapsibleForGoals from '../../../components/CollapsibleForGoals'
import useCommonStyles from '../../../components/styles'
import { getBackgroundColor } from './iEPFunctions'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import CustomButton from '../../../components/CustomButton'
import CustomTextfield from '../../../components/CustomTextField'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'

const ChecklistData = ({ onChange, checklistData, readOnly, variants }) => {
	const flexStyles = useCommonStyles()
	const [modal, setmodal] = useState({
		0: false,
		1: false,
		2: false,
		3: false,
		4: false,
	})
	const updateChecklistData = (field, value, parentIndex, childIndex) => {
		if (!readOnly) {
			const onCdata = [...checklistData]
			const updatedItem = { ...onCdata[parentIndex] }
			const updatedGoals = [...updatedItem[field]]

			updatedGoals[childIndex] = value
			updatedItem[field] = updatedGoals
			onCdata[parentIndex] = updatedItem

			onChange(onCdata)
		}
	}

	return (
		<Box className={flexStyles.flexColumn} gap={'15px'}>
			{checklistData?.map((data, index) => {
				return (
					<Box>
						<CollapsibleForGoals
							open={modal?.[index]}
							title={
								<Box
									className={
										flexStyles.flexRowCenterSpaceBetween
									}
									sx={{
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<Typography
										variant={typographyConstants.title}
										sx={{
											color: 'globalElementColors.richBlack',
											fontSize: '15px',
											pr: '2px',
											fontWeight: 600,
											lineHeight: '19.2px',
											letterSpacing: '0.1px',
										}}
									>
										{data?.category}
									</Typography>
									<>
										(
										<Typography
											variant={typographyConstants.title}
											sx={{
												color: getBackgroundColor(
													variants?.[
														data?.category?.trim()
													],
													false,
												),
												fontSize: '15px',
												pl: '1px',
												pr: '1px',
												fontWeight: 600,
												lineHeight: '19.2px',
												letterSpacing: '0.1px',
											}}
										>
											{variants?.[data?.category?.trim()]}
										</Typography>
										)
									</>
									{variants?.[
										data?.category?.trim()
									]?.toLowerCase() !== 'low' && (
										<Typography
											sx={{
												display: 'inline',
												color: 'globalElementColors.red',
												pl: '5px',
												pr: '2px',
											}}
										>
											*
										</Typography>
									)}
									<Typography
										sx={{
											color: 'globalElementColors.grey',
											fontSize: '13px',
											fontWeight: 500,
											lineHeight: '14.4px',
											pl:
												variants?.[
													data?.category?.trim()
												]?.toLowerCase() === 'low'
													? '5px'
													: '0px',
										}}
									>
										{localizationConstants?.iEPGoalsMsg}
									</Typography>
								</Box>
							}
							onClick={() =>
								setmodal({ ...modal, [index]: !modal?.[index] })
							}
						>
							<Box
								className={flexStyles.flexColumn}
								sx={{ width: '100%' }}
							>
								<Box
									className={
										flexStyles.flexRowCenterSpaceBetween
									}
									sx={{ height: '40px' }}
								>
									<Box className={flexStyles.flexRowCenter}>
										<Typography
											variant={typographyConstants.body2}
											sx={{ fontSize: '14px' }}
										>
											{localizationConstants.addGoals}
										</Typography>
										{variants?.[
											data?.category?.trim()
										]?.toLowerCase() !== 'low' && (
											<Typography
												sx={{
													display: 'inline',
													color: 'globalElementColors.red',
													pl: '5px',
													pr: '2px',
												}}
											>
												*
											</Typography>
										)}
									</Box>
									<Box
										className={flexStyles.flexCenter}
										gap={'20px'}
									>
										<Box>
											<CustomButton
												disabled={readOnly}
												text={
													localizationConstants.addShortTermGoals
												}
												sx={{
													height: '40px',
													minWidth: '164px',
													backgroundColor: '#1FA5CF',
												}}
												onClick={() => {
													if (!readOnly) {
														let onCdata = [
															...checklistData,
														]
														onCdata[index] = {
															...onCdata[index],
															shortTermGoal: [
																...(onCdata[
																	index
																]
																	.shortTermGoal ??
																	[]),
																'',
															],
														}
														onChange(onCdata)
													}
												}}
											/>
										</Box>
										<Box>
											<CustomButton
												disabled={readOnly}
												text={
													localizationConstants.addLongTermGoals
												}
												sx={{
													height: '40px',
													minWidth: '164px',
													backgroundColor:
														'globalElementColors.yellow2',
												}}
												onClick={() => {
													if (!readOnly) {
														let onCdata = [
															...checklistData,
														]
														onCdata[index] = {
															...onCdata[index],
															longTermGoal: [
																...(onCdata[
																	index
																]
																	.longTermGoal ??
																	[]),
																'',
															],
														}
														onChange(onCdata)
													}
												}}
											/>
										</Box>
									</Box>
								</Box>
								{data?.shortTermGoal?.length > 0 ? (
									<Box
										sx={{
											minHeight: '200px',
											border: '1px solid #1FA5CF87',
											backgroundColor: '#1FA5CF08',
											mt: '15px',
											borderRadius: '8px',
											padding: '20px',
										}}
										className={flexStyles.flexColumn}
									>
										<Typography
											variant={typographyConstants.body2}
											sx={{
												fontWeight: 600,
												fontSize: '16px',
												lineHeight: '19.2px',
												mb: '20px',
											}}
										>
											{
												localizationConstants.shortTermGoal
											}
										</Typography>
										<Box
											className={flexStyles.flexColumn}
											gap={'20px'}
										>
											{data?.shortTermGoal?.map(
												(term, i) => {
													return (
														<Box
															className={
																flexStyles.flexRowAlignCenter
															}
															gap={'10px'}
														>
															<Box
																sx={{
																	flexGrow: 1,
																}}
															>
																<CustomTextfield
																	readOnly={
																		readOnly
																	}
																	formSx={{
																		width: '100%',
																		flexGrow: 1,
																	}}
																	propSx={{
																		height: '65px',
																	}}
																	placeholder={
																		localizationConstants.shortTermGoalph
																	}
																	value={term}
																	multiline={
																		true
																	}
																	required={
																		true
																	}
																	onChange={(
																		e,
																	) => {
																		const value =
																			Array.isArray(
																				e
																					.target
																					.value,
																			)
																				? e
																						.target
																						.value[0]
																				: e
																						.target
																						.value
																		updateChecklistData(
																			'shortTermGoal',
																			value,
																			index,
																			i,
																		)
																	}}
																/>
															</Box>
															{!readOnly ? (
																<CustomIcon
																	name={
																		iconConstants.close
																	}
																	style={{
																		height: '20px',
																		width: '20px',
																		cursor: 'pointer',
																	}}
																	onClick={() => {
																		const onCdata =
																			[
																				...checklistData,
																			]
																		onCdata[
																			index
																		].shortTermGoal =
																			onCdata[
																				index
																			].shortTermGoal?.filter(
																				(
																					_,
																					h,
																				) =>
																					h !==
																					i,
																			)
																		onChange(
																			onCdata,
																		)
																	}}
																/>
															) : null}
														</Box>
													)
												},
											)}
										</Box>
									</Box>
								) : null}

								{data?.longTermGoal?.length > 0 ? (
									<Box
										sx={{
											minHeight: '200px',
											border: '1px solid #FCDAB4',
											backgroundColor: '#FEF3E71A',
											mt: '15px',
											borderRadius: '8px',
											padding: '20px',
										}}
										className={flexStyles.flexColumn}
									>
										<Typography
											variant={typographyConstants.body2}
											sx={{
												fontWeight: 600,
												fontSize: '16px',
												lineHeight: '19.2px',
												mb: '20px',
											}}
										>
											{localizationConstants.longTermGoal}
										</Typography>
										<Box
											className={flexStyles.flexColumn}
											gap={'20px'}
										>
											{data?.longTermGoal?.map(
												(term, i) => {
													return (
														<Box
															className={
																flexStyles.flexRowAlignCenter
															}
															gap={'10px'}
														>
															<Box
																sx={{
																	flexGrow: 1,
																}}
															>
																<CustomTextfield
																	readOnly={
																		readOnly
																	}
																	formSx={{
																		width: '100%',
																		flexGrow: 1,
																	}}
																	propSx={{
																		height: '65px',
																	}}
																	placeholder={
																		localizationConstants.longTermGoalph
																	}
																	value={term}
																	multiline={
																		true
																	}
																	required={
																		true
																	}
																	onChange={(
																		e,
																	) => {
																		const value =
																			Array.isArray(
																				e
																					.target
																					.value,
																			)
																				? e
																						.target
																						.value[0]
																				: e
																						.target
																						.value
																		updateChecklistData(
																			'longTermGoal',
																			value,
																			index,
																			i,
																		)
																	}}
																/>
															</Box>
															{!readOnly ? (
																<CustomIcon
																	name={
																		iconConstants.close
																	}
																	style={{
																		height: '20px',
																		width: '20px',
																		cursor: 'pointer',
																	}}
																	onClick={() => {
																		const onCdata =
																			[
																				...checklistData,
																			]
																		onCdata[
																			index
																		].longTermGoal =
																			onCdata[
																				index
																			].longTermGoal?.filter(
																				(
																					_,
																					h,
																				) =>
																					h !==
																					i,
																			)
																		onChange(
																			onCdata,
																		)
																	}}
																/>
															) : null}
														</Box>
													)
												},
											)}
										</Box>
									</Box>
								) : null}
							</Box>
						</CollapsibleForGoals>
					</Box>
				)
			})}
		</Box>
	)
}

export default ChecklistData
