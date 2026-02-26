import React, { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CustomIcon from '../../components/CustomIcon'
import { iconConstants } from '../../resources/theme/iconConstants'
import { localizationConstants } from '../../resources/theme/localizationConstants'
import { typographyConstants } from '../../resources/theme/typographyConstants'
import useCommonStyles from '../../components/styles'
import { Avatar, Popover } from '@mui/material'
import { addUserToLocalStorage, isCounsellor } from '../../utils/utils'
import CustomButton from '../../components/CustomButton'
import { useDispatch } from 'react-redux'
import { logoutUser } from '../login/loginSlice'
import {
	setAppPermissions,
	updateProfileData,
} from '../dashboard/dasboardSlice'
import { uploadImageToS3Bucket } from '../../utils/uploadToS3Bucket'
import { profileSx } from './ProfileStyles'
import { userRoles } from '../../utils/globalConstants'

const testInvalid = ['', null, undefined]
const Profile = ({ user }) => {
	const flexStyles = useCommonStyles()
	const dispatch = useDispatch()
	const inputRef = useRef()
	const [profilePic, setProfilePic] = useState('')

	const [anchorEl, setAnchorEl] = useState(null)
	const open = Boolean(anchorEl)
	const id = open ? 'simple-popover' : undefined

	const handlePopover = (e) => {
		setAnchorEl(e.currentTarget)
	}

	const handleClose = () => {
		setAnchorEl(null)
	}

	const handleLogout = () => {
		dispatch(logoutUser())
		dispatch({ type: 'logout' })
	}

	const handleProfilePic = (e) => {
		const file = e.target.files[0]
		if (file) {
			if (file.type.startsWith('image/')) {
				setProfilePic(file)
			} else {
				window.alert('Please select a valid image file.')
				e.target.value = ''
			}
		}
	}
	const updateProfilePic = async () => {
		const filename = Date.now() + profilePic?.name
		let s3Link = await dispatch(
			updateProfileData({
				body: { profilePicture: filename },
				saveUser: false,
			}),
		)
		s3Link = s3Link?.payload?.s3link
		await uploadImageToS3Bucket(s3Link, profilePic)
		const response = await dispatch(
			updateProfileData({
				body: { profilePicture: filename },
				saveUser: true,
			}),
		)

		if (!response?.error) {
			setProfilePic(response?.payload?.profile?.profilePictureUrl)
			setTimeout(() => {
				handleClose()
				addUserToLocalStorage(response?.payload)
				dispatch(setAppPermissions(response?.payload))
			}, 1000)
		}
	}

	useEffect(() => {
		user?.profile?.profilePictureUrl &&
			!open &&
			setProfilePic(user?.profile?.profilePictureUrl)
	}, [open])

	const getRoles = () => {
		const permission = user?.permissions?.[0]
		let role
		switch (permission) {
			case userRoles.admin:
				role = localizationConstants.admin
				break
			case userRoles.superAdmin:
				role = localizationConstants.superAdminn
				break
			case userRoles.peeguCounselor:
				role = localizationConstants.mypeeguCounsellor
				break
			case userRoles.scCounselor:
				role = localizationConstants.schoolCounsellorr
				break
			case userRoles.teacher:
				role = localizationConstants.teacher
				break
			case userRoles.scPrincipal:
				role = localizationConstants.pricipal
				break
			default:
				role = undefined // or some fallback like localizationConstants.unknown
		}

		return role
	}

	return (
		<>
			<Box
				className={flexStyles.flexRowAlignCenter}
				sx={{ cursor: 'pointer', gap: '8px' }}
				onClick={handlePopover}
			>
				{!testInvalid.includes(profilePic) ? (
					<Avatar
						src={
							typeof profilePic === 'string'
								? profilePic
								: URL.createObjectURL(profilePic)
						}
						sx={{ width: '40px', height: '40px' }}
					></Avatar>
				) : (
					<Avatar sx={{ width: '40px', height: '40px' }}>
						{user?.profile?.fullName?.toUpperCase()}
					</Avatar>
				)}
				<Typography
					variant={typographyConstants.h5}
					sx={profileSx.userRoleText}
				>
					{user?.profile?.fullName}
				</Typography>
				<CustomIcon
					name={iconConstants.arrowDownBlue}
					style={{ width: '20px', height: '20px' }}
					svgStyle={'width: 20px; height: 20px'}
				/>
			</Box>
			<Popover
				id={id}
				open={open}
				anchorEl={anchorEl}
				onClose={handleClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
				slotProps={{
					paper: {
						elevation: 3,
						sx: {
							mt: 1.5,
							borderRadius: '12px',
							overflow: 'visible',
							'&::before': {
								content: '""',
								display: 'block',
								position: 'absolute',
								top: 0,
								right: 20,
								width: 10,
								height: 10,
								bgcolor: 'background.paper',
								transform: 'translateY(-50%) rotate(45deg)',
								zIndex: 0,
							},
						},
					},
				}}
			>
				<Box
					sx={{
						width: '280px',
						borderRadius: '12px',
						overflow: 'hidden',
					}}
				>
					{/* Header section with gradient background */}
					<Box
						sx={{
							background:
								'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
							pt: 3,
							pb: 4,
							px: 3,
							textAlign: 'center',
							position: 'relative',
						}}
					>
						<Box
							sx={{
								position: 'relative',
								display: 'inline-block',
								cursor: 'pointer',
							}}
						>
							{!testInvalid.includes(profilePic) ? (
								<Avatar
									src={
										typeof profilePic === 'string'
											? profilePic
											: URL.createObjectURL(profilePic)
									}
									sx={{
										width: '72px',
										height: '72px',
										border: '3px solid white',
										boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
									}}
								></Avatar>
							) : (
								<Avatar
									sx={{
										width: '72px',
										height: '72px',
										border: '3px solid white',
										boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
										bgcolor: '#fff',
										color: '#667eea',
										fontSize: '24px',
										fontWeight: 600,
									}}
								>
									{user?.profile?.fullName?.charAt(0)?.toUpperCase()}
								</Avatar>
							)}
							<Box
								sx={{
									position: 'absolute',
									bottom: 0,
									right: -4,
									width: '28px',
									height: '28px',
									borderRadius: '50%',
									bgcolor: 'white',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
									cursor: 'pointer',
									transition: 'transform 0.2s',
									'&:hover': {
										transform: 'scale(1.1)',
									},
								}}
								onClick={() => inputRef.current.click()}
							>
								<CustomIcon
									name={iconConstants.editPencilBlue}
									style={{
										width: '16px',
										height: '16px',
									}}
									svgStyle={'width: 16px; height: 16px'}
								/>
							</Box>
						</Box>
					</Box>

					{/* Content section */}
					<Box
						sx={{
							bgcolor: 'white',
							px: 3,
							pt: 2,
							pb: 3,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
						}}
					>
						{/* User name */}
						<Typography
							sx={{
								fontWeight: 600,
								textAlign: 'center',
								mb: 0.5,
								color: '#1a202c',
							}}
							variant={typographyConstants.h5}
						>
							{user?.profile?.fullName}
						</Typography>

						{/* User ID (if not counsellor) */}
						{!isCounsellor() && (
							<Typography
								sx={{
									textAlign: 'center',
									fontSize: '13px',
									color: '#718096',
									mb: 0.5,
								}}
								variant={typographyConstants.body}
							>
								ID: {user?.profile?.user_id}
							</Typography>
						)}

						{/* Email */}
						<Typography
							variant={typographyConstants.body}
							sx={{
								textAlign: 'center',
								fontSize: '13px',
								color: '#718096',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
								maxWidth: '100%',
								mb: 1.5,
							}}
						>
							{user?.profile?.email}
						</Typography>

						{/* Role badge */}
						<Box
							sx={{
								bgcolor: '#EBF4FF',
								color: '#3182CE',
								px: 2,
								py: 0.5,
								borderRadius: '16px',
								fontSize: '13px',
								fontWeight: 500,
								mb: 2,
							}}
						>
							{getRoles()}
						</Box>

						{/* Logout/Save button */}
						{profilePic === user?.profile?.profilePictureUrl ||
						testInvalid.includes(profilePic) ? (
							<CustomButton
								sx={profileSx.logoutBtn}
								text={localizationConstants.logout}
								typoVariant={typographyConstants.body}
								onClick={handleLogout}
							/>
						) : (
							<CustomButton
								sx={profileSx.saveBtn}
								text={localizationConstants.save}
								typoVariant={typographyConstants.body}
								onClick={updateProfilePic}
							/>
						)}
					</Box>
				</Box>
			</Popover>
			<input
				type='file'
				ref={inputRef}
				style={{ display: 'none' }}
				accept='image/*'
				onChange={handleProfilePic}
			/>
		</>
	)
}

export default Profile
