import useCommonStyles from './styles'
import { Box, Grid, Typography } from '@mui/material'
import { typographyConstants } from '../resources/theme/typographyConstants'
import CustomIcon from './CustomIcon'
import { iconConstants } from '../resources/theme/iconConstants'
import { commonComponentStyles } from './commonComponentStyles'

const CustomAuthScreenLayout = ({
	rightSideContent,
	leftSideTitle,
	leftSideDescription,
}) => {
	const flexStyles = useCommonStyles()
	return (
		<Grid container>
			<Grid item xs={0} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
				<Box
					className={flexStyles.flexColumnJustifyContentCenter}
					sx={commonComponentStyles.leftSideSX}
				>
					<Typography
						variant={typographyConstants.h1}
						sx={{
							color: 'textColors.white',
							pb: '30px',
							letterSpacing: '1px',
						}}
					>
						{leftSideTitle}
					</Typography>
					<Typography
						variant={typographyConstants.h4}
						sx={{
							minWidth: '200px',
							maxWidth: '641px',
							color: 'textColors.white2',
						}}
					>
						{leftSideDescription}
					</Typography>
				</Box>
			</Grid>
			<Grid item xs={12} md={6}>
				<Box
					className={flexStyles.flexColumnCenterCenter}
					sx={{
						height: '100vh',
						overflow: 'auto',
						pt: { xs: '80px', md: '150px' },
						pb: { xs: '30px', md: '50px' },
					}}
				>
					{rightSideContent}
				</Box>
			</Grid>
		</Grid>
	)
}

export default CustomAuthScreenLayout
