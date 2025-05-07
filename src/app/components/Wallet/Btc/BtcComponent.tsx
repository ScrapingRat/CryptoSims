import { BtcProvider, useBtc } from 'app/contexts/BtcContext';
import BinanceTicker from './binance';
import BtcBtns from './BtcBtns';
import BtcOrderTypeBtns from './BtcOrderTypeBtns';
import BtcAmount from './BtcAmount';
import BtcSubmitMessage from './BtcSubmitMessage';

const BtcComponentElement = () => {
	const { op } = useBtc();

	return (
		<div className="flex-1 p-6 border border-accent2 rounded-lg bg-background/50">
			<BinanceTicker />
			{op === '' ? (
				<BtcBtns />
			) : (
				<div>
					<BtcOrderTypeBtns />
					<BtcAmount />
				</div>
			)}
			<BtcSubmitMessage />
		</div>
	);
};

const BtcComponent = () => (
	<BtcProvider>
		<BtcComponentElement />
	</BtcProvider>
);

export default BtcComponent;
