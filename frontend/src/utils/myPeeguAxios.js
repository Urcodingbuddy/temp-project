import { store } from '../store'
import axios from 'axios'
import { localizationConstants } from '../resources/theme/localizationConstants'
import { apiHeaders } from './apiConstants'
import { updateIsLoading, updateToastData } from '../toast/toastSlice'
import {
	changeRoute,
	checkIfGetS3LinkApi,
	getUserFromLocalStorage,
	removeUserFromLocalStorage,
} from './utils'
import { routePaths } from '../routes/routeConstants'

const CancelToken = axios.CancelToken
let loaderUpdated = 0

const myPeeguAxios = axios.create({
	baseURL: process.env.REACT_APP_BASE_URL,
	headers: {
		Accept: apiHeaders.acceptType,
		'ngrok-skip-browser-warning': 'true', // ngrok respects this header
		[apiHeaders.deviceType]: apiHeaders.web,
	},
	timeout: 60000,
})

myPeeguAxios.interceptors.request.use(
	(config) => {
		const user = getUserFromLocalStorage()

		if (user) {
			config.headers[apiHeaders.authToken] = user.authToken
		}

		if (!config.headers[apiHeaders.preventDefaultLoader]) {
			store.dispatch(updateIsLoading(true))
			loaderUpdated += 1
		}

		// Remove the custom header before the request is sent
		delete config.headers[apiHeaders.preventDefaultLoader]

		return config
	},
	(error) => {
		return Promise.reject(error)
	},
)

myPeeguAxios.interceptors.response.use(
	(response) => {
		if (!response.config.headers[apiHeaders.preventDefaultToast]) {
			if (response?.data?.message) {
				store.dispatch(
					updateToastData({
						showToast: true,
						title: '',
						subTitle: response?.data?.message,
						isSuccess: true,
						direction: response?.response?.data?.fileContainsError
							? 'left'
							: 'right',
					}),
				)
			}
		}
		if (!response.config.headers[apiHeaders.preventDefaultLoader]) {
			loaderUpdated -= 1
			if (loaderUpdated < 1 && checkIfGetS3LinkApi(response.config.url)) {
				setTimeout(() => {
					store.dispatch(updateIsLoading(false))
				}, 1000)
			}
		}

		// Remove the custom header before the request is sent
		delete response?.config?.headers[apiHeaders.preventDefaultLoader]
		delete response?.config?.headers[apiHeaders.preventDefaultToast]

		return response
	},
	(error) => {
		let errorMessage =
			error?.code === 'ERR_NETWORK'
				? localizationConstants.contactAdminSomethingWrong
				: (error?.response?.data?.error_message ??
					error?.response?.data?.error ??
					error?.response?.data?.errors ??
					error?.message ??
					localizationConstants.contactAdminSomethingWrong)
		error.errorMessage = errorMessage

		if (!error.config.headers[apiHeaders.preventDefaultToast]) {
			if (errorMessage) {
				const errorKey =
					typeof errorMessage === 'string'
						? []
						: Object.keys(errorMessage[0]?.errors)[0]
				let subTitle = ''
				if (error?.response?.data?.fileContainsError) {
					subTitle = error?.response?.data?.message
				} else {
					subTitle =
						typeof errorMessage === 'string'
							? errorMessage
							: errorMessage[0]?.errors[errorKey]
				}
				store.dispatch(
					updateToastData({
						showToast: true,
						title: '',
						subTitle,
						isSuccess: false,
						multipleError: Array.isArray(errorMessage)
							? errorMessage
							: [],
						direction: error?.response?.data?.fileContainsError
							? 'left'
							: 'right',
					}),
				)
			}
		}

		if (!error.config.headers[apiHeaders.preventDefaultLoader]) {
			loaderUpdated -= 1
			if (loaderUpdated < 1 && checkIfGetS3LinkApi(error.config.url)) {
				setTimeout(() => {
					store.dispatch(updateIsLoading(false))
				}, 1000)
			}
		}

		if (error?.code === 'ECONNABORTED') {
			console.log('Request timed out')
		}

		if (error?.code === 'ERR_NETWORK') {
			console.log('network error')
		}

		if (error?.response?.status === 404) {
			console.log('not found')
		}
		if (error?.response?.status === 400) {
			console.log('bad request')
		}
		if (error?.response?.status === 401) {
			removeUserFromLocalStorage()
			changeRoute(routePaths.login)
		}

		delete error?.config?.headers[apiHeaders.preventDefaultLoader]
		delete error?.config?.headers[apiHeaders.preventDefaultToast]

		return Promise.reject(error)
	},
)

export default myPeeguAxios
