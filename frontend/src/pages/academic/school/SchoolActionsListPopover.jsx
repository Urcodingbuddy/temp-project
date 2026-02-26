import { Box, Button, Popover } from '@mui/material'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { useEffect, useState } from 'react'
import {
	StudentsSectionShift,
	clearAllStudentsForSchoolAction,
	markStudentAsExited,
	markStudentAsGraduated,
	promoteStudentsToNextClass,
} from '../../../redux/commonSlice'
import SchoolActionsComponent from './SchoolActionsComponent'
import { useDispatch, useSelector } from 'react-redux'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import SchoolAcademicYearsComponent from './schoolAcademicYears'
import CustomAlertDialogs from '../../../components/commonComponents/CustomAlertDialogs'
import { formatDate, getCurrentAcademicYearId } from '../../../utils/utils'

const initPopovers = {
	shift: false,
	graduate: false,
	exit: false,
}

const SchoolActionsListPopOver = ({
	open,
	anchorElForList,
	handleCloseListPopover,
	isAdminUser,
	handleActionTypes,
	isEditButtonClicked,
	schoolId,
	refreshSchoolList,
	handleModals,
	setInputs,
}) => {
	const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false)
	// const [openShiftSectionDialog, setopenShiftSectionDialog] = useState(false)
	// const [openGraduationDialog, setOpenGraduationDialog] = useState(false)
	// const [openStudentExitionDialog, setOpenStudentExitionDialog] =
	// 	useState(false)
	const [popovers, setPopovers] = useState({ ...initPopovers })
	const [openAlertDialogs, setOpenAlertDialogs] = useState({
		promote: false,
		graduate: false,
	})
	const [lastPromotionDate, setLastPromotionDate] = useState('')
	const [dynamicText1, setDynamicText1] = useState('')
	const [dynamicText2, setDynamicText2] = useState('')
	const [openScAcYear, setOpenScAcYear] = useState(false)
	const dispatch = useDispatch()
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const { allSchools } = useSelector((state) => state.school)

	const handleDialogOpen = (dialogType) => {
		if (schoolId && academicYears?.length) {
			const selectedSchool = allSchools?.data?.find(
				(school) => school._id === schoolId,
			)
			if (selectedSchool) {
				const lastPromotionAcy =
					selectedSchool.lastPromotionAcademicYear
				const currentAcyId = getCurrentAcademicYearId(academicYears)
				const lastPromotionYearObj = academicYears.find(
					(acy) => acy._id === lastPromotionAcy,
				)

				if (lastPromotionYearObj) {
					const lastPromotionYear = lastPromotionYearObj.academicYear
					setDynamicText1(lastPromotionYear)

					const lastPromotionOrder = lastPromotionYearObj.order
					const nextYearObj = academicYears.find(
						(acy) => acy.order === lastPromotionOrder + 1,
					)
					const nextYear = nextYearObj
						? nextYearObj.academicYear
						: `${parseInt(lastPromotionYear.split('-')[0]) + 1}-${parseInt(lastPromotionYear.split('-')[1]) + 1}`
					setDynamicText2(nextYear)

					if (currentAcyId === lastPromotionAcy) {
						if (dialogType === 'promote') {
							setOpenConfirmationDialog(false)
							setOpenAlertDialogs((prev) => ({
								...prev,
								promote: true,
							}))
						} else if (dialogType === 'graduate') {
							handlePopovers('graduate', false)
							setOpenAlertDialogs((prev) => ({
								...prev,
								graduate: true,
							}))
						}
					} else {
						setOpenAlertDialogs((prev) => ({
							...prev,
							[dialogType]: false,
						}))
						if (dialogType === 'promote') {
							setOpenConfirmationDialog(true)
						} else if (dialogType === 'graduate') {
							handlePopovers('graduate', true)
						}
					}
				}
			}
		}
		handleCloseListPopover()
	}

	const handlePopovers = (type, value) => {
		setPopovers((state) => ({ ...state, [type]: value }))
	}

	useEffect(() => {
		if (schoolId && allSchools?.data) {
			const selectedSchool = allSchools.data.find(
				(school) => school._id === schoolId,
			)
			if (selectedSchool) {
				const lastPromotionDate = selectedSchool.lastPromotionDate
				setLastPromotionDate(formatDate(lastPromotionDate, 'date'))
			}
		}
	}, [schoolId, allSchools])

	return (
		<>
			<Popover
				open={open}
				anchorEl={anchorElForList}
				onClose={handleCloseListPopover}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
				slotProps={{
					paper: {
						sx: {
							borderRadius: '6px',
							backgroundColor: '#FFFFFF',
						},
					},
				}}
			>
				<Box
					sx={{
						p: 2,
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					{isAdminUser && !isEditButtonClicked && (
						<>
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
								}}
							>
								<CustomIcon
									name={iconConstants.Edit}
									style={{
										width: '20px',
										height: '20px',
									}}
								/>
								<Button
									sx={{
										textTransform: 'none',
										color: 'black',
										fontWeight: 800,
										fontSize: '14px',
									}}
									onClick={() => {
										handleCloseListPopover()
										handleActionTypes('edit')
									}}
								>
									{localizationConstants.editSchoolDetails}
								</Button>
							</Box>

							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
								}}
							>
								<CalendarMonthOutlinedIcon
									sx={{
										color: 'red',
										width: '20px',
										height: '20px',
									}}
								/>
								<Button
									sx={{
										textTransform: 'none',
										color: 'black',
										fontWeight: 800,
										fontSize: '14px',
									}}
									onClick={() => {
										handleCloseListPopover()
										setOpenScAcYear(true)
									}}
								>
									{localizationConstants.edit}{' '}
									{localizationConstants.academicYear}s
								</Button>
							</Box>
						</>
					)}
					{/* ----------- mark student as exit ----------- */}
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<CustomIcon
							name={iconConstants.exit}
							style={{
								width: '25px',
								height: '25px',
							}}
						/>
						<Button
							sx={{
								textTransform: 'none',
								color: 'black',
								fontWeight: 800,
								fontSize: '14px',
							}}
							onClick={() => {
								handlePopovers('exit', true)
								handleCloseListPopover()
							}}
						>
							{' '}
							{localizationConstants.markStudentsasExited}
						</Button>
					</Box>
					{/* ----------- Mark Student as graduate ----------- */}

					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<CustomIcon
							name={iconConstants.graduation}
							style={{
								width: '25px',
								height: '25px',
							}}
						/>
						<Button
							sx={{
								textTransform: 'none',
								color: 'black',
								fontWeight: 800,
								fontSize: '14px',
							}}
							onClick={() => handleDialogOpen('graduate')}
						>
							{' '}
							{localizationConstants.markStudentsasGraduate}
						</Button>
					</Box>
					{/* ----------- Promote Students ----------- */}
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<CustomIcon
							name={iconConstants.Promote}
							style={{
								width: '25px',
								height: '25px',
							}}
						/>
						<Button
							sx={{
								textTransform: 'none',
								color: 'black',
								fontWeight: 800,
								fontSize: '14px',
							}}
							onClick={() => handleDialogOpen('promote')}
						>
							{localizationConstants.promoteStudents}
						</Button>
					</Box>
					{/* ----------- shift section ----------- */}
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<CustomIcon
							name={iconConstants.ShiftSection}
							style={{
								width: '25px',
								height: '25px',
							}}
						/>
						<Button
							sx={{
								textTransform: 'none',
								color: 'black',
								fontWeight: 800,
								fontSize: '14px',
							}}
							onClick={() => {
								handlePopovers('shift', true)
								handleCloseListPopover()
							}}
						>
							{localizationConstants.shiftSections}
						</Button>
					</Box>
				</Box>
			</Popover>
			<CustomAlertDialogs
				open={openConfirmationDialog}
				setOpen={setOpenConfirmationDialog}
				type={localizationConstants.promoteStudentWarning}
				title={localizationConstants.promoteStudents}
				dynamicText1={dynamicText1}
				dynamicText2={dynamicText2}
				onSubitClick={async () => {
					const body = {
						schoolId: schoolId,
					}
					await dispatch(promoteStudentsToNextClass({ body }))
					setOpenConfirmationDialog(false)
					handleCloseListPopover()
					refreshSchoolList()
					handleModals('editSchool', false)
					handleModals('viewSchool', false)
				}}
				onCancelClick={() => setOpenConfirmationDialog(false)}
				iconName={iconConstants.promotBiggerIcon}
			/>

			{popovers.shift && (
				<SchoolActionsComponent
					isOpen={popovers.shift}
					onClose={() => {
						handlePopovers('shift', false)
						dispatch(clearAllStudentsForSchoolAction())
					}}
					schoolId={schoolId}
					title={localizationConstants.shiftSection}
					apiFunction={StudentsSectionShift}
					isSectionShiftDialog={true}
					note={localizationConstants.shiftSectionNote}
					handlePopovers={handlePopovers}
				/>
			)}

			{popovers.graduate && (
				<SchoolActionsComponent
					isOpen={popovers.graduate}
					onClose={() => {
						handlePopovers('graduate', false)
						dispatch(clearAllStudentsForSchoolAction())
					}}
					schoolId={schoolId}
					title={localizationConstants.markStudentsasGraduate}
					apiFunction={markStudentAsGraduated}
					isSectionShiftDialog={false}
					handlePopovers={handlePopovers}
				/>
			)}

			{popovers.exit && (
				<SchoolActionsComponent
					isOpen={popovers.exit}
					onClose={() => {
						handlePopovers('exit', false)
						dispatch(clearAllStudentsForSchoolAction())
					}}
					schoolId={schoolId}
					title={localizationConstants.markStudentsasExited}
					apiFunction={markStudentAsExited}
					isSectionShiftDialog={false}
					note={localizationConstants.markAsExitNote}
					handlePopovers={handlePopovers}
				/>
			)}

			{openScAcYear && (
				<SchoolAcademicYearsComponent
					isOpen={openScAcYear}
					onClose={() => {
						setOpenScAcYear(false)
						dispatch(clearAllStudentsForSchoolAction())
					}}
					title={`${localizationConstants.schoolAcademicYear}s`}
					schoolId={schoolId}
					selectedSchool={allSchools?.data?.find(
						(school) => school._id === schoolId,
					)}
					setInputs={setInputs}
				/>
			)}
			<CustomAlertDialogs
				open={openAlertDialogs.promote}
				setOpen={(value) =>
					setOpenAlertDialogs((prev) => ({ ...prev, promote: value }))
				}
				type={localizationConstants.alertPromotion}
				title={localizationConstants.promoteAlertTitle}
				dynamicText1={lastPromotionDate}
				onSubitClick={() => {
					setOpenAlertDialogs((prev) => ({ ...prev, promote: false }))
				}}
				iconName={iconConstants.alertTriangle}
			/>
			<CustomAlertDialogs
				open={openAlertDialogs.graduate}
				setOpen={(value) =>
					setOpenAlertDialogs((prev) => ({
						...prev,
						graduate: value,
					}))
				}
				type={localizationConstants.alertGraduate}
				title={localizationConstants.graduateAlerttitle}
				onSubitClick={() => {
					setOpenAlertDialogs((prev) => ({
						...prev,
						graduate: false,
					}))
				}}
				iconName={iconConstants.alertTriangle}
			/>
		</>
	)
}

export default SchoolActionsListPopOver
