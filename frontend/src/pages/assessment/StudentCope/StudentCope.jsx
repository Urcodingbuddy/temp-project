import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import {
	Box,
	TextField,
	InputAdornment,
	IconButton,
	Button,
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import UploadIcon from '@mui/icons-material/Upload'
import SearchIcon from '@mui/icons-material/Search'
import BarChartIcon from '@mui/icons-material/BarChart'
import debounce from 'lodash.debounce'

import { fetchStudentCopeAssessment } from './StudentCopeFunction'
import { sortkeysStudentList } from './StudentCopeConstants'
import UploadStudentCope from './UploadStudentCope'
import StudentCOPEStudentsList from './StudentList'
import {
	initialAccordionStates,
	initialFilterStates,
} from '../../../components/commonComponents/CustomFilter'
import CommonFilterDrawer from '../../../components/commonComponents/CustomFilter'
import { getCurACYear } from '../../../utils/utils'
import StudentCopeAnalytics from './StudentCopeAnalytics'
import { counsellorStyles } from '../../counsellors/counsellorsStyles'

const StudentCope = () => {
	const location = useLocation()
	const dispatch = useDispatch()
	const { appPermissions } = useSelector((store) => store.dashboardSliceSetup)
	const { studentCopeAssessment } = useSelector((store) => store.studentCope)
	const [sortKeys, setSortKeys] = useState([...sortkeysStudentList])
	const [filterData, setFilterData] = useState(initialFilterStates)
	const [searchText, setSearchText] = useState('')
	const [searchInputValue, setSearchInputValue] = useState('')
	const [modal, setModal] = useState({
		upload: false,
		filter: false,
		edit: false,
		analytics: false,
	})
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const [currentPage, setCurrentPage] = useState(1)
	const [rowsPerPage, setRowsPerPage] = useState({
		text: '150',
		value: 150,
	})

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

	const refreshList = (type, filter_data, search_text) => {
		if (type) {
			handleModal(type, false)
		}
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
		fetchStudentCopeAssessment(
			dispatch,
			filter_data ?? newFilterData,
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
			refreshList(null, filter_data, null)
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
		if (location.state?.analytics) {
			handleModal('analytics', true)
		}
	}, [location.state])

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
				</Box>

				<Box sx={counsellorStyles.actionButtonsSx}>
					<Button
						variant='text'
						startIcon={<BarChartIcon sx={{ fontSize: 16 }} />}
						sx={{
							textTransform: 'none',
							color: '#3B82F6',
							fontWeight: 500,
							fontSize: '13px',
						}}
						onClick={() => handleModal('analytics', true)}
					>
						{localizationConstants.copeAnalytics}
					</Button>

					<IconButton
						sx={counsellorStyles.filterButtonSx}
						onClick={() => handleModal('filter', true)}
					>
						<FilterListIcon sx={{ fontSize: 18, color: '#64748B' }} />
					</IconButton>

					{appPermissions?.StudentCopeManagement?.edit && (
						<Button
							variant='contained'
							startIcon={<UploadIcon sx={{ fontSize: 16 }} />}
							sx={counsellorStyles.addButtonSx}
							onClick={() => handleModal('upload', true)}
						>
							{localizationConstants.bulkUpload}
						</Button>
					)}
				</Box>
			</Box>

			<StudentCOPEStudentsList
				allStudentsForspecificSchool={studentCopeAssessment}
				sortKeys={sortKeys}
				setSortKeys={setSortKeys}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
				rowsPerPage={rowsPerPage}
				setRowsPerPage={setRowsPerPage}
				searchText={searchText}
				filterData={filterData}
				modal={modal}
				handleModal={handleModal}
				refreshList={refreshList}
			/>

			<UploadStudentCope
				modal={modal}
				handleModal={handleModal}
				refreshList={refreshList}
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
					refreshList('filter')
				}}
				defaultAccordions={['AYs', 'studentStatus']}
			/>

			{modal.analytics && (
				<StudentCopeAnalytics
					open={modal.analytics}
					onClose={() => handleModal('analytics', false)}
				/>
			)}
		</Box>
	)
}

export default StudentCope
