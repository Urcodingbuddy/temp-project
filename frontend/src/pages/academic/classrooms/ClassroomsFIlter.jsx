import React, { memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	Box,
	Drawer,
	Typography,
	Divider,
	FormControlLabel,
	Checkbox,
} from '@mui/material'
import CustomButton from '../../../components/CustomButton'
import CustomIcon from '../../../components/CustomIcon'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import useCommonStyles from '../../../components/styles'
import { counsellorStyles } from '../../counsellors/counsellorsStyles'
import {
	clearClassroomFilter,
	getAllClassrooms,
	setClassroomFilterSections,
	viewAllClassrooms,
} from './classroomsSlice'
import { filterClassRooms } from './classRoomFunctions'

const FilterClassrooms = ({ modal, handleModal }) => {
	const flexStyles = useCommonStyles()
	const { filterFields } = useSelector((state) => state.classrooms)
	const { sectionsList } = useSelector((state) => state.commonData)
	const dispatch = useDispatch()

	return (
		<Drawer
			anchor='right'
			sx={counsellorStyles.drawerSx}
			open={modal.filter}
			onClose={() => handleModal('filter', false)}
		>
			<Box sx={{ flexGrow: 1 }}>
				<Box
					className={flexStyles.flexRowCenterSpaceBetween}
					sx={{ pb: '12px' }}
				>
					<Typography
						variant={typographyConstants.h4}
						sx={{ color: 'textColors.blue' }}
					>
						{localizationConstants.filter}
					</Typography>
					<CustomIcon
						name={iconConstants.cancelRounded}
						onClick={() => handleModal('filter', false)}
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
						{localizationConstants.section}
					</Typography>
				</Box>
				<Box sx={{ pt: '20px', display: 'flex', flexWrap: 'wrap' }}>
					{filterFields?.classes?.length > 0 &&
						[...new Set(sectionsList)].map((section) => {
							return (
								<FormControlLabel
									key={section}
									label={section}
									checked={filterFields?.section?.includes(
										section,
									)}
									onChange={() => {
										dispatch(
											setClassroomFilterSections(section),
										)
									}}
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
					onClick={() => {
						dispatch(clearClassroomFilter())
						handleModal('filter', false)
						dispatch(viewAllClassrooms({ body: {} }))
					}}
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
					onClick={() => {
						filterClassRooms(dispatch, filterFields, handleModal)
					}}
					disabled={filterFields?.section?.length === 0}
				/>
			</Box>
		</Drawer>
	)
}

export default memo(FilterClassrooms)
