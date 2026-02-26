// utils/generatePdfFromDeck.js
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

// ---- helpers ----
const pxToMm = (px) => (px / 96) * 25.4

// Assign a stable id to every <canvas> in a page (once)
function tagSourceCanvases(pageEl) {
	const cvs = Array.from(pageEl.querySelectorAll('canvas'))
	cvs.forEach((cv, i) => {
		if (!cv.hasAttribute('data-cv-id'))
			cv.setAttribute('data-cv-id', String(i))
	})
}

// Clone a page at native size into an offscreen host, and copy canvas pixels
function clonePageWithCanvasSnapshots(pageEl, W, H, host) {
	// create a clean container with no CSS transforms
	const wrapper = document.createElement('div')
	Object.assign(wrapper.style, {
		width: `${W}px`,
		height: `${H}px`,
		background: '#fff',
		position: 'relative',
		overflow: 'hidden',
	})

	// deep clone the page
	const clone = pageEl.cloneNode(true)
	// ensure the clone itself isn’t transformed either
	clone.style.transform = 'none'
	clone.style.transformOrigin = 'top left'
	clone.style.position = 'static'
	clone.style.left = '0'
	clone.style.top = '0'
	clone.style.margin = '0'

	wrapper.appendChild(clone)
	host.appendChild(wrapper)

	// Copy canvas pixels from source → clone by matching data-cv-id
	const srcCanvases = pageEl.querySelectorAll('canvas[data-cv-id]')
	const dstCanvases = clone.querySelectorAll('canvas[data-cv-id]')

	dstCanvases.forEach((dst) => {
		const id = dst.getAttribute('data-cv-id')
		const src = Array.from(srcCanvases).find(
			(c) => c.getAttribute('data-cv-id') === id,
		)
		if (!src) return
		try {
			// sync intrinsic size (bitmap), not just CSS size
			const w =
				src.width || Math.round(src.getBoundingClientRect().width) || 1
			const h =
				src.height ||
				Math.round(src.getBoundingClientRect().height) ||
				1
			dst.width = w
			dst.height = h

			// also sync CSS display size so layout matches
			const r = src.getBoundingClientRect()
			if (r.width && r.height) {
				dst.style.width = `${Math.round(r.width)}px`
				dst.style.height = `${Math.round(r.height)}px`
			}

			const ctx = dst.getContext('2d')
			if (ctx) ctx.drawImage(src, 0, 0)
		} catch {
			// if tainted, skip rather than crash
		}
	})

	return wrapper
}

// Render a node to canvas at chosen scale (fast + crisp)
async function renderNodeToCanvas(node, { scale = 2 } = {}) {
	// ensure images are loaded (avoids empties)
	const imgs = Array.from(node.querySelectorAll('img'))
	await Promise.all(
		imgs.map((img) =>
			img.complete
				? Promise.resolve()
				: new Promise((res) => {
						img.addEventListener('load', res, { once: true })
						img.addEventListener('error', res, { once: true })
					}),
		),
	)

	// give layout 1 frame (charts just copied are already painted)
	await new Promise((r) => requestAnimationFrame(r))

	return await html2canvas(node, {
		backgroundColor: '#ffffff',
		scale,
		useCORS: true,
		logging: false,
	})
}

/**
 * Export visible, already-rendered deck pages to a sharp landscape PDF.
 *
 * @param {HTMLElement[]} pages  Array of page elements in DOM order (the inner ".page" elements).
 * @param {Object} opts
 * @param {string} [opts.filename='report.pdf']
 * @param {number} [opts.widthPx=1440]   Native deck width in px (NOT the scaled preview width)
 * @param {number} [opts.heightPx=810]   Native deck height in px
 * @param {number} [opts.scale=2]        html2canvas scale (2–3 is crisp)
 * @param {number} [opts.marginMm=0]     Optional PDF margins in mm
 */
export async function generatePDFFromDeck(
	pages,
	{
		filename = 'report.pdf',
		widthPx = 1440,
		heightPx = 810,
		scale = 2,
		marginMm = 0,
	} = {},
) {
	if (!pages?.length) return

	// 1) Tag source canvases once so we can match them in clones
	pages.forEach(tagSourceCanvases)

	// 2) Build an offscreen host at native size (no transforms)
	const host = document.createElement('div')
	Object.assign(host.style, {
		position: 'fixed',
		left: '-10000px',
		top: '0',
		width: `${widthPx}px`,
		height: `${heightPx}px`,
		background: 'transparent',
		overflow: 'hidden',
		zIndex: '-1',
	})
	document.body.appendChild(host)

	// 3) Clone pages (with canvas pixels) into the host, render one by one
	const wMm = pxToMm(widthPx)
	const hMm = pxToMm(heightPx)
	const pdf = new jsPDF({
		orientation: 'landscape',
		unit: 'mm',
		format: [wMm, hMm],
	})

	for (let i = 0; i < pages.length; i++) {
		const pageEl = pages[i]
		const cloneWrapper = clonePageWithCanvasSnapshots(
			pageEl,
			widthPx,
			heightPx,
			host,
		)
		const canvas = await renderNodeToCanvas(cloneWrapper, { scale })
		const img = canvas.toDataURL('image/png')

		// Optional margin support (defaults to 0 for full-bleed sharpness)
		const usableW = wMm - marginMm * 2
		const usableH = hMm - marginMm * 2
		const cwMm = pxToMm(canvas.width)
		const chMm = pxToMm(canvas.height)
		const ratio = Math.min(usableW / cwMm, usableH / chMm)
		const outW = cwMm * ratio
		const outH = chMm * ratio
		const x = marginMm + (usableW - outW) / 2
		const y = marginMm + (usableH - outH) / 2

		if (i > 0) pdf.addPage([wMm, hMm])
		pdf.addImage(img, 'PNG', x, y, outW, outH)

		// free this clone ASAP
		try {
			cloneWrapper.remove()
		} catch {}
	}

	// 4) Cleanup and save
	try {
		host.remove()
	} catch {}
	pdf.save(filename)
}
