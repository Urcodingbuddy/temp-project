import { Typography } from '@mui/material'
import { Box } from '@mui/system'
import React from 'react'
import { typographyConstants } from '../resources/theme/typographyConstants'

const NoIRIDataAvailableScreen = ({ message }) => {
	return (
		<Box
			sx={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '70vh',
				overflow: 'hidden',
			}}
		>
			<Typography
				sx={{ color: '#6A6A6A' }}
				variant={typographyConstants?.h4}
			>
				{message}
			</Typography>
		</Box>
	)
}

export default NoIRIDataAvailableScreen
