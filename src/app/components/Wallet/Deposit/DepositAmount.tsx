import DepositAmountInput from './DepositAmountInput';
import DepositAmountBtn from './DepositAmountBtn';
import DepositAmountSlider from './DepositAmountSlider';
import DepositSubmit from './DepositSubmit';
import { useDeposit } from 'app/contexts/DepositContext';

const DepositAmount = () => {
	const { isEditing } = useDeposit();
	return (
		<div className="mt-3">
			{isEditing ? <DepositAmountInput /> : <DepositAmountBtn />}
			<DepositAmountSlider />
			<DepositSubmit />
		</div>
	);
};

export default DepositAmount;
