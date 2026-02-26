import React, { useEffect, useState, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Chip, Drawer, Typography } from '@mui/material'
import { counsellorStyles } from './counsellorsStyles'
import { typographyConstants } from '../../resources/theme/typographyConstants'
import { localizationConstants } from '../../resources/theme/localizationConstants'
import CustomIcon from '../../components/CustomIcon'
import { iconConstants } from '../../resources/theme/iconConstants'
import {
	handleEditCounsellorDrawerClose,
	handleEditCounsellorSubmit,
	handleResendEditCounsellor,
} from './counsellorFunctions'
import CustomTextfield from '../../components/CustomTextField'
import CustomButton from '../../components/CustomButton'
import { updateDeleteCounsellorDrawer } from './counsellorSlice'
import CustomDialog from '../../components/CustomDialog'
import AssignSchool from './AssignSchool'
import { invalidTest } from '../initiations/individualCase/individualCaseConstants'
import CustomAutocompleteNew from '../../components/commonComponents/CustomAutoComplete'
import { counselorTypeOptions } from './counselorConstants'

const EditCounsellorDrawer = ({
	editCounsellorDrawer,
	setEditCounsellorDrawer,
	selectedRowData,
	counsellorId,
	filterKeys,
	refreshList,
}) => {
	const dispatch = useDispatch()

	const [schools, setSchools] = useState([])
	const [isEditButtonClicked, setIsEditButtonClicked] = useState(false)
	const [schoolId, setSchoolId] = useState([])

	const [editedFirstName, setEditedFirstName] = useState('')
	const [editedLastName, setEditedLastName] = useState('')
	const [editedEmail, setEditedEmail] = useState('')
	const [editedMobileNumber, setEditedMobileNumber] = useState('')
	const [selectedPermission, setSelectedPermission] = useState('')

	const [removeSchoolDrawer, setRemoveSchoolDrawer] = useState(false)
	const [assignSchoolDrawer, setAssignSchoolDrawer] = useState(false)
	const [selectedSchId, setSelectedSchId] = useState('')

	const { schoolsList } = useSelector((store) => store.commonData)

	const handleSchools = (schoolsids) => {
		const list = schoolsList?.filter((sc) => schoolsids.includes(sc._id))
		setSchools(list)
	}

	const isFormValid =
		editedFirstName?.trim() !== '' &&
		editedEmail?.trim() !== '' &&
		!isNaN(editedMobileNumber) &&
		!invalidTest.includes(editedMobileNumber) &&
		selectedPermission !== '' &&
		/^\d{10}$/.test(editedMobileNumber.toString())

	useEffect(() => {
		setEditedFirstName(selectedRowData?.firstName || '')
		setEditedLastName(selectedRowData?.lastName || '')
		setEditedEmail(selectedRowData?.email || '')
		setEditedMobileNumber(selectedRowData?.phone || '')

		setSelectedPermission(selectedRowData?.permissions?.[0] || '')

		const isPeeguCounselor = selectedRowData?.permissions?.includes(
			localizationConstants.peeguCounsellor,
		)

		const isSchoolCounselor = selectedRowData?.permissions?.includes(
			localizationConstants.schoolCounsellor,
		)

		if (isPeeguCounselor && isSchoolCounselor) {
			setSelectedPermission(localizationConstants.schoolCounsellor)
		} else if (isPeeguCounselor) {
			setSelectedPermission(localizationConstants.peeguCounsellor)
		}

		setSchools(selectedRowData?.assignedSchools || [])
	}, [selectedRowData, isEditButtonClicked])

	return (
		<>
			<Drawer
				anchor='right'
				sx={counsellorStyles.drawerSx}
				open={editCounsellorDrawer}
			>
				{/* Header */}
				<Box sx={counsellorStyles.drawerHeaderSx}>
					<Typography sx={counsellorStyles.drawerTitleSx}>
						{localizationConstants.editUser}
					</Typography>
					<CustomIcon
						name={iconConstants.cancelRounded}
						onClick={() => {
							handleEditCounsellorDrawerClose(setEditCounsellorDrawer)
							setIsEditButtonClicked(false)
						}}
						style={{
							cursor: 'pointer',
							width: '24px',
							height: '24px',
						}}
						svgStyle={'width: 24px; height: 24px'}
					/>
				</Box>

				{/* Form Content */}
				<Box sx={{ overflow: 'auto', flexGrow: 1, pb: '16px' }}>
					{/* Status Bar */}
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							mb: '20px',
							p: '12px',
							backgroundColor: 'grey.50',
							borderRadius: '8px',
						}}
					>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
							<Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>
								{localizationConstants.status}:
							</Typography>
							<Chip
								label={selectedRowData?.status?.toUpperCase()}
								size='small'
								sx={{
									fontSize: '11px',
									fontWeight: 600,
									height: '22px',
									...(selectedRowData?.status === localizationConstants.active
										? {
												backgroundColor: 'success.light',
												color: 'success.dark',
											}
										: {
												backgroundColor: 'info.light',
												color: 'info.dark',
											}),
								}}
							/>
						</Box>
						{selectedRowData?.status === localizationConstants.invited &&
							isEditButtonClicked && (
								<Typography
									sx={{
										fontSize: '13px',
										color: 'primary.main',
										cursor: 'pointer',
										fontWeight: 500,
										'&:hover': { textDecoration: 'underline' },
									}}
									onClick={() =>
										handleResendEditCounsellor(selectedRowData, dispatch)
									}
								>
									{localizationConstants.resend}
								</Typography>
							)}
					</Box>

					{/* Name Fields */}
					<Box
						sx={{
							display: 'flex',
							gap: '12px',
							mb: '16px',
						}}
					>
						<CustomTextfield
							formSx={{ flex: 1 }}
							propSx={{ height: '40px' }}
							labelTypoSx={{ fontSize: '13px', pb: '4px' }}
							labelText={localizationConstants.firstName}
							placeholder={localizationConstants.enterFirstName}
							value={editedFirstName}
							readOnly={!isEditButtonClicked}
							onChange={(e) => setEditedFirstName(e.target.value)}
						/>
						<CustomTextfield
							formSx={{ flex: 1 }}
							propSx={{ height: '40px' }}
							labelTypoSx={{ fontSize: '13px', pb: '4px' }}
							labelText={localizationConstants.lastName}
							placeholder={localizationConstants.enterLastName}
							value={editedLastName}
							readOnly={!isEditButtonClicked}
							onChange={(e) => setEditedLastName(e.target.value)}
						/>
					</Box>

					{/* Email Field */}
					<Box sx={{ mb: '16px' }}>
						<CustomTextfield
							labelText={localizationConstants.emailId}
							propSx={{ height: '40px' }}
							formSx={{ width: '100%' }}
							labelTypoSx={{ fontSize: '13px', pb: '4px' }}
							placeholder={localizationConstants.enterEmailId}
							value={editedEmail}
							readOnly={!isEditButtonClicked}
							onChange={(e) => setEditedEmail(e.target.value)}
						/>
					</Box>

					{/* Mobile Number Field */}
					<Box sx={{ mb: '16px' }}>
						<CustomTextfield
							labelText={localizationConstants.mobileNumber}
							placeholder={localizationConstants.enterMobileNumber}
							propSx={{ height: '40px' }}
							formSx={{ width: '100%' }}
							labelTypoSx={{ fontSize: '13px', pb: '4px' }}
							value={editedMobileNumber}
							readOnly={!isEditButtonClicked}
							onChange={(e) =>
								setEditedMobileNumber(
									Math.max(0, parseInt(e.target.value))
										.toString()
										.slice(0, 10),
								)
							}
							type='number'
						/>
					</Box>

					{/* Type Selection */}
					<Box sx={{ mb: '20px' }}>
						<Typography
							variant={typographyConstants.title}
							sx={{ fontSize: '13px', mb: '4px' }}
						>
							{localizationConstants.type}
						</Typography>
						<CustomAutocompleteNew
							sx={{ width: '100%' }}
							fieldSx={{ height: '40px' }}
							value={selectedPermission}
							onChange={(selectedOption) => {
								setSchools([])
								setSelectedPermission(selectedOption || '')
							}}
							options={counselorTypeOptions}
							multiple={false}
							placeholder={`${localizationConstants.select} ${localizationConstants.type}`}
							disabled={!isEditButtonClicked}
						/>
					</Box>

					{/* School Assignment Section */}
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							mb: '12px',
						}}
					>
						<Typography sx={{ fontSize: '14px', fontWeight: 500 }}>
							{localizationConstants.schoolAssigned}
						</Typography>
						<CustomButton
							sx={{
								minWidth: '120px',
								height: '32px',
								borderRadius: '6px',
								backgroundColor: 'buttonColors.yellow',
							}}
							text={localizationConstants.assignSchool}
							startIcon={
								<CustomIcon
									name={iconConstants.plusWhite}
									style={{
										width: '10px',
										height: '10px',
										marginRight: '4px',
									}}
									svgStyle={'width: 10px; height: 10px'}
								/>
							}
							typoSx={{
								fontSize: '12px',
								color: 'textColors.white',
							}}
							onClick={() => setAssignSchoolDrawer(true)}
							disabled={!isEditButtonClicked}
						/>
					</Box>

					{/* Assigned Schools List */}
					<Box>
						{schools?.map(
							(obj) =>
								!schoolId.includes(obj._id) && (
									<Box sx={counsellorStyles.schoolBoxSx} key={obj._id}>
										<Typography
											sx={{ fontSize: '13px', fontWeight: 400 }}
										>
											{obj?.school}
										</Typography>
										<Box
											sx={{
												...counsellorStyles.removeSchoolBtnSx,
												opacity: isEditButtonClicked ? 1 : 0.5,
											}}
											onClick={() => {
												if (isEditButtonClicked) {
													setRemoveSchoolDrawer(true)
													setSelectedSchId(obj?._id)
												}
											}}
										>
											<CustomIcon
												name={iconConstants.minusRed}
												style={{
													width: '10px',
													height: '10px',
												}}
												svgStyle={'width: 10px; height: 10px'}
											/>
											<Typography
												sx={{
													fontSize: '10px',
													fontWeight: 600,
													color: 'textColors.red',
												}}
											>
												{localizationConstants.remove}
											</Typography>
										</Box>
									</Box>
								),
						)}
					</Box>
				</Box>

				{/* Footer */}
				<Box sx={counsellorStyles.drawerFooterSx}>
					{isEditButtonClicked ? (
						<Box sx={{ display: 'flex', gap: '12px' }}>
							<CustomButton
								text={localizationConstants.cancel}
								typoSx={{ color: 'text.primary' }}
								sx={{
									flex: 1,
									height: '44px',
									borderRadius: '8px',
									backgroundColor: 'transparent',
									border: '1px solid',
									borderColor: 'divider',
								}}
								onClick={() => {
									setIsEditButtonClicked(false)
									setSchoolId([])
									setSelectedSchId('')
								}}
							/>
							<CustomButton
								text={localizationConstants.submit}
								sx={{
									flex: 1,
									height: '44px',
									borderRadius: '8px',
								}}
								endIcon={
									<CustomIcon
										name={iconConstants.doneWhite}
										style={{
											width: '18px',
											height: '18px',
											marginLeft: '6px',
										}}
										svgStyle={'width: 18px; height: 18px'}
									/>
								}
								disabled={!isFormValid}
								onClick={() => {
									handleEditCounsellorSubmit(
										counsellorId,
										editedFirstName,
										editedLastName,
										editedEmail,
										editedMobileNumber,
										selectedPermission,
										schools,
										filterKeys,
										dispatch,
										setEditCounsellorDrawer,
										setIsEditButtonClicked,
										schoolId,
										setSchoolId,
										refreshList,
									)
								}}
							/>
						</Box>
					) : (
						<Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
							<Box
								sx={{
									width: '44px',
									height: '44px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									borderRadius: '8px',
									cursor: 'pointer',
									border: '1px solid',
									borderColor: 'error.light',
									'&:hover': {
										backgroundColor: 'error.light',
									},
								}}
								onClick={() => dispatch(updateDeleteCounsellorDrawer(true))}
							>
								<CustomIcon
									name={iconConstants.deleteRed}
									style={{ width: '24px', height: '24px' }}
									svgStyle={'width: 24px; height: 24px'}
								/>
							</Box>
							<CustomButton
								text={localizationConstants.edit}
								sx={{
									flex: 1,
									height: '44px',
									borderRadius: '8px',
								}}
								endIcon={
									<CustomIcon
										name={iconConstants.editPencilWhite}
										style={{
											width: '18px',
											height: '18px',
											marginLeft: '6px',
										}}
										svgStyle={'width: 18px; height: 18px'}
									/>
								}
								onClick={() => setIsEditButtonClicked(true)}
							/>
						</Box>
					)}
				</Box>

				{/* Remove School Dialog */}
				<CustomDialog
					isOpen={removeSchoolDrawer}
					title={localizationConstants.removeSchool}
					iconName={iconConstants.academicRed}
					message={localizationConstants.removeSchoolMsgInCounsellor}
					titleSx={{
						color: 'textColors.red',
						fontWeight: 500,
						pb: '16px',
					}}
					titleTypoVariant={typographyConstants.h4}
					messageTypoVariant={typographyConstants.h5}
					leftButtonText={localizationConstants.cancel}
					rightButtonText={localizationConstants.yesRemove}
					onLeftButtonClick={() => setRemoveSchoolDrawer(false)}
					onRightButtonClick={() => {
						setSchoolId([...schoolId, selectedSchId])
						setSelectedSchId('')
						setRemoveSchoolDrawer(false)
					}}
				/>
			</Drawer>

			{/* Assign School Dialog */}
			<AssignSchool
				permissionType={selectedPermission}
				open={assignSchoolDrawer}
				setOpen={setAssignSchoolDrawer}
				allList={schoolsList}
				setselectedList={(schoolids) => {
					handleSchools(schoolids)
				}}
				selectedList={
					schools?.length > 0 ? schools?.map((sc) => sc?._id) : []
				}
				onAssign={() => setAssignSchoolDrawer(false)}
			/>
		</>
	)
}

export default memo(EditCounsellorDrawer)
