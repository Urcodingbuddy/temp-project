import { Box } from '@mui/system'
import React from 'react'
import { selPDFViewStyles } from './SELStyles'
import { Typography } from '@mui/material'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'

export const SELpdfViewTitle = ({
	fileViewMode,
	handleBackToList,
	selectedCategory,
	onClose,
	monthOptions,
	selectedMonth,
	onMonthSelect,
}) => {
	const handleMonthChange = (value) => {
		if (onMonthSelect) {
			onMonthSelect(value)
		}
	}

	return (
		<>
			<Box sx={selPDFViewStyles.headerBox}>
				{fileViewMode ? (
					<Box sx={selPDFViewStyles.titleBox}>
						<Typography
							variant={typographyConstants.h4}
							sx={selPDFViewStyles.coloredTitle}
							onClick={handleBackToList}
						>
							{selectedCategory.category?.categoryName}
						</Typography>
						<NavigateNextIcon
							sx={{ height: '28px', width: '28px' }}
						/>

						<Typography
							variant={typographyConstants.h4}
							sx={selPDFViewStyles.title}
						>
							{selectedCategory.file?.fileName}
						</Typography>
					</Box>
				) : (
					<Typography
						variant={typographyConstants.h4}
						sx={selPDFViewStyles.title}
					>
						{localizationConstants.selTracker}
					</Typography>
				)}

				<Box sx={{ display: 'flex', gap: '30px' }}>
					{!fileViewMode && (
						<CustomAutocompleteNew
							fieldSx={{ height: '40px', width: '200px' }}
							value={selectedMonth}
							placeholder={`${localizationConstants.select} ${localizationConstants.month}`}
							onChange={handleMonthChange}
							options={monthOptions}
							disabled={fileViewMode}
						/>
					)}

					<CustomIcon
						name={iconConstants.cancelRounded}
						onClick={fileViewMode ? handleBackToList : onClose}
						style={selPDFViewStyles.iconStyle}
						svgStyle={{ width: '32px', height: '32px' }}
					/>
				</Box>
			</Box>
		</>
	)
}
