import { Box } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Grid, Card, Typography, Button } from '@mui/material'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import SchoolIcon from '@mui/icons-material/School'
import ClassIcon from '@mui/icons-material/Class'
import GroupsIcon from '@mui/icons-material/Groups'
import CustomIcon from '../../components/CustomIcon'
import { iconConstants } from '../../resources/theme/iconConstants'
import { typographyConstants } from '../../resources/theme/typographyConstants'
import { localizationConstants } from '../../resources/theme/localizationConstants'
import useCommonStyles from '../../components/styles'
import { getUserFromLocalStorage, isCounsellor } from '../../utils/utils'
import { dashboardStyles } from './DashboardStyles'
import { useSelector, useDispatch } from 'react-redux'
import { getDashboardData } from '../dashboard/dasboardSlice'
import { isAdmin } from '../../utils/utils'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '../../routes/routeConstants'
import CustomButton from '../../components/CustomButton'
import UploadSelModuleDialog from '../initiations/SELCurriculumTracker/UploadSelModuleDialog'
import { userRoles } from '../../utils/globalConstants'

const DashboardContent = () => {
	const user = getUserFromLocalStorage()
	const flexStyles = useCommonStyles()
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const { hasRequiredPermission, dashboardData } = useSelector(
		(store) => store.dashboardSliceSetup,
	)
	const [openSelDialodg, setOpenSelDialog] = useState(false)

	const counsellorData = [
		{
			id: 1,
			localizationConstants: localizationConstants.schoolAssigned,
			backgroundColor: 'cardColors.green',
			icon: SchoolIcon,
			number: dashboardData?.assignedSchools,
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

	const superAdmin = user.permissions[0] === userRoles.superAdmin

	const counsellorList = counsellorData.map((item) => {
		const IconComponent = item.icon
		return (
			<Grid item xs={4} key={item.id}>
				<Card
					sx={{
						...dashboardStyles.cardSx,
						backgroundColor: item.backgroundColor,
						position: 'relative',
						cursor: 'pointer',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
						overflow: 'hidden',
					}}
					onClick={item?.onClick}
				>
					<Box
						sx={{
							position: 'relative',
							zIndex: 2,
							px: 2,
							py: 1.5,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							height: '100%',
						}}
					>
						<Box>
							<Typography sx={dashboardStyles.eclipseSx}>
								{item.localizationConstants}
							</Typography>
							<Typography sx={dashboardStyles.numberSX}>
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
						...dashboardStyles.cardSx,
						backgroundColor: item.backgroundColor,
						position: 'relative',
						cursor: 'pointer',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
						overflow: 'hidden',
					}}
					onClick={item?.onClick}
				>
					<Box
						sx={{
							position: 'relative',
							zIndex: 2,
							px: 2,
							py: 1.5,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							height: '100%',
						}}
					>
						<Box>
							<Typography sx={dashboardStyles.eclipseSx}>
								{item.localizationConstants}
							</Typography>
							<Typography sx={dashboardStyles.numberSX}>
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
		<Box sx={{ minWidth: '700px' }}>
			<Card sx={dashboardStyles.cardMainSx}>
				<Box
					sx={{
						p: '20px 24px',
						display: 'flex',
						alignItems: 'center',
						flex: 1,
					}}
				>
					<Box sx={{ mr: 2.5 }}>
						<CustomIcon
							name={iconConstants.dashboardHeaderImage}
							style={{ opacity: 0.9, width: '56px', height: '56px' }}
							svgStyle={'width: 56px; height: 56px'}
						/>
					</Box>
					<Box>
						<Typography
							sx={{
								fontSize: '22px',
								fontWeight: 600,
								color: '#FFFFFF',
								mb: 0.5,
								lineHeight: 1.3,
							}}
						>
							{localizationConstants.hi +
								' ' +
								user?.profile?.fullName}
						</Typography>
						<Typography
							sx={{
								fontSize: '14px',
								fontWeight: 400,
								color: 'rgba(255, 255, 255, 0.85)',
								lineHeight: 1.4,
							}}
						>
							{isAdmin()
								? localizationConstants.trackAndManage
								: isCounsellor()
									? localizationConstants.fuelCouncelor
									: user?.profile?.schoolOfTeacher}
						</Typography>
					</Box>
				</Box>
			</Card>
			<Grid container spacing={3} sx={{ mt: 0 }}>
				{!hasRequiredPermission
					? isCounsellor()
						? counsellorList
						: ''
					: cardList}
			</Grid>

			{isCounsellor() && (
				<>
					<Card sx={dashboardStyles.cardBaselineAnalytics}>
						<Box
							sx={{
								position: 'relative',
								width: '100%',
								height: '100%',
								overflow: 'hidden',
							}}
						>
							{/* Background decorative elements */}
							<Box
								sx={{
									position: 'absolute',
									top: -20,
									left: -20,
									opacity: 0.08,
									zIndex: 0,
								}}
							>
								<CustomIcon
									name={iconConstants.eclipseBlueStart}
									style={{ height: '80px', width: '80px' }}
									svgStyle={'width:80px;height:80px;'}
								/>
							</Box>
							<Box
								sx={{
									position: 'absolute',
									bottom: -20,
									right: -20,
									opacity: 0.08,
									zIndex: 0,
								}}
							>
								<CustomIcon
									name={iconConstants.eclipseBlueEnd}
									style={{ height: '70px', width: '70px' }}
									svgStyle={'width:70px;height:70px;'}
								/>
							</Box>

							{/* Main content */}
							<Box
								sx={{
									position: 'relative',
									zIndex: 1,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									p: 2.5,
									height: '100%',
								}}
							>
								<Box sx={{ flex: 1, maxWidth: '450px' }}>
									<Typography
										sx={{
											fontSize: '20px',
											fontWeight: 600,
											color: '#1A202C',
											mb: 0.5,
											lineHeight: 1.3,
										}}
									>
										Explore Baseline Analytics
									</Typography>
									<Typography
										sx={{
											fontSize: '13px',
											fontWeight: 400,
											color: '#64748B',
											mb: 2,
											lineHeight: 1.5,
										}}
									>
										Gain insights into student performance and track progress
									</Typography>
									<Button
										variant="contained"
										onClick={() =>
											navigate(
												routePaths.initiationsBaselineAnalyticsReport,
												{
													state: {
														analytics: true,
													},
												},
											)
										}
										sx={{
											background:
												'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
											color: '#FFFFFF',
											textTransform: 'none',
											fontSize: '13px',
											py: 0.75,
											px: 2.5,
											boxShadow:
												'0 2px 8px rgba(102, 126, 234, 0.25)',
											'&:hover': {
												background:
													'linear-gradient(135deg, #5568d3 0%, #63397d 100%)',
												boxShadow:
													'0 4px 12px rgba(102, 126, 234, 0.35)',
												transform: 'translateY(-1px)',
											},
											transition: 'all 0.2s ease',
										}}
									>
										View Analytics
									</Button>
								</Box>
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										opacity: 0.9,
									}}
								>
									<CustomIcon
										name={iconConstants.groupBaseline}
										style={{ height: '120px', width: 'auto' }}
									/>
								</Box>
							</Box>
						</Box>
					</Card>
					<Box
						className={flexStyles?.flexRowCenterSpaceBetween}
						sx={{ width: '100%', mt: '16px', gap: 2 }}
					>
						<Card
							sx={{
								...dashboardStyles?.studentCoPeCardSSx(
									superAdmin,
								),
							}}
						>
							<Box
								sx={{
									position: 'relative',
									overflow: 'hidden',
									height: '100%',
								}}
							>
								{/* Background gradient accent */}
								<Box
									sx={{
										position: 'absolute',
										top: 0,
										left: 0,
										right: 0,
										height: '4px',
										background:
											'linear-gradient(90deg, #10B981 0%, #059669 100%)',
									}}
								/>
								{/* Background icon */}
								<Box
									sx={{
										position: 'absolute',
										bottom: -20,
										right: -20,
										opacity: 0.08,
										zIndex: 0,
									}}
								>
									<CustomIcon
										name={iconConstants.dashboardBook}
										style={{
											height: '160px',
											width: '160px',
										}}
										svgStyle={'width:160px;height:160px;'}
									/>
								</Box>

								<Box
									sx={{
										position: 'relative',
										zIndex: 1,
										display: 'flex',
										flexDirection: 'column',
										justifyContent: 'space-between',
										p: 3,
										height: '100%',
									}}
								>
									<Box>
										<Box
											sx={{
												display: 'inline-block',
												bgcolor: '#ECFDF5',
												color: '#059669',
												px: 1.5,
												py: 0.5,
												borderRadius: '6px',
												fontSize: '12px',
												fontWeight: 600,
												mb: 2,
											}}
										>
											STUDENT ANALYTICS
										</Box>
										<Typography
											sx={{
												fontSize: '22px',
												fontWeight: 700,
												color: '#1A202C',
												mb: 1,
												lineHeight: 1.2,
											}}
										>
											COPE Analytics Report
										</Typography>
										<Typography
											sx={{
												fontSize: '14px',
												fontWeight: 400,
												color: '#64748B',
												mb: 3,
												lineHeight: 1.5,
											}}
										>
											View comprehensive COPE assessment results
										</Typography>
									</Box>

									<Button
										onClick={() =>
											navigate(
												routePaths.schoolCOPEAnalyticsReport,
												{
													state: {
														analytics: true,
													},
												},
											)
										}
										variant="contained"
										fullWidth
										sx={{
											bgcolor: '#10B981',
											color: '#FFFFFF',
											textTransform: 'none',
											boxShadow:
												'0 2px 6px rgba(16, 185, 129, 0.25)',
											'&:hover': {
												bgcolor: '#059669',
												boxShadow:
													'0 4px 10px rgba(16, 185, 129, 0.35)',
												transform: 'translateY(-1px)',
											},
											transition: 'all 0.2s ease',
										}}
									>
										View Report
									</Button>
								</Box>
							</Box>
						</Card>
						<Card
							sx={{
								...dashboardStyles?.studentCoPeCardSSx(
									superAdmin,
								),
							}}
						>
							<Box
								sx={{
									position: 'relative',
									overflow: 'hidden',
									height: '100%',
								}}
							>
								{/* Background gradient accent */}
								<Box
									sx={{
										position: 'absolute',
										top: 0,
										left: 0,
										right: 0,
										height: '4px',
										background:
											'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)',
									}}
								/>
								{/* Background icon */}
								<Box
									sx={{
										position: 'absolute',
										bottom: -20,
										right: -20,
										opacity: 0.08,
										zIndex: 0,
									}}
								>
									<CustomIcon
										name={iconConstants.dashboardPPT}
										style={{
											height: '160px',
											width: '160px',
										}}
										svgStyle={'width:160px;height:160px;'}
									/>
								</Box>

								<Box
									sx={{
										position: 'relative',
										zIndex: 1,
										display: 'flex',
										flexDirection: 'column',
										justifyContent: 'space-between',
										p: 3,
										height: '100%',
									}}
								>
									<Box>
										<Box
											sx={{
												display: 'inline-block',
												bgcolor: '#FEF3C7',
												color: '#D97706',
												px: 1.5,
												py: 0.5,
												borderRadius: '6px',
												fontSize: '12px',
												fontWeight: 600,
												mb: 2,
											}}
										>
											TEACHER ANALYTICS
										</Box>
										<Typography
											sx={{
												fontSize: '22px',
												fontWeight: 700,
												color: '#1A202C',
												mb: 1,
												lineHeight: 1.2,
											}}
										>
											IRI Analytics Report
										</Typography>
										<Typography
											sx={{
												fontSize: '14px',
												fontWeight: 400,
												color: '#64748B',
												mb: 3,
												lineHeight: 1.5,
											}}
										>
											Track teacher readiness indicators
										</Typography>
									</Box>

									<Button
										onClick={() =>
											navigate(
												routePaths.schoolIRIAnalyticsReport,
												{
													state: {
														analytics: true,
													},
												},
											)
										}
										variant="contained"
										fullWidth
										sx={{
											bgcolor: '#F59E0B',
											color: '#FFFFFF',
											textTransform: 'none',
											boxShadow:
												'0 2px 6px rgba(245, 158, 11, 0.25)',
											'&:hover': {
												bgcolor: '#D97706',
												boxShadow:
													'0 4px 10px rgba(245, 158, 11, 0.35)',
												transform: 'translateY(-1px)',
											},
											transition: 'all 0.2s ease',
										}}
									>
										View Report
									</Button>
								</Box>
							</Box>
						</Card>
						{superAdmin && (
							<Card
								sx={{
									...dashboardStyles?.studentCoPeCardSSx(
										superAdmin,
									),
								}}
							>
								<Box
									sx={{
										position: 'relative',
										overflow: 'hidden',
										height: '100%',
									}}
								>
									{/* Background gradient accent */}
									<Box
										sx={{
											position: 'absolute',
											top: 0,
											left: 0,
											right: 0,
											height: '4px',
											background:
												'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
										}}
									/>
									{/* Background icon */}
									<Box
										sx={{
											position: 'absolute',
											bottom: -20,
											right: -20,
											opacity: 0.08,
											zIndex: 0,
										}}
									>
										<CustomIcon
											name={iconConstants.dashboardBook}
											style={{
												height: '160px',
												width: '160px',
											}}
											svgStyle={'width:160px;height:160px;'}
										/>
									</Box>

									<Box
										sx={{
											position: 'relative',
											zIndex: 1,
											display: 'flex',
											flexDirection: 'column',
											justifyContent: 'space-between',
											p: 3,
											height: '100%',
										}}
									>
										<Box>
											<Box
												sx={{
													display: 'inline-block',
													bgcolor: '#EEF2FF',
													color: '#764ba2',
													px: 1.5,
													py: 0.5,
													borderRadius: '6px',
													fontSize: '12px',
													fontWeight: 600,
													mb: 2,
												}}
											>
												SUPER ADMIN
											</Box>
											<Typography
												sx={{
													fontSize: '22px',
													fontWeight: 700,
													color: '#1A202C',
													mb: 1,
													lineHeight: 1.2,
												}}
											>
												SEL Modules Upload
											</Typography>
											<Typography
												sx={{
													fontSize: '14px',
													fontWeight: 400,
													color: '#64748B',
													mb: 3,
													lineHeight: 1.5,
												}}
											>
												Upload new SEL curriculum modules
											</Typography>
										</Box>

										<Button
											onClick={() => setOpenSelDialog(true)}
											variant="contained"
											fullWidth
											sx={{
												background:
													'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
												color: '#FFFFFF',
												textTransform: 'none',
												boxShadow:
													'0 2px 6px rgba(102, 126, 234, 0.25)',
												'&:hover': {
													background:
														'linear-gradient(135deg, #5568d3 0%, #63397d 100%)',
													boxShadow:
														'0 4px 10px rgba(102, 126, 234, 0.35)',
													transform: 'translateY(-1px)',
												},
												transition: 'all 0.2s ease',
											}}
										>
											Upload Modules
										</Button>
									</Box>
								</Box>
							</Card>
						)}
					</Box>
				</>
			)}

			{/* {openSelDialodg && ( */}
			<UploadSelModuleDialog
				open={openSelDialodg}
				onClose={() => {
					setOpenSelDialog(false)
				}}
			/>
			{/* )} */}
		</Box>
	)
}

export default DashboardContent
