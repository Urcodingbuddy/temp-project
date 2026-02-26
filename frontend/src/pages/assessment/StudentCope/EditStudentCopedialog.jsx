import React, { lazy, useRef, useState } from 'react'
import CustomDialogWithBreadcrumbs from '../../../components/commonComponents/CustomDialogWithBreadcrumbs'
import { localizationConstants } from '../../../resources/theme/localizationConstants'

import CustomSuspense from '../../../components/commonComponents/CustomSuspense'
const EditStudentsCope = lazy(() => import('./EditStudentsCope'))

const EditStudentCopedialog = ({
	open,
	onClose,
	refreshList,
	rowDataSelected,
}) => {
	const stduentCopeRef = useRef()
	const [editDialogData, setEditDialogData] = useState({
		disableSave: true,
		selectedTab: 'assessmentResult',
	})

	return (
		<CustomDialogWithBreadcrumbs
			onClose={onClose}
			clickableTitle={localizationConstants.studentCope}
			title={rowDataSelected?.studentName}
			onClick={onClose}
			open={open}
			saveBtnText={localizationConstants.save}
			onSave={() => stduentCopeRef.current?.handleUpdateClick()}
			saveBtnReq={editDialogData?.selectedTab === 'assessmentResult'}
			disableSaveBtn={editDialogData?.disableSave}
		>
			<CustomSuspense>
				<EditStudentsCope
					ref={stduentCopeRef}
					refreshList={refreshList}
					setEditDialogData={setEditDialogData}
					rowDataSelected={rowDataSelected}
				/>
			</CustomSuspense>
		</CustomDialogWithBreadcrumbs>
	)
}

export default EditStudentCopedialog
