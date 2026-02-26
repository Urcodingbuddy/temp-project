const mongoose = require('mongoose')
const { ObservationRecord } = require('../../models/database/myPeegu-observation')
const { IndividualRecord } = require('../../models/database/myPeegu-individual')
const { BaselineRecord } = require('../../models/database/myPeegu-baseline')
const { EducationPlanner } = require('../../models/database/myPeegu-studentPlanner')
const { StudentCheckList } = require('../../models/database/myPeegu-sendCheckList')
const { COPEAssessment } = require('../../models/database/myPeegu-studentCOPEAssessment')
const { WellBeingAssessment } = require('../../models/database/myPeegu-StudentWellBeing')
const { MONGODB_URI } = require('./migrations-utils')
function buildComboKey(studentId, classRoomId, academicYear) {
	if (!studentId || !classRoomId || !academicYear) return null

	const sid =
		typeof studentId === 'object' && studentId.toString
			? studentId.toString()
			: String(studentId)
	const cid =
		typeof classRoomId === 'object' && classRoomId.toString
			? classRoomId.toString()
			: String(classRoomId)
	const ayid =
		typeof academicYear === 'object' && academicYear.toString
			? academicYear.toString()
			: String(academicYear)

	return `${sid}_${cid}_${ayid}`
}

async function addComboKey(collection, collectionName) {
	console.log(`🔧 Processing ${collectionName}...`)
	const records = await collection.find({}).lean()
	const bulkOps = []
	for (const record of records) {
		const comboKey = buildComboKey(record.studentId, record.classRoomId, record.academicYear)
		if (!comboKey) continue

		bulkOps.push({
			updateOne: {
				filter: { _id: record._id },
				update: { $set: { comboKey } },
			},
		})
	}

	if (bulkOps.length > 0) {
		const result = await collection.bulkWrite(bulkOps)
		console.log(`✅ ${collectionName}: Updated ${result.modifiedCount} documents`)
	} else {
		console.log(`⚠️  ${collectionName}: No valid records found to update`)
	}
}

async function runMigration() {
	try {
		console.log('🚀 Connecting to MongoDB...')
		await mongoose.connect(MONGODB_URI)
		console.log('✅ Connected')

		await addComboKey(ObservationRecord, 'ObservationRecord')
		await addComboKey(IndividualRecord, 'IndividualRecord')
		await addComboKey(BaselineRecord, 'BaselineRecord')
		await addComboKey(EducationPlanner, 'EducationPlanner')
		await addComboKey(StudentCheckList, 'StudentCheckList')
		await addComboKey(COPEAssessment, 'COPEAssessment')
		await addComboKey(WellBeingAssessment, 'WellBeingAssessment')

		await mongoose.disconnect()
		console.log('🏁 Migration completed')
	} catch (err) {
		console.error('❌ Migration failed:', err)
		process.exit(1)
	}
}

runMigration()
