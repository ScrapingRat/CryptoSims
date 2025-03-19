import { NextApiRequest, NextApiResponse } from 'next';
import { ZodError } from 'zod';
import connectToDatabase from '@actions/connectToDatabase';
import Wallet from '@models/wallet';
import { authorizeToken } from 'lib/authorizeToken';
import { getMethodSchema } from '@schemas/methodSchema';

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

		await connectToDatabase();

		const auth = await authorizeToken(req);

		// const baseUrl = 'http://localhost:3000';
		// const response = await fetch(`${baseUrl}/api/authorize`, {
		// 	method: 'GET',
		// 	headers: {
		// 		'Content-Type': 'application/json',
		// 		'Cookie': req.headers.cookie || ''
		// 	},
		// 	credentials: 'same-origin'
		// });
		// const auth = await response.json();

		if (!auth.isAuthorized) {
			return res.status(401).json({ error: auth.error });
		}

		const walletId = auth.walletId;
		const wallet = await Wallet.findById(walletId);

		if (!wallet) {
			return res.status(401).json({ error: 'Wallet not found' });
		}

		return res.status(200).json({ balance: wallet.balance });
	} catch (error) {
		res.status(401).json({ error: 'Authentication failed' });
		if (error instanceof ZodError) {
			console.error('Validation error:', error.issues);
		} else {
			console.error('Authentication error:', error);
		}
	}
}
