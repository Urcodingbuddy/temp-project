import {
	Box,
	Checkbox,
	FormControlLabel,
	IconButton,
	TableCell,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import CustomIcon from './CustomIcon'
import { tableCellClasses } from '@mui/material/TableCell'
import { styled } from '@mui/material/styles'
import { typographyConstants } from '../resources/theme/typographyConstants'
import { requestParams } from '../utils/apiConstants'
import { iconConstants } from '../resources/theme/iconConstants'
import { sortEnum } from '../utils/utils'
import { localizationConstants } from '../resources/theme/localizationConstants'

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
	[`&.${tableCellClasses.head}`]: {
		backgroundColor: '#D9E8F8',
	},
}))

const TeacherTableHeader = ({
	columns,
	sortKeys,
	setSortKeys,
	setColumns,
	countOfRows,
	addNestedHeader,
	nestedHeaders,
	isSelectedAllForDelete,
	setIsSelectedAllForDelete,
	bulkSelection = false,
	isSecondBoxClicked,
	setIsSecondBoxClicked,
}) => {
	const { t } = useTranslation()

	return (
		<TableHead
			sx={{
				backgroundColor: 'tableHeaderColors.lightBlue2',
				zIndex: 5,
			}}
		>
			{addNestedHeader && (
				<TableRow
					sx={{
						height: '59px',
						position: 'sticky',
						top: 0,
						zIndex: 2,
					}}
				>
					{nestedHeaders.map((headerGroup, index) => (
						<StyledTableCell
							key={index}
							style={{
								textAlign: 'center',
								position: 'sticky',
								top: 0,
								left: headerGroup.left,
								zIndex:
									headerGroup.position === 'sticky' ? 4 : 3,
								height: '59px',
								borderRight: '1px solid #E2E2E2',
							}}
							colSpan={headerGroup.column}
						>
							{headerGroup.id}
						</StyledTableCell>
					))}
				</TableRow>
			)}

			<TableRow
				sx={{
					height: '66px',
					position: 'sticky',
					top: addNestedHeader ? '59px' : '0px',
					zIndex: 3,
				}}
			>
				{columns.map((column, index) => (
					<>
						<StyledTableCell
							key={index}
							align={column.align}
							sx={{
								width: column.width,
								p: 0,
								pl: '10px',
								position: column.position
									? column.position
									: 'none',
								left: column.left && column.left,
								zIndex: column.position === 'sticky' ? 4 : 3,
								borderRight:
									column.id !==
										localizationConstants.showCategoryActions &&
									'1px solid',
								borderColor: 'globalElementColors.borderGrey2',
							}}
						>
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
								}}
							>
								{index === 0 && bulkSelection && (
									<>
										<FormControlLabel
											checked={isSelectedAllForDelete}
											onChange={() => {
												setIsSelectedAllForDelete(
													!isSelectedAllForDelete,
												)
												setIsSecondBoxClicked(
													!isSecondBoxClicked,
												)
											}}
											control={
												<Checkbox
													icon={
														<CustomIcon
															name={
																iconConstants.uncheckedBox
															}
															style={{
																width: '22px',
																height: '22px',
															}}
															svgStyle={
																'width: 22px; height: 22px'
															}
														/>
													}
													checkedIcon={
														<CustomIcon
															name={
																iconConstants.checkedBoxBlue
															}
															style={{
																width: '22px',
																height: '22px',
															}}
															svgStyle={
																'width: 22px; height: 22px'
															}
														/>
													}
												/>
											}
										/>
										{isSelectedAllForDelete && (
											<FormControlLabel
												checked={isSecondBoxClicked}
												onChange={() => {
													setIsSecondBoxClicked(
														!isSecondBoxClicked,
													)
												}}
												control={
													<Checkbox
														icon={
															<CustomIcon
																name={
																	iconConstants.uncheckedBox
																}
																style={{
																	width: '22px',
																	height: '22px',
																}}
																svgStyle={
																	'width: 22px; height: 22px'
																}
															/>
														}
														checkedIcon={
															<CustomIcon
																name={
																	iconConstants.checkedBoxBlue
																}
																style={{
																	width: '22px',
																	height: '22px',
																}}
																svgStyle={
																	'width: 22px; height: 22px'
																}
															/>
														}
													/>
												}
											/>
										)}
									</>
								)}
								<Typography
									variant={typographyConstants.body2}
									sx={{
										color: 'tableHeaderColors.tableHeaderTextColor',
										fontWeight: 500,
									}}
								>
									{t(column.label)}
									{column?.dataCount && (
										<>
											{countOfRows
												? '(' + countOfRows + ')'
												: '(0)'}
										</>
									)}
								</Typography>

								{column?.sort && (
									<IconButton
										sx={{ ml: 0.5 }}
										size='small'
										onClick={(e) => {
											const newData = columns.map(
												(item) => {
													if (item.id === column.id) {
														return {
															...item,
															sort:
																column.sort ===
																sortEnum.desc
																	? sortEnum.asc
																	: sortEnum.desc,
														}
													}
													return item
												},
											)

											const newSortKeys = sortKeys.filter(
												(item) => {
													if (
														item.key !== column.name
													) {
														return item
													}
												},
											)
											const newSortKey = {
												[requestParams.key]:
													column.name,
												[requestParams.value]:
													column.sort,
											}
											newSortKeys.unshift(newSortKey)
											setSortKeys(newSortKeys)
											setColumns(newData)
										}}
									>
										<CustomIcon
											name={
												column.sort === sortEnum.desc
													? iconConstants.ascArrow
													: iconConstants.descArrow
											}
										/>
									</IconButton>
								)}
							</Box>
						</StyledTableCell>
					</>
				))}
			</TableRow>
		</TableHead>
	)
}

export default TeacherTableHeader
