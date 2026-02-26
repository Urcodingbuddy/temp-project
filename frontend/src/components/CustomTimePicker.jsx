import React, { useEffect, useRef, useState } from 'react'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { MobileTimePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import { Typography, Box } from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { typographyConstants } from '../resources/theme/typographyConstants'
import { iconConstants } from '../resources/theme/iconConstants'
import CustomIcon from './CustomIcon'

const CustomTimePicker = ({
	setTime,
	boxSx,
	label,
	tpSx = {},
	value,
	disabled = false,
}) => {
	const [selectedDate, setSelectedDate] = useState(dayjs())

	useEffect(() => {
		if (value) {
			setSelectedDate(dayjs(value))
		}
	}, [value])

	return (
		<Box sx={boxSx}>
			{label && (
				<Typography
					variant={typographyConstants.body}
					sx={{ mb: '4px', display: 'block' }}
				>
					{label}
				</Typography>
			)}
			<Box sx={{ position: 'relative' }}>
				<LocalizationProvider dateAdapter={AdapterDayjs} id='tmRef'>
					<MobileTimePicker
						value={selectedDate}
						sx={{ ...tpSx, width: '100%' }}
						onChange={(newTime) => {
							const newDayjsTime = dayjs(newTime)
							setSelectedDate(newDayjsTime.format('hh:mm A'))
							setTime(newDayjsTime.format('hh:mm A'))
						}}
						readOnly={disabled}
					/>
				</LocalizationProvider>
				<Box
					sx={{
						position: 'absolute',
						bottom: '8px',
						left: `calc(${boxSx?.width ? boxSx?.width : '98%'} - 2em)`,
						boxSizing: 'border-box',
					}}
				>
					<CustomIcon
						name={iconConstants.clockBlack}
						onClick={() =>
							document.getElementById('tmRef')?.click()
						}
					/>
				</Box>
			</Box>
		</Box>
	)
}

export default CustomTimePicker
