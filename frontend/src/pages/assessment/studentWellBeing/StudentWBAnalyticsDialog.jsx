import { lazy } from 'react'
import CustomDialogWithBreadcrumbs from '../../../components/commonComponents/CustomDialogWithBreadcrumbs'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
const StudentWellBeingAnalytics = lazy(
	() => import('./StudentWellBeingAnalytics'),
)

const StudentWBAnalyticsDialog = ({ open, onClose }) => {
	return (
		<CustomDialogWithBreadcrumbs
			open={open}
			onClose={onClose}
			clickableTitle={localizationConstants.studentWellBeing}
			title={localizationConstants.analytics}
			onClick={onClose}
			saveBtnReq={false}
		>
			<StudentWellBeingAnalytics />
		</CustomDialogWithBreadcrumbs>
	)
}

export default StudentWBAnalyticsDialog
