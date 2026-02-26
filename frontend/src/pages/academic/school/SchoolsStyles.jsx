const schoolStatus = (borderColor) => ({
	borderRadius: '40px',
	border: '1px solid',
	borderColor,
	background: 'globalElementColors.white',
	width: '122px',
	padding: '8px',
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
	cursor: 'pointer',
	flexShrink: 0,
})

const statusDot = (backgroundColor) => ({
	width: '7px',
	height: '7px',
	backgroundColor,
	borderRadius: '7px',
	marginRight: '4px',
})

const dropDown = {
	height: '48px',
	padding: '9px 10px',
	marginRight: '5px',
	borderRadius: '6px',
	border: '1px solid',
}

const datePicker = {
	height: '49px',
	width: '190px',
	padding: '9px 10px',
	borderRadius: '6px',
	border: '1px solid',
}

export const SchoolsStyles = {
	// Page container - modern compact
	pageContainerSx: {
		display: 'flex',
		flexDirection: 'column',
		height: 'calc(100vh - 120px)',
		width: '100%',
		overflow: 'hidden',
		gap: '12px',
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
		width: '320px',
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

	// Add button - compact
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

	noSchoolsSx: {
		mt: '26px',
		fontFamily: '"InterMed", "sans-serif"',
		fontSize: '25px',
		fontWeight: '500',
	},
	activeSchool: {
		...schoolStatus('globalElementColors.borderBlue'),
	},
	inActiveSchool: {
		...schoolStatus('globalElementColors.borderRed'),
	},
	needImprovementSchool: {
		...schoolStatus('globalElementColors.yellow'),
	},
	presentSchool: {
		...schoolStatus('globalElementColors.green'),
	},
	notPresentSchool: {
		...schoolStatus('globalElementColors.red'),
	},
	activeDot: {
		...statusDot('globalElementColors.blue'),
	},
	inActiveDot: {
		...statusDot('globalElementColors.red'),
	},
	needImprovementDot: {
		...statusDot('globalElementColors.yellow'),
	},
	presentDot: {
		...statusDot('globalElementColors.green'),
	},
	notPresentDot: {
		...statusDot('globalElementColors.red'),
	},
	activeInactiveListItem: function (status) {
		const style = {
			cursor: 'pointer',
		}
		if (status) style.backgroundColor = 'globalElementColors.lightBlue'
		return style
	},
	statusPopper: {
		width: '122px',
		padding: '10px',
		borderRadius: '8px',
		gap: '10px',
	},
	eclipseSx: {
		fontSize: '13px',
		fontWeight: 500,
		color: 'rgba(255, 255, 255, 0.9)',
		letterSpacing: '0.3px',
	},
	numberSX: {
		fontSize: '28px',
		fontWeight: 700,
		color: '#FFFFFF',
		mt: '4px',
		lineHeight: 1.2,
	},
	cardMainSx: {
		width: '100%',
		height: 'auto',
		backgroundColor: 'cardColors.blue4',
		borderRadius: '10px',
		display: 'flex',
	},
	cardSx: {
		width: '100%',
		height: '88px',
		borderRadius: '10px',
		boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
		transition: 'all 0.2s ease',
		'&:hover': {
			transform: 'translateY(-2px)',
			boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
		},
	},
	establishedYearDropdown: {
		...dropDown,
		borderColor: 'globalElementColors.borderGrey',
		color: 'globalElementColors.borderGrey',
		background: 'globalElementColors.white',
		cursor: 'pinter',
	},
	establishedYearDropdownDisabled: {
		...dropDown,
		borderColor: 'globalElementColors.disabledGrey',
		color: 'globalElementColors.disabledGrey',
		background: 'globalElementColors.white',
		cursor: 'pinter',
		pointerEvents: 'none',
	},
	datePicker: {
		...datePicker,
		borderColor: 'globalElementColors.borderGrey',
		color: 'globalElementColors.borderGrey',
		background: 'globalElementColors.white',
		cursor: 'pinter',
	},
	datePickerDisabled: {
		...datePicker,
		borderColor: '#CDCDCD',
		color: 'globalElementColors.gery8',
		background: 'globalElementColors.white',
		cursor: 'pinter',
		pointerEvents: 'none',
	},
	datePickerError: {
		...datePicker,
		borderColor: 'globalElementColors.red',
		color: 'globalElementColors.borderGrey',
		background: 'globalElementColors.white',
		cursor: 'pinter',
	},
	drawerSx: {
		width: '464px',
		flexShrink: 0,
		'& .MuiDrawer-paper': {
			width: '464px',
			boxSizing: 'border-box',
			borderTopLeftRadius: '20px',
			borderBottomLeftRadius: '20px',
			p: '0 36px 0 24px',
		},
	},
	drawerTopSticky: {
		position: 'sticky',
		top: 0,
		paddingBottom: '12px',
		paddingTop: '36px',
		zIndex: 1,
		backgroundColor: 'globalElementColors.white',
	},
	drawerBottomSticky: {
		position: 'sticky',
		bottom: 0,
		paddingBottom: '36px',
		paddingTop: '12px',
		zIndex: 1,
		backgroundColor: 'globalElementColors.white',
	},
	excelTypography: {
		mt: '15px',
		cursor: 'pointer',
		textDecoration: 'underline',
	},
}
