import { Backdrop, Dialog, Divider, Popover, Typography } from '@mui/material'
import { Box, width } from '@mui/system'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import CustomButton from '../../../components/CustomButton'
import { commonComponentStyles } from '../../../components/commonComponentStyles'
import { cursorPointer } from './schoolConstants'
import { iconConstants } from '../../../resources/theme/iconConstants'
import CustomIcon from '../../../components/CustomIcon'
import { formatDate } from '../../../utils/utils'
import { SchoolsStyles } from './SchoolsStyles'
import useCommonStyles from '../../../components/styles'
import InlineDatePicker from '../../../components/InlineDatePicker'
import { editSchoolAcademicYear } from './schoolSlice'
import CustomDialog from '../../../components/CustomDialog'

const EditAcademicYearsComponent = ({
	isOpen,
	onClose,
	scAcYearData,
	title,
	fetchList,
	index,
	rows,
}) => {
	const flexStyles = useCommonStyles()
	const dispacth = useDispatch()
	const [inputs, setInputs] = useState({
		startDate: new Date(),
		endDate: new Date(),
	})
	const [startDate, setStartDate] = useState({
		minDate: null,
		maxDate: null,
	})
	const [endDate, setEndDate] = useState({
		minDate: null,
		maxDate: null,
	})
	const [errors, setErrors] = useState({ startDate: false, endDate: false })
	const [anchorEl, setAnchorEl] = useState(null)
	const [popovers, setPopovers] = useState({
		startDate: false,
		endDate: false,
	})
	const [monthOverlapErr, setMonthOverlapErr] = useState(false)

	const handlePopover = (event, type) => {
		if (type) {
			const obj = {}
			obj[type] = true
			setPopovers((state) => ({ ...state, ...obj }))
			setAnchorEl(event?.currentTarget)
		} else {
			setAnchorEl(null)
		}
	}

	const handleClosePopover = (type) => {
		if (['startDate', 'endDate'].includes(type)) {
			const obj = {}
			obj[type] = false
			setPopovers((state) => ({ ...state, ...obj }))
		} else {
			setPopovers({
				startDate: false,
				endDate: false,
			})
		}
		setAnchorEl(null)
	}

	const onStartDateChange = (date) => {
		setInputs((state) => ({
			...state,
			startDate: date,
		}))
		handleClosePopover('startDate')
		if (errors.startDate) {
			setErrors((state) => ({ ...state, startDate: false }))
		}
	}

	const onEndDateChange = (date) => {
		setInputs((state) => ({
			...state,
			endDate: date,
		}))
		handleClosePopover('endDate')
		if (errors.endDate) {
			setErrors((state) => ({ ...state, endDate: false }))
		}
	}

	function isDateRangeValid(theIndex, start, end, allRows) {
		const startDate = new Date(start)
		const endDate = new Date(end)
		if (startDate >= endDate) return false

		// Check with newer year (previous in descending list)
		if (theIndex > 0) {
			const newer = allRows[theIndex - 1]
			const newerStart = new Date(newer.startDate)
			if (endDate > newerStart) {
				return false // Overlaps into newer year
			}
		}

		// Check with older year (next in descending list)
		if (theIndex < allRows.length - 1) {
			const older = allRows[theIndex + 1]
			const olderEnd = new Date(older.endDate)
			if (startDate < olderEnd) {
				return false // Overlaps into older year
			}
		}

		return true
	}

	const handleSubmit = async () => {
		let error = {}
		if (!inputs.startDate) {
			error['startDate'] = true
		}
		if (!inputs.endDate) {
			error['endDate'] = true
		}
		if (Object.keys(error).length > 0) {
			setErrors(error)
			return
		}

		const isValidDateRange = isDateRangeValid(
			index,
			inputs.startDate,
			inputs.endDate,
			rows,
		)

		if (!isValidDateRange) {
			setMonthOverlapErr(true)
			return
		}

		const requestObj = {
			body: {
				startDate: inputs.startDate,
				endDate: inputs.endDate,
			},
			scAcYrId: scAcYearData._id,
		}

		try {
			await dispacth(editSchoolAcademicYear(requestObj))
			fetchList()
			onClose()
		} catch (err) {
			console.error('Failed to update academic year:', err)
		}
	}

	useEffect(() => {
		if (Object.keys(scAcYearData).length > 0) {
			setInputs({
				startDate: new Date(scAcYearData['startDate']),
				endDate: new Date(scAcYearData['endDate']),
			})

			const [startYear, endYear] = scAcYearData.academicYear
				.split('-')
				.map(Number)
			const startMin = new Date(startYear, 0, 1)
			const startMax = new Date(startYear, 11, 31)
			const endMin = new Date(endYear, 0, 1)
			const endMax = new Date(endYear, 11, 31)

			const start = new Date()
			start.setFullYear(startYear)
			const end = new Date()
			end.setFullYear(endYear)

			setStartDate({
				date: start,
				minDate: startMin,
				maxDate: startMax,
			})
			setEndDate({
				date: end,
				minDate: endMin,
				maxDate: endMax,
			})
		}
	}, [scAcYearData])

	return (
		<>
			<Dialog
				PaperProps={{
					sx: {
						borderRadius: '10px',
						minWidth: '40%',
						minHeight: '30%',
						display: 'flex',
						flexDirection: 'column',
						p: '20px',
					},
				}}
				open={isOpen}
				onClose={() => {
					onClose()
				}}
			>
				<Box sx={{ minHeight: '20px' }}>
					<Box sx={{ pb: 0, textAlign: 'left' }}>
						<Typography
							sx={{
								textTransform: 'none',
								color: 'black',
								fontWeight: 800,
								fontSize: '20px',
							}}
						>
							{title}
						</Typography>
					</Box>
				</Box>
				<Divider sx={{ mt: '15px' }} />

				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ mt: '24px', pr: '8px', gap: '20px' }}
				>
					<Box sx={{ ...cursorPointer, width: '100%' }}>
						<Typography
							variant={typographyConstants.title}
							sx={{ color: 'textColors.grey', fontSize: '14px' }}
						>
							{localizationConstants.startDate} *
						</Typography>
						<Box
							className={flexStyles.flexRowCenterSpaceBetween}
							sx={{
								...(errors.startDate
									? SchoolsStyles.datePickerError
									: SchoolsStyles.datePicker),
								width: '100%',
							}}
							onClick={(e) => {
								handlePopover(e, 'startDate')
							}}
						>
							<Typography
								variant={typographyConstants.title}
								sx={{
									color: 'textColors.grey',
									fontSize: '14px',
								}}
							>
								{inputs.startDate === ''
									? `${localizationConstants.select} ${localizationConstants.date}`
									: formatDate(inputs.startDate, 'date')}
							</Typography>
							<CustomIcon
								name={iconConstants.calender}
								style={{
									width: '24px',
									height: '24px',
									cursor: 'pointer',
									opacity: 0.9,
								}}
							/>
						</Box>
					</Box>

					<Box sx={{ ...cursorPointer, width: '100%' }}>
						<Typography
							variant={typographyConstants.title}
							sx={{ color: 'textColors.grey', fontSize: '14px' }}
						>
							{localizationConstants.endDate} *
						</Typography>
						<Box
							className={flexStyles.flexRowCenterSpaceBetween}
							sx={{
								...(errors.endDate
									? SchoolsStyles.datePickerError
									: SchoolsStyles.datePicker),
								width: '100%',
							}}
							onClick={(e) => {
								handlePopover(e, 'endDate')
							}}
						>
							<Typography
								variant={typographyConstants.title}
								sx={{
									color: 'textColors.grey',
									fontSize: '14px',
								}}
							>
								{inputs.endDate === ''
									? `${localizationConstants.select} ${localizationConstants.date}`
									: formatDate(inputs.endDate, 'date')}
							</Typography>
							<CustomIcon
								name={iconConstants.calender}
								style={{
									width: '24px',
									height: '24px',
									opacity: 0.9,
									...cursorPointer,
								}}
							/>
						</Box>
					</Box>
				</Box>

				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						height: '60px',
						gap: '20px',
						width: '100%',
						mt: '60px',
					}}
					gap={'30px'}
				>
					<Box sx={{ width: '50%' }}>
						<CustomButton
							sx={{
								...commonComponentStyles.customBtnUploadDialogSX,
								borderColor: 'blue',
								flexGrow: 1,
								width: '100%',
							}}
							text={localizationConstants.cancel}
							onClick={onClose}
							typoVariant={typographyConstants.body}
							typoSx={{
								color: 'textColors.black',
							}}
						/>
					</Box>
					<Box sx={{ width: '50%' }}>
						<CustomButton
							sx={{
								...commonComponentStyles.rightButtonDialogSx,
								flexGrow: 1,
								width: '100%',
							}}
							text={localizationConstants.submit}
							onClick={handleSubmit}
							// disabled={!selectedStudentIds?.length > 0 || (isSectionShiftDialog && filterFields.toSection?.length === 0)}
							typoVariant={typographyConstants.body}
							typoSx={{
								color: 'textColors.white',
							}}
						/>
					</Box>
				</Box>
			</Dialog>

			<CustomDialog
				isOpen={monthOverlapErr}
				onClose={() => setMonthOverlapErr(false)}
				iconName={iconConstants.toastError}
				titleSx={{
					color: 'textColors.red',
					fontWeight: 500,
					pb: '20px',
				}}
				msgSx={{ color: 'red' }}
				titleTypoVariant={typographyConstants.h4}
				message={localizationConstants.datesAreOverlapping}
				messageTypoVariant={typographyConstants.h5}
				leftButtonText={localizationConstants.cancel}
				onLeftButtonClick={() => {
					setMonthOverlapErr(false)
				}}
			/>

			<Backdrop
				sx={{
					color: 'globalElementColors.grey1',
					zIndex: (theme) => theme.zIndex.drawer + 1,
				}}
				open={popovers.startDate}
			>
				<Popover
					id='selectStartDate'
					open={popovers.startDate}
					anchorEl={anchorEl}
					onClose={() => handleClosePopover('startDate')}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'left',
					}}
					sx={{
						width: '390px',
						maxHeight: '500px',
					}}
				>
					<InlineDatePicker
						date={inputs.startDate}
						dateRange={false}
						onChange={onStartDateChange}
						minDate={startDate.minDate}
						maxDate={startDate.maxDate}
					/>
				</Popover>
			</Backdrop>

			<Backdrop
				sx={{
					color: 'globalElementColors.grey1',
					zIndex: (theme) => theme.zIndex.drawer + 1,
				}}
				open={popovers.endDate}
			>
				<Popover
					id='selectEndDate'
					open={popovers.endDate}
					anchorEl={anchorEl}
					onClose={() => handleClosePopover('endDate')}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'left',
					}}
					sx={{
						width: '390px',
						maxHeight: '500px',
					}}
				>
					<InlineDatePicker
						date={inputs.endDate}
						dateRange={false}
						onChange={onEndDateChange}
						minDate={endDate.minDate}
						maxDate={endDate.maxDate}
					/>
				</Popover>
			</Backdrop>
		</>
	)
}

export default EditAcademicYearsComponent
