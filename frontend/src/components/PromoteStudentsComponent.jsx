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

const PromoteStudentsComponent = ({
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
						width: '427px',
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
							left: '49%',
							height: '100px',
							//   width:'100px'
						}}
					>
						<CustomIcon
							name={iconName}
							style={{
								height: '30px', // Increase the height
								width: '30px', // Increase the width
							}}
							svgStyle={{
								height: '30px', // Increase the height
								width: '30px', // Increase the width
							}}
						/>
					</Box>

					<Typography
						variant={titleTypoVariant}
						sx={{ ...titleSx, mt: '40px', mb: '20px' }}
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
							sx={{
								textAlign: 'center',
							}}
						>
							{message}
						</Typography>

						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								height: '60px',
								gap: '20px',
							}}
						>
							{leftButtonText && (
								<CustomButton
									sx={{
										...commonComponentStyles.leftButtonDialogSx,
										minWidth: '175px',
									}}
									text={leftButtonText}
									onClick={onLeftButtonClick}
									typoVariant={typographyConstants.body}
									typoSx={{
										color: 'textColors.black',
									}}
								/>
							)}

							{rightButtonText && (
								<CustomButton
									sx={{
										...commonComponentStyles.rightButtonDialogSx,
										minWidth: '175px',
									}}
									text={rightButtonText}
									onClick={onRightButtonClick}
									typoVariant={typographyConstants.body}
									typoSx={{
										color: 'textColors.white',
									}}
								/>
							)}
						</Box>
					</Box>
				</DialogActions>
			</Dialog>
		</>
	)
}

export default PromoteStudentsComponent
