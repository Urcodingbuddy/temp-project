import * as React from 'react'
import { Typography, Box, FormControl, OutlinedInput } from '@mui/material'
import useCommonStyles from './styles'
import { typographyConstants } from '../resources/theme/typographyConstants'

const CustomTextfield = ({
	formSx = { width: '420px' },
	formVariant = 'outlined',
	boxSx = false,
	labelText = null,
	labelTypoVariant = typographyConstants.title,
	labelTypoSx = {
		color: 'textColors.grey',
	},

	type,
	value,
	defaultValue,
	onChange,
	onFocus,
	onBlur,
	onInput,
	placeholder,
	multiline = false,

	propSx = null,
	maxLength,
	fieldSx = null,
	autoFocus = false,
	endIcon = null,
	startIcon = null,
	disabled = false,
	readOnly = false,
	required = false,
	onClick,
	onKeyPress,
	onKeyDown,
	hideOutline = false,
	name,
	isRedStarRequired = false,
}) => {
	const globalStyles = useCommonStyles()
	return (
		<Box sx={{ ...(boxSx && { width: '100%' }) }}>
			<FormControl sx={formSx} variant={formVariant}>
				{labelText && (
					<Typography
						component='span'
						variant={labelTypoVariant}
						sx={labelTypoSx}
					>
						{labelText}{' '}
						{isRedStarRequired && (
							<Typography component='span' color='red'>
								*
							</Typography>
						)}
					</Typography>
				)}
				<OutlinedInput
					fullWidth
					className={globalStyles.outlinedInput}
					type={type}
					autoFocus={autoFocus}
					value={value}
					defaultValue={defaultValue}
					onChange={onChange}
					onBlur={onBlur}
					onFocus={onFocus}
					onInput={onInput}
					placeholder={placeholder}
					multiline={multiline}
					onKeyPress={onKeyPress}
					onKeyDown={onKeyDown}
					inputProps={{
						sx: {
							...propSx,
							minHeight: propSx?.height ?? '60px',
							maxHeight: propSx?.height ?? '60px',
							p: multiline ? 0 : '0px 12px',
							overflowY: multiline && 'auto !important',
						},
						maxLength: maxLength,
					}}
					sx={{
						...fieldSx,
						backgroundColor:
							fieldSx?.backgroundColor ??
							'inputFieldColors.background1',
						borderRadius: fieldSx?.borderRadius ?? '6px',

						'& input::placeholder': fieldSx?.placeholderStyle ?? {
							color: 'textColors.grey1',
							opacity: 1,
						},
						'& legend': { display: 'none' },
						'& fieldset': {
							borderRight: fieldSx?.borderRight,
							top: 0,
						},
						'&.MuiOutlinedInput-root': {
							pl: fieldSx?.paddingLeft && fieldSx?.paddingLeft,
							pr: fieldSx?.paddingRight && fieldSx?.paddingRight,
							'& input': fieldSx?.textStyle ?? {
								fontFamily: '"InterMed", "sans-serif"',
								fontSize: '0.875rem', //14px med
								fontWeight: 500,
							},
							'&:hover fieldset': {
								borderColor:
									fieldSx?.borderFocusColor ??
									'inputFieldColors.borderFocus1',
							},
							'&.Mui-focused fieldset': {
								border: '1px solid',

								borderColor:
									fieldSx?.borderFocusColor ??
									'inputFieldColors.borderFocus1',
							},
							'& fieldset': {
								borderColor:
									fieldSx?.borderColor ??
									'inputFieldColors.border1',
							},
						},
						border: hideOutline ? 'none' : undefined, // conditionally apply border style
						'&:hover': hideOutline ? { border: 'none' } : undefined, // conditionally apply hover style
						'&.Mui-focused': hideOutline
							? { border: 'none' }
							: undefined, // conditionally apply focused style
						'& fieldset': hideOutline
							? { display: 'none' }
							: undefined, // conditionally hide fieldset
					}}
					startAdornment={startIcon}
					endAdornment={endIcon}
					disabled={disabled}
					name={name ? name : `new-${type}`}
					autoComplete='off'
					readOnly={readOnly}
					required={required}
					onClick={onClick}
				/>
			</FormControl>
		</Box>
	)
}

export default CustomTextfield
