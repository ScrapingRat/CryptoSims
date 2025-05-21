import { SortKey, SortOrder } from './OrderHistory';

const OrderHistoryHead = ({
	sortKey,
	setSortKey,
	sortOrder,
	setSortOrder
}: {
	sortKey: SortKey;
	setSortKey: (sortKey: SortKey) => void;
	sortOrder: SortOrder;
	setSortOrder: (SortOrder: SortOrder) => void;
}) => {
	const handleSort = (key: SortKey) => {
		if (sortKey === key) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			setSortKey(key);
			setSortOrder('asc');
		}
	};
	return (
		<thead className="uppercase text-xs bg-accent2 sticky top-0">
			<tr>
				<th
					className={'pl-2 pr-2 py-1 cursor-pointer'}
					onClick={() => handleSort('date')}>
					Date
					<span className="ml-1">
						<span
							className={
								sortKey === 'date' && sortOrder === 'asc'
									? 'text-yellow-400'
									: 'text-gray-400'
							}>
							▲
						</span>
						<span
							className={
								sortKey === 'date' && sortOrder === 'desc'
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
					BTC
					<span className="ml-1">
						<span
							className={
								sortKey === 'amount' && sortOrder === 'asc'
									? 'text-yellow-400'
									: 'text-gray-400'
							}>
							▲
						</span>
						<span
							className={
								sortKey === 'amount' && sortOrder === 'desc'
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
					USD
					<span className="ml-1">
						<span
							className={
								sortKey === 'price' && sortOrder === 'asc'
									? 'text-yellow-400'
									: 'text-gray-400'
							}>
							▲
						</span>
						<span
							className={
								sortKey === 'price' && sortOrder === 'desc'
									? 'text-yellow-400'
									: 'text-gray-400'
							}>
							▼
						</span>
					</span>
				</th>
			</tr>
		</thead>
	);
};

export default OrderHistoryHead;
