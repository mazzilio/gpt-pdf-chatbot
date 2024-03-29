import { cn } from '@/lib/utils';
import { Message } from 'ai/react';
import { Loader2 } from 'lucide-react';
import React from 'react';

type Props = { messages: Message[]; isLoading: boolean };

const MessageList = ({ messages, isLoading }: Props) => {
	if (!messages) return <></>;

	if (isLoading) {
		return (
			<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
				<Loader2 className='w-6 h-6 animate-spin' />
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-2 p-4'>
			{messages.map((message) => {
				return (
					<div
						className={cn('flex mt-2', {
							'justify-end pl-10': message.role === 'user',
							'justify-start pr-10': message.role === 'assistant',
						})}
						key={message.id}
					>
						<div
							className={cn(
								'rounded-lg px-3 text-sm py-1 shadow-md ring-1 ring-gray-900/10',
								{
									'bg-purple-600 text-white':
										message.role === 'user',
								}
							)}
						>
							<p className=''>{message.content}</p>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default MessageList;
