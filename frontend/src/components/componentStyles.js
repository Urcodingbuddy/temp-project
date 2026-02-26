const collapseHeader = {
	display: 'flex',
	padding: '20px 10px',
	gap: '8px',
	cursor: 'pointer',
	justifyContent: 'space-between',
	backgroundColor: 'globalElementColors.lightBlue',
}
export const customCollapseComponentSx = {
	headerStyleTrue: {
		...collapseHeader,
		alignItems: 'center',
		borderRadius: '8px 8px 0px 0px',
	},
	headerStyleFalse: {
		...collapseHeader,
		borderRadius: '8px',
	},
	containerSx: {
		padding: 0,
		borderRadius: '8px',
		border: '1px solid',
		borderColor: 'globalElementColors.grey5',
	},
	smplHeaderSx: {
		display: 'flex',
		padding: '10px',
		gap: '8px',
		cursor: 'pointer',
		justifyContent: 'space-between',
		backgroundColor: 'globalElementColors.lightBlue',
		borderRadius: '5px',
		mb: '',
	},
	smplContainerSx: {
		padding: 0,
		borderRadius: '3px',
		// border: '1px solid',
		// borderColor: 'globalElementColors.grey5',
	},
}

export const CustomDropdownStyles = {
	studentInitiationsStatus: (borderColor) => ({
		borderRadius: '40px',
		border: '1px solid',
		borderColor,
		background: 'globalElementColors.white',
		padding: '6px',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		cursor: 'pointer',
		flexShrink: 0,
	}),
	statusDot: (backgroundColor) => ({
		width: '14px',
		height: '14px',
		backgroundColor,
		borderRadius: '50%',
		marginRight: '4px',
	}),
	popoverSx: (width) => ({
		width: width ? width : '270px',
		padding: '10px',
		borderRadius: '8px',
		gap: '10px',
	}),
}

export const userStyles = {
	statusInvitedBox: {
		height: '28px',
		width: '157px',
		backgroundColor: 'tableBodyColors.background',
		border: '1px solid',
		borderColor: 'tableBodyColors.statusBorder',
		borderTopLeftRadius: '3px',
		borderTopRightRadius: '3px',
		borderBottom: 0,
	},

	statusInvitedButton: {
		height: '30px',
		border: '1px solid',
		borderTop: 0,
		borderColor: 'tableBodyColors.statusBorder',
		width: '157px',
		borderRadius: '0px',
		borderBottomLeftRadius: '3px',
		borderBottomRightRadius: '3px',
		p: '5px',
		backgroundColor: 'tableBodyColors.statusInvited',
	},

	statusActiveInactiveBox: {
		border: '1.5px solid',
		borderRadius: '3px',
		borderColor: 'tableBodyColors.statusBorder',
		height: '28px',
		width: '157px',
		alignSelf: 'center',
		backgroundColor: 'tableBodyColors.background',
	},

	noDataBox: {
		width: '100%',
		backgroundColor: 'transparent',
		height: `calc(100vh - 315px)`,
	},

	rowsPerPageBox: {
		height: '37px',
		minWidth: '60px',
		border: '1px solid',
		borderColor: 'textColors.text1',
		p: '10px',
		backgroundColor: 'globalElementColors.white',
		gap: '10px',
		borderRadius: '8px',
		cursor: 'pointer',
	},

	manageStatusBox: {
		height: '58px',
		p: '12px 9px',
		border: '1px solid',
		borderColor: 'textColors.text2',
		borderRadius: '6px',
	},

	editCreateTitleBox: {
		backgroundColor: 'globalElementColors.canvas2',
		height: '62px',
		p: '20px 10px 10px 10px',
	},

	editCreateContentBox: {
		p: '20px',
		flexGrow: 1,
		overflow: 'auto',
		gap: '10px',
	},

	usersHeaderBox: {
		width: 'calc(100vw - 320px)',
		minWidth: '570px',
		overflow: 'auto',
		p: '20px',
		backgroundColor: 'globalElementColors.white',
		borderRadius: '10px',
		gap: '10px',
	},

	usersFilterBox: {
		p: '10px 20px',
		border: '0.5px solid',
		borderRadius: '22px',
		borderColor: 'globalElementColors.gray1',
		height: '46px',
		minWidth: '150px',
		cursor: 'pointer',
		gap: '5px',
	},
}
