import { Box, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { typographyConstants } from '../../resources/theme/typographyConstants'
import { localizationConstants } from '../../resources/theme/localizationConstants'
import CustomTextfield from '../../components/CustomTextField'
import { iconConstants } from '../../resources/theme/iconConstants'
import useCommonStyles from '../../components/styles'
import CustomIcon from '../../components/CustomIcon'
import CustomButton from '../../components/CustomButton'
import CustomAuthScreenLayout from '../../components/CustomAuthScreenLayout'
import { useDispatch, useSelector } from 'react-redux'
import {
	activateAccount,
	toggleConfirmActivationPasswordEyeIconClicked,
	toggleNewPasswordEyeIconClicked,
	updateActivationPassword,
	updateConfirmActivationPassword,
	validateTokenActivateAccount,
} from '../login/loginSlice'
import {
	checkDigits,
	checkFullPassword,
	checkFullPasswordConfirm,
	checkLowercase,
	checkSpecialCharacter,
	checkUppercase,
} from '../createNewPassword/createNewPasswordFunctions'
import { history } from '../../utils/utils'
import { useLocation, useNavigate } from 'react-router-dom'
import { routePaths } from '../../routes/routeConstants'

const ActivateAccount = () => {
	const flexStyles = useCommonStyles()
	const dispatch = useDispatch()
	history.navigate = useNavigate()
	history.location = useLocation()
	const navigate = useNavigate()

	const {
		activationPassword,
		confirmActivationPassword,
		confirmActivationPasswordEyeIconClicked,
		activateAccountExpired,
		newPasswordEyeIconClicked,
	} = useSelector((store) => store.login)

	const [isMinEightChars, setIsMinEightChars] = useState(false)
	const [isUpperCase, setIsUpperCase] = useState(false)
	const [isLowerCase, setIsLowerCase] = useState(false)
	const [isDigit, setIsDigit] = useState(false)
	const [isSpecialChar, setIsSpecialChar] = useState(false)
	const [isValidFullPass, setIsValidFullPass] = useState(false)
	const [isValidFullPassConfirm, setIsValidFullPassConfirm] = useState(false)
	const [createPassErrMsg, setCreatePassErrMsg] = useState('')
	const [isValid, setIsValid] = useState(false)

	const urlSearchParams = new URLSearchParams(window.location.search)
	const token = urlSearchParams.get('token')

	const handleConfirmNewPassVisible = () => {
		confirmActivationPasswordEyeIconClicked
			? dispatch(toggleConfirmActivationPasswordEyeIconClicked(false))
			: dispatch(toggleConfirmActivationPasswordEyeIconClicked(true))
	}
	const handleNewPassVisible = () => {
		newPasswordEyeIconClicked
			? dispatch(toggleNewPasswordEyeIconClicked(false))
			: dispatch(toggleNewPasswordEyeIconClicked(true))
	}

	const handleActivationPassword = (e) => {
		const value = e.target.value
		dispatch(updateActivationPassword(value))
		checkUppercase(value, setIsUpperCase)
		checkLowercase(value, setIsLowerCase)
		checkDigits(value, setIsDigit)
		checkSpecialCharacter(value, setIsSpecialChar)
		value.length > 8 ? setIsMinEightChars(true) : setIsMinEightChars(false)
		checkFullPassword(value, setIsValidFullPass)
	}

	const handleConfirmActivationPassword = (e) => {
		dispatch(updateConfirmActivationPassword(e.target.value))
		checkFullPasswordConfirm(e.target.value, setIsValidFullPassConfirm)
	}

	const handleActivateAccount = () => {
		const body = {
			token: token,
			password: activationPassword,
		}
		dispatch(activateAccount({ body }))
	}

	useEffect(() => {
		if (
			activationPassword === confirmActivationPassword ||
			confirmActivationPassword.length === 0
		) {
			setIsValid(true)
			setCreatePassErrMsg('')
		} else {
			setIsValid(false)
			setCreatePassErrMsg(localizationConstants.passwordsAreNotMatching)
		}
	}, [activationPassword, confirmActivationPassword])

	useEffect(() => {
		const body = {
			token: token,
		}
		dispatch(validateTokenActivateAccount({ body }))
	}, [])

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
				{activateAccountExpired ? (
					<Box className={flexStyles.flexColumnCenterCenter}>
						<Typography
							variant={typographyConstants.h2}
							sx={{ fontSize: '60px', color: 'textColors.blue2' }}
						>
							{localizationConstants.oops}
						</Typography>
						<CustomIcon
							name={iconConstants.linkExpired}
							style={{
								width: '86px',
								height: '74px',
								marginTop: '42px',
							}}
						/>
						<Typography
							variant={typographyConstants.h3}
							sx={{
								mt: '25px',
								fontSize: '25px',
								fontWeight: '500',
								color: 'textColors.red',
							}}
						>
							{localizationConstants.linkIsExpired}
						</Typography>
						<Typography
							variant={typographyConstants.h4}
							sx={{ mt: '32px', color: 'textColors.grey1' }}
						>
							{
								localizationConstants.pleaseContactYourAdministratorToGetLink
							}
						</Typography>
						<Typography
							variant={typographyConstants.h4}
							sx={{ mt: '20px', color: 'textColors.grey1' }}
						>
							{localizationConstants.or}
						</Typography>
						<Typography
							variant={typographyConstants.body2}
							sx={{
								color: 'textColors.blue',
								cursor: 'pointer',
								mt: '20px',
							}}
							onClick={() => navigate(routePaths.login)}
						>
							{localizationConstants.loginQuestion}
						</Typography>
					</Box>
				) : (
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
							{localizationConstants.activateAccount}
						</Typography>
						<CustomTextfield
							labelText={localizationConstants.newPassword}
							labelTypoSx={{ pb: '5px', pt: '40px' }}
							placeholder={localizationConstants.enterNewPassword}
							// type='password'
							type={
								newPasswordEyeIconClicked ? 'text' : 'password'
							}
							endIcon={
								newPasswordEyeIconClicked ? (
									<CustomIcon
										name={iconConstants.eye}
										style={{ cursor: 'pointer' }}
										onClick={handleNewPassVisible}
									/>
								) : (
									<CustomIcon
										name={iconConstants.eyeHidden}
										style={{ cursor: 'pointer' }}
										onClick={handleNewPassVisible}
									/>
								)
							}
							value={activationPassword}
							onChange={handleActivationPassword}
						/>
						<CustomTextfield
							labelText={localizationConstants.confirmNewPassword}
							labelTypoSx={{ pb: '5px', pt: '24px' }}
							placeholder={localizationConstants.enterNewPassword}
							type={
								confirmActivationPasswordEyeIconClicked
									? 'text'
									: 'password'
							}
							endIcon={
								confirmActivationPasswordEyeIconClicked ? (
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
							value={confirmActivationPassword}
							onChange={handleConfirmActivationPassword}
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
										className={
											flexStyles.flexRowAlignCenter
										}
									>
										{
											<CustomIcon
												name={
													typo.validityCheck &&
													activationPassword.length >
														0
														? iconConstants.tickCircle
														: activationPassword.length >
															  0
															? iconConstants.alertCircle
															: ''
												}
												style={{
													height: '16px',
													width: '16px',
													marginRight: '8px',
												}}
												svgStyle={
													'height: 16px; width: 16px'
												}
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
							typoSx={{
								fontWeight: '500',
								color: 'textColors.white',
							}}
							sx={{ mt: '38px' }}
							onClick={handleActivateAccount}
							disabled={
								!isValidFullPass ||
								!isValidFullPassConfirm ||
								!isValid
							}
						/>
					</Box>
				)}
			</Box>
		)
	}

	return (
		<CustomAuthScreenLayout
			leftSideTitle={localizationConstants.activateYourAccount}
			leftSideDescription={localizationConstants.welcomeAdmin}
			rightSideContent={rightSideContent()}
		/>
	)
}

export default ActivateAccount
