'use server';

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Wallet from '@models/wallet';
import getConfig from '../getConfig';
import connectToDatabase from 'lib/actions/connectToDatabase';

const { SECRET_KEY } = getConfig();

type WalletResponse = {
	wallet?: { balance: number };
	error?: string;
};

const getWallet = async (): Promise<WalletResponse> => {
	await connectToDatabase();

	try {
		const cookieStore = cookies();
		const token = (await cookieStore).get('token')?.value;

		if (!token) {
			return { error: 'No token found in cookies' };
		}

		const decoded = jwt.verify(token, SECRET_KEY) as { walletId: string };

		if (!decoded.walletId) {
			return { error: 'Invalid token' };
		}

		const wallet = await Wallet.findById(decoded.walletId);

		if (!wallet) {
			return { error: 'Wallet not found' };
		}

		const sanitizedWallet = {
			balance: wallet.balance,
		};

		return { wallet: sanitizedWallet };
	} catch (error) {
		console.error('Failed to retrieve wallet:', error);
		return { error: 'Failed to retrieve wallet' };
	}
};

export default getWallet;
