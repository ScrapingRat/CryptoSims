import CreateWalletPage from './CreateWalletPage';
import UnlockWalletPage from './UnlockWalletPage';

const NoWalletPage = () => (
	<>
		<h1 className="text-3xl font-bold content-center text-center">
			Wallet
		</h1>
		<div className="w-full max-w-md mx-auto mt-8 space-y-8">
			<UnlockWalletPage />
			<CreateWalletPage />
		</div>
	</>
);

export default NoWalletPage;
