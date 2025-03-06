import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import Wallet from '@models/wallet';
import connectToDatabase from 'lib/actions/connectToDatabase';
import getConfig from 'lib/getConfig';
import { z } from 'zod';
import { wordlists } from 'bip39';
import sanitize from 'sanitize-html';

const { SECRET_KEY } = getConfig();
const ROUTE_ENABLED = true;

const unlockSchema = z.object({
	seedPhrase: z
		.string()
		.min(1, 'Seed phrase is required')
		.refine((val) => val.split(' ').length === 12, {
			message: 'Seed phrase must be exactly 12 words'
		})
		.refine(
			(val) =>
				val
					.split(' ')
					.every((word) => wordlists.english.includes(word)),
			{
				message: 'Seed phrase contains invalid words'
			}
		)
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
		const sanitizedBody = {
			seedPhrase: sanitize(req.body.seedPhrase)
		};
		const { seedPhrase } = unlockSchema.parse(sanitizedBody);

		const wallet = await Wallet.findBySeedPhrase(seedPhrase);
		if (!wallet) {
			return res.status(401).json({ error: 'Authentiucation failed' });
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
		res.status(200).json({ message: 'Authentication successful' });
	} catch (error) {
		res.status(401).json({ error: 'Authentication failed' });
		if (error instanceof z.ZodError) {
			console.error('Validation error:', error.issues);
		} else {
			console.error('Authentication error:', error);
		}
	}
}
