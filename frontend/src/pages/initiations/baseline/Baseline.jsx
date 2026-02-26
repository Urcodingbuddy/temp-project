import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import {
	Box,
	Checkbox,
	FormControlLabel,
	IconButton,
	Table,
	TableBody,
	TableCell,
	TableRow,
	TableHead,
	TableContainer,
	Typography,
	TextField,
	InputAdornment,
	Button,
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import SearchIcon from '@mui/icons-material/Search'
import DownloadIcon from '@mui/icons-material/Download'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import VisibilityIcon from '@mui/icons-material/Visibility'
import debounce from 'lodash.debounce'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import {
	fetchAllBaselineRecords,
	getBackgroundColor,
	handleDeleteBaselineRecord,
	handleSelectDropDown,
} from './baselineFunctions'
import { counsellorStyles } from '../../counsellors/counsellorsStyles'
import { tableStyles } from '../../../components/styles/tableStyles'
import {
	bulkDeleteBaseline,
	clearBaselineAnalyticsDownloadFilter,
	clearBaselineFilter,
	clearBaselineIdsForDelete,
	clearStudentStatus,
	setBaselineAnalyticalFilterClasses,
	setBaselineAnalyticalFilterSchools,
	setBaselineAnalyticalFilterSections,
	setBaselineFilterSchools,
	setBaselineIdsForDelete,
	setBaselineIdsForDeleteBulk,
} from './baselineSlice'
import {
	baselineColumn,
	dropDownOptions,
} from './baselineConstants'
import BaselineDrawer from './BaselineDrawer'
import CustomDialog from '../../../components/CustomDialog'
import CustomPagination from '../../../components/CustomPagination'
import { handleDownloadExcel } from './baselineThunk'
import UploadBaselineDate from './UploadBaselineDate'
import { getAllClassroomsForStudents } from '../../../redux/commonSlice'
import { formatDate, getCurACYear, getUserFromLocalStorage, sortEnum } from '../../../utils/utils'
import {
	initialAccordionStates,
	initialFilterStates,
} from '../../../components/commonComponents/CustomFilter'
import CommonFilterDrawer from '../../../components/commonComponents/CustomFilter'
import AddBaseLineDialog from './AddBaseLineDialog'
import StudentBaselineReportDialog from './StudentBaselineReportDialog'
import BaselineAnalyticsDialog from './BaselineAnalyticsDialog'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'

const Baseline = () => {
	const location = useLocation()
	const dispatch = useDispatch()
	const tableContainerRef = useRef(null)
	const { appPermissions } = useSelector((store) => store.dashboardSliceSetup)
	const { schoolsList } = useSelector((store) => store.commonData)
	const { filterFieldsBaseline, allBaselineRecords, baselineIdsForDelete } =
		useSelector((store) => store.baseline)
	const [rowsPerPage, setRowsPerPage] = useState({
		text: '150',
		value: 150,
	})
	const [currentPage, setCurrentPage] = useState(1)
	const [baselineDrawerOpen, setBaselineDrawerOpen] = useState(false)
	const [columns, setColumns] = useState(baselineColumn)
	const [sortKeys, setSortKeys] = useState([{ key: 'createdAt', value: sortEnum.desc }])
	const [selectedData, setSelectedData] = useState({
		data: [],
		total: '',
		category: '',
		rowId: '',
	})
	const [hoveredRowIndex, setHoveredRowIndex] = useState(null)
	const [deleteId, setDeleteId] = useState('')
	const [deleteStudentDialog, setDeleteStudentDialog] = useState(false)
	const [selectedDropDown, setSelectedDropDown] = useState('')
	const [isSelectedAllForDelete, setIsSelectedAllForDelete] = useState(false)
	const [deleteBulkDialog, setDeleteBulkDialog] = useState(false)

	const user = getUserFromLocalStorage()
	const isTeacher = user?.permissions[0] === 'Teacher'

	const [modal, setModal] = useState({
		upload: false,
		filter: false,
		add: false,
		analytics: false,
		stdReport: false,
	})
	const [filterData, setFilterData] = useState(initialFilterStates)
	const [searchText, setSearchText] = useState('')
	const [searchInputValue, setSearchInputValue] = useState('')
	const [singleStdRowdata, setSingleStdRowData] = useState({})

	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)

	const handleModal = useCallback((name, value) => {
		const obj = {}
		obj[name] = value
		setModal((state) => ({ ...state, ...obj }))
	}, [])

	const debouncedSearch = useMemo(
		() =>
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

	const handleSelectedData = useCallback((data, total, category, rowId) => {
		setSelectedData({ data, total, category, rowId })
		setBaselineDrawerOpen(true)
	}, [])

	useEffect(() => {
		if (location.state?.analytics) {
			handleModal('analytics', true)
		}
	}, [location.state])

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

	const renderScoreCell = (row, field, category) => {
		const fieldData = row?.[field]
		return (
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
				<Box
					sx={{
						width: '22px',
						height: '22px',
						borderRadius: '4px',
						backgroundColor: getBackgroundColor(fieldData?.total),
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<Typography sx={{ fontSize: '11px', color: 'white', fontWeight: 600 }}>
						{fieldData?.total}
					</Typography>
				</Box>
				<IconButton
					size='small'
					onClick={(e) => {
						e.stopPropagation()
						if (!isSelectedAllForDelete) {
							handleSelectedData(
								fieldData?.data,
								fieldData?.total,
								category,
								row?._id,
							)
						}
					}}
					sx={{ p: 0, color: '#64748B' }}
				>
					<VisibilityIcon sx={{ fontSize: 16 }} />
				</IconButton>
			</Box>
		)
	}

	const renderCellContent = (column, row) => {
		const fieldName = column.name

		if (fieldName === 'user_id') return row?.user_id || '-'
		if (fieldName === 'academicYear') return row?.academicYear || localizationConstants.notApplicable
		if (fieldName === 'createdAt') return formatDate(row?.createdAt) || '-'
		if (fieldName === 'studentName') {
			return (
				<Typography
					sx={{
						fontSize: '13px',
						color: '#334155',
						cursor: isTeacher || isSelectedAllForDelete ? 'default' : 'pointer',
						'&:hover': {
							textDecoration: isTeacher || isSelectedAllForDelete ? 'none' : 'underline',
						},
					}}
					onClick={(e) => {
						e.stopPropagation()
						if (!isTeacher && !isSelectedAllForDelete) {
							setSingleStdRowData(row)
							handleModal('stdReport', true)
						}
					}}
				>
					{row?.studentName || '-'}
				</Typography>
			)
		}
		if (fieldName === 'baselineCategory') return row?.baselineCategory || '-'
		if (fieldName === 'Physical') return renderScoreCell(row, 'Physical', localizationConstants.physical)
		if (fieldName === 'Social') return renderScoreCell(row, 'Social', localizationConstants.social)
		if (fieldName === 'Emotional') return renderScoreCell(row, 'Emotional', localizationConstants.emotional)
		if (fieldName === 'Cognitive') return renderScoreCell(row, 'Cognitive', localizationConstants.cognitive)
		if (fieldName === 'Language') return renderScoreCell(row, 'Language', localizationConstants.language)

		return '-'
	}

	const refreshListAndCloseDialog = (type) => {
		if (type === 'add') handleModal('add', false)
		else if (type === 'upload') handleModal('upload', false)

		fetchAllBaselineRecords(
			dispatch,
			filterData,
			searchText,
			currentPage,
			rowsPerPage.value,
			sortKeys,
		)
	}

	const isFirstLoad = useRef(true)
	useEffect(() => {
		if (academicYears.length > 0) {
			let filter_data = { ...filterData }
			if (isFirstLoad.current) {
				const curACYear = getCurACYear()
				const academicYearId = academicYears.find(
					(obj) => obj.academicYear === curACYear,
				)
				if (academicYearId) {
					setFilterData((state) => ({
						...state,
						selectdAYs: [academicYearId._id],
					}))
					filter_data = {
						...filter_data,
						selectdAYs: [academicYearId._id],
					}
				}
				isFirstLoad.current = false
			}

			fetchAllBaselineRecords(
				dispatch,
				filter_data,
				searchText,
				currentPage,
				rowsPerPage.value,
				sortKeys,
			)
		}
	}, [academicYears, sortKeys, currentPage, rowsPerPage, searchText, dispatch])

	useEffect(() => {
		dispatch(clearStudentStatus())
	}, [dispatch])

	useEffect(() => {
		if (isSelectedAllForDelete) {
			const ids =
				allBaselineRecords?.data?.length > 0
					? allBaselineRecords?.data?.map((cls) => cls?._id)
					: []
			dispatch(setBaselineIdsForDeleteBulk(ids))
		} else {
			dispatch(clearBaselineIdsForDelete())
		}
	}, [isSelectedAllForDelete, allBaselineRecords, dispatch])

	useEffect(() => {
		if (baselineIdsForDelete?.length === 0) {
			setIsSelectedAllForDelete(false)
		}
	}, [baselineIdsForDelete])

	useEffect(() => {
		setIsSelectedAllForDelete(false)
	}, [currentPage])

	useEffect(() => {
		if (isTeacher) {
			const selectedSchool = schoolsList[0]?._id
			if (
				selectedSchool &&
				!filterFieldsBaseline?.schools?.includes(selectedSchool)
			) {
				dispatch(setBaselineFilterSchools([selectedSchool]))
				dispatch(
					getAllClassroomsForStudents({
						body: {
							filter: {
								schoolIds: [selectedSchool],
							},
						},
					}),
				)
			}
		}
	}, [isTeacher, schoolsList, filterFieldsBaseline?.schools, dispatch])

	useEffect(() => {
		if (tableContainerRef.current) {
			tableContainerRef.current.scrollTop = 0
		}
	}, [allBaselineRecords?.data])

	const tableMinWidth = useMemo(() => {
		return columns.reduce((sum, col) => sum + (col.width || 0), 0)
	}, [columns])

	return (
		<Box sx={counsellorStyles.pageContainerSx}>
			{/* Toolbar */}
			<Box sx={counsellorStyles.toolbarSx}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<TextField
						placeholder={localizationConstants.searchPalceholderForCOPE}
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
					<IconButton
						sx={counsellorStyles.filterButtonSx}
						onClick={() => handleModal('filter', true)}
					>
						<FilterListIcon sx={{ fontSize: 18, color: '#64748B' }} />
					</IconButton>

					{!isTeacher && (
						<Button
							variant={appPermissions?.BaselineManagement?.edit ? 'outlined' : 'contained'}
							sx={{
								...counsellorStyles.addButtonSx,
								...(appPermissions?.BaselineManagement?.edit && {
									borderColor: 'primary.main',
									color: 'primary.main',
									backgroundColor: 'transparent',
								}),
							}}
							onClick={() => {
								dispatch(setBaselineAnalyticalFilterSchools([]))
								dispatch(setBaselineAnalyticalFilterClasses([]))
								dispatch(setBaselineAnalyticalFilterSections([]))
								clearBaselineFilter()
								clearBaselineAnalyticsDownloadFilter()
								handleModal('analytics', true)
							}}
						>
							{localizationConstants.baselineAnalytics}
						</Button>
					)}

					{appPermissions?.BaselineManagement?.edit && (
						<CustomAutocompleteNew
							options={dropDownOptions.map((op) => ({
								id: op?.id,
								label: op?.label,
							}))}
							sx={{ minWidth: '140px', height: '34px' }}
							fieldSx={{ height: '34px' }}
							placeholder={localizationConstants.select}
							value={selectedDropDown}
							onChange={(e) => {
								handleSelectDropDown(e, handleModal, setSelectedDropDown)
							}}
						/>
					)}
				</Box>
			</Box>

			{/* Table */}
			{allBaselineRecords?.data?.length > 0 ? (
				<Box sx={{ ...tableStyles.container, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
					<TableContainer
						ref={tableContainerRef}
						sx={{ flex: 1, overflow: 'auto', ...tableStyles.scrollWrapper }}
					>
						<Table
							stickyHeader
							size='small'
							sx={{ tableLayout: 'fixed', minWidth: tableMinWidth }}
						>
							<TableHead>
								<TableRow sx={{ height: '44px' }}>
									{columns.map((column, idx) => (
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
												{isSelectedAllForDelete && idx === 0 && (
													<Checkbox
														size='small'
														checked={isSelectedAllForDelete}
														onChange={() =>
															setIsSelectedAllForDelete(!isSelectedAllForDelete)
														}
														sx={{ p: 0, mr: 1 }}
													/>
												)}
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
								{allBaselineRecords?.data?.map((row, index) => (
									<TableRow
										key={row._id || index}
										onMouseEnter={() => setHoveredRowIndex(index)}
										onMouseLeave={() => setHoveredRowIndex(null)}
										onClick={(e) => {
											const isFormControlClick =
												e.target.closest('.MuiFormControlLabel-root') !== null
											if (isFormControlClick) return

											if (isSelectedAllForDelete) {
												dispatch(setBaselineIdsForDelete(row?._id))
											}
										}}
										sx={tableStyles.bodyRow}
									>
										{columns.map((column, colIdx) => (
											<TableCell
												key={column.id}
												sx={{
													...tableStyles.bodyCell,
													width: column.width,
													minWidth: column.width,
												}}
											>
												{column.id === localizationConstants.showCategoryActions ? (
													appPermissions?.BaselineManagement?.edit &&
													hoveredRowIndex === index &&
													!isSelectedAllForDelete &&
													!isTeacher ? (
														<IconButton
															size='small'
															onClick={(e) => {
																e.stopPropagation()
																setDeleteId(row?._id)
																setDeleteStudentDialog(true)
															}}
															sx={{
																color: '#EF4444',
																'&:hover': {
																	backgroundColor: 'rgba(239, 68, 68, 0.1)',
																},
															}}
														>
															<DeleteOutlineIcon sx={{ fontSize: 18 }} />
														</IconButton>
													) : null
												) : (
													<Box sx={{ display: 'flex', alignItems: 'center' }}>
														{isSelectedAllForDelete && colIdx === 0 && (
															<FormControlLabel
																checked={baselineIdsForDelete?.includes(row?._id)}
																onChange={(e) => {
																	e.stopPropagation()
																	dispatch(setBaselineIdsForDelete(row?._id))
																}}
																control={
																	<Checkbox size='small' sx={{ p: 0, mr: 1 }} />
																}
																label=''
																sx={{ m: 0 }}
															/>
														)}
														{renderCellContent(column, row)}
													</Box>
												)}
											</TableCell>
										))}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>

					{/* Footer */}
					<Box sx={tableStyles.footer}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
							{!isSelectedAllForDelete && baselineIdsForDelete?.length === 0 ? (
								<Box
									sx={tableStyles.downloadLink}
									onClick={() => {
										const body = fetchAllBaselineRecords(
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
							) : (
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<Button
										variant='contained'
										sx={{
											...tableStyles.actionButton,
											backgroundColor: '#6B7280',
											'&:hover': { backgroundColor: '#4B5563' },
										}}
										onClick={() => setIsSelectedAllForDelete(false)}
									>
										{localizationConstants.cancel}
									</Button>
									<Button
										variant='contained'
										sx={{
											...tableStyles.actionButton,
											backgroundColor: '#EF4444',
											'&:hover': { backgroundColor: '#DC2626' },
										}}
										onClick={() => setDeleteBulkDialog(true)}
									>
										{localizationConstants.delete}
									</Button>
								</Box>
							)}
						</Box>
						<CustomPagination
							rowsPerPage={rowsPerPage}
							setRowsPerPage={setRowsPerPage}
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
							totalCount={allBaselineRecords?.totalCount}
						/>
					</Box>
				</Box>
			) : (
				<Box sx={tableStyles.emptyState}>
					<CustomIcon
						name={iconConstants.initiationBlack}
						style={{ width: '80px', height: '80px', opacity: 0.4 }}
						svgStyle={'width: 80px; height: 80px'}
					/>
					<Typography sx={tableStyles.emptyStateTitle}>
						{localizationConstants.noBaselinesAdded}
					</Typography>
					<Typography sx={tableStyles.emptyStateSubtitle}>
						{localizationConstants.addBaseline}
					</Typography>
				</Box>
			)}

			{/* Filter Drawer */}
			<CommonFilterDrawer
				onOpen={modal.filter}
				handleModal={handleModal}
				filterOptions={{
					...initialAccordionStates,
					AYs: true,
					schools: true,
					classrooms: true,
					sections: true,
					studentStatus: true,
				}}
				filterData={filterData}
				setFilterData={setFilterData}
				onApply={() => {
					const curACYear = getCurACYear()
					const academicYearId = academicYears.find(
						(obj) => obj.academicYear === curACYear,
					)

					const newFilterData = {
						...filterData,
						selectdAYs:
							Array.isArray(filterData?.selectdAYs) &&
							filterData.selectdAYs.length > 0
								? filterData.selectdAYs
								: [academicYearId?._id],
					}
					setFilterData(newFilterData)
					fetchAllBaselineRecords(
						dispatch,
						newFilterData,
						searchText,
						currentPage,
						rowsPerPage.value,
						sortKeys,
					)
					handleModal('filter', false)
				}}
				defaultAccordions={['AYs', 'studentStatus']}
			/>

			{/* Baseline Drawer */}
			<BaselineDrawer
				baselineDrawerOpen={baselineDrawerOpen}
				setBaselineDrawerOpen={setBaselineDrawerOpen}
				data={selectedData.data}
				category={selectedData.category}
				total={selectedData.total}
				rowId={selectedData.rowId}
				pageSize={rowsPerPage.value}
				onEditBaseline={() => refreshListAndCloseDialog()}
			/>

			{/* Delete Single Dialog */}
			<CustomDialog
				isOpen={deleteStudentDialog}
				title={localizationConstants.deleteStudentRecord}
				iconName={iconConstants.academicRed}
				message={localizationConstants.baselineDeleteMsg}
				titleSx={{
					color: 'textColors.red',
					fontWeight: 500,
					pb: '20px',
				}}
				leftButtonText={localizationConstants.cancel}
				rightButtonText={localizationConstants.yesDelete}
				onLeftButtonClick={() => setDeleteStudentDialog(false)}
				onRightButtonClick={async () => {
					const deleted = await handleDeleteBaselineRecord(
						dispatch,
						deleteId,
						setDeleteStudentDialog,
					)
					if (deleted) {
						fetchAllBaselineRecords(
							dispatch,
							filterData,
							searchText,
							currentPage,
							rowsPerPage.value,
							sortKeys,
						)
					}
				}}
			/>

			{/* Delete Bulk Dialog */}
			<CustomDialog
				isOpen={deleteBulkDialog}
				onClose={() => setDeleteBulkDialog(false)}
				title={localizationConstants?.deleteMultipleBaseline}
				iconName={iconConstants.academicRed}
				titleSx={{
					color: 'textColors.red',
					fontWeight: 500,
					pb: '20px',
				}}
				message={localizationConstants.deleteBulkInBaselineMsg}
				leftButtonText={localizationConstants.cancel}
				rightButtonText={localizationConstants.yesDelete}
				onLeftButtonClick={() => setDeleteBulkDialog(false)}
				onRightButtonClick={async () => {
					const body = {
						recordIds: baselineIdsForDelete,
					}
					const res = await dispatch(bulkDeleteBaseline({ body }))
					if (!res?.error) {
						setIsSelectedAllForDelete(false)
						setDeleteBulkDialog(false)
						fetchAllBaselineRecords(
							dispatch,
							filterData,
							searchText,
							currentPage,
							rowsPerPage.value,
							sortKeys,
						)
					}
				}}
			/>

			{/* Baseline Bulk Upload */}
			<UploadBaselineDate
				modal={modal}
				handleModal={handleModal}
				setSelectedDropDown={setSelectedDropDown}
				listFilterData={{
					filterData,
					searchText,
					currentPage,
					rowsPerPage: rowsPerPage.value,
					sortKeys,
				}}
			/>

			{/* Add Dialog */}
			{modal.add && (
				<AddBaseLineDialog
					open={modal.add}
					onClose={() => {
						handleModal('add', false)
						setSelectedDropDown('')
					}}
					onAddBaseline={() => {
						refreshListAndCloseDialog('add')
						setSelectedDropDown('')
					}}
				/>
			)}

			{/* Analytics Dialog */}
			{modal.analytics && (
				<BaselineAnalyticsDialog
					open={modal.analytics}
					onClose={() => handleModal('analytics', false)}
				/>
			)}

			{/* Student Report Dialog */}
			{modal.stdReport && (
				<StudentBaselineReportDialog
					open={modal.stdReport}
					onClose={() => handleModal('stdReport', false)}
					singleStdRowdata={singleStdRowdata}
					setSingleStdRowData={setSingleStdRowData}
				/>
			)}
		</Box>
	)
}

export default Baseline
