'use client';

import {
	createContext,
	useContext,
	useState,
	ReactNode,
	useCallback
} from 'react';
import apiClient from 'lib/apiClient';
import { IOhlc } from '@models/ohlc';

type WalletContextType = {
	isUnlocked: boolean;
	setIsUnlocked: (value: boolean) => void;
	balanceFiat: number | null;
	balanceBtc: number | null;
	btcToFiat: number;
	fetchWallet: () => Promise<void>;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
	const [isUnlocked, setIsUnlocked] = useState(false);
	const [balanceFiat, setBalanceFiat] = useState<number | null>(null);
	const [balanceBtc, setBalanceBtc] = useState<number | null>(null);
	const [btcToFiat, setBtcToFiat] = useState(0);

	const fetchWallet = useCallback(async () => {
		try {
			interface WalletResponse {
				balanceFiat: number;
				balanceBtc: number;
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
				setBalanceFiat(data.balanceFiat);
				setBalanceBtc(data.balanceBtc);
				const now = Math.floor(Date.now() / 1000);

				const ohlc = await apiClient<IOhlc>(
					`api/btc/value?date=${now}`,
					'GET'
				);

				if (ohlc.error) {
					console.error('Error fetching BTC price:', ohlc.error);
					return;
				}
				const usd = (ohlc?.data?.close || 0) * (data.balanceBtc || 0);
				setBtcToFiat(Math.round(usd * 100) / 100);
			}
		} catch (unexpectedError) {
			console.error('Unexpected error in fetchWallet:', unexpectedError);
		}
	}, []);

	return (
		<WalletContext.Provider
			value={{
				isUnlocked,
				setIsUnlocked,
				balanceFiat,
				balanceBtc,
				btcToFiat,
				fetchWallet
			}}>
			{children}
		</WalletContext.Provider>
	);
};

export const useWallet = () => {
	const context = useContext(WalletContext);
	if (context === undefined) {
		throw new Error('useWallet must be used within a WalletProvider');
	}
	return context;
};
