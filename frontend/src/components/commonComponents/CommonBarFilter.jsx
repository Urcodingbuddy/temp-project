import { Typography } from '@mui/material'
import { Box } from '@mui/system'
import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useState,
} from 'react'
import { typographyConstants } from '../../resources/theme/typographyConstants'
import CustomAutocompleteNew from './CustomAutoComplete'
import { localizationConstants } from '../../resources/theme/localizationConstants'
import {
	clearAllStudentsForSchoolAction,
	clearListStudents,
	getAllClassrooms,
	getSchoolsList,
	listStudents,
	setClassroomsList,
	setSchoolsList,
	setSectionsList,
} from '../../redux/commonSlice'
import { getAcademicYearsList } from '../../utils/utils'
import { useDispatch, useSelector } from 'react-redux'
import { searchStudent } from '../../pages/initiations/individualCase/individualCaseFunctions'
import CustomAutoComplete from '../CustomAutoComplete'
import { selectAndPopulateStudents } from '../../pages/dashboard/dashboardFunctions'
import useDebounce from '../../customHooks/useDebounce'

export const initialBarFilterStates = {
	selectdAYs: '',
	selectdSchools: '',
	selectdClassrooms: [],
	selectdSections: '',
	selectedStudent: '',
	className: '',
	sectionName: '',
	searchText: '',
}

export const barFilterDropdowns = {
	academicYear: false,
	school: false,
	classroom: false,
	section: false,
	student: false,
	search: false,
}

const CommonBarFilter = forwardRef(
	(
		{
			barFilterData,
			setBarFilterData,
			setStudent,
			dropdownOptions = barFilterDropdowns,
			required = false,
			disabled = false,
		},
		ref,
	) => {
		const dispatch = useDispatch()
		const { academicYears } = useSelector(
			(store) => store.dashboardSliceSetup,
		)
		const {
			schoolsList,
			classroomsList,
			listStudentsData,
			allStudentsForSchoolActions,
		} = useSelector((state) => state.commonData)

		const [classSectionOptions, setClassSectionOptions] = useState({
			classrooms: [],
			sections: [],
		})
		const debouncedSearch = useDebounce(barFilterData.searchText, 1000)
		const [searchedStudentsData, setSearchedStudentsData] = useState([])

		const handleBarFilterData = (key, value) => {
			const obj = { [key]: value }

			if (key !== 'selectedStudent') {
				dispatch(clearListStudents()) // Clear the students list in redux
				dispatch(clearAllStudentsForSchoolAction())
			}

			if (key === 'selectdAYs') {
				dispatch(setSchoolsList([]))
				dispatch(setClassroomsList([]))
				dispatch(setSectionsList([]))
				dispatch(clearListStudents())
				obj['selectdSchools'] = ''
				obj['selectdClassrooms'] = []
				obj['selectdSections'] = ''
				obj['selectedStudent'] = ''
				obj['className'] = ''
				obj['sectionName'] = ''
				obj['searchText'] = ''
			} else if (key === 'selectdSchools') {
				dispatch(setClassroomsList([]))
				obj['selectdClassrooms'] = []
				obj['selectdSections'] = ''
				obj['selectedStudent'] = ''
				obj['className'] = ''
				obj['sectionName'] = ''
			} else if (key === 'selectdClassrooms' || key === 'className') {
				obj['selectdSections'] = ''
				obj['selectedStudent'] = ''
				obj['sectionName'] = ''
			} else if (key === 'selectdSections' || key === 'sectionName') {
				obj['selectedStudent'] = ''
			}

			setBarFilterData((state) => ({ ...state, ...obj }))
		}

		const fetchSchoolsList = () => {
			if (
				barFilterData.selectdAYs.length > 0 &&
				schoolsList.length === 0
			) {
				const body = {
					filter: { academicYear: [barFilterData.selectdAYs] },
				}
				dispatch(getSchoolsList({ body }))
			}
		}

		const fetchClassroomsList = () => {
			if (
				barFilterData.selectdSchools &&
				barFilterData.selectdSchools?.length > 0 &&
				classroomsList.length === 0
			) {
				dispatch(
					getAllClassrooms({
						body: {
							filter: {
								academicYear: [barFilterData.selectdAYs],
								schoolIds: [barFilterData.selectdSchools],
							},
						},
					}),
				)
			}
		}

		const fetchStudentsList = () => {
			if (
				barFilterData.selectdSections &&
				barFilterData.selectdSections?.length > 0 &&
				listStudentsData.length === 0
			) {
				dispatch(
					listStudents({
						body: {
							filter: {
								schoolIds: [barFilterData.selectdSchools],
								classroomIds: barFilterData.selectdClassrooms,
							},
						},
					}),
				)
			}
		}

		const handleClassOptions = () => {
			const list = []
			for (const classroom of classroomsList) {
				if (!list.includes(classroom.className)) {
					list.push(classroom.className)
				}
			}
			setClassSectionOptions((state) => ({ ...state, classrooms: list }))
		}

		const handleSectionOptions = (selectedClasses = null) => {
			const list = []
			if (!selectedClasses) {
				selectedClasses = barFilterData.selectdClassrooms
			}

			for (const classroom of classroomsList) {
				if (selectedClasses?.length > 0) {
					if (
						!list.includes(classroom.section) &&
						selectedClasses.includes(classroom._id)
					) {
						list.push(classroom.section)
					}
				} else {
					if (!list.includes(classroom.section)) {
						list.push(classroom.section)
					}
				}
			}
			setClassSectionOptions((state) => ({ ...state, sections: list }))
		}

		const handleClassrooms = (e) => {
			const classroom = classroomsList
				.filter((obj) => e === obj.className)
				.map((obj) => obj._id)
			handleBarFilterData('selectdClassrooms', classroom)
			handleBarFilterData('className', e ? e : '')
			handleSectionOptions(classroom)
		}

		const handleSections = (e) => {
			if (e) {
				const classroom = classroomsList
					.filter(
						(obj) =>
							barFilterData.className === obj.className &&
							e === obj.section,
					)
					.map((obj) => obj._id)
				handleBarFilterData('selectdClassrooms', classroom)
			} else {
				const classroom = classroomsList
					.filter((obj) => barFilterData.className === obj.className)
					.map((obj) => obj._id)
				handleBarFilterData('selectdClassrooms', classroom)
			}
			handleBarFilterData('selectdSections', e ? e : '')
			handleBarFilterData('sectionName', e ? e : '')
		}

		useEffect(() => {
			handleClassOptions()
		}, [classroomsList])

		useEffect(() => {
			if (!barFilterData.selectdSections) {
				handleSectionOptions()
			}
		}, [classroomsList, barFilterData.selectdClassrooms])

		useEffect(() => {
			if (dropdownOptions.search) {
				if (debouncedSearch?.length >= 3) {
					const body = {
						searchText: debouncedSearch,
						academicYear: barFilterData.selectdAYs,
					}
					searchStudent(dispatch, body, setSearchedStudentsData)
				}
				if (debouncedSearch.length === 0) {
					setSearchedStudentsData([])
				}
			}
		}, [debouncedSearch, dispatch])

		const clearAllListOptions = () => {
			dispatch(setClassroomsList([]))
			dispatch(setSectionsList([]))
			setClassSectionOptions({})
			dispatch(clearListStudents())
			dispatch(clearAllStudentsForSchoolAction())
		}
		useImperativeHandle(ref, () => ({
			clearAllListOptions,
		}))

		return (
			<Box
				sx={{
					display: 'flex',
					gap: '10px',
					width: '100%',
					// alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				<Box sx={{ width: '16%' }}>
					<Typography
						variant={typographyConstants.body}
						sx={{ mb: '4px', display: 'flex' }}
					>
						{localizationConstants.academicYear}
						{required && (
							<Typography sx={{ color: 'red', pl: '2px' }}>
								*
							</Typography>
						)}
					</Typography>
					<CustomAutocompleteNew
						fieldSx={{ height: '44px' }}
						value={barFilterData.selectdAYs}
						placeholder={`${localizationConstants.select} ${localizationConstants.academicYear}`}
						onChange={(e) => handleBarFilterData('selectdAYs', e)}
						options={getAcademicYearsList(academicYears) || []}
						disabled={disabled}
					/>
				</Box>

				<Box sx={{ width: '82%' }}>
					{dropdownOptions.search && (
						<>
							<Box sx={{ width: '100%' }}>
								<Typography
									variant={typographyConstants.body}
									sx={{
										mb: '4px',
										display: 'flex',
										visibility: 'hidden',
									}}
								>
									Search Label Placeholder
								</Typography>
								<CustomAutoComplete
									options={
										searchedStudentsData?.data
											? searchedStudentsData?.data.map(
													(data) => ({
														label: data?.studentName,
														val: data?._id,
													}),
												)
											: searchedStudentsData
									}
									placeholder={
										localizationConstants.searchStudent
									}
									value={barFilterData.searchText}
									onChange={(newValue) => {
										selectAndPopulateStudents(
											dispatch,
											newValue,
											allStudentsForSchoolActions,
											barFilterData,
											setBarFilterData,
											setStudent,
										)
									}}
									onInputChange={(e) =>
										handleBarFilterData(
											'searchText',
											e.target.value,
										)
									}
								/>
							</Box>

							<Box
								sx={{
									display: 'flex',
									justifyContent: 'center',
									width: '100%',
									my: '10px',
								}}
							>
								<Typography
									variant={typographyConstants.body}
									sx={{ mb: '4px', display: 'flex' }}
								>
									{localizationConstants.orText}
								</Typography>
							</Box>
						</>
					)}

					<Box
						sx={{
							display: 'flex',
							flexWrap: 'wrap',
							gap: '10px',
							width: '100%',
						}}
					>
						{/* -----------Schools----------- */}
						{dropdownOptions.school && (
							<Box
								sx={{
									flexBasis: `calc(${dropdownOptions.student ? '25' : '33.5'}% - 10px)`,
									flexGrow: 0,
									flexShrink: 0,
								}}
							>
								<Typography
									variant={typographyConstants.body}
									sx={{
										mb: '4px',
										display: 'flex',
									}}
								>
									{localizationConstants.school}{' '}
									{required && (
										<Typography
											sx={{ color: 'red', pl: '2px' }}
										>
											*
										</Typography>
									)}
								</Typography>
								<CustomAutocompleteNew
									sx={{}}
									fieldSx={{ height: '44px' }}
									value={barFilterData.selectdSchools}
									onClick={fetchSchoolsList}
									placeholder={`${localizationConstants.select} ${localizationConstants.school}`}
									onChange={(e) => {
										handleBarFilterData('selectdSchools', e)
									}}
									options={
										schoolsList.map((obj) => ({
											label: obj.school,
											id: obj._id,
										})) || []
									}
									disabled={disabled}
								/>
							</Box>
						)}

						{/* -----------Classrooms---------- */}
						{dropdownOptions.classroom && (
							<Box
								sx={{
									flexBasis: `calc(${dropdownOptions.student ? '25' : '33.5'}% - 10px)`,
									flexGrow: 0,
									flexShrink: 0,
								}}
							>
								<Typography
									variant={typographyConstants.body}
									sx={{
										mb: '4px',
										display: 'flex',
									}}
								>
									{localizationConstants.ClassCamel}{' '}
									{required && (
										<Typography
											sx={{ color: 'red', pl: '2px' }}
										>
											*
										</Typography>
									)}
								</Typography>
								<CustomAutocompleteNew
									sx={{}}
									fieldSx={{ height: '44px' }}
									value={barFilterData.className}
									placeholder={`${localizationConstants.select} ${localizationConstants.ClassCamel}`}
									onChange={handleClassrooms}
									onClick={fetchClassroomsList}
									options={classSectionOptions.classrooms}
									disabled={disabled}
								/>
							</Box>
						)}

						{/* ----------Sections----------- */}
						{dropdownOptions.section && (
							<Box
								sx={{
									flexBasis: `calc(${dropdownOptions.student ? '25' : '33.5'}% - 10px)`,
									flexGrow: 0,
									flexShrink: 0,
								}}
							>
								<Typography
									variant={typographyConstants.body}
									sx={{
										mb: '4px',
										display: 'flex',
									}}
								>
									{localizationConstants.section}{' '}
									{required && (
										<Typography
											sx={{ color: 'red', pl: '2px' }}
										>
											*
										</Typography>
									)}
								</Typography>
								<CustomAutocompleteNew
									sx={{}}
									fieldSx={{ height: '44px' }}
									value={barFilterData.sectionName}
									placeholder={`${localizationConstants.select} ${localizationConstants.section}`}
									onChange={handleSections}
									options={
										// barFilterData.className !== ''
										// 	?
										classSectionOptions.sections
										// : []
									}
									disabled={disabled}
								/>
							</Box>
						)}

						{/* -----------Students------------ */}
						{dropdownOptions.student && (
							<Box
								sx={{
									flexBasis: `calc(25% - 10px)`,
									flexGrow: 0,
									flexShrink: 0,
								}}
							>
								<Typography
									variant={typographyConstants.body}
									sx={{
										mb: '4px',
										display: 'flex',
									}}
								>
									{localizationConstants.student}{' '}
									{required && (
										<Typography
											sx={{ color: 'red', pl: '2px' }}
										>
											*
										</Typography>
									)}
								</Typography>
								<CustomAutocompleteNew
									sx={{}}
									fieldSx={{ height: '44px' }}
									value={barFilterData.selectedStudent}
									placeholder={`${localizationConstants.select} ${localizationConstants.student}`}
									onChange={(e) => {
										handleBarFilterData(
											'selectedStudent',
											e,
										)
										const student = listStudentsData.find(
											(obj) => obj._id === e,
										)
										setStudent(student)
									}}
									onClick={fetchStudentsList}
									options={listStudentsData.map((obj) => ({
										label: obj.studentName,
										id: obj._id,
									}))}
									disabled={disabled}
								/>
							</Box>
						)}
					</Box>
				</Box>
			</Box>
		)
	},
)

export default CommonBarFilter
