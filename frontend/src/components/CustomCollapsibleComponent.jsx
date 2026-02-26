import React, { memo } from 'react'
import { customCollapseComponentSx } from './componentStyles'
import { iconConstants } from '../resources/theme/iconConstants'
import CustomIcon from './CustomIcon'
import { Box, Typography } from '@mui/material'
import { typographyConstants } from '../resources/theme/typographyConstants'
import useCommonStyles from './styles'

const CustomCollapsibleComponent = ({
	open,
	title,
	children,
	onClick,
	titleRightSide,
	titleSx,
}) => {
	const flexStyles = useCommonStyles()
	return (
		<Box sx={customCollapseComponentSx.containerSx}>
			<Box
				sx={
					open === false
						? customCollapseComponentSx.headerStyleFalse
						: customCollapseComponentSx.headerStyleTrue
				}
				onClick={onClick}
			>
				<Box className={flexStyles.flexRowAlignCenter}>
					{open === false ? (
						<CustomIcon
							name={iconConstants.caretSolidRight}
							style={{
								width: '16px',
								height: '16px',
							}}
							svgStyle={`width: 16px; height: 16px`}
						/>
					) : (
						<CustomIcon
							name={iconConstants.caretSolidDown}
							style={{
								width: '16px',
								height: '16px',
							}}
							svgStyle={`width: 16px; height: 16px`}
						/>
					)}
					<Typography
						variant={typographyConstants.body}
						sx={{
							color: 'textColors.blue',
							ml: '10px',
							...titleSx,
						}}
					>
						{title}
					</Typography>
				</Box>
				<Box>{titleRightSide}</Box>
			</Box>
			{open === true && <Box sx={{ p: '16px 20px' }}>{children}</Box>}
		</Box>
	)
}

export default memo(CustomCollapsibleComponent)
