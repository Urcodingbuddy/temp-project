import React, { useState } from 'react'
import useCommonStyles from '../../../components/styles'
import CustomButton from '../../../components/CustomButton'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { counsellorStyles } from '../../counsellors/counsellorsStyles'
import {
	Checkbox,
	Divider,
	Drawer,
	FormControlLabel,
	Typography,
} from '@mui/material'
import { Box } from '@mui/system'
import CustomIcon from '../../../components/CustomIcon'
import CustomTextfield from '../../../components/CustomTextField'
import { useDispatch, useSelector } from 'react-redux'
import {
	handleGenderFilterCheckboxChange,
	handleSearchList,
} from './tecahersFunction'
import { SchoolsStyles } from '../school/SchoolsStyles'
import { clearFilterFields, getAllTeachers, setSchool } from './teachersSlice'

const FilterTeacherDrawer = ({
	filterTeachersDrawer,
	schoolsList,
	setFilterTeachersDrawer,
	filterTeachers,
}) => {
	const flexStyles = useCommonStyles()
	const dispatch = useDispatch()
	const { filterFields } = useSelector((store) => store.teachers)
	const [changeValue, setChangeValue] = useState('')
	const [searchList, setSearchList] = useState([])
	const renderList =
		searchList?.length > 0 || changeValue?.length > 0
			? searchList
			: schoolsList

	return (
		<Drawer
			anchor='right'
			sx={counsellorStyles.drawerSx}
			open={filterTeachersDrawer}
			onClose={() => setFilterTeachersDrawer(false)}
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
						{localizationConstants.filter}
					</Typography>
					<CustomIcon
						name={iconConstants.cancelRounded}
						onClick={() => {
							setChangeValue('')
							setFilterTeachersDrawer(false)
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
				<Box sx={counsellorStyles.typeRadioSx}>
					<Typography variant={typographyConstants.title}>
						{localizationConstants.gender}
					</Typography>
				</Box>
				<Box
					sx={{ mt: '10px', mb: '20px' }}
					className={flexStyles.flexRowAlignCenter}
				>
					<Box>
						<FormControlLabel
							label={localizationConstants.male}
							control={
								<Checkbox
									checked={filterFields?.gender?.includes(
										'Male',
									)}
									onChange={() =>
										handleGenderFilterCheckboxChange(
											'one',
											dispatch,
										)
									}
									icon={
										<CustomIcon
											name={
												iconConstants.radioUncheckedBlue
											}
											style={{
												width: '24px',
												height: '24px',
											}}
											svgStyle={
												'width: 24px; height: 24px'
											}
										/>
									}
									checkedIcon={
										<CustomIcon
											name={
												iconConstants.radioCheckedBlue
											}
											style={{
												width: '24px',
												height: '24px',
											}}
											svgStyle={
												'width: 24px; height: 24px'
											}
										/>
									}
								/>
							}
						/>
					</Box>
					<Box sx={{ pl: '30px' }}>
						<FormControlLabel
							label={localizationConstants.female}
							control={
								<Checkbox
									checked={filterFields?.gender?.includes(
										'Female',
									)}
									onChange={() =>
										handleGenderFilterCheckboxChange(
											'two',
											dispatch,
										)
									}
									icon={
										<CustomIcon
											name={
												iconConstants.radioUncheckedBlue
											}
											style={{
												width: '24px',
												height: '24px',
											}}
											svgStyle={
												'width: 24px; height: 24px'
											}
										/>
									}
									checkedIcon={
										<CustomIcon
											name={
												iconConstants.radioCheckedBlue
											}
											style={{
												width: '24px',
												height: '24px',
											}}
											svgStyle={
												'width: 24px; height: 24px'
											}
										/>
									}
								/>
							}
						/>
					</Box>
					<Box sx={{ pl: '30px' }}>
						<FormControlLabel
							label={localizationConstants.all}
							control={
								<Checkbox
									checked={filterFields?.gender?.includes(
										'all',
									)}
									onChange={() =>
										handleGenderFilterCheckboxChange(
											'three',
											dispatch,
										)
									}
									icon={
										<CustomIcon
											name={
												iconConstants.radioUncheckedBlue
											}
											style={{
												width: '24px',
												height: '24px',
											}}
											svgStyle={
												'width: 24px; height: 24px'
											}
										/>
									}
									checkedIcon={
										<CustomIcon
											name={
												iconConstants.radioCheckedBlue
											}
											style={{
												width: '24px',
												height: '24px',
											}}
											svgStyle={
												'width: 24px; height: 24px'
											}
										/>
									}
								/>
							}
						/>
					</Box>
				</Box>
				<Box sx={counsellorStyles.typeRadioSx}>
					<Typography variant={typographyConstants.title}>
						{localizationConstants.school}
					</Typography>
				</Box>
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
						value={changeValue}
						onChange={(e) => {
							setChangeValue(e.target.value)
							handleSearchList(e, schoolsList, setSearchList)
						}}
					/>
				</Box>
				<Box
					sx={{
						mt: '24px',
						height: `calc(100vh - 450px)`,
						overflow: 'auto',
						p: '5px',
					}}
				>
					<Box className={flexStyles.flexColumn}>
						{renderList?.map((school) => (
							<FormControlLabel
								key={school._id}
								label={school?.school}
								control={
									<Checkbox
										checked={filterFields?.school?.includes(
											school._id,
										)}
										onChange={(e) => {
											dispatch(setSchool(school?._id))
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
						{searchList?.length == 0 &&
							changeValue?.length !== 0 && (
								<Box
									className={
										flexStyles.flexColumnCenterCenter
									}
								>
									<CustomIcon
										name={iconConstants.noSchoolsBlack}
										style={{
											width: '125px',
											height: '125px',
										}}
										svgStyle={'width: 125px; height: 125px'}
									/>
									<Typography
										variant={typographyConstants.h3}
										sx={SchoolsStyles.noSchoolsSx}
									>
										{'No Schools'}
									</Typography>
								</Box>
							)}
					</Box>
				</Box>
			</Box>
			<Box
				className={flexStyles.flexRowCenterSpaceBetween}
				sx={{ mb: '36px' }}
			>
				<Typography
					variant={typographyConstants.h4}
					sx={counsellorStyles.clearTypoSx}
					onClick={() => {
						dispatch(clearFilterFields())
						setChangeValue('')
						dispatch(getAllTeachers({}))
					}}
				>
					{localizationConstants.clear}
				</Typography>
				<CustomButton
					sx={{ minWidth: '283px', height: '60px' }}
					text={localizationConstants.apply}
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
					onClick={() => {
						setChangeValue('')
						setFilterTeachersDrawer(false)
						filterTeachers()
					}}
				/>
			</Box>
		</Drawer>
	)
}

export default FilterTeacherDrawer
