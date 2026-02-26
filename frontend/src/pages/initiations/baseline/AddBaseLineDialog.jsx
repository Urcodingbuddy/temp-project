import React, { lazy, useRef, useState } from 'react'
import CustomDialogWithBreadcrumbs from '../../../components/commonComponents/CustomDialogWithBreadcrumbs'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomSuspense from '../../../components/commonComponents/CustomSuspense'
import { useSelector } from 'react-redux'

const AddBaseline = lazy(() => import('./AddBaseline'))

const AddBaseLineDialog = ({ open, onClose, onAddBaseline }) => {
	const baselineRef = useRef()
	const clearAllListOptionsRef = useRef()
	const [disableSave, setDisableSave] = useState(true)
	const { appPermissions } = useSelector((store) => store.dashboardSliceSetup)

	const handleClose = () => {
		onClose()
		clearAllListOptionsRef.current?.clearAllListOptions()
	}

	return (
		<CustomDialogWithBreadcrumbs
			onClose={handleClose}
			clickableTitle={localizationConstants.baseline}
			title={localizationConstants.Add}
			onClick={handleClose}
			open={open}
			saveBtnText={localizationConstants.save}
			onSave={() => {
				baselineRef.current?.handleSaveClick()
			}}
			disableSaveBtn={disableSave}
			permittedUser={appPermissions.BaselineManagement.edit}
		>
			<CustomSuspense>
				<AddBaseline
					ref={baselineRef}
					clearOptionsRef={clearAllListOptionsRef}
					onAddBaseline={onAddBaseline}
					onSaveStateChange={setDisableSave}
					handleClose={handleClose}
				/>
			</CustomSuspense>
		</CustomDialogWithBreadcrumbs>
	)
}

export default AddBaseLineDialog
