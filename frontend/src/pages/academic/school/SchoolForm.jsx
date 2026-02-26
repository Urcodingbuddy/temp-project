import { useEffect, useRef, useState, memo } from 'react'
import {
	Box,
	Typography,
	Button,
	Popover,
	Backdrop,
	Avatar,
} from '@mui/material'
import CustomIcon from '../../../components/CustomIcon'
import CustomTextfield from '../../../components/CustomTextField'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import useCommonStyles, {
	redBorderForCustomTextField,
} from '../../../components/styles'
import { SchoolsStyles } from './SchoolsStyles'
import InlineDatePicker from '../../../components/InlineDatePicker'
import {
	formatDate,
	getAcademicYearsList,
	getCurrentAcademicYear,
	getUserFromLocalStorage,
} from '../../../utils/utils'
import {
	cursorPointer,
	getCountryListOptions,
	getYearsList,
} from './schoolConstants'
import { initialState } from './schoolConstants'
import SchoolActionsListPopOver from './SchoolActionsListPopover'
import { useDispatch, useSelector } from 'react-redux'
import {
	getSchoolAcademicYearBySchoolId,
	statesByCountryId,
	statesOptionsList,
} from './schoolFunctions'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'
import CustomButton from '../../../components/CustomButton'
import StudentReportDialog from './StudentReportDialog'
import { userRoles } from '../../../utils/globalConstants'

const SchoolForm = ({
	setSchoolFormData,
	add,
	rowData,
	readOnly,
	hideUploadBtn,
	errors,
	handleErrors,
	handleActionTypes,
	isEditButtonClicked,
	refreshSchoolList,
	handleModals,
}) => {
	const flexStyles = useCommonStyles()
	const logoRef = useRef()
	const dispatch = useDispatch()
	const [anchorEl, setAnchorEl] = useState(null)
	const { countries, academicYears, states, appPermissions } = useSelector(
		(store) => store.dashboardSliceSetup,
	)

	const [inputs, setInputs] = useState({ ...initialState })
	const [popovers, setPopovers] = useState({
		selectYear: false,
		onboardDate: false,
		academicYears: false,
		scStartDate: false,
		scEndDate: false,
	})
	const [date, setDate] = useState(new Date())
	const [startDate, setStartDate] = useState({
		date: new Date(),
		minDate: null,
		maxDate: null,
	})
	const [endDate, setEndDate] = useState({
		date: new Date(),
		minDate: null,
		maxDate: null,
	})
	const [statesOptions, setStatesOptions] = useState([])
	const [openStudentReport, setOpenStudentReport] = useState(false)

	const invalidTest = ['', undefined, null]

	const handleInputs = (e) => {
		const { name, value, files } = e.target
		let processedValue = value
		const obj = {}

		if (name === 'scLogo') {
			if (
				!invalidTest.includes(inputs?.scLogo) &&
				invalidTest.includes(files[0])
			) {
				obj[name] = !invalidTest.includes(inputs?.logoUrl)
					? inputs?.logoUrl
					: ''
			} else {
				obj[name] = files[0]
			}
		} else if (name === 'principalPhone') {
			processedValue = processedValue.slice(0, 10)
			obj[name] = processedValue
		} else {
			obj[name] = processedValue
		}

		const inputstate = { ...inputs, ...obj }
		setInputs(inputstate)
		if (!hideUploadBtn) {
			setSchoolFormData(inputstate)
		}
	}

	const handlePopover = (event, type) => {
		if (type && !readOnly) {
			const obj = {}
			obj[type] = true
			setPopovers((state) => ({ ...state, ...obj }))
			setAnchorEl(event?.currentTarget)
		} else {
			setAnchorEl(null)
		}
	}

	const handleClosePopover = (type) => {
		if (
			[
				'selectYear',
				'onboardDate',
				'academicYears',
				'scStartDate',
				'scEndDate',
			].includes(type)
		) {
			const obj = {}
			obj[type] = false
			setPopovers((state) => ({ ...state, ...obj }))
		} else {
			setPopovers({
				selectYear: false,
				onboardDate: false,
				academicYears: false,
				scStartDate: false,
				scEndDate: false,
			})
		}
		setAnchorEl(null)
	}

	const handleDates = (curAcYear, byId = false) => {
		const selectedAcYrId = byId
			? academicYears.find((obj) => obj._id === curAcYear)
			: academicYears.find((obj) => obj.academicYear === curAcYear)
		if (selectedAcYrId) {
			handleInputs({
				target: { name: 'academicYear', value: selectedAcYrId._id },
			})
			const [startYear, endYear] = selectedAcYrId.academicYear
				.split('-')
				.map(Number)
			const startMin = new Date(startYear, 0, 1)
			const startMax = new Date(startYear, 11, 31)
			const endMin = new Date(endYear, 0, 1)
			const endMax = new Date(endYear, 11, 31)

			const start = new Date()
			start.setFullYear(startYear)
			const end = new Date()
			end.setFullYear(endYear)

			setStartDate({
				date: start,
				minDate: startMin,
				maxDate: startMax,
			})
			setEndDate({
				date: end,
				minDate: endMin,
				maxDate: endMax,
			})
		}
	}

	useEffect(() => {
		const keys = !invalidTest.includes(rowData)
			? Object.keys(rowData).filter((key) =>
					Object.keys(inputs).includes(key),
				)
			: []
		if (keys.length > 0) {
			const obj = {}
			keys.forEach((key) => {
				if (key === 'scLogo') {
					obj[key] = rowData?.logoUrl
						? rowData['logoUrl']
						: rowData[key]
				} else if (key === 'establishedYear') {
					obj[key] = !rowData[key]
						? ''
						: new Date(rowData[key]).getFullYear()
				} else {
					obj[key] = rowData[key]
				}
			})
			setInputs((state) => ({ ...state, ...obj }))
			if (!hideUploadBtn) {
				setSchoolFormData((state) => ({ ...state, ...obj }))
			}

			if (rowData['country'] && rowData['country'].length > 0) {
				statesOptionsList(states, setStatesOptions)
			}
		}

		if (add) {
			const curAcYear = getCurrentAcademicYear()
			handleDates(curAcYear)
		} else {
			getSchoolAcademicYearBySchoolId(rowData._id, dispatch, setInputs)
		}
	}, [])

	const onDateChange = (date) => {
		setDate(date)
		setStartDate((state) => ({
			...state,
			date,
		}))
		handleClosePopover('onboardDate')
		handleInputs({ target: { name: 'onboardDate', value: date } })
		if (errors.onboardDate) {
			handleErrors('onboardDate', false)
		}
	}

	const onScStartDateChange = (date) => {
		setStartDate((state) => ({
			...state,
			date,
		}))
		handleClosePopover('scStartDate')
		handleInputs({ target: { name: 'scStartDate', value: date } })
		if (errors.scStartDate) {
			handleErrors('scStartDate', false)
		}
	}

	const onScEndDateChange = (date) => {
		setEndDate(date)
		handleClosePopover('scEndDate')
		handleInputs({ target: { name: 'scEndDate', value: date } })
		if (errors.scEndDate) {
			handleErrors('scEndDate', false)
		}
	}

	const user = getUserFromLocalStorage()
	const [anchorElForList, setAnchorElForList] = useState(null)

	const handleIconClick = (event) => {
		setAnchorElForList(event.currentTarget)
	}

	const handleCloseListPopover = () => {
		setAnchorElForList(null)
	}

	const open = Boolean(anchorElForList)

	const isInActiveSchool = rowData?.status !== 'Active'

	return (
		<Box sx={{ pb: '30px', overflowX: 'hidden' }}>
			<Box
				sx={{ display: 'flex', justifyContent: 'flex-end', m: '10px' }}
			>
				{readOnly && (
					<CustomButton
						typoVariant={typographyConstants.body}
						sx={{
							minWidth: '140px',
							height: '34px',
							p: '4px 8px',
						}}
						startIcon={
							<Box sx={{ mr: '8px' }}>
								<CustomIcon
									name={iconConstants.downloadWhite}
									style={{
										width: '16px',
										height: '16px',
									}}
									svgStyle={'width: 16px; height: 16px '}
								/>
							</Box>
						}
						text={localizationConstants.studentReport}
						onClick={() => setOpenStudentReport(true)}
					/>
				)}
			</Box>

			{/* ------------ logo ------------ */}
			<Box
				className={flexStyles.flexRowCenterSpaceBetween}
				sx={{ mt: '24px', mr: '5px' }}
			>
				{invalidTest.includes(inputs?.scLogo) ? (
					!add ? (
						<Avatar
							sx={{
								width: 72,
								height: 50,
								borderRadius: '10px',
								bgcolor: 'globalElementColors.lightBlue',
								color: 'globalElementColors.blue2',
							}}
							alt='Remy Sharp'
							src='/broken-image.jpg'
							variant='rounded'
						>
							{inputs?.school?.[0]?.toUpperCase() ?? ''}
						</Avatar>
					) : null
				) : (
					<Avatar
						alt='Remy Sharp'
						src={
							typeof inputs?.scLogo === 'string'
								? inputs?.scLogo
								: URL.createObjectURL(inputs?.scLogo)
						}
						sx={{ width: 72, height: 50, borderRadius: '10px' }}
						variant='square'
					/>
				)}
				{!hideUploadBtn ? (
					!invalidTest.includes(inputs?.scLogo) ? (
						<Button
							variant='outlined'
							size='large'
							sx={{
								borderColor: 'globalElementColors.yellow',
								color: 'globalElementColors.yellow',
								'&:hover': {
									borderColor: 'globalElementColors.yellow',
								},
							}}
							disabled={readOnly}
							onClick={() => logoRef.current.click()}
						>
							{localizationConstants.changeSchoolLogo}
						</Button>
					) : (
						<Button
							variant='contained'
							size='large'
							sx={{
								backgroundColor: 'globalElementColors.yellow',
								'&:hover': {
									backgroundColor:
										'globalElementColors.yellow',
								},
							}}
							disabled={readOnly}
							onClick={() => logoRef.current.click()}
						>
							{localizationConstants.uploadSchoolLogo}
						</Button>
					)
				) : null}
				{hideUploadBtn ? (
					<>
						<Box sx={{ mr: '10px' }}>
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
									gap: '15px',
								}}
							>
								<Box
									className={
										flexStyles.flexRowAlighnItemsCenter
									}
								>
									<Box sx={SchoolsStyles.activeDot} />
									<Typography
										variant={typographyConstants.body}
									>
										{rowData?.status}
									</Typography>
								</Box>

								{!add &&
								!isInActiveSchool &&
								user?.permissions?.[0] !==
									userRoles.scPrincipal ? (
									<Box
										sx={{
											...cursorPointer,
											border: '1ps solid red',
										}}
									>
										<CustomIcon
											name={
												iconConstants.schoolDetailsActionIcon
											}
											style={{
												width: '92px',
												height: '44px',
											}}
											onClick={handleIconClick}
											svgStyle={`width: 92px; height: 44px`}
										/>
									</Box>
								) : null}
							</Box>
						</Box>
					</>
				) : (
					<>
						{!add && readOnly && !isInActiveSchool ? (
							<Box sx={cursorPointer}>
								<CustomIcon
									name={iconConstants.schoolDetailsActionIcon}
									style={{
										width: '92px',
										height: '44px',
									}}
									onClick={handleIconClick}
									svgStyle={`width: 92px; height: 44px`}
									handleCloseListPopover
								/>
							</Box>
						) : null}
					</>
				)}
			</Box>

			<SchoolActionsListPopOver
				open={open}
				anchorElForList={anchorElForList}
				handleCloseListPopover={handleCloseListPopover}
				isAdminUser={
					user.permissions.includes('Admin') ||
					user.permissions.includes('SuperAdmin')
				}
				handleActionTypes={handleActionTypes}
				isEditButtonClicked={isEditButtonClicked}
				schoolId={rowData?._id}
				refreshSchoolList={refreshSchoolList}
				handleModals={handleModals}
				setInputs={setInputs}
			/>
			{/* ------------ Last Active Academic Year ------------ */}
			<Box sx={{ mt: '24px' }}>
				<Typography
					variant={typographyConstants.title}
					sx={{
						color: 'textColors.grey',
						fontSize: '14px',
						mb: '4px',
					}}
				>
					{localizationConstants.lastActiveAcademicYear} *
				</Typography>
				<CustomAutocompleteNew
					sx={{ minWidth: '80px', width: '390px' }}
					fieldSx={{ height: '44px' }}
					error={errors.academicYear}
					value={rowData?.lastPromotionAcademicYear}
					placeholder={`${localizationConstants.select} ${localizationConstants.academicYear}`}
					onChange={(e) => {
						handleInputs({
							target: {
								name: 'lastPromotionAcademicYear',
								value: e,
							},
						})
						if (errors.academicYear) {
							handleErrors('lastPromotionAcademicYear', false)
						}
						handleDates(e, true)
					}}
					options={getAcademicYearsList(academicYears) || []}
					disabled={readOnly || !add}
				/>
			</Box>

			{/* ------------ Academic Year ------------ */}
			<Box sx={{ mt: '24px' }}>
				<Typography
					variant={typographyConstants.title}
					sx={{
						color: 'textColors.grey',
						fontSize: '14px',
						mb: '4px',
					}}
				>
					{localizationConstants.currentAcademicYear} *
				</Typography>
				<CustomAutocompleteNew
					sx={{ minWidth: '80px', width: '390px' }}
					fieldSx={{ height: '44px' }}
					error={errors.academicYear}
					value={inputs?.academicYear}
					placeholder={`${localizationConstants.select} ${localizationConstants.academicYear}`}
					onChange={(e) => {
						handleInputs({
							target: { name: 'academicYear', value: e },
						})
						if (errors.academicYear) {
							handleErrors('academicYear', false)
						}
						handleDates(e, true)
					}}
					options={getAcademicYearsList(academicYears) || []}
					disabled={readOnly || !add}
				/>
			</Box>

			{/* ------------ School start And end Date ------------ */}
			<Box
				className={flexStyles.flexSpaceBetween}
				sx={{ mt: '24px', pr: '8px' }}
			>
				<Box sx={add ? cursorPointer : {}}>
					<Typography
						variant={typographyConstants.title}
						sx={{ color: 'textColors.grey', fontSize: '14px' }}
					>
						{localizationConstants.startDate} *
					</Typography>
					<Box
						className={flexStyles.flexRowCenterSpaceBetween}
						sx={
							errors.scStartDate
								? SchoolsStyles.datePickerError
								: readOnly || !add
									? SchoolsStyles.datePickerDisabled
									: SchoolsStyles.datePicker
						}
						onClick={(e) => {
							handlePopover(e, 'scStartDate')
						}}
						disabled={readOnly || !add}
					>
						<Typography
							variant={typographyConstants.title}
							sx={{ color: 'textColors.grey', fontSize: '14px' }}
						>
							{inputs.scStartDate === ''
								? `${localizationConstants.select} ${localizationConstants.date}`
								: formatDate(inputs.scStartDate, 'date')}
						</Typography>
						<CustomIcon
							name={iconConstants.calender}
							style={{
								width: '24px',
								height: '24px',
								cursor: 'pointer',
								opacity: readOnly || !add ? 0.5 : 0.75,
							}}
						/>
					</Box>
				</Box>

				<Box sx={add ? cursorPointer : {}}>
					<Typography
						variant={typographyConstants.title}
						sx={{ color: 'textColors.grey', fontSize: '14px' }}
					>
						{localizationConstants.endDate} *
					</Typography>
					<Box
						className={flexStyles.flexRowCenterSpaceBetween}
						sx={
							errors.scEndDate
								? SchoolsStyles.datePickerError
								: readOnly || !add
									? SchoolsStyles.datePickerDisabled
									: SchoolsStyles.datePicker
						}
						onClick={(e) => {
							handlePopover(e, 'scEndDate')
						}}
						disabled={readOnly || !add}
					>
						<Typography
							variant={typographyConstants.title}
							sx={{ color: 'textColors.grey', fontSize: '14px' }}
						>
							{inputs.scEndDate === ''
								? `${localizationConstants.select} ${localizationConstants.date}`
								: formatDate(inputs.scEndDate, 'date')}
						</Typography>
						<CustomIcon
							name={iconConstants.calender}
							style={{
								width: '24px',
								height: '24px',
								opacity: readOnly || !add ? 0.75 : 0.9,
								...cursorPointer,
							}}
						/>
					</Box>
				</Box>
			</Box>

			{/* ------------ School Name ------------ */}
			<Box
				className={flexStyles.flexRowCenterSpaceBetween}
				sx={{ mt: '24px' }}
			>
				<CustomTextfield
					labelText={`${localizationConstants.schoolName} ${localizationConstants.required}`}
					propSx={{ height: '44px' }}
					formSx={{ width: '390px' }}
					fieldSx={redBorderForCustomTextField(errors.school)}
					labelTypoSx={{ fontSize: '14px', pb: '4px' }}
					placeholder={`${localizationConstants.enter} ${localizationConstants.schoolName}`}
					name='school'
					value={inputs?.school}
					disabled={readOnly}
					onChange={(e) => {
						handleInputs(e)
						if (errors.school) {
							handleErrors('school', false)
						}
					}}
				/>
			</Box>

			{/* ------------ School Code ------------ */}
			<Box
				className={flexStyles.flexRowCenterSpaceBetween}
				sx={{ mt: '24px' }}
			>
				<CustomTextfield
					labelText={`${localizationConstants.scCode} ${localizationConstants.required}`}
					propSx={{ height: '44px' }}
					formSx={{ width: '390px' }}
					fieldSx={redBorderForCustomTextField(errors.scCode)}
					labelTypoSx={{ fontSize: '14px', pb: '4px' }}
					placeholder={`${localizationConstants.enter} ${localizationConstants.scCode}`}
					name='scCode'
					value={inputs?.scCode}
					disabled={readOnly}
					onChange={(e) => {
						handleInputs(e)
						if (errors.scCode) {
							handleErrors('scCode', false)
						}
					}}
				/>
			</Box>

			{/* ------------ School Established Year ------------ */}
			<Box sx={{ mt: '24px' }}>
				<Typography
					variant={typographyConstants.title}
					sx={{
						color: 'textColors.grey',
						fontSize: '14px',
						mb: '4px',
					}}
				>
					{localizationConstants.establishedYear}
				</Typography>
				<CustomAutocompleteNew
					sx={{ minWidth: '80px', width: '390px' }}
					fieldSx={{ height: '48px' }}
					value={inputs?.establishedYear}
					placeholder={`${localizationConstants.select} ${localizationConstants.establishedYear}`}
					onChange={(e) => {
						const date = formatDate(e, 'year')
						handleInputs({
							target: {
								name: 'establishedYear',
								value: date ? date : '',
							},
						})
					}}
					options={getYearsList() || []}
					disabled={readOnly}
				/>
			</Box>

			{/* ------------ School Address ------------ */}
			<Box
				className={flexStyles.flexRowCenterSpaceBetween}
				sx={{ mt: '24px' }}
			>
				<CustomTextfield
					formSx={{ width: '390px' }}
					propSx={{ height: '44px' }}
					labelTypoSx={{ fontSize: '14px', pb: '4px' }}
					labelText={localizationConstants.schoolAddress}
					placeholder={`${localizationConstants.enter} ${localizationConstants.schoolAddress}`}
					name='address'
					value={inputs?.address}
					disabled={readOnly}
					onChange={(e) => handleInputs(e)}
					multiline={true}
				/>
			</Box>

			{/* ------------ Country And State ------------ */}
			<Box className={flexStyles.flexRowCenterSpaceBetween}>
				<Box sx={{ mt: '24px', width: '48%' }}>
					<Typography
						variant={typographyConstants.title}
						sx={{
							color: 'textColors.grey',
							fontSize: '14px',
							mb: '4px',
						}}
					>
						{localizationConstants.country} *
					</Typography>
					<CustomAutocompleteNew
						sx={{ minWidth: '80px', width: '100%' }}
						fieldSx={{ height: '48px' }}
						error={errors?.country}
						placeholder={`${localizationConstants.select} ${localizationConstants.country}`}
						onChange={(e) => {
							setInputs((state) => ({
								...state,
								country: e,
								state: '',
							}))
							statesByCountryId(e, states, setStatesOptions)
							if (errors.country) {
								handleErrors('country', false)
							}
						}}
						value={inputs?.country}
						options={getCountryListOptions(countries) || []}
						disabled={readOnly}
					/>
				</Box>

				<Box sx={{ mt: '24px', width: '49%', pr: '3%' }}>
					<Typography
						variant={typographyConstants.title}
						sx={{
							color: 'textColors.grey',
							fontSize: '14px',
							mb: '4px',
						}}
					>
						{localizationConstants.state} *
					</Typography>
					<CustomAutocompleteNew
						sx={{ minWidth: '80px', width: '100%' }}
						fieldSx={{ height: '48px' }}
						error={errors?.state}
						placeholder={`${localizationConstants.select} ${localizationConstants.state}`}
						onChange={(e) => {
							handleInputs({
								target: { name: 'state', value: e },
							})
							if (errors.state) {
								handleErrors('state', false)
							}
						}}
						value={inputs?.state}
						renderValue={inputs?.state}
						options={statesOptions}
						multiple={false}
						disabled={readOnly}
					/>
				</Box>
			</Box>

			{/* ------------ Pincode And city ------------ */}
			<Box
				className={flexStyles.flexSpaceBetween}
				sx={{ mt: '24px', pr: '9px' }}
			>
				<CustomTextfield
					formSx={{ width: '190px' }}
					propSx={{ height: '44px' }}
					fieldSx={redBorderForCustomTextField(errors.city)}
					labelTypoSx={{ fontSize: '14px', pb: '4px' }}
					labelText={`${localizationConstants.city} ${localizationConstants.required}`}
					placeholder={`${localizationConstants.enter} ${localizationConstants.city}`}
					name='city'
					value={inputs?.city}
					disabled={readOnly}
					onChange={(e) => {
						handleInputs(e)
						if (errors.city) {
							handleErrors('city', false)
						}
					}}
				/>

				<CustomTextfield
					formSx={{ width: '190px' }}
					propSx={{ height: '44px' }}
					fieldSx={redBorderForCustomTextField(errors.pinCode)}
					labelTypoSx={{ fontSize: '14px', pb: '4px' }}
					labelText={`${localizationConstants.Pincode} ${localizationConstants.required}`}
					placeholder={`${localizationConstants.enter} ${localizationConstants.Pincode}`}
					name='pinCode'
					value={inputs?.pinCode}
					disabled={readOnly}
					onChange={(e) => {
						handleInputs(e)
						errors.pinCode && handleErrors('pinCode', false)
					}}
				/>
			</Box>

			{/* ------------ onboarding date ------------ */}
			<Box sx={{ ...cursorPointer, mt: '24px' }}>
				<Typography
					variant={typographyConstants.title}
					sx={{ color: 'textColors.grey', fontSize: '14px' }}
				>
					{localizationConstants.onboardingDate} *
				</Typography>
				<Box
					className={flexStyles.flexRowCenterSpaceBetween}
					sx={{
						...(errors.onboardDate
							? SchoolsStyles.datePickerError
							: readOnly || !add
								? SchoolsStyles.datePickerDisabled
								: SchoolsStyles.datePicker),
						width: '390px',
					}}
					onClick={(e) => {
						handlePopover(e, 'onboardDate')
					}}
					disabled={readOnly}
				>
					<Typography
						variant={typographyConstants.title}
						sx={{ color: 'textColors.grey', fontSize: '14px' }}
					>
						{inputs.onboardDate === ''
							? `${localizationConstants.select} ${localizationConstants.date}`
							: formatDate(inputs.onboardDate, 'date')}
					</Typography>
					<CustomIcon
						name={iconConstants.calender}
						style={{
							width: '24px',
							height: '24px',
							...cursorPointer,
							opacity: readOnly || !add ? 0.5 : 0.75,
						}}
					/>
				</Box>
			</Box>

			{/* ------------ School Website ------------ */}
			<Box
				className={flexStyles.flexRowCenterSpaceBetween}
				sx={{ mt: '24px' }}
			>
				<CustomTextfield
					propSx={{ height: '44px' }}
					formSx={{ width: '390px' }}
					labelText={localizationConstants.schoolWebsite}
					placeholder={`${localizationConstants.enter} ${localizationConstants.schoolWebsite}`}
					labelTypoSx={{ fontSize: '14px', pb: '4px' }}
					name='webSite'
					value={inputs?.webSite}
					disabled={readOnly}
					onChange={(e) => handleInputs(e)}
				/>
			</Box>

			{/* ------------ Pricipal Name ------------ */}
			<Box sx={{ mt: '24px' }}>
				<CustomTextfield
					labelText={`${localizationConstants.pricipal} ${localizationConstants.name} ${localizationConstants.required}`}
					propSx={{ height: '44px' }}
					formSx={{ width: '390px' }}
					fieldSx={redBorderForCustomTextField(errors.principalName)}
					labelTypoSx={{ fontSize: '14px', pb: '4px' }}
					placeholder={`${localizationConstants.enter} ${localizationConstants.pricipal} ${localizationConstants.name}`}
					name='principalName'
					value={inputs?.principalName}
					disabled={readOnly}
					onChange={(e) => {
						handleInputs(e)
						errors.principalName &&
							handleErrors('principalName', false)
					}}
				/>
			</Box>

			{/* ------------ Pricipal Email Id ------------ */}
			<Box sx={{ mt: '24px' }}>
				<CustomTextfield
					labelText={`${localizationConstants.pricipal} ${localizationConstants.emailIdOptional} *`}
					propSx={{ height: '44px' }}
					formSx={{ width: '390px' }}
					fieldSx={redBorderForCustomTextField(errors.principalEmail)}
					labelTypoSx={{ fontSize: '14px', pb: '4px' }}
					placeholder={localizationConstants.enterEmailId}
					name='principalEmail'
					value={inputs?.principalEmail}
					disabled={readOnly}
					onChange={(e) => {
						handleInputs(e)
						errors.principalEmail &&
							handleErrors('principalEmail', false)
					}}
				/>
				{errors?.email === true && (
					<Typography
						variant={typographyConstants.title}
						sx={{ color: 'textColors.red' }}
					>
						{localizationConstants.emailError.invalid}
					</Typography>
				)}
			</Box>

			{/* ------------ Pricipal Mobile No ------------ */}
			<Box
				className={flexStyles.flexRowCenterSpaceBetween}
				sx={{ mt: '24px' }}
			>
				<CustomTextfield
					labelText={`${localizationConstants.pricipal} ${localizationConstants.mobileNumberOptional}`}
					propSx={{ height: '44px' }}
					formSx={{ width: '390px' }}
					labelTypoSx={{ fontSize: '14px', pb: '4px' }}
					placeholder={localizationConstants.enterMobileNumber}
					name='principalPhone'
					value={inputs?.principalPhone}
					disabled={readOnly}
					onChange={(e) => {
						const inputValue = e.target.value.replace(/\D/g, '')
						handleInputs({
							target: {
								name: 'principalPhone',
								value: inputValue,
							},
						})
					}}
				/>
			</Box>

			{/* ------------ About School ------------ */}
			<Box
				className={flexStyles.flexRowCenterSpaceBetween}
				sx={{ mt: '24px' }}
			>
				<CustomTextfield
					formSx={{ width: '390px' }}
					propSx={{ height: '44px' }}
					labelTypoSx={{ fontSize: '14px', pb: '4px' }}
					labelText={localizationConstants.aboutSchool}
					placeholder={`${localizationConstants.enter} ${localizationConstants.aboutSchool}`}
					name='about'
					value={inputs?.about}
					disabled={readOnly}
					onChange={(e) => handleInputs(e)}
					multiline={true}
				/>
			</Box>

			<Box>
				<input
					type='file'
					name='scLogo'
					onChange={(e) => handleInputs(e)}
					style={{ display: 'none' }}
					ref={logoRef}
				/>
			</Box>

			<Backdrop
				sx={{
					color: 'globalElementColors.grey1',
					zIndex: (theme) => theme.zIndex.drawer + 1,
				}}
				open={popovers.onboardDate}
			>
				<Popover
					id='selectOnboardingDate'
					open={popovers.onboardDate}
					anchorEl={anchorEl}
					onClose={() => handleClosePopover('onboardDate')}
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
						date={date}
						dateRange={false}
						onChange={onDateChange}
						maxDate={new Date()}
					/>
				</Popover>
			</Backdrop>

			<Backdrop
				sx={{
					color: 'globalElementColors.grey1',
					zIndex: (theme) => theme.zIndex.drawer + 1,
				}}
				open={popovers.scStartDate}
			>
				<Popover
					id='selectScStartDate'
					open={popovers.scStartDate}
					anchorEl={anchorEl}
					onClose={() => handleClosePopover('scStartDate')}
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
						date={startDate.date}
						dateRange={false}
						onChange={onScStartDateChange}
						minDate={startDate.minDate}
						maxDate={startDate.maxDate}
					/>
				</Popover>
			</Backdrop>

			<Backdrop
				sx={{
					color: 'globalElementColors.grey1',
					zIndex: (theme) => theme.zIndex.drawer + 1,
				}}
				open={popovers.scEndDate}
			>
				<Popover
					id='selectScEndDate'
					open={popovers.scEndDate}
					anchorEl={anchorEl}
					onClose={() => handleClosePopover('scEndDate')}
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
						date={endDate.date}
						dateRange={false}
						onChange={onScEndDateChange}
						minDate={endDate.minDate}
						maxDate={endDate.maxDate}
					/>
				</Popover>
			</Backdrop>

			{openStudentReport && (
				<StudentReportDialog
					onOpen={openStudentReport}
					onClose={() => setOpenStudentReport(false)}
					schoolIds={rowData?._id}
					schoolName={rowData?.school}
				/>
			)}
		</Box>
	)
}

export default memo(SchoolForm)
