import React, { lazy, useState } from 'react'
import { useDispatch } from 'react-redux'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import {
	handleSaveObservation,
	isButtonEnabled,
	isDisabled,
} from './observationFunctions'
import CustomDialogWithBreadcrumbs from '../../../components/commonComponents/CustomDialogWithBreadcrumbs'
import CustomSuspense from '../../../components/commonComponents/CustomSuspense'
const ObservationForm = lazy(() => import('./ObservationForm'))

const EditObservation = ({
	open,
	onClose,
	rowDataSelected,
	onEditObservation,
}) => {
	const dispatch = useDispatch()

	const [observationData, setObservationData] = useState({})

	const handleSaveClick = async () => {
		await handleSaveObservation(
			observationData,
			dispatch,
			rowDataSelected._id,
			onEditObservation,
		)
	}

	return (
		<CustomDialogWithBreadcrumbs
			onClose={onClose}
			clickableTitle={localizationConstants.observation}
			title={rowDataSelected?.studentName}
			onClick={onClose}
			open={open}
			saveBtnText={localizationConstants.save}
			onSave={handleSaveClick}
			disableSaveBtn={
				!isButtonEnabled(observationData) || isDisabled(observationData)
			}
		>
			{/* ------------------ Case Form ------------------ */}
			<CustomSuspense>
				<ObservationForm
					setObservationData={setObservationData}
					rowData={rowDataSelected}
					edit={true}
					add={false}
				/>
			</CustomSuspense>
		</CustomDialogWithBreadcrumbs>
	)
}

export default EditObservation
