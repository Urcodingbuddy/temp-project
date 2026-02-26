import React, { lazy } from 'react'
import CustomDialogWithBreadcrumbs from '../../../components/commonComponents/CustomDialogWithBreadcrumbs'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomSuspense from '../../../components/commonComponents/CustomSuspense'
const SchoolIRIAnalytics = lazy(() => import('./SchoolIRIAnalytics'))

const SchoolIRIAnalyticsDialog = ({ open, onClose }) => {
	return (
		<CustomDialogWithBreadcrumbs
			onClose={onClose}
			clickableTitle={localizationConstants.teacherIRI}
			title={localizationConstants.analytics}
			onClick={onClose}
			open={open}
			saveBtnReq={false}
		>
			<CustomSuspense>
				<SchoolIRIAnalytics />
			</CustomSuspense>
		</CustomDialogWithBreadcrumbs>
	)
}

export default SchoolIRIAnalyticsDialog
