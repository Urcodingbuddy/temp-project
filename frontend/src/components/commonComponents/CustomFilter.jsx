import { memo, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	Box,
	Drawer,
	Typography,
	Divider,
	Button,
	Checkbox,
	FormControlLabel,
	Backdrop,
	Popover,
} from '@mui/material'
import CustomButton from '../CustomButton'
import CustomIcon from '../CustomIcon'
import useCommonStyles from '../styles'
import { counsellorStyles } from '../../pages/counsellors/counsellorsStyles'
import { typographyConstants } from '../../resources/theme/typographyConstants'
import { localizationConstants } from '../../resources/theme/localizationConstants'
import { iconConstants } from '../../resources/theme/iconConstants'
import SimpleCollapsibleComponent from '../SimpleCollapsibleComponent'
import CustomMultiSelectAutocomplete from './CustomMultiSelectAutoComplete'
import {
	convertToUTCISOString,
	getAcademicYearsList,
	getCurACYear,
} from '../../utils/utils'
import {
	getAllClassrooms,
	getSchoolsList,
	setSectionsList,
	setSchoolsList,
	setClassroomsList,
} from '../../redux/commonSlice'
import InlineDatePicker from '../InlineDatePicker'

export const initialFilterStates = {
	selectdAYs: [],
	selectdSchools: [],
	selectdClassrooms: [],
	selectdSections: [],
	studentStatus: 'Active',
	status: 'All',
	gender: 'All',
	byDate: 0,
	startDate: null,
	endDate: null,
	role: 'All',
	teacherStatus: 'All',
}

export const initialAccordionStates = {
	AYs: false,
	role: false,
	schools: false,
	classrooms: false,
	sections: false,
	studentStatus: false,
	status: false,
	teacherStatus: false,
	gender: false,
	byDate: false,
}
export const defaultAccordionTitle = {
	AYs: `${localizationConstants.select} ${localizationConstants.academicYear}`,
	role: localizationConstants.role,
	schools: `${localizationConstants.select} ${localizationConstants.school}`,
	classrooms: `${localizationConstants.select} ${localizationConstants.classroom}`,
	sections: `${localizationConstants.select} ${localizationConstants.section}`,
	studentStatus: `${localizationConstants.student} ${localizationConstants.status}`,
	status: localizationConstants.status,
	gender: localizationConstants.gender,
	byDate: localizationConstants.byDate,
	teacherStatus: localizationConstants.status,
}

const studentStatusArray = [
	{
		label: localizationConstants.active,
		value: localizationConstants.active,
	},
	{
		label: localizationConstants.graduated,
		value: localizationConstants.graduated,
	},
	{
		label: localizationConstants.exited,
		value: localizationConstants.exited,
	},
	{
		label: localizationConstants.all,
		value: localizationConstants.all,
	},
]
const statusArray = [
	{
		label: localizationConstants.all,
		value: localizationConstants.all,
	},
	{
		label: localizationConstants.active,
		value: localizationConstants.active,
	},
	{
		label: localizationConstants.inactive,
		value: localizationConstants.inactive,
	},
]
const teacherIRIStatusArray = [
	{
		label: localizationConstants.submitted,
		value: localizationConstants.submitted,
	},
	{
		label: localizationConstants.pending,
		value: localizationConstants.pending,
	},
	{
		label: localizationConstants.all,
		value: localizationConstants.all,
	},
]
const genderArray = [
	{
		label: localizationConstants.male,
		value: localizationConstants.male,
	},
	{
		label: localizationConstants.female,
		value: localizationConstants.female,
	},
	{
		label: localizationConstants.all,
		value: localizationConstants.all,
	},
]
const rolesArray = [
	{
		label: localizationConstants.myPeegu,
		value: localizationConstants.peeguCounsellor,
	},
	{
		label: localizationConstants.school,
		value: localizationConstants.schoolCounsellor,
	},
	{
		label: localizationConstants.pricipal,
		value: localizationConstants.scPrincipal,
	},
	{
		label: localizationConstants.all,
		value: localizationConstants.all,
	},
]

const CommonFilterDrawer = ({
	onOpen,
	handleModal,
	onApply,
	filterData,
	setFilterData,
	filterOptions = initialAccordionStates,
	defaultAccordions = [],
	accordionTitleOptions = defaultAccordionTitle,
}) => {
	const {
		AYs,
		schools,
		classrooms,
		sections,
		studentStatus,
		status,
		gender,
		byDate,
		role,
		teacherStatus,
	} = filterOptions
	const flexStyles = useCommonStyles()
	const dispatch = useDispatch()
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const { schoolsList, classroomsList, sectionsList } = useSelector(
		(state) => state.commonData,
	)
	const [accordions, setAccordions] = useState(initialAccordionStates)
	const [disableReset, setDisableReset] = useState(false)
	const [open, setOpen] = useState(null)
	const [classSections, setClassSections] = useState({
		classrooms: [],
		sections: [],
	})
	const [classSectionOptions, setClassSectionOptions] = useState({
		classrooms: [],
		sections: [],
	})
	const popoverId = 'selectOnboardingDates'

	const [anchorEl, setAnchorEl] = useState(null)
	const customDatesRef = useRef()
	const initialDataRef = useRef(null)
	const [onOpenFilterData, setOnOpenFilterData] = useState(filterData)

	const handlePopover = (event) => {
		setOpen(true)
		setAnchorEl(event?.currentTarget)
	}

	const closePopover = () => {
		setOpen(false)
		setAnchorEl(null)
	}
	const handleAccordions = (key) => {
		const obj = {}
		obj[key] = !accordions[key]
		setAccordions((state) => ({ ...state, ...obj }))
	}

	const handleMultiSelect = (key, values) => {
		const obj = {}
		obj[key] = [...values]
		if (key === 'selectdAYs') {
			dispatch(setSchoolsList([]))
			dispatch(setClassroomsList([]))
			dispatch(setSectionsList([]))
			obj['selectdSchools'] = []
			obj['selectdClassrooms'] = []
			obj['selectdSections'] = []
			setClassSections({
				classrooms: [],
				sections: [],
			})
		} else if (key === 'selectdSchools') {
			dispatch(setClassroomsList([]))
			dispatch(setSectionsList([]))
			obj['selectdClassrooms'] = []
			obj['selectdSections'] = []
			setClassSections({
				classrooms: [],
				sections: [],
			})
		}

		setFilterData((state) => ({ ...state, ...obj }))
	}

	const handleClassrooms = (e) => {
		setClassSections((state) => ({
			...state,
			classrooms: e,
			sections: [],
		}))

		handleSectionOptions(e)
		const classroomIds = classroomsList.filter((obj) =>
			e.includes(obj.className),
		)
		handleMultiSelect(
			'selectdClassrooms',
			classroomIds.map((obj) => obj._id),
		)
	}

	const handleSections = (e) => {
		setClassSections((state) => ({
			...state,
			sections: e,
		}))
		const classroomIds = classroomsList.filter(
			(obj) =>
				classSections.classrooms.includes(obj.className) &&
				e.includes(obj.section),
		)
		handleMultiSelect(
			'selectdClassrooms',
			classroomIds.map((obj) => obj._id),
		)
	}

	const handleSingleSelectOptions = (key, value) => {
		if (key === 'studentStatus') {
			const obj = {
				studentStatus: value,
			}
			setFilterData((state) => ({ ...state, ...obj }))
		}
		if (key === 'status') {
			const obj = {
				status: value,
			}
			setFilterData((state) => ({ ...state, ...obj }))
		}
		if (key === 'gender') {
			const obj = {
				gender: value,
			}
			setFilterData((state) => ({ ...state, ...obj }))
		}
		if (key === 'byDate') {
			setFilterData((state) => ({
				...state,
				[key]: value,
			}))
		}
		if (key === 'role') {
			const obj = {
				role: value,
			}
			setFilterData((state) => ({ ...state, ...obj }))
		}
		if (key === 'teacherStatus') {
			const obj = {
				teacherStatus: value,
			}
			setFilterData((state) => ({ ...state, ...obj }))
		}
	}

	const onDateApply = (date) => {
		const { start, end } = date
		setFilterData((state) => ({
			...state,
			startDate: convertToUTCISOString(start),
			endDate: convertToUTCISOString(end),
		}))
		closePopover()
	}

	const fetchSchoolsList = () => {
		if (filterData.selectdAYs.length > 0 && schoolsList.length === 0) {
			const body = {
				filter: { academicYear: filterData.selectdAYs },
			}

			dispatch(getSchoolsList({ body }))
		}
	}

	const fetchClassroomsList = () => {
		if (
			filterData.selectdSchools.length > 0 &&
			classroomsList.length === 0
		) {
			dispatch(
				getAllClassrooms({
					body: {
						filter: {
							academicYear: filterData.selectdAYs,
							schoolIds: filterData.selectdSchools,
						},
					},
				}),
			)
		}
	}

	const handleClassOptions = () => {
		const list = []
		for (const classroom of classroomsList) {
			if (!list.includes(classroom.className)) {
				list.push(classroom.className)
			}
		}
		setClassSectionOptions((state) => ({
			...state,
			sections: [],
			classrooms: list,
		}))
	}

	const handleSectionOptions = (selectedClasses = null) => {
		const list = []
		if (!selectedClasses || selectedClasses.length === 0) {
			setClassSectionOptions((state) => ({ ...state, sections: [] }))
			return
		}
		for (const classroom of classroomsList) {
			if (selectedClasses.length > 0) {
				if (
					!list.includes(classroom.section) &&
					selectedClasses.includes(classroom.className)
				) {
					list.push(classroom.section)
				}
			} else {
				if (!list.includes(classroom.section)) {
					list.push(classroom.section)
				}
			}
		}
		setClassSectionOptions((state) => ({ ...state, sections: list }))
	}

	const handleClear = () => {
		handleDefaultAccordions()
	}

	const resetDisable = () => {
		let changes = true
		for (const key in initialFilterStates) {
			if (
				key !== 'selectdAYs' &&
				filterData[key] !== initialFilterStates[key]
			) {
				changes = false
			}
		}
		return changes
	}

	const handleDefaultAccordions = () => {
		setFilterData(initialFilterStates)
		setClassSections({
			classrooms: [],
			sections: [],
		})
		if (defaultAccordions.length > 0) {
			const acDions = { ...accordions }
			Object.keys(acDions).forEach((key) => {
				acDions[key] = defaultAccordions.includes(key)
			})
			setAccordions(acDions)
			if (filterOptions.AYs && defaultAccordions.includes('AYs')) {
				const curAY = getCurACYear()
				const initialSelectedAcademicYears =
					initialDataRef.current?.selectdAYs &&
					initialDataRef.current.selectdAYs.length > 0
						? initialDataRef.current.selectdAYs
						: academicYears
								.filter((obj) => obj.academicYear === curAY)
								.map((obj) => obj._id)

				setFilterData((state) => ({
					...state,
					selectdAYs: initialSelectedAcademicYears,
				}))
			}
		}

		if (!filterOptions.AYs) {
			setFilterData((state) => ({
				...state,
				selectdAYs: academicYears.map((obj) => obj._id),
			}))
		}
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

	let firstLoaded = useRef(true)

	useEffect(() => {
		if (onOpen) {
			setOnOpenFilterData(filterData)
			if (firstLoaded.current) {
				// First time load if parent is sending some default values, that will capture in this initialDataRef.current to utilise for the reset functionality later.
				// Capture only once when filterData becomes truthy
				if (filterData && !initialDataRef.current) {
					initialDataRef.current = structuredClone(filterData)
				}
				handleDefaultAccordions()
				firstLoaded.current = false
			}
		}
	}, [onOpen])

	useEffect(() => {
		const disable = resetDisable()
		setDisableReset(disable)
	}, [filterData])

	useEffect(() => {
		handleClassOptions()
		handleSectionOptions()
	}, [classroomsList])

	return (
		<Drawer
			anchor='right'
			sx={counsellorStyles.drawerSx}
			open={onOpen}
			// onClose={() => {
			// 	handleModal('filter', false)
			// 	dispatch(resetScClSections())
			// }}
		>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
					width: '100%',
					px: '6px',
					py: 2,
				}}
			>
				{/* ----------- Fixed Header ----------- */}
				<Box>
					<Box
						className={flexStyles.flexRowCenterSpaceBetween}
						sx={{ pb: '12px' }}
					>
						<Typography
							variant={typographyConstants.h4}
							sx={{ color: 'textColors.blue' }}
						>
							{localizationConstants.filter}
						</Typography>

						{
							// Close button is removed for now
							<CustomIcon
								name={iconConstants.cancelRounded}
								onClick={() => {
									handleModal('filter', false)

									setFilterData(
										structuredClone(onOpenFilterData),
									)
								}}
								style={{
									cursor: 'pointer',
									width: '26px',
									height: '26px',
								}}
								svgStyle={'width: 26px; height: 26px'}
							/>
						}
					</Box>
					<Divider />
				</Box>

				{/* ----------- Scrollable Body ----------- */}
				<Box sx={{ flexGrow: 1, overflowY: 'auto', mt: 2 }}>
					{/* ----------- Academic Year ----------- */}
					{AYs && (
						<Box sx={{ mb: 2 }}>
							<SimpleCollapsibleComponent
								title={accordionTitleOptions.AYs}
								open={accordions.AYs}
								onClick={() => handleAccordions('AYs')}
							>
								<CustomMultiSelectAutocomplete
									sx={{ minWidth: '80px', mt: 2 }}
									fieldSx={{ minHeight: '44px' }}
									value={filterData.selectdAYs}
									placeholder={`${localizationConstants.select} ${localizationConstants.academicYear}`}
									onChange={(e) => {
										handleMultiSelect('selectdAYs', e)
									}}
									options={
										getAcademicYearsList(academicYears) ||
										[]
									}
								/>
							</SimpleCollapsibleComponent>
						</Box>
					)}
					{/* ----------- roles ----------- */}
					{role && (
						<Box sx={{ mb: 2 }}>
							<SimpleCollapsibleComponent
								title={accordionTitleOptions.role}
								open={accordions.role}
								onClick={() => handleAccordions('role')}
							>
								{rolesArray.map((statusObj, index) => (
									<FormControlLabel
										key={index}
										checked={
											filterData.role === statusObj.value
										}
										onChange={() =>
											handleSingleSelectOptions(
												'role',
												statusObj.value,
											)
										}
										label={statusObj.label}
										control={
											<Checkbox
												checked={
													filterData.role ===
													statusObj.value
												}
												icon={
													<CustomIcon
														name={
															iconConstants.radioUncheckedBlue
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
															iconConstants.radioCheckedBlue
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
											width: '40%',
											padding: '0px 10px',
											'& .MuiTypography-root': {
												fontWeight: 500,
												fontSize: '14px',
											},
										}}
									/>
								))}
							</SimpleCollapsibleComponent>
						</Box>
					)}

					{/* ----------- Gender ----------- */}
					{gender && (
						<Box sx={{ mb: 2 }}>
							<SimpleCollapsibleComponent
								title={accordionTitleOptions.gender}
								open={accordions.gender}
								onClick={() => handleAccordions('gender')}
							>
								{genderArray.map((statusObj, index) => (
									<FormControlLabel
										key={index}
										checked={
											filterData.gender ===
											statusObj.value
										}
										onChange={() =>
											handleSingleSelectOptions(
												'gender',
												statusObj.value,
											)
										}
										label={statusObj.label}
										control={
											<Checkbox
												checked={
													filterData.gender ===
													statusObj.value
												}
												icon={
													<CustomIcon
														name={
															iconConstants.radioUncheckedBlue
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
															iconConstants.radioCheckedBlue
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
											width: '30%',
											padding: '0px 10px',
											'& .MuiTypography-root': {
												fontWeight: 500,
												fontSize: '14px',
											},
										}}
									/>
								))}
							</SimpleCollapsibleComponent>
						</Box>
					)}

					{/* ----------- Student Status ----------- */}
					{studentStatus && (
						<Box sx={{ mb: 2 }}>
							<SimpleCollapsibleComponent
								title={accordionTitleOptions.studentStatus}
								open={accordions.studentStatus}
								onClick={() =>
									handleAccordions('studentStatus')
								}
							>
								{studentStatusArray.map((statusObj, index) => (
									<FormControlLabel
										key={index}
										checked={
											filterData.studentStatus ===
											statusObj.value
										}
										onChange={() =>
											handleSingleSelectOptions(
												'studentStatus',
												statusObj.value,
											)
										}
										label={statusObj.label}
										control={
											<Checkbox
												checked={
													filterData.studentStatus ===
													statusObj.value
												}
												icon={
													<CustomIcon
														name={
															iconConstants.radioUncheckedBlue
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
															iconConstants.radioCheckedBlue
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
											width: '45%',
											padding: '0px 10px',
											'& .MuiTypography-root': {
												fontWeight: 500,
												fontSize: '14px',
											},
										}}
									/>
								))}
							</SimpleCollapsibleComponent>
						</Box>
					)}

					{/* ----------- Status ----------- */}
					{status && (
						<Box sx={{ mb: 2 }}>
							<SimpleCollapsibleComponent
								title={accordionTitleOptions.status}
								open={accordions.status}
								onClick={() => handleAccordions('status')}
							>
								{statusArray.map((statusObj, index) => (
									<FormControlLabel
										key={index}
										checked={
											filterData.status ===
											statusObj.value
										}
										onChange={() =>
											handleSingleSelectOptions(
												'status',
												statusObj.value,
											)
										}
										label={statusObj.label}
										control={
											<Checkbox
												checked={
													filterData.status ===
													statusObj.value
												}
												icon={
													<CustomIcon
														name={
															iconConstants.radioUncheckedBlue
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
															iconConstants.radioCheckedBlue
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
											width: '30%',
											padding: '0px 10px',
											'& .MuiTypography-root': {
												fontWeight: 500,
												fontSize: '14px',
											},
										}}
									/>
								))}
							</SimpleCollapsibleComponent>
						</Box>
					)}
					{/* ----------- Teacher IRI or Profile Status ----------- */}
					{teacherStatus && (
						<Box sx={{ mb: 2 }}>
							<SimpleCollapsibleComponent
								title={accordionTitleOptions.status}
								open={accordions.teacherStatus}
								onClick={() =>
									handleAccordions('teacherStatus')
								}
							>
								{teacherIRIStatusArray.map(
									(statusObj, index) => (
										<FormControlLabel
											key={index}
											checked={
												filterData.teacherStatus ===
												statusObj.value
											}
											onChange={() =>
												handleSingleSelectOptions(
													'teacherStatus',
													statusObj.value,
												)
											}
											label={statusObj.label}
											control={
												<Checkbox
													checked={
														filterData.teacherStatus ===
														statusObj.value
													}
													icon={
														<CustomIcon
															name={
																iconConstants.radioUncheckedBlue
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
																iconConstants.radioCheckedBlue
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
												width: '30%',
												padding: '0px 10px',
												'& .MuiTypography-root': {
													fontWeight: 500,
													fontSize: '14px',
												},
											}}
										/>
									),
								)}
							</SimpleCollapsibleComponent>
						</Box>
					)}

					{/* ----------- Schools ----------- */}
					{schools && (
						<Box sx={{ mb: 2 }}>
							<SimpleCollapsibleComponent
								title={accordionTitleOptions.schools}
								open={accordions.schools}
								onClick={() => handleAccordions('schools')}
							>
								<CustomMultiSelectAutocomplete
									sx={{ minWidth: '80px', mt: 2 }}
									fieldSx={{ minHeight: '44px' }}
									value={filterData.selectdSchools}
									placeholder={`${localizationConstants.select} ${localizationConstants.school}`}
									onClick={fetchSchoolsList}
									onChange={(e) => {
										handleMultiSelect('selectdSchools', e)
									}}
									options={
										schoolsList.map((obj) => ({
											label: obj.school,
											id: obj._id,
										})) || []
									}
								/>
							</SimpleCollapsibleComponent>
						</Box>
					)}

					{/* ----------- Classrooms ----------- */}
					{classrooms && (
						<Box sx={{ mb: 2 }}>
							<SimpleCollapsibleComponent
								title={accordionTitleOptions.classrooms}
								open={accordions.classrooms}
								onClick={() => handleAccordions('classrooms')}
							>
								<CustomMultiSelectAutocomplete
									sx={{ minWidth: '80px', mt: 2 }}
									fieldSx={{ minHeight: '44px' }}
									value={classSections.classrooms}
									placeholder={`${localizationConstants.select} ${localizationConstants.classroom}`}
									onChange={handleClassrooms}
									onClick={fetchClassroomsList}
									options={classSectionOptions.classrooms}
								/>
							</SimpleCollapsibleComponent>
						</Box>
					)}

					{/* ----------- Sections ----------- */}
					{sections && (
						<Box sx={{ mb: 2 }}>
							<SimpleCollapsibleComponent
								title={accordionTitleOptions.sections}
								open={accordions.sections}
								onClick={() => handleAccordions('sections')}
							>
								<CustomMultiSelectAutocomplete
									sx={{ minWidth: '80px', mt: 2 }}
									fieldSx={{ minHeight: '44px' }}
									value={classSections.sections}
									placeholder={`${localizationConstants.select} ${localizationConstants.section}`}
									onChange={handleSections}
									options={classSectionOptions.sections}
								/>
							</SimpleCollapsibleComponent>
						</Box>
					)}

					{/* ----------- by date ----------- */}
					{byDate && (
						<Box sx={{ mb: 2 }}>
							<SimpleCollapsibleComponent
								title={accordionTitleOptions.byDate}
								open={accordions.byDate}
								onClick={() => handleAccordions('byDate')}
							>
								<Box
									sx={{
										my: '10px',
										display: 'flex',
										pl: '5px',
									}}
								>
									<Box sx={{ width: '50%' }}>
										<RadioButton
											label={
												localizationConstants.allDates
											}
											onChange={() =>
												handleSingleSelectOptions(
													'byDate',
													0,
												)
											}
											checked={filterData.byDate === 0}
										/>
									</Box>
									<Box>
										<RadioButton
											label={localizationConstants.today}
											onChange={() =>
												handleSingleSelectOptions(
													'byDate',
													1,
												)
											}
											checked={filterData.byDate === 1}
										/>
									</Box>
								</Box>
								<Box
									sx={{
										my: '10px',
										display: 'flex',
										pl: '5px',
									}}
								>
									<Box sx={{ width: '50%' }}>
										<RadioButton
											label={
												localizationConstants.last7Days
											}
											onChange={() =>
												handleSingleSelectOptions(
													'byDate',
													2,
												)
											}
											checked={filterData.byDate === 2}
										/>
									</Box>
									<Box>
										<RadioButton
											label={
												localizationConstants.last30Days
											}
											onChange={() =>
												handleSingleSelectOptions(
													'byDate',
													3,
												)
											}
											checked={filterData.byDate === 3}
										/>
									</Box>
								</Box>
								<Box
									sx={{
										mty: '10px',
										display: 'flex',
										pl: '5px',
									}}
								>
									<Box sx={{ width: '50%' }}>
										<RadioButton
											label={new Date().getFullYear()}
											onChange={() =>
												handleSingleSelectOptions(
													'byDate',
													4,
												)
											}
											checked={filterData.byDate === 4}
										/>
									</Box>
									<Box ref={customDatesRef}>
										<RadioButton
											label={
												localizationConstants.customDate
											}
											aria-describedby={popoverId}
											onChange={(e) => {
												handlePopover(e)
												handleSingleSelectOptions(
													'byDate',
													5,
												)
											}}
											checked={filterData.byDate === 5}
										/>
									</Box>
								</Box>
							</SimpleCollapsibleComponent>
						</Box>
					)}
				</Box>

				{/* ----------- Fixed Footer ----------- */}
				<Box
					className={flexStyles.flexRowCenterSpaceBetween}
					sx={{ mt: 2 }}
				>
					<Button
						sx={{
							minWidth: '45%',
							height: '50px',
							color: 'globalElementColors.black',
							textTransform: 'capitalize',
						}}
						variant='outlined'
						onClick={handleClear}
						disabled={disableReset}
					>
						{localizationConstants.reset}
					</Button>
					<CustomButton
						sx={{ minWidth: '45%', height: '50px' }}
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
							onApply()
						}}
					/>
				</Box>
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
						date={new Date()}
						startDate={
							filterData.startDate
								? new Date(filterData.startDate)
								: new Date()
						}
						endDate={
							filterData.endDate
								? new Date(filterData.endDate)
								: null
						}
						onCancel={() => closePopover()}
						dateRange={true}
						onApply={onDateApply}
					/>
				</Popover>
			</Backdrop>
		</Drawer>
	)
}

export default memo(CommonFilterDrawer)
