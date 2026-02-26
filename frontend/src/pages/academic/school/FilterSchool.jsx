import React, { useEffect, useRef, useState, memo } from 'react'
import {
	Box,
	Checkbox,
	Divider,
	Drawer,
	FormControlLabel,
	Typography,
	Popover,
	Backdrop,
} from '@mui/material'
import { counsellorStyles } from '../../counsellors/counsellorsStyles'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import useCommonStyles from '../../../components/styles'
import { useDispatch, useSelector } from 'react-redux'
import CustomTextfield from '../../../components/CustomTextField'
import CustomButton from '../../../components/CustomButton'
import InlineDatePicker from '../../../components/InlineDatePicker'
import { SchoolsStyles } from './SchoolsStyles'
import {
	updateFilterOnboardingDates,
	updateFilterStatus,
	toggleSelectCities,
	clearSchoolFilter,
	getAllSchools,
} from './schoolSlice'
import { handleSchoolFilter, handleSearchList } from './schoolFunctions'

const FilterSchool = ({ modals, handleModals, page, pageSize }) => {
	const flexStyles = useCommonStyles()
	const dispatch = useDispatch()
	const popoverId = 'selectOnboardingDates'
	const [cityList, setCityList] = useState([])
	const [anchorEl, setAnchorEl] = useState(null)
	const [open, setOpen] = useState(null)

	const customDatesRef = useRef()

	const { status, onboardingDates, cities } = useSelector(
		(store) => store.school.filterFields,
	)
	const { miscellaneous } = useSelector((store) => store.students)

	const handlePopover = (event) => {
		setOpen(true)
		setAnchorEl(event?.currentTarget)
	}

	const closePopover = () => {
		setOpen(false)
		setAnchorEl(null)
	}

	const RadioButton = ({ label, checked, onChange }) => {
		return (
			<FormControlLabel
				label={label}
				control={
					<Checkbox
						checked={checked}
						onChange={onChange}
						icon={
							<CustomIcon
								name={iconConstants.radioUncheckedBlue}
								style={{ width: '24px', height: '24px' }}
								svgStyle={'width: 24px; height: 24px'}
							/>
						}
						checkedIcon={
							<CustomIcon
								name={iconConstants.radioCheckedBlue}
								style={{ width: '24px', height: '24px' }}
								svgStyle={'width: 24px; height: 24px'}
							/>
						}
					/>
				}
			/>
		)
	}

	const onApply = (date) => {
		const { start, end } = date
		dispatch(
			updateFilterOnboardingDates({
				start: new Date(start).toISOString(),
				end: new Date(end).toISOString(),
			}),
		)
		closePopover()
	}

	useEffect(() => {
		setCityList(miscellaneous?.schoolFilter?.cities || [])
	}, [miscellaneous])

	return (
		<Drawer
			anchor='right'
			sx={SchoolsStyles.drawerSx}
			open={modals.filterSchool}
			onClose={() => handleModals('filterSchool', false)}
		>
			<Box sx={{ flexGrow: 1 }}>
				<Box
					className={flexStyles.flexRowCenterSpaceBetween}
					sx={SchoolsStyles.drawerTopSticky}
				>
					<Typography
						variant={typographyConstants.h4}
						sx={{ fontWeight: 500, color: 'textColors.blue' }}
					>
						{localizationConstants.filterSchool}
					</Typography>
					<CustomIcon
						name={iconConstants.cancelRounded}
						onClick={() => handleModals('filterSchool', false)}
						style={{
							cursor: 'pointer',
							width: '26px',
							height: '26px',
						}}
						svgStyle={'width: 26px; height: 26px'}
					/>
				</Box>
				<Divider sx={{ position: 'relative', top: 0 }} />
				<Box sx={counsellorStyles.typeRadioSx}>
					<Typography variant={typographyConstants.title}>
						{localizationConstants.status}
					</Typography>
				</Box>
				<Box
					sx={{ mt: '10px', mb: '20px', pl: '5px' }}
					className={flexStyles.flexRowAlignCenter}
				>
					<Box>
						<RadioButton
							label={localizationConstants.all}
							onChange={() => {
								dispatch(
									updateFilterStatus(
										localizationConstants.all,
									),
								)
							}}
							checked={status.includes(localizationConstants.all)}
						/>
					</Box>
					<Box>
						<RadioButton
							label={localizationConstants.active}
							onChange={() => {
								dispatch(
									updateFilterStatus(
										localizationConstants.active,
									),
								)
							}}
							checked={status.includes(
								localizationConstants.active,
							)}
						/>
					</Box>
					<Box>
						<RadioButton
							label={localizationConstants.inactive}
							onChange={() => {
								dispatch(
									updateFilterStatus(
										localizationConstants.inactive,
									),
								)
							}}
							checked={status.includes(
								localizationConstants.inactive,
							)}
						/>
					</Box>
				</Box>

				<Box sx={counsellorStyles.typeRadioSx}>
					<Typography variant={typographyConstants.title}>
						{localizationConstants.onboardingDate}s
					</Typography>
				</Box>
				<Box sx={{ my: '10px', display: 'flex', pl: '5px' }}>
					<Box sx={{ width: '50%' }}>
						<RadioButton
							label={localizationConstants.allDates}
							onChange={() => {
								dispatch(updateFilterOnboardingDates(0))
							}}
							checked={onboardingDates.days === 0}
						/>
					</Box>
					<Box>
						<RadioButton
							label={localizationConstants.today}
							onChange={() => {
								dispatch(updateFilterOnboardingDates(1))
							}}
							checked={onboardingDates.days === 1}
						/>
					</Box>
				</Box>
				<Box sx={{ my: '10px', display: 'flex', pl: '5px' }}>
					<Box sx={{ width: '50%' }}>
						<RadioButton
							label={localizationConstants.last7Days}
							onChange={() => {
								dispatch(updateFilterOnboardingDates(2))
							}}
							checked={onboardingDates.days === 2}
						/>
					</Box>
					<Box>
						<RadioButton
							label={localizationConstants.last30Days}
							onChange={() => {
								dispatch(updateFilterOnboardingDates(3))
							}}
							checked={onboardingDates.days === 3}
						/>
					</Box>
				</Box>
				<Box sx={{ mty: '10px', display: 'flex', pl: '5px' }}>
					<Box sx={{ width: '50%' }}>
						<RadioButton
							label={new Date().getFullYear()}
							onChange={() => {
								dispatch(updateFilterOnboardingDates(4))
							}}
							checked={onboardingDates.days === 4}
						/>
					</Box>
					<Box ref={customDatesRef}>
						<RadioButton
							label={localizationConstants.customDate}
							aria-describedby={popoverId}
							onChange={(e) => {
								handlePopover(e)
							}}
							checked={onboardingDates.days === ''}
						/>
					</Box>
				</Box>

				<Box sx={counsellorStyles.typeRadioSx}>
					<Typography variant={typographyConstants.title}>
						{localizationConstants.city}
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
						placeholder={localizationConstants.city}
						hideOutline={true}
						onKeyDown={(e) => {
							handleSearchList(
								e,
								miscellaneous?.schoolFilter?.cities,
								setCityList,
							)
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
						{cityList?.map((cit) => (
							<FormControlLabel
								key={cit}
								label={cit}
								control={
									<Checkbox
										checked={cities.includes(cit)}
										onChange={(e) => {
											dispatch(toggleSelectCities(cit))
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
				sx={SchoolsStyles.drawerBottomSticky}
			>
				<Typography
					variant={typographyConstants.h4}
					sx={counsellorStyles.clearTypoSx}
					onClick={() => {
						dispatch(clearSchoolFilter())
						handleModals('filterSchool', false)
						dispatch(getAllSchools({ body: {} }))
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
						handleSchoolFilter(
							status,
							cities,
							onboardingDates.days,
							onboardingDates.custom,
							handleModals,
							dispatch,
						)
					}}
				/>
			</Box>

			<Backdrop
				sx={{
					color: 'globalElementColors.grey1',
					zIndex: (theme) => theme.zIndex.drawer + 1,
				}}
				open={open}
			>
				<Popover
					id={popoverId}
					open={open}
					anchorEl={customDatesRef.current}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'left',
					}}
					sx={{
						width: '390px',
						maxHeight: '500px',
					}}
				>
					<InlineDatePicker
						startDate={onboardingDates.custom.start}
						endDate={onboardingDates.custom.end}
						onCancel={() => closePopover()}
						dateRange={true}
						onApply={onApply}
					/>
				</Popover>
			</Backdrop>
		</Drawer>
	)
}

export default memo(FilterSchool)
