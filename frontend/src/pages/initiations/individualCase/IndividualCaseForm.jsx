import React, { useEffect, useRef, useState, memo } from 'react'
import {
	Backdrop,
	Box,
	Dialog,
	DialogContent,
	DialogTitle,
	Popover,
	Typography,
} from '@mui/material'
import CustomTextfield from '../../../components/CustomTextField'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import {
	initialStateIC,
	invalidTest,
	typeConstants,
	basedOnConstants,
	dimensionConstants,
	outcomeConstants,
} from './individualCaseConstants'
import useCommonStyles from '../../../components/styles'
import InlineDatePicker from '../../../components/InlineDatePicker'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import CustomTimePicker from '../../../components/CustomTimePicker'
import { formatDate } from '../../../utils/utils'
import dayjs from 'dayjs'
import SimpleCollapsibleComponent from '../../../components/SimpleCollapsibleComponent'
import CustomMultiSelectAutoComplete from '../../../components/commonComponents/CustomMultiSelectAutoComplete'
import { useSelector } from 'react-redux'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'

const IndividualCaseForm = ({
	setIndivCaseData,
	rowData,
	readOnly,
	edit,
	selectedStudents,
	setSelectedStudents,
	student,
	add,
	disableEdit,
}) => {
	const flexStyles = useCommonStyles()
	const dateRef = useRef(null)
	const [inputs, setInputs] = useState({ ...initialStateIC })
	const [openSelectStudentModal, setOpenSelectStudentModal] = useState(false)
	const [boolStats, setBoolStats] = useState({
		basic: true,
		other: true,
		date: false,
	})
	const { listStudentsData } = useSelector((state) => state.commonData)
	const [AY, setAY] = useState('')

	useEffect(() => {
		if (inputs.stype === 'Group' && add) {
			setOpenSelectStudentModal(true)
		}
	}, [inputs.stype])

	const handleClose = () => {
		setOpenSelectStudentModal(false)
	}

	const handleBoolStats = (name, stat) => {
		const obj = {}
		obj[name] = stat
		setBoolStats((state) => ({ ...state, ...obj }))
	}

	const handleInputs = (e) => {
		const { name, value } = e.target
		const obj = {}
		obj[name] = value
		const studentName = edit
			? rowData?.studentId?.studentName
			: student?.studentName
		const userId = edit ? rowData?.studentId?.user_id : student?.user_id
		const inputstate = {
			...inputs,
			...obj,
			studentName: studentName ?? inputs.studentName,
			user_id: userId ?? inputs.user_id,
		}
		setInputs(inputstate)
		setIndivCaseData(inputstate)
	}

	const handlePopover = () => {
		handleBoolStats('date', true)
	}

	useEffect(() => {
		if (rowData && rowData.academicYear) {
			setAY(rowData.academicYear || rowData.academicYear.academicYear)
		}
		if (!edit) {
			const keys = !invalidTest.includes(rowData)
				? Object.keys(rowData)?.filter((k) => k !== 'school')
				: []
			if (keys.length > 0) {
				const obj = {}
				keys.forEach((key) => {
					obj[key] = rowData[key]
				})
				setInputs((state) => ({ ...state, ...obj }))
				setIndivCaseData((state) => ({ ...state, ...obj }))
			}
		} else {
			const data = { ...rowData, ...rowData?.studentId }
			delete data.studentId
			const keys = !invalidTest.includes(data) ? Object.keys(data) : []

			if (keys.length > 0) {
				const obj = {}
				keys.forEach((key) => {
					obj[key] = data[key]
				})
				setInputs((state) => ({ ...state, ...obj }))
				setIndivCaseData((state) => ({ ...state, ...obj }))
			}
		}
	}, [rowData, edit])

	useEffect(() => {
		if (student) {
			setInputs((state) => ({
				...state,
				studentName: student.studentName,
				user_id: student.user_id,
			}))
		}
	}, [student])

	console.log(inputs)

	return (
		<Box sx={{ pb: '30px', mt: '24px' }}>
			<Box>
				<SimpleCollapsibleComponent
					open={boolStats.basic}
					title={localizationConstants.basicDetails}
					onClick={() => handleBoolStats('basic', !boolStats.basic)}
					isBorderRequired={true}
				>
					<Box
						className={flexStyles.flexRowCenterSpaceBetween}
						sx={{ p: '16px 20px', gap: '20px' }}
					>
						{/* ------------ School Name ------------ */}
						{!add && (
							<Box sx={{ flex: '1 1 24%' }}>
								<CustomTextfield
									formSx={{ width: '100%' }}
									propSx={{ height: '44px' }}
									labelText={localizationConstants.school}
									labelTypoSx={{ pb: '5px', pt: '1px' }}
									name='schoolName'
									value={
										inputs?.schoolName
											? inputs?.schoolName
											: rowData?.schoolName
									}
									disabled={true}
								/>
							</Box>
						)}
						{/* ------------ Student Name ------------ */}
						<Box sx={{ width: add ? '48%' : '24%' }}>
							<CustomTextfield
								formSx={{ width: '100%' }}
								propSx={{ height: '44px' }}
								labelTypoSx={{ pb: '4px' }}
								labelText={`${localizationConstants.studentsName}`}
								placeholder={`${localizationConstants.enter} ${localizationConstants.studentsName}`}
								name='studentName'
								value={
									inputs?.studentName ?? student?.studentName
								}
								disabled={true}
								onChange={(e) => handleInputs(e)}
							/>
						</Box>

						{/* ------------ Student ID ------------ */}
						<Box sx={{ width: add ? '48%' : '24%' }}>
							<CustomTextfield
								formSx={{ width: '100%' }}
								propSx={{ height: '44px' }}
								labelTypoSx={{ pb: '4px' }}
								labelText={`${localizationConstants.studentId} `}
								placeholder={`${localizationConstants.enter} ${localizationConstants.studentId}`}
								name='user_id'
								value={inputs?.user_id ?? student?.user_id}
								disabled={true}
								onChange={(e) => handleInputs(e)}
							/>
						</Box>
						{/* ------------ Academic Year ------------ */}
						{!add && (
							<Box sx={{ width: '24%' }}>
								<CustomTextfield
									formSx={{ width: '100%' }}
									propSx={{ height: '44px' }}
									labelText={
										localizationConstants.academicYear
									}
									labelTypoSx={{ pb: '5px', pt: '1px' }}
									name='AY'
									value={AY}
									disabled={true}
								/>
							</Box>
						)}
					</Box>

					<Box
						className={flexStyles.flexRowCenterSpaceBetween}
						sx={{ p: '16px 20px' }}
					>
						{/* ------------ Date ------------ */}
						<Box sx={{ width: '31.5%' }} ref={dateRef}>
							<Box
								onClick={(e) => {
									if (edit) {
										handlePopover(e)
									}
								}}
							>
								<CustomTextfield
									readOnly={true}
									formSx={{ width: '100%' }}
									propSx={{
										height: '50px',
									}}
									labelText={localizationConstants.date}
									labelTypoSx={{ pb: '5px', pt: '1px' }}
									endIcon={
										<CustomIcon
											name={iconConstants.calender}
										/>
									}
									value={formatDate(inputs?.date, 'date')}
								/>
							</Box>
						</Box>

						<Backdrop
							sx={{
								color: 'globalElementColors.grey1',
								zIndex: (theme) => theme.zIndex.drawer + 1,
							}}
							open={boolStats.date}
						>
							<Popover
								id={'date'}
								open={boolStats.date}
								onClose={() => handleBoolStats('date', false)}
								anchorEl={dateRef.current}
								anchorOrigin={{
									vertical: 'bottom',
									horizontal: 'left',
								}}
								sx={{
									width: '390px',
									maxHeight: '500px',
								}}
							>
								<InlineDatePicker
									date={new Date(inputs?.date)}
									dateRange={false}
									onChange={(e) => {
										handleInputs({
											target: {
												name: 'date',
												value: new Date(
													e,
												).toISOString(),
											},
										})
										handleBoolStats('date', false)
									}}
								/>
							</Popover>
						</Backdrop>

						{/* ------------ Start Time ------------ */}
						<Box sx={{ width: '31.5%' }}>
							<CustomTimePicker
								setTime={(e) => {
									const isoTime = dayjs(
										e,
										'hh:mm A',
									).toISOString()

									handleInputs({
										target: {
											name: 'startTime',
											value: isoTime,
										},
									})
								}}
								label='Start Time'
								value={inputs?.startTime}
								disabled={disableEdit}
							/>
						</Box>

						{/* ------------ End Time ------------ */}
						<Box sx={{ width: '31.5%' }}>
							<CustomTimePicker
								setTime={(e) => {
									const isoTime = dayjs(
										e,
										'hh:mm A',
									).toISOString()
									handleInputs({
										target: {
											name: 'endTime',
											value: isoTime,
										},
									})
								}}
								label='End Time'
								value={inputs?.endTime}
								disabled={disableEdit}
							/>
						</Box>
					</Box>
				</SimpleCollapsibleComponent>
			</Box>

			<Box sx={{ mt: '32px' }}>
				<SimpleCollapsibleComponent
					open={boolStats.other}
					title={localizationConstants.otherDetails}
					onClick={() => handleBoolStats('other', !boolStats.other)}
					isBorderRequired={true}
				>
					{/* ------------ Issue Reported or Identified ------------ */}
					<Box className={flexStyles.flexRowCenterSpaceBetween}>
						<Box sx={{ width: '100%', p: '16px 20px' }}>
							<CustomTextfield
								formSx={{ width: '100%' }}
								propSx={{ height: '128px' }}
								labelTypoSx={{ pb: '14px' }}
								labelText={`${localizationConstants.issueReported}`}
								name='issues'
								value={inputs?.issues}
								disabled={disableEdit}
								onChange={(e) => handleInputs(e)}
								multiline={true}
							/>
						</Box>
					</Box>

					{/* ------------ Type ------------ */}
					<Box
						className={flexStyles.flexRowCenterSpaceBetween}
						sx={{ p: '16px 20px' }}
					>
						<Box sx={{ width: '48%' }}>
							<Typography
								variant={typographyConstants.body}
							>{`${localizationConstants.type}`}</Typography>
							<CustomAutocompleteNew
								sx={{
									minWidth: '80px',
									width: '100%',
								}}
								fieldSx={{
									height: '48px',
								}}
								placeholder={`${localizationConstants.select} ${localizationConstants.type} `}
								onChange={(e) => {
									handleInputs({
										target: {
											value: e,
											name: 'stype',
										},
									})
								}}
								value={inputs?.stype}
								multiple={false}
								disabled={!add}
								options={typeConstants}
							/>
						</Box>

						{/* ------------ Based On ------------ */}
						<Box sx={{ width: '48%' }}>
							<Typography
								variant={typographyConstants.body}
							>{`${localizationConstants.basedOn}`}</Typography>
							<CustomAutocompleteNew
								sx={{
									minWidth: '80px',
									width: '100%',
									pr: '10px',
								}}
								fieldSx={{ height: '44px' }}
								placeholder={`${localizationConstants.select} ${localizationConstants.basedOn}`}
								onChange={(e) => {
									handleInputs({
										target: { value: e, name: 'basedOn' },
									})
								}}
								value={inputs?.basedOn}
								options={basedOnConstants}
								multiple={false}
								disabled={disableEdit}
							/>
						</Box>
					</Box>

					<Box
						className={flexStyles.flexRowCenterSpaceBetween}
						sx={{ p: '16px 20px' }}
					>
						{/* ------------ Dimension ------------ */}
						<Box sx={{ width: '48%' }}>
							<Typography
								variant={typographyConstants.body}
							>{`${localizationConstants.dimension}`}</Typography>
							<CustomAutocompleteNew
								sx={{
									minWidth: '80px',
									width: '100%',
								}}
								fieldSx={{ height: '44px' }}
								placeholder={`${localizationConstants.select} ${localizationConstants.dimension}`}
								onChange={(e) => {
									handleInputs({
										target: { value: e, name: 'dimension' },
									})
								}}
								value={inputs?.dimension}
								multiple={false}
								disabled={disableEdit}
								options={dimensionConstants}
							/>
						</Box>

						{/* ------------ Outcome ------------ */}
						<Box sx={{ width: '48%' }}>
							<Typography
								variant={typographyConstants.body}
							>{`${localizationConstants.outcome}`}</Typography>
							<CustomAutocompleteNew
								sx={{
									minWidth: '80px',
									width: '100%',
									pr: '10px',
								}}
								fieldSx={{ height: '48px' }}
								placeholder={`${localizationConstants.select} ${localizationConstants.outcome}`}
								value={inputs?.outcome}
								multiple={false}
								disabled={disableEdit}
								options={outcomeConstants}
								onChange={(e) => {
									handleInputs({
										target: { value: e, name: 'outcome' },
									})
								}}
							/>
						</Box>
					</Box>

					<Box
						className={flexStyles.flexRowCenterSpaceBetween}
						sx={{ p: '16px 20px' }}
					>
						{/* ------------ Goals ------------ */}
						<Box sx={{ width: '48%' }}>
							<CustomTextfield
								formSx={{ width: '100%' }}
								propSx={{ height: '128px' }}
								labelText={`${localizationConstants.goals}`}
								name='goals'
								value={inputs?.goals}
								disabled={disableEdit}
								onChange={(e) => handleInputs(e)}
								multiline={true}
								labelTypoSx={{ pb: '14px' }}
							/>
						</Box>

						{/* ------------ Activity ------------ */}
						<Box sx={{ width: '48%' }}>
							<CustomTextfield
								formSx={{ width: '100%' }}
								propSx={{ height: '128px' }}
								labelText={`${localizationConstants.activity}`}
								name='activity'
								value={inputs?.activity}
								disabled={disableEdit}
								onChange={(e) => handleInputs(e)}
								multiline={true}
								labelTypoSx={{ pb: '14px' }}
							/>
						</Box>
					</Box>

					<Box
						className={flexStyles.flexRowCenterSpaceBetween}
						sx={{ p: '16px 20px' }}
					>
						{/* ------------ Purpose ------------ */}
						<Box sx={{ width: '48%' }}>
							<CustomTextfield
								formSx={{ width: '100%' }}
								propSx={{ height: '128px' }}
								labelText={`${localizationConstants.purpose}`}
								name='purpose'
								value={inputs?.purpose}
								disabled={disableEdit}
								onChange={(e) => handleInputs(e)}
								multiline={true}
								labelTypoSx={{ pb: '14px' }}
							/>
						</Box>

						{/* ------------ Description ------------ */}
						<Box sx={{ width: '48%' }}>
							<CustomTextfield
								formSx={{ width: '100%' }}
								propSx={{ height: '128px' }}
								labelText={`${localizationConstants.description}`}
								name='description'
								value={inputs?.description}
								disabled={disableEdit}
								onChange={(e) => handleInputs(e)}
								multiline={true}
								labelTypoSx={{ pb: '14px' }}
							/>
						</Box>
					</Box>

					<Box
						className={flexStyles.flexRowCenterSpaceBetween}
						sx={{ p: '16px 20px' }}
					>
						{/* ------------ Improvement Areas ------------ */}
						<Box sx={{ width: '48%' }}>
							<CustomTextfield
								formSx={{ width: '100%' }}
								propSx={{ height: '128px' }}
								labelText={`${localizationConstants.improvementAreas}`}
								name='improvements'
								value={inputs?.improvements}
								disabled={disableEdit}
								onChange={(e) => handleInputs(e)}
								multiline={true}
								labelTypoSx={{ pb: '14px' }}
							/>
						</Box>

						{/* ------------ Comments ------------ */}
						<Box sx={{ width: '48%' }}>
							<CustomTextfield
								formSx={{ width: '100%' }}
								propSx={{ height: '128px' }}
								labelText={`${localizationConstants.comments}`}
								name='comments'
								value={inputs?.comments}
								disabled={disableEdit}
								onChange={(e) => handleInputs(e)}
								multiline={true}
								labelTypoSx={{ pb: '14px' }}
							/>
						</Box>
					</Box>

					<Box
						className={flexStyles.flexRowCenterSpaceBetween}
						sx={{ p: '16px 20px' }}
					>
						{/* ------------ Task Assigned ------------ */}
						<Box sx={{ width: '48%' }}>
							<CustomTextfield
								formSx={{ width: '100%' }}
								propSx={{ height: '128px' }}
								labelText={`${localizationConstants.taskAssigned}`}
								name='tasksAssigned'
								value={inputs?.tasksAssigned}
								disabled={disableEdit}
								onChange={(e) => handleInputs(e)}
								multiline={true}
								labelTypoSx={{ pb: '14px' }}
							/>
						</Box>

						{/* ------------ POA ------------ */}
						<Box sx={{ width: '48%' }}>
							<CustomTextfield
								formSx={{ width: '100%' }}
								propSx={{ height: '128px' }}
								labelText={`${localizationConstants.poa}`}
								name='poa'
								value={inputs?.poa}
								disabled={disableEdit}
								onChange={(e) => handleInputs(e)}
								multiline={true}
								labelTypoSx={{ pb: '14px' }}
							/>
						</Box>
					</Box>
				</SimpleCollapsibleComponent>

				<Dialog
					open={openSelectStudentModal}
					onClose={handleClose}
					PaperProps={{
						style: {
							borderRadius: '20px',
							minWidth: '500px',
							//   padding: '40px',
							minHeight: '200px',
						},
					}}
				>
					<DialogTitle
						sx={{
							display: 'flex',
							justifyContent: 'center',
						}}
					>
						<Typography
							variant={typographyConstants.body2}
							sx={{
								fontWeight: 400,
								fontSize: '25px',
							}}
						>
							Select Students
						</Typography>
					</DialogTitle>

					<DialogContent
						sx={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						{/* ------------------ Students ------------------ */}
						<CustomMultiSelectAutoComplete
							sx={{ minWidth: '350px' }}
							fieldSx={{ minHeight: '44px' }}
							value={selectedStudents}
							placeholder={`${localizationConstants.select} ${localizationConstants.student}`}
							onChange={(e) => {
								setSelectedStudents(e)
							}}
							options={listStudentsData.map((obj) => ({
								label: obj.studentName,
								id: obj._id,
							}))}
							name='students'
						/>
					</DialogContent>
				</Dialog>
			</Box>
		</Box>
	)
}

export default memo(IndividualCaseForm)
