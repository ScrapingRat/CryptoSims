'use client';

import Link from 'next/link';
import { useWallet } from 'app/contexts/WalletContext';
import apiClient from 'lib/apiClient';
import Image from 'next/image';

export default function Navbar() {
	const { isUnlocked, setIsUnlocked, fetchWallet } = useWallet();

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
					<Image
						src="/cryptosims.png"
						alt="Cryptosims"
						width={30}
						height={30}
					/>
					<h2 className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
						CryptoSims&#8203;
					</h2>
				</Link>
				<div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
					{isUnlocked && (
						<div className="inline-flex space-x-3">
							<button
								onClick={fetchWallet}
								className="p-1 bg-accent2 text-white rounded-lg hover:bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={1.5}
									stroke="currentColor"
									className="size-6"
									role="img"
									aria-label="Refresh wallet">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
									/>
								</svg>
							</button>

							<button
								onClick={handleLock}
								type="button"
								className="rounded-lg bg-white hover:bg-accent5 p-1 text-black font-semibold flex items-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="size-6"
									role="img"
									aria-label="Lock wallet">
									<path
										fillRule="evenodd"
										d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
										clipRule="evenodd"
									/>
								</svg>
							</button>
						</div>
					)}
				</div>
			</div>
		</nav>
	);
}
