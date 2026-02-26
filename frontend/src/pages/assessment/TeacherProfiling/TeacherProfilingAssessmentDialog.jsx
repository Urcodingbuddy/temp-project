import React, { lazy } from 'react'
import CustomDialogWithBreadcrumbs from '../../../components/commonComponents/CustomDialogWithBreadcrumbs'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomSuspense from '../../../components/commonComponents/CustomSuspense'
const TeacherProfilingAssessment = lazy(
	() => import('./TeacherProfilingAssessment'),
)

const TeacherProfilingAssessmentDialog = ({
	open,
	onClose,
	selectedTeacherRowData,
	SchoolRow,
	refreshTeacherList,
	refreshSchoolList,
}) => {
	return (
		<CustomDialogWithBreadcrumbs
			onClose={onClose}
			clickableTitle={localizationConstants.teacherProfiling}
			title={localizationConstants.assessment}
			onClick={onClose}
			open={open}
			saveBtnReq={false}
		>
			<CustomSuspense>
				<TeacherProfilingAssessment
					selectedTeacherRowData={selectedTeacherRowData}
					SchoolRow={SchoolRow}
					refreshTeacherList={refreshTeacherList}
					refreshSchoolList={refreshSchoolList}
				/>
			</CustomSuspense>
		</CustomDialogWithBreadcrumbs>
	)
}

export default TeacherProfilingAssessmentDialog
