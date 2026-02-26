import {
	Box,
	Checkbox,
	Divider,
	Drawer,
	FormControlLabel,
	Typography,
} from '@mui/material'
import React, { useEffect } from 'react'
import { counsellorStyles } from '../pages/counsellors/counsellorsStyles'
import useCommonStyles from './styles'
import { typographyConstants } from '../resources/theme/typographyConstants'
import { localizationConstants } from '../resources/theme/localizationConstants'
import CustomIcon from './CustomIcon'
import { iconConstants } from '../resources/theme/iconConstants'
import CustomTextfield from './CustomTextField'
import { useDispatch } from 'react-redux'
import CustomButton from './CustomButton'
import { viewAllSchools } from '../pages/counsellors/counsellorSlice'
import { requestParams } from '../utils/apiConstants'
import useDebounce from '../customHooks/useDebounce'

const CustomAssignSchool = ({
	assignSchoolDrawer,
	handleAssignSchoolDrawerClose,
	setAssignSchoolDrawer,
	searchSchoolValue,
	handleSchoolSearch,
	allSchools,
	selectedSchoolIds,
	updateSelectedSchoolIds,
	handleAssignSchool,
	counsellorId,
	filterKeys,
}) => {
	const flexStyles = useCommonStyles()
	const dispatch = useDispatch()

	const debouncedSearchValue = useDebounce(searchSchoolValue, 1000)

	useEffect(() => {
		if (
			debouncedSearchValue.length >= 3 ||
			debouncedSearchValue.length === 0
		) {
			const schoolBody = {
				[requestParams.filter]: {
					[requestParams.status]: [localizationConstants.active],
					[requestParams.days]: 0,
				},
				[requestParams.searchText]: debouncedSearchValue,
			}
			dispatch(viewAllSchools({ schoolBody }))
		}
	}, [debouncedSearchValue])

	return (
		<Drawer
			anchor='right'
			sx={counsellorStyles.drawerSx}
			open={assignSchoolDrawer}
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
						{localizationConstants.assignSchool}
					</Typography>
					<CustomIcon
						name={iconConstants.cancelRounded}
						onClick={() =>
							handleAssignSchoolDrawerClose(setAssignSchoolDrawer)
						}
						style={{
							cursor: 'pointer',
							width: '26px',
							height: '26px',
						}}
						svgStyle={'width: 26px; height: 26px'}
					/>
				</Box>
				<Divider />
				<Box
					sx={{
						borderBottom: '2px solid',
						borderColor: 'globalElementColors.grey1',
					}}
				>
					<CustomTextfield
						formSx={{ width: '404px', mt: '10px' }}
						propSx={{ height: '52px' }}
						endIcon={
							<CustomIcon
								name={iconConstants.search}
								style={{
									width: '32px',
									height: '32px',
									marginRight: '10px',
								}}
								svgStyle={'width: 32px; height: 32px'}
							/>
						}
						placeholder={localizationConstants.searchSchoolName}
						hideOutline={true}
						value={searchSchoolValue}
						onChange={(e) => handleSchoolSearch(e, dispatch)}
					/>
				</Box>
				<Box
					sx={{
						mt: '24px',
						height: `calc(100vh - 300px)`,
						overflow: 'auto',
						p: '5px',
					}}
				>
					<Box className={flexStyles.flexColumn}>
						{allSchools.map((school) => (
							<FormControlLabel
								key={school._id}
								label={school?.school}
								control={
									<Checkbox
										checked={selectedSchoolIds?.includes(
											school._id,
										)}
										onChange={(e) => {
											const schoolId = school._id
											const updatedIds = e.target.checked
												? [
														...selectedSchoolIds,
														schoolId,
													]
												: selectedSchoolIds.filter(
														(id) => id !== schoolId,
													)
											dispatch(
												updateSelectedSchoolIds(
													updatedIds,
												),
											)
										}}
										icon={
											<CustomIcon
												name={
													iconConstants.uncheckedBox
												}
												style={{
													width: '22px',
													height: '22px',
												}}
												svgStyle={
													'width: 22px; height: 22px'
												}
											/>
										}
										checkedIcon={
											<CustomIcon
												name={
													iconConstants.checkedBoxBlue
												}
												style={{
													width: '22px',
													height: '22px',
												}}
												svgStyle={
													'width: 22px; height: 22px'
												}
											/>
										}
									/>
								}
								sx={{
									'& .MuiTypography-root': {
										fontWeight: 500,
										fontSize: '14px',
									},
								}}
							/>
						))}
					</Box>
				</Box>
			</Box>
			<Box sx={{ mb: '36px' }}>
				<CustomButton
					text={localizationConstants.assign}
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
					onClick={() =>
						handleAssignSchool(
							counsellorId,
							selectedSchoolIds,
							filterKeys,
							dispatch,
						)
					}
					disabled={
						selectedSchoolIds?.length === 0 ||
						selectedSchoolIds?.length > 5
					}
				/>
			</Box>
		</Drawer>
	)
}

export default CustomAssignSchool
