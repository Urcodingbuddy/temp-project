import React, { lazy, useState } from 'react'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { useDispatch } from 'react-redux'
import { handleUpdateSingleIR } from './individualCaseFunctions'
import CustomDialogWithBreadcrumbs from '../../../components/commonComponents/CustomDialogWithBreadcrumbs'
import { userRoles } from '../../../utils/globalConstants'
import { getUserFromLocalStorage } from '../../../utils/utils'
import CustomSuspense from '../../../components/commonComponents/CustomSuspense'
import dayjs from 'dayjs'
import CustomDialog from '../../../components/CustomDialog'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
const IndividualCaseForm = lazy(() => import('./IndividualCaseForm'))

const EditStudent = ({ open, onClose, rowDataSelected, onEditIndividual }) => {
	const dispatch = useDispatch()
	const user = getUserFromLocalStorage()
	const disableEdit = user?.permissions[0] === userRoles?.superAdmin
	const [indivCaseData, setIndivCaseData] = useState({})
	const [timeErrors, setTimeErrors] = useState(false)

	const handleSaveClick = () => {
		const start = dayjs(indivCaseData.startTime)
		const end = dayjs(indivCaseData.endTime)
		const isBefore = end.format('HH:mm:ss') < start.format('HH:mm:ss')
		if (isBefore) {
			setTimeErrors(true)
			return
		}
		handleUpdateSingleIR(indivCaseData, dispatch, onEditIndividual)
	}

	return (
		<>
			<CustomDialogWithBreadcrumbs
				onClose={onClose}
				clickableTitle={localizationConstants.individualCase}
				title={rowDataSelected?.studentName}
				onClick={onClose}
				open={open}
				saveBtnText={localizationConstants.save}
				onSave={handleSaveClick}
				disableSaveBtn={disableEdit}
			>
				{/* ------------------ Case Form ------------------ */}

				<CustomSuspense>
					<IndividualCaseForm
						setIndivCaseData={setIndivCaseData}
						edit={true}
						rowData={rowDataSelected}
						add={false}
						disableEdit={disableEdit}
					/>
				</CustomSuspense>
			</CustomDialogWithBreadcrumbs>

			<CustomDialog
				isOpen={timeErrors}
				onClose={() => setTimeErrors(false)}
				iconName={iconConstants.toastError}
				titleSx={{
					color: 'textColors.red',
					fontWeight: 500,
					pb: '20px',
				}}
				msgSx={{ color: 'red' }}
				titleTypoVariant={typographyConstants.h4}
				message={localizationConstants.endtimeCannotBelessthanStartTime}
				messageTypoVariant={typographyConstants.h5}
				leftButtonText={localizationConstants.cancel}
				onLeftButtonClick={() => {
					setTimeErrors(false)
				}}
			/>
		</>
	)
}

export default EditStudent
