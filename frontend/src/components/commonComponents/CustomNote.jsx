import React from 'react'
import { Box, Typography } from '@mui/material'
import { typographyConstants } from '../../resources/theme/typographyConstants'
import { localizationConstants } from '../../resources/theme/localizationConstants'

const CustomNote = ({ message }) => {
	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'flex-start',
				gap: 1.5,
				backgroundColor: 'rgba(235, 203, 195, 0.9)',
				borderLeft: '5px solid',
				borderColor: 'globalElementColors.red',
				borderRadius: '6px',
				p: '10px 14px',
				mt: 1,
			}}
		>
			<Typography
				variant={typographyConstants.title}
				sx={{
					color: 'globalElementColors.red',
					fontWeight: 700,
					minWidth: 'fit-content',
				}}
			>
				{localizationConstants.note}:
			</Typography>
			<Typography
				variant={typographyConstants.title}
				sx={{
					fontWeight: 500,
					lineHeight: 1.5,
				}}
			>
				{message}
			</Typography>
		</Box>
	)
}

export default CustomNote
