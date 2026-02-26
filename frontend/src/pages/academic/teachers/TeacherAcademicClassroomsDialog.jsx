import { Dialog, Divider, Typography, Box } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AcademicYearClassroomCard from './AcademicYearClassroomCard'
import { getAllClassrooms } from '../../../redux/commonSlice'

import { localizationConstants } from '../../../resources/theme/localizationConstants'
import EditTeacherClassroomDialogDialog from './EditTeacherClassroomsDialog'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import useCommonStyles from '../../../components/styles'
import { getCurrentAcademicYearObj } from '../../../utils/utils'
import { clearTeachersClassroomsList } from './teachersSlice'
import { typographyConstants } from '../../../resources/theme/typographyConstants'

const TeacherAcademicClassroomsDialog = ({
	isOpen,
	onClose,
	title,
	academicYears,
	teachersRowData,
	refreshList,
	setTeachersRowData,
}) => {
	const { schoolsList } = useSelector((state) => state.commonData)
	const { teacherClassroomsList } = useSelector((store) => store.teachers)
	const [processedClassroomData, setProcessedClassroomData] = useState([])
	const [selectedEditData, setSelectedEditData] = useState(null)
	const [OpenEditClassroom, setOpenEditClassroom] = useState(false)
	const dispatch = useDispatch()
	const flexStyles = useCommonStyles()

	// Process the classroom data to match the required format
	useEffect(() => {
		if (
			teacherClassroomsList &&
			Array.isArray(teacherClassroomsList) &&
			academicYears &&
			teacherClassroomsList.length > 0
		) {
			// Group classroom data by academic year
			const groupedData = teacherClassroomsList.reduce(
				(acc, classroom) => {
					// Find academic year using the academicYear ID from classroom data
					const academicYear = academicYears.find(
						(ay) => ay._id === classroom.academicYear,
					)
					const yearLabel = academicYear
						? academicYear.academicYear
						: 'Unknown Year'
					const yearOrder = academicYear ? academicYear.order : 0
					const yearId = academicYear ? academicYear._id : null

					if (!acc[yearLabel]) {
						acc[yearLabel] = {
							classData: [],
							order: yearOrder,
							academicYearId: yearId,
						}
					}

					// Find if class already exists
					const existingClass = acc[yearLabel].classData.find(
						(cls) => cls.className === classroom.className,
					)

					if (existingClass) {
						// Add section if not already present
						if (
							!existingClass.sections.includes(classroom.section)
						) {
							existingClass.sections.push(classroom.section)
						}
						// Add classroom ID if not already present
						if (
							!existingClass.classroomIds.includes(classroom._id)
						) {
							existingClass.classroomIds.push(classroom._id)
						}
					} else {
						// Create new class entry
						acc[yearLabel].classData.push({
							className: classroom.className,
							sections: [classroom.section],
							classroomIds: [classroom._id],
						})
					}

					return acc
				},
				{},
			)

			// Convert to array format for rendering and sort by academic year order (latest first)
			const processedData = Object.entries(groupedData)
				.map(([year, data]) => ({
					academicYear: year,
					academicYearId: data.academicYearId,
					classroomData: data.classData
						.map((cls) => ({
							...cls,
							sections: cls.sections.sort(), // Sort sections alphabetically
						}))
						.sort((a, b) => {
							// Sort classes numerically if possible, otherwise alphabetically
							const aNum = parseInt(a.className)
							const bNum = parseInt(b.className)
							if (!isNaN(aNum) && !isNaN(bNum)) {
								return aNum - bNum
							}
							return a.className.localeCompare(b.className)
						}),
					order: data.order,
				}))
				.sort((a, b) => b.order - a.order) // Sort by order descending (latest first)

			setProcessedClassroomData(processedData)
		}
	}, [teacherClassroomsList, academicYears])

	const handleEditClassroom = async (academicYear, classroomData) => {
		// Find the academic year ID
		const academicYearObj = academicYears.find(
			(ay) => ay.academicYear === academicYear,
		)
		const academicYearId = academicYearObj?._id
		if (!academicYearId) {
			return
		}

		dispatch(
			getAllClassrooms({
				body: {
					filter: {
						academicYear: academicYearId,
						schoolIds: [teachersRowData.schoolId],
					},
				},
			}),
		)
		// Set the selected edit data
		setSelectedEditData({
			academicYear,
			academicYearId,
			classroomData,
		})

		// Open the edit dialog
		setOpenEditClassroom(true)
	}

	// Function to determine if editing is allowed for a specific academic year
	const canEditAcademicYear = (academicYearLabel) => {
		if (!schoolsList.length || !academicYears.length) {
			return false
		}

		const schoolObj = schoolsList.find(
			(school) => school._id === teachersRowData.schoolId,
		)
		if (!schoolObj) {
			return false
		}

		const scLastPromoteAY = schoolObj.lastPromotionAcademicYear
		const currentAY = getCurrentAcademicYearObj(academicYears)

		// Find the academic year object for the given academicYearLabel
		const targetAY = academicYears.find(
			(ay) => ay.academicYear === academicYearLabel,
		)
		if (!targetAY) {
			return false
		}

		// If no lastPromotionAcademicYear is set, only allow current academic year
		if (!scLastPromoteAY) {
			return targetAY._id === currentAY._id
		}

		// If lastPromotionAcademicYear is the same as current, only allow current
		if (scLastPromoteAY === currentAY._id) {
			return targetAY._id === currentAY._id
		}

		// Find the last promoted academic year
		const lastPromotedAY = academicYears.find(
			(obj) => obj._id === scLastPromoteAY,
		)
		if (!lastPromotedAY) {
			return false
		}

		// Allow editing for academic years from lastPromotedAY to currentAY (inclusive)
		return (
			targetAY.order >= lastPromotedAY.order &&
			targetAY.order <= currentAY.order
		)
	}

	// Function to get tooltip message
	const getTooltipMessage = (academicYear, canEdit) => {
		if (canEdit) {
			return `Edit classrooms for ${academicYear}`
		} else {
			const schoolObj = schoolsList.find(
				(school) => school._id === teachersRowData.schoolId,
			)
			const scLastPromoteAY = schoolObj?.lastPromotionAcademicYear

			if (!scLastPromoteAY) {
				return `Editing is restricted for ${academicYear}. Only current academic year can be edited.`
			}

			const lastPromotedAY = academicYears.find(
				(obj) => obj._id === scLastPromoteAY,
			)
			const lastPromotedYear =
				lastPromotedAY?.academicYear || 'last promoted year'
			return `Editing is restricted for ${academicYear}. Only academic years from ${lastPromotedYear} onwards can be edited.`
		}
	}

	return (
		<Dialog
			fullWidth
			maxWidth='lg'
			PaperProps={{
				sx: {
					borderRadius: '10px',
					height: '90vh',
					maxHeight: '90vh',
					display: 'flex',
					flexDirection: 'column',
					p: '20px',
				},
			}}
			open={isOpen}
		>
			<Box sx={{ minHeight: '20px' }}>
				<Box
					className={flexStyles.flexRowCenterSpaceBetween}
					sx={{ pb: 0 }}
				>
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
					<CustomIcon
						name={iconConstants.cancelRounded}
						onClick={() => {
							onClose()
							dispatch(clearTeachersClassroomsList())
						}}
						style={{
							cursor: 'pointer',
							width: '26px',
							height: '26px',
						}}
						svgStyle={'width: 26px; height: 26px'}
					/>
				</Box>
			</Box>
			<Divider sx={{ mt: '15px', mb: '20px' }} />

			{/* Scrollable Content Area */}
			<Box
				sx={{
					flex: 1,
					overflowY: 'auto',
					pr: 1,
				}}
			>
				{processedClassroomData.length > 0 ? (
					processedClassroomData.map((data, index) => {
						const canEdit = canEditAcademicYear(data.academicYear)
						const tooltipMessage = getTooltipMessage(
							data.academicYear,
							canEdit,
						)

						return (
							<AcademicYearClassroomCard
								key={index}
								academicYear={data.academicYear}
								classroomData={data.classroomData}
								onEdit={handleEditClassroom}
								isDefaultExpanded={true}
								canEdit={canEdit}
								editTooltip={tooltipMessage}
								disabledTooltip={tooltipMessage}
							/>
						)
					})
				) : (
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							height: '100%',
						}}
					>
						<Typography variant={typographyConstants.h4}>
							{localizationConstants.noClassroomsDataAvailable}
						</Typography>
					</Box>
				)}
			</Box>
			<EditTeacherClassroomDialogDialog
				isOpen={OpenEditClassroom}
				onClose={() => setOpenEditClassroom(false)}
				title={localizationConstants.editTeacherClassrooms}
				selectedEditData={selectedEditData}
				teachersRowData={teachersRowData}
				refreshList={refreshList}
				setTeachersRowData={setTeachersRowData}
				currentAYId={getCurrentAcademicYearObj(academicYears)?._id}
			/>
		</Dialog>
	)
}

export default TeacherAcademicClassroomsDialog
