'use client';
import { useChat } from 'ai/react';
import React, { useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { SendIcon } from 'lucide-react';
import MessageList from './message-list';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Message } from 'ai';

type Props = { chatId: number };

const ChatBox = ({ chatId }: Props) => {
	const { data, isLoading } = useQuery({
		queryKey: ['chat', chatId],
		queryFn: async () => {
			const response = await axios.post<Message[]>('/api/get-messages', {
				chatId,
			});
			return response.data;
		},
	});

	const { input, handleInputChange, handleSubmit, messages } = useChat({
		api: '/api/chat',
		body: {
			chatId,
		},
		initialMessages: data || [],
	});
	useEffect(() => {
		const messageContainer = document.getElementById('message-container');
		if (messageContainer) {
			messageContainer.scrollTo({
				top: messageContainer.scrollHeight,
				behavior: 'smooth',
			});
		}
	});

	return (
		<div
			className='relative max-h-screen overflow-scroll'
			id='message-container'
		>
			<div className='sticky top-0 inset-x-0 p-2 bg-white h-fit'>
				<h3 className='text-xl font-bold'>Chat</h3>
			</div>

			<MessageList messages={messages} isLoading={isLoading} />

			<form
				onSubmit={handleSubmit}
				className='sticky bottom-0 inset-x-0 px-2 py-4 bg-white flex pt-4'
			>
				<Input
					value={input}
					onChange={handleInputChange}
					placeholder='Have a chat with me about your PDF...'
					className='w-full'
				/>
				<Button className='bg-purple-600 ml-2'>
					<SendIcon className='h-4 w-4' />
				</Button>
			</form>
		</div>
	);
};

export default ChatBox;
