const { Countries } = require('../../../models/database/countries')
const { States } = require('../../../models/database/states')

class RegionsService {
	async fetchCountries() {
		return await Countries.find()
	}

	async fetchStates(countryId) {
		return await States.find({ country: countryId })
	}
}

const regionService = new RegionsService()
module.exports = regionService
