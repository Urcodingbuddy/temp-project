import { configureStore, combineReducers } from '@reduxjs/toolkit'
import commonSlice from './redux/commonSlice'
import loginSlice from './pages/login/loginSlice'
import toastSlice from './toast/toastSlice'
import counsellorSlice from './pages/counsellors/counsellorSlice'
import dashboardSlice from './pages/dashboard/dasboardSlice'
import schoolSlice from './pages/academic/school/schoolSlice'
import studentsSlice from './pages/academic/students/studentsSlice'
import classroomsSlice from './pages/academic/classrooms/classroomsSlice'
import individualCaseSlice from './pages/initiations/individualCase/individualCaseSlice'
import observationSlice from './pages/initiations/observation/observationSlice'
import baselineSlice from './pages/initiations/baseline/baselineSlice'
import selTrackerListSlice from './pages/initiations/SELCurriculumTracker/SELSlice'
import StudentCopeSlice from './pages/assessment/StudentCope/StudentCopeSlice'
import TeachersSlice from './pages/academic/teachers/teachersSlice'
import teacherIRISlice from './pages/assessment/teacherIRI/teacherIRISlice'
import teacherProfilingSlice from './pages/assessment/TeacherProfiling/teacherProfilingSlice'
import StudentWellBeingSlice from './pages/assessment/studentWellBeing/StudentWellBeingSlice'
import sendChecklistslice from './pages/initiations/sendCheckList/sendChecklistslice'
import iEPSlice from './pages/initiations/IEP/iEPSlice'
import gandtTemplateSlice from './pages/gandt/templates/gandtTemplateSlice'
import gandtAssignmentSlice from './pages/gandt/assignments/gandtAssignmentSlice'
import gandtCounselorSlice from './pages/initiations/gandt/gandtCounselorSlice'

const appReducer = combineReducers({
	// your other reducers here
	commonData: commonSlice,
	login: loginSlice,
	toast: toastSlice,
	counsellor: counsellorSlice,
	dashboardSliceSetup: dashboardSlice,
	school: schoolSlice,
	classrooms: classroomsSlice,
	students: studentsSlice,
	individualCase: individualCaseSlice,
	observation: observationSlice,
	baseline: baselineSlice,
	selTrackerList: selTrackerListSlice,
	studentCope: StudentCopeSlice,
	teachers: TeachersSlice,
	teacherIRI: teacherIRISlice,
	teacherProfiling: teacherProfilingSlice,
	studentWellBeing: StudentWellBeingSlice,
	sendChecklist: sendChecklistslice,
	StudentIEP: iEPSlice,
	gandtTemplate: gandtTemplateSlice,
	gandtAssignment: gandtAssignmentSlice,
	gandtCounselor: gandtCounselorSlice,
})

const rootReducer = (state, action) => {
	if (action.type === 'logout') {
		state = undefined // This clears the entire state
	}
	return appReducer(state, action)
}

export const store = configureStore({
	reducer: rootReducer,
	devTools: process.env.REACT_APP_ENV !== 'production', //Disabling redux devtools on production
})
