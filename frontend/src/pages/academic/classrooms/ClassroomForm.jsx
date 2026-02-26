import { useEffect, useState, memo } from 'react'
import { Box, Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import CustomTextfield from '../../../components/CustomTextField'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { initialStateClassrooms } from './classroomsContants'
import {
	redBorderForCustomSelect,
	redBorderForCustomTextField,
} from '../../../components/styles'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'

const {
	schoolName,
	className,
	section,
	studentsInClass,
	classHierarchy,
	sectionHierarchy,
} = localizationConstants.classRoomTableConstants
const invalidTest = ['', undefined, null]

const ClassroomForm = ({
	setClassroomFormData,
	rowData,
	readOnly,
	errors,
	handleErrors,
	teacherOptions = [],
}) => {
	const { schoolsList } = useSelector((state) => state.commonData)
	const [inputs, setInputs] = useState({ ...initialStateClassrooms })
	const [schoolOptions, setSchoolOptions] = useState([])

	const handleInputs = (e) => {
		const { name, value } = e.target

		let processedValue = value
		if (name === 'phone') {
			processedValue = Math.max(0, parseInt(value))
				.toString()
				.slice(0, 10)
		}
		const obj = { [name]: processedValue }
		const inputstate = { ...inputs, ...obj }
		setInputs(inputstate)
		setClassroomFormData(inputstate)
	}

	useEffect(() => {
		const keys = !invalidTest.includes(rowData)
			? Object.keys(rowData).filter((key) =>
					Object.keys(inputs).includes(key),
				)
			: []

		if (keys.length > 0) {
			const obj = {}
			keys.forEach((key) => {
				if (key === 'teacher' && teacherOptions.length > 0) {
					obj[key] = rowData[key]?._id
				} else {
					obj[key] =
						key === 'school' ? rowData?.school?._id : rowData[key]
				}
			})
			setInputs((state) => ({ ...state, ...obj }))
			setClassroomFormData((state) => ({ ...state, ...obj }))
		}
	}, [])

	useEffect(() => {
		let options = []
		if (rowData) {
			options = [rowData.school]
		} else {
			options = schoolsList
		}
		options = options.map((school) => ({
			id: school._id,
			label: school.school,
		}))
		setSchoolOptions(options)
	}, [rowData, schoolsList])

	return (
		<Box sx={{ pb: '30px' }}>
			{/* ------------ School Name ------------ */}
			<Box sx={{ mt: '24px' }}>
				<Typography
					variant={typographyConstants.body}
				>{`${schoolName.label} ${localizationConstants.required}`}</Typography>

				<CustomAutocompleteNew
					sx={{ minWidth: '80px', width: '100%' }}
					fieldSx={{
						height: '48px',
						width: '100%',
						...redBorderForCustomSelect(errors.class),
					}}
					value={inputs?.school}
					placeholder={`${localizationConstants.select} ${localizationConstants.school}`}
					onChange={(e) => {
						handleInputs({ target: { value: e, name: 'school' } })
						errors.school && handleErrors('school', false)
					}}
					options={schoolOptions}
					disabled={true}
					multiple={false}
				/>
			</Box>

			{/* ------------ Class Name ------------ */}
			<Box sx={{ mt: '24px' }}>
				<CustomTextfield
					formSx={{ minWidth: '80px', width: '100%' }}
					propSx={{ height: '44px' }}
					fieldSx={redBorderForCustomTextField(errors.className)}
					labelTypoSx={{ fontSize: '14px', pb: '4px' }}
					labelText={`${className.label} ${localizationConstants.required}`}
					placeholder={`${localizationConstants.select} ${className.label}`}
					name='className'
					value={inputs?.className}
					disabled={readOnly}
					onChange={(e) => {
						handleInputs(e)
						errors.className && handleErrors(e.target.name, false)
					}}
				/>
			</Box>

			{/* ------------ Class Hierarchy  ------------ */}
			<Box sx={{ mt: '24px' }}>
				<CustomTextfield
					formSx={{ minWidth: '80px', width: '100%' }}
					propSx={{ height: '44px' }}
					fieldSx={redBorderForCustomTextField(errors.classHierarchy)}
					labelTypoSx={{ fontSize: '14px', pb: '4px' }}
					labelText={`${classHierarchy.label} ${localizationConstants.required}`}
					placeholder={`${localizationConstants.select} ${classHierarchy.label}`}
					name='classHierarchy'
					value={inputs?.classHierarchy}
					disabled={readOnly}
					onChange={(e) => {
						handleInputs(e)
						errors.classHierarchy &&
							handleErrors(e.target.name, false)
					}}
				/>
			</Box>

			{/* ------------ Section ------------ */}
			<Box sx={{ mt: '24px' }}>
				<CustomTextfield
					formSx={{ minWidth: '80px', width: '100%' }}
					propSx={{ height: '44px' }}
					fieldSx={redBorderForCustomTextField(errors.section)}
					labelTypoSx={{ fontSize: '14px', pb: '4px' }}
					labelText={`${section.label} ${localizationConstants.required}`}
					placeholder={`${localizationConstants.enter} ${section.label}`}
					name='section'
					value={inputs?.section}
					disabled={readOnly}
					onChange={(e) => {
						handleInputs(e)
						errors.section && handleErrors(e.target.name, false)
					}}
				/>
			</Box>

			{/* ------------ Section Hierarchy* ------------ */}
			<Box sx={{ mt: '24px' }}>
				<CustomTextfield
					formSx={{ minWidth: '80px', width: '100%' }}
					propSx={{ height: '44px' }}
					fieldSx={redBorderForCustomTextField(
						errors.sectionHierarchy,
					)}
					labelTypoSx={{ fontSize: '14px', pb: '4px' }}
					labelText={`${sectionHierarchy.label} ${localizationConstants.required}`}
					placeholder={`${localizationConstants.enter} ${sectionHierarchy.label}`}
					name='sectionHierarchy'
					value={inputs?.sectionHierarchy}
					disabled={readOnly}
					onChange={(e) => {
						handleInputs(e)
						errors.sectionHierarchy &&
							handleErrors(e.target.name, false)
					}}
				/>
			</Box>

			{/* ------------ Teacher ------------ */}
			<Box sx={{ mt: '24px' }}>
				<Typography
					variant={typographyConstants.title}
					sx={{
						color: 'textColors.grey',
						fontSize: '14px',
						mb: '4px',
					}}
				>
					{`${localizationConstants.select} ${localizationConstants.teacher}`}
				</Typography>
				<CustomAutocompleteNew
					sx={{ minWidth: '80px', width: '100%' }}
					fieldSx={{ height: '48px' }}
					error={errors?.country}
					placeholder={`${localizationConstants.select} ${localizationConstants.teacher}`}
					onChange={(e) => {
						handleInputs({ target: { name: 'teacher', value: e } })
					}}
					value={
						teacherOptions.length > 0 ? inputs?.teacher : undefined
					}
					options={teacherOptions}
					disabled={readOnly}
				/>
			</Box>

			{/* ------------ Students in Class ------------ */}
			<Box sx={{ mt: '24px' }}>
				<CustomTextfield
					labelText={studentsInClass.label}
					propSx={{ height: '44px' }}
					formSx={{ minWidth: '80px', width: '100%' }}
					labelTypoSx={{ fontSize: '14px', pb: '4px' }}
					placeholder={`${localizationConstants.enter} ${studentsInClass.label}`}
					name='studentCount'
					type='number'
					value={inputs?.studentCount}
					onChange={(e) => handleInputs(e)}
					readOnly
					fieldSx={{
						textStyle: { color: 'globalElementColors.grey3' },
					}}
				/>
			</Box>
		</Box>
	)
}

export default memo(ClassroomForm)
