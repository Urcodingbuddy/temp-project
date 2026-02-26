import React, { lazy } from 'react'
import CustomDialogWithBreadcrumbs from '../../../components/commonComponents/CustomDialogWithBreadcrumbs'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomSuspense from '../../../components/commonComponents/CustomSuspense'
const BaselineAnalytics = lazy(() => import('./BaselineAnalytics'))

const BaselineAnalyticsDialog = ({ open, onClose }) => {
	return (
		<CustomDialogWithBreadcrumbs
			onClose={onClose}
			clickableTitle={localizationConstants.baseline}
			title={localizationConstants.analytics}
			onClick={onClose}
			open={open}
			saveBtnReq={false}
		>
			<CustomSuspense>
				<BaselineAnalytics />
			</CustomSuspense>
		</CustomDialogWithBreadcrumbs>
	)
}

export default BaselineAnalyticsDialog
