import { Box, Button, Popover } from '@mui/material'
import { localizationConstants } from '../resources/theme/localizationConstants'
import CustomIcon from './CustomIcon'
import { iconConstants } from '../resources/theme/iconConstants'
import { typographyConstants } from '../resources/theme/typographyConstants'
import { useState } from 'react'
import PromoteStudentsComponent from './PromoteStudentsComponent'
import {
	markSingleStudentAsExited,
	markSingleStudentAsGraduated,
} from '../redux/commonSlice'
import { useDispatch, useSelector } from 'react-redux'
import CustomDialog from './CustomDialog'
import { handleDeleteStudent } from '../pages/academic/students/studentsFunctions'
import { setRecallStudentApi } from '../pages/academic/students/studentsSlice'
import { getCurrentAcademicYearId } from '../utils/utils'
import CustomAlertDialogs from './commonComponents/CustomAlertDialogs'

const StudentActionsPopOver = ({
	open,
	anchorElForList,
	handleCloseListPopover,
	isEditButtonClicked,
	setIsEditBtnClicked,
	studentRowData,
	setEditStudentDrawer,
	refreshList,
}) => {
	const [openGraduationDialog, setOpenGraduationDialog] = useState(false)
	const [openStudentExitionDialog, setOpenStudentExitionDialog] =
		useState(false)
	const dispatch = useDispatch()

	const [deleteStudentDialog, setDeleteStudentDialog] = useState(false)
	const { schoolsList } = useSelector((store) => store.commonData)
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const [openAlertGraduate, setOpenAlertGraduate] = useState('')

	const hanldeGraduateClick = () => {
		const selectedSchool = schoolsList.find(
			(school) => school._id === studentRowData?.school?._id,
		)
		const lastPromotionAcy = selectedSchool?.lastPromotionAcademicYear
		const currentAcyId = getCurrentAcademicYearId(academicYears)
		if (!lastPromotionAcy) {
			setOpenAlertGraduate(true)
			setOpenGraduationDialog(false)
		}

		if (currentAcyId === lastPromotionAcy) {
			setOpenAlertGraduate(true)
			setOpenGraduationDialog(false)
		} else {
			setOpenGraduationDialog(true)
			setOpenAlertGraduate(false)
		}
	}

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
					{!isEditButtonClicked && (
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
									setIsEditBtnClicked(true)
								}}
							>
								{localizationConstants.edit}
							</Button>
						</Box>
					)}

					{!studentRowData?.graduated && !studentRowData?.exited && (
						<>
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
									onClick={() => {
										handleCloseListPopover()
										hanldeGraduateClick()
									}}
								>
									{' '}
									{localizationConstants.MarkasGraduated}
								</Button>
							</Box>

							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
								}}
							>
								<CustomIcon
									name={iconConstants.markAsExited}
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
										handleCloseListPopover()
										setOpenStudentExitionDialog(true)
									}}
								>
									{' '}
									{localizationConstants.MarkasExited}
								</Button>
							</Box>
						</>
					)}

					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<CustomIcon
							name={iconConstants.deleteStudentRed}
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
							onClick={() => setDeleteStudentDialog(true)}
						>
							{' '}
							{localizationConstants.deleteStudent}
						</Button>
					</Box>
				</Box>
			</Popover>

			<CustomDialog
				isOpen={deleteStudentDialog}
				title={localizationConstants.deleteStudent}
				iconName={iconConstants.academicRed}
				message={localizationConstants.removeStudentMsg}
				titleSx={{
					color: 'textColors.red',
					fontWeight: 500,
					pb: '20px',
				}}
				titleTypoVariant={typographyConstants.h4}
				messageTypoVariant={typographyConstants.h5}
				leftButtonText={localizationConstants.cancel}
				rightButtonText={localizationConstants.yesRemove}
				onLeftButtonClick={() => setDeleteStudentDialog(false)}
				onRightButtonClick={() => {
					handleDeleteStudent(
						dispatch,
						studentRowData?._id,
						setDeleteStudentDialog,
						setEditStudentDrawer,
						refreshList,
					)
				}}
			/>

			<PromoteStudentsComponent
				isOpen={openGraduationDialog}
				iconName={iconConstants.graduation}
				title={localizationConstants.MarkStudentAsGraduated}
				message={localizationConstants.promoteSingleStudentGraduatedMsg}
				titleSx={{ color: 'black', fontWeight: 500 }}
				titleTypoVariant={typographyConstants.h4}
				messageTypoVariant={typographyConstants.h5}
				leftButtonText={localizationConstants.cancel}
				rightButtonText={localizationConstants.yes}
				onLeftButtonClick={() => setOpenGraduationDialog(false)}
				onRightButtonClick={async () => {
					const body = {
						studentId: studentRowData?._id,
					}
					const res = await dispatch(
						markSingleStudentAsGraduated({ body }),
					)
					if (!res?.error) {
						setOpenGraduationDialog(false)
						handleCloseListPopover()
						setEditStudentDrawer(false)
						dispatch(setRecallStudentApi(true))
						refreshList()
					}
				}}
			/>

			<PromoteStudentsComponent
				isOpen={openStudentExitionDialog}
				iconName={iconConstants.markAsExited}
				title={localizationConstants.MarkStudentAsExited}
				message={localizationConstants.promoteSingleStudentExitedMsg}
				titleSx={{ color: 'black', fontWeight: 500 }}
				titleTypoVariant={typographyConstants.h4}
				messageTypoVariant={typographyConstants.h5}
				leftButtonText={localizationConstants.cancel}
				rightButtonText={localizationConstants.yes}
				onLeftButtonClick={() => setOpenStudentExitionDialog(false)}
				onRightButtonClick={async () => {
					const body = {
						studentId: studentRowData?._id,
					}
					const res = await dispatch(
						markSingleStudentAsExited({ body }),
					)
					if (!res?.error) {
						setOpenStudentExitionDialog(false)
						handleCloseListPopover()
						setEditStudentDrawer(false)
						dispatch(setRecallStudentApi(true))
						refreshList()
					}
				}}
			/>
			<CustomAlertDialogs
				open={openAlertGraduate}
				setOpen={setOpenAlertGraduate}
				type={localizationConstants.singleStudentGraduateAlert}
				title={localizationConstants.cannotGraduate}
				onSubitClick={() => {
					setOpenAlertGraduate(false)
				}}
				iconName={iconConstants.alertTriangle}
			/>
		</>
	)
}

export default StudentActionsPopOver
