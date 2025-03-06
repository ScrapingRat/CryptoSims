import { cookies } from 'next/headers';

const lockWallet = async (): Promise<boolean> => {
	try {
		const cookieStore = cookies();
		const token = (await cookieStore).get('token')?.value;

		if (!token) {
			return false;
		}

		(await cookieStore).delete('token');
		return true;
	} catch (error) {
		console.error('Failed to retrieve wallet:', error);
		return false;
	}
};

export default lockWallet;

