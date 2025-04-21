'use client';

import NoWalletPage from './Wallet/NoWalletPage';
import { useEffect, useState, useCallback } from 'react';
import { getCookie } from 'cookies-next';
import { useWallet } from 'app/contexts/WalletContext';
import apiClient from 'lib/apiClient';

const Wallet = () => {
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);
	const [isDepositing, setIsDepositing] = useState(false);
	const [isBuying, setIsBuying] = useState(false);
	const [depositAmount, setDepositAmount] = useState<number | ''>(0);
	const [buyAmount, setBuyAmount] = useState<number | ''>(0);
	const [isEditingAmount, setIsEditingAmount] = useState(false);
	const [isEditingAmountBtc, setIsEditingAmountBtc] = useState(false);
	const {
		isUnlocked,
		setIsUnlocked,
		balanceFiat,
		balanceBtc,
		btcToFiat,
		netProfit,
		percentProfit,
		fetchWallet
	} = useWallet();

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

	const handleDeposit = async () => {
		console.log(`Depositing ${depositAmount} USD`);

		interface Response {
			message: string;
		}

		setError('');
		setMessage('');

		const { data, error, errorMessage } = await apiClient<Response>(
			`api/usd/inc?amount=${depositAmount}`,
			'POST',
			{
				auth: true,
			}
		);

		if (error) {
			setError(`${error}: ${errorMessage}`);
		} else {
			setMessage(
				data?.message ||
					`Successfully increased USD by ${depositAmount}. New balance is ${
						(balanceFiat || 0) + (depositAmount || 0)
					}.`
			);
		}
		setIsDepositing(false);
		await fetchWallet();
	};

	const handleBuy = async () => {
		console.log(`Buying ${buyAmount} USD worth of BTC`);

		interface Response {
			message: string;
		}

		setError('');
		setMessage('');

		const { data, error, errorMessage } = await apiClient<Response>(
			`api/btc/buy?amount=${buyAmount}`,
			'POST',
			{
				auth: true
			}
		);

		if (error) {
			setError(`${error}: ${errorMessage}`);
		} else {
			setMessage(
				data?.message ||
					`Successfully increased USD by ${depositAmount}. New balance is ${
						(balanceFiat || 0) + (depositAmount || 0)
					}.`
			);
		}

		setIsBuying(false);
		await fetchWallet();
	};

	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value =
			e.target.value === ''
				? ''
				: Math.max(0, Math.min(50000, Number(e.target.value)));
		setDepositAmount(value);
	};

	const handleAmountChangeBtc = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value =
			e.target.value === ''
				? ''
				: Math.max(
						0,
						Math.min(balanceFiat || 0, Number(e.target.value))
				  );
		setBuyAmount(value);
	};

	useEffect(() => {
		if (error || message) {
			const timer = setTimeout(() => {
				setError('');
				setMessage('');
			}, 10000);

			return () => clearTimeout(timer);
		}
	}, [error, message]);

	useEffect(() => {
		const handleClickOutside = () => {
			setError('');
			setMessage('');
		};

		document.addEventListener('click', handleClickOutside);

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, []);

	if (isCheckingAuth) {
		return <p>Loading...</p>;
	} else if (isUnlocked) {
		return (
			<div className="w-full max-w-md mx-auto">
				<div className="p-6 border border-accent2 rounded-lg bg-background/50">
					{balanceFiat !== null && balanceBtc !== null ? (
						<div className="space-y-4">
							<div>
								<p className="text-gray-400 text-center">
									Balance:
								</p>
								<p className="text-l font-bold text-white text-center">
									{balanceFiat} USD
								</p>
								<p
									className={`text-l font-bold text-center ${
										netProfit > 0
											? 'text-green-500'
											: netProfit < 0
											? 'text-red-500'
											: 'text-white'
									}`}>
									{balanceBtc} BTC
									<span className="text-xs opacity-50">
										{' '}
										≃ {btcToFiat} USD (
											{netProfit >= 0 && ('+')}
											{netProfit} USD /{' '}
											{netProfit >= 0 && ('+')}
											{percentProfit}%)
									</span>
								</p>
								{!isBuying &&
									(isDepositing === false ? (
										<div className="mt-4 text-center flex">
											<button
												onClick={() =>
													setIsDepositing(true)
												}
												type="button"
												className="flex-1 py-3 px-4 bg-accent2 text-white rounded-lg hover:bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
												Deposit USD
											</button>
										</div>
									) : (
										<div className="mt-4">
											{isEditingAmount ? (
												<input
													type="number"
													value={depositAmount}
													onChange={
														handleAmountChange
													}
													onBlur={() =>
														setIsEditingAmount(
															false
														)
													}
													onFocus={() => {
														if (depositAmount === 0)
															setDepositAmount(
																''
															);
													}}
													className="text-center text-gray-400 block w-full mb-2 border border-gray-500 rounded-lg p-2 bg-gray-800"
													min={0}
													max={50000}
												/>
											) : (
												<label
													htmlFor="depositSlider"
													className="text-gray-400 block text-center mb-2 cursor-pointer hover:text-yellow-300 bg-accent1 rounded-lg py-2 px-4"
													onClick={() =>
														setIsEditingAmount(true)
													}>
													Deposit Amount:{' '}
													{depositAmount} USD
												</label>
											)}

											<div className="flex items-center gap-4">
												<button
													onClick={() =>
														setDepositAmount(
															(prev) =>
																Math.max(
																	0,
																	(prev ||
																		0) - 100
																)
														)
													}
													type="button"
													className="py-1 px-2 w-8 md:py-2 md:px-4 md:w-12 bg-accent2 text-white rounded-lg hover:bg-red-700 transition-colors">
													-
												</button>

												<input
													id="depositSlider"
													type="range"
													min={0}
													max={50000}
													step={100}
													value={depositAmount}
													onChange={(e) =>
														setDepositAmount(
															Number(
																e.target.value
															)
														)
													}
													className="w-full range"
												/>

												<button
													onClick={() =>
														setDepositAmount(
															(prev) =>
																Math.min(
																	50000,
																	(prev ||
																		0) + 100
																)
														)
													}
													type="button"
													className="py-1 px-2 w-8 md:py-2 md:px-4 md:w-12 bg-accent2 text-white rounded-lg hover:bg-green-700 transition-colors">
													+
												</button>
											</div>

											<div className="flex justify-center gap-4 mt-4">
												<button
													onClick={() => {
														setIsEditingAmount(
															false
														);
														handleDeposit();
														setDepositAmount(0);
													}}
													type="button"
													className="py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-700 transition-colors">
													Confirm
												</button>
												<button
													onClick={() => {
														setIsDepositing(false);
														setIsEditingAmount(
															false
														);
														setDepositAmount(0);
													}}
													type="button"
													className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-700 transition-colors">
													Cancel
												</button>
											</div>
										</div>
									))}

								{!isDepositing &&
									(isBuying === false ? (
										<div className="mt-4 text-center flex">
											<button
												onClick={() =>
													setIsBuying(true)
												}
												type="button"
												className="flex-1 py-3 px-4 bg-accent2 text-white rounded-lg hover:bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
												Buy BTC
											</button>
										</div>
									) : (
										<div className="mt-4">
											{isEditingAmountBtc ? (
												<input
													type="number"
													value={buyAmount}
													onChange={
														handleAmountChangeBtc
													}
													onBlur={() =>
														setIsEditingAmountBtc(
															false
														)
													}
													onFocus={() => {
														if (buyAmount === 0)
															setBuyAmount('');
													}}
													className="text-center text-gray-400 block w-full mb-2 border border-gray-500 rounded-lg p-2 bg-gray-800"
													min={0}
													max={balanceFiat}
												/>
											) : (
												<label
													htmlFor="BuySlider"
													className="text-gray-400 block text-center mb-2 cursor-pointer hover:text-yellow-300 bg-accent1 rounded-lg py-2 px-4"
													onClick={() =>
														setIsEditingAmountBtc(
															true
														)
													}>
													Buy Amount: {buyAmount} USD
												</label>
											)}

											<div className="flex items-center gap-4">
												<button
													onClick={() =>
														setBuyAmount((prev) =>
															Math.max(
																0,
																(prev || 0) -
																	100
															)
														)
													}
													type="button"
													className="py-1 px-2 w-8 md:py-2 md:px-4 md:w-12 bg-accent2 text-white rounded-lg hover:bg-red-700 transition-colors">
													-
												</button>

												<input
													id="buySlider"
													type="range"
													min={0}
													max={balanceFiat}
													step={100}
													value={buyAmount}
													onChange={(e) =>
														setBuyAmount(
															Number(
																e.target.value
															)
														)
													}
													className="w-full range"
												/>

												<button
													onClick={() =>
														setBuyAmount((prev) =>
															Math.min(
																balanceFiat,
																(prev || 0) +
																	100
															)
														)
													}
													type="button"
													className="py-1 px-2 w-8 md:py-2 md:px-4 md:w-12 bg-accent2 text-white rounded-lg hover:bg-green-700 transition-colors">
													+
												</button>
											</div>

											<div className="flex justify-center gap-4 mt-4">
												<button
													onClick={() => {
														setIsEditingAmountBtc(
															false
														);
														handleBuy();
														setBuyAmount(0);
													}}
													type="button"
													className="py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-700 transition-colors">
													Confirm
												</button>
												<button
													onClick={() => {
														setIsBuying(false);
														setIsEditingAmountBtc(
															false
														);
														setBuyAmount(0);
													}}
													type="button"
													className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-700 transition-colors">
													Cancel
												</button>
											</div>
										</div>
									))}
							</div>
							{error && (
								<p className="mt-2 text-sm text-red-500">
									{error}
								</p>
							)}
							{message && (
								<p className="mt-2 text-sm text-green-500">
									{message}
								</p>
							)}
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
