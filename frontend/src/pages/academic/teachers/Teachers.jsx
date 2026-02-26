import { Box } from '@mui/system'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { iconConstants } from '../../../resources/theme/iconConstants'
import CustomIcon from '../../../components/CustomIcon'
import { useDispatch, useSelector } from 'react-redux'
import { sortkeys, teachersColumn } from './teachersConstants'
import { counsellorStyles } from '../../counsellors/counsellorsStyles'
import { tableStyles } from '../../../components/styles/tableStyles'
import debounce from 'lodash.debounce'
import {
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
import CustomPagination from '../../../components/CustomPagination'
import EditTeachersDrawer from './EditTeachersDrawer'
import { initModal } from './teachersConstants'
import UploadTeachers from './UploadTeachers'
import {
	bulkSendInviteMailToTeachers,
	clearTeacherIdsForMailSend,
	setTeacherIdsForBulkMailSend,
	setTeacherIdsForMailSend,
	ViewAllSchoolsForTeacher,
} from './teachersSlice'
import { handleDownloadExcel } from './teachersThunk'
import CustomDialog from '../../../components/CustomDialog'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import CommonFilterDrawer, {
	initialAccordionStates,
	initialFilterStates,
} from '../../../components/commonComponents/CustomFilter'
import { fetchAllTeachers } from './tecahersFunction'
import { sortEnum } from '../../../utils/utils'

const Teachers = () => {
	const dispatch = useDispatch()
	const { appPermissions, drawerWidth } = useSelector(
		(store) => store.dashboardSliceSetup,
	)
	const tableContainerRef = useRef(null)
	const { allTeachers, viewAllSchools, teachersIdsForMail } = useSelector(
		(store) => store.teachers,
	)
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const [rowsPerPage, setRowsPerPage] = useState({
		text: '150',
		value: 150,
	})
	const [currentPage, setCurrentPage] = useState(1)
	const [columns, setColumns] = useState(teachersColumn)
	const [sortKeys, setSortKeys] = useState([...sortkeys])
	const [teachersRowData, setTeachersRowData] = useState(null)
	const [editTeachersDrawer, setEditTeachersDrawer] = useState(false)
	const [filterData, setFilterData] = useState(initialFilterStates)
	const [searchText, setSearchText] = useState('')
	const [localSearchText, setLocalSearchText] = useState('')
	const [modal, setModal] = useState({ ...initModal })
	const [isSelectedAllClicked, setIsSelectedAllClicked] = useState(false)
	const [bulkMailSendDialog, setBulkMailSendDialog] = useState(false)
	const [isSecondBoxClicked, setIsSecondBoxClicked] = useState(true)

	const getStatusStyle = (status) => {
		switch (status) {
			case 'Active':
				return tableStyles.statusActive
			case 'Invited':
				return tableStyles.statusInvited
			case 'Inactive':
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
						{row?.teacher_id}
					</Typography>
				)
			case localizationConstants.teacherName:
				return (
					<Typography sx={tableStyles.cellTextPrimary}>
						{row?.teacherName}
					</Typography>
				)
			case localizationConstants.gender:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{row?.gender}
					</Typography>
				)
			case localizationConstants.scCode:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{row?.scCode}
					</Typography>
				)
			case localizationConstants.school:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{row?.schoolName}
					</Typography>
				)
			case localizationConstants.email:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{row?.email}
					</Typography>
				)
			case localizationConstants.mobileNum:
				return (
					<Typography sx={tableStyles.cellTextMuted}>
						{row?.mobileNumber}
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
			default:
				return null
		}
	}

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

	const refreshList = (type, filter_data, search_text) => {
		if (type) {
			handleModal(type, false)
		}

		fetchAllTeachers(
			dispatch,
			filter_data ?? filterData,
			search_text ?? searchText,
			currentPage,
			rowsPerPage.value,
			sortKeys,
		)
	}

	useEffect(() => {
		if (academicYears.length > 0) {
			let filter_data = { ...filterData }
			const allAcademicYearIds = academicYears.map((year) => year._id)
			if (allAcademicYearIds) {
				setFilterData((state) => ({
					...state,
					selectdAYs: allAcademicYearIds,
				}))
				filter_data = {
					...filter_data,
					selectdAYs: allAcademicYearIds,
				}
			}
			refreshList(null, filter_data)
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
		if (isSelectedAllClicked) {
			const emails =
				allTeachers?.data?.length > 0
					? allTeachers?.data?.map((cls) => cls?.email)
					: []
			dispatch(setTeacherIdsForBulkMailSend(emails))
		} else {
			dispatch(clearTeacherIdsForMailSend())
		}
	}, [isSelectedAllClicked, allTeachers])

	useEffect(() => {
		if (isSecondBoxClicked) {
			const emails =
				allTeachers?.data?.length > 0
					? allTeachers?.data?.map((cls) => cls?.email)
					: []
			dispatch(setTeacherIdsForBulkMailSend(emails))
		} else {
			dispatch(clearTeacherIdsForMailSend())
		}
	}, [isSecondBoxClicked])

	useEffect(() => {
		setIsSelectedAllClicked(false)
	}, [currentPage])

	useEffect(() => {
		if (tableContainerRef.current) {
			tableContainerRef.current.scrollTop = 0
		}
	}, [allTeachers?.data])

	useEffect(() => {
		dispatch(ViewAllSchoolsForTeacher({}))
	}, [])

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
					placeholder={`${localizationConstants.searchMsgTeachers}, School Name, phone or email`}
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

					{appPermissions?.TeacherManagement?.edit && (
						<Button
							variant='contained'
							size='small'
							startIcon={<UploadIcon sx={{ fontSize: 16 }} />}
							sx={counsellorStyles.addButtonSx}
							onClick={() => handleModal('upload', true)}
						>
							Bulk Upload
						</Button>
					)}
				</Box>
			</Box>

			{/* Table */}
			{allTeachers?.totalCount > 0 && (
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
								{(allTeachers?.data || []).map((row, index) => (
									<TableRow
										hover
										tabIndex={-1}
										key={row._id || index}
										onClick={(e) => {
											const isFormControlLabelClick =
												e.target.closest('.MuiFormControlLabel-root') !== null
											if (isFormControlLabelClick) return
											if (isSelectedAllClicked) {
												dispatch(setTeacherIdsForMailSend(row?.email))
											} else if (appPermissions?.TeacherManagement?.edit) {
												setTeachersRowData(row)
												setEditTeachersDrawer(true)
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
													{isSelectedAllClicked && colIndex === 0 && (
														<FormControlLabel
															checked={teachersIdsForMail?.includes(row?.email)}
															onChange={(e) => {
																e.stopPropagation()
																dispatch(setTeacherIdsForMailSend(row?.email))
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
							{!isSelectedAllClicked && (
								<Box
									sx={tableStyles.downloadLink}
									onClick={() => {
										const body = fetchAllTeachers(
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
						{isSelectedAllClicked && (
							<Box sx={{ display: 'flex', gap: '8px' }}>
								<Button
									variant='contained'
									size='small'
									sx={{
										...tableStyles.actionButton,
										backgroundColor: '#6A6A6A',
										'&:hover': { backgroundColor: '#555' },
									}}
									onClick={() => setIsSelectedAllClicked(false)}
								>
									{localizationConstants.cancel}
								</Button>
								<Button
									variant='contained'
									size='small'
									sx={{
										...tableStyles.actionButton,
										backgroundColor: '#3B82F6',
										'&:hover': { backgroundColor: '#2563EB' },
									}}
									onClick={() => setBulkMailSendDialog(true)}
								>
									{localizationConstants.sendMail}
								</Button>
							</Box>
						)}
						<CustomPagination
							rowsPerPage={rowsPerPage}
							setRowsPerPage={setRowsPerPage}
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
							totalCount={allTeachers?.totalCount}
						/>
					</Box>
				</Box>
			)}

			{/* Empty State */}
			{allTeachers?.totalCount === 0 && (
				<Box sx={{ ...tableStyles.emptyState, flex: 1 }}>
					<CustomIcon
						name={iconConstants.noSchoolsBlack}
						style={tableStyles.emptyStateIcon}
						svgStyle={'width: 64px; height: 64px; opacity: 0.4'}
					/>
					<Typography sx={tableStyles.emptyStateTitle}>
						{localizationConstants.noTeachers}
					</Typography>
					<Typography sx={tableStyles.emptyStateSubtitle}>
						{localizationConstants.addTeacher}
					</Typography>
				</Box>
			)}
			<EditTeachersDrawer
				editTeachersDrawer={editTeachersDrawer}
				setEditTeachersDrawer={setEditTeachersDrawer}
				teachersRowData={teachersRowData}
				transformedSchools={viewAllSchools.map((school) => ({
					id: school._id,
					label: school.school,
				}))}
				sortKeys={sortKeys}
				page={currentPage}
				pageSize={rowsPerPage?.value}
				appPermissions={appPermissions}
				refreshList={refreshList}
				academicYears={academicYears}
				setTeachersRowData={setTeachersRowData}
			/>

			<CommonFilterDrawer
				onOpen={modal.filter}
				handleModal={handleModal}
				filterOptions={{
					...initialAccordionStates,
					schools: true,
					gender: true,
				}}
				filterData={filterData}
				setFilterData={setFilterData}
				onApply={() => {
					refreshList()
					handleModal('filter', false)
				}}
				defaultAccordions={['schools', 'gender']}
			/>

			<UploadTeachers
				modal={modal}
				handleModal={handleModal}
				refreshList={refreshList}
			/>

			<CustomDialog
				isOpen={bulkMailSendDialog}
				onClose={() => setBulkMailSendDialog(false)}
				title={localizationConstants?.teacherInviteMessage}
				iconName={iconConstants.academicRed}
				titleSx={{
					color: 'textColors.red',
					fontWeight: 500,
					pb: '20px',
				}}
				titleTypoVariant={typographyConstants.h4}
				message={localizationConstants.teacherInviteMainMessage}
				messageTypoVariant={typographyConstants.h5}
				leftButtonText={localizationConstants.cancel}
				rightButtonText={localizationConstants.yesSend}
				onLeftButtonClick={() => setBulkMailSendDialog(false)}
				onRightButtonClick={async () => {
					const body = {
						emailList: teachersIdsForMail,
					}
					const res = await dispatch(
						bulkSendInviteMailToTeachers({ body }),
					)
					if (!res?.error) {
						setIsSelectedAllClicked(false)
						setBulkMailSendDialog(false)
						refreshList()
					}
				}}
			/>
		</Box>
	)
}

export default Teachers
