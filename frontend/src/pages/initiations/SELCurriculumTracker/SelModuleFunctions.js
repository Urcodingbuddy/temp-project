import { updateIsLoading } from '../../../toast/toastSlice'
import { uploadImageToS3Bucket } from '../../../utils/uploadToS3Bucket'
import {
	addUpdateSelModule,
	getPresignedSelModulesUrls,
	verifySelModule,
} from './SELSlice'

export const getPresignedUrlForFiles = async (
	dispatch,
	year,
	month,
	extractedFiles,
	setPresignedUrls,
) => {
	const filePaths = extractedFiles.map((obj) => obj.originalPath)

	const body = {
		filePaths,
		year,
		month,
	}

	const res = await dispatch(getPresignedSelModulesUrls({ body }))
	if (!res.error) {
		setPresignedUrls(res.payload)
	}
}

export const uploadFilesToS3 = async (fileObjects) => {
	console.log(fileObjects)
	const uploadFiles = fileObjects.map((obj) =>
		uploadImageToS3Bucket(obj.link, obj.file),
	)
	console.log(uploadFiles.map((x) => x.link))
	await Promise.all(uploadFiles)
}

export const uploadDataToDB = async (
	dispatch,
	year,
	month,
	extractedFiles,
	clearAll,
) => {
	const filePaths = extractedFiles.map((obj) => obj.originalPath)

	const body = {
		filePaths,
		year,
		month,
	}

	const res = await dispatch(addUpdateSelModule({ body }))
	if (!res.error) {
		clearAll()
	}
}

const verifySelModuleWithDB = async (dispatch, month, year) => {
	const body = {
		month,
		year,
	}

	const res = await dispatch(verifySelModule({ body }))
	if (!res.error) {
		return res.payload?.exist ?? false
	}
	return false
}

export const uploadSelModuleSubmit = async (
	dispatch,
	year,
	month,
	extractedFiles,
	presignedUrls,
	acknowledge,
	setUploadAlertDialog,
	setIsUploading,
	clearAll,
) => {
	if (!acknowledge) {
		const verify = await verifySelModuleWithDB(dispatch, month, year)
		if (verify) {
			setUploadAlertDialog(true)
			return
		}
	}

	console.log(extractedFiles)
	console.log(presignedUrls)

	const fileObjects = extractedFiles.map((obj) => {
		const link = presignedUrls[obj.originalFilename]
		return {
			file: obj.file,
			link,
		}
	})

	setIsUploading(true)

	// Upload the files to s3
	await uploadFilesToS3(fileObjects)
	setIsUploading(false)

	// Once the files are uploaded update the database for the same
	await uploadDataToDB(dispatch, year, month, extractedFiles, clearAll)
}
