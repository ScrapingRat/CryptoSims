import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import Wallet from '@models/wallet';
import connectToDatabase from 'lib/actions/connectToDatabase';
import { z } from 'zod';

const SECRET_KEY = process.env.SECRET_KEY || 'secret';
const ROUTE_ENABLED = false;

const unlockSchema = z.object({
	seedPhrase: z
		.string()
		.min(1, 'Seed phrase is required')
		.refine((val) => val.split(' ').length === 12, {
			message: 'Seed phrase must be exactly 12 words',
		}),
});

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
		const { seedPhrase } = unlockSchema.parse(req.body);

		const wallet = await Wallet.findBySeedPhrase(seedPhrase);
		if (!wallet) {
			return res.status(200).json({ error: 'Wallet not found' });
		}

		const token = jwt.sign(
			{
				walletId: wallet._id,
				iat: Math.floor(Date.now() / 1000),
				jti: crypto.randomUUID(),
			},
			SECRET_KEY,
			{
				expiresIn: '1h',
				algorithm: 'HS256',
			}
		);
		res.setHeader(
			'Set-Cookie',
			`token=${token}; HttpOnly; Secure; Path=/; Max-Age=3600; SameSite=Strict; Domain=${process.env.DOMAIN}`
		);
		res.status(200).json({ message: 'Token stored in HTTP-only cookie' });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({ error: error.issues[0].message });
		}
		console.error(error);
		res.status(500).json({ error: 'Failed to unlock wallet' });
	}
}
