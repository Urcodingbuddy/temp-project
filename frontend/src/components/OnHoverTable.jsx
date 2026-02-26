import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material'
import { Box } from '@mui/system'
import { useEffect } from 'react'
import { getBackgroundColor } from '../pages/assessment/TeacherProfiling/teacherProfilingConstants'
import { localizationConstants } from '../resources/theme/localizationConstants'

const OnHoverTable = ({
	tableSecondColoumTitle,
	tableThirdColoumTitle,
	tableSecondColoumQuestions,
	handleCloseTable,
	scoreForRespectiveDomain,
}) => {
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (!event.target.closest('#onHoverTable')) {
				handleCloseTable()
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [handleCloseTable])

	return (
		<Box
			sx={{
				height: '70%',
				width: '60%',
				position: 'fixed',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%)',
				zIndex: 1000,
				backgroundColor: '#F7F9F9',
				padding: '10px',
				borderRadius: '5px',
				boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.2)',
				overflowY: 'auto',
			}}
		>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>
							<Typography
								align='center'
								sx={{
									fontWeight: 'bold',
								}}
							>
								S.No.
							</Typography>
						</TableCell>
						<TableCell>
							<Typography
								align='left'
								sx={{ fontWeight: 'bold' }}
							>
								{tableSecondColoumTitle}
							</Typography>
						</TableCell>
						<TableCell>
							<Typography
								align='center'
								sx={{ fontWeight: 'bold' }}
							>
								{tableThirdColoumTitle}
							</Typography>
						</TableCell>
						<TableCell>
							<Typography
								align='center'
								sx={{ fontWeight: 'bold' }}
							>
								{localizationConstants?.categorization}
							</Typography>
						</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{tableSecondColoumQuestions.map((ques, index) => (
						<TableRow key={index}>
							<TableCell
								sx={{
									borderBottom: '1px solid #E2E2E2',
									fontWeight: 200,
									width: '10%',
								}}
								align='center'
							>
								<Typography sx={{ fontWeight: 'dark' }}>
									{index + 1}
								</Typography>
							</TableCell>

							<TableCell
								sx={{
									borderBottom: '1px solid #E2E2E2',
									fontWeight: 200,
									width: '40%',
								}}
								align='left'
							>
								<Typography sx={{ fontWeight: 'dark' }}>
									{ques?.question}
								</Typography>
							</TableCell>

							<TableCell
								sx={{
									borderBottom: '1px solid #E2E2E2',
									fontWeight: 200,
									width: '15%',
								}}
								align='center'
							>
								{scoreForRespectiveDomain[index]?.marks && (
									<Typography sx={{ fontWeight: 'dark' }}>
										{scoreForRespectiveDomain[index]?.marks}
									</Typography>
								)}
							</TableCell>

							<TableCell
								sx={{
									borderBottom: '1px solid #E2E2E2',
									fontWeight: 200,
									width: '12%',
								}}
								align='center'
							>
								<Box
									sx={{
										backgroundColor: getBackgroundColor(
											scoreForRespectiveDomain[index]
												?.marks &&
												scoreForRespectiveDomain[index]
													?.marks,
										),
										ml: '12%',
										width: '100px',
										height: '30px',
										borderRadius: '5px',
									}}
								></Box>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Box>
	)
}

export default OnHoverTable
