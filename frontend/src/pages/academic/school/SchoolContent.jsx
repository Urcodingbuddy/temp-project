import { Box } from '@mui/material'
import React, { useEffect, memo } from 'react'
import { Grid, Card, Typography } from '@mui/material'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import SchoolIcon from '@mui/icons-material/School'
import ClassIcon from '@mui/icons-material/Class'
import GroupsIcon from '@mui/icons-material/Groups'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import useCommonStyles from '../../../components/styles'
import { SchoolsStyles } from './SchoolsStyles'
import { useSelector, useDispatch } from 'react-redux'
import { getDashboardData } from '../../dashboard/dasboardSlice'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '../../../routes/routeConstants'

const SchoolContent = () => {
	const flexStyles = useCommonStyles()
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const { dashboardData } = useSelector((store) => store.dashboardSliceSetup)
	const data = [
		{
			id: 1,
			localizationConstants: localizationConstants.totalCounsellors,
			backgroundColor: 'cardColors.green',
			icon: SupportAgentIcon,
			number: dashboardData?.totalCounselors,
			onClick: () => navigate(routePaths.counsellors),
		},
		{
			id: 2,
			localizationConstants: localizationConstants.activeSchools,
			backgroundColor: 'cardColors.red2',
			icon: SchoolIcon,
			number: dashboardData?.activeSchools,
			onClick: () => navigate(routePaths.academicSchools),
		},
		{
			id: 3,
			localizationConstants: localizationConstants.totalClasses,
			backgroundColor: 'cardColors.purple',
			icon: ClassIcon,
			number: dashboardData?.totalClasses,
			onClick: () => navigate(routePaths.academicClassrooms),
		},
		{
			id: 4,
			localizationConstants: localizationConstants.totalStudents,
			backgroundColor: 'cardColors.blue3',
			icon: GroupsIcon,
			number: dashboardData?.totalStudents,
			onClick: () => navigate(routePaths.academicStudents),
		},
	]

	useEffect(() => {
		dispatch(getDashboardData())
	}, [dispatch])

	const cardList = data.map((item) => {
		const IconComponent = item.icon
		return (
			<Grid item xs={3} key={item.id}>
				<Card
					sx={{
						...SchoolsStyles.cardSx,
						backgroundColor: item.backgroundColor,
						cursor: 'pointer',
					}}
					onClick={item?.onClick}
				>
					<Box
						sx={{
							width: '100%',
							height: '100%',
							px: 2,
							py: 1.5,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
						}}
					>
						<Box>
							<Typography sx={SchoolsStyles.eclipseSx}>
								{item.localizationConstants}
							</Typography>
							<Typography sx={SchoolsStyles.numberSX}>
								{item.number}
							</Typography>
						</Box>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								width: '44px',
								height: '44px',
								borderRadius: '50%',
								backgroundColor: 'rgba(255,255,255,0.2)',
							}}
						>
							<IconComponent
								sx={{
									fontSize: '24px',
									color: 'rgba(255,255,255,0.9)',
								}}
							/>
						</Box>
					</Box>
				</Card>
			</Grid>
		)
	})
	return (
		<Box>
			<Grid container spacing={2} sx={{ mb: '14px' }}>
				{cardList}
			</Grid>
		</Box>
	)
}

export default memo(SchoolContent)
