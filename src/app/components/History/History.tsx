import { useEffect, useState, useCallback, useRef } from 'react';
import { useWallet } from '../../contexts/WalletContext';

const History = () => {
	const {
		isUnlocked,
		// setIsUnlocked,
		// balanceFiat,
		// balanceBtc,
		// btcToFiat,
		// netProfit,
		// percentProfit,
		historyBuy,
		fetchWallet
	} = useWallet();

	useEffect(() => {
		if (isUnlocked) {
			fetchWallet();
		}
	}, [isUnlocked, fetchWallet]);

	return (
		<>
			<div className="w-full mx-auto">
				<div className="flex flex-col md:flex-row gap-4 md:flex-wrap">
					<div className="space-y-4 flex-1 p-6 border border-accent2 rounded-lg bg-background/50">
						<h2 className="text-lg font-bold mb-2 text-center">
							Order History
						</h2>
						{(historyBuy ?? []).length === 0 ? (
							<p>No order history available.</p>
						) : (
							<div className="overflow-y-auto max-h-32 overflow-x-auto whitespace-nowrap rounded-lg md:flex md:justify-center">
								<table className="w-full text-left">
									<thead className="uppercase text-xs bg-accent2 sticky top-0">
										<tr className="">
											<th className="pl-2 pr-2 py-1">
												Date
											</th>
											<th className="pl-2 pr-2 py-1">
												Amount
											</th>
											<th className="pl-2 pr-2 py-1">
												Price
											</th>
										</tr>
									</thead>
									<tbody>
										{[...(historyBuy ?? [])]
											.sort(
												(a, b) =>
													new Date(b[1]).getTime() -
													new Date(a[1]).getTime()
											)
											.map(
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
						)}
					</div>

					<div className="space-y-4 flex-1 p-6 border border-accent2 rounded-lg bg-background/50">
						<h2 className="text-lg font-bold mb-2 text-center">
							Open Orders
						</h2>
						{(historyBuy ?? []).length === 0 ? (
							<p>No order history available.</p>
						) : (
							<div className="overflow-y-auto max-h-32 overflow-x-auto whitespace-nowrap rounded-lg md:flex md:justify-center">
								<table className="w-full text-left">
									<thead className="uppercase text-xs bg-accent2 sticky top-0">
										<tr className="">
											<th className="pl-2 pr-2 py-1">
												Date
											</th>
											<th className="pl-2 pr-2 py-1">
												Amount
											</th>
											<th className="pl-2 pr-2 py-1">
												Price
											</th>
											<th className="pl-2 pr-2 py-1">
											</th>
										</tr>
									</thead>
									<tbody>
										{[...(historyBuy ?? [])]
											.sort(
												(a, b) =>
													new Date(b[1]).getTime() -
													new Date(a[1]).getTime()
											)
											.map(
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
														<td className="pl-2 pr-2" style={{ height: '26', verticalAlign: 'middle'}}>
															<button className="bg-red-500 text-white rounded hover:bg-red-600 transition flex items-center justify-center">
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	fill="none"
																	viewBox="0 0 24 24"
																	strokeWidth={
																		1.5
																	}
																	stroke="currentColor"
																	className="size-4">
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		d="M6 18 18 6M6 6l12 12"
																	/>
																</svg>
															</button>
														</td>
													</tr>
												)
											)}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default History;
