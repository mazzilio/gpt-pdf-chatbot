import { db } from '@/lib/db';
import { chats, messages } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
	const { userId } = auth();

	if (!userId) {
		return NextResponse.json(
			{ error: 'Unauthorized user, please log in or create an account.' },
			{ status: 401 }
		);
	}

	const { chatId } = await req.json();
	try {
		// delete messages first
		const deletedMessages = await db
			.delete(messages)
			.where(eq(messages.chatId, chatId))
			.returning({ deletedMessages: messages.id });

		// then delete chat
		const deletedChatId = await db
			.delete(chats)
			.where(eq(chats.id, chatId))
			.returning({ deletedId: chats.id });
		return NextResponse.json(
			{ deleted_chat: deletedChatId, deleted_messages: deletedMessages },
			{ status: 200 }
		);
	} catch (error) {
		return NextResponse.json(
			{
				error: `API Error - Problem occurred deleting Chat ${chatId}: ${error}`,
			},
			{ status: 500 }
		);
	}
};
