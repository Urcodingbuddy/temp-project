import React, { lazy, useRef, useState } from 'react'
import CustomDialogWithBreadcrumbs from '../../../components/commonComponents/CustomDialogWithBreadcrumbs'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
const EditStudentWellBeing = lazy(() => import('./EditStudentWellBeing'))

const EditStudentWllBeingDialog = ({
	open,
	onClose,
	rowDataSelected,
	refreshList,
}) => {
	const childRef = useRef()
	const [disableSave, setDisableSave] = useState(true)

	const handleClick = () => {
		if (childRef.current) {
			childRef.current.callChildFunction()
		}
	}
	return (
		<CustomDialogWithBreadcrumbs
			open={open}
			onClose={onClose}
			clickableTitle={localizationConstants.studentWellBeing}
			title={rowDataSelected?.studentName}
			onClick={onClose}
			saveBtnText={localizationConstants.save}
			onSave={handleClick}
			disableSaveBtn={disableSave}
		>
			<EditStudentWellBeing
				rowDataSelected={rowDataSelected}
				refreshList={refreshList}
				setDisableSave={setDisableSave}
				ref={childRef}
			/>
		</CustomDialogWithBreadcrumbs>
	)
}

export default EditStudentWllBeingDialog
