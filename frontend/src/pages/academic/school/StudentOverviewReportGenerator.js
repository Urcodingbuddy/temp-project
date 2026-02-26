import * as XLSX from 'xlsx-js-style'

class StudentOverviewReportGenerator {
	constructor() {
		// Store extracted template configurations
		this.templateConfig = {
			headerStyles: {},
			columnWidths: [],
			rowHeights: [],
			mergedCells: [],
			dataValidations: [],
			conditionalFormatting: [],
		}
	}

	processYesNoValue(value) {
		if (!value) return ''
		const val = String(value).toLowerCase().trim()
		if (val === 'yes' || val === 'y') return 'Yes'
		if (val === 'no' || val === 'n') return 'No'
		if (val === 'n.a.' || val === 'na' || val === 'n/a') return 'N.A.'
		return 'N.A.'
	}

	async loadExistingTemplate() {
		try {
			// In browser environment, fetch the template file
			const response = await fetch(
				'../../../../StudentCaseOverviewReport.xlsx',
			)
			if (!response.ok) {
				throw new Error('Template file not found')
			}
			const arrayBuffer = await response.arrayBuffer()
			const workbook = XLSX.read(arrayBuffer, {
				type: 'array',
				cellStyles: true,
				cellHTML: false,
				cellFormula: true,
				cellDates: true,
			})
			// Extract template configurations for later reapplication
			this.extractTemplateConfiguration(workbook)

			return workbook
		} catch (error) {
			throw error
		}
	}

	extractTemplateConfiguration(workbook) {
		try {
			const sheetName = workbook.SheetNames[0]
			const worksheet = workbook.Sheets[sheetName]

			// Extract header styles (rows 0 and 1)
			for (let col = 0; col < 32; col++) {
				for (let row = 0; row < 2; row++) {
					const cellAddr = XLSX.utils.encode_cell({ r: row, c: col })
					if (worksheet[cellAddr] && worksheet[cellAddr].s) {
						this.templateConfig.headerStyles[cellAddr] = {
							...worksheet[cellAddr].s,
						}
					}
				}
			}

			// Extract column widths
			if (worksheet['!cols']) {
				this.templateConfig.columnWidths = [...worksheet['!cols']]
			}

			// Extract row heights
			if (worksheet['!rows']) {
				this.templateConfig.rowHeights = [...worksheet['!rows']]
			}

			// Extract merged cells
			if (worksheet['!merges']) {
				this.templateConfig.mergedCells = [...worksheet['!merges']]
			}

			// Extract data validations
			if (worksheet['!dataValidation']) {
				this.templateConfig.dataValidations = [
					...worksheet['!dataValidation'],
				]
			}
		} catch (error) {
			// Error extracting template configuration
		}
	}

	addDataToExistingTemplate(workbook, dataArray) {
		// Get the first sheet (main data sheet)
		const sheetName = workbook.SheetNames[0]
		const worksheet = workbook.Sheets[sheetName]

		// Use the provided data directly
		const processedData = dataArray || []

		// Extend worksheet range to accommodate new data
		const range = XLSX.utils.decode_range(worksheet['!ref'])
		const newEndRow = Math.max(range.e.r, processedData.length + 1) // Ensure range covers all data rows
		worksheet['!ref'] = XLSX.utils.encode_range({
			s: { r: 0, c: 0 },
			e: { r: newEndRow, c: 31 },
		})

		// Add data starting from row 3 (0-indexed row 2)
		// IMPORTANT: Only modify data cells, NEVER touch header rows (0 and 1)
		processedData.forEach((rowData, rowIdx) => {
			const actualRow = rowIdx + 2 // Starting from row 3 (0-indexed)

			// Column A - Auto-increment S.No. - ALWAYS CREATE
			const cellA = XLSX.utils.encode_cell({ r: actualRow, c: 0 })
			worksheet[cellA] = {
				v: rowIdx + 1,
				t: 'n',
			}

			// Columns B-F - String data - ALWAYS CREATE
			const dataColumns = [
				{ col: 1, value: rowData.name || '', name: 'Name' },
				{ col: 2, value: rowData.class || '', name: 'Class' },
				{ col: 3, value: rowData.section || '', name: 'Section' },
				{ col: 4, value: rowData.monthOfReferral || '', name: 'Month' },
				{ col: 5, value: rowData.type || '', name: 'Type' },
			]

			dataColumns.forEach(({ col, value, name }) => {
				const cellAddr = XLSX.utils.encode_cell({
					r: actualRow,
					c: col,
				})
				worksheet[cellAddr] = {
					v: value,
					t: 's',
				}
			})
			// Column G - Code with only color, no text (like H-L columns)
			const codeCell = XLSX.utils.encode_cell({ r: actualRow, c: 6 })
			if (rowData.codeColor) {
				// Get existing cell to preserve template formatting
				const existingCell = worksheet[codeCell] || {}
				const existingStyle = existingCell.s || {}

				worksheet[codeCell] = {
					v: '', // Empty text like H-L columns
					t: 's',
					s: {
						...existingStyle, // Preserve existing template styles
						fill: {
							patternType: 'solid',
							fgColor: { rgb: rowData.codeColor },
						},
					},
				}
			} else {
				// Just set empty value if no color, preserve existing formatting
				if (!worksheet[codeCell]) {
					worksheet[codeCell] = { v: '', t: 's' }
				} else {
					worksheet[codeCell].v = ''
				}
			}

			// Columns H-L - Use colors from dataArray
			const hToLColors = [
				rowData.physicalColor || '', // H - Physical
				rowData.socialColor || '', // I - Social
				rowData.emotionalColor || '', // J - Emotional
				rowData.cognitiveColor || '', // K - Cognitive
				rowData.languageColor || '', // L - Language
			]

			for (let col = 7; col <= 11; col++) {
				const cellAddress = XLSX.utils.encode_cell({
					r: actualRow,
					c: col,
				})
				const colorIndex = col - 7
				const cellColor = hToLColors[colorIndex]

				// Only set the cell value and color if provided, don't override existing template formatting
				if (cellColor) {
					// Get existing cell style to preserve template formatting
					const existingCell = worksheet[cellAddress] || {}
					const existingStyle = existingCell.s || {}

					worksheet[cellAddress] = {
						v: '',
						t: 's',
						s: {
							...existingStyle, // Preserve existing template styles
							fill: {
								patternType: 'solid',
								fgColor: { rgb: cellColor },
							},
						},
					}
				} else {
					// Just set empty value, preserve all existing formatting
					if (!worksheet[cellAddress]) {
						worksheet[cellAddress] = { v: '', t: 's' }
					} else {
						worksheet[cellAddress].v = ''
					}
				}
			}

			// Column M - Number of sessions (only if cell doesn't exist)
			const cellM = XLSX.utils.encode_cell({ r: actualRow, c: 12 })
			if (!worksheet[cellM] || !worksheet[cellM].v) {
				worksheet[cellM] = {
					v: rowData.numberOfSessions || 0,
					t: 'n',
				}
			}

			// Columns N-O - String data (only if cells don't exist)
			const cellN = XLSX.utils.encode_cell({ r: actualRow, c: 13 })
			if (!worksheet[cellN] || !worksheet[cellN].v) {
				worksheet[cellN] = {
					v: rowData.concerns || '',
					t: 's',
				}
			}

			const cellO = XLSX.utils.encode_cell({ r: actualRow, c: 14 })
			if (!worksheet[cellO] || !worksheet[cellO].v) {
				worksheet[cellO] = {
					v: rowData.goals || '',
					t: 's',
				}
			}

			// Report Link - Column X (index 23)
			const cellReportLink = XLSX.utils.encode_cell({
				r: actualRow,
				c: 23,
			})
			if (!worksheet[cellReportLink] || !worksheet[cellReportLink].v) {
				worksheet[cellReportLink] = {
					v: rowData.reportLink || '',
					t: 's',
				}
			}

			// Handle diagnosis as direct text (column W, index 22)
			const cellDiagnosis = XLSX.utils.encode_cell({
				r: actualRow,
				c: 22,
			})
			if (!worksheet[cellDiagnosis] || !worksheet[cellDiagnosis].v) {
				worksheet[cellDiagnosis] = {
					v: rowData.diagnosis || '',
					t: 's',
				}
			}

			// Yes/No/N.A. columns - skip Report Link (23) and Diagnosis (22)
			const yesNoColumns = [20, 21, 24, 25, 26, 27, 28, 29, 30, 31]
			const yesNoData = [
				rowData.requirement1,
				rowData.availability,
				rowData.requirement2,
				rowData.certificate,
				rowData.approval,
				rowData.requirement3,
				rowData.specialEducation,
				rowData.behavioralInterventions,
				rowData.oneOnOne,
				rowData.focusClasses,
			]

			// Yes/No columns - only update if cells don't exist
			yesNoColumns.forEach((col, idx) => {
				const cellAddr = XLSX.utils.encode_cell({
					r: actualRow,
					c: col,
				})
				if (!worksheet[cellAddr] || !worksheet[cellAddr].v) {
					worksheet[cellAddr] = {
						v: this.processYesNoValue(yesNoData[idx]),
						t: 's',
					}
				}
			})
		})

		// Apply black borders to all cells in the data range
		this.applyBordersToDataRange(workbook, processedData.length)

		// Apply header styling with #d9d9d9 fill color
		this.applyHeaderStyling(workbook)

		return workbook
	}

	applyHeaderStyling(workbook) {
		try {
			const sheetName = workbook.SheetNames[0]
			const worksheet = workbook.Sheets[sheetName]

			// Define header style with #d9d9d9 fill color
			const headerStyle = {
				fill: { patternType: 'solid', fgColor: { rgb: 'd9d9d9' } },
				font: { color: { rgb: '000000' }, bold: true },
				alignment: {
					horizontal: 'center',
					vertical: 'center',
					wrapText: true,
				},
				border: {
					top: { style: 'thin', color: { rgb: '000000' } },
					bottom: { style: 'thin', color: { rgb: '000000' } },
					left: { style: 'thin', color: { rgb: '000000' } },
					right: { style: 'thin', color: { rgb: '000000' } },
				},
			}

			// Apply styling to first two header rows (0 and 1)
			for (let row = 0; row < 2; row++) {
				for (let col = 0; col < 32; col++) {
					const cellAddr = XLSX.utils.encode_cell({ r: row, c: col })

					// Apply style to existing cells or create new ones
					if (worksheet[cellAddr]) {
						worksheet[cellAddr].s = {
							...worksheet[cellAddr].s,
							...headerStyle,
						}
					} else {
						// Create cell if it doesn't exist
						worksheet[cellAddr] = {
							v: '',
							t: 's',
							s: headerStyle,
						}
					}
				}
			}
		} catch (error) {
			// Error applying header styling
		}
	}

	applyBordersToDataRange(workbook, dataRowCount) {
		try {
			const sheetName = workbook.SheetNames[0]
			const worksheet = workbook.Sheets[sheetName]

			// Define black border style
			const borderStyle = {
				top: { style: 'thin', color: { rgb: '000000' } },
				bottom: { style: 'thin', color: { rgb: '000000' } },
				left: { style: 'thin', color: { rgb: '000000' } },
				right: { style: 'thin', color: { rgb: '000000' } },
			}

			// Calculate the range: from A1 to the last column with last data row
			const lastDataRow = dataRowCount + 1 // +1 because we have 2 header rows, so data starts at row 2 (0-indexed)
			const lastColumn = 31 // Column AF (0-indexed)

			// Apply borders to all cells in the range
			for (let row = 0; row <= lastDataRow; row++) {
				for (let col = 0; col <= lastColumn; col++) {
					const cellAddr = XLSX.utils.encode_cell({ r: row, c: col })

					// Create cell if it doesn't exist
					if (!worksheet[cellAddr]) {
						worksheet[cellAddr] = {
							v: '',
							t: 's',
						}
					}

					// Apply border to existing style or create new style
					if (!worksheet[cellAddr].s) {
						worksheet[cellAddr].s = {}
					}

					worksheet[cellAddr].s.border = borderStyle
				}
			}
		} catch (error) {
			// Error applying borders to data range
		}
	}

	async generateCaseOverviewExcel(
		dataArray = [],
		filename = 'StudentCaseOverviewReport-2025-26',
	) {
		try {
			// Load existing template
			let workbook = await this.loadExistingTemplate()
			// Add data to the existing template
			workbook = this.addDataToExistingTemplate(workbook, dataArray)

			// Save with provided filename + .xlsx extension
			const fullFilename = filename.endsWith('.xlsx')
				? filename
				: `${filename}.xlsx`
			XLSX.writeFile(workbook, fullFilename)

			return workbook
		} catch (error) {
			throw error
		}
	}
}

export default StudentOverviewReportGenerator
