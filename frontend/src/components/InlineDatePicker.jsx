import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import DatePicker from 'react-datepicker'
import { registerLocale } from 'react-datepicker'
import ar from 'date-fns/locale/ar'
import arSA from 'date-fns/locale/ar-SA'
import fr from 'date-fns/locale/fr'
import { localizationConstants } from '../resources/theme/localizationConstants'
import { Box } from '@mui/material'
import CustomButton from './CustomButton'
import useCommonStyles from './styles'

registerLocale('arSA', arSA)
registerLocale('ar', ar)
registerLocale('fr', fr)

const InlineDatePicker = ({
	date = null,
	startDate,
	onChange,
	endDate,
	minDate = null,
	maxDate = null,
	dateRange = false,
	setApplyButtonClicked = false,
	onCancel,
	onApply,
}) => {
	const { t } = useTranslation()
	const flexStyles = useCommonStyles()
	const [range, setRange] = useState({ start: null, end: null })

	const handleRange = (date) => {
		const [start, end] = date
		setRange({ start: new Date(start), end: end ? new Date(end) : null })
	}

	useEffect(() => {
		const today = new Date()
		const todayElement = document.querySelector(
			'.react-datepicker__day--today',
		)
		if (todayElement) {
			if (date?.toDateString() === today?.toDateString()) {
				// clicked date is same as today bg color is green
				todayElement.style.backgroundColor = '#00c749'
			} else {
				todayElement.style.backgroundColor = ''
			}
		}
	}, [date])

	useEffect(() => {
		setRange({
			start: new Date(startDate),
			end: endDate ? new Date(endDate) : null,
		})
	}, [])

	return (
		<Box
			sx={{
				backgroundColor: 'globalElementColors.white',
				borderRadius: '10px',
			}}
		>
			<DatePicker
				showYearDropdown
				showMonthDropdown
				dropdownMode='select'
				scrollableMonthYearDropdown
				locale={t(localizationConstants.lang)}
				selected={dateRange ? range.start : date}
				onChange={dateRange ? handleRange : onChange}
				startDate={dateRange ? range.start : null}
				endDate={dateRange ? range.end : null}
				selectsRange={dateRange}
				minDate={minDate}
				maxDate={maxDate}
				showPopperArrow={false}
				key={dateRange ? range.start : date} // add a key prop to force re-rendering
				inline
			/>
			{dateRange && (
				<Box
					sx={{ p: '0px 10px 10px 10px' }}
					className={flexStyles.flexRowCenterSpaceBetween}
				>
					<CustomButton
						sx={{
							minWidth: '48%',
							height: '42px',
							backgroundColor: 'transparent',
						}}
						variant='outlined'
						text={localizationConstants.cancel}
						typoSx={{ fontSize: '14px', fontWeight: 500 }}
						onClick={onCancel}
						fullWidth={false}
					/>

					<CustomButton
						text={localizationConstants.apply}
						sx={{
							minWidth: '48%',
							height: '42px',
						}}
						typoSx={{
							fontSize: '14px',
							fontWeight: 500,
							color: 'globalElementColors.white',
						}}
						disabled={!(range.start && range.end)}
						onClick={() =>
							onApply({ start: range.start, end: range.end })
						}
					/>
				</Box>
			)}
		</Box>
	)
}

export default InlineDatePicker
