import React, { forwardRef, useEffect, useImperativeHandle } from 'react'
import { useState } from 'react'
import IEPForm from './IEPForm'
import { Box } from '@mui/material'
import useCommonStyles from '../../../components/styles'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { useDispatch, useSelector } from 'react-redux'
import {
	addOrUpdate,
	formDataFormat,
	viewByIdAPICallFunction,
} from './iEPFunctions'
import { initialAddform } from './iEPConstants'
import { iconConstants } from '../../../resources/theme/iconConstants'
import CustomAlertDialog from '../../../components/CustomDialogForCancelling'
import { getUserFromLocalStorage } from '../../../utils/utils'
import CustomTextfield from '../../../components/CustomTextField'

const EditIEP = forwardRef(
	({ onEditIEP, onSaveStateChange, rowDataSelected, handleClose }, ref) => {
		const dispatch = useDispatch()
		const flexStyles = useCommonStyles()
		const user = getUserFromLocalStorage()
		const { studentBaselineReport, viewByIDData } = useSelector(
			(store) => store.StudentIEP,
		)
		const { academicYears } = useSelector(
			(store) => store.dashboardSliceSetup,
		)
		const [addIEPData, setAddIEPData] = useState(initialAddform(user))
		const [oldAddIEPData, setOldAddIEPData] = useState(initialAddform(user))
		const [isBtnDisabled, setIsBtnDisabled] = useState(false)
		const [openConfirmationDialog, setOpenConfirmationDialog] =
			useState(false)
		const { appPermissions } = useSelector(
			(store) => store.dashboardSliceSetup,
		)

		useEffect(() => {
			if (rowDataSelected._id) {
				viewByIdAPICallFunction(dispatch, rowDataSelected._id)
			}
		}, [])

		useEffect(() => {
			if (viewByIDData) {
				formDataFormat(
					viewByIDData ?? initialAddform(user),
					setAddIEPData,
					setOldAddIEPData,
					user,
				)
			}
		}, [viewByIDData])

		const handleSaveClick = () => {
			addOrUpdate(
				{
					selectdAYs: viewByIDData.academicYear,
					selectdSchools: viewByIDData.school,
				},
				addIEPData,
				true,
				dispatch,
				{
					user_id: viewByIDData.user_id,
					studentName: viewByIDData.studentName,
				},
				addIEPData?.Evolution?.[localizationConstants.reportLink]
					?.fileName?.length > 0,
				studentBaselineReport?.isBaseLineRecordExist ?? false,
				onEditIEP,
				viewByIDData._id,
				handleClose,
			)
		}

		const disableSave =
			JSON.stringify(oldAddIEPData) === JSON.stringify(addIEPData) ||
			isBtnDisabled

		useEffect(() => {
			onSaveStateChange(disableSave)
		}, [disableSave])

		useImperativeHandle(ref, () => ({
			handleSaveClick,
			disableSave,
		}))

		const AY =
			academicYears.find((obj) => obj._id === viewByIDData?.academicYear)
				?.academicYear || ''

		return (
			<Box className={flexStyles.flexColumn}>
				<CustomTextfield
					formSx={{ width: '250px' }}
					propSx={{ height: '44px' }}
					labelText={localizationConstants.academicYear}
					labelTypoSx={{ pb: '5px', pt: '1px' }}
					name='AY'
					value={AY}
					disabled={true}
				/>

				<IEPForm
					addIEPData={addIEPData}
					setAddIEPData={setAddIEPData}
					isBaselineExist={
						studentBaselineReport?.isBaseLineRecordExist ?? false
					}
					readOnly={!appPermissions?.['student-IEP']?.edit}
					studentBaselineReport={studentBaselineReport}
					setIsBtnDisabled={setIsBtnDisabled}
				/>
				<CustomAlertDialog
					isOpen={openConfirmationDialog}
					title={localizationConstants.confirmation}
					iconName={iconConstants.alertOctagon}
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
					onLeftButtonClick={() => {
						setOpenConfirmationDialog(false)
					}}
					onRightButtonClick={() => {
						formDataFormat(
							viewByIDData ?? initialAddform(user),
							setAddIEPData,
							setOldAddIEPData,
							user,
						)
						setOpenConfirmationDialog(false)
					}}
				/>
			</Box>
		)
	},
)

export default EditIEP
