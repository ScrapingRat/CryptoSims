import apiClient from 'lib/apiClient';

const HandleDeposit = async (
	setError: (error: string) => void,
	setMessage: (message: string) => void,
	fetchWallet: () => Promise<void>,
	balance: number | null,
	setIsDepositing: (isDepositing: boolean) => void,
	amount: number | string
) => {
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
		setMessage(
			data?.message ||
				`Successfully increased USD by ${amount}. New balance is ${
					(balance || 0) +
					(typeof amount === 'string'
						? parseFloat(amount)
						: amount || 0)
				}.`
		);
	}
	setIsDepositing(false);
	await fetchWallet();
};

export default HandleDeposit;
