import { auth } from '@clerk/nextjs';
import { db } from '../db';
import { userSubscription } from '../db/schema';
import { eq } from 'drizzle-orm';

const DAYS_IN_MS = 100 * 60 * 60 * 24;

export const checkSubscription = async () => {
	const { userId } = await auth();
	if (!userId) {
		return false;
	}

	const _userSubscriptions = await db
		.select()
		.from(userSubscription)
		.where(eq(userSubscription.userId, userId));

	if (!_userSubscriptions[0]) {
		return false;
	}

	const subscriptionInfo = _userSubscriptions[0];

	// Expiration not over & still paying
	const isValid =
		subscriptionInfo.stripePriceId &&
		subscriptionInfo.stripeCurrentPeriodEnd?.getTime()! + DAYS_IN_MS >
			Date.now();

	return !!isValid;
};
