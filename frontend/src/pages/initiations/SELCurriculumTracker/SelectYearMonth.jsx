import { Typography } from '@mui/material'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { Box } from '@mui/system'
import { typographyConstants } from '../../../resources/theme/typographyConstants'

const SelectYearMonth = ({
	selectDropdownOption,
	years,
	months,
	handleDropDownSelect,
}) => {
	return (
		<>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'row',
					gap: '20px',
					mb: '20px',
				}}
			>
				<Box sx={{ width: '50%' }}>
					<Typography variant={typographyConstants.body}>
						{localizationConstants.year}
					</Typography>
					<CustomAutocompleteNew
						sx={{
							minWidth: '80px',
							width: '100%',
						}}
						fieldSx={{ height: '44px' }}
						placeholder={`${localizationConstants.select} ${localizationConstants.year}`}
						onChange={(e) => handleDropDownSelect('currentYear', e)}
						value={selectDropdownOption.currentYear}
						options={years || []}
					/>
				</Box>
				<Box sx={{ width: '50%' }}>
					<Typography variant={typographyConstants.body}>
						{localizationConstants.month}
					</Typography>
					<CustomAutocompleteNew
						sx={{
							minWidth: '80px',
							width: '100%',
						}}
						fieldSx={{ height: '44px' }}
						placeholder={`${localizationConstants.select} ${localizationConstants.month}`}
						onChange={(e) =>
							handleDropDownSelect('selectdMonth', e)
						}
						value={selectDropdownOption.selectdMonth}
						options={months.map((month) => month.name)}
					/>
				</Box>
			</Box>
		</>
	)
}

export default SelectYearMonth
