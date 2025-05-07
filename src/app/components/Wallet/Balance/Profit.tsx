import { useWallet } from 'app/contexts/WalletContext';

const Profit = () => {
	const { balanceBtc, netProfit, percentProfit, btcToFiat } = useWallet();
	return (
		<div
			className={`text-l font-bold text-center ${
				netProfit > 0
					? 'text-green-500'
					: netProfit < 0
					? 'text-red-500'
					: 'text-white'
			} lg-text-base lg-whitespace-nowrap`}>
			<p>{balanceBtc} BTC</p>
			<p className="text-xs text-center">
				≃ {btcToFiat} USD ({netProfit >= 0 && '+'}
				{netProfit} USD / {netProfit >= 0 && '+'}
				{percentProfit}%)
			</p>
		</div>
	);
};

export default Profit;
