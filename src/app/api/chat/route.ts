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
	apiKey: process.env.NEXT_PUBLIC_OPEN_AI_API_KEY as string,
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
			content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
			The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
			AI is a well-behaved and well-mannered individual.
			AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
			AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
			AI assistant is a big fan of Pinecone and Vercel.
			Context: 
			<context>
			${context}
			</context>
			AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
			If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
			AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
			AI assistant will not invent anything that is not drawn directly from the context.
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
