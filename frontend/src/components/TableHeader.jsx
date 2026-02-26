import {
	Box,
	Checkbox,
	FormControlLabel,
	IconButton,
	TableCell,
	TableHead,
	TableRow,
} from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import CustomIcon from './CustomIcon'
import { tableCellClasses } from '@mui/material/TableCell'
import { styled } from '@mui/material/styles'
import { requestParams } from '../utils/apiConstants'
import { iconConstants } from '../resources/theme/iconConstants'
import { sortEnum } from '../utils/utils'
import { localizationConstants } from '../resources/theme/localizationConstants'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

// Modern styled table cell
export const StyledTableCell = styled(TableCell)(({ theme }) => ({
	[`&.${tableCellClasses.head}`]: {
		backgroundColor: '#FAFBFC',
		borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
		borderRight: 'none',
		padding: '10px 12px',
		fontWeight: 600,
		fontSize: '12px',
		color: '#64748B',
		textTransform: 'uppercase',
		letterSpacing: '0.4px',
	},
}))

const AllListTableHeader = ({
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
	height,
}) => {
	const { t } = useTranslation()

	return (
		<TableHead
			sx={{
				backgroundColor: '#FAFBFC',
			}}
		>
			{addNestedHeader && (
				<TableRow
					sx={{
						height: '40px',
					}}
				>
					{nestedHeaders.map((headerGroup, index) => (
						<StyledTableCell
							key={index}
							style={{
								textAlign: 'center',
								left: headerGroup.left,
								height: '40px',
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
					height: height ? height : '44px',
				}}
			>
				{columns.map((column, index) => (
					<StyledTableCell
						key={index}
						align={column.align}
						sx={{
							width: column.width,
							cursor: column?.sort ? 'pointer' : 'default',
							userSelect: 'none',
							transition: 'background-color 0.1s ease',
							'&:hover': column?.sort
								? {
										backgroundColor: '#F1F5F9',
									}
								: {},
						}}
						onClick={
							column?.sort
								? () => {
										const newData = columns.map((item) => {
											if (item.id === column.id) {
												return {
													...item,
													sort:
														column.sort === sortEnum.desc
															? sortEnum.asc
															: sortEnum.desc,
												}
											}
											return item
										})

										const newSortKeys = sortKeys.filter((item) => {
											if (item.key !== column.name) {
												return item
											}
										})
										const newSortKey = {
											[requestParams.key]: column.name,
											[requestParams.value]: column.sort,
										}
										newSortKeys.unshift(newSortKey)
										setSortKeys(newSortKeys)
										setColumns(newData)
									}
								: undefined
						}
					>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent:
									column?.align === 'center'
										? 'center'
										: 'flex-start',
								gap: '4px',
							}}
						>
							{index === 0 && bulkSelection && (
								<FormControlLabel
									checked={isSelectedAllForDelete}
									onChange={() => {
										setIsSelectedAllForDelete(!isSelectedAllForDelete)
									}}
									sx={{ mr: '4px' }}
									control={
										<Checkbox
											size='small'
											icon={
												<CustomIcon
													name={iconConstants.uncheckedBox}
													style={{
														width: '18px',
														height: '18px',
													}}
													svgStyle={'width: 18px; height: 18px'}
												/>
											}
											checkedIcon={
												<CustomIcon
													name={iconConstants.checkedBoxBlue}
													style={{
														width: '18px',
														height: '18px',
													}}
													svgStyle={'width: 18px; height: 18px'}
												/>
											}
										/>
									}
								/>
							)}

							<span>
								{t(column.label)}
								{column?.dataCount && (
									<>
										{countOfRows
											? ' (' + countOfRows + ')'
											: ' (0)'}
									</>
								)}
							</span>

							{column?.sort && (
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										ml: '2px',
									}}
								>
									{column.sort === sortEnum.desc ? (
										<KeyboardArrowDownIcon
											sx={{
												fontSize: '16px',
												color: '#94A3B8',
											}}
										/>
									) : (
										<KeyboardArrowUpIcon
											sx={{
												fontSize: '16px',
												color: '#94A3B8',
											}}
										/>
									)}
								</Box>
							)}
						</Box>
					</StyledTableCell>
				))}
			</TableRow>
		</TableHead>
	)
}

export default AllListTableHeader
