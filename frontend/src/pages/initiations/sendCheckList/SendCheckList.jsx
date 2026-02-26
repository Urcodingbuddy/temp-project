/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSchoolsList } from '../../../redux/commonSlice'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import {
	Box,
	Menu,
	MenuItem,
	Typography,
	TextField,
	InputAdornment,
	IconButton,
	Button,
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import BarChartIcon from '@mui/icons-material/BarChart'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import debounce from 'lodash.debounce'
import SendChecklistTable from './SendChecklistTable'
import {
	Grade_4_TableColumns,
	Grade_9_TableColumns,
	addOptions,
	checklistOptions,
} from './sendCheckListConstants'
import { fetchAllSendChecklist } from './sendChecklistFunction'
import { clearGrade_4_Marks, clearGrade_9_Marks } from './sendChecklistslice'
import UploadSendChecklist from './UploadSendChecklist'
import {
	initialAccordionStates,
	initialFilterStates,
} from '../../../components/commonComponents/CustomFilter'
import CommonFilterDrawer from '../../../components/commonComponents/CustomFilter'
import { getCurACYear, sortEnum } from '../../../utils/utils'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'
import AddStduentChecklistDialog from './AddStduentChecklistDialog'
import SendChecklistAnalyticsDialog from './SendChecklistAnalyticsDialog'
import { counsellorStyles } from '../../counsellors/counsellorsStyles'

const SendCheckList = () => {
	const dispatch = useDispatch()

	const { appPermissions } = useSelector((store) => store.dashboardSliceSetup)
	const { checklistData } = useSelector((store) => store.sendChecklist)
	const [selectChecklist, setSelectChecklist] = useState('Upper KG - Grade 4')
	const [anchorEl, setAnchorEl] = useState(null)
	const [sortKeys, setSortKeys] = useState([{ key: 'createdAt', value: sortEnum.desc }])

	const refreshListAndCloseDialog = (type, filter_data, search_text) => {
		if (type === 'add') {
			handleModal('add', false)
		} else if (type === 'upload') {
			handleModal('upload', false)
		}

		fetchAllSendChecklist(
			dispatch,
			filter_data ?? filterData,
			search_text ?? searchText,
			currentPage,
			rowsPerPage.value,
			selectChecklist,
			sortKeys,
		)
	}

	const [currentPage, setCurrentPage] = useState(1)
	const [rowsPerPage, setRowsPerPage] = useState({
		text: '150',
		value: 150,
	})
	const [filterData, setFilterData] = useState(initialFilterStates)
	const [searchText, setSearchText] = useState('')
	const [searchInputValue, setSearchInputValue] = useState('')

	const [modal, setModal] = useState({
		upload: false,
		filter: false,
		add: false,
		analytics: false,
	})
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const handleMenuClick = (event) => {
		setAnchorEl(event.currentTarget)
	}
	const handleMenuClose = () => {
		setAnchorEl(null)
	}

	const handleModal = useCallback((name, value) => {
		const obj = {}
		obj[name] = value
		setModal((state) => ({ ...state, ...obj }))
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
					filter_data.selectdAYs = [academicYearId._id]
				}
				isFirstLoad.current = false
			}

			refreshListAndCloseDialog(null, filter_data)
		}
	}, [
		academicYears,
		sortKeys,
		currentPage,
		rowsPerPage,
		searchText,
		dispatch,
	])

	const isFirstLoad2 = useRef(true)
	useEffect(() => {
		if (!isFirstLoad2.current) {
			refreshListAndCloseDialog()
		}
		isFirstLoad2.current = false
	}, [selectChecklist])

	useEffect(() => {
		dispatch(getSchoolsList({}))
	}, [dispatch])

	return (
		<Box sx={counsellorStyles.pageContainerSx}>
			{/* Toolbar */}
			<Box sx={counsellorStyles.toolbarSx}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<TextField
						placeholder={localizationConstants.searchPalceholderForCOPE}
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
					<CustomAutocompleteNew
						sx={{ minWidth: '200px', height: '34px' }}
						fieldSx={{ height: '34px' }}
						value={selectChecklist}
						placeholder={`${localizationConstants.select} ${localizationConstants.sendChecklist}`}
						onChange={(e) => setSelectChecklist(e)}
						options={checklistOptions}
					/>
				</Box>

				<Box sx={counsellorStyles.actionButtonsSx}>
					<IconButton
						sx={counsellorStyles.filterButtonSx}
						onClick={() => handleModal('filter', true)}
					>
						<FilterListIcon sx={{ fontSize: 18, color: '#64748B' }} />
					</IconButton>

					<Button
						variant='outlined'
						startIcon={<BarChartIcon sx={{ fontSize: 16 }} />}
						sx={{
							...counsellorStyles.addButtonSx,
							borderColor: 'primary.main',
							color: 'primary.main',
							backgroundColor: 'transparent',
						}}
						onClick={() => {
							handleModal('analytics', true)
							dispatch(clearGrade_4_Marks())
							dispatch(clearGrade_9_Marks())
						}}
					>
						{localizationConstants.analytics}
					</Button>

					{appPermissions?.studentCheckList?.edit && (
						<Button
							variant='contained'
							endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
							sx={counsellorStyles.addButtonSx}
							onClick={handleMenuClick}
						>
							{localizationConstants.add}
						</Button>
					)}
				</Box>
			</Box>

			<SendChecklistTable
				key={selectChecklist}
				checkListData={checklistData}
				sortKeys={sortKeys}
				setSortKeys={setSortKeys}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
				rowsPerPage={rowsPerPage}
				setRowsPerPage={setRowsPerPage}
				columnsData={
					selectChecklist === checklistOptions?.[0]
						? Grade_4_TableColumns
						: Grade_9_TableColumns
				}
				isGrade_9={selectChecklist !== checklistOptions?.[0]}
				filterData={filterData}
				searchText={searchText}
				selectChecklist={selectChecklist}
				onEditChecklist={() => refreshListAndCloseDialog()}
			/>

			<UploadSendChecklist
				modal={modal}
				handleModal={handleModal}
				onUploadChecklist={() => refreshListAndCloseDialog()}
			/>

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
					fetchAllSendChecklist(
						dispatch,
						newFilterData,
						searchText,
						currentPage,
						rowsPerPage.value,
						selectChecklist,
						sortKeys,
					)
					handleModal('filter', false)
				}}
				defaultAccordions={['AYs', 'studentStatus']}
			/>

			<Menu
				id='menu'
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleMenuClose}
				sx={{ mt: '10px' }}
				PaperProps={{
					sx: { width: '172px', borderRadius: '10px' },
				}}
			>
				<MenuItem
					onClick={() => {
						handleModal('add', true)
						handleMenuClose()
					}}
				>
					<Typography>{addOptions?.[0]}</Typography>
				</MenuItem>

				<MenuItem
					onClick={() => {
						handleModal('upload', true)
						handleMenuClose()
					}}
				>
					<Typography>{addOptions?.[1]}</Typography>
				</MenuItem>
			</Menu>
			{modal.add && (
				<AddStduentChecklistDialog
					open={modal.add}
					onClose={() => handleModal('add', false)}
					onAddChecklist={() => refreshListAndCloseDialog('add')}
				/>
			)}
			{modal.analytics && (
				<SendChecklistAnalyticsDialog
					open={modal.analytics}
					onClose={() => handleModal('analytics', false)}
				/>
			)}
		</Box>
	)
}

export default SendCheckList
