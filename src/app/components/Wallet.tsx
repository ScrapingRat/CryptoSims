'use client'

import Create from "./Wallet/CreateWalletPage";
import UnlockWalletPage from "./Wallet/UnlockWalletPage";
// import { useEffect, useState } from "react";
// import { isAuth } from "lib/actions/isAuth";
// import { checkAuth } from "./Wallet/checkAuth";

const Wallet = () => {
	// const [isCheckingAuth, setIsCheckingAuth] = useState(true);
	// const [isUnlocked, setIsUnlocked] = useState(false);

	return (
		<>
			<h1 className="text-3xl font-bold content-center text-center">
				Wallet
			</h1>
			<div className="w-full max-w-md mx-auto mt-8 space-y-8">
				<UnlockWalletPage />
				<Create />
			</div>
		</>
	);
};

export default Wallet;
