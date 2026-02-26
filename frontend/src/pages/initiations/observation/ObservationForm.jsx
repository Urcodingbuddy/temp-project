import React, { useEffect, useRef, useState, memo } from 'react'
import { Backdrop, Box, Popover, Typography } from '@mui/material'
import CustomTextfield from '../../../components/CustomTextField'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import useCommonStyles from '../../../components/styles'
import InlineDatePicker from '../../../components/InlineDatePicker'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import {
	formatDate,
	getUserFromLocalStorage,
	isValidDuration,
} from '../../../utils/utils'
import {
	initialBasicStates,
	initialClassAndMicroMStates,
	invalidTest,
	statusConstants,
} from './observationConstants'
import CustomDropDown from './../../../components/CustomDropdown'
import SimpleCollapsibleComponent from '../../../components/SimpleCollapsibleComponent'
import { userRoles } from '../../../utils/globalConstants'

const ObservationForm = ({
	rowData,
	edit,
	add,
	setObservationData,
	student,
}) => {
	const flexStyles = useCommonStyles()
	const dateRef = useRef(null)
	const [basicInputs, setBasicInputs] = useState({ ...initialBasicStates })
	const [AY, setAY] = useState('')
	const user = getUserFromLocalStorage()

	const [classroomAndMicorMInputs, setClassroomAndMicorMInputs] = useState({
		...initialClassAndMicroMStates,
	})

	const [boolStats, setBoolStats] = useState({
		basic: true,
		classroomPresence: true,
		microMental: true,
		date: false,
	})

	const handleBoolStats = (name, stat) => {
		const obj = {}
		obj[name] = stat
		setBoolStats((state) => ({ ...state, ...obj }))
	}

	const handleInputs = (e, basics, subkey) => {
		const { name, value } = e.target
		const studentName = edit
			? rowData?.studentId?.studentName
			: student?.studentName
		const userId = edit ? rowData?.studentId?.user_id : student?.user_id
		if (basics) {
			const inputstate = {
				...basicInputs,
				studentName: studentName ?? basicInputs.studentName,
				user_id: userId ?? basicInputs.user_id,
			}
			if (name === 'duration' && !isValidDuration(value)) return
			inputstate[name] = value

			setBasicInputs(inputstate)
			setObservationData({
				...inputstate,
				...classroomAndMicorMInputs,
			})
		} else {
			const obj = {}
			const subobj = {}
			subobj[subkey] = value
			obj[name] = { ...classroomAndMicorMInputs[name], ...subobj }
			const inputstate = { ...classroomAndMicorMInputs, ...obj }
			setClassroomAndMicorMInputs(inputstate)
			setObservationData({
				...inputstate,
				studentName: student?.studentName,
				user_id: student?.user_id,
				...basicInputs,
			})
		}
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
				const classMicroObj = {}
				keys.forEach((key) => {
					const rdataType = typeof rowData[key]
					if (rdataType === 'string') {
						obj[key] = rowData[key]
					} else if (
						rdataType === 'object' &&
						rowData[key] !== null &&
						!Array.isArray(rowData[key])
					) {
						classMicroObj[key] = rowData[key]
					}
				})
				setBasicInputs((state) => ({
					...state,
					...obj,
				}))
				setObservationData((state) => ({
					...state,
					...obj,
				}))
				setClassroomAndMicorMInputs((state) => ({
					...state,
					...classMicroObj,
				}))
			}
		} else {
			const data = { ...rowData, ...rowData?.studentId }
			delete data.studentId
			const keys = !invalidTest.includes(data) ? Object.keys(data) : []

			if (keys.length > 0) {
				const obj = {}
				const classMicroObj = {}
				keys.forEach((key) => {
					const rdataType = typeof rowData[key]
					if (rdataType === 'string') {
						obj[key] = rowData[key]
					} else if (
						rdataType === 'object' &&
						rowData[key] !== null &&
						!Array.isArray(rowData[key])
					) {
						classMicroObj[key] = rowData[key]
					}
				})
				setBasicInputs((state) => ({ ...state, ...obj }))

				setObservationData((state) => ({ ...state, ...obj }))
				setClassroomAndMicorMInputs((state) => ({
					...state,
					...classMicroObj,
				}))
			}
		}
	}, [rowData, edit])

	useEffect(() => {
		if (student) {
			setBasicInputs((state) => ({
				...state,
				studentName: student.studentName,
				user_id: student.user_id,
			}))
		}
	}, [student])
	const disableEdit = user?.permissions[0] === userRoles?.superAdmin

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
						sx={{
							p: '16px 20px',
							display: 'flex',
							flexWrap: 'wrap',
							gap: '16px 20px',
							justifyContent: 'space-between',
						}}
					>
						{/* ------------ School Name ------------ */}
						{!add && (
							<Box sx={{ flex: '1 1 30%' }}>
								<CustomTextfield
									formSx={{ width: '100%' }}
									propSx={{ height: '44px' }}
									labelText={localizationConstants.school}
									labelTypoSx={{ pb: '5px', pt: '1px' }}
									name='schoolName'
									value={basicInputs?.schoolName}
									disabled={true}
								/>
							</Box>
						)}

						{/* ------------ Student Name ------------ */}
						<Box sx={{ flex: add ? '1 1 48%' : '1 1 30%' }}>
							<CustomTextfield
								formSx={{ width: '100%' }}
								propSx={{ height: '44px' }}
								labelTypoSx={{ pb: '4px' }}
								labelText={localizationConstants.studentsName}
								placeholder={`${localizationConstants.enter} ${localizationConstants.studentsName}`}
								name='studentName'
								value={basicInputs?.studentName}
								disabled={true}
							/>
						</Box>

						{/* ------------ Student ID ------------ */}
						<Box sx={{ flex: add ? '1 1 48%' : '1 1 30%' }}>
							<CustomTextfield
								formSx={{ width: '100%' }}
								propSx={{ height: '44px' }}
								labelTypoSx={{ pb: '4px' }}
								labelText={localizationConstants.studentId}
								placeholder={`${localizationConstants.enter} ${localizationConstants.studentId}`}
								name='user_id'
								value={basicInputs?.user_id}
								disabled={true}
							/>
						</Box>
					</Box>

					<Box
						sx={{
							p: '16px 20px',
							display: 'flex',
							flexWrap: 'wrap',
							gap: '16px 20px',
							justifyContent: 'space-between',
						}}
					>
						{/* ------------ Academic Year ------------ */}
						{!add && (
							<Box sx={{ flex: '1 1 30%' }}>
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

						{/* ------------ Date Of Onboarding ------------ */}
						<Box sx={{ flex: '1 1 30%' }} ref={dateRef}>
							<Box
								onClick={(e) => {
									if (edit) handlePopover(e)
								}}
							>
								<CustomTextfield
									readOnly={true}
									formSx={{ width: '100%' }}
									propSx={{ height: '44px' }}
									labelText={localizationConstants.date}
									labelTypoSx={{ pb: '5px', pt: '1px' }}
									endIcon={
										<CustomIcon
											name={iconConstants.calender}
										/>
									}
									disabled={disableEdit}
									value={formatDate(basicInputs?.doo, 'doo')}
								/>
							</Box>
						</Box>

						{/* ------------ Duration ------------ */}
						<Box sx={{ flex: '1 1 30%' }}>
							<CustomTextfield
								formSx={{ width: '100%' }}
								propSx={{ height: '44px' }}
								labelText={`${localizationConstants.durationPascalCase} Time (Mins)`}
								labelTypoSx={{ pb: '5px', pt: '1px' }}
								type='text'
								name='duration'
								value={basicInputs?.duration}
								onChange={(e) => handleInputs(e, true)}
								disabled={disableEdit}
								maxLength={3}
							/>
						</Box>
					</Box>
				</SimpleCollapsibleComponent>
			</Box>

			<Box sx={{ mt: '32px' }}>
				<SimpleCollapsibleComponent
					open={boolStats.classroomPresence}
					title={localizationConstants.classroomPresence}
					onClick={() =>
						handleBoolStats(
							'classroomPresence',
							!boolStats.classroomPresence,
						)
					}
					isBorderRequired={true}
				>
					<Box
						className={flexStyles.flexSpaceBetween}
						sx={{ p: '16px 20px' }}
					>
						{/* ------------ Punctuality ------------ */}
						<Box sx={{ width: '48%' }}>
							<Box className={flexStyles.flexRowAlignCenter}>
								<Typography sx={{ mr: '12px' }}>
									{localizationConstants.punctuality}
								</Typography>
								<CustomDropDown
									value={
										classroomAndMicorMInputs?.punctuality
											?.status
									}
									setValue={(e) =>
										handleInputs(
											{
												target: {
													name: 'punctuality',
													value: e,
												},
											},
											false,
											'status',
										)
									}
									options={statusConstants}
									id='punctuality'
									optionsWidth='200px'
									selectWidth='200px'
									disabled={disableEdit}
									placeholder='Select'
								/>
							</Box>

							<Box sx={{ mt: '16px' }}>
								<CustomTextfield
									formSx={{ width: '100%' }}
									propSx={{ height: '128px' }}
									placeholder={`${localizationConstants.enter} ${localizationConstants.punctuality}`}
									name='punctuality'
									value={
										classroomAndMicorMInputs?.punctuality
											?.comments
									}
									onChange={(e) =>
										handleInputs(e, false, 'comments')
									}
									disabled={disableEdit}
									multiline={true}
								/>
							</Box>
						</Box>

						{/* ------------ Ability To Follow Guidelines ------------ */}
						<Box sx={{ width: '48%' }}>
							<Box className={flexStyles.flexRowAlignCenter}>
								<Typography sx={{ mr: '12px' }}>
									{
										localizationConstants.abilityToFollowGuidelines
									}
								</Typography>
								<CustomDropDown
									value={
										classroomAndMicorMInputs
											?.abilityToFollowGuidelines?.status
									}
									setValue={(e) =>
										handleInputs(
											{
												target: {
													name: 'abilityToFollowGuidelines',
													value: e,
												},
											},
											false,
											'status',
										)
									}
									options={statusConstants}
									id='abilityToFollowGuidelines'
									optionsWidth='260px'
									selectWidth='260px'
									disabled={disableEdit}
									placeholder='Select'
								/>
							</Box>
							<Box>
								<CustomTextfield
									formSx={{ width: '100%', mt: '16px' }}
									propSx={{ height: '128px' }}
									name='abilityToFollowGuidelines'
									value={
										classroomAndMicorMInputs
											?.abilityToFollowGuidelines
											?.comments
									}
									onChange={(e) =>
										handleInputs(e, false, 'comments')
									}
									multiline={true}
									labelTypoSx={{ pb: '14px' }}
									disabled={disableEdit}
									placeholder={`Enter ${localizationConstants.abilityToFollowGuidelines}`}
								/>
							</Box>
						</Box>
					</Box>

					<Box
						className={flexStyles.flexSpaceBetween}
						sx={{ p: '16px 20px' }}
					>
						{/* ------------ Ability To Follow Instructions ------------ */}
						<Box sx={{ width: '48%' }}>
							<Box className={flexStyles.flexRowAlignCenter}>
								<Typography sx={{ mr: '12px' }}>
									{
										localizationConstants.abilityToFollowInstructions
									}
								</Typography>
								<CustomDropDown
									value={
										classroomAndMicorMInputs
											?.abilityToFollowInstructions
											?.status
									}
									setValue={(e) =>
										handleInputs(
											{
												target: {
													name: 'abilityToFollowInstructions',
													value: e,
												},
											},
											false,
											'status',
										)
									}
									options={statusConstants}
									id='abilityToFollowInstructions'
									optionsWidth='270px'
									selectWidth='270px'
									disabled={disableEdit}
									placeholder='Select'
								/>
							</Box>

							<Box sx={{ mt: '16px' }}>
								<CustomTextfield
									formSx={{ width: '100%' }}
									propSx={{ height: '128px' }}
									placeholder={`${localizationConstants.enter} ${localizationConstants.abilityToFollowInstructions}`}
									name='abilityToFollowInstructions'
									value={
										classroomAndMicorMInputs
											?.abilityToFollowInstructions
											?.comments
									}
									onChange={(e) =>
										handleInputs(e, false, 'comments')
									}
									disabled={disableEdit}
									multiline={true}
								/>
							</Box>
						</Box>

						{/* ------------ Participation ------------ */}
						<Box sx={{ width: '48%' }}>
							<Box className={flexStyles.flexRowAlignCenter}>
								<Typography sx={{ mr: '12px' }}>
									{localizationConstants.participation}
								</Typography>
								<CustomDropDown
									value={
										classroomAndMicorMInputs?.participation
											?.status
									}
									setValue={(e) =>
										handleInputs(
											{
												target: {
													name: 'participation',
													value: e,
												},
											},
											false,
											'status',
										)
									}
									options={statusConstants}
									id='participation'
									optionsWidth='200px'
									selectWidth='200px'
									disabled={disableEdit}
									placeholder='Select'
								/>
							</Box>
							<Box>
								<CustomTextfield
									formSx={{ width: '100%', mt: '16px' }}
									propSx={{ height: '128px' }}
									name='participation'
									value={
										classroomAndMicorMInputs?.participation
											?.comments
									}
									onChange={(e) =>
										handleInputs(e, false, 'comments')
									}
									multiline={true}
									labelTypoSx={{ pb: '14px' }}
									disabled={disableEdit}
									placeholder={`Enter ${localizationConstants.participation}`}
								/>
							</Box>
						</Box>
					</Box>

					<Box
						className={flexStyles.flexSpaceBetween}
						sx={{ p: '16px 20px' }}
					>
						{/* ------------ Completion Of Tasks ------------ */}
						<Box sx={{ width: '48%' }}>
							<Box className={flexStyles.flexRowAlignCenter}>
								<Typography sx={{ mr: '12px' }}>
									{localizationConstants.completionOfTasks}
								</Typography>
								<CustomDropDown
									value={
										classroomAndMicorMInputs
											?.completionOfTasks?.status
									}
									setValue={(e) =>
										handleInputs(
											{
												target: {
													name: 'completionOfTasks',
													value: e,
												},
											},
											false,
											'status',
										)
									}
									options={statusConstants}
									id='completionOfTasks'
									optionsWidth='200px'
									selectWidth='200px'
									disabled={disableEdit}
									placeholder='Select'
								/>
							</Box>

							<Box sx={{ mt: '16px' }}>
								<CustomTextfield
									formSx={{ width: '100%' }}
									propSx={{ height: '128px' }}
									placeholder={`${localizationConstants.enter} ${localizationConstants.completionOfTasks}`}
									name='completionOfTasks'
									value={
										classroomAndMicorMInputs
											?.completionOfTasks?.comments
									}
									onChange={(e) =>
										handleInputs(e, false, 'comments')
									}
									disabled={disableEdit}
									multiline={true}
								/>
							</Box>
						</Box>

						{/* ------------ Ability To Work Independently ------------ */}
						<Box sx={{ width: '48%' }}>
							<Box className={flexStyles.flexRowAlignCenter}>
								<Typography sx={{ mr: '12px' }}>
									{
										localizationConstants.abilityToWorkIndependently
									}
								</Typography>
								<CustomDropDown
									value={
										classroomAndMicorMInputs
											?.abilityToWorkIndependently?.status
									}
									setValue={(e) =>
										handleInputs(
											{
												target: {
													name: 'abilityToWorkIndependently',
													value: e,
												},
											},
											false,
											'status',
										)
									}
									options={statusConstants}
									id='abilityToWorkIndependently'
									optionsWidth='200px'
									selectWidth='200px'
									disabled={disableEdit}
									placeholder='Select'
								/>
							</Box>
							<Box>
								<CustomTextfield
									formSx={{ width: '100%', mt: '16px' }}
									propSx={{ height: '128px' }}
									name='abilityToWorkIndependently'
									value={
										classroomAndMicorMInputs
											?.abilityToWorkIndependently
											?.comments
									}
									onChange={(e) =>
										handleInputs(e, false, 'comments')
									}
									multiline={true}
									labelTypoSx={{ pb: '14px' }}
									disabled={disableEdit}
									placeholder={`Enter ${localizationConstants.abilityToWorkIndependently}`}
								/>
							</Box>
						</Box>
					</Box>

					{/* ------------ Incidental Note/ Additional Comment ------------ */}
					<Box sx={{ p: '16px 20px' }}>
						<Box className={flexStyles.flexRowAlignCenter}>
							<Typography sx={{ mr: '12px' }}>
								{localizationConstants.incidentalNote}
							</Typography>
							<CustomDropDown
								value={
									classroomAndMicorMInputs
										?.incedentalOrAdditionalNote?.status
								}
								setValue={(e) =>
									handleInputs(
										{
											target: {
												name: 'incedentalOrAdditionalNote',
												value: e,
											},
										},
										false,
										'status',
									)
								}
								options={statusConstants}
								id='incedentalOrAdditionalNote'
								optionsWidth='200px'
								selectWidth='200px'
								disabled={disableEdit}
								placeholder='Select'
							/>
						</Box>
						<Box>
							<CustomTextfield
								formSx={{ width: '100%', mt: '16px' }}
								propSx={{ height: '128px' }}
								name='incedentalOrAdditionalNote'
								value={
									classroomAndMicorMInputs
										?.incedentalOrAdditionalNote?.comments
								}
								onChange={(e) =>
									handleInputs(e, false, 'comments')
								}
								multiline={true}
								labelTypoSx={{ pb: '14px' }}
								disabled={disableEdit}
								placeholder={`Enter ${localizationConstants.incidentalNote}`}
							/>
						</Box>
					</Box>
				</SimpleCollapsibleComponent>
			</Box>

			<Box sx={{ mt: '32px' }}>
				<SimpleCollapsibleComponent
					open={boolStats.microMental}
					title={localizationConstants.microMentalStatusExamination}
					onClick={() =>
						handleBoolStats('microMental', !boolStats.microMental)
					}
					isBorderRequired={true}
				>
					<Box
						className={flexStyles.flexSpaceBetween}
						sx={{ p: '16px 20px' }}
					>
						{/* ------------ Appearance ------------ */}
						<Box sx={{ width: '48%' }}>
							<Box className={flexStyles.flexRowAlignCenter}>
								<Typography sx={{ mr: '12px' }}>
									{localizationConstants.appearance}
								</Typography>
								<CustomDropDown
									value={
										classroomAndMicorMInputs?.appearance
											?.status
									}
									setValue={(e) =>
										handleInputs(
											{
												target: {
													name: 'appearance',
													value: e,
												},
											},
											false,
											'status',
										)
									}
									options={statusConstants}
									id='appearance'
									optionsWidth='200px'
									selectWidth='200px'
									disabled={disableEdit}
									placeholder='Select'
								/>
							</Box>

							<Box sx={{ mt: '16px' }}>
								<CustomTextfield
									formSx={{ width: '100%' }}
									propSx={{ height: '128px' }}
									placeholder={`${localizationConstants.enter} ${localizationConstants.appearance}`}
									name='appearance'
									value={
										classroomAndMicorMInputs?.appearance
											?.comments
									}
									onChange={(e) =>
										handleInputs(e, false, 'comments')
									}
									disabled={disableEdit}
									multiline={true}
								/>
							</Box>
						</Box>

						{/* ------------ Attitude ------------ */}
						<Box sx={{ width: '48%' }}>
							<Box className={flexStyles.flexRowAlignCenter}>
								<Typography sx={{ mr: '12px' }}>
									{localizationConstants.attitude}
								</Typography>
								<CustomDropDown
									value={
										classroomAndMicorMInputs?.attitude
											?.status
									}
									setValue={(e) =>
										handleInputs(
											{
												target: {
													name: 'attitude',
													value: e,
												},
											},
											false,
											'status',
										)
									}
									options={statusConstants}
									id='attitude'
									optionsWidth='260px'
									disabled={disableEdit}
									selectWidth='260px'
									placeholder='Select'
								/>
							</Box>
							<Box>
								<CustomTextfield
									formSx={{ width: '100%', mt: '16px' }}
									propSx={{ height: '128px' }}
									name='attitude'
									value={
										classroomAndMicorMInputs?.attitude
											?.comments
									}
									onChange={(e) =>
										handleInputs(e, false, 'comments')
									}
									multiline={true}
									labelTypoSx={{ pb: '14px' }}
									disabled={disableEdit}
									placeholder={`Enter ${localizationConstants.attitude}`}
								/>
							</Box>
						</Box>
					</Box>

					<Box
						className={flexStyles.flexSpaceBetween}
						sx={{ p: '16px 20px' }}
					>
						{/* ------------ Behavioral ------------ */}
						<Box sx={{ width: '48%' }}>
							<Box className={flexStyles.flexRowAlignCenter}>
								<Typography sx={{ mr: '12px' }}>
									{localizationConstants.behaviour}
								</Typography>
								<CustomDropDown
									value={
										classroomAndMicorMInputs?.behaviour
											?.status
									}
									setValue={(e) =>
										handleInputs(
											{
												target: {
													name: 'behaviour',
													value: e,
												},
											},
											false,
											'status',
										)
									}
									options={statusConstants}
									id='behaviour'
									optionsWidth='270px'
									disabled={disableEdit}
									selectWidth='270px'
									placeholder='Select'
								/>
							</Box>

							<Box sx={{ mt: '16px' }}>
								<CustomTextfield
									formSx={{ width: '100%' }}
									propSx={{ height: '128px' }}
									placeholder={`${localizationConstants.enter} ${localizationConstants.behaviour}`}
									name='behaviour'
									value={
										classroomAndMicorMInputs?.behaviour
											?.comments
									}
									onChange={(e) =>
										handleInputs(e, false, 'comments')
									}
									disabled={disableEdit}
									multiline={true}
								/>
							</Box>
						</Box>

						{/* ------------ Speech ------------ */}
						<Box sx={{ width: '48%' }}>
							<Box className={flexStyles.flexRowAlignCenter}>
								<Typography sx={{ mr: '12px' }}>
									{localizationConstants.speech}
								</Typography>
								<CustomDropDown
									value={
										classroomAndMicorMInputs?.speech?.status
									}
									setValue={(e) =>
										handleInputs(
											{
												target: {
													name: 'speech',
													value: e,
												},
											},
											false,
											'status',
										)
									}
									options={statusConstants}
									id='speech'
									optionsWidth='270px'
									selectWidth='270px'
									disabled={disableEdit}
									placeholder='Select'
								/>
							</Box>

							<Box sx={{ mt: '16px' }}>
								<CustomTextfield
									formSx={{ width: '100%' }}
									propSx={{ height: '128px' }}
									placeholder={`${localizationConstants.enter} ${localizationConstants.speech}`}
									name='speech'
									value={
										classroomAndMicorMInputs?.speech
											?.comments
									}
									onChange={(e) =>
										handleInputs(e, false, 'comments')
									}
									disabled={disableEdit}
									multiline={true}
								/>
							</Box>
						</Box>
					</Box>

					<Box
						className={flexStyles.flexSpaceBetween}
						sx={{ p: '16px 20px' }}
					>
						{/* ------------ Affect/Mood ------------ */}
						<Box sx={{ width: '48%' }}>
							<Box className={flexStyles.flexRowAlignCenter}>
								<Typography sx={{ mr: '12px' }}>
									{localizationConstants.affect}
								</Typography>
								<CustomDropDown
									value={
										classroomAndMicorMInputs?.affetcOrMood
											?.status
									}
									setValue={(e) =>
										handleInputs(
											{
												target: {
													name: 'affetcOrMood',
													value: e,
												},
											},
											false,
											'status',
										)
									}
									options={statusConstants}
									id='affetcOrMood'
									optionsWidth='200px'
									selectWidth='200px'
									disabled={disableEdit}
									placeholder='Select'
								/>
							</Box>

							<Box sx={{ mt: '16px' }}>
								<CustomTextfield
									formSx={{ width: '100%' }}
									propSx={{ height: '128px' }}
									placeholder={`${localizationConstants.enter} ${localizationConstants.affect}/Mood`}
									name='affetcOrMood'
									value={
										classroomAndMicorMInputs?.affetcOrMood
											?.comments
									}
									onChange={(e) =>
										handleInputs(e, false, 'comments')
									}
									disabled={disableEdit}
									multiline={true}
								/>
							</Box>
						</Box>

						{/* ------------ Thought (Process, Form) ------------ */}
						<Box sx={{ width: '48%' }}>
							<Box className={flexStyles.flexRowAlignCenter}>
								<Typography sx={{ mr: '12px' }}>
									{localizationConstants.thought}
								</Typography>
								<CustomDropDown
									value={
										classroomAndMicorMInputs
											?.thoughtProcessOrForm?.status
									}
									setValue={(e) =>
										handleInputs(
											{
												target: {
													name: 'thoughtProcessOrForm',
													value: e,
												},
											},
											false,
											'status',
										)
									}
									options={statusConstants}
									id='thoughtProcessOrForm'
									optionsWidth='200px'
									selectWidth='200px'
									placeholder='Select'
									disabled={disableEdit}
								/>
							</Box>
							<Box>
								<CustomTextfield
									formSx={{ width: '100%', mt: '16px' }}
									propSx={{ height: '128px' }}
									name='thoughtProcessOrForm'
									value={
										classroomAndMicorMInputs
											?.thoughtProcessOrForm?.comments
									}
									onChange={(e) =>
										handleInputs(e, false, 'comments')
									}
									multiline={true}
									labelTypoSx={{ pb: '14px' }}
									placeholder={`Enter ${localizationConstants.thought}`}
									disabled={disableEdit}
								/>
							</Box>
						</Box>
					</Box>

					{/* ------------ Additional Comment/Note ------------ */}
					<Box sx={{ p: '16px 20px' }}>
						<Box className={flexStyles.flexRowAlignCenter}>
							<Typography sx={{ mr: '12px' }}>
								{localizationConstants.incidentalNote}
							</Typography>
							<CustomDropDown
								value={
									classroomAndMicorMInputs
										?.additionalCommentOrNote?.status
								}
								setValue={(e) =>
									handleInputs(
										{
											target: {
												name: 'additionalCommentOrNote',
												value: e,
											},
										},
										false,
										'status',
									)
								}
								options={statusConstants}
								id='additionalCommentOrNote'
								optionsWidth='200px'
								selectWidth='200px'
								disabled={disableEdit}
								placeholder='Select'
							/>
						</Box>
						<Box>
							<CustomTextfield
								formSx={{ width: '100%', mt: '16px' }}
								propSx={{ height: '128px' }}
								name='additionalCommentOrNote'
								value={
									classroomAndMicorMInputs
										?.additionalCommentOrNote?.comments
								}
								onChange={(e) =>
									handleInputs(e, false, 'comments')
								}
								multiline={true}
								labelTypoSx={{ pb: '14px' }}
								disabled={disableEdit}
								placeholder={`Enter ${localizationConstants.additionalCommentOrNote}`}
							/>
						</Box>
					</Box>
				</SimpleCollapsibleComponent>
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
						date={new Date(basicInputs?.doo)}
						dateRange={false}
						onChange={(e) => {
							handleInputs(
								{
									target: {
										name: 'doo',
										value: new Date(e).toISOString(),
									},
								},
								true,
							)
							handleBoolStats('date', false)
						}}
					/>
				</Popover>
			</Backdrop>
		</Box>
	)
}

export default memo(ObservationForm)
