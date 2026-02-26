export const hexaCodes = {
	blue: '#025ABD',
	red: '#DD2A2B',
	yellow: '#E7C516',
	green: '#25C548',
	orange: '#F5890D',
	grey5: '#E2E2E2',
	crimson: '#DD2A2B',
	dodgerBlue: '#1FA5CF',
	blue1: '#0267D9',
	yellow1: '#F8A70D',
	black2: '#01234A',
	white: '#FFFFFF',
}

export const getHaxCodeByColorName = (colorName) => {
	let color = 'FFFFFF'
	if (hexaCodes[colorName]) {
		color = hexaCodes[colorName].slice(1)
	}
	return color
}
