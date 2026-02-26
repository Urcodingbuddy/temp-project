import React, { useEffect, useState } from 'react'
import { useTheme } from '@mui/material/styles'
import {
	FormControl,
	Select,
	MenuItem,
	OutlinedInput,
	Typography,
	Box,
	ListItemText,
	Button,
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import CustomIcon from './CustomIcon'
import { typographyConstants } from '../resources/theme/typographyConstants'
import { iconConstants } from '../resources/theme/iconConstants'
import CustomTextfield from './CustomTextField'
import { searchArray } from '../utils/utils'

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
			width: 250,
		},
	},
}

function getStyles(name, personName, theme) {
	return {
		fontWeight:
			personName?.indexOf(name) === -1
				? theme.typography.fontWeightRegular
				: theme.typography.fontWeightMedium,
	}
}

export default function CustomSelect({
	Placeholder,
	multiple = false,
	onChange = (e) => {},
	value,
	options = [],
	sx,
	selectSx,
	name,
	disabled,
	labelName,
	isAccmodationField = false,
	onApply,
}) {
	const theme = useTheme()
	const [selectedVals, setSelectedVals] = useState({
		single: '',
		multiplevals: [],
	})
	const [tempValue, setTempValue] = useState(value)
	const [menuOpen, setMenuOpen] = useState(false) // State to control menu visibility
	const [search, setSearch] = useState('')
	const [notToShow, setNotToShow] = useState([])

	const handleChange = (event) => {
		let { value } = event.target
		if (options[0]?.label) {
			if (!multiple) {
				if (typeof value === 'string') {
					value = value.split(',')
				} else if (typeof value === 'number') {
					value = [value]
				}
				setTempValue(value)
				setSelectedVals({
					multiplevals: undefined,
					single: options?.find((opVal) => opVal?.val === value?.[0])
						?.label,
				})
				// For single select, make API call immediately
				onChange(value)
				if (onApply) {
					onApply(value)
				}
			} else {
				setTempValue(value)
				setSelectedVals({
					single: undefined,
					multiplevals: value.map(
						(sval) =>
							options.find((opVal) => opVal?.val === sval)?.val,
					),
				})
			}
		} else {
			if (!multiple) {
				if (typeof value === 'string') {
					value = value.split(',')
				} else if (typeof value === 'number') {
					value = [value]
				}
				// value = typeof value === 'string' ? value.split(',') : value
				setTempValue(value)
				setSelectedVals({ multiplevals: undefined, single: value })
				// For single select, make API call immediately
				onChange(value)
				if (onApply) {
					onApply(value)
				}
			} else {
				setTempValue(value)
				setSelectedVals({ single: undefined, multiplevals: value })
			}
		}
	}

	const handleApply = async () => {
		// Only used for multiple select
		await onChange(tempValue)
		if (onApply) {
			await onApply(tempValue)
		}
		setMenuOpen(false) // Close the menu after applying
		setNotToShow([])
		setSearch('')
	}

	const renderSelectedValues = () => {
		if (!tempValue?.length) {
			return (
				<Typography variant={typographyConstants.body}>
					{Placeholder}
				</Typography>
			)
		}

		if (selectedVals?.single) {
			return (
				<Typography variant={typographyConstants.body}>
					{selectedVals?.single}
				</Typography>
			)
		}

		if (selectedVals?.multiplevals?.length) {
			const selectedItems = options[0]?.val
				? selectedVals.multiplevals.map(
						(val) => options.find((opt) => opt.val === val)?.label,
					)
				: selectedVals.multiplevals

			if (selectedItems.length <= 2) {
				return (
					<Typography variant={typographyConstants.body}>
						{selectedItems.join(', ')}
					</Typography>
				)
			} else {
				return (
					<Typography variant={typographyConstants.body}>
						{`${selectedItems[0]}, ${selectedItems[1]}, +${selectedItems.length - 2} more`}
					</Typography>
				)
			}
		}

		return (
			<Typography variant={typographyConstants.body}>
				{Placeholder}
			</Typography>
		)
	}

	useEffect(() => {
		if (JSON.stringify(tempValue) !== JSON.stringify(value)) {
			setTempValue(value)
			handleChange({ target: { value } })
		}
	}, [value])

	const handleClose = () => {
		// Call the API if there are changes, even without clicking Apply
		if (multiple) {
			if (JSON.stringify(tempValue) !== JSON.stringify(value)) {
				onChange(tempValue)
				if (onApply) {
					onApply(tempValue)
				}
			}
		}
		setMenuOpen(false) // Close the menu
		setNotToShow([])
		setSearch('')
	}

	const handleInputClick = (e) => {
		e.stopPropagation() // Prevent dropdown from closing/focusing
	}

	const handleInputKeyDown = (e) => {
		e.stopPropagation() // Prevent keyboard nav affecting parent select
	}

	const handleSearch = (e) => {
		e.stopPropagation()
		const value = e.target.value
		setSearch(value)
		let filteredOptions = searchArray(
			options,
			value,
			false,
			options[0]?.val ? 'label' : false,
		)
		if (filteredOptions.length > 0) {
			if (options[0]?.val) {
				setNotToShow(filteredOptions.map((obj) => obj.val))
			} else {
				setNotToShow(filteredOptions)
			}
		}
	}

	const menuItemForLabelOptions = (opt) => {
		return (
			<MenuItem
				key={opt?.val}
				value={opt?.val}
				style={getStyles(opt?.val, tempValue, theme)}
			>
				{multiple && opt?.val !== 'all' && (
					<Box sx={{ mr: '10px' }}>
						{tempValue?.includes(opt?.val) ? (
							<CustomIcon
								name={iconConstants.checkedBoxBlue}
								style={{
									width: '22px',
									height: '22px',
								}}
								svgStyle={'width: 22px; height: 22px'}
							/>
						) : (
							<CustomIcon
								name={iconConstants.uncheckedBox}
								style={{
									width: '22px',
									height: '22px',
								}}
								svgStyle={'width: 22px; height: 22px'}
							/>
						)}
					</Box>
				)}
				<ListItemText primary={opt?.label} />
			</MenuItem>
		)
	}

	const menuItemsOnlyVal = (opt) => {
		return (
			<MenuItem
				key={opt}
				value={opt}
				style={getStyles(opt, tempValue, theme)}
			>
				{multiple && opt !== 'all' && (
					<Box sx={{ mr: '10px' }}>
						{tempValue?.includes(opt) ? (
							<CustomIcon
								name={iconConstants.checkedBoxBlue}
								style={{
									width: '22px',
									height: '22px',
								}}
								svgStyle={'width: 22px; height: 22px'}
							/>
						) : (
							<CustomIcon
								name={iconConstants.uncheckedBox}
								style={{
									width: '22px',
									height: '22px',
								}}
								svgStyle={'width: 22px; height: 22px'}
							/>
						)}
					</Box>
				)}
				<ListItemText primary={opt} />
			</MenuItem>
		)
	}

	return (
		<FormControl sx={{ ...sx, position: 'relative' }}>
			<Typography variant={typographyConstants.body}>
				{labelName}
			</Typography>
			<Select
				multiple={multiple}
				displayEmpty
				value={tempValue}
				name={name}
				onChange={handleChange}
				input={<OutlinedInput />}
				sx={{
					...selectSx,
					'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
						border: '1px solid',
						borderColor: 'globalElementColors.grey5',
					},
					pr: multiple ? '90px !important' : undefined,
				}}
				renderValue={renderSelectedValues}
				MenuProps={
					isAccmodationField
						? {
								...MenuProps,
								PaperProps: {
									...MenuProps.PaperProps,
									style: {
										...MenuProps.PaperProps.style,
										width: 400,
									},
								},
							}
						: MenuProps
				}
				inputProps={{ 'aria-label': 'Without label' }}
				IconComponent={KeyboardArrowDownIcon}
				disabled={disabled}
				open={menuOpen} // Control menu visibility
				onClose={handleClose} // Close menu when it loses focus
				onOpen={() => setMenuOpen(true)} // Open menu
			>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
					}}
				>
					{!multiple && (
						<MenuItem disabled value=''>
							{Placeholder}
						</MenuItem>
					)}

					{multiple && (
						<Box
							sx={{
								width: '100%',
								display: 'flex',
								justifyContent: 'space-between',
								mb: 1,
							}}
						>
							<Box sx={{ flex: 1, pt: 0.5, width: '50%' }}>
								<CustomTextfield
									placeholder={'Search'}
									fieldSx={{
										width: '80%',
										height: '28px',
									}}
									value={search}
									onChange={handleSearch}
									onClick={handleInputClick}
									onKeyDown={handleInputKeyDown}
								/>
							</Box>
							<Box
								sx={{
									width: '50%',
									display: 'flex',
									justifyContent: 'end',
								}}
							>
								<Button
									variant='contained'
									onClick={handleApply}
									sx={{
										height: '32px',
										minWidth: '80px',
										// width: '100%',
										zIndex: 1,
										marginRight: '2%',
									}}
								>
									Apply
								</Button>
							</Box>
						</Box>
					)}
				</Box>

				{options && options.length > 0 ? (
					options[0]?.val ? (
						notToShow.length > 0 ? (
							options
								.filter((obj) => notToShow.includes(obj.val))
								.map((opt) => menuItemForLabelOptions(opt))
						) : (
							options.map((opt) => menuItemForLabelOptions(opt))
						)
					) : notToShow.length > 0 ? (
						options
							.filter((val) => notToShow.includes(val))
							.map((opt) => menuItemsOnlyVal(opt))
					) : (
						options?.map((opt) => menuItemsOnlyVal(opt))
					)
				) : (
					<></>
				)}
			</Select>
		</FormControl>
	)
}
