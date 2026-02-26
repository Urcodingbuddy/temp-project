import {
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	Typography,
	IconButton,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { typographyConstants } from '../../resources/theme/typographyConstants'
import { Box } from '@mui/system'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import CustomButton from '../CustomButton'
import { localizationConstants } from '../../resources/theme/localizationConstants'
import { commonComponentStyles } from '../commonComponentStyles'
import { getUserFromLocalStorage } from '../../utils/utils'
import { userRoles } from '../../utils/globalConstants'

const CustomDialogWithBreadcrumbs = ({
	onClose,
	clickableTitle,
	title,
	open,
	children,
	saveBtnText = localizationConstants.save,
	onSave,
	disableSaveBtn,
	saveBtnReq = true,
	permittedUser = false,
}) => {
	const user = getUserFromLocalStorage()
	const counselor =
		user?.permissions[0] === userRoles.peeguCounselor ||
		user?.permissions[0] === userRoles.scCounselor
	return (
		<Dialog
			fullWidth
			maxWidth='xxl'
			PaperProps={{
				sx: {
					height: '95vh',
					p: '0px 20px 20px 20px',
				},
			}}
			open={open}
		>
			<DialogTitle
				padding='18px 0px !important'
				sx={{
					display: 'flex',
					flexDirection: 'column',
					gap: '16px',
					position: 'sticky',
					top: 0,
					backgroundColor: 'white',
					zIndex: 99,
				}}
			>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<Box sx={{ display: 'flex', direction: 'row', gap: '5px' }}>
						<Typography
							variant={typographyConstants.h4}
							sx={{
								fontWeight: 500,
								color: 'globalElementColors.blue',
								fontSize: '22px',
								cursor: 'pointer',
							}}
							onClick={onClose}
						>
							{`${clickableTitle}`}
						</Typography>
						<NavigateNextIcon
							sx={{ height: '28px', width: '28px' }}
						/>
						<Typography
							variant={typographyConstants.h4}
							sx={{
								fontWeight: 500,
								fontSize: '22px',
							}}
						>
							{title}
						</Typography>
					</Box>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'row',
							gap: '12px',
							alignItems: 'center',
						}}
					>
						{(permittedUser || (saveBtnReq && counselor)) && (
							<CustomButton
								sx={{
									minWidth: '172px',
									height: '44px',
								}}
								text={saveBtnText}
								onClick={onSave}
								disabled={disableSaveBtn}
							/>
						)}
						<IconButton
							onClick={onClose}
							sx={{
								border: '1px solid #E0E0E0',
								borderRadius: '8px',
								padding: '8px',
								'&:hover': {
									backgroundColor: '#F5F5F5',
									borderColor: '#BDBDBD',
								},
							}}
						>
							<CloseIcon sx={{ fontSize: 20, color: '#666' }} />
						</IconButton>
					</Box>
				</Box>
				<Divider />
			</DialogTitle>
			<DialogContent sx={{ pt: '12px', pb: '12px' }}>{children}</DialogContent>
		</Dialog>
	)
}

export default CustomDialogWithBreadcrumbs
