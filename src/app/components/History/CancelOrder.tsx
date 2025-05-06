import apiClient from 'lib/apiClient';

const cancel = async (orderId: string) => {
	interface Response {
		message: string;
	}

	const { data } = await apiClient<Response>(
		`api/btc/cancel?order=${orderId}`,
		'POST',
		{
			auth: true
		}
	);
};

const CancelOrder = ({ orderId }: { orderId: string }) => {
	return (
		<>
			<button
				className="bg-red-500/75 text-white rounded hover:bg-red-600/75 transition flex items-center justify-center"
				onClick={() => cancel(orderId)}
				title="Cancel order"
			>
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
