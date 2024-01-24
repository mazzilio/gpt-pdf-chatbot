import { OpenAIApi, Configuration } from 'openai-edge';

const config = new Configuration({
	organization: '',
	apiKey: process.env.NEXT_PUBLIC_OPEN_AI_API_KEY as string,
});

const openAI = new OpenAIApi(config);

export const getEmbeddings = async (text: string) => {
	try {
		// TODO: Put into URL config file
		const response = await openAI.createEmbedding({
			model: 'text-embedding-ada-002',
			input: text.replace(/\n/g, ''),
		});
		const result = await response.json();

		// Vectors

		return result?.data[0]?.embedding as number[];
	} catch (error) {
		throw error;
	}
};
