import { useWallet } from '../../contexts/WalletContext';
import apiClient from 'lib/apiClient';

const cancel = async (orderId: string) => {
	interface Response {
		message: string;
		error?: string;
	}

	return apiClient<Response>(`api/btc/cancel?order=${orderId}`, 'POST', {
		auth: true
	});
};

const CancelOrder = ({
	orderId,
	setMessage,
	setError
}: {
	orderId: string;
	setMessage?: (msg: string) => void;
	setError?: (msg: string) => void;
}) => {
	const { fetchWallet } = useWallet();

	const handleCancel = async () => {
		try {
			const { data } = await cancel(orderId);
			if (data?.message) {
				if (setMessage) {
					setMessage(data.message);
				}
				if (setError) {
					setError('');
				}
			} else if (data?.error) {
				if (setError) {
					setError(data.error);
				}
				if (setMessage) {
					setMessage('');
				}
			}
			fetchWallet();
		} catch (err) {
			console.log(err);
			if (setError) {
				setError('Failed to cancel order.');
			}
			if (setMessage) {
				setMessage('');
			}
		}
	};

	return (
		<>
			<button
				className="bg-red-500/75 text-white rounded hover:bg-red-600/75 transition flex items-center justify-center"
				onClick={handleCancel}
				title="Cancel order">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
					className="size-4"
					role="img"
					aria-label="Cancel order">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M6 18 18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</>
	);
};

export default CancelOrder;
