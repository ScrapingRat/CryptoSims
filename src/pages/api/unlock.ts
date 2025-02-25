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
		const seedPhrase =
			'bring maze fall random wise eager episode mutual enact shine tomato range';
		const wallet = await Wallet.findBySeedPhrase(seedPhrase);
		if (!wallet) {
			return res.status(200).json({ error: 'Wallet not found' });
		}

		const token = jwt.sign(
			{
				walletId: wallet._id,
				iat: Math.floor(Date.now() / 1000),
				jti: crypto.randomUUID()
			},
			SECRET_KEY,
			{
				expiresIn: '1h',
				algorithm: 'HS256'
			}
		);
		res.setHeader(
			'Set-Cookie',
			`token=${token}; HttpOnly; Secure; Path=/; Max-Age=3600; SameSite=Strict; Domain=${process.env.DOMAIN}`
		);
		res.status(200).json({ message: 'Token stored in HTTP-only cookie' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to unlock wallet' });
	}
}
