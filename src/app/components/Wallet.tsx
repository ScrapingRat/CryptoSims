'use client';

import NoWalletPage from './Wallet/NoWalletPage';
import { useEffect, useState, useCallback } from 'react';
import { getCookie } from 'cookies-next';
import { useWallet } from 'app/contexts/WalletContext';
import apiClient from 'lib/apiClient';

const Wallet = () => {
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);
	const { isUnlocked, setIsUnlocked } = useWallet();
	// const [message, setMessage] = useState('');
	const [balance, setBalance] = useState<number | null>(null);
	// const [error, setError] = useState('');

	const fetchWallet = useCallback(async () => {
		try {
			interface WalletResponse {
				balance: number;
			}

			const { data, error, refreshed, status } =
				await apiClient<WalletResponse>('api/getWallet');

			if (refreshed) {
				console.log('Token was refreshed during wallet fetch');
			}

			if (error) {
				console.error('Error fetching wallet:', error);

				if (status === 401) {
					setIsUnlocked(false);
				}

				return;
			}

			if (data) {
				setBalance(data.balance);
			}
		} catch (unexpectedError) {
			console.error('Unexpected error in fetchWallet:', unexpectedError);
		}
	}, [setBalance, setIsUnlocked]);

	const refreshWalletStatus = () => {
		setIsUnlocked(true);
	};

	const checkAuth = useCallback(async () => {
		setIsCheckingAuth(true);
		try {
			const auth = await handleAuth();
			setIsUnlocked(auth || false);
		} catch (error) {
			console.error('Failed to check authentication:', error);
			setIsUnlocked(false);
		} finally {
			setIsCheckingAuth(false);
		}
	}, [setIsUnlocked]);

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	useEffect(() => {
		if (isUnlocked) {
			fetchWallet();
		}
	}, [isUnlocked, fetchWallet]);

	const handleLock = async () => {
		try {
			interface LockResponse {
				message: string;
			}
			const { data, error, errorMessage } = await apiClient<LockResponse>(
				'api/lock',
				'DELETE'
			);

			if (!error) {
				console.log(data?.message);
				setIsUnlocked(false);
			} else {
				console.log(errorMessage);
			}
		} catch (error) {
			console.error('Failed to lock wallet:', error);
		}
	};

	const handleAuth = async () => {
		try {
			const unlocked_before = getCookie('unlocked_before');
			const hasUnlockedBefore = unlocked_before !== undefined;

			interface AuthResponse {
				isAuthorized: boolean;
			}

			const { data } = await apiClient<AuthResponse>(
				'api/authorize',
				'GET',
				{
					auth: hasUnlockedBefore
				}
			);

			return data?.isAuthorized || false;
		} catch (error) {
			console.error(error);
		}
	};

	if (isCheckingAuth) {
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
