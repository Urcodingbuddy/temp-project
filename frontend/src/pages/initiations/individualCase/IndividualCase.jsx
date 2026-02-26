import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import DownloadIcon from '@mui/icons-material/Download'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import debounce from 'lodash.debounce'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { counsellorStyles } from '../../counsellors/counsellorsStyles'
import { tableStyles } from '../../../components/styles/tableStyles'
import {
	ISOStringToTimeString,
	formatDate,
	getCurACYear,
	sortEnum,
} from '../../../utils/utils'
import {
	bulkDeleteIndividualRecord,
	clearIndividualCaseIdsForDelete,
	clearStudentStatus,
	setIndividualCaseIdsForDelete,
	setIndividualCaseIdsForDeleteBulk,
} from './individualCaseSlice'
import {
	fetchAllIndividualRecords,
	handleDeleteIndividualRecord,
} from './individualCaseFunctions'
import { getSchoolsList } from '../../../redux/commonSlice'
import CustomDialog from '../../../components/CustomDialog'
import {
	invalidTest,
	individualCaseColumn,
} from './individualCaseConstants'
import CustomPagination from '../../../components/CustomPagination'
import { handleDownloadExcel } from './individualCaseThunk'

import {
	initialAccordionStates,
	initialFilterStates,
} from '../../../components/commonComponents/CustomFilter'
import CommonFilterDrawer from '../../../components/commonComponents/CustomFilter'

import EditStudent from './EditIndividualCase'
import AddIndividualCaseDialog from './AddIndividualCaseDialog'

const IndividualCase = () => {
	const dispatch = useDispatch()
	const tableContainerRef = useRef(null)
	const { appPermissions } = useSelector((store) => store.dashboardSliceSetup)
	const { allIndividualRecords, individualCaseIdsForDelete } = useSelector(
		(store) => store.individualCase,
	)

	const [hoveredRowIndex, setHoveredRowIndex] = useState(null)
	const [rowDataSelected, setRowDataSelected] = useState({})
	const [deleteIndividualRecordDialog, setDeleteIndividualRecordDialog] =
		useState(false)
	const [isSelectedAllForDelete, setIsSelectedAllForDelete] = useState(false)
	const [deleteBulkDialog, setDeleteBulkDialog] = useState(false)
	const [rowsPerPage, setRowsPerPage] = useState({
		text: '150',
		value: 150,
	})
	const [currentPage, setCurrentPage] = useState(1)

	const [columns, setColumns] = useState(individualCaseColumn)
	const [sortKeys, setSortKeys] = useState([{ key: 'date', value: sortEnum.desc }])

	const [filterData, setFilterData] = useState(initialFilterStates)
	const [searchText, setSearchText] = useState('')
	const [searchInputValue, setSearchInputValue] = useState('')

	const [modal, setModal] = useState({
		upload: false,
		filter: false,
		add: false,
		edit: false,
	})
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

	const truncateText = (text, maxLength = 80) => {
		if (!text) return '-'
		return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
	}

	const renderCellContent = (column, row) => {
		const fieldName = column.name

		if (fieldName === 'user_id') return row?.user_id || '-'
		if (fieldName === 'academicYear') return row?.academicYear || localizationConstants.notApplicable
		if (fieldName === 'studentName') return row?.studentName || '-'
		if (fieldName === 'date') return formatDate(row?.date) || '-'
		if (fieldName === 'createdAt') return formatDate(row?.createdAt) || '-'
		if (fieldName === 'startTime') {
			return !invalidTest.includes(row?.startTime)
				? ISOStringToTimeString(row?.startTime)
				: '-'
		}
		if (fieldName === 'endTime') {
			return !invalidTest.includes(row?.endTime)
				? ISOStringToTimeString(row?.endTime)
				: '-'
		}

		// Text fields that need truncation
		const textFields = [
			'issues',
			'goals',
			'activity',
			'dimension',
			'description',
			'stype',
			'basedOn',
			'purpose',
			'outcome',
			'improvements',
			'comments',
			'tasksAssigned',
			'poa',
		]

		if (textFields.includes(fieldName)) {
			return truncateText(row?.[fieldName])
		}

		return '-'
	}

	const refreshListAndCloseDialog = (type) => {
		if (type === 'add') handleModal('add', false)
		else if (type === 'edit') handleModal('edit', false)
		else if (type === 'upload') handleModal('upload', false)

		fetchAllIndividualRecords(
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

			fetchAllIndividualRecords(
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
		dispatch(getSchoolsList({}))
		dispatch(clearStudentStatus())
	}, [dispatch])

	useEffect(() => {
		if (isSelectedAllForDelete) {
			const ids =
				allIndividualRecords?.data?.length > 0
					? allIndividualRecords?.data?.map((cls) => cls?._id)
					: []
			dispatch(setIndividualCaseIdsForDeleteBulk(ids))
		} else {
			dispatch(clearIndividualCaseIdsForDelete())
		}
	}, [isSelectedAllForDelete, allIndividualRecords, dispatch])

	useEffect(() => {
		if (individualCaseIdsForDelete?.length === 0) {
			setIsSelectedAllForDelete(false)
		}
	}, [individualCaseIdsForDelete])

	useEffect(() => {
		setIsSelectedAllForDelete(false)
	}, [currentPage])

	useEffect(() => {
		if (tableContainerRef.current) {
			tableContainerRef.current.scrollTop = 0
		}
	}, [allIndividualRecords?.data])

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

					{appPermissions?.IndividualCaseManagement?.edit && (
						<Button
							variant='contained'
							startIcon={<AddIcon sx={{ fontSize: 16 }} />}
							sx={counsellorStyles.addButtonSx}
							onClick={() => handleModal('add', true)}
						>
							{localizationConstants.addStudent}
						</Button>
					)}
				</Box>
			</Box>

			{/* Table */}
			{allIndividualRecords?.data?.length > 0 ? (
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
								{allIndividualRecords?.data?.map((row, index) => (
									<TableRow
										key={row._id || index}
										onMouseEnter={() => setHoveredRowIndex(index)}
										onMouseLeave={() => setHoveredRowIndex(null)}
										onClick={(e) => {
											const isFormControlClick =
												e.target.closest('.MuiFormControlLabel-root') !== null
											if (isFormControlClick) return

											if (isSelectedAllForDelete) {
												dispatch(setIndividualCaseIdsForDelete(row?._id))
											} else {
												setRowDataSelected(row)
												handleModal('edit', true)
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
													appPermissions?.IndividualCaseManagement?.edit &&
													hoveredRowIndex === index &&
													!isSelectedAllForDelete ? (
														<IconButton
															size='small'
															onClick={(e) => {
																e.stopPropagation()
																setRowDataSelected(row)
																setDeleteIndividualRecordDialog(true)
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
																checked={individualCaseIdsForDelete?.includes(
																	row?._id,
																)}
																onChange={(e) => {
																	e.stopPropagation()
																	dispatch(setIndividualCaseIdsForDelete(row?._id))
																}}
																control={
																	<Checkbox size='small' sx={{ p: 0, mr: 1 }} />
																}
																label=''
																sx={{ m: 0 }}
															/>
														)}
														<Typography
															sx={{
																fontSize: '13px',
																color: '#334155',
																overflow: 'hidden',
																textOverflow: 'ellipsis',
																whiteSpace: 'nowrap',
															}}
														>
															{renderCellContent(column, row)}
														</Typography>
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
							{!isSelectedAllForDelete &&
							individualCaseIdsForDelete?.length === 0 ? (
								<Box
									sx={tableStyles.downloadLink}
									onClick={() => {
										const body = fetchAllIndividualRecords(
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
							totalCount={allIndividualRecords?.totalCount}
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
						{localizationConstants.noIndividualCasesAdded}
					</Typography>
					<Typography sx={tableStyles.emptyStateSubtitle}>
						{localizationConstants.addIndividualCase}
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
					fetchAllIndividualRecords(
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

			{/* Delete Single Dialog */}
			<CustomDialog
				isOpen={deleteIndividualRecordDialog}
				title={localizationConstants.deleteStudentCaseLog}
				iconName={iconConstants.academicRed}
				message={localizationConstants.deleteStudentCaseLogMsg}
				titleSx={{
					color: 'textColors.red',
					fontWeight: 500,
					pb: '20px',
				}}
				leftButtonText={localizationConstants.cancel}
				rightButtonText={localizationConstants.yesDelete}
				onLeftButtonClick={() => setDeleteIndividualRecordDialog(false)}
				onRightButtonClick={() =>
					handleDeleteIndividualRecord(
						rowDataSelected?._id,
						dispatch,
						setDeleteIndividualRecordDialog,
						refreshListAndCloseDialog,
					)
				}
			/>

			{/* Delete Bulk Dialog */}
			<CustomDialog
				isOpen={deleteBulkDialog}
				onClose={() => setDeleteBulkDialog(false)}
				title={localizationConstants?.deleteMultipleIndividualCase}
				iconName={iconConstants.academicRed}
				titleSx={{
					color: 'textColors.red',
					fontWeight: 500,
					pb: '20px',
				}}
				message={localizationConstants.deleteBulkInIndividualCaseMsg}
				leftButtonText={localizationConstants.cancel}
				rightButtonText={localizationConstants.yesDelete}
				onLeftButtonClick={() => setDeleteBulkDialog(false)}
				onRightButtonClick={async () => {
					const body = {
						recordIds: individualCaseIdsForDelete,
					}
					const res = await dispatch(bulkDeleteIndividualRecord({ body }))
					if (!res?.error) {
						setIsSelectedAllForDelete(false)
						setDeleteBulkDialog(false)
						fetchAllIndividualRecords(
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

			{/* Add Dialog */}
			{modal.add && (
				<AddIndividualCaseDialog
					open={modal.add}
					onClose={() => handleModal('add', false)}
					onAddIndividual={() => refreshListAndCloseDialog('add')}
				/>
			)}

			{/* Edit Dialog */}
			{modal.edit && (
				<EditStudent
					open={modal.edit}
					onClose={() => handleModal('edit', false)}
					rowDataSelected={rowDataSelected}
					onEditIndividual={() => refreshListAndCloseDialog('edit')}
				/>
			)}
		</Box>
	)
}

export default IndividualCase
