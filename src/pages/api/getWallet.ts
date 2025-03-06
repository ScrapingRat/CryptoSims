// file: src/pages/api/getWallet.ts
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import Wallet from '@models/wallet';
import connectToDatabase from 'lib/actions/connectToDatabase';
import getConfig from 'lib/getConfig';

const { SECRET_KEY } = getConfig();
const ROUTE_ENABLED = true;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (!ROUTE_ENABLED) {
		return res
			.status(503)
			.json({ error: 'This API endpoint is temporarily disabled' });
	}

	await connectToDatabase();

	try {
		const token = req.cookies.token;
		if (!token) {
			return res.status(401).json({ error: 'Authentication failed' });
		}

		const decoded = jwt.verify(token, SECRET_KEY) as { walletId: string };
		if (!decoded.walletId) {
			return res.status(401).json({ error: 'Authentication failed' });
		}

		const wallet = await Wallet.findById(decoded.walletId);
		if (!wallet) {
			return res.status(401).json({ error: 'Authentication failed' });
		}

		res.status(200).json({ balance: wallet.balance });
	} catch (error) {
		console.error(error);
		res.status(401).json({ error: 'Authentication failed' });
	}
}
