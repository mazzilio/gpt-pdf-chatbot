import { Pinecone } from '@pinecone-database/pinecone';
import { convertToAscii } from '../utils';
import { getEmbeddings } from '../openai/embeddings';

export const getMatchesFromEmbeddings = async (
	embeddings: number[],
	fileKey: string
) => {
	try {
		const pinecone = new Pinecone({
			apiKey: process.env.PINECONE_API_KEY!,
		});
		const pineconeIndex = await pinecone.Index('pdfbot');

		const namespace = pineconeIndex.namespace(convertToAscii(fileKey));
		const queryResult = await namespace.query({
			topK: 5,
			vector: embeddings,
			includeMetadata: true,
		});

		return queryResult.matches || [];
	} catch (error) {
		console.log('error querying embeddings ', error);
		throw error;
	}
};

export const getContext = async (query: string, fileKey: string) => {
	const queryEmbeddings = await getEmbeddings(query);
	const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

	// If it matches more than 70%, will return
	const qualifiyingDocs = matches.filter(
		(match) => match.score && match.score > 0.7
	);

	type Metadata = {
		text: string;
		pageNumber: number;
	};

	let docs = qualifiyingDocs.map(
		(match) => (match.metadata as Metadata).text
	);

	// Joins 5 vectors together and cuts it down for token limit
	return docs.join('\n').substring(0, 3000);
};
