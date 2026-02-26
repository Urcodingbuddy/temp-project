/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSchoolsList } from '../../../redux/commonSlice'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import {
	Box,
	TextField,
	InputAdornment,
	IconButton,
	Button,
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import debounce from 'lodash.debounce'

import IEPTableList from './IEPTableList'
import {
	initialAccordionStates,
	initialFilterStates,
} from '../../../components/commonComponents/CustomFilter'
import { fetchAllStudentIEP } from './iEPFunctions'
import CommonFilterDrawer from '../../../components/commonComponents/CustomFilter'
import { getCurACYear, sortEnum } from '../../../utils/utils'
import AddIEPDialog from './AddIEPDialog'
import { counsellorStyles } from '../../counsellors/counsellorsStyles'

const StudentIEP = () => {
	const dispatch = useDispatch()
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const { appPermissions } = useSelector((store) => store.dashboardSliceSetup)
	const { IEPviewAllData } = useSelector((store) => store.StudentIEP)
	const [sortKeys, setSortKeys] = useState([{ key: 'createdAt', value: sortEnum.desc }])
	const [modal, setModal] = useState({
		add: false,
		edit: false,
		upload: false,
		filter: false,
		delete: false,
	})
	const [currentPage, setCurrentPage] = useState(1)
	const [rowsPerPage, setRowsPerPage] = useState({
		text: '150',
		value: 150,
	})
	const [filterData, setFilterData] = useState(initialFilterStates)
	const [searchText, setSearchText] = useState('')
	const [searchInputValue, setSearchInputValue] = useState('')

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

	const refreshListAndCloseDialog = (type) => {
		if (type === 'add') {
			handleModal('add', false)
		} else if (type === 'edit') {
			handleModal('edit', false)
		}

		fetchAllStudentIEP(
			dispatch,
			filterData,
			searchText,
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

			fetchAllStudentIEP(
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
				</Box>

				<Box sx={counsellorStyles.actionButtonsSx}>
					<IconButton
						sx={counsellorStyles.filterButtonSx}
						onClick={() => handleModal('filter', true)}
					>
						<FilterListIcon sx={{ fontSize: 18, color: '#64748B' }} />
					</IconButton>

					{appPermissions?.['student-IEP']?.edit && (
						<Button
							variant='contained'
							startIcon={<AddIcon sx={{ fontSize: 16 }} />}
							sx={counsellorStyles.addButtonSx}
							onClick={() => handleModal('add', true)}
						>
							{localizationConstants.add}
						</Button>
					)}
				</Box>
			</Box>

			<IEPTableList
				allStudentsForspecificSchool={IEPviewAllData}
				sortKeys={sortKeys}
				setSortKeys={setSortKeys}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
				rowsPerPage={rowsPerPage}
				setRowsPerPage={setRowsPerPage}
				searchText={searchText}
				filterData={filterData}
				refreshListAndCloseDialog={() =>
					refreshListAndCloseDialog('edit')
				}
				modal={modal}
				handleModal={handleModal}
			/>

			{modal.add && (
				<AddIEPDialog
					open={modal.add}
					onClose={() => {
						handleModal('add', false)
					}}
					refreshListAndCloseDialog={() =>
						refreshListAndCloseDialog('add')
					}
				/>
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
					fetchAllStudentIEP(
						dispatch,
						newFilterData,
						searchText,
						currentPage,
						rowsPerPage.value,
						sortKeys,
					)
					handleModal('filter', false)
				}}
				defaultAccordions={['AYs', 'studentStatus']}
			/>
		</Box>
	)
}

export default StudentIEP
