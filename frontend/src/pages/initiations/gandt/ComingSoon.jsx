import React from 'react'
import { getUserFromLocalStorage } from '../../../utils/utils'
import { userRoles } from '../../../utils/globalConstants'
import GandTMain from '../../gandt/GandTMain'
import GandTCounselorPage from './GandTCounselorPage'

const GandT = () => {
	const user = getUserFromLocalStorage()

	// Check if user is a counselor (not super admin)
	const isCounselor =
		user?.permissions?.includes(userRoles.peeguCounselor) ||
		user?.permissions?.includes(userRoles.scCounselor)

	// Show counselor page for counselors
	if (isCounselor) {
		return <GandTCounselorPage />
	}

	// Show main G&T page for super admins
	return <GandTMain />
}

export default GandT
