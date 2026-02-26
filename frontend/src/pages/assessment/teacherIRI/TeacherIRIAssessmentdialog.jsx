import React, { lazy } from 'react'
import CustomDialogWithBreadcrumbs from '../../../components/commonComponents/CustomDialogWithBreadcrumbs'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomSuspense from '../../../components/commonComponents/CustomSuspense'

const TeacherIRIAssessment = lazy(() => import('./TeacherIRIAssessment'))

const TeacherIRIAssessmentDialog = ({
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
			clickableTitle={localizationConstants.teacherIRI}
			title={localizationConstants.assessment}
			onClick={onClose}
			open={open}
			saveBtnReq={false}
		>
			<CustomSuspense>
				<TeacherIRIAssessment
					selectedTeacherRowData={selectedTeacherRowData}
					SchoolRow={SchoolRow}
					refreshTeacherList={refreshTeacherList}
					refreshSchoolList={refreshSchoolList}
				/>
			</CustomSuspense>
		</CustomDialogWithBreadcrumbs>
	)
}

export default TeacherIRIAssessmentDialog
