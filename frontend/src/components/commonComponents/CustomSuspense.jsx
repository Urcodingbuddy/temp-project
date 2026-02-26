import React, { Suspense } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

const CustomSuspense = ({ children }) => {
	return (
		<Suspense
			fallback={
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						height: '100%',
					}}
				>
					<CircularProgress />
				</Box>
			}
		>
			{children}
		</Suspense>
	)
}

export default CustomSuspense
