import React, { useEffect, useState, memo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useCommonStyles from '../../../components/styles'
import { ErrorMsgDownload, uploadStudentData } from './studentsFunctions'
import { Box, Typography } from '@mui/material'
import FileUploadDialog from '../../../components/FileUploadDialog'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import {
	downloadExcel,
	getCurrentAcademicYearId,
	initialuploadSelectOptionsStates,
} from '../../../utils/utils'
import { studentUploadDefaultExcelColumns } from './studentsConstants'
import { iconConstants } from '../../../resources/theme/iconConstants'
import CustomDialog from '../../../components/CustomDialog'
import { getSchoolsList } from '../../../redux/commonSlice'
import { bulkUploadMandatoryKeys } from '../../../utils/globalConstants'

const UploadStudent = ({
	modal,
	handleModal,
	refreshList,
	setResponse,
	setUploadErrorsDialog,
}) => {
	const flexStyles = useCommonStyles()
	const dispatch = useDispatch()
	const { schoolsList } = useSelector((store) => store.commonData)
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const [inputFileObject, setInputFileObject] = useState({
		fileName: '',
		file: '',
		fileUrl: '',
		extensionError: false,
	})

	const [outputFileObject, setOutputFileObject] = useState({
		fileName: '',
		file: '',
		fileUrl: '',
		extensionError: false,
	})
	const [selectedOptionsData, setSelctedOptionsData] = useState(
		initialuploadSelectOptionsStates,
	)
	const [AYError, setAYError] = useState(false)

	const content = (
		<>
			<Box sx={{ display: 'flex', mb: '20px', mt: '24px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box sx={{ display: 'flex', gap: '3px' }}>
						<Typography variant={typographyConstants.body}>
							{' '}
							{localizationConstants.studentId}{' '}
						</Typography>
						<Typography
							sx={{
								color: 'red',
							}}
						>
							{'*'}
						</Typography>
					</Box>
					<Typography variant={typographyConstants.body}>
						:
					</Typography>
				</Box>
				<Box sx={{ width: '58%', mx: '1%', ml: '10px' }}>
					<Typography variant={typographyConstants.body}>
						{' '}
						{localizationConstants.studentIdCreateMsg}{' '}
					</Typography>
				</Box>
			</Box>

			<Box sx={{ display: 'flex', mb: '20px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box sx={{ display: 'flex', gap: '3px' }}>
						<Typography variant={typographyConstants.body}>
							{' '}
							{localizationConstants.classroom}{' '}
						</Typography>
						<Typography
							sx={{
								color: 'red',
							}}
						>
							{'*'}
						</Typography>
					</Box>
					<Typography variant={typographyConstants.body}>
						:
					</Typography>
				</Box>
				<Box sx={{ width: '58%', ml: '10px' }}>
					<Typography variant={typographyConstants.body}>
						{' '}
						{localizationConstants.classNameMsg}
					</Typography>
				</Box>
			</Box>
			<Box sx={{ display: 'flex', mb: '20px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box sx={{ display: 'flex', gap: '3px' }}>
						<Typography variant={typographyConstants.body}>
							{' '}
							{localizationConstants.section}{' '}
						</Typography>
						<Typography
							sx={{
								color: 'red',
							}}
						>
							{'*'}
						</Typography>
					</Box>
					<Typography variant={typographyConstants.body}>
						:
					</Typography>
				</Box>
				<Box sx={{ width: '58%', ml: '10px' }}>
					<Typography variant={typographyConstants.body}>
						{' '}
						{localizationConstants.sectionMsg}{' '}
					</Typography>
				</Box>
			</Box>
			<Box sx={{ display: 'flex', mb: '20px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box sx={{ display: 'flex', gap: '3px' }}>
						<Typography variant={typographyConstants.body}>
							{' '}
							{localizationConstants.studentsName}{' '}
						</Typography>
						<Typography
							sx={{
								color: 'red',
							}}
						>
							{'*'}
						</Typography>
					</Box>
					<Typography variant={typographyConstants.body}>
						:
					</Typography>
				</Box>
				<Box sx={{ width: '58%', ml: '10px' }}>
					<Typography variant={typographyConstants.body}>
						{' '}
						{localizationConstants.studentsNameMsg}{' '}
					</Typography>
				</Box>
			</Box>

			<Box sx={{ display: 'flex', mb: '20px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box sx={{ display: 'flex', gap: '3px' }}>
						<Typography variant={typographyConstants.body}>
							{' '}
							{localizationConstants.RegNo}{' '}
						</Typography>
						<Typography
							sx={{
								color: 'red',
							}}
						>
							{'*'}
						</Typography>
					</Box>
					<Typography variant={typographyConstants.body}>
						:
					</Typography>
				</Box>
				<Box sx={{ width: '58%', ml: '10px' }}>
					<Typography variant={typographyConstants.body}>
						{' '}
						{localizationConstants.RegNoMsg}{' '}
					</Typography>
				</Box>
			</Box>

			<Box sx={{ display: 'flex', mb: '20px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box sx={{ display: 'flex', gap: '3px' }}>
						<Box sx={{ display: 'flex', gap: '3px' }}>
							<Typography variant={typographyConstants.body}>
								{' '}
								{localizationConstants.regDate}{' '}
							</Typography>
							<Typography
								sx={{
									color: 'red',
								}}
							>
								{'*'}
							</Typography>
						</Box>
					</Box>
					<Typography variant={typographyConstants.body}>
						:
					</Typography>
				</Box>
				<Box sx={{ width: '58%', ml: '10px' }}>
					<Typography variant={typographyConstants.body}>
						{' '}
						{localizationConstants.regDateFormatMsg}{' '}
					</Typography>
				</Box>
			</Box>

			<Box sx={{ display: 'flex', mb: '20px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box sx={{ display: 'flex', gap: '3px' }}>
						<Box sx={{ display: 'flex', gap: '3px' }}>
							<Typography variant={typographyConstants.body}>
								{' '}
								{localizationConstants.nationality}{' '}
							</Typography>
						</Box>
					</Box>
					<Typography variant={typographyConstants.body}>
						:
					</Typography>
				</Box>
				<Box sx={{ width: '58%', ml: '10px' }}>
					<Typography variant={typographyConstants.body}>
						{' '}
						{localizationConstants.nationalityMsg}{' '}
					</Typography>
				</Box>
			</Box>

			<Box sx={{ display: 'flex', mb: '20px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box sx={{ display: 'flex', gap: '3px' }}>
						<Typography variant={typographyConstants.body}>
							{' '}
							{localizationConstants.dob}{' '}
						</Typography>
						<Typography
							sx={{
								color: 'red',
							}}
						>
							{'*'}
						</Typography>
					</Box>
					<Typography variant={typographyConstants.body}>
						:
					</Typography>
				</Box>
				<Box sx={{ width: '58%', ml: '10px' }}>
					<Typography variant={typographyConstants.body}>
						{' '}
						{localizationConstants.dateFormatMsg}{' '}
					</Typography>
				</Box>
			</Box>

			<Box sx={{ display: 'flex', mb: '20px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box sx={{ display: 'flex', gap: '3px' }}>
						<Typography variant={typographyConstants.body}>
							{' '}
							{localizationConstants.gender}{' '}
						</Typography>
						<Typography
							sx={{
								color: 'red',
							}}
						>
							{'*'}
						</Typography>
					</Box>
					<Typography variant={typographyConstants.body}>
						:
					</Typography>
				</Box>
				<Box sx={{ width: '58%', ml: '10px' }}>
					<Typography variant={typographyConstants.body}>
						{' '}
						{localizationConstants.studentGenderMsg}{' '}
					</Typography>
				</Box>
			</Box>

			<Box sx={{ display: 'flex', mb: '20px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box sx={{ display: 'flex', gap: '3px' }}>
						<Typography variant={typographyConstants.body}>
							{' '}
							{localizationConstants.blood_Group}{' '}
						</Typography>
					</Box>
					<Typography variant={typographyConstants.body}>
						:
					</Typography>
				</Box>
				<Box sx={{ width: '58%', ml: '10px' }}>
					<Typography variant={typographyConstants.body}>
						{' '}
						{localizationConstants.studentBGMsg}{' '}
					</Typography>
				</Box>
			</Box>

			<Box sx={{ display: 'flex', mb: '20px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box sx={{ display: 'flex', gap: '3px' }}>
						<Typography variant={typographyConstants.body}>
							{' '}
							{localizationConstants.fathersName}{' '}
						</Typography>
					</Box>
					<Typography variant={typographyConstants.body}>
						:
					</Typography>
				</Box>
				<Box sx={{ width: '58%', ml: '10px' }}>
					<Typography variant={typographyConstants.body}>
						{' '}
						{localizationConstants.fathersNameMsg}{' '}
					</Typography>
				</Box>
			</Box>

			<Box sx={{ display: 'flex', mb: '20px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box sx={{ display: 'flex', gap: '3px' }}>
						<Typography variant={typographyConstants.body}>
							{' '}
							{localizationConstants.mothersName}{' '}
						</Typography>
					</Box>
					<Typography variant={typographyConstants.body}>
						:
					</Typography>
				</Box>
				<Box sx={{ width: '58%', ml: '10px' }}>
					<Typography variant={typographyConstants.body}>
						{' '}
						{localizationConstants.mothersNameMsg}{' '}
					</Typography>
				</Box>
			</Box>

			<Box sx={{ display: 'flex', mb: '20px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box sx={{ display: 'flex', gap: '3px' }}>
						<Typography variant={typographyConstants.body}>
							{' '}
							{localizationConstants.email}{' '}
						</Typography>
					</Box>
					<Typography variant={typographyConstants.body}>
						:
					</Typography>
				</Box>
				<Box sx={{ width: '58%', ml: '10px' }}>
					<Typography variant={typographyConstants.body}>
						{' '}
						{localizationConstants.emailMsg}{' '}
					</Typography>
				</Box>
			</Box>

			<Box sx={{ display: 'flex', mb: '20px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box sx={{ display: 'flex', gap: '3px' }}>
						<Typography variant={typographyConstants.body}>
							{' '}
							{localizationConstants.Phone_no}{' '}
						</Typography>
					</Box>
					<Typography variant={typographyConstants.body}>
						:
					</Typography>
				</Box>
				<Box sx={{ width: '58%', ml: '10px' }}>
					<Typography variant={typographyConstants.body}>
						{' '}
						{localizationConstants.Phone_noMsg}{' '}
					</Typography>
				</Box>
			</Box>

			<Box sx={{ display: 'flex', mb: '20px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box sx={{ display: 'flex', gap: '3px' }}>
						<Typography variant={typographyConstants.body}>
							{' '}
							{'profilePicture'}{' '}
						</Typography>
					</Box>
					<Typography variant={typographyConstants.body}>
						:
					</Typography>
				</Box>
				<Box sx={{ width: '58%', ml: '10px' }}>
					<Typography variant={typographyConstants.body}>
						{' '}
						{'Profile Picture of the Student'}{' '}
					</Typography>
				</Box>
			</Box>
			<Box sx={{ display: 'flex', mb: '20px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box sx={{ display: 'flex', gap: '3px' }}>
						<Typography variant={typographyConstants.body}>
							{' '}
							{'profilePicUrl'}{' '}
						</Typography>
					</Box>
					<Typography variant={typographyConstants.body}>
						:
					</Typography>
				</Box>
				<Box sx={{ width: '58%', ml: '10px' }}>
					<Typography variant={typographyConstants.body}>
						{' '}
						{'Profile Picture Url Picture of the Student'}{' '}
					</Typography>
				</Box>
			</Box>
		</>
	)
	const isInitialLoad = useRef(true)
	useEffect(() => {
		if (academicYears.length > 0 && isInitialLoad.current) {
			const currentAYId = getCurrentAcademicYearId(academicYears)
			if (currentAYId) {
				setSelctedOptionsData((state) => ({
					...state,
					selectdAY: currentAYId,
				}))
			}
			isInitialLoad.current = false
		}
	}, [academicYears])

	const fetchSchoolList = () => {
		if (selectedOptionsData.selectdAY) {
			const body = {
				filter: { academicYear: selectedOptionsData.selectdAY },
			}
			dispatch(getSchoolsList({ body }))
		}
	}

	useEffect(() => {
		fetchSchoolList()
	}, [selectedOptionsData.selectdAY])

	const selectedAcy = academicYears.find(
		(acy) => acy._id === selectedOptionsData.selectdAY,
	)
	const acyOption = selectedAcy
		? [{ id: selectedAcy._id, label: selectedAcy.academicYear }]
		: null

	const schoolListOptions =
		schoolsList.map((obj) => ({
			label: `${obj.school} (${obj.scCode})`,
			id: obj._id,
		})) || []

	return (
		<Box>
			<FileUploadDialog
				open={modal.upload}
				width='500px'
				inputFileObject={inputFileObject}
				setOutputFileObject={setOutputFileObject}
				setExcelTableData={(data) => {
					if (data && data.length > 0)
						uploadStudentData(
							dispatch,
							data,
							handleModal,
							schoolsList,
							setInputFileObject,
							setUploadErrorsDialog,
							setResponse,
							selectedOptionsData.selectdSchool,
							selectedOptionsData.selectdAY,
							refreshList,
						)
				}}
				handleUploadFormClose={(e) => handleModal('upload', false)}
				handleExcelDownload={(e) => {
					e.stopPropagation()
					downloadExcel(
						studentUploadDefaultExcelColumns,
						'students.xlsx',
					)
				}}
				type='sheet'
				Content={content}
				isSchoolListReq={true}
				isAcyRequired={true}
				selectedOptionsData={selectedOptionsData}
				setSelctedOptionsData={setSelctedOptionsData}
				schoolOptions={schoolListOptions}
				acyOptions={acyOption}
				disableDropDown1={true}
				validateSchoolRequired={true}
				schoolIssueErrorMsg={`${localizationConstants.student} ${localizationConstants.schoolLastPromoteAYerror} ${localizationConstants.student}`}
				mandatoryKeys={bulkUploadMandatoryKeys.students}
			/>
		</Box>
	)
}

export default memo(UploadStudent)
