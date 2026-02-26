import { createTheme } from '@mui/material'
import { colors } from './colors'

const { palette } = createTheme()

export const light = {
	palette: {
		mode: 'light',

		myPeeguBackground: palette.augmentColor({
			color: { main: colors.white },
		}),

		globalElementColors: palette.augmentColor({
			color: {
				main: colors.black,
				blue: colors.blue,
				blue2: colors.blue2,
				white: colors.white,
				white2: colors.white2,
				grey: colors.grey,
				grey1: colors.grey1,
				red: colors.red,
				grey3: colors.grey3,
				grey4: colors.grey4,
				black: colors.black,
				black2: colors.black2,
				canvas1: colors.canvas1,
				lightBlue: colors.lightBlue,
				orange: colors.orange,
				disabledButtonBackground: colors.grey1,
				green: colors.green,
				red2: colors.red2,
				purple: colors.purple,
				blue3: colors.blue3,
				blue4: colors.blue4,
				yellow: colors.yellow,
				lightBlue2: colors.lightBlue2,
				green2: colors.green2,
				darkBlue: colors.darkBlue,
				borderBlue: colors.borderBlue,
				borderRed: colors.borderRed,
				grey5: colors.grey5,
				borderGrey: colors.borderGrey,
				disabledGrey: colors.disabledGrey,
				yellow2: colors.yellow2,
				lightYellow: colors.lightYellow,
				lightRed: colors.lightRed,
				lightGreen: colors.lightGreen,
				borderGrey2: colors.borderGrey2,
				greenLight: colors.greenLight,
				grey6: colors.grey6,
				grey7: colors.grey7,
				yellow3: colors.yellow3,
				blue5: colors.blue5,
				ceruleanBlue: colors.ceruleanBlue,
				richBlack: colors.richBlack,
			},
		}),

		textColors: palette.augmentColor({
			color: {
				main: colors.black,
				blue: colors.blue,
				blue2: colors.blue2,
				white: colors.white,
				white2: colors.white2,
				grey: colors.grey,
				grey1: colors.grey1,
				red: colors.red,
				black2: colors.black2,
				black: colors.black,
				lightBlue: colors.lightBlue,
				green2: colors.green2,
				darkBlue: colors.darkBlue,
				yellow2: colors.yellow2,
			},
		}),

		buttonColors: palette.augmentColor({
			color: {
				main: colors.black,
				disabledButtonBackground: colors.grey1,
				blue: colors.blue,
				white: colors.white,
				lightBlue: colors.lightBlue,
				orange: colors.orange,
				yellow: colors.yellow,
				black: colors.black,
			},
		}),

		inputFieldColors: palette.augmentColor({
			color: {
				main: colors.black,
				background1: colors.white,
				borderFocus1: colors.grey3,
				border1: colors.grey3,
				grey5: colors.grey5,
			},
		}),
		cardColors: palette.augmentColor({
			color: {
				main: colors.green,
				green: colors.green,
				red2: colors.red2,
				purple: colors.purple,
				blue3: colors.blue3,
				blue4: colors.blue4,
			},
		}),
		tableHeaderColors: palette.augmentColor({
			color: {
				main: colors.black,
				lightBlue2: colors.lightBlue2,
				black: colors.black,
			},
		}),
		backgroundColors: palette.augmentColor({
			color: {
				main: colors.black,
				lightBlue: colors.lightBlue,
			},
		}),
	},
}

export const dark = {
	palette: {
		mode: 'dark',
	},
}
