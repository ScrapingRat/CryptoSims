import type { Metadata } from 'next';
import './globals.css';
import { WalletProvider } from './contexts/WalletContext';
import Navbar from './components/Navbar/Navbar';

export const metadata: Metadata = {
	title: 'CryptoSims',
	description: 'Virtual wallet companion',
	appleWebApp: {
		title: 'Cryptosims'
	}
};

export default function RootLayout({
	children
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>
				<WalletProvider>
					<header>
						<Navbar />
					</header>
					<main>{children}</main>
				</WalletProvider>
			</body>
		</html>
	);
}
