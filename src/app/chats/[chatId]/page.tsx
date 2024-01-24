import ChatBox from '@/components/chat-box';
import ChatSideBar from '@/components/chat-sidebar';
import PDFViewer from '@/components/pdf-viewer';
import { db } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import React from 'react';

type ChatPageProps = {
	params: {
		chatId: string;
	};
};

const ChatPage = async ({ params: { chatId } }: ChatPageProps) => {
	const { userId } = await auth();

	if (!userId) {
		return redirect('/sign-in');
	}

	// TODO: Abstract SQL Queries into a separate folder in the lib/db folder
	const _chats = await db
		.select()
		.from(chats)
		.where(eq(chats?.userId, userId));

	if (!_chats) {
		return redirect('/');
	}

	if (!_chats.find((chat) => chat?.id === parseInt(chatId))) {
		return redirect('/');
	}

	const currentChat = _chats.find((chat) => chat?.id === parseInt(chatId));

	return (
		<div className='flex max-h-screen overflow-scroll'>
			<div className='flex w-full max-h-screen overflow-scroll'>
				<div className='flex-[1] max-w-xs'>
					<ChatSideBar chats={_chats} chatId={parseInt(chatId)} />
				</div>
				<div className='max-h-screen p-4 overflow-scroll flex-[5]'>
					<PDFViewer pdf_url={currentChat?.pdfUrl || ''} />
				</div>
				{/* Chat component */}
				<div className='flex-[3] border-l-4 border-l-slate-200'>
					<ChatBox chatId={parseInt(chatId)} />
				</div>
			</div>
		</div>
	);
};

export default ChatPage;
