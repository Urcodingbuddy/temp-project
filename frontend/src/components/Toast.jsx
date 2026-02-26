import React, { useEffect, useState } from 'react'
import { Box, Card, Typography, IconButton, Snackbar } from '@mui/material'
import CustomIcon from './CustomIcon'
import Slide from '@mui/material/Slide'
import { useTranslation } from 'react-i18next'

import useCommonStyles from './styles'
import { useDispatch } from 'react-redux'
import { iconConstants } from '../resources/theme/iconConstants'
import { typographyConstants } from '../resources/theme/typographyConstants'
import { updateShowToast } from '../toast/toastSlice'
import { commonComponentStyles } from './commonComponentStyles'

const Toast = ({ title, subTitle, isSuccess, direction = 'right' }) => {
	const showSuccess = isSuccess ?? true
	const flexStyles = useCommonStyles()
	const dispatch = useDispatch()
	const { t } = useTranslation()
	const [open, setOpen] = useState(true)

	const handleClose = (event, reason) => {
		if (reason === 'clickaway') {
			return
		}
		setOpen(false)
	}

	useEffect(() => {
		const timer = setInterval(() => {
			dispatch(updateShowToast(false))
		}, 3000)

		return () => clearInterval(timer)
	}, [])

	const CommonIcon = ({ name }) => {
		return (
			<CustomIcon
				name={name}
				style={{ height: '36px', width: '36px' }}
				svgStyle={'height: 36px; width: 36px'}
			/>
		)
	}

	return (
		<Snackbar
			open={open}
			anchorOrigin={{ vertical: 'bottom', horizontal: direction }}
			autoHideDuration={3000}
			onClose={handleClose}
			TransitionComponent={Slide}
		>
			<Card
				sx={commonComponentStyles.toastCardSX}
				className={flexStyles.flexRowCenterSpaceBetween}
			>
				<Box className={flexStyles.flexColumnCenter}>
					{showSuccess ? (
						<CustomIcon name={iconConstants.toastSuccess} />
					) : (
						<CustomIcon name={iconConstants.toastError} />
					)}
				</Box>
				<Box
					sx={{
						width: '100%',
						ml: '23px',
					}}
					className={flexStyles.flexRowAlignCenter}
				>
					{title && (
						<Typography
							variant={typographyConstants.h6}
							sx={commonComponentStyles.toastTitleSX}
						>
							{t(title)}
						</Typography>
					)}
					{subTitle && (
						<Typography
							variant={typographyConstants.body}
							sx={{
								...commonComponentStyles.toastSubTitleSX,
								mt: title ? '6px' : 0,
							}}
						>
							{t(
								typeof subTitle === 'string'
									? subTitle
									: subTitle[0]?.errors?.classroom,
							)}
						</Typography>
					)}
				</Box>
				<Box sx={{ ml: '13px' }}>
					<Box className={flexStyles.flexColumnCenter}>
						<IconButton size='small' onClick={handleClose}>
							<CommonIcon name={iconConstants.closeCircle} />
						</IconButton>
					</Box>
				</Box>
			</Card>
		</Snackbar>
	)
}

export default Toast
