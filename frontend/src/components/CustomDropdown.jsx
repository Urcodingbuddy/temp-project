import React, { useState, useEffect } from 'react'
import {
	Box,
	Typography,
	Backdrop,
	Popover,
	List,
	ListItem,
} from '@mui/material'
import useCommonStyles from './styles'
import { typographyConstants } from '../resources/theme/typographyConstants'
import CustomIcon from './CustomIcon'
import { iconConstants } from '../resources/theme/iconConstants'
import { localizationConstants } from '../resources/theme/localizationConstants'
import { CustomDropdownStyles } from './componentStyles'

const CustomDropDown = ({
	value,
	setValue,
	options,
	id,
	optionsWidth,
	selectWidth,
	label,
	placeholder,
	disabled = false,
}) => {
	const flexStyles = useCommonStyles()
	const [anchorEl, setAnchorEl] = useState(null)
	const [open, setOpen] = useState(false)
	const [status, setStatus] = useState({})

	const handlePopover = (event) => {
		setOpen(disabled ? false : true)
		setAnchorEl(event?.currentTarget)
	}

	const closePopover = () => {
		setAnchorEl(null)
		setOpen(false)
	}

	useEffect(() => {
		const stValue = options.find((val) => val.status === value)
		if (stValue) {
			setStatus(stValue)
		}
	}, [value])

	return (
		<Box
			sx={{
				maxWidth: selectWidth && selectWidth,
				display: 'inline-block',
				minWidth: '75px',
			}}
		>
			<Typography variant={typographyConstants.body} sx={{ mb: '4px' }}>
				{label}
			</Typography>
			<Box
				sx={CustomDropdownStyles.studentInitiationsStatus(
					status?.color,
				)}
				aria-describedby={id}
				onClick={handlePopover}
			>
				<Box className={flexStyles.flexRowAlighnItemsCenter}>
					{!['', null, undefined].includes(status?.color) && (
						<Box
							sx={CustomDropdownStyles.statusDot(status?.color)}
						></Box>
					)}{' '}
					<Typography variant={typographyConstants.body}>
						{status?.label
							? status?.label
							: placeholder
								? placeholder
								: localizationConstants.select}
					</Typography>
				</Box>
				<CustomIcon
					name={iconConstants.caretDown}
					style={{ width: '16px', height: '16px', cursor: 'pointer' }}
				/>
			</Box>

			<Backdrop
				sx={{
					color: 'globalElementColors.grey1',
					zIndex: (theme) => theme.zIndex.drawer + 1,
				}}
				open={open}
				onClick={closePopover}
			>
				<Popover
					id={id}
					open={open}
					anchorEl={anchorEl}
					onClose={closePopover}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'left',
					}}
				>
					<List sx={CustomDropdownStyles.popoverSx(optionsWidth)}>
						{options.map((opt) => {
							return (
								<ListItem
									sx={{
										backgroundColor:
											status?.status === opt?.status &&
											'globalElementColors.lightBlue',
										cursor: 'pointer',
									}}
									onClick={() => setValue(opt?.status)}
								>
									<Box
										className={
											flexStyles.flexRowAlignCenter
										}
									>
										<Box
											sx={CustomDropdownStyles.statusDot(
												opt?.color,
											)}
										></Box>
										<Typography
											variant={typographyConstants.body}
										>
											{opt.label}
										</Typography>
									</Box>
								</ListItem>
							)
						})}
					</List>
				</Popover>
			</Backdrop>
		</Box>
	)
}

export default CustomDropDown
