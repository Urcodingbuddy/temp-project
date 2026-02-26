import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
	Box,
	Table,
	TableBody,
	TableCell,
	TableRow,
	Typography,
	Popover,
	List,
	ListItem,
	Avatar,
	Backdrop,
	TextField,
	InputAdornment,
	IconButton,
	Button,
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import DownloadIcon from '@mui/icons-material/Download'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import useCommonStyles from '../../../components/styles'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { SchoolsStyles } from './SchoolsStyles'
import TableHeader from '../../../components/TableHeader'
import { getUserFromLocalStorage } from '../../../utils/utils'
import { useSelector, useDispatch } from 'react-redux'
import { formatDate } from '../../../utils/utils'
import { fetchAllSchools, updateStatus } from './schoolFunctions'
import SchoolContent from './SchoolContent'
import CustomDialog from '../../../components/CustomDialog'
import AddSchool from './AddSchool'
import EditSchool from './EditSchool'
import ViewSchool from './ViewSchool'
import CustomPagination from '../../../components/CustomPagination'
import { handleDownloadExcel } from './schoolThunk'
import { schoolColumns, sortkeys } from './schoolConstants'
import CommonFilterDrawer, {
	initialAccordionStates,
	initialFilterStates,
} from '../../../components/commonComponents/CustomFilter'
import { TableVirtuoso } from 'react-virtuoso'
import { userRoles } from '../../../utils/globalConstants'
import { defaultAccordionTitle } from '../../../components/commonComponents/CustomFilter'
import { tableStyles } from '../../../components/styles/tableStyles'
import debounce from 'lodash.debounce'

const Schools = () => {
	const flexStyles = useCommonStyles()
	const { allSchools } = useSelector((state) => state.school)
	const { appPermissions, drawerWidth } = useSelector(
		(store) => store.dashboardSliceSetup,
	)
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const dispatch = useDispatch()
	const virtuosoRef = useRef(null)
	const [rowsPerPage, setRowsPerPage] = useState({
		text: '150',
		value: 150,
	})
	const [currentPage, setCurrentPage] = useState(1)
	const [columns, setColumns] = useState(schoolColumns)
	const [selectedRowData, setSelectedRowData] = useState(null)
	const [sortKeys, setSortKeys] = useState([...sortkeys])
	const [anchorPosition, setAnchorPosition] = useState(null)

	const [anchorEl, setAnchorEl] = React.useState(null)
	const [open, setOpen] = useState(false)
	const [filterData, setFilterData] = useState(initialFilterStates)
	const [searchText, setSearchText] = useState('')
	const [localSearchText, setLocalSearchText] = useState('')

	const debouncedSearch = useCallback(
		debounce((value) => {
			if (value.length >= 3 || value.length === 0) {
				setSearchText(value)
				setCurrentPage(1)
			}
		}, 400),
		[],
	)

	const [modals, setModals] = useState({
		inActivate: false,
		addSchool: false,
		editSchool: false,
		filter: false,
		viewSchool: false,
	})
	const user = getUserFromLocalStorage()
	const isAdmin =
		user.permissions.includes(userRoles.superAdmin) ||
		user.permissions.includes(userRoles.admin)

	const handlePopover = useCallback(
		(event, row) => {
			if (appPermissions?.SchoolManagement?.edit) {
				event.stopPropagation()
				const rect = event.currentTarget.getBoundingClientRect()
				setSelectedRowData(row)
				setAnchorPosition({
					top: rect.bottom,
					left: rect.left,
				})
				setOpen(true)
			}
		},
		[appPermissions],
	)

	const closePopover = useCallback(() => {
		setAnchorEl(null)
		setOpen(false)
	}, [])

	const handleModals = useCallback((name, value) => {
		const obj = {}
		obj[name] = value
		setModals((state) => ({ ...state, ...obj }))
	}, [])

	const handleEdit = useCallback(
		async (row) => {
			setSelectedRowData(row)
			if (appPermissions?.SchoolManagement?.edit) {
				handleModals('editSchool', true)
			} else {
				handleModals('viewSchool', true)
			}
		},
		[appPermissions, handleModals],
	)

	const refreshSchoolList = (type, filter_data, search_text) => {
		if (type) {
			handleModals(type, false)
		}
		fetchAllSchools(
			dispatch,
			filter_data || filterData,
			search_text ?? searchText,
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
				// Initial setup only
				const allAcademicYears = academicYears.map((obj) => obj._id)
				if (academicYears.length > 0) {
					setFilterData((state) => ({
						...state,
						selectdAYs: allAcademicYears,
					}))
					filter_data = {
						...filter_data,
						selectdAYs: allAcademicYears,
					}
				}
				isFirstLoad.current = false
			}
			refreshSchoolList(null, filter_data)
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
		if (virtuosoRef.current) {
			virtuosoRef.current.scrollToIndex({ index: 0 })
		}
	}, [allSchools?.data])

	const rowCells = (column, row) => {
		switch (column.id) {
			case localizationConstants.schoolName:
				return (
					<Box sx={{ display: 'flex', alignItems: 'center' }}>
						{row?.logoUrl ? (
							<Avatar
								alt='School Logo'
								src={row?.logoUrl}
								sx={{ width: 32, height: 32, mr: '10px' }}
								variant='rounded'
							/>
						) : (
							<Avatar
								sx={{
									width: 32,
									height: 32,
									mr: '10px',
									bgcolor: '#E0E7FF',
									color: '#4F46E5',
									fontSize: '13px',
									fontWeight: 600,
								}}
								variant='rounded'
							>
								{row?.school?.[0]?.toUpperCase()}
							</Avatar>
						)}
						<Typography sx={tableStyles.cellTextPrimary}>
							{row?.school}
						</Typography>
					</Box>
				)
			case localizationConstants.scCode:
				return (
					<Typography sx={tableStyles.cellTextMuted}>
						{row?.scCode}
					</Typography>
				)
			case localizationConstants.lastPromotionAcademicYear:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{academicYears?.find(
							(obj) => obj._id === row?.lastPromotionAcademicYear,
						)?.academicYear || '-'}
					</Typography>
				)

			case localizationConstants.city:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{row?.city}
					</Typography>
				)
			case localizationConstants.onboardingDate:
				return (
					<Typography sx={tableStyles.cellTextSecondary}>
						{row?.onboardDate
							? formatDate(row?.onboardDate)
							: 'N/A'}
					</Typography>
				)
			case localizationConstants.status:
				return (
					<Box
						component='span'
						sx={{
							...tableStyles.statusBadge,
							...(row?.status === 'Active'
								? tableStyles.statusActive
								: tableStyles.statusInactive),
							cursor: 'pointer',
						}}
						onClick={(e) => handlePopover(e, row)}
					>
						{row?.status === 'Active'
							? row?.status
							: localizationConstants.inActive}
					</Box>
				)
			default:
				return null
		}
	}

	return (
		<Box sx={SchoolsStyles.pageContainerSx}>
			{appPermissions?.SchoolManagement?.edit && (
				<Box sx={{ flexShrink: 0 }}>
					<SchoolContent />
				</Box>
			)}

			{/* Toolbar */}
			<Box sx={{ ...SchoolsStyles.toolbarSx, flexShrink: 0 }}>
				{/* Search Field */}
				{(appPermissions?.SchoolManagement?.view ||
					appPermissions?.SchoolManagement?.edit) && (
					<TextField
						size='small'
						placeholder={`${localizationConstants.searchSchool} Name, Code or City`}
						value={localSearchText}
						onChange={(e) => {
							setLocalSearchText(e.target.value)
							debouncedSearch(e.target.value)
						}}
						sx={SchoolsStyles.searchFieldSx}
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>
									<SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
								</InputAdornment>
							),
						}}
					/>
				)}

				{/* Action Buttons */}
				<Box sx={SchoolsStyles.actionButtonsSx}>
					{(appPermissions?.SchoolManagement?.view ||
						appPermissions?.SchoolManagement?.edit) && (
						<IconButton
							size='small'
							sx={SchoolsStyles.filterButtonSx}
							onClick={() => handleModals('filter', true)}
						>
							<FilterListIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
						</IconButton>
					)}

					{appPermissions?.SchoolManagement?.edit && (
						<Button
							variant='contained'
							size='small'
							startIcon={<AddIcon sx={{ fontSize: 16 }} />}
							sx={SchoolsStyles.addButtonSx}
							onClick={() => handleModals('addSchool', true)}
						>
							Add School
						</Button>
					)}
				</Box>
			</Box>

			{/* Table */}
			{(appPermissions?.SchoolManagement?.view ||
				appPermissions?.SchoolManagement?.edit) &&
			allSchools?.data?.length > 0 ? (
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						flex: 1,
						minWidth: 0,
						minHeight: 0,
						overflow: 'hidden',
						border: '1px solid rgba(0, 0, 0, 0.08)',
						borderRadius: '8px',
						backgroundColor: '#fff',
					}}
				>
					<TableVirtuoso
						style={{
							flex: 1,
							width: '100%',
						}}
						data={allSchools?.data || []}
						overscan={100}
						ref={virtuosoRef}
						components={{
							Table: (props) => (
								<Table
									{...props}
									stickyHeader
									size='small'
									aria-labelledby='tableTitle'
									sx={{ minWidth: '900px' }}
								/>
							),
							TableBody: React.forwardRef((props, ref) => (
								<TableBody {...props} ref={ref} />
							)),
							TableRow: (props) => (
								<TableRow
									{...props}
									hover
									tabIndex={-1}
									sx={tableStyles.bodyRow}
									onClick={() =>
										handleEdit(
											allSchools?.data?.[
												props['data-index']
											],
										)
									}
								/>
							),
						}}
						fixedHeaderContent={() => (
							<TableRow sx={{ height: '44px' }}>
								{columns.map((column, index) => (
									<TableCell
										key={index}
										align={column.align}
										sx={{
											backgroundColor: '#FAFBFC',
											borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
											padding: '10px 12px',
											fontWeight: 600,
											fontSize: '12px',
											color: '#64748B',
											textTransform: 'uppercase',
											letterSpacing: '0.4px',
											minWidth: column.width,
											maxWidth: column.width,
											cursor: column?.sort ? 'pointer' : 'default',
										}}
										onClick={
											column?.sort
												? () => {
														const newData = columns.map((item) => {
															if (item.id === column.id) {
																return {
																	...item,
																	sort: column.sort === 'desc' ? 'asc' : 'desc',
																}
															}
															return item
														})
														const newSortKeys = sortKeys.filter(
															(item) => item.key !== column.name,
														)
														newSortKeys.unshift({
															key: column.name,
															value: column.sort,
														})
														setSortKeys(newSortKeys)
														setColumns(newData)
													}
												: undefined
										}
									>
										{column.label}
									</TableCell>
								))}
							</TableRow>
						)}
						itemContent={(index, row) => (
							<>
								{columns.map((column) => {
									return (
										<TableCell
											key={column.id}
											align={column.align}
											sx={{
												...tableStyles.bodyCell,
												minWidth: column.width,
												maxWidth: column.width,
											}}
										>
											{rowCells(column, row)}
										</TableCell>
									)
								})}
							</>
						)}
					/>

					{/* Footer */}
					<Box sx={{ ...tableStyles.footer, flexShrink: 0, borderRadius: '0 0 8px 8px' }}>
						<Box
							sx={tableStyles.downloadLink}
							onClick={() => {
								const body = fetchAllSchools(
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
							setRowsPerPage={(e) => {
								if (e.value !== rowsPerPage.value) {
									setRowsPerPage(e)
								}
							}}
							currentPage={currentPage}
							setCurrentPage={(e) => {
								if (e !== currentPage) {
									setCurrentPage(e)
								}
							}}
							totalCount={allSchools?.totalCount}
						/>
					</Box>
				</Box>
			) : (
				<Box sx={tableStyles.emptyState}>
					<CustomIcon
						name={iconConstants.noSchoolsBlack}
						style={tableStyles.emptyStateIcon}
						svgStyle={'width: 64px; height: 64px; opacity: 0.4'}
					/>
					<Typography sx={tableStyles.emptyStateTitle}>
						{localizationConstants.noSchoolsAdded}
					</Typography>
					<Typography sx={tableStyles.emptyStateSubtitle}>
						{localizationConstants.addSchool}
					</Typography>
				</Box>
			)}

			<CustomDialog
				isOpen={modals.inActivate}
				onClose={() => {
					setModals((state) => ({ ...state, inActivate: false }))
				}}
				title={localizationConstants.inActivateSchool}
				iconName={iconConstants.inActivateSchool}
				titleSx={{
					color: 'textColors.red',
					fontWeight: 500,
					pb: '20px',
				}}
				titleTypoVariant={typographyConstants.h4}
				message={localizationConstants.inActivateSchoolMsg}
				messageTypoVariant={typographyConstants.h5}
				leftButtonText={localizationConstants.cancel}
				rightButtonText={localizationConstants.confirmInactivate}
				onLeftButtonClick={() => {
					setModals((state) => ({ ...state, inActivate: false }))
				}}
				onRightButtonClick={() => {
					updateStatus(
						'Inactive',
						selectedRowData?._id,
						dispatch,
						closePopover,
						refreshSchoolList,
					)
				}}
				width={'500px'}
			/>

			{/* ----------------- filter school drawer --------------- */}
			<CommonFilterDrawer
				onOpen={modals.filter}
				handleModal={handleModals}
				filterOptions={{
					...initialAccordionStates,
					AYs: true,
					status: true,
					byDate: true,
				}}
				filterData={filterData}
				setFilterData={setFilterData}
				onApply={() => {
					refreshSchoolList('filter')
				}}
				defaultAccordions={['AYs', 'status', 'byDate']}
				accordionTitleOptions={{
					...defaultAccordionTitle,
					AYs: localizationConstants.lastActiveAcademicYear,
					byDate: localizationConstants.onboardingDate,
				}}
			/>

			{/* ----------------- edit school drawer ----------------- */}
			{modals.editSchool && (
				<EditSchool
					modals={modals}
					handleModals={handleModals}
					rowData={selectedRowData}
					refreshSchoolList={refreshSchoolList}
				/>
			)}

			{/* ------------------ add school drawer ----------------- */}
			{modals.addSchool && (
				<AddSchool
					modals={modals}
					handleModals={handleModals}
					refreshSchoolList={refreshSchoolList}
				/>
			)}

			{/* ----------------- edit school drawer ----------------- */}

			{modals.viewSchool && (
				<ViewSchool
					modals={modals}
					handleModals={handleModals}
					rowData={selectedRowData}
					refreshSchoolList={refreshSchoolList}
				/>
			)}

			<Backdrop
				sx={{
					color: 'globalElementColors.grey1',
					zIndex: (theme) => theme.zIndex.drawer + 1,
				}}
				open={open}
				onClick={closePopover}
			>
				<Popover
					open={open}
					onClose={closePopover}
					anchorReference='anchorPosition'
					anchorPosition={anchorPosition}
					PaperProps={{
						sx: {
							margin: 0,
							borderRadius: '10px',
							boxShadow: 'var(--shadow-5)',
						},
					}}
				>
					<List sx={SchoolsStyles.statusPopper}>
						<ListItem
							sx={SchoolsStyles.activeInactiveListItem(
								selectedRowData?.status === 'Active',
							)}
							onClick={() => {
								updateStatus(
									'Active',
									selectedRowData?._id,
									dispatch,
									closePopover,
									refreshSchoolList,
								)
							}}
						>
							<Box
								className={flexStyles.flexRowAlighnItemsCenter}
							>
								<Box sx={SchoolsStyles.activeDot}></Box>
								<Typography variant={typographyConstants.body}>
									{localizationConstants.active}
								</Typography>
							</Box>
						</ListItem>
						<ListItem
							sx={SchoolsStyles.activeInactiveListItem(
								selectedRowData?.status !== 'Active',
							)}
							onClick={() => handleModals('inActivate', true)}
						>
							<Box
								className={flexStyles.flexRowAlighnItemsCenter}
							>
								<Box sx={SchoolsStyles.inActiveDot}></Box>
								<Typography variant={typographyConstants.body}>
									{localizationConstants.inActive}
								</Typography>
							</Box>
						</ListItem>
					</List>
				</Popover>
			</Backdrop>
		</Box>
	)
}

export default Schools
