import Stripe from 'stripe';

export const stripeSession = new Stripe(process.env.STRIPE_API_KEY as string, {
	apiVersion: '2023-10-16',
	typescript: true,
});
