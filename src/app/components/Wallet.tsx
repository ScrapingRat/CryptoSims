'use client';

import NoWalletPage from './Wallet/NoWalletPage';
import { useEffect, useState, useCallback } from 'react';
import { getCookie } from 'cookies-next';
import { useWallet } from 'app/contexts/WalletContext';
import apiClient from 'lib/apiClient';
import BalanceComponent from './Wallet/Balance/BalanceComponent';
import BtcComponent from './Wallet/Btc/BtcComponent';

const Wallet = () => {
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);
	const { isUnlocked, setIsUnlocked, fetchWallet } = useWallet();

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
			<div className="w-full mx-auto flex flex-col md:flex-row gap-4 sm:gap-6">
				<BalanceComponent />
				<BtcComponent />
			</div>
		);
	} else {
		return <NoWalletPage onWalletUnlocked={refreshWalletStatus} />;
	}
};

export default Wallet;
