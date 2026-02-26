const { S3Client, ListObjectsCommand, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const { v4: uuidv4 } = require('uuid')
const myPeeguConfig = require('../startup/config').myPeeguConfig
const logger = require('../utility/logger')
const AWS = require('aws-sdk')
const { default: axios } = require('axios')

const myPeeguCredentials =
	myPeeguConfig.app.environment === 'local'
		? {
				credentials: {
					accessKeyId: process.env.myPeeguAccessKeyId,
					secretAccessKey: process.env.myPeeguSecretAccessKey,
				},
			}
		: {}

const myPeeguS3Client = new S3Client({
	...myPeeguCredentials,
	region: miscellaneous.region,
})

function fetchS3Info() {
	let s3Info = {}
	s3Info.s3Client = myPeeguS3Client
	s3Info.bucket = miscellaneous.bucket
	s3Info.region = miscellaneous.region
	s3Info.resourceBaseUrl = miscellaneous.klipResourceBaseUrl
	return s3Info
}

const listOfFiles = async (path) => {
	const s3Info = fetchS3Info()
	try {
		const params = {
			Bucket: s3Info.bucket ?? '',
			Prefix: path ?? '',
		}
		const data = await s3Info.s3Client.send(new ListObjectsCommand(params))
		return data
	} catch (err) {
		console.log('Error', err)
	}
}

const generatePreSignedUrl = async (path, fileName, contentType) => {
	const s3Info = fetchS3Info()
	const expirationTime = 3600
	const params = {
		Bucket: s3Info.bucket ?? '',
		Key: path + fileName,
		// Expires: expirationTime,
		ContentType: contentType, // Replace with your image MIME type
		ACL: 'private', // Replace with your desired ACL value
	}
	try {
		const command = new PutObjectCommand(params)
		const signedUrl = await getSignedUrl(s3Info.s3Client, command, { expiresIn: expirationTime })
		return signedUrl
	} catch (err) {
		console.error(err)
		return false
	}
}

const deleteImageFromS3 = async (path, fileName) => {
	const s3Info = fetchS3Info()
	const params = {
		Bucket: s3Info.bucket ?? '',
		Key: path + fileName,
		ContentType: 'image/png', // Replace with your image MIME type
		ACL: 'private', // Replace with your desired ACL value
	}
	try {
		const deleteCommand = new DeleteObjectCommand(params)
		await s3Info.s3Client.send(deleteCommand)
		console.log(`Object deleted: s3://${params.Bucket}/${params.Key}`)
		return true
	} catch (err) {
		console.error(err, err.stack)
		return false
	}
}

async function uploadImage(buffer, fileName, path) {
	const s3Info = fetchS3Info()
	try {
		const bucketName = s3Info.bucket ?? ''
		const base64Data = Buffer.from(buffer, 'base64')
		const objectKey = path + fileName
		const uploadParams = {
			Bucket: bucketName,
			Key: objectKey,
			Body: base64Data,
			ContentType: 'image/png',
		}
		const result = await s3Info.s3Client.send(new PutObjectCommand(uploadParams))
		const objectUrl = `${s3Info.resourceBaseUrl}/${objectKey}`
		return objectUrl
	} catch (error) {
		console.error('Error uploading image to S3:', error)
		logger.info(error)
		return false
	}
}

async function getImageBase64StringFromUrl(url) {
	try {
		const response = await axios.get(url, { responseType: 'arraybuffer' })
		const base64String = Buffer.from(response.data, 'binary').toString('base64')
		return base64String
	} catch (err) {
		console.error(err)
		return null
	}
}

const isFileExistInS3 = async (url) => {
	const s3Info = fetchS3Info()

	const params = {
		Bucket: s3Info.bucket ?? '',
		Key: url,
	}

	try {
		await s3Info.s3Client.send(new HeadObjectCommand(params))

		return true
	} catch (error) {
		if (error.name === 'NotFound') {
			logger.info('File does not exist.')
		} else {
			logger.info('Error occurred:', error)
		}
		return false
	}
}

module.exports = { listOfFiles, deleteImageFromS3, uploadImage, generatePreSignedUrl, getImageBase64StringFromUrl, isFileExistInS3 }
