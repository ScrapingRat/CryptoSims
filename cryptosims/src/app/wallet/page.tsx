'use client';
import { useState } from 'react';

export default function Wallet() {
	const [seed, setSeed] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (seed.trim().length < 12) {
			setError('Seed phrase must be at least 12 words');
			return;
		}
		// Handle wallet unlock logic here
	};

	return (
		<div className="pt-16 min-h-screen bg-background">
			<div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
				<div className="py-8">
					<div className="flex flex-col items-center justify-between gap-4">
						<h1 className="text-3xl font-bold content-center text-center">
							Wallet
						</h1>
						<div className="w-full max-w-md">
							<form onSubmit={handleSubmit} className="space-y-6">
								<div>
									<label
										htmlFor="seed"
										className="block text-sm font-medium text-gray-300 mb-2">
										Enter your seed phrase or create a new
										wallet
									</label>
									<textarea
										id="seed"
										value={seed}
										onChange={(e) =>
											setSeed(e.target.value)
										}
										className="w-full p-3 border border-accent2 rounded-lg bg-background text-white focus:ring-2 focus:ring-accent2 focus:outline-none"
										rows={3}
										placeholder="Enter your 12-word seed phrase..."
									/>
									{error && (
										<p className="mt-2 text-sm text-red-500">
											{error}
										</p>
									)}
									<p className="mt-2 text-sm text-gray-400">
										Your seed phrase is the 12-word recovery
										phrase that unlocks your wallet. Keep it
										safe and never share it with anyone.
									</p>
								</div>
								<div className="flex gap-4">
									<button
										type="submit"
										className="flex-1 py-3 px-4 bg-accent2 text-white rounded-lg hover:bg-hover transition-colors">
										Unlock Wallet
									</button>
									<button
										type="button"
										onClick={() => {
											/* Handle create wallet logic */
										}}
										className="flex-1 py-3 px-4 border border-accent2 text-white rounded-lg hover:bg-hover transition-colors">
										Create New Wallet
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
