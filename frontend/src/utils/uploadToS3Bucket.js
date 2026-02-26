import axios from 'axios'

export const uploadImageToS3Bucket = async (s3Link, file) => {
	return await axios
		.put(s3Link, file, {
			headers: {
				ContentType: file.type,
			},
		})
		.then((res) => ({
			res,
			status: 'Uploaded',
		}))
		.catch((error) => ({
			error,
			status: 'Rejected',
			reason: error.message,
		}))
}
