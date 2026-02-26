import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react'
import { localizationConstants } from '../../../resources/theme/localizationConstants'

import { useDispatch, useSelector } from 'react-redux'
import { Box } from '@mui/material'
import useCommonStyles from '../../../components/styles'

import { addOrUpdate, checkStudentIEP } from './iEPFunctions'
import { initialAddform } from './iEPConstants'
import CustomDialog from '../../../components/CustomDialog'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import IEPForm from './IEPForm'
import CustomAlertDialog from '../../../components/CustomDialogForCancelling'
import { getCurACYear, getUserFromLocalStorage } from '../../../utils/utils'
import CommonBarFilter, {
	initialBarFilterStates,
} from '../../../components/commonComponents/CommonBarFilter'
import { clearStudentBaselineReport } from './iEPSlice'
import {
	clearAllStudentsForSchoolAction,
	clearListStudents,
	setClassroomsList,
	setSectionsList,
} from '../../../redux/commonSlice'

const AddIEP = forwardRef(
	(
		{ onAddIEP, onSaveStateChange, onClose, clearOptionsRef, handleClose },
		ref,
	) => {
		const flexStyles = useCommonStyles()
		const dispatch = useDispatch()
		const { academicYears } = useSelector(
			(store) => store.dashboardSliceSetup,
		)
		const [studentRecordsExist, setStudentRecordsExist] = useState(false)

		const [studentVerificationDialog, setStudentVerificationDailog] =
			useState(false)
		const user = getUserFromLocalStorage()
		const [addIEPData, setAddIEPData] = useState(initialAddform(user))
		const [dataLossOpen, setDataLossOpen] = useState(false)
		const [openConfirmationDialog, setOpenConfirmationDialog] =
			useState(false)

		const { studentBaselineReport } = useSelector(
			(store) => store.StudentIEP,
		)
		const [isBtnDisabled, setIsBtnDisabled] = useState(false)
		const [barFilterData, setBarFilterData] = useState(
			initialBarFilterStates,
		)
		const [student, setStudent] = useState({})
		const [previousStudent, setPreviousStudent] = useState(null)
		console.log(isBtnDisabled)

		const skipDialogRef = useRef(false)

		const isFirstLoad = useRef(true)

		useEffect(() => {
			if (academicYears.length > 0) {
				if (isFirstLoad.current) {
					// Initial setup only
					const curACYear = getCurACYear()
					const academicYearId = academicYears.find(
						(obj) => obj.academicYear === curACYear,
					)
					if (academicYearId) {
						setBarFilterData((state) => ({
							...state,
							selectdAYs: academicYearId._id,
						}))
					}
				}
			}
			isFirstLoad.current = false
		}, [academicYears])

		const handleSaveClick = () => {
			addOrUpdate(
				barFilterData,
				addIEPData,
				false,
				dispatch,
				student,
				addIEPData?.Evolution?.[localizationConstants.reportLink]
					?.fileName?.length > 0,
				studentBaselineReport?.isBaseLineRecordExist ?? false,
				onAddIEP,
				null,
				handleClose,
			)
		}

		const disableSave =
			isBtnDisabled || (student && Object.keys(student).length === 0)

		useEffect(() => {
			onSaveStateChange(disableSave)
		}, [disableSave])

		useImperativeHandle(ref, () => ({
			handleSaveClick,
			disableSave,
		}))

		const isFirstStudentLoad = useRef(true)

		useEffect(() => {
			if (student?._id) {
				if (isFirstStudentLoad.current) {
					setDataLossOpen(false)
					checkStudentIEP(
						{
							id: student._id,
							academicYear: barFilterData.selectdAYs,
						},
						setStudentRecordsExist,
						dispatch,
						setStudentVerificationDailog,
					)
					isFirstStudentLoad.current = false
				} else if (skipDialogRef.current) {
					skipDialogRef.current = false
				} else {
					if (previousStudent?._id) {
						setDataLossOpen(true)
					} else {
						checkStudentIEP(
							{
								id: student._id,
								academicYear: barFilterData.selectdAYs,
							},
							setStudentRecordsExist,
							dispatch,
							setStudentVerificationDailog,
						)
					}
				}
			}
		}, [student])

		useEffect(() => {
			setAddIEPData(initialAddform(user))
			dispatch(clearStudentBaselineReport())
			setPreviousStudent(null)
		}, [barFilterData.selectdAYs])

		console.log(barFilterData)
		console.log(previousStudent)

		return (
			<Box className={flexStyles.flexColumn} gap={'20px'}>
				<Box>
					<CommonBarFilter
						barFilterData={barFilterData}
						setBarFilterData={setBarFilterData}
						isStudentRequired={true}
						setStudent={(newStudent) => {
							if (
								student?._id &&
								student?._id !== newStudent?._id &&
								studentRecordsExist
							) {
								setPreviousStudent(student)
							} else {
								setPreviousStudent(null)
							}
							setStudentVerificationDailog(false)
							setStudent(newStudent)
						}}
						dropdownOptions={{
							academicYear: true,
							school: true,
							classroom: true,
							section: true,
							student: true,
							search: true,
						}}
						ref={clearOptionsRef}
					/>
				</Box>

				{student && Object.keys(student).length ? (
					<IEPForm
						addIEPData={addIEPData}
						isBaselineExist={
							studentBaselineReport?.isBaseLineRecordExist ??
							false
						}
						setAddIEPData={setAddIEPData}
						studentBaselineReport={studentBaselineReport}
						readOnly={false}
						setIsBtnDisabled={setIsBtnDisabled}
					/>
				) : null}

				<CustomDialog
					isOpen={studentVerificationDialog}
					onClose={() => setStudentVerificationDailog(false)}
					title={localizationConstants?.sendChecklistDatanotFound}
					iconName={iconConstants.alertTriangle}
					titleSx={{
						color: 'textColors.red',
						fontWeight: 500,
						pb: '20px',
					}}
					titleTypoVariant={typographyConstants.h4}
					message={localizationConstants.sendChecklistDatanotFoundMsg}
					messageTypoVariant={typographyConstants.h5}
					rightButtonText={'Ok'}
					onRightButtonClick={() => {
						setStudentVerificationDailog(false)
						setPreviousStudent(null)
						setIsBtnDisabled(true)
						setBarFilterData((state) => ({
							...state,
							selectdSchools: '',
							selectdClassrooms: [],
							selectdSections: '',
							selectedStudent: '',
							className: '',
							sectionName: '',
							searchText: '',
						}))
						dispatch(clearListStudents())
						dispatch(setClassroomsList([]))
						dispatch(setSectionsList([]))
						dispatch(clearAllStudentsForSchoolAction())
						dispatch(clearStudentBaselineReport())
					}}
					rightButtonSx={{ width: '340px' }}
					iconSx={{ height: '30px', width: '30px' }}
				/>
				<CustomDialog
					isOpen={dataLossOpen}
					title={localizationConstants.dataResetAlert}
					iconName={iconConstants.alertTriangle}
					message={localizationConstants.dataResetAlertMsg}
					titleSx={{
						color: 'textColors.red',
						fontWeight: 500,
						pb: '20px',
					}}
					titleTypoVariant={typographyConstants.h4}
					messageTypoVariant={typographyConstants.h5}
					leftButtonText={localizationConstants.cancel}
					rightButtonText={localizationConstants.yesDelete}
					onLeftButtonClick={() => {
						skipDialogRef.current = true

						if (previousStudent) {
							setStudent(previousStudent)
							setBarFilterData((prev) => ({
								...prev,
								selectedStudent: previousStudent?._id,
							}))
						}
						setDataLossOpen(false)
					}}
					onRightButtonClick={() => {
						setAddIEPData(initialAddform(user))
						dispatch(clearStudentBaselineReport())
						setStudentRecordsExist(false)
						setDataLossOpen(false)
						setIsBtnDisabled(true)
						checkStudentIEP(
							{
								id: student._id ?? '',
								academicYear: barFilterData.selectdAYs,
							},
							setStudentRecordsExist,
							dispatch,
							setStudentVerificationDailog,
						)
					}}
				/>
				<CustomAlertDialog
					isOpen={openConfirmationDialog}
					title={localizationConstants.confirmation}
					iconName={iconConstants.alertOctagon}
					message={localizationConstants.cancelConfirmationMsg}
					titleSx={{
						color: 'textColors.red',
						fontWeight: 500,
						pb: '20px',
						pt: '25px',
					}}
					titleTypoVariant={typographyConstants.h4}
					messageTypoVariant={typographyConstants.h5}
					leftButtonText={localizationConstants.cancel}
					rightButtonText={localizationConstants.yes}
					onLeftButtonClick={() => setOpenConfirmationDialog(false)}
					onRightButtonClick={() => {
						setOpenConfirmationDialog(false)
						onClose()
					}}
				/>
			</Box>
		)
	},
)

export default AddIEP
