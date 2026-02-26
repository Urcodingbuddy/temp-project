import * as React from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import { Box, ListItemIcon, ListItemText, Paper } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CustomIcon from './CustomIcon'
import { iconConstants } from '../resources/theme/iconConstants'

export default function CustomAutoComplete({
	options,
	placeholder,
	value,
	onChange,
	onInputChange,
	styles,
}) {
	return (
		<Box sx={{ flexGrow: 1 }}>
			<Autocomplete
				sx={{
					width: '100%',
					flexGrow: 1,
				}}
				id='custom-input-demo'
				options={options}
				value={value}
				onChange={(event, newValue) => {
					onChange(newValue)
				}}
				renderInput={(params) => (
					<Box
						ref={params.InputProps.ref}
						sx={{
							flexGrow: 1,
							position: 'relative',
							border: '2px solid',
							borderColor: '#EAEAEA',
							borderRadius: '8px',
							mb: '2px',
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						<input
							type='text'
							{...params.inputProps}
							placeholder={placeholder}
							style={{
								height: '44px',
								paddingLeft: '10px',
								width: '100%',
								borderRadius: '8px',
								border: 0,
								outline: 'none',
								...styles,
							}}
							onChange={onInputChange}
						/>
						<CustomIcon
							name={iconConstants.search}
							style={{
								width: '32px',
								height: '32px',
								marginRight: '10px',
							}}
							svgStyle={'width: 32px; height: 32px'}
						/>{' '}
					</Box>
				)}
				renderOption={(props, option, { selected }) => (
					<Box component='li' {...props}>
						<ListItemIcon sx={{ mr: '-28px', mt: '3px' }}>
							<CustomIcon name={iconConstants.suggestionsArrow} />
						</ListItemIcon>
						<ListItemText primary={option?.label} />
					</Box>
				)}
			/>
		</Box>
	)
}
