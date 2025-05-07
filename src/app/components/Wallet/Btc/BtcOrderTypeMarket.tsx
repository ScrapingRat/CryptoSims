import { useBtc } from 'app/contexts/BtcContext';

const BtcOrderTypeMarket = () => {
	const { order } = useBtc();
	return (
		<>
			{order === 'market' && (
				<button
					type="button"
					disabled
					className="py-3 px-4 mt-3 w-full bg-accent1 text-gray-400 block text-center mb-2 cursor-pointer transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
					Price: market
				</button>
			)}
		</>
	);
};

export default BtcOrderTypeMarket;
