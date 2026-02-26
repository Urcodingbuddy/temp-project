import { useEffect, useState, useRef, lazy } from 'react'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { useDispatch, useSelector } from 'react-redux'
import CustomDialogWithBreadcrumbs from '../../../components/commonComponents/CustomDialogWithBreadcrumbs'
import {
	addObservationRecord,
	isButtonEnabled,
	isDisabled,
} from './observationFunctions'
import { delay, getCurrentAcademicYearId } from '../../../utils/utils'
import CustomSuspense from '../../../components/commonComponents/CustomSuspense'
import { initialBarFilterStates } from '../../../components/commonComponents/CommonBarFilter'
const AddStudentObservation = lazy(() => import('./AddObservation'))

const AddObservationDialog = ({ open, onClose, onAddObservation }) => {
	const dispatch = useDispatch()
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const [observationData, setObservationData] = useState({})
	const [barFilterData, setBarFilterData] = useState(initialBarFilterStates)
	const [student, setStudent] = useState({})
	const isInitialLoad = useRef(true)

	const clearAllListOptionsRef = useRef()

	// Populate Academic Year
	const populateAcademicYear = async () => {
		if (academicYears.length > 0 && isInitialLoad.current) {
			const currentAYId = getCurrentAcademicYearId(academicYears)
			if (currentAYId) {
				await delay()
				setBarFilterData((prev) => ({
					...prev,
					selectdAYs: currentAYId,
				}))
			}
			isInitialLoad.current = false
		}
	}

	useEffect(() => {
		populateAcademicYear()
	}, [academicYears])

	const handleSaveClick = () => {
		addObservationRecord(
			dispatch,
			observationData,
			barFilterData.selectdSchools,
			barFilterData.selectdAYs,
			onAddObservation,
			clearAllListOptionsRef,
		)
	}
	const handleClose = () => {
		onClose()
		clearAllListOptionsRef.current?.clearAllListOptions()
	}

	return (
		<CustomDialogWithBreadcrumbs
			onClose={handleClose}
			clickableTitle={localizationConstants.observation}
			title={localizationConstants.Add}
			onClick={handleClose}
			open={open}
			saveBtnText={localizationConstants.save}
			onSave={handleSaveClick}
			disableSaveBtn={
				!isButtonEnabled(observationData) ||
				isDisabled(observationData) ||
				barFilterData?.selectedStudent?.length === 0 ||
				barFilterData?.selectedStudent === null
			}
		>
			<CustomSuspense>
				<AddStudentObservation
					barFilterData={barFilterData}
					setBarFilterData={setBarFilterData}
					student={student}
					setStudent={setStudent}
					setObservationData={setObservationData}
					clearOptionsRef={clearAllListOptionsRef}
				/>
			</CustomSuspense>
		</CustomDialogWithBreadcrumbs>
	)
}

export default AddObservationDialog
