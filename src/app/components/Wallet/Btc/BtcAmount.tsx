import { useBtc } from 'app/contexts/BtcContext';
import BtcAmountBtn from './BtcAmountBtn';
import BtcAmountInput from './BtcAmountInput';
import BtcAmountSlider from './BtcAmountSlider';
import BtcSubmit from './BtcSubmit';

const BtcAmount = () => {
	const { isEditing } = useBtc();
	return (
		<div className="mt-3">
			{isEditing ? <BtcAmountInput /> : <BtcAmountBtn />}
			<BtcAmountSlider />
			<BtcSubmit />
		</div>
	);
};

export default BtcAmount;
