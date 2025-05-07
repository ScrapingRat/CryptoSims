import { useWallet } from "app/contexts/WalletContext";
import BalanceFiat from './BalanceFiat';
import Profit from './Profit';
import Deposit from '../Deposit/Deposit';

const BalanceComponent = () => {
	const { balanceFiat, balanceBtc } = useWallet();
	return(
		<div className="space-y-4 flex-1 p-6 border border-accent2 rounded-lg bg-background/50">
			{balanceFiat !== null && balanceBtc !== null ? (
				<div>
					<BalanceFiat />
					<Profit />
					<Deposit />
				</div>
			) : (
				<p className="text-gray-300">Loading wallet information...</p>
			)}
		</div>
	);
};

export default BalanceComponent;
