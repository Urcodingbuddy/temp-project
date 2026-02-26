import { useEffect, useState, Suspense, lazy } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { routeConstants, routePaths } from './routes/routeConstants'
import { setAppPermissions } from './pages/dashboard/dasboardSlice'
import { dark, light } from './resources/theme/mode'
import {
	Backdrop,
	Box,
	CircularProgress,
	CssBaseline,
	ThemeProvider,
	createTheme,
} from '@mui/material'
import { englishTypography } from './resources/theme/typography'
import { getUserFromLocalStorage } from './utils/utils'

import { resetLoginSlice } from './pages/login/loginSlice'
import { clearCounsellorSlice } from './pages/counsellors/counsellorSlice'
import { resetSchoolSlice } from './pages/academic/school/schoolSlice'
import { resetStudentSlice } from './pages/academic/students/studentsSlice'
import { resetIndividualCaseSlice } from './pages/initiations/individualCase/individualCaseSlice'
import { resetBaselineSlice } from './pages/initiations/baseline/baselineSlice'
import { resetObservationSlice } from './pages/initiations/observation/observationSlice'
import { resetClassroomsSlice } from './pages/academic/classrooms/classroomsSlice'
import SchoolIRIAnalytics from './pages/assessment/teacherIRI/SchoolIRIAnalytics'
import SpecificSchoolIRIDetails from './pages/assessment/teacherIRI/SpecificSchoolIRIDetails'
import TeacherProfilingSchoolList from './pages/assessment/TeacherProfiling/TeacherProfilingSchoolList'
import TeacherProfilingTeachersList from './pages/assessment/TeacherProfiling/TeacherProfilingTeachersList'
import SpecificSchoolProfilingDetails from './pages/assessment/TeacherProfiling/SpecificSchoolProfilingDetails'
import SchoolWiseProfilingAnalytics from './pages/assessment/TeacherProfiling/SchoolWiseProfilingAnalytics'
import SpecificStudentWellBeing from './pages/assessment/studentWellBeing/EditStudentWellBeing'
import { clearStudentWellBeingSlice } from './pages/assessment/studentWellBeing/StudentWellBeingSlice'
import AddStudentChecklist from './pages/initiations/sendCheckList/AddStudentChecklist'
import { clearSendchecklistsliceBeingSlice } from './pages/initiations/sendCheckList/sendChecklistslice'
import SendChecklistAnalytics from './pages/initiations/sendCheckList/SendChecklistAnalytics'
import { clearStudentIEPSlice } from './pages/initiations/IEP/iEPSlice'
import AddIEP from './pages/initiations/IEP/AddIEP'
import EditIEP from './pages/initiations/IEP/EditIEP'
import EmptyTeacherPage from './components/EmptyTeacherPage'

const Login = lazy(() => import('./pages/login/Login'))
const AccountRecovery = lazy(
	() => import('./pages/accountRecovery/AccountRecovery'),
)
const CreateNewPassword = lazy(
	() => import('./pages/createNewPassword/CreateNewPassword'),
)
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'))
const ProtectedRoute = lazy(() => import('./ProtectedRoute'))
const DashboardContent = lazy(
	() => import('./pages/dashboardContent/DashboardContent'),
)
const PageNotFound = lazy(() => import('./components/PageNotFound'))
const ApplicationRoot = lazy(() => import('./components/ApplicationRoot'))
const Authentication = lazy(() => import('./components/Authentication'))
const Toast = lazy(() => import('./components/Toast'))
const Schools = lazy(() => import('./pages/academic/school/Schools'))
const Counsellors = lazy(() => import('./pages/counsellors/Counsellors'))
const ActivateAccount = lazy(
	() => import('./pages/activateAccount/ActivateAccount'),
)
const Students = lazy(() => import('./pages/academic/students/Students'))
const ClassRooms = lazy(() => import('./pages/academic/classrooms/Classrooms'))
const Teachers = lazy(() => import('./pages/academic/teachers/Teachers'))
const IndividualCase = lazy(
	() => import('./pages/initiations/individualCase/IndividualCase'),
)

const Observation = lazy(
	() => import('./pages/initiations/observation/Observation'),
)

const Baseline = lazy(() => import('./pages/initiations/baseline/Baseline'))

const StudentBaseline = lazy(
	() => import('./pages/initiations/baseline/StudentBaselineReport'),
)
const Sel = lazy(() => import('./pages/initiations/SELCurriculumTracker/SEL'))
const StudentCope = lazy(
	() => import('./pages/assessment/StudentCope/StudentCope'),
)
const TeacherIRI = lazy(
	() => import('./pages/assessment/teacherIRI/TeacherIRI'),
)
const TeacherIRITeachersList = lazy(
	() => import('./pages/assessment/teacherIRI/TeacherIRITeachersList'),
)
const TeacherIRIAssessment = lazy(
	() => import('./pages/assessment/teacherIRI/TeacherIRIAssessment'),
)
const TeacherProfilingAssessment = lazy(
	() =>
		import(
			'./pages/assessment/TeacherProfiling/TeacherProfilingAssessment'
		),
)
const StudentWellBeing = lazy(
	() => import('./pages/assessment/studentWellBeing/StudentWellBeing'),
)
const GandTTemplateList = lazy(
	() => import('./pages/gandt/templates/GandTTemplateList'),
)
const GandTTemplateForm = lazy(
	() => import('./pages/gandt/templates/GandTTemplateForm'),
)
const GandTTemplateView = lazy(
	() => import('./pages/gandt/templates/GandTTemplateView'),
)
const GandTAssignmentList = lazy(
	() => import('./pages/gandt/assignments/GandTAssignmentList'),
)
const SendChecklist = lazy(
	() => import('./pages/initiations/sendCheckList/SendCheckList'),
)
const StudentIEP = lazy(() => import('./pages/initiations/IEP/StudentIEP'))
const GandT = lazy(() => import('./pages/initiations/gandt/ComingSoon'))

const App = () => {
	const dispatch = useDispatch()
	const {
		isLoading,
		showToast,
		title,
		subTitle,
		isSuccess,
		anchorOrigin,
		direction,
	} = useSelector((store) => store.toast)
	const [lightMode, setLightMode] = useState(true)
	const [typo, setTypo] = useState(englishTypography)
	const [viewToast, setViewToast] = useState(false)

	const appliedTheme = createTheme(
		lightMode ? { ...light, ...typo } : { ...dark, ...typo },
	)

	useEffect(() => {
		setViewToast(showToast)
	}, [showToast])

	useEffect(() => {
		if (getUserFromLocalStorage() !== null) {
			dispatch(setAppPermissions(getUserFromLocalStorage()))
		}
	}, [])

	useEffect(() => {
		dispatch(resetLoginSlice())
		dispatch(clearCounsellorSlice())
		dispatch(resetClassroomsSlice())
		dispatch(resetSchoolSlice())
		dispatch(resetStudentSlice())
		if (!window.location.href.includes('/initiations/individualCase')) {
			dispatch(resetIndividualCaseSlice())
		}
		if (!window.location.href.includes('/initiations/observation')) {
			dispatch(resetObservationSlice())
		}
		if (!window.location.href.includes('/initiations/baseline')) {
			dispatch(resetBaselineSlice())
		}
		if (!window.location.href.includes('/assessment/studentWellBeing')) {
			dispatch(clearStudentWellBeingSlice())
		}
		if (!window.location.href.includes('/initiations/sendChecklist')) {
			dispatch(clearSendchecklistsliceBeingSlice())
		}
		if (!window.location.href.includes('/initiations/sendChecklist')) {
			dispatch(clearStudentIEPSlice())
		}
	}, [dispatch, window.location.href])

	const loading = ''
	const loder = (
		<Box>
			<Backdrop
				style={{ zIndex: 99999 }}
				classes={{
					root: 'MuiBackdrop-root-loader',
				}}
				open={true}
			>
				<CircularProgress
					sx={{ width: '400px', height: '400px', color: 'white' }}
				/>
			</Backdrop>
		</Box>
	)

	return (
		<ThemeProvider theme={appliedTheme}>
			<CssBaseline />
			<BrowserRouter>
				<Routes>
					<Route
						path={routeConstants.root}
						element={
							<Suspense fallback={loading}>
								<ProtectedRoute>
									<ApplicationRoot />
								</ProtectedRoute>
							</Suspense>
						}
					>
						<Route
							path={routeConstants.dashboard}
							element={
								<Suspense fallback={loading}>
									<Dashboard />
								</Suspense>
							}
						>
							<Route
								path={routePaths.home}
								element={
									<Suspense fallback={loading}>
										<DashboardContent />{' '}
									</Suspense>
								}
							/>
							<Route
								path={routePaths.counsellors}
								element={
									<Suspense fallback={loading}>
										<Counsellors />{' '}
									</Suspense>
								}
							/>
							<Route
								path={routePaths.academicSchools}
								element={
									<Suspense fallback={loading}>
										<Schools />{' '}
									</Suspense>
								}
							/>
							<Route
								path={routePaths.academicStudents}
								element={
									<Suspense fallback={loading}>
										<Students />{' '}
									</Suspense>
								}
							/>
							<Route
								path={routePaths.academicClassrooms}
								element={
									<Suspense fallback={loading}>
										<ClassRooms />{' '}
									</Suspense>
								}
							/>
							<Route
								path={routePaths.academicTeachers}
								element={
									<Suspense fallback={loading}>
										<Teachers />{' '}
									</Suspense>
								}
							/>
							<Route
								path={routePaths.initiationsIndividualCase}
								element={
									<Suspense fallback={loading}>
										<IndividualCase />
									</Suspense>
								}
							/>
							<Route
								path={routePaths.initiationsObservation}
								element={
									<Suspense fallback={loading}>
										<Observation />{' '}
									</Suspense>
								}
							/>

							<Route
								path={routePaths.initiationsBaseline}
								element={
									<Suspense fallback={loading}>
										<Baseline />
									</Suspense>
								}
							/>

							<Route
								path={`${routePaths.initiationsStudentBaseline}/:row_id`}
								element={
									<Suspense fallback={loading}>
										<StudentBaseline />
									</Suspense>
								}
							/>
							<Route
								path={
									routePaths.initiationsSELCurriculumTracker
								}
								element={
									<Suspense fallback={loading}>
										<Sel />
									</Suspense>
								}
							/>
							<Route
								path={routePaths.initiationsStudentCope}
								element={
									<Suspense fallback={loading}>
										<StudentCope />
									</Suspense>
								}
							/>
							<Route
								path={routePaths.assessmentTeacherIRI}
								element={
									<Suspense fallback={loading}>
										<TeacherIRI />
									</Suspense>
								}
							/>
							<Route
								path={`${routePaths.assessmentTeacherIRITeachersList}/:row_id`}
								element={
									<Suspense fallback={loading}>
										<TeacherIRITeachersList />
									</Suspense>
								}
							/>
							<Route
								path={routePaths.assessmentTeacherIRIAssessment}
								element={
									<Suspense fallback={loading}>
										<TeacherIRIAssessment />
									</Suspense>
								}
							/>
							<Route
								path={routePaths.schoolIRIAnalyticsReport}
								element={
									<Suspense fallback={loading}>
										<SchoolIRIAnalytics />
									</Suspense>
								}
							/>

							<Route
								path={routePaths.specificSchoolIRIDetails}
								element={
									<Suspense fallback={loading}>
										<SpecificSchoolIRIDetails />
									</Suspense>
								}
							/>
							<Route
								path={routePaths.initiationsstudentWellBeing}
								element={
									<Suspense fallback={loading}>
										<StudentWellBeing />
									</Suspense>
								}
							/>
							<Route
								path={`${routePaths.specificStudentWellBeing}/:row_id`}
								element={
									<Suspense fallback={loading}>
										<SpecificStudentWellBeing />
									</Suspense>
								}
							/>
							<Route
								path={`${routePaths.studentWellBeingAnalyticsSchools}`}
								element={
									<Suspense fallback={loading}>
										<studentWellBeingAnalyticsSchools />
									</Suspense>
								}
							/>
							<Route
								index
								element={
									<Navigate to={routePaths.home} replace />
								}
							/>
							{/* Assessment Index
							<Route
								path={routePaths.assessmentIndex}
								element={
									<Suspense fallback={loading}>
										<TeacherProfilingSchoolList />
									</Suspense>
								}
							/> */}
							{/* Teacher Profiling */}
							<Route
								path={routePaths.TeacherProfilingAssessment}
								element={
									<Suspense fallback={loading}>
										<TeacherProfilingSchoolList />
									</Suspense>
								}
							/>
							<Route
								path={`${routePaths.TeacherProfilingAssessment}/:row_id`}
								element={
									<Suspense fallback={loading}>
										<TeacherProfilingTeachersList />
									</Suspense>
								}
							/>
							<Route
								path={
									routePaths.TeacherProfilingAssessmentDetails
								}
								element={
									<Suspense fallback={loading}>
										<TeacherProfilingAssessment />
									</Suspense>
								}
							/>
							<Route
								path={routePaths.specificSchoolProfilingDetails}
								element={
									<Suspense fallback={loading}>
										<SpecificSchoolProfilingDetails />
									</Suspense>
								}
							/>
							<Route
								path={routePaths.schoolProfilingAnalyticsReport}
								element={
									<Suspense fallback={loading}>
										<SchoolWiseProfilingAnalytics />
									</Suspense>
								}
							/>
							<Route
								path={routePaths.initiationsSendChecklist}
								element={
									<Suspense fallback={loading}>
										<SendChecklist />
									</Suspense>
								}
							/>
							<Route
								path={routePaths.AddStudentChecklist}
								element={
									<Suspense fallback={loading}>
										<AddStudentChecklist />
									</Suspense>
								}
							/>
							<Route
								path={routePaths.studentChecklistAnalytics}
								element={
									<Suspense fallback={loading}>
										<SendChecklistAnalytics />
									</Suspense>
								}
							/>
							<Route
								path={routePaths.initiationsIEP}
								element={
									<Suspense fallback={loading}>
										<StudentIEP />
									</Suspense>
								}
							/>
							<Route
								path={routePaths.initiationsAddIEP}
								element={
									<Suspense fallback={loading}>
										<AddIEP />
									</Suspense>
								}
							/>
							<Route
								path={`${routePaths.initiationsIEP}/:row_id`}
								element={
									<Suspense fallback={loading}>
										<EditIEP />
									</Suspense>
								}
							/>
							<Route
								path={routePaths.initiationsGandT}
								element={
									<Suspense fallback={loading}>
										<GandT />
									</Suspense>
								}
							/>
							<Route
								path={routePaths.gandtTemplates}
								element={
									<Suspense fallback={loading}>
										<GandTTemplateList />
									</Suspense>
								}
							/>
							<Route
								path={routePaths.gandtTemplateAdd}
								element={
									<Suspense fallback={loading}>
										<GandTTemplateForm />
									</Suspense>
								}
							/>
							<Route
								path={routePaths.gandtTemplateEdit}
								element={
									<Suspense fallback={loading}>
										<GandTTemplateForm />
									</Suspense>
								}
							/>
							<Route
								path={routePaths.gandtTemplateView}
								element={
									<Suspense fallback={loading}>
										<GandTTemplateView />
									</Suspense>
								}
							/>
							<Route
								path={routePaths.gandtAssignments}
								element={
									<Suspense fallback={loading}>
										<GandTAssignmentList />
									</Suspense>
								}
							/>
							<Route
								path='*'
								element={
									<Suspense fallback={loading}>
										<PageNotFound />
									</Suspense>
								}
							/>
							<Route
								path={routePaths.teacherMsgPage}
								element={
									<Suspense fallback={loading}>
										<EmptyTeacherPage />{' '}
									</Suspense>
								}
							/>
						</Route>
					</Route>
					<Route
						path={routeConstants.auth}
						element={
							<Suspense fallback={loading}>
								<Authentication />
							</Suspense>
						}
					>
						<Route
							path={routeConstants.login}
							exact
							element={
								<Suspense fallback={loading}>
									<Login />
								</Suspense>
							}
						/>
						<Route
							path={routeConstants.accountRecovery}
							element={
								<Suspense fallback={loading}>
									<AccountRecovery />
								</Suspense>
							}
						/>
						<Route
							path={routeConstants.createNewPassword}
							element={
								<Suspense fallback={loading}>
									<CreateNewPassword />
								</Suspense>
							}
						/>
						<Route
							path={routeConstants.activateAccount}
							element={
								<Suspense fallback={loading}>
									<ActivateAccount />
								</Suspense>
							}
						/>
						<Route
							index
							element={<Navigate to={routePaths.login} replace />}
						/>
						<Route
							path='*'
							element={
								<Suspense fallback={loading}>
									<PageNotFound />
								</Suspense>
							}
						/>
					</Route>
					<Route
						index
						element={<Navigate to={routePaths.login} replace />}
					/>
					<Route
						path='*'
						element={
							<Suspense fallback={loading}>
								<PageNotFound />
							</Suspense>
						}
					/>
				</Routes>
			</BrowserRouter>
			{viewToast && (
				<Toast
					title={title}
					subTitle={subTitle}
					isSuccess={isSuccess}
					anchorOrigin={anchorOrigin}
					direction={direction}
				/>
			)}
			{isLoading && loder}
		</ThemeProvider>
	)
}

export default App
