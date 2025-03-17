import { NextApiRequest, NextApiResponse } from 'next';
import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';
import getConfig from 'lib/getConfig';
import connectToDatabase from '@actions/connectToDatabase';
import Wallet from '@models/wallet';
import { postMethodSchema } from '@schemas/methodSchema';
import seedBodySchema from '@schemas/seedBodySchema';

const { SECRET_KEY } = getConfig();
const ROUTE_ENABLED = true;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (!ROUTE_ENABLED) {
		return res
			.status(503)
			.json({ error: 'This endpoint is temporarily disabled' });
	}

	await connectToDatabase();

	try {
		const methodValidation = postMethodSchema.safeParse({
			method: req.method
		});

		if (!methodValidation.success) {
			return res.status(405).json({
				error: 'Method not allowed',
				message: 'This endpoint only accepts POST requests'
			});
		}

		const bodyValidation = seedBodySchema.safeParse(req.body);

		if (!bodyValidation.success) {
			return res.status(400).json({
				error: 'Invalid request',
				message: bodyValidation.error.issues[0].message
			});
		}

		const { seedPhrase } = bodyValidation.data;

		const wallet = await Wallet.findBySeedPhrase(seedPhrase);

		if (!wallet) {
			return res.status(401).json({ error: 'Authentication failed' });
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
		if (error instanceof ZodError) {
			console.error('Validation error:', error.issues);
		} else {
			console.error('Authentication error:', error);
		}
	}
}
