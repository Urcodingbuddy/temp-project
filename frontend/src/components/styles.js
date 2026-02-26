import { makeStyles } from '@mui/styles'

export const redBorderForCustomSelect = (isError) => {
	if (isError) {
		return {
			'& .MuiOutlinedInput-notchedOutline': {
				border: '1px solid',
				borderColor: 'globalElementColors.red',
			},
		}
	}
	return {}
}

export const redBorderForCustomTextField = (isError) => {
	return isError ? { borderColor: 'globalElementColors.red' } : {}
}

const useCommonStyles = makeStyles((theme) => ({
	flexColumnCenter: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},
	flexColumnJustifyContentCenter: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
	flexCenter: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},

	flexRowCenter: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},

	flexColumn: {
		display: 'flex',
		flexDirection: 'column',
	},

	flexRowCenterSpaceBetween: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},

	flexRowAlignCenter: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	flexColumnCenterCenter: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
	flexColumnCenterStart: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'flex-start',
	},
	flexRowJustifyEnd: {
		display: 'flex',
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	flexRowAlighnItemsCenter: {
		display: 'flex',
		alignItems: 'center',
	},
	flexSpaceBetween: {
		display: 'flex',
		justifyContent: 'space-between',
	},
	flexColumnSpaceBetween: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
	},
	flexRowFlexEnd: {
		display: 'flex',
		justifyContent: 'flex-end',
	},
	flexAlignCenter: {
		display: 'flex',
		alignItems: 'center',
	},
	bottomDiv: {
		position: 'fixed',
		display: 'flex',
		justifyContent: 'space-between',
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: '#fff',
		zIndex: 1000,
		padding: '0px 12px',
	},
}))

export default useCommonStyles
