import React, { useEffect, useState } from 'react'
import CustomAuthScreenLayout from '../../components/CustomAuthScreenLayout'
import {
	Box,
	Typography,
	TextField,
	Button,
	InputAdornment,
	IconButton,
	InputLabel,
} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { localizationConstants } from '../../resources/theme/localizationConstants'
import CustomIcon from '../../components/CustomIcon'
import { iconConstants } from '../../resources/theme/iconConstants'
import useCommonStyles from '../../components/styles'
import { useDispatch, useSelector } from 'react-redux'
import {
	loginUser,
	toggleEyeIconClicked,
	updateEmail,
	updatePassword,
} from './loginSlice'
import { useLocation, useNavigate } from 'react-router-dom'
import { routePaths } from '../../routes/routeConstants'
import { emailRegex, history } from '../../utils/utils'
import { setAppPermissions } from '../dashboard/dasboardSlice'

const Login = () => {
	history.navigate = useNavigate()
	history.location = useLocation()

	const flexStyles = useCommonStyles()
	const { email, password, eyeIconClicked } = useSelector(
		(store) => store.login,
	)
	const dispatch = useDispatch()
	const navigate = useNavigate()

	const [isEmailValid, setIsEmailValid] = useState(false)

	const handleEmailFieldChange = (e) => {
		const value = e.target.value
		dispatch(updateEmail(value))
	}

	const handlePasswordFieldChange = (e) => {
		dispatch(updatePassword(e.target.value))
	}

	const handleLogin = async () => {
		const body = {
			email,
			password,
		}
		const res = await dispatch(loginUser({ body }))
		if (!res?.error) {
			dispatch(setAppPermissions(res?.payload?.data))
		}
	}

	const handleForgotPassword = () => {
		navigate(routePaths.accountRecovery)
	}

	const handleVisible = () => {
		eyeIconClicked
			? dispatch(toggleEyeIconClicked(false))
			: dispatch(toggleEyeIconClicked(true))
	}

	useEffect(() => {
		if (emailRegex.test(email) && password.length > 0) {
			setIsEmailValid(true)
		} else {
			setIsEmailValid(false)
		}
	}, [email, password])

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
					{localizationConstants.signIn}
				</Typography>
				<Typography
					variant="body1"
					sx={{
						pt: '8px',
						fontSize: { xs: '14px', sm: '15px' },
						color: '#6b7280',
						mb: { xs: '32px', sm: '40px' },
						textAlign: 'center',
						px: { xs: 1, sm: 0 },
					}}
				>
					Welcome back! Please enter your details.
				</Typography>
				<Box sx={{ width: '100%', maxWidth: '420px' }}>
					<Box sx={{ mb: { xs: 2, sm: 2.5 } }}>
						<InputLabel
							sx={{
								mb: 1,
								fontSize: { xs: '13px', sm: '14px' },
								fontWeight: 600,
								color: '#374151',
							}}
						>
							{localizationConstants.email}
						</InputLabel>
						<TextField
							fullWidth
							placeholder={localizationConstants.enterEmail}
							value={email}
							onChange={handleEmailFieldChange}
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
					<Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
						<InputLabel
							sx={{
								mb: 1,
								fontSize: { xs: '13px', sm: '14px' },
								fontWeight: 600,
								color: '#374151',
							}}
						>
							{localizationConstants.password}
						</InputLabel>
						<TextField
							fullWidth
							type={eyeIconClicked ? 'text' : 'password'}
							placeholder={localizationConstants.enterPassword}
							value={password}
							onChange={handlePasswordFieldChange}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											onClick={handleVisible}
											edge="end"
											sx={{ color: '#6b7280' }}
										>
											{eyeIconClicked ? (
												<Visibility fontSize="small" />
											) : (
												<VisibilityOff fontSize="small" />
											)}
										</IconButton>
									</InputAdornment>
								),
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
					<Typography
						variant="body2"
						sx={{
							color: '#667eea',
							cursor: 'pointer',
							mb: { xs: '24px', sm: '28px', md: '32px' },
							textAlign: 'right',
							fontSize: { xs: '13px', sm: '14px' },
							fontWeight: 600,
							'&:hover': {
								color: '#764ba2',
								textDecoration: 'underline',
							},
						}}
						onClick={handleForgotPassword}
					>
						{localizationConstants.forgotPassword}
					</Typography>
				</Box>

				<Button
					variant="contained"
					fullWidth
					onClick={handleLogin}
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
					{localizationConstants.login}
				</Button>
			</Box>
		)
	}

	return (
		<CustomAuthScreenLayout
			rightSideContent={rightSideContent(flexStyles)}
			leftSideTitle={localizationConstants.welcome}
			leftSideDescription={localizationConstants.welcomeMessage}
		/>
	)
}

export default Login
