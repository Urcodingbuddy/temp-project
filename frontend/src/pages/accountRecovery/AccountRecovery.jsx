import React, { useState } from 'react'
import CustomAuthScreenLayout from '../../components/CustomAuthScreenLayout'
import { localizationConstants } from '../../resources/theme/localizationConstants'
import { Box, Typography, TextField, Button, InputLabel } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import useCommonStyles from '../../components/styles'
import { useDispatch, useSelector } from 'react-redux'
import { history } from '../../utils/utils'
import { useLocation, useNavigate } from 'react-router-dom'
import { routePaths } from '../../routes/routeConstants'
import {
	handleAccountRecoveryEmail,
	handleAccountRecoveryLogin,
} from './accountRecoveryFunctions'
import { iconConstants } from '../../resources/theme/iconConstants'
import CustomIcon from '../../components/CustomIcon'

const AccountRecovery = () => {
	const flexStyles = useCommonStyles()
	const dispatch = useDispatch()
	const navigate = useNavigate()
	history.navigate = useNavigate()
	history.location = useLocation()

	const { accountRecoveryEmail } = useSelector((store) => store.login)

	const [isEmailValid, setIsEmailValid] = useState(false)

	const handleBackToLogin = () => {
		navigate(routePaths.login)
	}

	const rightSideContent = () => {
		return (
			<Box
				className={flexStyles.flexColumnCenter}
				sx={{
					px: { xs: 2, sm: 3, md: 4 },
					py: { xs: 3, sm: 4 },
					width: '100%',
					maxWidth: { xs: '100%', sm: '500px' },
					mx: 'auto',
				}}
			>
				<CustomIcon
					name={iconConstants.myPeegu}
					style={{
						width: '190px',
						height: '114px',
					}}
					svgStyle={'width: 190px; height: 114px'}
				/>
				<Typography
					variant="h3"
					sx={{
						pt: { xs: '32px', sm: '40px', md: '48px' },
						fontWeight: 700,
						fontSize: { xs: '24px', sm: '28px', md: '32px' },
						letterSpacing: '-0.5px',
						color: '#1a1a1a',
						textAlign: 'center',
					}}
				>
					{localizationConstants.forgotPasswordTitle}
				</Typography>
				<Typography
					variant="body1"
					sx={{
						pt: { xs: '16px', sm: '20px', md: '24px' },
						fontSize: { xs: '14px', sm: '15px' },
						color: '#6b7280',
						mb: { xs: '32px', sm: '40px' },
						textAlign: 'center',
						px: { xs: 1, sm: 0 },
					}}
				>
					{localizationConstants.enterEmailAddress}
				</Typography>
				<Box sx={{ width: '100%', maxWidth: '420px' }}>
					<Box sx={{ mb: { xs: '32px', sm: '40px' } }}>
						<InputLabel
							sx={{
								mb: 1,
								fontSize: { xs: '13px', sm: '14px' },
								fontWeight: 600,
								color: '#374151',
							}}
						>
							{localizationConstants.emailId}
						</InputLabel>
						<TextField
							fullWidth
							placeholder={localizationConstants.enterEmailId}
							value={accountRecoveryEmail}
							onChange={(e) => {
								handleAccountRecoveryEmail(
									e,
									dispatch,
									setIsEmailValid,
								)
							}}
							sx={{
								'& .MuiOutlinedInput-root': {
									borderRadius: '8px',
									fontSize: { xs: '14px', sm: '15px' },
									fontWeight: 400,
									color: '#1f2937',
									'& input': {
										py: { xs: 1.5, sm: 1.75 },
									},
									'& input::placeholder': {
										color: '#9ca3af',
										opacity: 1,
									},
								},
							}}
						/>
					</Box>
				</Box>

				<Button
					variant="contained"
					fullWidth
					onClick={() => {
						handleAccountRecoveryLogin(
							accountRecoveryEmail,
							dispatch,
						)
					}}
					disabled={!isEmailValid}
					sx={{
						maxWidth: '420px',
						py: { xs: 1.25, sm: 1.5 },
						borderRadius: '8px',
						background:
							'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
						fontSize: { xs: '14px', sm: '15px' },
						fontWeight: 600,
						letterSpacing: '0.3px',
						textTransform: 'none',
						boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
						'&:hover': {
							background:
								'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
							boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
						},
						'&:disabled': {
							background: '#e5e7eb',
							color: '#9ca3af',
							boxShadow: 'none',
						},
					}}
				>
					{localizationConstants.continue}
				</Button>

				<Button
					variant="text"
					fullWidth
					startIcon={<ArrowBackIcon />}
					onClick={handleBackToLogin}
					sx={{
						maxWidth: '420px',
						mt: { xs: 2, sm: 2.5 },
						py: { xs: 1.25, sm: 1.5 },
						fontSize: { xs: '14px', sm: '15px' },
						fontWeight: 600,
						color: '#667eea',
						textTransform: 'none',
						'&:hover': {
							backgroundColor: 'rgba(102, 126, 234, 0.08)',
							color: '#764ba2',
						},
					}}
				>
					Back to Login
				</Button>
			</Box>
		)
	}

	return (
		<CustomAuthScreenLayout
			leftSideTitle={localizationConstants.accountRecovery}
			leftSideDescription={
				localizationConstants.accountRecoveryDescription
			}
			rightSideContent={rightSideContent()}
		/>
	)
}

export default AccountRecovery
