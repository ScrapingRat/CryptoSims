'use client';

import Link from 'next/link';
import { useWallet } from 'app/contexts/WalletContext';
import apiClient from 'lib/apiClient';

export default function Navbar() {
	const { isUnlocked, setIsUnlocked } = useWallet();

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

	return (
		<nav className="bg-black fixed w-full z-20 top-0 start-0 border-b border-accent2">
			<div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
				<Link
					href="/"
					className="flex items-center space-x-3 rtl:space-x-reverse">
					<span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
						CryptoSims
					</span>
				</Link>
				<div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
					{/* <Link
						href="/wallet"
						type="button"
						className="text-white bg-background border border-accent2 hover:bg-hover font-semibold rounded-lg text-sm px-4 py-2 text-center">
						Wallet
					</Link> */}
					{isUnlocked && (
						<button
							onClick={handleLock}
							type="button"
							className="rounded-lg bg-white hover:bg-accent7 p-1 text-black font-semibold flex items-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="size-6">
								<path
									fillRule="evenodd"
									d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
									clipRule="evenodd"
								/>
							</svg>
						</button>
					)}
					<button
						data-collapse-toggle="navbar-sticky"
						type="button"
						className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-white hover:bg-hover rounded-lg md:hidden focus:outline-none focus:ring-2 ring-accent2"
						aria-controls="navbar-sticky"
						aria-expanded="false">
						<span className="sr-only">Open main menu</span>
						<svg
							className="w-5 h-5"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 17 14">
							<path
								stroke="currentColor"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M1 1h15M1 7h15M1 13h15"
							/>
						</svg>
					</button>
				</div>
				<div
					className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
					id="navbar-sticky">
					<ul className="flex flex-col p-4 md:p-0 mt-4 font-semibold border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
						<li>
							{/* <Link
								href="/#markets"
								className="block py-2 px-3 bg-black text-gray-500">
								Markets
							</Link> */}
						</li>
					</ul>
				</div>
			</div>
		</nav>
	);
}
