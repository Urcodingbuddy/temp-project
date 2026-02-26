import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import CssBaseline from '@mui/material/CssBaseline'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import List from '@mui/material/List'
import Typography from '@mui/material/Typography'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import CustomIcon from '../../components/CustomIcon'
import { iconConstants } from '../../resources/theme/iconConstants'
import { localizationConstants } from '../../resources/theme/localizationConstants'
import { typographyConstants } from '../../resources/theme/typographyConstants'
import useCommonStyles from '../../components/styles'
import { Button, Collapse, Divider } from '@mui/material'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
	getUserFromLocalStorage,
	history,
	isCounsellor,
} from '../../utils/utils'
import { routePaths } from '../../routes/routeConstants'
import { useDispatch, useSelector } from 'react-redux'
import {
	setHasRequiredPermission,
	setPermissions,
	setDrawerWidth,
	setIspermissionOfTeacher,
	fetchCommonMiscellaneousData,
} from './dasboardSlice'
import RouterBreadcrumbs from '../../components/RouterBreadcrumbs'
import Profile from '../Profile/Profile'
import { dashboardStyles } from '../dashboardContent/DashboardStyles'
import { getMiscellaneousData } from '../academic/students/studentsSlice'

export default function Dashboard() {
	history.navigate = useNavigate()
	history.location = useLocation()
	const flexStyles = useCommonStyles()
	const user = getUserFromLocalStorage()
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const {
		permissions,
		requiredPermissions,
		hasRequiredPermission,
		drawerWidth,
		isPermissionOfTeacher,
	} = useSelector((store) => store.dashboardSliceSetup)

	const pathname = window.location.pathname
	const [expandCollapseMenus, setExpandCollapseMenus] = useState({
		academic: false,
		initiations: false,
		assessment: false,
	})

	const handleExpandCollapseMenus = (menu) => {
		const menus = {
			academic: menu === 'academic',
			initiations: menu === 'initiations',
			assessment: menu === 'assessment',
		}
		setExpandCollapseMenus(menus)
	}

	useEffect(() => {
		if (permissions.length !== 0 && permissions?.[0] !== 'Teacher') {
			const hasRequiredPermission = requiredPermissions.some(
				(permission) => permissions.includes(permission),
			)
			dispatch(setHasRequiredPermission(hasRequiredPermission))
		} else if (permissions?.[0] === 'Teacher') {
			dispatch(setIspermissionOfTeacher(true))
		}
	}, [permissions])
	let isTeacher = isCounsellor()
	useEffect(() => {
		dispatch(setPermissions(user?.permissions))
		dispatch(fetchCommonMiscellaneousData())
		dispatch(getMiscellaneousData({}))
	}, [])
	const isUserTeacher = user?.permissions?.includes('Teacher')

	useEffect(() => {
		if (pathname.includes('academic')) handleExpandCollapseMenus('academic')
		if (pathname.includes('initiations'))
			handleExpandCollapseMenus('initiations')
		if (pathname.includes('assessment'))
			handleExpandCollapseMenus('assessment')
	}, [pathname])
	const shouldBaseLineShow = isUserTeacher
		? user?.assignedClassrooms?.length > 0
		: true

	const sideBarArray = [
		{
			id: 0,
			name: localizationConstants.dashboard,
			icon: iconConstants.dashboardBlack,
			selectedIcon: iconConstants.dashboardBlue,
			enable: false,
			routePath: routePaths.home,
		},
		{
			id: 1,
			name: localizationConstants.users,
			icon: iconConstants.counsellorBlack,
			selectedIcon: iconConstants.counsellorBlue,
			enable: !hasRequiredPermission,
			routePath: routePaths.counsellors,
		},
		{
			id: 2,
			name: localizationConstants.academic,
			icon: iconConstants.academicBlack,
			selectedIcon: iconConstants.academicBlue,
			routePath: 'academic',
			nestedItems: [
				{
					id: 4,
					name: localizationConstants.schools,
					routePath: routePaths.academicSchools,
					enable: isPermissionOfTeacher,
				},
				{
					id: 5,
					name: localizationConstants.classrooms,
					routePath: routePaths.academicClassrooms,
					enable: isPermissionOfTeacher,
				},
				{
					id: 6,
					name: localizationConstants.students,
					routePath: routePaths.academicStudents,
					enable: isPermissionOfTeacher,
				},
				{
					id: 7,
					name: localizationConstants.teachers,
					routePath: routePaths.academicTeachers,
					enable: isPermissionOfTeacher,
				},
			],
			enable: !isTeacher,
		},
		{
			id: 3,
			name: localizationConstants.initiations,
			icon: iconConstants.initiationBlack,
			selectedIcon: iconConstants.initiationBlue,
			routePath: 'initiations',
			nestedItems: [
				{
					id: 8,
					name: localizationConstants.observation,
					routePath: routePaths.initiationsObservation,
					enable: isPermissionOfTeacher,
				},
				{
					id: 9,
					name: localizationConstants.individualCase,
					routePath: routePaths.initiationsIndividualCase,
					enable: isPermissionOfTeacher,
				},
				{
					id: 10,
					name: localizationConstants.baseline,
					routePath: routePaths.initiationsBaseline,
					enable: !shouldBaseLineShow,
				},
				{
					id: 11,
					name: localizationConstants.SELCurriculumTracker,
					routePath: routePaths.initiationsSELCurriculumTracker,
					enable: isPermissionOfTeacher,
				},
				{
					id: 12,
					name: localizationConstants.sendChecklist,
					routePath: routePaths.initiationsSendChecklist,
					enable: isPermissionOfTeacher,
				},
				{
					id: 13,
					name: localizationConstants.iep,
					routePath: routePaths.initiationsIEP,
					enable: isPermissionOfTeacher,
				},
				{
					id: 14,
					name: localizationConstants.gandt,
					routePath: routePaths.initiationsGandT,
					enable: isPermissionOfTeacher,
				},
			],
			enable: false,
		},
		{
			id: 15,
			name: localizationConstants.assessment,
			icon: iconConstants.assessmentBlack,
			selectedIcon: iconConstants.assessmentBlue,
			routePath: 'assessment',
			nestedItems: [
				{
					id: 16,
					name: localizationConstants.teacherProfiling,
					routePath: isPermissionOfTeacher
						? routePaths.TeacherProfilingAssessmentDetails
						: routePaths.TeacherProfilingAssessment,
					enable: false,
				},
				{
					id: 17,
					name: localizationConstants.teacherIRI,
					routePath: isPermissionOfTeacher
						? routePaths.assessmentTeacherIRIAssessment
						: routePaths.assessmentTeacherIRI,
					enable: false,
				},
				{
					id: 18,
					name: localizationConstants.studentCope,
					routePath: routePaths.initiationsStudentCope,
					enable: !isTeacher,
				},
				{
					id: 19,
					name: localizationConstants.studentWellBeing,
					routePath: routePaths.initiationsstudentWellBeing,
					enable: !isTeacher,
				},
			],
			enable: false,
		},
	]

	return (
		<Box sx={{ display: 'flex' }}>
			<CssBaseline />
			<AppBar
				position='fixed'
				sx={{
					width: `calc(100% - ${drawerWidth}px)`,
					ml: `${drawerWidth}px`,
					backgroundColor: 'globalElementColors.white',
					borderBottom: '1px solid',
					borderColor: 'globalElementColors.canvas1',
					height: '64px',
				}}
				elevation={0}
			>
				<Toolbar
					sx={{ width: '100%', height: '100%', minHeight: '64px' }}
					className={flexStyles.flexRowCenterSpaceBetween}
				>
					<Typography
						variant={typographyConstants.h5}
						sx={{ fontWeight: 400 }}
					>
						<RouterBreadcrumbs />
					</Typography>
					<Profile user={user} />
				</Toolbar>
			</AppBar>
			<Drawer
				sx={{
					width: drawerWidth,
					flexShrink: 0,
					'& .MuiDrawer-paper': {
						width: drawerWidth,
						boxSizing: 'border-box',
						transition: 'width 0.3s ease',
						borderRight: '1px solid #E2E8F0',
						bgcolor: '#FAFAFA',
						overflow: 'hidden',
					},
				}}
				variant='permanent'
				anchor='left'
			>
				<Toolbar
					variant='regular'
					disableGutters
					sx={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						minHeight: '64px !important',
						height: '64px',
						borderBottom: '1px solid #E2E8F0',
						bgcolor: 'white',
						position: 'relative',
					}}
				>
					{drawerWidth === 300 ? (
						<CustomIcon
							name={iconConstants.myPeegu}
							style={{ width: '100px', height: '60px' }}
							svgStyle={'height: 60px; width: 100px'}
						/>
					) : (
						<CustomIcon
							name={iconConstants.myPeegu}
							style={{ width: '40px', height: '32px' }}
							svgStyle={'height: 32px; width: 40px'}
						/>
					)}
				</Toolbar>

				<Box
					sx={{
						flex: 1,
						overflowY: 'auto',
						overflowX: 'hidden',
						'&::-webkit-scrollbar': {
							width: '6px',
						},
						'&::-webkit-scrollbar-track': {
							bgcolor: 'transparent',
						},
						'&::-webkit-scrollbar-thumb': {
							bgcolor: '#BDBDBD',
							borderRadius: '3px',
							'&:hover': {
								bgcolor: '#9E9E9E',
							},
						},
					}}
				>
					<List sx={{ px: 1.5, pt: 2, pb: 2 }}>
					{sideBarArray.map((sideBarItem) => (
						<Box key={sideBarItem.id}>
							{!sideBarItem?.enable && (
								<Box sx={{ mb: 0.5 }}>
									<ListItem
										disablePadding
										onClick={() => {
											if (sideBarItem?.nestedItems) {
												// Only toggle expand/collapse, don't navigate automatically
												setExpandCollapseMenus((prev) => ({
													...prev,
													[sideBarItem.routePath]: !prev[sideBarItem.routePath],
												}))
											} else {
												navigate(sideBarItem.routePath)
											}
											dispatch(setDrawerWidth(300))
										}}
									>
										<ListItemButton
											sx={{
												borderRadius: '8px',
												px: drawerWidth === 300 ? 2 : 1.5,
												py: 1.25,
												minHeight: '44px',
												transition: 'all 0.2s',
												backgroundColor:
													pathname.includes(
														sideBarItem.routePath,
													)
														? '#E3F2FD'
														: 'transparent',
												borderLeft: pathname.includes(
													sideBarItem.routePath,
												)
													? '3px solid #1976D2'
													: '3px solid transparent',
												'&:hover': {
													backgroundColor:
														pathname.includes(
															sideBarItem.routePath,
														)
															? '#E3F2FD'
															: '#F5F5F5',
												},
											}}
										>
											<ListItemIcon
												sx={{
													minWidth:
														drawerWidth === 300
															? '40px'
															: '0px',
													justifyContent: 'center',
												}}
											>
												<CustomIcon
													name={
														pathname.includes(
															sideBarItem.routePath,
														)
															? sideBarItem.selectedIcon
															: sideBarItem.icon
													}
													style={{
														width: '20px',
														height: '20px',
													}}
													svgStyle={
														'width: 20px; height: 20px'
													}
												/>
											</ListItemIcon>
											{drawerWidth === 300 && (
												<>
													<ListItemText
														primary={sideBarItem.name}
														primaryTypographyProps={{
															variant: 'body2',
															sx: {
																color: pathname.includes(
																	sideBarItem.routePath,
																)
																	? '#1976D2'
																	: '#424242',
															},
														}}
													/>
													{sideBarItem?.nestedItems && (
														<CustomIcon
															name={
																expandCollapseMenus[
																	sideBarItem.routePath
																]
																	? iconConstants.arrowUpBlue
																	: iconConstants.arrowDownBlack
															}
															style={{
																width: '18px',
																height: '18px',
															}}
															svgStyle={
																'width: 18px; height: 18px'
															}
														/>
													)}
												</>
											)}
										</ListItemButton>
									</ListItem>
									{sideBarItem?.nestedItems &&
										drawerWidth === 300 && (
											<Collapse
												in={
													expandCollapseMenus[
														sideBarItem.routePath
													]
												}
											>
												<List disablePadding sx={{ mt: 0.5 }}>
													{sideBarItem?.nestedItems?.map(
														(nestedItem) =>
															!nestedItem?.enable && (
																<ListItem
																	key={nestedItem.id}
																	disablePadding
																	sx={{ mb: 0.5 }}
																>
																	<ListItemButton
																		onClick={() => {
																			navigate(
																				nestedItem.routePath,
																			)
																		}}
																		sx={{
																			pl: 5,
																			py: 1,
																			minHeight: '40px',
																			borderRadius: '8px',
																			transition:
																				'all 0.2s',
																			backgroundColor:
																				pathname.includes(
																					nestedItem.routePath,
																				)
																					? '#E3F2FD'
																					: 'transparent',
																			'&:hover': {
																				backgroundColor:
																					pathname.includes(
																						nestedItem.routePath,
																					)
																						? '#E3F2FD'
																						: '#F5F5F5',
																			},
																		}}
																	>
																		<Box
																			sx={{
																				width: '6px',
																				height: '6px',
																				borderRadius:
																					'50%',
																				backgroundColor:
																					pathname.includes(
																						nestedItem.routePath,
																					)
																						? '#1976D2'
																						: '#9E9E9E',
																				mr: 1.5,
																				transition:
																					'all 0.2s',
																			}}
																		/>
																		<Typography
																			variant="caption"
																			sx={{
																				color: pathname.includes(
																					nestedItem.routePath,
																				)
																					? '#1976D2'
																					: '#616161',
																			}}
																		>
																			{nestedItem.name}
																		</Typography>
																	</ListItemButton>
																</ListItem>
															),
													)}
												</List>
											</Collapse>
										)}
								</Box>
							)}
						</Box>
					))}
				</List>
				</Box>
			</Drawer>
			<Box
				sx={{
					position: 'fixed',
					top: '80px',
					left: drawerWidth === 300 ? '284px' : '64px',
					zIndex: 1201,
					background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
					borderRadius: '50%',
					width: '32px',
					height: '32px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					boxShadow: '0 2px 12px rgba(102, 126, 234, 0.4)',
					cursor: 'pointer',
					transition: 'all 0.3s ease',
					border: '2px solid white',
					'&:hover': {
						boxShadow: '0 4px 16px rgba(102, 126, 234, 0.5)',
						transform: 'scale(1.1)',
					},
					'&:active': {
						transform: 'scale(0.95)',
					},
				}}
				onClick={() => {
					dispatch(setDrawerWidth(drawerWidth === 300 ? 80 : 300))
				}}
			>
				<CustomIcon
					name={
						drawerWidth === 300
							? iconConstants.CarretDoubleLeft
							: iconConstants.CarretDoubleRight
					}
					style={{
						width: '18px',
						height: '18px',
						filter: 'brightness(0) invert(1)',
					}}
					svgStyle={'height: 18px; width: 18px'}
				/>
			</Box>
			<Box
				component='main'
				sx={{
					flexGrow: 1,
					bgcolor: 'F8FCFF',
					p: 3,
					minWidth: 0,
					overflow: 'hidden',
				}}
			>
				<Toolbar sx={{ minHeight: '64px' }} />
				<Outlet />
			</Box>
		</Box>
	)
}
