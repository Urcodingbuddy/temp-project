import { Box, Typography } from '@mui/material'
import React from 'react'
import { placementWithSend } from './iEPConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'

const PlacementWithSend = ({ data, onChange, readOnly }) => {
	return (
		<Box
			sx={{
				border: '1px solid',
				color: 'globalElementColors.lightBlue',
				borderRadius: '10px',
			}}
		>
			{placementWithSend(data).map((category, index) => (
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'row',
						alignItems: 'center',
						width: '100%',
						minHeight: index === 0 ? '30px' : '70px',
						borderBottom: index === 5 ? 'none' : '1px solid',
						borderColor: 'globalElementColors.lightBlue',
						backgroundColor: index === 0 ? '#F8FCFF' : 'none',
						borderTopLeftRadius: index === 0 ? '10px' : 'none',
						borderTopRightRadius: index === 0 ? '10px' : 'none',
					}}
					gap={'5px'}
				>
					<Box
						sx={{
							width: '10%',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Typography
							variant={typographyConstants.title}
							sx={{
								color: category?.color,
								fontSize: '16px',
								fontWeight: 500,
								whiteSpace: 'nowrap',
								pl: '10px',
							}}
						>
							{category?.session}
						</Typography>
					</Box>
					<Box
						sx={{
							width: '15%',
							p: '10px 20px',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						{category?.eligibility ===
						localizationConstants.eligibility ? (
							<Typography
								variant={typographyConstants.title}
								sx={{
									color: category?.color,
									fontSize: '16px',
									fontWeight: 500,
									whiteSpace: 'nowrap',
								}}
							>
								{category?.eligibility}
							</Typography>
						) : (
							<CustomAutocompleteNew
								sx={{ width: '125px' }}
								fieldSx={{
									width: '100%',
									height: '44px',
									marginTop: '3px',
								}}
								options={['Yes', 'No']}
								placeholder={`${localizationConstants.select}`}
								value={category?.eligibility}
								onChange={(e) => {
									let value = Array.isArray(e) ? e?.[0] : e
									if (value == null || value[0] == null) {
										value = 'No'
									}

									if (
										JSON.stringify(value) !==
										JSON.stringify(category?.eligibility)
									) {
										onChange({
											...data,
											[category?.session]: {
												...data?.[category?.session],
												value: value,
												frequency:
													value === 'No'
														? []
														: data?.[
																category
																	?.session
															]?.frequency,
											},
										})
									}
								}}
								disabled={readOnly}
							/>
						)}
					</Box>

					<Box
						sx={{
							display: 'flex',
							width: '15%',
							flexDirection: 'column',
							p: '10px 20px',
						}}
						gap={'5px'}
					>
						{category?.frequency ===
						localizationConstants.frequencyPerWeek ? (
							<Typography
								variant={typographyConstants.title}
								sx={{
									color: category?.color,
									fontSize: '16px',
									fontWeight: 500,
								}}
							>
								{category?.frequency}
							</Typography>
						) : (
							<CustomAutocompleteNew
								sx={{ width: '125px' }}
								fieldSx={{
									width: '100%',
									height: '44px',
									marginTop: '3px',
								}}
								options={[1, 2]}
								placeholder={`${localizationConstants.select}`}
								value={category?.frequency ?? 1}
								onChange={(e) => {
									const value = Array.isArray(e) ? e?.[0] : e

									if (
										JSON.stringify(value) !==
										JSON.stringify(category?.frequency)
									) {
										onChange({
											...data,
											[category?.session]: {
												...data?.[category?.session],
												frequency: [value],
											},
										})
									}
								}}
								disabled={
									category?.eligibility?.[0] === 'No' ||
									readOnly
								}
							/>
						)}
					</Box>
				</Box>
			))}
		</Box>
	)
}

export default PlacementWithSend
