import { Box, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { AccFromBoardData, accommodationsApplicable } from './iEPConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import useCommonStyles from '../../../components/styles'
import ViewPDFDialog from '../../../components/ViewPDFDialog'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'

const AccFromBoard = ({ data, onChange, readOnly }) => {
	const flexStyles = useCommonStyles()
	const [selectedCircular, setSelectedCircular] = useState(null)
	const [viewPDFDialogOpen, setViewPDFDialogOpen] = useState(false)

	useEffect(() => {
		if (selectedCircular) {
			setViewPDFDialogOpen(true)
		}
	}, [selectedCircular])

	const handleCircularChange = (e) => {
		const selected = Array.isArray(e) ? e[0] : e
		setSelectedCircular(selected)
	}

	const handleDialogClose = () => {
		setViewPDFDialogOpen(false)
		setSelectedCircular(null)
	}
	return (
		<Box
			sx={{
				border: '1px solid',
				color: 'globalElementColors.lightBlue',
				borderRadius: '10px',
			}}
		>
			{AccFromBoardData(data).map((category, index) => (
				<Box
					className={flexStyles.flexRowCenterSpaceBetween}
					sx={{
						width: '100%',
						minHeight: index === 0 ? '30px' : '70px',
						borderBottom: index === 5 ? 'none' : '1px solid',
						borderColor: 'globalElementColors.lightBlue',
						backgroundColor: index === 0 ? '#F8FCFF' : 'none',
						borderTopLeftRadius: index === 0 ? '10px' : 'none',
						borderTopRightRadius: index === 0 ? '10px' : 'none',
						height: '50px',
					}}
				>
					<Box
						className={flexStyles.flexRowCenterSpaceBetween}
						sx={{
							width: '35%',
						}}
					>
						<Box
							sx={{
								pl: '10px',
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
								}}
							>
								{category?.details}
							</Typography>
						</Box>
						<Box
							sx={{
								p: '10px 20px',
								alignItems: 'center',
								justifyContent: 'center',
								width: '20%',
							}}
						>
							{category?.confirmation ===
							localizationConstants.confirmation ? (
								<Typography
									variant={typographyConstants.title}
									sx={{
										color: category?.color,
										fontSize: '16px',
										fontWeight: 500,
										whiteSpace: 'nowrap',
									}}
								>
									{category?.confirmation}
								</Typography>
							) : (
								<CustomAutocompleteNew
									fieldSx={{
										height: '44px',
									}}
									options={
										category?.details ===
										localizationConstants.selectAccomodationApplicable
											? accommodationsApplicable
											: ['Yes', 'No']
									}
									sx={{ width: '335px' }}
									placeholder={`${localizationConstants.select}`}
									value={category?.confirmation}
									onChange={(e) => {
										let value = Array.isArray(e) ? e : [e]

										if (value == null || value[0] == null) {
											value =
												category?.details ===
												localizationConstants.selectAccomodationApplicable
													? ''
													: 'No'
										}
										if (
											JSON.stringify(value) !==
											JSON.stringify(
												category?.confirmation,
											)
										) {
											onChange({
												...data,
												[category?.details]: value,
											})
										}
									}}
									disabled={readOnly}
								/>
							)}
						</Box>
					</Box>
					{index === 0 && (
						<Box sx={{ pr: '10px' }}>
							<CustomAutocompleteNew
								options={[
									localizationConstants.cbseCircular,
									localizationConstants.icseCircular,
								]}
								sx={{ width: '255px' }}
								fieldSx={{ height: '44px' }}
								placeholder={`${localizationConstants.view} ${localizationConstants.circular}`}
								value={selectedCircular}
								onChange={handleCircularChange}
							/>
						</Box>
					)}
				</Box>
			))}
			<ViewPDFDialog
				title={
					selectedCircular === 'CBSE Circular'
						? localizationConstants.cbseCircular
						: localizationConstants.icseCircular
				}
				open={viewPDFDialogOpen}
				onClose={handleDialogClose}
				pdfUrl={
					selectedCircular === 'CBSE Circular'
						? data?.[localizationConstants.viewCircular]
								?.cbseCircularPdfAddress
						: data?.[localizationConstants.viewCircular]
								?.icseCircularPdfAddress
				}
			/>
		</Box>
	)
}

export default AccFromBoard
