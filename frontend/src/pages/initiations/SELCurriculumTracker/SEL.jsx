import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
	Box,
	IconButton,
	Table,
	TableBody,
	TableCell,
	TableRow,
	TableHead,
	TableContainer,
	Typography,
	Button,
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import AddIcon from '@mui/icons-material/Add'
import DownloadIcon from '@mui/icons-material/Download'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import VisibilityIcon from '@mui/icons-material/Visibility'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { getCurACYear, getUserFromLocalStorage, sortEnum, formatDate } from '../../../utils/utils'
import CustomPagination from '../../../components/CustomPagination'
import { selColumn } from './SELConstants'
import { counsellorStyles } from '../../counsellors/counsellorsStyles'
import { tableStyles } from '../../../components/styles/tableStyles'
import { clearSELTrackerListFilter } from './SELSlice'
import { handleDeleteSelTracker, fetchAllSELTrackerList } from './SELFunctions'
import { setSelectedRowDataEdit } from '../individualCase/individualCaseSlice'
import CustomDialog from '../../../components/CustomDialog'
import { handleDownloadExcel } from './SELThunk'
import CommonFilterDrawer, {
	initialAccordionStates,
	initialFilterStates,
} from '../../../components/commonComponents/CustomFilter'
import SELPdfViewDialog from './SELPdfViewDialog'
import AddSELComponent from './AddSELComponent'
import EditSELComponent from './EditSELComponent'

const SEL = () => {
	const dispatch = useDispatch()
	const tableContainerRef = useRef(null)
	const { appPermissions } = useSelector((store) => store.dashboardSliceSetup)
	const { allSELTrackerList } = useSelector((store) => store.selTrackerList)
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const user = getUserFromLocalStorage()

	const [columns, setColumns] = useState(selColumn)
	const [rowDataSelected, setRowDataSelected] = useState({})
	const [rowsPerPage, setRowsPerPage] = useState({
		text: '150',
		value: 150,
	})
	const [currentPage, setCurrentPage] = useState(1)
	const [hoveredRowIndex, setHoveredRowIndex] = useState(null)
	const [openPdfViewDialog, setOpenPdfViewDialog] = useState(false)
	const [sortKeys, setSortKeys] = useState([{ key: 'interactionDate', value: sortEnum.desc }])
	const [deleteSelTrackerDialog, setDeleteSelTrackerDialog] = useState(false)
	const [filterData, setFilterData] = useState(initialFilterStates)
	const [modal, setModal] = useState({
		upload: false,
		filter: false,
		add: false,
		edit: false,
		delete: false,
	})

	const handleModal = useCallback((name, value) => {
		const obj = {}
		obj[name] = value
		setModal((state) => ({ ...state, ...obj }))
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

	const truncateText = (text, maxLength = 80) => {
		if (!text) return '-'
		return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
	}

	const renderCellContent = (column, row) => {
		const fieldName = column.name

		if (fieldName === 'className') return `${row?.className || ''}-${row?.section || ''}`
		if (fieldName === 'academicYear') return row?.academicYear || localizationConstants.notApplicable
		if (fieldName === 'coreCompetency') return row?.coreCompetency || '-'
		if (fieldName === 'topic') return truncateText(row?.topic, 60)
		if (fieldName === 'interactionDate') return formatDate(row?.interactionDate) || '-'
		if (fieldName === 'createdAt') return formatDate(row?.createdAt) || '-'
		if (fieldName === 'commentsOrObservations') return truncateText(row?.commentsOrObservations)
		if (fieldName === 'activity') return truncateText(row?.activity)
		if (fieldName === 'taskAssignedOrReflection') return truncateText(row?.taskAssignedOrReflection)
		if (fieldName === 'interventionForEducators') return truncateText(row?.interventionForEducators)
		if (fieldName === 'outcome') return row?.outcome || '-'
		if (fieldName === 'followUpActivity') return truncateText(row?.followUpActivity)

		return '-'
	}

	const refreshListAndCloseDialog = (type) => {
		if (type === 'add') handleModal('add', false)
		else if (type === 'edit') handleModal('edit', false)
		else if (type === 'upload') handleModal('upload', false)

		fetchAllSELTrackerList(
			dispatch,
			filterData,
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

			fetchAllSELTrackerList(
				dispatch,
				filter_data,
				currentPage,
				rowsPerPage.value,
				sortKeys,
			)
		}
	}, [academicYears, sortKeys, currentPage, rowsPerPage, dispatch])

	useEffect(() => {
		dispatch(clearSELTrackerListFilter())
	}, [dispatch])

	useEffect(() => {
		if (tableContainerRef.current) {
			tableContainerRef.current.scrollTop = 0
		}
	}, [allSELTrackerList?.data])

	const tableMinWidth = useMemo(() => {
		return columns.reduce((sum, col) => sum + (col.width || 0), 0)
	}, [columns])

	return (
		<Box sx={counsellorStyles.pageContainerSx}>
			{/* Toolbar */}
			<Box sx={counsellorStyles.toolbarSx}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }} />

				<Box sx={counsellorStyles.actionButtonsSx}>
					<Button
						variant='outlined'
						startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
						sx={{
							...counsellorStyles.addButtonSx,
							borderColor: 'primary.main',
							color: 'primary.main',
							backgroundColor: 'transparent',
						}}
						onClick={() => setOpenPdfViewDialog(true)}
					>
						{localizationConstants.viewSel}
					</Button>

					<IconButton
						sx={counsellorStyles.filterButtonSx}
						onClick={() => handleModal('filter', true)}
					>
						<FilterListIcon sx={{ fontSize: 18, color: '#64748B' }} />
					</IconButton>

					{appPermissions?.SELCurriculumTrackerManagement?.edit && (
						<Button
							variant='contained'
							startIcon={<AddIcon sx={{ fontSize: 16 }} />}
							sx={counsellorStyles.addButtonSx}
							onClick={() => handleModal('add', true)}
						>
							{localizationConstants.addSelTracker}
						</Button>
					)}
				</Box>
			</Box>

			{/* Table */}
			{allSELTrackerList?.data?.length > 0 ? (
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
								{allSELTrackerList?.data?.map((row, index) => (
									<TableRow
										key={row._id || index}
										onMouseEnter={() => setHoveredRowIndex(index)}
										onMouseLeave={() => setHoveredRowIndex(null)}
										onClick={() => {
											setRowDataSelected(row)
											dispatch(setSelectedRowDataEdit(row))
											handleModal('edit', true)
										}}
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
												{column.id === localizationConstants.showCategoryActions ? (
													appPermissions?.SELCurriculumTrackerManagement?.edit &&
													hoveredRowIndex === index ? (
														<IconButton
															size='small'
															onClick={(e) => {
																e.stopPropagation()
																setRowDataSelected(row)
																setDeleteSelTrackerDialog(true)
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
						<Box
							sx={tableStyles.downloadLink}
							onClick={() => {
								const body = fetchAllSELTrackerList(
									dispatch,
									filterData,
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
							totalCount={allSELTrackerList?.totalCount}
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
						{localizationConstants.noSelTrackerAdded}
					</Typography>
					<Typography sx={tableStyles.emptyStateSubtitle}>
						{localizationConstants.addSelTracker}
					</Typography>
				</Box>
			)}

			{/* Add Dialog */}
			{modal.add && (
				<AddSELComponent
					open={modal.add}
					onClose={() => handleModal('add', false)}
					onAddSEL={() => refreshListAndCloseDialog('add')}
				/>
			)}

			{/* Edit Dialog */}
			{modal.edit && (
				<EditSELComponent
					open={modal.edit}
					onClose={() => handleModal('edit', false)}
					onEditSEL={() => refreshListAndCloseDialog('edit')}
					rowData={rowDataSelected}
				/>
			)}

			{/* Delete Dialog */}
			<CustomDialog
				isOpen={deleteSelTrackerDialog}
				title={localizationConstants.deleteSEL}
				iconName={iconConstants.academicRed}
				message={localizationConstants.deleteSELMsg}
				titleSx={{
					color: 'textColors.red',
					fontWeight: 500,
					pb: '20px',
				}}
				leftButtonText={localizationConstants.cancel}
				rightButtonText={localizationConstants.yesDelete}
				onLeftButtonClick={() => setDeleteSelTrackerDialog(false)}
				onRightButtonClick={() =>
					handleDeleteSelTracker(
						rowDataSelected?._id,
						dispatch,
						setDeleteSelTrackerDialog,
						refreshListAndCloseDialog,
					)
				}
			/>

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
					fetchAllSELTrackerList(
						dispatch,
						newFilterData,
						currentPage,
						rowsPerPage.value,
						sortKeys,
					)
					handleModal('filter', false)
				}}
				defaultAccordions={['AYs']}
			/>

			{/* PDF View Dialog */}
			{openPdfViewDialog && (
				<SELPdfViewDialog
					pdfUrl={user?.profile?.cbseCircularPdfAddress}
					open={openPdfViewDialog}
					onClose={() => setOpenPdfViewDialog(false)}
				/>
			)}
		</Box>
	)
}

export default SEL
