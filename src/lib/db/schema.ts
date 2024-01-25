import {
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
	integer,
	pgEnum,
} from 'drizzle-orm/pg-core';

// npx drizzle-kit push:pg

export const userSystemEnum = pgEnum('user_system_enum', ['system', 'user']);

export const chats = pgTable('chats', {
	id: serial('id').primaryKey(),
	pdfName: text('pdf_name').notNull(),
	pdfUrl: text('pdf_url').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	userId: varchar('user_id', { length: 256 }).notNull(),
	// IDs file from S3 using key
	fileKey: text('file_key').notNull(),
});

export type DrizzleChat = typeof chats.$inferSelect;

export const messages = pgTable('messages', {
	id: serial('id').primaryKey(),
	// One-to-many relationship created (FK Reference)
	chatId: integer('chat_id')
		.references(() => chats.id)
		.notNull(),
	content: text('content').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	// TODO: Default the value
	role: userSystemEnum('role').notNull(),
});

export const userSubscription = pgTable('user_subscriptions', {
	id: serial('id').primaryKey(),
	userId: varchar('user_id', { length: 256 }).notNull().unique(),
	stripeCustomerId: varchar('stripe_customer_id', { length: 256 })
		.notNull()
		.unique(),
	stripeSubscriptionId: varchar('stripe_subscription_id', {
		length: 256,
	}).unique(),
	stripePriceId: varchar('stripe_price_id', { length: 256 }),
	stripeCurrentPeriodEnd: timestamp('stripe_current_period_end'),
});
