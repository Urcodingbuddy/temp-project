import { Box } from '@mui/material'
import CommonBarFilter from '../../../components/commonComponents/CommonBarFilter'
import ObservationForm from './ObservationForm'

const AddStudentObservation = ({
	barFilterData,
	setBarFilterData,
	student,
	setStudent,
	setObservationData,
	rowData,
	clearOptionsRef,
}) => {
	return (
		<Box sx={{ mt: '10px' }}>
			{/* Filters */}
			<Box>
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

			{/* Observation Form */}
			<ObservationForm
				setObservationData={setObservationData}
				rowData={rowData}
				edit={true}
				add={true}
				student={student}
			/>
		</Box>
	)
}

export default AddStudentObservation
