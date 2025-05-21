'use client';

import {
	createContext,
	useContext,
	useState,
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
	netProfit: number;
	percentProfit: number;
	orderHistory: [string, Date, number, number, string][];
	openOrders: [string, Date, number, number, string][];
	fetchWallet: () => Promise<void>;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
	const [isUnlocked, setIsUnlocked] = useState(false);
	const [balanceFiat, setBalanceFiat] = useState<number | null>(null);
	const [balanceBtc, setBalanceBtc] = useState<number | null>(null);
	const [btcToFiat, setBtcToFiat] = useState(0);
	const [netProfit, setNetProfit] = useState(0);
	const [percentProfit, setPercentProfit] = useState(0);
	const [orderHistory, setOrderHistory] = useState<
		[string, Date, number, number, string][]
	>([]);
	const [openOrders, setOpenOrders] = useState<
		[string, Date, number, number, string][]
	>([]);

	const fetchWallet = useCallback(async () => {
		try {
			interface WalletResponse {
				balanceFiat: number;
				balanceBtc: number;
				netProfit: number;
				percentProfit: number;
				orderHistory: Array<[string, Date, number, number, string]>;
				openOrders: Array<[string, Date, number, number, string]>;
			}

			const { data, error, refreshed, status } =
				await apiClient<WalletResponse>('api/getWallet');

			if (refreshed) {
				console.log('Token was refreshed during wallet fetch');
			}

			if (error) {
				try {
					interface LockResponse {
						message: string;
					}
					const { error, errorMessage } =
						await apiClient<LockResponse>('api/lock', 'DELETE');

					if (!error) {
						setIsUnlocked(false);
					} else {
						console.log(errorMessage);
					}
				} catch (error) {
					console.error('Failed to lock wallet:', error);
				}

				if (status === 401) {
					setIsUnlocked(false);
				}

				return;
			}

			if (data) {
				setBalanceFiat(data.balanceFiat);
				setBalanceBtc(data.balanceBtc);
				setNetProfit(data.netProfit);
				setPercentProfit(data.percentProfit);
				setOrderHistory(data.orderHistory);
				setOpenOrders(data.openOrders);
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
				netProfit,
				percentProfit,
				orderHistory,
				openOrders,
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
