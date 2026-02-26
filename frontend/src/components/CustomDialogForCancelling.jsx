import {
	Box,
	Dialog,
	DialogActions,
	DialogContent,
	Grid,
	Typography,
} from '@mui/material'
import React from 'react'
import CustomIcon from './CustomIcon'
import useCommonStyles from './styles'
import CustomButton from './CustomButton'
import { commonComponentStyles } from './commonComponentStyles'
import { typographyConstants } from '../resources/theme/typographyConstants'

const CustomAlertDialog = ({
	isOpen,
	title,
	titleTypoVariant,
	titleSx,
	onLeftButtonClick,
	onRightButtonClick,
	leftButtonText,
	rightButtonText,
	onClose,
	iconName,
	messageTypoVariant,
	message,
}) => {
	const flexStyles = useCommonStyles()
	return (
		<>
			<Dialog
				PaperProps={{
					style: {
						borderRadius: '10px',
						maxWidth: '427px',
					},
				}}
				open={isOpen}
				onClose={onClose}
			>
				<DialogContent
					className={flexStyles.flexColumnCenter}
					sx={{ pb: 0 }}
				>
					<Box
						sx={{
							position: 'fixed',
							left: '47.5%',
						}}
					>
						<CustomIcon
							name={iconName}
							style={{
								height: '24px',
								width: '24px',
							}}
							svgStyle={{
								height: '24px',
								width: '24px',
							}}
						/>
					</Box>

					<Typography
						variant={titleTypoVariant}
						sx={{ ...titleSx, mt: '55px' }}
					>
						{title}
					</Typography>
				</DialogContent>
				<DialogActions sx={{ p: 0, m: 0 }}>
					<Box
						sx={{
							backgroundColor: 'backgroundColors.lightBlue',
							p: '10px 28px',
						}}
					>
						<Typography
							variant={messageTypoVariant}
							sx={{ display: 'flex', justifyContent: 'center' }}
						>
							{message}
						</Typography>
						<Grid
							container
							className={flexStyles.flexRowCenter}
							sx={{
								p: '20px',
								gap: '20px',
							}}
						>
							{leftButtonText && (
								<Grid item>
									<CustomButton
										sx={
											commonComponentStyles.leftButtonDialogSx
										}
										text={leftButtonText}
										onClick={onLeftButtonClick}
										typoVariant={typographyConstants.body}
										typoSx={{
											color: 'textColors.black',
										}}
									/>
								</Grid>
							)}
							{rightButtonText && (
								<Grid item>
									<CustomButton
										sx={
											commonComponentStyles.rightButtonDialogSx
										}
										text={rightButtonText}
										onClick={onRightButtonClick}
										typoVariant={typographyConstants.body}
										typoSx={{
											color: 'textColors.white',
										}}
									/>
								</Grid>
							)}
						</Grid>
					</Box>
				</DialogActions>
			</Dialog>
		</>
	)
}

export default CustomAlertDialog
