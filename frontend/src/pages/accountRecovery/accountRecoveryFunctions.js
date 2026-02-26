import { emailRegex } from '../../utils/utils'
import { forgotPassword, updateAccountRecoveryEmail } from '../login/loginSlice'

export const handleAccountRecoveryEmail = (e, dispatch, setIsEmailValid) => {
	const value = e.target.value
	dispatch(updateAccountRecoveryEmail(value))

	if (emailRegex.test(value)) {
		setIsEmailValid(true)
	} else {
		setIsEmailValid(false)
	}
}

export const handleAccountRecoveryLogin = (accountRecoveryEmail, dispatch) => {
	const body = {
		email: accountRecoveryEmail,
	}
	dispatch(forgotPassword({ body }))
}
