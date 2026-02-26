import { useEffect, useRef, useState } from 'react'
import { Box, Typography, Button, Alert, LinearProgress } from '@mui/material'
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material'
import ZipUploadExtractor from '../../../components/commonComponents/UploadZipExtractor'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'
import {
	getPresignedUrlForFiles,
	uploadSelModuleSubmit,
} from './SelModuleFunctions'
import { useDispatch, useSelector } from 'react-redux'
import CustomAlertDialogs from '../../../components/commonComponents/CustomAlertDialogs'
import { iconConstants } from '../../../resources/theme/iconConstants'

const months = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
]

const UploadSelModules = () => {
	const dispatch = useDispatch()
	const zipExtractChild = useRef()
	const [selectedYear, setSelectedYear] = useState('')
	const [selectedMonth, setSelectedMonth] = useState('')
	const [monthsList, setMonthsList] = useState([])
	const [yearsList, setYearsList] = useState([])
	const [extractedFiles, setExtractedFiles] = useState([]) // Add this state
	const [isUploading, setIsUploading] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [presignedUrls, setPresignedUrls] = useState([])
	const [uploadAlertDialog, setUploadAlertDialog] = useState(false)

	// Handle files extracted from ZIP
	const handleFilesExtracted = (files) => {
		setExtractedFiles(files)
		setError('')
		getPresignedUrlForFiles(
			dispatch,
			selectedYear,
			selectedMonth,
			files,
			setPresignedUrls,
		)
	}

	// Handle extraction errors
	const handleExtractionError = (errorMessage) => {
		setError(errorMessage)
		setExtractedFiles([])
	}

	// Handle form submission
	const uploadZipAndExtract = async (acknowledgement = false) => {
		uploadSelModuleSubmit(
			dispatch,
			selectedYear,
			selectedMonth,
			extractedFiles,
			presignedUrls,
			acknowledgement,
			setUploadAlertDialog,
			setIsUploading,
			() => {
				zipExtractChild.current.clearExtractedFiles()
				setExtractedFiles([])
			},
		)
	}

	const handleYearChange = (year) => {
		const date = new Date()
		const curYear = date.getFullYear()
		let monthslist = []
		if (year === String(curYear)) {
			const curMonthIndex = date.getMonth()
			monthslist = months.slice(curMonthIndex)
		} else {
			monthslist = months
		}
		setSelectedYear(year)
		setMonthsList(monthslist)
		setSelectedMonth(monthslist[0])
	}

	useEffect(() => {
		const date = new Date()
		const curYear = date.getFullYear()
		const years = [String(curYear), String(curYear + 1)]
		const curMonthIndex = date.getMonth()
		setYearsList(years)
		setMonthsList(months.slice(curMonthIndex))
		setSelectedYear(String(curYear))
		setSelectedMonth(months[curMonthIndex])
	}, [])

	return (
		<Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					mb: 4,
				}}
			>
				{/* Year and Month Selection */}
				<Box sx={{ width: '48%' }}>
					<Typography
						variant={typographyConstants.title}
						sx={{
							color: 'textColors.grey',
							fontSize: '14px',
							mb: '4px',
						}}
					>
						{localizationConstants.selectYear} *
					</Typography>
					<CustomAutocompleteNew
						sx={{ width: '100%' }}
						fieldSx={{ height: '44px' }}
						value={selectedYear}
						placeholder={localizationConstants.selectYear}
						onChange={(e) => {
							handleYearChange(e)
						}}
						options={yearsList}
					/>
				</Box>

				<Box sx={{ width: '48%' }}>
					<Typography
						variant={typographyConstants.title}
						sx={{
							color: 'textColors.grey',
							fontSize: '14px',
							mb: '4px',
						}}
					>
						{localizationConstants.selectMonth} *
					</Typography>
					<CustomAutocompleteNew
						sx={{ width: '100%' }}
						fieldSx={{ height: '44px' }}
						value={selectedMonth}
						placeholder={localizationConstants.selectMonth}
						onChange={(e) => {
							setSelectedMonth(e)
						}}
						options={monthsList}
					/>
				</Box>
			</Box>

			{/* ZIP Upload and Extraction Component */}
			<ZipUploadExtractor
				onFilesExtracted={handleFilesExtracted}
				onError={handleExtractionError}
				maxFileSize={500 * 1024 * 1024} // 100MB max
				ref={zipExtractChild}
			/>

			{/* Progress Bar */}
			{isUploading && (
				<Box sx={{ mb: 3 }}>
					<Typography
						variant='body2'
						color='text.secondary'
						gutterBottom
					>
						Uploading files...
					</Typography>
					<LinearProgress />
				</Box>
			)}

			{/* Error Alert */}
			{error && (
				<Alert severity='error' sx={{ mb: 3 }}>
					{error}
				</Alert>
			)}

			{/* Success Alert */}
			{success && (
				<Alert severity='success' sx={{ mb: 3 }}>
					{success}
				</Alert>
			)}

			{/* Upload Button */}
			<Box sx={{ display: 'flex', justifyContent: 'center' }}>
				<Button
					variant='contained'
					size='large'
					onClick={() => {
						uploadZipAndExtract(false)
					}}
					disabled={
						isUploading ||
						extractedFiles.length === 0 ||
						!selectedYear ||
						!selectedMonth
					}
					startIcon={<CloudUploadIcon />}
					sx={{ minWidth: 200 }}
				>
					{isUploading
						? 'Uploading...'
						: `Upload ${extractedFiles.length} Files`}
				</Button>
			</Box>

			<CustomAlertDialogs
				open={uploadAlertDialog}
				setOpen={setUploadAlertDialog}
				type={localizationConstants.selModuleUploadAcknowledgement}
				title={localizationConstants.selModuleAlreadyExist}
				onSubitClick={() => {
					setUploadAlertDialog(false)
					uploadZipAndExtract(true)
				}}
				onCancelClick={() => {
					setUploadAlertDialog(false)
				}}
				iconName={iconConstants}
			/>
		</Box>
	)
}

export default UploadSelModules
