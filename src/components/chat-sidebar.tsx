'use client';

import { DrizzleChat } from '@/lib/db/schema';
import Link from 'next/link';
import React, { useCallback, useState } from 'react';
import { Button } from './ui/button';
import {
	Trash2,
	MessageCircle,
	PlusCircleIcon,
	LoaderIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose,
} from '@/components/ui/dialog';
import { chats } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';
// import SubscriptionButton from './subscription-button';

// TODO: Put into a layout file as it makes more sense to put this here rather than in a component page
// TODO: Delete PDF - delete PDF from S3 and use filekey to delete from Pinecone vector DB too
// TODO: Create page to show all PDFs, if there is no filekey for the chats/messages, create a new chat and then use filekey for Pinecone DB

type ChatSideBarProps = {
	chatsList: DrizzleChat[];
	chatId: number;
	// isPro: boolean;
	userId: string;
};

const ChatSideBar = ({
	chatsList,
	chatId,
	userId,
}: // isPro,

ChatSideBarProps) => {
	const router = useRouter();
	const [status, setStatus] = useState<
		'loading' | 'success' | 'error' | 'inactive'
	>('inactive');
	const [errorMessage, setErrorMessage] = useState<string>('');

	// const handleSubscription = async () => {
	// 	try {
	// 		setLoading(true);
	// 		const response = await axios.get('/api/stripe');
	// 		// Redirection to Stripe
	// 		window.location.href = response.data.url;
	// 	} catch (error) {
	// 		console.error(error);
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

	// TODO: Ask James - do I make a redirect and fetch all the new chats, or do I just update the in-browser memory by removing the chat from the
	// chats that have already been pulled through?
	// Pros: less calls to db, thus less waiting and room for error
	// Cons: may not show an error in the db if we remove from there
	const checkNewChats = useCallback(async () => {
		try {
			const _chats = await db
				.select()
				.from(chats)
				.where(eq(chats?.userId, userId));
			console.log(_chats);

			if (!_chats) {
				setStatus('error');
				return router.push('/');
			} else {
				setStatus('success');
				return router.push(`/chats/${_chats[0]?.id}`);
			}
		} catch (error) {
			setStatus('error');
			return router.push('/');
		}
	}, [router, userId]);

	const handleDelete = async (chatId: number) => {
		setStatus('loading');
		const response = await axios.post('/api/delete-chat', { chatId });
		if (response.status === 200) {
			checkNewChats();
		} else {
			setStatus('error');
			setErrorMessage(response.statusText);
		}

		return response.data;
	};
	return (
		<div className='w-72 h-screen p-4 text-gray-200 bg-gray-900'>
			<Link href='/'>
				<Button className='w-full border-dashed border-white border'>
					<PlusCircleIcon className='mr-2 w-4 h-4' /> New Chat
				</Button>
			</Link>

			<>
				<div className='flex flex-col gap-2 mt-4'>
					{chatsList.map((chat) => (
						<div
							key={chat.id}
							className='group flex  place-content-between'
						>
							<Link href={`/chats/${chat.id}`}>
								<div
									className={cn(
										'rounded-lg p-3 text-slate-300 flex items-center max-w-48',
										{
											'bg-purple-600': chat.id === chatId,
											'hover:text-white':
												chat.id !== chatId,
										}
									)}
								>
									<MessageCircle className='mr-2' />
									<p className='w-full overflow-hidden text-sm truncate whitespace-nowrap text-ellipsis'>
										{chat.pdfName}
									</p>
								</div>
							</Link>
							<Dialog>
								<DialogTrigger asChild>
									<Button
										variant={'link'}
										className={`justify-end bg-transparent hidden group-hover:block text-red-800 hover:text-red-600`}
									>
										<Trash2 className='w-5 justify-end' />
									</Button>
								</DialogTrigger>
								<DialogContent className='sm:max-w-[425px]'>
									{status === 'inactive' && (
										<>
											<DialogHeader>
												<DialogTitle className='my-2'>
													Delete Chat
												</DialogTitle>
												<DialogDescription className='my-2'>
													You&apos;re going to delete
													the chat about &quot;
													{chat.pdfName}
													&quot;. Are you sure you
													want to delete this?
												</DialogDescription>
											</DialogHeader>
											<DialogFooter>
												<DialogClose asChild>
													<Button>
														No, Keep it.
													</Button>
												</DialogClose>
												<Button
													variant='destructive'
													onClick={() =>
														handleDelete(chat.id)
													}
												>
													Yes, Delete!
												</Button>
											</DialogFooter>
										</>
									)}

									{status === 'error' && (
										<>
											<DialogHeader>
												<DialogTitle className='my-2'>
													Error
												</DialogTitle>
												<DialogDescription className='my-2'>
													An error occurred deleting
													&quot;
													{chat.pdfName}
													&quot;. Please try again
													later.
												</DialogDescription>
											</DialogHeader>
											<DialogFooter>
												<DialogClose asChild>
													<Button>
														Back to chats
													</Button>
												</DialogClose>
											</DialogFooter>
										</>
									)}

									{status === 'loading' && (
										<DialogHeader>
											<DialogTitle className='my-2'>
												Deleting...
											</DialogTitle>
											<DialogDescription className='my-2'>
												<LoaderIcon />
												Deleting {chat.pdfName}...
											</DialogDescription>
										</DialogHeader>
									)}
								</DialogContent>
							</Dialog>
						</div>
					))}
				</div>
				<div className='absolute bottom-4 left-4'>
					<div className='flex items-center gap-2 text-sm text-slate-500 flex-wrap'>
						<Link href='/'>Home</Link>
						<Link href='https://github.com/mazzilio/gpt-pdf-chatbot'>
							Source
						</Link>
						<p>mazzilio</p>
					</div>
					{/* Stripe integration has been removed because AI SaaS is a disease to man*/}
					{/* <SubscriptionButton isPro={isPro} /> */}
				</div>
			</>
		</div>
	);
};

export default ChatSideBar;
