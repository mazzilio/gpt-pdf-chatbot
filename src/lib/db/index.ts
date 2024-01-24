import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
neonConfig.fetchConnectionCache = true;

if (!process.env.NEXT_PUBLIC_DATABASE_URL) {
	throw new Error(
		'Database URL not found, please set a url in your environment variables.'
	);
}

const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL);
export const db = drizzle(sql);
