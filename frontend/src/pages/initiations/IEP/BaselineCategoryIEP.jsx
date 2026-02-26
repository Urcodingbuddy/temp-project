import * as React from 'react'

import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { baselineReport } from './iEPConstants'
import { Box, Typography } from '@mui/material'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import { useState } from 'react'
import AddCommentsComponent from '../../../components/AddCommentsComponent'

const CategoryRow = ({
	category,
	percentage,
	comments,
	showMore,
	color,
	index,
	setModal,
	modal,
	setAddCommentsDialog,
	setEditCommentsDialog,
	setTitle,
	readOnly,
}) => {
	return (
		<Box
			sx={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				width: '100%',
				minHeight: index === 0 ? '50px' : '70px',
				borderBottom: index === 5 ? 'none' : '1px solid',
				borderColor: 'globalElementColors.lightBlue',
				backgroundColor: index === 0 ? '#F8FCFF' : 'none',
				borderTopLeftRadius: index === 0 ? '10px' : 'none',
				borderTopRightRadius: index === 0 ? '10px' : 'none',
			}}
			gap={'5px'}
		>
			<Box
				sx={{
					width: '10%',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Typography
					variant={typographyConstants.title}
					sx={{
						color: color,
						fontSize: '16px',
						fontWeight: 500,
						whiteSpace: 'nowrap',
						pl: '10px',
					}}
				>
					{category}
				</Typography>
			</Box>
			<Box
				sx={{
					width: '10%',
					p: '10px 20px',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Typography
					variant={typographyConstants.title}
					sx={{
						color: color,
						fontSize: '16px',
						fontWeight: 500,
						whiteSpace: 'nowrap',
					}}
				>
					{percentage === localizationConstants.percentage
						? percentage
						: percentage === 0
							? '0'
							: percentage + '%'}
				</Typography>
			</Box>
			<Box
				sx={{
					display: 'flex',
					flexGrow: 1,
					width: '70%',
					flexDirection: 'column',
					p: '10px 20px',
				}}
				gap={'5px'}
			>
				{(Array.isArray(comments) ? comments?.[0] : comments)?.length >
				0 ? (
					Array.isArray(comments) ? (
						<>
							{comments
								.slice(0, showMore ? comments?.length : 1)
								?.map((com, index) => (
									<Typography
										variant={typographyConstants.title}
										sx={{
											color: color,
											fontSize: '16px',
											fontWeight: 500,
										}}
									>
										{com}
										{comments?.length - 1 === index ? (
											''
										) : (
											<>,</>
										)}
									</Typography>
								))}
							<Box
								sx={{
									display: 'flex',
									justifyContent: 'space-between',
								}}
							>
								<Typography
									sx={{
										color: 'globalElementColors.blue',
										fontWeight: 600,
										fontSize: '14px',
										ml: '3px',
										cursor: 'pointer',
									}}
									onClick={() =>
										setModal({
											...modal,
											[category]: !showMore,
										})
									}
								>
									{comments?.length === 1
										? ''
										: showMore
											? localizationConstants.viewless
											: localizationConstants.viewMore}
								</Typography>
								{!readOnly ? (
									<CustomIcon
										name={iconConstants.Edit}
										style={{ cursor: 'pointer' }}
										onClick={() => {
											setEditCommentsDialog(true)
											setTitle(category)
										}}
									/>
								) : null}
							</Box>
						</>
					) : (
						<Typography
							variant={typographyConstants.title}
							sx={{
								color: color,
								fontSize: '16px',
								fontWeight: 500,
							}}
						>
							{comments}
						</Typography>
					)
				) : (
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'row',
							alignItems: 'center',
							cursor: readOnly ? '' : 'pointer',
						}}
						onClick={() => {
							if (!readOnly) {
								setAddCommentsDialog(true)
								setTitle(category)
							}
						}}
					>
						<CustomIcon
							name={
								readOnly
									? iconConstants.circlePlusGrey
									: iconConstants.addCircleBlue
							}
							style={{ height: '20px', width: '20px' }}
						/>
						<Typography
							sx={{
								color: readOnly
									? 'globalElementColors.grey1'
									: 'globalElementColors.blue',
								fontWeight: 600,
								fontSize: '14px',
								ml: '3px',
							}}
						>
							{localizationConstants.addComments}
						</Typography>
						{!readOnly ? (
							<Typography
								sx={{
									display: 'inline',
									color: 'globalElementColors.red',
								}}
							>
								*
							</Typography>
						) : null}
					</Box>
				)}
			</Box>
		</Box>
	)
}

const BaselineCategoryIEP = ({
	data,
	isBaselineExist = true,
	comments,
	setComments,
	readOnly,
}) => {
	const [modal, setModal] = useState({
		[localizationConstants.physical]: false,
		[localizationConstants.social]: false,
		[localizationConstants.emotional]: false,
		[localizationConstants.cognitive]: false,
		[localizationConstants.linguistic]: false,
	})
	const [addCommentsDialog, setAddCommentsDialog] = useState(false)
	const [editCommentsDialog, setEditCommentsDialog] = useState(false)
	const [title, setTitle] = useState('')

	return (
		<Box
			sx={{
				border: '1px solid',
				borderColor: 'globalElementColors.lightBlue',
				borderRadius: '10px',
				minHeight: '250px',
			}}
		>
			{isBaselineExist
				? baselineReport(data, comments, modal).map(
						(category, index) => (
							<CategoryRow
								key={index}
								{...category}
								index={index}
								setModal={setModal}
								modal={modal}
								setAddCommentsDialog={setAddCommentsDialog}
								setEditCommentsDialog={setEditCommentsDialog}
								setTitle={setTitle}
								readOnly={readOnly}
								isBaselineExist={isBaselineExist}
							/>
						),
					)
				: baselineReport(data, comments, modal)
						?.slice(0, 1)
						.map((category, index) => (
							<>
								<CategoryRow
									key={index}
									{...category}
									index={index}
									setModal={setModal}
									modal={modal}
									setAddCommentsDialog={setAddCommentsDialog}
									setEditCommentsDialog={
										setEditCommentsDialog
									}
									setTitle={setTitle}
									readOnly={readOnly}
									isBaselineExist={isBaselineExist}
								/>
								<Box
									sx={{
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										height: '190px',
									}}
								>
									<Typography
										variant={typographyConstants.h3}
										sx={{
											color: 'globalElementColors.disabledGrey',
											fontSize: '25px',
											fontWeight: 400,
										}}
									>
										{localizationConstants.noDataFound}
									</Typography>
								</Box>
							</>
						))}

			<AddCommentsComponent
				open={addCommentsDialog || editCommentsDialog}
				mainTitle={
					addCommentsDialog
						? localizationConstants.addComments
						: localizationConstants.editComments
				}
				comments={comments?.[title]}
				isEdit={editCommentsDialog}
				onClickDelete={() => {
					setComments(title, [])
					setAddCommentsDialog(false)
					setEditCommentsDialog(false)
					setTitle('')
				}}
				onClickSave={(data) => {
					setComments(title, data)
					setAddCommentsDialog(false)
					setEditCommentsDialog(false)
					setTitle('')
				}}
				onClickcancle={() => {
					setAddCommentsDialog(false)
					setEditCommentsDialog(false)
					setTitle('')
				}}
			/>
		</Box>
	)
}

export default BaselineCategoryIEP
