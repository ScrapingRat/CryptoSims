import { useDeposit } from 'app/contexts/DepositContext';
import { useWallet } from 'app/contexts/WalletContext';
import apiClient from 'lib/apiClient';

const DepositSubmit = () => {
	const {
		amount,
		setAmount,
		setIsEditing,
		setIsDepositing,
		setError,
		setMessage
	} = useDeposit();
	const { fetchWallet } = useWallet();

	const handleDeposit = async () => {
		console.log(`Depositing ${amount} USD`);

		interface Response {
			message: string;
		}

		setError('');
		setMessage('');

		const { data, error, errorMessage } = await apiClient<Response>(
			`api/usd/inc?amount=${amount}`,
			'POST',
			{
				auth: true
			}
		);

		if (error) {
			setError(`${error}: ${errorMessage}`);
		} else {
			setMessage(data?.message || '');
		}
		setIsDepositing(false);
		await fetchWallet();
	};

	return (
		<div className="flex justify-center gap-3 mt-3">
			<button
				onClick={() => {
					setIsEditing(false);
					handleDeposit();
					setAmount(0);
				}}
				type="button"
				className="w-full font-medium py-3 px-4 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">
				Confirm
			</button>
			<button
				onClick={() => {
					setIsDepositing(false);
					setIsEditing(false);
					setAmount(0);
				}}
				type="button"
				className="w-full font-medium py-3 px-4 bg-red-500/75 text-white rounded-lg hover:bg-red-600/75 transition-colors">
				Cancel
			</button>
		</div>
	);
};

export default DepositSubmit;
