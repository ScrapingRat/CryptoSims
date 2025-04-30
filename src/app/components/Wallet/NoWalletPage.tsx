import { useState } from 'react';
import CreateWalletPage from './CreateWalletPage';
import UnlockWalletPage from './UnlockWalletPage';

interface NoWalletPageProps {
	onWalletUnlocked: () => void;
}

const NoWalletPage = ({ onWalletUnlocked }: NoWalletPageProps) => {
	const [isCreating, setIsCreating] = useState(false);
	const [isUnlocking, setIsUnlocking] = useState(false);

	return (
		<>
			<h1 className="text-3xl font-bold content-center text-center">
				Wallet
			</h1>
			<div className="w-full max-w-md mx-auto space-y-8 mb-3">
				{!isCreating && (
					<UnlockWalletPage
						isUnlocking={isUnlocking}
						setIsUnlocking={setIsUnlocking}
						onWalletUnlocked={onWalletUnlocked}
					/>
				)}
				{!isUnlocking && (
					<CreateWalletPage
						isCreating={isCreating}
						setIsCreating={setIsCreating}
					/>
				)}
			</div>
		</>
	);
};

export default NoWalletPage;
