'use client';

import Header from './components/Header';
import Wallet from './components/Wallet';

export default function Home() {
	return (
		<div className="pt-16 min-h-screen bg-background">
			<div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
				<div className="py-8">
					<div className="flex flex-col items-center justify-between gap-4">
						<Header />
						<Wallet />
					</div>
				</div>
			</div>
		</div>
	);
}
