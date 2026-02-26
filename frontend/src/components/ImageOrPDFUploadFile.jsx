import { useState } from 'react'
import { useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { localizationConstants } from '../resources/theme/localizationConstants'
import { useCallback } from 'react'
import ImageOrPDFUpload from './ImageOrPDFUpload'

const ImageOrPDFUploadFile = ({
	uiProps,
	setOutputFileObject,
	outputFileObject,
	handleUpload,
}) => {
	const [errors, setErrors] = useState(false)
	const [errorMsgs, setErrorMsgs] = useState('')
	const [fileObject, setFileObject] = useState(outputFileObject)

	useMemo(() => {
		setFileObject(outputFileObject)
	}, [outputFileObject])

	const note1 = localizationConstants.iEPUploadfileMsg

	//handle save
	const handleSave = () => {
		if (fileObject.fileName) {
			handleUpload(fileObject)
			setOutputFileObject(fileObject)
			uiProps.handleDialogClose()
			setFileObject({
				fileName: '',
				fileUrl: '',
				file: '',
				fileType: '',
			})
		}
	}
	const handleCancel = () => {
		uiProps.handleDialogClose()
		setFileObject(outputFileObject)
		setErrorMsgs('')
		setErrors(false)
		setFileObject({
			fileName: '',
			fileUrl: '',
			file: '',
			fileType: '',
		})
	}

	// on image drop validating accepted or rejected files
	const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
		setErrors(false)
		setFileObject({
			fileName: '',
			fileUrl: '',
			file: '',
			fileType: '',
		})

		if (rejectedFiles?.length > 0) {
			const invalidFile = Boolean(
				rejectedFiles[0].errors?.find(
					(obj) => obj.code === 'file-invalid-type',
				),
			)

			if (invalidFile) {
				setErrors(true)
				setErrorMsgs('Upload Valid File')
			}
		} else if (acceptedFiles.length > 0) {
			const file = acceptedFiles[0]

			// Create a new FileReader object
			const reader = new FileReader()
			// Set the onloadend event handler
			reader.onloadend = (event) => {
				// Set the preview URL in the state
				setFileObject({
					fileName: file.name,
					fileUrl: reader.result,
					file: file,
					fileType: file.type,
				})
			}
			// Read the file as a data URL
			reader.readAsDataURL(file)
		}
	}, [])

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		accept: { 'image/jpeg': [], 'image/png': [], 'application/pdf': [] },
		minSize: 0,
	})

	return (
		<ImageOrPDFUpload
			onDrop={onDrop}
			errors={errors}
			errorMsgs={errorMsgs}
			getRootProps={getRootProps}
			getInputProps={getInputProps}
			fileObject={fileObject}
			note1={note1}
			handleSave={handleSave}
			handleCancel={handleCancel}
			{...uiProps}
		/>
	)
}

export default ImageOrPDFUploadFile
