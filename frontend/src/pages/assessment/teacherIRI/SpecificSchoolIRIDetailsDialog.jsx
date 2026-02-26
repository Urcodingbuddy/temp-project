import React, { lazy } from 'react'
import CustomDialogWithBreadcrumbs from '../../../components/commonComponents/CustomDialogWithBreadcrumbs'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomSuspense from '../../../components/commonComponents/CustomSuspense'
const SpecificSchoolIRIDetails = lazy(
	() => import('./SpecificSchoolIRIDetails'),
)

const SpecificSchoolIRIDetailsDialog = ({ open, onClose, school }) => {
	return (
		<CustomDialogWithBreadcrumbs
			onClose={onClose}
			clickableTitle={localizationConstants.viewSchoolReport}
			title={localizationConstants.report}
			onClick={onClose}
			open={open}
			saveBtnReq={false}
		>
			<CustomSuspense>
				<SpecificSchoolIRIDetails
					viewSchoolReport={true}
					academicYear={school?.academicYearId}
					schoolId={school?.schoolId}
				/>
			</CustomSuspense>
		</CustomDialogWithBreadcrumbs>
	)
}

export default SpecificSchoolIRIDetailsDialog
