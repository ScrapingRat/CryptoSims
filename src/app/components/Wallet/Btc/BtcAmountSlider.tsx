import { useBtc } from 'app/contexts/BtcContext';
import { useWallet } from 'app/contexts/WalletContext';

const BtcAmountSlider = () => {
	const { amount, setAmount } = useBtc();
	const { balanceFiat } = useWallet();

	return (
		<div className="flex items-center gap-4 mt-3">
			<button
				onClick={() =>
					setAmount((prev) => Math.max(0, (prev || 0) - 100))
				}
				type="button"
				className="md:mt-1 md:mb-1 py-1 px-2 w-8 md:py-2 md:px-4 md:w-12 bg-accent2 text-white rounded-lg hover:bg-red-700 transition-colors">
				-
			</button>

			<input
				id="buySlider"
				aria-label="buySlider"
				type="range"
				min={0}
				max={balanceFiat || 0}
				step={100}
				value={amount}
				aria-valuenow={typeof amount === 'number' ? amount : 0}
				onChange={(e) => setAmount(Number(e.target.value))}
				className="w-full range"
			/>

			<button
				onClick={() =>
					setAmount((prev) =>
						Math.min(balanceFiat || 0, (prev || 0) + 100)
					)
				}
				type="button"
				className="md:mt-1 md:mb-1 py-1 px-2 w-8 md:py-2 md:px-4 md:w-12 bg-accent2 text-white rounded-lg hover:bg-green-600/75 transition-colors">
				+
			</button>
		</div>
	);
};

export default BtcAmountSlider;
