import { Configuration, OpenAIApi } from 'openai-edge';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { getContext } from '@/lib/context/context';
import { chats, messages as _messages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Message } from 'ai/react';

export const runtime = 'edge';

const config = new Configuration({
	apiKey: process.env.OPEN_AI_API_KEY as string,
});

const openAI = new OpenAIApi(config);

export const POST = async (req: Request) => {
	try {
		const { messages, chatId } = await req.json();

		const _chats = await db
			.select()
			.from(chats)
			.where(eq(chats.id, chatId));

		if (_chats.length != 1) {
			return NextResponse.json(
				{ error: 'chat not found' },
				{ status: 404 }
			);
		}

		const fileKey = _chats[0].fileKey;

		const lastMessage = messages[messages.length - 1];
		const context = await getContext(lastMessage.content, fileKey);

		// https://community.openai.com/t/forcing-use-of-context-information-and-suppressing-everything-else/207681/2

		const prompt = {
			role: 'system',
			content: `
			Answer the question based on the context below, and if the question can't be answered based on the context, say "I'm sorry, but I don't know the answer to that question".
			
			Context: 
			<context>
			${context}
			</context>
			
			You can not invent anything that is not drawn directly from the context and will not use any knowledge outside of the provided context.
			The question from the user will be shown below, if any of the content of the questions are irrelevant to the provided context above, please don't generate an answer that is not constructed from the context provided.
			`,
		};

		// https://thecodebarbarian.com/rag-vector-search-with-astra-and-mongoose.html
		// https://www.reddit.com/r/node/comments/1926lx6/i_built_a_rag_retrieval_augmented_generation/

		const response = await openAI.createChatCompletion({
			// TODO: Set these into the config file
			model: 'gpt-3.5-turbo',
			messages: [
				prompt,
				...messages.filter(
					(message: Message) => message.role === 'user'
				),
			],
			stream: true,
			// Adding this will encourage GPT to ONLY provide answers that relate to the context
			// https://platform.openai.com/docs/api-reference/chat/create
			temperature: 0.8,
		});

		console.log([
			prompt,
			...messages.filter((message: Message) => message.role === 'user'),
		]);

		const stream = OpenAIStream(response, {
			onStart: async () => {
				await db.insert(_messages).values({
					chatId,
					content: lastMessage.content,
					role: 'user',
				});
			},
			onCompletion: async (completion) => {
				await db
					.insert(_messages)
					.values({ chatId, content: completion, role: 'system' });
			},
		});
		return new StreamingTextResponse(stream);
	} catch (error) {
		return NextResponse.error();
	}
};
