import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	Backdrop,
	Dialog,
	Popover,
	Table,
	TableBody,
	TableCell,
	TableRow,
	TableHead,
	TableContainer,
	Typography,
	Box,
	Divider,
	Drawer,
	Snackbar,
	Alert,
	IconButton,
	TextField,
	InputAdornment,
	Button,
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import SearchIcon from '@mui/icons-material/Search'
import BarChartIcon from '@mui/icons-material/BarChart'
import DownloadIcon from '@mui/icons-material/Download'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import debounce from 'lodash.debounce'

import CustomIcon from '../../../components/CustomIcon'
import CustomTextfield from '../../../components/CustomTextField'
import CustomButton from '../../../components/CustomButton'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { iconConstants } from '../../../resources/theme/iconConstants'
import {
	initialScheduleProfilingDataStates,
	teacherIRIColumns,
} from './teacherProfilingConstants'
import CustomPagination from '../../../components/CustomPagination'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { counsellorStyles } from '../../counsellors/counsellorsStyles'
import { tableStyles } from '../../../components/styles/tableStyles'
import {
	formatDate,
	getCurACYear,
	getCurrentAcademicYearId,
	sortEnum,
} from '../../../utils/utils'
import InlineDatePicker from '../../../components/InlineDatePicker'
import {
	addSchoolProfiling,
	clearAllTeachersForspecificSchool,
	updateSchoolProfiling,
} from './teacherProfilingSlice'
import { handleDownloadExcel } from './teachersProfilingThunk'
import {
	fetchAllTeacherProfilingRecords,
	getSelectedProfiles,
} from './teacherProfilingFunctions'
import CommonFilterDrawer, {
	initialAccordionStates,
	initialFilterStates,
} from '../../../components/commonComponents/CustomFilter'
import SchoolWiseProfilingAnalyticsDialog from './SchoolWiseProfilingAnalyticsDialog'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'
import CustomMultiSelectNoChip from '../../../components/commonComponents/CustomMultiSelectNoChip'
import TeacherProfilingTeachersList from './TeacherProfilingTeachersList'
import { getSchoolsList } from '../../../redux/commonSlice'
import CustomMultiSelectAutoComplete from '../../../components/commonComponents/CustomMultiSelectAutoComplete'

const TeacherProfilingSchoolList = () => {
	const dateRef = useRef(null)
	const tableContainerRef = useRef(null)
	const dispatch = useDispatch()
	const { appPermissions } = useSelector((store) => store.dashboardSliceSetup)
	const { allProfilingForSchoolsRecords } = useSelector(
		(store) => store.teacherProfiling,
	)
	const { schoolsList } = useSelector((state) => state.commonData)
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const [currentPage, setCurrentPage] = useState(1)
	const [columns, setColumns] = useState(teacherIRIColumns)
	const [selectedRowData, setSelectedRowData] = useState(null)
	const [sortKeys, setSortKeys] = useState([{ key: 'startDate', value: sortEnum.desc }])
	const [rowsPerPage, setRowsPerPage] = useState({
		text: '150',
		value: 150,
	})
	const [scheduleProfilingDialog, setScheduleProfilingDialog] = useState(false)
	const [startdDatePicker, setStartDatePicker] = useState(false)
	const [endDatePicker, setEndDatePicker] = useState(false)
	const [hoveredRowIndex, setHoveredRowIndex] = useState(null)
	const [isEditBtnClicked, setIsEditBtnClicked] = useState(false)
	const [editDrawer, setEditDrawer] = useState(false)

	const [showTeachersList, setShowTeachersList] = useState(false)
	const [selectedSchoolRow, setSelectedSchoolRow] = useState(null)

	const [showError, setShowError] = useState(false)
	const [modal, setModal] = useState({
		upload: false,
		filter: false,
		add: false,
		delete: false,
		analytics: false,
	})
	const [filterData, setFilterData] = useState(initialFilterStates)
	const [searchText, setSearchText] = useState('')
	const [searchInputValue, setSearchInputValue] = useState('')

	const [scheduleProfilingData, setScheduleProfilingData] = useState(
		initialScheduleProfilingDataStates,
	)
	const [scheduleProfilingUpdateData, setScheduleProfilingUpdateData] =
		useState({ startDate: '', endDate: '' })
	const [isCurAcademicYear, setIsCurAcademicYear] = useState(false)

	const handleBackToSchoolList = useCallback(() => {
		setShowTeachersList(false)
		setSelectedSchoolRow(null)
		dispatch(clearAllTeachersForspecificSchool())
	}, [dispatch])

	const handleRowClick = useCallback((e, row) => {
		const isFormControlLabelClick =
			e.target.closest('.MuiFormControlLabel-root') !== null
		if (isFormControlLabelClick) {
			return
		} else {
			setSelectedSchoolRow(row)
			setShowTeachersList(true)
		}
	}, [])

	const handleSort = (columnName) => {
		const currentSortKey = sortKeys[0]
		let newValue

		if (currentSortKey?.key === columnName) {
			// Same column clicked - toggle direction
			newValue = currentSortKey.value === sortEnum.asc ? sortEnum.desc : sortEnum.asc
		} else {
			// Different column clicked - start with descending
			newValue = sortEnum.desc
		}

		setSortKeys([{ key: columnName, value: newValue }])
	}

	const getSortIcon = (column) => {
		if (!column.sort) return null
		const activeSortKey = sortKeys[0]
		if (activeSortKey?.key !== column.name) {
			return <UnfoldMoreIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
		}
		if (activeSortKey.value === sortEnum.asc) {
			return <KeyboardArrowUpIcon sx={{ fontSize: 14, color: '#3B82F6' }} />
		}
		if (activeSortKey.value === sortEnum.desc) {
			return <KeyboardArrowDownIcon sx={{ fontSize: 14, color: '#3B82F6' }} />
		}
		return <UnfoldMoreIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
	}

	const renderCellContent = (column, row, index) => {
		const fieldName = column.name

		if (fieldName === 'schoolName') return row?.schoolName || '-'
		if (fieldName === 'academicYear') return row?.academicYear || localizationConstants.notApplicable
		if (fieldName === 'startDate') {
			return row?.startDate
				? formatDate(row?.startDate)
				: localizationConstants?.scheduleStartDate
		}
		if (fieldName === 'endDate') {
			return row?.endDate
				? formatDate(row?.endDate)
				: localizationConstants?.scheduleEndDate
		}
		if (fieldName === 'totalTeacherCount') return row?.totalTeacherCount || '0'
		if (fieldName === 'pendingTeacherCount') return row?.pendingTeacherCount || '0'
		if (fieldName === 'submittedTeacherCount') return row?.submittedTeacherCount || '0'
		if (fieldName === 'profilingStatus') {
			return (
				<Box sx={{ display: 'flex', alignItems: 'center' }}>
					<Box
						sx={{
							display: 'inline-block',
							width: '8px',
							height: '8px',
							borderRadius: '50%',
							marginRight: '6px',
							backgroundColor: row?.profilingStatus === 'Active' ? '#25C548' : '#EF4444',
						}}
					/>
					{row?.profilingStatus || '-'}
				</Box>
			)
		}
		if (fieldName === 'actions') {
			return hoveredRowIndex === index && appPermissions?.TeacherIRI?.edit ? (
				<IconButton
					size='small'
					onClick={(e) => {
						e.stopPropagation()
						if (row?.startDate && row?.endDate) {
							setSelectedRowData(row)
							setEditDrawer(true)
						} else {
							setShowError(true)
						}
					}}
				>
					<EditIcon sx={{ fontSize: 18, color: '#64748B' }} />
				</IconButton>
			) : null
		}

		return '-'
	}

	const handleModal = useCallback((name, value) => {
		setModal((state) => ({ ...state, [name]: value }))
	}, [])

	const handleEscapeKeyDown = (event) => {
		if (event.key === 'Escape') {
			setEditDrawer(false)
			setScheduleProfilingDialog(false)
		}
	}

	const debouncedSearch = useCallback(
		debounce((text) => {
			setSearchText(text)
			setCurrentPage(1)
		}, 500),
		[],
	)

	const handleSearchChange = (e) => {
		const value = e.target.value
		setSearchInputValue(value)
		debouncedSearch(value)
	}

	const refreshList = (search_text) => {
		const curACYear = getCurACYear()
		const academicYearId = academicYears.find(
			(obj) => obj.academicYear === curACYear,
		)

		const selectedAcademicYears =
			Array.isArray(filterData?.selectdAYs) &&
			filterData.selectdAYs.length > 0
				? filterData.selectdAYs
				: [academicYearId?._id]
		const newFilterData = {
			...filterData,
			selectdAYs: selectedAcademicYears,
		}
		setFilterData(newFilterData)

		fetchAllTeacherProfilingRecords(
			dispatch,
			newFilterData,
			search_text ?? searchText,
			currentPage,
			rowsPerPage.value,
			sortKeys,
		)
	}

	useEffect(() => {
		if (academicYears.length > 0) {
			refreshList()
		}
	}, [
		academicYears,
		sortKeys,
		currentPage,
		rowsPerPage,
		searchText,
		dispatch,
	])

	useEffect(() => {
		if (tableContainerRef.current) {
			tableContainerRef.current.scrollTop = 0
		}
	}, [allProfilingForSchoolsRecords?.data])

	const profilingSectionOptions = getSelectedProfiles(selectedRowData)

	useEffect(() => {
		const currentAyId = getCurrentAcademicYearId(academicYears)
		if (String(selectedRowData?.academicYearId) === String(currentAyId)) {
			setIsCurAcademicYear(true)
		} else {
			setIsCurAcademicYear(false)
		}
	}, [selectedRowData, academicYears])

	useEffect(() => {
		if (scheduleProfilingDialog || modal.analytics) {
			const body = {
				filter: {
					academicYear: getCurrentAcademicYearId(academicYears),
				},
			}
			dispatch(getSchoolsList({ body }))
		}
	}, [scheduleProfilingDialog, modal.analytics, academicYears, dispatch])

	const tableMinWidth = useMemo(() => {
		return columns.reduce((sum, col) => sum + (col.width || 0), 0)
	}, [columns])

	if (showTeachersList) {
		return (
			<Box>
				<TeacherProfilingTeachersList
					initialRowData={selectedSchoolRow}
					handleBackToSchoolList={handleBackToSchoolList}
					refreshSchoolList={refreshList}
				/>
			</Box>
		)
	}

	return (
		<Box sx={counsellorStyles.pageContainerSx}>
			{/* Toolbar */}
			<Box sx={counsellorStyles.toolbarSx}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<TextField
						placeholder={localizationConstants.searchSchool}
						value={searchInputValue}
						onChange={handleSearchChange}
						size='small'
						sx={counsellorStyles.searchFieldSx}
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>
									<SearchIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
								</InputAdornment>
							),
						}}
					/>
				</Box>

				<Box sx={counsellorStyles.actionButtonsSx}>
					<Button
						variant='text'
						startIcon={<BarChartIcon sx={{ fontSize: 16 }} />}
						sx={{
							textTransform: 'none',
							color: '#3B82F6',
							fontWeight: 500,
							fontSize: '13px',
						}}
						onClick={() => handleModal('analytics', true)}
					>
						{localizationConstants.analytics}
					</Button>

					<IconButton
						sx={counsellorStyles.filterButtonSx}
						onClick={() => handleModal('filter', true)}
					>
						<FilterListIcon sx={{ fontSize: 18, color: '#64748B' }} />
					</IconButton>

					{appPermissions?.teacherProfiling?.edit && (
						<Button
							variant='contained'
							startIcon={<AddIcon sx={{ fontSize: 16 }} />}
							sx={counsellorStyles.addButtonSx}
							onClick={() => setScheduleProfilingDialog(true)}
						>
							{localizationConstants.scheduleProfiling}
						</Button>
					)}
				</Box>
			</Box>

			{allProfilingForSchoolsRecords?.data?.length > 0 ? (
				<Box sx={{ ...tableStyles.container, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
					<TableContainer
						ref={tableContainerRef}
						sx={{ flex: 1, minHeight: 0, overflow: 'auto', ...tableStyles.scrollWrapper }}
					>
						<Table
							stickyHeader
							size='small'
							sx={{ tableLayout: 'fixed', minWidth: tableMinWidth }}
						>
							<TableHead>
								<TableRow sx={{ height: '44px' }}>
									{columns.map((column) => (
										<TableCell
											key={column.id}
											sx={{
												...tableStyles.headerCell,
												width: column.width,
												minWidth: column.width,
												cursor: column.sort ? 'pointer' : 'default',
												'&:hover': column.sort
													? { backgroundColor: '#F1F5F9' }
													: {},
											}}
											onClick={() => column.sort && handleSort(column.name)}
										>
											<Box
												sx={{
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'space-between',
												}}
											>
												<Typography
													sx={{
														fontSize: '11px',
														fontWeight: 600,
														color: '#64748B',
														textTransform: 'uppercase',
														letterSpacing: '0.3px',
														flex: 1,
													}}
												>
													{column.label}
												</Typography>
												{column.sort && (
													<IconButton size='small' sx={{ p: 0 }}>
														{getSortIcon(column)}
													</IconButton>
												)}
											</Box>
										</TableCell>
									))}
								</TableRow>
							</TableHead>
							<TableBody>
								{allProfilingForSchoolsRecords?.data?.map((rowData, index) => (
									<TableRow
										key={rowData._id || index}
										onClick={(e) => handleRowClick(e, rowData)}
										onMouseEnter={() => setHoveredRowIndex(index)}
										onMouseLeave={() => setHoveredRowIndex(null)}
										sx={tableStyles.bodyRow}
									>
										{columns.map((column) => (
											<TableCell
												key={column.id}
												sx={{
													...tableStyles.bodyCell,
													width: column.width,
													minWidth: column.width,
												}}
											>
												<Typography
													sx={{
														fontSize: '13px',
														color: '#334155',
														overflow: 'hidden',
														textOverflow: 'ellipsis',
														whiteSpace: 'nowrap',
													}}
												>
													{renderCellContent(column, rowData, index)}
												</Typography>
											</TableCell>
										))}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>

					{/* Footer */}
					<Box sx={tableStyles.footer}>
						<Box
							sx={tableStyles.downloadLink}
							onClick={() => {
								const body = fetchAllTeacherProfilingRecords(
									dispatch,
									filterData,
									searchText,
									currentPage,
									rowsPerPage.value,
									sortKeys,
									true,
								)
								handleDownloadExcel(body, true)()
							}}
						>
							<DownloadIcon sx={{ fontSize: 16 }} />
							<Typography sx={{ fontSize: '13px', fontWeight: 500 }}>
								{localizationConstants.downloadReport}
							</Typography>
						</Box>
						<CustomPagination
							rowsPerPage={rowsPerPage}
							setRowsPerPage={setRowsPerPage}
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
							totalCount={allProfilingForSchoolsRecords?.totalCount}
						/>
					</Box>
				</Box>
			) : (
				<Box sx={{ ...tableStyles.emptyState, flex: 1 }}>
					<CustomIcon
						name={iconConstants.noSchoolsBlack}
						style={{ width: '80px', height: '80px', opacity: 0.4 }}
						svgStyle={'width: 80px; height: 80px'}
					/>
					<Typography sx={tableStyles.emptyStateTitle}>
						{localizationConstants.NoProfilingDataScheduled}
					</Typography>
				</Box>
			)}

			{/* Schedule Profiling Dialog */}
			<Dialog
				onKeyDown={handleEscapeKeyDown}
				PaperProps={{
					style: {
						borderRadius: '20px',
						width: '430px',
						minHeight: '450px',
					},
				}}
				open={scheduleProfilingDialog}
			>
				<Box sx={{ p: '36px 36px 36px 24px' }}>
					<Box sx={{ height: '100%' }}>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<Typography
								variant={typographyConstants.h4}
								sx={{
									fontWeight: 500,
									color: 'textColors.blue',
									fontSize: '24px',
								}}
							>
								{localizationConstants?.scheduleProfiling}
							</Typography>
							<IconButton
								onClick={() => {
									setScheduleProfilingData(initialScheduleProfilingDataStates)
									setScheduleProfilingDialog(false)
								}}
							>
								<CloseIcon />
							</IconButton>
						</Box>
						<Box sx={{ pt: '15px' }}>
							<Typography variant={typographyConstants.body}>
								{`${localizationConstants.schoolName} *`}
							</Typography>
							<CustomAutocompleteNew
								sx={{
									minWidth: '200px',
									width: '100%',
									height: '47px',
									borderRadius: '4px',
								}}
								fieldSx={{
									borderRadius: '4px',
									mb: '3px',
									height: '47px',
								}}
								value={scheduleProfilingData?.school}
								placeholder={localizationConstants.selectSchoolName}
								onChange={(e) => {
									setScheduleProfilingData((state) => ({
										...state,
										school: e,
									}))
								}}
								options={
									schoolsList.map((sc) => ({
										id: sc?._id,
										label: sc?.school,
									})) || []
								}
								name='SchoolId'
							/>
						</Box>
						<Box sx={{ pt: '15px' }}>
							<CustomMultiSelectNoChip
								sx={{
									minWidth: '200px',
									width: '100%',
									height: '47px',
								}}
								fieldSx={{
									height: '47px',
									borderRadius: '4px',
								}}
								value={scheduleProfilingData?.profilingSections || []}
								hideAllCheckbox={true}
								onChange={(selected) => {
									const optionIds = profilingSectionOptions.map((opt) => opt.id)

									if (selected.includes('all')) {
										if (
											scheduleProfilingData?.profilingSections?.length ===
											optionIds.length
										) {
											setScheduleProfilingData((state) => ({
												...state,
												profilingSections: [],
											}))
										} else {
											setScheduleProfilingData((state) => ({
												...state,
												profilingSections: optionIds,
											}))
										}
										return
									}
									setScheduleProfilingData((state) => ({
										...state,
										profilingSections: selected,
									}))
								}}
								options={[
									{ id: 'all', label: 'All' },
									...profilingSectionOptions,
								]}
								label={`${localizationConstants.selectSections} *`}
								placeholder={
									scheduleProfilingData?.profilingSections?.length === 0
										? localizationConstants.selectSections
										: ''
								}
							/>
						</Box>
						<Box sx={{ cursor: 'pointer', pt: '40px' }}>
							<Box ref={dateRef}>
								<Box onClick={() => setStartDatePicker(true)}>
									<CustomTextfield
										readOnly={true}
										formSx={{ width: '100%' }}
										propSx={{ height: '44px' }}
										labelText={`${localizationConstants.startDate} *`}
										labelTypoSx={{ pb: '5px', pt: '1px' }}
										endIcon={
											<CustomIcon name={iconConstants.calender} />
										}
										value={
											scheduleProfilingData?.startDate
												? formatDate(scheduleProfilingData?.startDate)
												: 'Select Start Date'
										}
									/>
								</Box>
							</Box>
						</Box>

						<Box sx={{ cursor: 'pointer', pt: '20px' }}>
							<Box ref={dateRef}>
								<Box onClick={() => setEndDatePicker(true)}>
									<CustomTextfield
										readOnly={true}
										formSx={{ width: '100%' }}
										propSx={{ height: '44px' }}
										labelText={`${localizationConstants.endDate} *`}
										labelTypoSx={{ pb: '5px', pt: '1px' }}
										endIcon={
											<CustomIcon name={iconConstants.calender} />
										}
										value={
											scheduleProfilingData?.endDate
												? formatDate(scheduleProfilingData?.endDate)
												: 'Select End Date'
										}
									/>
								</Box>
							</Box>
						</Box>

						<Box sx={{ pt: '30px' }}>
							<CustomButton
								text={localizationConstants.Schedule}
								sx={{ height: '44px', marginRight: '10px' }}
								svgStyle={'width: 14px; height: 29px'}
								onClick={async () => {
									const body = {
										SchoolId: scheduleProfilingData?.school,
										startDate: scheduleProfilingData?.startDate,
										endDate: scheduleProfilingData?.endDate,
										profilingSections:
											scheduleProfilingData?.profilingSections,
									}
									const res = await dispatch(addSchoolProfiling({ body }))
									if (!res.error) {
										setScheduleProfilingDialog(false)
										refreshList()
										setScheduleProfilingData(
											initialScheduleProfilingDataStates,
										)
									}
								}}
								disabled={
									scheduleProfilingData?.school === '' ||
									scheduleProfilingData?.startDate === '' ||
									scheduleProfilingData?.endDate === '' ||
									scheduleProfilingData?.profilingSections?.length === 0
								}
							/>
						</Box>
					</Box>
				</Box>
			</Dialog>

			<Backdrop
				sx={{
					color: 'globalElementColors.grey1',
					zIndex: (theme) => theme.zIndex.drawer + 1,
				}}
				open={startdDatePicker}
			>
				<Popover
					id={'date'}
					open={startdDatePicker}
					onClose={() => setStartDatePicker(false)}
					anchorEl={dateRef.current}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'left',
					}}
					sx={{
						width: '390px',
						maxHeight: '500px',
						mt: '-60px',
					}}
				>
					<InlineDatePicker
						date={
							scheduleProfilingData?.startDate
								? new Date(scheduleProfilingData.startDate)
								: new Date()
						}
						dateRange={false}
						onChange={(e) => {
							if (isEditBtnClicked) {
								setScheduleProfilingUpdateData((state) => ({
									...state,
									startDate: new Date(e),
								}))
							} else {
								setScheduleProfilingData((state) => ({
									...state,
									startDate: new Date(e),
								}))
							}
							setStartDatePicker(false)
						}}
					/>
				</Popover>
			</Backdrop>
			<Backdrop
				sx={{
					color: 'globalElementColors.grey1',
					zIndex: (theme) => theme.zIndex.drawer + 1,
				}}
				open={endDatePicker}
			>
				<Popover
					id={'date'}
					open={endDatePicker}
					onClose={() => setEndDatePicker(false)}
					anchorEl={dateRef.current}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'left',
					}}
					sx={{
						width: '390px',
						maxHeight: '500px',
						mt: '30px',
					}}
				>
					<InlineDatePicker
						date={
							scheduleProfilingData?.endDate
								? new Date(scheduleProfilingData.endDate)
								: new Date()
						}
						dateRange={false}
						onChange={(e) => {
							if (isEditBtnClicked) {
								setScheduleProfilingUpdateData((state) => ({
									...state,
									endDate: new Date(e),
								}))
							} else {
								setScheduleProfilingData((state) => ({
									...state,
									endDate: new Date(e),
								}))
							}
							setEndDatePicker(false)
						}}
					/>
				</Popover>
			</Backdrop>

			{/* Edit Drawer */}
			<Drawer
				anchor='right'
				sx={counsellorStyles.drawerSx}
				open={editDrawer}
				onKeyDown={handleEscapeKeyDown}
			>
				<Box sx={{ flexGrow: 1 }}>
					<Box
						sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: '12px' }}
					>
						<Typography
							variant={typographyConstants.h4}
							sx={{ fontWeight: 500, color: 'textColors.blue' }}
						>
							{localizationConstants?.editScheduleProfiling}
						</Typography>
						<IconButton
							onClick={() => {
								setScheduleProfilingUpdateData({
									startDate: '',
									endDate: '',
								})
								setEditDrawer(false)
								setIsEditBtnClicked(false)
							}}
						>
							<CloseIcon />
						</IconButton>
					</Box>

					<Divider />
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '10px', mt: '20px' }}>
						<Box
							sx={{
								borderRadius: '15px',
								border: '1px solid gray',
								pr: '15px',
								pl: '10px',
								py: '5px',
								display: 'flex',
								alignItems: 'center',
							}}
						>
							<Box
								sx={{
									display: 'inline-block',
									width: '10px',
									height: '10px',
									borderRadius: '50%',
									marginRight: '8px',
									backgroundColor:
										selectedRowData?.profilingStatus === 'Active'
											? '#25C548'
											: 'red',
								}}
							/>
							<Typography
								variant='h5'
								sx={{ fontWeight: '700' }}
							>
								{selectedRowData?.profilingStatus}
							</Typography>
						</Box>
					</Box>
					<Box
						sx={{
							mt: '5px',
							height: `calc(100vh - 270px)`,
							overflow: 'auto',
							p: '5px',
						}}
					>
						<Box sx={counsellorStyles.typeRadioSx}>
							<Typography variant={typographyConstants.title}>
								{localizationConstants.schoolName}
							</Typography>
						</Box>
						<Box sx={{ mt: '25px' }}>
							<CustomTextfield
								formSx={{ width: '100%' }}
								propSx={{ height: '44px' }}
								labelTypoSx={{ fontSize: '17px', pb: '4px' }}
								value={selectedRowData?.schoolName}
								disabled={true}
								readOnly
							/>
						</Box>
						<Box sx={counsellorStyles.typeRadioSx}>
							<Typography variant={typographyConstants.title}>
								{localizationConstants.sections}
							</Typography>
						</Box>
						<Box sx={{ mb: '20px', mt: '25px' }}>
							<CustomMultiSelectAutoComplete
								sx={{
									minWidth: '200px',
									width: '100%',
								}}
								fieldSx={{
									borderRadius: '6px',
								}}
								value={profilingSectionOptions
									.filter((opt) => opt.selected)
									.map((opt) => opt.id)}
								options={profilingSectionOptions}
								disabled={true}
							/>
						</Box>
						<Box sx={counsellorStyles.typeRadioSx}>
							<Typography variant={typographyConstants.title}>
								{localizationConstants.date}
							</Typography>
						</Box>
						<Box sx={{ cursor: 'pointer', mt: '20px' }}>
							<Box ref={dateRef}>
								<Box
									onClick={() =>
										isEditBtnClicked && setStartDatePicker(true)
									}
								>
									<CustomTextfield
										readOnly={true}
										formSx={{ width: '100%' }}
										propSx={{ height: '44px' }}
										labelText={`${localizationConstants.startDate} *`}
										labelTypoSx={{ pb: '5px', pt: '1px' }}
										endIcon={
											<CustomIcon name={iconConstants.calender} />
										}
										value={
											scheduleProfilingUpdateData?.startDate
												? formatDate(scheduleProfilingUpdateData?.startDate)
												: formatDate(selectedRowData?.startDate)
										}
										disabled={
											!isEditBtnClicked ||
											new Date(selectedRowData?.startDate) <= new Date()
										}
									/>
								</Box>
							</Box>
						</Box>

						<Box sx={{ cursor: 'pointer', pt: '20px' }}>
							<Box ref={dateRef}>
								<Box
									onClick={() =>
										isEditBtnClicked && setEndDatePicker(true)
									}
								>
									<CustomTextfield
										readOnly={true}
										formSx={{ width: '100%' }}
										propSx={{ height: '44px' }}
										labelText={`${localizationConstants.endDate} *`}
										labelTypoSx={{ pb: '5px', pt: '1px' }}
										endIcon={
											<CustomIcon name={iconConstants.calender} />
										}
										value={
											scheduleProfilingUpdateData?.endDate
												? formatDate(scheduleProfilingUpdateData?.endDate)
												: formatDate(selectedRowData?.endDate)
										}
										disabled={!isEditBtnClicked}
									/>
								</Box>
							</Box>
						</Box>
					</Box>
				</Box>
				{!isCurAcademicYear && (
					<Typography
						variant={typographyConstants.h5}
						sx={{ mb: '30px', color: '#DD2A2B' }}
					>
						{localizationConstants.editScheduleProfilingMsg}
					</Typography>
				)}
				{isEditBtnClicked && (
					<Box
						sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '36px', mt: '-20px' }}
					>
						<CustomButton
							sx={{
								minWidth: '192px',
								height: '60px',
								backgroundColor: 'transparent',
								border: '1px solid',
								borderColor: 'globalElementColors.blue',
							}}
							typoSx={{ color: 'textColors.black' }}
							text={localizationConstants.cancel}
							onClick={() => {
								setIsEditBtnClicked(false)
								setScheduleProfilingUpdateData({
									startDate: '',
									endDate: '',
								})
							}}
						/>
						<CustomButton
							sx={{ minWidth: '192px', height: '60px' }}
							text={localizationConstants.update}
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
							onClick={async () => {
								const body = {
									startDate: scheduleProfilingUpdateData?.startDate
										? scheduleProfilingUpdateData?.startDate
										: selectedRowData.startDate,
									endDate: scheduleProfilingUpdateData?.endDate
										? scheduleProfilingUpdateData?.endDate
										: selectedRowData.endDate,
								}
								const res = await dispatch(
									updateSchoolProfiling({
										body,
										id: selectedRowData?._id,
									}),
								)

								if (!res.error) {
									refreshList()
									setIsEditBtnClicked(false)
									setEditDrawer(false)
								}
							}}
						/>
					</Box>
				)}

				{!isEditBtnClicked && (
					<CustomButton
						sx={{ mb: '36px', mt: '-20px' }}
						text={localizationConstants.edit}
						onClick={() => setIsEditBtnClicked(true)}
						disabled={!isCurAcademicYear}
					/>
				)}
			</Drawer>

			{/* Filter Drawer */}
			<CommonFilterDrawer
				onOpen={modal.filter}
				handleModal={handleModal}
				filterOptions={{
					...initialAccordionStates,
					AYs: true,
					schools: true,
					status: true,
				}}
				filterData={filterData}
				setFilterData={setFilterData}
				onApply={() => {
					refreshList()
					handleModal('filter', false)
				}}
				defaultAccordions={['AYs', 'status']}
			/>

			{modal.analytics && (
				<SchoolWiseProfilingAnalyticsDialog
					open={modal.analytics}
					onClose={() => handleModal('analytics', false)}
				/>
			)}

			<Snackbar
				open={showError}
				autoHideDuration={3500}
				onClose={() => setShowError(false)}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
			>
				<Alert onClose={() => setShowError(false)} severity='error'>
					{localizationConstants?.editScheduleErrorMsg}
				</Alert>
			</Snackbar>
		</Box>
	)
}

export default TeacherProfilingSchoolList
