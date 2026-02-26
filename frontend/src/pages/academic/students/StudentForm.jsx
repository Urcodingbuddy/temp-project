import React, { useEffect, useState, memo } from 'react'
import { Box, Typography } from '@mui/material'
import CustomTextfield from '../../../components/CustomTextField'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { handleInputs } from './studentsFunctions'
import { getClasslist } from './studentsFunctions'
import { useDispatch, useSelector } from 'react-redux'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import StudentActionsPopOver from '../../../components/StudentActionPopover'
import { genderOptions, initialStudentState } from './studentsConstants'
import {
	redBorderForCustomSelect,
	redBorderForCustomTextField,
} from '../../../components/styles'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'
import { typographyConstants } from '../../../resources/theme/typographyConstants'

const StudentForm = ({
	studentRowData,
	isEditBtnClicked,
	errors,
	handleErrors,
	schoolOptions,
	setStudentFormData,
	setIsEditBtnClicked,
	setEditStudentDrawer,
	refreshList,
}) => {
	const dispatch = useDispatch()
	const [inputs, setInputs] = useState({ ...initialStudentState })
	const [classlist, setClasslist] = useState([])
	const invalidTest = ['', undefined, null, NaN]
	const [sectionOptions, setSectionOptions] = useState([])
	const { schoolsList } = useSelector((store) => store.commonData)

	useEffect(() => {
		if (schoolsList.length) {
			const keys = !invalidTest.includes(studentRowData)
				? Object.keys(studentRowData).filter((key) =>
						Object.keys(inputs).includes(key),
					)
				: []

			if (keys.length > 0) {
				const obj = {}
				keys.forEach((key) => {
					if (key === 'school') {
						obj[key] = studentRowData?.school?._id
					} else {
						obj[key] = studentRowData[key]
					}
				})
				setInputs((state) => ({ ...state, ...obj }))
			}
			const school = schoolsList.find(
				(obj) => obj._id === studentRowData?.school?._id,
			)
			getClasslist(
				dispatch,
				studentRowData,
				setClasslist,
				setSectionOptions,
				school.lastPromotionAcademicYear,
			)
		}
	}, [])

	const [anchorElForList, setAnchorElForList] = useState(null)

	const handleIconClick = (event) => {
		setAnchorElForList(event.currentTarget)
	}
	const handleCloseListPopover = () => {
		setAnchorElForList(null)
	}
	const open = Boolean(anchorElForList)
	console.log(...new Set(classlist?.map((clas) => clas.className)))
	console.log(studentRowData)

	const { schoolsListForValidation } = useSelector(
		(store) => store.commonData,
	)

	const school = schoolsListForValidation.find(
		(obj) => obj._id === studentRowData.school._id,
	)

	// Here as students list is displayed for same student older academic years records as well, we are not allowing to edit student if the record viewing is older record. So we are hiding the edit icons with this.
	const dontShowActions =
		school &&
		school.lastPromotionAcademicYear &&
		studentRowData.academicYearId &&
		school.lastPromotionAcademicYear !== studentRowData.academicYearId
	console.log(
		`school.lastPromotionAcademicYear - ${school.lastPromotionAcademicYear}, studentRowData.academicYearId - ${studentRowData.academicYearId}, dontShowActions ${dontShowActions}`,
	)
	console.log(studentRowData)
	return (
		<>
			<Box
				sx={{
					pb: '24px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				<CustomIcon
					name={
						studentRowData?.graduated
							? iconConstants.GraduatedProperty
							: studentRowData?.exited
								? iconConstants.ExitedProperty
								: studentRowData?.status === 'Active'
									? iconConstants.ActiveProperty
									: undefined
					}
					style={{
						width: '92px',
						height: '44px',
					}}
					svgStyle={`width: 92px; height: 44px`}
				/>

				{!dontShowActions && (
					<Box
						sx={{
							cursor: 'pointer',
						}}
					>
						<CustomIcon
							name={iconConstants.studentActions}
							style={{
								width: '92px',
								height: '44px',
							}}
							onClick={handleIconClick}
							svgStyle={`width: 92px; height: 44px`}
						/>
					</Box>
				)}
			</Box>

			<Box sx={{ pb: '24px' }}>
				<CustomTextfield
					formSx={{ width: '100%' }}
					propSx={{ height: '44px' }}
					labelTypoSx={{ fontSize: '14px', pb: '4px' }}
					labelText={`${localizationConstants.studentId} *`}
					value={studentRowData?.user_id}
					readOnly={true}
					fieldSx={{
						textStyle: { color: 'globalElementColors.grey3' },
					}}
				/>
			</Box>

			<Box sx={{ pb: '24px' }}>
				<CustomTextfield
					formSx={{ width: '100%' }}
					propSx={{ height: '44px' }}
					fieldSx={redBorderForCustomTextField(errors.studentName)}
					labelTypoSx={{ fontSize: '14px', pb: '4px' }}
					labelText={`${localizationConstants.studentName} *`}
					value={inputs?.studentName}
					onChange={(e) => {
						handleInputs(e, setInputs, inputs, setStudentFormData)
						errors.studentName && handleErrors('studentName', false)
					}}
					readOnly={!isEditBtnClicked}
					name='studentName'
					placeholder={localizationConstants.enterStudentName}
				/>
			</Box>

			<Box>
				<Typography
					variant={typographyConstants.body}
				>{`${localizationConstants.school} ${localizationConstants.required}`}</Typography>

				<CustomAutocompleteNew
					sx={{ minWidth: '80px', width: '100%' }}
					fieldSx={{
						height: '48px',
						width: '100%',
						...redBorderForCustomSelect(errors.school),
					}}
					value={inputs.school}
					onChange={(e) => {
						handleInputs(
							{ target: { value: e, name: 'school' } },
							setInputs,
							inputs,
							setStudentFormData,
						)
					}}
					options={schoolOptions}
					disabled={true}
					multiple={false}
				/>
			</Box>

			<Box sx={{ pb: '24px', pt: '24px' }}>
				<CustomTextfield
					formSx={{ width: '100%' }}
					propSx={{ height: '44px' }}
					fieldSx={redBorderForCustomTextField(errors.regNo)}
					labelTypoSx={{ fontSize: '14px', pb: '4px' }}
					labelText={`${localizationConstants.regNo} *`}
					value={inputs?.regNo}
					onChange={(e) => {
						handleInputs(e, setInputs, inputs, setStudentFormData)
						errors.regNo && handleErrors('regNo', false)
					}}
					readOnly={!isEditBtnClicked}
					name='regNo'
					placeholder={localizationConstants.enterRegistrationNumber}
				/>
			</Box>

			<Box>
				<Typography
					variant={typographyConstants.body}
				>{`${localizationConstants.className} ${localizationConstants.required}`}</Typography>

				<CustomAutocompleteNew
					sx={{ minWidth: '80px', width: '100%' }}
					fieldSx={{
						height: '48px',
						width: '100%',
						borderRadius: '6px',
						...redBorderForCustomSelect(errors.className),
					}}
					value={inputs?.className}
					onChange={(e) => {
						handleInputs(
							{ target: { value: e, name: 'className' } },
							setInputs,
							inputs,
							setStudentFormData,
							classlist,
							setSectionOptions,
						)
						errors.className && handleErrors('className', false)
					}}
					options={[
						...new Set(classlist?.map((clas) => clas.className)),
					]}
					disabled={!isEditBtnClicked}
					placeholder={'Select Class Name'}
				/>
			</Box>

			<Box sx={{ mt: '24px' }}>
				<Typography
					variant={typographyConstants.body}
				>{`${localizationConstants.section} ${localizationConstants.required}`}</Typography>

				<CustomAutocompleteNew
					sx={{ minWidth: '80px', width: '100%' }}
					fieldSx={{
						height: '48px',
						width: '100%',
						borderRadius: '6px',
						...redBorderForCustomSelect(errors.section),
					}}
					value={inputs?.section}
					onChange={(e) => {
						handleInputs(
							{ target: { value: e, name: 'section' } },
							setInputs,
							inputs,
							setStudentFormData,
						)
						errors.section && handleErrors('section', false)
					}}
					options={sectionOptions}
					disabled={!isEditBtnClicked}
					name='section'
					placeholder={'Select Section'}
				/>
			</Box>

			<Box sx={{ pb: '24px', pt: '24px' }}>
				<CustomTextfield
					formSx={{ width: '100%' }}
					propSx={{ height: '44px' }}
					labelTypoSx={{ fontSize: '14px', pb: '4px' }}
					labelText={localizationConstants.emailCapitalId}
					value={inputs?.email}
					onChange={(e) =>
						handleInputs(e, setInputs, inputs, setStudentFormData)
					}
					readOnly={!isEditBtnClicked}
					name='email'
					placeholder={localizationConstants.enterEmailId}
				/>
			</Box>

			<Box sx={{ pb: '24px' }}>
				<CustomTextfield
					formSx={{ width: '100%' }}
					propSx={{ height: '44px' }}
					labelTypoSx={{ fontSize: '14px', pb: '4px' }}
					labelText={localizationConstants.mobileNumberOptional}
					value={inputs?.phone}
					onChange={(e) =>
						handleInputs(e, setInputs, inputs, setStudentFormData)
					}
					readOnly={!isEditBtnClicked}
					name='phone'
					placeholder={localizationConstants.enterMobileNumber}
					type='number'
					// required={false}
				/>
			</Box>

			<Box>
				<Typography
					variant={typographyConstants.body}
				>{`${localizationConstants.gender} ${localizationConstants.required}`}</Typography>

				<CustomAutocompleteNew
					sx={{ minWidth: '80px', width: '100%' }}
					fieldSx={{
						height: '48px',
						width: '100%',
						borderRadius: '6px',
						...redBorderForCustomSelect(errors.gender),
					}}
					value={inputs?.gender}
					onChange={(e) => {
						handleInputs(
							{ target: { value: e, name: 'gender' } },
							setInputs,
							inputs,
							setStudentFormData,
						)
						errors.gender && handleErrors('gender', false)
					}}
					options={genderOptions}
					disabled={!isEditBtnClicked}
					name='gender'
					placeholder={localizationConstants.selectGender}
				/>
			</Box>

			<Box sx={{ pb: '24px', pt: '24px' }}>
				<CustomTextfield
					formSx={{ width: '100%' }}
					propSx={{ height: '44px' }}
					labelTypoSx={{ fontSize: '14px', pb: '4px' }}
					labelText={`${localizationConstants.nationality}`}
					value={inputs?.nationality}
					onChange={(e) =>
						handleInputs(e, setInputs, inputs, setStudentFormData)
					}
					readOnly={!isEditBtnClicked}
					name='nationality'
					placeholder={localizationConstants.enterNationality}
				/>
			</Box>

			<Box sx={{ pb: '24px' }}>
				<Typography
					variant={typographyConstants.body}
				>{`${localizationConstants.bloodGroup} ${localizationConstants.required}`}</Typography>

				<CustomAutocompleteNew
					sx={{ minWidth: '80px', width: '100%' }}
					fieldSx={{
						height: '48px',
						width: '100%',
						borderRadius: '6px',
					}}
					value={inputs?.bloodGrp}
					onChange={(e) =>
						handleInputs(
							{ target: { value: e, name: 'bloodGrp' } },
							setInputs,
							inputs,
							setStudentFormData,
						)
					}
					options={['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']}
					disabled={!isEditBtnClicked}
					name='bloodGrp'
					placeholder={localizationConstants.selectBloodGroup}
				/>
			</Box>

			<Box sx={{ pb: '24px' }}>
				<CustomTextfield
					formSx={{ width: '100%' }}
					propSx={{ height: '44px' }}
					labelTypoSx={{ fontSize: '14px', pb: '4px' }}
					labelText={`${localizationConstants.fathersName}`}
					value={inputs?.fatherName}
					onChange={(e) =>
						handleInputs(e, setInputs, inputs, setStudentFormData)
					}
					readOnly={!isEditBtnClicked}
					name='fatherName'
					placeholder={localizationConstants.enterFathersName}
				/>
			</Box>

			<Box sx={{ pb: '24px' }}>
				<CustomTextfield
					formSx={{ width: '100%' }}
					propSx={{ height: '44px' }}
					labelTypoSx={{ fontSize: '14px', pb: '4px' }}
					labelText={localizationConstants.mothersName}
					value={inputs?.motherName}
					onChange={(e) =>
						handleInputs(e, setInputs, inputs, setStudentFormData)
					}
					readOnly={!isEditBtnClicked}
					name='motherName'
					placeholder={localizationConstants.enterMothersName}
				/>
			</Box>

			<StudentActionsPopOver
				open={open}
				anchorElForList={anchorElForList}
				handleCloseListPopover={handleCloseListPopover}
				isEditButtonClicked={isEditBtnClicked}
				setIsEditBtnClicked={setIsEditBtnClicked}
				studentRowData={studentRowData}
				setEditStudentDrawer={setEditStudentDrawer}
				refreshList={refreshList}
			/>
		</>
	)
}

export default memo(StudentForm)
