import {
	Box,
	Checkbox,
	Divider,
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
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import FilterListIcon from '@mui/icons-material/FilterList'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import DownloadIcon from '@mui/icons-material/Download'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import debounce from 'lodash.debounce'
import { counsellorStyles } from '../../counsellors/counsellorsStyles'
import { tableStyles } from '../../../components/styles/tableStyles'
import { getSchoolsList } from '../../../redux/commonSlice'
import {
	observationColumn,
	topHeader,
} from './observationConstants'
import {
	fetchAllObservations,
	handleDeleteObservation,
} from './observationFunctions'
import {
	bulkDeleteObservation,
	clearObservationIdsForDelete,
	clearStudentStatus,
	setObservationIdsForDelete,
	setObservationIdsForDeleteBulk,
} from './observationSlice'

import { formatDate, getCurACYear, sortEnum } from '../../../utils/utils'
import { observationStyles } from './observationStyles'
import CustomDialog from '../../../components/CustomDialog'
import CustomPagination from '../../../components/CustomPagination'
import { handleDownloadExcel } from './observationThunk'

import {
	initialAccordionStates,
	initialFilterStates,
} from '../../../components/commonComponents/CustomFilter'
import CommonFilterDrawer from '../../../components/commonComponents/CustomFilter'
import EditObservation from './EditObservation'
import AddObservationDialog from './AddObservationDialog'

const Observation = () => {
	const dispatch = useDispatch()
	const tableContainerRef = useRef(null)
	const { appPermissions } = useSelector((store) => store.dashboardSliceSetup)
	const { allObservations, observationIdsForDelete } = useSelector(
		(store) => store.observation,
	)

	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const [columns, setColumns] = useState(observationColumn)
	const [sortKeys, setSortKeys] = useState([{ key: 'doo', value: sortEnum.desc }])

	const [rowDataSelected, setRowDataSelected] = useState({})
	const [hoveredRowIndex, setHoveredRowIndex] = useState(null)
	const [deleteObservationDialog, setDeleteObservationDialog] = useState(false)
	const [isSelectedAllForDelete, setIsSelectedAllForDelete] = useState(false)
	const [deleteBulkDialog, setDeleteBulkDialog] = useState(false)

	const [rowsPerPage, setRowsPerPage] = useState({
		text: '150',
		value: 150,
	})
	const [currentPage, setCurrentPage] = useState(1)

	const [filterData, setFilterData] = useState(initialFilterStates)
	const [searchText, setSearchText] = useState('')
	const [searchInputValue, setSearchInputValue] = useState('')

	const [modal, setModal] = useState({
		upload: false,
		filter: false,
		add: false,
		edit: false,
	})

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

	const handleColor = (status) => {
		if (status === 'Present') return observationStyles.greenSX
		if (status === 'NotPresent') return observationStyles.redSX
		if (status === 'NeedImprovement') return observationStyles.yellowSX
		return {}
	}

	const refreshListAndCloseDialog = (type, filter_data, search_text) => {
		if (type === 'add') handleModal('add', false)
		else if (type === 'edit') handleModal('edit', false)
		else if (type === 'upload') handleModal('upload', false)

		fetchAllObservations(
			dispatch,
			filter_data ?? filterData,
			search_text ?? searchText,
			currentPage,
			rowsPerPage.value,
			sortKeys,
		)
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

	const renderCellContent = (column, row) => {
		const fieldName = column.name

		// Basic fields
		if (fieldName === 'user_id') return row?.user_id || '-'
		if (fieldName === 'academicYear') return row?.academicYear || localizationConstants.notApplicable
		if (fieldName === 'studentName') return row?.studentName || '-'
		if (fieldName === 'doo') return formatDate(row?.doo) || '-'
		if (fieldName === 'createdAt') return formatDate(row?.createdAt) || '-'
		if (fieldName === 'duration') return row?.duration || '-'

		// Status fields with color indicator
		const statusFields = [
			'punctuality',
			'abilityToFollowGuidelines',
			'abilityToFollowInstructions',
			'participation',
			'completionOfTasks',
			'abilityToWorkIndependently',
			'incedentalOrAdditionalNote',
			'appearance',
			'attitude',
			'behaviour',
			'speech',
			'affetcOrMood',
			'thoughtProcessOrForm',
			'additionalCommentOrNote',
		]

		if (statusFields.includes(fieldName)) {
			const fieldData = row?.[fieldName]
			const comments = fieldData?.comments || ''
			const truncatedComments =
				comments.length > 80 ? comments.slice(0, 80) + '...' : comments

			return (
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Divider
						orientation='vertical'
						sx={{
							...handleColor(fieldData?.status),
							height: '24px',
							width: '3px',
							borderRadius: '2px',
						}}
					/>
					<Typography sx={{ fontSize: '12px', color: '#334155' }}>
						{truncatedComments || '-'}
					</Typography>
				</Box>
			)
		}

		return '-'
	}

	useEffect(() => {
		dispatch(getSchoolsList({}))
		dispatch(clearStudentStatus())
	}, [dispatch])

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
			refreshListAndCloseDialog(null, filter_data)
		}
	}, [academicYears, sortKeys, currentPage, rowsPerPage, searchText, dispatch])

	useEffect(() => {
		if (isSelectedAllForDelete) {
			const ids =
				allObservations?.data?.length > 0
					? allObservations?.data?.map((cls) => cls?._id)
					: []
			dispatch(setObservationIdsForDeleteBulk(ids))
		} else {
			dispatch(clearObservationIdsForDelete())
		}
	}, [isSelectedAllForDelete, allObservations, dispatch])

	useEffect(() => {
		if (observationIdsForDelete?.length === 0) {
			setIsSelectedAllForDelete(false)
		}
	}, [observationIdsForDelete])

	useEffect(() => {
		setIsSelectedAllForDelete(false)
	}, [currentPage])

	useEffect(() => {
		if (tableContainerRef.current) {
			tableContainerRef.current.scrollTop = 0
		}
	}, [allObservations?.data])

	const tableMinWidth = useMemo(() => {
		return columns.reduce((sum, col) => sum + (col.width || 0), 0)
	}, [columns])

	return (
		<Box sx={counsellorStyles.pageContainerSx}>
			{/* Toolbar */}
			<Box sx={counsellorStyles.toolbarSx}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<TextField
						placeholder={localizationConstants.observationSearchPlaceholder}
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
					{/* Status Legend */}
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
							<Box
								sx={{
									width: 12,
									height: 12,
									borderRadius: '2px',
									backgroundColor: '#22C55E',
								}}
							/>
							<Typography sx={{ fontSize: '11px', color: '#64748B' }}>
								{localizationConstants.present}
							</Typography>
						</Box>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
							<Box
								sx={{
									width: 12,
									height: 12,
									borderRadius: '2px',
									backgroundColor: '#EAB308',
								}}
							/>
							<Typography sx={{ fontSize: '11px', color: '#64748B' }}>
								{localizationConstants.needs}
							</Typography>
						</Box>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
							<Box
								sx={{
									width: 12,
									height: 12,
									borderRadius: '2px',
									backgroundColor: '#EF4444',
								}}
							/>
							<Typography sx={{ fontSize: '11px', color: '#64748B' }}>
								{localizationConstants.not}
							</Typography>
						</Box>
					</Box>

					<IconButton
						sx={counsellorStyles.filterButtonSx}
						onClick={() => handleModal('filter', true)}
					>
						<FilterListIcon sx={{ fontSize: 18, color: '#64748B' }} />
					</IconButton>

					{appPermissions?.ObservationManagement?.edit && (
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
			{allObservations?.data?.length > 0 ? (
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
								{/* Top Header Row */}
								<TableRow sx={{ height: '36px' }}>
									{topHeader.map((header, idx) => (
										<TableCell
											key={header.id}
											colSpan={header.colSpan}
											sx={{
												...tableStyles.headerCell,
												backgroundColor: '#E2E8F0',
												textAlign: 'center',
												fontWeight: 700,
												fontSize: '10px',
												borderRight:
													idx < topHeader.length - 1
														? '1px solid rgba(0, 0, 0, 0.08)'
														: 'none',
											}}
										>
											{header.label}
										</TableCell>
									))}
								</TableRow>
								{/* Column Headers Row */}
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
								{allObservations?.data?.map((row, index) => (
									<TableRow
										key={row._id || index}
										onMouseEnter={() => setHoveredRowIndex(index)}
										onMouseLeave={() => setHoveredRowIndex(null)}
										onClick={(e) => {
											const isFormControlClick =
												e.target.closest('.MuiFormControlLabel-root') !== null
											if (isFormControlClick) return

											if (isSelectedAllForDelete) {
												dispatch(setObservationIdsForDelete(row?._id))
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
													appPermissions?.ObservationManagement?.edit &&
													hoveredRowIndex === index &&
													!isSelectedAllForDelete ? (
														<IconButton
															size='small'
															onClick={(e) => {
																e.stopPropagation()
																setRowDataSelected(row)
																setDeleteObservationDialog(true)
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
																checked={observationIdsForDelete?.includes(
																	row?._id,
																)}
																onChange={(e) => {
																	e.stopPropagation()
																	dispatch(setObservationIdsForDelete(row?._id))
																}}
																control={
																	<Checkbox
																		size='small'
																		sx={{ p: 0, mr: 1 }}
																	/>
																}
																label=''
																sx={{ m: 0 }}
															/>
														)}
														<Box
															sx={{
																fontSize: '13px',
																color: '#334155',
																overflow: 'hidden',
																textOverflow: 'ellipsis',
																whiteSpace: 'nowrap',
															}}
														>
															{renderCellContent(column, row)}
														</Box>
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
							{!isSelectedAllForDelete ? (
								<Box
									sx={tableStyles.downloadLink}
									onClick={() => {
										const body = fetchAllObservations(
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
							totalCount={allObservations?.totalCount}
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
						{localizationConstants.noObservationsAdded}
					</Typography>
					<Typography sx={tableStyles.emptyStateSubtitle}>
						{localizationConstants.addObservation}
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
					fetchAllObservations(
						dispatch,
						newFilterData,
						searchText,
						currentPage,
						rowsPerPage.value,
						sortKeys,
					)

					handleModal('filter', false)
				}}
				defaultAccordions={['studentStatus', 'AYs']}
			/>

			{/* Delete Single Dialog */}
			<CustomDialog
				isOpen={deleteObservationDialog}
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
				onLeftButtonClick={() => setDeleteObservationDialog(false)}
				onRightButtonClick={() =>
					handleDeleteObservation(
						rowDataSelected?._id,
						dispatch,
						setDeleteObservationDialog,
						refreshListAndCloseDialog,
					)
				}
			/>

			{/* Delete Bulk Dialog */}
			<CustomDialog
				isOpen={deleteBulkDialog}
				onClose={() => setDeleteBulkDialog(false)}
				title={localizationConstants?.deleteMultipleObservation}
				iconName={iconConstants.academicRed}
				titleSx={{
					color: 'textColors.red',
					fontWeight: 500,
					pb: '20px',
				}}
				message={localizationConstants.deleteBulkInObservationMsg}
				leftButtonText={localizationConstants.cancel}
				rightButtonText={localizationConstants.yesDelete}
				onLeftButtonClick={() => setDeleteBulkDialog(false)}
				onRightButtonClick={async () => {
					const body = {
						recordIds: observationIdsForDelete,
					}
					const res = await dispatch(bulkDeleteObservation({ body }))
					if (!res?.error) {
						setIsSelectedAllForDelete(false)
						setDeleteBulkDialog(false)
						refreshListAndCloseDialog()
					}
				}}
			/>

			{/* Add Dialog */}
			{modal.add && (
				<AddObservationDialog
					open={modal.add}
					onClose={() => handleModal('add', false)}
					onAddObservation={() => refreshListAndCloseDialog('add')}
				/>
			)}

			{/* Edit Dialog */}
			{modal.edit && (
				<EditObservation
					open={modal.edit}
					onClose={() => handleModal('edit', false)}
					onEditObservation={() => refreshListAndCloseDialog('edit')}
					rowDataSelected={rowDataSelected}
				/>
			)}
		</Box>
	)
}

export default Observation
