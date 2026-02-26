import React, { lazy, useRef, useState } from 'react'
import CustomDialogWithBreadcrumbs from '../../../components/commonComponents/CustomDialogWithBreadcrumbs'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomSuspense from '../../../components/commonComponents/CustomSuspense'

const EditIEP = lazy(() => import('./EditIEP'))

const EditIEPDialog = ({
	open,
	onClose,
	refreshListAndCloseDialog,
	rowDataSelected,
}) => {
	const IEPRef = useRef()
	const [disableSave, setDisableSave] = useState(true)

	return (
		<CustomDialogWithBreadcrumbs
			onClose={onClose}
			clickableTitle={localizationConstants.IEP}
			title={rowDataSelected?.studentName}
			open={open}
			saveBtnText={localizationConstants.save}
			onSave={() => IEPRef.current?.handleSaveClick()}
			disableSaveBtn={disableSave}
		>
			<CustomSuspense>
				<EditIEP
					ref={IEPRef}
					rowDataSelected={rowDataSelected}
					onEditIEP={refreshListAndCloseDialog}
					onSaveStateChange={setDisableSave}
					handleClose={onClose}
				/>
			</CustomSuspense>
		</CustomDialogWithBreadcrumbs>
	)
}

export default EditIEPDialog
