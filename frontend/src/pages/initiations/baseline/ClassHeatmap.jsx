import React, { useMemo } from 'react'
import {
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	Tooltip,
} from '@mui/material'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { categories, getHeatmapColor, heatmapThresholds } from './baselineConstants'

const HeatmapCell = ({ value, hasData, onClick, isClickable }) => {
	if (!hasData) {
		return (
			<Tooltip title="No baseline data submitted" arrow>
				<TableCell
					sx={{
						backgroundColor: '#F5F5F5',
						color: '#999',
						textAlign: 'center',
						padding: '8px 12px',
						fontWeight: 500,
						fontSize: '13px',
						borderRight: '1px solid #E2E2E2',
					}}
				>
					-
				</TableCell>
			</Tooltip>
		)
	}

	const color = getHeatmapColor(value)

	return (
		<Tooltip title={`${value}% - Click to view details`} arrow>
			<TableCell
				onClick={isClickable ? onClick : undefined}
				sx={{
					backgroundColor: color,
					color: 'white',
					textAlign: 'center',
					padding: '8px 12px',
					fontWeight: 600,
					fontSize: '13px',
					cursor: isClickable ? 'pointer' : 'default',
					transition: 'all 0.2s ease',
					borderRight: '1px solid rgba(255,255,255,0.3)',
					'&:hover': isClickable
						? {
								opacity: 0.85,
								transform: 'scale(1.02)',
							}
						: {},
				}}
			>
				{value > 0 ? `${value}%` : '0%'}
			</TableCell>
		</Tooltip>
	)
}

const ClassHeatmap = ({ classData, allClassrooms, onClassClick }) => {
	// Merge all classrooms with baseline data
	const mergedClassData = useMemo(() => {
		if (!allClassrooms || allClassrooms.length === 0) {
			// Fallback to classData if allClassrooms not provided
			return classData || []
		}

		// Create a map of baseline data by classRoomId
		const baselineDataMap = new Map()
		if (classData && classData.length > 0) {
			classData.forEach((item) => {
				const key = item.classRoomId || item._id
				if (key) {
					baselineDataMap.set(key, item)
				}
			})
		}

		// Merge all classrooms with baseline data
		return allClassrooms.map((classroom) => {
			const classroomId = classroom._id || classroom.classRoomId
			const baselineInfo = baselineDataMap.get(classroomId)

			if (baselineInfo) {
				return {
					...baselineInfo,
					className: classroom.className || baselineInfo.className,
					section: classroom.section || baselineInfo.section,
					hasData: true,
				}
			}

			// No baseline data for this classroom
			return {
				classRoomId: classroomId,
				className: classroom.className,
				section: classroom.section,
				hasData: false,
				percentages: {},
				overallPercentageofClasses: 0,
			}
		})
	}, [classData, allClassrooms])

	if (!mergedClassData || mergedClassData.length === 0) {
		return (
			<Box
				sx={{
					padding: '20px',
					textAlign: 'center',
					backgroundColor: '#F8FCFF',
					borderRadius: '8px',
				}}
			>
				<Typography color="textColors.gray1">
					No class data available for heatmap
				</Typography>
			</Box>
		)
	}

	// Sort classes alphabetically by className, then by section
	const sortedClasses = [...mergedClassData].sort((a, b) => {
		const aName = a.className || ''
		const bName = b.className || ''
		const classCompare = aName.localeCompare(bName, undefined, { numeric: true, sensitivity: 'base' })
		if (classCompare !== 0) return classCompare
		// If same class, sort by section
		const aSection = a.section || ''
		const bSection = b.section || ''
		return aSection.localeCompare(bSection, undefined, { sensitivity: 'base' })
	})

	return (
		<Box
			sx={{
				backgroundColor: 'white',
				borderRadius: '12px',
				padding: '16px',
				boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
				border: '1px solid #E2E2E2',
				marginTop: '12px',
			}}
		>
			<Typography
				variant={typographyConstants.h5}
				sx={{
					fontWeight: 600,
					marginBottom: '12px',
					color: 'textColors.primary',
				}}
			>
				{localizationConstants.classWiseOverview}
			</Typography>

			{/* Legend */}
			<Box
				sx={{
					display: 'flex',
					gap: '16px',
					marginBottom: '12px',
					flexWrap: 'wrap',
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
					<Box
						sx={{
							width: '16px',
							height: '16px',
							backgroundColor: heatmapThresholds.high.color,
							borderRadius: '3px',
						}}
					/>
					<Typography variant={typographyConstants.caption} sx={{ fontSize: '11px' }}>
						{heatmapThresholds.high.label} ({'>'}={heatmapThresholds.high.min}%)
					</Typography>
				</Box>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
					<Box
						sx={{
							width: '16px',
							height: '16px',
							backgroundColor: heatmapThresholds.medium.color,
							borderRadius: '3px',
						}}
					/>
					<Typography variant={typographyConstants.caption} sx={{ fontSize: '11px' }}>
						{heatmapThresholds.medium.label} ({heatmapThresholds.medium.min}-{heatmapThresholds.medium.max}%)
					</Typography>
				</Box>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
					<Box
						sx={{
							width: '16px',
							height: '16px',
							backgroundColor: heatmapThresholds.low.color,
							borderRadius: '3px',
						}}
					/>
					<Typography variant={typographyConstants.caption} sx={{ fontSize: '11px' }}>
						{heatmapThresholds.low.label} ({'<'}{heatmapThresholds.medium.min}%)
					</Typography>
				</Box>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
					<Box
						sx={{
							width: '16px',
							height: '16px',
							backgroundColor: '#F5F5F5',
							borderRadius: '3px',
							border: '1px solid #DDD',
						}}
					/>
					<Typography variant={typographyConstants.caption} sx={{ fontSize: '11px' }}>
						No Data
					</Typography>
				</Box>
			</Box>

			<TableContainer
				sx={{
					maxHeight: '400px',
					overflowY: 'auto',
					borderRadius: '8px',
					border: '1px solid #E2E2E2',
				}}
			>
				<Table stickyHeader size="small">
					<TableHead>
						<TableRow>
							<TableCell
								sx={{
									backgroundColor: '#F0F7FF',
									fontWeight: 600,
									fontSize: '13px',
									padding: '12px 16px',
									borderRight: '1px solid #E2E2E2',
									position: 'sticky',
									left: 0,
									zIndex: 3,
								}}
							>
								{localizationConstants.ClassCamel}
							</TableCell>
							{categories.map((category) => (
								<TableCell
									key={category}
									sx={{
										backgroundColor: '#F0F7FF',
										fontWeight: 600,
										fontSize: '13px',
										padding: '12px 16px',
										textAlign: 'center',
										borderRight: '1px solid #E2E2E2',
									}}
								>
									{category}
								</TableCell>
							))}
							<TableCell
								sx={{
									backgroundColor: '#F0F7FF',
									fontWeight: 600,
									fontSize: '13px',
									padding: '12px 16px',
									textAlign: 'center',
								}}
							>
								{localizationConstants.overall}
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{sortedClasses.map((classItem, index) => (
							<TableRow
								key={classItem.classRoomId || index}
								sx={{
									'&:hover': {
										backgroundColor: 'rgba(0,0,0,0.02)',
									},
								}}
							>
								<TableCell
									sx={{
										fontWeight: 500,
										fontSize: '13px',
										padding: '10px 16px',
										borderRight: '1px solid #E2E2E2',
										backgroundColor: 'white',
										position: 'sticky',
										left: 0,
										zIndex: 1,
									}}
								>
									{classItem.className}
									{classItem.section && ` - ${classItem.section}`}
								</TableCell>
								{categories.map((category) => (
									<HeatmapCell
										key={category}
										value={classItem.percentages?.[category]?.percentage ?? classItem[category] ?? 0}
										hasData={classItem.hasData !== false}
										isClickable={!!onClassClick && classItem.hasData !== false}
										onClick={() =>
											onClassClick?.({
												classRoomId: classItem.classRoomId,
												className: classItem.className,
												section: classItem.section,
											})
										}
									/>
								))}
								<HeatmapCell
									value={classItem.overallPercentageofClasses ?? classItem.overallPercentageofSection ?? 0}
									hasData={classItem.hasData !== false}
									isClickable={!!onClassClick && classItem.hasData !== false}
									onClick={() =>
										onClassClick?.({
											classRoomId: classItem.classRoomId,
											className: classItem.className,
											section: classItem.section,
										})
									}
								/>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	)
}

export default ClassHeatmap
