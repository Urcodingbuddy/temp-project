import { Autocomplete, TextField } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

const CustomAutocompleteNew = ({
	options = [],
	value,
	onChange,
	label = '',
	placeholder = '',
	multiple = false,
	sx = {},
	fieldSx = {},
	disabled,
	error = false,
	onClick,
}) => {
	const isObjectArray = typeof options[0] === 'object' && options[0] !== null

	const getOptionLabel = (option) =>
		isObjectArray ? (option.label ?? '') : option

	const isOptionEqualToValue = (option, val) => {
		if (isObjectArray) return option.id === val?.id
		return option === val
	}

	const handleChange = (_, selected) => {
		if (multiple) {
			if (isObjectArray) {
				onChange(selected.map((item) => item.id))
			} else {
				onChange(selected)
			}
		} else {
			if (isObjectArray) {
				onChange(selected?.id ?? null)
			} else {
				onChange(selected ?? null)
			}
		}
	}

	const resolvedValue = multiple
		? isObjectArray
			? options.filter((opt) => value?.includes(opt.id))
			: value
		: isObjectArray
			? (options.find((opt) => opt.id === value) ?? null)
			: (value ?? null)

	return (
		<Autocomplete
			sx={sx} // SX is for overall Autocomplete and fieldSx is for Text field of autocomplete. All changes in fieldSx will reflect in text field
			options={options}
			value={resolvedValue}
			onChange={handleChange}
			multiple={multiple}
			disabled={disabled}
			getOptionLabel={getOptionLabel}
			isOptionEqualToValue={isOptionEqualToValue}
			onOpen={onClick}
			popupIcon={<KeyboardArrowDownIcon />}
			renderInput={(params) => (
				<TextField
					sx={{
						'& .MuiInputBase-root': {
							height: '44px',
							borderRadius: '6px',
							borderColor: error
								? 'globalElementColors.red'
								: 'globalElementColors.grey3',

							...fieldSx,
						},
						'& .MuiOutlinedInput-root': {
							'& fieldset': {
								border: '1px solid',
								borderColor: error
									? 'globalElementColors.red'
									: 'globalElementColors.grey3',
							},
							'&:hover fieldset': {
								border: '1px solid',
								borderColor: error
									? 'globalElementColors.red'
									: 'globalElementColors.grey3',
							},
							'&.Mui-focused fieldset': {
								border: '1px solid',
								borderColor: error
									? 'globalElementColors.red'
									: 'globalElementColors.grey3',
							},
						},
						'& .MuiAutocomplete-popupIndicator': {
							color: 'globalElementColors.grey3',
						},
						'& .MuiAutocomplete-clearIndicator': {
							color: 'globalElementColors.grey3',
						},
						'& .MuiInputBase-input::placeholder': {
							fontSize: '14px',
							fontWeight: 500,
							opacity: 1,
							color: 'globalElementColors.black',
						},
					}}
					{...params}
					label={label}
					placeholder={placeholder}
				/>
			)}
		/>
	)
}

export default CustomAutocompleteNew
