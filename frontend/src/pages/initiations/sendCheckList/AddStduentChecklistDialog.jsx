import React, { lazy, useRef, useState } from 'react'
import CustomDialogWithBreadcrumbs from '../../../components/commonComponents/CustomDialogWithBreadcrumbs'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomSuspense from '../../../components/commonComponents/CustomSuspense'
const AddStudentChecklist = lazy(() => import('./AddStudentChecklist'))

const AddStduentChecklistDialog = ({ open, onClose, onAddChecklist }) => {
	const clearAllListOptionsRef = useRef()
	const checkListRef = useRef()
	const [disableSave, setDisableSave] = useState(true)

	const handleClose = () => {
		onClose()
		clearAllListOptionsRef.current?.clearAllListOptions()
	}
	return (
		<CustomDialogWithBreadcrumbs
			onClose={handleClose}
			clickableTitle={localizationConstants.sendChecklist}
			title={localizationConstants.Add}
			onClick={handleClose}
			open={open}
			saveBtnText={localizationConstants.save}
			onSave={() => {
				checkListRef.current?.handleSaveClick()
			}}
			disableSaveBtn={disableSave}
		>
			<CustomSuspense>
				<AddStudentChecklist
					ref={checkListRef}
					onAddChecklist={onAddChecklist}
					onSaveStateChange={setDisableSave}
					clearOptionsRef={clearAllListOptionsRef}
					handleClose={handleClose}
				/>
			</CustomSuspense>
		</CustomDialogWithBreadcrumbs>
	)
}

export default AddStduentChecklistDialog
