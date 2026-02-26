const logoutSaveBtn = {
	width: '100%',
	height: '40px',
	borderRadius: '8px',
	fontSize: '14px',
	fontWeight: 500,
	textTransform: 'none',
	boxShadow: 'none',
	'&:hover': {
		boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
	},
}
export const profileSx = {
	userRoleText: {
		fontWeight: 400,
		wordBreak: 'break-word',
		display: '-webkit-box',
		overflow: 'hidden',
		WebkitBoxOrient: 'vertical',
		WebkitLineClamp: 1,
		maxWidth: '180px',
	},
	logoutBtn: {
		...logoutSaveBtn,
		backgroundColor: '#EF4444',
		color: 'white',
		'&:hover': {
			backgroundColor: '#DC2626',
			boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
		},
	},
	saveBtn: {
		...logoutSaveBtn,
		backgroundColor: '#3B82F6',
		color: 'white',
		'&:hover': {
			backgroundColor: '#2563EB',
			boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
		},
	},
}
