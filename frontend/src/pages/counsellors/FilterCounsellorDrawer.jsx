import React, { memo, useEffect, useState } from 'react'
import {
	Box,
	Checkbox,
	Divider,
	Drawer,
	FormControlLabel,
	Typography,
} from '@mui/material'
import { counsellorStyles } from './counsellorsStyles'
import { typographyConstants } from '../../resources/theme/typographyConstants'
import { localizationConstants } from '../../resources/theme/localizationConstants'
import CustomIcon from '../../components/CustomIcon'
import { iconConstants } from '../../resources/theme/iconConstants'
import useCommonStyles from '../../components/styles'
import { useDispatch, useSelector } from 'react-redux'
import CustomTextfield from '../../components/CustomTextField'
import CustomButton from '../../components/CustomButton'
import {
	handleCounsellorApplyFilter,
	handleFilterSchoolSearch,
	handleSchoolFilterCheckboxChange,
} from './counsellorFunctions'
import {
	updateFilterSearchSchoolValue,
	updateFilterSelectedSchoolIds,
	viewAllCounsellors,
	clearFilterPermission,
	updateFilterPermission,
} from './counsellorSlice'

const FilterCounsellorDrawer = ({
	filterCounsellorDrawer,
	setFilterCounsellorDrawer,
	setIsMyPeeguCheckedFilter,
	setIsSchoolCheckedFilter,
	debouncedSearchFilterSchool,
	page,
	pageSize,
}) => {
	const flexStyles = useCommonStyles()
	const dispatch = useDispatch()

	const {
		filterSearchSchoolValue,
		filterSelectedSchoolIds,
		filterPermission,
	} = useSelector((store) => store.counsellor)
	const { schoolsList } = useSelector((store) => store.commonData)

	const [searchList, setSearchList] = useState([])
	const handleFilterSchoolSearch = (e) => {
		const searchValue = e.target.value
		dispatch(updateFilterSearchSchoolValue(searchValue))

		const filteredSchools = schoolsList?.filter((school) =>
			school?.school?.toLowerCase()?.includes(searchValue?.toLowerCase()),
		)

		setSearchList(filteredSchools)
	}

	return (
		<Drawer
			anchor='right'
			sx={counsellorStyles.drawerSx}
			open={filterCounsellorDrawer}
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
						onClick={() => setFilterCounsellorDrawer(false)}
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
						{localizationConstants.type}
					</Typography>
				</Box>
				<Box
					sx={{ mt: '10px', mb: '20px' }}
					className={flexStyles.flexRowAlignCenter}
				>
					<Box>
						<FormControlLabel
							label={localizationConstants.myPeegu}
							control={
								<Checkbox
									checked={
										filterPermission === 'PeeguCounselor'
									}
									onChange={() =>
										dispatch(
											updateFilterPermission(
												'PeeguCounselor',
											),
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
							label={localizationConstants.school}
							control={
								<Checkbox
									checked={filterPermission === 'ScCounselor'}
									onChange={() =>
										dispatch(
											updateFilterPermission(
												'ScCounselor',
											),
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
									checked={filterPermission === 'all'}
									onChange={() =>
										dispatch(updateFilterPermission('all'))
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
						value={filterSearchSchoolValue}
						onChange={handleFilterSchoolSearch}
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
						{searchList.length > 0
							? searchList.map((school) => (
									<FormControlLabel
										key={school._id}
										label={school?.school}
										control={
											<Checkbox
												checked={filterSelectedSchoolIds.includes(
													school._id,
												)}
												onChange={(e) => {
													const schoolId = school._id
													const updatedIds = e.target
														.checked
														? [
																...filterSelectedSchoolIds,
																schoolId,
															]
														: filterSelectedSchoolIds.filter(
																(id) =>
																	id !==
																	schoolId,
															)
													dispatch(
														updateFilterSelectedSchoolIds(
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
								))
							: schoolsList.map((school) => (
									<FormControlLabel
										key={school._id}
										label={school?.school}
										control={
											<Checkbox
												checked={filterSelectedSchoolIds.includes(
													school._id,
												)}
												onChange={(e) => {
													const schoolId = school._id
													const updatedIds = e.target
														.checked
														? [
																...filterSelectedSchoolIds,
																schoolId,
															]
														: filterSelectedSchoolIds.filter(
																(id) =>
																	id !==
																	schoolId,
															)
													dispatch(
														updateFilterSelectedSchoolIds(
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
			<Box
				className={flexStyles.flexRowCenterSpaceBetween}
				sx={{ mb: '36px' }}
			>
				<Typography
					variant={typographyConstants.h4}
					sx={counsellorStyles.clearTypoSx}
					onClick={() => {
						dispatch(updateFilterSearchSchoolValue(''))
						dispatch(updateFilterSelectedSchoolIds([]))
						setIsMyPeeguCheckedFilter(false)
						setIsSchoolCheckedFilter(false)
						const body = {
							filter: {
								status: ['Active', 'Invited'],
							},
							page,
							pageSize,
							schoolIds: [],
							searchText: '',
						}
						setSearchList([])
						dispatch(viewAllCounsellors({ body }))
						dispatch(clearFilterPermission())
						setFilterCounsellorDrawer(false)
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
					onClick={() =>
						handleCounsellorApplyFilter(
							filterPermission,
							filterSelectedSchoolIds,
							dispatch,
							setFilterCounsellorDrawer,
						)
					}
				/>
			</Box>
		</Drawer>
	)
}

export default memo(FilterCounsellorDrawer)
