import { useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';

const OrderHistory = () => {
	const { isUnlocked, historyBuy, fetchWallet } = useWallet();

	useEffect(() => {
		if (isUnlocked) {
			fetchWallet();
		}
	}, [isUnlocked, fetchWallet]);

	return (
		<>
			{(historyBuy ?? []).length !== 0 && (
				<div className="space-y-4 flex-1 p-6 border border-accent2 rounded-lg bg-background/50">
					<h2 className="text-lg font-bold mb-2 text-center">
						Order History
					</h2>
					<div className="overflow-y-auto max-h-32 overflow-x-auto whitespace-nowrap rounded-lg md:flex md:justify-center">
						<table className="w-full text-left" aria-label='Order History'>
							<thead className="uppercase text-xs bg-accent2 sticky top-0">
								<tr className="">
									<th className="pl-2 pr-2 py-1">Date</th>
									<th className="pl-2 pr-2 py-1">Amount</th>
									<th className="pl-2 pr-2 py-1">Price</th>
								</tr>
							</thead>
							<tbody>
								{[...(historyBuy ?? [])]
									.sort(
										(a, b) =>
											new Date(b[1]).getTime() -
											new Date(a[1]).getTime()
									)
									.map(([id, date, amount, price]) => (
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
									))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</>
	);
};

export default OrderHistory;
