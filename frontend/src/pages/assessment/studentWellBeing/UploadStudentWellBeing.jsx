import React, { useState, memo, useEffect, useRef } from 'react'
import { Box, Typography } from '@mui/material'
import FileUploadDialog from '../../../components/FileUploadDialog'
import useCommonStyles from '../../../components/styles'
import { useDispatch, useSelector } from 'react-redux'
import {
	downloadExcel,
	getAcademicYearsList,
	getCurrentAcademicYearId,
	getUserFromLocalStorage,
	initialuploadSelectOptionsStates,
} from '../../../utils/utils'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { iconConstants } from '../../../resources/theme/iconConstants'
import CustomDialog from '../../../components/CustomDialog'
import { ErrorMsgsExcelDownload } from '../../initiations/baseline/baselineFunctions'
import { StudentWellBeingUploadDefaultExcelColumns } from './studentWellBeingConstants'
import { uploadStudentWellBeingData } from './studentWellBeingFunctions'
import { getSchoolsList } from '../../../redux/commonSlice'
import { bulkUploadMandatoryKeys } from '../../../utils/globalConstants'

const UploadStudentWellBeing = ({ modal, handleModal, refreshList }) => {
	const flexStyles = useCommonStyles()
	const dispatch = useDispatch()
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const { schoolsList } = useSelector((store) => store.commonData)
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
	const [excelTableData, setExcelTableData] = useState({})
	const counsellor = getUserFromLocalStorage()
	const [deleteBulkDialog, setDeleteBulkDialog] = useState(false)
	const [response, setResponse] = useState('')

	const [selectedOptionsData, setSelctedOptionsData] = useState(
		initialuploadSelectOptionsStates,
	)

	const fetchSchoolList = () => {
		if (selectedOptionsData.selectdAY) {
			const body = {
				filter: { academicYear: selectedOptionsData.selectdAY },
			}
			dispatch(getSchoolsList({ body }))
		}
	}

	useEffect(() => {
		if (Array.isArray(excelTableData) && excelTableData?.length > 0) {
			uploadStudentWellBeingData(
				dispatch,
				excelTableData,
				setInputFileObject,
				counsellor?.profile?.fullName,
				setDeleteBulkDialog,
				setResponse,
				refreshList,
				selectedOptionsData?.selectdAY,
				selectedOptionsData?.selectdSchool,
			)
		}
	}, [excelTableData])

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

	useEffect(() => {
		fetchSchoolList()
	}, [selectedOptionsData.selectdAY])

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
						{localizationConstants.studentIdMsg}{' '}
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
							{localizationConstants.dateOfAssessment}{' '}
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
							{
								localizationConstants.childrenHopeScaleBulkUploadTitle
							}{' '}
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
						{localizationConstants.chsInstructionMsg}{' '}
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
							{
								localizationConstants.psychologicalWBScaleBulkUploadTitle
							}{' '}
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
						{localizationConstants.pwbInstructionMsg}{' '}
					</Typography>
				</Box>
			</Box>
		</>
	)

	return (
		<Box>
			<FileUploadDialog
				open={modal.upload}
				width='100px'
				inputFileObject={inputFileObject}
				setOutputFileObject={setOutputFileObject}
				setExcelTableData={setExcelTableData}
				handleUploadFormClose={(e) => handleModal('upload', false)}
				type='sheet'
				handleExcelDownload={(e) => {
					e.stopPropagation()
					downloadExcel(
						StudentWellBeingUploadDefaultExcelColumns(),
						'StudentWellBeing.xlsx',
					)
				}}
				Content={content}
				isAcyRequired={true}
				acyOptions={getAcademicYearsList(academicYears)}
				isSchoolListReq={true}
				selectedOptionsData={selectedOptionsData}
				setSelctedOptionsData={setSelctedOptionsData}
				schoolOptions={
					schoolsList.map((obj) => ({
						label: `${obj.school} (${obj.scCode})`,
						id: obj._id,
					})) || []
				}
				mandatoryKeys={bulkUploadMandatoryKeys.studentWellBeingRecords}
			/>
			<CustomDialog
				isOpen={deleteBulkDialog}
				onClose={() => setDeleteBulkDialog(false)}
				title={`${localizationConstants?.oops} !`}
				iconName={iconConstants.errorFile}
				titleSx={{
					color: 'textColors.red',
					fontWeight: 500,
					pb: '20px',
				}}
				titleTypoVariant={typographyConstants.h4}
				message={localizationConstants.errorFileDownloadMsg}
				messageTypoVariant={typographyConstants.h5}
				leftButtonText={localizationConstants.closeCamel}
				rightButtonText={`${localizationConstants.download} File`}
				onLeftButtonClick={() => {
					setDeleteBulkDialog(false)
				}}
				onRightButtonClick={() => {
					ErrorMsgsExcelDownload(
						response,
						setDeleteBulkDialog,
						'Student Well Being Validation Error.xlsx',
					)
				}}
			/>
		</Box>
	)
}

export default memo(UploadStudentWellBeing)
