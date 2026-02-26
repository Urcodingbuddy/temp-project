import React, { lazy } from 'react'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomDialogWithBreadcrumbs from '../../../components/commonComponents/CustomDialogWithBreadcrumbs'
import CustomSuspense from '../../../components/commonComponents/CustomSuspense'

const SendChecklistAnalytics = lazy(() => import('./SendChecklistAnalytics'))

const SendChecklistAnalyticsDialog = ({ open, onClose }) => {
	return (
		<CustomDialogWithBreadcrumbs
			onClose={onClose}
			clickableTitle={localizationConstants.sendChecklist}
			title={localizationConstants.analytics}
			onClick={onClose}
			open={open}
			saveBtnReq={false}
		>
			<CustomSuspense>
				<SendChecklistAnalytics open={open} onClose={onClose} />
			</CustomSuspense>
		</CustomDialogWithBreadcrumbs>
	)
}

export default SendChecklistAnalyticsDialog
