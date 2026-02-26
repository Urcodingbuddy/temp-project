import { useEffect, useMemo, useState } from 'react'
import { TextField, InputAdornment } from '@mui/material'
import debounce from 'lodash.debounce'

const CustomSearchTextField = ({
	sx = {},
	propSx = {},
	endIcon = null,
	placeholder = '',
	value,
	onDebouncedChange,
	delay = 500,
}) => {
	const [inputValue, setInputValue] = useState(value)

	useEffect(() => {
		setInputValue(value)
	}, [value])

	// Debounced function memoized so it doesn't recreate on every render
	const debouncedChange = useMemo(
		() =>
			debounce((val) => {
				if (val.length >= 3 || val.length === 0) {
					onDebouncedChange(val)
				}
			}, delay),
		[onDebouncedChange, delay],
	)

	const handleChange = (e) => {
		const val = e.target.value
		setInputValue(val)
		debouncedChange(val)
	}

	return (
		<TextField
			fullWidth
			sx={{
				'& .MuiInputBase-root': {
					height: '44px',
					borderRadius: '6px',
					borderColor: 'globalElementColors.grey3',
					...sx,
				},
				'& .MuiOutlinedInput-root': {
					'& fieldset': {
						border: '1px solid',
						borderColor: 'globalElementColors.grey3',
					},
					'&:hover fieldset': {
						border: '1px solid',
						borderColor: 'globalElementColors.black',
					},
					'&.Mui-focused fieldset': {
						border: '1px solid',
						borderColor: 'globalElementColors.black',
					},
				},
				'& .MuiInputBase-input::placeholder': {
					fontSize: '14px',
					fontWeight: 500,
					opacity: 1,
					color: '#666',
				},
				...sx,
			}}
			placeholder={placeholder}
			value={inputValue}
			onChange={handleChange}
			InputProps={{
				sx: { propSx },
				endAdornment: endIcon ? (
					<InputAdornment position='end'>{endIcon}</InputAdornment>
				) : null,
			}}
		/>
	)
}

export default CustomSearchTextField
