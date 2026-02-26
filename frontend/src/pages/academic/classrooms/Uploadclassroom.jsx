import React, { useEffect, useState, memo, useRef } from 'react'
import { Box, Typography } from '@mui/material'
import FileUploadDialog from '../../../components/FileUploadDialog'
import useCommonStyles from '../../../components/styles'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { uploadClassroomData } from './classRoomFunctions'
import { useDispatch, useSelector } from 'react-redux'
import { classroomUploadDefaultExcelColumns } from './classroomsContants'
import {
	downloadExcel,
	getCurrentAcademicYearId,
	getCurrentAcademicYearObj,
} from '../../../utils/utils'
import { iconConstants } from '../../../resources/theme/iconConstants'
import CustomDialog from '../../../components/CustomDialog'
import { ErrorMsgDownload } from '../students/studentsFunctions'
import { initialuploadSelectOptionsStates } from '../../../utils/utils'
import { getSchoolsList } from '../../../redux/commonSlice'
import { bulkUploadMandatoryKeys } from '../../../utils/globalConstants'

const Uploadclassroom = ({ modal, handleModal, refreshList }) => {
	const flexStyles = useCommonStyles()
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const dispatch = useDispatch()
	const { schoolsList } = useSelector((state) => state.commonData)
	const [inputFileObject, setInputFileObject] = useState({
		fileName: '',
		file: '',
		fileUrl: '',
		extensionError: false,
	})

	const [outputFileObject, setOutputFileObject] = useState({
		fileName: '',
		file: '',
		fileUrl: '',
		extensionError: false,
	})
	const [excelTableData, setExcelTableData] = useState({})
	const [deleteBulkDialog, setDeleteBulkDialog] = useState(false)
	const [response, setResponse] = useState('')

	// const [selectedAy, setSelectedAy] = useState('')
	const [selectedOptionsData, setSelctedOptionsData] = useState(
		initialuploadSelectOptionsStates,
	)
	const [acyOptionsGreaterLPAcy, setAcyOptionsGreaterLPAcy] = useState(null)

	useEffect(() => {
		if (Array.isArray(excelTableData) && excelTableData?.length > 0) {
			uploadClassroomData(
				dispatch,
				excelTableData,
				handleModal,
				schoolsList,
				setInputFileObject,
				setDeleteBulkDialog,
				setResponse,
				selectedOptionsData.selectedPromotedAcy,
				selectedOptionsData.selectdSchool,
				refreshList,
			)
		}
	}, [excelTableData])

	const isInitialLoad = useRef(true)
	useEffect(() => {
		if (academicYears.length > 0 && isInitialLoad.current) {
			const currentAYId = getCurrentAcademicYearId(academicYears)
			if (currentAYId) {
				setSelctedOptionsData((state) => ({
					...state,
					selectdAY: currentAYId,
				}))
			}
			isInitialLoad.current = false
		}
	}, [academicYears])

	const fetchSchoolList = () => {
		if (selectedOptionsData.selectdAY) {
			const body = {
				filter: { academicYear: selectedOptionsData.selectdAY },
			}
			dispatch(getSchoolsList({ body }))
		}
	}
	useEffect(() => {
		fetchSchoolList()
	}, [selectedOptionsData.selectdAY])

	useEffect(() => {
		if (
			selectedOptionsData.selectdSchool &&
			schoolsList.length &&
			academicYears.length
		) {
			const selectedSchool = schoolsList.find(
				(school) => school._id === selectedOptionsData.selectdSchool,
			)
			if (!selectedSchool) {
				return
			}

			const scLastPromoteAY = selectedSchool.lastPromotionAcademicYear
			const currentAY = getCurrentAcademicYearObj(academicYears)

			let selectOption = null
			let ayListAfterOrLastPromoteAY = []
			if (!scLastPromoteAY || scLastPromoteAY === currentAY._id) {
				selectOption = currentAY._id
				ayListAfterOrLastPromoteAY = [
					{
						label: currentAY.academicYear,
						id: currentAY._id,
					},
				]
			} else {
				const lastPromotedAY = academicYears.find(
					(obj) => obj._id === scLastPromoteAY,
				)
				selectOption = lastPromotedAY._id
				if (lastPromotedAY) {
					ayListAfterOrLastPromoteAY = academicYears
						.filter((acy) => acy.order >= lastPromotedAY.order)
						.map((acy) => ({
							label: acy.academicYear,
							id: acy._id,
						}))
				}
			}

			setSelctedOptionsData((state) => ({
				...state,
				selectedPromotedAcy: selectOption,
			}))
			setAcyOptionsGreaterLPAcy(ayListAfterOrLastPromoteAY)
		}
	}, [selectedOptionsData.selectdSchool, schoolsList, academicYears])

	const Content = (
		<>
			<Box sx={{ display: 'flex', mb: '20px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box sx={{ display: 'flex', gap: '3px' }}>
						<Typography variant={typographyConstants.body}>
							{' '}
							{localizationConstants.className}{' '}
						</Typography>
						<Typography
							sx={{
								color: 'red',
							}}
						>
							{'*'}
						</Typography>
					</Box>
					<Typography variant={typographyConstants.body}>
						:
					</Typography>
				</Box>
				<Box sx={{ width: '58%' }}>
					<Typography variant={typographyConstants.title}>
						{' '}
						{localizationConstants.classNameInstructionMsg}
					</Typography>
				</Box>
			</Box>

			<Box sx={{ display: 'flex', mb: '20px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box sx={{ display: 'flex', gap: '3px' }}>
						<Typography variant={typographyConstants.body}>
							{' '}
							{
								localizationConstants.classRoomTableConstants
									.classHierarchy.label
							}{' '}
						</Typography>
						<Typography
							sx={{
								color: 'red',
							}}
						>
							{'*'}
						</Typography>
					</Box>
					<Typography variant={typographyConstants.body}>
						:
					</Typography>
				</Box>
				<Box sx={{ width: '58%' }}>
					<Typography variant={typographyConstants.title}>
						{' '}
						{localizationConstants.classHeirarchyInstructionMsg}
					</Typography>
				</Box>
			</Box>
			<Box sx={{ display: 'flex', mb: '20px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box sx={{ display: 'flex', gap: '3px' }}>
						<Typography variant={typographyConstants.body}>
							{' '}
							{localizationConstants.section}{' '}
						</Typography>
						<Typography
							sx={{
								color: 'red',
							}}
						>
							{'*'}
						</Typography>
					</Box>

					<Typography variant={typographyConstants.body}>
						:
					</Typography>
				</Box>
				<Box sx={{ width: '58%' }}>
					<Typography variant={typographyConstants.title}>
						{' '}
						{localizationConstants.sectionNameInstructionMsg}{' '}
					</Typography>
				</Box>
			</Box>

			<Box sx={{ display: 'flex', mb: '20px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box sx={{ display: 'flex', gap: '3px' }}>
						<Typography variant={typographyConstants.body}>
							{' '}
							{
								localizationConstants.classRoomTableConstants
									.sectionHierarchy.label
							}{' '}
						</Typography>
						<Typography
							sx={{
								color: 'red',
							}}
						>
							{'*'}
						</Typography>
					</Box>
					<Typography variant={typographyConstants.body}>
						:
					</Typography>
				</Box>
				<Box sx={{ width: '58%' }}>
					<Typography variant={typographyConstants.title}>
						{' '}
						{localizationConstants.sectionHierarchyInstructionMsg}
					</Typography>
				</Box>
			</Box>

			<Box sx={{ display: 'flex', mb: '20px' }}>
				<Box
					className={flexStyles.flexSpaceBetween}
					sx={{ width: '40%', mx: '1%' }}
				>
					<Box sx={{ display: 'flex', gap: '3px' }}>
						<Typography variant={typographyConstants.body}>
							{' '}
							{`${localizationConstants.teacher} ${localizationConstants.id}`}{' '}
						</Typography>
					</Box>
					<Typography variant={typographyConstants.body}>
						:
					</Typography>
				</Box>
				<Box sx={{ width: '58%' }}>
					<Typography variant={typographyConstants.title}>
						{' '}
						{localizationConstants.teacherIdMsg}
					</Typography>
				</Box>
			</Box>
		</>
	)

	return (
		<Box>
			<FileUploadDialog
				open={modal.upload}
				width='500px'
				inputFileObject={inputFileObject}
				setOutputFileObject={setOutputFileObject}
				setExcelTableData={setExcelTableData}
				handleUploadFormClose={(e) => handleModal('upload', false)}
				handleExcelDownload={(e) => {
					e.stopPropagation()
					downloadExcel(
						classroomUploadDefaultExcelColumns,
						'classrooms.xlsx',
					)
				}}
				type='sheet'
				Content={Content}
				isAcyRequired={false}
				isSchoolListReq={true}
				isLastPromotedAcyReq={true}
				selectedOptionsData={selectedOptionsData}
				setSelctedOptionsData={setSelctedOptionsData}
				disableDropDown1={true}
				schoolOptions={
					schoolsList.map((obj) => ({
						label: `${obj.school} (${obj.scCode})`,
						id: obj._id,
					})) || []
				}
				aysOptionsGreaterLPAcy={acyOptionsGreaterLPAcy}
				mandatoryKeys={bulkUploadMandatoryKeys.classrooms}
			/>

			<CustomDialog
				isOpen={deleteBulkDialog}
				onClose={() => setDeleteBulkDialog(false)}
				title={`${localizationConstants?.oops} !`}
				iconName={iconConstants.errorFile}
				titleSx={{
					color: 'textColors.red',
					fontWeight: 500,
					pb: '20px',
				}}
				titleTypoVariant={typographyConstants.h4}
				message={localizationConstants.errorFileDownloadMsg}
				messageTypoVariant={typographyConstants.h5}
				leftButtonText={localizationConstants.closeCamel}
				rightButtonText={`${localizationConstants.download} File`}
				onLeftButtonClick={() => {
					setDeleteBulkDialog(false)
				}}
				onRightButtonClick={() => {
					ErrorMsgDownload(
						response,
						setDeleteBulkDialog,
						'Classes Validation Error.xlsx',
					)
				}}
			/>
		</Box>
	)
}

export default memo(Uploadclassroom)
