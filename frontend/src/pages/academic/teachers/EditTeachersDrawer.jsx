import React, { useEffect, useState } from 'react'
import useCommonStyles from '../../../components/styles'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { iconConstants } from '../../../resources/theme/iconConstants'
import CustomButton from '../../../components/CustomButton'
import { Box } from '@mui/system'
import { Divider, Drawer, Typography } from '@mui/material'
import CustomIcon from '../../../components/CustomIcon'
import { counsellorStyles } from '../../counsellors/counsellorsStyles'
import CustomDialog from '../../../components/CustomDialog'
import TeacherForm from './TeacherForm'
import { useDispatch } from 'react-redux'
import { deleteTeacher, getAllTeachers, updateTeacher } from './teachersSlice'
import { requestParams } from '../../../utils/apiConstants'
import CustomAlertDialog from '../../../components/CustomDialogForCancelling'
import Toast from '../../../components/Toast'
import {
	teacherInitialErrorState,
	validateTeacherKeys,
} from './teachersConstants'
import { validateEmail } from '../../../utils/utils'
import CustomAlertDialogs from '../../../components/commonComponents/CustomAlertDialogs'

const EditTeachersDrawer = ({
	editTeachersDrawer,
	setEditTeachersDrawer,
	teachersRowData,
	transformedSchools,
	sortKeys,
	page,
	pageSize,
	appPermissions,
	refreshList,
	academicYears,
	setTeachersRowData,
}) => {
	const flexStyles = useCommonStyles()
	const dispatch = useDispatch()
	const [isEditBtnClicked, setIsEditBtnClicked] = useState(false)
	const [noChanges, setNoChanges] = useState(false)
	const [teachersFormData, setTeachersFormData] = useState({})
	const [deleteTeachersDialog, setDeleteTeachersDialog] = useState(false)
	const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false)
	const [enableSubmit, setEnableSubmit] = useState(true)
	const [viewToast, setViewToast] = useState(false)
	const [errorToast, setErrorToast] = useState(false)
	const [errors, setErrors] = useState(teacherInitialErrorState)
	const [openAcknowledgement, setOpenAcknowledgement] = useState(false)

	const handleErrors = (err, stat) => {
		const objErr = {}
		objErr[err] = stat
		setErrors((state) => ({ ...state, ...objErr }))
	}

	const validateForm = () => {
		let noErrors = true
		validateTeacherKeys.forEach((key) => {
			if (!teachersFormData[key]) {
				noErrors = false
				handleErrors(key, true)
			}
		})

		const emailValidated = validateEmail(teachersFormData['email'])
		if (!emailValidated) {
			noErrors = false
			handleErrors('email', true)
		}

		return noErrors
	}

	useEffect(() => {
		// Reset viewToast to false whenever the drawer is opened
		if (editTeachersDrawer) {
			setViewToast(false)
		}
	}, [editTeachersDrawer])

	const handleClick = async (acknowledgement = false) => {
		if (enableSubmit) {
			setNoChanges(true)
			setTimeout(() => {
				setNoChanges(false)
			}, 2500)
			return
		}

		if (
			teachersFormData?.className?.length >= 1 &&
			teachersFormData?.section.length === 0
		) {
			setViewToast(true) // Show toast if the section is empty
			setTimeout(() => {
				setViewToast(false)
			}, 2500)
			return // Exit early to prevent the API call if validation fails
		}

		const validated = validateForm()
		if (!validated) {
			setErrorToast(true) // Show toast if the section is empty
			setTimeout(() => {
				setErrorToast(false)
			}, 2500)
			return
		}

		const body = {
			teacher_id: teachersRowData?.teacher_id,
			teacherName: teachersFormData?.teacherName,
			gender: teachersFormData?.gender,
			email: teachersFormData?.email,
			mobileNumber: teachersFormData?.mobileNumber,
			createdByName: teachersRowData?.createdByName,
			classroomIds: teachersFormData?.classRoomIds || [],
			schoolId: teachersFormData.schoolId,
		}
		if (acknowledgement) {
			body.acknowledgement = acknowledgement
		}
		const res = await dispatch(updateTeacher({ body, teachersRowData }))
		if (res.payload.acknowledgement === 1) {
			setOpenAcknowledgement(true)
			return
		}
		if (!res?.error) {
			setIsEditBtnClicked(false)
			refreshList('edit')
		}
	}

	return (
		<Drawer
			anchor='right'
			sx={counsellorStyles.drawerSx}
			open={editTeachersDrawer}
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
						{isEditBtnClicked
							? localizationConstants?.editTeacher
							: localizationConstants.viewTeacher}
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
							isEditBtnClicked
								? setOpenConfirmationDialog(true)
								: setEditTeachersDrawer(false)
						}}
					/>
				</Box>
				<Divider />
				<Box
					sx={{
						mt: '19px',
						height: appPermissions?.TeacherManagement?.edit
							? `calc(100vh - 200px)`
							: `calc(100vh - 94px)`,
						overflow: 'auto',
						pr: '10px',
					}}
				>
					<TeacherForm
						teachersRowData={teachersRowData}
						isEditBtnClicked={isEditBtnClicked}
						teachersFormData={teachersFormData}
						setTeachersFormData={setTeachersFormData}
						transformedSchools={transformedSchools}
						setEnableSubmit={setEnableSubmit}
						errors={errors}
						handleErrors={handleErrors}
						setIsEditBtnClicked={setIsEditBtnClicked}
						setDeleteTeachersDialog={setDeleteTeachersDialog}
						academicYears={academicYears}
						refreshList={refreshList}
						setTeachersRowData={setTeachersRowData}
					/>
				</Box>
			</Box>
			{appPermissions?.TeacherManagement?.edit && (
				<Box
					sx={{ pb: '32px' }}
					className={flexStyles.flexRowCenterSpaceBetween}
				>
					{isEditBtnClicked ? (
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
								onClick={() => setIsEditBtnClicked(false)}
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
								// disabled={isValid || enableSubmit}
								onClick={() => {
									handleClick()
								}}
							/>
						</>
					) : (
						<>
							{/* <CustomIcon
								name={iconConstants.deleteRed}
								style={counsellorStyles.deleteRedSx}
								svgStyle={'width: 60px; height: 60px'}
								onClick={() => setDeleteTeachersDialog(true)}
							/>
							<CustomButton
								text={localizationConstants.edit}
								sx={{
									minWidth: '324px',
									height: '60px',
								}}
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
								onClick={() => setIsEditBtnClicked(true)}
							/> */}
						</>
					)}
				</Box>
			)}
			<CustomDialog
				isOpen={deleteTeachersDialog}
				title={localizationConstants.deleteTeacher}
				iconName={iconConstants.academicRed}
				message={localizationConstants.deleteTeacherMsg}
				titleSx={{
					color: 'textColors.red',
					fontWeight: 500,
					pb: '20px',
				}}
				titleTypoVariant={typographyConstants.h4}
				messageTypoVariant={typographyConstants.h5}
				leftButtonText={localizationConstants.cancel}
				rightButtonText={localizationConstants.yesRemove}
				onLeftButtonClick={() => setDeleteTeachersDialog(false)}
				onRightButtonClick={async () => {
					const body = {
						_id: teachersRowData?._id,
					}
					const res = await dispatch(deleteTeacher({ body }))
					if (!res?.error) {
						const body = {
							[requestParams.sortKeys]: sortKeys,
							pageSize,
							page,
						}

						if (page) {
							body['page'] = page
						}
						if (pageSize) {
							body['pageSize'] = pageSize
						}
						dispatch(getAllTeachers({ body }))
						setDeleteTeachersDialog(false)
						setEditTeachersDrawer(false)
						setIsEditBtnClicked(false)
					}
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
					setEditTeachersDrawer(false)
					setIsEditBtnClicked(false)
				}}
			/>
			<CustomAlertDialogs
				open={openAcknowledgement}
				setOpen={setOpenAcknowledgement}
				type={localizationConstants.teacherUpdateAcknowledgement}
				title={localizationConstants.classroomConflictDetected}
				onSubitClick={() => {
					setOpenAcknowledgement(false)
					handleClick(true)
				}}
				onCancelClick={() => {
					setOpenAcknowledgement(false)
				}}
				iconName={iconConstants.alertTriangle}
			/>
			{viewToast && (
				<Toast
					//   title={'Section'}
					subTitle={'Section Is Required'}
					isSuccess={false}
					direction={'right'}
				/>
			)}

			{errorToast && (
				<Toast
					//   title={'Section'}
					subTitle={
						errors.email &&
						!Object.keys(errors)
							.filter((key) => key !== 'email')
							.some((key) => errors[key])
							? 'Please enter a valid email'
							: 'Please fill or select all mandatory details.'
					}
					isSuccess={false}
					direction={'right'}
				/>
			)}

			{noChanges && (
				<Toast
					//   title={'Section'}
					subTitle={localizationConstants.noChanges}
					isSuccess={false}
					direction={'right'}
				/>
			)}
		</Drawer>
	)
}

export default EditTeachersDrawer
