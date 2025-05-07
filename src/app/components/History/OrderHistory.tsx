import { useEffect, useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import OrderHistoryBody from './OrderHistoryBody';
import OrderHistoryHead from './OrderHistoryHead';

export type SortKey = 'date' | 'amount' | 'price';
export type SortOrder = 'asc' | 'desc';

const OrderHistory = () => {
	const { isUnlocked, historyBuy, fetchWallet } = useWallet();
	const [sortKey, setSortKey] = useState<SortKey>('date');
	const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

	useEffect(() => {
		if (isUnlocked) {
			fetchWallet();
		}
	}, [isUnlocked, fetchWallet]);

	return (
		<>
			{(historyBuy ?? []).length !== 0 && (
				<div className="space-y-4 flex-1 p-6 border border-accent2 rounded-lg bg-background/50">
					<h2 className="text-l font-bold mb-2 text-center">
						Order History
					</h2>
					<div className="overflow-y-auto max-h-32 overflow-x-auto whitespace-nowrap rounded-lg md:flex md:justify-center">
						<table
							className="w-full text-center"
							aria-label="Order History">
							<OrderHistoryHead
								sortKey={sortKey}
								setSortKey={setSortKey}
								sortOrder={sortOrder}
								setSortOrder={setSortOrder}
							/>
							<OrderHistoryBody
								sortKey={sortKey}
								sortOrder={sortOrder}
							/>
						</table>
					</div>
				</div>
			)}
		</>
	);
};

export default OrderHistory;
