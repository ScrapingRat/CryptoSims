import { useWallet } from 'app/contexts/WalletContext';
import type { SortKey, SortOrder } from './OrderHistory';

const OrderHistoryBody = ({
	sortKey,
	sortOrder
}: {
	sortKey: SortKey;
	sortOrder: SortOrder;
}) => {
	const { orderHistory } = useWallet();

	const sortedHistory = [...(orderHistory ?? [])].sort((a, b) => {
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
		<tbody>
			{sortedHistory.map(([id, date, amount, price, type]) => (
				<tr className="even:bg-hover hover:bg-accent3" key={id}>
					<td className="pl-2 pr-2">
						{new Date(date).toLocaleString()}
					</td>
					<td
						className={`pl-2 pr-2 ${
							type === 'buy' ? 'text-green-500' : 'text-red-500'
						}`}>
						{type === 'buy' ? '▲' : '▼'} {Number(amount).toLocaleString()}
					</td>
					<td
						className={`pl-2 pr-2 ${
							type === 'buy' ? 'text-red-500' : 'text-green-500'
						}`}>
						{Number(price).toLocaleString()}
					</td>
				</tr>
			))}
		</tbody>
	);
};

export default OrderHistoryBody;
