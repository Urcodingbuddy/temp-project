import { useState, memo, lazy, Suspense } from 'react'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { useDispatch } from 'react-redux'
import CustomDialogWithBreadcrumbs from '../../../components/commonComponents/CustomDialogWithBreadcrumbs'
import { updateSelTracker } from './SELFunctions'
import CustomSuspense from '../../../components/commonComponents/CustomSuspense'
const SELFormCompnent = lazy(() => import('./SELFormCompnent'))

const EditSELComponent = ({ open, onClose, onEditSEL, rowData }) => {
	const dispatch = useDispatch()
	const [SELData, setSELData] = useState({})
	const [disbaleSaveBtn, setDisabaleSaveBtn] = useState(false)

	return (
		<CustomDialogWithBreadcrumbs
			onClose={onClose}
			clickableTitle={localizationConstants.SELCurriculumTracker}
			title={rowData?.schoolName}
			onClick={onClose}
			open={open}
			saveBtnText={localizationConstants.save}
			onSave={async () => {
				updateSelTracker(dispatch, rowData._id, SELData, onEditSEL)
			}}
			disableSaveBtn={disbaleSaveBtn}
		>
			{/* ------------------ SEL Form ------------------ */}
			<CustomSuspense>
				<SELFormCompnent
					write={true}
					update={true}
					rowData={rowData}
					disableBarFilter={false}
					setSELData={setSELData}
					setDisabaleSaveBtn={setDisabaleSaveBtn}
				/>
			</CustomSuspense>
		</CustomDialogWithBreadcrumbs>
	)
}

export default memo(EditSELComponent)
