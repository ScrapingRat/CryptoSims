'use client';

import NoWalletPage from './Wallet/NoWalletPage';
import { useEffect, useState, useCallback } from 'react';
import connectToDatabase from 'lib/actions/connectToDatabase';
import { useWallet } from 'app/contexts/WalletContext';
import refreshAccessToken from './refreshAccessToken';

const Wallet = () => {
	const [dbConnected, setDbConnected] = useState(false);
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);
	const { isUnlocked, setIsUnlocked } = useWallet();
	// const [message, setMessage] = useState('');
	const [balance, setBalance] = useState<number | null>(null);
	// const [error, setError] = useState('');

	// const fetchWallet = useCallback(async () => {
	// 	try {
	// 		interface WalletResponse {
	// 			balance: number;
	// 		}

	// 		const { data, error, refreshed, status } = await apiWithRefresh<WalletResponse>('api/getWallet');

	// 		if (refreshed) {
	// 			console.log('Token was refreshed during wallet fetch');
	// 		}

	// 		if (error) {
	// 			console.error('Error fetching wallet:', error);

	// 			if (status === 401) {
	// 				setIsUnlocked(false);
	// 			}

	// 			return;
	// 		}

	// 		if (data) {
	// 			setBalance(data.balance);
	// 		}

	// 	} catch (unexpectedError) {
	// 		console.error('Unexpected error in fetchWallet:', unexpectedError);
	// 	}
	// }, [setBalance, setIsUnlocked]);

	const fetchWallet = useCallback(async () => {
		try {
			const response = await fetch('/api/getWallet', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'same-origin'
			});
			const data = await response.json();

			if (data.error) {
				await refreshAccessToken();
				await fetchWallet();
				return;
			}

			if (data.balance) {
				setBalance(data.balance);
			}
		} catch (error) {
			// setError('Failed to fetch wallet balance');
			console.error(error);
		}
	}, [setBalance]);

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
			const auth = await handleAuth();
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
	}, [isUnlocked, fetchWallet]);

	const handleLock = async () => {
		try {
			const response = await fetch('/api/lock', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'same-origin'
			});
			const data = await response.json();
			if (!data.error) {
				setIsUnlocked(false);
			}
		} catch (error) {
			console.error('Failed to lock wallet:', error);
		}
	};

	const handleAuth = async () => {
		try {
			const response = await fetch('/api/authorize', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'same-origin'
			});
			const data = await response.json();
			return data.isAuthorized;
		} catch (error) {
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
									onClick={handleLock}
									className="py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
									Lock Wallet
								</button>
							</div>
							<div className="flex justify-end mt-6">
								<button
									onClick={fetchWallet}
									className="py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
									Fetch Wallet
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
