/**
 * Common Table Styles
 * Reusable styles for tables across the application
 * Usage: import { tableStyles } from '../components/styles/tableStyles'
 */

export const tableStyles = {
	// ==========================================
	// TABLE CONTAINER
	// ==========================================
	container: {
		borderRadius: '8px',
		border: '1px solid',
		borderColor: 'rgba(0, 0, 0, 0.08)',
		overflow: 'hidden',
		backgroundColor: '#fff',
		width: '100%',
		minWidth: 0,
		maxWidth: '100%',
		minHeight: 0, // Required for flex child to shrink properly
	},

	// Scrollable wrapper
	scrollWrapper: {
		overflowX: 'auto',
		overflowY: 'auto',
		minHeight: 0, // Required for flex child to shrink and scroll properly
		'&::-webkit-scrollbar': {
			width: '6px',
			height: '6px',
		},
		'&::-webkit-scrollbar-track': {
			backgroundColor: 'transparent',
		},
		'&::-webkit-scrollbar-thumb': {
			backgroundColor: 'rgba(0,0,0,0.15)',
			borderRadius: '3px',
			'&:hover': {
				backgroundColor: 'rgba(0,0,0,0.25)',
			},
		},
	},

	// Table element
	table: {
		tableLayout: 'fixed',
		minWidth: 'max-content',
	},

	// ==========================================
	// TABLE HEADER
	// ==========================================
	header: {
		backgroundColor: '#FAFBFC',
		borderBottom: '1px solid',
		borderColor: 'rgba(0, 0, 0, 0.08)',
	},

	headerRow: {
		height: '44px',
	},

	headerCell: {
		backgroundColor: '#FAFBFC',
		borderBottom: '1px solid',
		borderRight: 'none',
		borderColor: 'rgba(0, 0, 0, 0.08)',
		py: '8px',
		px: '10px',
		fontWeight: 600,
		fontSize: '11px',
		color: '#64748B',
		textTransform: 'uppercase',
		letterSpacing: '0.3px',
		whiteSpace: 'normal',
		lineHeight: 1.3,
		verticalAlign: 'middle',
		'&:last-child': {
			borderRight: 'none',
		},
	},

	// Header with sort icon
	headerCellSortable: {
		cursor: 'pointer',
		userSelect: 'none',
		'&:hover': {
			backgroundColor: '#F1F5F9',
		},
	},

	// Sort icon button
	sortIconButton: {
		ml: '2px',
		p: '2px',
		'& svg': {
			fontSize: '14px',
			color: '#94A3B8',
		},
		'&:hover': {
			backgroundColor: 'transparent',
		},
	},

	// ==========================================
	// TABLE BODY
	// ==========================================
	bodyRow: {
		cursor: 'pointer',
		transition: 'background-color 0.1s ease',
		'&:hover': {
			backgroundColor: '#F8FAFC',
		},
		'&:last-child td': {
			borderBottom: 'none',
		},
	},

	bodyCell: {
		py: '10px',
		px: '12px',
		borderBottom: '1px solid',
		borderColor: 'rgba(0, 0, 0, 0.06)',
		fontSize: '13px',
		color: '#334155',
	},

	// Cell text styles
	cellTextPrimary: {
		fontSize: '13px',
		fontWeight: 500,
		color: '#1E293B',
	},

	cellTextSecondary: {
		fontSize: '13px',
		color: '#64748B',
	},

	cellTextMuted: {
		fontSize: '12px',
		color: '#94A3B8',
	},

	// ==========================================
	// STATUS BADGES
	// ==========================================
	statusBadge: {
		display: 'inline-flex',
		alignItems: 'center',
		px: '8px',
		py: '2px',
		borderRadius: '4px',
		fontSize: '11px',
		fontWeight: 600,
		textTransform: 'uppercase',
		letterSpacing: '0.3px',
	},

	statusActive: {
		backgroundColor: '#DCFCE7',
		color: '#166534',
	},

	statusInvited: {
		backgroundColor: '#DBEAFE',
		color: '#1E40AF',
	},

	statusInactive: {
		backgroundColor: '#FEE2E2',
		color: '#991B1B',
	},

	statusPending: {
		backgroundColor: '#FEF3C7',
		color: '#92400E',
	},

	// ==========================================
	// TYPE/CATEGORY CHIPS
	// ==========================================
	typeChip: {
		height: '22px',
		fontSize: '11px',
		fontWeight: 500,
		backgroundColor: '#F1F5F9',
		color: '#475569',
		borderRadius: '4px',
		'& .MuiChip-label': {
			px: '8px',
		},
	},

	// ==========================================
	// PAGINATION / FOOTER
	// ==========================================
	footer: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: '#FAFBFC',
		borderTop: '1px solid',
		borderColor: 'rgba(0, 0, 0, 0.08)',
		px: '16px',
		py: '10px',
		borderRadius: '0 0 8px 8px',
		marginTop: '-1px',
		flexShrink: 0,
	},

	// Pagination container
	paginationContainer: {
		display: 'flex',
		alignItems: 'center',
		gap: '16px',
	},

	// Rows per page section
	rowsPerPageSection: {
		display: 'flex',
		alignItems: 'center',
		gap: '8px',
	},

	rowsPerPageLabel: {
		fontSize: '13px',
		color: '#64748B',
		fontWeight: 400,
	},

	rowsPerPageSelect: {
		display: 'flex',
		alignItems: 'center',
		gap: '4px',
		px: '10px',
		py: '4px',
		borderRadius: '6px',
		border: '1px solid',
		borderColor: 'rgba(0, 0, 0, 0.12)',
		backgroundColor: '#fff',
		cursor: 'pointer',
		transition: 'all 0.15s ease',
		'&:hover': {
			borderColor: 'rgba(0, 0, 0, 0.24)',
			backgroundColor: '#F8FAFC',
		},
	},

	rowsPerPageValue: {
		fontSize: '13px',
		fontWeight: 500,
		color: '#334155',
	},

	// Page info section
	pageInfoSection: {
		display: 'flex',
		alignItems: 'center',
		gap: '8px',
	},

	pageInfoText: {
		fontSize: '13px',
		color: '#64748B',
	},

	// Navigation buttons
	navButton: {
		width: '32px',
		height: '32px',
		borderRadius: '6px',
		border: '1px solid',
		borderColor: 'rgba(0, 0, 0, 0.12)',
		backgroundColor: '#fff',
		'&:hover:not(:disabled)': {
			backgroundColor: '#F1F5F9',
			borderColor: 'rgba(0, 0, 0, 0.2)',
		},
		'&:disabled': {
			opacity: 0.4,
			cursor: 'not-allowed',
		},
	},

	navButtonIcon: {
		fontSize: '18px',
		color: '#64748B',
	},

	// ==========================================
	// DOWNLOAD LINK
	// ==========================================
	downloadLink: {
		display: 'flex',
		alignItems: 'center',
		gap: '6px',
		cursor: 'pointer',
		color: '#3B82F6',
		fontSize: '13px',
		fontWeight: 500,
		transition: 'color 0.15s ease',
		'&:hover': {
			color: '#2563EB',
		},
	},

	// ==========================================
	// EMPTY STATE
	// ==========================================
	emptyState: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		py: '60px',
		gap: '12px',
	},

	emptyStateIcon: {
		width: '64px',
		height: '64px',
		opacity: 0.4,
	},

	emptyStateTitle: {
		fontSize: '16px',
		fontWeight: 600,
		color: '#1E293B',
	},

	emptyStateSubtitle: {
		fontSize: '14px',
		color: '#64748B',
	},

	// ==========================================
	// ACTION BUTTONS IN TABLE
	// ==========================================
	actionButton: {
		minWidth: 'auto',
		height: '28px',
		px: '10px',
		borderRadius: '4px',
		fontSize: '12px',
		fontWeight: 500,
		textTransform: 'none',
	},

	actionButtonPrimary: {
		backgroundColor: '#3B82F6',
		color: '#fff',
		'&:hover': {
			backgroundColor: '#2563EB',
		},
	},

	actionButtonSecondary: {
		backgroundColor: '#F1F5F9',
		color: '#475569',
		'&:hover': {
			backgroundColor: '#E2E8F0',
		},
	},
}

// Styled header cell config for MUI styled() function
export const styledHeaderCellConfig = {
	backgroundColor: '#FAFBFC',
	borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
	borderRight: 'none',
	padding: '10px 12px',
	fontWeight: 600,
	fontSize: '12px',
	color: '#64748B',
	textTransform: 'uppercase',
	letterSpacing: '0.5px',
}
