import { useEffect, useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';

type SortKey = 'date' | 'amount' | 'price';
type SortOrder = 'asc' | 'desc';

const OrderHistory = () => {
	const { isUnlocked, historyBuy, fetchWallet } = useWallet();
	const [sortKey, setSortKey] = useState<SortKey>('date');
	const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

	useEffect(() => {
		if (isUnlocked) {
			fetchWallet();
		}
	}, [isUnlocked, fetchWallet]);

	const handleSort = (key: SortKey) => {
		if (sortKey === key) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			setSortKey(key);
			setSortOrder('asc');
		}
	};

	const sortedHistory = [...(historyBuy ?? [])].sort((a, b) => {
		let aValue, bValue;
		if (sortKey === 'date') {
			aValue = new Date(a[1]).getTime();
			bValue = new Date(b[1]).getTime();
		} else if (sortKey === 'amount') {
			aValue = a[2];
			bValue = b[2];
		} else {
			aValue = a[3];
			bValue = b[3];
		}
		return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
	});

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
							<thead className="uppercase text-xs bg-accent2 sticky top-0">
								<tr>
									<th
										className={'pl-2 pr-2 py-1 cursor-pointer'}
										onClick={() => handleSort('date')}>
										Date
										<span className="ml-1">
											<span
												className={
													sortKey === 'date' &&
													sortOrder === 'asc'
														? 'text-yellow-400'
														: 'text-gray-400'
												}>
												▲
											</span>
											<span
												className={
													sortKey === 'date' &&
													sortOrder === 'desc'
														? 'text-yellow-400'
														: 'text-gray-400'
												}>
												▼
											</span>
										</span>
									</th>
									<th
										className={'pl-2 pr-2 py-1 cursor-pointer'}
										onClick={() => handleSort('amount')}>
										Amount
										<span className="ml-1">
											<span
												className={
													sortKey === 'amount' &&
													sortOrder === 'asc'
														? 'text-yellow-400'
														: 'text-gray-400'
												}>
												▲
											</span>
											<span
												className={
													sortKey === 'amount' &&
													sortOrder === 'desc'
														? 'text-yellow-400'
														: 'text-gray-400'
												}>
												▼
											</span>
										</span>
									</th>
									<th
										className={'pl-2 pr-2 py-1 cursor-pointer'}
										onClick={() => handleSort('price')}>
										Price
										<span className="ml-1">
											<span
												className={
													sortKey === 'price' &&
													sortOrder === 'asc'
														? 'text-yellow-400'
														: 'text-gray-400'
												}>
												▲
											</span>
											<span
												className={
													sortKey === 'price' &&
													sortOrder === 'desc'
														? 'text-yellow-400'
														: 'text-gray-400'
												}>
												▼
											</span>
										</span>
									</th>
								</tr>
							</thead>
							<tbody>
								{sortedHistory.map(
									([id, date, amount, price]) => (
										<tr
											className="even:bg-hover hover:bg-accent3"
											key={id}>
											<td className="pl-2 pr-2">
												{new Date(
													date
												).toLocaleString()}
											</td>
											<td className="pl-2 pr-2">
												{amount}
											</td>
											<td className="pl-2 pr-2">
												{price}
											</td>
										</tr>
									)
								)}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</>
	);
};

export default OrderHistory;
