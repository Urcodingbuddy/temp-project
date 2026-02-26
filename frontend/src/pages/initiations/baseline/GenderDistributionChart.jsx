import React from 'react'
import { Box, Typography } from '@mui/material'
import { Doughnut } from 'react-chartjs-2'
import { genderOptions } from './baselineConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'

const GenderDistributionChart = ({ data, onSegmentClick }) => {
	const male = data?.male ?? 0
	const female = data?.female ?? 0
	const total = male + female

	if (total === 0) {
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
					No gender data available
				</Typography>
			</Box>
		)
	}

	const chartData = {
		labels: ['Male', 'Female'],
		datasets: [
			{
				data: [male, female],
				backgroundColor: [genderOptions[0].color, genderOptions[1].color],
				borderWidth: 0,
				cutout: '65%',
			},
		],
	}

	// Custom plugin to draw text in center of doughnut
	const centerTextPlugin = {
		id: 'genderCenterText',
		beforeDraw: (chart) => {
			const { ctx, width, height } = chart
			const total = chart.data.datasets[0]?.data?.reduce((sum, val) => sum + val, 0) || 0

			ctx.restore()
			const fontSize = (height / 114).toFixed(2)
			ctx.font = `bold ${Math.max(fontSize, 1) * 16}px sans-serif`
			ctx.textBaseline = 'middle'
			ctx.textAlign = 'center'
			ctx.fillStyle = '#333'
			ctx.fillText(total.toString(), width / 2, height / 2 - 10)

			ctx.font = `${Math.max(fontSize, 0.8) * 10}px sans-serif`
			ctx.fillStyle = '#666'
			ctx.fillText('Students', width / 2, height / 2 + 15)
			ctx.save()
		},
	}

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		onClick: (event, elements) => {
			if (elements.length > 0 && onSegmentClick) {
				const index = elements[0].index
				const gender = index === 0 ? 'Male' : 'Female'
				const count = index === 0 ? male : female
				onSegmentClick({ gender, count })
			}
		},
		onHover: (event, elements) => {
			event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default'
		},
		plugins: {
			legend: {
				display: true,
				position: 'bottom',
				labels: {
					usePointStyle: true,
					pointStyle: 'circle',
					padding: 15,
					font: {
						size: 12,
					},
				},
			},
			tooltip: {
				callbacks: {
					label: (context) => {
						const value = context.raw || 0
						const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
						return `${context.label}: ${value} (${percentage}%)`
					},
				},
			},
			datalabels: {
				display: false,
			},
		},
	}

	return (
		<Box
			sx={{
				backgroundColor: '#fff',
				borderRadius: '8px',
				padding: '16px',
				height: '100%',
			}}
		>
			<Typography
				variant="subtitle1"
				sx={{
					fontWeight: 600,
					marginBottom: '12px',
					color: '#333',
				}}
			>
				{localizationConstants.genderDistribution || 'Gender Distribution'}
			</Typography>
			<Box sx={{ height: 220, position: 'relative' }}>
				<Doughnut
					data={chartData}
					options={chartOptions}
					plugins={[centerTextPlugin]}
				/>
			</Box>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					gap: 3,
					marginTop: '12px',
				}}
			>
				<Box sx={{ textAlign: 'center' }}>
					<Typography variant="h6" sx={{ color: genderOptions[0].color, fontWeight: 600 }}>
						{male}
					</Typography>
					<Typography variant="caption" color="textSecondary">
						Male ({total > 0 ? ((male / total) * 100).toFixed(1) : 0}%)
					</Typography>
				</Box>
				<Box sx={{ textAlign: 'center' }}>
					<Typography variant="h6" sx={{ color: genderOptions[1].color, fontWeight: 600 }}>
						{female}
					</Typography>
					<Typography variant="caption" color="textSecondary">
						Female ({total > 0 ? ((female / total) * 100).toFixed(1) : 0}%)
					</Typography>
				</Box>
			</Box>
		</Box>
	)
}

export default GenderDistributionChart
