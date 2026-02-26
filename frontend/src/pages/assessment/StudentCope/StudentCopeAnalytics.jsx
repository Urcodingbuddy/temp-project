import React, { lazy, Suspense, useEffect, useRef, useState } from 'react'
import CustomDialogWithBreadcrumbs from '../../../components/commonComponents/CustomDialogWithBreadcrumbs'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { getCurACYear } from '../../../utils/utils'
import { useDispatch, useSelector } from 'react-redux'
import { getSchoolsList } from '../../../redux/commonSlice'
import SingleSchoolCopeAnalytics from './SingleSchoolCopeAnalytics'

const StudentCopeAnalyticsFilter = lazy(
	() => import('./StudentCopeAnalyticsFilter'),
)
const AllSchoolCopeAnalytics = lazy(() => import('./AllSchoolCopeAnalytics'))

const StudentCopeAnalytics = ({ open, onClose }) => {
	const dispatch = useDispatch()
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)
	const [filterData, setFilterData] = useState({
		school: '',
		academicYears: [],
		downloadReportDialog: false,
	})

	let firstLoaded = useRef(true)
	useEffect(() => {
		if (open && firstLoaded.current) {
			const curACYear = getCurACYear()
			const academicYearId = academicYears.find(
				(obj) => obj.academicYear === curACYear,
			)
			if (academicYearId) {
				setFilterData((state) => ({
					...state,
					academicYears: [academicYearId._id],
				}))
			}
			dispatch(getSchoolsList({ academicYears: [academicYearId._id] }))
			firstLoaded.current = false
		}
	}, [open])

	return (
		<CustomDialogWithBreadcrumbs
			onClose={onClose}
			clickableTitle={localizationConstants.studentCope}
			title={localizationConstants.analytics}
			onClick={onClose}
			open={open}
			saveBtnReq={false}
		>
			<Suspense fallback={''}>
				<StudentCopeAnalyticsFilter
					filterData={filterData}
					setFilterData={setFilterData}
				/>
			</Suspense>

			{filterData.school === '' || filterData.school === 'all' ? (
				<Suspense fallback={''}>
					<AllSchoolCopeAnalytics
						filterData={filterData}
						setFilterData={setFilterData}
					/>
				</Suspense>
			) : (
				<Suspense fallback={''}>
					<SingleSchoolCopeAnalytics
						filterData={filterData}
						setFilterData={setFilterData}
					/>
				</Suspense>
			)}
		</CustomDialogWithBreadcrumbs>
	)
}

export default StudentCopeAnalytics
