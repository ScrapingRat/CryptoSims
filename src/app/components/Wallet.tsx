'use client';

import NoWalletPage from './Wallet/NoWalletPage';
import { useEffect, useState, useCallback, useRef } from 'react';
import { getCookie } from 'cookies-next';
import { useWallet } from 'app/contexts/WalletContext';
import apiClient from 'lib/apiClient';
import BinanceTicker from './binance';

const Wallet = () => {
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);
	const [isDepositing, setIsDepositing] = useState(false);
	const [isBuying, setIsBuying] = useState(false);
	const [depositAmount, setDepositAmount] = useState<number | ''>(0);
	const [buyAmount, setBuyAmount] = useState<number | ''>(0);
	const [limitPrice, setLimitPrice] = useState<number | ''>(0);
	const [isEditingAmount, setIsEditingAmount] = useState(false);
	const [isEditingAmountBtc, setIsEditingAmountBtc] = useState(false);
	const [isEditingTarget, setIsEditingTarget] = useState(false);
	const [order, setOrder] = useState('market');
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
			<div className="w-full mx-auto">
				<div className="flex flex-col md:flex-row gap-4">
					<div className="space-y-4 flex-1 p-6 border border-accent2 rounded-lg bg-background/50">
						{balanceFiat !== null && balanceBtc !== null ? (
							<div>
								<p className="text-gray-400 text-center">
									Balance:
								</p>
								<div className="flex flex-row items-center text-center justify-center gap-0.5">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="currentColor"
										className="size-6 text-green-400">
										<path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 0 1-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004ZM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 0 1-.921.42Z" />
										<path
											fillRule="evenodd"
											d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a4.124 4.124 0 0 0 1.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 0 0-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z"
											clipRule="evenodd"
										/>
									</svg>
									<p className="text-l font-bold text-white">
										{balanceFiat} USD
									</p>
								</div>
								<div
									className={`text-l font-bold text-center ${
										netProfit > 0
											? 'text-green-500'
											: netProfit < 0
											? 'text-red-500'
											: 'text-white'
									} lg-text-base lg-whitespace-nowrap`}>
									<p>{balanceBtc} BTC</p>
									<p className="text-xs opacity-75 text-center">
										≃ {btcToFiat} USD (
										{netProfit >= 0 && '+'}
										{netProfit} USD /{' '}
										{netProfit >= 0 && '+'}
										{percentProfit}%)
									</p>
								</div>
								{isDepositing === false ? (
									<div className="mt-3 text-center flex">
										<button
											onClick={() =>
												setIsDepositing(true)
											}
											type="button"
											className="font-medium flex-1 py-3 px-4 bg-accent2 text-white rounded-lg hover:bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
											Deposit USD
										</button>
									</div>
								) : (
									<div className="mt-3">
										{isEditingAmount ? (
											<input
												ref={depositInputRef}
												type="number"
												value={depositAmount}
												onChange={handleAmountChange}
												onBlur={() => {
													if (depositAmount === '') {
														setDepositAmount(0);
													}
													setIsEditingAmount(false);
												}}
												onFocus={() => {
													if (depositAmount === 0)
														setDepositAmount('');
												}}
												className="font-medium flex-1 py-3 px-4 text-center text-gray-400 block w-full rounded-lg bg-gray-900"
												min={0}
												max={50000}
												onKeyDown={(e) => {
													if (
														e.key === 'Enter' ||
														e.key === ' '
													) {
														setIsEditingAmount(
															false
														);
														if (
															depositAmount === ''
														) {
															setDepositAmount(0);
														}
														e.preventDefault();
													}
												}}
											/>
										) : (
											<div>
												<label
													htmlFor="DepositSlider"
													className="text-gray-400 block text-center mb-0 cursor-pointer hover:text-yellow-300 bg-accent1 hover:bg-gray-900 rounded-lg py-3 px-4"
													onClick={() => {
														setIsEditingAmount(
															true
														);
														setTimeout(() => {
															depositInputRef.current?.focus();
														}, 0);
													}}
													onKeyDown={(e) => {
														if (
															e.key === 'Enter' ||
															e.key === ' '
														) {
															setIsEditingAmount(
																true
															);
															setTimeout(() => {
																depositInputRef.current?.focus();
															}, 0);
															e.preventDefault();
														}
													}}
													tabIndex={0}>
													Deposit Amount:{' '}
													{depositAmount} USD
												</label>
											</div>
										)}

										<div className="flex items-center gap-4 mt-3">
											<button
												onClick={() =>
													setDepositAmount((prev) =>
														Math.max(
															0,
															(prev || 0) - 100
														)
													)
												}
												type="button"
												className="md:mt-1 md:mb-1 py-1 px-2 w-8 md:py-2 md:px-4 md:w-12 bg-accent2 text-white rounded-lg hover:bg-red-700 transition-colors">
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
														Number(e.target.value)
													)
												}
												className="w-full range"
											/>

											<button
												onClick={() =>
													setDepositAmount((prev) =>
														Math.min(
															50000,
															(prev || 0) + 100
														)
													)
												}
												type="button"
												className="md:mt-1 md:mb-1 py-1 px-2 w-8 md:py-2 md:px-4 md:w-12 bg-accent2 text-white rounded-lg hover:bg-green-700 transition-colors">
												+
											</button>
										</div>

										<div className="flex justify-center gap-3 mt-3">
											<button
												onClick={() => {
													setIsEditingAmount(false);
													handleDeposit();
													setDepositAmount(0);
												}}
												type="button"
												className="w-full font-medium py-3 px-4 bg-green-500/75 text-white rounded-lg hover:bg-green-600/75 transition-colors">
												Confirm
											</button>
											<button
												onClick={() => {
													setIsDepositing(false);
													setIsEditingAmount(false);
													setDepositAmount(0);
												}}
												type="button"
												className="w-full font-medium py-3 px-4 bg-red-500/75 text-white rounded-lg hover:bg-red-600/75 transition-colors">
												Cancel
											</button>
										</div>
									</div>
								)}
								{error && (
									<p className="text-center mt-2 text-sm text-red-500">
										{error}
									</p>
								)}
								{message && (
									<p className="text-center mt-2 text-sm text-green-500">
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
					<div className="flex-1 p-6 border border-accent2 rounded-lg bg-background/50">
						<div className="mb-3 lg:mb-10">
							<BinanceTicker />
						</div>
						{isBuying === false ? (
							<div className="text-center flex flex-row gap-3 mt-0 md:mt-9 lg:mt-0">
								<button
									onClick={() => setIsBuying(true)}
									type="button"
									className="font-medium flex-1 py-3 px-4 bg-green-500/75 text-white rounded-lg hover:bg-green-600/75 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
									Buy BTC
								</button>
								<button
									onClick={() => setIsBuying(true)}
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
												htmlFor="target"
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
												htmlFor="BuySlider"
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
										type="range"
										min={0}
										max={balanceFiat || 0}
										step={100}
										value={buyAmount}
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
										className="w-full font-medium py-3 px-4 bg-green-500/75 text-white rounded-lg hover:bg-green-600/75 transition-colors">
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
					</div>
				</div>
			</div>
		);
	} else {
		return <NoWalletPage onWalletUnlocked={refreshWalletStatus} />;
	}
};

export default Wallet;
