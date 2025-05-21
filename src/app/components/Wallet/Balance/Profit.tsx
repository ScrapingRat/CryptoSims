import { useWallet } from 'app/contexts/WalletContext';

const Profit = () => {
	const { balanceBtc, netProfit, percentProfit, btcToFiat } = useWallet();
	return (
		<div
			className={`text-l font-bold text-center lg-text-base lg-whitespace-nowrap`}>
			<p>
				{Number(balanceBtc).toLocaleString()} BTC
				<span className="text-xs"> ≃ {btcToFiat} USD</span>
			</p>
			<p
				className={`text-xs text-center ${
					netProfit > 0
						? 'text-green-500'
						: netProfit < 0
						? 'text-red-500'
						: 'text-white'
				}`}>
				{netProfit >= 0 && '+'}
				{Number(netProfit).toLocaleString()} USD / {netProfit >= 0 && '+'}
				{percentProfit}%
			</p>
		</div>
	);
};

export default Profit;
