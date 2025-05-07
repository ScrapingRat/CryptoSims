import { useDeposit } from 'app/contexts/DepositContext';

const DepositSubmitMessage = () => {
	const { error, message } = useDeposit();
	return (
		<>
			{error && (
				<p className="text-center mt-2 text-sm text-red-500">{error}</p>
			)}
			{message && (
				<p className="text-center mt-2 text-sm text-green-500">
					{message}
				</p>
			)}
		</>
	);
};

export default DepositSubmitMessage;
