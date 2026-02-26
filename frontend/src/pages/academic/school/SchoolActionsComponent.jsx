import {
	Box,
	Checkbox,
	Dialog,
	Divider,
	FormControlLabel,
	Table,
	TableBody,
	TableCell,
	TableRow,
	Typography,
} from '@mui/material'
import { counsellorStyles } from '../../counsellors/counsellorsStyles'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomTextfield from '../../../components/CustomTextField'
import { iconConstants } from '../../../resources/theme/iconConstants'
import CustomIcon from '../../../components/CustomIcon'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { getDate } from '../students/studentsFunctions'
import {
	sortkeys,
	studentsColumnForSectionShift,
} from '../students/studentsConstants'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import CustomButton from '../../../components/CustomButton'
import { commonComponentStyles } from '../../../components/commonComponentStyles'
import { useDispatch, useSelector } from 'react-redux'
import { requestParams } from '../../../utils/apiConstants'
import {
	clearAllStudentsForSchoolAction,
	clearClassroomListStudents,
	getAllClassroomsForStudents,
	viewAllStudentsForSchoolActions,
} from '../../../redux/commonSlice'

import useDebounce from '../../../customHooks/useDebounce'
import { redBorderForCustomSelect } from '../../../components/styles'
import { getCurrentAcademicYearId } from '../../../utils/utils'
import CustomAutocomplete from '../../../components/commonComponents/CustomAutoComplete'

import CustomAlertDialogs from '../../../components/commonComponents/CustomAlertDialogs'
import { TableVirtuoso } from 'react-virtuoso'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'
import CustomMultiSelectNoChip from '../../../components/commonComponents/CustomMultiSelectNoChip'
import TeacherTableHeader from '../../../components/TeacherTableHeader'

const SchoolActionsComponent = ({
	isOpen,
	onClose,
	schoolId,
	title,
	note,
	apiFunction,
	isSectionShiftDialog,
	handlePopovers,
}) => {
	const [columns, setColumns] = useState(studentsColumnForSectionShift)
	const dispatch = useDispatch()
	const virtuosoRef = useRef(null)
	const [sortKeys, setSortKeys] = useState([...sortkeys])
	const [isSelectedAllClicked, setIsSelectedAllClicked] = useState(false)
	const [selectedStudentIds, setSelectedStudentIds] = useState([])
	const [selectedAcademicYearId, setSelectedAcademicYearId] = useState(null)
	const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false)
	const [nextAcademicAy, setNextAcademicAy] = useState('')
	const [isSecondBoxClicked, setIsSecondBoxClicked] = useState(true)

	const [filteredIds, setFilteredIds] = useState([])
	const [sections, setSections] = useState([])
	const [filterFields, setFilterFields] = useState({
		class: [],
		fromSection: [],
		toSection: [],
		sections: [],
	})

	const [errors, setErrors] = useState({
		class: false,
		fromSection: false,
		toSection: false,
		studentsSelected: false,
	})

	const {
		allStudentsForSchoolActions: allStudents,
		classroomsListForStudents,
	} = useSelector((store) => store.commonData)
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const [searchValue, setSearchValue] = useState('')
	const debouncedSearch = useDebounce(searchValue, 1000)
	const [toSelectedClassId, settoSelectedClassId] = useState([])
	const { allSchools } = useSelector((state) => state.school)

	const rowCells = (column, row) => {
		switch (column.id) {
			case localizationConstants.id:
				return (
					<Typography variant={typographyConstants.body}>
						{row?.user_id}
					</Typography>
				)
			case localizationConstants.studentsName:
				return (
					<Typography variant={typographyConstants.body}>
						{row?.studentName}
					</Typography>
				)

			case localizationConstants.section:
				return (
					<Typography variant={typographyConstants.body}>
						{row?.section}
					</Typography>
				)
			case localizationConstants.registrationNumber:
				return (
					<Typography variant={typographyConstants.body}>
						{row?.regNo}
					</Typography>
				)

			case localizationConstants.registrationDate:
				return (
					<Typography variant={typographyConstants.body}>
						{getDate(row?.regDate)}
					</Typography>
				)

			default:
				return null
		}
	}

	const fetchClassrooms = useCallback(() => {
		const selectedSchool = allSchools?.data?.find(
			(school) => school._id === schoolId,
		)
		let selectedAYId = null
		const lastPromotionAcy = selectedSchool?.lastPromotionAcademicYear
		const currentAcyId = getCurrentAcademicYearId(academicYears)
		if (!lastPromotionAcy) {
			setSelectedAcademicYearId(currentAcyId)
			selectedAYId = currentAcyId
		} else {
			if (!lastPromotionAcy || !currentAcyId) {
				setSelectedAcademicYearId('')
				return
			}
			const lastPromotionYearObj = academicYears.find(
				(acy) => acy._id === lastPromotionAcy,
			)
			const lastPromotionOrder = lastPromotionYearObj.order
			const nextYearObj = academicYears.find(
				(acy) => acy.order === lastPromotionOrder + 1,
			)
			setNextAcademicAy(nextYearObj?.academicYear)

			selectedAYId =
				lastPromotionAcy === currentAcyId
					? currentAcyId
					: lastPromotionAcy
			setSelectedAcademicYearId(selectedAYId)
		}

		const filter = {
			schoolIds: schoolId ? [schoolId] : [],
			academicYear: [selectedAYId],
		}
		const body = { filter }
		dispatch(getAllClassroomsForStudents({ body }))
	}, [dispatch, schoolId, allSchools, academicYears])

	// Initialize with lastPromotionAcademicYear or currentAcyId
	useEffect(() => {
		fetchClassrooms()
	}, [schoolId, academicYears, allSchools, fetchClassrooms])

	// Map academicYear ID to label for display
	const getAcademicYearLabel = (id) => {
		const yearObj = academicYears.find((ay) => ay._id === id)
		return yearObj ? yearObj.academicYear : ''
	}

	useEffect(() => {
		if (
			title === localizationConstants.markStudentsasGraduate &&
			classroomsListForStudents.length > 0
		) {
			const highestClass = [...classroomsListForStudents].sort(
				(a, b) => b.classHierarchy - a.classHierarchy,
			)
			setFilterFields((prevFilterFields) => ({
				...prevFilterFields,
				class: [highestClass[0].className],
				sections: [],
			}))
			const matchingClassrooms = classroomsListForStudents.filter(
				(c) => c.className === highestClass.className,
			)
			const sectionOptions = [
				...new Set(matchingClassrooms.map((c) => c.section)),
			]
			setSections(sectionOptions)
		}
	}, [classroomsListForStudents, title])

	const fetchStudentsData = useCallback(
		(
			schoolId,
			classes,
			sections,
			debouncedSearch,
			selectedAcademicYearId,
		) => {
			// const section = sections ? sections : filterFields.fromSection

			const filter = {}
			if (schoolId) {
				filter['schoolIds'] = [schoolId]
			}
			if (classes?.length > 0) {
				filter['classroomIds'] = classes
			}

			const index = sortKeys.findIndex(
				(key) => key.key === 'registrationDate',
			)
			const SortKeys = JSON.parse(JSON.stringify(sortKeys))
			if (index !== -1) {
				SortKeys[index].key = 'regDate'
			}

			filter['academicYear'] = selectedAcademicYearId
			const body = {
				[requestParams.sortKeys]: SortKeys,
				filter,
				[requestParams.searchText]: debouncedSearch,
				isSchoolAction: true,
			}
			if (debouncedSearch?.length >= 3 || debouncedSearch?.length === 0) {
				body[requestParams.searchText] = debouncedSearch
			}
			dispatch(viewAllStudentsForSchoolActions({ body }))
		},
		[dispatch, sortKeys],
	)

	const validateForm = () => {
		let isError = false
		if (filterFields?.class?.length === 0) {
			setErrors((state) => ({ ...state, class: true }))
			isError = true
		}
		if (selectedStudentIds?.length === 0) {
			setErrors((state) => ({ ...state, studentsSelected: true }))
			isError = true
		}
		if (isSectionShiftDialog) {
			if (filterFields.fromSection.length === 0) {
				setErrors((state) => ({ ...state, fromSection: true }))
				isError = true
			}
			if (filterFields?.toSection?.length === 0) {
				setErrors((state) => ({ ...state, toSection: true }))
				isError = true
			}
		}
		return isError
	}
	const handleSubmitClick = () => {
		const validateFailed = validateForm()
		if (validateFailed) return
		setOpenConfirmationDialog(true)
	}

	const onSubmitFunction = () => {
		const validateFailed = validateForm()
		if (validateFailed) return
		setOpenConfirmationDialog(false)
		const body = {
			school: schoolId,
			selectedClass: filterFields.class,
			toSection: filterFields.toSection && filterFields.toSection,
			studentIds: selectedStudentIds,
			classroomIds: toSelectedClassId,
			academicYear: selectedAcademicYearId,
		}

		dispatch(apiFunction({ body }))
			.then(() => {
				fetchStudentsData(
					schoolId,
					filterFields?.class.length > 0 ? filteredIds : [],
					[],
					debouncedSearch,
					selectedAcademicYearId,
				)
				clearTheDataSet()
			})
			.catch((error) => {
				console.error('Error in apiFunction:', error)
			})
	}

	const clearTheDataSet = () => {
		setSearchValue('')
		setErrors({
			class: false,
			fromSection: false,
			toSection: false,
			studentsSelected: false,
		})
		setIsSelectedAllClicked(false)
		setFilterFields({
			class: [],
			fromSection: [],
			toSection: [],
			sections: [],
		})
		handlePopovers('shift', false)
		handlePopovers('exit', false)
		handlePopovers('graduate', false)
		dispatch(clearAllStudentsForSchoolAction())
		dispatch(clearClassroomListStudents())
	}

	useEffect(() => {
		const filteredClassrooms = classroomsListForStudents.filter(
			(classroom) => filterFields?.class.includes(classroom.className),
		)

		const filteredIds = filteredClassrooms.map((classroom) => classroom._id)
		setFilteredIds(filteredIds)

		// Get unique sections for selected class
		const uniqueSections = [
			...new Set(
				filteredClassrooms.map((classroom) => classroom.section),
			),
		]
		setSections(uniqueSections)

		let classroomIds = []
		let sectionNames = []

		if (isSectionShiftDialog) {
			if (
				filterFields?.class?.length > 0 &&
				filterFields?.fromSection?.length > 0
			) {
				classroomIds = filteredClassrooms
					.filter((classroom) =>
						filterFields.fromSection.includes(classroom.section),
					)
					.map((classroom) => classroom._id)

				sectionNames = filterFields.fromSection
			}
		} else if (title === localizationConstants.markStudentsasGraduate) {
			// Mark Students as Graduate
			if (
				filterFields?.class.length > 0 &&
				filterFields?.sections.length > 0
			) {
				classroomIds = filteredClassrooms
					.filter((classroom) =>
						filterFields.sections.includes(classroom.section),
					)
					.map((classroom) => classroom._id)

				sectionNames = filterFields.sections
			}
		} else if (title === localizationConstants.markStudentsasExited) {
			// Mark Students as Exited
			if (filterFields?.class?.length > 0) {
				classroomIds = filteredIds
				sectionNames = [] // No sections needed
			}
		}
		// Call API if classroomIds are ready
		if (classroomIds?.length > 0) {
			fetchStudentsData(
				schoolId,
				classroomIds,
				sectionNames,
				debouncedSearch,
				selectedAcademicYearId,
			)
		}
	}, [
		filterFields.class,
		// filterFields.fromSection,
		// filterFields.sections,
		sortKeys,
		debouncedSearch,
		isSectionShiftDialog,
		title,
	])

	useEffect(() => {
		if (isSelectedAllClicked) {
			const ids =
				allStudents?.data?.length > 0
					? allStudents?.data?.map((cls) => cls?._id)
					: []
			setSelectedStudentIds(ids)
		} else {
			setSelectedStudentIds([])
		}
	}, [isSelectedAllClicked])

	useEffect(() => {
		const filteredSections = classroomsListForStudents.filter((classroom) =>
			filteredIds.includes(classroom._id),
		)
		const classroomIds = filteredSections
			.filter((section) =>
				filterFields.toSection.includes(section.section),
			)
			.map((section) => section._id)
		settoSelectedClassId(classroomIds)
	}, [filterFields.toSection])

	useEffect(() => {
		if (virtuosoRef.current) {
			virtuosoRef.current.scrollToIndex({ index: 0 })
		}
	}, [allStudents?.data])

	useEffect(() => {
		if (isSecondBoxClicked) {
			const allVisibleStudentIds = allStudents?.data?.map((s) => s._id)
			setSelectedStudentIds(allVisibleStudentIds)
		} else {
			setSelectedStudentIds([])
		}
	}, [isSecondBoxClicked])

	return (
		<>
			<Dialog
				PaperProps={{
					sx: {
						borderRadius: '10px',
						minWidth: '50%',
						minHeight: '85%',
						display: 'flex',
						flexDirection: 'column',
						p: '20px',
					},
				}}
				open={isOpen}
				onClose={() => {
					onClose()
					clearTheDataSet()
				}}
			>
				<Box sx={{ minHeight: '20px' }}>
					<Box sx={{ pb: 0, textAlign: 'left' }}>
						<Typography
							sx={{
								textTransform: 'none',
								color: 'black',
								fontWeight: 800,
								fontSize: '20px',
							}}
						>
							{title}
						</Typography>
					</Box>
				</Box>
				<Divider sx={{ mt: '15px' }} />

				<Box
					sx={{
						p: '10px',
						textAlign: 'left',
						bgcolor: '#E6F0FB',
						mt: '15px',
					}}
				>
					<Typography
						component='span'
						sx={{
							fontWeight: 800,
							fontSize: '17px',
							color: '#DD2A2B',
						}}
					>
						{localizationConstants.note}:{' '}
						<Typography
							component='span'
							sx={{
								fontWeight: 800,
								fontSize: '17px',
								color: '#08091D',
								textTransform: 'none',
							}}
						>
							{note ? (
								note
							) : (
								<>
									{localizationConstants.ifStudentsOf}{' '}
									<Typography
										component='span'
										sx={{
											fontWeight: 800,
											fontSize: '17px',
											color: '#DD2A2B',
											fontStyle: 'italic',
											textTransform: 'none',
										}}
									>
										{filterFields.class}
									</Typography>{' '}
									{localizationConstants.areMeantToBe}{' '}
									<Typography
										component='span'
										sx={{
											fontWeight: 800,
											fontSize: '17px',
											color: '#DD2A2B',
											fontStyle: 'italic',
											textTransform: 'none',
										}}
									>
										{nextAcademicAy}
									</Typography>{' '}
									{localizationConstants.hasNotBeCreatedYet}
								</>
							)}
						</Typography>
					</Typography>
				</Box>

				{/* ------------Academic Year && Class Name ------------ */}
				<Box
					sx={{
						flexGrow: 1,
						overflow: 'auto',
						minHeight: '65vh',
						msOverflowStyle: 'none',
						scrollbarWidth: 'none',
						'&::-webkit-scrollbar:horizontal': {
							display: 'none',
						},
					}}
				>
					<Box>
						<Box
							sx={{
								mt: '15px',
								display: 'flex',
								flexDirection: 'row',
								justifyContent: 'space-between',
								gap: '20px',
							}}
						>
							<Box sx={{ width: '50%' }}>
								<Typography
									variant={typographyConstants.body}
									sx={
										{
											// color: 'textColors.grey',
											// fontSize: '14px',
											// mb: '4px',
										}
									}
								>
									{localizationConstants.academicYear}
								</Typography>
								<CustomAutocomplete
									sx={{ width: '100%' }}
									fieldSx={{
										width: '100%',
										height: '44px',
										marginTop: '3px',
									}}
									error={errors.academicYear}
									value={getAcademicYearLabel(
										selectedAcademicYearId,
									)}
									placeholder={`${localizationConstants.select} ${localizationConstants.academicYear}`}
									onChange={(e) => {
										dispatch(
											clearAllStudentsForSchoolAction(),
										)
										setSelectedAcademicYearId(e)
										fetchClassrooms()
									}}
									disabled={true}
								/>
							</Box>

							<Box sx={{ width: '50%' }}>
								<Typography
									variant={typographyConstants.body}
								>{`${localizationConstants.ClassCamel} `}</Typography>

								<CustomAutocompleteNew
									sx={{
										width: '100%',
									}}
									fieldSx={{
										height: '44px',
										marginTop: '3px',
										...redBorderForCustomSelect(
											errors.class,
										),
									}}
									value={filterFields?.class}
									onChange={(e) => {
										setErrors((state) => ({
											...state,
											class: false,
										}))

										dispatch(
											clearAllStudentsForSchoolAction(),
										)
										const selectedClass = e
										setFilterFields((prevFilterFields) => ({
											...prevFilterFields,
											class: [selectedClass],
											sections: [],
											fromSection: [],
											toSection: [],
										}))
										const matchingClassrooms =
											classroomsListForStudents.filter(
												(c) =>
													c.className ===
													selectedClass,
											)
										const sectionOptions = [
											...new Set(
												matchingClassrooms.map(
													(c) => c.section,
												),
											),
										]
										setSections(sectionOptions)
									}}
									options={
										classroomsListForStudents.length > 0
											? [
													...new Set(
														classroomsListForStudents.map(
															(classroom) =>
																classroom.className,
														),
													),
												]
											: []
									}
									multiple={false}
									disabled={
										title ===
										localizationConstants.markStudentsasGraduate
									}
									placeholder={`${localizationConstants.select} ${localizationConstants.class}`}
								/>
							</Box>
						</Box>

						{title ===
							localizationConstants.markStudentsasGraduate && (
							<Box sx={{ mt: '10px' }}>
								<CustomMultiSelectNoChip
									sx={{ height: '44px' }}
									fieldSx={{
										height: '44px',
										borderRadius: '6px',
									}}
									value={
										Array.isArray(filterFields.sections)
											? filterFields.sections
											: []
									}
									onChange={(e) => {
										setErrors((state) => ({
											...state,
											fromSection: false,
										}))

										const selectedSections = e
										setFilterFields((prevFilterFields) => ({
											...prevFilterFields,
											sections: selectedSections,
										}))
									}}
									onApply={() => {
										let classroomIds = []
										const selectedSections =
											filterFields.sections
										if (
											filterFields?.class?.length > 0 &&
											selectedSections?.length > 0
										) {
											classroomIds =
												classroomsListForStudents
													.filter(
														(classroom) =>
															filterFields.class.includes(
																classroom.className,
															) &&
															selectedSections.includes(
																classroom.section,
															),
													)
													.map(
														(classroom) =>
															classroom._id,
													)
										}

										if (classroomIds?.length > 0) {
											fetchStudentsData(
												schoolId,
												classroomIds,
												selectedSections,
												debouncedSearch,
												selectedAcademicYearId,
											)
										} else {
											dispatch(
												clearAllStudentsForSchoolAction(),
											)
										}
									}}
									options={sections}
									label={localizationConstants.section}
									placeholder={
										filterFields?.sections?.length == 0
											? localizationConstants.section
											: ''
									}
								/>
							</Box>
						)}

						{isSectionShiftDialog && (
							<Box
								sx={{
									display: 'flex',
									width: '100%',
									alignItems: 'center',
									justifyContent: 'space-between',
								}}
								gap={'20px'}
							>
								<Box sx={{ width: '50%' }}>
									<CustomMultiSelectNoChip
										sx={{ height: '48px' }}
										fieldSx={{
											minHeight: '44px',
											borderRadius: '6px',
										}}
										value={filterFields?.fromSection}
										onChange={(e) => {
											setErrors((state) => ({
												...state,
												fromSection: false,
											}))

											const selectedFromSection = e

											setFilterFields(
												(prevFilterFields) => ({
													...prevFilterFields,
													fromSection:
														selectedFromSection,
												}),
											)
										}}
										options={
											filterFields?.toSection?.length > 0
												? sections?.filter(
														(section) =>
															!filterFields?.toSection?.includes(
																section,
															),
													)
												: sections
										}
										label={
											localizationConstants.fromSection
										}
										onApply={() => {
											let classroomIds = []
											const selectedFromSection =
												filterFields.fromSection
											if (
												filterFields?.class?.length >
													0 &&
												selectedFromSection?.length > 0
											) {
												classroomIds =
													classroomsListForStudents
														.filter(
															(classroom) =>
																filterFields.class.includes(
																	classroom.className,
																) &&
																selectedFromSection.includes(
																	classroom.section,
																),
														)
														.map(
															(classroom) =>
																classroom._id,
														)
											}

											if (classroomIds?.length > 0) {
												fetchStudentsData(
													schoolId,
													classroomIds,
													selectedFromSection,
													debouncedSearch,
													selectedAcademicYearId,
												)
											} else {
												dispatch(
													clearAllStudentsForSchoolAction(),
												)
											}
										}}
										placeholder={
											filterFields?.fromSection?.length ==
											0
												? localizationConstants.selectSection
												: ''
										}
									/>
								</Box>

								<Box sx={{ mt: '15px', width: '50%' }}>
									<Typography
										variant={typographyConstants.body}
									>{`${localizationConstants.toSection} `}</Typography>
									<CustomAutocompleteNew
										sx={{
											flexGrow: 1,
											width: '100%',
											height: '44px',
										}}
										fieldSx={{
											height: '44px',
											...redBorderForCustomSelect(
												errors.toSection,
											),
										}}
										placeholder={`${localizationConstants.selectSection}`}
										onChange={(e) => {
											setErrors((state) => ({
												...state,
												toSection: false,
											}))
											const selectedToSection = e
											// Update the toSection filter field
											if (selectedToSection) {
												setFilterFields(
													(prevFilterFields) => ({
														...prevFilterFields,
														toSection:
															selectedToSection,
													}),
												)
											}
										}}
										value={filterFields?.toSection}
										// Filter out the selected "fromSection" from the options
										options={
											filterFields?.fromSection?.length >
											0
												? sections?.filter(
														(section) =>
															!filterFields?.fromSection?.includes(
																section,
															),
													)
												: sections
										}
									/>
								</Box>
							</Box>
						)}

						<Box
							sx={{
								mt:
									title ===
									localizationConstants.markStudentsasGraduate
										? '50px'
										: '25px',
							}}
						>
							{allStudents?.data && (
								<Box sx={{ mb: '10px' }}>
									<Typography>
										{localizationConstants.totalStudents}{' '}
										{allStudents?.data?.length}
									</Typography>
								</Box>
							)}

							<CustomTextfield
								formSx={{ minWidth: '200px', width: '100%' }}
								propSx={{ height: '30px' }}
								endIcon={
									<CustomIcon name={iconConstants.search} />
								}
								placeholder={
									localizationConstants.searchPalceholderForCOPE
								}
								onChange={(e) => setSearchValue(e.target.value)}
								value={searchValue}
							/>
						</Box>
						{errors.studentsSelected && (
							<Box sx={{ pt: '10px' }}>
								<Typography
									sx={{
										color: 'globalElementColors.red',
										pt: '10px',
									}}
									variant={typographyConstants.body}
								>
									{
										localizationConstants.studentsNotSelectedError
									}
								</Typography>
							</Box>
						)}
						<Box
							sx={{
								pt: errors.studentsSelected ? '0px' : '20px',
							}}
						>
							<TableVirtuoso
								style={{
									...counsellorStyles.tableContainerSx,
									minHeight:
										title ===
										localizationConstants.markStudentsasExited
											? '390px'
											: '330px',
								}}
								data={allStudents?.data || []}
								overscan={100}
								ref={virtuosoRef}
								components={{
									Table: (props) => (
										<Table
											{...props}
											stickyHeader
											size='small'
											aria-labelledby='tableTitle'
										/>
									),
									TableBody: React.forwardRef(
										(props, ref) => (
											<TableBody {...props} ref={ref} />
										),
									),
								}}
								fixedHeaderContent={() => (
									<TeacherTableHeader
										columns={columns}
										sortKeys={sortKeys}
										setSortKeys={setSortKeys}
										setColumns={setColumns}
										isSelectedAllForDelete={
											isSelectedAllClicked
										}
										setIsSelectedAllForDelete={
											setIsSelectedAllClicked
										}
										bulkSelection={true}
										isSecondBoxClicked={isSecondBoxClicked}
										setIsSecondBoxClicked={
											setIsSecondBoxClicked
										}
									/>
								)}
								itemContent={(index, row) => (
									<TableRow
										hover
										tabIndex={-1}
										key={index}
										onClick={(e) => {
											const isFormControlLabelClick =
												e.target.closest(
													'.MuiFormControlLabel-root',
												) !== null

											if (isFormControlLabelClick) {
												return
											}
											if (isSelectedAllClicked) {
												const studentId = row?._id
												setSelectedStudentIds(
													(prevIds) => {
														if (
															prevIds.includes(
																studentId,
															)
														) {
															return prevIds.filter(
																(id) =>
																	id !==
																	studentId,
															)
														} else {
															return [
																...prevIds,
																studentId,
															]
														}
													},
												)
											} else {
												setSelectedStudentIds([])
											}
										}}
										sx={{ cursor: 'pointer' }}
									>
										{columns.map((column, index) => {
											return (
												<TableCell
													key={column.id}
													align={column.align}
													sx={{
														height: '60px',
														padding: '10px',
														borderBottom: 'none',
														minWidth: column.width,
														maxWidth: column.width,
														position:
															column.position,
														left: column.left,
														zIndex: 1,
														// backgroundColor:
														//   column.position === 'sticky' && 'white',
														borderColor:
															'globalElementColors.grey4',
														borderRight:
															column.id ===
																localizationConstants.schoolName &&
															'1px solid',
														borderRightColor:
															column.id ===
																localizationConstants.schoolName &&
															'globalElementColors.grey4',
													}}
												>
													<Box
														sx={{
															display: 'flex',
															alignItems:
																'center',
														}}
													>
														{isSelectedAllClicked &&
															index === 0 && (
																<FormControlLabel
																	checked={selectedStudentIds?.includes(
																		row?._id,
																	)}
																	onChange={(
																		e,
																	) => {
																		setErrors(
																			(
																				state,
																			) => ({
																				...state,
																				studentsSelected: false,
																			}),
																		)
																		e.stopPropagation()
																		const studentId =
																			row?._id
																		setSelectedStudentIds(
																			(
																				prevIds,
																			) => {
																				// Check if the ID is already in the array
																				if (
																					prevIds.includes(
																						studentId,
																					)
																				) {
																					// If already selected, remove it from the array
																					return prevIds.filter(
																						(
																							id,
																						) =>
																							id !==
																							studentId,
																					)
																				} else {
																					// If not selected, add it to the array
																					return [
																						...prevIds,
																						studentId,
																					]
																				}
																			},
																		)
																	}}
																	control={
																		<Checkbox
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
																/>
															)}
														{rowCells(column, row)}
													</Box>
												</TableCell>
											)
										})}
									</TableRow>
								)}
							/>
						</Box>
					</Box>
				</Box>

				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						height: '60px',
						gap: '20px',
						width: '100%',
					}}
					gap={'30px'}
				>
					<Box sx={{ width: '50%' }}>
						<CustomButton
							sx={{
								...commonComponentStyles.customBtnUploadDialogSX,
								borderColor: 'blue',
								flexGrow: 1,
								width: '100%',
							}}
							text={localizationConstants.cancel}
							onClick={() => {
								clearTheDataSet()
							}}
							typoVariant={typographyConstants.body}
							typoSx={{
								color: 'textColors.black',
							}}
						/>
					</Box>
					<Box sx={{ width: '50%' }}>
						<CustomButton
							sx={{
								...commonComponentStyles.rightButtonDialogSx,
								flexGrow: 1,
								width: '100%',
							}}
							text={localizationConstants.submit}
							onClick={handleSubmitClick}
							typoVariant={typographyConstants.body}
							typoSx={{
								color: 'textColors.white',
							}}
						/>
					</Box>
					{openConfirmationDialog && (
						<CustomAlertDialogs
							open={openConfirmationDialog}
							setOpen={setOpenConfirmationDialog}
							type={
								localizationConstants.graduateExitShiftWarning
							}
							title={title}
							onSubitClick={onSubmitFunction}
							onCancelClick={() =>
								setOpenConfirmationDialog(false)
							}
							iconName={iconConstants.alertTriangle}
						/>
					)}
				</Box>
			</Dialog>
		</>
	)
}

export default SchoolActionsComponent
