import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useDispatch } from 'react-redux'
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
import CustomIcon from '../../../components/CustomIcon'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { sortEnum, formatDate } from '../../../utils/utils'
import CustomPagination from '../../../components/CustomPagination'
import { studentCOPEStudentsListColumns } from './StudentCopeConstants'
import { handleDownloadExcelForStudentCope } from './StudentCopeAssessmentThunk'
import { fetchStudentCopeAssessment } from './StudentCopeFunction'
import EditStudentCopedialog from './EditStudentCopedialog'
import { tableStyles } from '../../../components/styles/tableStyles'

const StudentCOPEStudentsList = ({
	allStudentsForspecificSchool,
	sortKeys,
	setSortKeys,
	currentPage,
	setCurrentPage,
	rowsPerPage,
	setRowsPerPage,
	searchText,
	filterData,
	modal,
	handleModal,
	refreshList,
}) => {
	const dispatch = useDispatch()
	const tableContainerRef = useRef(null)
	const [columns, setColumns] = useState(studentCOPEStudentsListColumns)
	const [row, setRow] = useState({})

	const handleSort = (columnName) => {
		const sortKeyIndex = sortKeys.findIndex((sk) => sk.key === columnName)
		if (sortKeyIndex === -1) return

		const newSortKeys = [...sortKeys]
		const currentValue = newSortKeys[sortKeyIndex].value
		newSortKeys[sortKeyIndex] = {
			...newSortKeys[sortKeyIndex],
			value: currentValue === sortEnum.asc ? sortEnum.desc : sortEnum.asc,
		}
		setSortKeys(newSortKeys)

		const newColumns = columns.map((col) => {
			if (col.name === columnName) {
				return {
					...col,
					sort: currentValue === sortEnum.asc ? sortEnum.desc : sortEnum.asc,
				}
			}
			return col
		})
		setColumns(newColumns)
	}

	const getSortIcon = (column) => {
		if (!column.sort) return null
		const sortKey = sortKeys.find((sk) => sk.key === column.name)
		if (!sortKey) return <UnfoldMoreIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
		if (sortKey.value === sortEnum.asc) {
			return <KeyboardArrowUpIcon sx={{ fontSize: 14, color: '#3B82F6' }} />
		}
		if (sortKey.value === sortEnum.desc) {
			return <KeyboardArrowDownIcon sx={{ fontSize: 14, color: '#3B82F6' }} />
		}
		return <UnfoldMoreIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
	}

	const renderCellContent = (column, row) => {
		const fieldName = column.name

		if (fieldName === 'user_id') return row?.user_id || '-'
		if (fieldName === 'academicYear') return row?.academicYear || localizationConstants.notApplicable
		if (fieldName === 'studentName') return row?.studentName || '-'
		if (fieldName === 'schoolName') return row?.schoolName || '-'
		if (fieldName === 'className') return row?.className || '-'
		if (fieldName === 'section') return row?.section || '-'
		if (fieldName === 'COPEReportSubmissionDate') {
			return row?.COPEReportSubmissionDate
				? formatDate(row?.COPEReportSubmissionDate)
				: row?.createdAt
					? formatDate(row?.createdAt)
					: localizationConstants?.noDateAvailable
		}

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
		<Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
			{allStudentsForspecificSchool?.data?.length > 0 ? (
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
								{allStudentsForspecificSchool?.data?.map((rowData, index) => (
									<TableRow
										key={rowData._id || index}
										onClick={() => {
											setRow(rowData)
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
												<Typography
													sx={{
														fontSize: '13px',
														color: '#334155',
														overflow: 'hidden',
														textOverflow: 'ellipsis',
														whiteSpace: 'nowrap',
													}}
												>
													{renderCellContent(column, rowData)}
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
								const body = fetchStudentCopeAssessment(
									dispatch,
									filterData,
									searchText,
									currentPage,
									rowsPerPage.value,
									sortKeys,
									true,
								)
								handleDownloadExcelForStudentCope(body, true)
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
				<Box sx={{ ...tableStyles.emptyState, flex: 1 }}>
					<CustomIcon
						name={iconConstants.noSchoolsBlack}
						style={{ width: '80px', height: '80px', opacity: 0.4 }}
						svgStyle={'width: 80px; height: 80px'}
					/>
					<Typography sx={tableStyles.emptyStateTitle}>
						{localizationConstants.noStudentCopeMsg}
					</Typography>
				</Box>
			)}

			{modal.edit && (
				<EditStudentCopedialog
					open={modal.edit}
					onClose={() => handleModal('edit', false)}
					rowDataSelected={row}
					refreshList={refreshList}
				/>
			)}
		</Box>
	)
}

export default StudentCOPEStudentsList
