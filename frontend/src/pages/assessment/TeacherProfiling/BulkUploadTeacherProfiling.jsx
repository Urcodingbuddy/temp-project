import React, { useState, memo, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import FileUploadDialog from '../../../components/FileUploadDialog'
import useCommonStyles from '../../../components/styles'
import { useDispatch } from 'react-redux'
import { downloadExcel, getUserFromLocalStorage } from '../../../utils/utils'

import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { iconConstants } from '../../../resources/theme/iconConstants'
import CustomDialog from '../../../components/CustomDialog'
import { ErrorMsgsExcelDownload } from '../../initiations/baseline/baselineFunctions'
import { TeacherProfilingUploadDefaultExcelColumns } from './teacherProfilingConstants'
import {
	getFilteredMandatoryKeys,
	uploadTeacherProfilingData,
} from './teacherProfilingFunctions'
import { bulkUploadMandatoryKeys } from '../../../utils/globalConstants'

const BulkUploadTeacherProfiling = ({
	modal,
	handleModal,
	refreshList,
	SchoolRowData,
}) => {
	const flexStyles = useCommonStyles()
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
	const counsellor = getUserFromLocalStorage()
	const [deleteBulkDialog, setDeleteBulkDialog] = useState(false)
	const [response, setResponse] = useState('')

	useEffect(() => {
		if (Array.isArray(excelTableData) && excelTableData?.length > 0) {
			uploadTeacherProfilingData(
				dispatch,
				excelTableData,
				setInputFileObject,
				counsellor?.profile?.fullName,
				setDeleteBulkDialog,
				setResponse,
				SchoolRowData._id,
				refreshList,
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
							{localizationConstants.teachersId}{' '}
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
						{localizationConstants.teacherIdMessage}{' '}
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
							{localizationConstants.teachingAttitude}{' '}
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
						{
							localizationConstants.scoreInstructionMsgForTeacherIRI
						}{' '}
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
							{localizationConstants.teachingPractices}{' '}
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
						{
							localizationConstants.scoreInstructionMsgForTeacherProfiling
						}{' '}
					</Typography>
				</Box>
			</Box>

			<Box sx={{ display: 'flex', mb: '20px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box
						sx={{
							display: 'flex',
							gap: '3px',
							whiteSpace: 'nowrap',
						}}
					>
						<Typography variant={typographyConstants.body}>
							{' '}
							{localizationConstants.jobLifeSatisfaction}{' '}
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
						{
							localizationConstants.scoreInstructionMsgForTeacherIRI
						}{' '}
					</Typography>
				</Box>
			</Box>

			<Box sx={{ display: 'flex', mb: '20px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box
						sx={{
							display: 'flex',
							gap: '3px',
							whiteSpace: 'nowrap',
						}}
					>
						<Typography variant={typographyConstants.body}>
							{' '}
							{localizationConstants.discProfile}{' '}
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
						{
							localizationConstants.scoreInstructionMsgForTeacherProfiling
						}{' '}
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
						TeacherProfilingUploadDefaultExcelColumns,
						'Teacher Profiling Template.xlsx',
					)
				}}
				Content={content}
				mandatoryKeys={getFilteredMandatoryKeys(
					SchoolRowData,
					bulkUploadMandatoryKeys.teacherProfilingRecords,
				)}
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
						'Teacher Profiling Validation Error.xlsx',
					)
				}}
			/>
		</Box>
	)
}

export default memo(BulkUploadTeacherProfiling)
