import React from 'react'
import { Box, Typography } from '@mui/material'
import { Bar } from 'react-chartjs-2'
import { localizationConstants } from '../../../resources/theme/localizationConstants'

// Color palette for classes
const classColors = [
	'#4CB8C4', '#7ED9C4', '#A8E6CF', '#88D4AB', '#6BC5A0',
	'#5BB5A0', '#4BA090', '#3B8B80', '#2B7670', '#1B6160',
]

const ClassDistributionChart = ({ data, onClassClick }) => {
	if (!data || data.length === 0) {
		return (
			<Box
				sx={{
					padding: '20px',
					textAlign: 'center',
					backgroundColor: '#F8FCFF',
					borderRadius: '8px',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Typography color="textColors.gray1">
					No class distribution data available
				</Typography>
			</Box>
		)
	}

	// Sort data by className and section
	const sortedData = [...data].sort((a, b) => {
		const classCompare = (a.className || '').localeCompare(b.className || '', undefined, { numeric: true })
		if (classCompare !== 0) return classCompare
		return (a.section || '').localeCompare(b.section || '')
	})

	const labels = sortedData.map(
		(item) => `${item.className}${item.section ? ' - ' + item.section : ''}`
	)
	const counts = sortedData.map((item) => item.studentCount || 0)
	const totalStudents = counts.reduce((sum, count) => sum + count, 0)

	// Generate colors for each class
	const backgroundColors = sortedData.map((_, index) => classColors[index % classColors.length])

	const chartData = {
		labels,
		datasets: [
			{
				label: 'Students Screened',
				data: counts,
				backgroundColor: backgroundColors,
				borderRadius: 4,
				barThickness: 24,
			},
		],
	}

	const chartOptions = {
		indexAxis: 'y', // Horizontal bars
		responsive: true,
		maintainAspectRatio: false,
		onClick: (event, elements) => {
			if (elements.length > 0 && onClassClick) {
				const index = elements[0].index
				const classData = sortedData[index]
				onClassClick({
					classRoomId: classData.classRoomId,
					className: classData.className,
					section: classData.section,
					studentCount: classData.studentCount,
				})
			}
		},
		onHover: (event, elements) => {
			event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default'
		},
		layout: {
			padding: {
				right: 20,
			},
		},
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				callbacks: {
					label: (context) => {
						const value = context.raw || 0
						const percentage = totalStudents > 0 ? ((value / totalStudents) * 100).toFixed(1) : 0
						return `Students: ${value} (${percentage}%)`
					},
				},
			},
			datalabels: {
				anchor: 'end',
				align: 'end',
				color: '#333',
				font: {
					size: 11,
					weight: 'bold',
				},
				formatter: (value) => value,
			},
		},
		scales: {
			x: {
				beginAtZero: true,
				grid: {
					display: true,
					color: 'rgba(0, 0, 0, 0.05)',
				},
				ticks: {
					stepSize: 5,
				},
				title: {
					display: true,
					text: 'Number of Students',
					font: {
						size: 11,
					},
				},
			},
			y: {
				grid: {
					display: false,
				},
				ticks: {
					font: {
						size: 11,
					},
				},
			},
		},
	}

	// Calculate dynamic height based on number of classes
	const chartHeight = Math.max(200, sortedData.length * 35 + 60)

	return (
		<Box
			sx={{
				backgroundColor: '#fff',
				borderRadius: '8px',
				padding: '16px',
				height: '100%',
			}}
		>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
				<Typography
					variant="subtitle1"
					sx={{
						fontWeight: 600,
						color: '#333',
					}}
				>
					{localizationConstants.studentsAcrossClasses || 'Students Across Classes'}
				</Typography>
				<Typography variant="caption" color="textSecondary">
					Total: {totalStudents} students
				</Typography>
			</Box>
			<Box sx={{ height: chartHeight, position: 'relative' }}>
				<Bar data={chartData} options={chartOptions} />
			</Box>
		</Box>
	)
}

export default ClassDistributionChart
