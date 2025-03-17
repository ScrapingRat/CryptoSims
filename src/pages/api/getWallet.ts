import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';
import Wallet from '@models/wallet';
import connectToDatabase from '@actions/connectToDatabase';
import getConfig from 'lib/getConfig';
import { getMethodSchema } from '@schemas/methodSchema';
import tokenSchema from '@schemas/tokenSchema';

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
		const methodValidation = getMethodSchema.safeParse({
			method: req.method
		});

		if (!methodValidation.success) {
			return res.status(405).json({
				error: 'Method not allowed',
				message: 'This endpoint only accepts GET requests'
			});
		}

		const tokenValidation = tokenSchema.safeParse({
			token: req.cookies.token
		});

		if (!tokenValidation.success) {
			return res.status(401).json({
				error: 'Authentication failed',
				message: tokenValidation.error.errors[0].message
			});
		}

		const decoded = jwt.verify(tokenValidation.data.token, SECRET_KEY) as {
			walletId: string;
		};
		if (!decoded.walletId) {
			return res.status(401).json({
				error: 'Authentication failed',
				message: 'Invalid token'
			});
		}

		const wallet = await Wallet.findById(decoded.walletId);
		if (!wallet) {
			return res.status(401).json({ error: 'Authentication failed' });
		}

		res.status(200).json({ balance: wallet.balance });
	} catch (error) {
		res.status(401).json({ error: 'Authentication failed' });
		if (error instanceof ZodError) {
			console.error('Validation error:', error.issues);
		} else {
			console.error('Authentication error:', error);
		}
	}
}
