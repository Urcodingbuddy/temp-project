import React from 'react'
import { Box } from '@mui/material'
import CommonBarFilter from '../../../components/commonComponents/CommonBarFilter'
const IndividualCaseForm = React.lazy(() => import('./IndividualCaseForm'))

const AddIndividualCase = ({
	barFilterData,
	setBarFilterData,
	student,
	setStudent,
	stSearchData,
	stSelectData,
	selectedStudents,
	setSelectedStudents,
	rowData,
	setIndivCaseData,
	clearOptionsRef,
}) => {
	return (
		<Box sx={{ mt: '10px' }}>
			{/* Filters */}
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

			{/* Individual Case Form */}

			<IndividualCaseForm
				setIndivCaseData={setIndivCaseData}
				rowData={rowData}
				edit={true}
				add={true}
				stSearchData={stSearchData?.data}
				stSelectData={stSelectData?.data}
				selectedStudents={selectedStudents}
				setSelectedStudents={setSelectedStudents}
				student={student}
			/>
		</Box>
	)
}

export default AddIndividualCase
