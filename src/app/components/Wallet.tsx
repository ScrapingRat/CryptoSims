'use client';

import NoWalletPage from './Wallet/NoWalletPage';
import { useEffect, useState, useCallback, useRef } from 'react';
import { getCookie } from 'cookies-next';
import { useWallet } from 'app/contexts/WalletContext';
import apiClient from 'lib/apiClient';
import BinanceTicker from './binance';
import BalanceFiat from './Wallet/BalanceFiat';
import Profit from './Wallet/Profit';
import DepositBtn from './Wallet/Deposit/DepositBtn';
import InputDeposit from './Wallet/Deposit/InputDeposit';
import DepositAmountBtn from './Wallet/Deposit/DepositAmountBtx';
import DepositSlider from './Wallet/Deposit/DepositSlider';
import SubmitDeposit from './Wallet/Deposit/SubmitDeposit';

const Wallet = () => {
	const [messageDeposit, setMessageDeposit] = useState('');
	const [errorDeposit, setErrorDeposit] = useState('');
	const [messageBtc, setMessageBtc] = useState('');
	const [errorBtc, setErrorBtc] = useState('');
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);
	const [isDepositing, setIsDepositing] = useState(false);
	const [isBuying, setIsBuying] = useState(false);
	const [isSelling, setIsSelling] = useState(false);
	const [depositAmount, setDepositAmount] = useState<number | ''>(0);
	const [buyAmount, setBuyAmount] = useState<number | ''>(0);
	const [limitPrice, setLimitPrice] = useState<number | ''>(0);
	const [isEditingAmount, setIsEditingAmount] = useState(false);
	const [isEditingAmountBtc, setIsEditingAmountBtc] = useState(false);
	const [isEditingTarget, setIsEditingTarget] = useState(false);
	const [order, setOrder] = useState('market');
	const { isUnlocked, setIsUnlocked, balanceFiat, balanceBtc, fetchWallet } =
		useWallet();
	const depositInputRef = useRef<HTMLInputElement>(null);
	const buyInputRef = useRef<HTMLInputElement>(null);
	const targetInputRef = useRef<HTMLInputElement>(null);

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

	const setLimitPriceCurrent = async () => {
		const data = await apiClient('api/btc/value', 'GET');
		const price = await data.data;

		setLimitPrice(typeof price === 'number' ? price : 0);
		//ERROR HANDLING?
	};

	const handleBuy = async () => {
		console.log(`Buying ${buyAmount} USD worth of BTC`);

		interface Response {
			message: string;
		}

		setErrorBtc('');
		setMessageBtc('');

		let limit = '';

		if (order === 'limit') {
			limit = `&limit=${limitPrice}`;
		}

		const { data, error, errorMessage } = await apiClient<Response>(
			`api/btc/buy?amount=${buyAmount}${limit}`,
			'POST',
			{
				auth: true
			}
		);

		if (error) {
			setErrorBtc(`${error}: ${errorMessage}`);
		} else {
			setMessageBtc(
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
				: Math.max(
						0,
						Math.min(
							50000,
							Number(Number(e.target.value).toFixed(2))
						)
				  );
		setDepositAmount(value);
	};

	const handleAmountChangeBtc = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value =
			e.target.value === ''
				? ''
				: Math.max(
						0,
						Math.min(
							balanceFiat || 0,
							Number(Number(e.target.value).toFixed(2))
						)
				  );
		setBuyAmount(value);
	};

	const handleAmountChangeTarget = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const value =
			e.target.value === ''
				? ''
				: Math.max(
						0,
						Math.min(
							200000,
							Number(Number(e.target.value).toFixed(2))
						)
				  );
		setLimitPrice(value);
	};

	useEffect(() => {
		if (errorDeposit || messageDeposit) {
			const timer = setTimeout(() => {
				setErrorDeposit('');
				setMessageDeposit('');
			}, 10000);

			return () => clearTimeout(timer);
		}
	}, [errorDeposit, messageDeposit]);

	useEffect(() => {
		if (errorBtc || messageBtc) {
			const timer = setTimeout(() => {
				setErrorBtc('');
				setMessageBtc('');
			}, 10000);

			return () => clearTimeout(timer);
		}
	}, [errorBtc, messageBtc]);

	useEffect(() => {
		const handleClickOutside = () => {
			setErrorDeposit('');
			setMessageDeposit('');
			setErrorBtc('');
			setMessageBtc('');
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
			<div className="w-full mx-auto">
				<div className="flex flex-col md:flex-row gap-4 sm:gap-6">
					<div className="space-y-4 flex-1 p-6 border border-accent2 rounded-lg bg-background/50">
						{balanceFiat !== null && balanceBtc !== null ? (
							<div>
								<p className="text-gray-400 text-center">
									Balance:
								</p>
								<BalanceFiat />
								<Profit />
								{isDepositing === false ? (
									<DepositBtn
										setIsDepositing={setIsDepositing}
									/>
								) : (
									<div className="mt-3">
										{isEditingAmount ? (
											<InputDeposit
												depositInputRef={
													depositInputRef
												}
												depositAmount={depositAmount}
												handleAmountChange={
													handleAmountChange
												}
												setDepositAmount={
													setDepositAmount
												}
												setIsEditingAmount={
													setIsEditingAmount
												}
											/>
										) : (
											<DepositAmountBtn
												setIsEditingAmount={
													setIsEditingAmount
												}
												depositInputRef={
													depositInputRef
												}
												depositAmount={depositAmount}
											/>
										)}

										<DepositSlider
											setDepositAmount={setDepositAmount}
											depositAmount={depositAmount}
										/>

										<SubmitDeposit
											setIsEditingAmount={
												setIsEditingAmount
											}
											setDepositAmount={setDepositAmount}
											setIsDepositing={setIsDepositing}
											setError={setErrorDeposit}
											setMessage={setMessageDeposit}
											amount={depositAmount}
										/>
									</div>
								)}
								{errorDeposit && (
									<p className="text-center mt-2 text-sm text-red-500">
										{errorDeposit}
									</p>
								)}
								{messageDeposit && (
									<p className="text-center mt-2 text-sm text-green-500">
										{messageDeposit}
									</p>
								)}
							</div>
						) : (
							<p className="text-gray-300">
								Loading wallet information...
							</p>
						)}
					</div>
					<div className="flex-1 p-6 border border-accent2 rounded-lg bg-background/50">
						<div className="mb-3 lg:mb-9">
							<BinanceTicker />
						</div>
						{isBuying === false ? (
							<div className="text-center flex flex-row gap-3 mt-0 md:mt-9 lg:mt-0">
								<button
									onClick={() => {
										setIsBuying(true);
									}}
									type="button"
									className="font-medium flex-1 py-3 px-4 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
									Buy BTC
								</button>
								<button
									onClick={() => {
										setIsSelling(true);
									}}
									type="button"
									className="font-medium flex-1 py-3 px-4 bg-red-500/75 text-white rounded-lg hover:bg-red-600/75 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
									Sell BTC
								</button>
							</div>
						) : (
							<div>
								<div className="flex w-full gap-3 mt-0 md:mt-9">
									<button
										onClick={() => {
											setOrder('market');
											setIsEditingTarget(false);
										}}
										type="button"
										className={`font-medium flex-1 py-3 px-4 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
											order === 'market'
												? 'bg-accent4'
												: 'bg-accent2 hover:bg-accent3'
										}`}>
										Market
									</button>
									<button
										onClick={() => {
											setOrder('limit');
											setLimitPrice(0);
											setLimitPriceCurrent();
										}}
										type="button"
										className={`font-medium flex-1 py-3 px-4 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
											order === 'limit'
												? 'bg-accent4'
												: 'bg-accent2 hover:bg-accent3'
										}`}>
										Limit
									</button>
								</div>
								{order === 'market' && (
									<button
										type="button"
										disabled
										className="py-3 px-4 mt-3 w-full bg-accent1 text-gray-400 block text-center mb-2 cursor-pointer transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
										Price: market
									</button>
								)}
								{order === 'limit' && (
									<div className="mt-3">
										{!isEditingTarget ? (
											<label
												className="py-3 px-4 w-full bg-accent1 text-gray-400 block hover:text-yellow-300 text-center mb-2 cursor-pointer transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-900"
												onClick={() => {
													setIsEditingTarget(true);
													setTimeout(() => {
														targetInputRef.current?.focus();
													}, 0);
												}}
												onKeyDown={(e) => {
													if (
														e.key === 'Enter' ||
														e.key === ' '
													) {
														setIsEditingTarget(
															false
														);
														setTimeout(() => {
															targetInputRef.current?.focus();
														}, 0);
														e.preventDefault();
													}
												}}
												tabIndex={0}>
												Target price: {limitPrice} USD
											</label>
										) : (
											<input
												ref={targetInputRef}
												type="number"
												aria-label="Target price"
												value={limitPrice}
												onChange={
													handleAmountChangeTarget
												}
												onBlur={() => {
													setIsEditingTarget(false);
													if (limitPrice === '') {
														setLimitPriceCurrent();
													}
												}}
												className="font-medium flex-1 py-3 px-4 text-center text-gray-400 block w-full rounded-lg bg-gray-900"
												min={0}
												max={200000}
												onKeyDown={(e) => {
													if (
														e.key === 'Enter' ||
														e.key === ' '
													) {
														setIsEditingTarget(
															false
														);
														if (limitPrice === '') {
															setLimitPriceCurrent();
														}
														e.preventDefault();
													}
												}}
											/>
										)}
									</div>
								)}
								<div className="mt-3">
									{isEditingAmountBtc ? (
										<input
											ref={buyInputRef}
											type="number"
											aria-label="Buy amount"
											value={buyAmount}
											onChange={handleAmountChangeBtc}
											onBlur={() => {
												if (buyAmount === '') {
													setBuyAmount(0);
												}
												setIsEditingAmountBtc(false);
											}}
											onFocus={() => {
												if (buyAmount === 0)
													setBuyAmount('');
											}}
											className="font-medium flex-1 py-3 px-4 text-center text-gray-400 block w-full rounded-lg bg-gray-900"
											min={0}
											max={balanceFiat || 0}
											onKeyDown={(e) => {
												if (
													e.key === 'Enter' ||
													e.key === ' '
												) {
													setIsEditingAmountBtc(
														false
													);
													if (buyAmount === '') {
														setBuyAmount(0);
													}
													e.preventDefault();
												}
											}}
										/>
									) : (
										<div>
											<label
												className="text-gray-400 block text-center hover:text-yellow-300 bg-accent1 rounded-lg py-3 px-4 hover:bg-gray-900"
												onClick={() => {
													setIsEditingAmountBtc(true);
													setTimeout(() => {
														buyInputRef.current?.focus();
													}, 0);
												}}
												onKeyDown={(e) => {
													if (
														e.key === 'Enter' ||
														e.key === ' '
													) {
														setIsEditingAmountBtc(
															true
														);
														setTimeout(() => {
															buyInputRef.current?.focus();
														}, 0);
														e.preventDefault();
													}
												}}
												tabIndex={0}>
												Buy amount: {buyAmount} USD
											</label>
										</div>
									)}
								</div>
								<div className="flex items-center gap-4 mt-3">
									<button
										onClick={() =>
											setBuyAmount((prev) =>
												Math.max(0, (prev || 0) - 100)
											)
										}
										type="button"
										className="md:mt-1 md:mb-1 py-1 px-2 w-8 md:py-2 md:px-4 md:w-12 bg-accent2 text-white rounded-lg hover:bg-red-700 transition-colors">
										-
									</button>

									<input
										id="buySlider"
										aria-label="buySlider"
										type="range"
										min={0}
										max={balanceFiat || 0}
										step={100}
										value={buyAmount}
										aria-valuenow={
											typeof buyAmount === 'number'
												? buyAmount
												: 0
										}
										onChange={(e) =>
											setBuyAmount(Number(e.target.value))
										}
										className="w-full range"
									/>

									<button
										onClick={() =>
											setBuyAmount((prev) =>
												Math.min(
													balanceFiat || 0,
													(prev || 0) + 100
												)
											)
										}
										type="button"
										className="md:mt-1 md:mb-1 py-1 px-2 w-8 md:py-2 md:px-4 md:w-12 bg-accent2 text-white rounded-lg hover:bg-green-600/75 transition-colors">
										+
									</button>
								</div>

								<div className="flex justify-center gap-3 mt-3">
									<button
										onClick={() => {
											setIsEditingAmountBtc(false);
											handleBuy();
											setBuyAmount(0);
										}}
										type="button"
										className="w-full font-medium py-3 px-4 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">
										Confirm
									</button>
									<button
										onClick={() => {
											setIsBuying(false);
											setIsEditingAmountBtc(false);
											setBuyAmount(0);
										}}
										type="button"
										className="w-full font-medium py-3 px-4 bg-red-500/75 text-white rounded-lg hover:bg-red-600/75 transition-colors">
										Cancel
									</button>
								</div>
							</div>
						)}
						{errorBtc && (
							<p className="text-center mt-2 text-sm text-red-500">
								{errorBtc}
							</p>
						)}
						{messageBtc && (
							<p className="text-center mt-2 text-sm text-green-500">
								{messageBtc}
							</p>
						)}
					</div>
				</div>
			</div>
		);
	} else {
		return <NoWalletPage onWalletUnlocked={refreshWalletStatus} />;
	}
};

export default Wallet;
