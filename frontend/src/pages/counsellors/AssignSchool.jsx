import React from 'react'
import { useSelector } from 'react-redux'
import { Box, Dialog, Divider, Typography } from '@mui/material'
import useCommonStyles from '../../components/styles'
import { typographyConstants } from '../../resources/theme/typographyConstants'
import { localizationConstants } from '../../resources/theme/localizationConstants'
import CustomIcon from '../../components/CustomIcon'
import { iconConstants } from '../../resources/theme/iconConstants'
import CustomButton from '../../components/CustomButton'
import { userRoles } from '../../utils/globalConstants'
import CustomMultiSelectAutoComplete from '../../components/commonComponents/CustomMultiSelectAutoComplete'
import CustomAutocompleteNew from '../../components/commonComponents/CustomAutoComplete'
import CustomNote from '../../components/commonComponents/CustomNote'

const AssignSchool = ({
	open,
	setOpen,
	allList,
	setselectedList,
	selectedList,
	onAssign,
	permissionType,
}) => {
	const flexStyles = useCommonStyles()
	const { schoolsList } = useSelector((store) => store.commonData)

	const schoolsListOptions =
		schoolsList.map((obj) => ({
			label: obj.school,
			id: obj._id,
		})) || []

	return (
		<Dialog
			fullWidth
			maxWidth='lg'
			PaperProps={{
				sx: {
					height: '95vh',
					p: '24px',
				},
			}}
			open={open}
		>
			<Box sx={{ flexGrow: 1 }}>
				<Box
					className={flexStyles.flexRowCenterSpaceBetween}
					sx={{ pb: '12px' }}
				>
					<Typography
						variant={typographyConstants.h4}
						sx={{ fontWeight: 700, color: 'textColors.blue' }}
					>
						{localizationConstants.assignSchool}
					</Typography>
					<CustomIcon
						name={iconConstants.cancelRounded}
						onClick={() => {
							setOpen(false)
						}}
						style={{
							cursor: 'pointer',
							width: '26px',
							height: '26px',
						}}
						svgStyle={'width: 26px; height: 26px'}
					/>
				</Box>
				<Divider />

				<CustomNote
					message={
						permissionType === userRoles.peeguCounselor
							? 'For MyPeegu Counsellor you can select multiple schools.'
							: permissionType === userRoles.scCounselor
								? 'For School Counsellor you can select single school.'
								: 'For Principal you can select single school.'
					}
				/>

				<Box
					sx={{
						mt: '24px',
						overflow: 'auto',
						p: '5px',
					}}
				>
					<Typography variant={typographyConstants.title}>
						{localizationConstants.selectSchool}
					</Typography>

					{permissionType === userRoles.peeguCounselor ? (
						<CustomMultiSelectAutoComplete
							sx={{ minWidth: '80px', mt: 2 }}
							fieldSx={{ minHeight: '44px' }}
							value={selectedList}
							placeholder={`${localizationConstants.select} ${localizationConstants.school}`}
							onChange={(newValue) => {
								setselectedList(newValue)
							}}
							options={schoolsListOptions}
						/>
					) : (
						<CustomAutocompleteNew
							sx={{ width: '100%' }}
							fieldSx={{ height: '44px', marginTop: '3px' }}
							value={selectedList[0]}
							onChange={(newValue) => {
								setselectedList(newValue)
							}}
							options={schoolsListOptions}
							multiple={false}
							placeholder={`${localizationConstants.select} ${localizationConstants.school}`}
						/>
					)}
				</Box>
			</Box>
			<Box sx={{ mb: '36px' }}>
				<CustomButton
					text={localizationConstants.assign}
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
						onAssign(selectedList)
					}}
					disabled={selectedList?.length === 0}
				/>
			</Box>
		</Dialog>
	)
}

export default AssignSchool
