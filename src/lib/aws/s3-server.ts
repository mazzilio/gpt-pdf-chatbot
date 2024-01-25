import { S3 } from '@aws-sdk/client-s3';
import fs from 'fs';

export const downloadFromS3 = async (file_key: string): Promise<string> => {
	return new Promise(async (resolve, reject) => {
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

			const params = {
				Bucket: process.env.NEXT_PUBLIC_AWS_S3_NAME as string,
				Key: file_key,
			};

			const obj = await s3.getObject(params);
			const file_name = `/tmp/pdf-${Date.now}.pdf`;

			if (obj.Body instanceof require('stream').Readable) {
				// https://github.com/aws/aws-sdk-js-v3/issues/843
				// open the writable stream and write the file
				const file = fs.createWriteStream(file_name);
				file.on('open', function (fd) {
					// @ts-ignore
					obj.Body?.pipe(file).on('finish', () => {
						return resolve(file_name);
					});
				});
				// obj.Body?.pipe(fs.createWriteStream(file_name));
			}
		} catch (error) {
			reject(error);
			return null;
		}
	});
};
