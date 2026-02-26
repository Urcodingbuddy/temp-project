import React, { lazy } from 'react'
import CustomDialogWithBreadcrumbs from '../../../components/commonComponents/CustomDialogWithBreadcrumbs'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomSuspense from '../../../components/commonComponents/CustomSuspense'

const SchoolWiseProfilingAnalytics = lazy(
	() => import('./SchoolWiseProfilingAnalytics'),
)

const SchoolWiseProfilingAnalyticsDialog = ({ open, onClose }) => {
	return (
		<CustomDialogWithBreadcrumbs
			onClose={onClose}
			clickableTitle={localizationConstants.teacherProfiling}
			title={localizationConstants.analytics}
			onClick={onClose}
			open={open}
			saveBtnReq={false}
		>
			<CustomSuspense>
				<SchoolWiseProfilingAnalytics />
			</CustomSuspense>
		</CustomDialogWithBreadcrumbs>
	)
}

export default SchoolWiseProfilingAnalyticsDialog
