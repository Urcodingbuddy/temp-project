import React, { useState, memo, useEffect, useRef } from 'react'
import { Box, Typography } from '@mui/material'
import FileUploadDialog from '../../../components/FileUploadDialog'
import useCommonStyles from '../../../components/styles'
import { useDispatch, useSelector } from 'react-redux'
import {
	downloadExcel,
	getAcademicYearsList,
	getCurrentAcademicYearId,
	initialuploadSelectOptionsStates,
} from '../../../utils/utils'
import {
	BaselineDataUploadDefaultExcelColumns,
	baselineCategory,
	classGroupExcel,
} from './baselineConstants'
import {
	ErrorMsgsExcelDownload,
	UploadMultipleBaselineData,
} from './baselineFunctions'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { iconConstants } from '../../../resources/theme/iconConstants'
import CustomDialog from '../../../components/CustomDialog'
import { getSchoolsList } from '../../../redux/commonSlice'
import { bulkUploadMandatoryKeys } from '../../../utils/globalConstants'

const UploadBaselineData = ({
	modal,
	handleModal,

	listFilterData,
	setSelectedDropDown,
}) => {
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
			UploadMultipleBaselineData(
				dispatch,
				excelTableData,
				handleModal,
				setInputFileObject,
				setSelectedDropDown,
				setDeleteBulkDialog,
				setResponse,
				selectedOptionsData?.selectdAY,
				selectedOptionsData?.selectdSchool,
				listFilterData,
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

	const schoolListOptions =
		schoolsList.map((obj) => ({
			label: `${obj.school} (${obj.scCode})`,
			id: obj._id,
		})) || []

	const content = (
		<>
			<Box sx={{ display: 'flex', mb: '10px', mt: '24px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box sx={{ display: 'flex', gap: '3px' }}>
						<Typography variant={typographyConstants.body}>
							{' '}
							{localizationConstants.studentCId}{' '}
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

			<Box sx={{ display: 'flex', mb: '10px', mt: '10px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box sx={{ display: 'flex', gap: '3px' }}>
						<Typography variant={typographyConstants.body}>
							{' '}
							{localizationConstants.classGroup}{' '}
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
						{localizationConstants.classGroupInstructionMsg}
					</Typography>
					<Box
						sx={{
							marginTop: '-10px',
							marginBottom: '-15px',
							ml: '-15px',
						}}
					>
						<ul>
							{classGroupExcel.map((cg, index) => (
								<li
									key={cg}
									style={{
										marginBottom:
											classGroupExcel?.length == index + 1
												? '0px'
												: '3px',
									}}
								>
									<Typography
										variant={typographyConstants.body}
									>
										{cg}
									</Typography>
								</li>
							))}
						</ul>
					</Box>
				</Box>
			</Box>
			<Box sx={{ display: 'flex', mb: '10px', mt: '10px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box sx={{ display: 'flex', gap: '3px' }}>
						<Typography variant={typographyConstants.body}>
							{' '}
							{localizationConstants.baselineCategory}{' '}
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
						{localizationConstants.baselineCategoryInstructionMsg}
					</Typography>
					<Box
						sx={{
							marginTop: '-10px',
							marginBottom: '-15px',
							ml: '-15px',
						}}
					>
						<ul>
							{baselineCategory.map((cg, index) => (
								<li
									key={cg}
									style={{
										marginBottom:
											classGroupExcel?.length == index + 1
												? '0px'
												: '3px',
									}}
								>
									<Typography
										variant={typographyConstants.body}
									>
										{cg}
									</Typography>
								</li>
							))}
						</ul>
					</Box>
				</Box>
			</Box>
			<Box sx={{ display: 'flex', mt: '10px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box sx={{ display: 'flex', gap: '3px' }}>
						<Typography variant={typographyConstants.body}>
							{' '}
							{localizationConstants.score}{' '}
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
						{localizationConstants.scoreInstructionMsg0or1}{' '}
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
				handleUploadFormClose={(e) => {
					handleModal('upload', false)
					setSelectedDropDown('')
				}}
				type='sheet'
				handleExcelDownload={(e) => {
					e.stopPropagation()
					downloadExcel(
						BaselineDataUploadDefaultExcelColumns,
						'BaselineData.xlsx',
					)
				}}
				Content={content}
				isAcyRequired={true}
				acyOptions={getAcademicYearsList(academicYears)}
				isSchoolListReq={true}
				selectedOptionsData={selectedOptionsData}
				setSelctedOptionsData={setSelctedOptionsData}
				schoolOptions={schoolListOptions}
				mandatoryKeys={bulkUploadMandatoryKeys.baslineRecords}
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
						'Student BaseLine Validation Error.xlsx',
					)
				}}
			/>
		</Box>
	)
}

export default memo(UploadBaselineData)
