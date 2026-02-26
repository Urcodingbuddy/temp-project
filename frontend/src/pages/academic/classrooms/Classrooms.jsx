import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
	Box,
	Table,
	TableBody,
	TableCell,
	TableRow,
	TableHead,
	TableContainer,
	Typography,
	Avatar,
	FormControlLabel,
	Checkbox,
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
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { tableStyles } from '../../../components/styles/tableStyles'
import { counsellorStyles } from '../../counsellors/counsellorsStyles'
import { useSelector, useDispatch } from 'react-redux'
import debounce from 'lodash.debounce'
import {
	bulkDeleteClassroom,
	clearClassRoomIdsForDelete,
	setClassRoomIdsForDelete,
	setClassRoomIdsForDeleteBulk,
} from './classroomsSlice'
import { fetchAllClassrooms, flatAllClassRooms } from './classRoomFunctions'
import Editclassroom from './Editclassroom'
import { classroomColumns, initModal, sortkeys } from './classroomsContants'
import Uploadclassroom from './Uploadclassroom'
import CustomPagination from '../../../components/CustomPagination'
import { handleDownloadExcel } from './classroomsThunk'
import CustomDialog from '../../../components/CustomDialog'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '../../../routes/routeConstants'
import { getCurACYear, sortEnum } from '../../../utils/utils'
import CommonFilterDrawer from '../../../components/commonComponents/CustomFilter'
import {
	initialFilterStates,
	initialAccordionStates,
} from '../../../components/commonComponents/CustomFilter'
import { fetchTeachersListBySchoolId } from '../teachers/teachersSlice'
import { getSchoolsListForValidation } from '../../../redux/commonSlice'
import { typographyConstants } from '../../../resources/theme/typographyConstants'

const {
	schoolName,
	academicYear,
	className,
	section,
	teacherName,
	email,
	contact,
	classHierarchy,
	sectionHierarchy,
} = localizationConstants.classRoomTableConstants

const ClassRooms = () => {
	const { allClassrooms, classRoomIdsForDelete } = useSelector(
		(state) => state.classrooms,
	)
	const tableContainerRef = useRef(null)
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const { appPermissions } = useSelector(
		(store) => store.dashboardSliceSetup,
	)
	const permission = {
		editable: appPermissions?.ClassroomManagement?.edit,
		deletable: appPermissions?.ClassroomManagement?.delete,
		viewable: appPermissions?.ClassroomManagement?.view,
	}
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const [columns, setColumns] = useState(classroomColumns)
	const [selectedRowData, setSelectedRowData] = useState(null)
	const [sortKeys, setSortKeys] = useState([...sortkeys])
	const [modal, setModal] = useState({ ...initModal })
	const [isSelectedAllForDelete, setIsSelectedAllForDelete] = useState(false)
	const [deleteBulkDialog, setDeleteBulkDialog] = useState(false)
	const [deleteAlertBulkDialog, setDeleteAlertBulkDialog] = useState(false)
	const [filterData, setFilterData] = useState(initialFilterStates)
	const [searchText, setSearchText] = useState('')
	const [localSearchText, setLocalSearchText] = useState('')

	const [rowsPerPage, setRowsPerPage] = useState({
		text: '150',
		value: 150,
	})
	const [currentPage, setCurrentPage] = useState(1)

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

	const refreshList = () => {
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

		fetchAllClassrooms(
			dispatch,
			newFilterData,
			searchText,
			currentPage,
			rowsPerPage.value,
			sortKeys,
		)
	}

	const handleEdit = (e, index) => {
		const row = allClassrooms?.data[index]
		const isFormControlLabelClick =
			e.target.closest('.MuiFormControlLabel-root') !== null

		if (isFormControlLabelClick) {
			return
		}
		setSelectedRowData(row)
		dispatch(fetchTeachersListBySchoolId(row.school._id))
		if (permission.editable) {
			handleModal('edit', true)
		}
	}

	const rowCells = (column, row) => {
		switch (column.id) {
			case schoolName.key:
				return (
					<Box sx={{ display: 'flex', alignItems: 'center' }}>
						{row?.school?.logoUrl ? (
							<Avatar
								alt='School'
								src={row?.logoUrl}
								sx={{ width: 28, height: 28, mr: '8px' }}
								variant='rounded'
							/>
						) : (
							<Avatar
								sx={{
									width: 28,
									height: 28,
									mr: '8px',
									bgcolor: '#E3F2FD',
									color: '#1976D2',
									fontSize: '12px',
								}}
								alt='School'
								variant='rounded'
							>
								{row[schoolName.key]?.charAt(0).toUpperCase()}
							</Avatar>
						)}
						<Typography sx={tableStyles.cellTextPrimary}>
							{row[schoolName.key]}
						</Typography>
					</Box>
				)
			case className.key:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{row[className.key]}
					</Typography>
				)
			case academicYear.key:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{row[academicYear.key]}
					</Typography>
				)
			case classHierarchy.key:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{row[classHierarchy.key]}
					</Typography>
				)
			case section.key:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{row[section.key]}
					</Typography>
				)
			case sectionHierarchy.key:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{row[sectionHierarchy.key]}
					</Typography>
				)
			case teacherName.key:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{row[teacherName.key] || localizationConstants.notApplicable}
					</Typography>
				)
			case email.key:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{row[email.key] || localizationConstants.notApplicable}
					</Typography>
				)
			case contact.key:
				return (
					<Typography sx={tableStyles.cellTextMuted}>
						{row[contact.key] || localizationConstants.notApplicable}
					</Typography>
				)
			case localizationConstants?.students:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{row['studentCount']}
					</Typography>
				)
			default:
				return null
		}
	}

	useEffect(() => {
		if (isSelectedAllForDelete) {
			const ids =
				allClassrooms?.data?.length > 0
					? allClassrooms?.data?.map((cls) => cls?._id)
					: []
			dispatch(setClassRoomIdsForDeleteBulk(ids))
		} else {
			dispatch(clearClassRoomIdsForDelete())
		}
	}, [isSelectedAllForDelete, allClassrooms])

	useEffect(() => {
		if (classRoomIdsForDelete?.length == 0) {
			setIsSelectedAllForDelete(false)
		}
	}, [classRoomIdsForDelete])

	useEffect(() => {
		setIsSelectedAllForDelete(false)
	}, [currentPage])

	const isFirstLoad = useRef(true)
	useEffect(() => {
		if (academicYears.length > 0) {
			let filter_data = { ...filterData }
			if (isFirstLoad.current) {
				// Initial setup only
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

			fetchAllClassrooms(
				dispatch,
				filter_data,
				searchText,
				currentPage,
				rowsPerPage.value,
				sortKeys,
			)
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
	}, [allClassrooms?.data])

	useEffect(() => {
		if (academicYears.length > 0) {
			const body = {
				filter: { academicYear: academicYears.map((acys) => acys._id) },
			}
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
				{(permission.viewable || permission.editable) && (
					<>
						{/* Search Field */}
						<TextField
							size='small'
							placeholder={localizationConstants.classroomSearchPlaceholder}
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

							{permission.editable && (
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
					</>
				)}
			</Box>

			{/* Table */}
			{(permission.viewable || permission.editable) &&
			allClassrooms?.data?.length > 0 && (
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
								{flatAllClassRooms(allClassrooms?.data).map((row, index) => (
									<TableRow
										hover
										tabIndex={-1}
										key={row._id || index}
										onClick={(e) => {
											if (e.target.type === 'checkbox') return
											if (isSelectedAllForDelete) {
												dispatch(setClassRoomIdsForDelete(row?._id))
											} else {
												handleEdit(e, index)
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
															checked={classRoomIdsForDelete?.includes(row?._id)}
															onChange={() => {
																dispatch(setClassRoomIdsForDelete(row?._id))
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
										const body = fetchAllClassrooms(
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
						{(isSelectedAllForDelete || classRoomIdsForDelete?.length > 0) && (
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
							totalCount={allClassrooms?.totalCount}
						/>
					</Box>
				</Box>
			)}

			{/* Empty State */}
			{allClassrooms?.data?.length === 0 && (
				<Box sx={{ ...tableStyles.emptyState, flex: 1 }}>
					<CustomIcon
						name={iconConstants.noSchoolsBlack}
						style={tableStyles.emptyStateIcon}
						svgStyle={'width: 64px; height: 64px; opacity: 0.4'}
					/>
					<Typography sx={tableStyles.emptyStateTitle}>
						{localizationConstants.noClassroomsAdded}
					</Typography>
					<Typography sx={tableStyles.emptyStateSubtitle}>
						{localizationConstants.addClassroom}
					</Typography>
				</Box>
			)}

			{/* ----------------- filter school drawer --------------- */}
			{/* <FilterClassrooms modal={modal} handleModal={handleModal} /> */}

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
					refreshList()
					handleModal('filter', false)
				}}
				defaultAccordions={['AYs']}
			/>

			{/* ----------------- edit classroom drawer ----------------- */}
			<Editclassroom
				modal={modal}
				handleModal={handleModal}
				rowData={selectedRowData}
				deletable={permission.deletable}
				refreshList={refreshList}
			/>

			{/* ----------------- edit classroom drawer ----------------- */}
			<Uploadclassroom
				modal={modal}
				handleModal={handleModal}
				refreshList={refreshList}
			/>

			<CustomDialog
				isOpen={deleteBulkDialog}
				onClose={() => setDeleteBulkDialog(false)}
				title={localizationConstants?.deleteMultipleClassrooms}
				iconName={iconConstants.academicRed}
				titleSx={{
					color: 'textColors.red',
					fontWeight: 500,
					pb: '20px',
				}}
				titleTypoVariant={typographyConstants.h4}
				message={localizationConstants.deleteBulkInClassroomMsg}
				messageTypoVariant={typographyConstants.h5}
				leftButtonText={localizationConstants.cancel}
				rightButtonText={localizationConstants.yesDelete}
				onLeftButtonClick={() => setDeleteBulkDialog(false)}
				onRightButtonClick={async () => {
					const body = {
						classroomIds: classRoomIdsForDelete,
					}

					const res = await dispatch(bulkDeleteClassroom({ body }))
					if (!res?.error) {
						setIsSelectedAllForDelete(false)
						setDeleteBulkDialog(false)
						refreshList()
					}
					if (res?.payload?.classRoomContainsStudent) {
						setDeleteBulkDialog(false)
						setDeleteAlertBulkDialog(true)
					}
				}}
			/>

			<CustomDialog
				isOpen={deleteAlertBulkDialog}
				onClose={() => setDeleteAlertBulkDialog(false)}
				title={localizationConstants?.deleteMultipleClassrooms}
				iconName={iconConstants.academicRed}
				titleSx={{
					color: 'textColors.red',
					fontWeight: 500,
					pb: '20px',
				}}
				titleTypoVariant={typographyConstants.h4}
				message={localizationConstants.deleteAlertBulkClassRoomMsg}
				messageTypoVariant={typographyConstants.h5}
				leftButtonText={localizationConstants.cancel}
				rightButtonText={'Go to Students'}
				onLeftButtonClick={() => {
					setDeleteBulkDialog(false)
					setDeleteAlertBulkDialog(false)
				}}
				onRightButtonClick={() => {
					navigate(routePaths?.academicStudents)
				}}
			/>
		</Box>
	)
}

export default ClassRooms
