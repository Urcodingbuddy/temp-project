const { GlobalServices } = require("../global-service")

class CommonClassroomServices extends GlobalServices {
	mapClassroomDataToSchema(jsonData, returnMapping = false) {
		const mapping = {
			id: 'id',
			'Class Name': 'className',
			Section: 'section',
			'Class Hierarchy': 'classHierarchy',
			'Section Hierarchy': 'sectionHierarchy',
			'Teacher Id': 'teacherId',
		}

		const mappedData = {}

		for (const key in mapping) {
			const schemaField = mapping[key]
			const jsonValue = jsonData[key]

			if (jsonValue !== undefined) {
				mappedData[schemaField] = jsonValue
			}
		}
		if (returnMapping) return mapping
		return mappedData
	}
}

module.exports.CommonClassroomServices = CommonClassroomServices
