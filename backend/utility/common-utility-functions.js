function buildComboKey(studentId, classRoomId, academicYear) {
	// console.log(`${studentId}, ${classRoomId}, ${academicYear}`)
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

module.exports.buildComboKey = buildComboKey
