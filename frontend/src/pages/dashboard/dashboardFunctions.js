import {
	getAllClassrooms,
	getSchoolsList,
	listStudents,
} from '../../redux/commonSlice'

export const selectAndPopulateStudents = async (
	dispatch,
	selectedStudent,
	allStudentsForSchoolActions,
	barFilterData,
	setBarFilterData,
	setStudent,
) => {
	const studentsList = allStudentsForSchoolActions?.data ?? []
	const studentData = studentsList.find(
		(obj) => obj._id === selectedStudent.val,
	)

	if (studentData) {
		await dispatch(
			getSchoolsList({
				filter: { academicYear: [barFilterData.selectdAYs] },
			}),
		)

		await dispatch(
			getAllClassrooms({
				body: {
					filter: {
						academicYear: [studentData.academicYear],
						schoolIds: [studentData.school],
					},
				},
			}),
		)

		await dispatch(
			listStudents({
				body: {
					filter: {
						schoolIds: [studentData.school],
						classroomIds: [studentData.classRoomId],
					},
				},
			}),
		)

		setBarFilterData((state) => ({
			...state,
			selectdAYs: studentData.academicYear,
			selectdSchools: studentData.school,
			selectdClassrooms: [studentData.classRoomId],
			selectdSections: studentData.section,
			selectedStudent: studentData._id,
			className: studentData.className,
			sectionName: studentData.section,
		}))

		setStudent(studentData)
	}
}
