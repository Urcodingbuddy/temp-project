import {
	Box,
	Dialog,
	DialogContent,
	DialogTitle,
	Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import useCommonStyles from './styles'
import { typographyConstants } from '../resources/theme/typographyConstants'
import CustomIcon from './CustomIcon'
import { iconConstants } from '../resources/theme/iconConstants'
import CustomTextfield from './CustomTextField'
import { localizationConstants } from '../resources/theme/localizationConstants'
import CustomButton from './CustomButton'

const AddCommentsComponent = ({
	open,
	mainTitle,
	comments,
	isEdit = false,
	onClickDelete,
	onClickcancle,
	onClickSave,
}) => {
	const flexStyles = useCommonStyles()
	const [dialogComments, setDialogComments] = useState([])

	useEffect(() => {
		setDialogComments(isEdit ? comments : [''])
	}, [open])

	return (
		<div>
			<Dialog
				PaperProps={{
					style: {
						borderRadius: '10px',
						minWidth: '600px',
						maxWidth: '50vw',
						minHeight: '270px',
						maxHeight: '70vh',
						p: '21px 19px',
					},
				}}
				open={open}
			>
				<DialogTitle>
					<Box className={flexStyles.flexRowCenterSpaceBetween}>
						<Typography variant={typographyConstants.h4}>
							{mainTitle}
						</Typography>
						<Box className={flexStyles.flexRowCenterSpaceBetween}>
							<Typography
								variant={typographyConstants.title}
								sx={{
									fontSize: '16px',
									color: 'globalElementColors.blue',
									cursor: 'pointer',
								}}
								onClick={() =>
									setDialogComments([...dialogComments, ''])
								}
							>
								{'+Add More'}
							</Typography>
						</Box>
					</Box>
				</DialogTitle>
				<DialogContent sx={{ flexGrow: 1 }}>
					<Box
						className={flexStyles.flexColumnSpaceBetween}
						gap={'10px'}
					>
						{dialogComments?.map((data, index) => {
							return (
								<Box
									className={flexStyles.flexColumn}
									gap={'10px'}
								>
									<Box
										className={
											flexStyles.flexRowCenterSpaceBetween
										}
									>
										<Typography
											variant={typographyConstants.body2}
											sx={{
												fontSize: '16px',
												color: 'globalElementColors.grey',
											}}
										>{`${index + 1}. Comment`}</Typography>
										{(index === 0 && data?.length > 0) ||
										dialogComments?.length > 1 ||
										index !== 0 ? (
											<CustomIcon
												name={iconConstants.close}
												style={{
													height: '20px',
													width: '20px',
													cursor: 'pointer',
												}}
												onClick={() => {
													if (
														dialogComments?.length ===
														1
													) {
														setDialogComments([''])
													} else {
														setDialogComments(
															dialogComments?.filter(
																(d, i) =>
																	i !== index,
															),
														)
													}
												}}
											/>
										) : null}
									</Box>
									<CustomTextfield
										formSx={{ width: '100%', flexGrow: 1 }}
										propSx={{ height: '70px' }}
										placeholder={
											localizationConstants.enterTheComment
										}
										value={data}
										multiline={true}
										required={true}
										onChange={(e) => {
											const value = Array.isArray(
												e.target.value,
											)
												? e.target.value?.[0]
												: e.target.value
											const commentsdata = [
												...dialogComments,
											]
											commentsdata[index] = value
											setDialogComments([...commentsdata])
										}}
									/>
								</Box>
							)
						})}
					</Box>
				</DialogContent>
				<Box
					className={
						!isEdit
							? flexStyles.flexRowFlexEnd
							: flexStyles.flexRowCenterSpaceBetween
					}
					sx={{ mb: '20px', mr: '20px', pt: '10px' }}
				>
					{isEdit && (
						<CustomIcon
							name={iconConstants.trashRed}
							style={{
								cursor: 'pointer',
								paddingLeft: '20px',
								height: '28px',
								width: '28px',
							}}
							onClick={onClickDelete}
						/>
					)}

					<Box gap={'20px'}>
						<CustomButton
							sx={{
								minWidth: '103px',
								height: '40px',
								backgroundColor: 'transparent',
								disabledRipple: true,
							}}
							typoSx={{ color: 'buttonColors.black' }}
							text={localizationConstants.cancel}
							disableElevation={true}
							onClick={onClickcancle}
						/>
						<CustomButton
							sx={{
								minWidth: '103px',
								height: '40px',
								borderRadius: '5px',
							}}
							text={
								!isEdit
									? localizationConstants.save
									: localizationConstants.update
							}
							disabled={
								!isEdit
									? dialogComments?.some(
											(data) => data?.length === 0,
										)
									: !(
											JSON.stringify(dialogComments) !==
												JSON.stringify(comments) &&
											dialogComments?.every(
												(data) => data?.length > 0,
											)
										)
							}
							onClick={() => {
								onClickSave(dialogComments)
							}}
						/>
					</Box>
				</Box>
			</Dialog>
		</div>
	)
}

export default AddCommentsComponent
