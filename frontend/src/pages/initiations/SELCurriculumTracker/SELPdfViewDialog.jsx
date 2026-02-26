import { Dialog, Divider, IconButton, Typography } from '@mui/material'
import { Box } from '@mui/system'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { typographyConstants } from '../../../resources/theme/typographyConstants'
import { localizationConstants } from '../../../resources/theme/localizationConstants'
import { getCurrentMonth, getCurrentYear } from '../../../utils/utils'
import { useDispatch, useSelector } from 'react-redux'
import SimpleCollapsibleComponent from '../../../components/SimpleCollapsibleComponent'
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded'
import { fetchAllSELTrackerModules } from './SELFunctions'
import { Document, Page, pdfjs } from 'react-pdf'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { selPDFViewStyles } from './SELStyles'
import SelectYearMonth from './SelectYearMonth'
import { SELpdfViewTitle } from './SELpdfViewTitle'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export const initialSelectedStates = {
	currentYear: '',
	selectdMonth: '',
}

const SELPdfViewDialog = ({ open, onClose, isAysNmonthReq = false }) => {
	const { years, months } = useSelector((store) => store.dashboardSliceSetup)
	const { allSELTrackerModules } = useSelector(
		(store) => store.selTrackerList,
	)
	const dispatch = useDispatch()
	const [fileViewMode, setFileViewMode] = useState(false)
	const [selectedPdfUrl, setSelectedPdfUrl] = useState('')
	const [selectedCategory, setSelectedCategory] = useState({})
	const [selectDropdownOption, setSelectDropdownOption] = useState(
		initialSelectedStates,
	)
	const [openCollapsible, setOpenCollapsible] = useState({})
	const [numPages, setNumPages] = useState(null)
	const [visiblePage, setVisiblePage] = useState(1)
	const [zoom, setZoom] = useState(1.0)
	const [currentMonthData, setCurrentMonthData] = useState(null)
	const [monthOptions, setMonthOptions] = useState([])
	const [selectedMonth, setSelectedMonth] = useState('')
	const pageRefs = useRef([])
	const scrollContainerRef = useRef(null)
	const observerRef = useRef(null)
	const baseURL = process.env.REACT_APP_RESOURCE_BASE_URL
	const isInitialLoad = useRef(true)

	// Debounce utility for IntersectionObserver
	const debounce = (func, wait) => {
		let timeout
		return (...args) => {
			clearTimeout(timeout)
			timeout = setTimeout(() => func(...args), wait)
		}
	}

	// Function to find and set current month data
	const setMonthData = useCallback((responseData, requestedMonth) => {
		if (!responseData || !Array.isArray(responseData)) {
			setCurrentMonthData(null)
			setMonthOptions([])
			setSelectedMonth('')
			return
		}

		// Create month options from response
		const options = responseData.map((item) => ({
			id: item.month?.toLowerCase(),
			label: item.month,
		}))
		setMonthOptions(options)

		// Find requested month data
		let monthData = responseData.find(
			(item) =>
				item.month?.toLowerCase() === requestedMonth?.toLowerCase(),
		)

		// If not found, use first month's data
		if (!monthData && responseData.length > 0) {
			monthData = responseData[0]
		}

		setCurrentMonthData(monthData)
		setSelectedMonth(monthData?.month || '')
	}, [])

	// Function to handle month selection from dropdown
	const handleMonthSelect = useCallback(
		(selectedMonthValue) => {
			if (!allSELTrackerModules || !Array.isArray(allSELTrackerModules))
				return

			const monthData = allSELTrackerModules.find(
				(item) =>
					item.month?.toLowerCase() ===
					selectedMonthValue?.toLowerCase(),
			)

			if (monthData) {
				setCurrentMonthData(monthData)
				setSelectedMonth(monthData.month)
			}
		},
		[allSELTrackerModules],
	)

	const handleDropDownSelect = (name, value) => {
		setSelectDropdownOption((prev) => ({
			...prev,
			[name]: value,
		}))
	}

	const handleFileClick = (file, category) => {
		setSelectedPdfUrl(`${baseURL}${file.path}`)
		setSelectedCategory((state) => ({ ...state, file, category }))
		setFileViewMode(true)
	}

	const handleBackToList = () => {
		setFileViewMode(false)
		setSelectedPdfUrl('')
		setSelectedCategory({})
		setNumPages(null)
		setVisiblePage(1)
		setZoom(1.0)
		pageRefs.current = []
		if (observerRef.current) {
			observerRef.current.disconnect()
		}
	}

	const toggleCollapsible = (order) => {
		setOpenCollapsible((prev) => ({
			...prev,
			[order]: !prev[order],
		}))
	}

	const onDocumentLoadSuccess = useCallback(({ numPages }) => {
		setNumPages(numPages)
		setVisiblePage(1)
		pageRefs.current = new Array(numPages).fill(null)
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollTop = 0
		}
	}, [])

	const handleIntersection = useCallback((entries) => {
		let maxRatio = 0
		let visiblePageIndex = 1
		entries.forEach((entry) => {
			if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
				maxRatio = entry.intersectionRatio
				const index = pageRefs.current.findIndex(
					(ref) => ref === entry.target,
				)
				if (index !== -1) {
					visiblePageIndex = index + 1
				}
			}
		})
		if (maxRatio > 0) {
			setVisiblePage(visiblePageIndex)
		}
	}, [])

	const increaseZoom = () => setZoom((prev) => Math.min(prev + 0.2, 3))
	const decreaseZoom = () => setZoom((prev) => Math.max(prev - 0.2, 0.5))

	const isPDF =
		(typeof selectedPdfUrl === 'string' &&
			selectedPdfUrl.toLowerCase().endsWith('.pdf')) ||
		selectedPdfUrl.toLowerCase().includes('application/pdf')

	useEffect(() => {
		if (
			fileViewMode &&
			numPages &&
			pageRefs.current.length &&
			scrollContainerRef.current
		) {
			observerRef.current = new IntersectionObserver(
				debounce(handleIntersection, 50),
				{
					root: scrollContainerRef.current,
					threshold: [0.1, 0.3, 0.5, 0.7, 0.9],
					rootMargin: '0px',
				},
			)
			pageRefs.current.forEach((ref) => {
				if (ref) {
					observerRef.current.observe(ref)
				}
			})
			setTimeout(() => {
				handleIntersection(
					pageRefs.current.map((ref, index) => ({
						target: ref,
						isIntersecting: ref
							? ref.getBoundingClientRect().top >= 0 &&
								ref.getBoundingClientRect().top <
									window.innerHeight
							: false,
						intersectionRatio: ref
							? ref.getBoundingClientRect().top >= 0
								? 1
								: 0
							: 0,
					})),
				)
			}, 100)
			return () => {
				if (observerRef.current) {
					observerRef.current.disconnect()
				}
			}
		}
	}, [fileViewMode, numPages, handleIntersection])

	useEffect(() => {
		if (!fileViewMode) {
			setNumPages(null)
			setVisiblePage(1)
			setZoom(1.0)
			pageRefs.current = []
			if (observerRef.current) {
				observerRef.current.disconnect()
			}
		}
	}, [fileViewMode])

	useEffect(() => {
		if (years.length > 0 && months.length > 0 && isInitialLoad.current) {
			const currentYear = getCurrentYear(years)
			const currentMonth = getCurrentMonth(months)

			if (currentYear) {
				setSelectDropdownOption({
					currentYear: currentYear,
					selectdMonth: currentMonth,
				})
			}
			isInitialLoad.current = false
			fetchAllSELTrackerModules(dispatch, currentYear, currentMonth)
		}
	}, [years, months, dispatch])

	useEffect(() => {
		if (
			selectDropdownOption.currentYear &&
			selectDropdownOption.selectdMonth
		) {
			fetchAllSELTrackerModules(
				dispatch,
				selectDropdownOption.currentYear,
				selectDropdownOption.selectdMonth,
			)
		}
	}, [selectDropdownOption, dispatch])

	// New useEffect to handle API response and set month data
	useEffect(() => {
		if (allSELTrackerModules) {
			setMonthData(
				allSELTrackerModules,
				selectDropdownOption.selectdMonth,
			)
		}
	}, [allSELTrackerModules, selectDropdownOption.selectdMonth, setMonthData])

	useEffect(() => {
		if (currentMonthData?.categories?.length) {
			const initialState = {}
			currentMonthData.categories.forEach((category) => {
				initialState[category.order] = true
			})
			setOpenCollapsible(initialState)
		}
	}, [currentMonthData?.categories])

	return (
		<Dialog
			maxWidth='xl'
			fullWidth
			open={open}
			onClose={fileViewMode ? handleBackToList : onClose}
			PaperProps={{ sx: selPDFViewStyles.dialogPaper }}
			onContextMenu={(e) => e.preventDefault()}
		>
			<Box sx={{ flexGrow: 1 }}>
				<SELpdfViewTitle
					fileViewMode={fileViewMode}
					handleBackToList={handleBackToList}
					selectedCategory={selectedCategory}
					onClose={onClose}
					selectedMonth={selectedMonth.toLowerCase()}
					monthOptions={monthOptions}
					onMonthSelect={handleMonthSelect}
				/>
			</Box>
			<Divider />

			{currentMonthData && currentMonthData?.categories?.length > 0 ? (
				<>
					{isPDF && (
						<Box sx={selPDFViewStyles.zoomControls}>
							<IconButton onClick={decreaseZoom} size='small'>
								<RemoveIcon />
							</IconButton>
							<Typography
								variant={typographyConstants.body2}
								sx={selPDFViewStyles.zoomText}
							>
								{Math.round(zoom * 100)}%
							</Typography>
							<IconButton onClick={increaseZoom} size='small'>
								<AddIcon />
							</IconButton>
						</Box>
					)}
					<Box sx={selPDFViewStyles.scrollContainer}>
						{fileViewMode ? (
							<>
								<Box
									id='pdf-scroll-container'
									sx={selPDFViewStyles.scrollContainer}
									ref={scrollContainerRef}
									onContextMenu={(e) => e.preventDefault()}
									onMouseDown={(e) => e.preventDefault()}
								>
									{isPDF ? (
										<Document
											file={selectedPdfUrl}
											onLoadSuccess={
												onDocumentLoadSuccess
											}
											loading={null}
										>
											{Array.from(
												new Array(numPages),
												(el, index) => (
													<Box
														key={`page_${index + 1}`}
														ref={(el) =>
															(pageRefs.current[
																index
															] = el)
														}
														sx={
															selPDFViewStyles.pageWrapper
														}
													>
														<Page
															renderTextLayer={
																false
															}
															renderAnnotationLayer={
																false
															}
															pageNumber={
																index + 1
															}
															scale={zoom}
														/>
													</Box>
												),
											)}
										</Document>
									) : (
										<img
											src={selectedPdfUrl}
											alt='Resource'
											style={{
												maxWidth: '100%',
												maxHeight: '0px',
											}}
										/>
									)}
									{numPages && isPDF && (
										<Typography
											variant={typographyConstants.h6}
											sx={selPDFViewStyles.pageNumber}
										>
											{localizationConstants.page}{' '}
											{visiblePage}{' '}
											{localizationConstants.of}{' '}
											{numPages}
										</Typography>
									)}
								</Box>
							</>
						) : (
							<>
								{isAysNmonthReq && (
									<SelectYearMonth
										years={years}
										months={months}
										selectDropdownOption={
											selectDropdownOption
										}
										handleDropDownSelect={
											handleDropDownSelect
										}
									/>
								)}
								<Box sx={{ mt: '20px' }}>
									{currentMonthData?.categories?.map(
										(category) => (
											<Box
												key={category.order}
												sx={{ mb: '20px' }}
											>
												<SimpleCollapsibleComponent
													open={
														openCollapsible[
															category.order
														]
													}
													title={
														category.categoryName
													}
													onClick={() =>
														toggleCollapsible(
															category.order,
														)
													}
													isBorderRequired={true}
												>
													<Box sx={{ pl: '20px' }}>
														{category.files.map(
															(file) => (
																<Box
																	key={
																		file._id ||
																		file.fileName
																	}
																	sx={{
																		...selPDFViewStyles.fileItem,
																	}}
																	onClick={() =>
																		handleFileClick(
																			file,
																			category,
																		)
																	}
																>
																	<PictureAsPdfRoundedIcon />
																	<Typography
																		variant={
																			typographyConstants.body
																		}
																		sx={{
																			'&:hover':
																				{
																					color: 'globalElementColors.blue',
																					textDecoration:
																						'underline',
																				},
																		}}
																	>
																		{
																			file.fileName
																		}
																	</Typography>
																</Box>
															),
														)}
													</Box>
												</SimpleCollapsibleComponent>
											</Box>
										),
									)}
								</Box>
							</>
						)}
					</Box>
				</>
			) : (
				<Box
					sx={{
						...selPDFViewStyles.scrollContainer,
						...selPDFViewStyles.nodataStyles,
					}}
				>
					<Typography variant={typographyConstants.h4}>
						{localizationConstants.noDataAvailable}
					</Typography>
					<Typography variant={typographyConstants.title}>
						{localizationConstants.pleaseWaitForAdminToUpdate}
					</Typography>
				</Box>
			)}
		</Dialog>
	)
}

export default SELPdfViewDialog
