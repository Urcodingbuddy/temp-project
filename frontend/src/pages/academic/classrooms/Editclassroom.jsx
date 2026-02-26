import React, { useState, memo, useEffect } from 'react'
import { Box, Drawer, Typography, Divider } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import CustomButton from '../../../components/CustomButton'
import CustomIcon from '../../../components/CustomIcon'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import useCommonStyles from '../../../components/styles'
import { SchoolsStyles } from '../school/SchoolsStyles'
import ClassroomForm from './ClassroomForm'
import CustomDialog from '../../../components/CustomDialog'
import { editClassroomData, deleteClassroomData } from './classRoomFunctions'
import CustomAlertDialog from '../../../components/CustomDialogForCancelling'
import {
	initialEditClassroomsErrors,
	validateStatesClass,
} from './classroomsContants'
import { store } from '../../../store'
import { updateToastData } from '../../../toast/toastSlice'
import { getCurACYear, getCurrentAcademicYearId } from '../../../utils/utils'

const Editclassroom = ({
	modal,
	handleModal,
	rowData,
	deletable,
	refreshList,
}) => {
	const dispatch = useDispatch()
	const flexStyles = useCommonStyles()
	const [classroomFormData, setClassroomFormData] = useState({})
	const [actionTypes, setActionTypes] = useState({
		def: true,
		edit: false,
	})
	const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false)
	const [isDiffernce, setIsDiffernce] = useState(false)
	const [errors, setErrors] = useState(initialEditClassroomsErrors)
	const [teacherOptions, setTeacherOptions] = useState([])
	const [showActionBtns, setShowActionBtns] = useState(true)
	const { schoolsListForValidation } = useSelector(
		(store) => store.commonData,
	)
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const { teachersList } = useSelector((store) => store.teachers)

	const handleActionTypes = (type) => {
		const def = type === 'def',
			edit = type === 'edit'
		setActionTypes({ def, edit })
	}

	const handleErrors = (err, stat) => {
		const objErr = {}
		objErr[err] = stat
		setErrors((state) => ({ ...state, ...objErr }))
	}

	const onSubmit = () => {
		if (!isDiffernce) {
			store.dispatch(
				updateToastData({
					showToast: true,
					title: '',
					subTitle: localizationConstants.noChanges,
					isSuccess: false,
					multipleError: [],
					direction: 'right',
				}),
			)
			return
		}
		let isError = false
		validateStatesClass.forEach((key) => {
			if (!classroomFormData[key]) {
				handleErrors(key, true)
				isError = true
			}
		})

		if (isError) {
			return
		}
		editClassroomData(
			dispatch,
			rowData?._id,
			classroomFormData,
			handleModal,
			handleActionTypes,
			handleErrors,
			refreshList,
		)
	}

	useEffect(() => {
		const isArrayCheck = (data) =>
			Array.isArray(data) ? data?.[0]?.toString() : data?.toString()
		const isDif =
			isArrayCheck(classroomFormData?.school ?? '') !==
				isArrayCheck(rowData?.school?._id ?? '') ||
			isArrayCheck(classroomFormData?.className ?? '') !==
				isArrayCheck(rowData?.className ?? '') ||
			isArrayCheck(classroomFormData?.classHierarchy ?? '') !==
				isArrayCheck(rowData?.classHierarchy ?? '') ||
			isArrayCheck(classroomFormData?.section ?? '') !==
				isArrayCheck(rowData?.section ?? '') ||
			isArrayCheck(classroomFormData?.sectionHierarchy ?? '') !==
				isArrayCheck(rowData?.sectionHierarchy ?? '') ||
			isArrayCheck(classroomFormData?.teacher ?? '') !==
				isArrayCheck(rowData?.teacher ?? '')

		setIsDiffernce(isDif)
	}, [rowData, classroomFormData])

	useEffect(() => {
		if (teachersList.length > 0) {
			const options = teachersList.map((teacher) => ({
				id: teacher._id,
				label: `${teacher.teacherName} (${teacher.teacher_id})`,
			}))
			setTeacherOptions(options)
		} else {
			setTeacherOptions([])
		}
	}, [teachersList])

	useEffect(() => {
		if (rowData) {
			const classAcademicYearObject = academicYears.find(
				(obj) => obj._id === rowData?.academicYearId ?? '',
			)
			const school = schoolsListForValidation.find(
				(obj) => obj._id === rowData.school._id,
			)
			const lastPromotedAcyId = school.lastPromotionAcademicYear
			const lastPromotedAyObj = academicYears.find(
				(obj) => obj._id === lastPromotedAcyId,
			)

			if (classAcademicYearObject.order >= lastPromotedAyObj.order) {
				setShowActionBtns(true)
				setActionTypes({
					def: true,
					edit: false,
				})
			} else {
				setShowActionBtns(false)
				setActionTypes({
					def: false,
					edit: false,
				})
			}
		}
	}, [rowData])

	console.log(rowData)

	return (
		<>
			<Drawer
				anchor='right'
				sx={SchoolsStyles.drawerSx}
				open={modal.edit}
			>
				<Box sx={SchoolsStyles.drawerTopSticky}>
					<Box
						className={flexStyles.flexRowCenterSpaceBetween}
						sx={{ pb: '12px' }}
					>
						<Typography
							variant={typographyConstants.h4}
							sx={{ color: 'textColors.blue' }}
						>
							{localizationConstants.edit}{' '}
							{localizationConstants.classroom}
						</Typography>
						<CustomIcon
							name={iconConstants.cancelRounded}
							onClick={() => {
								actionTypes.edit
									? setOpenConfirmationDialog(true)
									: handleModal('edit', false)
								setErrors(initialEditClassroomsErrors)
							}}
							style={{
								cursor: 'pointer',
								width: '26px',
								height: '26px',
							}}
							svgStyle={'width: 26px; height: 26px'}
						/>
					</Box>
					<Divider />
				</Box>

				<Box sx={{ overflow: 'auto' }}>
					<ClassroomForm
						setClassroomFormData={setClassroomFormData}
						add={false}
						rowData={rowData}
						readOnly={!(showActionBtns && actionTypes.edit)}
						errors={errors}
						handleErrors={handleErrors}
						teacherOptions={teacherOptions}
					/>
				</Box>

				{actionTypes.def && (
					<Box
						className={flexStyles.flexSpaceBetween}
						sx={SchoolsStyles.drawerBottomSticky}
					>
						{deletable && (
							<Box>
								<CustomIcon
									name={iconConstants.deleteRed}
									style={{
										width: '60px',
										height: '60px',
										cursor: 'pointer',
									}}
									svgStyle={'width: 60px; height: 60px'}
									onClick={() => handleModal('delete', true)}
								/>
							</Box>
						)}
						<Box sx={{ flexGrow: '2', pl: '16px' }}>
							<CustomButton
								text={localizationConstants.edit}
								endIcon={
									<CustomIcon
										name={iconConstants.editPencilWhite}
										style={{
											width: '24px',
											height: '24px',
											marginLeft: '10px',
										}}
										svgStyle={'width: 24px; height: 24px'}
									/>
								}
								onClick={() => {
									handleActionTypes('edit')
								}}
							/>
						</Box>
					</Box>
				)}
				{showActionBtns && actionTypes.edit && (
					<Box
						className={flexStyles.flexRowCenterSpaceBetween}
						sx={SchoolsStyles.drawerBottomSticky}
					>
						<CustomButton
							variant='outlined'
							sx={{
								minWidth: '48%',
								height: '60px',
								backgroundColor: 'transparent',
							}}
							text={localizationConstants.cancel}
							onClick={() => {
								handleActionTypes('def')
								setErrors(initialEditClassroomsErrors)
							}}
						/>

						<CustomButton
							text={localizationConstants.submit}
							sx={{
								minWidth: '48%',
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
							// disabled={!(isDifference && !disableSubmit)}
							onClick={onSubmit}
						/>
					</Box>
				)}
			</Drawer>

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
					handleModal('edit', false)
					handleActionTypes('def')
				}}
			/>

			<CustomDialog
				isOpen={modal.delete}
				onClose={() => handleModal('delete', false)}
				title={`${localizationConstants.delete} ${localizationConstants.classroom}`}
				iconName={iconConstants.academicRed}
				titleSx={{
					color: 'textColors.red',
					fontWeight: 500,
					pb: '20px',
				}}
				titleTypoVariant={typographyConstants.h4}
				message={localizationConstants.deleteClassroomMsg}
				messageTypoVariant={typographyConstants.h5}
				leftButtonText={localizationConstants.cancel}
				rightButtonText={localizationConstants.yesDelete}
				onLeftButtonClick={() => handleModal('delete', false)}
				onRightButtonClick={() =>
					deleteClassroomData(
						dispatch,
						rowData?._id,
						handleModal,
						refreshList,
					)
				}
			/>
		</>
	)
}

export default memo(Editclassroom)
