import OrderHistory from './OrderHistory';
import OpenOrders from './OpenOrders';
import { useWallet } from 'app/contexts/WalletContext';

const History = () => {
	const { openOrders, historyBuy } = useWallet();

	return (
		<>
			{((historyBuy ?? []).length !== 0 || (openOrders ?? []).length !== 0)&& (
				<div className="w-full mx-auto flex flex-col md:flex-row gap-4 sm:gap-6 md:flex-wrap">
					<OrderHistory />
					<OpenOrders />
				</div>
			)}
		</>
	);
};

export default History;
