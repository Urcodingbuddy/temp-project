import { useEffect, useRef, useState } from 'react'
import InlineDatePicker from '../../../components/InlineDatePicker'
import { Backdrop, Box, Popover, Typography } from '@mui/material'
import useCommonStyles from '../../../components/styles'
import {
	coreCompetencyConstants,
	initialStateIC,
	outcomeConstants,
} from './SELConstants'
import SimpleCollapsibleComponent from '../../../components/SimpleCollapsibleComponent'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import CustomTextfield from '../../../components/CustomTextField'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import {
	formatDate,
	getCurACYear,
	getUserFromLocalStorage,
} from '../../../utils/utils'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'
import CommonBarFilter, {
	initialBarFilterStates,
} from '../../../components/commonComponents/CommonBarFilter'
import { useDispatch, useSelector } from 'react-redux'
import { getAllClassrooms, getSchoolsList } from '../../../redux/commonSlice'
import { userRoles } from '../../../utils/globalConstants'

const SELFormCompnent = ({
	write,
	rowData,
	setSELData,
	update,
	setDisabaleSaveBtn,
	clearOptionsRef,
}) => {
	const flexStyles = useCommonStyles()
	const dispatch = useDispatch()
	const dateRef = useRef(null)
	const user = getUserFromLocalStorage()
	const disabled = !write
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const [barFilterData, setBarFilterData] = useState(initialBarFilterStates)
	const [inputs, setInputs] = useState({ ...initialStateIC })
	const [boolVals, setBoolVals] = useState({
		selCollapse: true,
		datePicker: false,
	})

	const handleInputs = (name, value) => {
		const inputVals = { ...inputs, [name]: value }
		setInputs(inputVals)
	}
	const handleBoolVals = (name, value) => {
		setBoolVals((state) => ({ ...state, [name]: value }))
	}

	const fetchSchoolsList = (academicYear) => {
		const body = {
			filter: { academicYear: [academicYear] },
		}
		dispatch(getSchoolsList({ body }))
	}

	const fetchClassroomsList = (academicYear, school) => {
		dispatch(
			getAllClassrooms({
				body: {
					filter: {
						academicYear: [academicYear],
						schoolIds: [school],
					},
				},
			}),
		)
	}

	useEffect(() => {
		if (!update) {
			const curAYString = getCurACYear()
			const AY = academicYears.find(
				(obj) => obj.academicYear === curAYString,
			)
			if (AY) {
				setBarFilterData((state) => ({ ...state, selectdAYs: AY._id }))
			}
		} else {
			if (rowData && Object.keys(rowData).length > 0) {
				fetchSchoolsList(rowData.academicYearId)
				fetchClassroomsList(rowData.academicYearId, rowData.school)

				const barFilterdata = {
					selectdAYs: rowData.academicYearId,
					selectdSchools: rowData.school,
					selectdClassrooms: [rowData.classRoomId],
					selectdSections: rowData.classRoomId,
					className: rowData.className,
					sectionName: rowData.section,
				}
				setBarFilterData(barFilterdata)

				let inputObj = { ...inputs }
				const keys = Object.keys(initialStateIC)
				keys.forEach((key) => {
					inputObj[key] = rowData[key]
				})
				setInputs(inputObj)
				setSELData({
					barFilterData: barFilterdata,
					inputVals: inputObj,
				})
			}
		}
	}, [])

	useEffect(() => {
		setSELData((state) => ({
			...state,
			barFilterData,
			inputVals: inputs,
		}))
	}, [barFilterData, setSELData, inputs])

	const checkInputsForDisable = (inputVals, rowData, isUpdate) => {
		const allFieldsFilled = Object.entries(inputVals).every(
			([key, val]) => val !== '' && val !== null && val !== undefined,
		)

		console.log(allFieldsFilled)

		// If update mode
		let isChanged = true
		if (isUpdate && rowData) {
			isChanged = Object.entries(inputVals).some(([key, val]) => {
				return val !== rowData[key]
			})
		}
		// debugger
		setDisabaleSaveBtn(
			barFilterData?.selectdSections?.length === 0 ||
				barFilterData?.selectdSections === null ||
				!(allFieldsFilled && isChanged),
		)
	}

	useEffect(() => {
		checkInputsForDisable(inputs, rowData, update)
	}, [inputs, rowData, update, barFilterData.selectdSections])

	useEffect(() => {
		if (barFilterData.academicYear) {
			console.log(barFilterData.academicYear)
		}
	}, [barFilterData.academicYear])

	const superAdmin = user?.permissions[0] === userRoles?.superAdmin

	console.log(inputs)
	console.log(barFilterData)

	return (
		<>
			<Box sx={{ py: '1rem' }}>
				<CommonBarFilter
					barFilterData={barFilterData}
					setBarFilterData={setBarFilterData}
					isStudentRequired={true}
					setStudent={() => {}}
					dropdownOptions={{
						academicYear: true,
						school: true,
						classroom: true,
						section: true,
						student: false,
						search: false,
					}}
					required={true}
					disabled={update}
					ref={clearOptionsRef}
				/>
			</Box>
			<Box>
				<SimpleCollapsibleComponent
					open={boolVals.selCollapse}
					title={localizationConstants.selInformation}
					onClick={() =>
						handleBoolVals('selCollapse', !boolVals.selCollapse)
					}
					isBorderRequired={true}
				>
					<Box
						className={flexStyles.flexRowCenterSpaceBetween}
						// sx={{ pt: '30px' }}
					>
						{/* ------------ Date ------------ */}
						<Box sx={{ width: '48%' }} ref={dateRef}>
							<Box
								onClick={(e) => {
									if (!disabled) {
										handleBoolVals('datePicker', true)
									}
								}}
							>
								<CustomTextfield
									readOnly={true}
									formSx={{ width: '100%' }}
									propSx={{ height: '44px' }}
									labelText={
										localizationConstants.dateOfInteraction
									}
									isRedStarRequired={true}
									labelTypoSx={{ pb: '5px', pt: '1px' }}
									endIcon={
										<CustomIcon
											name={iconConstants.calender}
										/>
									}
									value={formatDate(
										inputs?.interactionDate,
										'date',
									)}
									disabled={superAdmin}
								/>
							</Box>
						</Box>

						{/* ------------ Core Competency------------ */}
						<Box sx={{ width: '48%' }}>
							<Typography
								variant={typographyConstants.body}
							>{`${localizationConstants.coreCompetency}`}</Typography>
							<Typography
								variant={typographyConstants.body}
								color='red'
							>{`*`}</Typography>
							<CustomAutocompleteNew
								fieldSx={{ height: '48px' }}
								value={inputs.coreCompetency}
								placeholder={`${localizationConstants.select} ${localizationConstants.coreCompetency}`}
								onChange={(e) => {
									handleInputs('coreCompetency', e)
								}}
								options={coreCompetencyConstants || []}
								disabled={superAdmin}
							/>
						</Box>
					</Box>

					<Box
						className={flexStyles.flexRowCenterSpaceBetween}
						sx={{ pt: '30px' }}
					>
						{/* ------------ Topic ------------ */}
						<Box sx={{ width: '48%' }}>
							<CustomTextfield
								formSx={{ width: '100%' }}
								propSx={{ height: '128px' }}
								labelText={`${localizationConstants.topic}`}
								name='topic'
								value={inputs.topic}
								disabled={superAdmin}
								onChange={(e) =>
									handleInputs('topic', e.target.value)
								}
								multiline={true}
								labelTypoSx={{ pb: '14px' }}
								isRedStarRequired={true}
							/>
						</Box>

						{/* ------------ Comments/Observation ------------ */}
						<Box sx={{ width: '48%' }}>
							<CustomTextfield
								formSx={{ width: '100%' }}
								propSx={{ height: '128px' }}
								labelText={`${localizationConstants.commentsOrObservation}`}
								name='commentsOrObservations'
								value={inputs?.commentsOrObservations}
								disabled={superAdmin}
								onChange={(e) =>
									handleInputs(
										'commentsOrObservations',
										e.target.value,
									)
								}
								multiline={true}
								labelTypoSx={{ pb: '14px' }}
								isRedStarRequired={true}
							/>
						</Box>
					</Box>

					<Box
						className={flexStyles.flexRowCenterSpaceBetween}
						sx={{ pt: '30px' }}
					>
						{/* ------------ Activity ------------ */}
						<Box sx={{ width: '48%' }}>
							<CustomTextfield
								formSx={{ width: '100%' }}
								propSx={{ height: '128px' }}
								labelText={`${localizationConstants.activity}`}
								name='activity'
								value={inputs?.activity}
								disabled={superAdmin}
								onChange={(e) =>
									handleInputs('activity', e.target.value)
								}
								multiline={true}
								labelTypoSx={{ pb: '14px' }}
								isRedStarRequired={true}
							/>
						</Box>

						{/* ------------ Task Assigned ------------ */}
						<Box sx={{ width: '48%' }}>
							<CustomTextfield
								formSx={{ width: '100%' }}
								propSx={{ height: '128px' }}
								labelText={`${localizationConstants.taskAssignedOrReflection}`}
								name='taskAssignedOrReflection'
								value={inputs?.taskAssignedOrReflection}
								disabled={superAdmin}
								onChange={(e) =>
									handleInputs(
										'taskAssignedOrReflection',
										e.target.value,
									)
								}
								multiline={true}
								labelTypoSx={{ pb: '14px' }}
								isRedStarRequired={true}
							/>
						</Box>
					</Box>

					<Box
						className={flexStyles.flexRowCenterSpaceBetween}
						sx={{ pt: '30px' }}
					>
						{/* ------------ Outcome ------------ */}
						<Box sx={{ width: '100%' }}>
							<Typography
								variant={typographyConstants.body}
							>{`${localizationConstants.outcome}`}</Typography>{' '}
							<Typography
								variant={typographyConstants.body}
								color='red'
							>{`*`}</Typography>
							<CustomAutocompleteNew
								fieldSx={{ height: '48px' }}
								value={inputs.outcome}
								placeholder={`${localizationConstants.select} ${localizationConstants.outcome}`}
								onChange={(e) => {
									handleInputs('outcome', e)
								}}
								options={outcomeConstants}
								disabled={superAdmin}
							/>
						</Box>
					</Box>
					<Box
						className={flexStyles.flexRowCenterSpaceBetween}
						sx={{ pt: '30px' }}
					>
						{/* ------------ Interventions ------------ */}
						<Box sx={{ width: '48%' }}>
							<CustomTextfield
								formSx={{ width: '100%' }}
								propSx={{ height: '128px' }}
								labelText={`${localizationConstants.interventionsForEducators} ${localizationConstants.ifAny}`}
								name='interventionForEducators'
								value={inputs?.interventionForEducators}
								disabled={superAdmin}
								onChange={(e) =>
									handleInputs(
										'interventionForEducators',
										e.target.value,
									)
								}
								multiline={true}
								labelTypoSx={{ pb: '14px' }}
								isRedStarRequired={true}
							/>
						</Box>

						{/* ------------ FollowUp ------------ */}
						<Box sx={{ width: '48%' }}>
							<CustomTextfield
								formSx={{ width: '100%' }}
								propSx={{ height: '128px' }}
								labelText={`${localizationConstants.followUpActivity}  ${localizationConstants.ifAny}`}
								name='followUpActivity'
								value={inputs?.followUpActivity}
								disabled={superAdmin}
								onChange={(e) =>
									handleInputs(
										'followUpActivity',
										e.target.value,
									)
								}
								multiline={true}
								labelTypoSx={{ pb: '14px' }}
								isRedStarRequired={true}
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
				open={boolVals.datePicker}
			>
				<Popover
					id={'date'}
					open={boolVals.datePicker}
					onClose={() => handleBoolVals('datePicker', false)}
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
						date={new Date(inputs?.interactionDate)}
						dateRange={false}
						onChange={(e) => {
							handleInputs(
								'interactionDate',
								new Date(e).toISOString(),
							)
							handleBoolVals('datePicker', false)
						}}
					/>
				</Popover>
			</Backdrop>
		</>
	)
}

export default SELFormCompnent
