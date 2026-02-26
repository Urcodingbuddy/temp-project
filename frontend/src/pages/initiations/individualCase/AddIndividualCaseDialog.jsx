import { useEffect, useState, useRef, lazy } from 'react'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { useDispatch, useSelector } from 'react-redux'
import { addStudentRecord } from './individualCaseFunctions'

import { requestParams } from '../../../utils/apiConstants'
import useDebounce from '../../../customHooks/useDebounce'
import { searchStudent } from './individualCaseFunctions'

import { delay, getCurrentAcademicYearId } from '../../../utils/utils'
import CustomDialogWithBreadcrumbs from '../../../components/commonComponents/CustomDialogWithBreadcrumbs'
import { selectAndPopulateStudents } from '../../dashboard/dashboardFunctions'
import CustomSuspense from '../../../components/commonComponents/CustomSuspense'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { iconConstants } from '../../../resources/theme/iconConstants'
import CustomDialog from '../../../components/CustomDialog'
import { initialBarFilterStates } from '../../../components/commonComponents/CommonBarFilter'
import dayjs from 'dayjs'
const AddIndividualCase = lazy(() => import('./AddIndividualCase'))

const AddIndividualCaseDialog = ({ open, onClose, onAddIndividual }) => {
	const dispatch = useDispatch()
	const { allStudentsForSchoolActions } = useSelector(
		(store) => store.commonData,
	)
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)

	const [indivCaseData, setIndivCaseData] = useState({})
	const [searchValue, setSearchValue] = useState('')
	const debouncedSearch = useDebounce(searchValue, 1000)
	const [stSearchData, setStSearchData] = useState([])
	const [stSelectData, setStSelectData] = useState([])
	const [selectedStudents, setSelectedStudents] = useState([])
	const [barFilterData, setBarFilterData] = useState(initialBarFilterStates)
	const [student, setStudent] = useState({})
	const [timeErrors, setTimeErrors] = useState(false)

	const clearAllListOptionsRef = useRef()

	const isInitialLoad = useRef(true)

	const populateAcademicYear = async () => {
		if (academicYears?.length > 0 && isInitialLoad.current) {
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

	useEffect(() => {
		if (debouncedSearch?.length >= 3) {
			const body = {
				[requestParams.searchText]: debouncedSearch,
				academicYear: barFilterData.selectdAYs,
			}
			searchStudent(dispatch, body, setStSearchData)
		}
		if (debouncedSearch?.length === 0) {
			setStSearchData([])
		}
	}, [debouncedSearch, dispatch])

	const handleStudentSelect = (newValue) => {
		selectAndPopulateStudents(
			dispatch,
			newValue,
			allStudentsForSchoolActions,
			barFilterData,
			setBarFilterData,
			setStudent,
		)
	}

	const disableCondition = () => {
		if (
			barFilterData?.selectedStudent === '' ||
			barFilterData?.selectedStudent === null
		) {
			return true
		}
		if (
			indivCaseData?.stype === 'Individual' &&
			indivCaseData?.studentName?.length > 0
		) {
			return false
		} else if (indivCaseData?.stype === 'Group') {
			return selectedStudents?.length === 0
		} else {
			return true
		}
	}

	const SelectedStdsWithOrinatStd = [...selectedStudents, student?._id]

	const handleSaveClick = () => {
		const start = dayjs(indivCaseData.startTime)
		const end = dayjs(indivCaseData.endTime)
		if (end.isBefore(start)) {
			setTimeErrors(true)
			return
		}
		addStudentRecord(
			dispatch,
			indivCaseData,
			barFilterData.selectdSchools,
			barFilterData.selectdAYs,
			onAddIndividual,
			SelectedStdsWithOrinatStd,
			indivCaseData?.stype === 'Individual',
			handleClose,
		)
	}

	const handleClose = () => {
		onClose()
		clearAllListOptionsRef.current?.clearAllListOptions()
	}

	return (
		<CustomDialogWithBreadcrumbs
			onClose={handleClose}
			clickableTitle={localizationConstants.individualCase}
			title={localizationConstants.Add}
			onClick={handleClose}
			open={open}
			saveBtnText={localizationConstants.save}
			onSave={handleSaveClick}
			disableSaveBtn={disableCondition()}
		>
			<CustomSuspense>
				<AddIndividualCase
					searchValue={searchValue}
					setSearchValue={setSearchValue}
					barFilterData={barFilterData}
					setBarFilterData={setBarFilterData}
					student={student}
					setStudent={setStudent}
					stSearchData={stSearchData}
					stSelectData={stSelectData}
					selectedStudents={selectedStudents}
					setSelectedStudents={setSelectedStudents}
					setIndivCaseData={setIndivCaseData}
					handleStudentSelect={handleStudentSelect}
					clearOptionsRef={clearAllListOptionsRef}
				/>
			</CustomSuspense>

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
		</CustomDialogWithBreadcrumbs>
	)
}

export default AddIndividualCaseDialog
