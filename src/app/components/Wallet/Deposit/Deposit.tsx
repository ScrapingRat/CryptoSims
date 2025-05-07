import { DepositProvider, useDeposit } from 'app/contexts/DepositContext';
import DepositBtn from './DepositBtn';
import DepositAmount from './DepositAmount';
import DepositSubmitMessage from './DepositSubmitMessage';

const DepositContent = () => {
	const { isDepositing } = useDeposit();

	return (
		<>
			{isDepositing === false ? <DepositBtn /> : <DepositAmount />}
			<DepositSubmitMessage />
		</>
	);
};

const Deposit = () => (
	<DepositProvider>
		<DepositContent />
	</DepositProvider>
);

export default Deposit;
