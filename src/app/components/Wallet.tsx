'use client';

import NoWalletPage from './Wallet/NoWalletPage';
import { useEffect, useState, useCallback } from 'react';
import { getCookie } from 'cookies-next';
import { useWallet } from 'app/contexts/WalletContext';
import apiClient from 'lib/apiClient';
// import { IOhlc } from '@models/ohlc';

const Wallet = () => {
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);
	const { isUnlocked, setIsUnlocked, balanceFiat, balanceBtc, btcToFiat, fetchWallet } = useWallet();
	// const [message, setMessage] = useState('');
	// const [balanceFiat, setBalanceFiat] = useState<number | null>(null);
	// const [balanceBtc, setBalanceBtc] = useState<number | null>(null);
	// const [btcToFiat, setBtcToFiat] = useState(0);
	// const [error, setError] = useState('');

	// const fetchWallet = useCallback(async () => {
	// 	try {
	// 		interface WalletResponse {
	// 			balanceFiat: number;
	// 			balanceBtc: number;
	// 		}

	// 		const { data, error, refreshed, status } =
	// 			await apiClient<WalletResponse>('api/getWallet');

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
	// 			setBalanceFiat(data.balanceFiat);
	// 			setBalanceBtc(data.balanceBtc);
	// 			const now = Math.floor(Date.now() / 1000);

	// 			const ohlc = await apiClient<IOhlc>(
	// 				`api/btc/value?date=${now}`,
	// 				'GET'
	// 			);

	// 			if (ohlc.error) {
	// 				console.error('Error fetching BTC price:', ohlc.error);
	// 				return;
	// 			}
	// 			const usd = (ohlc?.data?.close || 0) * (data.balanceBtc || 0);
	// 			setBtcToFiat(Math.round(usd * 100) / 100);
	// 		}
	// 	} catch (unexpectedError) {
	// 		console.error('Unexpected error in fetchWallet:', unexpectedError);
	// 	}
	// }, [setBalanceFiat, setBalanceBtc, setIsUnlocked]);

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

	// const handleLock = async () => {
	// 	try {
	// 		interface LockResponse {
	// 			message: string;
	// 		}
	// 		const { data, error, errorMessage } = await apiClient<LockResponse>(
	// 			'api/lock',
	// 			'DELETE'
	// 		);

	// 		if (!error) {
	// 			console.log(data?.message);
	// 			setIsUnlocked(false);
	// 		} else {
	// 			console.log(errorMessage);
	// 		}
	// 	} catch (error) {
	// 		console.error('Failed to lock wallet:', error);
	// 	}
	// };

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
			<div className="w-full max-w-md mx-auto">
				<div className="p-6 border border-accent2 rounded-lg bg-background/50">
					{/* <div className="grid grid-cols-3 items-center mb-4">
						<div className="flex justify-end">
							<button
								onClick={fetchWallet}
								className="p-2 bg-accent2 text-white rounded-lg hover:bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={1.5}
									stroke="currentColor"
									className="size-5">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
									/>
								</svg>
							</button>
						</div>
					</div> */}
					{balanceFiat !== null && balanceBtc !== null ? (
						<div className="space-y-4">
							<div>
								<p className="text-gray-400 text-center">
									Balance:
								</p>
								<p className="text-l font-bold text-white text-center">
									{balanceFiat} USD
								</p>
								<p className="text-l font-bold text-white text-center">
									{balanceBtc} BTC
									<span className="text-xs opacity-50">
										{' '}
										≃ {btcToFiat} USD
									</span>
								</p>
							</div>

							{/* <div className="w-full max-w-md mx-auto space-y-8">
								<div className="flex gap-4">
									<button
										onClick={handleLock}
										className="flex-1 py-3 px-4 bg-accent2 text-white rounded-lg hover:bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
										Lock Wallet
									</button>
								</div>
							</div> */}
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
