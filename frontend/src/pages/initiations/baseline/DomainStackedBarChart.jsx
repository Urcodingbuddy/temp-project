import React from 'react'
import { Box, Typography } from '@mui/material'
import { Bar } from 'react-chartjs-2'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { categories, supportLevels } from './baselineConstants'

// Map dataset index to support level
const datasetToSupportLevel = ['green', 'orange', 'red']

const DomainStackedBarChart = ({ domainData, onSegmentClick }) => {
	if (!domainData || Object.keys(domainData).length === 0) {
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
					No domain data available
				</Typography>
			</Box>
		)
	}

	// Prepare data for horizontal stacked bar chart
	const labels = categories

	const meetingExpectationsData = categories.map(
		(domain) => domainData[domain]?.['6-7'] ?? 0
	)
	const developingData = categories.map(
		(domain) => domainData[domain]?.['4-5'] ?? 0
	)
	const needsSupportData = categories.map(
		(domain) => domainData[domain]?.['0-3'] ?? 0
	)

	const chartData = {
		labels,
		datasets: [
			{
				label: supportLevels.green.shortLabel,
				data: meetingExpectationsData,
				backgroundColor: supportLevels.green.color,
				borderRadius: 4,
				barThickness: 28,
			},
			{
				label: supportLevels.orange.shortLabel,
				data: developingData,
				backgroundColor: supportLevels.orange.color,
				borderRadius: 4,
				barThickness: 28,
			},
			{
				label: supportLevels.red.shortLabel,
				data: needsSupportData,
				backgroundColor: supportLevels.red.color,
				borderRadius: 4,
				barThickness: 28,
			},
		],
	}

	// Handle chart click
	const handleChartClick = (event, elements) => {
		if (elements.length > 0 && onSegmentClick) {
			const element = elements[0]
			const datasetIndex = element.datasetIndex
			const dataIndex = element.index
			const domain = categories[dataIndex]
			const supportLevel = datasetToSupportLevel[datasetIndex]
			const count = element.element.$context.raw || 0

			if (count > 0) {
				onSegmentClick({
					domain,
					supportLevel,
					count,
					scoreRange: supportLevels[supportLevel].range,
					label: supportLevels[supportLevel].shortLabel,
				})
			}
		}
	}

	const chartOptions = {
		indexAxis: 'y', // Horizontal bars
		responsive: true,
		maintainAspectRatio: false,
		onClick: handleChartClick,
		onHover: (event, elements) => {
			event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default'
		},
		layout: {
			padding: {
				left: 10,
				right: 20,
				top: 10,
				bottom: 10,
			},
		},
		scales: {
			x: {
				stacked: true,
				grid: {
					display: false,
				},
				ticks: {
					display: false,
				},
				border: {
					display: false,
				},
			},
			y: {
				stacked: true,
				grid: {
					display: false,
				},
				ticks: {
					font: {
						size: 13,
						weight: 500,
					},
					color: '#333',
				},
				border: {
					display: false,
				},
			},
		},
		plugins: {
			legend: {
				display: true,
				position: 'bottom',
				labels: {
					usePointStyle: true,
					pointStyle: 'rectRounded',
					padding: 20,
					font: {
						size: 12,
					},
				},
			},
			tooltip: {
				callbacks: {
					label: (context) => {
						const label = context.dataset.label || ''
						const value = context.raw || 0
						const domainIndex = context.dataIndex
						const domain = categories[domainIndex]
						const total =
							(domainData[domain]?.['6-7'] ?? 0) +
							(domainData[domain]?.['4-5'] ?? 0) +
							(domainData[domain]?.['0-3'] ?? 0)
						const percentage = total > 0 ? Math.round((value / total) * 100) : 0
						return `${label}: ${value} students (${percentage}%)`
					},
					title: (tooltipItems) => {
						return tooltipItems[0]?.label || ''
					},
				},
			},
			datalabels: {
				display: (context) => {
					return context.dataset.data[context.dataIndex] > 0
				},
				color: 'white',
				font: {
					weight: 'bold',
					size: 11,
				},
				formatter: (value) => {
					return value > 0 ? value : ''
				},
			},
		},
	}

	return (
		<Box
			sx={{
				backgroundColor: 'white',
				borderRadius: '12px',
				padding: '20px',
				boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
				border: '1px solid #E2E2E2',
				marginTop: '16px',
			}}
		>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
				<Typography
					variant={typographyConstants.h5}
					sx={{
						fontWeight: 600,
						color: 'textColors.primary',
					}}
				>
					{localizationConstants.domainWiseStudentDistribution}
				</Typography>
				{onSegmentClick && (
					<Typography
						variant={typographyConstants.caption}
						sx={{
							fontSize: '11px',
							color: 'textColors.gray2',
							fontStyle: 'italic',
						}}
					>
						Click on any segment to view students
					</Typography>
				)}
			</Box>

			<Box sx={{ height: '280px', width: '100%' }}>
				<Bar data={chartData} options={chartOptions} />
			</Box>
		</Box>
	)
}

export default DomainStackedBarChart
