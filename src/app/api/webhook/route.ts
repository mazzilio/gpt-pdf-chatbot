import { db } from '@/lib/db';
import { userSubscription } from '@/lib/db/schema';
import { stripeSession } from '@/lib/stripe/stripe';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const POST = async (req: Request) => {
	const body = await req.text();
	const signature = headers().get('Stripe-Signature') as string;

	let event: Stripe.Event;

	try {
		event = stripeSession.webhooks.constructEvent(
			body,
			signature,
			process.env.STRIPE_WEBHOOK_SIGNIN_SECRET as string
		);
	} catch (error) {
		return new NextResponse('webhook error', { status: 400 });
	}

	const session = event.data.object as Stripe.Checkout.Session;

	// new subscription made
	if (event.type === 'checkout.session.completed') {
		const subscription = await stripeSession.subscriptions.retrieve(
			session.subscription as string
		);

		if (!session?.metadata?.userId) {
			return new NextResponse('no userId', { status: 400 });
		}

		await db.insert(userSubscription).values({
			userId: session.metadata.userId,
			stripeSubscriptionId: subscription.id,
			stripeCustomerId: subscription.customer as string,
			stripePriceId: subscription.items.data[0].price.id,
			stripeCurrentPeriodEnd: new Date(
				subscription.current_period_end * 1000
			),
		});
	}

	if (event.type === 'invoice.payment_succeeded') {
		const subscription = await stripeSession.subscriptions.retrieve(
			session.subscription as string
		);

		await db
			.update(userSubscription)
			.set({
				stripePriceId: subscription.items.data[0].price.id,
				stripeCurrentPeriodEnd: new Date(
					subscription.current_period_end * 1000
				),
			})
			.where(eq(userSubscription.stripeSubscriptionId, subscription.id));
	}

	// So the Webhook knows it finishes its' job
	return new NextResponse(null, { status: 200 });
};
