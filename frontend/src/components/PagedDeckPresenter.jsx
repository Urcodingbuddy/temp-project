import React, {
	useEffect,
	useState,
	useCallback,
	useRef,
	forwardRef,
	useImperativeHandle,
} from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// --- Constants ---
const STAGE_PAD = 16
const PAGE_SPACING = 24

/**
 * PagedDeckPresenter is a React component designed to display a multi-page
 * presentation or report from a collection of HTML fragments.
 */
export default forwardRef(function PagedDeckPresenter(
	{
		deck,
		basePath,
		includes = [],
		replacements = {},
		imageSwaps = {},
		scriptValues = {}, // { [pageId]: number[] } OR { "*": number[] } for all pages
		startIndex = 0,
		onPageChange,
		className,
		style,
		allowUpscale = false,
	},
	ref,
) {
	const base = basePath ?? `/reports/${deck}`

	// --- STATE & REFS ---
	const [manifest, setManifest] = useState(null)
	const [slideSize, setSlideSize] = useState({ w: 1440, h: 810 })
	const [pages, setPages] = useState([])
	const [idx, setIdx] = useState(startIndex)
	const [loading, setLoading] = useState(true)
	const stageRef = useRef(null)
	const pagesContainerRef = useRef(null) // Ref for the element with the transform style
	const pageRefs = useRef(new Map())
	const loadedOnceRef = useRef(false)
	const [viewportTick, setViewportTick] = useState(0)

	// --- EFFECTS ---

	/**
	 * Injects shared CSS and font files for the deck into the document's <head>.
	 */
	useEffect(() => {
		const addOnce = (id, href) => {
			if (!document.getElementById(id)) {
				const link = document.createElement('link')
				link.id = id
				link.rel = 'stylesheet'
				link.href = href
				document.head.appendChild(link)
			}
		}
		addOnce(`deck-common-${base}`, `${base}/common.css`)
		addOnce(`deck-fonts-${base}`, `${base}/fonts.css`)
	}, [base])

	/**
	 * Fetches the `pages.json` manifest to get the list of pages and deck metadata.
	 */
	useEffect(() => {
		if (loadedOnceRef.current) return
		let alive = true
		;(async () => {
			try {
				const res = await fetch(`${base}/pages.json`, {
					cache: 'no-cache',
				})
				const m = await res.json()
				if (!alive) return
				if (m?.size?.w && m?.size?.h)
					setSlideSize({ w: m.size.w, h: m.size.h })
				let items = (m.pages || []).map((p) =>
					typeof p === 'string'
						? {
								id: p.replace(/^.*\/(page-\d+)\.html$/i, '$1'),
								file: p,
							}
						: { id: p.id, file: `pages/${p.file}` },
				)
				const wanted =
					includes?.length > 0
						? items.filter((it) => includes.includes(it.id))
						: items
				setManifest({ items: wanted })
			} catch (e) {
				console.error('Failed to load pages.json', e)
				setManifest({ items: [] })
			}
		})()
		return () => {
			alive = false
		}
	}, [base, includes])

	// [Unchanged HTML Processing Helpers]
	const normalizeBase = (b) => (b ? (b.endsWith('/') ? b : b + '/') : '/')
	function rewriteFragmentUrls(html, deckRoot) {
		const tpl = document.createElement('template')
		tpl.innerHTML = html
		const isAbs = (u) =>
			/^(data:|#|https?:|\/\/|mailto:|tel:|javascript:)/i.test(u || '')
		const prefix = normalizeBase(deckRoot)
		const makeAbs = (u) =>
			isAbs(u) ? u : `${prefix}${String(u).replace(/^\.?\//, '')}`
		tpl.content.querySelectorAll('[src], [href]').forEach((el) => {
			;['src', 'href'].forEach((a) => {
				const v = el.getAttribute(a)
				if (!v || isAbs(v)) return
				el.setAttribute(a, makeAbs(v))
			})
		})
		tpl.content.querySelectorAll('[xlink\\:href]').forEach((el) => {
			const v = el.getAttribute('xlink:href')
			if (!v || isAbs(v) || v.startsWith('#')) return
			el.setAttribute('xlink:href', makeAbs(v))
		})
		tpl.content
			.querySelectorAll('img[srcset], source[srcset]')
			.forEach((n) => {
				const set = n.getAttribute('srcset')
				if (!set) return
				const rebuilt = set
					.split(',')
					.map((part) => {
						const [u, d] = part.trim().split(/\s+/, 2)
						if (!u) return part.trim()
						return `${makeAbs(u)}${d ? ` ${d}` : ''}`
					})
					.join(', ')
				n.setAttribute('srcset', rebuilt)
			})
		tpl.content.querySelectorAll('[style]').forEach((el) => {
			const s = el.getAttribute('style') || ''
			let fixed = s.replace(/url\((['"]?)([^'")]+)\1\)/gi, (m, q, u) => {
				if (/^(data:|#|https?:|\/\/)/i.test(u) || u.startsWith('#'))
					return m
				return `url("${makeAbs(u)}")`
			})
			if (fixed !== s) el.setAttribute('style', fixed)
		})
		tpl.content.querySelectorAll('style').forEach((styleEl) => {
			const css = styleEl.textContent || ''
			let fixed = css.replace(
				/url\((['"]?)([^'")]+)\1\)/gi,
				(m, q, u) => {
					if (/^(data:|#|https?:|\/\/)/i.test(u) || u.startsWith('#'))
						return m
					return `url("${makeAbs(u)}")`
				},
			)
			if (fixed !== css) styleEl.textContent = fixed
		})
		return tpl.innerHTML
	}
	function applyReplacements(html, items) {
		if (typeof html !== 'string' || !items?.length) return html

		try {
			const tpl = document.createElement('template')
			tpl.innerHTML = html // browser will tidy minor markup

			// Build literal (escaped) find→replace rules, case-sensitive
			// Allow flexible whitespace between words to handle HTML formatting
			const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
			const buildFlexiblePattern = (text) => {
				// Split by whitespace, escape each part, join with flexible whitespace pattern
				const parts = text.split(/\s+/).filter(Boolean)
				if (parts.length <= 1) return escapeRegExp(text)
				return parts.map(escapeRegExp).join('\\s+')
			}
			const rules = items
				.filter((r) => typeof r?.text === 'string')
				.map((r) => ({
					re: new RegExp(buildFlexiblePattern(r.text), 'g'),
					value: String(r.value ?? ''),
				}))

			if (!rules.length) return tpl.innerHTML

			// 1) Replace in TEXT NODES (original behavior), skipping script-ish parents
			const skipParents = new Set([
				'SCRIPT',
				'STYLE',
				'NOSCRIPT',
				'IFRAME',
				'TEMPLATE',
			])
			const walker = document.createTreeWalker(
				tpl.content,
				NodeFilter.SHOW_TEXT,
				null,
			)
			let node
			while ((node = walker.nextNode())) {
				const p = node.parentNode
				if (p && skipParents.has(p.nodeName)) continue
				let s = node.nodeValue || ''
				if (!s) continue
				for (const { re, value } of rules) s = s.replace(re, value)
				node.nodeValue = s
			}

			// 2) Replace inside ELEMENT ATTRIBUTES (e.g., fill="(DominanceColor)")
			tpl.content.querySelectorAll('*').forEach((el) => {
				// Don’t touch <script> tags or event handlers
				if (el.tagName === 'SCRIPT') return
				for (const { name, value } of Array.from(el.attributes)) {
					if (!value) continue
					if (/^on/i.test(name)) continue // onClick, onload, etc.
					let v = value
					for (const { re, value: to } of rules) v = v.replace(re, to)
					if (v !== value) el.setAttribute(name, v)
				}
			})

			// 3) Replace inside <style> tag contents (if placeholders are used there)
			tpl.content.querySelectorAll('style').forEach((styleEl) => {
				const css = styleEl.textContent || ''
				let out = css
				for (const { re, value } of rules) out = out.replace(re, value)
				if (out !== css) styleEl.textContent = out
			})

			return tpl.innerHTML
		} catch {
			// If anything odd happens, return the original HTML unchanged
			return html
		}
	}
	function applyImageSwaps(html, swaps, b) {
		if (!swaps?.length) return html
		let out = html
		for (const s of swaps) {
			if (!s.selector || !s.src) continue
			const tpl = document.createElement('template')
			tpl.innerHTML = out
			tpl.content.querySelectorAll(s.selector).forEach((n) => {
				if (n.tagName === 'IMG')
					n.src = new URL(s.src, normalizeBase(b)).toString()
				else
					n.style.backgroundImage = `url("${new URL(s.src, normalizeBase(b)).toString()}")`
			})
			out = tpl.innerHTML
		}
		return out
	}

	// Replace any "values = [ ... ]" array inside inline <script> tags
	function applyScriptValues(html, numbers) {
		if (!Array.isArray(numbers) || numbers.length === 0) return html

		const tpl = document.createElement('template')
		tpl.innerHTML = html

		// convert to numbers, round to 2 decimals, serialize as string
		const serialize = numbers
			.map((n) => {
				const v = typeof n === 'string' ? Number(n) : n
				if (!Number.isFinite(v)) return '0'
				// round to 2 decimals
				const rounded = Number(v.toFixed(2))
				return String(rounded)
			})
			.join(', ')

		const RX_DECL_OR_ASSIGN =
			/((?:\bconst|\blet|\bvar)\s+values\s*=\s*)\[[\s\S]*?\]/g
		const RX_ASSIGN_ONLY = /(\bvalues\s*=\s*)\[[\s\S]*?\]/g

		// modify only inline scripts; external scripts are left alone
		tpl.content.querySelectorAll('script:not([src])').forEach((s) => {
			const code = s.textContent || ''
			let out = code
				.replace(
					RX_DECL_OR_ASSIGN,
					(_, prefix) => `${prefix}[${serialize}]`,
				)
				.replace(
					RX_ASSIGN_ONLY,
					(_, prefix) => `${prefix}[${serialize}]`,
				)
			if (out !== code) s.textContent = out
		})

		return tpl.innerHTML
	}

	/**
	 * Loads and processes the HTML content for all pages from the manifest.
	 */
	useEffect(() => {
		if (!manifest || loadedOnceRef.current) return
		let alive = true
		;(async () => {
			setLoading(true)
			try {
				const loaded = []
				for (const it of manifest.items) {
					try {
						const res = await fetch(`${base}/${it.file}`, {
							cache: 'no-cache',
						})
						let html = await res.text()
						html = rewriteFragmentUrls(html, base)
						html = applyReplacements(
							html,
							replacements[it.id] || [],
						)
						html = applyImageSwaps(
							html,
							imageSwaps[it.id] || [],
							base,
						)
						// Apply "values" array updates, if provided (per-page or global fallback)
						const valuesForPage =
							(scriptValues &&
								(scriptValues[it.id] || scriptValues['*'])) ||
							null
						if (valuesForPage) {
							html = applyScriptValues(html, valuesForPage)
						}

						loaded.push({ id: it.id, html })
					} catch (e) {
						console.warn('Skip fragment', it.file, e)
					}
				}
				if (!alive) return
				setPages(loaded)
				setIdx((i) =>
					Math.max(0, Math.min(i, Math.max(loaded.length - 1, 0))),
				)
				loadedOnceRef.current = true
			} finally {
				if (alive) setLoading(false)
			}
		})()
		return () => {
			alive = false
		}
	}, [manifest, base, replacements, imageSwaps])

	// [Unchanged Navigation Logic]
	const prev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), [])
	const next = useCallback(
		() => setIdx((i) => Math.min(pages.length - 1, i + 1)),
		[pages.length],
	)
	useEffect(() => {
		const onKey = (e) => {
			if (e.key === 'ArrowRight') next()
			if (e.key === 'ArrowLeft') prev()
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [next, prev])
	useEffect(() => {
		const on = (e) => (e.detail === 'next' ? next() : prev())
		document.addEventListener('__paged_deck_nav__', on)
		return () => document.removeEventListener('__paged_deck_nav__', on)
	}, [next, prev])
	useEffect(() => {
		onPageChange?.(idx, pages.length)
	}, [idx, pages.length, onPageChange])

	/**
	 * Handles scaling and positioning of the page container.
	 */
	useEffect(() => {
		const stage = stageRef.current
		const pagesContainer = pagesContainerRef.current
		if (!stage || !pagesContainer || pages.length === 0) return
		const { w: nativeW, h: nativeH } = slideSize
		const availableW = stage.clientWidth - STAGE_PAD * 2
		const availableH = stage.clientHeight - STAGE_PAD * 2
		const scale = Math.min(
			availableW / nativeW,
			availableH / nativeH,
			allowUpscale ? Infinity : 1,
		)
		const scrollOffset = idx * (nativeH + PAGE_SPACING)
		Object.assign(pagesContainer.style, {
			position: 'absolute',
			left: `${(stage.clientWidth - nativeW * scale) / 2}px`,
			top: `${(stage.clientHeight - nativeH * scale) / 2}px`,
			transformOrigin: 'top left',
			transform: `scale(${scale}) translateY(-${scrollOffset}px)`,
			transition: 'transform 0.4s ease-in-out',
		})
	}, [idx, pages, viewportTick, allowUpscale, slideSize])

	useEffect(() => {
		const resize = () => setViewportTick((t) => t + 1)
		window.addEventListener('resize', resize)
		return () => window.removeEventListener('resize', resize)
	}, [])

	/**
	 * Sandboxed script runner.
	 */
	async function runScripts(pageElement) {
		const scripts = Array.from(pageElement.querySelectorAll('script'))
		const pageId = pageElement.id
		for (const oldScript of scripts) {
			const newScript = document.createElement('script')
			for (const attr of oldScript.attributes)
				newScript.setAttribute(attr.name, attr.value)
			if (oldScript.textContent) {
				const wrappedCode = `
                    (() => {
                        const page = document.getElementById('${pageId}');
                        if (!page) { return; }
                        const doc = document;
                        const getElementById_global = doc.getElementById.bind(doc);
                        const querySelector_global = doc.querySelector.bind(doc);
                        doc.getElementById = (id) => page.querySelector('#' + id) || getElementById_global(id);
                        doc.querySelector = (selector) => page.querySelector(selector) || querySelector_global(selector);
                        try { ${oldScript.textContent} }
                        catch (e) { console.error('Error in sandboxed script:', e); }
                        finally {
                            doc.getElementById = getElementById_global;
                            doc.querySelector = querySelector_global;
                        }
                    })();
                `
				newScript.textContent = wrappedCode
			}
			oldScript.parentNode.replaceChild(newScript, oldScript)
			if (newScript.src)
				await new Promise((r) => {
					newScript.onload = newScript.onerror = r
				})
		}
	}

	/**
	 * Lazily runs scripts when a page becomes visible.
	 */
	useEffect(() => {
		if (pages.length === 0 || !stageRef.current) return
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const pageElement = entry.target
						runScripts(pageElement)
						observer.unobserve(pageElement)
					}
				})
			},
			{ root: stageRef.current, rootMargin: '100px', threshold: 0.01 },
		)
		pageRefs.current.forEach((pageEl) => observer.observe(pageEl))
		return () => observer.disconnect()
	}, [pages])

	/**
	 * Exposes the `exportPdf` function to parent components.
	 */
	useImperativeHandle(
		ref,
		() => ({
			/**
			 * Exports the deck to a PDF by capturing the live, on-screen elements.
			 */
			exportPdf: async ({
				filename = 'Report.pdf',
				scale = 1.7,
				imageFormat = 'JPEG',
				imageQuality = 0.85,
			} = {}) => {
				if (!pages.length) throw new Error('No pages to export')

				const { w: W, h: H } = slideSize
				const pdf = new jsPDF({
					orientation: 'l',
					unit: 'px',
					format: [W, H],
				})
				const nodes = Array.from(pageRefs.current.values())

				try {
					// 2. Ensure all scripts have run (for pages that might not have been viewed yet)
					// Ensure scripts ran (for pages not yet intersected)
					for (const node of nodes) {
						await runScripts(node)
					}
					await new Promise((r) => setTimeout(r, 500))

					// 4. Capture each page sequentially
					for (let i = 0; i < nodes.length; i++) {
						const node = nodes[i]
						const canvas = await html2canvas(node, {
							scale,
							useCORS: true,
							allowTaint: true,
							x: 0,
							y: 0,
							width: W,
							height: H,
							windowWidth: W,
							windowHeight: H,
							onclone: (doc) => {
								// remove ONLY the scaling/translate from the pages container in the clone
								const clonedContainer = doc.querySelector(
									'[data-pages-container]',
								)
								if (clonedContainer) {
									clonedContainer.style.transition = 'none'
									clonedContainer.style.transform = 'none'
									// also neutralize centering offsets so the page sits at 0,0
									clonedContainer.style.left = '0px'
									clonedContainer.style.top = '0px'
								}
							},
						})
						const imgData = canvas.toDataURL(
							`image/${imageFormat.toLowerCase()}`,
							imageQuality,
						)

						if (i > 0) pdf.addPage([W, H], 'l')
						pdf.addImage(imgData, imageFormat, 0, 0, W, H)
					}

					pdf.save(filename)
				} catch (e) {
					console.error('Error exporting PDF:', e)
				}
			},
		}),
		[pages, slideSize],
	)

	// --- RENDER ---
	if (loading)
		return (
			<div style={styles.loading} className={className}>
				Loading…
			</div>
		)
	if (!pages.length)
		return (
			<div style={styles.loading} className={className}>
				No pages
			</div>
		)
	const pageStyle = {
		width: `${slideSize.w}px`,
		height: `${slideSize.h}px`,
		background: '#fff',
		flexShrink: 0,
	}
	return (
		<div className={className} style={{ ...styles.host, ...style }}>
			<style>{`
                .deck-page-host .page { margin: 0 !important; }
                .deck-page-host .page img { max-width: none !important; height: auto; }
                .deck-page-host .page, .deck-page-host .page * { box-sizing: border-box; }
            `}</style>
			<div ref={stageRef} style={styles.stage} className='deck-page-host'>
				<div
					ref={pagesContainerRef}
					data-pages-container
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: `${PAGE_SPACING}px`,
					}}
				>
					{pages.map((page) => (
						<div
							id={page.id}
							key={page.id}
							ref={(el) => {
								const map = pageRefs.current
								if (el) map.set(page.id, el)
								else map.delete(page.id)
							}}
							className='page'
							style={pageStyle}
							dangerouslySetInnerHTML={{ __html: page.html }}
						/>
					))}
				</div>
			</div>
			<div style={styles.hiddenControls} aria-hidden='true'>
				<button onClick={prev} disabled={idx === 0}>
					Prev
				</button>
				<span>
					{idx + 1} / {pages.length}
				</span>
				<button onClick={next} disabled={idx === pages.length - 1}>
					Next
				</button>
			</div>
		</div>
	)
})

const styles = {
	host: { width: '100%', height: '100%' },
	stage: {
		position: 'relative',
		width: '100%',
		height: '100%',
		overflow: 'hidden',
		background: '#f0f0f1',
		boxSizing: 'border-box',
	},
	hiddenControls: { display: 'none' },
	loading: { display: 'grid', placeItems: 'center', height: '100%' },
}
