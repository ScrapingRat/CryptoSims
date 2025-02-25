import type { Metadata } from 'next';
import './globals.css';
import Navbar from './components/Navbar';

export const metadata: Metadata = {
	title: 'CryptoSims',
	description: 'Virtual wallet companion'
};

export default function RootLayout({
	children
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>
				<header>
					<Navbar />
				</header>
				<main>{children}</main>
			</body>
		</html>
	);
}
