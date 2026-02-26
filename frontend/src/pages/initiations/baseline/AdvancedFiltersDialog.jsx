import React, { useState, useEffect } from 'react'
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Box,
	Typography,
	FormControlLabel,
	Checkbox,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	TextField,
	Grid,
	Divider,
	IconButton,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { ageGroups, genderOptions } from './baselineConstants'

const AdvancedFiltersDialog = ({ open, onClose, onApply, currentFilters }) => {
	const [filters, setFilters] = useState({
		gender: [],
		ageGroup: '',
		scoreRange: { min: 0, max: 35 },
		dateRange: { startDate: '', endDate: '' },
	})

	useEffect(() => {
		if (currentFilters) {
			setFilters({
				gender: currentFilters.gender || [],
				ageGroup: currentFilters.ageGroup || '',
				scoreRange: currentFilters.scoreRange || { min: 0, max: 35 },
				dateRange: currentFilters.dateRange || { startDate: '', endDate: '' },
			})
		}
	}, [currentFilters, open])

	const handleGenderChange = (genderId) => {
		setFilters((prev) => ({
			...prev,
			gender: prev.gender.includes(genderId)
				? prev.gender.filter((g) => g !== genderId)
				: [...prev.gender, genderId],
		}))
	}

	const handleApply = () => {
		const cleanedFilters = {
			gender: filters.gender.length > 0 ? filters.gender : undefined,
			ageGroup: filters.ageGroup || undefined,
			scoreRange:
				filters.scoreRange.min > 0 || filters.scoreRange.max < 35
					? filters.scoreRange
					: undefined,
			dateRange:
				filters.dateRange.startDate && filters.dateRange.endDate
					? filters.dateRange
					: undefined,
		}
		onApply(cleanedFilters)
		onClose()
	}

	const handleClear = () => {
		setFilters({
			gender: [],
			ageGroup: '',
			scoreRange: { min: 0, max: 35 },
			dateRange: { startDate: '', endDate: '' },
		})
	}

	const hasActiveFilters =
		filters.gender.length > 0 ||
		filters.ageGroup ||
		filters.scoreRange.min > 0 ||
		filters.scoreRange.max < 35 ||
		(filters.dateRange.startDate && filters.dateRange.endDate)

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="xs"
			fullWidth
			PaperProps={{ sx: { borderRadius: 2 } }}
		>
			<DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<Typography variant="h6" fontWeight={600}>
					Advanced Filters
				</Typography>
				<IconButton size="small" onClick={onClose}>
					<CloseIcon fontSize="small" />
				</IconButton>
			</DialogTitle>

			<Divider />

			<DialogContent sx={{ pt: 2 }}>
				<Grid container spacing={2}>
					{/* Gender */}
					<Grid item xs={12}>
						<Typography variant="body2" fontWeight={500} gutterBottom>
							Gender
						</Typography>
						<Box sx={{ display: 'flex', gap: 2 }}>
							{genderOptions.map((opt) => (
								<FormControlLabel
									key={opt.id}
									control={
										<Checkbox
											size="small"
											checked={filters.gender.includes(opt.id)}
											onChange={() => handleGenderChange(opt.id)}
										/>
									}
									label={<Typography variant="body2">{opt.label}</Typography>}
								/>
							))}
						</Box>
					</Grid>

					{/* Age Group */}
					<Grid item xs={12}>
						<FormControl fullWidth size="small">
							<InputLabel>Age Group</InputLabel>
							<Select
								value={filters.ageGroup}
								label="Age Group"
								onChange={(e) =>
									setFilters((prev) => ({ ...prev, ageGroup: e.target.value }))
								}
							>
								<MenuItem value="">All Ages</MenuItem>
								{ageGroups.map((g) => (
									<MenuItem key={g.id} value={g.id}>
										{g.label}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>

					{/* Score Range */}
					<Grid item xs={6}>
						<TextField
							fullWidth
							size="small"
							label="Min Score"
							type="number"
							inputProps={{ min: 0, max: 35 }}
							value={filters.scoreRange.min}
							onChange={(e) =>
								setFilters((prev) => ({
									...prev,
									scoreRange: { ...prev.scoreRange, min: Number(e.target.value) },
								}))
							}
						/>
					</Grid>
					<Grid item xs={6}>
						<TextField
							fullWidth
							size="small"
							label="Max Score"
							type="number"
							inputProps={{ min: 0, max: 35 }}
							value={filters.scoreRange.max}
							onChange={(e) =>
								setFilters((prev) => ({
									...prev,
									scoreRange: { ...prev.scoreRange, max: Number(e.target.value) },
								}))
							}
						/>
					</Grid>

					{/* Date Range */}
					<Grid item xs={6}>
						<TextField
							fullWidth
							size="small"
							label="From Date"
							type="date"
							value={filters.dateRange.startDate}
							onChange={(e) =>
								setFilters((prev) => ({
									...prev,
									dateRange: { ...prev.dateRange, startDate: e.target.value },
								}))
							}
							InputLabelProps={{ shrink: true }}
						/>
					</Grid>
					<Grid item xs={6}>
						<TextField
							fullWidth
							size="small"
							label="To Date"
							type="date"
							value={filters.dateRange.endDate}
							onChange={(e) =>
								setFilters((prev) => ({
									...prev,
									dateRange: { ...prev.dateRange, endDate: e.target.value },
								}))
							}
							InputLabelProps={{ shrink: true }}
						/>
					</Grid>
				</Grid>
			</DialogContent>

			<Divider />

			<DialogActions sx={{ px: 3, py: 1.5, justifyContent: 'space-between' }}>
				<Button
					size="small"
					onClick={handleClear}
					disabled={!hasActiveFilters}
				>
					Clear
				</Button>
				<Button size="small" variant="contained" onClick={handleApply}>
					Apply
				</Button>
			</DialogActions>
		</Dialog>
	)
}

export default AdvancedFiltersDialog
