'use client';
import React, { useState } from 'react';
import { Button } from './ui/button';
import axios from 'axios';
import { BadgeDollarSign } from 'lucide-react';

type SubscriptionButtonProps = { isPro: boolean };

const SubscriptionButton = ({ isPro }: SubscriptionButtonProps) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	// TODO: Put into a utils function as it's used 3x
	const handleSubscription = async () => {
		try {
			setIsLoading(true);
			const response = await axios.get('/api/stripe');
			window.location.href = response.data.url;
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};
	return (
		<Button
			disabled={isLoading}
			onClick={handleSubscription}
			variant='ghost'
		>
			{isPro ? 'Manage Subscriptions' : 'Get Pro'}
			<BadgeDollarSign className='ml-2' />
		</Button>
	);
};

export default SubscriptionButton;
