import React, { useState } from 'react'
import {
	Box,
	Typography,
	IconButton,
	Collapse,
	Card,
	CardContent,
	Grid,
	Tooltip,
} from '@mui/material'

import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { iconConstants } from '../../../resources/theme/iconConstants'
import CustomIcon from '../../../components/CustomIcon'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

const AcademicYearClassroomCard = ({
	academicYear,
	classroomData,
	onEdit,
	isDefaultExpanded = false,
	canEdit = true,
	editTooltip = '',
	disabledTooltip = 'Edit is not allowed',
}) => {
	const [isExpanded, setIsExpanded] = useState(isDefaultExpanded)

	const handleToggleExpansion = () => {
		setIsExpanded(!isExpanded)
	}

	const handleEdit = () => {
		if (canEdit && onEdit) {
			onEdit(academicYear, classroomData)
		}
	}

	const renderClassSections = () => {
		return classroomData.map((classItem, index) => (
			<Box key={index} sx={{ mb: 2 }}>
				<Grid container spacing={2} alignItems='center'>
					<Grid item xs={4}>
						<Typography variant={typographyConstants.title}>
							{classItem.className}
						</Typography>
					</Grid>
					<Grid item xs={8}>
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
							{classItem.sections.map((section, sectionIndex) => (
								<Typography
									variant={typographyConstants.body}
									key={sectionIndex}
								>
									{sectionIndex <
									classItem.sections.length - 1
										? `${section},`
										: section}
								</Typography>
							))}
						</Box>
					</Grid>
				</Grid>
			</Box>
		))
	}

	return (
		<Card
			sx={{
				mb: 2,
				boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
				borderRadius: '8px',
				overflow: 'hidden',
				border: '1px solid',
				borderColor: 'globalElementColors.grey5',
			}}
		>
			<Tooltip
				title={canEdit ? editTooltip : disabledTooltip}
				arrow
				placement='top'
				componentsProps={{
					tooltip: {
						sx: {
							backgroundColor: !canEdit
								? 'globalElementColors.red'
								: 'globalElementColors.blue5',
							fontSize: '1rem', // increase font size
							fontWeight: 500,
							padding: '8px 12px',
							borderRadius: '8px',
						},
					},
					arrow: {
						sx: {
							color: 'globalElementColors.blue5',
						},
					},
				}}
			>
				<CardContent sx={{ p: 0 }}>
					{/* Header Section */}
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							p: 2,
							backgroundColor: 'globalElementColors.lightBlue',
							borderBottom: '1px solid #e0e0e0',
							cursor: 'pointer',
						}}
						onClick={handleToggleExpansion}
					>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								flex: 1,
							}}
						>
							<Typography
								variant={typographyConstants.body2}
								sx={{
									mr: 2,
								}}
							>
								{localizationConstants.academicYear} :{' '}
								<Typography
									variant={typographyConstants.body2}
									sx={{ color: 'globalElementColors.blue2' }}
									component='span'
								>
									{academicYear}
								</Typography>
							</Typography>
						</Box>

						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								gap: '60px',
							}}
						>
							<IconButton
								size='medium'
								onClick={(e) => {
									e.stopPropagation()
									handleEdit()
								}}
								disabled={!canEdit}
							>
								<CustomIcon
									name={
										canEdit
											? iconConstants.editPencilBlue
											: iconConstants.editPencilgray
									}
									width='32px'
									height='32px'
									style={{
										cursor: 'pointer',
									}}
								/>
							</IconButton>
							<IconButton
								size='small'
								sx={{
									color: '#666',
									'&:hover': {
										backgroundColor: 'rgba(0,0,0,0.04)',
									},
								}}
							>
								{isExpanded ? (
									<KeyboardArrowUpIcon
										sx={{
											width: '28px',
											height: '28px',
											color: 'textColors.black',
										}}
									/>
								) : (
									<KeyboardArrowDownIcon
										sx={{
											width: '28px',
											height: '28px',
											color: 'textColors.black',
										}}
									/>
								)}
							</IconButton>
						</Box>
					</Box>

					{/* Collapsible Content */}
					<Collapse in={isExpanded}>
						<Box sx={{ p: 2 }}>
							{/* Class and Section Headers */}
							<Box sx={{ mb: 2 }}>
								<Grid container spacing={2}>
									<Grid item xs={4}>
										<Typography
											variant={typographyConstants.h5}
											sx={{
												textTransform: 'uppercase',
												borderBottom:
													'2px solid #1976d2',
												pb: 1,
												fontWeight: 800,
											}}
										>
											{localizationConstants.class}
										</Typography>
									</Grid>
									<Grid item xs={8}>
										<Typography
											variant={typographyConstants.h5}
											sx={{
												textTransform: 'uppercase',
												borderBottom:
													'2px solid #1976d2',
												pb: 1,
												fontWeight: 800,
											}}
										>
											{localizationConstants.section}
										</Typography>
									</Grid>
								</Grid>
							</Box>

							{/* Class and Sections Data */}
							{classroomData && classroomData.length > 0 ? (
								renderClassSections()
							) : (
								<Typography
									variant='body2'
									sx={{
										color: '#999',
										fontStyle: 'italic',
										textAlign: 'center',
										py: 2,
									}}
								>
									{localizationConstants.noDataAvailable}
								</Typography>
							)}
						</Box>
					</Collapse>
				</CardContent>
			</Tooltip>
		</Card>
	)
}

export default AcademicYearClassroomCard
