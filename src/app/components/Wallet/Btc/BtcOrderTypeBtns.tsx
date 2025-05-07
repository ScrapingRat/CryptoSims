import { useBtc } from 'app/contexts/BtcContext';
import BtcOrderTypeMarket from './BtcOrderTypeMarket';
import BtcOrderTypeLimit from './BtcOrderTypeLimit';

const BtcOrderTypeBtns = () => {
	const {
		order,
		setOrder,
		setTarget,
		setIsEditingTarget,
		setTargetToCurrentPrice
	} = useBtc();

	return (
		<>
			<div className="flex w-full gap-3 mt-0 md:mt-9">
				<button
					onClick={() => {
						setOrder('market');
						setIsEditingTarget(false);
					}}
					type="button"
					className={`font-medium flex-1 py-3 px-4 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
						order === 'market'
							? 'bg-accent4'
							: 'bg-accent2 hover:bg-accent3'
					}`}>
					Market
				</button>
				<button
					onClick={() => {
						setOrder('limit');
						setTarget(0);
						setTargetToCurrentPrice();
					}}
					type="button"
					className={`font-medium flex-1 py-3 px-4 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
						order === 'limit'
							? 'bg-accent4'
							: 'bg-accent2 hover:bg-accent3'
					}`}>
					Limit
				</button>
			</div>
			<BtcOrderTypeMarket />
			<BtcOrderTypeLimit />
		</>
	);
};

export default BtcOrderTypeBtns;
