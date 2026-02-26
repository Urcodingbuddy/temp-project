import React, { memo } from 'react'
import { Box, Drawer, Typography, Divider } from '@mui/material'
import CustomIcon from '../../../components/CustomIcon'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import useCommonStyles from '../../../components/styles'
import SchoolForm from './SchoolForm'
import { SchoolsStyles } from './SchoolsStyles'
import CustomButton from '../../../components/CustomButton'

const ViewSchool = ({ modals, handleModals, rowData, refreshSchoolList }) => {
	const flexStyles = useCommonStyles()
	return (
		<Drawer
			anchor='right'
			sx={SchoolsStyles.drawerSx}
			open={modals.viewSchool}
		>
			<Box sx={SchoolsStyles.drawerTopSticky}>
				<Box
					className={flexStyles.flexRowCenterSpaceBetween}
					sx={{ pb: '12px' }}
				>
					<Typography
						variant={typographyConstants.h4}
						sx={{ fontWeight: 500, color: 'textColors.blue' }}
					>
						{localizationConstants.schoolDetails}
					</Typography>
					<CustomIcon
						name={iconConstants.cancelRounded}
						onClick={() => {
							handleModals('viewSchool', false)
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
			</Box>

			<Box sx={{ overflow: 'auto' }}>
				<SchoolForm
					add={false}
					rowData={rowData}
					readOnly={true}
					hideUploadBtn={true}
					errors={{}}
					handleErrors={() => {}}
					refreshSchoolList={refreshSchoolList}
					handleModals={handleModals}
				/>
			</Box>
		</Drawer>
	)
}

export default memo(ViewSchool)
