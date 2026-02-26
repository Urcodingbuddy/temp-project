import {
	Avatar,
	Box,
	Dialog,
	DialogActions,
	DialogContent,
	Typography,
} from '@mui/material'
import React from 'react'
import useCommonStyles from './styles'
import CustomIcon from './CustomIcon'
import { iconConstants } from '../resources/theme/iconConstants'
import { typographyConstants } from '../resources/theme/typographyConstants'
import { localizationConstants } from '../resources/theme/localizationConstants'
import CustomButton from './CustomButton'

const ImageOrPDFUpload = ({ ...props }) => {
	const {
		dialogProps,
		width,
		getRootProps,
		getInputProps,
		fileObject,
		errors,
		errorMsgs,
		note1,
		handleSave,
		previewUrl = true,
		handleCancel,
	} = props
	const flexStyles = useCommonStyles()
	const hasAnyError = errors
	const renderPreview = () => {
		if (fileObject?.fileType === 'application/pdf') {
			return (
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<CustomIcon
						name={iconConstants.ReportIcon}
						style={{ height: '25px', width: '25px' }}
					/>
				</Box>
			)
		} else {
			return (
				<Avatar
					sx={{
						'& img': {
							objectFit: 'scale-down',
						},
						height: `60px`,
						width: '60px',
						borderRadius: 0,
						backgroundColor: 'globalColors.white',
					}}
					src={fileObject?.fileUrl}
				/>
			)
		}
	}
	return (
		<Dialog
			PaperProps={{
				sx: {
					borderRadius: '20px',
					minWidth: width ?? 500,
					p: '20px',
					minHeight: '350px',
				},
			}}
			{...dialogProps}
		>
			<DialogContent sx={{ p: 0 }}>
				<Box
					className={flexStyles.flexColumnSpaceBetween}
					sx={{
						padding: '30px 20px',
						gap: '33px',
						border: '1px dotted',
						borderColor: 'globalColors.grey_200',
						borderRadius: '11px',
						minHeight: '200px',
					}}
				>
					<Box className={flexStyles.flexColumnCenter}>
						<div {...getRootProps({ className: 'dropzone' })}>
							<input
								{...getInputProps()}
								style={{
									display: 'none',
									width: '0px',
									height: '0px',
								}}
							/>
							<Box
								className={flexStyles.flexColumnCenter}
								sx={{ gap: '20px' }}
							>
								<CustomIcon
									name={iconConstants.uploadYellow}
									style={{
										height: '60px',
										width: '60px',
										cursor: 'pointer',
									}}
								/>

								<Typography
									variant={typographyConstants.h5}
									sx={{
										mt: '8px',
										color: 'globalElementColors.richBlack',
										fontSize: '18px',
										fontWeight: 500,
										lineHeight: '22.96px',
										textDecoration: 'underline',
										cursor: 'pointer',
									}}
								>
									{localizationConstants.browseTheFile}
								</Typography>
							</Box>
						</div>
						{fileObject?.fileName && (
							<Box
								className={flexStyles.flexCenter}
								sx={{ gap: '10px', mt: '20px' }}
							>
								{previewUrl && renderPreview()}

								<Typography
									variant={typographyConstants.body}
									sx={{
										color: 'globalElementColors.grey_300',
										display: '-webkit-box',
										overflow: 'hidden',
										WebkitBoxOrient: 'vertical',
										WebkitLineClamp: 2,
										wordBreak: 'break-all',
									}}
								>
									{fileObject.fileName}
								</Typography>
							</Box>
						)}

						{hasAnyError && (
							<Box
								className={flexStyles.flexCenter}
								sx={{ gap: '10px', mt: '10px' }}
							>
								<CustomIcon
									name={iconConstants.alertCircle}
									style={{ height: '24px', width: '24px' }}
									svgStyle='height: 24px; width: 24px;'
								/>
								<Typography
									variant={typographyConstants.body}
									sx={{ color: 'globalElementColors.red' }}
								>
									{errorMsgs}
								</Typography>
							</Box>
						)}
					</Box>
					<Typography
						variant={typographyConstants.body}
						sx={{
							textAlign: 'center',
							color: 'globalElementColors.grey',
							fontSize: '17px',
						}}
					>
						{note1}
					</Typography>
				</Box>
			</DialogContent>
			<DialogActions>
				<Box
					className={flexStyles.flexCenter}
					sx={{
						p: '10px',
						width: '100%',
						gap: '10px',
					}}
				>
					<CustomButton
						text={localizationConstants.cancel}
						typoSx={{ color: 'textColors.black' }}
						sx={{
							minWidth: '192px',
							height: '40px',
							backgroundColor: 'transparent',
							border: '1px solid',
							borderColor: 'globalElementColors.blue',
						}}
						onClick={handleCancel}
					/>

					<CustomButton
						text={localizationConstants.upload}
						sx={{ minWidth: '202px', height: '40px' }}
						onClick={() => handleSave()}
						disabled={!fileObject.file}
					/>
				</Box>
			</DialogActions>
		</Dialog>
	)
}
export default ImageOrPDFUpload
