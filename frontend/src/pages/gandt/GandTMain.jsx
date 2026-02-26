import React from 'react'
import { Box, Card, CardContent, Typography, Grid } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '../../routes/routeConstants'
import SettingsIcon from '@mui/icons-material/Settings'
import SchoolIcon from '@mui/icons-material/School'

const GandTMain = () => {
	const navigate = useNavigate()

	const options = [
		{
			title: 'Manage Templates',
			description:
				'Create, edit, and manage G&T assessment templates with age groups, skills, and questions.',
			icon: <SettingsIcon sx={{ fontSize: 60 }} />,
			path: routePaths.gandtTemplates,
			color: '#667eea',
		},
		{
			title: 'Assign Templates to Schools',
			description:
				'Assign G&T assessment templates to schools and manage school-specific configurations.',
			icon: <SchoolIcon sx={{ fontSize: 60 }} />,
			path: routePaths.gandtAssignments,
			color: '#764ba2',
		},
	]

	return (
		<Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
			<Typography
				variant="h4"
				sx={{
					fontWeight: 600,
					mb: { xs: 3, sm: 4 },
					color: '#1a1a1a',
				}}
			>
				Gifted & Talented Assessment
			</Typography>

			<Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
				{options.map((option, index) => (
					<Grid item xs={12} md={6} key={index}>
						<Card
							onClick={() => navigate(option.path)}
							sx={{
								cursor: 'pointer',
								height: '100%',
								transition: 'all 0.3s ease',
								border: '1px solid #e5e7eb',
								'&:hover': {
									transform: 'translateY(-4px)',
									boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
									borderColor: option.color,
								},
							}}
						>
							<CardContent
								sx={{
									p: { xs: 3, sm: 4 },
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									textAlign: 'center',
								}}
							>
								<Box
									sx={{
										mb: 3,
										color: option.color,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										width: 100,
										height: 100,
										borderRadius: '50%',
										background: `${option.color}15`,
									}}
								>
									{option.icon}
								</Box>
								<Typography
									variant="h5"
									sx={{
										fontWeight: 600,
										mb: 2,
										color: '#1a1a1a',
									}}
								>
									{option.title}
								</Typography>
								<Typography
									variant="body1"
									sx={{
										color: '#6b7280',
										lineHeight: 1.6,
									}}
								>
									{option.description}
								</Typography>
							</CardContent>
						</Card>
					</Grid>
				))}
			</Grid>
		</Box>
	)
}

export default GandTMain
