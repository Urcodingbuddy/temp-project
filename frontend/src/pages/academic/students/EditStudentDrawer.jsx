import React, { useState, memo, useEffect, useRef } from 'react'

import { Box, Divider, Drawer, Typography } from '@mui/material'
import { counsellorStyles } from '../../counsellors/counsellorsStyles'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import useCommonStyles from '../../../components/styles'
import CustomButton from '../../../components/CustomButton'
import StudentForm from './StudentForm'
import { useDispatch, useSelector } from 'react-redux'
import CustomDialog from '../../../components/CustomDialog'
import { handleEditStudent, handleDeleteStudent } from './studentsFunctions'
import CustomAlertDialog from '../../../components/CustomDialogForCancelling'
import { initialStudentErrors, validateStudentKeys } from './studentsConstants'
import Toast from '../../../components/Toast'
import { getCurACYear, getCurrentAcademicYearId } from '../../../utils/utils'
import { getSchoolsList } from '../../../redux/commonSlice'

const EditStudentDrawer = ({
	editStudentDrawer,
	setEditStudentDrawer,
	studentRowData,
	schoolOptions,
	refreshList,
}) => {
	const flexStyles = useCommonStyles()
	const dispatch = useDispatch()
	const { schoolsListForValidation } = useSelector(
		(store) => store.commonData,
	)
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)

	const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false)
	const { classroomsListForStudents } = useSelector(
		(store) => store.commonData,
	)
	const [isEditBtnClicked, setIsEditBtnClicked] = useState(false)
	const [studentFormData, setStudentFormData] = useState({})
	const [deleteStudentDialog, setDeleteStudentDialog] = useState(false)
	const [errors, setErrors] = useState(initialStudentErrors)
	const [classSectionError, setClassSectionError] = useState(false)

	const handleErrors = (err, stat) => {
		const objErr = {}
		objErr[err] = stat
		setErrors((state) => ({ ...state, ...objErr }))
	}

	const validateForm = () => {
		let noError = true
		validateStudentKeys.forEach((key) => {
			if (!studentFormData[key]) {
				noError = false
				handleErrors(key, true)
			}
		})
		return noError
	}

	const submitEditStudent = () => {
		const school = schoolsListForValidation.find(
			(obj) => obj._id === studentRowData.school._id,
		)

		// Here as students list is displayed for same student older academic years records as well, we are not allowing to edit student if the record viewing is older record.
		if (
			school &&
			school.lastPromotionAcademicYear &&
			studentRowData.academicYearId &&
			school.lastPromotionAcademicYear !== studentRowData.academicYearId
		) {
			setClassSectionError(true)
			return
		}

		const validated = validateForm()
		if (!validated) {
			return
		}

		handleEditStudent(
			studentFormData,
			studentRowData,
			dispatch,
			setEditStudentDrawer,
			classroomsListForStudents,
			Array.isArray(studentFormData?.className)
				? studentFormData?.className
				: [studentFormData?.className],
			Array.isArray(studentFormData?.section)
				? studentFormData?.section
				: [studentFormData?.section],
			refreshList,
		)
		setIsEditBtnClicked(false)
	}

	const fetchSchoolList = (ay) => {
		if (ay) {
			const body = {
				filter: { academicYear: [ay] },
			}
			dispatch(getSchoolsList({ body }))
		}
	}

	const isInitialLoad = useRef(true)
	useEffect(() => {
		if (academicYears.length > 0 && isInitialLoad.current) {
			const currentAYId = getCurrentAcademicYearId(academicYears)
			if (currentAYId) {
				fetchSchoolList(currentAYId)
			}
			isInitialLoad.current = false
		}
	}, [academicYears])

	return (
		<Drawer
			anchor='right'
			sx={counsellorStyles.drawerSx}
			open={editStudentDrawer}
		>
			<Box sx={{ flexGrow: 1 }}>
				<Box
					className={flexStyles.flexRowCenterSpaceBetween}
					sx={{ pb: '12px' }}
				>
					<Typography
						variant={typographyConstants.h4}
						sx={{ fontWeight: 500, color: 'textColors.blue' }}
					>
						{localizationConstants.editStudent}
					</Typography>
					<CustomIcon
						name={iconConstants.cancelRounded}
						style={{
							cursor: 'pointer',
							width: '26px',
							height: '26px',
						}}
						svgStyle={'width: 26px; height: 26px'}
						onClick={() => {
							if (isEditBtnClicked) {
								setOpenConfirmationDialog(true)
							} else {
								setEditStudentDrawer(false)
								setErrors(initialStudentErrors)
							}
						}}
					/>
				</Box>
				<Divider />
				<Box
					sx={{
						mt: '20px',
						height: `calc(100vh - 200px)`,
						overflow: 'auto',
						pr: '10px',
					}}
				>
					<StudentForm
						studentRowData={studentRowData}
						isEditBtnClicked={isEditBtnClicked}
						errors={errors}
						handleErrors={handleErrors}
						schoolOptions={schoolOptions}
						setStudentFormData={setStudentFormData}
						setIsEditBtnClicked={setIsEditBtnClicked}
						setEditStudentDrawer={setEditStudentDrawer}
						refreshList={refreshList}
					/>
				</Box>
			</Box>
			<Box
				sx={{ pb: '32px' }}
				className={flexStyles.flexRowCenterSpaceBetween}
			>
				{isEditBtnClicked && (
					<>
						<CustomButton
							text={localizationConstants.cancel}
							typoSx={{ color: 'textColors.black' }}
							sx={{
								minWidth: '192px',
								height: '60px',
								backgroundColor: 'transparent',
								border: '1px solid',
								borderColor: 'globalElementColors.blue',
							}}
							onClick={() => {
								setIsEditBtnClicked(false)
								setErrors(initialStudentErrors)
							}}
						/>
						<CustomButton
							text={localizationConstants.submit}
							sx={{
								minWidth: '192px',
								height: '60px',
							}}
							endIcon={
								<CustomIcon
									name={iconConstants.doneWhite}
									style={{
										width: '24px',
										height: '24px',
										marginLeft: '10px',
									}}
									svgStyle={'width: 24px; height: 24px'}
								/>
							}
							// disabled={!(isDifference && !isValid)}
							onClick={submitEditStudent}
						/>
					</>
				)}
			</Box>

			<CustomAlertDialog
				isOpen={openConfirmationDialog}
				iconName={iconConstants.alertOctagon}
				title={localizationConstants.confirmation}
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
					setEditStudentDrawer(false)
					setIsEditBtnClicked(false)
					setErrors(initialStudentErrors)
				}}
			/>

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

			<CustomDialog
				isOpen={classSectionError}
				onClose={() => setClassSectionError(false)}
				title={`${localizationConstants?.cannotUpdateDetails} !`}
				iconName={iconConstants.errorFile}
				titleSx={{
					color: 'textColors.red',
					fontWeight: 500,
					pb: '20px',
				}}
				titleTypoVariant={typographyConstants.h4}
				message={localizationConstants.promoteStudentsToCurAY}
				messageTypoVariant={typographyConstants.h5}
				leftButtonText={localizationConstants.closeCamel}
				onLeftButtonClick={() => {
					setClassSectionError(false)
				}}
			/>
		</Drawer>
	)
}

export default memo(EditStudentDrawer)
