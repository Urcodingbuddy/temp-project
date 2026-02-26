// ModalDeckViewer.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import PagedDeckPresenter from './PagedDeckPresenter'
import { store } from '../store'
import { updateIsLoading, updateToastData } from '../toast/toastSlice'

export default function ModalDeckViewer({
	open,
	onClose,
	title = 'Presentation',
	deck,
	basePath, // e.g. `/reports/teacher-iri-report`
	includes = [],
	replacements = {},
	imageSwaps = {},
	scriptValues = {}, // { [pageId]: number[] } OR { "*": number[] } for all pages
}) {
	const container = useMemo(() => {
		const id = 'modal-root'
		let el = document.getElementById(id)
		if (!el) {
			el = document.createElement('div')
			el.id = id
			document.body.appendChild(el)
		}
		return el
	}, [])

	useEffect(() => {
		if (!open) return
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = prev
		}
	}, [open])

	if (!open) return null

	return createPortal(
		<ModalChrome
			title={title}
			onClose={onClose}
			deck={deck}
			basePath={basePath}
			includes={includes}
			replacements={replacements}
			imageSwaps={imageSwaps}
			scriptValues={scriptValues}
		/>,
		container,
	)
}

function ModalChrome({
	title,
	onClose,
	deck,
	basePath,
	includes,
	replacements,
	imageSwaps,
	scriptValues,
}) {
	const contentRef = useRef(null)
	const presenterRef = useRef(null)
	const base = basePath ?? `/reports/${deck}`
	const [pageIdx, setPageIdx] = useState(-1)
	const [pageCount, setPageCount] = useState(0)

	// global guard (dev-only) to catch StrictMode quirks or accidental duplicates
	const handleDownloadPdf = async () => {
		store.dispatch(updateIsLoading(true))
		try {
			await presenterRef.current?.exportPdf({
				filename: title.replace(/\s+/g, '_') + '.pdf',
			})
		} catch (err) {
			store.dispatch(
				updateToastData({
					showToast: true,
					title: '',
					subTitle: err?.message || 'PDF export failed',
					isSuccess: false,
					direction: 'right',
				}),
			)
		} finally {
			store.dispatch(updateIsLoading(false))
		}
	}

	const go = (dir) => {
		document.dispatchEvent(
			new CustomEvent('__paged_deck_nav__', { detail: dir }),
		)
	}

	useEffect(() => {
		const listener = (e) => {
			if (e.key === 'ArrowRight') go('next')
			if (e.key === 'ArrowLeft') go('prev')
		}
		window.addEventListener('keydown', listener)
		return () => window.removeEventListener('keydown', listener)
	}, [])

	return (
		<div style={s.overlay} aria-modal='true' role='dialog'>
			<div style={s.modal}>
				{/* Header */}
				<div style={s.header}>
					<div style={s.title} title={title}>
						{title}
					</div>
					<div style={s.actions}>
						<button style={s.button} onClick={handleDownloadPdf}>
							Download PDF
						</button>
						<button
							style={{ ...s.button, ...s.close }}
							onClick={onClose}
						>
							✕
						</button>
					</div>
				</div>

				{/* Middle */}
				<div style={s.middle} ref={contentRef}>
					<div className='deck-slot' style={s.deckSlot}>
						<PagedDeckPresenter
							ref={presenterRef}
							deck={deck}
							basePath={base}
							includes={includes}
							replacements={replacements}
							scriptValues={scriptValues}
							imageSwaps={imageSwaps}
							startIndex={0}
							onPageChange={(i, total) => {
								if (total > 0) {
									setPageIdx(i)
								}
								setPageCount(total)
							}}
							allowUpscale={false}
						/>
					</div>
				</div>

				{/* Footer */}
				<div style={s.footer}>
					<div style={{ color: '#666', fontSize: 13 }}>
						Page {pageIdx < 0 ? 0 : pageIdx + 1} of {pageCount}
					</div>
					<div style={s.pager}>
						<button
							style={s.roundBtn}
							onClick={() => go('prev')}
							title='Previous'
						>
							◀
						</button>
						<button
							style={s.roundBtn}
							onClick={() => go('next')}
							title='Next'
						>
							▶
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

const s = {
	overlay: {
		position: 'fixed',
		inset: 0,
		background: 'rgba(0,0,0,.55)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '2vh 2vw',
		zIndex: 99977,
	},
	modal: {
		width: '90vw',
		height: '90vh',
		maxWidth: 1600,
		background: '#fff',
		borderRadius: 12,
		boxShadow: '0 10px 30px rgba(0,0,0,.25)',
		display: 'flex',
		flexDirection: 'column',
		overflow: 'hidden',
	},
	header: {
		flex: '0 0 auto',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 12,
		padding: '12px 16px',
		borderBottom: '1px solid #ececec',
		background: '#fafafa',
	},
	title: {
		fontSize: 16,
		fontWeight: 600,
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
	},
	actions: { display: 'flex', gap: 8 },
	button: {
		appearance: 'none',
		border: '1px solid #d0d0d0',
		background: '#fff',
		borderRadius: 8,
		padding: '6px 12px',
		cursor: 'pointer',
		fontSize: 14,
	},
	close: { background: '#f6f6f6' },
	middle: {
		flex: '1 1 0',
		minHeight: 0,
		background: '#f0f0f1',
		overflow: 'hidden',
	},
	deckSlot: { width: '100%', height: '100%' },
	footer: {
		flex: '0 0 auto',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: '10px 12px',
		borderTop: '1px solid #ececec',
		background: '#fafafa',
	},
	pager: { display: 'flex', gap: 8 },
	roundBtn: {
		width: 40,
		height: 40,
		borderRadius: 9999,
		border: '1px solid #d0d0d0',
		background: '#fff',
		cursor: 'pointer',
		fontSize: 18,
		lineHeight: '38px',
	},
}
