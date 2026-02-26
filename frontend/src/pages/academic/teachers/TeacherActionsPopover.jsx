import { Button, Popover } from '@mui/material'
import { Box } from '@mui/system'
import React from 'react'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'

const TeacherActionsPopover = ({
	open,
	anchorElForList,
	handleCloseListPopover,
	setIsEditBtnClicked,
	setDeleteTeachersDialog,
	setOpenClassromDialog,
}) => {
	return (
		<>
			<Popover
				open={open}
				anchorEl={anchorElForList}
				onClose={handleCloseListPopover}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
				slotProps={{
					paper: {
						sx: {
							borderRadius: '6px',
							backgroundColor: '#FFFFFF',
						},
					},
				}}
			>
				<Box
					sx={{
						p: 2,
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<CustomIcon
							name={iconConstants.Edit}
							style={{
								width: '20px',
								height: '20px',
							}}
						/>
						<Button
							sx={{
								textTransform: 'none',
								color: 'black',
								fontWeight: 800,
								fontSize: '14px',
							}}
							onClick={() => {
								handleCloseListPopover()
								setIsEditBtnClicked(true)
							}}
						>
							{localizationConstants.editTeacherData}
						</Button>
					</Box>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<CustomIcon
							name={iconConstants.Edit}
							style={{
								width: '20px',
								height: '20px',
							}}
						/>
						<Button
							sx={{
								textTransform: 'none',
								color: 'black',
								fontWeight: 800,
								fontSize: '14px',
							}}
							onClick={() => {
								handleCloseListPopover()
								setOpenClassromDialog(true)
							}}
						>
							{localizationConstants.editTeacherClassrooms}
						</Button>
					</Box>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							cursor: 'pointer',
						}}
					>
						<CustomIcon
							name={iconConstants.deleteStudentRed}
							style={{
								width: '20px',
								height: '20px',
							}}
						/>
						<Button
							sx={{
								textTransform: 'none',
								color: 'black',
								fontWeight: 800,
								fontSize: '14px',
							}}
							onClick={() => setDeleteTeachersDialog(true)}
						>
							{' '}
							{localizationConstants.deleteTeacher}
						</Button>
					</Box>
				</Box>
			</Popover>
		</>
	)
}

export default TeacherActionsPopover
