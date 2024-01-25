import { S3, PutObjectCommandOutput } from '@aws-sdk/client-s3';

export const uploadToS3 = async (
	file: File
): Promise<{ file_key: string; file_name: string }> => {
	return new Promise((resolve, reject) => {
		try {
			const s3 = new S3({
				region: process.env.NEXT_PUBLIC_AWS_REGION as string,
				credentials: {
					accessKeyId: process.env
						.NEXT_PUBLIC_AWS_ACCESS_KEY as string,
					secretAccessKey: process.env
						.NEXT_PUBLIC_AWS_SECRET_KEY as string,
				},
			});

			const file_key =
				'uploads/' +
				Date.now().toString() +
				file.name.replace(/\s/g, '-');

			const params = {
				Bucket: process.env.AWS_S3_NAME as string,
				Key: file_key,
				Body: file,
			};
			s3.putObject(
				params,
				(err: any, data: PutObjectCommandOutput | undefined) => {
					return resolve({
						file_key,
						file_name: file.name,
					});
				}
			);
		} catch (error) {
			reject(error);
		}
	});
};

export const getS3Url = (file_key: string) => {
	// TODO: Import a config file for the URLs that will be used
	const url = `https://${process.env.AWS_S3_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${file_key}`;
	return url;
};
