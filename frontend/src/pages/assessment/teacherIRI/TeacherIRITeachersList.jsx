import React, { useCallback, useEffect, useState, useMemo } from 'react'
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
	TextField,
	InputAdornment,
	Button,
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import FilterListIcon from '@mui/icons-material/FilterList'
import SearchIcon from '@mui/icons-material/Search'
import UploadIcon from '@mui/icons-material/Upload'
import AssessmentIcon from '@mui/icons-material/Assessment'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import debounce from 'lodash.debounce'
import CustomIcon from '../../../components/CustomIcon'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { sortEnum, formatDate, getCurrentAcademicYearId } from '../../../utils/utils'
import CustomPagination from '../../../components/CustomPagination'
import { teacherIRITeachersListColumns } from './teacherIRIConstants'
import { counsellorStyles } from '../../counsellors/counsellorsStyles'
import { tableStyles } from '../../../components/styles/tableStyles'
import { handleDownloadExcelForTeacher } from './teachersIRIThunk'
import CommonFilterDrawer, {
	defaultAccordionTitle,
	initialAccordionStates,
	initialFilterStates,
} from '../../../components/commonComponents/CustomFilter'
import { fetchAllIRIForTeacherRecords } from './teacherFunctions'
import BulkUploadTeacherIRI from './BulkUploadTeacherIRI'
import TeacherIRIAssessmentDialog from './TeacherIRIAssessmentdialog'
import SpecificSchoolIRIDetailsDialog from './SpecificSchoolIRIDetailsDialog'
import { clearAllTeachersForspecificSchool } from '../TeacherProfiling/teacherProfilingSlice'

const TeacherIRITeachersList = ({
	initialRowData,
	handleBackToSchoolList,
	refreshSchoolList,
}) => {
	const dispatch = useDispatch()
	const SchoolRow = initialRowData
	const { appPermissions, academicYears } = useSelector(
		(store) => store.dashboardSliceSetup,
	)
	const [currentPage, setCurrentPage] = useState(1)
	const [columns, setColumns] = useState(teacherIRITeachersListColumns)
	const [sortKeys, setSortKeys] = useState([{ key: 'submissionDate', value: sortEnum.desc }])
	const [rowsPerPage, setRowsPerPage] = useState({
		text: '150',
		value: 150,
	})

	const { allTeachersForspecificSchool } = useSelector(
		(store) => store.teacherIRI,
	)
	const [filterData, setFilterData] = useState(initialFilterStates)
	const [searchText, setSearchText] = useState('')
	const [searchInputValue, setSearchInputValue] = useState('')
	const [selectedTeacherRowData, setSelectedTeacherRowData] = useState(null)
	const [isCurAcademicYear, setIsCurAcademicYear] = useState(false)
	const [modals, setModals] = useState({
		filter: false,
		upload: false,
		viewSchoolReport: false,
		teacherAssessment: false,
	})

	const handleModals = useCallback((name, value) => {
		setModals((state) => ({ ...state, [name]: value }))
	}, [])

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

		if (fieldName === 'teacher_id') return row?.teacher_id || '-'
		if (fieldName === 'teacherName') return row?.teacherName || '-'
		if (fieldName === 'gender') return row?.gender || '-'
		if (fieldName === 'submissionDate') {
			return row?.formStatus === 'Pending'
				? 'NA'
				: row?.submissionDate
					? formatDate(row?.submissionDate)
					: '-'
		}
		if (fieldName === 'formStatus') return row?.formStatus || '-'

		return '-'
	}

	const refreshList = (search_text) => {
		fetchAllIRIForTeacherRecords(
			dispatch,
			filterData,
			search_text ?? searchText,
			currentPage,
			rowsPerPage.value,
			sortKeys,
			SchoolRow?._id,
		)
	}

	useEffect(() => {
		refreshList()
	}, [sortKeys, currentPage, rowsPerPage, searchText, dispatch])

	useEffect(() => {
		const currentAyId = getCurrentAcademicYearId(academicYears)
		if (String(SchoolRow?.academicYearId) === String(currentAyId)) {
			setIsCurAcademicYear(true)
		} else {
			setIsCurAcademicYear(false)
		}
	}, [SchoolRow, academicYears])

	const tableMinWidth = useMemo(() => {
		return columns.reduce((sum, col) => sum + (col.width || 0), 0)
	}, [columns])

	return (
		<Box sx={counsellorStyles.pageContainerSx}>
			{/* Header with Back Button and School Info */}
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					mb: 2,
					pb: 2,
					borderBottom: '1px solid #E2E8F0',
				}}
			>
				<Button
					variant='text'
					startIcon={<KeyboardBackspaceIcon />}
					onClick={() => {
						handleBackToSchoolList()
						dispatch(clearAllTeachersForspecificSchool())
						refreshList()
					}}
					sx={{
						textTransform: 'none',
						color: '#3B82F6',
						fontWeight: 500,
						fontSize: '14px',
					}}
				>
					{SchoolRow?.schoolName}
				</Button>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
					<Typography sx={{ fontSize: '13px', color: '#64748B' }}>
						<span style={{ fontWeight: 600 }}>
							{localizationConstants.academicYear}:
						</span>{' '}
						<span style={{ fontWeight: 500, color: '#334155' }}>
							{SchoolRow?.academicYear}
						</span>
					</Typography>
					<Typography sx={{ fontSize: '13px', color: '#64748B' }}>
						<span style={{ fontWeight: 600 }}>
							{localizationConstants.startDate}:
						</span>{' '}
						<span style={{ fontWeight: 500, color: '#334155' }}>
							{formatDate(SchoolRow?.startDate)}
						</span>
					</Typography>
					<Typography sx={{ fontSize: '13px', color: '#64748B' }}>
						<span style={{ fontWeight: 600 }}>
							{localizationConstants.endDate}:
						</span>{' '}
						<span style={{ fontWeight: 500, color: '#334155' }}>
							{formatDate(SchoolRow?.endDate)}
						</span>
					</Typography>
				</Box>
			</Box>

			{/* Toolbar */}
			<Box sx={counsellorStyles.toolbarSx}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<TextField
						placeholder={localizationConstants.searchMsgTeachers}
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
						startIcon={<AssessmentIcon sx={{ fontSize: 16 }} />}
						sx={{
							textTransform: 'none',
							color: '#3B82F6',
							fontWeight: 500,
							fontSize: '13px',
						}}
						onClick={() => handleModals('viewSchoolReport', true)}
					>
						{localizationConstants.viewSchoolReport}
					</Button>

					<IconButton
						sx={counsellorStyles.filterButtonSx}
						onClick={() => handleModals('filter', true)}
					>
						<FilterListIcon sx={{ fontSize: 18, color: '#64748B' }} />
					</IconButton>

					{appPermissions?.TeacherIRI?.edit && (
						<Button
							variant='contained'
							startIcon={<UploadIcon sx={{ fontSize: 16 }} />}
							sx={counsellorStyles.addButtonSx}
							onClick={() => handleModals('upload', true)}
							disabled={
								!isCurAcademicYear ||
								SchoolRow?.IRIStatus === 'In-Active'
							}
						>
							{localizationConstants.bulkUpload}
						</Button>
					)}
				</Box>
			</Box>

			{/* Table Content */}
			{allTeachersForspecificSchool?.data?.length > 0 ? (
				<Box sx={{ ...tableStyles.container, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
					<TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto', ...tableStyles.scrollWrapper }}>
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
								{allTeachersForspecificSchool?.data?.map((rowData, index) => (
									<TableRow
										key={rowData._id || index}
										onClick={() => {
											setSelectedTeacherRowData(rowData)
											handleModals('teacherAssessment', true)
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
								const body = fetchAllIRIForTeacherRecords(
									dispatch,
									filterData,
									searchText,
									currentPage,
									rowsPerPage.value,
									sortKeys,
									SchoolRow._id,
									true,
								)
								handleDownloadExcelForTeacher(body, true)()
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
							totalCount={allTeachersForspecificSchool?.totalCount}
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
						{localizationConstants.NoIRIDataScheduled}
					</Typography>
				</Box>
			)}

			{modals.teacherAssessment && (
				<TeacherIRIAssessmentDialog
					open={modals.teacherAssessment}
					onClose={() => handleModals('teacherAssessment', false)}
					selectedTeacherRowData={selectedTeacherRowData}
					SchoolRow={SchoolRow}
					refreshTeacherList={refreshList}
					refreshSchoolList={refreshSchoolList}
				/>
			)}

			{modals.viewSchoolReport && (
				<SpecificSchoolIRIDetailsDialog
					open={modals.viewSchoolReport}
					onClose={() => handleModals('viewSchoolReport', false)}
					school={SchoolRow}
				/>
			)}

			<BulkUploadTeacherIRI
				modal={modals}
				handleModal={handleModals}
				SchoolRowData={SchoolRow}
				refreshList={refreshList}
			/>

			<CommonFilterDrawer
				onOpen={modals.filter}
				handleModal={handleModals}
				filterOptions={{
					...initialAccordionStates,
					gender: true,
					teacherStatus: true,
					byDate: true,
				}}
				filterData={filterData}
				setFilterData={setFilterData}
				onApply={() => {
					refreshList()
					handleModals('filter', false)
				}}
				defaultAccordions={['gender', 'teacherStatus', 'byDate']}
				accordionTitleOptions={{
					...defaultAccordionTitle,
					byDate: localizationConstants.submissionDate,
				}}
			/>
		</Box>
	)
}

export default TeacherIRITeachersList
