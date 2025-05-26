'use client';

import { useState } from 'react';
import apiClient from 'lib/apiClient';

interface UnlockWalletPageProps {
	isUnlocking: boolean;
	setIsUnlocking: React.Dispatch<React.SetStateAction<boolean>>;
	onWalletUnlocked: () => void;
}

const UnlockWalletPage = ({
	isUnlocking,
	setIsUnlocking,
	onWalletUnlocked,
}: UnlockWalletPageProps) => {
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [seedPhrase, setSeedPhrase] = useState('');
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError('');
		setMessage('');

		try {
			interface UnlockResponse {
				message: string;
				expiresIn?: number;
			}

			const { data, error, errorMessage } =
				await apiClient<UnlockResponse>('api/unlock', 'POST', {
					auth: false,
					body: JSON.stringify({ seedPhrase }),
				});

			if (error) {
				setLoading(false);
				setError(errorMessage || error);
				return;
			}
			setLoading(false);
			setMessage(data?.message || 'Wallet unlocked successfully!');
			setSeedPhrase('');
			setIsUnlocking(false);
			if (onWalletUnlocked) {
				onWalletUnlocked();
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
					className="space-y-6 sm:space-y-4"
					onSubmit={handleSubmit}
					noValidate>
					<div>
						<label
							htmlFor="seed"
							className="block text-sm font-medium text-gray-300 mb-2">
							Enter your seed phrase
						</label>
						<div className="relative">
							<textarea
								id="seed"
								className="w-full p-3 border border-accent2 rounded-lg bg-background text-white focus:ring-2 focus:ring-accent2 focus:outline-none pr-12 min-h-[72px]"
								rows={3}
								placeholder="Enter your 12-word seed phrase..."
								value={seedPhrase}
								onChange={(e) => setSeedPhrase(e.target.value)}
								required
							/>
							<button
								type="button"
								onClick={async () => {
									try {
										if (
											typeof navigator !== 'undefined' &&
											navigator.clipboard &&
											window.isSecureContext
										) {
											const text =
												await navigator.clipboard.readText();
											setSeedPhrase(text);
										} else {
											setError(
												'Clipboard API not supported in this browser.'
											);
										}
									} catch (err) {
										console.error('Failed to paste: ', err);
									}
								}}
								className="absolute right-3 top-3 p-1.5 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded transition-colors"
								title="Paste from clipboard"
								style={{ zIndex: 2 }}>
								{/* Paste icon */}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5"
									viewBox="0 0 20 20"
									fill="currentColor"
									role="img"
									aria-label="Paste from clipboard">
									<path d="M8 2a2 2 0 00-2 2v1H5a2 2 0 00-2 2v9a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H8zm0 2V4h4V4a1 1 0 01-1 1H9A1 1 0 018 4z" />
								</svg>
							</button>
						</div>
						{loading && (
							<p className="mt-2 text-sm text-yellow-500">
								Unlocking wallet...
							</p>
						)}
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
					className="mt-4 sm:mt-6 w-full max-w-md mx-auto flex-1 py-3 px-4 bg-accent2 text-white rounded-lg hover:bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
					Cancel
				</button>
			</div>
		);
};

export default UnlockWalletPage;
