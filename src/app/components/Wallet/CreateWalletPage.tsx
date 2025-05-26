'use client';

import { useState } from 'react';
import apiClient from 'lib/apiClient';

interface CreateWalletPageProps {
	isCreating: boolean;
	setIsCreating: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateWalletPage = ({
	isCreating,
	setIsCreating,
}: CreateWalletPageProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [seedPhrase, setSeedPhrase] = useState('');
	const [error, setError] = useState('');
	const [copied, setCopied] = useState(false);

	const copyToClipboard = async () => {
		try {
			if (
				typeof navigator !== 'undefined' &&
				navigator.clipboard &&
				window.isSecureContext
			) {
				await navigator.clipboard.writeText(seedPhrase);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			} else {
				// Fallback for unsupported environments
				const textArea = document.createElement('textarea');
				textArea.value = seedPhrase;
				textArea.style.position = 'fixed';
				textArea.style.left = '-9999px';
				document.body.appendChild(textArea);
				textArea.focus();
				textArea.select();
				document.execCommand('copy');
				document.body.removeChild(textArea);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			}
		} catch (err) {
			console.error('Failed to copy: ', err);
		}
	};

	const handleCreateWallet = async () => {
		setIsLoading(true);
		setError('');

		try {
			interface CreateResponse {
				seedPhrase: string;
				balanceFiat: number;
			}

			const { data, error } = await apiClient<CreateResponse>(
				'api/create',
				'POST',
				{
					body: JSON.stringify({ seedPhrase }),
				}
			);

			if (error) {
				setError(error);
			} else if (data?.seedPhrase && data?.balanceFiat !== undefined) {
				setSeedPhrase(data?.seedPhrase);
			}
		} catch (err) {
			console.error('Error creating wallet:', err);
			setError('Failed to create wallet');
		} finally {
			setIsLoading(false);
		}
	};

	if (!isCreating) {
		return (
			<div className="flex gap-4">
				<button
					onClick={() => {
						if (!isCreating) {
							setIsCreating(true);
							handleCreateWallet();
						} else {
							setIsCreating(false);
						}
					}}
					disabled={isLoading}
					type="button"
					className="flex-1 py-3 px-4 bg-accent2 text-white rounded-lg hover:bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
					{isLoading ? 'Creating...' : 'Create Wallet'}
				</button>
			</div>
		);
	} else if (isCreating) {
		return (
			<>
				<div className="space-y-6">
					{seedPhrase && (
						<div className="p-4 bg-green-800/20 border border-green-500 rounded-lg">
							<h2 className="text-xl font-bold text-white mb-2">
								Wallet Created!
							</h2>
							<div className="mb-4">
								<p className="text-sm text-gray-300 mb-1">
									Your Seed Phrase (Save this securely, it
									will not be shown again):
								</p>
								<div className="relative p-3 bg-gray-900 rounded group">
									<p className="font-mono text-amber-400 break-all pr-10">
										{seedPhrase}
									</p>
									<button
										onClick={copyToClipboard}
										className="absolute right-2 top-2 p-1.5 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded transition-colors"
										title="Copy to clipboard">
										{copied ? (
											<>
												{/* Checkmark icon */}
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="h-5 w-5 text-green-500"
													viewBox="0 0 20 20"
													fill="currentColor"
													role="img"
													aria-label="Copied to clipboard">
													<path
														fillRule="evenodd"
														d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
														clipRule="evenodd"
													/>
												</svg>
											</>
										) : (
											<>
												{/* Copy icon */}
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="h-5 w-5"
													viewBox="0 0 20 20"
													fill="currentColor"
													role="img"
													aria-label="Copy to clipboard">
													<path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
													<path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
												</svg>
											</>
										)}
									</button>
								</div>
								{copied && (
									<p className="text-xs text-green-500 mt-1">
										Seed copied to clipboard!
									</p>
								)}
							</div>
						</div>
					)}
					{!seedPhrase && !error && (
						<div className="p-4 bg-yellow-900/20 border border-yellow-500 rounded-lg">
							<p className="text-yellow-400">
								Creating new wallet...
							</p>
						</div>
					)}
					{error && (
						<div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
							<p className="text-red-400">{error}</p>
						</div>
					)}
				</div>
				<div className="flex gap-4">
					<button
						onClick={() => {
							setIsCreating(false);
							setSeedPhrase('');
						}}
						type="button"
						className="flex-1 py-3 px-4 bg-accent2 text-white rounded-lg hover:bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
						Return
					</button>
				</div>
			</>
		);
	}
};

export default CreateWalletPage;
