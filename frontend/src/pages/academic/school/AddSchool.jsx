import { useState, memo } from 'react'
import { useDispatch } from 'react-redux'
import { Box, Drawer, Typography, Divider } from '@mui/material'
import CustomButton from '../../../components/CustomButton'
import CustomIcon from '../../../components/CustomIcon'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import useCommonStyles from '../../../components/styles'
import { addSchool, validateFormData } from './schoolFunctions'
import SchoolForm from './SchoolForm'
import { SchoolsStyles } from './SchoolsStyles'
import { initialSchoolErrorStates } from './schoolConstants'
import Toast from '../../../components/Toast'

const AddSchool = ({ modals, handleModals, refreshSchoolList }) => {
	const flexStyles = useCommonStyles()
	const dispatch = useDispatch()
	const [schoolFormData, setSchoolFormData] = useState({})
	const [errors, setErrors] = useState(initialSchoolErrorStates)
	const [errorToast, setErrorToast] = useState(false)

	const handleErrors = (name, value) => {
		const obj = {}
		obj[name] = value
		setErrors((state) => ({ ...state, ...obj }))
	}

	const submitAddSchool = () => {
		const validated = validateFormData(schoolFormData, setErrors)
		if (!validated) {
			setErrorToast(true)
			setTimeout(() => {
				setErrorToast(false)
			}, 2000)
			return
		}
		addSchool(schoolFormData, dispatch, handleErrors, refreshSchoolList)
	}

	return (
		<>
			<Drawer
				anchor='right'
				sx={SchoolsStyles.drawerSx}
				open={modals.addSchool}
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
							{localizationConstants.addSchool}
						</Typography>
						<CustomIcon
							name={iconConstants.cancelRounded}
							onClick={() => handleModals('addSchool', false)}
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
						add={true}
						readOnly={false}
						errors={errors}
						handleErrors={handleErrors}
						refreshSchoolList={refreshSchoolList}
						handleModals={handleModals}
					/>
				</Box>

				<Box sx={SchoolsStyles.drawerBottomSticky}>
					<CustomButton
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
						disabled={false}
						onClick={submitAddSchool}
					/>
				</Box>
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

export default memo(AddSchool)
