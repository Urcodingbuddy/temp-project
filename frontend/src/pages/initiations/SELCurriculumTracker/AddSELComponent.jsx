import { useState, memo, lazy, useRef } from 'react'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { useDispatch } from 'react-redux'
import { addSelTracker } from './SELFunctions'
import CustomDialogWithBreadcrumbs from '../../../components/commonComponents/CustomDialogWithBreadcrumbs'
import CustomSuspense from '../../../components/commonComponents/CustomSuspense'
const SELFormCompnent = lazy(() => import('./SELFormCompnent'))

const AddSELComponent = ({ open, onClose, onAddSEL }) => {
	const clearAllListOptionsRef = useRef()
	const dispatch = useDispatch()
	const [SELData, setSELData] = useState({})
	const [disbaleSaveBtn, setDisabaleSaveBtn] = useState(true)

	const handleClose = () => {
		onClose()
		clearAllListOptionsRef.current?.clearAllListOptions()
	}

	return (
		<CustomDialogWithBreadcrumbs
			onClose={handleClose}
			clickableTitle={localizationConstants.SELCurriculumTracker}
			title={localizationConstants.Add}
			onClick={handleClose}
			open={open}
			saveBtnText={localizationConstants.save}
			onSave={async () => {
				addSelTracker(
					dispatch,
					SELData,
					onAddSEL,
					clearAllListOptionsRef,
				)
			}}
			disableSaveBtn={disbaleSaveBtn}
		>
			{/* ------------------ SEL Form ------------------ */}
			{/* <SELForm setSELData={setSELData} edit={false} /> */}
			<CustomSuspense>
				<SELFormCompnent
					write={true}
					update={false}
					disableBarFilter={false}
					setSELData={setSELData}
					setDisabaleSaveBtn={setDisabaleSaveBtn}
					clearOptionsRef={clearAllListOptionsRef}
				/>
			</CustomSuspense>
		</CustomDialogWithBreadcrumbs>
	)
}

export default memo(AddSELComponent)
