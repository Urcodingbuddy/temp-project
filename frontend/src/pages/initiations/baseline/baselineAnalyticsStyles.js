export const BaselineAnalyticsStyles = {
	boxGraphSx: {
		width: '48%',
		padding: '7px 10px 30px 10px ',
		borderRadius: '10px',
		border: ' 1px solid var(--shades-greys-light, #ECECEC)',
		background: 'var(--main-colors-white, #FFF)',
		height: '215px',
	},
	tableContainerSx: {
		borderBottomRightRadius: '10px',
		borderBottomLeftRadius: '10px',
		borderTopLeftRadius: '10px',
		borderTopRightRadius: '10px',
		border: '1px solid #E2E2E2',
	},
	tableHeadCell: {
		borderRight: '1px solid #E2E2E2',
		borderBottom: '1px solid var(--shades-greys-light, #ECECEC)',
		padding: '12px var(--16, 16px)',
	},
	tableBoxSx: {
		background: 'var(--main-colors-white, #FFF)',
		marginTop: '1.5rem',
		border: '1px solid var(--shades-greys-light, #ECECEC)',
		borderRadius: '10px',
		display: 'flex',
		flexDirection: 'column',
	},
	typoGeneralText: {
		margin: '0.7rem',
		fontSize: '15px',
		fontWeight: 600,
		ml: '1rem',
	},
	tableBodyCell: {
		padding: '12px var(--16, 16px)',
		borderBottom: 'none',
		borderBottom: '1px solid',
		borderColor: 'globalElementColors.grey4',
		borderRight: '1px solid ',
		borderRightColor: 'globalElementColors.grey5',
		zIndex: 1,
	},
	tableSx: (drawerWidth) => {
		return {
			height: '100%',
			display: 'flex',
			justifyContent: 'center',
			marginBottom: '1rem',
			ml: '16px',
		}
	},
	changeButtonSx: {
		minWidth: '182px',
		height: '44px',
		marginTop: '29px',
		backgroundColor: 'globalElementColors.green2',
	},
	domainGraphLegendBoxSx: {
		width: '16px',
		height: '16px',
		borderRadius: 1,
	},
	baselineClickButton: {
		height: '44px',
		minWidth: '192px',
		backgroundColor: 'transparent',
		border: '1px solid',
		borderColor: 'globalElementColors.blue',
	},
	threeStarsBoxSx: {
		width: '49%',
		mt: '0px',
		padding: '30px 20px 30px 20px',
		borderRadius: '0px',
		boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.10)',
	},
	categoryColorSx: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'left',
		mb: '15px',
	},
	studentReportTopBoXSx: {
		mt: '0px',
		height: '145px',
		p: '16px 20px 16px 20px',
	},
	studentReportCardsData: {
		fontSize: '16px',
		color: 'globalElementColors.blue',
		fontWeight: 600,
		mt: '3px',
	},

	// New styles for principal-friendly analytics
	kpiContainerSx: {
		display: 'flex',
		flexDirection: 'row',
		gap: '12px',
		flexWrap: 'wrap',
		justifyContent: 'center',
		padding: '16px 20px',
		backgroundColor: '#F8FCFF',
		borderRadius: '12px',
		marginBottom: '12px',
		border: '1px solid #E2E2E2',
	},

	kpiCardSx: {
		flex: 1,
		minWidth: '150px',
		maxWidth: '200px',
		backgroundColor: 'white',
		borderRadius: '12px',
		padding: '16px',
		boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		gap: '4px',
		border: '1px solid #E8E8E8',
	},

	chartContainerSx: {
		backgroundColor: 'white',
		borderRadius: '12px',
		padding: '20px',
		boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
		border: '1px solid #E2E2E2',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},

	sectionHeaderSx: {
		fontWeight: 600,
		fontSize: '16px',
		marginBottom: '12px',
		color: 'textColors.primary',
	},

	supportLevelLegendSx: {
		display: 'flex',
		gap: '16px',
		flexWrap: 'wrap',
		justifyContent: 'center',
		marginTop: '12px',
		padding: '8px',
	},

	legendItemSx: {
		display: 'flex',
		alignItems: 'center',
		gap: '6px',
	},

	legendColorBoxSx: {
		width: '14px',
		height: '14px',
		borderRadius: '3px',
	},

	stackedBarContainerSx: {
		backgroundColor: 'white',
		borderRadius: '12px',
		padding: '16px',
		boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
		border: '1px solid #E2E2E2',
		marginTop: '12px',
	},

	heatmapContainerSx: {
		backgroundColor: 'white',
		borderRadius: '12px',
		padding: '16px',
		boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
		border: '1px solid #E2E2E2',
		marginTop: '12px',
	},

	primaryChartsRowSx: {
		display: 'flex',
		gap: '12px',
		flexWrap: 'wrap',
		marginTop: '12px',
	},

	primaryChartItemSx: {
		flex: 1,
		minWidth: '280px',
	},
}
