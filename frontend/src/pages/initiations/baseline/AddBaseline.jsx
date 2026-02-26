import React, {
	useEffect,
	useState,
	useRef,
	useImperativeHandle,
	forwardRef,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	Box,
	Typography,
	FormControl,
	FormControlLabel,
	Radio,
	RadioGroup,
	Divider,
} from '@mui/material'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import useCommonStyles from '../../../components/styles'
import {
	handleInputsInitiations,
	searchStudent,
} from './../individualCase/individualCaseFunctions'
import { requestParams } from '../../../utils/apiConstants'
import useDebounce from '../../../customHooks/useDebounce'
import {
	classGroups,
	generateBaselineFormData,
	categories,
	initialDropdownStates,
	baselineCategory,
} from './baselineConstants'
import CustomCollapsibleComponent from '../../../components/CustomCollapsibleComponent'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import {
	getBackgroundColor,
	handleAddBaselineRecord,
} from './baselineFunctions'
import {
	delay,
	getCurrentAcademicYearId,
	getUserFromLocalStorage,
} from '../../../utils/utils'
import CommonBarFilter, {
	initialBarFilterStates,
} from '../../../components/commonComponents/CommonBarFilter'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'

const testInValid = [undefined, null, '']
const AddBaseline = forwardRef(
	(
		{ onAddBaseline, onSaveStateChange, clearOptionsRef, handleClose },
		ref,
	) => {
		const flexStyles = useCommonStyles()
		const dispatch = useDispatch()
		const { schoolsList, classroomsListForStudents } = useSelector(
			(store) => store.commonData,
		)
		const { academicYears } = useSelector(
			(store) => store.dashboardSliceSetup,
		)

		const [baselineFormData, setBaselineFormData] = useState({})
		const [selectedDropdownData, setSelectedDropdownData] = useState({
			...initialDropdownStates,
		})
		const [sectionOptions, setSectionOptions] = useState([])

		const [searchValue, setSearchValue] = useState('')
		const debouncedSearch = useDebounce(searchValue, 1000)
		const [stSearchData, setStSearchData] = useState([])
		const [student, setStudent] = useState({})
		const [boolStats, setBoolStats] = useState({
			Physical: true,
			Social: true,
			Emotional: true,
			Cognitive: true,
			Language: true,
		})
		const [barFilterData, setBarFilterData] = useState(
			initialBarFilterStates,
		)
		const handleBoolStats = (name, stat) => {
			const obj = {}
			obj[name] = stat
			setBoolStats((state) => ({ ...state, ...obj }))
		}

		const handleBaselineFormData = (category, index, status) => {
			const formaData = { ...baselineFormData }
			formaData[category]['data'][index]['status'] = status
			formaData[category]['total'] = formaData[category]['data']?.filter(
				(dt) => dt?.status === true,
			)?.length
			setBaselineFormData(formaData)
		}
		console.log(baselineFormData)
		const isInitialLoad = useRef(true)
		const populateAcademicYear = async () => {
			if (academicYears.length > 0 && isInitialLoad.current) {
				const currentAYId = getCurrentAcademicYearId(academicYears)
				if (currentAYId) {
					await delay()
					setBarFilterData((prev) => ({
						...prev,
						selectdAYs: currentAYId,
					}))
				}
				isInitialLoad.current = false
			}
		}

		const handleSaveClick = () => {
			handleAddBaselineRecord(
				dispatch,
				baselineFormData,
				student,
				selectedDropdownData,
				onAddBaseline,
				barFilterData,
				handleClose,
			)
		}

		const isSaveDisabled =
			testInValid.includes(student?.studentName) ||
			testInValid.includes(student?.user_id) ||
			testInValid.includes(student?.school) ||
			selectedDropdownData?.baselineFrom?.length === 0 ||
			selectedDropdownData?.baselineCategory?.length === 0 ||
			barFilterData?.selectedStudent === '' ||
			barFilterData?.selectedStudent === null

		useImperativeHandle(ref, () => ({
			handleSaveClick,
			isSaveDisabled,
		}))

		useEffect(() => {
			onSaveStateChange(isSaveDisabled)
		}, [isSaveDisabled])

		useEffect(() => {
			if (debouncedSearch?.length >= 3) {
				const body = {
					[requestParams.searchText]: debouncedSearch,
					academicYear: barFilterData.selectdAYs,
				}
				searchStudent(dispatch, body, setStSearchData)
			}
			if (debouncedSearch.length === 0) {
				setStSearchData([])
			}
		}, [debouncedSearch])

		useEffect(() => {
			if (selectedDropdownData?.classrooms?.length > 0) {
				const filteredSections = classroomsListForStudents
					.filter((classroom) =>
						selectedDropdownData?.classrooms?.includes(
							classroom.className,
						),
					)
					.map((classroom) => classroom.section)
				setSectionOptions(filteredSections)
			}
		}, [selectedDropdownData?.classrooms, classroomsListForStudents])

		const user = getUserFromLocalStorage()
		const isTeacher = user?.permissions[0] === 'Teacher'

		//  // Automatically select the school for teachers if not already set
		useEffect(() => {
			if (isTeacher) {
				const selectedSchool = schoolsList[0]?._id
				if (
					selectedSchool &&
					!selectedDropdownData.schools.includes(selectedSchool)
				) {
					// Update only the schools key while preserving other state values
					setSelectedDropdownData((prevData) => ({
						...prevData,
						schools: [selectedSchool],
					}))
				}
			}
		}, [isTeacher, schoolsList, selectedDropdownData.schools])

		useEffect(() => {
			populateAcademicYear()
		}, [])

		return (
			<Box
				sx={{
					mt: '10px',
				}}
			>
				<Box sx={{ mt: '24px' }}>
					<CommonBarFilter
						barFilterData={barFilterData}
						setBarFilterData={setBarFilterData}
						isStudentRequired={true}
						setStudent={setStudent}
						dropdownOptions={{
							academicYear: true,
							school: true,
							classroom: true,
							section: true,
							student: true,
							search: true,
						}}
						ref={clearOptionsRef}
					/>
				</Box>

				{/* ------------------ Schools ------------------ */}
				<Box
					className={flexStyles.flexRowCenterSpaceBetween}
					sx={{ mt: '24px', width: '100%' }}
					gap={'10px'}
				>
					{/* ------------------ Baseline Form ------------------ */}
					<Box sx={{ width: '50%' }}>
						<Typography variant={typographyConstants.body}>
							{localizationConstants.baselineForm}
						</Typography>
						<CustomAutocompleteNew
							options={Object.entries(classGroups).map((opt) => {
								const [id, label] = opt
								return { id, label }
							})}
							sx={{ flexGrow: 1, width: '100%' }}
							fieldSx={{ height: '44px' }}
							placeholder={`${localizationConstants.select} ${localizationConstants.baselineForm}`}
							multiple={false}
							value={selectedDropdownData.baselineFrom}
							onChange={(e) => {
								handleInputsInitiations(
									{
										target: {
											value: e,
											name: 'baselineFrom',
										},
									},
									setSelectedDropdownData,
									selectedDropdownData,
								)
								generateBaselineFormData(e, setBaselineFormData)
							}}
						/>
					</Box>

					{/* ------------------ Baseline category ------------------ */}
					<Box sx={{ width: '50%' }}>
						<Typography variant={typographyConstants.body}>
							{localizationConstants.baselineCategory}
						</Typography>
						<CustomAutocompleteNew
							options={baselineCategory}
							sx={{ flexGrow: 1, width: '100%' }}
							fieldSx={{ height: '44px' }}
							placeholder={`${localizationConstants.select} ${localizationConstants.baselineCategory}`}
							multiple={false}
							value={selectedDropdownData?.baselineCategory}
							onChange={(e) => {
								handleInputsInitiations(
									{
										target: {
											value: e,
											name: 'baselineCategory',
										},
									},
									setSelectedDropdownData,
									selectedDropdownData,
								)
							}}
						/>
					</Box>
				</Box>

				{/* ------------------ Add Baseline Form ------------------ */}
				<Box sx={{ mt: '30px' }}>
					{categories.map((category) => (
						<Box sx={{ mt: '24px' }}>
							<CustomCollapsibleComponent
								open={boolStats[category]}
								title={category}
								titleRightSide={
									!testInValid.includes(
										baselineFormData[category]?.total,
									) && !boolStats[category] ? (
										<Typography
											variant={typographyConstants.body}
											sx={{
												fontSize: '16px',
												color: getBackgroundColor(
													baselineFormData[category]
														?.total,
												),
												mr: '40px',
											}}
										>
											{`${localizationConstants.total} = ${baselineFormData[category]?.total}`}
										</Typography>
									) : (
										''
									)
								}
								onClick={() =>
									handleBoolStats(
										category,
										!boolStats[category],
									)
								}
							>
								{baselineFormData[category]?.data &&
									baselineFormData[category]?.data.map(
										(categData, index) => {
											return (
												<Box
													sx={{ mb: '28px' }}
													key={index}
												>
													<Box
														sx={{
															display: 'flex',
															justifyContent:
																'flex-start',
														}}
													>
														<Typography
															variant={
																typographyConstants.h5
															}
															sx={{
																minWidth:
																	'20px',
															}}
														>
															{`${index + 1}.`}
														</Typography>
														<Typography
															variant={
																typographyConstants.h5
															}
														>
															{`${localizationConstants.baselineQns[categData.question]}`}
														</Typography>
													</Box>
													<FormControl
														sx={{
															mt: '24px',
															pl: '20px',
														}}
													>
														<RadioGroup
															row
															aria-labelledby='demo-row-radio-buttons-group-label'
															name='row-radio-buttons-group'
														>
															<FormControlLabel
																value='Yes'
																control={
																	<Radio
																		onClick={() =>
																			handleBaselineFormData(
																				category,
																				index,
																				true,
																			)
																		}
																		checked={
																			categData.status ===
																			true
																		}
																	/>
																}
																label='Yes'
															/>
															<FormControlLabel
																value='No'
																control={
																	<Radio
																		onClick={() =>
																			handleBaselineFormData(
																				category,
																				index,
																				false,
																			)
																		}
																		checked={
																			categData.status ===
																			false
																		}
																	/>
																}
																label='No'
															/>
														</RadioGroup>
													</FormControl>
												</Box>
											)
										},
									)}

								{!testInValid.includes(
									baselineFormData[category]?.total,
								) &&
									boolStats[category] && (
										<Box sx={{ pb: '16px' }}>
											<Divider sx={{ mb: '10px' }} />
											<Typography
												variant={
													typographyConstants.body
												}
												sx={{
													fontSize: '16px',
													color: getBackgroundColor(
														baselineFormData[
															category
														]?.total,
													),
													float: 'right',
												}}
											>
												{`${localizationConstants.total} = ${baselineFormData[category]?.total}`}
											</Typography>
										</Box>
									)}
							</CustomCollapsibleComponent>
						</Box>
					))}
				</Box>
			</Box>
		)
	},
)

export default AddBaseline
