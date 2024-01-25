// /api/stripe;

import { metadata } from '@/app/layout';
import { db } from '@/lib/db';
import { userSubscription } from '@/lib/db/schema';
import { stripeSession } from '@/lib/stripe/stripe';
import { auth, currentUser } from '@clerk/nextjs';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

const returnUrl = (process.env.NEXT_BASE_URL + '/') as string;

export const GET = async () => {
	try {
		const { userId } = await auth();
		const user = await currentUser();

		if (!userId) {
			return new NextResponse('unauthorised', { status: 401 });
		}

		const _userSubscriptions = await db
			.select()
			.from(userSubscription)
			.where(eq(userSubscription.userId, userId));

		if (_userSubscriptions[0] && _userSubscriptions[0].stripeCustomerId) {
			// trying to cancel at the billing portal
			const stripeCancelSession =
				await stripeSession.billingPortal.sessions.create({
					customer: _userSubscriptions[0].stripeCustomerId,
					return_url: returnUrl,
				});
			return NextResponse.json({ url: stripeCancelSession.url });
		}

		// User's First time trying to subscribe
		const stripeNewUserSession =
			await stripeSession.checkout.sessions.create({
				success_url: returnUrl,
				cancel_url: returnUrl,
				payment_method_types: ['card'],
				mode: 'subscription',
				billing_address_collection: 'auto',
				customer_email: user?.emailAddresses[0].emailAddress,
				line_items: [
					{
						price_data: {
							currency: 'GBP',
							product_data: {
								name: 'ChatPDF Pro',
								description: 'Unlimited PDF sessions',
							},
							unit_amount: 500,
							recurring: {
								interval: 'year',
							},
						},
						quantity: 1,
					},
				],
				metadata: { userId },
			});
		return NextResponse.json({ url: stripeNewUserSession.url });
	} catch (error) {
		console.log('stripe error', error);
		return new NextResponse('Internal server error', { status: 500 });
	}
};
