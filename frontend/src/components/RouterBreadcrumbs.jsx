import * as React from 'react'

import NavigateNextIcon from '@mui/icons-material/NavigateNext'

import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { capitalize, Breadcrumbs, Typography, Link } from '@mui/material'
import { history } from '../utils/utils'
import { localizationConstants } from '../resources/theme/localizationConstants'
import { routeConstants, routePaths } from '../routes/routeConstants'
import { typographyConstants } from '../resources/theme/typographyConstants'
import { useSelector } from 'react-redux'
import { addSpacesToPascalCase } from '../utils/utils'

function LinkRouter(props) {
	return (
		<Link
			{...props}
			component={RouterLink}
			variant={typographyConstants.h4}
		/>
	)
}

const pathConstants = [
	'initiations/individualCase/editStudent',
	'initiations/observation/editStudent',
	'/initiations/SELCurriculumTracker/editSELCurriculumTracker',
	'initiations/individualCase/viewStudent',
	'initiations/observation/viewStudent',
	'/initiations/SELCurriculumTracker/ViewSELCurriculumTracker',
]

const RouterBreadcrumbs = ({ displayText }) => {
	const { t } = useTranslation()
	const { selectedRow } = useSelector((store) => store.dashboardSliceSetup)
	const pathnames = history.location.pathname.split('/').filter((x) => x)
	const matchedPath = pathConstants.find((path) =>
		history.location.pathname.includes(path),
	)

	if (matchedPath && matchedPath.includes('initiations')) {
		const index = pathnames.findIndex((p) => p === selectedRow?._id)
		if (
			pathnames[index - 1] === 'editSELCurriculumTracker' ||
			pathnames[index - 1] === 'ViewSELCurriculumTracker' ||
			pathnames[index - 1] === 'ViewSELCurriculumTracker'
		) {
			pathnames.pop()
		} else {
			pathnames[index] = selectedRow?.studentId?.studentName
		}
	}

	const handleAssessmentClick = () => {
		// Handle the click on the "Assessment" breadcrumb
		// Redirect to a specific page under the Assessment section
		history.push('/dashboard/assessment/teacher-profiling') // Adjust the URL as needed
	}

	return (
		<Breadcrumbs
			aria-label='breadcrumb'
			separator={<NavigateNextIcon fontSize='small' />}
		>
			{pathnames?.length === 0 && (
				<Typography
					color='text.primary'
					variant={typographyConstants.h5}
				>
					{t(localizationConstants.link1)}
				</Typography>
			)}

			{pathnames?.map((value, index) => {
				let to = `/${pathnames?.slice(0, index + 1).join('/')}`
				const originalString = value
				const newString = decodeURI(originalString).replace(/-/g, ' ')
				if (to === '/' + routeConstants.dashboard) {
					to = routePaths.home
				}
				if (to === '/' + routeConstants.academic) {
					to = routePaths.academicSchools
				}
				if (
					to === '/' + routeConstants.initiations ||
					to === routePaths.initiationsObservationViewStudent ||
					to === routePaths.initiationsObservationEditStudent
				) {
					to = routePaths.initiationsObservation
				}
				if (to === '/' + routeConstants.assessment) {
					to = routePaths.TeacherProfilingAssessment
				}
				if (
					to === routePaths.initiationsIndividualCaseViewStudent ||
					to === routePaths.initiationsIndividualCaseEditStudent
				) {
					to = routePaths.initiationsIndividualCase
				}

				return (
					<Link href={to} key={to} underline='none'>
						<Typography
							color='text.primary'
							key={to}
							variant={typographyConstants.h5}
						>
							{addSpacesToPascalCase(newString)}
						</Typography>
					</Link>
				)
			})}
		</Breadcrumbs>
	)
}

export default RouterBreadcrumbs
