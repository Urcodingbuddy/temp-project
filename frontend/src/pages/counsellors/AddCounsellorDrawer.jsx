import React, { useState, memo } from 'react'
import { Box, Divider, Drawer, Typography } from '@mui/material'
import { counsellorStyles } from './counsellorsStyles'
import { useDispatch, useSelector } from 'react-redux'
import { typographyConstants } from '../../resources/theme/typographyConstants'
import { localizationConstants } from '../../resources/theme/localizationConstants'
import CustomIcon from '../../components/CustomIcon'
import { iconConstants } from '../../resources/theme/iconConstants'
import {
	handleCloseAddCounsellorDrawer,
	handleCreateCounsellor,
	handleEmailIdChange,
	handleFirstNameChange,
	handleLastNameChange,
	handleMobileNumberChange,
} from './counsellorFunctions'
import CustomTextfield from '../../components/CustomTextField'
import CustomButton from '../../components/CustomButton'
import AssignSchool from './AssignSchool'
import { counselorTypeOptions } from './counselorConstants'
import CustomAutocompleteNew from '../../components/commonComponents/CustomAutoComplete'

const AddCounsellorDrawer = ({
	addCounsellorDrawer,
	setAddCounsellorDrawer,
	setIsEmailIdValid,
	isEmailIdValid,
	permissionType,
	setPermissionType,
	allSchools,
	refreshList,
}) => {
	const dispatch = useDispatch()
	const [schools, setSchools] = useState([])
	const [open, setOpen] = useState(false)
	const { schoolsList } = useSelector((store) => store.commonData)

	const { firstName, lastName, emailId, mobileNumber } = useSelector(
		(store) => store.counsellor,
	)

	const handleSchools = (schoolsids) => {
		const list = schoolsList?.filter((sc) => schoolsids.includes(sc._id))
		setSchools(list)
	}

	return (
		<>
			<Drawer
				anchor='right'
				sx={counsellorStyles.drawerSx}
				open={addCounsellorDrawer}
			>
				{/* Header */}
				<Box sx={counsellorStyles.drawerHeaderSx}>
					<Typography sx={counsellorStyles.drawerTitleSx}>
						{localizationConstants.addUser}
					</Typography>
					<CustomIcon
						name={iconConstants.cancelRounded}
						onClick={() =>
							handleCloseAddCounsellorDrawer(
								setAddCounsellorDrawer,
								dispatch,
								setSchools,
							)
						}
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
							value={firstName}
							onChange={(e) => handleFirstNameChange(e, dispatch)}
						/>
						<CustomTextfield
							formSx={{ flex: 1 }}
							propSx={{ height: '40px' }}
							labelTypoSx={{ fontSize: '13px', pb: '4px' }}
							labelText={localizationConstants.lastName}
							placeholder={localizationConstants.enterLastName}
							value={lastName}
							onChange={(e) => handleLastNameChange(e, dispatch)}
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
							value={emailId}
							onChange={(e) =>
								handleEmailIdChange(e, dispatch, setIsEmailIdValid)
							}
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
							value={mobileNumber}
							onChange={(e) => handleMobileNumberChange(e, dispatch)}
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
							value={permissionType}
							onChange={(selectedOption) => {
								setSchools([])
								setPermissionType(selectedOption || '')
							}}
							options={counselorTypeOptions}
							multiple={false}
							placeholder={`${localizationConstants.select} ${localizationConstants.type}`}
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
							onClick={() => setOpen(true)}
							disabled={!permissionType}
						/>
					</Box>

					{/* Assigned Schools List */}
					<Box>
						{schoolsList
							?.filter((sch) =>
								schools.map((sc) => sc?._id).includes(sch?._id),
							)
							.map((obj) => (
								<Box sx={counsellorStyles.schoolBoxSx} key={obj?._id}>
									<Typography
										sx={{ fontSize: '13px', fontWeight: 400 }}
									>
										{obj?.school}
									</Typography>
									<Box
										sx={counsellorStyles.removeSchoolBtnSx}
										onClick={() => {
											const rem = schools.filter(
												(school) => school?._id !== obj?._id,
											)
											setSchools(rem)
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
							))}
					</Box>
				</Box>

				{/* Footer */}
				<Box sx={counsellorStyles.drawerFooterSx}>
					<CustomButton
						text={localizationConstants.submit}
						sx={{
							width: '100%',
							height: '44px',
							borderRadius: '8px',
						}}
						endIcon={
							<CustomIcon
								name={iconConstants.doneWhite}
								style={{
									width: '20px',
									height: '20px',
									marginLeft: '8px',
								}}
								svgStyle={'width: 20px; height: 20px'}
							/>
						}
						disabled={
							!isEmailIdValid ||
							!firstName.length > 0 ||
							mobileNumber.length !== 10 ||
							!permissionType
						}
						onClick={() =>
							handleCreateCounsellor(
								emailId,
								mobileNumber,
								firstName,
								lastName,
								permissionType,
								dispatch,
								schools?.map((sc) => sc?._id),
								setAddCounsellorDrawer,
								setSchools,
								refreshList,
							)
						}
					/>
				</Box>
			</Drawer>

			<AssignSchool
				permissionType={permissionType}
				open={open}
				setOpen={setOpen}
				allList={allSchools}
				setselectedList={(schoolids) => {
					handleSchools(schoolids)
				}}
				selectedList={schools?.map((sc) => sc?._id)}
				onAssign={() => setOpen(false)}
			/>
		</>
	)
}

export default memo(AddCounsellorDrawer)
