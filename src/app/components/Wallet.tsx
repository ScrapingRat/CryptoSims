'use client';

import NoWalletPage from './Wallet/NoWalletPage';
import { useEffect, useState, useCallback } from 'react';
import isAuth from 'lib/actions/isAuth';
import getWallet from 'lib/actions/getWallet';
import lockWallet from 'lib/actions/lockWallet';
import connectToDatabase from 'lib/actions/connectToDatabase';
import { useWallet } from 'app/contexts/WalletContext';

const Wallet = () => {
	const [dbConnected, setDbConnected] = useState(false);
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);
	const { isUnlocked, setIsUnlocked } = useWallet();
	// const [message, setMessage] = useState('');
	const [balance, setBalance] = useState<number | null>(null);
	// const [error, setError] = useState('');

	const refreshWalletStatus = () => {
		setIsUnlocked(true);
	};

	const checkDb = async () => {
		const result = await connectToDatabase();
		setDbConnected(result.success);
		return result.success;
	};

	const checkAuth = useCallback(async () => {
		setIsCheckingAuth(true);
		try {
			const auth = await isAuth();
			setIsUnlocked(auth);
		} catch (error) {
			console.error('Failed to check authentication:', error);
			setIsUnlocked(false);
		} finally {
			setIsCheckingAuth(false);
		}
	}, [setIsUnlocked]);

	useEffect(() => {
		checkDb();

		if (dbConnected) {
			checkAuth();
		}
	}, [dbConnected, checkAuth]);

	useEffect(() => {
		if (isUnlocked) {
			fetchWallet();
		}
	}, [isUnlocked]);

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

	if (!dbConnected) {
		return <p>Establishing connection to the database...</p>;
	} else if (isCheckingAuth) {
		return <p>Loading...</p>;
	} else if (isUnlocked) {
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
	} else {
		return <NoWalletPage onWalletUnlocked={refreshWalletStatus} />;
	}
};

export default Wallet;
