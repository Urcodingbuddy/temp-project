import React, { memo, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	Box,
	Divider,
	Drawer,
	FormControl,
	FormControlLabel,
	Radio,
	RadioGroup,
	Typography,
} from '@mui/material'
import { counsellorStyles } from '../../counsellors/counsellorsStyles'
import useCommonStyles from '../../../components/styles'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import CustomButton from '../../../components/CustomButton'
import { getBackgroundColor, handleEditBaseline } from './baselineFunctions'

const BaselineDrawer = ({
	baselineDrawerOpen,
	setBaselineDrawerOpen,
	data,
	category,
	total,
	rowId,
	pageSize,
	onEditBaseline,
}) => {
	const flexStyles = useCommonStyles()
	const [isEditBtnClicked, setIsEditBtnClicked] = useState(false)
	const [selectedData, setSelectedData] = useState([])
	const [count, setCount] = useState(0)
	const dispatch = useDispatch()
	const { appPermissions } = useSelector((store) => store.dashboardSliceSetup)

	const handleQuestionStatus = (index, status) => {
		const list = [...selectedData]
		list[index] = { ...list[index], status }
		let total = 0
		list.forEach((li) => {
			total += li.status ? 1 : 0
		})
		setCount(total)
		setSelectedData(list)
	}

	useEffect(() => {
		setSelectedData(data)
		setCount(total)
	}, [data])

	return (
		<Drawer
			anchor='right'
			sx={counsellorStyles.drawerSx}
			open={baselineDrawerOpen}
			onClose={() =>
				isEditBtnClicked ? '' : setBaselineDrawerOpen(false)
			}
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
						{category}
					</Typography>
					<CustomIcon
						name={iconConstants.cancelRounded}
						style={{
							cursor: 'pointer',
							width: '26px',
							height: '26px',
						}}
						svgStyle={'width: 26px; height: 26px'}
						onClick={() => {
							setBaselineDrawerOpen(false)
							setIsEditBtnClicked(false)
						}}
					/>
				</Box>

				<Divider />

				<Box
					sx={{
						mt: '20px',
						height: appPermissions?.ObservationManagement?.edit
							? `calc(100vh - 270px)`
							: `calc(100vh - 200px)`,
						overflow: 'auto',
					}}
				>
					{selectedData?.map((question, index) => {
						return (
							<Box sx={{ mb: '28px' }} key={index}>
								<Box
									sx={{
										display: 'flex',
										justifyContent: 'flex-start',
									}}
								>
									<Typography
										variant={typographyConstants.h5}
										sx={{ minWidth: '20px' }}
									>
										{`${index + 1}.`}
									</Typography>
									<Typography
										variant={typographyConstants.h5}
									>
										{`${localizationConstants.baselineQns[question?.question]}`}
									</Typography>
								</Box>

								<FormControl
									sx={{ mt: '24px', pl: '20px' }}
									disabled={!isEditBtnClicked}
								>
									<RadioGroup
										row
										aria-labelledby='demo-row-radio-buttons-group-label'
										name='row-radio-buttons-group'
									>
										<FormControlLabel
											value='Yes'
											control={
												<Radio
													checked={
														question?.status ===
														true
													}
												/>
											}
											label='Yes'
											onClick={() => {
												if (isEditBtnClicked) {
													handleQuestionStatus(
														index,
														true,
													)
												}
											}}
										/>
										<FormControlLabel
											value='No'
											control={
												<Radio
													checked={
														question?.status ===
														false
													}
												/>
											}
											label='No'
											onClick={() => {
												if (isEditBtnClicked) {
													handleQuestionStatus(
														index,
														false,
													)
												}
											}}
										/>
									</RadioGroup>
								</FormControl>
							</Box>
						)
					})}
				</Box>
			</Box>
			<Box
				className={flexStyles.flexRowCenterSpaceBetween}
				sx={{
					mb: '36px',
					borderRadius: '4px',
					backgroundColor: getBackgroundColor(count, true),
					minHeight: '50px',
					pl: '16px',
					pr: '16px',
				}}
			>
				<Box
					className={flexStyles.flexRowCenterSpaceBetween}
					sx={{ width: '100%' }}
				>
					<Typography variant={typographyConstants.h4}>
						{localizationConstants.total}
					</Typography>
					<Typography variant={typographyConstants.h4}>
						{count}
					</Typography>
				</Box>
			</Box>
			{isEditBtnClicked && (
				<Box
					className={flexStyles.flexRowCenterSpaceBetween}
					sx={{ mb: '36px', mt: '-20px' }}
				>
					<CustomButton
						sx={{
							minWidth: '192px',
							height: '60px',
							backgroundColor: 'transparent',
							border: '1px solid',
							borderColor: 'globalElementColors.blue',
						}}
						typoSx={{ color: 'textColors.black' }}
						text={localizationConstants.cancel}
						onClick={() => setIsEditBtnClicked(false)}
					/>
					<CustomButton
						sx={{ minWidth: '192px', height: '60px' }}
						text={localizationConstants.submit}
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
							handleEditBaseline(
								selectedData,
								dispatch,
								category,
								rowId,
								count,
								setBaselineDrawerOpen,
								pageSize,
								onEditBaseline,
							)
							setTimeout(() => {
								setIsEditBtnClicked(false)
							}, 1000)
						}}
					/>
				</Box>
			)}{' '}
			{!isEditBtnClicked &&
				appPermissions?.ObservationManagement?.edit && (
					<CustomButton
						sx={{ mb: '36px', mt: '-20px' }}
						text={localizationConstants.edit}
						onClick={() => setIsEditBtnClicked(true)}
					/>
				)}
		</Drawer>
	)
}

export default memo(BaselineDrawer)
