import React from 'react'
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Box,
	Typography,
	Paper,
	Chip,
	IconButton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { tableStyles } from '../../../components/styles/tableStyles'

const AssessmentResultDialog = ({ open, onClose, assessment, student }) => {
	if (!assessment || !student) return null

	const giftedPercentage = assessment.giftedPercentage || 0
	const talentedPercentage = assessment.talentedPercentage || 0

	// Get classification details based on stored classification
	const getClassificationDetails = (classificationType) => {
		const classifications = {
			'Gifted & Talented': {
				color: 'success',
				description:
					'Demonstrates high cognitive ability and exceptional performance in one or more domains.',
			},
			Gifted: {
				color: 'primary',
				description: 'Displays advanced conceptual reasoning, critical thinking, and academic mastery.',
			},
			Talented: {
				color: 'secondary',
				description:
					'Exhibits high domain-specific strengths (creative arts, sports, innovation, leadership).',
			},
			'Emerging Potential': {
				color: 'warning',
				description: 'Displays developing potential requiring enrichment opportunities.',
			},
			'Standard Range': {
				color: 'default',
				description: 'Performing within expected developmental range; continue regular monitoring.',
			},
		}

		return {
			type: classificationType || 'Standard Range',
			...classifications[classificationType || 'Standard Range'],
		}
	}

	const classification = getClassificationDetails(assessment.classification)

	// Get tier details
	const getTierDetails = (tierType) => {
		const tiers = {
			'Tier 1 - Immediate Placement': {
				color: 'success',
				description: 'Student qualifies for immediate placement in G&T program.',
			},
			'Tier 2 - Enrichment': {
				color: 'info',
				description: 'Student qualifies for enrichment activities and additional support.',
			},
			'Tier 3 - Standard Monitoring': {
				color: 'default',
				description: 'Continue with regular monitoring and standard curriculum.',
			},
		}
		return tiers[tierType] || { color: 'default', description: '' }
	}

	const tierDetails = getTierDetails(assessment.tier)

	// Prepare skill scores for table
	const skillScores = assessment.skillScores || []

	// Calculate average indicators
	const avgGifted =
		skillScores.length > 0
			? (
					skillScores.reduce((sum, s) => sum + (parseFloat(s.giftedIndicator) || 0), 0) /
					skillScores.length
				).toFixed(2)
			: 0

	const avgTalented =
		skillScores.length > 0
			? (
					skillScores.reduce((sum, s) => sum + (parseFloat(s.talentedIndicator) || 0), 0) /
					skillScores.length
				).toFixed(2)
			: 0

	return (
		<Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
			<DialogTitle>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box>
						<Typography variant="h5" fontWeight={600}>
							G&T Assessment Results
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{student.studentName} - Age: {student.age} years
						</Typography>
					</Box>
					<IconButton onClick={onClose} size="small">
						<CloseIcon />
					</IconButton>
				</Box>
			</DialogTitle>

			<DialogContent dividers>
				{/* Tier and Classification Result */}
				<Paper
					elevation={3}
					sx={{
						mb: 3,
						p: 3,
						textAlign: 'center',
						bgcolor: tierDetails.color === 'success' ? 'success.50' : tierDetails.color === 'info' ? 'info.50' : 'grey.100',
					}}
				>
					<Chip
						label={assessment.tier}
						color={tierDetails.color}
						sx={{ mb: 2, fontSize: '0.9rem', fontWeight: 600 }}
					/>
					<Typography variant="h3" fontWeight={700} color="text.primary" gutterBottom>
						{classification.type}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{classification.description}
					</Typography>
				</Paper>

				{/* Overall Scores */}
				<Box sx={{ mb: 2 }}>
					<Typography variant="subtitle2" color="text.secondary" gutterBottom>
						Overall Scores
					</Typography>
					<Box sx={{ display: 'flex', gap: 2 }}>
						<Paper
							elevation={0}
							sx={{
								p: 1.5,
								flex: 1,
								border: '1px solid',
								borderColor: 'divider',
								borderRadius: 2,
							}}
						>
							<Typography variant="caption" color="text.secondary">
								Gifted Score
							</Typography>
							<Typography variant="h6" fontWeight={600}>
								{giftedPercentage.toFixed(0)}%
							</Typography>
						</Paper>
						<Paper
							elevation={0}
							sx={{
								p: 1.5,
								flex: 1,
								border: '1px solid',
								borderColor: 'divider',
								borderRadius: 2,
							}}
						>
							<Typography variant="caption" color="text.secondary">
								Talented Score
							</Typography>
							<Typography variant="h6" fontWeight={600}>
								{talentedPercentage.toFixed(0)}%
							</Typography>
						</Paper>
					</Box>
				</Box>

				{/* Domain-wise Breakdown */}
				<Box sx={{ mb: 2 }}>
					<Typography variant="subtitle2" color="text.secondary" gutterBottom>
						Domain-wise Performance
					</Typography>
					<TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
						<Table size="small">
							<TableHead>
								<TableRow>
									<TableCell sx={{ ...tableStyles.headerCell, width: '50%' }}>Domain</TableCell>
									<TableCell sx={{ ...tableStyles.headerCell, width: '25%', textAlign: 'center' }}>Gifted</TableCell>
									<TableCell sx={{ ...tableStyles.headerCell, width: '25%', textAlign: 'center' }}>Talented</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{skillScores.map((skill, index) => (
									<TableRow key={index} sx={tableStyles.bodyRow}>
										<TableCell sx={tableStyles.bodyCell}>
											<Typography sx={{ fontSize: '12px', fontWeight: 400 }}>
												{skill.skillName}
											</Typography>
										</TableCell>
										<TableCell sx={{ ...tableStyles.bodyCell, textAlign: 'center' }}>
											<Typography sx={{ fontSize: '12px', fontWeight: 400 }}>
												{skill.giftedIndicator || 0}
											</Typography>
										</TableCell>
										<TableCell sx={{ ...tableStyles.bodyCell, textAlign: 'center' }}>
											<Typography sx={{ fontSize: '12px', fontWeight: 400 }}>
												{skill.talentedIndicator || 0}
											</Typography>
										</TableCell>
									</TableRow>
								))}
								{/* Average Row */}
								<TableRow sx={{ bgcolor: 'grey.100' }}>
									<TableCell sx={tableStyles.bodyCell}>
										<Typography sx={{ fontSize: '12px', fontWeight: 600 }}>
											Average
										</Typography>
									</TableCell>
									<TableCell sx={{ ...tableStyles.bodyCell, textAlign: 'center' }}>
										<Typography sx={{ fontSize: '12px', fontWeight: 600 }}>
											{avgGifted}
										</Typography>
									</TableCell>
									<TableCell sx={{ ...tableStyles.bodyCell, textAlign: 'center' }}>
										<Typography sx={{ fontSize: '12px', fontWeight: 600 }}>
											{avgTalented}
										</Typography>
									</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</TableContainer>
				</Box>

				{/* Remarks */}
				{assessment.remarks && (
					<Box sx={{ mt: 3 }}>
						<Typography variant="h6" fontWeight={600} gutterBottom>
							Counselor Remarks
						</Typography>
						<Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
							<Typography variant="body1">{assessment.remarks}</Typography>
						</Paper>
					</Box>
				)}
			</DialogContent>

			<DialogActions sx={{ p: 2 }}>
				<Button onClick={onClose} variant="contained">
					Close
				</Button>
			</DialogActions>
		</Dialog>
	)
}

export default AssessmentResultDialog
