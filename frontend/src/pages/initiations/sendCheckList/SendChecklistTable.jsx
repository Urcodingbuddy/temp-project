import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	Box,
	Checkbox,
	FormControlLabel,
	IconButton,
	Table,
	TableBody,
	TableCell,
	TableRow,
	TableHead,
	TableContainer,
	Tooltip,
	Typography,
	Button,
	styled,
	tooltipClasses,
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import VisibilityIcon from '@mui/icons-material/Visibility'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { sortEnum, formatDate } from '../../../utils/utils'
import CustomPagination from '../../../components/CustomPagination'
import {
	fetchAllSendChecklist,
	getBackgroundColor,
} from './sendChecklistFunction'
import EditStudentCL from './EditStudentCL'
import {
	Grade_4_Questions,
	Grade_9_Questions,
	categoriesNames,
} from './sendCheckListConstants'
import CustomDialog from '../../../components/CustomDialog'
import {
	checklistBulkDelete,
	checklistsingleDelete,
	clearSCIdsForDelete,
	setGrade_4_Marks,
	setGrade_9_Marks,
	setRecallSendChecklistAPI,
	setSCIdsForDelete,
} from './sendChecklistslice'
import { handleDownloadExcel } from './sendChecklistThunk'
import { tableStyles } from '../../../components/styles/tableStyles'

const HtmlTooltip = styled(({ className, ...props }) => (
	<Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
	[`& .${tooltipClasses?.tooltip}`]: {
		backgroundColor: '#FFFFFF',
		color: 'black',
		minWidth: '260px',
		minHeight: '120px',
		boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
		borderRadius: '10px',
		padding: '12px',
	},
	'.MuiTooltip-arrow': {
		color: 'white',
		width: '50px',
		height: '50px',
	},
}))

const SendChecklistTable = ({
	checkListData,
	sortKeys,
	setSortKeys,
	currentPage,
	setCurrentPage,
	rowsPerPage,
	setRowsPerPage,
	columnsData,
	isGrade_9,
	filterData,
	searchText,
	selectChecklist,
	onEditChecklist,
}) => {
	const dispatch = useDispatch()
	const tableContainerRef = useRef(null)
	const [columns, setColumns] = useState(columnsData)
	const [drawerOpen, setDrawerOpen] = useState(false)
	const { Grade_9_Marks, Grade_4_Marks, sCIdsForDelete } = useSelector(
		(store) => store.sendChecklist,
	)
	const { appPermissions } = useSelector((store) => store.dashboardSliceSetup)
	const [deleteBulkDialog, setDeleteBulkDialog] = useState(false)
	const [editTitle, setEditTitle] = useState('')
	const [editStudentId, setStudentId] = useState('')
	const [singleDeleteId, setSingleDeleteId] = useState('')
	const [hoveredRowIndex, setHoveredRowIndex] = useState(null)
	const [deleteStudentDialog, setDeleteStudentDialog] = useState(false)
	const [isSelectedAllForDelete, setIsSelectedAllForDelete] = useState(false)

	const handleSort = (columnName) => {
		const currentSortKey = sortKeys[0]
		let newValue

		if (currentSortKey?.key === columnName) {
			// Same column clicked - toggle direction
			newValue = currentSortKey.value === sortEnum.asc ? sortEnum.desc : sortEnum.asc
		} else {
			// Different column clicked - start with descending
			newValue = sortEnum.desc
		}

		setSortKeys([{ key: columnName, value: newValue }])
	}

	const getSortIcon = (column) => {
		if (!column.sort) return null
		const activeSortKey = sortKeys[0]
		if (activeSortKey?.key !== column.name) {
			return <UnfoldMoreIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
		}
		if (activeSortKey.value === sortEnum.asc) {
			return <KeyboardArrowUpIcon sx={{ fontSize: 14, color: '#3B82F6' }} />
		}
		if (activeSortKey.value === sortEnum.desc) {
			return <KeyboardArrowDownIcon sx={{ fontSize: 14, color: '#3B82F6' }} />
		}
		return <UnfoldMoreIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
	}

	const renderScoreCell = (row, categoryKey, maxScore, onClickHandler) => {
		const score = row?.categories?.find(
			(data) => data?.category === categoryKey,
		)?.score ?? 0

		return (
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
				<Box
					sx={{
						width: '22px',
						height: '22px',
						borderRadius: '4px',
						backgroundColor: getBackgroundColor(score, maxScore, false),
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<Typography sx={{ fontSize: '11px', color: 'white', fontWeight: 600 }}>
						{score}
					</Typography>
				</Box>
				<IconButton
					size='small'
					onClick={(e) => {
						e.stopPropagation()
						onClickHandler()
					}}
					sx={{ p: 0.5 }}
				>
					<VisibilityIcon sx={{ fontSize: 16, color: '#64748B' }} />
				</IconButton>
			</Box>
		)
	}

	const renderCognitiveTooltipContent = (row) => (
		<Box>
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
				<Typography sx={{ fontWeight: 600, fontSize: '15px', letterSpacing: '0.5px' }}>
					{row?.studentName ?? ''}
				</Typography>
				<Typography sx={{ fontWeight: 500, fontSize: '13px', color: '#64748B' }}>
					{row?.schoolName ?? ''}
				</Typography>
			</Box>
			{[
				{ label: localizationConstants.readingAndSpelling, key: categoriesNames?.readingAndSpelling, max: 18 },
				{ label: localizationConstants.numeracySkills, key: categoriesNames?.numeracySkills, max: 9 },
				{ label: localizationConstants.speakingAndListening, key: categoriesNames?.speakingAndListening, max: 15 },
				{ label: localizationConstants.styleofWorking, key: categoriesNames?.styleofWorking, max: 4 },
			].map((item, idx) => (
				<Box key={idx} sx={{ display: 'flex', alignItems: 'center', mt: idx === 0 ? '7px' : '5px' }}>
					<Box
						sx={{
							width: '15px',
							height: '15px',
							borderRadius: '4px',
							mr: '5px',
							backgroundColor: getBackgroundColor(
								row?.categories?.find((d) => d?.category === categoriesNames?.cognitive)
									?.subCategories?.find((d) => d?.subCategory === item.key)?.score ?? 0,
								item.max,
								false,
							),
						}}
					/>
					<Typography sx={{ color: '#64748B', fontSize: '13px' }}>
						{`${item.label}: ${row?.categories?.find((d) => d?.category === categoriesNames?.cognitive)
							?.subCategories?.find((d) => d?.subCategory === item.key)?.score ?? 0}`}
					</Typography>
				</Box>
			))}
		</Box>
	)

	const renderSocialSkillsTooltipContent = (row) => (
		<Box>
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
				<Typography sx={{ fontWeight: 600, fontSize: '15px', letterSpacing: '0.5px' }}>
					{row?.studentName ?? ''}
				</Typography>
				<Typography sx={{ fontWeight: 500, fontSize: '13px', color: '#64748B' }}>
					{row?.schoolName ?? ''}
				</Typography>
			</Box>
			{[
				{ label: localizationConstants.behavior, key: categoriesNames?.behavior, max: 9 },
				{ label: localizationConstants.visualAndPerceptualAbility, key: categoriesNames?.visualAndPerceptualAbility, max: 8 },
			].map((item, idx) => (
				<Box key={idx} sx={{ display: 'flex', alignItems: 'center', mt: idx === 0 ? '7px' : '5px' }}>
					<Box
						sx={{
							width: '15px',
							height: '15px',
							borderRadius: '4px',
							mr: '5px',
							backgroundColor: getBackgroundColor(
								row?.categories?.find((d) => d?.category === categoriesNames?.socialSkills)
									?.subCategories?.find((d) => d?.subCategory === item.key)?.score ?? 0,
								item.max,
								false,
							),
						}}
					/>
					<Typography sx={{ color: '#64748B', fontSize: '13px' }}>
						{`${item.label}: ${row?.categories?.find((d) => d?.category === categoriesNames?.socialSkills)
							?.subCategories?.find((d) => d?.subCategory === item.key)?.score ?? 0}`}
					</Typography>
				</Box>
			))}
		</Box>
	)

	const renderCellContent = (column, row, index) => {
		const fieldId = column.id

		if (fieldId === localizationConstants.id) {
			return row?.user_id ?? '-'
		}
		if (fieldId === localizationConstants.academicYear) {
			return row?.academicYear ?? localizationConstants.notApplicable
		}
		if (fieldId === localizationConstants.studentsName) {
			return row?.studentName ?? '-'
		}
		if (fieldId === 'createdAt') {
			return formatDate(row?.createdAt) || '-'
		}
		if (fieldId === localizationConstants.attention) {
			return renderScoreCell(row, categoriesNames?.attention, 4, () => {
				if (isSelectedAllForDelete) {
					dispatch(setSCIdsForDelete(row?._id))
				} else {
					setEditTitle(localizationConstants.attention)
					setStudentId(row?._id ?? '')
					setDrawerOpen(true)
					dispatch(setGrade_4_Marks({
						...Grade_4_Marks,
						[localizationConstants.attention]: row?.categories?.find(
							(data) => data?.category === categoriesNames?.attention,
						)?.Questions ?? [],
					}))
				}
			})
		}
		if (fieldId === localizationConstants.fineMotorGrossMotorSkill) {
			return renderScoreCell(row, categoriesNames?.fineMotorGrossMotorSkill, 4, () => {
				if (isSelectedAllForDelete) {
					dispatch(setSCIdsForDelete(row?._id))
				} else {
					setEditTitle(localizationConstants.fineMotorGrossMotorSkill)
					setStudentId(row?._id ?? '')
					setDrawerOpen(true)
					dispatch(setGrade_4_Marks({
						...Grade_4_Marks,
						[localizationConstants.fineMotorGrossMotorSkill]: row?.categories?.find(
							(data) => data?.category === categoriesNames?.fineMotorGrossMotorSkill,
						)?.Questions ?? [],
					}))
				}
			})
		}
		if (fieldId === localizationConstants.cognitive && !isGrade_9) {
			return renderScoreCell(row, categoriesNames?.cognitive, 11, () => {
				if (isSelectedAllForDelete) {
					dispatch(setSCIdsForDelete(row?._id))
				} else {
					setEditTitle(localizationConstants.cognitive)
					setStudentId(row?._id ?? '')
					setDrawerOpen(true)
					dispatch(setGrade_4_Marks({
						...Grade_4_Marks,
						[localizationConstants.cognitive]: row?.categories?.find(
							(data) => data?.category === categoriesNames?.cognitive,
						)?.Questions ?? [],
					}))
				}
			})
		}
		if (fieldId === localizationConstants.cognitive && isGrade_9) {
			const score = row?.categories?.find((d) => d?.category === categoriesNames?.cognitive)?.score ?? 0
			return (
				<HtmlTooltip title={renderCognitiveTooltipContent(row)} arrow placement='left'>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
						<Box
							sx={{
								width: '22px',
								height: '22px',
								borderRadius: '4px',
								backgroundColor: getBackgroundColor(score, 46, false),
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<Typography sx={{ fontSize: '11px', color: 'white', fontWeight: 600 }}>{score}</Typography>
						</Box>
						<IconButton
							size='small'
							onClick={(e) => {
								e.stopPropagation()
								if (isSelectedAllForDelete) {
									dispatch(setSCIdsForDelete(row?._id))
								} else {
									setEditTitle(localizationConstants.cognitive)
									setStudentId(row?._id ?? '')
									setDrawerOpen(true)
									dispatch(setGrade_9_Marks({
										...Grade_9_Marks,
										[localizationConstants.cognitive]: {
											[localizationConstants.readingAndSpelling]: row?.categories?.find((d) => d?.category === categoriesNames?.cognitive)?.subCategories?.find((d) => d?.subCategory === categoriesNames?.readingAndSpelling)?.Questions ?? [],
											[localizationConstants.numeracySkills]: row?.categories?.find((d) => d?.category === categoriesNames?.cognitive)?.subCategories?.find((d) => d?.subCategory === categoriesNames?.numeracySkills)?.Questions ?? [],
											[localizationConstants.speakingAndListening]: row?.categories?.find((d) => d?.category === categoriesNames?.cognitive)?.subCategories?.find((d) => d?.subCategory === categoriesNames?.speakingAndListening)?.Questions ?? [],
											[localizationConstants.styleofWorking]: row?.categories?.find((d) => d?.category === categoriesNames?.cognitive)?.subCategories?.find((d) => d?.subCategory === categoriesNames?.styleofWorking)?.Questions ?? [],
										},
									}))
								}
							}}
							sx={{ p: 0.5 }}
						>
							<VisibilityIcon sx={{ fontSize: 16, color: '#64748B' }} />
						</IconButton>
					</Box>
				</HtmlTooltip>
			)
		}
		if (fieldId === localizationConstants.behavior) {
			return renderScoreCell(row, categoriesNames?.behavior, 9, () => {
				if (isSelectedAllForDelete) {
					dispatch(setSCIdsForDelete(row?._id))
				} else {
					setEditTitle(localizationConstants.behavior)
					setStudentId(row?._id ?? '')
					setDrawerOpen(true)
					dispatch(setGrade_4_Marks({
						...Grade_4_Marks,
						[localizationConstants.behavior]: row?.categories?.find(
							(data) => data?.category === categoriesNames?.behavior,
						)?.Questions ?? [],
					}))
				}
			})
		}
		if (fieldId === localizationConstants.attentionHyperactivity) {
			return renderScoreCell(row, categoriesNames?.attentionHyperactivity, 12, () => {
				if (isSelectedAllForDelete) {
					dispatch(setSCIdsForDelete(row?._id))
				} else {
					setEditTitle(localizationConstants.attentionHyperactivity)
					setStudentId(row?._id ?? '')
					setDrawerOpen(true)
					dispatch(setGrade_9_Marks({
						...Grade_9_Marks,
						[localizationConstants.attentionHyperactivity]: row?.categories?.find(
							(data) => data?.category === categoriesNames?.attentionHyperactivity,
						)?.Questions ?? [],
					}))
				}
			})
		}
		if (fieldId === localizationConstants.memory) {
			return renderScoreCell(row, categoriesNames?.memory, 4, () => {
				if (isSelectedAllForDelete) {
					dispatch(setSCIdsForDelete(row?._id))
				} else {
					setEditTitle(localizationConstants.memory)
					setStudentId(row?._id ?? '')
					setDrawerOpen(true)
					dispatch(setGrade_9_Marks({
						...Grade_9_Marks,
						[localizationConstants.memory]: row?.categories?.find(
							(data) => data?.category === categoriesNames?.memory,
						)?.Questions ?? [],
					}))
				}
			})
		}
		if (fieldId === localizationConstants.fineMotorGrossMotorSkillPGC) {
			return renderScoreCell(row, categoriesNames?.fineMotorGrossMotorSkillPGC, 6, () => {
				if (isSelectedAllForDelete) {
					dispatch(setSCIdsForDelete(row?._id))
				} else {
					setEditTitle(localizationConstants.fineMotorGrossMotorSkillPGC)
					setStudentId(row?._id ?? '')
					setDrawerOpen(true)
					dispatch(setGrade_9_Marks({
						...Grade_9_Marks,
						[localizationConstants.fineMotorGrossMotorSkillPGC]: row?.categories?.find(
							(data) => data?.category === categoriesNames?.fineMotorGrossMotorSkillPGC,
						)?.Questions ?? [],
					}))
				}
			})
		}
		if (fieldId === `${localizationConstants.social} Skills`) {
			const score = row?.categories?.find((d) => d?.category === categoriesNames?.socialSkills)?.score ?? 0
			return (
				<HtmlTooltip title={renderSocialSkillsTooltipContent(row)} arrow placement='left'>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
						<Box
							sx={{
								width: '22px',
								height: '22px',
								borderRadius: '4px',
								backgroundColor: getBackgroundColor(score, 17, false),
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<Typography sx={{ fontSize: '11px', color: 'white', fontWeight: 600 }}>{score}</Typography>
						</Box>
						<IconButton
							size='small'
							onClick={(e) => {
								e.stopPropagation()
								setEditTitle(localizationConstants.socialSkills)
								setStudentId(row?._id ?? '')
								setDrawerOpen(true)
								dispatch(setGrade_9_Marks({
									...Grade_9_Marks,
									[localizationConstants.socialSkills]: {
										[localizationConstants.behavior]: row?.categories?.find((d) => d?.category === categoriesNames?.socialSkills)?.subCategories?.find((d) => d?.subCategory === categoriesNames?.behavior)?.Questions ?? [],
										[localizationConstants.visualAndPerceptualAbility]: row?.categories?.find((d) => d?.category === categoriesNames?.socialSkills)?.subCategories?.find((d) => d?.subCategory === categoriesNames?.visualAndPerceptualAbility)?.Questions ?? [],
									},
								}))
							}}
							sx={{ p: 0.5 }}
						>
							<VisibilityIcon sx={{ fontSize: 16, color: '#64748B' }} />
						</IconButton>
					</Box>
				</HtmlTooltip>
			)
		}

		return '-'
	}

	useEffect(() => {
		if (isSelectedAllForDelete) {
			if (checkListData?.data?.length > 0) {
				dispatch(clearSCIdsForDelete(checkListData?.data?.map((data) => data?._id)))
			}
		} else {
			dispatch(clearSCIdsForDelete([]))
		}
	}, [isSelectedAllForDelete, checkListData, dispatch])

	useEffect(() => {
		if (sCIdsForDelete?.length === 0) {
			setIsSelectedAllForDelete(false)
		}
	}, [sCIdsForDelete])

	useEffect(() => {
		setIsSelectedAllForDelete(false)
	}, [currentPage])

	useEffect(() => {
		if (tableContainerRef.current) {
			tableContainerRef.current.scrollTop = 0
		}
	}, [checkListData?.data])

	useEffect(() => {
		setColumns(columnsData)
	}, [columnsData])

	const tableMinWidth = useMemo(() => {
		return columns.reduce((sum, col) => sum + (col.width || 0), 0)
	}, [columns])

	return (
		<Box sx={{ flex: 1, minWidth: 0, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
			{checkListData?.data?.length > 0 ? (
				<Box sx={{ ...tableStyles.container, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
					<TableContainer
						ref={tableContainerRef}
						sx={{ flex: 1, overflow: 'auto', ...tableStyles.scrollWrapper }}
					>
						<Table
							stickyHeader
							size='small'
							sx={{ tableLayout: 'fixed', minWidth: tableMinWidth }}
						>
							<TableHead>
								<TableRow sx={{ height: '44px' }}>
									{columns.map((column, i) => (
										<TableCell
											key={column.id}
											sx={{
												...tableStyles.headerCell,
												width: column.width,
												minWidth: column.width,
												cursor: column.sort ? 'pointer' : 'default',
												'&:hover': column.sort ? { backgroundColor: '#F1F5F9' } : {},
											}}
											onClick={() => column.sort && handleSort(column.name)}
										>
											<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
												{i === 0 && appPermissions?.studentCheckList?.delete && (
													<Checkbox
														size='small'
														checked={isSelectedAllForDelete}
														onChange={() => setIsSelectedAllForDelete(!isSelectedAllForDelete)}
														icon={<CheckBoxOutlineBlankIcon sx={{ fontSize: 18 }} />}
														checkedIcon={<CheckBoxIcon sx={{ fontSize: 18, color: '#3B82F6' }} />}
														sx={{ mr: 1, p: 0 }}
													/>
												)}
												<Typography
													sx={{
														fontSize: '11px',
														fontWeight: 600,
														color: '#64748B',
														textTransform: 'uppercase',
														letterSpacing: '0.3px',
														flex: 1,
													}}
												>
													{column.label}
												</Typography>
												{column.sort && (
													<IconButton size='small' sx={{ p: 0 }}>
														{getSortIcon(column)}
													</IconButton>
												)}
											</Box>
										</TableCell>
									))}
								</TableRow>
							</TableHead>
							<TableBody>
								{checkListData?.data?.map((row, index) => (
									<TableRow
										key={row._id || index}
										onMouseEnter={() => setHoveredRowIndex(index)}
										onMouseLeave={() => setHoveredRowIndex(null)}
										onClick={() => {
											if (isSelectedAllForDelete) {
												dispatch(setSCIdsForDelete(row?._id))
											}
										}}
										sx={tableStyles.bodyRow}
									>
										{columns.map((column, i) => (
											<TableCell
												key={column.id}
												sx={{
													...tableStyles.bodyCell,
													width: column.width,
													minWidth: column.width,
												}}
											>
												<Box sx={{ display: 'flex', alignItems: 'center' }}>
													{isSelectedAllForDelete && i === 0 && (
														<FormControlLabel
															checked={sCIdsForDelete?.includes(row?._id)}
															onChange={(e) => {
																e.stopPropagation()
																dispatch(setSCIdsForDelete(row?._id))
															}}
															control={
																<Checkbox
																	size='small'
																	icon={<CheckBoxOutlineBlankIcon sx={{ fontSize: 18 }} />}
																	checkedIcon={<CheckBoxIcon sx={{ fontSize: 18, color: '#3B82F6' }} />}
																/>
															}
															sx={{ mr: 0 }}
														/>
													)}
													{column.id === localizationConstants.showCategoryActions ? (
														appPermissions?.studentCheckList?.delete &&
														hoveredRowIndex === index &&
														!isSelectedAllForDelete ? (
															<IconButton
																size='small'
																onClick={(e) => {
																	e.stopPropagation()
																	setSingleDeleteId(row?._id ?? '')
																	setDeleteStudentDialog(true)
																}}
																sx={{
																	color: '#EF4444',
																	'&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
																}}
															>
																<DeleteOutlineIcon sx={{ fontSize: 18 }} />
															</IconButton>
														) : null
													) : (
														<Typography
															sx={{
																fontSize: '13px',
																color: '#334155',
																overflow: 'hidden',
																textOverflow: 'ellipsis',
																whiteSpace: 'nowrap',
																flex: 1,
															}}
															component='div'
														>
															{renderCellContent(column, row, index)}
														</Typography>
													)}
												</Box>
											</TableCell>
										))}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>

					{/* Footer */}
					<Box sx={tableStyles.footer}>
						{!isSelectedAllForDelete ? (
							<Box
								sx={tableStyles.downloadLink}
								onClick={() => {
									const body = fetchAllSendChecklist(
										dispatch,
										filterData,
										searchText,
										currentPage,
										rowsPerPage.value,
										selectChecklist,
										sortKeys,
										true,
									)
									handleDownloadExcel(body, true)()
								}}
							>
								<DownloadIcon sx={{ fontSize: 16 }} />
								<Typography sx={{ fontSize: '13px', fontWeight: 500 }}>
									{localizationConstants.downloadReport}
								</Typography>
							</Box>
						) : (
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<Button
									variant='outlined'
									sx={{
										height: '34px',
										borderColor: '#6A6A6A',
										color: '#6A6A6A',
										'&:hover': { borderColor: '#555', backgroundColor: 'rgba(106, 106, 106, 0.1)' },
									}}
									onClick={() => {
										dispatch(clearSCIdsForDelete([]))
										setIsSelectedAllForDelete(false)
									}}
								>
									{localizationConstants.cancel}
								</Button>
								<Button
									variant='contained'
									sx={{
										height: '34px',
										backgroundColor: '#DD2A2B',
										'&:hover': { backgroundColor: '#C62828' },
									}}
									onClick={() => setDeleteBulkDialog(true)}
								>
									{localizationConstants.delete}
								</Button>
							</Box>
						)}
						<CustomPagination
							rowsPerPage={rowsPerPage}
							setRowsPerPage={setRowsPerPage}
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
							totalCount={checkListData?.totalCount}
						/>
					</Box>
				</Box>
			) : (
				<Box sx={tableStyles.emptyState}>
					<CustomIcon
						name={iconConstants.initiationBlack}
						style={{ width: '80px', height: '80px', opacity: 0.4 }}
						svgStyle={'width: 80px; height: 80px'}
					/>
					<Typography sx={tableStyles.emptyStateTitle}>
						{localizationConstants.noStudentChecklistMsg}
					</Typography>
				</Box>
			)}

			<EditStudentCL
				open={drawerOpen}
				setOpen={setDrawerOpen}
				questionListData={
					isGrade_9
						? Grade_9_Questions(Grade_9_Marks)?.[editTitle ?? '']
						: Grade_4_Questions(Grade_4_Marks)?.[editTitle ?? '']
				}
				isGrade_9={isGrade_9}
				oldData={isGrade_9 ? Grade_9_Marks : Grade_4_Marks}
				studentId={editStudentId ?? ''}
				onEditChecklist={onEditChecklist}
			/>

			<CustomDialog
				isOpen={deleteStudentDialog}
				title={localizationConstants.deleteStudentRecord}
				iconName={iconConstants.academicRed}
				message={localizationConstants.baselineDeleteMsg}
				titleSx={{ color: 'textColors.red', fontWeight: 500, pb: '20px' }}
				leftButtonText={localizationConstants.cancel}
				rightButtonText={localizationConstants.yesDelete}
				onLeftButtonClick={() => setDeleteStudentDialog(false)}
				onRightButtonClick={async () => {
					const res = await dispatch(
						checklistsingleDelete({ body: { id: singleDeleteId } }),
					)
					if (!res.error) {
						setSingleDeleteId('')
						setDeleteStudentDialog(false)
						onEditChecklist()
					}
				}}
			/>

			<CustomDialog
				isOpen={deleteBulkDialog}
				onClose={() => setDeleteBulkDialog(false)}
				title={localizationConstants?.deleteMultipleBaseline}
				iconName={iconConstants.academicRed}
				titleSx={{ color: 'textColors.red', fontWeight: 500, pb: '20px' }}
				message={localizationConstants.deleteBulkInBaselineMsg}
				leftButtonText={localizationConstants.cancel}
				rightButtonText={localizationConstants.yesDelete}
				onLeftButtonClick={() => setDeleteBulkDialog(false)}
				onRightButtonClick={async () => {
					const body = { recordIds: sCIdsForDelete }
					const res = await dispatch(checklistBulkDelete({ body }))
					if (!res?.error) {
						setIsSelectedAllForDelete(false)
						setDeleteBulkDialog(false)
						dispatch(setRecallSendChecklistAPI(true))
						dispatch(clearSCIdsForDelete([]))
						onEditChecklist()
					}
				}}
			/>
		</Box>
	)
}

export default SendChecklistTable
