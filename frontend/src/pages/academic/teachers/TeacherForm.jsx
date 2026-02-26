import { Box } from '@mui/system'
import { useEffect, useState } from 'react'
import CustomTextfield from '../../../components/CustomTextField'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import {
	getClasslistForTeachers,
	handleInputs,
	isDataObjectsEqual,
} from './tecahersFunction'
import { initialState } from './teachersConstants'
import { useDispatch } from 'react-redux'
import {
	redBorderForCustomSelect,
	redBorderForCustomTextField,
} from '../../../components/styles'
import CustomMultiSelectAutoComplete from '../../../components/commonComponents/CustomMultiSelectAutoComplete'
import { Typography } from '@mui/material'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import TeacherActionsPopover from './TeacherActionsPopover'
import { getCurACYear } from '../../../utils/utils'
import { getTeachersClassrooms } from './teachersSlice'
import TeacherAcademicClassroomsDialog from './TeacherAcademicClassroomsDialog'

const TeacherForm = ({
	teachersRowData,
	isEditBtnClicked,
	teachersFormData,
	setTeachersFormData,
	transformedSchools,
	setEnableSubmit,
	errors,
	handleErrors,
	setIsEditBtnClicked,
	setDeleteTeachersDialog,
	academicYears,
	refreshList,
	setTeachersRowData,
}) => {
	const [inputs, setInputs] = useState({ ...initialState })
	const [origionalData, setOrigionalData] = useState({})
	const [classlist, setClasslist] = useState([])
	const [sectionOptions, setSectionOptions] = useState([])
	const dispatch = useDispatch()
	const [anchorElForList, setAnchorElForList] = useState(null)
	const [openClassromDialog, setOpenClassromDialog] = useState(false)

	const open = Boolean(anchorElForList)
	const currentYear = getCurACYear()

	const handleIconClick = (event) => {
		setAnchorElForList(event.currentTarget)
	}

	const handleCloseListPopover = () => {
		setAnchorElForList(null)
	}

	const invalidTest = ['', undefined, null]
	useEffect(() => {
		if (!invalidTest.includes(teachersRowData)) {
			const keys = Object.keys(inputs).filter((key) =>
				Object.keys(teachersRowData).includes(key),
			)

			const obj = {}
			keys.forEach((key) => {
				obj[key] = teachersRowData[key]
			})

			// Extracting className and section from classRoomIds
			if (teachersRowData?.classRoomIds?.length > 0) {
				obj.className = [
					...new Set(
						teachersRowData.classRoomIds.map((c) => c.className),
					),
				]
				obj.section = [
					...new Set(
						teachersRowData.classRoomIds.map((c) => c.section),
					),
				]
				obj.classRoomIds = teachersRowData.classRoomIds.map(
					(c) => c._id,
				)
			}

			setInputs((state) => ({ ...state, ...obj }))
		}
	}, [teachersRowData])

	useEffect(() => {
		setOrigionalData(teachersFormData)
	}, [origionalData])

	useEffect(() => {
		const isDataEqual = isDataObjectsEqual(origionalData, inputs)
		setEnableSubmit(isDataEqual)
	}, [origionalData, inputs])

	useEffect(() => {
		getClasslistForTeachers(
			dispatch,
			inputs?.schoolId ? inputs : teachersRowData,
			setClasslist,
			setSectionOptions,
		)
	}, [inputs?.schoolId, teachersRowData])

	useEffect(() => {
		if (openClassromDialog && teachersRowData)
			dispatch(getTeachersClassrooms(teachersRowData?._id))
	}, [openClassromDialog])

	return (
		<>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					m: '20px 0px',
				}}
			>
				<Box
					sx={{
						p: '8px 16px',
						bgcolor: 'globalElementColors.lightGreen',
						display: 'inline-block',
						borderRadius: '6px',
						fontWeight: 900,
					}}
				>
					{localizationConstants.teacherId} -{' '}
					{teachersRowData?.teacher_id}
				</Box>

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
			</Box>

			<Box sx={{ pb: '20px' }}>
				<Box>
					<CustomTextfield
						formSx={{ width: '100%' }}
						propSx={{ height: '44px' }}
						fieldSx={redBorderForCustomTextField(
							errors.teacherName,
						)}
						labelTypoSx={{ fontSize: '14px', pb: '4px' }}
						labelText={`${localizationConstants.teacherFirstName} *`}
						value={inputs?.teacherName}
						onChange={(e) => {
							handleInputs(
								e,
								setInputs,
								inputs,
								setTeachersFormData,
							)
							errors.teacherName &&
								handleErrors('teacherName', false)
						}}
						disabled={!isEditBtnClicked}
						name='teacherName'
						placeholder={localizationConstants.enterTeacherName}
					/>
				</Box>
			</Box>

			<Box>
				<Typography
					variant={typographyConstants.body}
					sx={{ color: 'textColors.grey', fontWeight: 400 }}
				>
					{localizationConstants.gender}
					{localizationConstants.required}
				</Typography>

				<CustomAutocompleteNew
					options={['Male', 'Female']}
					sx={{
						minWidth: '200px',
						width: '100%',
						height: '48px',
						borderRadius: '10px',
					}}
					fieldSx={{
						height: '48px',
						...redBorderForCustomSelect(errors.gender),
					}}
					value={inputs?.gender}
					onChange={(e) => {
						handleInputs(
							{ target: { value: e, name: 'gender' } },
							setInputs,
							inputs,
							setTeachersFormData,
						)
						errors.gender && handleErrors('gender', false)
					}}
					name='gender'
					placeholder={localizationConstants.selectGender}
					disabled={!isEditBtnClicked}
				/>
			</Box>

			<Box sx={{ p: '24px 0px' }}>
				<Typography
					variant={typographyConstants.body}
					sx={{ color: 'textColors.grey', fontWeight: 400 }}
				>
					{localizationConstants.schoolName}
					{localizationConstants.required}
				</Typography>
				<CustomAutocompleteNew
					options={transformedSchools}
					sx={{
						minWidth: '200px',
						width: '100%',
						height: '48px',
						borderRadius: '10px',
					}}
					fieldSx={{
						height: '48px',
						...redBorderForCustomSelect(errors.schoolId),
					}}
					value={inputs?.schoolId}
					onChange={(e) => {
						handleInputs(
							{ target: { value: e, name: 'schoolId' } },
							setInputs,
							inputs,
							setTeachersFormData,
						)
						errors.SchoolId && handleErrors('schoolId', false)
					}}
					name='schoolId'
					placeholder={localizationConstants.selectSchoolName}
					disabled={true}
				/>
			</Box>

			<Box sx={{ pb: '24px' }}>
				<CustomTextfield
					formSx={{ width: '100%' }}
					propSx={{ height: '44px' }}
					fieldSx={redBorderForCustomTextField(errors.email)}
					labelTypoSx={{ fontSize: '14px', pb: '4px' }}
					labelText={`${localizationConstants.emailCapitalId} *`}
					value={inputs?.email}
					onChange={(e) => {
						handleInputs(e, setInputs, inputs, setTeachersFormData)
						errors.email && handleErrors('email', false)
					}}
					disabled={!isEditBtnClicked}
					name='email'
					placeholder={localizationConstants.enterEmailId}
				/>
			</Box>

			<Box sx={{ pb: '24px' }}>
				<CustomTextfield
					formSx={{ width: '100%' }}
					propSx={{ height: '44px' }}
					labelTypoSx={{ fontSize: '14px', pb: '4px' }}
					labelText={`${localizationConstants.mobileNumberOptional}`}
					value={inputs?.mobileNumber}
					onChange={(e) =>
						handleInputs(e, setInputs, inputs, setTeachersFormData)
					}
					disabled={!isEditBtnClicked}
					name='mobileNumber'
					placeholder={localizationConstants.enterMobileNumber}
					type='number'
				/>
			</Box>
			{!isEditBtnClicked && (
				<Box sx={{ pb: '24px' }}>
					<Typography
						variant={typographyConstants.body}
						sx={{ color: 'textColors.grey', fontWeight: 400 }}
					>
						{localizationConstants.classrooms}
						{` (${currentYear})`}
					</Typography>
					<CustomMultiSelectAutoComplete
						options={[
							...new Set(
								classlist?.map((clas) => clas.className),
							),
						]}
						sx={{
							minWidth: '200px',
							width: '100%',
							height: '44px',
							borderRadius: '6px',
						}}
						fieldSx={{ borderRadius: '6px' }}
						value={inputs?.className}
						onChange={(e) =>
							handleInputs(
								{ target: { value: e, name: 'className' } },
								setInputs,
								inputs,
								setTeachersFormData,
								classlist,
								setSectionOptions,
							)
						}
						disabled={true}
						name='className'
						placeholder={localizationConstants.selectClassRooms}
					/>
				</Box>
			)}
			{!isEditBtnClicked && (
				<Box sx={{ pb: '24px', mt: '6px' }}>
					<Typography
						variant={typographyConstants.body}
						sx={{ color: 'textColors.grey', fontWeight: 400 }}
					>
						{localizationConstants.sections}
						{` (${currentYear})`}
					</Typography>
					<CustomMultiSelectAutoComplete
						options={sectionOptions}
						sx={{
							minWidth: '200px',
							width: '100%',
							height: '44px',
							borderRadius: '6px',
						}}
						fieldSx={{ borderRadius: '6px' }}
						value={inputs?.section}
						onChange={(e) =>
							handleInputs(
								{ target: { value: e, name: 'section' } },
								setInputs,
								inputs,
								setTeachersFormData,
								classlist,
								setSectionOptions,
							)
						}
						disabled={true}
						name='section'
						placeholder={localizationConstants.selectSection}
					/>
				</Box>
			)}

			<TeacherActionsPopover
				open={open}
				anchorElForList={anchorElForList}
				handleCloseListPopover={handleCloseListPopover}
				setIsEditBtnClicked={setIsEditBtnClicked}
				setDeleteTeachersDialog={setDeleteTeachersDialog}
				setOpenClassromDialog={setOpenClassromDialog}
			/>

			<TeacherAcademicClassroomsDialog
				isOpen={openClassromDialog}
				onClose={() => setOpenClassromDialog(false)}
				title={localizationConstants.teacherAcademicClassrooms}
				academicYears={academicYears}
				teachersRowData={teachersRowData}
				refreshList={refreshList}
				setTeachersRowData={setTeachersRowData}
			/>
		</>
	)
}

export default TeacherForm
