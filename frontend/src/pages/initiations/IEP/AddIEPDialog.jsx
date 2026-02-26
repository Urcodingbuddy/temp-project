import React, { lazy, useRef, useState } from 'react'
import CustomDialogWithBreadcrumbs from '../../../components/commonComponents/CustomDialogWithBreadcrumbs'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomSuspense from '../../../components/commonComponents/CustomSuspense'
const AddIEP = lazy(() => import('./AddIEP'))

const AddIEPDialog = ({ open, onClose, refreshListAndCloseDialog }) => {
	const clearAllListOptionsRef = useRef()
	const IEPRef = useRef()
	const [disableSave, setDisableSave] = useState(true)

	const handleClose = () => {
		onClose()
		clearAllListOptionsRef.current?.clearAllListOptions()
	}
	return (
		<CustomDialogWithBreadcrumbs
			onClose={handleClose}
			clickableTitle={localizationConstants.IEP}
			title={localizationConstants.Add}
			open={open}
			saveBtnText={localizationConstants.save}
			onSave={() => {
				IEPRef.current?.handleSaveClick()
			}}
			disableSaveBtn={disableSave}
		>
			<CustomSuspense>
				<AddIEP
					ref={IEPRef}
					onAddIEP={refreshListAndCloseDialog}
					onSaveStateChange={setDisableSave}
					onClose={onClose}
					clearOptionsRef={clearAllListOptionsRef}
					handleClose={handleClose}
				/>
			</CustomSuspense>
		</CustomDialogWithBreadcrumbs>
	)
}

export default AddIEPDialog
