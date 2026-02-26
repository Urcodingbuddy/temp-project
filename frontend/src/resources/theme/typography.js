import { colors } from './colors'

const fontFamilyK2Dreg = '"K2DReg","sans-serif"'
const fontFamilyInterreg = '"InterReg","sans-serif"'
const fontFamilyIntermed = '"InterMed","sans-serif"'
const fontFamilyInterbold = '"InterBold","sans-serif"'
const fontFamilyGlorybold = '"GloryBold","sans-serif"'

export const englishTypography = {
	typography: {
		fontFamily: fontFamilyInterreg,
		fontWeightLight: 300,
		fontWeightRegular: 400,
		fontWeightMedium: 500,
		fontWeightBold: 700,
		color: colors.black,

		h1: {
			fontFamily: fontFamilyK2Dreg,
			fontSize: '40px',
			fontWeight: 700,
			letterSpacing: '-0.05em',
			color: colors.black,
			wordBreak: 'break-word',
		},

		h2: {
			fontFamily: fontFamilyInterreg,
			fontSize: '31px',
			fontWeight: 600,
			letterSpacing: '-0.05em',
			color: colors.black,
			wordBreak: 'break-word',
		},

		h3: {
			fontFamily: fontFamilyK2Dreg,
			fontSize: '50px',
			fontWeight: 700,
			letterSpacing: '-0.05em',
			color: colors.black,
			wordBreak: 'break-word',
		},

		h4: {
			fontFamily: fontFamilyInterreg,
			fontSize: '20px',
			fontWeight: 400,
			letterSpacing: '-0.05em',
			color: colors.black,
			wordBreak: 'break-word',
		},

		h5: {
			fontFamily: fontFamilyInterreg,
			fontSize: '16px',
			fontWeight: 400,
			letterSpacing: '-0.05em',
			color: colors.black,
			wordBreak: 'break-word',
		},

		h6: {
			fontFamily: fontFamilyInterreg,
			fontSize: '12px',
			fontWeight: 400,
			letterSpacing: '-0.05em',
			color: colors.black,
			wordBreak: 'break-word',
		},

		title: {
			fontFamily: fontFamilyInterreg,
			fontSize: '16px',
			fontWeight: 400,
			letterSpacing: '-0.05em',
			color: colors.black,
			wordBreak: 'break-word',
		},

		// in figma - it is as title-bold
		body2: {
			fontFamily: fontFamilyInterbold,
			fontSize: '16px',
			fontWeight: 600,
			letterSpacing: '-0.05em',
			color: colors.black,
			wordBreak: 'break-word',
		},

		body: {
			fontFamily: fontFamilyIntermed,
			fontSize: '14px',
			fontWeight: 500,
			letterSpacing: '-0.05em',
			color: colors.black,
			wordBreak: 'break-word',
		},

		head: {
			fontFamily: fontFamilyGlorybold,
			fontSize: '39px',
			fontWeight: 600,
			letterSpacing: '-0.05em',
			color: colors.black,
			wordBreak: 'break-word',
		},
	},
}
