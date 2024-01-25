'use client';

// TODO: Rehydration error happens in here, resolve
import { uploadToS3 } from '@/lib/aws/s3';
import { useMutation } from '@tanstack/react-query';
import { InboxIcon, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const FileUpload = (): React.JSX.Element => {
	const router = useRouter();
	// TODO: Create type for below
	const [uploading, setUploading] = useState<boolean>(false);
	const { mutate, isPending } = useMutation({
		mutationFn: async ({
			file_key,
			file_name,
		}: {
			file_key: string;
			file_name: string;
		}) => {
			// TODO: Remove Axios and use fetch instead
			const response = await axios.post('/api/create-chat', {
				file_key,
				file_name,
			});
			return response.data;
		},
	});

	const { getRootProps, getInputProps } = useDropzone({
		accept: { 'application/pdf': ['.pdf'] },
		maxFiles: 1,
		// TODO: Put into function ABOVE the property
		onDrop: async (acceptedFiles) => {
			const file = acceptedFiles[0];
			if (file.size > 10 * 1024 * 1024) {
				toast.error(
					'File too large. Please upload files smaller than 10MB.'
				);
				return;
			}

			try {
				setUploading(true);
				const data = await uploadToS3(file);
				if (!data?.file_key || !data?.file_name) {
					// TODO: Flesh this out further
					toast.error('Something went wrong');
					return;
				} else {
					mutate(data, {
						onSuccess: ({ chat_id }) => {
							toast.success(
								'GPT Successfully fed! Chat created.'
							);
							router.push(`/chats/${chat_id}`);
						},
						onError: (err) => {
							toast.error('Error creating chat');
							console.error(err);
						},
					});
				}
			} catch (error: unknown) {
				//
			} finally {
				setUploading(false);
			}
		},
	});
	return (
		<div className='p-2 bg-white rounded-xl'>
			<div
				{...getRootProps({
					className:
						'border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col',
				})}
			>
				<input {...getInputProps()} />
				{uploading || isPending ? (
					<>
						<Loader2 className='h-10 w-10 text-purple-500 animate-spin' />
						<p className='mt-2 text-sm text-slate-400'>
							Feeding GPT...
						</p>
					</>
				) : (
					<>
						<InboxIcon className='w-10 h-10 text-purple-500' />
						<p className='mt-2 text-sm text-slate-400'>
							Upload PDF Here
						</p>
					</>
				)}
			</div>
		</div>
	);
};

export default FileUpload;
