import React, { useEffect, useState } from 'react'
import CustomAuthScreenLayout from '../../components/CustomAuthScreenLayout'
import { localizationConstants } from '../../resources/theme/localizationConstants'
import { Backdrop, Box, Typography } from '@mui/material'
import useCommonStyles from '../../components/styles'
import { typographyConstants } from '../../resources/theme/typographyConstants'
import CustomTextfield from '../../components/CustomTextField'
import CustomButton from '../../components/CustomButton'
import { useDispatch, useSelector } from 'react-redux'
import CustomIcon from '../../components/CustomIcon'
import {
	resetPassword,
	toggleNewPassConfirmEyeIconClicked,
	updateConfirmNewPassword,
	updateNewPassword,
	validateTokenCreateNewPassword,
} from '../login/loginSlice'
import { iconConstants } from '../../resources/theme/iconConstants'
import { history } from '../../utils/utils'
import { useLocation, useNavigate } from 'react-router-dom'
import {
	checkDigits,
	checkFullPassword,
	checkFullPasswordConfirm,
	checkLowercase,
	checkSpecialCharacter,
	checkUppercase,
} from './createNewPasswordFunctions'
import { routePaths } from '../../routes/routeConstants'

const CreateNewPassword = () => {
	const flexStyles = useCommonStyles()
	const dispatch = useDispatch()
	history.navigate = useNavigate()
	history.location = useLocation()

	const navigate = useNavigate()

	const {
		newPassConfirmEyeIconClicked,
		newPassword,
		confirmNewPassword,
		createNewPasswordExpired,
	} = useSelector((store) => store.login)

	const [createPassErrMsg, setCreatePassErrMsg] = useState('')

	const [isMinEightChars, setIsMinEightChars] = useState(false)
	const [isUpperCase, setIsUpperCase] = useState(false)
	const [isLowerCase, setIsLowerCase] = useState(false)
	const [isDigit, setIsDigit] = useState(false)
	const [isSpecialChar, setIsSpecialChar] = useState(false)
	const [isValidFullPass, setIsValidFullPass] = useState(false)
	const [isValidFullPassConfirm, setIsValidFullPassConfirm] = useState(false)
	const [isNewPassEyeIconOpen, setIsNewPassEyeIconOpen] = useState(false)
	const [isValid, setIsValid] = useState(false)

	const urlSearchParams = new URLSearchParams(window.location.search)
	const token = urlSearchParams.get('token')

	const handleConfirmNewPassVisible = () => {
		newPassConfirmEyeIconClicked
			? dispatch(toggleNewPassConfirmEyeIconClicked(false))
			: dispatch(toggleNewPassConfirmEyeIconClicked(true))
	}

	const handleNewPassword = (e) => {
		const newPassValue = e.target.value

		// Ensure the password is no longer than 30 characters
		if (newPassValue.length <= 30) {
			dispatch(updateNewPassword(newPassValue))
			checkUppercase(newPassValue, setIsUpperCase)
			checkLowercase(newPassValue, setIsLowerCase)
			checkDigits(newPassValue, setIsDigit)
			checkSpecialCharacter(newPassValue, setIsSpecialChar)
			setIsMinEightChars(newPassValue.length >= 8)
			checkFullPassword(newPassValue, setIsValidFullPass)
		} else {
			// Optionally show an error message or truncate the password to 30 characters
			setCreatePassErrMsg('Password cannot exceed 30 characters.')
		}
	}

	const handleConfirmNewPassword = (e) => {
		const newPassValue = e.target.value
		if (newPassValue.length <= 30) {
			setIsNewPassEyeIconOpen(false)
			dispatch(updateConfirmNewPassword(newPassValue))
			checkFullPasswordConfirm(newPassValue, setIsValidFullPassConfirm)
		} else {
			setCreatePassErrMsg('Password cannot exceed 30 characters.')
		}
	}

	const handleCreateNewPassword = () => {
		const body = {
			token: token,
			password: newPassword,
		}
		dispatch(resetPassword({ body }))
	}

	useEffect(() => {
		const body = {
			token: token,
		}
		dispatch(validateTokenCreateNewPassword({ body }))
	}, [])

	useEffect(() => {
		if (
			newPassword === confirmNewPassword ||
			confirmNewPassword.length === 0
		) {
			setIsValid(true)
			setCreatePassErrMsg('')
		} else {
			setIsValid(false)
			setCreatePassErrMsg(localizationConstants.passwordsAreNotMatching)
		}
	}, [newPassword, confirmNewPassword])

	const typoArray = [
		{
			id: 0,
			typoName: localizationConstants.aMinimumOfEightCharacters,
			validityCheck: isMinEightChars,
		},
		{
			id: 1,
			typoName: localizationConstants.atLeastOneUpperCase,
			validityCheck: isUpperCase,
		},
		{
			id: 2,
			typoName: localizationConstants.atLeastOneLowerCase,
			validityCheck: isLowerCase,
		},
		{
			id: 3,
			typoName: localizationConstants.atLeastOneDigit,
			validityCheck: isDigit,
		},
		{
			id: 4,
			typoName: localizationConstants.atLeastOneSpecialCharacter,
			validityCheck: isSpecialChar,
		},
	]

	const rightSideContent = () => {
		return (
			<Box>
				<Box className={flexStyles.flexCenter}>
					<CustomIcon
						name={iconConstants.myPeegu}
						style={{ width: '190px', height: '114px' }}
						svgStyle={'width: 190px; height: 114px'}
					/>
				</Box>
				<Typography
					variant={typographyConstants.h2}
					sx={{ textAlign: 'center', pt: '40px' }}
				>
					{localizationConstants.setupNewPassword}
				</Typography>
				<CustomTextfield
					labelText={localizationConstants.newPassword}
					labelTypoSx={{ pb: '5px', pt: '40px' }}
					placeholder={localizationConstants.enterNewPassword}
					type={isNewPassEyeIconOpen ? 'text' : 'password'}
					endIcon={
						isNewPassEyeIconOpen ? (
							<CustomIcon
								name={iconConstants.eye}
								style={{ cursor: 'pointer' }}
								onClick={() =>
									setIsNewPassEyeIconOpen(
										!isNewPassEyeIconOpen,
									)
								}
							/>
						) : (
							<CustomIcon
								name={iconConstants.eyeHidden}
								style={{ cursor: 'pointer' }}
								onClick={() =>
									setIsNewPassEyeIconOpen(
										!isNewPassEyeIconOpen,
									)
								}
							/>
						)
					}
					value={newPassword}
					onChange={handleNewPassword}
				/>
				<CustomTextfield
					labelText={localizationConstants.confirmNewPassword}
					labelTypoSx={{ pb: '5px', pt: '24px' }}
					placeholder={localizationConstants.enterNewPassword}
					type={newPassConfirmEyeIconClicked ? 'text' : 'password'}
					endIcon={
						newPassConfirmEyeIconClicked ? (
							<CustomIcon
								name={iconConstants.eye}
								style={{ cursor: 'pointer' }}
								onClick={handleConfirmNewPassVisible}
							/>
						) : (
							<CustomIcon
								name={iconConstants.eyeHidden}
								style={{ cursor: 'pointer' }}
								onClick={handleConfirmNewPassVisible}
							/>
						)
					}
					value={confirmNewPassword}
					onChange={handleConfirmNewPassword}
				/>
				<Typography
					variant={typographyConstants.h5}
					sx={{
						alignSelf: 'flex-end',
						pt: '8px',
						color: 'textColors.red',
					}}
				>
					{createPassErrMsg}
				</Typography>
				<Typography
					variant={typographyConstants.h5}
					sx={{ mt: '20px', fontWeight: 600 }}
				>
					{localizationConstants.passwordMustHave}
				</Typography>
				<Box className={flexStyles.flexColumn}>
					{typoArray.map((typo) => {
						return (
							<Box
								key={typo.id}
								className={flexStyles.flexRowAlignCenter}
							>
								{
									<CustomIcon
										name={
											typo.validityCheck &&
											newPassword.length > 0
												? iconConstants.tickCircle
												: newPassword.length > 0
													? iconConstants.alertCircle
													: ''
										}
										style={{
											height: '16px',
											width: '16px',
											marginRight: '8px',
										}}
										svgStyle={'height: 16px; width: 16px'}
									/>
								}
								<Typography
									variant={typographyConstants.h5}
									sx={{
										fontWeight: 400,
									}}
								>
									{typo.typoName}
								</Typography>
							</Box>
						)
					})}
				</Box>
				<CustomButton
					text={localizationConstants.submit}
					typoSx={{ fontWeight: '500', color: 'textColors.white' }}
					sx={{ mt: '38px' }}
					onClick={handleCreateNewPassword}
					disabled={
						!isValidFullPass || !isValidFullPassConfirm || !isValid
					}
				/>
				<Backdrop open={createNewPasswordExpired}>
					<Box
						sx={{
							backgroundColor: 'white',
							width: '580px',
							height: '460px',
							borderRadius: '20px',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<CustomIcon
							name={iconConstants.wireBroken}
							style={{ width: '133px', height: '86px' }}
							svgStyle={'width: 133px; height: 86px'}
						/>
						<Typography
							variant={typographyConstants.h4}
							sx={{ fontSize: '64px', mt: '60px' }}
						>
							{localizationConstants.uhOh}
						</Typography>
						<Typography
							variant={typographyConstants.h4}
							sx={{ mt: '15px' }}
						>
							{localizationConstants.yourPasswordResetLink}
						</Typography>
						<CustomButton
							text={localizationConstants.continue}
							typoSx={{
								fontWeight: '500',
								color: 'textColors.white',
							}}
							sx={{ mt: '20px', minWidth: '344px' }}
							onClick={() => navigate(routePaths.accountRecovery)}
						/>
					</Box>
				</Backdrop>
			</Box>
		)
	}

	return (
		<CustomAuthScreenLayout
			leftSideTitle={localizationConstants.createNewPassword}
			leftSideDescription={localizationConstants.createNewPasswordMessage}
			rightSideContent={rightSideContent()}
		/>
	)
}

export default CreateNewPassword
