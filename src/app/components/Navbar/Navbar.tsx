'use client';

import Link from 'next/link';
import { useWallet } from 'app/contexts/WalletContext';
import Image from 'next/image';
import NavbarRefresh from './NavbarRefresh';
import NavbarLock from './NavbarLock';

export default function Navbar() {
	const { isUnlocked } = useWallet();

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
							<NavbarRefresh />
							<NavbarLock />
						</div>
					)}
				</div>
			</div>
		</nav>
	);
}
