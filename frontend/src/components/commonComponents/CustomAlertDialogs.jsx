import React from 'react'
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography,
	Box,
} from '@mui/material'

import CustomButton from '../CustomButton'
import { localizationConstants } from '../../resources/theme/localizationConstants'
import { typographyConstants } from '../../resources/theme/typographyConstants'
import { commonComponentStyles } from '../commonComponentStyles'
import CustomIcon from '../CustomIcon'

const CustomAlertDialogs = ({
	open,
	setOpen,
	type,
	title,
	iconName,
	dynamicText1,
	dynamicText2,
	onSubitClick,
	onCancelClick,
}) => {
	const handleClose = () => setOpen(false)

	const isSingleButton =
		type === localizationConstants.alertGraduate ||
		type === localizationConstants.alertPromotion ||
		type === localizationConstants.singleStudentGraduateAlert

	const getDescription = () => {
		switch (type) {
			case localizationConstants.promoteStudentWarning:
				return (
					<>
						<Typography
							variant={typographyConstants.h4}
							sx={{ color: '#08091D', fontWeight: 800 }}
						>
							{localizationConstants.promotingThe}{' '}
							<strong style={{ color: '#DD2A2B' }}>
								{dynamicText1}
							</strong>{' '}
							{localizationConstants.studentsTo}{' '}
							<strong style={{ color: '#DD2A2B' }}>
								{dynamicText2}
							</strong>
							.
						</Typography>
						<Typography mt={1}>
							{
								localizationConstants.beforeProceedingEnsureAllClassroomsFor
							}{' '}
							<strong>{dynamicText2}</strong>{' '}
							{localizationConstants.areCreatedOrUpdated}
						</Typography>
						<Typography mt={1}>
							{localizationConstants.studentsNotMarkedASGraduated}
						</Typography>
						<Typography mt={1} fontWeight={600}>
							{
								localizationConstants.incorrectSetupMayLeadToDataIssues
							}
						</Typography>
					</>
				)

			case localizationConstants.alertPromotion:
				return (
					<Typography>
						{localizationConstants.alertPromotionMessage}{' '}
						<strong style={{ color: '#DD2A2B' }}>
							{dynamicText1}
						</strong>
						.
					</Typography>
				)

			case localizationConstants.alertGraduate:
				return (
					<Typography>
						{localizationConstants.alertGraduateMessage}
					</Typography>
				)

			case localizationConstants.graduateExitShiftWarning:
				return (
					<Typography>
						{localizationConstants.graduateExitShiftWarningMessage}
					</Typography>
				)

			case localizationConstants.bulkUploadWarning:
				return (
					<Typography>
						{localizationConstants.bulkUploadWarningMessage}
					</Typography>
				)
			case localizationConstants.singleStudentGraduateAlert:
				return (
					<Typography>
						{localizationConstants.cannotGraduateDes}
					</Typography>
				)
			case localizationConstants.teacherUpdateAcknowledgement:
				return (
					<>
						<Typography>
							{
								localizationConstants.teacherUpdateAcknowledgementMess
							}
						</Typography>
						<Typography mt={1} fontWeight={800}>
							{localizationConstants.areYouSureYouWantToUpdate}
						</Typography>
					</>
				)
			case localizationConstants.selModuleUploadAcknowledgement:
				return (
					<>
						<Typography>
							{
								localizationConstants.selModuleUploadAcknowledgementMsg
							}
						</Typography>
						<Typography mt={1} fontWeight={800}>
							{localizationConstants.areYouSureYouWantToUpload}
						</Typography>
					</>
				)

			default:
				return null
		}
	}

	const getSubmitText = () => {
		if (type === localizationConstants.promoteStudentWarning) {
			return localizationConstants.yesPromote
		}
		if (
			type === localizationConstants.alertPromotion ||
			type === localizationConstants.alertGraduate ||
			type === localizationConstants.singleStudentGraduateAlert
		) {
			return localizationConstants.ok
		}
		return localizationConstants.submit
	}

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			PaperProps={{
				style: {
					borderRadius: '10px',
					width: '600px',
				},
			}}
		>
			<DialogTitle
				sx={{
					display: 'flex',
					alignItems: 'center',
					gap: 1,
					justifyContent: 'center',
				}}
			>
				<CustomIcon
					name={iconName}
					style={{
						height: '30px',
						width: '30px',
					}}
					svgStyle={{
						height: '30px',
						width: '30px',
					}}
				/>

				<Typography
					variant={typographyConstants.h4}
					sx={{ fontWeight: 700 }}
				>
					{title}
				</Typography>
			</DialogTitle>

			<DialogContent>{getDescription()}</DialogContent>

			<DialogActions sx={{ p: 0, m: 0 }}>
				<Box
					sx={{
						backgroundColor: 'backgroundColors.lightBlue',
						p: '10px 28px',
						width: '100%',
					}}
				>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'center',
							gap: '20px',
							// height: '60px',
						}}
					>
						{!isSingleButton && (
							<CustomButton
								sx={{
									...commonComponentStyles.leftButtonDialogSx,
									minWidth: '175px',
								}}
								text={localizationConstants.cancel}
								onClick={onCancelClick}
								typoVariant={typographyConstants.body}
								typoSx={{
									color: 'textColors.black',
								}}
							/>
						)}

						<CustomButton
							sx={{
								...commonComponentStyles.rightButtonDialogSx,
								minWidth: '175px',
							}}
							text={getSubmitText()}
							onClick={onSubitClick}
							typoVariant={typographyConstants.body}
							typoSx={{
								color: 'textColors.white',
							}}
						/>
					</Box>
				</Box>
			</DialogActions>
		</Dialog>
	)
}

export default CustomAlertDialogs
