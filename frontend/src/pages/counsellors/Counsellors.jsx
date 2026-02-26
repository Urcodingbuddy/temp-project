import React, { lazy, useCallback, useEffect, useState } from 'react'
import {
	Box,
	Table,
	TableBody,
	TableCell,
	TableRow,
	Typography,
	Chip,
	TextField,
	InputAdornment,
	IconButton,
	Button,
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import DownloadIcon from '@mui/icons-material/Download'
import CustomIcon from '../../components/CustomIcon'
import { iconConstants } from '../../resources/theme/iconConstants'
import { localizationConstants } from '../../resources/theme/localizationConstants'
import { typographyConstants } from '../../resources/theme/typographyConstants'
import { useDispatch, useSelector } from 'react-redux'
import {
	fetchAllCounsellors,
	getFirstFourSchools,
	handleAssignSchool,
	handleAssignSchoolDrawerOpen,
	handleDeleteCounsellor,
	handleEditCounsellorDrawerOpen,
	handleOpenAddCounsellorDrawer,
} from './counsellorFunctions'
import { counsellorStyles } from './counsellorsStyles'
import TableHeader from '../../components/TableHeader'
import { requestParams } from '../../utils/apiConstants'
import { updateDeleteCounsellorDrawer } from './counsellorSlice'
import CustomDialog from '../../components/CustomDialog'
import EditCounsellorDrawer from './EditCounsellorDrawer'
import AddCounsellorDrawer from './AddCounsellorDrawer'
import AssignSchool from './AssignSchool'
import CustomPagination from '../../components/CustomPagination'
import { handleDownloadExcel } from './counsellorThunk'
import { counsellorColumns, sortkeys } from './counselorConstants'
import {
	initialAccordionStates,
	initialFilterStates,
} from '../../components/commonComponents/CustomFilter'
import { getSchoolsList } from '../../redux/commonSlice'
import debounce from 'lodash.debounce'
import { tableStyles } from '../../components/styles/tableStyles'

const CommonFilterDrawer = lazy(
	() => import('../../components/commonComponents/CustomFilter'),
)

const Counsellors = () => {
	const { allCounsellors, deleteCounsellorDrawer } = useSelector(
		(store) => store.counsellor,
	)

	const dispatch = useDispatch()

	const [addCounsellorDrawer, setAddCounsellorDrawer] = useState(false)
	const [isEmailIdValid, setIsEmailIdValid] = useState(false)
	const [permissionType, setPermissionType] = useState('')
	const [assignSchoolDrawer, setAssignSchoolDrawer] = useState(false)
	const [assignSchools, setAssignSchools] = useState([])
	const [editCounsellorDrawer, setEditCounsellorDrawer] = useState(false)
	const [setAddCounsellorAssignSchoolDrawer] = useState(false)
	const [setEditCounsellorAssignSchoolDrawer] = useState(false)
	const [rowsPerPage, setRowsPerPage] = useState({
		text: '150',
		value: 150,
	})
	const [currentPage, setCurrentPage] = useState(1)
	const { drawerWidth, academicYears } = useSelector(
		(store) => store.dashboardSliceSetup,
	)
	const { schoolsList } = useSelector((store) => store.commonData)
	const [columns, setColumns] = useState(counsellorColumns)
	const [sortKeys, setSortKeys] = useState([...sortkeys])
	const [filterKeys, setFilterKeys] = useState({
		[requestParams.status]: [
			localizationConstants.active,
			localizationConstants.invited,
		],
	})

	const [selectedRowData, setSelectedRowData] = useState(null)
	const [counsellorId, setCounsellorId] = useState(null)
	const [filterData, setFilterData] = useState(initialFilterStates)
	const [searchText, setSearchText] = useState('')
	const [modal, setModal] = useState({ upload: false, filter: false })
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

	const refreshList = () => {
		fetchAllCounsellors(
			dispatch,
			filterData,
			searchText,
			currentPage,
			rowsPerPage.value,
			sortKeys,
			false,
		)
	}

	useEffect(() => {
		if (academicYears.length > 0) {
			const ayIds = academicYears.map((obj) => obj._id)
			setFilterData((state) => ({
				...state,
				selectdAYs: ayIds,
			}))
		}
	}, [academicYears])

	useEffect(() => {
		if (academicYears.length > 0) {
			const body = {
				filter: { academicYear: academicYears.map((acys) => acys._id) },
			}
			dispatch(getSchoolsList({ body }))
		}
	}, [academicYears])

	useEffect(() => {
		fetchAllCounsellors(
			dispatch,
			filterData,
			searchText,
			currentPage,
			rowsPerPage.value,
			sortKeys,
		)
	}, [sortKeys, currentPage, rowsPerPage, searchText, dispatch])

	const getTypeLabel = (permissions) => {
		if (permissions === localizationConstants.peeguCounsellor) {
			return localizationConstants.myPeegu
		}
		if (permissions === localizationConstants.schoolCounsellor) {
			return localizationConstants.school
		}
		return localizationConstants.pricipal
	}

	const rowCells = (column, row) => {
		switch (column.id) {
			case localizationConstants.id:
				return (
					<Typography sx={tableStyles.cellTextMuted}>
						{row?.user_id}
					</Typography>
				)
			case localizationConstants.name:
				return (
					<Typography sx={tableStyles.cellTextPrimary}>
						{row?.fullName}
					</Typography>
				)
			case localizationConstants.type:
				return (
					<Chip
						label={getTypeLabel(row?.permissions)}
						size='small'
						sx={tableStyles.typeChip}
					/>
				)
			case localizationConstants.schoolAssigned:
				return row?.assignedSchools.length !== 0 ? (
					<Typography sx={tableStyles.cellTextSecondary}>
						{getFirstFourSchools(row?.assignedSchools)}
					</Typography>
				) : (
					<Button
						variant='contained'
						size='small'
						startIcon={<AddIcon sx={{ fontSize: 14 }} />}
						sx={{
							...tableStyles.actionButton,
							backgroundColor: '#F59E0B',
							'&:hover': { backgroundColor: '#D97706' },
						}}
						onClick={(e) => {
							e.stopPropagation()
							setSelectedRowData(row)
							handleAssignSchoolDrawerOpen(
								setAssignSchoolDrawer,
								row?._id,
								setCounsellorId,
								setAssignSchools,
							)
						}}
					>
						Assign
					</Button>
				)
			case localizationConstants.email:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{row?.email}
					</Typography>
				)
			case localizationConstants.number:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{row?.phone}
					</Typography>
				)
			case localizationConstants.status:
				return (
					<Box
						component='span'
						sx={{
							...tableStyles.statusBadge,
							...(row?.status === localizationConstants.active
								? tableStyles.statusActive
								: tableStyles.statusInvited),
						}}
					>
						{row?.status}
					</Box>
				)
			default:
				return null
		}
	}

	return (
		<Box sx={counsellorStyles.pageContainerSx}>
			{/* Toolbar */}
			<Box sx={counsellorStyles.toolbarSx}>
				{/* Search Field */}
				<TextField
					size='small'
					placeholder={localizationConstants.searchCounsellors}
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

					<CommonFilterDrawer
						onOpen={modal.filter}
						handleModal={handleModal}
						filterOptions={{
							...initialAccordionStates,
							role: true,
							schools: true,
						}}
						filterData={filterData}
						setFilterData={setFilterData}
						onApply={() => {
							fetchAllCounsellors(
								dispatch,
								filterData,
								searchText,
								currentPage,
								rowsPerPage.value,
								sortKeys,
							)
							handleModal('filter', false)
						}}
						defaultAccordions={['role']}
					/>

					{/* Add User Button */}
					<Button
						variant='contained'
						size='small'
						startIcon={<AddIcon sx={{ fontSize: 16 }} />}
						sx={counsellorStyles.addButtonSx}
						onClick={() =>
							handleOpenAddCounsellorDrawer(setAddCounsellorDrawer)
						}
					>
						{localizationConstants.addUser}
					</Button>
				</Box>
			</Box>

			{/* Table */}
			{allCounsellors?.data?.length > 0 && (
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
					<Box sx={{ flex: 1, overflow: 'auto', ...tableStyles.scrollWrapper }}>
						<Table
							aria-labelledby='tableTitle'
							size='small'
							sx={tableStyles.table}
						>
							<TableHeader
								columns={columns}
								sortKeys={sortKeys}
								setSortKeys={setSortKeys}
								setColumns={setColumns}
							/>
							<TableBody>
								{allCounsellors?.data?.map((row, index) => (
									<TableRow
										key={index}
										sx={tableStyles.bodyRow}
										onClick={() => {
											handleEditCounsellorDrawerOpen(
												row,
												setEditCounsellorDrawer,
												setSelectedRowData,
											)
											setCounsellorId(row._id)
										}}
									>
										{columns.map((column) => (
											<TableCell
												key={column.id}
												align={column.align}
												sx={{
													...tableStyles.bodyCell,
													width: column.width,
												}}
											>
												{rowCells(column, row)}
											</TableCell>
										))}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</Box>

					{/* Footer */}
					<Box sx={tableStyles.footer}>
						<Box
							sx={tableStyles.downloadLink}
							onClick={() => {
								const body = fetchAllCounsellors(
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

						<CustomPagination
							rowsPerPage={rowsPerPage}
							setRowsPerPage={setRowsPerPage}
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
							totalCount={allCounsellors?.totalCount}
						/>
					</Box>
				</Box>
			)}

			{/* Empty State */}
			{allCounsellors?.data?.length === 0 && (
				<Box sx={tableStyles.emptyState}>
					<CustomIcon
						name={iconConstants.counsellorBlack}
						style={tableStyles.emptyStateIcon}
						svgStyle={'width: 64px; height: 64px; opacity: 0.4'}
					/>
					<Typography sx={tableStyles.emptyStateTitle}>
						{localizationConstants.noCounsellorAdded}
					</Typography>
					<Typography sx={tableStyles.emptyStateSubtitle}>
						{localizationConstants.addNewCounsellor}
					</Typography>
				</Box>
			)}

			{/* Drawers */}
			<AddCounsellorDrawer
				addCounsellorDrawer={addCounsellorDrawer}
				setAddCounsellorDrawer={setAddCounsellorDrawer}
				isEmailIdValid={isEmailIdValid}
				setIsEmailIdValid={setIsEmailIdValid}
				selectedRowData={selectedRowData}
				permissionType={permissionType}
				setPermissionType={setPermissionType}
				setAddCounsellorAssignSchoolDrawer={
					setAddCounsellorAssignSchoolDrawer
				}
				allCounsellors={allCounsellors.data}
				allSchools={schoolsList}
				refreshList={refreshList}
			/>

			<EditCounsellorDrawer
				permissionType={permissionType}
				editCounsellorDrawer={editCounsellorDrawer}
				setEditCounsellorDrawer={setEditCounsellorDrawer}
				selectedRowData={selectedRowData}
				counsellorId={counsellorId}
				filterKeys={filterKeys}
				setEditCounsellorAssignSchoolDrawer={
					setEditCounsellorAssignSchoolDrawer
				}
				refreshList={refreshList}
			/>

			{assignSchoolDrawer && (
				<AssignSchool
					permissionType={
						selectedRowData?.permissions
							? selectedRowData?.permissions[0]
							: permissionType
					}
					open={assignSchoolDrawer}
					setOpen={(e) => {
						setAssignSchoolDrawer(e)
						if (e === false) {
							setAssignSchools([])
						}
					}}
					allList={schoolsList}
					setselectedList={setAssignSchools}
					selectedList={assignSchools}
					onAssign={() => {
						handleAssignSchool(
							selectedRowData?.permissions
								? selectedRowData?.permissions[0]
								: permissionType,
							counsellorId,
							assignSchools,
							dispatch,
							setAssignSchoolDrawer,
							refreshList,
						)
					}}
				/>
			)}

			<CustomDialog
				isOpen={deleteCounsellorDrawer}
				title={localizationConstants.deleteUser}
				iconName={iconConstants.trashRed}
				titleSx={{
					color: 'textColors.red',
					fontWeight: 500,
					pb: '16px',
				}}
				titleTypoVariant={typographyConstants.h4}
				message={localizationConstants.deletingCounsellorMessage}
				messageTypoVariant={typographyConstants.h5}
				leftButtonText={localizationConstants.cancel}
				rightButtonText={localizationConstants.yesDelete}
				onLeftButtonClick={() =>
					dispatch(updateDeleteCounsellorDrawer(false))
				}
				onRightButtonClick={() =>
					handleDeleteCounsellor(
						selectedRowData?._id,
						dispatch,
						setEditCounsellorDrawer,
						refreshList,
					)
				}
			/>
		</Box>
	)
}

export default Counsellors
