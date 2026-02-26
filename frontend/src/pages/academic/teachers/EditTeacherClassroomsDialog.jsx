import { Dialog, Divider, Typography } from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useMemo, useState } from 'react'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import CustomMultiSelectAutoComplete from '../../../components/commonComponents/CustomMultiSelectAutoComplete'
import { commonComponentStyles } from '../../../components/commonComponentStyles'
import CustomButton from '../../../components/CustomButton'
import { useDispatch, useSelector } from 'react-redux'
import { getTeachersClassrooms, updateTeacherClassrooms } from './teachersSlice'
import CustomAlertDialogs from '../../../components/commonComponents/CustomAlertDialogs'
import { iconConstants } from '../../../resources/theme/iconConstants'

const initialInputStates = {
	academicYear: '',
	academicYearId: '',
	classroomIds: [],
	classNames: [],
	sections: [],
}

const EditTeacherClassroomDialog = ({
	isOpen,
	onClose,
	title,
	selectedEditData,
	teachersRowData,
	refreshList,
	setTeachersRowData,
	currentAYId,
}) => {
	const dispatch = useDispatch()
	const { classroomsList } = useSelector((state) => state.commonData)
	const [inputs, setInputs] = useState(initialInputStates)
	const [classroomOptions, setClassroomOptions] = useState([])
	const [sectionOptions, setSectionOptions] = useState([])
	const [openAcknowledgement, setOpenAcknowledgement] = useState(false)
	const [initialData, setInitialData] = useState(initialInputStates)

	// Reset inputs when dialog opens/closes
	useEffect(() => {
		if (isOpen && selectedEditData) {
			// Extract all classroom IDs from the selected data
			const allClassroomIds = selectedEditData.classroomData.reduce(
				(acc, classData) => {
					return [...acc, ...classData.classroomIds]
				},
				[],
			)

			// Extract unique class names and sections from classroomData
			const classNames = [
				...new Set(
					selectedEditData.classroomData.map(
						(item) => item.className,
					),
				),
			]
			const sections = [
				...new Set(
					selectedEditData.classroomData.reduce((acc, item) => {
						// Handle both array and non-array sections
						if (Array.isArray(item.sections)) {
							return [...acc, ...item.sections]
						} else if (item.sections) {
							return [...acc, item.sections]
						}
						return acc
					}, []),
				),
			]

			const initialDataState = {
				academicYear: selectedEditData.academicYear,
				academicYearId: selectedEditData.academicYearId,
				classroomIds: allClassroomIds,
				classNames: classNames,
				sections: sections,
			}

			setInputs(initialDataState)
			setInitialData(initialDataState)
		} else if (!isOpen) {
			setInputs(initialInputStates)
			setInitialData(initialInputStates)
		}
	}, [isOpen, selectedEditData])

	// Process classroom options when classroomsList changes
	useEffect(() => {
		if (classroomsList && classroomsList.length > 0 && selectedEditData) {
			// Filter classrooms for the selected academic year and school
			// Note: Based on your data structure, classroomsList might not have academicYear and schoolId
			// Adjust the filtering logic based on your actual classroomsList structure
			const filteredClassrooms = classroomsList.filter((classroom) => {
				// If classroomsList has academicYear field, use it
				if (classroom.academicYear) {
					return (
						classroom.academicYear ===
							selectedEditData.academicYearId &&
						classroom.school === teachersRowData.schoolId
					)
				}
				// If no academicYear field, include all classrooms
				// You might need to adjust this logic based on your actual data structure
				return classroom.school === teachersRowData.schoolId
			})

			// Create unique class options from all available classrooms
			const uniqueClasses = [
				...new Set(filteredClassrooms.map((room) => room.className)),
			]
			const classOptions = uniqueClasses.map((className) => ({
				label: className,
				value: className,
				id: className,
			}))

			setClassroomOptions(classOptions)
		}
	}, [classroomsList, selectedEditData, teachersRowData?.schoolId])

	// Update section options based on selected classes
	useEffect(() => {
		if (
			classroomsList &&
			classroomsList.length > 0 &&
			inputs.classNames.length > 0
		) {
			// Filter classrooms based on selected classes
			const filteredClassrooms = classroomsList.filter((classroom) => {
				const schoolMatch =
					classroom.school === teachersRowData.schoolId
				const classMatch = inputs.classNames.includes(
					classroom.className,
				)

				// If academicYear field exists, filter by it too
				if (classroom.academicYear) {
					return (
						schoolMatch &&
						classMatch &&
						classroom.academicYear === inputs.academicYearId
					)
				}

				return schoolMatch && classMatch
			})

			// Create unique section options from filtered classrooms
			const uniqueSections = [
				...new Set(filteredClassrooms.map((room) => room.section)),
			]
			const sectionOpts = uniqueSections.map((section) => ({
				label: section,
				value: section,
				id: section,
			}))

			setSectionOptions(sectionOpts)
		} else {
			// Clear sections if no classes are selected
			setSectionOptions([])
		}
	}, [
		classroomsList,
		inputs.classNames,
		inputs.academicYearId,
		teachersRowData.schoolId,
	])

	// Update classroom IDs when class names or sections change
	useEffect(() => {
		if (
			classroomsList &&
			inputs.classNames.length > 0 &&
			inputs.sections.length > 0
		) {
			const matchingClassrooms = classroomsList.filter((classroom) => {
				const schoolMatch =
					classroom.school === teachersRowData.schoolId
				const classMatch = inputs.classNames.includes(
					classroom.className,
				)
				const sectionMatch = inputs.sections.includes(classroom.section)

				// If academicYear field exists, filter by it too
				if (classroom.academicYear) {
					return (
						schoolMatch &&
						classMatch &&
						sectionMatch &&
						classroom.academicYear === inputs.academicYearId
					)
				}

				return schoolMatch && classMatch && sectionMatch
			})

			const classroomIds = matchingClassrooms.map((room) => room._id)

			setInputs((prev) => ({
				...prev,
				classroomIds: classroomIds,
			}))
		} else {
			// Clear classroomIds if no classes or sections are selected
			setInputs((prev) => ({
				...prev,
				classroomIds: [],
			}))
		}
	}, [
		inputs.classNames,
		inputs.sections,
		classroomsList,
		inputs.academicYearId,
		teachersRowData.schoolId,
	])

	const handleClassNameChange = (selectedClasses) => {
		setInputs((prev) => ({
			...prev,
			classNames: selectedClasses,
			sections: [],
		}))
	}

	const handleSectionChange = (selectedSections) => {
		setInputs((prev) => ({
			...prev,
			sections: selectedSections,
		}))
	}

	const handleSubmit = async (acknowledgement = false) => {
		if (inputs.academicYearId && inputs.classroomIds.length > 0) {
			const body = {
				teacherId: teachersRowData._id,
				classroomIds: inputs.classroomIds,
				academicYear: inputs.academicYearId,
				acknowledgement: acknowledgement,
			}

			const res = await dispatch(updateTeacherClassrooms(body))
			if (res?.payload?.acknowledgement === 1) {
				setOpenAcknowledgement(true)
				return
			}
			if (!res?.error) {
				// Create classRoomIds array in the required format
				const classRoomIdsArray = inputs.classroomIds.map(
					(classroomId) => {
						// Find the corresponding classroom from classroomsList
						const classroom = classroomsList.find(
							(room) => room._id === classroomId,
						)
						return {
							_id: classroomId,
							className: classroom?.className || '',
							section: classroom?.section || '',
							academicYear: inputs.academicYearId,
						}
					},
				)
				if (currentAYId === inputs.academicYearId) {
					setTeachersRowData((state) => ({
						...state,
						classRoomIds: classRoomIdsArray,
					}))
				}

				dispatch(getTeachersClassrooms(teachersRowData?._id))
				onClose()
				refreshList('edit')
			}
		}
	}

	// Check if there are changes made to class names or sections
	const hasChanges = useMemo(() => {
		if (!initialData.classNames.length && !initialData.sections.length) {
			return false
		}
		// Compare class names (sort arrays to handle order differences)
		const initialClassNames = [...initialData.classNames].sort()
		const currentClassNames = [...inputs.classNames].sort()
		const classNamesChanged =
			JSON.stringify(initialClassNames) !==
			JSON.stringify(currentClassNames)

		// Compare sections (sort arrays to handle order differences)
		const initialSections = [...initialData.sections].sort()
		const currentSections = [...inputs.sections].sort()
		const sectionsChanged =
			JSON.stringify(initialSections) !== JSON.stringify(currentSections)

		return classNamesChanged || sectionsChanged
	}, [
		inputs.classNames,
		inputs.sections,
		initialData.classNames,
		initialData.sections,
	])

	return (
		<Dialog
			PaperProps={{
				sx: {
					borderRadius: '10px',
					width: '500px',
					minWidth: '50%',
					minHeight: '450px',
					display: 'flex',
					flexDirection: 'column',
					p: '20px',
				},
			}}
			open={isOpen}
			// onClose={onClose}
		>
			<Box sx={{ minHeight: '20px' }}>
				<Box sx={{ pb: 0, textAlign: 'left' }}>
					<Typography
						sx={{
							textTransform: 'none',
							color: 'black',
							fontWeight: 800,
							fontSize: '20px',
						}}
					>
						{title}
					</Typography>
				</Box>
			</Box>
			<Divider sx={{ mt: '15px' }} />
			<Box sx={{ flexGrow: 1 }}>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						gap: '20px',
						padding: '20px 0px',
					}}
				>
					<Box sx={{ width: '100%' }}>
						<Typography
							variant={typographyConstants.body}
							sx={{
								color: 'textColors.grey',
								fontWeight: 400,
							}}
						>
							{localizationConstants.academicYear}
						</Typography>
						<CustomAutocompleteNew
							fieldSx={{
								height: '56px',
								'& .MuiInputBase-input.Mui-disabled': {
									WebkitTextFillColor: '#000000',
									color: '#000000',
								},
							}}
							value={inputs.academicYear}
							placeholder={`${localizationConstants.select} ${localizationConstants.academicYear}`}
							onChange={() => {}}
							options={[]}
							disabled={true}
						/>
					</Box>
				</Box>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						gap: '20px',
					}}
				>
					<Box sx={{ width: '100%' }}>
						<Typography
							variant={typographyConstants.body}
							sx={{
								color: 'textColors.grey',
								fontWeight: 400,
							}}
						>
							{localizationConstants.classrooms}
						</Typography>
						<CustomMultiSelectAutoComplete
							options={classroomOptions}
							sx={{
								width: '100%',
								height: '44px',
								borderRadius: '6px',
							}}
							fieldSx={{ borderRadius: '6px' }}
							value={inputs.classNames}
							onChange={handleClassNameChange}
							name='className'
							placeholder={
								inputs?.classNames?.length > 0
									? ''
									: localizationConstants.selectClassRooms
							}
						/>
					</Box>
					<Box sx={{ width: '100%' }}>
						<Typography
							variant={typographyConstants.body}
							sx={{
								color: 'textColors.grey',
								fontWeight: 400,
							}}
						>
							{localizationConstants.sections}
						</Typography>
						<CustomMultiSelectAutoComplete
							options={sectionOptions}
							sx={{
								width: '100%',
								height: '44px',
								borderRadius: '6px',
							}}
							fieldSx={{ borderRadius: '6px' }}
							value={inputs.sections}
							onChange={handleSectionChange}
							name='section'
							placeholder={
								inputs?.sections?.length > 0
									? ''
									: localizationConstants.selectSection
							}
						/>
					</Box>
				</Box>
			</Box>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					height: '60px',
					gap: '20px',
					width: '100%',
				}}
			>
				<Box sx={{ width: '50%' }}>
					<CustomButton
						sx={{
							...commonComponentStyles.customBtnUploadDialogSX,
							borderColor: 'blue',
							flexGrow: 1,
							width: '100%',
						}}
						text={localizationConstants.cancel}
						onClick={onClose}
						typoVariant={typographyConstants.body}
						typoSx={{
							color: 'textColors.black',
						}}
					/>
				</Box>
				<Box sx={{ width: '50%' }}>
					<CustomButton
						sx={{
							...commonComponentStyles.rightButtonDialogSx,
							flexGrow: 1,
							width: '100%',
						}}
						text={localizationConstants.submit}
						onClick={() => handleSubmit()}
						typoVariant={typographyConstants.body}
						typoSx={{
							color: 'textColors.white',
						}}
						disabled={!hasChanges || inputs?.sections.length <= 0}
					/>
				</Box>
			</Box>
			<CustomAlertDialogs
				open={openAcknowledgement}
				setOpen={setOpenAcknowledgement}
				type={localizationConstants.teacherUpdateAcknowledgement}
				title={localizationConstants.classroomConflictDetected}
				onSubitClick={() => {
					setOpenAcknowledgement(false)
					handleSubmit(true)
				}}
				onCancelClick={() => {
					setOpenAcknowledgement(false)
				}}
				iconName={iconConstants.alertTriangle}
			/>
		</Dialog>
	)
}

export default EditTeacherClassroomDialog
