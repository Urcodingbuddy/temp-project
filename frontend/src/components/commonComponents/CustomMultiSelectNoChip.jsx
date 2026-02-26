import {
	Autocomplete,
	Checkbox,
	TextField,
	Box,
	IconButton,
	Typography,
	Button,
} from '@mui/material'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { typographyConstants } from '../../resources/theme/typographyConstants'

const CustomMultiSelectNoChip = ({
	options = [],
	value = [],
	onChange,
	onClick,
	placeholder = '',
	sx = {},
	fieldSx = {},
	disabled,
	error = false,
	onApply = () => {},
	label,
	hideAllCheckbox = false,
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

	const truncateText = (text, maxLength = 50) => {
		if (text.length <= maxLength) return text
		return text.substring(0, maxLength - 6) + '...'
	}
	const handleApply = () => {
		onApply(value)
	}

	return (
		<Box
			sx={{ display: 'flex', flexDirection: 'column', gap: '0px', ...sx }}
		>
			{label && (
				<Typography variant={typographyConstants.body}>
					{label}
				</Typography>
			)}
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
				openOnFocus
				onBlur={handleApply}
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
						<KeyboardArrowDownIcon />
					</IconButton>
				}
				renderOption={(props, option, { selected }) => {
					// If it's the "all" option and hideAllCheckbox is true → show without a checkbox
					if (option.id === 'all' && hideAllCheckbox) {
						return (
							<Box sx={{ my: '5px', px: '5px' }}>
								<li {...props}>{getOptionLabel(option)}</li>
							</Box>
						)
					}

					// Default case (with checkbox)
					return (
						<Box sx={{ my: '5px', px: '5px' }}>
							<li {...props}>
								<Checkbox
									icon={
										<CheckBoxOutlineBlankIcon fontSize='small' />
									}
									checkedIcon={
										<CheckBoxIcon fontSize='small' />
									}
									style={{ marginRight: 8 }}
									checked={selected}
								/>
								{getOptionLabel(option)}
							</li>
						</Box>
					)
				}}
				renderTags={(selected) => {
					const displayText = selected
						.map((option) => getOptionLabel(option))
						.join(', ')
					return (
						<Typography
							variant={typographyConstants.body}
							sx={{
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								maxWidth: '100%',
								pb: '8px',
							}}
						>
							{truncateText(displayText)}
						</Typography>
					)
				}}
				PaperComponent={({ children }) => (
					<Box
						sx={{
							position: 'relative',
							border: '1px solid',
							borderColor: 'globalElementColors.grey3',
							borderRadius: '3px',
							backgroundColor: 'white',
						}}
					>
						<Box
							sx={{
								position: 'sticky',
								top: 0,
								display: 'flex',
								justifyContent: 'flex-end',
								p: '8px',
								backgroundColor: 'white',
								zIndex: 1,
							}}
						>
							<Button
								variant='contained'
								size='small'
								onClick={handleApply}
								sx={{
									textTransform: 'none',
									fontSize: '14px',
									fontWeight: 500,
								}}
							>
								Apply
							</Button>
						</Box>
						{children}
					</Box>
				)}
				renderInput={(params) => (
					<TextField
						{...params}
						variant='outlined'
						error={error}
						placeholder={placeholder}
						onClick={onClick}
						sx={{
							'& .MuiInputBase-root': {
								height: '44px',

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
							// '& .MuiInputBase-input::placeholder': {
							// 	fontSize: '14px',
							// 	fontWeight: 500,
							// 	opacity: 1,
							// 	color: '#666',
							// },
						}}
					/>
				)}
			/>
		</Box>
	)
}

export default CustomMultiSelectNoChip
