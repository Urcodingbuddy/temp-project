import React, { useEffect, useState } from 'react'
import {
	Box,
	IconButton,
	Menu,
	MenuItem,
	Typography,
	Select,
} from '@mui/material'
import { localizationConstants } from '../resources/theme/localizationConstants'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { tableStyles } from './styles/tableStyles'

export const rowsPerPageOptions = [
	{ text: '150', value: 150 },
	{ text: '200', value: 200 },
	{ text: '250', value: 250 },
	{ text: '300', value: 300 },
	{ text: '500', value: 500 },
	{ text: '800', value: 800 },
	{ text: '1000', value: 1000 },
]

const CustomPagination = ({
	totalCount,
	rowsPerPage,
	setRowsPerPage,
	currentPage,
	setCurrentPage,
}) => {
	const [pageAnchorEl, setPageAnchorEl] = useState(null)
	const pageMenuOpen = Boolean(pageAnchorEl)

	const [startIndex, setStartIndex] = useState(1)
	const [endIndex, setEndIndex] = useState(1)
	const [totalPages, setTotalPages] = useState(0)

	useEffect(() => {
		const newStartIndex = (currentPage - 1) * rowsPerPage.value + 1
		const newEndIndex = Math.min(
			newStartIndex + rowsPerPage.value - 1,
			totalCount,
		)
		setStartIndex(newStartIndex)
		setEndIndex(newEndIndex)
	}, [currentPage])

	useEffect(() => {
		const totalPages = Math.ceil(totalCount / rowsPerPage.value)
		setTotalPages(totalPages)
		if (rowsPerPage.value >= totalCount) {
			setCurrentPage(1)
		} else {
			setCurrentPage(currentPage)
		}
		setStartIndex(1)
		if (totalCount < rowsPerPage.value) {
			setEndIndex(totalCount)
		} else setEndIndex(rowsPerPage.value)
	}, [rowsPerPage, totalCount])

	const handlePageChange = (page) => {
		setCurrentPage(page)
	}

	const handleMenuClose = () => {
		setPageAnchorEl(null)
	}

	const handleNorOfRowsClick = (event) => {
		setPageAnchorEl(event.currentTarget)
	}

	const handleMenuItemClick = (e, item) => {
		setRowsPerPage(item)
		setCurrentPage(1)
		handleMenuClose()
	}

	return (
		<Box sx={tableStyles.paginationContainer}>
			{/* Rows per page */}
			<Box sx={tableStyles.rowsPerPageSection}>
				<Typography sx={tableStyles.rowsPerPageLabel}>
					{localizationConstants.rowsPerPage}
				</Typography>

				<Box
					sx={tableStyles.rowsPerPageSelect}
					onClick={(e) => handleNorOfRowsClick(e)}
				>
					<Typography sx={tableStyles.rowsPerPageValue}>
						{rowsPerPage.text}
					</Typography>
					<KeyboardArrowDownIcon
						sx={{ fontSize: '18px', color: '#64748B' }}
					/>
				</Box>

				<Menu
					anchorEl={pageAnchorEl}
					open={pageMenuOpen}
					onClose={handleMenuClose}
					PaperProps={{
						sx: {
							mt: '4px',
							boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
							borderRadius: '6px',
							minWidth: '80px',
						},
					}}
				>
					{rowsPerPageOptions.map((item) => (
						<MenuItem
							key={item.value}
							onClick={(e) => handleMenuItemClick(e, item)}
							value={item.value}
							sx={{
								fontSize: '13px',
								py: '6px',
								'&:hover': {
									backgroundColor: '#F1F5F9',
								},
							}}
						>
							{item.text}
						</MenuItem>
					))}
				</Menu>
			</Box>

			{/* Page info and navigation */}
			<Box sx={tableStyles.pageInfoSection}>
				<Typography sx={tableStyles.pageInfoText}>
					{startIndex}-{endIndex} {localizationConstants.of} {totalCount}
				</Typography>

				<IconButton
					size='small'
					disabled={currentPage === 1}
					onClick={() => handlePageChange(currentPage - 1)}
					sx={tableStyles.navButton}
				>
					<KeyboardArrowLeftIcon sx={tableStyles.navButtonIcon} />
				</IconButton>

				<IconButton
					size='small'
					disabled={currentPage === totalPages}
					onClick={() => handlePageChange(currentPage + 1)}
					sx={tableStyles.navButton}
				>
					<KeyboardArrowRightIcon sx={tableStyles.navButtonIcon} />
				</IconButton>
			</Box>
		</Box>
	)
}

export default CustomPagination
