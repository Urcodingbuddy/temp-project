import { memo } from 'react'
import { customCollapseComponentSx } from './componentStyles'
import { Box, Typography, Collapse } from '@mui/material'
import { typographyConstants } from '../resources/theme/typographyConstants'
import useCommonStyles from './styles'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

const SimpleCollapsibleComponent = ({
	open,
	title,
	children,
	onClick,
	titleSx,
	isBorderRequired = false,
}) => {
	const flexStyles = useCommonStyles()
	return (
		<Box
			sx={{
				...customCollapseComponentSx.smplContainerSx,
				borderRadius: isBorderRequired ? '8px' : undefined,
				border: isBorderRequired ? '1px solid' : undefined,
				borderColor: 'globalElementColors.grey5',
			}}
		>
			{/* Header */}
			<Box sx={customCollapseComponentSx.smplHeaderSx} onClick={onClick}>
				<Box
					className={flexStyles.flexRowCenterSpaceBetween}
					sx={{ width: '100%' }}
				>
					<Typography
						variant={typographyConstants.body2}
						sx={{
							color: 'textColors.black',
							ml: '10px',
							...titleSx,
						}}
					>
						{title}
					</Typography>
					<Box>
						{open ? (
							<KeyboardArrowUpIcon
								sx={{
									width: '28px',
									height: '28px',
									color: 'textColors.black',
								}}
							/>
						) : (
							<KeyboardArrowDownIcon
								sx={{
									width: '28px',
									height: '28px',
									color: 'textColors.black',
								}}
							/>
						)}
					</Box>
				</Box>
			</Box>

			{/* Animated Collapse Body */}
			<Collapse in={open} timeout='auto' unmountOnExit>
				<Box
					sx={{
						mt: '10px',
						padding: isBorderRequired ? '8px' : undefined,
					}}
				>
					{children}
				</Box>
			</Collapse>
		</Box>
	)
}

export default memo(SimpleCollapsibleComponent)
