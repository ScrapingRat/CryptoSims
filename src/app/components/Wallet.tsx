'use client';

import NoWalletPage from './Wallet/NoWalletPage';
import { useEffect, useState } from 'react';
import isAuth from 'lib/actions/isAuth';
import getWallet from 'lib/actions/getWallet';
import lockWallet from 'lib/actions/lockWallet';

const Wallet = () => {
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);
	const [isUnlocked, setIsUnlocked] = useState(false);
	// const [message, setMessage] = useState('');
	const [balance, setBalance] = useState<number | null>(null);
	// const [error, setError] = useState('');

	useEffect(() => {
		const check = async () => {
			const auth = await isAuth();
			setIsUnlocked(auth);
			setIsCheckingAuth(false);
		};

		check();
	}, []);

	const fetchWallet = async () => {
		try {
			const result = await getWallet();

			if (result.error) {
				console.error(result.error);
				return;
			}

			if (result.wallet) {
				setBalance(result.wallet.balance);
			}
		} catch (error) {
			// setError('Failed to fetch wallet balance');
			console.error(error);
		}
	};

	useEffect(() => {
		if (isUnlocked) {
			fetchWallet();
		}
	}, [isUnlocked]);

	if (isCheckingAuth) {
		return <p>Loading...</p>;
	} else if (!isUnlocked) {
		return <NoWalletPage />;
	} else {
		return (
			<div className="space-y-6">
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
									onClick={() => {
										setIsUnlocked(false);
										lockWallet().catch((error) => {
											console.error(
												'Failed to lock wallet:',
												error
											);
											setIsUnlocked(true);
										});
									}}
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
};

export default Wallet;
