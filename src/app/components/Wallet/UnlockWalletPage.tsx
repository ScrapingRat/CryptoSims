'use client';

import { useState } from 'react';
// import unlockWallet from 'lib/actions/unlockWallet';

interface UnlockWalletPageProps {
	isUnlocking: boolean;
	setIsUnlocking: React.Dispatch<React.SetStateAction<boolean>>;
	onWalletUnlocked: () => void;
}

const UnlockWalletPage = ({
	isUnlocking,
	setIsUnlocking,
	onWalletUnlocked
}: UnlockWalletPageProps) => {
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [seedPhrase, setSeedPhrase] = useState('');

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError('');
		setMessage('');

		try {
			const response = await fetch('/api/unlock', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ seedPhrase }),
				credentials: 'same-origin'
			});

			const data = await response.json();

			if (data.error) {
				setError(data.error);
			} else {
				setMessage(data.message || 'Wallet unlocked successfully!');
				setSeedPhrase('');
				setIsUnlocking(false);
				if (onWalletUnlocked) {
					onWalletUnlocked();
				}
			}
		} catch (err) {
			setError('An unexpected error occurred');
			console.error(err);
		}
	}

	if (!isUnlocking) {
		return (
			<div className="flex gap-4">
				<button
					onClick={() => setIsUnlocking(true)}
					type="button"
					className="flex-1 py-3 px-4 bg-accent2 text-white rounded-lg hover:bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
					Unlock wallet
				</button>
			</div>
		);
	} else
		return (
			<div>
				<form
					id="wallet-form"
					className="space-y-6"
					onSubmit={handleSubmit}
					noValidate>
					<div>
						<label
							htmlFor="seed"
							className="block text-sm font-medium text-gray-300 mb-2">
							Enter your seed phrase
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
						{error && (
							<p className="mt-2 text-sm text-red-500">{error}</p>
						)}
						{message && (
							<p className="mt-2 text-sm text-green-500">
								{message}
							</p>
						)}
						<p className="mt-2 text-sm text-gray-400">
							Your seed phrase is the 12-word recovery phrase that
							unlocks your wallet. Keep it safe and never share it
							with anyone.
						</p>
					</div>
					<div className="flex gap-4">
						<button
							type="submit"
							className="flex-1 py-3 px-4 bg-accent2 text-white rounded-lg hover:bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
							Unlock wallet
						</button>
					</div>
				</form>
				<button
					onClick={() => {
						setIsUnlocking(false);
						setSeedPhrase('');
					}}
					type="button"
					className="mt-8 w-full max-w-md mx-auto flex-1 py-3 px-4 bg-accent2 text-white rounded-lg hover:bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
					Cancel
				</button>
			</div>
		);
};

export default UnlockWalletPage;
