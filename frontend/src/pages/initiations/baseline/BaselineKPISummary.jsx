import React from 'react'
import { Box, Typography } from '@mui/material'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { categories, supportLevels } from './baselineConstants'

const KPICard = ({ title, value, subtitle, color, icon }) => (
	<Box
		sx={{
			flex: 1,
			minWidth: '150px',
			maxWidth: '200px',
			backgroundColor: 'white',
			borderRadius: '12px',
			padding: '16px',
			boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			gap: '4px',
			border: '1px solid #E8E8E8',
		}}
	>
		<Typography
			variant={typographyConstants.h3}
			sx={{
				fontSize: '28px',
				fontWeight: 700,
				color: color || 'textColors.primary',
				lineHeight: 1.2,
			}}
		>
			{value}
		</Typography>
		<Typography
			variant={typographyConstants.body}
			sx={{
				fontSize: '12px',
				fontWeight: 500,
				color: 'textColors.gray1',
				textAlign: 'center',
			}}
		>
			{title}
		</Typography>
		{subtitle && (
			<Typography
				variant={typographyConstants.caption}
				sx={{
					fontSize: '11px',
					color: 'textColors.gray2',
					textAlign: 'center',
				}}
			>
				{subtitle}
			</Typography>
		)}
	</Box>
)

const BaselineKPISummary = ({ analyticsData, schoolName }) => {
	// Calculate screening rate
	const studentsScreened = analyticsData?.studentsScreened ?? 0
	const totalStrength = analyticsData?.totalStrength ?? 0
	const screeningRate = totalStrength > 0
		? Math.round((studentsScreened / totalStrength) * 100)
		: 0

	// Calculate students at risk (red category)
	const rogBreakup = analyticsData?.rogBreakup ?? { red: 0, orange: 0, green: 0 }
	const studentsAtRisk = rogBreakup.red

	// Calculate strongest and weakest domains
	const domainData = analyticsData?.data ?? {}
	let strongestDomain = { name: '-', percentage: 0 }
	let weakestDomain = { name: '-', percentage: 100 }

	categories.forEach((category) => {
		const percentage = domainData[category]?.percentage ?? 0
		if (percentage > strongestDomain.percentage) {
			strongestDomain = { name: category, percentage }
		}
		if (percentage < weakestDomain.percentage && percentage > 0) {
			weakestDomain = { name: category, percentage }
		}
	})

	// Handle case where all percentages are 0
	if (strongestDomain.percentage === 0) {
		strongestDomain.name = '-'
	}
	if (weakestDomain.percentage === 100 || weakestDomain.percentage === 0) {
		weakestDomain.name = '-'
	}

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				gap: '12px',
				padding: '16px 20px',
				backgroundColor: '#F8FCFF',
				borderRadius: '12px',
				marginBottom: '12px',
				border: '1px solid #E2E2E2',
			}}
		>
			{/* School Name */}
			{schoolName && (
				<Typography
					variant={typographyConstants.h4}
					sx={{ fontSize: '18px', fontWeight: 600, textAlign: 'center' }}
				>
					{schoolName}
				</Typography>
			)}

			{/* KPI Cards Row */}
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'row',
					gap: '12px',
					flexWrap: 'wrap',
					justifyContent: 'center',
				}}
			>
			{/* Screening Rate */}
			<KPICard
				title={localizationConstants.screeningCompletionRate}
				value={`${screeningRate}%`}
				subtitle={`${studentsScreened} of ${totalStrength} students`}
				color={screeningRate >= 80 ? supportLevels.green.color : screeningRate >= 50 ? supportLevels.orange.color : supportLevels.red.color}
			/>

			{/* Students At Risk */}
			<KPICard
				title={localizationConstants.studentsAtRisk}
				value={studentsAtRisk}
				subtitle={localizationConstants.needsIntensiveSupport}
				color={studentsAtRisk > 0 ? supportLevels.red.color : supportLevels.green.color}
			/>

			{/* Strongest Domain */}
			<KPICard
				title={localizationConstants.strongestDomain}
				value={strongestDomain.name}
				subtitle={strongestDomain.percentage > 0 ? `${strongestDomain.percentage}%` : ''}
				color={supportLevels.green.color}
			/>

			{/* Focus Area (Weakest Domain) */}
			<KPICard
				title={localizationConstants.focusArea}
				value={weakestDomain.name}
				subtitle={weakestDomain.name !== '-' ? `${weakestDomain.percentage}%` : ''}
				color={supportLevels.orange.color}
			/>
			</Box>
		</Box>
	)
}

export default BaselineKPISummary
