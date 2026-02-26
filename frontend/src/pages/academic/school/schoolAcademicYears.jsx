import {
	Dialog,
	Divider,
	IconButton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip,
	Typography,
} from '@mui/material'
import { Box } from '@mui/system'
import { useEffect, useState } from 'react'
import { getAllSchoolAcademicYearBySchoolId } from './schoolFunctions'
import { useDispatch, useSelector } from 'react-redux'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { typographyConstants } from '../../../resources/theme/typographyConstants'

import { counsellorStyles } from '../../counsellors/counsellorsStyles'

import { scAcYearsColumns } from './schoolConstants'
import { iconConstants } from '../../../resources/theme/iconConstants'
import CustomIcon from '../../../components/CustomIcon'
import { formatDate, getCurACYear } from '../../../utils/utils'
import EditAcademicYearsComponent from './editSchoolAcademicYear'

const SchoolAcademicYearsComponent = ({
	isOpen,
	onClose,
	schoolId,
	title,
	selectedSchool,
	setInputs,
}) => {
	const dispacth = useDispatch()

	const [scAcYrs, setScAcYrs] = useState([])
	const [columns, setColumns] = useState(scAcYearsColumns)
	const [openEdit, setOpenEdit] = useState(false)
	const [rowData, setRowData] = useState({})
	const [selectedIndex, setSelectedIndex] = useState(null)
	const { academicYears } = useSelector((store) => store.dashboardSliceSetup)

	const [lastPromotionYear, setLastPromotionYear] = useState('')

	useEffect(() => {
		const lastPromotedAcademicYearId =
			selectedSchool?.lastPromotionAcademicYear

		const lastPromotionYearObj = academicYears.find(
			(acy) => acy._id === lastPromotedAcademicYearId,
		)

		if (lastPromotionYearObj) {
			setLastPromotionYear(lastPromotionYearObj.academicYear)
		}
	}, [academicYears, selectedSchool])

	const rowCells = (column, row) => {
		const isRowDisabled =
			lastPromotionYear && row.academicYear < lastPromotionYear
		switch (column.id) {
			case localizationConstants.academicYear:
				return (
					<Typography variant={typographyConstants.body}>
						{row?.academicYear}
					</Typography>
				)
			case localizationConstants.startDate:
				return (
					<Typography variant={typographyConstants.body}>
						{row?.startDate ? formatDate(row?.startDate) : 'N/A'}
					</Typography>
				)
			case localizationConstants.endDate:
				return (
					<Typography variant={typographyConstants.body}>
						{row?.endDate ? formatDate(row?.endDate) : 'N/A'}
					</Typography>
				)
			case localizationConstants.edit:
				return (
					<IconButton
						onClick={() => {
							if (!isRowDisabled) {
								setRowData(row)
								setOpenEdit(true)
							}
						}}
						size='medium'
					>
						<CustomIcon
							name={
								isRowDisabled
									? iconConstants.editPencilgray
									: iconConstants.editPencilBlue
							}
							width='32px'
							height='32px'
							style={{
								cursor: 'pointer',
							}}
						/>
					</IconButton>
				)
			default:
				return null
		}
	}

	const fetchList = () => {
		getAllSchoolAcademicYearBySchoolId(schoolId, dispacth, setScAcYrs)
	}

	useEffect(() => {
		if (isOpen) {
			fetchList()
		}
	}, [isOpen, dispacth, schoolId])

	useEffect(() => {
		const currentYear = getCurACYear(academicYears)
		const currentYearData = scAcYrs.find(
			(acYr) => acYr.academicYear === currentYear,
		)
		if (currentYearData) {
			setInputs((state) => ({
				...state,
				scStartDate: currentYearData.startDate,
				scEndDate: currentYearData.endDate,
			}))
		}
	}, [scAcYrs, academicYears])

	return (
		<>
			<Dialog
				PaperProps={{
					sx: {
						borderRadius: '10px',
						minWidth: '50%',
						minHeight: '85%',
						display: 'flex',
						flexDirection: 'column',
						p: '20px',
					},
				}}
				open={isOpen}
				onClose={() => {
					fetchList()
				}}
			>
				<Box sx={{ minHeight: '20px' }}>
					<Box
						sx={{
							pb: 0,
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
						}}
					>
						<Typography
							sx={{
								textTransform: 'none',
								color: 'black',
								fontWeight: 800,
								fontSize: '20px',
							}}
						>
							{title}
						</Typography>
						<CustomIcon
							name={iconConstants.cancelRounded}
							style={{
								cursor: 'pointer',
								width: '26px',
								height: '26px',
							}}
							svgStyle={'width: 26px; height: 26px'}
							onClick={() => {
								onClose()
							}}
						/>
					</Box>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'flex-start',
							gap: '10px',
							mt: '10px',
						}}
					>
						<Box
							sx={{
								width: '20px',
								height: '20px',
								bgcolor: 'globalElementColors.blue4',
							}}
						></Box>
						<Typography>
							{localizationConstants.lastActiveAcademicYear}
						</Typography>
					</Box>
				</Box>
				<Divider sx={{ mt: '15px' }} />

				{/* ------------ Class Name ------------ */}
				<Box
					sx={{
						flexGrow: 1,
						overflow: 'auto',
						minHeight: '70vh',
						msOverflowStyle: 'none',
						scrollbarWidth: 'none',
						'&::-webkit-scrollbar:horizontal': {
							display: 'none',
						},
					}}
				>
					<Box
						sx={{
							pt: '20px',
						}}
					>
						<TableContainer
							sx={{
								...counsellorStyles.tableContainerSx,
								maxHeight: '350px',
								minHeight: '250px',
							}}
						>
							<Table
								aria-labelledby='tableTitle'
								size={'small'}
								stickyHeader
							>
								<TableHead>
									<TableRow>
										{columns.map((col, index) => (
											<TableCell key={index}>
												{col.id}
											</TableCell>
										))}
									</TableRow>
								</TableHead>
								{scAcYrs.length > 0 && (
									<TableBody>
										{scAcYrs.length > 0 &&
											scAcYrs.map((row, index) => {
												const isRowDisabled =
													lastPromotionYear &&
													row.academicYear <
														lastPromotionYear
												return (
													<Tooltip
														key={index}
														title={
															isRowDisabled
																? localizationConstants.editingIsRestricted
																: localizationConstants.clickToEditAY
														}
														arrow
														placement='top'
														componentsProps={{
															tooltip: {
																sx: {
																	backgroundColor:
																		isRowDisabled
																			? 'globalElementColors.red'
																			: 'globalElementColors.blue5',
																	fontSize:
																		'1rem', // increase font size
																	fontWeight: 500,
																	padding:
																		'8px 12px',
																	borderRadius:
																		'8px',
																},
															},
															arrow: {
																sx: {
																	color: 'globalElementColors.blue5',
																},
															},
														}}
													>
														<TableRow
															hover
															tabIndex={-1}
															key={index}
															sx={{
																backgroundColor:
																	row.academicYear ===
																	lastPromotionYear
																		? 'globalElementColors.blue4'
																		: undefined,
																'&:hover': {
																	backgroundColor:
																		row.academicYear ===
																		lastPromotionYear
																			? 'globalElementColors.blue4'
																			: undefined,
																	cursor: 'pointer',
																},
															}}
															onClick={() => {
																if (
																	!isRowDisabled
																) {
																	setSelectedIndex(
																		index,
																	)
																	setRowData(
																		row,
																	)
																	setOpenEdit(
																		true,
																	)
																}
															}}
														>
															{columns.map(
																(column) => {
																	return (
																		<TableCell
																			key={
																				column.id
																			}
																			align={
																				column.align
																			}
																			sx={{
																				height: '40px',
																				padding:
																					'10px',
																				borderBottom:
																					'none',
																				minWidth:
																					column.width,
																				maxWidth:
																					column.width,
																				position:
																					column.position,
																				left: column.left,
																				zIndex: 1,
																				// backgroundColor:
																				//   column.position === 'sticky' && 'white',
																				borderColor:
																					'globalElementColors.grey4',
																				borderRight:
																					column.id ===
																						localizationConstants.schoolName &&
																					'1px solid',
																				borderRightColor:
																					column.id ===
																						localizationConstants.schoolName &&
																					'globalElementColors.grey4',
																			}}
																		>
																			<Box
																				sx={{
																					display:
																						'flex',
																					alignItems:
																						'center',
																				}}
																			>
																				{rowCells(
																					column,
																					row,
																				)}
																			</Box>
																		</TableCell>
																	)
																},
															)}
														</TableRow>
													</Tooltip>
												)
											})}
									</TableBody>
								)}
							</Table>
						</TableContainer>
					</Box>
				</Box>
			</Dialog>
			<EditAcademicYearsComponent
				isOpen={openEdit}
				scAcYearData={rowData}
				onClose={() => setOpenEdit(false)}
				title={localizationConstants.schoolAcademicYear}
				fetchList={fetchList}
				rows={scAcYrs}
				index={selectedIndex}
			/>
		</>
	)
}

export default SchoolAcademicYearsComponent
