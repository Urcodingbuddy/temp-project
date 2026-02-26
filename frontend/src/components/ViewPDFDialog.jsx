import { Dialog, Divider, IconButton, Typography } from '@mui/material'
import { Box } from '@mui/system'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { typographyConstants } from '../resources/theme/typographyConstants'
import { iconConstants } from '../resources/theme/iconConstants'
import { localizationConstants } from '../resources/theme/localizationConstants'
import CustomIcon from './CustomIcon'

// Set PDF.js worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

// Styles Object
const styles = {
	dialogPaper: {
		borderRadius: '10px',

		maxHeight: '95vh',
		padding: '20px 30px',
		display: 'flex',
		flexDirection: 'column',
	},
	headerBox: {
		pb: '12px',
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		position: 'sticky',
		top: 0,
		backgroundColor: 'white',
		zIndex: 1,
	},
	title: {
		fontWeight: 500,
		color: 'textColors.black',
		fontSize: '22px',
	},
	zoomControls: {
		display: 'flex',
		justifyContent: 'center',
		gap: 1,
		mt: 1,
	},
	zoomText: {
		alignSelf: 'center',
		minWidth: '40px',
		display: 'flex',
		justifyContent: 'center',
	},
	scrollContainer: {
		mt: '10px',
		height: 'calc(95vh - 146px)',
		overflowY: 'auto',
		position: 'relative',
		'&::-webkit-scrollbar': {
			width: '7px',
		},
		'&::-webkit-scrollbar-thumb:hover': {
			background: '#555',
		},
		'& .react-pdf__message': {
			display: 'none',
		},
	},
	pageWrapper: {
		marginBottom: '20px',
		display: 'flex',
		justifyContent: 'center',
	},
	pageNumber: {
		position: 'sticky',
		bottom: 0,
		right: 0,
		textAlign: 'right',
		px: 2,
		py: 1,
		backgroundColor: 'white',
		zIndex: 1,
	},
	iconStyle: {
		cursor: 'pointer',
		width: '32px',
		height: '32px',
	},
}

const ViewPDFDialog = ({ title, open, onClose, pdfUrl }) => {
	const [numPages, setNumPages] = useState(null)
	const [visiblePage, setVisiblePage] = useState(1)
	const [zoom, setZoom] = useState(1.0)
	const pageRefs = useRef([])
	const scrollContainerRef = useRef(null)
	const observerRef = useRef(null)

	// Debounce utility
	const debounce = (func, wait) => {
		let timeout
		return (...args) => {
			clearTimeout(timeout)
			timeout = setTimeout(() => func(...args), wait)
		}
	}

	const onDocumentLoadSuccess = useCallback(({ numPages }) => {
		setNumPages(numPages)
		setVisiblePage(1)
		pageRefs.current = new Array(numPages).fill(null)

		// Ensure scroll to top after PDF load
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

	// Setup IntersectionObserver for visible page detection
	useEffect(() => {
		if (
			open &&
			numPages &&
			pageRefs.current.length &&
			scrollContainerRef.current
		) {
			observerRef.current = new IntersectionObserver(
				debounce(handleIntersection, 50), // Reduced debounce for responsiveness
				{
					root: scrollContainerRef.current,
					threshold: [0.1, 0.3, 0.5, 0.7, 0.9], // More granular thresholds
					rootMargin: '0px',
				},
			)

			pageRefs.current.forEach((ref) => {
				if (ref) {
					observerRef.current.observe(ref)
				}
			})

			// Trigger initial detection
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
	}, [open, numPages, handleIntersection])

	// Reset state when dialog closes
	useEffect(() => {
		if (!open) {
			setNumPages(null)
			setVisiblePage(1)
			setZoom(1.0)
			pageRefs.current = []
			if (observerRef.current) {
				observerRef.current.disconnect()
			}
		}
	}, [open])

	const increaseZoom = () => setZoom((prev) => Math.min(prev + 0.2, 3))
	const decreaseZoom = () => setZoom((prev) => Math.max(prev - 0.2, 0.5))

	const isPDF =
		(typeof pdfUrl === 'string' && pdfUrl.toLowerCase().endsWith('.pdf')) ||
		pdfUrl.toLowerCase().includes('application/pdf')

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth='xl'
			fullWidth
			PaperProps={{ sx: styles.dialogPaper }}
			onContextMenu={(e) => e.preventDefault()}
		>
			<Box sx={{ flexGrow: 1 }}>
				<Box sx={styles.headerBox}>
					<Typography
						variant={typographyConstants.h4}
						sx={styles.title}
					>
						{title}
					</Typography>
					<CustomIcon
						name={iconConstants.cancelRounded}
						onClick={onClose}
						style={styles.iconStyle}
						svgStyle={{ width: '32px', height: '32px' }}
					/>
				</Box>
				<Divider />
				{isPDF && (
					<Box sx={styles.zoomControls}>
						<IconButton onClick={decreaseZoom} size='small'>
							<RemoveIcon />
						</IconButton>
						<Typography
							variant={typographyConstants.body2}
							sx={styles.zoomText}
						>
							{Math.round(zoom * 100)}%
						</Typography>
						<IconButton onClick={increaseZoom} size='small'>
							<AddIcon />
						</IconButton>
					</Box>
				)}
				<Box
					id='pdf-scroll-container'
					sx={styles.scrollContainer}
					ref={scrollContainerRef}
					onContextMenu={(e) => e.preventDefault()}
					onMouseDown={(e) => e.preventDefault()}
				>
					{isPDF ? (
						<Document
							file={pdfUrl}
							onLoadSuccess={onDocumentLoadSuccess}
							loading={null}
						>
							{Array.from(new Array(numPages), (el, index) => (
								<Box
									key={`page_${index + 1}`}
									ref={(el) => (pageRefs.current[index] = el)}
									sx={styles.pageWrapper}
								>
									<Page
										renderTextLayer={false}
										renderAnnotationLayer={false}
										pageNumber={index + 1}
										scale={zoom}
									/>
								</Box>
							))}
						</Document>
					) : (
						<img
							src={pdfUrl}
							alt='Resource'
							style={{ maxWidth: '100%', maxHeight: '600px' }}
						/>
					)}
					{numPages && (
						<Typography
							variant={typographyConstants.h6}
							sx={styles.pageNumber}
						>
							{localizationConstants.page} {visiblePage}{' '}
							{localizationConstants.of} {numPages}
						</Typography>
					)}
				</Box>
			</Box>
		</Dialog>
	)
}

export default ViewPDFDialog
