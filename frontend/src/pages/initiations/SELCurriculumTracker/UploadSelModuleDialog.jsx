import { useState, memo, lazy, useRef } from 'react'
import { useDispatch } from 'react-redux'
import CustomSuspense from '../../../components/commonComponents/CustomSuspense'
import CustomDialogWithBreadcrumbs from '../../../components/commonComponents/CustomDialogWithBreadcrumbs'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
const SELUploadCompnent = lazy(() => import('./UploadSelModules'))

const UploadSerModuleDialog = ({ open, onClose }) => {
	const clearAllListOptionsRef = useRef()
	const dispatch = useDispatch()
	const [SELData, setSELData] = useState({})
	const [disbaleSaveBtn, setDisabaleSaveBtn] = useState(false)

	const handleClose = () => {
		onClose()
	}

	return (
		<CustomDialogWithBreadcrumbs
			onClose={handleClose}
			clickableTitle={localizationConstants.dashboard}
			title={localizationConstants.uploadSELModules}
			onClick={handleClose}
			open={open}
			saveBtnText={localizationConstants.save}
			onSave={async () => {}}
			disableSaveBtn={disbaleSaveBtn}
		>
			{/* ------------------ SEL Form ------------------ */}
			{/* <SELForm setSELData={setSELData} edit={false} /> */}
			<CustomSuspense>
				<SELUploadCompnent />
			</CustomSuspense>
		</CustomDialogWithBreadcrumbs>
	)
}

export default memo(UploadSerModuleDialog)
