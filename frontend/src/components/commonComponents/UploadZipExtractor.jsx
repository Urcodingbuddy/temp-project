import { forwardRef, useImperativeHandle, useState } from 'react'
import {
	Box,
	Typography,
	Paper,
	Button,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Collapse,
	Alert,
	LinearProgress,
	Chip,
	IconButton,
} from '@mui/material'
import {
	CloudUpload as CloudUploadIcon,
	FolderZip as FolderZipIcon,
	InsertDriveFile as FileIcon,
	Folder as FolderIcon,
	ExpandLess,
	ExpandMore,
	Delete as DeleteIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import JSZip from 'jszip'

// Styled components
const UploadArea = styled(Paper)(({ theme, isDragOver }) => ({
	border: `2px dashed ${isDragOver ? theme.palette.primary.main : theme.palette.grey[300]}`,
	borderRadius: theme.shape.borderRadius * 2,
	padding: theme.spacing(4),
	textAlign: 'center',
	cursor: 'pointer',
	backgroundColor: isDragOver
		? theme.palette.primary.light + '10'
		: theme.palette.grey[50],
	transition: 'all 0.3s ease-in-out',
	'&:hover': {
		borderColor: theme.palette.primary.main,
		backgroundColor: theme.palette.primary.light + '10',
	},
}))

const HiddenInput = styled('input')({
	display: 'none',
})

const FileTreeItem = styled(ListItem)(({ theme }) => ({
	paddingLeft: theme.spacing(2),
	'&.nested': {
		paddingLeft: theme.spacing(4),
	},
}))

const ZipUploadExtractor = forwardRef(
	({ onFilesExtracted, onError, maxFileSize = 50 * 1024 * 1024 }, ref) => {
		const [isDragOver, setIsDragOver] = useState(false)
		const [isExtracting, setIsExtracting] = useState(false)
		const [extractedFiles, setExtractedFiles] = useState([])
		const [fileTree, setFileTree] = useState({})
		const [expandedFolders, setExpandedFolders] = useState(new Set())
		const [error, setError] = useState('')
		const [success, setSuccess] = useState('')

		// Build file tree structure
		const buildFileTree = (files) => {
			const tree = {}

			files.forEach((fileInfo) => {
				const pathParts = fileInfo.originalPath
					.split('/')
					.filter((part) => part)
				let currentLevel = tree

				pathParts.forEach((part, index) => {
					if (!currentLevel[part]) {
						currentLevel[part] = {
							isFolder: index < pathParts.length - 1,
							children: {},
							fileInfo:
								index === pathParts.length - 1
									? fileInfo
									: null,
						}
					}
					currentLevel = currentLevel[part].children
				})
			})

			return tree
		}

		// Extract ZIP file
		const extractZipFile = async (zipFile) => {
			try {
				setIsExtracting(true)
				setError('')

				const zip = new JSZip()
				const zipContent = await zip.loadAsync(zipFile)

				// Validation: Analyze the structure before processing
				const structure = analyzeZipStructure(zipContent.files)
				validateZipStructure(structure)

				const extractedFilesList = []

				// Process each file in the ZIP
				for (let [relativePath, zipObject] of Object.entries(
					zipContent.files,
				)) {
					if (!zipObject.dir) {
						// Only process files, not directories
						try {
							const fileData = await zipObject.async('blob')
							relativePath = relativePath.replaceAll(' ', '_')
							const originalFilename = relativePath
								.split('/')
								.pop()

							// Create a new File object with the modified name
							const modifiedFile = new File(
								[fileData],
								originalFilename,
								{
									type:
										fileData.type ||
										'application/octet-stream',
									lastModified: zipObject.date
										? zipObject.date.getTime()
										: Date.now(),
								},
							)

							const fileInfo = {
								originalPath: relativePath
									.split('/')
									.slice(1)
									.join('/'),
								originalFilename,
								file: modifiedFile,
								size: fileData.size,
								type:
									fileData.type || 'application/octet-stream',
								lastModified: zipObject.date || new Date(),
							}

							extractedFilesList.push(fileInfo)
						} catch (fileError) {
							console.error(
								`Error processing file ${relativePath}:`,
								fileError,
							)
						}
					}
				}

				setExtractedFiles(extractedFilesList)
				setFileTree(buildFileTree(extractedFilesList))
				setSuccess(
					`Successfully extracted ${extractedFilesList.length} files from ${zipFile.name}`,
				)

				// Call the callback with extracted files
				if (onFilesExtracted) {
					onFilesExtracted(extractedFilesList)
				}
			} catch (error) {
				const errorMessage = `Failed to extract ZIP file: ${error.message}`
				if (onError) {
					onError(errorMessage)
				}
			} finally {
				setIsExtracting(false)
			}
		}

		// Helper function to analyze zip structure
		const analyzeZipStructure = (files) => {
			const structure = {
				rootFiles: [],
				rootFolders: new Set(),
				nestedFolders: new Set(),
				maxDepth: 0,
				nonPdfFiles: [],
			}

			for (const [path, zipObject] of Object.entries(files)) {
				// Skip the entry if it's just a directory marker
				if (zipObject.dir) continue

				const pathParts = path.split('/').filter((part) => part !== '')
				const depth = pathParts.length - 1 // Subtract 1 because last part is filename
				const filename = pathParts[pathParts.length - 1]

				// Check if file is PDF (case insensitive)
				const isPdf = filename.toLowerCase().endsWith('.pdf')
				if (!isPdf) {
					structure.nonPdfFiles.push(path)
				}

				// Track maximum depth
				structure.maxDepth = Math.max(structure.maxDepth, depth)

				if (depth === 1) {
					// File is in root directory
					structure.rootFiles.push(path)
				} else if (depth === 2) {
					// File is in a first-level folder
					structure.rootFolders.add(pathParts[0])
				} else if (depth > 2) {
					// File is in a nested folder (depth > 1)
					structure.nestedFolders.add(
						pathParts.slice(0, -1).join('/'),
					)
				}
			}

			return structure
		}

		// Helper function to validate zip structure according to rules
		const validateZipStructure = (structure) => {
			// Rule 1: No files should be in the root directory
			if (structure.rootFiles.length > 0) {
				throw new Error(
					`Invalid structure: Files found in root directory. Only folders are allowed in the root. Found files: ${structure.rootFiles.join(', ')}`,
				)
			}

			// Rule 2: Maximum 1 level of nesting (folders can contain files, but not other folders)
			if (structure.maxDepth > 2) {
				const nestedFoldersArray = Array.from(structure.nestedFolders)
				throw new Error(
					`Invalid structure: Folders cannot contain other folders. Maximum 1 level of nesting allowed. Found nested folders: ${nestedFoldersArray.join(', ')}`,
				)
			}

			// Rule 3: Only PDF files are allowed
			if (structure.nonPdfFiles.length > 0) {
				throw new Error(
					`Invalid file types: Only PDF files are allowed. Found non-PDF files: ${structure.nonPdfFiles.join(', ')}`,
				)
			}

			// Additional validation: Ensure there's at least one folder
			if (structure.rootFolders.size === 0) {
				throw new Error(
					'Invalid structure: ZIP file must contain at least one folder with files inside.',
				)
			}
		}

		// Handle file selection
		const handleFileSelect = async (files) => {
			const file = files[0] // Only handle first file for ZIP extraction

			if (!file) return

			// Check file size
			if (file.size > maxFileSize) {
				const errorMessage = `File too large. Maximum size is ${Math.round(maxFileSize / (1024 * 1024))}MB`
				setError(errorMessage)
				if (onError) onError(errorMessage)
				return
			}

			// Check if it's a ZIP file
			if (
				!file.type.includes('zip') &&
				!file.name.toLowerCase().endsWith('.zip')
			) {
				const errorMessage = 'Please select a ZIP file'
				setError(errorMessage)
				if (onError) onError(errorMessage)
				return
			}

			await extractZipFile(file)
		}

		// Handle drag events
		const handleDragOver = (e) => {
			e.preventDefault()
			setIsDragOver(true)
		}

		const handleDragLeave = (e) => {
			e.preventDefault()
			setIsDragOver(false)
		}

		const handleDrop = (e) => {
			e.preventDefault()
			setIsDragOver(false)
			const files = Array.from(e.dataTransfer.files)
			handleFileSelect(files)
		}

		// Handle file input change
		const handleFileInputChange = (e) => {
			const files = Array.from(e.target.files)
			handleFileSelect(files)
			e.target.value = '' // Reset input
		}

		// Toggle folder expansion
		const toggleFolder = (folderPath) => {
			const newExpanded = new Set(expandedFolders)
			if (newExpanded.has(folderPath)) {
				newExpanded.delete(folderPath)
			} else {
				newExpanded.add(folderPath)
			}
			setExpandedFolders(newExpanded)
		}

		// Clear extracted files
		const clearExtractedFiles = () => {
			setExtractedFiles([])
			setFileTree({})
			setExpandedFolders(new Set())
			setSuccess('')
			setError('')
		}

		useImperativeHandle(ref, () => ({
			clearExtractedFiles,
		}))

		// Render file tree
		const renderFileTree = (tree, path = '') => {
			return Object.entries(tree).map(([name, node]) => {
				const currentPath = path ? `${path}/${name}` : name
				const isExpanded = expandedFolders.has(currentPath)

				if (node.isFolder) {
					return (
						<Box key={currentPath}>
							<FileTreeItem
								button
								onClick={() => toggleFolder(currentPath)}
								className={path ? 'nested' : ''}
							>
								<ListItemIcon>
									<FolderIcon color='action' />
								</ListItemIcon>
								<ListItemText primary={name} />
								{isExpanded ? <ExpandLess /> : <ExpandMore />}
							</FileTreeItem>
							<Collapse
								in={isExpanded}
								timeout='auto'
								unmountOnExit
							>
								<List component='div' disablePadding>
									{renderFileTree(node.children, currentPath)}
								</List>
							</Collapse>
						</Box>
					)
				} else {
					return (
						<FileTreeItem
							key={currentPath}
							className={path ? 'nested' : ''}
						>
							<ListItemIcon>
								<FileIcon color='primary' />
							</ListItemIcon>
							<ListItemText
								primary={node.fileInfo?.newFilename || name}
								secondary={`Original: ${node.fileInfo?.originalFilename} | Size: ${formatFileSize(node.fileInfo?.size)}`}
							/>
						</FileTreeItem>
					)
				}
			})
		}

		// Format file size
		const formatFileSize = (bytes) => {
			if (!bytes) return '0 Bytes'
			const k = 1024
			const sizes = ['Bytes', 'KB', 'MB', 'GB']
			const i = Math.floor(Math.log(bytes) / Math.log(k))
			return (
				parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
			)
		}

		return (
			<Box>
				{/* Upload Area */}
				<UploadArea
					isDragOver={isDragOver}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					onClick={() =>
						document.getElementById('zip-file-input').click()
					}
					sx={{ mb: 3 }}
				>
					<FolderZipIcon
						sx={{ fontSize: 48, color: 'primary.main', mb: 2 }}
					/>
					<Typography variant='h6' gutterBottom>
						Drag & Drop ZIP file here
					</Typography>
					<Typography
						variant='body2'
						color='text.secondary'
						gutterBottom
					>
						or
					</Typography>
					<Button
						variant='contained'
						component='span'
						startIcon={<CloudUploadIcon />}
						sx={{ mt: 2 }}
					>
						Browse ZIP File
					</Button>
					<Typography
						variant='caption'
						display='block'
						sx={{ mt: 2, color: 'text.secondary' }}
					>
						Maximum file size:{' '}
						{Math.round(maxFileSize / (1024 * 1024))}
						MB
					</Typography>
				</UploadArea>

				{/* Hidden File Input */}
				<HiddenInput
					id='zip-file-input'
					type='file'
					accept='.zip,application/zip,application/x-zip-compressed'
					onChange={handleFileInputChange}
				/>

				{/* Progress Bar */}
				{isExtracting && (
					<Box sx={{ mb: 3 }}>
						<Typography
							variant='body2'
							color='text.secondary'
							gutterBottom
						>
							Extracting ZIP file...
						</Typography>
						<LinearProgress />
					</Box>
				)}

				{/* Success Alert */}
				{success && (
					<Alert
						severity='success'
						sx={{ mb: 3 }}
						action={
							<IconButton
								aria-label='close'
								color='inherit'
								size='small'
								onClick={() => setSuccess('')}
							>
								<DeleteIcon fontSize='inherit' />
							</IconButton>
						}
					>
						{success}
					</Alert>
				)}

				{/* Extracted Files Summary */}
				{extractedFiles.length > 0 && (
					<Box sx={{ mb: 3 }}>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								mb: 2,
							}}
						>
							<Typography variant='h6'>
								Extracted Files ({extractedFiles.length})
							</Typography>
							<Button
								variant='outlined'
								color='error'
								size='small'
								startIcon={<DeleteIcon />}
								onClick={clearExtractedFiles}
							>
								Clear All
							</Button>
						</Box>

						{/* File Statistics */}
						<Box
							sx={{
								mb: 2,
								display: 'flex',
								gap: 1,
								flexWrap: 'wrap',
							}}
						>
							<Chip
								label={`Total Files: ${extractedFiles.length}`}
								color='primary'
								variant='outlined'
								size='small'
							/>
							<Chip
								label={`Total Size: ${formatFileSize(extractedFiles.reduce((sum, f) => sum + (f.size || 0), 0))}`}
								color='secondary'
								variant='outlined'
								size='small'
							/>
						</Box>

						{/* File Tree */}
						<Paper
							variant='outlined'
							sx={{ maxHeight: 400, overflow: 'auto' }}
						>
							<List dense>{renderFileTree(fileTree)}</List>
						</Paper>
					</Box>
				)}
			</Box>
		)
	},
)

export default ZipUploadExtractor
