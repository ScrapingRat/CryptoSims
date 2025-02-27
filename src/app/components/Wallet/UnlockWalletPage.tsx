'use client';

import { useState, useEffect } from 'react';
import unlockWallet from 'lib/actions/unlockWallet';
import getWallet from 'lib/actions/getWallet';
import isAuth from 'lib/actions/isAuth';

const UnlockWalletPage = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Add loading state for auth check
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [seedPhrase, setSeedPhrase] = useState('');
	const [isUnlocked, setIsUnlocked] = useState(false);
	const [balance, setBalance] = useState<number | null>(null);

	// Check authentication status on component mount
	useEffect(() => {
		async function checkAuth() {
			setIsCheckingAuth(true); // Start checking
			try {
				const authenticated = await isAuth();
				setIsUnlocked(authenticated);

				// If already authenticated, fetch the wallet
				if (authenticated) {
					fetchWallet();
				}
			} catch (error) {
				console.error("Auth check failed:", error);
			} finally {
				setIsCheckingAuth(false); // Done checking
			}
		}

		checkAuth();
	}, []);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setIsLoading(true);
		setError('');
		setMessage('');

		try {
			const formData = new FormData();
			formData.append('seedPhrase', seedPhrase);

			const response = await unlockWallet(formData);

			if (response.error) {
				setError(response.error);
			} else {
				setMessage(response.message || 'Wallet unlocked successfully!');
				setSeedPhrase('');
				setIsUnlocked(true);
			}
		} catch (err) {
			setError('An unexpected error occurred');
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	}

	const fetchWallet = async () => {
		try {
			const result = await getWallet();

			if (result.error) {
				setError(result.error);
				return;
			}

			if (result.wallet) {
				setBalance(result.wallet.balance);
			}
		} catch (err) {
			setError('Failed to fetch wallet balance');
			console.error(err);
		}
	};

	useEffect(() => {
		if (isUnlocked) {
			fetchWallet();
		}
	}, [isUnlocked]);

	// Show loading state while checking authentication
	if (isCheckingAuth) {
		return (
			<div className="flex justify-center items-center min-h-[200px]">
				<div className="animate-pulse text-accent2">
					<p>Checking wallet status...</p>
				</div>
			</div>
		);
	}

	if (isUnlocked) {
		return (
			<div className="space-y-6">
				<div className="p-4 bg-green-800/20 border border-green-500 rounded-lg">
					<h2 className="text-xl font-bold text-white mb-2">
						Wallet Unlocked
					</h2>
					<p className="text-green-400">{message}</p>
				</div>

				<div className="p-6 border border-accent2 rounded-lg bg-background/50">
					<h3 className="text-lg font-medium text-white mb-4">
						Your Wallet
					</h3>

					{balance !== null ? (
						<div className="space-y-4">
							<div>
								<p className="text-gray-400">Balance:</p>
								<p className="text-xl font-bold text-white">
									{balance}
								</p>
							</div>

							<div className="flex justify-end mt-6">
								<button
									onClick={() => setIsUnlocked(false)}
									className="py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
									Lock Wallet
								</button>
							</div>
						</div>
					) : (
						<p className="text-gray-300">
							Loading wallet information...
						</p>
					)}
				</div>
			</div>
		);
	}

	return (
		<form
			id="wallet-form"
			className="space-y-6"
			onSubmit={handleSubmit}
			noValidate>
			<div>
				<label
					htmlFor="seed"
					className="block text-sm font-medium text-gray-300 mb-2">
					Enter your seed phrase or create a new wallet
				</label>
				<textarea
					id="seed"
					className="w-full p-3 border border-accent2 rounded-lg bg-background text-white focus:ring-2 focus:ring-accent2 focus:outline-none"
					rows={3}
					placeholder="Enter your 12-word seed phrase..."
					value={seedPhrase}
					onChange={(e) => setSeedPhrase(e.target.value)}
					required
				/>
				{error && <p className="mt-2 text-sm text-red-500">{error}</p>}
				{message && (
					<p className="mt-2 text-sm text-green-500">{message}</p>
				)}
				<p className="mt-2 text-sm text-gray-400">
					Your seed phrase is the 12-word recovery phrase that unlocks
					your wallet. Keep it safe and never share it with anyone.
				</p>
			</div>
			<div className="flex gap-4">
				<button
					type="submit"
					disabled={isLoading}
					className="flex-1 py-3 px-4 bg-accent2 text-white rounded-lg hover:bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
					{isLoading ? 'Unlocking...' : 'Unlock Wallet'}
				</button>
			</div>
		</form>
	);
};

export default UnlockWalletPage;
