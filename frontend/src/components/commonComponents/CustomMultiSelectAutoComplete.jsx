import {
	Autocomplete,
	Checkbox,
	TextField,
	Chip,
	Box,
	IconButton,
} from '@mui/material'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'

const CustomMultiSelectAutoComplete = ({
	options = [],
	value = [],
	onChange,
	onClick,
	placeholder = '',
	sx = {},
	fieldSx = {},
	disabled,
	error = false,
	name,
	onBlur,
}) => {
	const isObjectArray = typeof options[0] === 'object' && options[0] !== null

	const getOptionLabel = (option) =>
		isObjectArray ? (option.label ?? '') : option

	const isOptionEqualToValue = (option, val) =>
		isObjectArray ? option.id === val?.id : option === val

	const handleChange = (_, selected) => {
		if (isObjectArray) {
			onChange(selected.map((item) => item.id))
		} else {
			onChange(selected)
		}
	}

	const resolvedValue = isObjectArray
		? options.filter((opt) => value?.includes(opt.id))
		: value

	return (
		<Autocomplete
			multiple
			disableCloseOnSelect
			disableClearable
			options={options}
			value={resolvedValue}
			onChange={handleChange}
			getOptionLabel={getOptionLabel}
			isOptionEqualToValue={isOptionEqualToValue}
			disabled={disabled}
			name={name}
			openOnFocus
			onBlur={onBlur}
			onOpen={onClick}
			popupIcon={
				<IconButton
					size='small'
					sx={{
						bgcolor: 'transparent',
						transition: 'background-color 0.5s ease',
						'&:hover': {
							bgcolor: 'globalElementColors.grey5',
						},
					}}
				>
					<ArrowDropDownIcon />
				</IconButton>
			}
			sx={sx}
			renderOption={(props, option, { selected }) => (
				<Box sx={{ my: '5px', px: '5px' }}>
					<li {...props}>
						<Checkbox
							icon={<CheckBoxOutlineBlankIcon fontSize='small' />}
							checkedIcon={<CheckBoxIcon fontSize='small' />}
							style={{ marginRight: 8 }}
							checked={selected}
						/>
						{getOptionLabel(option)}
					</li>
				</Box>
			)}
			slotProps={{
				paper: {
					// sx: {
					// 	maxHeight: '200px',
					// 	overflowY: 'hidden',
					// },
				},
			}}
			renderTags={(selected, getTagProps) =>
				selected.map((option, index) => {
					const handleDelete = () => {
						const optionId = isObjectArray ? option.id : option
						const updated = isObjectArray
							? value.filter((id) => id !== optionId)
							: value.filter((val) => val !== optionId)
						onChange(updated)
					}

					return (
						<Chip
							variant='outlined'
							label={getOptionLabel(option)}
							{...getTagProps({ index })}
							sx={{
								bgcolor: 'globalElementColors.lightBlue',
								color: 'globalElementColors.black',
								fontWeight: 600,
								borderRadius: '2px',
								border: 'none',
							}}
							onDelete={handleDelete}
						/>
					)
				})
			}
			renderInput={(params) => (
				<TextField
					{...params}
					// label={placeholder}
					variant='outlined'
					placeholder={placeholder}
					error={error}
					sx={{
						'& .MuiInputLabel-root': {
							fontWeight: 500, // <-- Increase thickness here
							fontSize: '14px',
							color: '#000', // optional
						},
						'& .MuiInputLabel-shrink': {
							fontWeight: 500, // when label floats
						},
						'& .MuiInputBase-root': {
							height: 'auto',
							borderRadius: '3px',
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
								borderColor: error
									? 'globalElementColors.red'
									: 'globalElementColors.grey',
							},
							'&.Mui-focused fieldset': {
								border: '1px solid',
								borderColor: error
									? 'globalElementColors.red'
									: 'globalElementColors.grey',
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
							color: '#666',
						},
					}}
				/>
			)}
		/>
	)
}

export default CustomMultiSelectAutoComplete
