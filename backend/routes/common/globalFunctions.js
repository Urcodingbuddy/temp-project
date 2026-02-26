async function fetchTheLatestConfigFromDatabase() {
	const loadGlobalStaticConfig = require('../../startup/globalConstants')
	const globalData = await loadGlobalStaticConfig()
	global.globalConstants = globalData.globalConstants
	global.miscellaneous = globalData.miscellaneous
}

module.exports = { fetchTheLatestConfigFromDatabase }
