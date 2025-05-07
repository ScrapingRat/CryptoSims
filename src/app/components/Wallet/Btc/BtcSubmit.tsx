import { useBtc } from 'app/contexts/BtcContext';
import apiClient from 'lib/apiClient';
import { useWallet } from 'app/contexts/WalletContext';

const BtcSubmit = () => {
	const {
		amount,
		setAmount,
		setIsEditing,
		op,
		setOp,
		setError,
		setMessage,
		order,
		target,
	} = useBtc();
	const { fetchWallet } = useWallet();

	const handleOp = async () => {
		interface Response {
			message: string;
		}

		setError('');
		setMessage('');

		let limit = '';

		if (order === 'limit') {
			limit = `&limit=${target}`;
		}

		const { data, error, errorMessage } = await apiClient<Response>(
			`api/btc/${op}?amount=${amount}${limit}`,
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

		setOp('');
		await fetchWallet();
	};

	return (
		<div className="flex justify-center gap-3 mt-3">
			<button
				onClick={() => {
					setIsEditing(false);
					handleOp();
					setAmount(0);
				}}
				type="button"
				className="w-full font-medium py-3 px-4 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">
				Confirm
			</button>
			<button
				onClick={() => {
					setOp('');
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

export default BtcSubmit;
