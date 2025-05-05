'use client';

import Header from './components/Header';
import Wallet from './components/Wallet';
import Graph from './components/Graph';
import History from './components/History/History';
import { useWallet } from './contexts/WalletContext';

export default function Home() {
	const { isUnlocked } = useWallet();
	return (
		<div className="pt-16 min-h-screen bg-background">
			<div className="max-w-screen-xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-6">
				<div className="py-0">
					<h1 className='sr-only'>CryptoSims</h1>
					<div className="flex flex-col items-center justify-between gap-4">
						{!isUnlocked && <Header />}
						<Wallet />
						{/* <Graph /> */}
						{isUnlocked && <History />}
					</div>
				</div>
			</div>
		</div>
	);
}
