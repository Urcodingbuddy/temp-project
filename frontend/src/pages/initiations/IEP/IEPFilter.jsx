import {
	Checkbox,
	Divider,
	Drawer,
	FormControlLabel,
	Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { counsellorStyles } from '../../counsellors/counsellorsStyles'
import { Box } from '@mui/system'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import CustomButton from '../../../components/CustomButton'
import useCommonStyles from '../../../components/styles'
import { studentStatusArray } from '../sendCheckList/sendCheckListConstants'

const IEPFilter = ({
	open,
	handleClose,
	sectionsList,
	selectedDropdownData,
	handleClear,
	handleApply,
	studentStatus,
}) => {
	const flexStyles = useCommonStyles()

	const [sectionsData, setSectionsData] = useState([])
	const [students, setStudents] = useState('')

	useEffect(() => {
		setSectionsData(selectedDropdownData?.sections)
		setStudents(studentStatus ?? '')
	}, [selectedDropdownData?.sections])
	return (
		<div>
			<Drawer
				anchor='right'
				sx={counsellorStyles.drawerSx}
				open={open}
				onClose={() => handleClose('filter', false)}
			>
				<Box sx={{ flexGrow: 1 }}>
					<Box
						className={flexStyles.flexRowCenterSpaceBetween}
						sx={{ pb: '12px' }}
					>
						<Typography
							variant={typographyConstants.h4}
							sx={{ fontWeight: 500, color: 'textColors.blue' }}
						>
							{localizationConstants.filter}
						</Typography>
						<CustomIcon
							name={iconConstants.cancelRounded}
							onClick={() => handleClose('filter', false)}
							style={{
								cursor: 'pointer',
								width: '26px',
								height: '26px',
							}}
							svgStyle={'width: 26px; height: 26px'}
						/>
					</Box>
					<Divider />
					<Box sx={counsellorStyles.typeRadioSx}>
						<Typography variant={typographyConstants.title}>
							{localizationConstants.studentStatus}
						</Typography>
					</Box>

					<Box
						sx={{
							pt: '20px',
							display: 'flex',
							flexWrap: 'wrap',
							pl: '5px',
						}}
					>
						{studentStatusArray?.length > 0 &&
							studentStatusArray.map((status, index) => {
								return (
									<FormControlLabel
										key={index}
										checked={students === status}
										onChange={(event) => {
											setStudents(status)
										}}
										label={status}
										control={
											<Checkbox
												icon={
													<CustomIcon
														name={
															iconConstants.uncheckedRound
														}
														style={{
															width: '22px',
															height: '22px',
														}}
														svgStyle={
															'width: 22px; height: 22px'
														}
													/>
												}
												checkedIcon={
													<CustomIcon
														name={
															iconConstants.radioCheckedBlue
														}
														style={{
															width: '22px',
															height: '22px',
														}}
														svgStyle={
															'width: 22px; height: 22px'
														}
													/>
												}
											/>
										}
										sx={{
											width: '45%',
											'& .MuiTypography-root': {
												fontWeight: 500,
												fontSize: '14px',
											},
										}}
									/>
								)
							})}
					</Box>
					<Box sx={counsellorStyles.typeRadioSx}>
						<Typography variant={typographyConstants.title}>
							{localizationConstants.section}
						</Typography>
					</Box>
					<Box
						sx={{
							pt: '20px',
							display: 'flex',
							flexWrap: 'wrap',
							pl: '5px',
						}}
					>
						{sectionsList.map((section, index) => {
							return (
								<FormControlLabel
									key={index}
									checked={sectionsData?.includes(section)}
									onChange={(event) => {
										const {
											target: { checked },
										} = event
										if (checked) {
											setSectionsData([
												...sectionsData,
												section,
											])
										} else {
											setSectionsData(
												sectionsData.filter(
													(item) => item !== section,
												),
											)
										}
									}}
									label={section}
									control={
										<Checkbox
											icon={
												<CustomIcon
													name={
														iconConstants.uncheckedBox
													}
													style={{
														width: '22px',
														height: '22px',
													}}
													svgStyle={
														'width: 22px; height: 22px'
													}
												/>
											}
											checkedIcon={
												<CustomIcon
													name={
														iconConstants.checkedBoxBlue
													}
													style={{
														width: '22px',
														height: '22px',
													}}
													svgStyle={
														'width: 22px; height: 22px'
													}
												/>
											}
										/>
									}
									sx={{
										width: '45%',
										'& .MuiTypography-root': {
											fontWeight: 500,
											fontSize: '14px',
										},
									}}
								/>
							)
						})}
					</Box>
				</Box>
				<Box
					className={flexStyles.flexRowCenterSpaceBetween}
					sx={{ mb: '36px' }}
				>
					<Typography
						variant={typographyConstants.h4}
						sx={counsellorStyles.clearTypoSx}
						onClick={handleClear}
					>
						{localizationConstants.clear}
					</Typography>
					<CustomButton
						sx={{ minWidth: '283px', height: '60px' }}
						text={localizationConstants.apply}
						endIcon={
							<CustomIcon
								name={iconConstants.doneWhite}
								style={{
									width: '24px',
									height: '24px',
									marginLeft: '10px',
								}}
								svgStyle={'width: 24px; height: 24px'}
							/>
						}
						onClick={() => handleApply(sectionsData, students)}
						disabled={
							JSON.stringify(sectionsData) ===
								JSON.stringify(
									selectedDropdownData?.sections,
								) &&
							JSON.stringify(studentStatus) ===
								JSON.stringify(students)
						}
					/>
				</Box>
			</Drawer>
		</div>
	)
}

export default IEPFilter
