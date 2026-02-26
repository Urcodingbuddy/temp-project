export const checkFullPassword = (val, setIsValidFullPass) => {
	const fullPassword =
		/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
	fullPassword.test(val)
		? setIsValidFullPass(true)
		: setIsValidFullPass(false)
}

export const checkFullPasswordConfirm = (val, setIsValidFullPassConfirm) => {
	const fullPassword =
		/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
	fullPassword.test(val)
		? setIsValidFullPassConfirm(true)
		: setIsValidFullPassConfirm(false)
}

export const checkUppercase = (val, setIsUpperCase) => {
	const uppercase = /[A-Z]/
	uppercase.test(val) ? setIsUpperCase(true) : setIsUpperCase(false)
}

export const checkLowercase = (val, setIsLowerCase) => {
	const lowercase = /[a-z]/
	lowercase.test(val) ? setIsLowerCase(true) : setIsLowerCase(false)
}

export const checkDigits = (val, setIsDigit) => {
	const digit = /[0-9]/
	digit.test(val) ? setIsDigit(true) : setIsDigit(false)
}

export const checkSpecialCharacter = (val, setIsSpecialChar) => {
	const specialCharacter = /[!@#*_-]/
	specialCharacter.test(val)
		? setIsSpecialChar(true)
		: setIsSpecialChar(false)
}
