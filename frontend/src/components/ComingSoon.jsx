import React from 'react'
import { Box, Card, Typography } from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'

const ComingSoon = ({ title = 'Coming Soon', message = 'This feature is currently under development and will be available soon.' }) => {
	return (
		<Box
			sx={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				minHeight: '70vh',
				p: 3,
			}}
		>
			<Card
				sx={{
					maxWidth: 600,
					width: '100%',
					p: 6,
					textAlign: 'center',
					boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
				}}
			>
				<AccessTimeIcon
					sx={{
						fontSize: 80,
						color: '#667eea',
						mb: 3,
					}}
				/>
				<Typography
					variant="h4"
					sx={{
						fontWeight: 600,
						mb: 2,
						background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
						WebkitBackgroundClip: 'text',
						WebkitTextFillColor: 'transparent',
					}}
				>
					{title}
				</Typography>
				<Typography
					variant="body1"
					color="text.secondary"
					sx={{ fontSize: 16, lineHeight: 1.8 }}
				>
					{message}
				</Typography>
			</Card>
		</Box>
	)
}

export default ComingSoon
