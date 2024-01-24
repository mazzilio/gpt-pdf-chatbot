import './globals.css';
import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'PDFBot',
	description:
		'Your personal PDF Bot to read, understand and answer questions about your PDFs. ',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider>
			<Providers>
				<html lang='en'>
					<body className={inter.className}>{children}</body>
					<Toaster />
				</html>
			</Providers>
		</ClerkProvider>
	);
}
