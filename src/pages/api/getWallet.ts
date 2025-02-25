// file: src/pages/api/getWallet.ts
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import Wallet from '@models/wallet';
import { connectToDatabase } from 'lib/actions/connect';

const SECRET_KEY = process.env.SECRET_KEY || 'secret';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await connectToDatabase();

	try {
		const token = req.cookies.token;
		if (!token) {
			return res.status(401).json({ error: 'No token found in cookies' });
		}

		const decoded = jwt.verify(token, SECRET_KEY) as { walletId: string };
		if (!decoded.walletId) {
			return res.status(401).json({ error: 'Invalid token' });
		}

		const wallet = await Wallet.findById(decoded.walletId);
		if (!wallet) {
			return res.status(404).json({ error: 'Wallet not found' });
		}

		res.status(200).json({ wallet });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to retrieve wallet' });
	}
}
