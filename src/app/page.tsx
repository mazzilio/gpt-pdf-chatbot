import FileUpload from '@/components/file-upload';
import SubscriptionButton from '@/components/subscription-button';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { checkSubscription } from '@/lib/stripe/subscription';
import { UserButton, auth } from '@clerk/nextjs';
import { eq } from 'drizzle-orm';
import { ArrowRight, ArrowRightCircleIcon, LogInIcon } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
	const { userId } = auth();
	const isAuth = !!userId;
	// const isPro = await checkSubscription();

	// TODO: Smelly code, refactor this and put into a utils
	// Create folder to put all db calls and utils
	let firstChat;
	if (userId) {
		firstChat = await db
			.select()
			.from(chats)
			.where(eq(chats.userId, userId));

		if (firstChat) {
			firstChat = firstChat[0];
		}
	}

	return (
		<div className='w-screen min-h-screen bg-gradient-to-l from-indigo-300 to-purple-400'>
			<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
				<div className='flex flex-col items-center text-center'>
					<div className='flex items-center'>
						<h1 className='mr-3 text-5xl font-semibold'>
							Talk to your PDFs
						</h1>
						<UserButton afterSignOutUrl='/' />
					</div>

					<div className='flex mt-5'>
						{isAuth && firstChat && (
							<Link href={`/chats/${firstChat.id}`}>
								<Button>
									Go to Chats
									<ArrowRightCircleIcon className='ml-2' />
								</Button>
							</Link>
						)}
						{/* <div className='ml-3'>
							<SubscriptionButton isPro={isPro} />
						</div> */}
					</div>
					<p className='max-w-xl mt-4 text-lg text-slate-600'>
						Instantly understand documentation, research, and any
						text with PDFBot.
					</p>
					<div className='w-full mt-4'>
						{isAuth ? (
							<FileUpload />
						) : (
							<Link href='/sign-in'>
								<Button>
									Login to get started!
									<LogInIcon className='w-4 h-4 ml-2' />
								</Button>
							</Link>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
