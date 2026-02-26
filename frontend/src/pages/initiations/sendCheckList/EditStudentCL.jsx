import { Box, Divider, Drawer, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { counsellorStyles } from '../../counsellors/counsellorsStyles'
import useCommonStyles from '../../../components/styles'
import { useDispatch, useSelector } from 'react-redux'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { iconConstants } from '../../../resources/theme/iconConstants'
import CustomIcon from '../../../components/CustomIcon'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomButton from '../../../components/CustomButton'
import QuestionsCollapsibleComponent from '../../../components/QuestionsCollapsibleComponent'
import {
	getBackgroundColor,
	handleOptionChange,
	updateChecklist,
} from './sendChecklistFunction'
import {
	clearGrade_4_Marks,
	clearGrade_9_Marks,
	setGrade_4_Marks,
	setGrade_9_Marks,
} from './sendChecklistslice'
import { checklistOptions } from './sendCheckListConstants'

const EditStudentCL = ({
	open,
	setOpen,
	questionListData,
	isGrade_9,
	oldData,
	studentId,
	onEditChecklist,
}) => {
	const flexStyles = useCommonStyles()
	const [isEditBtnClicked, setIsEditBtnClicked] = useState(false)
	const dispatch = useDispatch()
	const { Grade_9_Marks, Grade_4_Marks } = useSelector(
		(store) => store.sendChecklist,
	)
	const [oldAnswers, setOldAnswers] = useState([])
	const { appPermissions } = useSelector((store) => store.dashboardSliceSetup)
	useEffect(() => {
		if (!isEditBtnClicked) {
			setOldAnswers(oldData)
		}
	}, [oldData])

	return (
		<Drawer
			anchor='right'
			sx={counsellorStyles.drawerSx}
			open={open}
			onClose={() => (isEditBtnClicked ? '' : setOpen(false))}
		>
			<Box sx={{ flexGrow: 1 }}>
				<Box
					className={flexStyles.flexRowCenterSpaceBetween}
					sx={{ pb: '12px' }}
				>
					<Typography
						variant={typographyConstants.h4}
						sx={{ fontWeight: 500, color: 'textColors.blue' }}
					>
						{questionListData?.title ?? ''}
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
							setOpen(false)
							setIsEditBtnClicked(false)
							dispatch(clearGrade_4_Marks())
							dispatch(clearGrade_9_Marks())
						}}
					/>
				</Box>

				<Divider />

				<Box
					sx={{
						mt: '20px',
						overflow: 'auto',
						maxHeight: appPermissions?.studentCheckList?.edit
							? `calc(100vh - 280px)`
							: `calc(100vh - 205px)`,
						paddingRight: '5px',
						height: '100%',
						pr: '10px',
					}}
				>
					<QuestionsCollapsibleComponent
						questionList={questionListData}
						isEditable={isEditBtnClicked}
						isCollapsable={false}
						qusetionChange={(
							index,
							option,
							mainTitle,
							subQuestions,
							subTitle,
						) =>
							handleOptionChange(
								index,
								option,
								mainTitle,
								subQuestions,
								subTitle,
								isGrade_9,
								Grade_4_Marks,
								dispatch,
								Grade_9_Marks,
							)
						}
					/>
				</Box>
			</Box>
			<Box
				className={flexStyles.flexRowCenterSpaceBetween}
				sx={{
					mb: appPermissions?.studentCheckList?.edit
						? '16px'
						: '32px',
					borderRadius: '4px',
					backgroundColor: getBackgroundColor(
						questionListData?.total ?? 0,
						questionListData?.totalQuestions ?? 0,
						true,
					),
					minHeight: '50px',
					pl: '16px',
					pr: '16px',
				}}
			>
				<Box
					className={flexStyles.flexRowCenterSpaceBetween}
					sx={{
						width: '100%',
					}}
				>
					<Typography
						variant={typographyConstants.h4}
						sx={{ fontSize: '20px', color: '#08091D' }}
					>
						{questionListData?.subQuestions
							? localizationConstants.overallTotal
							: localizationConstants.total}
					</Typography>
					<Typography
						variant={typographyConstants.h4}
						sx={{ fontSize: '20px', color: '#08091D' }}
					>
						{questionListData?.total ?? 0}
					</Typography>
				</Box>
			</Box>
			{appPermissions?.studentCheckList?.edit ? (
				<>
					{isEditBtnClicked && (
						<Box
							className={flexStyles.flexRowCenterSpaceBetween}
							sx={{ mb: '36px' }}
						>
							<CustomButton
								sx={{
									minWidth: '192px',
									backgroundColor: 'transparent',
									border: '1px solid',
									borderColor: 'globalElementColors.blue',
								}}
								typoSx={{ color: 'textColors.black' }}
								text={localizationConstants.cancel}
								onClick={() => {
									setIsEditBtnClicked(false)
									if (isGrade_9) {
										dispatch(setGrade_9_Marks(oldAnswers))
									} else {
										dispatch(setGrade_4_Marks(oldAnswers))
									}
								}}
							/>
							<CustomButton
								sx={{ minWidth: '192px' }}
								text={localizationConstants.submit}
								endIcon={
									<CustomIcon
										name={iconConstants.doneWhite}
										style={{
											width: '24px',
											height: '24px',
											marginLeft: '10px',
										}}
										svgStyle={'width: 24px; height: 24px'}
									/>
								}
								onClick={() => {
									updateChecklist(
										questionListData,
										studentId,
										dispatch,
										setOpen,
										setIsEditBtnClicked,
										isGrade_9
											? checklistOptions?.[1]
											: checklistOptions?.[0],
										onEditChecklist,
									)
								}}
							/>
						</Box>
					)}{' '}
					{!isEditBtnClicked && (
						<CustomButton
							sx={{ mb: '36px' }}
							text={localizationConstants.edit}
							onClick={() => setIsEditBtnClicked(true)}
							endIcon={
								<CustomIcon
									name={iconConstants.editPencilWhite}
									style={{
										width: '24px',
										height: '24px',
										marginLeft: '10px',
									}}
									svgStyle={'width: 24px; height: 24px'}
								/>
							}
						/>
					)}
				</>
			) : null}
		</Drawer>
	)
}

export default EditStudentCL
