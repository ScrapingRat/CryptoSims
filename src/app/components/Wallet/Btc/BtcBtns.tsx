import { useBtc } from "app/contexts/BtcContext";

const BtcBtns = () => {
	const { setOp } = useBtc();

	return (
		<div className="text-center flex flex-row gap-3 mt-0 md:mt-9 lg:mt-0">
			<button
				onClick={() => {
					setOp('buy');
				}}
				type="button"
				className="font-medium flex-1 py-3 px-4 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
				Buy BTC
			</button>
			<button
				onClick={() => {
					setOp('sell');
				}}
				type="button"
				className="font-medium flex-1 py-3 px-4 bg-red-500/75 text-white rounded-lg hover:bg-red-600/75 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
				Sell BTC
			</button>
		</div>
	);
};

export default BtcBtns;
