import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Set this to whatever env file you're using
dotenv.config({ path: '.env.local' });

// npx drizzle-kit push:pg

export default {
	driver: 'pg',
	schema: './src/lib/db/schema.ts',
	dbCredentials: {
		connectionString: process.env.DATABASE_URL as string,
	},
} satisfies Config;
