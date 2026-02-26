import React from 'react'
import { Button, Typography, Box } from '@mui/material'
import useStyles from './styles'
import { typographyConstants } from '../resources/theme/typographyConstants'

const CustomButton = ({
	variant,
	type,
	sx,
	fullWidth = false,
	onClick,
	disabled = false,
	className,
	typoVariant = typographyConstants.h4,
	typoSx = { color: 'textColors.white' },
	text = 'save',
	startIcon = null,
	endIcon = null,
	submitRef,
	gap = 0,
	disabledColor,
	disableElevation,
}) => {
	const classes = useStyles()

	return (
		<Button
			variant={variant ? variant : 'contained'}
			type={type}
			ref={submitRef}
			sx={{
				...sx,
				boxShadow: 'none',
				minWidth: sx?.minWidth ?? '100%',
				borderRadius: sx?.borderRadius ?? '6px',
				p: sx?.p ?? '16px 20px',
				backgroundColor: disabled
					? 'buttonColors.disabledButtonBackground'
					: (sx?.backgroundColor ?? 'buttonColors.blue'),
				'&:hover': {
					backgroundColor: sx?.backgroundColor ?? 'buttonColors.blue',
				},
				'&.Mui-disabled': {
					backgroundColor:
						disabledColor ??
						'buttonColors.disabledButtonBackground',
				},
			}}
			fullWidth={fullWidth}
			onClick={onClick}
			disabled={disabled}
			className={className}
			disableElevation={true}
		>
			<Box className={classes.flexRowCenter}>
				{startIcon && startIcon}

				<Typography
					variant={typoVariant}
					sx={{
						...typoSx,
						color: disabled
							? 'buttonColors.white'
							: !variant && typoSx?.color,
						textTransform: 'none',
					}}
				>
					{text}
				</Typography>
				{endIcon && endIcon}
			</Box>
		</Button>
	)
}

export default CustomButton
