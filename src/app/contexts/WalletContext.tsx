'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type WalletContextType = {
	isUnlocked: boolean;
	setIsUnlocked: (value: boolean) => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
	const [isUnlocked, setIsUnlocked] = useState(false);

	return (
		<WalletContext.Provider value={{ isUnlocked, setIsUnlocked }}>
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