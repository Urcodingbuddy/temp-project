import React, { lazy } from 'react'
import CustomDialogWithBreadcrumbs from '../../../components/commonComponents/CustomDialogWithBreadcrumbs'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomSuspense from '../../../components/commonComponents/CustomSuspense'

const StudentBaselineReport = lazy(() => import('./StudentBaselineReport'))

const StudentBaselineReportDialog = ({
	open,
	onClose,
	singleStdRowdata,
	setSingleStdRowData,
}) => {
	return (
		<CustomDialogWithBreadcrumbs
			onClose={onClose}
			clickableTitle={localizationConstants.baseline}
			title={`${singleStdRowdata?.studentName} ${localizationConstants.report}`}
			onClick={onClose}
			open={open}
			saveBtnReq={false}
		>
			<CustomSuspense>
				<StudentBaselineReport
					singleStdRowdata={singleStdRowdata}
					setSingleStdRowData={setSingleStdRowData}
				/>
			</CustomSuspense>
		</CustomDialogWithBreadcrumbs>
	)
}

export default StudentBaselineReportDialog
