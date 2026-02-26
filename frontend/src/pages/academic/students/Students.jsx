import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
	Box,
	Checkbox,
	FormControlLabel,
	Table,
	TableBody,
	TableCell,
	TableRow,
	TableHead,
	TableContainer,
	Typography,
	TextField,
	InputAdornment,
	IconButton,
	Button,
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import UploadIcon from '@mui/icons-material/Upload'
import SearchIcon from '@mui/icons-material/Search'
import DownloadIcon from '@mui/icons-material/Download'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { useDispatch, useSelector } from 'react-redux'
import {
	bulkDeleteStudent,
	clearStudentIdsForDelete,
	setStudentIdsForDelete,
	setStudentIdsForDeleteBulk,
} from './studentsSlice'
import { counsellorStyles } from '../../counsellors/counsellorsStyles'
import { tableStyles } from '../../../components/styles/tableStyles'
import debounce from 'lodash.debounce'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import {
	ErrorMsgDownload,
	fetchAllStudents,
	getDate,
} from './studentsFunctions'
import {
	getSchoolsList,
	getSchoolsListForValidation,
} from '../../../redux/commonSlice'
import EditStudentDrawer from './EditStudentDrawer'
import UploadStudent from './UploadStudent'
import CustomPagination from '../../../components/CustomPagination'
import { handleDownloadExcel } from './studentsThunk'
import { sortkeys, studentsColumn } from './studentsConstants'
import CustomDialog from '../../../components/CustomDialog'
import CommonFilterDrawer, {
	initialAccordionStates,
	initialFilterStates,
} from '../../../components/commonComponents/CustomFilter'
import { getCurACYear, sortEnum } from '../../../utils/utils'

const Students = () => {
	const tableContainerRef = useRef(null)
	const { appPermissions } = useSelector(
		(store) => store.dashboardSliceSetup,
	)
	const { allStudents, studentIdsForDelete } = useSelector(
		(store) => store.students,
	)
	const { schoolsListForValidation } = useSelector(
		(store) => store.commonData,
	)
	const [rowsPerPage, setRowsPerPage] = useState({
		text: '150',
		value: 150,
	})
	const [currentPage, setCurrentPage] = useState(1)
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)

	const dispatch = useDispatch()
	const [studentRowData, setStudentRowData] = useState(null)
	const [editStudentDrawer, setEditStudentDrawer] = useState(false)
	const [modal, setModal] = useState({ upload: false, filter: false })
	const [columns, setColumns] = useState(studentsColumn)
	const [sortKeys, setSortKeys] = useState([...sortkeys])
	const [isSelectedAllForDelete, setIsSelectedAllForDelete] = useState(false)
	const [deleteBulkDialog, setDeleteBulkDialog] = useState(false)
	const [uploadErrorsDialog, setUploadErrorsDialog] = useState(false)
	const [response, setResponse] = useState('')
	const [filterData, setFilterData] = useState(initialFilterStates)
	const [searchText, setSearchText] = useState('')
	const [localSearchText, setLocalSearchText] = useState('')

	const handleModal = useCallback((name, value) => {
		const obj = {}
		obj[name] = value
		setModal((state) => ({ ...state, ...obj }))
	}, [])

	const debouncedSearch = useCallback(
		debounce((value) => {
			if (value.length >= 3 || value.length === 0) {
				setSearchText(value)
				setCurrentPage(1)
			}
		}, 400),
		[],
	)

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

		fetchAllStudents(
			dispatch,
			newFilterData,
			search_text ?? searchText,
			currentPage,
			rowsPerPage.value,
			sortKeys,
		)
	}

	const getStatusStyle = (status) => {
		switch (status) {
			case 'Active':
				return tableStyles.statusActive
			case 'Graduated':
				return { backgroundColor: '#E0E7FF', color: '#3730A3' }
			case 'Exited':
				return tableStyles.statusInactive
			default:
				return tableStyles.statusPending
		}
	}

	const rowCells = (column, row) => {
		switch (column.id) {
			case localizationConstants.id:
				return (
					<Typography sx={tableStyles.cellTextMuted}>
						{row?.user_id}
					</Typography>
				)
			case localizationConstants.studentsName:
				return (
					<Typography sx={tableStyles.cellTextPrimary}>
						{row?.studentName}
					</Typography>
				)
			case localizationConstants.schoolName:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{row?.school?.school}
					</Typography>
				)
			case localizationConstants.academicYear:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{row?.academicYear}
					</Typography>
				)
			case localizationConstants.status:
				return (
					<Box
						component='span'
						sx={{
							...tableStyles.statusBadge,
							...getStatusStyle(row?.status),
						}}
					>
						{row?.status}
					</Box>
				)
			case localizationConstants.className:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{row?.className}
					</Typography>
				)
			case localizationConstants.section:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{row?.section}
					</Typography>
				)
			case localizationConstants.registrationNumber:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{row?.regNo}
					</Typography>
				)
			case localizationConstants.mobileNum:
				return (
					<Typography sx={tableStyles.cellTextMuted}>
						{row?.phone}
					</Typography>
				)
			case localizationConstants.nationality:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{row?.nationality}
					</Typography>
				)
			case localizationConstants.registrationDate:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{getDate(row?.regDate)}
					</Typography>
				)
			case localizationConstants.gender:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{row?.gender}
					</Typography>
				)
			case localizationConstants.dob:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{getDate(row?.dob)}
					</Typography>
				)
			case localizationConstants.bloodGroup:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{row?.bloodGrp}
					</Typography>
				)
			case localizationConstants.fathersName:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{row?.fatherName}
					</Typography>
				)
			case localizationConstants.mothersName:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{row?.motherName}
					</Typography>
				)
			default:
				return null
		}
	}

	useEffect(() => {
		if (isSelectedAllForDelete) {
			const ids =
				allStudents?.data?.length > 0
					? allStudents?.data?.map((cls) => cls?._id)
					: []
			dispatch(setStudentIdsForDeleteBulk(ids))
		} else {
			dispatch(clearStudentIdsForDelete())
		}
	}, [isSelectedAllForDelete, allStudents])

	useEffect(() => {
		if (studentIdsForDelete?.length === 0) {
			setIsSelectedAllForDelete(false)
		}
	}, [studentIdsForDelete])

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
	}, [allStudents?.data])

	useEffect(() => {
		if (academicYears.length > 0) {
			const body = {
				filter: { academicYear: academicYears.map((acys) => acys._id) },
			}
			dispatch(getSchoolsList({ body }))
			dispatch(getSchoolsListForValidation({ body }))
		}
	}, [academicYears])

	const getSortIcon = (column) => {
		const sortKey = sortKeys.find((sk) => sk.key === column.name)
		if (!sortKey || sortKey.value === sortEnum.asc) {
			return <UnfoldMoreIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
		}
		return sortKey.value === sortEnum.desc ? (
			<KeyboardArrowDownIcon sx={{ fontSize: 14, color: '#3B82F6' }} />
		) : (
			<KeyboardArrowUpIcon sx={{ fontSize: 14, color: '#3B82F6' }} />
		)
	}

	const handleSort = (column) => {
		if (!column.sort) return
		const newSortKeys = sortKeys.map((sk) => {
			if (sk.key === column.name) {
				return {
					...sk,
					value: sk.value === sortEnum.asc ? sortEnum.desc : sortEnum.asc,
				}
			}
			return sk
		})
		setSortKeys(newSortKeys)
	}

	return (
		<Box sx={counsellorStyles.pageContainerSx}>
			{/* Toolbar */}
			<Box sx={counsellorStyles.toolbarSx}>
				{/* Search Field */}
				<TextField
					size='small'
					placeholder={localizationConstants.studentSearchPlaceholder}
					value={localSearchText}
					onChange={(e) => {
						setLocalSearchText(e.target.value)
						debouncedSearch(e.target.value)
					}}
					sx={counsellorStyles.searchFieldSx}
					InputProps={{
						startAdornment: (
							<InputAdornment position='start'>
								<SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
							</InputAdornment>
						),
					}}
				/>

				{/* Action Buttons */}
				<Box sx={counsellorStyles.actionButtonsSx}>
					{/* Filter Button */}
					<IconButton
						size='small'
						sx={counsellorStyles.filterButtonSx}
						onClick={() => handleModal('filter', true)}
					>
						<FilterListIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
					</IconButton>

					{appPermissions?.StudentManagement?.edit && (
						<Button
							variant='contained'
							size='small'
							startIcon={<UploadIcon sx={{ fontSize: 16 }} />}
							sx={counsellorStyles.addButtonSx}
							onClick={() => handleModal('upload', true)}
						>
							Upload
						</Button>
					)}
				</Box>
			</Box>

			{/* Table */}
			{allStudents?.data?.length > 0 && (
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						flex: 1,
						minWidth: 0,
						overflow: 'hidden',
						border: '1px solid rgba(0, 0, 0, 0.08)',
						borderRadius: '8px',
						backgroundColor: '#fff',
					}}
				>
					<TableContainer
						ref={tableContainerRef}
						sx={{
							flex: 1,
							minHeight: 0,
							overflow: 'auto',
							...tableStyles.scrollWrapper,
						}}
					>
						<Table
							stickyHeader
							size='small'
							aria-labelledby='tableTitle'
							sx={{
								tableLayout: 'fixed',
								minWidth: columns.reduce((sum, col) => sum + col.width, 0),
							}}
						>
							<TableHead>
								<TableRow sx={{ height: '44px' }}>
									{columns.map((column) => (
										<TableCell
											key={column.id}
											align={column.align}
											sx={{
												...tableStyles.headerCell,
												width: column.width,
												minWidth: column.width,
												cursor: column?.sort ? 'pointer' : 'default',
											}}
											onClick={() => handleSort(column)}
										>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
												{column.label}
												{column.sort && getSortIcon(column)}
											</Box>
										</TableCell>
									))}
								</TableRow>
							</TableHead>
							<TableBody>
								{(allStudents?.data || []).map((row, index) => (
									<TableRow
										hover
										tabIndex={-1}
										key={row._id || index}
										onClick={(e) => {
											const isFormControlLabelClick =
												e.target.closest('.MuiFormControlLabel-root') !== null
											if (isFormControlLabelClick) return
											if (isSelectedAllForDelete) {
												dispatch(setStudentIdsForDelete(row?._id))
											} else if (appPermissions?.StudentManagement?.edit) {
												setStudentRowData(row)
												setEditStudentDrawer(true)
											}
										}}
										sx={tableStyles.bodyRow}
									>
										{columns.map((column, colIndex) => (
											<TableCell
												key={column.id}
												align={column.align}
												sx={{
													...tableStyles.bodyCell,
													width: column.width,
													minWidth: column.width,
												}}
											>
												<Box sx={{ display: 'flex', alignItems: 'center' }}>
													{isSelectedAllForDelete && colIndex === 0 && (
														<FormControlLabel
															checked={studentIdsForDelete?.includes(row?._id)}
															onChange={(e) => {
																e.stopPropagation()
																dispatch(setStudentIdsForDelete(row?._id))
															}}
															control={
																<Checkbox
																	size='small'
																	sx={{ p: '4px', mr: '4px' }}
																/>
															}
															sx={{ m: 0 }}
														/>
													)}
													{rowCells(column, row)}
												</Box>
											</TableCell>
										))}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>

					{/* Footer */}
					<Box sx={tableStyles.footer}>
						<Box>
							{!isSelectedAllForDelete && (
								<Box
									sx={tableStyles.downloadLink}
									onClick={() => {
										const body = fetchAllStudents(
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
									<DownloadIcon sx={{ fontSize: '16px' }} />
									<span>{localizationConstants.downloadReport}</span>
								</Box>
							)}
						</Box>
						{(isSelectedAllForDelete || studentIdsForDelete?.length > 0) && (
							<Box sx={{ display: 'flex', gap: '8px' }}>
								<Button
									variant='contained'
									size='small'
									sx={{
										...tableStyles.actionButton,
										backgroundColor: '#6A6A6A',
										'&:hover': { backgroundColor: '#555' },
									}}
									onClick={() => setIsSelectedAllForDelete(false)}
								>
									{localizationConstants.cancel}
								</Button>
								<Button
									variant='contained'
									size='small'
									sx={{
										...tableStyles.actionButton,
										backgroundColor: '#DD2A2B',
										'&:hover': { backgroundColor: '#B91C1C' },
									}}
									onClick={() => setDeleteBulkDialog(true)}
								>
									{localizationConstants.delete}
								</Button>
							</Box>
						)}
						<CustomPagination
							rowsPerPage={rowsPerPage}
							setRowsPerPage={setRowsPerPage}
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
							totalCount={allStudents?.totalCount}
						/>
					</Box>
				</Box>
			)}

			{/* Empty State */}
			{allStudents?.data?.length === 0 && (
				<Box sx={{ ...tableStyles.emptyState, flex: 1 }}>
					<CustomIcon
						name={iconConstants.noSchoolsBlack}
						style={tableStyles.emptyStateIcon}
						svgStyle={'width: 64px; height: 64px; opacity: 0.4'}
					/>
					<Typography sx={tableStyles.emptyStateTitle}>
						{localizationConstants.noStudentsAdded}
					</Typography>
					<Typography sx={tableStyles.emptyStateSubtitle}>
						{localizationConstants.addStudent}
					</Typography>
				</Box>
			)}

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
					refreshList()
					handleModal('filter', false)
				}}
				defaultAccordions={['AYs', 'studentStatus']}
			/>

			{editStudentDrawer && (
				<EditStudentDrawer
					editStudentDrawer={editStudentDrawer}
					setEditStudentDrawer={setEditStudentDrawer}
					studentRowData={studentRowData}
					schoolOptions={schoolsListForValidation.map((school) => ({
						id: school._id,
						label: school.school,
					}))}
					refreshList={refreshList}
				/>
			)}
			{modal.upload && (
				<UploadStudent
					modal={modal}
					handleModal={handleModal}
					refreshList={refreshList}
					setResponse={setResponse}
					setUploadErrorsDialog={setUploadErrorsDialog}
				/>
			)}

			<CustomDialog
				isOpen={deleteBulkDialog}
				onClose={() => setDeleteBulkDialog(false)}
				title={localizationConstants?.deleteMultipleStudents}
				iconName={iconConstants.academicRed}
				titleSx={{
					color: 'textColors.red',
					fontWeight: 500,
					pb: '20px',
				}}
				titleTypoVariant={typographyConstants.h4}
				message={localizationConstants.deleteBulkInStudentMsg}
				messageTypoVariant={typographyConstants.h5}
				leftButtonText={localizationConstants.cancel}
				rightButtonText={localizationConstants.yesDelete}
				onLeftButtonClick={() => setDeleteBulkDialog(false)}
				onRightButtonClick={async () => {
					const body = {
						studentIds: studentIdsForDelete,
					}
					const res = await dispatch(bulkDeleteStudent({ body }))
					if (!res?.error) {
						setIsSelectedAllForDelete(false)
						setDeleteBulkDialog(false)
						refreshList()
					}
				}}
			/>

			<CustomDialog
				isOpen={uploadErrorsDialog}
				onClose={() => setUploadErrorsDialog(false)}
				title={`${localizationConstants?.oops} !`}
				iconName={iconConstants.errorFile}
				titleSx={{
					color: 'textColors.red',
					fontWeight: 500,
					pb: '20px',
				}}
				titleTypoVariant={typographyConstants.h4}
				message={localizationConstants.errorFileDownloadMsg}
				messageTypoVariant={typographyConstants.h5}
				leftButtonText={localizationConstants.closeCamel}
				rightButtonText={`${localizationConstants.download} File`}
				onLeftButtonClick={() => {
					setUploadErrorsDialog(false)
				}}
				onRightButtonClick={() => {
					ErrorMsgDownload(
						response,
						setUploadErrorsDialog,
						'Student Validation Error.xlsx',
					)
				}}
			/>

			<CustomDialog
				isOpen={uploadErrorsDialog}
				onClose={() => setUploadErrorsDialog(false)}
				title={`${localizationConstants?.oops} !`}
				iconName={iconConstants.errorFile}
				titleSx={{
					color: 'textColors.red',
					fontWeight: 500,
					pb: '20px',
				}}
				titleTypoVariant={typographyConstants.h4}
				message={localizationConstants.errorFileDownloadMsg}
				messageTypoVariant={typographyConstants.h5}
				leftButtonText={localizationConstants.closeCamel}
				rightButtonText={`${localizationConstants.download} File`}
				onLeftButtonClick={() => {
					setUploadErrorsDialog(false)
				}}
				onRightButtonClick={() => {
					ErrorMsgDownload(
						response,
						setUploadErrorsDialog,
						'Student Validation Error.xlsx',
					)
				}}
			/>
		</Box>
	)
}

export default Students
