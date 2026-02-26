import { Navigate } from 'react-router-dom'
import {
	getUserFromLocalStorage,
	isPageLoading,
	removePageLoadingState,
	setPageLoadingState,
} from './utils/utils'
import { routeConstants, routePaths } from './routes/routeConstants'

// window.addEventListener("DOMContentLoaded", function (e) {
//   // This listener will be called when the page is being loaded initially or when it is reloaded as well.
//   setPageLoadingState();
// });

// window.onpopstate = function (event) {
//   // This listener will be called when user clicks back or forward.
//   setPageLoadingState();
// };

const ProtectedRoute = ({ children }) => {
	const user = getUserFromLocalStorage()
	const pathName = window.location.pathname
	const isPageLoaded = isPageLoading()

	const routeToSpecificPage = (route) => {
		if (isPageLoaded) {
			removePageLoadingState()
		}
		if (route) {
			return <Navigate to={route} />
		} else {
			return children
		}
	}

	if (!user || !user.authToken) {
		return routeToSpecificPage(routePaths.login)
	}

	return routeToSpecificPage(null)
}

export default ProtectedRoute
