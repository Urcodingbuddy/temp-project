import React, { memo } from 'react'
import { customCollapseComponentSx } from './componentStyles'
import { iconConstants } from '../resources/theme/iconConstants'
import CustomIcon from './CustomIcon'
import { Box } from '@mui/material'
import useCommonStyles from './styles'

const CollapsibleForGoals = ({
	open,
	title,
	children,
	onClick,
	titleRightSide,
	titleSx,
}) => {
	const flexStyles = useCommonStyles()
	return (
		<Box
			sx={{
				...customCollapseComponentSx.containerSx,
				width: '100%',
				borderColor: 'globalElementColors.lightBlue2',
			}}
		>
			<Box
				sx={
					open === false
						? {
								...customCollapseComponentSx.headerStyleFalse,
								width: '100%',
								height: '50px',
								borderColor: 'globalElementColors.borderBlue',
								backgroundColor: '#F8FCFF',
							}
						: {
								...customCollapseComponentSx.headerStyleTrue,
								width: '100%',
								height: '50px',
								borderBottom: '1px solid',
								borderColor: 'globalElementColors.borderBlue',
								backgroundColor: '#F8FCFF',
							}
				}
				onClick={onClick}
			>
				<Box className={flexStyles.flexRowAlignCenter}>
					<Box>{title}</Box>
				</Box>
				<Box>
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
				</Box>
			</Box>
			{open === true && <Box sx={{ p: '16px 20px' }}>{children}</Box>}
		</Box>
	)
}

export default memo(CollapsibleForGoals)
