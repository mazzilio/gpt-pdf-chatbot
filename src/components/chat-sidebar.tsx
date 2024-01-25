'use client';
import { DrizzleChat } from '@/lib/db/schema';
import Link from 'next/link';
import React, { useState } from 'react';
import { Button } from './ui/button';
import { MessageCircle, PlusCircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';
import SubscriptionButton from './subscription-button';

// TODO: Put into a layout file as it makes more sense to put this here rather than in a component page

type ChatSideBarProps = {
	chats: DrizzleChat[];
	chatId: number;
	isPro: boolean;
};

const ChatSideBar = ({ chats, chatId, isPro }: ChatSideBarProps) => {
	const [loading, setLoading] = useState<boolean>(false);
	const handleSubscription = async () => {
		try {
			setLoading(true);
			const response = await axios.get('/api/stripe');
			// Redirection to Stripe
			window.location.href = response.data.url;
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='w-full h-screen p-4 text-gray-200 bg-gray-900'>
			<Link href='/'>
				<Button className='w-full border-dashed border-white border'>
					<PlusCircleIcon className='mr-2 w-4 h-4' /> New Chat
				</Button>
			</Link>

			<div className='flex flex-col gap-2 mt-4'>
				{chats.map((chat) => (
					<Link key={chat.id} href={`/chats/${chat.id}`}>
						<div
							className={cn(
								'rounded-lg p-3 text-slate-300 flex items-center',
								{
									'bg-purple-600': chat.id === chatId,
									'hover:text-white': chat.id !== chatId,
								}
							)}
						>
							<MessageCircle className='mr-2' />
							<p className='w-full overflow-hidden text-sm truncate whitespace-nowrap text-ellipsis'>
								{chat.pdfName}
							</p>
						</div>
					</Link>
				))}
			</div>
			<div className='absolute bottom-4 left-4'>
				<div className='flex items-center gap-2 text-sm text-slate-500 flex-wrap'>
					<Link href='/'>Home</Link>
					<Link href='https://github.com/mazzilio/gpt-pdf-chatbot'>
						Source
					</Link>
					<p>mazzilio</p>
					{/* Stripe button here */}
				</div>
				{/* <SubscriptionButton isPro={isPro} /> */}
			</div>
		</div>
	);
};

export default ChatSideBar;
