import React, { useState, memo, useEffect, useRef } from 'react'
import { Box, Typography } from '@mui/material'
import FileUploadDialog from '../../../components/FileUploadDialog'
import useCommonStyles from '../../../components/styles'
import { useDispatch, useSelector } from 'react-redux'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { iconConstants } from '../../../resources/theme/iconConstants'
import CustomDialog from '../../../components/CustomDialog'
import { HeadersData, subHeadersData } from './sendCheckListConstants'
import {
	downloadExcelForChecklist,
	uploadSendChecklistData,
} from './sendChecklistFunction'
import {
	getAcademicYearsList,
	getCurrentAcademicYearId,
	initialuploadSelectOptionsStates,
} from '../../../utils/utils'
import { getSchoolsList } from '../../../redux/commonSlice'
import { bulkUploadMandatoryKeys } from '../../../utils/globalConstants'

const UploadSendChecklist = ({
	modal,
	handleModal,
	onUploadChecklist,
	applyFilter,
}) => {
	const flexStyles = useCommonStyles()
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const { schoolsList } = useSelector((store) => store.commonData)
	const dispatch = useDispatch()
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
	const [deleteBulkDialog, setDeleteBulkDialog] = useState(false)
	const [response, setResponse] = useState('')
	const [selectedOptionsData, setSelctedOptionsData] = useState(
		initialuploadSelectOptionsStates,
	)

	useEffect(() => {
		if (Array.isArray(excelTableData) && excelTableData?.length > 0) {
			uploadSendChecklistData(
				dispatch,
				excelTableData,
				handleModal,
				setInputFileObject,
				setDeleteBulkDialog,
				setResponse,
				HeadersData,
				subHeadersData,
				selectedOptionsData.selectdAY,
				selectedOptionsData.selectdSchool,
				onUploadChecklist,
			)
		}
	}, [excelTableData])

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
			<Box sx={{ display: 'flex', mb: '20px', mt: '24px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box sx={{ display: 'flex', gap: '3px' }}>
						<Typography variant={typographyConstants.body}>
							{' '}
							{localizationConstants.value}{' '}
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
						{localizationConstants.valueMsg}{' '}
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

	const schoolListOptions =
		schoolsList.map((obj) => ({
			label: `${obj.school} (${obj.scCode})`,
			id: obj._id,
		})) || []

	return (
		<Box>
			<FileUploadDialog
				open={modal.upload}
				width='100px'
				sheetType={3}
				inputFileObject={inputFileObject}
				setOutputFileObject={setOutputFileObject}
				setExcelTableData={setExcelTableData}
				handleUploadFormClose={(e) => handleModal('upload', false)}
				type='sheet'
				Content={content}
				localExcel={true}
				templatePath={'/SendChecklistTemplate.xlsx'}
				isAcyRequired={true}
				acyOptions={getAcademicYearsList(academicYears)}
				isSchoolListReq={true}
				selectedOptionsData={selectedOptionsData}
				setSelctedOptionsData={setSelctedOptionsData}
				schoolOptions={schoolListOptions}
				mandatoryKeys={bulkUploadMandatoryKeys.sendChecklistRecords}
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
					downloadExcelForChecklist(
						response,
						'Student Checklist Validation Error.xlsx',
						setDeleteBulkDialog,
					)
				}}
			/>
		</Box>
	)
}

export default memo(UploadSendChecklist)
