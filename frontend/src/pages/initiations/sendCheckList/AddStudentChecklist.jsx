import React, {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import {
	Grade_4_Questions,
	Grade_9_Questions,
	checklistOptions,
} from './sendCheckListConstants'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Typography } from '@mui/material'
import QuestionsCollapsibleComponent from '../../../components/QuestionsCollapsibleComponent'
import useCommonStyles from '../../../components/styles'
import { handleAddChecklist, handleOptionChange } from './sendChecklistFunction'
import useDebounce from '../../../customHooks/useDebounce'
import { requestParams } from '../../../utils/apiConstants'
import {
	handleInputsInitiations,
	searchStudent,
} from '../individualCase/individualCaseFunctions'

import CommonBarFilter, {
	initialBarFilterStates,
} from '../../../components/commonComponents/CommonBarFilter'
import { delay, getCurrentAcademicYearId } from '../../../utils/utils'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'
import { typographyConstants } from '../../../resources/theme/typographyConstants'

const AddStudentChecklist = forwardRef(
	(
		{ onAddChecklist, onSaveStateChange, clearOptionsRef, handleClose },
		ref,
	) => {
		const flexStyles = useCommonStyles()
		const { Grade_9_Marks, Grade_4_Marks } = useSelector(
			(store) => store.sendChecklist,
		)
		const dispatch = useDispatch()
		const { academicYears } = useSelector(
			(store) => store.dashboardSliceSetup,
		)
		const [stSearchData, setStSearchData] = useState([])
		const [disable, setDisable] = useState(false)
		const [selectedDropdownData, setSelectedDropdownData] = useState({
			schools: [],
			classrooms: [],
			sections: [],
			students: [],
			checklist: [],
		})
		const [searchValue, setSearchValue] = useState('')
		const debouncedSearch = useDebounce(searchValue, 1000)
		const [barFilterData, setBarFilterData] = useState(
			initialBarFilterStates,
		)
		const [student, setStudent] = useState({})
		const [modal, setModal] = useState({
			set1: false,
			set2: false,
			set3: false,
			set4: false,
			set5: false,
		})

		const handleModal = useCallback((name, value) => {
			const obj = {}
			obj[name] = value
			setModal((state) => ({ ...state, ...obj }))
		}, [])

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

		useEffect(() => {
			if (debouncedSearch?.length >= 3) {
				const body = {
					[requestParams.searchText]: debouncedSearch,
					academicYear: barFilterData.selectdAYs,
				}
				searchStudent(dispatch, body, setStSearchData)
			} else {
				setStSearchData([])
			}
			if (debouncedSearch.length === 0) {
				setStSearchData([])
			}
		}, [debouncedSearch])

		const handleSaveClick = () => {
			handleAddChecklist(
				student?.user_id ?? '',
				selectedDropdownData?.checklist,
				selectedDropdownData?.checklist?.[0] === checklistOptions?.[0]
					? Grade_4_Questions(Grade_4_Marks)
					: Grade_9_Questions(Grade_9_Marks),
				dispatch,
				barFilterData,
				onAddChecklist,
				handleClose,
			)
		}

		useImperativeHandle(ref, () => ({
			handleSaveClick,
			disable,
		}))

		useEffect(() => {
			populateAcademicYear()
		}, [])

		useEffect(() => {
			onSaveStateChange(disable)
		}, [disable])

		useEffect(() => {
			const disable =
				!barFilterData.selectedStudent ||
				selectedDropdownData.checklist.length === 0 ||
				!selectedDropdownData.checklist[0]
			setDisable(disable)
		}, [
			student,
			selectedDropdownData.checklist,
			barFilterData.selectedStudent,
		])

		return (
			<Box
				className={flexStyles.flexColumn}
				sx={{ position: 'relative' }}
				gap={'20px'}
			>
				{/* <Box
					className={flexStyles.flexRowCenterSpaceBetween}
					gap={'16px'}
					sx={{ width: '100%', flexGrow: 1 }}
				>
					<Box sx={{ flexGrow: 1, pt: '28px' }}>
						<CustomAutoComplete
							options={
								stSearchData?.data
									? stSearchData?.data?.map((data) => ({
											label: data?.studentName,
											val: data?._id,
										}))
									: []
							}
							placeholder={localizationConstants.searchStudent}
							value={searchValue}
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
							onInputChange={(e) => {
								setSearchValue(e.target.value)
							}}
							styles={{ height: '48px' }}
							sx={{ width: '100%' }}
						/>
					</Box>
				</Box> */}
				{/* ------------------ Schools ------------------ */}

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

				<Box sx={{ width: '16%', position: 'absolute', top: '120px' }}>
					<Typography
						variant={typographyConstants.body}
						sx={{
							mb: '2px',
							display: 'flex',
						}}
					>
						{localizationConstants.sendChecklistForm}
					</Typography>
					<CustomAutocompleteNew
						options={checklistOptions}
						value={selectedDropdownData.checklist?.[0] ?? null} // Since it's string array, directly use the string
						onChange={(selectedVal) => {
							if (
								selectedVal !==
								selectedDropdownData?.checklist?.[0]
							) {
								setModal({
									set1: false,
									set2: false,
									set3: false,
									set4: false,
									set5: false,
								})
							}

							handleInputsInitiations(
								{
									target: {
										value: [selectedVal],
										name: 'checklist',
									},
								},
								setSelectedDropdownData,
								selectedDropdownData,
								dispatch,
								selectedDropdownData?.schools,
								selectedDropdownData?.classrooms,
							)
						}}
						sx={{ width: '100%' }}
						fieldSx={{ height: '44px' }}
						placeholder='Select'
						multiple={false}
					/>
				</Box>

				{selectedDropdownData?.checklist?.length > 0 ? (
					<Box className={flexStyles.flexColumn} gap={'30px'}>
						<QuestionsCollapsibleComponent
							open={modal?.set1}
							onClick={() => handleModal('set1', !modal?.set1)}
							questionList={
								selectedDropdownData?.checklist?.[0] ===
								checklistOptions?.[0]
									? Grade_4_Questions(Grade_4_Marks)?.[
											localizationConstants.attention
										]
									: Grade_9_Questions(Grade_9_Marks)?.[
											localizationConstants
												.attentionHyperactivity
										]
							}
							isEditable={true}
							isCollapsable={true}
							qusetionChange={(
								index,
								option,
								mainTitle,
								subQuestions,
								subTitle,
							) =>
								handleOptionChange(
									index,
									option,
									mainTitle,
									subQuestions,
									subTitle,
									selectedDropdownData?.checklist?.[0] !==
										checklistOptions?.[0],
									Grade_4_Marks,
									dispatch,
									Grade_9_Marks,
								)
							}
						/>
						<QuestionsCollapsibleComponent
							open={modal?.set2}
							onClick={() => handleModal('set2', !modal?.set2)}
							questionList={
								selectedDropdownData?.checklist?.[0] ===
								checklistOptions?.[0]
									? Grade_4_Questions(Grade_4_Marks)?.[
											localizationConstants
												.fineMotorGrossMotorSkill
										]
									: Grade_9_Questions(Grade_9_Marks)?.[
											localizationConstants
												.fineMotorGrossMotorSkillPGC
										]
							}
							isEditable={true}
							isCollapsable={true}
							qusetionChange={(
								index,
								option,
								mainTitle,
								subQuestions,
								subTitle,
							) =>
								handleOptionChange(
									index,
									option,
									mainTitle,
									subQuestions,
									subTitle,
									selectedDropdownData?.checklist?.[0] !==
										checklistOptions?.[0],
									Grade_4_Marks,
									dispatch,
									Grade_9_Marks,
								)
							}
						/>
						<QuestionsCollapsibleComponent
							open={modal?.set3}
							onClick={() => handleModal('set3', !modal?.set3)}
							questionList={
								selectedDropdownData?.checklist?.[0] ===
								checklistOptions?.[0]
									? Grade_4_Questions(Grade_4_Marks)?.[
											localizationConstants.cognitive
										]
									: Grade_9_Questions(Grade_9_Marks)?.[
											localizationConstants.memory
										]
							}
							isEditable={true}
							isCollapsable={true}
							qusetionChange={(
								index,
								option,
								mainTitle,
								subQuestions,
								subTitle,
							) =>
								handleOptionChange(
									index,
									option,
									mainTitle,
									subQuestions,
									subTitle,
									selectedDropdownData?.checklist?.[0] !==
										checklistOptions?.[0],
									Grade_4_Marks,
									dispatch,
									Grade_9_Marks,
								)
							}
						/>
						<QuestionsCollapsibleComponent
							open={modal?.set4}
							onClick={() => handleModal('set4', !modal?.set4)}
							questionList={
								selectedDropdownData?.checklist?.[0] ===
								checklistOptions?.[0]
									? Grade_4_Questions(Grade_4_Marks)?.[
											localizationConstants.behavior
										]
									: Grade_9_Questions(Grade_9_Marks)?.[
											localizationConstants.cognitive
										]
							}
							isEditable={true}
							isCollapsable={true}
							qusetionChange={(
								index,
								option,
								mainTitle,
								subQuestions,
								subTitle,
							) =>
								handleOptionChange(
									index,
									option,
									mainTitle,
									subQuestions,
									subTitle,
									selectedDropdownData?.checklist?.[0] !==
										checklistOptions?.[0],
									Grade_4_Marks,
									dispatch,
									Grade_9_Marks,
								)
							}
						/>
						{selectedDropdownData?.checklist?.[0] !==
						checklistOptions?.[0] ? (
							<QuestionsCollapsibleComponent
								key={selectedDropdownData.checklist}
								open={modal?.set5}
								onClick={() =>
									handleModal('set5', !modal?.set5)
								}
								questionList={
									Grade_9_Questions(Grade_9_Marks)?.[
										localizationConstants.socialSkills
									]
								}
								isEditable={true}
								isCollapsable={true}
								qusetionChange={(
									index,
									option,
									mainTitle,
									subQuestions,
									subTitle,
								) =>
									handleOptionChange(
										index,
										option,
										mainTitle,
										subQuestions,
										subTitle,
										selectedDropdownData?.checklist?.[0] !==
											checklistOptions?.[0],
										Grade_4_Marks,
										dispatch,
										Grade_9_Marks,
									)
								}
							/>
						) : null}
					</Box>
				) : null}
			</Box>
		)
	},
)

export default AddStudentChecklist
