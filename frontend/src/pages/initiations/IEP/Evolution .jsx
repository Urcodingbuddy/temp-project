import { Box } from '@mui/system'
import { evolution } from './iEPConstants'
import { IconButton, Popover, Typography } from '@mui/material'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import AddCommentsComponent from '../../../components/AddCommentsComponent'
import { useEffect, useState } from 'react'
import CustomIcon from '../../../components/CustomIcon'
import { iconConstants } from '../../../resources/theme/iconConstants'
import ImageOrPDFUploadFile from '../../../components/ImageOrPDFUploadFile'
import useCommonStyles from '../../../components/styles'
import ViewPDFDialog from '../../../components/ViewPDFDialog'
import CustomAutocompleteNew from '../../../components/commonComponents/CustomAutoComplete'

const Evolution = ({ data, onChange, setComments, readOnly }) => {
	const flexStyles = useCommonStyles()
	const [modal, setModal] = useState(false)
	const [addCommentsDialog, setAddCommentsDialog] = useState(false)
	const [editCommentsDialog, setEditCommentsDialog] = useState(false)
	const [fileObject, setFileObject] = useState({
		file: '',
		fileName: '',
		fileUrl: '',
		fileType: '',
	})
	const [uploadFileOpen, setUploadFileOpen] = useState(false)
	const [anchorElPopover, setAnchorElPopover] = useState(null)
	const [viewCircularDialog, setViewCircularDialog] = useState(false)
	const openActionPopover = Boolean(anchorElPopover)
	const handleActionClose = () => {
		setAnchorElPopover(null)
	}
	const RowActions = () => {
		return (
			<>
				<Box
					className={flexStyles.flexColumnCenterStart}
					sx={{
						p: '10px 20px 10px 20px',
						height: '96px',
						backgroundColor: 'transparent',
					}}
				>
					<IconButton
						sx={{
							height: '40px',
							pointer: 'cursor',
							'&:hover': {
								backgroundColor: 'transparent',
							},
						}}
						aria-label='edit'
						onClick={() => {
							setUploadFileOpen(true)
						}}
					>
						<CustomIcon
							name={iconConstants.replaceBlue}
							style={{
								width: '24px',
								height: '24px',
							}}
						/>
						<Typography
							variant={typographyConstants.body}
							sx={{
								pl: '10px',
								fontSize: '15px',
								fontWeight: 500,
								lineHeight: '16.8px',
							}}
						>
							{localizationConstants.replaceReport}
						</Typography>
					</IconButton>
					<IconButton
						sx={{
							height: '38px',
							pointer: 'cursor',
							'&:hover': {
								backgroundColor: 'transparent',
							},
						}}
						aria-label='delete'
						onClick={() => {
							onChange({
								...data,
								[localizationConstants.reportLink]: {
									file: '',
									fileName: '',
									fileUrl: '',
									fileType: '',
								},
							})
							setFileObject({
								file: '',
								fileName: '',
								fileUrl: '',
								fileType: '',
							})
							handleActionClose()
						}}
					>
						<CustomIcon
							name={iconConstants.trashRed}
							style={{
								width: '20px',
								height: '20px',
							}}
						/>
						<Typography
							variant={typographyConstants.body}
							sx={{
								pl: '14px',
								pt: '5px',
								color: 'globalElementColors.alert1',
								fontSize: '15px',
								fontWeight: 500,
								lineHeight: '16.8px',
							}}
						>
							{localizationConstants.deleteReport}
						</Typography>
					</IconButton>
				</Box>
			</>
		)
	}
	useEffect(() => {
		setFileObject(data?.[localizationConstants.reportLink])
	}, [data])
	return (
		<Box
			sx={{
				border: '1px solid',
				color: 'globalElementColors.lightBlue',
				borderRadius: '10px',
			}}
		>
			{evolution(data, modal).map((category, index) => (
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						width: '100%',
						minHeight: index === 0 ? '50px' : '70px',
						borderBottom: index === 5 ? 'none' : '1px solid',
						color: 'globalElementColors.lightBlue',
						backgroundColor: index === 0 ? '#F8FCFF' : 'none',
						borderTopLeftRadius: index === 0 ? '10px' : 'none',
						borderTopRightRadius: index === 0 ? '10px' : 'none',
					}}
					gap={'5px'}
				>
					<Box
						className={flexStyles.flexRowAlignCenter}
						sx={{ width: '85%' }}
					>
						<Box
							sx={{
								width: '15%',
								alignItems: 'center',
								justifyContent: 'center',
								p: '10px',
							}}
						>
							{category?.requirement ===
							localizationConstants.requirement ? (
								<Typography
									variant={typographyConstants.title}
									sx={{
										color: category?.color,
										fontSize: '16px',
										fontWeight: 500,
									}}
								>
									{category?.requirement}
								</Typography>
							) : (
								<Box>
									<CustomAutocompleteNew
										sx={{ width: '100%' }}
										fieldSx={{
											width: '100%',
											height: '44px',
											marginTop: '3px',
										}}
										options={['Yes', 'No']}
										placeholder={`${localizationConstants.select}`}
										value={category?.requirement}
										onChange={(e) => {
											let value = Array.isArray(e)
												? e?.[0]
												: e
											if (
												value == null ||
												value[0] == null
											) {
												value = 'No'
											}
											if (
												JSON.stringify(value) !==
												JSON.stringify(
													category?.requirement,
												)
											) {
												if (value === 'No') {
													onChange({
														...data,
														[localizationConstants.requirement]:
															value,
														[localizationConstants.availability]:
															'No',
														[localizationConstants.comments]:
															[],
														[localizationConstants.reportLink]:
															{
																file: '',
																fileName: '',
																fileUrl: '',
																fileType: '',
															},
													})
												} else {
													onChange({
														...data,
														[localizationConstants.requirement]:
															value,
													})
												}
											}
										}}
										disabled={readOnly}
									/>
								</Box>
							)}
						</Box>

						<Box
							sx={{
								width: '15%',
								p: '10px 20px',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							{category?.diagnosis ===
							localizationConstants.diagnosis ? (
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
								<Box>
									<CustomAutocompleteNew
										fieldSx={{
											width: '100%',
											height: '44px',
											marginTop: '3px',
										}}
										options={['Yes', 'No']}
										sx={{ width: '125px' }}
										placeholder={`${localizationConstants.select}`}
										value={category?.availability}
										onChange={(e) => {
											let value = Array.isArray(e)
												? e?.[0]
												: e

											if (value == null) {
												value = 'No'
											}
											if (
												JSON.stringify(value) !==
												JSON.stringify(
													category?.availability,
												)
											) {
												onChange({
													...data,
													[localizationConstants.availability]:
														value,
												})
											}
										}}
										disabled={
											category?.requirement?.[0] ===
												'No' || readOnly
										}
									/>
								</Box>
							)}
						</Box>

						<Box
							sx={{
								display: 'flex',
								flexGrow: 1,
								flexDirection: 'column',
								p: '10px 40px 10px 20px',
							}}
							gap={'5px'}
						>
							{(Array.isArray(category?.diagnosis)
								? category?.diagnosis?.[0]
								: category?.diagnosis
							)?.length > 0 ? (
								Array.isArray(category?.diagnosis) ? (
									<>
										{category?.diagnosis
											.slice(
												0,
												category?.showMore
													? category?.diagnosis
															?.length
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
													{category?.diagnosis
														?.length -
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
												onClick={() => setModal(!modal)}
											>
												{category?.diagnosis?.length ===
												1
													? ''
													: category?.showMore
														? localizationConstants.viewless
														: localizationConstants.viewMore}
											</Typography>
											{!readOnly ? (
												<CustomIcon
													name={iconConstants.Edit}
													style={{
														cursor: 'pointer',
													}}
													onClick={() => {
														setEditCommentsDialog(
															true,
														)
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
										{category?.diagnosis}
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
										if (
											!(
												category?.requirement?.[0] ===
													'No' || readOnly
											)
										) {
											setAddCommentsDialog(true)
										}
									}}
								>
									<CustomIcon
										name={
											category?.requirement?.[0] ===
												'No' || readOnly
												? iconConstants.circlePlusGrey
												: iconConstants.addCircleBlue
										}
										style={{
											height: '20px',
											width: '20px',
										}}
									/>
									<Typography
										sx={{
											color:
												category?.requirement?.[0] ===
													'No' || readOnly
													? 'globalElementColors.grey1'
													: 'globalElementColors.blue',
											fontWeight: 600,
											fontSize: '14px',
											ml: '3px',
										}}
									>
										{localizationConstants.addComments}
									</Typography>
									{!(
										category?.requirement?.[0] === 'No' ||
										readOnly
									) ? (
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

					<Box
						sx={{
							width: '15%',
							pl: '10px',
							alignItems: 'center',
							justifyContent: 'flex-start',
							display: 'flex',
						}}
					>
						{category?.reportLink ===
						localizationConstants.reportLink ? (
							<Typography
								variant={typographyConstants.title}
								sx={{
									color: category?.color,
									fontSize: '16px',
									fontWeight: 500,
									whiteSpace: 'nowrap',
								}}
							>
								{category?.reportLink}
							</Typography>
						) : (
							<>
								{(category?.reportLink?.fileUrl?.length === 0 ||
									!category?.reportLink?.fileUrl) &&
								!readOnly &&
								category?.requirement?.[0] !== 'No' ? (
									<Box
										className={flexStyles.flexRowCenter}
										gap={'10px'}
										sx={{ cursor: 'pointer' }}
										onClick={() => setUploadFileOpen(true)}
									>
										<CustomIcon
											name={iconConstants.uploadBlue}
											style={{
												cursor: 'pointer',
												width: '18px',
												height: '18px',
											}}
											svgStyle={
												'width: 18px; height: 18px'
											}
										/>
										<Typography
											variant={typographyConstants.body2}
											sx={{
												color: 'globalElementColors.blue',
												whiteSpace: 'nowrap',
												fontSize: '15px',
												letterSpacing: '0.1px',
												fontWeight: 600,
											}}
										>
											{localizationConstants.uploadReport}
										</Typography>
									</Box>
								) : category?.reportLink?.fileUrl?.length >
								  0 ? (
									<Box
										className={flexStyles.flexRowCenter}
										gap={'10px'}
										sx={{ cursor: 'pointer' }}
									>
										<CustomIcon
											name={iconConstants.ReportIcon}
											style={{
												cursor: 'pointer',
												width: '18px',
												height: '18px',
											}}
											svgStyle={
												'width: 18px; height: 18px'
											}
											onClick={() => {
												setViewCircularDialog(true)
											}}
										/>
										<Typography
											variant={typographyConstants.body2}
											sx={{
												color: 'globalElementColors.blue',
												whiteSpace: 'nowrap',
												fontSize: '15px',
												letterSpacing: '0.1px',
												fontWeight: 600,
											}}
											onClick={() => {
												setViewCircularDialog(true)
											}}
										>
											{localizationConstants.view}
										</Typography>
										<CustomIcon
											name={
												readOnly
													? iconConstants.menuGrey
													: iconConstants.menuBlue
											}
											style={{
												cursor: 'pointer',
												width: '24px',
												height: '24px',
												paddingLeft: '20px',
											}}
											svgStyle={
												'width: 24px; height: 24px'
											}
											onClick={(e) => {
												if (!readOnly) {
													e.stopPropagation()
													setAnchorElPopover(
														e.currentTarget,
													)
												}
											}}
										/>
									</Box>
								) : null}
							</>
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
				comments={data?.[localizationConstants.comments]}
				isEdit={editCommentsDialog}
				onClickDelete={() => {
					setComments([])
					setAddCommentsDialog(false)
					setEditCommentsDialog(false)
				}}
				onClickSave={(data) => {
					setComments(data)
					setAddCommentsDialog(false)
					setEditCommentsDialog(false)
				}}
				onClickcancle={() => {
					setAddCommentsDialog(false)
					setEditCommentsDialog(false)
				}}
			/>
			<ImageOrPDFUploadFile
				uiProps={{
					dialogProps: { open: uploadFileOpen },
					handleDialogClose: () => {
						setUploadFileOpen(false)
					},
				}}
				setOutputFileObject={setFileObject}
				outputFileObject={fileObject}
				handleUpload={(fileObjec) => {
					handleActionClose()
					onChange({
						...data,
						[localizationConstants.reportLink]: fileObjec,
					})
				}}
			/>
			<Popover
				open={openActionPopover}
				anchorEl={anchorElPopover}
				onClose={handleActionClose}
				onMouseLeave={handleActionClose}
				sx={{
					'& .MuiPopover-paper': {
						margin: '0px 0px 0px -10px',
						borderRadius: '10px',
						boxShadow: 'var(---shadow-5)',
					},
				}}
				anchorOrigin={{
					vertical: 'center',
					horizontal: 'left',
				}}
				transformOrigin={{
					vertical: 'center',
					horizontal: 'right',
				}}
			>
				<RowActions />
			</Popover>

			<ViewPDFDialog
				open={viewCircularDialog}
				onClose={() => {
					setViewCircularDialog(false)
				}}
				pdfUrl={fileObject?.fileUrl}
				title={localizationConstants.evaluationReport}
			/>
		</Box>
	)
}

export default Evolution
