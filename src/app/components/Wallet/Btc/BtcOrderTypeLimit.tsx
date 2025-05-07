import { useBtc } from 'app/contexts/BtcContext';
import BtcLimitBtn from './BtcLimitBtn';
import BtcLimitInput from './BtcLimitInput';

const BtcOrderTypeLimit = () => {
	const { order, isEditingTarget } = useBtc();
	return (
		<>
			{order === 'limit' && (
				<div className="mt-3">
					{!isEditingTarget ? <BtcLimitBtn /> : <BtcLimitInput />}
				</div>
			)}
		</>
	);
};

export default BtcOrderTypeLimit;
