import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { sortEnum, formatDate } from '../../../utils/utils'
import CustomPagination from '../../../components/CustomPagination'
import { StudentIEPColumns } from './iEPConstants'
import CustomDialog from '../../../components/CustomDialog'
import { fetchAllStudentIEP, handleIepRecordDeletion } from './iEPFunctions'
import { handleDownloadExcelForStudentIEP } from './iEPThunk'
import EditIEPDialog from './EditIEPDialog'
import { tableStyles } from '../../../components/styles/tableStyles'

const IEPTableList = ({
	allStudentsForspecificSchool,
	sortKeys,
	setSortKeys,
	currentPage,
	setCurrentPage,
	rowsPerPage,
	setRowsPerPage,
	searchText,
	filterData,
	refreshListAndCloseDialog,
	modal,
	handleModal,
}) => {
	const dispatch = useDispatch()
	const tableContainerRef = useRef(null)
	const [hoveredRowIndex, setHoveredRowIndex] = useState(null)
	const [rowDataSelected, setRowDataSelected] = useState({})
	const { appPermissions } = useSelector((store) => store.dashboardSliceSetup)
	const [deleteDialog, setDeleteDialog] = useState(false)
	const [columns, setColumns] = useState(StudentIEPColumns)

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

		if (fieldName === 'user_id') return row?.user_id || '-'
		if (fieldName === 'academicYear') return row?.academicYear || localizationConstants.notApplicable
		if (fieldName === 'studentName') return row?.studentName || '-'
		if (fieldName === 'createdAt') return formatDate(row?.createdAt) || '-'
		if (fieldName === 'ShortTermGoal') return row?.ShortTermGoal || '-'
		if (fieldName === 'LongTermGoal') return row?.LongTermGoal || '-'
		if (fieldName === 'Evolution') return row?.Evolution || '-'
		if (fieldName === 'AccommodationFromBoard') return row?.AccommodationFromBoard || '-'
		if (fieldName === 'AccommodationInternal') return row?.AccommodationInternal || '-'
		if (fieldName === 'transitionPlanning') return row?.transitionPlanning || '-'
		if (fieldName === 'IndividualSession') return row?.IndividualSession || '-'
		if (fieldName === 'GroupSession') return row?.GroupSession || '-'

		return '-'
	}

	useEffect(() => {
		if (tableContainerRef.current) {
			tableContainerRef.current.scrollTop = 0
		}
	}, [allStudentsForspecificSchool?.data])

	const tableMinWidth = useMemo(() => {
		return columns.reduce((sum, col) => sum + (col.width || 0), 0)
	}, [columns])

	return (
		<Box sx={{ flex: 1, minWidth: 0, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
			{allStudentsForspecificSchool?.data?.length > 0 ? (
				<Box sx={{ ...tableStyles.container, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
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
								{allStudentsForspecificSchool?.data?.map((row, index) => (
									<TableRow
										key={row._id || index}
										onMouseEnter={() => setHoveredRowIndex(index)}
										onMouseLeave={() => setHoveredRowIndex(null)}
										onClick={() => {
											setRowDataSelected(row)
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
													appPermissions?.['student-IEP']?.edit &&
													hoveredRowIndex === index ? (
														<IconButton
															size='small'
															onClick={(e) => {
																e.stopPropagation()
																setRowDataSelected(row)
																setDeleteDialog(true)
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
								const body = fetchAllStudentIEP(
									dispatch,
									filterData,
									searchText,
									currentPage,
									rowsPerPage.value,
									sortKeys,
									true,
								)
								handleDownloadExcelForStudentIEP(body)()
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
							totalCount={allStudentsForspecificSchool?.totalCount}
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
						{localizationConstants.noStudentIEPMsg}
					</Typography>
					<Typography sx={tableStyles.emptyStateSubtitle}>
						{localizationConstants.add}
					</Typography>
				</Box>
			)}

			<CustomDialog
				isOpen={deleteDialog}
				title={localizationConstants.deleteStudentsIepRecords}
				iconName={iconConstants.academicRed}
				message={localizationConstants.deleteStudentIEPMsg}
				titleSx={{
					color: 'textColors.red',
					fontWeight: 500,
					pb: '20px',
				}}
				leftButtonText={localizationConstants.cancel}
				rightButtonText={localizationConstants.yesDelete}
				onLeftButtonClick={() => setDeleteDialog(false)}
				onRightButtonClick={() => {
					handleIepRecordDeletion(
						rowDataSelected._id,
						dispatch,
						setDeleteDialog,
						refreshListAndCloseDialog,
					)
				}}
			/>

			{modal.edit && (
				<EditIEPDialog
					open={modal.edit}
					onClose={() => handleModal('edit', false)}
					refreshListAndCloseDialog={refreshListAndCloseDialog}
					rowDataSelected={rowDataSelected}
				/>
			)}
		</Box>
	)
}

export default IEPTableList
