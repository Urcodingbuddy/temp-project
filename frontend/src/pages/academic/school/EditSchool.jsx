import { useState, memo } from 'react'
import { Box, Drawer, Typography, Divider } from '@mui/material'
import { useDispatch } from 'react-redux'
import CustomButton from '../../../components/CustomButton'
import CustomIcon from '../../../components/CustomIcon'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import useCommonStyles from '../../../components/styles'
import {
	// checkNoChanges,
	updateSchool,
	validateFormData,
} from './schoolFunctions'
import SchoolForm from './SchoolForm'
import { SchoolsStyles } from './SchoolsStyles'
import CustomAlertDialog from '../../../components/CustomDialogForCancelling'
import { initialSchoolErrorStates } from './schoolConstants'
import Toast from '../../../components/Toast'

const EditSchool = ({
	modals,
	handleModals,
	rowData = [],
	refreshSchoolList,
}) => {
	const dispatch = useDispatch()
	const flexStyles = useCommonStyles()
	const [schoolFormData, setSchoolFormData] = useState({})
	const [errors, setErrors] = useState(initialSchoolErrorStates)
	const [actionTypes, setActionTypes] = useState({
		def: true,
		edit: false,
	})
	const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false)
	// const [noChanges, setNoChanges] = useState(false)
	const [errorToast, setErrorToast] = useState(false)

	const handleErrors = (name, value) => {
		const obj = {}
		obj[name] = value
		setErrors((state) => ({ ...state, ...obj }))
	}

	const handleActionTypes = (type) => {
		const def = type === 'def',
			edit = type === 'edit'
		setActionTypes({ def, edit })
	}

	const submitUpdateSchool = () => {
		const validated = validateFormData(schoolFormData, setErrors)
		if (!validated) {
			setErrorToast(true)
			setTimeout(() => {
				setErrorToast(false)
			}, 2000)
			return
		}

		updateSchool(
			schoolFormData,
			dispatch,
			rowData?._id,
			handleActionTypes,
			handleErrors,
			refreshSchoolList,
		)
	}

	return (
		<>
			<Drawer
				anchor='right'
				sx={SchoolsStyles.drawerSx}
				open={modals.editSchool}
			>
				<Box sx={SchoolsStyles.drawerTopSticky}>
					<Box
						className={flexStyles.flexRowCenterSpaceBetween}
						sx={{ pb: '12px' }}
					>
						<Typography
							variant={typographyConstants.h4}
							sx={{ color: 'textColors.blue' }}
						>
							{localizationConstants.editSchool}
						</Typography>
						<CustomIcon
							name={iconConstants.cancelRounded}
							onClick={() => {
								actionTypes.edit
									? setOpenConfirmationDialog(true)
									: handleModals('editSchool', false)
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
						setSchoolFormData={setSchoolFormData}
						add={false}
						rowData={rowData}
						readOnly={actionTypes.def}
						errors={errors}
						handleErrors={handleErrors}
						handleActionTypes={handleActionTypes}
						isEditButtonClicked={actionTypes.edit}
						handleModals={handleModals}
						refreshSchoolList={refreshSchoolList}
					/>
				</Box>

				{actionTypes.edit && (
					<Box
						className={flexStyles.flexRowCenterSpaceBetween}
						sx={SchoolsStyles.drawerBottomSticky}
					>
						<CustomButton
							variant='outlined'
							sx={{
								minWidth: '48%',
								height: '60px',
								backgroundColor: 'transparent',
							}}
							text={localizationConstants.cancel}
							onClick={() => {
								handleActionTypes('def')
							}}
						/>

						<CustomButton
							text={localizationConstants.submit}
							sx={{
								minWidth: '48%',
								height: '60px',
							}}
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
							// disabled={disableSubmit}
							onClick={submitUpdateSchool}
						/>
					</Box>
				)}
				<CustomAlertDialog
					isOpen={openConfirmationDialog}
					iconName={iconConstants.alertOctagon}
					title={localizationConstants.confirmation}
					message={localizationConstants.cancelConfirmationMsg}
					titleSx={{
						color: 'textColors.red',
						fontWeight: 500,
						pb: '20px',
						pt: '25px',
					}}
					titleTypoVariant={typographyConstants.h4}
					messageTypoVariant={typographyConstants.h5}
					leftButtonText={localizationConstants.cancel}
					rightButtonText={localizationConstants.yes}
					onLeftButtonClick={() => setOpenConfirmationDialog(false)}
					onRightButtonClick={() => {
						setOpenConfirmationDialog(false)
						handleModals('editSchool', false)
						handleActionTypes('def')
					}}
				/>
			</Drawer>

			{errorToast && (
				<Toast
					//   title={'Section'}
					subTitle={localizationConstants.errorData}
					isSuccess={false}
					direction={'right'}
				/>
			)}
		</>
	)
}

export default memo(EditSchool)
