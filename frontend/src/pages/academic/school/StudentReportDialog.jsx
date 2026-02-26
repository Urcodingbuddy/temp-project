import { Dialog, Divider, Typography } from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'
import {
	getAcademicYearsList,
	getCurrentAcademicYearId,
} from '../../../utils/utils'
import CustomButton from '../../../components/CustomButton'
import CustomMultiSelectAutoComplete from '../../../components/commonComponents/CustomMultiSelectAutoComplete'
import {
	getAllClassrooms,
	setClassroomsList,
	setSectionsList,
} from '../../../redux/commonSlice'
import { downloadStudentsReport } from './schoolSlice'
import StudentOverviewReportGenerator from './StudentOverviewReportGenerator'
import { getHaxCodeByColorName } from '../../../utils/hexaColorCodes'

const StudentReportDialog = ({ onOpen, onClose, schoolIds, schoolName }) => {
	const dispatch = useDispatch()
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const { classroomsList } = useSelector((state) => state.commonData)
	const currentAcyId = getCurrentAcademicYearId(academicYears)
	const initailState = {
		selectedAy: currentAcyId || '',
		selectedClass: [],
		selectedSection: [],
		selectedClassroomIds: [],
	}

	const [selectedDropdown, setSelectedDropDown] = useState(initailState)
	const [classSectionOptions, setClassSectionOptions] = useState({
		classrooms: [],
		sections: [],
	})

	// Handle Academic Year change
	const handleAYChange = (selectedAY) => {
		setSelectedDropDown({
			...initailState,
			selectedAy: selectedAY,
		})

		// Clear classrooms list in redux
		dispatch(setClassroomsList([]))
		dispatch(setSectionsList([]))

		// Reset class section options
		setClassSectionOptions({
			classrooms: [],
			sections: [],
		})

		// Fetch classrooms for selected AY and schools
		if (selectedAY && schoolIds?.length > 0) {
			dispatch(
				getAllClassrooms({
					body: {
						filter: {
							academicYear: [selectedAY],
							schoolIds: [schoolIds],
						},
					},
				}),
			)
		}
	}

	// Handle class options generation
	const handleClassOptions = () => {
		const list = []
		for (const classroom of classroomsList) {
			if (!list.includes(classroom.className)) {
				list.push(classroom.className)
			}
		}
		setClassSectionOptions((state) => ({
			...state,
			classrooms: list,
		}))
	}

	// Handle section options generation based on selected classes
	const handleSectionOptions = (selectedClasses = null) => {
		const list = []
		if (!selectedClasses || selectedClasses.length === 0) {
			setClassSectionOptions((state) => ({ ...state, sections: [] }))
			return
		}

		for (const classroom of classroomsList) {
			if (selectedClasses.length > 0) {
				if (
					!list.includes(classroom.section) &&
					selectedClasses.includes(classroom.className)
				) {
					list.push(classroom.section)
				}
			}
		}
		setClassSectionOptions((state) => ({ ...state, sections: list }))
	}

	// Handle class selection
	const handleClassrooms = (selectedClasses) => {
		setSelectedDropDown((state) => ({
			...state,
			selectedClass: selectedClasses,
			selectedSection: [], // Reset sections when classes change
		}))

		// Generate section options based on selected classes
		handleSectionOptions(selectedClasses)

		// Get classroom IDs for selected classes
		const classroomIds = classroomsList
			.filter((obj) => selectedClasses.includes(obj.className))
			.map((obj) => obj._id)

		setSelectedDropDown((state) => ({
			...state,
			selectedClassroomIds: classroomIds,
		}))
	}

	// Handle section selection
	const handleSections = (selectedSections) => {
		setSelectedDropDown((state) => ({
			...state,
			selectedSection: selectedSections,
		}))

		// Get classroom IDs for selected classes and sections
		const classroomIds = classroomsList
			.filter(
				(obj) =>
					selectedDropdown.selectedClass.includes(obj.className) &&
					selectedSections.includes(obj.section),
			)
			.map((obj) => obj._id)

		setSelectedDropDown((state) => ({
			...state,
			selectedClassroomIds: classroomIds,
		}))
	}

	// Effect to handle class options when classroomsList changes
	useEffect(() => {
		if (classroomsList.length > 0) {
			handleClassOptions()
		}
	}, [classroomsList])

	// Reset state when dialog opens
	useEffect(() => {
		if (onOpen) {
			setSelectedDropDown(initailState)
			setClassSectionOptions({
				classrooms: [],
				sections: [],
			})
			dispatch(setClassroomsList([]))
			dispatch(setSectionsList([]))
		}
	}, [onOpen])

	const handleDownload = async () => {
		const body = {
			academicYear: selectedDropdown.selectedAy,
			school: schoolIds,
			classroomIds: selectedDropdown.selectedClassroomIds,
		}

		const AY = academicYears.find(
			(obj) => obj._id === selectedDropdown.selectedAy,
		)

		const res = await dispatch(downloadStudentsReport({ body }))
		if (!res.error) {
			try {
				const data = res.payload.map((obj) => ({
					...obj,
					codeColor: getHaxCodeByColorName(obj.codeColor),
					physicalColor: getHaxCodeByColorName(obj.physicalColor),
					socialColor: getHaxCodeByColorName(obj.socialColor),
					emotionalColor: getHaxCodeByColorName(obj.emotionalColor),
					cognitiveColor: getHaxCodeByColorName(obj.cognitiveColor),
					languageColor: getHaxCodeByColorName(obj.languageColor),
				}))

				const reportGenerator = new StudentOverviewReportGenerator()
				await reportGenerator.generateCaseOverviewExcel(
					data,
					`${schoolName}-${AY.academicYear ?? ''}-StudentsCaseOverview`,
				)
			} catch (error) {
				console.log(error)
				alert('Error generating Excel file. Please try again.')
			}
		}
	}

	useEffect(() => {
		if (onOpen && selectedDropdown.selectedAy && schoolIds?.length > 0) {
			dispatch(
				getAllClassrooms({
					body: {
						filter: {
							academicYear: [selectedDropdown.selectedAy],
							schoolIds: [schoolIds],
						},
					},
				}),
			)
		}
	}, [onOpen])

	return (
		<Dialog
			PaperProps={{
				sx: {
					borderRadius: '10px',
					minWidth: '1000px',
					minHeight: '290px',
					display: 'flex',
					flexDirection: 'column',
					p: '20px',
				},
			}}
			open={onOpen}
			onClose={onClose}
		>
			<Box sx={{ minHeight: '20px' }}>
				<Box
					sx={{
						pb: 0,
						display: 'flex',
						flexDirection: 'row',
						justifyContent: 'space-between',
					}}
				>
					<Typography
						sx={{
							textTransform: 'none',
							color: 'black',
							fontWeight: 800,
							fontSize: '20px',
						}}
					>
						{localizationConstants.downloadStudentReport}
					</Typography>
					<CustomIcon
						name={iconConstants.cancelRounded}
						style={{
							cursor: 'pointer',
							width: '26px',
							height: '26px',
						}}
						svgStyle={'width: 26px; height: 26px'}
						onClick={() => {
							onClose()
						}}
					/>
				</Box>
			</Box>
			<Divider sx={{ mt: '15px' }} />
			<Box
				sx={{
					display: 'flex',
					gap: '10px',
					width: '100%',
					justifyContent: 'space-between',
					mt: '24px',
				}}
			>
				<Box sx={{ width: '20%' }}>
					<Typography
						variant={typographyConstants.body}
						sx={{ mb: '4px', display: 'flex' }}
					>
						{localizationConstants.academicYear}
					</Typography>
					<CustomAutocompleteNew
						fieldSx={{ height: '56px' }}
						value={selectedDropdown.selectedAy}
						placeholder={`${localizationConstants.select} ${localizationConstants.academicYear}`}
						onChange={(selectedAY) => handleAYChange(selectedAY)}
						options={getAcademicYearsList(academicYears) || []}
					/>
				</Box>

				<Box sx={{ width: '39%' }}>
					<Typography
						variant={typographyConstants.body}
						sx={{
							display: 'flex',
							mb: '4px',
						}}
					>
						{localizationConstants.ClassCamel}
					</Typography>

					<CustomMultiSelectAutoComplete
						sx={{ minWidth: '80px' }}
						fieldSx={{ minHeight: '44px', borderRadius: '6px' }}
						value={selectedDropdown.selectedClass}
						placeholder={
							selectedDropdown.selectedClass.length > 0
								? ''
								: `${localizationConstants.select} ${localizationConstants.ClassCamel}`
						}
						onChange={handleClassrooms}
						options={classSectionOptions.classrooms}
						disabled={!selectedDropdown.selectedAy}
					/>
				</Box>
				<Box sx={{ width: '39%' }}>
					<Typography
						variant={typographyConstants.body}
						sx={{
							mb: '4px',
							display: 'flex',
						}}
					>
						{localizationConstants.section}
					</Typography>

					<CustomMultiSelectAutoComplete
						sx={{ minWidth: '80px' }}
						fieldSx={{ minHeight: '44px', borderRadius: '6px' }}
						value={selectedDropdown.selectedSection}
						placeholder={
							selectedDropdown.selectedSection.length > 0
								? ''
								: `${localizationConstants.select} ${localizationConstants.section}`
						}
						onChange={handleSections}
						options={classSectionOptions.sections}
						disabled={!selectedDropdown.selectedClass.length}
					/>
				</Box>
			</Box>

			<Box sx={{ display: 'flex', justifyContent: 'center', mt: '40px' }}>
				<CustomButton
					typoVariant={typographyConstants.h4}
					sx={{
						minWidth: '200px',
						height: '44px',
					}}
					startIcon={
						<Box sx={{ mr: '8px' }}>
							<CustomIcon
								name={iconConstants.downloadWhite}
								style={{
									width: '24px',
									height: '24px',
								}}
								svgStyle={'width: 24px; height: 24px '}
							/>
						</Box>
					}
					text={localizationConstants.downloadReport}
					onClick={handleDownload}
					// disabled={selectedDropdown.selectedClass.length === 0}
				/>
			</Box>
		</Dialog>
	)
}

export default StudentReportDialog
