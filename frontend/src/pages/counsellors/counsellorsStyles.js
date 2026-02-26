export const counsellorStyles = {
	// Page container
	// Height calculation: 100vh - 64px (Toolbar spacer) - 48px (main padding: 24px top + 24px bottom)
	pageContainerSx: {
		display: 'flex',
		flexDirection: 'column',
		height: 'calc(100vh - 112px)',
		width: '100%',
		minWidth: 0,
		maxWidth: '100%',
		overflow: 'hidden',
	},

	// Toolbar styles - compact header
	toolbarSx: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#F8FAFC',
		py: '10px',
		px: '12px',
		mb: '12px',
		borderRadius: '8px',
		flexShrink: 0,
	},

	// Search field styling
	searchFieldSx: {
		width: '280px',
		'& .MuiOutlinedInput-root': {
			height: '34px',
			borderRadius: '6px',
			backgroundColor: '#fff',
			fontSize: '13px',
			pr: '8px',
			'& fieldset': {
				borderColor: 'rgba(0,0,0,0.12)',
			},
			'&:hover fieldset': {
				borderColor: 'rgba(0,0,0,0.2)',
			},
			'&.Mui-focused fieldset': {
				borderColor: 'primary.main',
				borderWidth: '1.5px',
			},
		},
		'& .MuiInputBase-input': {
			py: '6px',
			fontSize: '13px',
			'&::placeholder': {
				fontSize: '13px',
				opacity: 0.5,
			},
		},
		'& .MuiInputAdornment-root': {
			mr: '4px',
		},
	},

	// Action buttons container
	actionButtonsSx: {
		display: 'flex',
		alignItems: 'center',
		gap: '6px',
	},

	// Filter icon button - modern styled
	filterButtonSx: {
		width: '34px',
		height: '34px',
		minWidth: '34px',
		borderRadius: '6px',
		border: '1px solid',
		borderColor: 'rgba(0,0,0,0.12)',
		backgroundColor: '#fff',
		transition: 'all 0.15s ease',
		'&:hover': {
			backgroundColor: 'rgba(0,0,0,0.04)',
			borderColor: 'rgba(0,0,0,0.2)',
		},
	},

	// Add user button - compact
	addButtonSx: {
		height: '34px',
		minWidth: 'auto',
		px: '12px',
		borderRadius: '6px',
		textTransform: 'none',
		fontWeight: 500,
		fontSize: '13px',
		boxShadow: 'none',
		'& .MuiButton-startIcon': {
			mr: '4px',
		},
		'&:hover': {
			boxShadow: 'none',
		},
	},

	// Table container - modern look
	tableContainerSx: {
		borderRadius: '12px',
		border: '1px solid',
		borderColor: 'divider',
		overflow: 'hidden',
		backgroundColor: 'background.paper',
		'& .MuiTable-root': {
			borderCollapse: 'separate',
			borderSpacing: 0,
		},
	},

	// Table wrapper with scroll
	tableWrapperSx: {
		maxHeight: 'calc(100vh - 280px)',
		overflow: 'auto',
		'&::-webkit-scrollbar': {
			width: '6px',
			height: '6px',
		},
		'&::-webkit-scrollbar-track': {
			backgroundColor: 'transparent',
		},
		'&::-webkit-scrollbar-thumb': {
			backgroundColor: 'rgba(0,0,0,0.2)',
			borderRadius: '3px',
		},
	},

	// Table header cell
	tableHeaderCellSx: {
		backgroundColor: 'grey.50',
		borderBottom: '1px solid',
		borderColor: 'divider',
		fontWeight: 600,
		fontSize: '13px',
		color: 'text.secondary',
		py: '12px',
		px: '16px',
		whiteSpace: 'nowrap',
	},

	// Table row - compact with hover
	tableRowSx: {
		cursor: 'pointer',
		transition: 'background-color 0.15s ease',
		'&:hover': {
			backgroundColor: 'action.hover',
		},
		'&:last-child td': {
			borderBottom: 'none',
		},
	},

	// Table cell - compact
	tableCellSx: {
		py: '10px',
		px: '16px',
		borderBottom: '1px solid',
		borderColor: 'divider',
		fontSize: '14px',
	},

	// Status badge styles
	statusBadgeSx: {
		display: 'inline-flex',
		alignItems: 'center',
		px: '8px',
		py: '2px',
		borderRadius: '12px',
		fontSize: '12px',
		fontWeight: 500,
	},

	statusActiveSx: {
		backgroundColor: 'success.light',
		color: 'success.dark',
	},

	statusInvitedSx: {
		backgroundColor: 'info.light',
		color: 'info.dark',
	},

	// Assign school button - compact
	assignSchoolButtonSx: {
		minWidth: '120px',
		height: '32px',
		borderRadius: '6px',
		fontSize: '12px',
		backgroundColor: 'buttonColors.yellow',
		textTransform: 'none',
	},

	// Empty state - modern
	emptyStateSx: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		py: '80px',
		gap: '16px',
	},

	emptyStateIconSx: {
		width: '80px',
		height: '80px',
		opacity: 0.6,
	},

	emptyStateTitleSx: {
		fontSize: '20px',
		fontWeight: 600,
		color: 'text.primary',
	},

	emptyStateSubtitleSx: {
		fontSize: '14px',
		fontWeight: 400,
		color: 'text.secondary',
	},

	// Footer/pagination area - compact
	footerSx: {
		position: 'fixed',
		bottom: 0,
		left: 0,
		right: 0,
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: 'background.paper',
		borderTop: '1px solid',
		borderColor: 'divider',
		px: '24px',
		py: '8px',
		zIndex: 100,
	},

	downloadLinkSx: {
		display: 'flex',
		alignItems: 'center',
		gap: '4px',
		cursor: 'pointer',
		color: 'primary.main',
		fontSize: '13px',
		fontWeight: 500,
		'&:hover': {
			textDecoration: 'underline',
		},
	},

	// Drawer styles - modern compact
	drawerSx: {
		width: '420px',
		flexShrink: 0,
		'& .MuiDrawer-paper': {
			width: '420px',
			boxSizing: 'border-box',
			borderTopLeftRadius: '16px',
			borderBottomLeftRadius: '16px',
			p: '24px',
			boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
		},
	},

	drawerSxEdit: {
		width: '420px',
		flexShrink: 0,
		'& .MuiDrawer-paper': {
			width: '420px',
			boxSizing: 'border-box',
			borderTopLeftRadius: '16px',
			borderBottomLeftRadius: '16px',
			p: '24px',
			boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
		},
	},

	// Drawer header
	drawerHeaderSx: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		pb: '16px',
		mb: '16px',
		borderBottom: '1px solid',
		borderColor: 'divider',
	},

	drawerTitleSx: {
		fontWeight: 600,
		fontSize: '18px',
		color: 'primary.main',
	},

	// Form field spacing in drawer
	formFieldSx: {
		mb: '16px',
	},

	// School box in drawer - compact
	schoolBoxSx: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		height: '44px',
		px: '12px',
		borderRadius: '8px',
		border: '1px solid',
		borderColor: 'divider',
		mb: '8px',
		backgroundColor: 'grey.50',
	},

	// Remove button in school box
	removeSchoolBtnSx: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		cursor: 'pointer',
		gap: '2px',
	},

	// Type radio styles
	typeRadioSx: {
		mt: '12px',
		backgroundColor: 'grey.50',
		borderRadius: '8px',
		p: '12px',
	},

	// Clear typography
	clearTypoSx: {
		fontWeight: 500,
		ml: '12px',
		cursor: 'pointer',
		color: 'primary.main',
		fontSize: '13px',
	},

	// Delete icon
	deleteRedSx: {
		width: '48px',
		height: '48px',
		cursor: 'pointer',
		padding: '8px',
		borderRadius: '8px',
		transition: 'background-color 0.2s',
		'&:hover': {
			backgroundColor: 'error.light',
		},
	},

	// Drawer footer - sticky bottom
	drawerFooterSx: {
		position: 'sticky',
		bottom: 0,
		pt: '16px',
		pb: '8px',
		backgroundColor: 'background.paper',
		borderTop: '1px solid',
		borderColor: 'divider',
		mt: 'auto',
	},

	// Compact button in drawer
	drawerButtonSx: {
		height: '48px',
		borderRadius: '8px',
		fontWeight: 500,
	},

	// Legacy support - keeping old names for compatibility
	noCounsellorSx: {
		fontSize: '20px',
		fontWeight: 600,
		color: 'text.primary',
	},
}
