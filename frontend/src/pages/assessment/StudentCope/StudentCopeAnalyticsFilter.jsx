import { useEffect, useRef, useState } from 'react'
import useCommonStyles from '../../../components/styles'
import { Box, Typography } from '@mui/material'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { useDispatch, useSelector } from 'react-redux'
import CustomButton from '../../../components/CustomButton'
import CustomMultiSelectNoChip from '../../../components/commonComponents/CustomMultiSelectNoChip'
import {
	getAcademicYearsList,
	getCurrentAcademicYearId,
} from '../../../utils/utils'
import { getStudentCopeAnalyticsReportForSchools } from './StudentCopeSlice'
import { getSchoolsList } from '../../../redux/commonSlice'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'
import { typographyConstants } from '../../../resources/theme/typographyConstants'

const StudentCopeAnalyticsFilter = ({ filterData, setFilterData }) => {
	const flexStyles = useCommonStyles()
	const dispatch = useDispatch()
	const { schoolsList } = useSelector((store) => store.commonData)
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const [options, setOptions] = useState([])

	const handleAYApply = (list) => {
		setFilterData((state) => ({ ...state, school: '' }))
		const body = {
			academicYears: filterData.academicYears,
		}
		dispatch(
			getStudentCopeAnalyticsReportForSchools({
				body,
			}),
		)
		dispatch(
			getSchoolsList({
				academicYear: filterData.academicYears,
			}),
		)
	}

	useEffect(() => {
		if (schoolsList?.length > 0) {
			const option = schoolsList?.map((sc) => ({
				id: sc?._id,
				label: sc?.school,
			}))
			setOptions([{ id: 'all', label: 'All' }, ...option])
		}
	}, [schoolsList])

	const isInitialLoad = useRef(true)
	useEffect(() => {
		if (academicYears.length > 0 && isInitialLoad.current) {
			const currentAYId = getCurrentAcademicYearId(academicYears)
			if (currentAYId) {
				setFilterData((state) => ({
					...state,
					academicYears: [currentAYId],
				}))
			}
			isInitialLoad.current = false
		}
	}, [academicYears])

	return (
		<Box className={flexStyles.flexRowCenterSpaceBetween} gap='10px'>
			<Box sx={{ flex: '0 0 25%' }}>
				<CustomMultiSelectNoChip
					sx={{ width: '100%' }}
					fieldSx={{ minHeight: '44px' }}
					value={filterData.academicYears}
					onChange={(e) => {
						setFilterData((state) => ({
							...state,
							academicYears: e,
						}))
					}}
					options={getAcademicYearsList(academicYears) || []}
					label={localizationConstants.academicYear}
					onApply={handleAYApply}
				/>
			</Box>

			<Box sx={{ flex: '0 0 57%' }}>
				<Typography variant={typographyConstants.body}>
					{localizationConstants.school}
				</Typography>
				<CustomAutocompleteNew
					options={options ?? []}
					sx={{ width: '100%' }}
					fieldSx={{ borderRadius: '3px', mb: '5px' }}
					value={filterData.school}
					placeholder={`${localizationConstants.select} ${localizationConstants.school}`}
					onChange={(e) => {
						if (e === 'all' || e === null) {
							setFilterData((state) => ({ ...state, school: '' }))
						} else {
							setFilterData((state) => ({
								...state,
								school: e,
							}))
						}
					}}
				/>
			</Box>

			<Box sx={{ flex: '0 0 15%' }}>
				<CustomButton
					sx={{
						width: '100%',
						height: '44px',
						marginTop: '19px',
						backgroundColor: 'globalElementColors.blue',
					}}
					text={localizationConstants.generateReport}
					onClick={() => {
						setFilterData((state) => ({
							...state,
							downloadReportDialog: true,
						}))
					}}
				/>
			</Box>
		</Box>
	)
}

export default StudentCopeAnalyticsFilter
