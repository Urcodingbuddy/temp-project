import React, { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Typography, Box, Grid, Dialog } from '@mui/material'
import { useTranslation } from 'react-i18next'
import CustomIcon from './CustomIcon'
import * as XLSX from 'xlsx'
import { commonComponentStyles } from './commonComponentStyles'
import { localizationConstants } from '../resources/theme/localizationConstants'
import CustomButton from './CustomButton'
import { typographyConstants } from '../resources/theme/typographyConstants'
import { iconConstants } from '../resources/theme/iconConstants'
import useCommonStyles from './styles'
import { checklistOptions } from '../pages/initiations/sendCheckList/sendCheckListConstants'
import CustomAutocompleteNew from './commonComponents/CustomAutoComplete'
import { useSelector } from 'react-redux'
import CustomAlertDialogs from './commonComponents/CustomAlertDialogs'
import { store } from '../store'
import { updateToastData } from '../toast/toastSlice'

const FileUploadDialog = ({
	open,
	sheetType = 1,
	type = 'image',
	width,
	handleUploadFormClose,
	inputFileObject,
	setOutputFileObject,
	setExcelTableData = () => {},
	handleExcelDownload,
	maxSize = '2097152',
	Content = '',
	className = '',
	style = '',
	required = true,
	pr = '',
	localExcel = false,
	templatePath,
	isAcyRequired = false,
	isSchoolListReq = false,
	isLastPromotedAcyReq = false,
	acyOptions,
	schoolOptions,
	aysOptionsGreaterLPAcy,
	setSelctedOptionsData,
	selectedOptionsData,
	disableDropDown1 = false,
	disableDropDown2 = false,
	disableDropDown3 = false,
	validateSchoolRequired = false,
	schoolIssueErrorMsg = '',
	mandatoryKeys = [], // NEW PROP: List of keys to validate rows or columns
}) => {
	const { t } = useTranslation()
	const classes = useCommonStyles()
	const [fileObject, setFileObject] = useState(inputFileObject)
	const [excelData, setExcelData] = useState()
	const [fileName, setFileName] = useState('')
	const [rejectedFile, setRejectedFile] = useState('')
	const [isSchoolLastPromoteError, setIsSchoolLastPromoteError] =
		useState(false)
	const flexStyles = useCommonStyles()
	const [openWarningDialog, setOpenWarningDialog] = useState(false)
	const { schoolsList } = useSelector((store) => store.commonData)

	// NEW STATES for validation
	const [validCount, setValidCount] = useState(0)
	const [invalidCount, setInvalidCount] = useState(0)

	useEffect(() => {
		setFileObject(inputFileObject)
	}, [inputFileObject])

	useEffect(() => {
		if (open === false) {
			setFileName('')
			setValidCount(0)
			setInvalidCount(0)
		}
	}, [open])

	const handleSaveClick = (e) => {
		e.preventDefault()
		setRejectedFile('')
		setOpenWarningDialog(true)
	}

	const handleDialogSubmit = () => {
		if (fileObject.fileUrl !== '') {
			setOutputFileObject(fileObject)
			handleUploadFormClose()

			if (type === 'sheet') {
				if (
					excelData === undefined ||
					excelData === null ||
					excelData?.length <= 0
				) {
					store.dispatch(
						updateToastData({
							showToast: true,
							title: '',
							subTitle: localizationConstants.invlaidExcelFile,
							isSuccess: false,
							multipleError: [],
							direction: 'right',
						}),
					)
				}
				setExcelTableData(excelData)
			}
		}
		setOpenWarningDialog(false)
	}

	// Helper: validate rows or columns
	const validateExcelData = (data) => {
		if (!mandatoryKeys.length) {
			setValidCount(data?.length || 0)
			setInvalidCount(0)
			return
		}

		let valid = 0
		let invalid = 0

		if (sheetType === 1) {
			// row based
			data.forEach((row) => {
				const missing = mandatoryKeys.some(
					(key) =>
						!row[key] ||
						row[key] === undefined ||
						row[key] === null ||
						row[key].toString().trim() === '',
				)
				if (missing) invalid++
				else valid++
			})
		} else if (sheetType === 2) {
			// column based
			const maxLen = Math.max(
				...Object.values(data).map((arr) => arr.length),
			)
			for (let i = 0; i < maxLen; i++) {
				const missing = mandatoryKeys.some((key) => {
					const arr = data[key] || []
					return (
						!arr[i] ||
						arr[i] === undefined ||
						arr[i] === null ||
						arr[i].toString().trim() === ''
					)
				})
				if (missing) invalid++
				else valid++
			}
		} else if (sheetType === 3) {
			// row based again (similar to sheetType 1)
			data.forEach((row) => {
				const missing = mandatoryKeys.some(
					(key) =>
						!row[key] ||
						row[key] === undefined ||
						row[key] === null ||
						row[key].toString().trim() === '',
				)
				if (missing) invalid++
				else valid++
			})
		}

		setValidCount(valid)
		setInvalidCount(invalid)
	}

	const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
		const rejectedFileSize =
			rejectedFiles?.length > 0 && rejectedFiles[0]?.file.size > maxSize
		setRejectedFile(rejectedFileSize)

		acceptedFiles.forEach((item) => {
			if (type === 'sheet') {
				if (
					item.type !== 'text/csv' && // FIX: csv type
					item.type !== 'application/vnd.ms-excel' &&
					item.type !==
						'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
				) {
					setFileObject({ ...fileObject, extensionError: true })
					return
				} else setFileObject({ ...fileObject, extensionError: false })
			}

			if (type === 'image') {
				if (item.type !== 'image/png' && item.type !== 'image/jpeg') {
					setFileObject({ ...fileObject, extensionError: true })
					return
				} else setFileObject({ ...fileObject, extensionError: false })
			}

			const file = acceptedFiles[0]
			setFileName(file.name)
			const reader = new FileReader()
			if (type === 'sheet') {
				reader.onload = (e) => {
					setFileObject({
						...fileObject,
						fileName: Date.now() + file.name,
						fileUrl: reader.result,
						file: file,
					})
					const data = new Uint8Array(e.target.result)
					const workbook = XLSX.read(data, { type: 'array' })
					const sheet = workbook.Sheets[workbook.SheetNames[0]]
					const rows = XLSX.utils.sheet_to_json(sheet, {
						header: 1,
						raw: false,
					})
					const headers = rows.shift()
					if (sheetType === 1) {
						const extractedDataInRows = rows
							.map((row) => {
								const rowData = {}
								headers.forEach((header, index) => {
									rowData[header] = row[index]
								})
								return rowData
							})
							.filter((obj) => {
								for (let key in obj) {
									if (
										obj[key] !== '' &&
										obj[key] !== undefined
									)
										return true
								}
								return false
							})
						setExcelData(extractedDataInRows)
						validateExcelData(extractedDataInRows)
					} else if (sheetType === 2) {
						const extractedDataInColumns = {}
						headers.forEach((header, index) => {
							const colData = []
							rows.forEach((row) => {
								const cellValue = row[index]
								if (
									cellValue !== undefined &&
									cellValue !== null &&
									cellValue !== ''
								) {
									colData.push(cellValue)
								}
							})
							extractedDataInColumns[header] = colData
						})
						setExcelData(extractedDataInColumns)
						validateExcelData(extractedDataInColumns)
					} else if (sheetType === 3) {
						// Existing sheetType 3 logic untouched
						const sheet1 = workbook.Sheets[workbook.SheetNames[0]]
						const sheet2 = workbook.Sheets[workbook.SheetNames[1]]
						const rowsData1 = XLSX.utils.sheet_to_json(sheet1, {
							header: 1,
							range: 0,
							raw: false,
						})
						const rowsData2 = XLSX.utils.sheet_to_json(sheet2, {
							header: 1,
							range: 0,
							raw: false,
						})
						const headersData1 = []
						rowsData1?.forEach((d) => {
							if (d?.[0]) headersData1.push(d?.[0]?.trim())
						})
						const extractedData = []
						const maxCols1 = rowsData1.reduce(
							(max, row) => Math.max(max, row.length),
							0,
						)
						const row1OfrowsData1 = []

						for (let col = 0; col < maxCols1; col++) {
							const firstRowValue = rowsData1[0]?.[col] ?? ''
							// If first row empty, check if any value exists below in this column
							const hasDataBelow = rowsData1.some(
								(row, rowIndex) =>
									rowIndex > 0 &&
									row[col] !== undefined &&
									row[col] !== '',
							)
							if (firstRowValue || hasDataBelow) {
								row1OfrowsData1[col] = firstRowValue || '' // force include column, even if ''
							}
						}

						row1OfrowsData1?.forEach((data, colIndex) => {
							const obj = {}

							if (colIndex !== 0) {
								headersData1?.forEach((header, hIndex) => {
									obj[header] =
										rowsData1[hIndex][colIndex] ?? ''
								})
								extractedData.push({
									...obj,
									checklistForm: checklistOptions[0],
								})
							}
						})

						const headersData2 = []
						rowsData2?.forEach((d) => {
							if (d?.[0]) headersData2.push(d?.[0]?.trim())
						})
						const maxCols2 = rowsData2.reduce(
							(max, row) => Math.max(max, row.length),
							0,
						)
						const row1OfrowsData2 = []

						for (let col = 0; col < maxCols2; col++) {
							const firstRowValue = rowsData2[0]?.[col] ?? ''
							const hasDataBelow = rowsData2.some(
								(row, rowIndex) =>
									rowIndex > 0 &&
									row[col] !== undefined &&
									row[col] !== '',
							)
							if (firstRowValue || hasDataBelow) {
								row1OfrowsData2[col] = firstRowValue || ''
							}
						}
						row1OfrowsData2?.forEach((data, colIndex) => {
							const obj = {}
							if (colIndex !== 0) {
								headersData2?.forEach((header, hIndex) => {
									obj[header] =
										rowsData2[hIndex][colIndex] ?? ''
								})
								extractedData.push({
									...obj,
									checklistForm: checklistOptions[1],
								})
							}
						})
						setExcelData(extractedData)
						validateExcelData(extractedData)
					}
				}
				reader.readAsArrayBuffer(file)
			} else {
				reader.onloadend = () => {
					setFileObject({
						...fileObject,
						fileName: Date.now() + file.name,
						fileUrl: reader.result,
						file: file,
					})
				}
				reader.readAsDataURL(file)
			}
		})
	}, [])

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		accept:
			type === 'image'
				? { 'image/jpeg': [], 'image/png': [] }
				: {
						'text/csv': [],
						'application/vnd.ms-excel': [],
						'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
							[],
					},
		minSize: 0,
		maxSize: maxSize,
	})

	const handleSingleSelect = (key, value) => {
		const obj = { [key]: value }
		if (key === 'selectdAY') {
			obj['selectdSchool'] = ''
			obj['selectedPromotedAcy'] = ''
		}
		if (key === 'selectdSchool') {
			obj['selectedPromotedAcy'] = ''
		}
		setSelctedOptionsData((state) => ({ ...state, ...obj }))
	}

	const validateSchool = (schoolId) => {
		const school = schoolsList.find((obj) => obj._id === schoolId)
		if (
			school &&
			school.lastPromotionAcademicYear &&
			school.lastPromotionAcademicYear !== selectedOptionsData.selectdAY
		) {
			setIsSchoolLastPromoteError(true)
		} else {
			setIsSchoolLastPromoteError(false)
		}
	}

	return (
		<Dialog
			open={open}
			PaperProps={{
				style:
					style !== ''
						? style
						: {
								borderRadius: '20px',
								minWidth: '832px',
								padding: '20px',
							},
			}}
		>
			<Box
				sx={{ p: 0 }}
				className={
					className !== ''
						? className
						: classes.flexRowCenterSpaceBetween
				}
			>
				<Box sx={{ minWidth: '376px', pr: pr !== '' ? pr : '20px' }}>
					{isAcyRequired && (
						<Box sx={{ mb: '24px' }}>
							<Box className={flexStyles.flexSpaceBetween}>
								<Box sx={{ display: 'flex', gap: '3px' }}>
									<Typography
										variant={typographyConstants.body}
									>
										{' '}
										{
											localizationConstants.selectAcademicYear
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
							</Box>
							<Box sx={{ width: '100%' }}>
								<CustomAutocompleteNew
									fieldSx={{ height: '44px' }}
									value={selectedOptionsData?.selectdAY}
									placeholder={`${localizationConstants.select} ${localizationConstants.academicYear}`}
									onChange={(e) => {
										handleSingleSelect('selectdAY', e)
									}}
									options={acyOptions || []}
									disabled={disableDropDown1}
								/>
							</Box>
						</Box>
					)}
					{isSchoolListReq && (
						<Box sx={{ mb: '24px' }}>
							<Box
								className={flexStyles.flexSpaceBetween}
								// sx={{ mx: '1%' }}
							>
								<Box sx={{ display: 'flex', gap: '3px' }}>
									<Typography
										variant={typographyConstants.body}
									>
										{' '}
										{
											localizationConstants.selectSchool
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
							</Box>
							<Box sx={{ width: '100%' }}>
								<CustomAutocompleteNew
									// sx={{ width: '200px' }}
									fieldSx={{ height: '44px' }}
									value={selectedOptionsData.selectdSchool}
									placeholder={`${localizationConstants.select} ${localizationConstants.school}`}
									onChange={(e) => {
										handleSingleSelect('selectdSchool', e)
										if (validateSchoolRequired) {
											validateSchool(e)
										}
									}}
									options={schoolOptions || []}
									disabled={disableDropDown2}
								/>
							</Box>
							{validateSchoolRequired &&
								isSchoolLastPromoteError && (
									<Box>
										<Typography>
											{localizationConstants.note} :
										</Typography>
										<Typography
											variant={typographyConstants.h6}
											sx={{
												color: 'red',
											}}
										>
											{schoolIssueErrorMsg}
										</Typography>
									</Box>
								)}
						</Box>
					)}

					{isLastPromotedAcyReq && (
						<Box sx={{ mb: '24px' }}>
							<Box className={flexStyles.flexSpaceBetween}>
								<Box sx={{ display: 'flex', gap: '3px' }}>
									<Typography
										variant={typographyConstants.body}
									>
										{' '}
										{
											localizationConstants.selectAcademicYear
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
							</Box>
							<Box sx={{ width: '100%' }}>
								<CustomAutocompleteNew
									fieldSx={{ height: '44px' }}
									value={
										selectedOptionsData.selectedPromotedAcy
									}
									placeholder={`${localizationConstants.select} ${localizationConstants.academicYear}`}
									onChange={(e) => {
										handleSingleSelect(
											'selectedPromotedAcy',
											e,
										)
									}}
									options={aysOptionsGreaterLPAcy || []}
									disabled={disableDropDown3}
								/>
							</Box>
						</Box>
					)}

					<Box
						className={classes.flexColumnCenter}
						sx={commonComponentStyles.addItemsUploadPopupContentSX}
						style={{ padding: '30px 40px' }}
					>
						<div {...getRootProps({ className: 'dropzone' })}>
							<div className={classes.flexColumnCenter}>
								<input
									{...getInputProps()}
									style={{
										display: 'none',
										width: '0px',
										height: '0px',
									}}
								/>
								<div className={classes.flexColumnCenter}>
									<CustomIcon
										name={iconConstants.uploadYellow}
										style={{
											height: '60px',
											width: '60px',
										}}
									/>
									<Typography
										variant={typographyConstants.title}
										sx={{
											mt: '20px',
											cursor: 'pointer',
											textDecoration: 'underline',
										}}
									>
										{t(localizationConstants.browseTheFile)}
									</Typography>
								</div>
								<Box
									sx={{
										display: 'flex',
										flexDirection: 'row',
										justifyContent: 'center',
										alignItems: 'center',
										maxWidth: '437px',
									}}
								>
									{type == 'sheet' &&
									fileObject.fileUrl &&
									!rejectedFile ? (
										<CustomIcon
											name={iconConstants.xlsxIcon}
											style={{
												marginRight: '10px',
												width: '30px',
												height: '30px',
											}}
										/>
									) : (
										<>
											{fileObject.fileUrl &&
											!rejectedFile ? (
												<img
													src={fileObject.fileUrl}
													style={{
														height: '30px',
														width: '30px',
														borderRadius: '4px',
														marginRight: '10px',
													}}
												/>
											) : null}
										</>
									)}
									{fileObject.fileName && !rejectedFile ? (
										<Typography
											variant={typographyConstants.body1}
											sx={{
												display: '-webkit-box',
												overflow: 'hidden',
												WebkitBoxOrient: 'vertical',
												WebkitLineClamp: 5,
												mt: '6px',
												wordWrap: 'normal',
											}}
										>
											{fileName}
										</Typography>
									) : null}
								</Box>

								{fileObject.extensionError && (
									<Box
										sx={{
											width: '437px',
											height: '36px',

											borderRadius: '5px',
											mt: '27px',
											p: '6px',
										}}
										className={classes.flexRowCenter}
									>
										<CustomIcon
											style={{
												height: '20px',
												width: '20px',
											}}
											name={iconConstants.alertCircle}
										/>
										<Typography
											sx={{
												color: 'tableBodyColors.alert',
												ml: '10px',
											}}
											variant={
												typographyConstants.subtitle3
											}
										>
											{type === 'image'
												? `${t(
														localizationConstants.fileTypeDoesNotMatchExtension,
													)} ${t(localizationConstants.fileTypeImage)}`
												: `${t(
														localizationConstants.fileTypeDoesNotMatchExtension,
													)} ${t(localizationConstants.fileTypeSheet)}`}
										</Typography>
									</Box>
								)}
								{rejectedFile && (
									<Box
										sx={{
											width: '437px',
											height: '36px',

											borderRadius: '5px',
										}}
										className={classes.flexRowCenter}
									>
										<CustomIcon
											style={{
												height: '20px',
												width: '20px',
											}}
											name={iconConstants.alertCircle}
										/>
										<Typography
											sx={{
												color: 'tableBodyColors.alert',
												ml: '5px',
											}}
											variant={
												typographyConstants.subtitle3
											}
										>
											{t(
												localizationConstants.fileSizeExceded,
											)}
										</Typography>
									</Box>
								)}
							</div>

							{/* NEW VALID/INVALID COUNTS */}
							{type === 'sheet' &&
								(validCount > 0 || invalidCount > 0) && (
									<Box
										sx={{
											mt: 2,
											mb: 2,
											textAlign: 'center',
										}}
									>
										<Typography
											sx={{
												mt: 0,
												mb: 0,
												fontWeight: 'bold',
												fontSize: 14,
											}}
										>
											<span style={{ color: 'green' }}>
												{' '}
												{`${sheetType === 1 ? t(localizationConstants.validRows) : t(localizationConstants.validCollumns)} ${validCount}`}
											</span>
											{' | '}
											<span style={{ color: 'red' }}>
												{' '}
												{`${sheetType === 1 ? t(localizationConstants.invalidRows) : t(localizationConstants.invalidCollumns)} ${invalidCount}`}
											</span>
										</Typography>
									</Box>
								)}

							{type === 'image' ? (
								<>
									<Typography
										variant={typographyConstants.body}
										sx={{ textAlign: 'center', mt: '10px' }}
									>
										{t(localizationConstants.supportFile)}
									</Typography>
									<Typography
										variant={typographyConstants.body}
										sx={{
											textAlign: 'center',
											color: 'globalElementColors.blue',
										}}
									>
										{t(
											localizationConstants.downloadTemplate,
										)}
									</Typography>
								</>
							) : (
								<Box sx={{ textAlign: 'center', mt: '10px' }}>
									<Typography
										variant={typographyConstants.body}
										sx={{ textAlign: 'center', mt: '5px' }}
									>
										{t(localizationConstants.supportFile)}
									</Typography>

									<Box className={classes.flexRowCenter}>
										<Typography
											variant={typographyConstants.body}
										>
											{localExcel ? (
												<span
													style={{
														textDecoration:
															'underline',
														cursor: 'pointer',
														mr: '4px',
														color: 'globalElementColors.blue',
													}}
													onClick={() => {
														const link =
															document.createElement(
																'a',
															)
														link.href = templatePath
														link.download =
															'SendChecklistTemplate.xlsx'
														document.body.appendChild(
															link,
														)
														link.click()
														document.body.removeChild(
															link,
														)
													}}
												>
													{t(
														localizationConstants.downloadTemplate,
													)}
												</span>
											) : (
												<span
													style={{
														textDecoration:
															'underline',
														cursor: 'pointer',
														mr: '4px',
														color: 'globalElementColors.blue',
													}}
													onClick={(e) =>
														handleExcelDownload(e)
													}
												>
													{t(
														localizationConstants.downloadTemplate,
													)}
												</span>
											)}{' '}
											{t(
												localizationConstants.downloadTemplateReferMsg,
											)}
										</Typography>
									</Box>
								</Box>
							)}
						</div>
					</Box>
				</Box>

				<Box
					sx={{ minWidth: '376px', pl: pr !== '' ? '12px' : '20px' }}
					className={classes.flexColumnCenterStart}
				>
					{required && (
						<Typography
							sx={{ color: 'globalElementColors.red' }}
							variant={typographyConstants.body}
						>
							{localizationConstants.instructions}{' '}
							{localizationConstants.required}
						</Typography>
					)}

					<Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
						{Content}
					</Box>

					<Box sx={{ p: 0, m: 0 }}>
						<Grid
							container
							sx={{
								pt: '20px',
								pb: pr !== '' ? pr : '20px',
								gap: '20px',
							}}
						>
							<Grid item>
								<CustomButton
									onClick={(e) => {
										setRejectedFile('')
										handleUploadFormClose(e)
									}}
									sx={
										commonComponentStyles.customBtnUploadDialogSX
									}
									text={t(localizationConstants.cancel)}
									typoSx={{ color: 'buttonColors.black' }}
									typoVariant={typographyConstants.body}
								/>
							</Grid>
							<Grid item>
								<CustomButton
									sx={{
										backgroundColor: 'buttonColors.blue',
										height: '40px',
										width: '164px',
										borderRadius: '4px',
									}}
									disabled={
										isSchoolLastPromoteError ||
										fileObject?.fileName === '' ||
										(isSchoolListReq &&
											!selectedOptionsData.selectdSchool) ||
										invalidCount > 0
									}
									text={
										type === 'image'
											? t(localizationConstants.save)
											: t(localizationConstants.submit)
									}
									onClick={handleSaveClick}
									typoVariant={typographyConstants.body}
								/>
							</Grid>
						</Grid>
					</Box>
				</Box>
			</Box>

			{openWarningDialog && (
				<CustomAlertDialogs
					open={open}
					setOpen={setOpenWarningDialog}
					type={localizationConstants.bulkUploadWarning}
					title={localizationConstants.bulkUpload}
					onSubitClick={handleDialogSubmit}
					onCancelClick={() => {
						setOpenWarningDialog(false)
					}}
					iconName={iconConstants.alertTriangle}
				/>
			)}
		</Dialog>
	)
}

export default FileUploadDialog
