import { Box } from '@mui/system'
import { transitionPlanning } from './iEPConstants'
import { Typography } from '@mui/material'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import AddCommentsComponent from '../../../components/AddCommentsComponent'
import { useState } from 'react'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'

const TransitionPlanning = ({ data, onChange, setComments, readOnly }) => {
	const [modal, setModal] = useState({
		[localizationConstants.communityExperience]: false,
		[localizationConstants.activitiesofDailyLiving]: false,
		[localizationConstants.functionalVocationalAssistance]: false,
	})
	const [addCommentsDialog, setAddCommentsDialog] = useState(false)
	const [editCommentsDialog, setEditCommentsDialog] = useState(false)
	const [title, setTitle] = useState('')

	return (
		<Box
			sx={{
				border: '1px solid',
				color: 'globalElementColors.lightBlue',
				borderRadius: '10px',
			}}
		>
			{transitionPlanning(data, modal).map((category, index) => (
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'row',
						alignItems: 'center',
						width: '100%',
						minHeight: index === 0 ? '30px' : '70px',
						borderBottom: index === 5 ? 'none' : '1px solid',
						color: 'globalElementColors.lightBlue',
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
							p: '5px 0px 5px 10px',
						}}
					>
						<Typography
							variant={typographyConstants.title}
							sx={{
								color: category?.color,
								fontSize: '16px',
								fontWeight: 500,
							}}
						>
							{category?.details}
						</Typography>
					</Box>

					<Box
						sx={{
							width: '15%',
							p: '10px 20px',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						{category?.availability ===
						localizationConstants.availability ? (
							<Typography
								variant={typographyConstants.title}
								sx={{
									color: category?.color,
									fontSize: '16px',
									fontWeight: 500,
									whiteSpace: 'nowrap',
								}}
							>
								{category?.availability}
							</Typography>
						) : (
							<CustomAutocompleteNew
								sx={{ width: '125px' }}
								fieldSx={{
									width: '100%',
									height: '44px',
									marginTop: '3px',
								}}
								options={['Yes', 'No']}
								placeholder={`${localizationConstants.select}`}
								value={category?.availability}
								onChange={(e) => {
									let value = Array.isArray(e) ? e?.[0] : e
									if (value == null || value[0] == null) {
										value = 'No'
									}

									if (
										JSON.stringify(value) !==
										JSON.stringify(category?.availability)
									) {
										onChange({
											...data,
											[category?.details]: {
												...data?.[category?.details],
												value: value,
											},
										})
									}
								}}
								disabled={readOnly}
							/>
						)}
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
						{(Array.isArray(category?.comments)
							? category?.comments?.[0]
							: category?.comments
						)?.length > 0 ? (
							Array.isArray(category?.comments) ? (
								<>
									{category?.comments
										.slice(
											0,
											category?.showMore
												? category?.comments?.length
												: 1,
										)
										?.map((com, index) => (
											<Typography
												variant={
													typographyConstants.title
												}
												sx={{
													color: category?.color,
													fontSize: '16px',
													fontWeight: 500,
												}}
											>
												{com}
												{category?.comments?.length -
													1 ===
												index ? (
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
													[category.details]:
														!category?.showMore,
												})
											}
										>
											{category?.comments?.length === 1
												? ''
												: category?.showMore
													? localizationConstants.viewless
													: localizationConstants.viewMore}
										</Typography>
										{!readOnly ? (
											<CustomIcon
												name={iconConstants.Edit}
												style={{ cursor: 'pointer' }}
												onClick={() => {
													setEditCommentsDialog(true)
													setTitle(category.details)
												}}
											/>
										) : null}
									</Box>
								</>
							) : (
								<Typography
									variant={typographyConstants.title}
									sx={{
										color: category?.color,
										fontSize: '16px',
										fontWeight: 500,
									}}
								>
									{category?.comments}
								</Typography>
							)
						) : (
							<Box
								sx={{
									display: 'flex',
									justifyContent: 'row',
									alignItems: 'center',
									cursor: 'pointer',
								}}
								onClick={() => {
									if (!readOnly) {
										setAddCommentsDialog(true)
										setTitle(category.details)
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
								{!readOnly &&
								category?.availability?.[0] !== 'No' ? (
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
			))}
			<AddCommentsComponent
				open={addCommentsDialog || editCommentsDialog}
				mainTitle={
					addCommentsDialog
						? localizationConstants.addComments
						: localizationConstants.editComments
				}
				comments={data?.[title]?.comments}
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

export default TransitionPlanning
